import { createCipheriv, createHash } from 'node:crypto';
import { MusicStatistics, observeMusic, statisticsRoute, musicUpstream } from './music-statistics.js';
export { MusicStatistics };

const NETEASE = 'https://music.163.com';
const SESSION_TTL = 60 * 60 * 24 * 30;
const QR_TTL = 60 * 5;

function json(value, status = 200, origin = '') {
  const headers = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
  headers['access-control-allow-origin'] = '*';
  headers['access-control-allow-methods'] = 'GET,POST,DELETE,OPTIONS';
  headers['access-control-allow-headers'] = 'authorization,content-type,x-iris-music-device';
  return new Response(JSON.stringify(value), { status, headers });
}

const GUEST_MUSIC_SERVICES = Object.freeze([
  'https://api.qijieya.cn/meting/', 'https://api.i-meto.com/meting/api',
  'https://api.injahow.cn/meting/', 'https://api.amarea.cn/meting/', 'https://api.moeyao.cn/meting/',
]);
function guestAddress(base, type, id) { const url = new URL(base); url.search = new URLSearchParams({ server: 'netease', type, id: String(id) }); return url.href; }
function guestImageAddress(raw) {
  try { const url = new URL(raw); return !url.username && !url.password && !url.port && GUEST_MUSIC_SERVICES.some(base => { const service = new URL(base); return url.origin === service.origin && url.pathname === service.pathname; }) && url.searchParams.get('server') === 'netease' && url.searchParams.get('type') === 'pic' && /^\d{1,25}$/.test(url.searchParams.get('id') || '') ? url : null; } catch { return null; }
}
function guestSongRecord(row, base) {
  if (!row || typeof row !== 'object') return null;
  let id = String(row.id || '');
  try { const source = new URL(row.url); if (!id && (!source.searchParams.get('server') || source.searchParams.get('server') === 'netease')) id = source.searchParams.get('id') || ''; } catch {}
  if (!/^\d{1,18}$/.test(id) || !String(row.name || row.title || '').trim()) return null;
  let cover = String(row.pic || row.cover || ''); try { if (!/^https?:$/.test(new URL(cover).protocol)) cover = ''; } catch { cover = ''; }
  return { id, name: String(row.name || row.title).slice(0, 300), artist: (Array.isArray(row.artist || row.author) ? row.artist || row.author : [row.artist || row.author || '']).map(item => typeof item === 'string' ? item : item?.name || '').join(' / ').slice(0, 300), album: String(row.album || '').slice(0, 300), duration: Math.max(0, Number(row.duration) || 0), cover, musicAccessMode: 'guest', provider: base };
}
async function guestMusicRead(type, id) {
  let receivedEmpty = false;
  for (const base of GUEST_MUSIC_SERVICES) {
    try {
      const songs = await musicUpstream('/meting/' + type, async () => {
        const response = await fetch(guestAddress(base, type, id), { headers: { accept: 'application/json' }, redirect: 'manual', signal: AbortSignal.timeout(4000) });
        if (!response.ok) throw new Error('游客音乐服务暂时不可用');
        const body = await response.json(); if (!Array.isArray(body)) throw new Error('游客音乐服务返回格式不支持');
        return { data: { code: 200 }, songs: body.map(row => guestSongRecord(row, base)).filter(Boolean) };
      });
      if (songs.songs.length) return songs.songs;
      receivedEmpty = true;
    } catch { /* An unavailable public service must not hide the next independent service. */ }
  }
  if (receivedEmpty) return [];
  throw musicError('游客音乐服务暂时无法连接，请稍后重试或登录网易云。', null, 502);
}
async function guestMusicSong(id, metadataOnly, origin) {
  const records = await guestMusicRead('song', id), song = records.find(item => item.id === id);
  if (!song) throw musicError('没有找到这首歌', null, 404);
  const bases = [song.provider, ...GUEST_MUSIC_SERVICES.filter(base => base !== song.provider)];
  const result = { ...song, lyrics: '', lyricSource: '' }; delete result.provider;
  if (metadataOnly) return result;
  try {
    const lyric = await musicUpstream('/meting/lyric', async () => {
      const response = await fetch(guestAddress(song.provider, 'lrc', id), { headers: { accept: 'text/plain' }, redirect: 'manual', signal: AbortSignal.timeout(3000) });
      if (!response.ok) throw new Error('歌词暂时不可用'); const text = (await response.text()).slice(0, 120000);
      return { data: { code: 200 }, text: /^\s*[{<]/.test(text) ? '' : text };
    });
    result.lyrics = lyric.text; result.lyricSource = lyric.text ? '公开音乐服务' : '';
  } catch {}
  result.playbackSources = bases.map(base => new URL('/guest/playback?' + new URLSearchParams({ id, provider: String(GUEST_MUSIC_SERVICES.indexOf(base)) }), origin).href);
  return { ...result, playUrl: result.playbackSources[0], playUrlExpiresAt: Date.now() + 600000, playbackStatus: 'available', playbackMessage: '' };
}

function guestAudioLocation(raw) {
  try { const url = new URL(raw); if (!['http:','https:'].includes(url.protocol) || url.username || url.password || url.port || !/(^|\.)music\.(126\.net|163\.com)$/i.test(url.hostname)) return null; url.protocol='https:'; return url.href; } catch { return null; }
}
async function guestPlayback(request,url) {
  const id=numeric(url.searchParams.get('id'),'歌曲 ID'), index=Number(url.searchParams.get('provider'));
  if (!url.searchParams.has('provider')||!Number.isInteger(index)||index<0||index>=GUEST_MUSIC_SERVICES.length) return json({error:'无效的游客音源'},400);
  return (await musicUpstream('/meting/url',async()=>{
    const range=request.headers.get('range'),headers={accept:'audio/*,application/json'};if(range&&/^bytes=\d+-\d*$/.test(range))headers.range=range;
    const response=await fetch(guestAddress(GUEST_MUSIC_SERVICES[index],'url',id),{headers,redirect:'manual',signal:AbortSignal.timeout(7000)});
    if([301,302,303,307,308].includes(response.status)){const location=guestAudioLocation(response.headers.get('location'));if(!location)throw musicError('游客音源返回了不支持的播放地址',null,502);return{data:{code:200},response:new Response(null,{status:302,headers:{location,'cache-control':'no-store','access-control-allow-origin':'*'}})}}
    if(!response.ok)throw musicError('这个游客音源暂时不可用',null,502);
    const type=(response.headers.get('content-type')||'').split(';')[0].trim().toLowerCase();
    if(type.startsWith('audio/')||type==='application/octet-stream'){const out=new Headers({'content-type':type,'cache-control':'no-store','access-control-allow-origin':'*','x-content-type-options':'nosniff'});for(const key of ['content-length','content-range','accept-ranges'])if(response.headers.has(key))out.set(key,response.headers.get(key));return{data:{code:200},response:new Response(response.body,{status:response.status,headers:out})}}
    let body;try{body=await response.json()}catch{throw musicError('这个游客音源未返回音频',null,502)}const location=guestAudioLocation(body?.url||body?.data?.url);if(!location)throw musicError('这个游客音源暂未提供播放地址',null,502);return{data:{code:200},response:new Response(null,{status:302,headers:{location,'cache-control':'no-store','access-control-allow-origin':'*'}})};
  })).response;
}
async function musicCover(requestUrl) {
  function source(raw) {
    let url; try { url = new URL(raw); } catch { return null; }
    const meting = guestImageAddress(raw); if (meting) { meting.search = new URLSearchParams({ server: 'netease', type: 'pic', id: meting.searchParams.get('id') }); return meting; }
    if (!['http:', 'https:'].includes(url.protocol) || !/^p[1-9]\.music\.126\.net$/i.test(url.hostname) || url.username || url.password || url.port || !/^\/[a-z0-9_=-]{8,100}\/\d{5,25}\.(jpg|jpeg|png|webp)$/i.test(url.pathname)) return null;
    url.protocol = 'https:'; url.search = '?param=300y300'; url.hash = ''; return url;
  }
  let url = source(requestUrl.searchParams.get('url') || '');
  if (!url) return json({ error: '仅支持已配置音乐服务的歌曲封面' }, 400);
  for (let redirects = 0; redirects < 4; redirects++) {
    const result = await musicUpstream('/cover', async () => {
      const response = await fetch(url.href, { redirect: 'manual', headers: { referer: NETEASE + '/', 'user-agent': 'Mozilla/5.0', accept: 'image/jpeg,image/png,image/webp' }, signal: AbortSignal.timeout(9000), cf: { cacheTtl: 86400, cacheEverything: true } });
      return { data: { code: response.status >= 200 && response.status < 400 ? 200 : 502 }, response };
    });
    const response = result.response;
    if ([301,302,303,307,308].includes(response.status)) { const next = source(new URL(response.headers.get('location') || '', url).href); if (!next) throw musicError('封面跳转地址不支持', null, 502); url = next; continue; }
    const type = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase().replace(/^image\/(jpg|pjpeg)$/, 'image/jpeg');
    if (!response.ok || !['image/jpeg','image/png','image/webp'].includes(type)) throw musicError('封面暂时无法读取', null, 502);
    const reader = response.body.getReader(), chunks = []; let length = 0;
    while (true) { const { done, value } = await reader.read(); if (done) break; length += value.byteLength; if (length > 2*1024*1024) { await reader.cancel(); throw musicError('封面图片过大', null, 502); } chunks.push(value); }
    const bytes = new Uint8Array(length); let offset = 0; for (const chunk of chunks) { bytes.set(chunk,offset); offset += chunk.length; }
    return new Response(bytes,{headers:{'content-type':type,'cache-control':'public, max-age=86400','access-control-allow-origin':'*','x-content-type-options':'nosniff'}});
  }
  throw musicError('封面跳转次数过多',null,502);
}

function cookieHeader(response) {
  const values = response.headers.getSetCookie?.() || [];
  return values.map(value => value.split(';', 1)[0]).filter(Boolean).join('; ');
}

async function upstream(path, options = {}) { return musicUpstream(path, () => upstreamRaw(path, options)); }
async function upstreamRaw(path, { cookie = '', method = 'GET', body, referer = NETEASE + '/' } = {}) {
  const response = await fetch(NETEASE + path, {
    method,
    headers: {
      accept: 'application/json, text/plain, */*',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
      referer,
      ...(cookie ? { cookie } : {}),
      ...(body ? { 'content-type': 'application/x-www-form-urlencoded' } : {}),
    },
    ...(body ? { body } : {}),
    signal: AbortSignal.timeout(9000),
  });
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('网易云返回了无法识别的数据'); }
  if (!response.ok) throw new Error('网易云请求失败（' + response.status + '）');
  return { data, cookie: cookieHeader(response) };
}

