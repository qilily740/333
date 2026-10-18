const NETEASE = 'https://music.163.com';
const SESSION_TTL = 60 * 60 * 24 * 30;
const QR_TTL = 60 * 5;

function json(value, status = 200, origin = '') {
  const headers = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
  headers['access-control-allow-origin'] = '*';
  headers['access-control-allow-methods'] = 'GET,POST,DELETE,OPTIONS';
  headers['access-control-allow-headers'] = 'authorization,content-type';
  return new Response(JSON.stringify(value), { status, headers });
}

function cookieHeader(response) {
  const values = response.headers.getSetCookie?.() || [];
  return values.map(value => value.split(';', 1)[0]).filter(Boolean).join('; ');
}

async function upstream(path, { cookie = '', method = 'GET', body, referer = NETEASE + '/' } = {}) {
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

async function route(request, env, url) {
  const path = url.pathname, origin = request.headers.get('origin') || '';
  if (request.method === 'OPTIONS') {
    const headers = new Headers();
    headers.set('access-control-allow-origin', '*');
    headers.set('access-control-allow-methods', 'GET,POST,DELETE,OPTIONS');
    headers.set('access-control-allow-headers', 'authorization,content-type');
    headers.set('access-control-max-age', '86400');
    return new Response(null, { status: 204, headers });
  }
  if (request.method === 'GET' && path === '/health') return json({ ok: true, service: 'iris-music' }, 200, origin);

  if (request.method === 'GET' && path === '/auth/qr/start') {
    const { data } = await upstream('/api/login/qrcode/unikey?type=1');
    const key = data?.unikey || data?.data?.unikey;
    if (!key) throw new Error('网易云暂时没有返回登录二维码');
    const id = randomToken(18);
    await env.MUSIC_STORE.put('qr:' + id, JSON.stringify({ key, createdAt: Date.now() }), { expirationTtl: QR_TTL });
    return json({ id, qrUrl: 'https://music.163.com/login?codekey=' + encodeURIComponent(key), expiresIn: QR_TTL }, 200, origin);
  }

  if (request.method === 'GET' && path === '/auth/qr/poll') {
    const id = url.searchParams.get('id') || '';
    if (!/^[A-Za-z0-9_-]{16,64}$/.test(id)) return json({ error: '二维码状态无效' }, 400, origin);
    const pending = await env.MUSIC_STORE.get('qr:' + id);
    if (!pending) return json({ status: 'expired' }, 200, origin);
    const { key } = JSON.parse(pending);
    const result = await upstream('/api/login/qrcode/client/login?key=' + encodeURIComponent(key) + '&type=1');
    const code = Number(result.data?.code ?? result.data?.data?.code);
    if (code === 803 || result.data?.cookie) {
      const token = await saveSession(env, result.data.cookie || result.cookie);
      await env.MUSIC_STORE.delete('qr:' + id);
      const session = await loadSession(new Request('https://local.invalid', { headers: { authorization: 'Bearer ' + token } }), env);
      const { data } = await upstream('/api/login/status', { cookie: session.cookie });
      const profile = data?.data?.profile || data?.profile || {};
      const account = data?.data?.account || data?.account || {};
      return json({ status: 'authorized', token, user: { id: String(profile.userId || account.id || ''), nickname: String(profile.nickname || ''), avatar: String(profile.avatarUrl || '') } }, 200, origin);
    }
    if (code === 800) { await env.MUSIC_STORE.delete('qr:' + id); return json({ status: 'expired' }, 200, origin); }
    if (code === 802) return json({ status: 'scanned' }, 200, origin);
    if (code !== 801) throw new Error(result.data?.message || '网易云扫码状态请求失败（' + code + '）');
    return json({ status: 'waiting' }, 200, origin);
  }

  if (path.startsWith('/auth/')) {
    const session = await loadSession(request, env);
    if (path === '/auth/logout' && request.method === 'POST') {
      if (session) await env.MUSIC_STORE.delete('session:' + await digest(session.token));
      return json({ ok: true }, 200, origin);
    }
    if (!session) return json({ error: '网易云尚未登录或登录已失效' }, 401, origin);
    if (path === '/auth/me' && request.method === 'GET') {
      const { data } = await upstream('/api/login/status', { cookie: session.cookie });
      const profile = data?.data?.profile || data?.profile || {}, account = data?.data?.account || data?.account || {};
      if (!(profile.userId || account.id)) return json({ error: '网易云登录状态已失效' }, 401, origin);
      return json({ user: { id: String(profile.userId || account.id), nickname: String(profile.nickname || ''), avatar: String(profile.avatarUrl || '') } }, 200, origin);
    }
    return json({ error: '未知登录接口' }, 404, origin);
  }

  if (request.method === 'GET' && path === '/user/playlists') {
    const session = await loadSession(request, env);
    if (!session) return json({ error: '网易云尚未登录或登录已失效' }, 401, origin);
    const status = await upstream('/api/login/status', { cookie: session.cookie });
    const profile = status.data?.data?.profile || status.data?.profile || {}, account = status.data?.data?.account || status.data?.account || {};
    const uid = numeric(profile.userId || account.id, '网易云用户 ID');
    const { data } = await upstream('/api/user/playlist?uid=' + uid + '&limit=1000&offset=0', { cookie: session.cookie });
    const rows = data?.playlist || data?.data?.playlist || [];
    return json({ playlists: rows.map(row => ({ id: String(row.id), name: String(row.name || ''), cover: String(row.coverImgUrl || ''), trackCount: Number(row.trackCount) || 0, creator: String(row.creator?.nickname || ''), description: String(row.description || ''), owned: String(row.userId || '') === uid })) }, 200, origin);
  }

  if (request.method === 'GET' && path === '/playlist') {
    const playlistId = numeric(url.searchParams.get('id'), '歌单 ID');
    const session = await loadSession(request, env);
    const { data } = await upstream('/api/playlist/detail?id=' + playlistId + '&n=1000', { cookie: session?.cookie || '' });
    const playlist = data?.playlist || data?.data?.playlist;
    if (!playlist) return json({ error: '没有找到这份歌单' }, 404, origin);
    const songs = playlist.tracks || [];
    return json({ playlist: { id: String(playlist.id), name: String(playlist.name || ''), cover: String(playlist.coverImgUrl || ''), trackCount: Number(playlist.trackCount) || songs.length, tracks: songs.map(song => ({ id: String(song.id), name: String(song.name || ''), artist: (song.ar || song.artists || []).map(item => item.name).join(' / '), album: String(song.al?.name || song.album?.name || ''), cover: String(song.al?.picUrl || song.album?.picUrl || playlist.coverImgUrl || ''), duration: Math.round((Number(song.dt || song.duration) || 0) / 1000) })) } }, 200, origin);
  }

  if (request.method === 'GET' && path === '/resolve') {
    const title = (url.searchParams.get('title') || '').trim().slice(0, 100);
    const artist = (url.searchParams.get('artist') || '').trim().slice(0, 100);
    if (!title) return json({ error: '请提供歌曲名称' }, 400, origin);
    const query = [title, artist].filter(Boolean).join(' ');
    const { data } = await upstream('/api/search/get?type=1&limit=30&offset=0&s=' + encodeURIComponent(query));
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
    const { data } = await upstream('/api/search/get?type=1&limit=20&offset=0&s=' + encodeURIComponent(keyword));
    const songs = data?.result?.songs || data?.data?.result?.songs || [];
    return json({ songs: songs.map(song => ({ id: String(song.id), name: String(song.name || ''), artist: (song.artists || song.ar || []).map(item => item.name).join(' / '), album: String(song.album?.name || song.al?.name || ''), cover: String(song.album?.picUrl || song.al?.picUrl || ''), duration: Math.round((Number(song.duration || song.dt) || 0) / 1000) })) }, 200, origin);
  }

  if (request.method === 'GET' && path === '/song') {
    const id = numeric(url.searchParams.get('id'), '歌曲 ID');
    const session = await loadSession(request, env);
    const [detail, lyric] = await Promise.all([
      upstream('/api/song/detail/?id=' + id + '&ids=%5B' + id + '%5D'),
      upstream('/api/song/lyric?id=' + id + '&lv=-1&kv=-1&tv=-1').catch(() => ({ data: {} })),
    ]);
    const song = detail.data?.songs?.[0] || detail.data?.data?.songs?.[0];
    if (!song) return json({ error: '没有找到这首歌' }, 404, origin);
    const lyrics = lyric.data?.lrc?.lyric || lyric.data?.klyric?.lyric || '';
    let playUrl = '';
    try {
      const playable = await upstream('/api/song/enhance/player/url/v1?id=' + id + '&level=standard', { cookie: session?.cookie || '' });
      const item = playable.data?.data?.[0] || playable.data?.data?.data?.[0];
      if (item?.code === 200 && item.url) playUrl = String(item.url);
    } catch {}
    return json({ song: { id: String(song.id), name: String(song.name || ''), artist: (song.ar || song.artists || []).map(item => item.name).join(' / '), album: String(song.al?.name || song.album?.name || ''), cover: String(song.al?.picUrl || song.album?.picUrl || ''), duration: Math.round((Number(song.dt || song.duration) || 0) / 1000), lyrics, lyricSource: lyrics ? '网易云音乐' : '', playUrl } }, 200, origin);
  }

  return json({ error: '接口不存在' }, 404, origin);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('origin') || '';
    const path = new URL(request.url).pathname;
    try { return await route(request, env, new URL(request.url)); }
    catch (error) { return json({ error: error?.message || '音乐服务暂时不可用' }, 502, origin); }
  },
};
