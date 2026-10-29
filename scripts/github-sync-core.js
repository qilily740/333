(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./github-archive.js'):root.IrisGitHubArchive);if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.IrisGitHubSyncCore=api})(typeof globalThis==='object'?globalThis:null,function(createArchive){
'use strict';
const PREFIX='iris-sync',LATEST=PREFIX+'/latest.json',CHUNK_SIZE=512*1024,MAX_BYTES=512*1024*1024,MAX_SINGLE=90*1024*1024,ITERATIONS=210000;
const encoder=()=>new TextEncoder(),decoder=()=>new TextDecoder('utf-8',{fatal:true});
function cryptoApi(){if(!globalThis.crypto?.subtle)throw Error('请通过 HTTPS 或 localhost 打开 Iris，才能校验和加密备份。');return globalThis.crypto}
function base64(bytes){if(typeof Buffer!=='undefined')return Buffer.from(bytes).toString('base64');let text='';for(let i=0;i<bytes.length;i+=32768)text+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(text)}
function unbase64(value){if(typeof value!=='string'||!/^[A-Za-z0-9+/=\s]*$/.test(value))throw Error('仓库备份编码无效。');const clean=value.replace(/\s/g,'');if(typeof Buffer!=='undefined')return new Uint8Array(Buffer.from(clean,'base64'));return Uint8Array.from(atob(clean),char=>char.charCodeAt(0))}
async function hash(bytes){return Array.from(new Uint8Array(await cryptoApi().subtle.digest('SHA-256',bytes)),byte=>byte.toString(16).padStart(2,'0')).join('')}
function parseRepo(value){const text=String(value||'').trim().replace(/^https:\/\/github\.com\//i,'').replace(/\.git\/?$/,'').replace(/\/$/,'');if(!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(text)||text.split('/').some(part=>part==='.'||part==='..'))throw Error('仓库请填写“用户名/仓库名”，也可以粘贴 GitHub 仓库地址。');return text}
function configOf(config){const repo=parseRepo(config.repo),token=String(config.token||'').trim(),branch=String(config.branch||'').trim();if(!token)throw Error('请先填写 GitHub Token。');if(/[\r\n\s]/.test(token))throw Error('Token 中不能包含空格或换行。');if(branch&&(/[\x00-\x20~^:?*\[\\]/.test(branch)||branch.includes('..')||branch.startsWith('-')))throw Error('分支名称无效。');return{...config,repo,token,branch}}
function httpError(status,detail,config,method,path){
 const labels=status===401?'GitHub 未接受本次请求的 Token（401），请核对本机保存的 Token。':status===403?'GitHub 拒绝访问：请检查 Token 的仓库内容读写权限，或稍后重试。':status===404?'找不到仓库或分支，请检查名称及 Token 授权范围。':status===409||status===422?'仓库内容已变化或写入被拒绝，请重新测试连接后再试。':`GitHub 请求失败（${status}）。`;
 let reason=typeof detail?.message==='string'?detail.message:'';for(const secret of [config.token,config.password])if(secret)reason=reason.split(secret).join('[已隐藏]');reason=reason.replace(/[A-Za-z0-9+/=]{80,}/g,'[已隐藏]').replace(/[\x00-\x1f\x7f]/g,' ').replace(/\s+/g,' ').slice(0,350);
 const fields=Array.isArray(detail?.errors)?detail.errors.filter(item=>item&&typeof item==='object').map(item=>[item.field,item.code].filter(value=>typeof value==='string'&&/^[A-Za-z0-9_.-]{1,60}$/.test(value)).join(':')).filter(Boolean).join('，'):'';
 const operation=path==='/user/repos'?'创建私有仓库':path.includes('/releases/')&&method==='POST'?'上传备份附件':path==='/releases'&&method==='POST'?'准备备份存储':method==='PATCH'?'确认备份存储':method==='PUT'?(path.endsWith('/latest.json')?'发布最新备份':'上传备份文件'):path.includes('/contents/')?'读取云端备份':'连接仓库';
 const error=Error(labels+' ['+operation+']'+(reason?' GitHub 原因：'+reason:'')+(fields?'（'+fields+'）':''));error.status=status;error.operation=operation;return error;
}
function transferTimeout(method,body){const bytes=body instanceof Uint8Array?body.byteLength:typeof Blob==='function'&&body instanceof Blob?body.size:typeof body?.content==='string'?Math.ceil(body.content.length*3/4):0;return ['PUT','POST'].includes(method)?Math.min(900000,Math.max(180000,Math.ceil(bytes/1048576)*45000)):45000}
function sendWithProgress(url,options,factory,onTransfer){return new Promise((resolve,reject)=>{
 const xhr=factory();let settled=false;
 const finish=(error,value)=>{if(settled)return;settled=true;options.signal?.removeEventListener('abort',abort);error?reject(error):resolve(value)};
 const abort=()=>{xhr.abort();finish(Object.assign(Error('Upload aborted'),{name:'AbortError'}))};
 xhr.open(options.method,url,true);for(const [name,value] of Object.entries(options.headers))xhr.setRequestHeader(name,value);
 xhr.upload.onprogress=event=>onTransfer({loaded:event.loaded,total:event.lengthComputable?event.total:0,sent:false});
 xhr.upload.onload=()=>onTransfer({sent:true});
 xhr.onload=()=>{const text=xhr.responseText;finish(null,{ok:xhr.status>=200&&xhr.status<300,status:xhr.status,text:async()=>text,json:async()=>JSON.parse(text)})};
 xhr.onerror=()=>finish(TypeError('Upload network error'));xhr.onabort=()=>finish(Object.assign(Error('Upload aborted'),{name:'AbortError'}));
 options.signal?.addEventListener('abort',abort,{once:true});if(options.signal?.aborted){abort();return}xhr.send(options.body);
})}
async function request(config,path,{method='GET',body,missing=false,raw=false,timeoutMs,onProgress,xhrFactory,preferFetch=false,accountPath=false,binary=false,uploadHost=false,accept,fetcher=globalThis.fetch}={}){
 const url=(uploadHost?'https://uploads.github.com':'https://api.github.com')+(accountPath?'':'/repos/'+config.repo.split('/').map(encodeURIComponent).join('/'))+path,payload=binary?body:body?JSON.stringify(body):undefined,sending=method==='PUT'||binary;
 const waitMs=Number.isFinite(timeoutMs)&&timeoutMs>0?timeoutMs:transferTimeout(method,body),controller=typeof AbortController==='function'?new AbortController():null,timer=controller?setTimeout(()=>controller.abort(),waitMs):null,started=Date.now();
 let transfer={loaded:0,total:0,sent:false};const publishing=path.endsWith('/latest.json'),fileMB=((binary?(body?.byteLength??body?.size??0):(body?.content?.length||0)*3/4)/1048576).toFixed(2),nativeUpload=sending&&!preferFetch&&(xhrFactory||fetcher===globalThis.fetch&&typeof XMLHttpRequest==='function');
 const report=()=>{if(!onProgress)return;const phase=publishing?'发布最新备份':(binary?'发送备份附件 ':'发送备份文件 ')+fileMB+' MB',seconds=Math.round((Date.now()-started)/1000);onProgress(phase+' · '+(transfer.sent?'文件已发送，等待 GitHub 保存确认':transfer.total?'已发送 '+Math.min(100,Math.floor(transfer.loaded/transfer.total*100))+'%':nativeUpload?'正在建立上传连接':'请求进行中')+' · '+seconds+' 秒')};
 const progressTimer=sending&&onProgress?setInterval(report,5000):null;
 try{
  if(sending)report();
  const requestOptions={method,headers:{Accept:accept||(raw?'application/vnd.github.raw+json':'application/vnd.github+json'),Authorization:'Bearer '+config.token,'X-GitHub-Api-Version':'2026-03-10',...(body?{'Content-Type':binary?'application/octet-stream':'application/json'}:{})},...(controller?{signal:controller.signal}:{}),...(method==='GET'?{cache:'no-store'}:{}),...(payload?{body:payload}:{})};
  let response;try{response=await (nativeUpload?sendWithProgress(url,requestOptions,xhrFactory||(()=>new XMLHttpRequest()),value=>{transfer={...transfer,...value};report()}):fetcher(url,requestOptions))}catch(error){
   const timeout=controller?.signal.aborted||error.name==='AbortError',upload=sending,seconds=Math.max(0,Math.round((Date.now()-started)/1000)),size=typeof body?.content==='string'?' · 文件约 '+(body.content.length*3/4/1048576).toFixed(2)+' MB':'';
   throw Object.assign(Error((upload?(timeout?'上传等待超时':'上传连接中断'):(timeout?'读取 GitHub 超时':'无法连接 GitHub'))+'（已等待 '+seconds+' 秒'+size+'）。'+(upload?'请保持页面打开并检查网络；大文件可选择分片上传。':'请检查网络后重试。')),{code:timeout?'REQUEST_TIMEOUT':'NETWORK_ERROR',method})
  }
  if(missing&&response.status===404)return null;
  if(!response.ok){let detail=null;try{if(typeof response.text==='function'){const text=await response.text();try{detail=JSON.parse(text)}catch{detail={message:text.replace(/<[^>]*>/g,' ').trim()}}}else detail=await response.json()}catch{}if(missing&&[400,409].includes(response.status)&&/^(?:This repository|Git Repository) is empty\.?$/i.test(String(detail?.message||'').trim()))return null;const error=httpError(response.status,detail,config,method,path);if(binary){error.fileBytes=body?.byteLength??body?.size??0;error.message+='（附件 '+(error.fileBytes/1048576).toFixed(2)+' MB）'}if(sending&&response.status===401){if(timer)clearTimeout(timer);if(progressTimer)clearInterval(progressTimer);onProgress?.('上传认证被拒绝，正在复查 Token…');try{await request(config,'',{fetcher,timeoutMs:15000});error.code='UPLOAD_AUTH_REJECTED';error.message=binary?'GitHub 附件写入认证被拒绝（401 / Bad credentials），仓库读取正常。请核对 Token 的 Contents 读写授权，以及 uploads.github.com 的网络线路。':'同一个 Token 仍可连接仓库，但本次上传被拒绝（401 / Bad credentials）。不能据此认定 Token 已过期；请检查代理或网络，再重试。'}catch(checkError){error.code=checkError.status===401?'TOKEN_AUTH_REJECTED':'UPLOAD_AUTH_UNCONFIRMED';error.message+=checkError.status===401?' 复查连接也被拒绝：请重新粘贴完整的 Token，确认未过期或撤销。':' 复查连接未成功，暂时无法确认 Token 状态。'}}if(method==='PUT'&&typeof body?.content==='string'){const size=Math.max(0,Math.floor(body.content.length*3/4)-(body.content.endsWith('==')?2:body.content.endsWith('=')?1:0));error.fileBytes=size;error.message+='（本次文件 '+(size/1048576).toFixed(2)+' MB）'}throw error}
  return raw?new Uint8Array(await response.arrayBuffer()):await response.json();
 }finally{if(timer)clearTimeout(timer);if(progressTimer)clearInterval(progressTimer)}
}
function contentPath(path,branch){return'/contents/'+path.split('/').map(encodeURIComponent).join('/')+(branch?'?ref='+encodeURIComponent(branch):'')}
async function readFile(config,path,options={}){const file=await request(config,contentPath(path,config.branch),options);if(!file)return null;if(file.type!=='file')throw Error('仓库中的备份文件格式不正确。');if(file.encoding==='none'&&Number.isSafeInteger(file.size)&&file.size>0&&file.size<=MAX_SINGLE)return{sha:file.sha,bytes:await request(config,contentPath(path,config.branch),{...options,raw:true})};if(file.encoding!=='base64'||typeof file.content!=='string')throw Error('仓库中的备份文件格式不正确。');return{sha:file.sha,bytes:unbase64(file.content)}}
function validateManifest(value){
 if(value?.version===4)return archive.validate(value);
 if(!value||value.format!=='iris-github-sync'||![1,2,3].includes(value.version)||!/^[-a-zA-Z0-9]+$/.test(value.id||'')||typeof value.createdAt!=='string'||!Number.isFinite(Date.parse(value.createdAt))||typeof value.encrypted!=='boolean'||!Array.isArray(value.parts)||!value.parts.length||value.parts.length>2048||!Number.isSafeInteger(value.byteLength)||value.byteLength<1||value.byteLength>MAX_BYTES||!/^[a-f0-9]{64}$/.test((value.version===1?value.plaintextHash:value.rootHash)||''))throw Error('云端备份清单无效，未恢复任何数据。');
 const paths=new Set();let bytes=0;
 if(value.mode==='whole'&&(value.version!==1||value.parts.length!==1))throw Error('整包备份清单无效。');
 for(const part of value.parts){if(typeof part.path!=='string'||!new RegExp('^'+PREFIX+'/snapshots/'+(value.version===3?'[-a-zA-Z0-9]+':value.id)+'/part-\\d{4}\\.bin$').test(part.path)||paths.has(part.path)||!Number.isSafeInteger(part.bytes)||part.bytes<1||part.bytes>(value.mode==='whole'?MAX_SINGLE:CHUNK_SIZE)||!/^[a-f0-9]{64}$/.test(part.hash||''))throw Error('云端备份分片清单无效。');if(value.version>=2&&(!/^[a-f0-9]{64}$/.test(part.plainHash||'')||value.encrypted&&unbase64(part.iv).length!==12))throw Error('分片校验参数无效。');if(value.version===3&&(part.compression!==undefined&&part.compression!=='gzip'||!Number.isSafeInteger(part.plainBytes)||part.plainBytes<1||part.plainBytes>CHUNK_SIZE))throw Error('增量分片参数无效。');paths.add(part.path);bytes+=part.bytes}
 if(bytes!==value.byteLength)throw Error('云端备份长度校验失败。');
 if(value.encrypted&&(!value.crypto||value.crypto.iterations!==ITERATIONS||unbase64(value.crypto.salt).length!==16||value.version===1&&unbase64(value.crypto.iv).length!==12))throw Error('云端加密参数无效。');return value;
}
async function latest(config,options={}){const file=await readFile(config,LATEST,{...options,missing:true});if(!file)return{sha:null,manifest:null};if(file.bytes.length>900*1024)throw Error('云端备份清单过大。');let manifest;try{manifest=JSON.parse(decoder().decode(file.bytes))}catch{throw Error('云端备份清单无法读取。')}return{sha:file.sha,manifest:validateManifest(manifest)}}
async function connect(input,options={}){const config=configOf(input),repo=await request(config,'',options);if(repo.private!==true)throw Error('请使用私有仓库保存聊天数据；当前仓库是公开仓库。');if(repo.permissions?.push===false)throw Error('当前 Token 没有这个仓库的写入权限。');const branch=config.branch||repo.default_branch||'main';const target={...config,branch};return{repo:config.repo,branch,defaultBranch:repo.default_branch||'main',empty:repo.size===0,...await latest(target,options)}}
async function derive(password,salt,usage){const api=cryptoApi(),key=await api.subtle.importKey('raw',encoder().encode(password),'PBKDF2',false,['deriveKey']);return api.subtle.deriveKey({name:'PBKDF2',salt,iterations:ITERATIONS,hash:'SHA-256'},key,{name:'AES-GCM',length:256},false,[usage])}
async function seal(bytes,password){if(String(password||'').length<8)throw Error('加密密码至少需要 8 个字符，请自行妥善保管。');const api=cryptoApi(),salt=api.getRandomValues(new Uint8Array(16)),iv=api.getRandomValues(new Uint8Array(12)),key=await derive(password,salt,'encrypt');return{bytes:new Uint8Array(await api.subtle.encrypt({name:'AES-GCM',iv},key,bytes)),crypto:{salt:base64(salt),iv:base64(iv),iterations:ITERATIONS}}}
async function open(bytes,password,meta){if(!password)throw Error('这份备份已加密，请先填写它的加密密码。');try{const key=await derive(password,unbase64(meta.salt),'decrypt');return new Uint8Array(await cryptoApi().subtle.decrypt({name:'AES-GCM',iv:unbase64(meta.iv)},key,bytes))}catch{throw Error('加密密码不正确，或备份文件已损坏。')}}
async function writeFile(config,path,bytes,sha,options={}){const endpoint='/contents/'+path.split('/').map(encodeURIComponent).join('/'),requestOptions={...options,method:'PUT',body:{message:'Iris 数据备份｜'+(path===LATEST?'更新最新备份':'保存备份分片'),content:base64(bytes),...(sha?{sha}:{}),...(config.branch?{branch:config.branch}:{})}};try{return await request(config,endpoint,requestOptions)}catch(error){if(error.code!=='UPLOAD_AUTH_REJECTED'||bytes.length>CHUNK_SIZE||options.preferFetch||!options.xhrFactory&&!(options.fetcher===undefined&&typeof XMLHttpRequest==='function'))throw error;options.onProgress?.('小块上传认证被拒绝，正在切换发送方式重试一次…');let saved;try{saved=await request(config,endpoint,{...requestOptions,preferFetch:true})}catch(retryError){if(retryError.code==='UPLOAD_AUTH_REJECTED')retryError.message='两种发送方式的小块写入均被拒绝（401），但仓库连接仍通过。请核对 Token 的 Contents 读写权限及当前网络；未确认上传成功。';throw retryError}options.preferFetch=true;return saved}}
async function upload(input,bytes,options={}){
 const config=configOf(input);bytes=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);if(!bytes.length||bytes.length>MAX_BYTES-16)throw Error('备份为空或超过 512 MB，请先减少体积后再上传。');
 const connection=await connect(config,options);if(Object.prototype.hasOwnProperty.call(options,'expectedSha')&&connection.sha!==options.expectedSha)throw Error('云端备份已被其他设备更新，请先下载核对，未覆盖云端数据。');
 const target={...config,branch:connection.branch},plaintextHash=await hash(bytes),sealed=config.encrypted!==false?await seal(bytes,config.password):{bytes};
 const id=Date.now().toString(36)+'-'+base64(cryptoApi().getRandomValues(new Uint8Array(12))).replace(/[^a-zA-Z0-9]/g,''),manifest={format:'iris-github-sync',version:1,id,createdAt:new Date().toISOString(),encrypted:config.encrypted!==false,byteLength:sealed.bytes.length,plaintextHash,parts:[],...(sealed.crypto?{crypto:sealed.crypto}:{}),...(options.dataHash?{dataHash:options.dataHash}:{})};
 if(options.singleFile&&sealed.bytes.length>MAX_SINGLE)throw Error('整包备份超过 90 MB，请改用分片上传。');if(options.singleFile)manifest.mode='whole';
 if(options.singleFile)options.onProgress?.('正在一次性上传 '+(sealed.bytes.length/1048576).toFixed(2)+' MB…');
 const step=options.singleFile?sealed.bytes.length:CHUNK_SIZE,count=Math.ceil(sealed.bytes.length/step);let completed=0;
 for(let offset=0;offset<sealed.bytes.length;offset+=step){const part=sealed.bytes.slice(offset,offset+step),path=PREFIX+'/snapshots/'+id+'/part-'+String(completed).padStart(4,'0')+'.bin';await writeFile(connection.empty&&(!config.branch||config.branch===connection.defaultBranch)&&completed===0?{...target,branch:''}:target,path,part,null,options);manifest.parts.push({path,bytes:part.length,hash:await hash(part)});completed++;options.onProgress?.(`正在上传备份 ${completed}/${count}…`)}
 // Publishing this pointer last means incomplete uploads never replace a usable backup.
 const saved=await writeFile(target,LATEST,encoder().encode(JSON.stringify(manifest)),connection.sha,options);return{sha:saved.content?.sha,manifest,repo:config.repo,branch:connection.branch};
}
async function download(input,options={}){
 const config=configOf(input),connection=await connect(config,options);if(!connection.manifest)throw Error('这个仓库还没有 Iris 备份。');const manifest=connection.manifest;if(manifest.version===4)return archive.download(config,connection,options);if(manifest.encrypted&&options.getPassword)config.password=await options.getPassword(manifest);const buffer=new Uint8Array(manifest.byteLength);let offset=0,index=0;
 for(const part of manifest.parts){const file=await readFile({...config,branch:connection.branch},part.path,options);if(file.bytes.length!==part.bytes||await hash(file.bytes)!==part.hash)throw Error('云端备份分片不完整或已损坏，未恢复任何数据。');buffer.set(file.bytes,offset);offset+=file.bytes.length;options.onProgress?.(`正在下载备份 ${++index}/${manifest.parts.length}…`)}
 const bytes=manifest.encrypted?await open(buffer,config.password,manifest.crypto):buffer;if(await hash(bytes)!==manifest.plaintextHash)throw Error('备份完整性校验失败，未恢复任何数据。');return{bytes,...connection};
}
function chunkSize(value){return[128,256,512].includes(Number(value))?Number(value)*1024:256*1024}
// Produce bounded records instead of serializing the entire app or a large image at once.
function* records(value,path,limit,ancestors=new Set()){
 if(path.length>100)throw Error('资料嵌套层级过深，无法分片备份。');
 if(value&&typeof value==='object'&&typeof value.toJSON==='function')value=value.toJSON();
 if(typeof value==='string'){const width=Math.max(256,Math.floor((limit-4096)/8));if(!value.length){yield{path,kind:'text',value:'',last:true};return}for(let at=0;at<value.length;at+=width)yield{path,kind:'text',value:value.slice(at,at+width),last:at+width>=value.length};return}
 if(value&&typeof value==='object'){
  if(ancestors.has(value))throw Error('资料包含循环引用，无法备份。');ancestors.add(value);
  if(Array.isArray(value)){yield{path,kind:'array',length:value.length};for(let i=0;i<value.length;i++)yield* records(value[i]??null,[...path,i],limit,ancestors)}
  else{yield{path,kind:'object'};for(const key of Object.keys(value)){const child=value[key];if(child!==undefined&&typeof child!=='function'&&typeof child!=='symbol')yield* records(child,[...path,key],limit,ancestors)}}
  ancestors.delete(value);return;
 }
 if(typeof value==='bigint')throw Error('资料含不支持的数字格式。');yield{path,kind:'value',value:typeof value==='number'&&!Number.isFinite(value)?null:value??null};
}
function* stateParts(state,size,stable=false){let texts=[],length=2,group;for(const record of records(state,[],size)){const next=JSON.stringify(record.path.slice(0,['users','characters','messages','smsMessages'].includes(record.path[0])?2:1));if(stable&&texts.length&&next!==group){yield encoder().encode('['+texts.join(',')+']');texts=[];length=2}group=next;const text=JSON.stringify(record),bytes=encoder().encode(text).length;if(bytes+2>size)throw Error('单个字段路径过大，无法分片。');if(length+bytes+(texts.length?1:0)>size){yield encoder().encode('['+texts.join(',')+']');texts=[];length=2}length+=bytes+(texts.length?1:0);texts.push(text)}if(texts.length)yield encoder().encode('['+texts.join(',')+']')}
async function fingerprint(state,options={}){const hashes=[];for(const part of stateParts(state,chunkSize(options.chunkKB)-16,options.incremental))hashes.push(await hash(part));return hash(encoder().encode(hashes.join(':')))}
function stateBuilder(){
 let root,hasRoot=false,nodes=0;const textPieces=new Map(),arrays=[];
 function parent(path){let value=root;for(const step of path.slice(0,-1)){if(!value||typeof value!=='object'||!Object.prototype.hasOwnProperty.call(value,step))throw Error('分片字段顺序无效。');value=value[step]}return value}
 function assign(path,value,append=false){if(!path.length){if(hasRoot&&!append)throw Error('分片根记录重复。');root=value;hasRoot=true;return}const container=parent(path),key=path.at(-1);if(!container||typeof container!=='object'||!append&&Object.prototype.hasOwnProperty.call(container,key)||Array.isArray(container)&&(!Number.isSafeInteger(key)||key<0||key>container.length))throw Error('分片字段重复或无效。');Object.defineProperty(container,key,{value,writable:true,enumerable:true,configurable:true})}
 return{
  add(items){if(!Array.isArray(items))throw Error('分片内容无效。');for(const record of items){if(++nodes>10000000||!record||!Array.isArray(record.path)||record.path.length>100||record.path.some(key=>typeof key!=='string'&&!Number.isSafeInteger(key)||key==='__proto__'))throw Error('分片字段不安全或过多。');const key=JSON.stringify(record.path);
   if(record.kind==='object')assign(record.path,{});
   else if(record.kind==='array'){if(!Number.isSafeInteger(record.length)||record.length<0||record.length>10000000)throw Error('分片数组长度无效。');const value=[];assign(record.path,value);arrays.push([value,record.length])}
   else if(record.kind==='text'){if(typeof record.value!=='string'||typeof record.last!=='boolean')throw Error('分片文字无效。');if(!textPieces.has(key)){assign(record.path,'');textPieces.set(key,[])}const pieces=textPieces.get(key);pieces.push(record.value);if(record.last){assign(record.path,pieces.join(''),true);textPieces.delete(key)}}
   else if(record.kind==='value'){if(record.value!==null&&!['number','boolean'].includes(typeof record.value))throw Error('分片值无效。');assign(record.path,record.value)}else throw Error('未知的分片记录。');
  }},
  finish(){if(!hasRoot||textPieces.size||arrays.some(([value,length])=>value.length!==length))throw Error('分片数据不完整。');return root}
 };
}
// Persist the original encrypted payload before sending it, so later edits cannot mix snapshots.
async function resumeState(input,store,options={}){
 const task=await store.get('task');if(task?.kind==='archive')return archive.resume(input,store,options);if(!task)throw Error('没有待继续的分片上传。');
 const config=configOf(input),connection=await connect(config,options),manifest=validateManifest(task.manifest);
 if(config.repo!==task.repo||connection.branch!==task.branch)throw Error('请切换回中断上传时的仓库和分支。');
 if(connection.manifest?.id===manifest.id){await store.clear();return connection}
 if(connection.sha!==task.expectedSha)throw Error('云端备份已被其他设备更新，请先下载核对；中断进度已保留。');
 if(manifest.encrypted){let first=await store.get('part-0');if(!first&&task.reused?.includes(0)){const remote=await readFile({...config,branch:task.branch},manifest.parts[0].path,options);if(remote&&await hash(remote.bytes)===manifest.parts[0].hash)first=base64(remote.bytes)}if(!first)throw Error('本机续传分片缺失。');try{const key=await derive(config.password,unbase64(manifest.crypto.salt),'decrypt');await cryptoApi().subtle.decrypt({name:'AES-GCM',iv:unbase64(manifest.parts[0].iv)},key,unbase64(first))}catch{throw Object.assign(Error('请输入中断上传时使用的加密密码。'),{code:'RESUME_PASSWORD_MISMATCH'})}}
 const target={...config,branch:task.branch};
 for(let index=0;index<manifest.parts.length;index++){
  const part=manifest.parts[index];if(task.reused?.includes(index)){if(!connection.manifest?.parts.some(previous=>JSON.stringify(previous)===JSON.stringify(part)))throw Error('增量备份引用与云端基线不一致。');options.onProgress?.(`已复用 ${index+1}/${manifest.parts.length} 片，无需重传`);continue}const remote=options.freshStage?null:await readFile(target,part.path,{...options,missing:true});
  if(remote){if(remote.bytes.length!==part.bytes||await hash(remote.bytes)!==part.hash)throw Error('云端已有分片与本机进度不一致，已停止续传。');options.onProgress?.(`已保留 ${index+1}/${manifest.parts.length} 片，无需重传`);continue}
  const stored=await store.get('part-'+index);if(!stored)throw Error('本机续传分片缺失，未修改云端备份。');const bytes=unbase64(stored);if(await hash(bytes)!==part.hash)throw Error('本机续传分片已损坏。');
  await writeFile(connection.empty&&(!config.branch||config.branch===connection.defaultBranch)&&index===0?{...target,branch:''}:target,part.path,bytes,null,options);options.onProgress?.(`已上传 ${index+1}/${manifest.parts.length} 片`);
 }
 const saved=await writeFile(target,LATEST,encoder().encode(JSON.stringify(manifest)),task.expectedSha,options);await store.clear();return{sha:saved.content?.sha,manifest,repo:task.repo,branch:task.branch};
}
async function uploadState(input,state,options={}){
 if(options.incremental)return uploadIncrementalState(input,state,options);
 if(options.store&&await options.store.get('task'))return resumeState(input,options.store,options);
 const config=configOf(input),connection=await connect(config,options);if(Object.prototype.hasOwnProperty.call(options,'expectedSha')&&connection.sha!==options.expectedSha)throw Error('云端备份已被其他设备更新，请先下载核对，未覆盖云端数据。');
 const encrypted=config.encrypted!==false;if(encrypted&&String(config.password||'').length<8)throw Error('加密密码至少需要 8 个字符。');
 const api=cryptoApi(),salt=encrypted?api.getRandomValues(new Uint8Array(16)):null,key=encrypted?await derive(config.password,salt,'encrypt'):null,id=Date.now().toString(36)+'-'+base64(api.getRandomValues(new Uint8Array(12))).replace(/[^a-zA-Z0-9]/g,''),target={...config,branch:connection.branch};
 const manifest={format:'iris-github-sync',version:2,id,createdAt:new Date().toISOString(),encrypted,byteLength:0,parts:[],rootHash:'',...(salt?{crypto:{salt:base64(salt),iterations:ITERATIONS}}:{})};
 for(const plain of stateParts(state,chunkSize(options.chunkKB)-16)){
  const index=manifest.parts.length;if(index>=2048)throw Error('分片数量超过上限，请选择更大的分片。');const iv=encrypted?api.getRandomValues(new Uint8Array(12)):null,bytes=encrypted?new Uint8Array(await api.subtle.encrypt({name:'AES-GCM',iv},key,plain)):plain,path=PREFIX+'/snapshots/'+id+'/part-'+String(index).padStart(4,'0')+'.bin';
  if(manifest.byteLength+bytes.length>MAX_BYTES)throw Error('备份超过 512 MB，请先减少数据体积。');
  if(options.store)await options.store.set('part-'+index,base64(bytes));else await writeFile(connection.empty&&(!config.branch||config.branch===connection.defaultBranch)&&index===0?{...target,branch:''}:target,path,bytes,null,options);manifest.byteLength+=bytes.length;manifest.parts.push({path,bytes:bytes.length,hash:await hash(bytes),plainHash:await hash(plain),...(iv?{iv:base64(iv)}:{})});options.onProgress?.(`${options.store?'已准备':'已上传'} ${index+1} 片 · ${(manifest.byteLength/1048576).toFixed(1)} MB`);
 }
 manifest.rootHash=await hash(encoder().encode(manifest.parts.map(part=>part.plainHash).join(':')));if(options.store){await options.store.set('task',{repo:config.repo,branch:connection.branch,expectedSha:connection.sha,manifest});return resumeState(input,options.store,options)}const saved=await writeFile(target,LATEST,encoder().encode(JSON.stringify(manifest)),connection.sha,options);return{sha:saved.content?.sha,manifest,repo:config.repo,branch:connection.branch};
}
async function compressPart(plain){if(typeof CompressionStream==='function')try{const bytes=new Uint8Array(await new Response(new Blob([plain]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer());if(bytes.length+32<plain.length)return{bytes,compression:'gzip'}}catch{}return{bytes:plain}}
async function inflatePart(bytes,expected){if(typeof DecompressionStream!=='function')throw Error('当前浏览器不支持解压备份，请升级浏览器。');const reader=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')).getReader(),pieces=[];let length=0;try{for(;;){const {value,done}=await reader.read();if(done)break;length+=value.length;if(length>expected||length>CHUNK_SIZE)throw Error('备份分片解压大小超过上限。');pieces.push(value)}}catch(error){await reader.cancel().catch(()=>{});throw error}finally{reader.releaseLock()}const plain=new Uint8Array(length);let offset=0;for(const piece of pieces){plain.set(piece,offset);offset+=piece.length}return plain}
async function uploadIncrementalState(input,state,options={}){
 const store=options.store||(()=>{const values=new Map();return{get:async key=>values.get(key),set:async(key,value)=>values.set(key,value),clear:async()=>values.clear()}})();
 if(await store.get('task'))return resumeState(input,store,options);
 const config=configOf(input),connection=await connect(config,options);if(Object.prototype.hasOwnProperty.call(options,'expectedSha')&&connection.sha!==options.expectedSha)throw Error('云端备份已被其他设备更新，请先下载核对，未覆盖云端数据。');
 const api=cryptoApi(),encrypted=config.encrypted!==false;if(encrypted&&String(config.password||'').length<8)throw Error('加密密码至少需要 8 个字符。');
 let salt=encrypted?api.getRandomValues(new Uint8Array(16)):null,key=null,reusable=false;const previous=connection.manifest;
 if(previous?.version===3&&previous.encrypted===encrypted){if(!encrypted)reusable=true;else{const sample=previous.parts[0],file=await readFile({...config,branch:connection.branch},sample.path,options);if(!file||await hash(file.bytes)!==sample.hash)throw Error('云端增量基线分片已损坏，请先检查备份。');try{const candidate=await derive(config.password,unbase64(previous.crypto.salt),'decrypt');await api.subtle.decrypt({name:'AES-GCM',iv:unbase64(sample.iv)},candidate,file.bytes);salt=unbase64(previous.crypto.salt);reusable=true}catch{}}}
 if(encrypted)key=await derive(config.password,salt,'encrypt');
 const available=new Map();if(reusable)for(const part of previous.parts){const list=available.get(part.plainHash)||[];list.push(part);available.set(part.plainHash,list)}
 const id=Date.now().toString(36)+'-'+base64(api.getRandomValues(new Uint8Array(12))).replace(/[^a-zA-Z0-9]/g,''),manifest={format:'iris-github-sync',version:3,mode:'incremental',id,createdAt:new Date().toISOString(),encrypted,byteLength:0,parts:[],rootHash:'',...(salt?{crypto:{salt:base64(salt),iterations:ITERATIONS}}:{})},reused=[];let newBytes=0;
 for(const plain of stateParts(state,chunkSize(options.chunkKB)-16,true)){
  const index=manifest.parts.length;if(index>=2048)throw Error('分片数量超过上限，请选择更大的分片。');const plainHash=await hash(plain),existing=available.get(plainHash)?.pop();let part;
  if(existing){part={...existing};reused.push(index)}else{const compressed=await compressPart(plain),iv=encrypted?api.getRandomValues(new Uint8Array(12)):null,bytes=encrypted?new Uint8Array(await api.subtle.encrypt({name:'AES-GCM',iv},key,compressed.bytes)):compressed.bytes;part={path:PREFIX+'/snapshots/'+id+'/part-'+String(index).padStart(4,'0')+'.bin',bytes:bytes.length,hash:await hash(bytes),plainHash,plainBytes:plain.length,...(compressed.compression?{compression:compressed.compression}:{}),...(iv?{iv:base64(iv)}:{})};newBytes+=bytes.length;await store.set('part-'+index,base64(bytes))}
  manifest.byteLength+=part.bytes;if(manifest.byteLength>MAX_BYTES)throw Error('备份超过 512 MB，请先减少数据体积。');manifest.parts.push(part);options.onProgress?.(`正在准备增量备份 · 复用 ${reused.length} 片 · 需发送 ${(newBytes/1048576).toFixed(2)} MB`);
 }
 manifest.rootHash=await hash(encoder().encode(manifest.parts.map(part=>part.plainHash).join(':')));
 if(reusable&&manifest.rootHash===previous.rootHash){await store.clear();return{...connection,unchanged:true,reusedParts:reused.length,uploadedBytes:0}}
 await store.set('task',{repo:config.repo,branch:connection.branch,expectedSha:connection.sha,manifest,reused});const saved=await resumeState(input,store,{...options,freshStage:true});return{...saved,reusedParts:reused.length,uploadedBytes:newBytes};
}
async function downloadState(input,options={}){
 const config=configOf(input),connection=await connect(config,options);if(!connection.manifest)throw Error('这个仓库还没有 Iris 备份。');const manifest=connection.manifest;if(manifest.version===4)return archive.download(config,connection,options);if(manifest.version===1)return download(input,options);
 if(manifest.encrypted&&options.getPassword)config.password=await options.getPassword(manifest);
 if(manifest.encrypted&&!config.password)throw Error('请输入这份备份的加密密码。');const key=manifest.encrypted?await derive(config.password,unbase64(manifest.crypto.salt),'decrypt'):null,builder=stateBuilder();let index=0;
 for(const part of manifest.parts){const file=await readFile({...config,branch:connection.branch},part.path,options);if(file.bytes.length!==part.bytes||await hash(file.bytes)!==part.hash)throw Error('云端备份分片不完整或已损坏，未恢复任何数据。');let plain=file.bytes;
  if(key)try{plain=new Uint8Array(await cryptoApi().subtle.decrypt({name:'AES-GCM',iv:unbase64(part.iv)},key,file.bytes))}catch{throw Error('加密密码不正确，或备份分片已损坏。')}
  if(part.compression==='gzip')plain=await inflatePart(plain,part.plainBytes);if(part.plainBytes!==undefined&&plain.length!==part.plainBytes)throw Error('分片解压长度无效。');if(await hash(plain)!==part.plainHash)throw Error('分片内容校验失败。');builder.add(JSON.parse(decoder().decode(plain)));options.onProgress?.(`已校验并恢复 ${++index}/${manifest.parts.length} 片`);
 }
 if(await hash(encoder().encode(manifest.parts.map(part=>part.plainHash).join(':')))!==manifest.rootHash)throw Error('分片顺序校验失败。');return{data:builder.finish(),...connection};
}
async function prepareRepository(input,options={}){
 const token=String(input.token||'').trim();if(!token||/\s/.test(token))throw Error('请填写完整的 GitHub Token，不要包含空格或换行。');
 const value=String(input.repo||'').trim();let repo,login,created=false;
 const account=async()=>{if(login)return login;const user=await request({token,repo:'account/lookup'},'/user',{...options,accountPath:true});if(!/^[A-Za-z0-9-]+$/.test(user.login||''))throw Error('GitHub 未返回有效的账号名称。');return login=user.login};
 if(!value||/^[A-Za-z0-9_.-]+$/.test(value)){repo=(await account())+'/'+(value||'iris-data')}else repo=parseRepo(value);
 const config=configOf({...input,repo,token});let existing;try{existing=await request(config,'',options)}catch(error){if(error.status!==404||options.create!==true)throw error;if(repo.split('/')[0].toLowerCase()!==(await account()).toLowerCase())throw Error('只能自动创建当前 Token 所属账号的仓库；请核对仓库名称和授权。');
  try{existing=await request(config,'/user/repos',{...options,accountPath:true,method:'POST',body:{name:repo.split('/')[1],private:true,auto_init:false,description:'Iris 私有资料存储'}})}catch(createError){if([403,404,422].includes(createError.status))createError.message='无法创建私有备份仓库。请确认 Token 有创建仓库权限；也可以手动建仓库后授权 Contents 读写。';throw createError}created=true;
 }
 if(existing.private!==true)throw Error('请使用私有仓库保存聊天资料。');return{repo,created};
}
const archive=createArchive({request,configOf,connect,writeFile,hash,base64,unbase64,derive,cryptoApi,encoder,LATEST,MAX_BYTES});
return{parseRepo,prepareRepository,connect,uploadArchive:archive.upload,upload,download,uploadState,resumeState,downloadState,fingerprint,transferTimeout,hash,base64,unbase64,validateManifest,CHUNK_SIZE,LATEST};
});
