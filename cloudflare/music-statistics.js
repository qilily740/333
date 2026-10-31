import { AsyncLocalStorage } from 'node:async_hooks';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { statisticsPage } from './statistics-page.js';

const context = new AsyncLocalStorage();
const DAY = 86400000, RETENTION = 90, DEDUP_DAYS = 7;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const labels = {
  cover: '获取歌曲封面', search: '搜索', song_info: '歌曲信息与歌词', song_playback: '歌曲信息及播放地址',
  playback_url: '获取播放地址', resolve: '按歌名匹配歌曲', playlist: '读取歌单', playlists: '同步歌单列表',
  qr_start: '创建登录二维码', qr_poll: '查询二维码状态', account: '读取登录状态', logout: '退出登录',
  playback: '本地或已缓存歌曲播放', playlist_cache: '查看已缓存歌单', other: '其他音乐上游请求',
};
export const beijingDay = ms => new Date(ms + 8 * 3600000).toISOString().slice(0, 10);
const dayStart = day => Date.parse(day + 'T00:00:00+08:00');
const answer = (value, status = 200) => Response.json(value, { status, headers: { 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } });
const enabled = env => env.MUSIC_STATS_ENABLED === 'true' && env.MUSIC_STATS && String(env.MUSIC_STATS_HASH_KEY || '').length >= 32;
const namespace = env => env.MUSIC_STATS.get(env.MUSIC_STATS.idFromName('music-statistics-v1'));
const hash = (env, value) => createHmac('sha256', env.MUSIC_STATS_HASH_KEY).update(value).digest('hex');
function device(request, env) {
  const id = request.headers.get('x-iris-music-device') || '';
  return UUID.test(id) ? hash(env, 'device:' + id.toLowerCase()) : null;
}
export function musicCategory(request, url = new URL(request.url)) {
  if (request.method !== 'GET' && !(request.method === 'POST' && url.pathname === '/auth/logout')) return null;
  if (url.pathname === '/song') return url.searchParams.get('metadata') === '1' ? 'song_info' : 'song_playback';
  return ({ '/guest/playback': 'playback_url', '/cover': 'cover', '/search': 'search', '/resolve': 'resolve', '/playlist': 'playlist', '/user/playlists': 'playlists', '/auth/qr/start': 'qr_start', '/auth/qr/poll': 'qr_poll', '/auth/me': 'account', '/auth/logout': 'logout' })[url.pathname] || null;
}
function externalCategory(path) {
  if (path === '/cover') return 'cover';
  if (/cloudsearch|search/.test(path)) return 'search';
  if (/player\/url|song\/url|meting\/url/.test(path)) return 'playback_url';
  if (/song\/detail|song\/lyric|meting\/(song|lyric)/.test(path)) return 'song_info';
  if (/playlist\/detail/.test(path)) return 'playlist';
  if (/user\/playlist/.test(path)) return 'playlists';
  if (/unikey\/client|qrcode\/client|qr.*check/.test(path)) return 'qr_poll';
  if (/unikey|qrcode/.test(path)) return 'qr_start';
  if (/account|login|user.*get/.test(path)) return 'account';
  return 'other';
}
// No global fetch patch: AsyncLocalStorage isolates simultaneous music requests.
export async function musicUpstream(path, read) {
  const metrics = context.getStore();
  if (!metrics) return read();
  const at = Date.now(), start = performance.now(); let ok = false;
  try {
    const result = await read(), code = Number(result?.data?.code ?? result?.data?.data?.code ?? 200);
    ok = [200, 800, 801, 802, 803].includes(code); return result;
  } finally { metrics.upstream.push({ at, category: externalCategory(path), ok, ms: Math.max(0, Math.round(performance.now() - start)) }); }
}
async function deliver(env, event) {
  // Retry the SAME server event, never a new event, so an ambiguous acknowledgement cannot double count.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await namespace(env).fetch('https://statistics.internal/record', { method: 'POST', body: JSON.stringify(event), signal: AbortSignal.timeout(2500) });
      if (response.ok) return;
    } catch {}
  }
  console.warn('music_statistics_write_failed'); // No request data, IDs, URLs, credentials or IPs.
}
function background(ctx, env, event) {
  try { const job = deliver(env, event).catch(() => {}); if (ctx?.waitUntil) ctx.waitUntil(job); } catch {}
}
export async function observeMusic(request, env, ctx, run) {
  const category = musicCategory(request);
  if (!category || !enabled(env)) return run();
  const at = Date.now(), start = performance.now(), metrics = { upstream: [] };
  const response = await context.run(metrics, run);
  try { background(ctx, env, { id: crypto.randomUUID(), at, device: device(request, env), scope: 'client', category, ok: response.status >= 200 && response.status < 400, ms: Math.max(0, Math.round(performance.now() - start)), upstream: metrics.upstream }); } catch {}
  return response;
}
function authorized(request, env) {
  const expected = String(env.MUSIC_STATS_ADMIN_TOKEN || ''); if (expected.length < 32) return false;
  const auth = request.headers.get('authorization') || ''; let candidate = '';
  if (auth.startsWith('Bearer ')) candidate = auth.slice(7);
  else if (auth.startsWith('Basic ')) { try { const value = atob(auth.slice(6)); if (value.startsWith('admin:')) candidate = value.slice(6); } catch {} }
  return timingSafeEqual(createHash('sha256').update(candidate).digest(), createHash('sha256').update(expected).digest());
}
export async function statisticsRoute(request, env, ctx, url) {
  if (url.pathname === '/stats/capabilities' && request.method === 'GET') return Response.json({ protocol: 1, enabled: !!enabled(env), cover_proxy: true, guest_meting: true }, { headers: { 'cache-control': 'no-store', 'access-control-allow-origin': '*', 'x-content-type-options': 'nosniff' } });
  if (url.pathname === '/stats/activity') {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'POST,OPTIONS', 'access-control-allow-headers': 'x-iris-music-device,x-iris-music-event,x-iris-music-action', 'access-control-max-age': '86400' } });
    if (request.method !== 'POST') return answer({ error: '方法不支持' }, 405);
    if (enabled(env)) {
      const eventId = request.headers.get('x-iris-music-event') || '', action = request.headers.get('x-iris-music-action');
      if (!UUID.test(eventId) || !['playback', 'playlist_cache'].includes(action)) return answer({ error: '无效的音乐使用事件' }, 400);
      try { background(ctx, env, { id: hash(env, 'activity:' + (device(request, env) || 'unknown') + ':' + eventId), at: Date.now(), device: device(request, env), scope: 'activity', category: action, ok: true, ms: 0, upstream: [] }); } catch {}
    }
    return new Response(null, { status: 204, headers: { 'access-control-allow-origin': '*', 'cache-control': 'no-store' } });
  }
  if (!url.pathname.startsWith('/admin/music-statistics')) return null;
  if (!authorized(request, env)) return new Response('仅管理员可访问', { status: 401, headers: { 'www-authenticate': 'Basic realm="Iris music statistics", charset="UTF-8"', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } });
  if (request.method !== 'GET') return answer({ error: '只支持读取' }, 405);
  if (url.pathname === '/admin/music-statistics') {
    const nonce = crypto.randomUUID();
    return new Response(statisticsPage(nonce), { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'referrer-policy': 'no-referrer', 'x-frame-options': 'DENY', 'content-security-policy': `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'` } });
  }
  if (!['/admin/music-statistics/report', '/admin/music-statistics/export.csv'].includes(url.pathname)) return answer({ error: '接口不存在' }, 404);
  if (!enabled(env)) return answer({ error: '统计尚未启用或缺少独立存储、哈希密钥；历史数据未采集。' }, 503);
  try {
    return await namespace(env).fetch('https://statistics.internal/report?' + new URLSearchParams({ from: url.searchParams.get('from') || '', to: url.searchParams.get('to') || '', format: url.pathname.endsWith('.csv') ? 'csv' : 'json' }));
  } catch { return answer({ error: '统计暂时不可用，音乐功能不受影响。' }, 503); }
}

