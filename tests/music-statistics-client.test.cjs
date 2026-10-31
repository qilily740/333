const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),{webcrypto}=require('node:crypto');
const {IDBFactory}=require('fake-indexeddb');
const code=fs.readFileSync(require.resolve('../scripts/music-cloud.js'),'utf8');
function browser({statistics=true,capability=true,rejectHeader=false,factory=new IDBFactory(),local=new Map(),blocked=false,noIdb=false,clock={now:Date.parse('2026-10-30T15:59:59Z')}}={}){
 const calls=[],probes=[];let broken=false;class Clock extends Date{constructor(...args){super(...(args.length?args:[clock.now]))}static now(){return clock.now}}
 const context=vm.createContext({window:{IRIS_MUSIC_API:'https://music.test',IRIS_MUSIC_STATISTICS:statistics==='unset'?undefined:statistics},Date:Clock,indexedDB:noIdb?undefined:factory,localStorage:{getItem:key=>{if(blocked)throw Error('denied');return local.get(key)||null},setItem:(key,value)=>{if(blocked)throw Error('denied');local.set(key,value)}},crypto:webcrypto,URL,AbortSignal,Promise,setTimeout,clearTimeout,fetch:async(url,options)=>{if(url.endsWith('/stats/capabilities')){probes.push({url,options});if(broken)throw Error('test probe unavailable');return capability?Response.json({protocol:1,enabled:true,cover_proxy:true}):new Response('Not found',{status:404})}calls.push({url,options});if(rejectHeader&&options.headers['x-iris-music-device'])throw new TypeError('Failed to fetch');if(broken)throw Error('test network unavailable');return Response.json({songs:[]})}});vm.runInContext(code,context);return{api:context.window.IrisMusicCloud,calls,probes,clock,local,factory,fail:value=>broken=value};
}
test('simultaneous first use in two tabs shares one anonymous ID and identity persists on reload',async()=>{
 const factory=new IDBFactory(),local=new Map(),a=browser({factory,local}),b=browser({factory,local});await Promise.all([a.api.search('A'),b.api.search('B')]);
 const id=a.calls[0].options.headers['x-iris-music-device'];assert.match(id,/^[0-9a-f-]{36}$/);assert.equal(b.calls[0].options.headers['x-iris-music-device'],id);const reload=browser({factory,local});await reload.api.song(1);assert.equal(reload.calls[0].options.headers['x-iris-music-device'],id);assert.ok(!a.calls[0].url.includes(id));assert.equal(local.size,1);
});
test('storage denial uses no fabricated per-request identity and never blocks ordinary music requests',async()=>{
 const f=browser({blocked:true,noIdb:true});await f.api.search('song');await f.api.search('song');assert.equal(f.calls.length,2);assert.ok(f.calls.every(call=>!call.options.headers['x-iris-music-device']));
});
test('local cached use sends at most one event per action/day, no song or user details and survives Beijing midnight',async()=>{
 const f=browser();await Promise.all(Array.from({length:20},()=>f.api.trackUse('playback')));assert.equal(f.calls.length,1);assert.equal(f.calls[0].url,'https://music.test/stats/activity');assert.equal(f.calls[0].options.body,undefined);assert.ok(f.calls[0].options.headers['x-iris-music-event']);await f.api.trackUse('playback');assert.equal(f.calls.length,1);f.clock.now=Date.parse('2026-10-30T16:00:00Z');await f.api.trackUse('playback');assert.equal(f.calls.length,2);assert.equal(f.calls[1].options.headers['x-iris-music-device'],f.calls[0].options.headers['x-iris-music-device']);await f.api.trackUse('not-a-real-music-action');assert.equal(f.calls.length,2);
});
test('retained login request headers and format are unchanged apart from the independent statistics header',async()=>{
 const f=browser();await f.api.request('/playlist?id=1',{token:'test-session'});const call=f.calls[0];assert.equal(call.options.headers.Authorization,'Bearer test-session');assert.equal(call.options.method,'GET');assert.equal(call.options.body,undefined);assert.equal([...f.local.values()].includes('test-session'),false);
});
test('an ambiguous cache-use retry retains its event ID and statistics network errors are swallowed',async()=>{
 const f=browser();await f.api.request('/health');f.calls.length=0;f.fail(true);await f.api.trackUse('playback');assert.equal(f.calls.length,1);f.fail(false);await f.api.trackUse('playback');assert.equal(f.calls.length,2);assert.equal(f.calls[0].options.headers['x-iris-music-event'],f.calls[1].options.headers['x-iris-music-event']);
});
test('an older backend remains compatible with the old production CORS policy and emits no statistics traffic',async()=>{
 const f=browser({statistics:'unset',capability:false});await f.api.song(1);await f.api.search('歌曲');await f.api.trackUse('playback');assert.equal(f.calls.length,2);assert.ok(f.calls.every(call=>!call.options.headers['x-iris-music-device']));assert.equal(f.local.size,0);assert.ok(f.calls.every(call=>!call.url.includes('/stats/')));
});
test('a statistics-capable backend can return covers and playback URLs with anonymous statistics enabled',async()=>{
 const f=browser({statistics:'unset'});await f.api.song(1);assert.match(f.calls[0].options.headers['x-iris-music-device'],/^[a-f0-9-]{36}$/);assert.equal(f.probes.length,1);assert.equal(f.probes[0].options.headers,undefined);await f.api.search('歌曲');assert.equal(f.probes.length,1);assert.equal(f.calls[1].options.headers['x-iris-music-device'],f.calls[0].options.headers['x-iris-music-device']);
});
test('a stale or mistaken capability response cannot block safe music reads on a legacy CORS backend',async()=>{
 const f=browser({rejectHeader:true});await f.api.song(1);assert.equal(f.calls.length,2);assert.ok(f.calls[0].options.headers['x-iris-music-device']);assert.equal(f.calls[1].options.headers['x-iris-music-device'],undefined);await f.api.search('歌曲');assert.equal(f.calls.length,3);assert.equal(f.calls[2].options.headers['x-iris-music-device'],undefined);assert.equal(f.probes.length,1);
});
test('cover proxy is negotiated independently of statistics and legacy covers are always HTTPS',async()=>{
 const modern=browser();await modern.api.search('歌曲');assert.match(modern.api.coverUrl('http://p3.music.126.net/abcdef12345/123456789.jpg'),/^https:\/\/music.test\/cover\?url=https/);assert.equal(modern.api.coverUrl('https://other.test/cover.jpg'),'https://other.test/cover.jpg');assert.equal(modern.api.coverUrl('data:image/png;base64,AAAA'),'data:image/png;base64,AAAA');assert.equal(modern.api.coverUrl('blob:http://localhost/image'),'blob:http://localhost/image');assert.equal(modern.api.coverUrl('assets/local-cover.png'),'assets/local-cover.png');const legacy=browser({capability:false});await legacy.api.search('歌曲');assert.equal(legacy.api.coverUrl('http://p3.music.126.net/abcdef12345/123456789.jpg'),'https://p3.music.126.net/abcdef12345/123456789.jpg');
});
