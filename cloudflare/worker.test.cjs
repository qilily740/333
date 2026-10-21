const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {createCipheriv,createHash,createDecipheriv,webcrypto}=require('node:crypto');
const source=fs.readFileSync(require('node:path').join(__dirname,'worker.js'),'utf8').replace(/^import[^\n]+\n/,'').replace('export default {','globalThis.worker = {');
function fixture(handler){
 const calls=[],store=new Map(),env={SESSION_ENCRYPTION_KEY:Buffer.alloc(32,7).toString('base64'),MUSIC_STORE:{get:async key=>store.get(key),put:async(key,value)=>store.set(key,value),delete:async key=>store.delete(key)}};
 const context=vm.createContext({createCipheriv,createHash,crypto:webcrypto,TextEncoder,TextDecoder,URLSearchParams,URL,Request,Response,Headers,AbortSignal,btoa,atob,console,fetch:async(url,options={})=>{
  let payload={},path=new URL(url).pathname;
  if(options.body){const params=new URLSearchParams(options.body).get('params');const decipher=createDecipheriv('aes-128-ecb',Buffer.from('e82ckenh8dichen8'),null);const plain=decipher.update(params,'hex','utf8')+decipher.final('utf8');const pieces=plain.split('-36cd479b6b5-');path=pieces[0];payload=JSON.parse(pieces[1]);}
  const call={path,payload,url,options};calls.push(call);const data=await handler(call);return Response.json(data);
 }});
 vm.runInContext(source,context);
 return {calls,env,context,async session(){const token=await context.saveSession(env,'MUSIC_U=secret; deviceId=original-device');return token},async request(path,token){const response=await context.worker.fetch(new Request('https://music.test'+path,{headers:token?{authorization:'Bearer '+token}:{}}),env);return {status:response.status,data:await response.json()}}};
}
const song=id=>({id,name:'歌曲'+id,ar:[{name:'歌手'}],al:{name:'专辑',picUrl:'http://img.test/'+id+'.jpg'},dt:180000});
test('old result wrapper remains readable when the v6 endpoint is unavailable',async()=>{
 const f=fixture(({path})=>path==='/api/v6/playlist/detail'?{code:500,message:'接口暂不可用'}:{code:200,result:{id:12,name:'旧歌单',trackCount:1,tracks:[song(3)]}});
 const r=await f.request('/playlist?id=12');assert.equal(r.status,200);assert.equal(r.data.playlist.name,'旧歌单');assert.equal(r.data.playlist.tracks[0].name,'歌曲3');assert.equal(r.data.playlist.tracks[0].cover,'https://img.test/3.jpg');
});
test('all track IDs beyond 1000 are hydrated in bounded batches and retain original order',async()=>{
 const ids=Array.from({length:1202},(_,i)=>({id:i+1}));
 const f=fixture(({path,payload})=>{
  if(path==='/api/v6/playlist/detail')return{code:200,playlist:{id:12,name:'完整歌单',trackCount:1202,trackIds:ids,tracks:[song(1)]}};
  assert.equal(path,'/api/v3/song/detail');return{code:200,songs:JSON.parse(payload.c).map(({id})=>song(Number(id))).reverse()};
 });
 const r=await f.request('/playlist?id=12');assert.equal(r.status,200);assert.equal(r.data.playlist.tracks.length,1202);assert.equal(r.data.playlist.unavailableTrackCount,0);assert.deepEqual(r.data.playlist.tracks.map(s=>s.id),ids.map(s=>String(s.id)));const batches=f.calls.filter(c=>c.path==='/api/v3/song/detail');assert.equal(batches.length,3);assert.ok(batches.every(c=>JSON.parse(c.payload.c).length<=500));
});
test('private playlist and song metadata use the same authenticated account',async()=>{
 const f=fixture(({path,payload,options})=>{assert.match(options.headers.cookie,/MUSIC_U=secret/);assert.equal(payload.header.deviceId,'original-device');if(path==='/api/v6/playlist/detail')return{data:{code:200,playlist:{id:12,trackCount:1,trackIds:[{id:7}],tracks:[]}}};return{data:{code:200,songs:[song(7)]}}});
 const r=await f.request('/playlist?id=12',await f.session());assert.equal(r.status,200);assert.equal(r.data.playlist.tracks[0].id,'7');
});
test('invalid Iris sessions cannot silently fall back to guest access',async()=>{const f=fixture(()=>{throw Error('must not fetch')});const r=await f.request('/playlist?id=12','expired');assert.equal(r.status,401);assert.equal(f.calls.length,0)});
test('permission errors retain their reason and do not claim that a playlist is missing',async()=>{const f=fixture(()=>({code:403,message:'这是私密歌单'}));const r=await f.request('/playlist?id=12');assert.equal(r.status,403);assert.equal(r.data.error,'这是私密歌单');assert.equal(f.calls.length,1)});
test('failed metadata batches fail the read rather than cache a partial success',async()=>{const f=fixture(({path})=>path==='/api/v6/playlist/detail'?{code:200,playlist:{id:12,tracks:[song(1)],trackIds:[{id:1},{id:2}],trackCount:2}}:{code:500,message:'歌曲服务维护'});const r=await f.request('/playlist?id=12');assert.equal(r.status,502);assert.equal(r.data.error,'歌曲服务维护');assert.equal(r.data.playlist,undefined)});
test('deleted songs are counted without replacing them with invented metadata',async()=>{const f=fixture(({path})=>path==='/api/v6/playlist/detail'?{code:200,playlist:{id:12,tracks:[song(1)],trackIds:[{id:1},{id:2}],trackCount:2}}:{code:200,songs:[]});const r=await f.request('/playlist?id=12');assert.equal(r.status,200);assert.equal(r.data.playlist.tracks.length,1);assert.equal(r.data.playlist.unavailableTrackCount,1)});
test('empty playlists remain valid',async()=>{const f=fixture(()=>({code:200,playlist:{id:12,tracks:[],trackIds:[],trackCount:0}}));const r=await f.request('/playlist?id=12');assert.equal(r.status,200);assert.deepEqual(r.data.playlist.tracks,[])});
test('playlist synchronization reads every page, deduplicates and keeps account credentials',async()=>{
 const offsets=[];const f=fixture(({path,payload,options})=>{assert.match(options.headers.cookie,/MUSIC_U=secret/);if(path==='/api/w/nuser/account/get')return{code:200,profile:{userId:9,nickname:'用户'}};assert.equal(path,'/api/user/playlist');offsets.push(payload.offset);return payload.offset===0?{code:200,more:true,playlist:[{id:12,name:'自建',userId:9},{id:13,name:'收藏'}]}:{code:200,more:false,playlist:[{id:13,name:'收藏'},{id:14,name:'更多'}]}});
 const r=await f.request('/user/playlists',await f.session());assert.equal(r.status,200);assert.deepEqual(offsets,[0,2]);assert.deepEqual(r.data.playlists.map(p=>p.id),['12','13','14']);assert.equal(r.data.playlists[0].owned,true);
});
test('failed list reads do not replace the synced library with an empty success',async()=>{const f=fixture(({path})=>path==='/api/w/nuser/account/get'?{code:200,profile:{userId:9}}:{code:301});const r=await f.request('/user/playlists',await f.session());assert.equal(r.status,401);assert.equal(r.data.playlists,undefined)});