// QR login uses the client protocol and one device/cookie context for its full lifetime.
const QR_PROTOCOL = 'eapi-pc-v1';
function mergeCookies(...sources) {
  const values = new Map();
  for (const source of sources) for (const piece of String(source || '').split(/;\s*/)) {
    const index = piece.indexOf('=');
    if (index > 0) values.set(piece.slice(0, index).trim(), piece.slice(index + 1));
  }
  return [...values].map(([name, value]) => name + '=' + value).join('; ');
}
function qrClient() {
  const deviceId = crypto.randomUUID();
  return { deviceId, cookie: 'deviceId=' + deviceId + '; os=pc; appver=3.1.17.204416; channel=netease; __remember_me=true; _ntes_nuid=' + randomToken(24) };
}
async function qrUpstream(path, payload, client) { return musicUpstream(path, () => qrUpstreamRaw(path, payload, client)); }
async function qrUpstreamRaw(path, payload, client) {
  const cookies = Object.fromEntries(client.cookie.split(/;\s*/).map(piece => { const i = piece.indexOf('='); return [piece.slice(0, i), piece.slice(i + 1)]; }));
  const header = {
    osver: 'Microsoft-Windows-10-Professional-build-19045-64bit', deviceId: client.deviceId,
    os: 'pc', appver: '3.1.17.204416', versioncode: '140', mobilename: '',
    buildver: String(Math.floor(Date.now() / 1000)), resolution: '1920x1080',
    __csrf: cookies.__csrf || '', channel: 'netease', requestId: Date.now() + '_' + String(crypto.getRandomValues(new Uint16Array(1))[0] % 1000).padStart(4, '0'),
  };
  for (const name of ['NMTID', 'MUSIC_U', 'MUSIC_A']) if (cookies[name]) header[name] = cookies[name];
  const text = JSON.stringify({ ...payload, e_r: false, header });
  const digest = createHash('md5').update('nobody' + path + 'use' + text + 'md5forencrypt').digest('hex');
  const cipher = createCipheriv('aes-128-ecb', new TextEncoder().encode('e82ckenh8dichen8'), new Uint8Array(0));
  const params = cipher.update(path + '-36cd479b6b5-' + text + '-36cd479b6b5-' + digest, 'utf8', 'hex') + cipher.final('hex');
  const response = await fetch('https://interfacepc.music.163.com' + path.replace(/^\/api\//, '/eapi/'), {
    method: 'POST', headers: {
      accept: 'application/json', 'content-type': 'application/x-www-form-urlencoded',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36 Chrome/91.0.4472.164 NeteaseMusicDesktop/3.1.17.204416',
      referer: NETEASE + '/', cookie: mergeCookies(client.cookie, Object.entries(header).map(([k, v]) => k + '=' + encodeURIComponent(v)).join('; ')),
    }, body: new URLSearchParams({ params: params.toUpperCase() }).toString(), signal: AbortSignal.timeout(12000),
  });
  let data;
  try { data = JSON.parse(await response.text()); } catch { throw new Error('网易云登录服务返回了无法识别的数据'); }
  if (!response.ok) throw new Error('网易云登录服务请求失败（' + response.status + '）');
  client.cookie = mergeCookies(client.cookie, cookieHeader(response));
  return { data, client };
}
function qrProfile(data) {
  const profile = data?.data?.profile || data?.profile || {}, account = data?.data?.account || data?.account || {};
  const id = String(profile.userId || account.id || '');
  if (!id) throw new Error('网易云尚未返回有效的登录账号，请刷新二维码重试');
  return { id, nickname: String(profile.nickname || ''), avatar: String(profile.avatarUrl || '') };
}

