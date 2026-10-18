/* Iris Music cloud API client. Login tokens stay out of the exportable app state. */
(()=>{
'use strict';
const API=window.IRIS_MUSIC_API||'https://music-api.suri.us.ci';
let dbPromise;
function openDb(){if(dbPromise)return dbPromise;dbPromise=new Promise((resolve,reject)=>{const req=indexedDB.open('iris-music-auth',1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('sessions'))req.result.createObjectStore('sessions')};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||Error('无法打开网易云登录存储'))});dbPromise.catch(()=>dbPromise=null);return dbPromise}
async function storage(action,userId,value){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction('sessions',action==='get'?'readonly':'readwrite'),store=tx.objectStore('sessions');let result;const req=action==='get'?store.get(userId):action==='put'?store.put(value,userId):store.delete(userId);req.onsuccess=()=>result=req.result;tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error||Error('网易云登录信息保存失败'));tx.onabort=()=>reject(tx.error||Error('网易云登录信息保存失败'))})}
const getToken=userId=>storage('get',userId);
const saveToken=(userId,token)=>storage('put',userId,token);
async function request(path,{token,method='GET',body,signal}={}){const response=await fetch(API+path,{method,signal,headers:{...(token?{Authorization:'Bearer '+token}:{}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});let data={};try{data=await response.json()}catch{}if(!response.ok){const error=Error(data.error||'音乐服务请求失败（'+response.status+'）');error.status=response.status;error.code=data.code;throw error}return data}
const startQr=()=>request('/auth/qr/start');
const pollQr=id=>request('/auth/qr/poll?id='+encodeURIComponent(id));
const me=token=>request('/auth/me',{token});
const playlists=token=>request('/user/playlists',{token});
const playlist=(id,token)=>request('/playlist?id='+encodeURIComponent(id),{token});
const search=query=>request('/search?q='+encodeURIComponent(String(query||'').trim()));
const resolve=(title,artist='',token='')=>request('/resolve?title='+encodeURIComponent(String(title||''))+'&artist='+encodeURIComponent(String(artist||'')),{token});
const song=(id,token='',{metadataOnly=false}={})=>request('/song?id='+encodeURIComponent(id)+(metadataOnly?'&metadata=1':''),{token});
async function logout(userId,token){try{if(token)await request('/auth/logout',{token,method:'POST'})}finally{await storage('delete',userId)}}
window.IrisMusicCloud={API,getToken,saveToken,request,startQr,pollQr,me,playlists,playlist,search,resolve,song,logout};
})();