// Independent SQLite-backed Durable Object. Never reads/writes MUSIC_STORE or app data.
export class MusicStatistics {
  constructor(state) {
    this.storage = state.storage; this.sql = state.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS seen (id TEXT PRIMARY KEY, at INTEGER NOT NULL);
      CREATE INDEX IF NOT EXISTS seen_at ON seen(at);
      CREATE TABLE IF NOT EXISTS devices (day TEXT NOT NULL, device TEXT NOT NULL, PRIMARY KEY(day,device));
      CREATE TABLE IF NOT EXISTS totals (day TEXT NOT NULL, scope TEXT NOT NULL, category TEXT NOT NULL, calls INTEGER NOT NULL, success INTEGER NOT NULL, failure INTEGER NOT NULL, unknown INTEGER NOT NULL, sum_ms INTEGER NOT NULL, max_ms INTEGER NOT NULL, PRIMARY KEY(day,scope,category));`);
  }
  now() { return Date.now(); }
  rows(query, ...args) { return this.sql.exec(query, ...args).toArray(); }
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === 'POST' && url.pathname === '/record') {
      const event = await request.json(), now = this.now();
      if (!event || !/^[a-f0-9-]{32,64}$/.test(event.id || '') || !Number.isSafeInteger(event.at) || event.at < now - DEDUP_DAYS * DAY || event.at > now + 60000 || !['client', 'activity'].includes(event.scope) || !labels[event.category] || event.device !== null && !/^[a-f0-9]{64}$/.test(event.device) || !Array.isArray(event.upstream) || event.upstream.length > 1000) return answer({ error: '事件无效' }, 400);
      const validSample = sample => Number.isSafeInteger(sample.at) && sample.at >= now - DEDUP_DAYS * DAY && sample.at <= now + 60000 && labels[sample.category] && typeof sample.ok === 'boolean' && Number.isFinite(sample.ms) && sample.ms >= 0 && sample.ms <= 3600000;
      if (!validSample(event) || !event.upstream.every(validSample)) return answer({ error: '采样无效' }, 400);
      this.storage.transactionSync(() => {
        if (!this.rows('INSERT OR IGNORE INTO seen(id,at) VALUES(?,?) RETURNING id', event.id, now).length) return;
        this.sql.exec("INSERT INTO meta(key,value) VALUES('started_at',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value WHERE CAST(excluded.value AS INTEGER)<CAST(meta.value AS INTEGER)", String(event.at));
        const day = beijingDay(event.at);
        if (event.device) this.sql.exec('INSERT OR IGNORE INTO devices(day,device) VALUES(?,?)', day, event.device);
        this.add(day, event.scope, event.category, event.ok, event.ms, !event.device);
        for (const sample of event.upstream) this.add(beijingDay(sample.at), 'upstream', sample.category, sample.ok, sample.ms, false);
      });
      // No remote I/O or timers keep this actor alive; one daily cleanup alarm.
      if (await this.storage.getAlarm() === null) await this.storage.setAlarm(dayStart(beijingDay(now)) + DAY + 60000);
      return answer({ ok: true });
    }
    if (request.method === 'GET' && url.pathname === '/report') return this.report(url);
    return answer({ error: '接口不存在' }, 404);
  }
  add(day, scope, category, ok, ms, unknown) {
    this.sql.exec(`INSERT INTO totals VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(day,scope,category) DO UPDATE SET calls=calls+1,success=success+excluded.success,failure=failure+excluded.failure,unknown=unknown+excluded.unknown,sum_ms=sum_ms+excluded.sum_ms,max_ms=MAX(max_ms,excluded.max_ms)`, day, scope, category, 1, ok ? 1 : 0, ok ? 0 : 1, unknown ? 1 : 0, Math.round(ms), Math.round(ms));
  }
  async alarm() {
    const now = this.now(), cutoff = beijingDay(dayStart(beijingDay(now)) - (RETENTION - 1) * DAY);
    this.storage.transactionSync(() => { this.sql.exec('DELETE FROM seen WHERE at < ?', now - DEDUP_DAYS * DAY); this.sql.exec('DELETE FROM devices WHERE day < ?', cutoff); this.sql.exec('DELETE FROM totals WHERE day < ?', cutoff); });
    await this.storage.setAlarm(dayStart(beijingDay(now)) + DAY + 60000);
  }
  report(url) {
    const now = this.now(), today = beijingDay(now), from = url.searchParams.get('from') || today, to = url.searchParams.get('to') || today;
    const valid = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(dayStart(value)) && beijingDay(dayStart(value)) === value;
    if (!valid(from) || !valid(to) || from > to || to > today || dayStart(to) - dayStart(from) > 365 * DAY) return answer({ error: '日期无效：使用 YYYY-MM-DD，不能查询未来，单次最多 366 天。' }, 400);
    const started = Number(this.rows("SELECT value FROM meta WHERE key='started_at'")[0]?.value) || null, startDay = started ? beijingDay(started) : null;
    const oldest = beijingDay(dayStart(today) - (RETENTION - 1) * DAY), availableFrom = startDay ? [from, oldest, startDay].sort().at(-1) : null;
    const totalRows = this.rows('SELECT * FROM totals WHERE day>=? AND day<=? ORDER BY day,scope,category', from < oldest ? oldest : from, to);
    const counts = new Map(this.rows('SELECT day,COUNT(*) AS n FROM devices WHERE day>=? AND day<=? GROUP BY day', from < oldest ? oldest : from, to).map(row => [row.day, row.n]));
    const unique = totalRows.length > 0 && availableFrom && availableFrom <= to ? this.rows('SELECT COUNT(DISTINCT device) AS n FROM devices WHERE day>=? AND day<=?', availableFrom, to)[0].n : null;
    const sum = (rows, scope, key) => rows.filter(row => row.scope === scope).reduce((n, row) => n + row[key], 0);
    const days = [];
    for (let ms = dayStart(from); ms <= dayStart(to); ms += DAY) {
      const day = beijingDay(ms), status = !startDay || day < startDay ? '未采集' : day < oldest ? '已过保留期' : !totalRows.some(row => row.day === day) ? '未采集' : day === today ? '今天尚未完整' : day === startDay ? '起始日非全天' : '已采集';
      const collected = !['未采集', '已过保留期'].includes(status), rows = collected ? totalRows.filter(row => row.day === day) : [];
      const calls = collected ? sum(rows, 'client', 'calls') : null;
      days.push({ day, status, devices: collected ? counts.get(day) || 0 : null, calls, success: collected ? sum(rows, 'client', 'success') : null, failure: collected ? sum(rows, 'client', 'failure') : null, unknown_requests: collected ? sum(rows, 'client', 'unknown') : null, unknown_activity: collected ? sum(rows, 'activity', 'unknown') : null, avg_ms: calls ? Math.round(sum(rows, 'client', 'sum_ms') / calls) : null, max_ms: calls ? Math.max(...rows.filter(row => row.scope === 'client').map(row => row.max_ms)) : null, upstream_calls: collected ? sum(rows, 'upstream', 'calls') : null });
    }
    const details = totalRows.map(row => ({ ...row, label: labels[row.category], avg_ms: Math.round(row.sum_ms / row.calls) }));
    const report = { timezone: 'Asia/Shanghai', from, to, started_at: started ? new Date(started).toISOString() : null, retention_days: RETENTION, available_from: unique !== null ? totalRows[0].day : null, unique_devices: unique, interval_complete: days.every(row => !['未采集', '已过保留期', '起始日非全天', '今天尚未完整'].includes(row.status)), note: '使用设备数按匿名标识去重；换设备、换浏览器或清除本地数据可能重复计算。无标识请求单列，不算新设备。统计异步尽力写入，异常时可能漏记。', days, details };
    if (url.searchParams.get('format') !== 'csv') return answer(report);
    const cell = value => '"' + String(value ?? '未采集').replaceAll('"', '""') + '"';
    const lines = [ ['记录类型','日期或范围','状态或分类','使用设备数','调用次数','成功数','失败数','无标识请求','无标识缓存事件','平均耗时毫秒','最大耗时毫秒','后端上游请求次数'], ['区间去重',from+' 至 '+to,report.interval_complete?'完整区间':'部分区间或今日未完整',unique,null,null,null,null,null,null,null,null], ...days.map(row => ['每日',row.day,row.status,row.devices,row.calls,row.success,row.failure,row.unknown_requests,row.unknown_activity,row.avg_ms,row.max_ms,row.upstream_calls]), ...details.map(row => [row.scope==='client'?'小手机调用后端':row.scope==='upstream'?'后端调用上游':'本地缓存使用事件',row.day,row.label,'不适用',row.calls,row.success,row.failure,row.scope==='activity'?'不适用':row.unknown,row.scope==='activity'?row.unknown:'不适用',row.avg_ms,row.max_ms,'不适用']) ];
    return new Response('\uFEFF'+lines.map(row=>row.map(cell).join(',')).join('\r\n'),{headers:{'content-type':'text/csv; charset=utf-8','content-disposition':'attachment; filename="iris-music-statistics.csv"','cache-control':'no-store','x-content-type-options':'nosniff'}});
  }
}