async function songPlayback(id, session) {
  const client = session ? { cookie: session.cookie, deviceId: /(?:^|;\s*)deviceId=([^;]+)/.exec(session.cookie)?.[1] || '' } : qrClient();
  let lastCode = null;
  for (const [path, body] of [
    ['/api/song/enhance/player/url/v1', { ids: '[' + id + ']', level: 'standard', encodeType: 'mp3' }],
    ['/api/song/enhance/player/url', { ids: '[' + id + ']', br: 128000 }],
  ]) {
    try {
      const result = await qrUpstream(path, body, client);
      const records = result.data?.data?.data || result.data?.data;
      const item = Array.isArray(records) ? records.find(item => String(item.id) === id) : null;
      lastCode = item?.code ?? result.data?.code ?? lastCode;
      if (item?.url && /^https?:\/\//i.test(item.url)) return { playUrl: item.url.replace(/^http:/i, 'https:'), playUrlExpiresAt: Date.now() + Math.max(60, Number(item.expi) || 1200) * 1000, playbackStatus: 'available', playbackMessage: '' };
    } catch { /* Try the standard bitrate endpoint before reporting unavailable. */ }
  }
  return { playUrl: '', playUrlExpiresAt: 0, playbackStatus: session ? 'unavailable' : 'login_required', playbackMessage: session ? '网易云暂未提供这首歌的播放权限或该版本已下架，请更换版本' : '这首歌暂未提供游客播放地址，请先登录网易云后重试', playbackCode: lastCode };
}

async function encryptionKey(secret) {
  const raw = Uint8Array.from(atob(secret), char => char.charCodeAt(0));
  if (raw.length !== 32) throw new Error('Worker 会话加密密钥必须是 32 字节 Base64');
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

async function seal(value, secret) {
  const key = await encryptionKey(secret), iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(JSON.stringify(value));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  const bytes = new Uint8Array(iv.length + encrypted.byteLength); bytes.set(iv); bytes.set(new Uint8Array(encrypted), iv.length);
  return btoa(String.fromCharCode(...bytes));
}

async function unseal(value, secret) {
  const bytes = Uint8Array.from(atob(value), char => char.charCodeAt(0)), iv = bytes.slice(0, 12), ciphertext = bytes.slice(12);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, await encryptionKey(secret), ciphertext);
  return JSON.parse(new TextDecoder().decode(decrypted));
}

async function digest(value) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function randomToken(bytes = 32) {
  const data = crypto.getRandomValues(new Uint8Array(bytes));
  return btoa(String.fromCharCode(...data)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function bearer(request) { return /^Bearer\s+(.+)$/i.exec(request.headers.get('authorization') || '')?.[1] || ''; }

async function loadSession(request, env) {
  const token = bearer(request);
  if (!token) return null;
  const stored = await env.MUSIC_STORE.get('session:' + await digest(token));
  if (!stored) return null;
  try { return { token, ...(await unseal(stored, env.SESSION_ENCRYPTION_KEY)) }; }
  catch { return null; }
}

async function saveSession(env, cookie) {
  if (!cookie) throw new Error('扫码已完成，但网易云没有返回登录凭证');
  const token = randomToken();
  await env.MUSIC_STORE.put('session:' + await digest(token), await seal({ cookie, createdAt: Date.now() }, env.SESSION_ENCRYPTION_KEY), { expirationTtl: SESSION_TTL });
  return token;
}

function numeric(value, label) {
  if (!/^\d{1,18}$/.test(String(value || ''))) throw new Error(label + '无效');
  return String(value);
}

function musicError(message, code, status) {
  return Object.assign(new Error(message), { code, status });
}

function musicBody(data, label) {
  const body = data?.data && !Array.isArray(data.data) ? data.data : data;
  const code = Number(data?.code ?? body?.code ?? 200);
  if (code !== 200) {
    const status = [301, 302, 401].includes(code) ? 401 : code === 403 ? 403 : code === 404 ? 404 : 502;
    const message = status === 401 ? '网易云登录已失效，请重新扫码登录后同步'
      : String(data?.message || data?.msg || body?.message || body?.msg || label + '失败');
    throw musicError(message, code, status);
  }
  return body;
}

function sessionClient(session) {
  return session ? { cookie: session.cookie, deviceId: /(?:^|;\s*)deviceId=([^;]+)/.exec(session.cookie)?.[1] || '' } : qrClient();
}

async function playlistRecord(id, client) {
  let failure;
  for (const read of [
    () => qrUpstream('/api/v6/playlist/detail', { id, n: 100000, s: 0 }, client),
    () => upstream('/api/playlist/detail?id=' + id + '&n=100000&s=0', { cookie: client.cookie }),
  ]) {
    try {
      const { data } = await read();
      const body = musicBody(data, '读取歌单');
      // Older NetEase responses call the playlist "result", not "playlist".
      const playlist = body?.playlist || body?.result;
      if (!playlist || String(playlist.id) !== id) throw musicError('网易云未返回有效的歌单详情，请稍后重试', null, 502);
      return playlist;
    } catch (error) {
      if (error.status === 401 || error.status === 403) throw error;
      failure = failure?.status === 404 ? failure : error;
    }
  }
  throw failure;
}

function songRecord(song, cover = '') {
  return {
    id: String(song.id), name: String(song.name || ''),
    artist: (song.ar || song.artists || []).map(item => item.name).join(' / '),
    album: String(song.al?.name || song.album?.name || ''),
    cover: String(song.al?.picUrl || song.album?.picUrl || cover).replace(/^http:/i, 'https:'),
    duration: Math.round((Number(song.dt || song.duration) || 0) / 1000),
  };
}

async function completePlaylist(playlist, client) {
  const songs = new Map((playlist.tracks || []).filter(song => song?.id).map(song => [String(song.id), song]));
  const ids = [...new Set((playlist.trackIds?.length ? playlist.trackIds : playlist.tracks || [])
    .map(item => String(item?.id ?? item)).filter(id => /^\d{1,18}$/.test(id)))];
  const missing = ids.filter(id => !songs.get(id)?.name);
  // Fetch missing metadata in batches; playback URLs and lyrics remain on demand.
  const batches = [];
  for (let offset = 0; offset < missing.length; offset += 500) batches.push(missing.slice(offset, offset + 500));
  let next = 0;
  const fill = async () => {
    while (next < batches.length) {
      const batch = batches[next++];
      const { data } = await qrUpstream('/api/v3/song/detail', { c: JSON.stringify(batch.map(id => ({ id }))) }, client);
      const body = musicBody(data, '读取歌单歌曲');
      if (!Array.isArray(body?.songs)) throw musicError('网易云未返回歌单歌曲，请稍后重试', null, 502);
      for (const song of body.songs) if (song?.id && song.name) songs.set(String(song.id), song);
    }
  };
  await Promise.all(Array.from({ length: Math.min(3, batches.length) }, fill));
  const tracks = ids.filter(id => songs.get(id)?.name).map(id => songRecord(songs.get(id), playlist.coverImgUrl));
  const trackCount = Math.max(Number(playlist.trackCount) || 0, ids.length, tracks.length);
  if (trackCount > 0 && !tracks.length) throw musicError('网易云未返回可读取的歌单歌曲，请确认歌单权限后重试', null, 502);
  return {
    id: String(playlist.id), name: String(playlist.name || ''), cover: String(playlist.coverImgUrl || '').replace(/^http:/i, 'https:'),
    trackCount, tracks, unavailableTrackCount: trackCount - tracks.length, detailsVersion: 2,
  };
}

function feedbackOriginAllowed(env, origin) {
  const allowed = [env.APP_ORIGIN, ...(env.FEEDBACK_ALLOWED_ORIGINS || '').split(',')].map(value => value?.trim()).filter(Boolean);
  if (origin && allowed.includes(origin)) return true;
  if (env.FEEDBACK_ALLOW_LOCAL_PREVIEW === 'true') {
    try { const page = new URL(origin); return ['http:', 'https:'].includes(page.protocol) && ['localhost', '127.0.0.1', '[::1]'].includes(page.hostname); } catch {}
  }
  return false;
}
const feedbackQuotaKey = () => 'feedback:quota:' + new Date().toISOString().slice(0, 10);
function feedbackQuotaFromHeaders(response) {
  const daily = response.headers.get('x-resend-daily-quota'), monthly = response.headers.get('x-resend-monthly-quota');
  // These are provider-reported USED counts, not HTTP request-rate remaining counts.
  if (daily === null || !/^\d+$/.test(daily)) return null;
  return { remainingDaily: Math.max(0, 100 - Number(daily)), remainingMonthly: monthly !== null && /^\d+$/.test(monthly) ? Math.max(0, 3000 - Number(monthly)) : null, dailyLimit: 100, checkedAt: Date.now(), resetsAt: new Date((Math.floor(Date.now() / 86400000) + 1) * 86400000).toISOString() };
}
async function cacheFeedbackQuota(env, quota) {
  if (!quota) return;
  try { await env.MUSIC_STORE.put(feedbackQuotaKey(), JSON.stringify(quota), { expirationTtl: 300 }); } catch {}
}
async function feedbackUsageEstimate(env, sentId = '', observed = null) {
  const now = new Date(), day = now.toISOString().slice(0, 10), month = day.slice(0, 7);
  let usage;
  try { usage = JSON.parse(await env.MUSIC_STORE.get('feedback:usage-estimate') || 'null'); } catch {}
  if (!usage) { try { usage = JSON.parse(env.FEEDBACK_QUOTA_BASELINE || 'null'); } catch {} }
  usage = { day, month, dailyUsed: usage?.day === day ? Math.max(0, Number(usage.dailyUsed) || 0) : 0, monthlyUsed: usage?.month === month ? Math.max(0, Number(usage.monthlyUsed) || 0) : 0 };
  if (sentId) {
    const counted = await env.MUSIC_STORE.get('feedback:counted:' + sentId);
    if (!counted) {
      usage.dailyUsed++; usage.monthlyUsed++;
      if (observed) {
        if (Number.isFinite(observed.remainingDaily)) usage.dailyUsed = Math.max(usage.dailyUsed, 100 - observed.remainingDaily);
        if (Number.isFinite(observed.remainingMonthly)) usage.monthlyUsed = Math.max(usage.monthlyUsed, 3000 - observed.remainingMonthly);
      }
      await env.MUSIC_STORE.put('feedback:usage-estimate', JSON.stringify(usage));
      await env.MUSIC_STORE.put('feedback:counted:' + sentId, '1', { expirationTtl: 172800 });
    }
  }
  return { remainingDaily: Math.max(0, 100 - usage.dailyUsed), remainingMonthly: Math.max(0, 3000 - usage.monthlyUsed), dailyLimit: 100, source: 'iris-estimate', checkedAt: now.getTime(), resetsAt: new Date((Math.floor(now.getTime() / 86400000) + 1) * 86400000).toISOString() };
}
async function readFeedbackQuota(request, env, origin) {
  // File previews send an opaque null origin. Public remaining counts are read-only; sending stays restricted.
  if (origin && origin !== 'null' && !feedbackOriginAllowed(env, origin)) return json({ error: '当前页面地址尚未获准发送反馈。' }, 403, origin);
  if (!env.RESEND_API_KEY || !env.MUSIC_STORE) return json({ ok: true, quota: null }, 200, origin);
  if (env.FEEDBACK_QUOTA_MODE === 'estimate') return json({ ok: true, quota: await feedbackUsageEstimate(env) }, 200, origin);
  let cached;
  try { cached = JSON.parse(await env.MUSIC_STORE.get(feedbackQuotaKey()) || 'null'); } catch {}
  const valid = quota => quota && Number.isFinite(quota.checkedAt) && Date.now() - quota.checkedAt < 300000 && Date.parse(quota.resetsAt) > Date.now();
  if (valid(cached) && Date.now() - cached.checkedAt < 30000) return json({ ok: true, quota: cached }, 200, origin);
  let quota;
  try {
    const response = await fetch('https://api.resend.com/usage', { headers: { authorization: 'Bearer ' + env.RESEND_API_KEY }, signal: AbortSignal.timeout(7000) });
    quota = feedbackQuotaFromHeaders(response);
    if (response.ok) {
      const usage = await response.json(), daily = usage?.emails?.daily, monthly = usage?.emails?.monthly;
      const validWindow = window => window && (window.limit === null || Number.isFinite(window.limit) && window.limit >= 0) && Number.isFinite(window.used) && window.used >= 0;
      if (validWindow(daily) && validWindow(monthly)) quota = { remainingDaily: daily.limit === null ? null : Math.max(0, daily.limit - daily.used), remainingMonthly: monthly.limit === null ? null : Math.max(0, monthly.limit - monthly.used), dailyLimit: daily.limit, checkedAt: Date.now(), resetsAt: daily.resets_at };
    }
  } catch {}
  if (quota) await cacheFeedbackQuota(env, quota);
  return json({ ok: true, quota: quota || (valid(cached) ? cached : null) }, 200, origin);
}

// Feedback only sends to the author; client requests cannot choose recipients or credentials.
async function sendAuthorFeedback(request, env, origin) {
  if (!feedbackOriginAllowed(env, origin)) return json({ error: '当前页面地址尚未获准发送反馈。' }, 403, origin);
  if (!env.RESEND_API_KEY || !env.FEEDBACK_FROM || !env.MUSIC_STORE) return json({ error: '作者尚未启用邮件反馈服务，请稍后再试。' }, 503, origin);
  if (!request.headers.get('content-type')?.startsWith('multipart/form-data')) return json({ error: '反馈格式不正确。' }, 400, origin);
  const limit = 7 * 1024 * 1024;
  if (Number(request.headers.get('content-length')) > limit) return json({ error: '反馈附件过大。' }, 413, origin);
  const reader = request.body?.getReader();
  if (!reader) return json({ error: '请填写反馈内容。' }, 400, origin);
  const chunks = []; let length = 0;
  while (true) { const { done, value } = await reader.read(); if (done) break; length += value.byteLength; if (length > limit) { await reader.cancel(); return json({ error: '反馈附件过大。' }, 413, origin); } chunks.push(value); }
  const bytes = new Uint8Array(length); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  let form; try { form = await new Response(bytes, { headers: { 'content-type': request.headers.get('content-type') } }).formData(); } catch { return json({ error: '无法读取反馈内容。' }, 400, origin); }
  const topic = form.get('topic') === '功能建议' ? '功能优化' : form.get('topic'), description = form.get('description'), replyTo = form.get('replyTo') || '', version = form.get('version'), requestId = form.get('requestId'), images = form.getAll('images');
  if (!['Bug 反馈', '功能优化', '其他问题'].includes(topic) || typeof description !== 'string' || !description.trim() || description.length > 6000 || typeof version !== 'string' || version.length > 80 || /[\r\n]/.test(version) || typeof requestId !== 'string' || !/^[a-f0-9-]{36}$/i.test(requestId) || images.length > 3 || typeof replyTo !== 'string' || replyTo.length > 254 || /[\r\n]/.test(replyTo)) return json({ error: '请检查反馈文字、联系信息及图片数量。' }, 400, origin);
  const attachments = [];
  for (let index = 0; index < images.length; index++) {
    const image = images[index];
    if (!image || typeof image.arrayBuffer !== 'function' || !image.size || image.size > 2 * 1024 * 1024 || !['image/png', 'image/jpeg', 'image/webp'].includes(image.type)) return json({ error: '图片须为 PNG、JPG 或 WebP，每张不超过 2 MB。' }, 400, origin);
    const data = new Uint8Array(await image.arrayBuffer());
    const png = data[0] === 137 && data[1] === 80 && data[2] === 78 && data[3] === 71 && data[4] === 13 && data[5] === 10 && data[6] === 26 && data[7] === 10;
    const jpg = data[0] === 255 && data[1] === 216 && data[2] === 255;
    const webp = String.fromCharCode(...data.slice(0,4)) === 'RIFF' && String.fromCharCode(...data.slice(8,12)) === 'WEBP';
    if (!(image.type === 'image/png' && png || image.type === 'image/jpeg' && jpg || image.type === 'image/webp' && webp)) return json({ error: '截图文件内容与图片格式不符。' }, 400, origin);
    let binary = ''; for (let i = 0; i < data.length; i += 8192) binary += String.fromCharCode(...data.subarray(i, i + 8192));
    attachments.push({ filename: `screenshot-${index + 1}.${png ? 'png' : jpg ? 'jpg' : 'webp'}`, content: btoa(binary) });
  }
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
  const rateKey = 'feedback:rate:' + Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('') + ':' + Math.floor(Date.now() / 3600000);
  const attempts = Number(await env.MUSIC_STORE.get(rateKey) || 0);
  if (attempts >= 5) return json({ error: '反馈发送较频繁，请稍后再试。' }, 429, origin);
  await env.MUSIC_STORE.put(rateKey, String(attempts + 1), { expirationTtl: 3600 });
  let response;
  try { response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { authorization: 'Bearer ' + env.RESEND_API_KEY, 'content-type': 'application/json', 'Idempotency-Key': 'iris-feedback-' + requestId }, body: JSON.stringify({ from: env.FEEDBACK_FROM, to: ['weishengrongqing@gmail.com'], subject: `Iris ${topic} · ${version}`, text: `Iris 版本：${version}\n反馈类型：${topic}\n联系信息：${replyTo.trim() || '未填写'}\n\n${description.trim()}`, ...(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyTo.trim()) ? { reply_to: replyTo.trim() } : {}), attachments }), signal: AbortSignal.timeout(20000) }); } catch { return json({ error: '邮件服务暂时不可用，反馈内容已保留，请重试。' }, 502, origin); }
  let quota = feedbackQuotaFromHeaders(response);
  await cacheFeedbackQuota(env, quota);
  let result; try { result = await response.json(); } catch {}
  if (!response.ok || !result?.id) return json({ error: '邮件发送未成功，反馈内容已保留，请稍后重试。' }, 502, origin);
  if (env.FEEDBACK_QUOTA_MODE === 'estimate') { try { quota = await feedbackUsageEstimate(env, result.id, quota); } catch { /* Accepted mail stays successful even if approximate counters cannot be persisted. */ } }
  return json({ ok: true, id: result.id, quota }, 200, origin);
}

