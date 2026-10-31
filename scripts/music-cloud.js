/* Iris Music cloud API client. Login tokens stay out of the exportable app state. */
(()=>{
'use strict';
const API=window.IRIS_MUSIC_API||'https://music-api.suri.us.ci';
// Negotiate with the backend before adding non-legacy request headers.
const STATS_ALLOWED=window.IRIS_MUSIC_STATISTICS!==false;
let coverProxySupported=false,guestMusicSupported=false;
let statisticsProbe=null,statisticsSupported=false,statisticsCheckedAt=0,statisticsCooldownUntil=0;
async function statisticsReady(){
 if(Date.now()<statisticsCooldownUntil)return false;
 if(statisticsCheckedAt&&Date.now()-statisticsCheckedAt<60000)return statisticsSupported;
 if(!statisticsProbe)statisticsProbe=(async()=>{let timer;try{
  const value=await Promise.race([(async()=>{const response=await fetch(API+'/stats/capabilities',{cache:'no-store',signal:AbortSignal.timeout(1200)});return response.ok?await response.json():null})(),new Promise(resolve=>timer=setTimeout(()=>resolve(null),500))]);
  guestMusicSupported=value?.protocol===1&&value?.guest_meting===true;coverProxySupported=value?.protocol===1&&value?.cover_proxy===true;statisticsSupported=STATS_ALLOWED&&value?.protocol===1&&value?.enabled===true;
 }catch{statisticsSupported=false}finally{clearTimeout(timer);statisticsCheckedAt=Date.now();statisticsProbe=null}return statisticsSupported})();
 return statisticsProbe;
}
// Anonymous statistics live outside profiles, chat state, login sessions and exports.
const DEVICE_KEY='iris-music-anonymous-device-v1',UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
let identityPromise;
function localDevice(create=false){try{const saved=localStorage.getItem(DEVICE_KEY);if(UUID.test(saved||''))return saved;if(!create||!crypto.randomUUID)return '';const id=crypto.randomUUID();localStorage.setItem(DEVICE_KEY,id);return localStorage.getItem(DEVICE_KEY)===id?id:''}catch{return ''}}
function createDevice(){const existing=localDevice();if(existing)return Promise.resolve(existing);return new Promise((resolve,reject)=>{
 const req=indexedDB.open('iris-music-statistics',1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('anonymous'))req.result.createObjectStore('anonymous')};req.onerror=()=>reject();req.onblocked=()=>reject();req.onsuccess=()=>{
  const db=req.result;let id='';const tx=db.transaction('anonymous','readwrite'),store=tx.objectStore('anonymous'),read=store.get('device');
  read.onsuccess=()=>{try{if(!UUID.test(read.result||'')&&typeof crypto.randomUUID!=='function'){tx.abort();return}id=UUID.test(read.result||'')?read.result:crypto.randomUUID();if(id!==read.result)store.put(id,'device')}catch{tx.abort()}};
  tx.oncomplete=()=>{db.close();try{localStorage.setItem(DEVICE_KEY,id)}catch{}resolve(id)};tx.onerror=tx.onabort=()=>{db.close();reject()};
 };
}).catch(()=>localDevice(true))}
async function anonymousDevice(){try{identityPromise||=createDevice();let timer;try{return await Promise.race([identityPromise,new Promise(resolve=>timer=setTimeout(()=>resolve(''),150))])}finally{clearTimeout(timer)}}catch{return ''}}
const usageSent=new Set(),usagePending=new Set(),usageEvents=new Map();
async function trackUse(action){try{
 if(!await statisticsReady())return;
 if(!['playback','playlist_cache'].includes(action))return;const day=new Date(Date.now()+28800000).toISOString().slice(0,10),key=day+':'+action;if(usageSent.has(key)||usagePending.has(key))return;usagePending.add(key);
 try{const id=await anonymousDevice();if(!crypto.randomUUID)return;if(!usageEvents.has(key))usageEvents.set(key,crypto.randomUUID());const headers={'x-iris-music-event':usageEvents.get(key),'x-iris-music-action':action,...(id?{'x-iris-music-device':id}:{})};const response=await fetch(API+'/stats/activity',{method:'POST',headers,signal:AbortSignal.timeout(3500),keepalive:true});if(response.ok)usageSent.add(key)}finally{usagePending.delete(key)}
}catch{} }
let dbPromise;
function openDb(){if(dbPromise)return dbPromise;dbPromise=new Promise((resolve,reject)=>{const req=indexedDB.open('iris-music-auth',1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('sessions'))req.result.createObjectStore('sessions')};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||Error('无法打开网易云登录存储'))});dbPromise.catch(()=>dbPromise=null);return dbPromise}
async function storage(action,userId,value){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction('sessions',action==='get'?'readonly':'readwrite'),store=tx.objectStore('sessions');let result;const req=action==='get'?store.get(userId):action==='put'?store.put(value,userId):store.delete(userId);req.onsuccess=()=>result=req.result;tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error||Error('网易云登录信息保存失败'));tx.onabort=()=>reject(tx.error||Error('网易云登录信息保存失败'))})}
const getToken=userId=>storage('get',userId);
const saveToken=(userId,token)=>storage('put',userId,token);
async function request(path,{token,method='GET',body,signal}={}){
 const anonymousId=await statisticsReady()?await anonymousDevice():'';
 const originalHeaders={...(token?{Authorization:'Bearer '+token}:{}),...(body?{'Content-Type':'application/json'}:{})},options={method,signal,headers:{...originalHeaders,...(anonymousId?{'x-iris-music-device':anonymousId}:{})},...(body?{body:JSON.stringify(body)}:{})};
 let response;try{response=await fetch(API+path,options)}catch(error){
  // Retry only safe reads without the optional analytics header. Never retry an aborted request or a write.
  if(!anonymousId||method!=='GET'||signal?.aborted||error?.name!=='TypeError')throw error;
  statisticsSupported=false;statisticsCooldownUntil=Date.now()+300000;response=await fetch(API+path,{...options,headers:originalHeaders});
 }
 let data={};try{data=await response.json()}catch{}if(!response.ok){const error=Error(data.error||'音乐服务请求失败（'+response.status+'）');error.status=response.status;error.code=data.code;throw error}return data;
}
const startQr=()=>request('/auth/qr/start');
const pollQr=id=>request('/auth/qr/poll?id='+encodeURIComponent(id));
const me=token=>request('/auth/me',{token});
const playlists=token=>request('/user/playlists',{token});
const playlist=(id,token)=>request('/playlist?id='+encodeURIComponent(id),{token});
const search=(query,token='')=>request('/search?q='+encodeURIComponent(String(query||'').trim()),{token});
const resolve=(title,artist='',token='')=>request('/resolve?title='+encodeURIComponent(String(title||''))+'&artist='+encodeURIComponent(String(artist||'')),{token});
const song=(id,token='',{metadataOnly=false}={})=>request('/song?id='+encodeURIComponent(id)+(metadataOnly?'&metadata=1':''),{token});
async function logout(userId,token){try{if(token)await request('/auth/logout',{token,method:'POST'})}finally{await storage('delete',userId)}}
function coverUrl(value){const source=String(value||'');if(/^(data:image\/|blob:)/i.test(source))return source;try{const url=new URL(source);if(url.protocol==='http:')url.protocol='https:';if(!['http:','https:'].includes(url.protocol))return '';return coverProxySupported&&(/^p[1-9]\.music\.126\.net$/i.test(url.hostname)||(['api.qijieya.cn','api.i-meto.com','api.injahow.cn','api.amarea.cn','api.moeyao.cn'].includes(url.hostname)&&url.searchParams.get('server')==='netease'&&url.searchParams.get('type')==='pic'))?API+'/cover?url='+encodeURIComponent(url.href):url.href}catch{return source}}
window.IrisMusicCloud={API,guestMusicEnabled:()=>guestMusicSupported,coverUrl,anonymousDevice,trackUse,getToken,saveToken,request,startQr,pollQr,me,playlists,playlist,search,resolve,song,logout};
})();
