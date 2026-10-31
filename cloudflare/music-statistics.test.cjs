const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {DatabaseSync}=require('node:sqlite');
const cryptoNode=require('node:crypto'),{AsyncLocalStorage}=require('node:async_hooks');
const firstDevice='11111111-1111-4111-8111-111111111111',secondDevice='22222222-2222-4222-8222-222222222222';
function fixture(){
 let now=Date.parse('2026-10-30T15:59:59Z'),alarm=null,dropAck=false,failWrites=false,upstreamFail=false;
 const db=new DatabaseSync(':memory:'),writes=[],external=[],jobs=[],kv=new Map([['existing-key','keep-me']]);
 class Clock extends Date{constructor(...args){super(...(args.length?args:[now]))}static now(){return now}}
 const storage={sql:{exec(sql,...args){if(failWrites&&sql.startsWith('INSERT INTO totals'))throw Error('test storage unavailable');if(sql.includes('CREATE TABLE')){db.exec(sql);return{toArray:()=>[]}}const rows=db.prepare(sql).all(...args);return{toArray:()=>rows}}},transactionSync(fn){db.exec('BEGIN IMMEDIATE');try{const result=fn();db.exec('COMMIT');return result}catch(error){db.exec('ROLLBACK');throw error}},getAlarm:async()=>alarm,setAlarm:async value=>alarm=value};
 const context=vm.createContext({AsyncLocalStorage,...cryptoNode,crypto:cryptoNode.webcrypto,TextEncoder,TextDecoder,Request,Response,Headers,URL,URLSearchParams,AbortSignal,btoa,atob,performance,Date:Clock,console:{warn(){}},fetch:async(url,options)=>{external.push({url,options});if(upstreamFail)throw Error('network unavailable');const name=new URL(url).pathname;return Response.json(name.includes('cloudsearch')?{code:200,result:{songs:[{id:1,name:'测试歌曲',artists:[{name:'测试歌手'}]}]}}:name.includes('lyric')?{code:200,lrc:{lyric:'[00:00]歌词'}}:{code:200,songs:[{id:1,name:'歌曲',ar:[{name:'歌手'}],al:{},dt:10000}]})}});
 const read=file=>fs.readFileSync(path.join(__dirname,file),'utf8').replace(/^import[^\n]+\n/gm,'').replace(/^export \{ MusicStatistics \};\n/m,'').replace(/export default \{/,'globalThis.worker = {').replace(/export /g,'');
 vm.runInContext(read('statistics-page.js')+'\n'+read('music-statistics.js')+'\nglobalThis.statisticsClass=MusicStatistics;',context);
 const actor=new context.statisticsClass({storage});
 const env={MUSIC_STATS_ENABLED:'true',MUSIC_STATS_HASH_KEY:'test-only-hash-key-'.repeat(3),MUSIC_STATS_ADMIN_TOKEN:'test-only-admin-token-'.repeat(3),SESSION_ENCRYPTION_KEY:Buffer.alloc(32,8).toString('base64'),MUSIC_STORE:{get:async key=>kv.get(key),put:async(key,value)=>kv.set(key,value),delete:async key=>kv.delete(key)}};
 const stub={fetch:async(url,options)=>{if(options?.body)writes.push(JSON.parse(options.body));const response=await actor.fetch(new Request(url,options));if(dropAck){dropAck=false;throw Error('acknowledgement lost after commit')}return response}};env.MUSIC_STATS={idFromName:name=>name,get:()=>stub};
 vm.runInContext(read('worker.js'),context);
 async function flush(){while(jobs.length)await Promise.all(jobs.splice(0))}
 async function request(route,{id=firstDevice,method='GET',headers={}}={}){const response=await context.worker.fetch(new Request('https://music.test'+route,{method,headers:{...(id?{'x-iris-music-device':id}:{}),...headers}}),env,{waitUntil:job=>jobs.push(job)});await flush();return response}
 async function report(from='2026-10-30',to='2026-10-31'){return(await request('/admin/music-statistics/report?from='+from+'&to='+to,{headers:{authorization:'Bearer '+env.MUSIC_STATS_ADMIN_TOKEN}})).json()}
 return{env,db,actor,context,writes,external,kv,request,report,flush,close:()=>db.close(),time:value=>now=Date.parse(value),dropAck:()=>dropAck=true,fail:value=>failWrites=value,upstreamFail:value=>upstreamFail=value};
}
test('same device repeats count calls, interval devices deduplicate across Beijing midnight and unknown identifiers stay separate',async()=>{
 const f=fixture();try{
  await f.request('/search?q=test');await f.request('/search?q=test');f.time('2026-10-30T16:00:00Z');await f.request('/song?id=1&metadata=1');await f.request('/search?q=test',{id:secondDevice});await f.request('/search?q=test',{id:null});await f.request('/search?q=test',{id:'fingerprint-or-email'});
  const r=await f.report();assert.equal(r.days[0].day,'2026-10-30');assert.equal(r.days[0].devices,1);assert.equal(r.days[0].calls,2);assert.equal(r.days[1].devices,2);assert.equal(r.days[1].calls,4);assert.equal(r.days[1].unknown_requests,2);assert.equal(r.unique_devices,2);assert.equal(r.days[1].status,'今天尚未完整');assert.equal(r.details.filter(x=>x.scope==='upstream').reduce((n,x)=>n+x.calls,0),7);assert.ok(r.days[0].avg_ms>=0);assert.ok(r.days[0].max_ms>=r.days[0].avg_ms);
  assert.deepEqual([...f.kv],[['existing-key','keep-me']]);const saved=JSON.stringify(f.writes);assert.ok(!saved.includes(firstDevice));assert.ok(!saved.includes('q=test'));assert.ok(!saved.includes('test-only-admin'));
 }finally{f.close()}
});
test('concurrent requests, lost acknowledgements and storage transactions never overwrite or double count accepted events',async()=>{
 const f=fixture();try{
  f.dropAck();await f.request('/search?q=first');await Promise.all(Array.from({length:75},()=>f.request('/search?q=repeat')));let r=await f.report('2026-10-30','2026-10-30');assert.equal(r.days[0].calls,76);assert.equal(r.unique_devices,1);assert.equal(f.writes[0].id,f.writes[1].id);
  f.fail(true);const response=await f.request('/search?q=still-works');assert.equal(response.status,200);f.fail(false);r=await f.report('2026-10-30','2026-10-30');assert.equal(r.days[0].calls,76);assert.equal(f.db.prepare('SELECT COUNT(*) AS n FROM seen').get().n,76);
 }finally{f.close()}
});
test('client retries count as new calls; upstream failures and internal resolve recursion have separate scopes',async()=>{
 const f=fixture();try{
  f.upstreamFail(true);assert.equal((await f.request('/search?q=try')).status,502);f.upstreamFail(false);await f.request('/search?q=try');await f.request('/resolve?title='+encodeURIComponent('测试歌曲')+'&artist='+encodeURIComponent('测试歌手'));
  const r=await f.report('2026-10-30','2026-10-30');assert.equal(r.days[0].calls,3);assert.equal(r.days[0].failure,1);assert.equal(r.unique_devices,1);assert.equal(r.details.find(x=>x.scope==='upstream'&&x.category==='search').failure,1);assert.equal(r.details.filter(x=>x.scope==='client').length,2);
 }finally{f.close()}
});
test('cache use records devices without inventing backend or upstream calls and duplicate reports are idempotent',async()=>{
 const f=fixture();try{
  const options={method:'POST',headers:{'x-iris-music-event':'33333333-3333-4333-8333-333333333333','x-iris-music-action':'playback'}};
  await Promise.all(Array.from({length:10},()=>f.request('/stats/activity',options)));const r=await f.report('2026-10-30','2026-10-30');assert.equal(r.unique_devices,1);assert.equal(r.days[0].calls,0);assert.equal(r.days[0].upstream_calls,0);assert.equal(r.details[0].scope,'activity');assert.equal(r.details[0].calls,1);assert.equal(f.external.length,0);
 }finally{f.close()}
});
test('OPTIONS, health, feedback and administrator queries never enter music totals; secrets are never query parameters',async()=>{
 const f=fixture();try{
  assert.equal((await f.request('/search',{method:'OPTIONS'})).status,204);assert.equal((await f.request('/health')).status,200);
  for(const route of ['/admin/music-statistics','/admin/music-statistics/report','/admin/music-statistics/export.csv']){assert.equal((await f.request(route)).status,401);assert.equal((await f.request(route,{headers:{authorization:'Bearer '+firstDevice}})).status,401);assert.equal((await f.request(route+'?token='+f.env.MUSIC_STATS_ADMIN_TOKEN)).status,401)}
  const page=await f.request('/admin/music-statistics',{headers:{authorization:'Basic '+btoa('admin:'+f.env.MUSIC_STATS_ADMIN_TOKEN)}});assert.equal(page.status,200);assert.equal(page.headers.get('access-control-allow-origin'),null);assert.ok(!(await page.text()).includes(f.env.MUSIC_STATS_ADMIN_TOKEN));assert.equal(f.writes.length,0);
  const r=await f.report('2026-10-29','2026-10-30');assert.equal(r.unique_devices,null);assert.ok(r.days.every(x=>x.status==='未采集'&&x.calls===null));
 }finally{f.close()}
});
test('CSV, date validation and 90-day retention preserve uncollected history as unknown',async()=>{
 const f=fixture();try{
  await f.request('/search?q=test');const auth={authorization:'Bearer '+f.env.MUSIC_STATS_ADMIN_TOKEN};
  const csv=await f.request('/admin/music-statistics/export.csv?from=2026-10-29&to=2026-10-30',{headers:auth});assert.match(await csv.text(),/区间去重.*\r\n/);assert.equal(csv.headers.get('access-control-allow-origin'),null);
  for(const range of ['from=2026-02-30&to=2026-10-30','from=2026-10-31&to=2026-10-30','from=2026-10-30&to=2027-10-30'])assert.equal((await f.request('/admin/music-statistics/report?'+range,{headers:auth})).status,400);
  f.time('2027-02-01T00:00:00Z');await f.actor.alarm();assert.equal(f.db.prepare('SELECT COUNT(*) AS n FROM devices').get().n,0);assert.equal(f.db.prepare('SELECT COUNT(*) AS n FROM seen').get().n,0);const r=await f.report('2026-10-29','2026-10-30');assert.equal(r.days[0].status,'未采集');assert.equal(r.days[1].status,'已过保留期');assert.equal(r.days[1].calls,null);
 }finally{f.close()}
});
test('statistics are disabled by default and arbitrary IDs cannot authorize queries',async()=>{
 const f=fixture();try{delete f.env.MUSIC_STATS_ENABLED;await f.request('/search?q=music');assert.equal(f.writes.length,0);assert.equal((await f.request('/admin/music-statistics/report',{headers:{authorization:'Bearer '+f.env.MUSIC_STATS_ADMIN_TOKEN}})).status,503)}finally{f.close()}
});
test('a backend response returned directly from cache still records requests and devices without upstream calls',async()=>{
 const f=fixture();try{
  f.context.route=async()=>Response.json({songs:[],cached:true});await f.request('/search?q=cached');await f.request('/search?q=cached');const r=await f.report('2026-10-30','2026-10-30');assert.equal(r.days[0].calls,2);assert.equal(r.days[0].success,2);assert.equal(r.unique_devices,1);assert.equal(r.days[0].upstream_calls,0);assert.equal(f.external.length,0);
 }finally{f.close()}
});