async function route(request, env, url) {
  const path = url.pathname, origin = request.headers.get('origin') || '';
  if (request.method === 'OPTIONS') {
    const headers = new Headers();
    headers.set('access-control-allow-origin', '*');
    headers.set('access-control-allow-methods', 'GET,POST,DELETE,OPTIONS');
    headers.set('access-control-allow-headers', 'authorization,content-type,x-iris-music-device');
    headers.set('access-control-max-age', '86400');
    return new Response(null, { status: 204, headers });
  }
  if (request.method === 'GET' && path === '/feedback/quota') return readFeedbackQuota(request, env, origin);
  if (request.method === 'POST' && path === '/feedback') return sendAuthorFeedback(request, env, origin);
  if (request.method === 'GET' && path === '/guest/playback') return guestPlayback(request,url);
  if (request.method === 'GET' && path === '/cover') return musicCover(url);
  if (request.method === 'GET' && path === '/health') return json({ ok: true, service: 'iris-music' }, 200, origin);

  if (request.method === 'GET' && path === '/auth/qr/start') {
    const client = qrClient();
    const { data } = await qrUpstream('/api/login/qrcode/unikey', { type: 3 }, client);
    const key = data?.unikey || data?.data?.unikey;
    if (!key) throw new Error(data?.message || '网易云暂时没有返回登录二维码');
    const id = randomToken(18);
    await env.MUSIC_STORE.put('qr:' + id, JSON.stringify({ key, protocol: QR_PROTOCOL, context: await seal(client, env.SESSION_ENCRYPTION_KEY), createdAt: Date.now() }), { expirationTtl: QR_TTL });
    return json({ id, qrUrl: 'https://music.163.com/login?codekey=' + encodeURIComponent(key), expiresIn: QR_TTL }, 200, origin);
  }

  if (request.method === 'GET' && path === '/auth/qr/poll') {
    const id = url.searchParams.get('id') || '';
    if (!/^[A-Za-z0-9_-]{16,64}$/.test(id)) return json({ error: '二维码状态无效' }, 400, origin);
    const raw = await env.MUSIC_STORE.get('qr:' + id);
    if (!raw) return json({ status: 'expired' }, 200, origin);
    const pending = JSON.parse(raw);
    if (pending.protocol !== QR_PROTOCOL || !pending.context) return json({ status: 'expired' }, 200, origin);
    const client = await unseal(pending.context, env.SESSION_ENCRYPTION_KEY);
    if (client.authorized) return json(client.authorized, 200, origin);
    if (client.rejection) return json(client.rejection, 409, origin);
    if (Date.now() - pending.createdAt >= QR_TTL * 1000) return json({ status: 'expired' }, 200, origin);
    const result = await qrUpstream('/api/login/qrcode/client/login', { key: pending.key, type: 3 }, client);
    const code = Number(result.data?.code ?? result.data?.data?.code);
    if (code === 803) {
      client.cookie = mergeCookies(client.cookie, result.data.cookie || '');
      if (!/(?:^|;\s*)MUSIC_U=([^;]+)/.test(client.cookie)) throw new Error('手机已授权，但网易云未返回登录凭证，请刷新二维码重试');
      const profileResult = await qrUpstream('/api/w/nuser/account/get', {}, client);
      const user = qrProfile(profileResult.data);
      const token = await saveSession(env, client.cookie);
      const authorized = { status: 'authorized', token, user };
      await env.MUSIC_STORE.put('qr:' + id, JSON.stringify({ ...pending, context: await seal({ ...client, authorized }, env.SESSION_ENCRYPTION_KEY) }), { expirationTtl: 60 });
      return json(authorized, 200, origin);
    }
    if (code === 800) return json({ status: 'expired' }, 200, origin);
    if (code !== 801 && code !== 802) {
      const rejection = { status: 'rejected', code: Number.isFinite(code) ? code : null, error: String(result.data?.message || result.data?.msg || '网易云拒绝了本次扫码登录') };
      await env.MUSIC_STORE.put('qr:' + id, JSON.stringify({ ...pending, context: await seal({ ...client, rejection }, env.SESSION_ENCRYPTION_KEY) }), { expirationTtl: 60 });
      return json(rejection, 409, origin);
    }
    // Persist server-issued device cookies without extending the QR lifetime.
    const remaining = Math.max(60, Math.ceil((pending.createdAt + QR_TTL * 1000 - Date.now()) / 1000));
    const context = await unseal(pending.context, env.SESSION_ENCRYPTION_KEY);
    if (client.cookie !== context.cookie) await env.MUSIC_STORE.put('qr:' + id, JSON.stringify({ ...pending, context: await seal(client, env.SESSION_ENCRYPTION_KEY) }), { expirationTtl: remaining });
    return json({ status: code === 802 ? 'scanned' : 'waiting' }, 200, origin);
  }

  if (path.startsWith('/auth/')) {
    const session = await loadSession(request, env);
    if (path === '/auth/logout' && request.method === 'POST') {
      if (session) await env.MUSIC_STORE.delete('session:' + await digest(session.token));
      return json({ ok: true }, 200, origin);
    }
    if (!session) return json({ error: '网易云尚未登录或登录已失效' }, 401, origin);
    if (path === '/auth/me' && request.method === 'GET') {
      const { data } = await qrUpstream('/api/w/nuser/account/get', {}, { cookie: session.cookie, deviceId: /(?:^|;\s*)deviceId=([^;]+)/.exec(session.cookie)?.[1] || '' });
      const profile = data?.data?.profile || data?.profile || {}, account = data?.data?.account || data?.account || {};
      if (!(profile.userId || account.id)) return json({ error: '网易云登录状态已失效' }, 401, origin);
      return json({ user: { id: String(profile.userId || account.id), nickname: String(profile.nickname || ''), avatar: String(profile.avatarUrl || '') } }, 200, origin);
    }
    return json({ error: '未知登录接口' }, 404, origin);
  }

  if (request.method === 'GET' && path === '/user/playlists') {
    const session = await loadSession(request, env);
    if (!session) return json({ error: '网易云尚未登录或登录已失效' }, 401, origin);
    const status = await qrUpstream('/api/w/nuser/account/get', {}, { cookie: session.cookie, deviceId: /(?:^|;\s*)deviceId=([^;]+)/.exec(session.cookie)?.[1] || '' });
    const profile = qrProfile(musicBody(status.data, '读取网易云账号'));
    const uid = numeric(profile.id, '网易云用户 ID'), client = sessionClient(session), rows = new Map();
    let offset = 0;
    while (true) {
      const { data } = await qrUpstream('/api/user/playlist', { uid, limit: 1000, offset, includeVideo: true }, client);
      const body = musicBody(data, '同步歌单');
      if (!Array.isArray(body?.playlist)) throw musicError('网易云未返回歌单列表，请稍后重试', null, 502);
      const before = rows.size;
      for (const row of body.playlist) if (row?.id) rows.set(String(row.id), row);
      if (!body.more) break;
      if (!body.playlist.length || rows.size === before) throw musicError('网易云歌单分页读取中断，请重新同步', null, 502);
      offset += body.playlist.length;
    }
    return json({ playlists: [...rows.values()].map(row => ({ id: String(row.id), name: String(row.name || ''), cover: String(row.coverImgUrl || '').replace(/^http:/i, 'https:'), trackCount: Number(row.trackCount) || 0, creator: String(row.creator?.nickname || ''), description: String(row.description || ''), owned: String(row.userId || row.creator?.userId || '') === uid })) }, 200, origin);
  }

  if (request.method === 'GET' && path === '/playlist') {
    const playlistId = numeric(url.searchParams.get('id'), '歌单 ID');
    const session = await loadSession(request, env);
    if (bearer(request) && !session) return json({ error: '网易云登录已失效，请重新扫码登录后同步' }, 401, origin);
    const client = sessionClient(session);
    const playlist = await playlistRecord(playlistId, client);
    return json({ playlist: await completePlaylist(playlist, client) }, 200, origin);
  }

  if (request.method === 'GET' && path === '/resolve') {
    const title = (url.searchParams.get('title') || '').trim().slice(0, 100);
    const artist = (url.searchParams.get('artist') || '').trim().slice(0, 100);
    if (!title) return json({ error: '请提供歌曲名称' }, 400, origin);
    const query = [title, artist].filter(Boolean).join(' ');
    const resolveSession = await loadSession(request, env);
    if (bearer(request) && !resolveSession) return json({ error: '网易云登录已失效，请重新扫码登录' },401,origin);
    if (!resolveSession) {
      const candidates = await guestMusicRead('search',query), clean = value => String(value||'').normalize('NFKC').toLowerCase().replace(/[\s\p{P}\p{S}]/gu,'');
      const match = candidates.find(song => clean(song.name)===clean(title) && (!artist || song.artist.split(' / ').some(name=>clean(name)===clean(artist))));
      if (!match) return json({error:'没有找到歌名与歌手都能核对的版本'},404,origin);
      return json({song:await guestMusicSong(match.id,false,url.origin)},200,origin);
    }
    const { data } = await qrUpstream('/api/cloudsearch/pc', { s: query, type: 1, limit: 30, offset: 0, total: true }, sessionClient(resolveSession));
    const songs = data?.result?.songs || data?.data?.result?.songs || [];
    const key = value => String(value || '').normalize('NFKC').toLowerCase().replace(/[\s\p{P}\p{S}]/gu, '');
    const exactTitle = songs.filter(song => key(song.name) === key(title));
    const match = exactTitle.find(song => !artist || (song.artists || song.ar || []).some(item => key(item.name).includes(key(artist)) || key(artist).includes(key(item.name)))) || (!artist && exactTitle.length === 1 ? exactTitle[0] : null);
    if (!match) return json({ error: '没有找到歌名与歌手都能核对的版本' }, 404, origin);
    return route(new Request(new URL('/song?id=' + encodeURIComponent(match.id), url), { headers: request.headers }), env, new URL('/song?id=' + encodeURIComponent(match.id), url));
  }

  if (request.method === 'GET' && path === '/search') {
    const keyword = (url.searchParams.get('q') || '').trim().slice(0, 100);
    if (!keyword) return json({ error: '请提供搜索关键词' }, 400, origin);
    const searchSession = await loadSession(request,env);
    if (bearer(request) && !searchSession) return json({error:'网易云登录已失效，请重新扫码登录'},401,origin);
    if (!searchSession) return json({songs:(await guestMusicRead('search',keyword)).map(({provider,...song})=>song)},200,origin);
    const { data } = await qrUpstream('/api/cloudsearch/pc', { s: keyword, type: 1, limit: 20, offset: 0, total: true }, sessionClient(searchSession));
    const songs = data?.result?.songs || data?.data?.result?.songs || [];
    return json({ songs: songs.map(song => ({ id: String(song.id), name: String(song.name || ''), artist: (song.artists || song.ar || []).map(item => item.name).join(' / '), album: String(song.album?.name || song.al?.name || ''), cover: String(song.album?.picUrl || song.al?.picUrl || ''), duration: Math.round((Number(song.duration || song.dt) || 0) / 1000) })) }, 200, origin);
  }

  if (request.method === 'GET' && path === '/song') {
    const id = numeric(url.searchParams.get('id'), '歌曲 ID');
    const session = await loadSession(request, env);
    if (bearer(request) && !session) return json({error:'网易云登录已失效，请重新扫码登录'},401,origin);
    if (!session) return json({song:await guestMusicSong(id,url.searchParams.get('metadata')==='1',url.origin)},200,origin);
    const [detail, lyric] = await Promise.all([
      upstream('/api/song/detail/?id=' + id + '&ids=%5B' + id + '%5D'),
      upstream('/api/song/lyric?id=' + id + '&lv=-1&kv=-1&tv=-1').catch(() => ({ data: {} })),
    ]);
    const song = detail.data?.songs?.[0] || detail.data?.data?.songs?.[0];
    if (!song) return json({ error: '没有找到这首歌' }, 404, origin);
    const lyrics = lyric.data?.lrc?.lyric || lyric.data?.klyric?.lyric || '';
    const playback = url.searchParams.get('metadata') === '1' ? {} : await songPlayback(id, session);
    return json({ song: { musicAccessMode: 'session', id: String(song.id), name: String(song.name || ''), artist: (song.ar || song.artists || []).map(item => item.name).join(' / '), album: String(song.al?.name || song.album?.name || ''), cover: String(song.al?.picUrl || song.album?.picUrl || ''), duration: Math.round((Number(song.dt || song.duration) || 0) / 1000), lyrics, lyricSource: lyrics ? '网易云音乐' : '', ...playback } }, 200, origin);
  }

  return json({ error: '接口不存在' }, 404, origin);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url), origin = request.headers.get('origin') || '';
    const statistics = await statisticsRoute(request, env, ctx, url);
    if (statistics) return statistics;
    return observeMusic(request, env, ctx, async () => {
      try { return await route(request, env, url); }
      catch (error) { return json({ error: error?.message || '音乐服务暂时不可用', ...(error?.code != null ? { code: error.code } : {}) }, error?.status || 502, origin); }
    });
  },
};
