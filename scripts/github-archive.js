(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory;if(root)root.IrisGitHubArchive=factory})(typeof globalThis==='object'?globalThis:null,function(deps){
'use strict';
const {request,configOf,connect,writeFile,hash,base64,unbase64,derive,cryptoApi,encoder,LATEST,MAX_BYTES}=deps;
const SLICE_BYTES=8*1024*1024,STAMP='iris-private-',FILE=/^block-\d{4}\.iris$/;
function validate(value,pending=false){
 if(!value||value.format!=='iris-github-sync'||value.version!==4||value.mode!=='archive'||!/^[-a-zA-Z0-9]+$/.test(value.id||'')||!Number.isFinite(Date.parse(value.createdAt))||typeof value.encrypted!=='boolean'||!Number.isSafeInteger(value.archiveBytes)||value.archiveBytes<1||value.archiveBytes>MAX_BYTES||!Number.isSafeInteger(value.byteLength)||value.byteLength<1||value.byteLength>MAX_BYTES+2048||!/^[a-f0-9]{64}$/.test(value.plaintextHash||'')||!Array.isArray(value.parts)||!value.parts.length||value.parts.length>64||(!pending||value.releaseId!==undefined)&&(!Number.isSafeInteger(value.releaseId)||value.releaseId<1))throw Error('附件备份清单无效。');
 if(value.encrypted&&(!value.crypto||value.crypto.iterations!==210000||unbase64(value.crypto.salt).length!==16))throw Error('附件备份加密参数无效。');
 let total=0,plain=0;const names=new Set(),ids=new Set();for(const part of value.parts){if(!FILE.test(part.name)||names.has(part.name)||!Number.isSafeInteger(part.bytes)||part.bytes<1||part.bytes>SLICE_BYTES+16||!Number.isSafeInteger(part.plainBytes)||part.plainBytes<1||part.plainBytes>SLICE_BYTES||!/^[a-f0-9]{64}$/.test(part.hash||'')||!/^[a-f0-9]{64}$/.test(part.plainHash||'')||value.encrypted&&unbase64(part.iv).length!==12||!pending&&(!Number.isSafeInteger(part.assetId)||part.assetId<1||ids.has(part.assetId)))throw Error('附件备份分块清单无效。');names.add(part.name);ids.add(part.assetId);total+=part.bytes;plain+=part.plainBytes}
 if(total!==value.byteLength||plain!==value.archiveBytes)throw Error('附件备份长度不一致。');return value;
}
const localStore=()=>{const values=new Map();return{get:async key=>values.get(key),set:async(key,value)=>values.set(key,value),clear:async()=>values.clear()}};
function baseline(connection,expected){if(connection.sha!==expected)throw Error('云端备份已被其他设备更新，已保留本机上传进度，请先下载核对。')}
async function assetBytes(config,part,options){return request(config,'/releases/assets/'+part.assetId,{...options,raw:true,accept:'application/octet-stream',timeoutMs:Math.min(900000,Math.max(180000,Math.ceil(part.bytes/1048576)*45000))})}
async function decrypt(bytes,part,key){if(!key)return bytes;try{return new Uint8Array(await cryptoApi().subtle.decrypt({name:'AES-GCM',iv:unbase64(part.iv)},key,bytes))}catch{throw Error('备份密码不正确，或附件已经损坏。')}}
async function catalog(config,id,options){const assets=[];for(let page=1;page<=100;page++){const items=await request(config,'/releases/'+id+'/assets?per_page=100&page='+page,options);if(!Array.isArray(items))throw Error('无法读取附件清单。');assets.push(...items);if(items.length<100)return assets}throw Error('附件清单过长，已停止操作。')}
async function locateDraft(config,tag,options){for(let page=1;page<=20;page++){const items=await request(config,'/releases?per_page=100&page='+page,options);if(!Array.isArray(items))throw Error('无法读取备份存储区。');const match=items.find(item=>item.tag_name===tag);if(match)return match;if(items.length<100)return null}throw Error('待核对的备份存储区过多，请先整理后再试。')}
async function usable(config,asset,part,options){if(!asset||asset.state!=='uploaded'||asset.size!==part.bytes||!Number.isSafeInteger(asset.id)||asset.id<1)return false;if(asset.digest)return asset.digest==='sha256:'+part.hash;const bytes=await assetBytes(config,{...part,assetId:asset.id},options);return bytes.length===part.bytes&&await hash(bytes)===part.hash}
async function upload(input,source,options={}){
 const store=options.store||localStore();if(await store.get('task'))return resume(input,store,options);
 const config=configOf(input),connection=await connect(config,options);if(Object.prototype.hasOwnProperty.call(options,'expectedSha'))baseline(connection,options.expectedSha);
 const archive=source instanceof Blob?source:new Blob([source]);if(!archive.size||archive.size>MAX_BYTES)throw Error('整包备份为空或超过 512 MB。');
 options.onProgress?.('完整备份会自动分段发送，每段最多 8 MB，本次共 '+Math.ceil(archive.size/SLICE_BYTES)+' 段；恢复时自动合并。');
 const encrypted=config.encrypted!==false;if(encrypted&&String(config.password||'').length<8)throw Error('请先设置至少 8 个字符的备份密码。');
 const api=cryptoApi(),salt=encrypted?api.getRandomValues(new Uint8Array(16)):null,key=encrypted?await derive(config.password,salt,'encrypt'):null,id=Date.now().toString(36)+'-'+base64(api.getRandomValues(new Uint8Array(12))).replace(/[^A-Za-z0-9]/g,'');
 const manifest={format:'iris-github-sync',version:4,mode:'archive',id,createdAt:new Date().toISOString(),encrypted,archiveBytes:archive.size,byteLength:0,plaintextHash:await hash(new Uint8Array(await archive.arrayBuffer())),parts:[],...(options.dataHash?{dataHash:options.dataHash}:{}),...(salt?{crypto:{salt:base64(salt),iterations:210000}}:{})};
 for(let offset=0;offset<archive.size;offset+=SLICE_BYTES){const plain=new Uint8Array(await archive.slice(offset,offset+SLICE_BYTES).arrayBuffer()),iv=encrypted?api.getRandomValues(new Uint8Array(12)):null,bytes=encrypted?new Uint8Array(await api.subtle.encrypt({name:'AES-GCM',iv},key,plain)):plain,index=manifest.parts.length;manifest.parts.push({name:'block-'+String(index).padStart(4,'0')+'.iris',bytes:bytes.length,plainBytes:plain.length,hash:await hash(bytes),plainHash:await hash(plain),...(iv?{iv:base64(iv)}:{})});manifest.byteLength+=bytes.length;await store.set('part-'+index,base64(bytes));options.onProgress?.('整包备份自动分段（每段最多 8 MB） · 已准备 '+(index+1)+'/'+Math.ceil(archive.size/SLICE_BYTES)+' 段 · '+(manifest.byteLength/1048576).toFixed(2)+' MB')}
 await store.set('task',{kind:'archive',repo:config.repo,branch:connection.branch,expectedSha:connection.sha,manifest});return resume(input,store,options);
}
async function resume(input,store,options={}){
 const task=await store.get('task');if(task?.kind!=='archive')throw Error('没有待续传的附件备份。');const config=configOf(input),manifest=validate(task.manifest,true),connection=await connect(config,options);
 if(config.repo!==task.repo||connection.branch!==task.branch)throw Error('请切换回这次备份使用的仓库和分支。');if(connection.manifest?.id===manifest.id){await store.clear();return connection}baseline(connection,task.expectedSha);const target={...config,branch:task.branch};
 if(manifest.encrypted){const stored=await store.get('part-0');if(!stored)throw Error('本机续传附件缺失。');const bytes=unbase64(stored);if(bytes.length!==manifest.parts[0].bytes||await hash(bytes)!==manifest.parts[0].hash)throw Error('本机续传附件校验失败。');try{const key=await derive(config.password,unbase64(manifest.crypto.salt),'decrypt');await decrypt(bytes,manifest.parts[0],key)}catch{throw Object.assign(Error('请输入这次备份原来使用的加密密码。'),{code:'RESUME_PASSWORD_MISMATCH'})}}
 if(!manifest.releaseId){const tag=STAMP+manifest.id;let release=await locateDraft(target,tag,options);if(!release){const branch=await request(target,'/branches/'+encodeURIComponent(task.branch),{...options,missing:true});if(!branch&&task.branch!==connection.defaultBranch)throw Error('指定分支不存在，请清空分支设置或使用已有分支。');if(!branch)await writeFile({...target,branch:''},'iris-sync/storage.json',encoder().encode(JSON.stringify({format:'iris-private-storage',version:1})),null,options);release=await request(target,'/releases',{...options,method:'POST',body:{tag_name:tag,target_commitish:task.branch,name:'Iris 私有备份 '+manifest.createdAt,draft:true,body:'Iris 资料存储'}})}if(!Number.isSafeInteger(release.id)||release.id<1)throw Error('GitHub 未返回有效的备份存储标识。');manifest.releaseId=release.id;await store.set('task',task)}
 let assets=await catalog(target,manifest.releaseId,options);
 for(let index=0;index<manifest.parts.length;index++){
  const part=manifest.parts[index];let asset=assets.find(item=>item.name===part.name);if(!await usable(target,asset,part,options)){
   const stored=await store.get('part-'+index);if(!stored)throw Error('本机续传附件缺失，未修改云端完整备份。');const bytes=unbase64(stored);if(bytes.length!==part.bytes||await hash(bytes)!==part.hash)throw Error('本机续传附件校验失败。');
   for(let attempt=0;attempt<2;attempt++){if(asset){await request(target,'/releases/assets/'+asset.id,{...options,method:'DELETE'});asset=null}
    try{asset=await request(target,'/releases/'+manifest.releaseId+'/assets?name='+encodeURIComponent(part.name),{...options,onProgress:message=>options.onProgress?.('整包备份自动分段 · 第 '+(index+1)+'/'+manifest.parts.length+' 段 · '+message),method:'POST',body:bytes,binary:true,uploadHost:true});if(!await usable(target,asset,part,options))throw Error('GitHub 返回的附件大小或校验值不正确。');break}catch(error){assets=await catalog(target,manifest.releaseId,options);asset=assets.find(item=>item.name===part.name);if(await usable(target,asset,part,options))break;if(attempt||error.code!=='UPLOAD_AUTH_REJECTED'||options.preferFetch)throw error;options.onProgress?.('正在切换附件发送方式重试…');options.preferFetch=true}
   }
  }
  part.assetId=asset.id;await store.set('task',task);options.onProgress?.('整包备份自动分段 · 已确认 '+(index+1)+'/'+manifest.parts.length+' 段');
 }
 validate(manifest);await request(target,'/releases/'+manifest.releaseId,{...options,method:'PATCH',body:{draft:false,prerelease:true,make_latest:'false'}});
 const latest=await writeFile(target,LATEST,encoder().encode(JSON.stringify(manifest)),task.expectedSha,options);await store.clear();return{repo:config.repo,branch:task.branch,sha:latest.content?.sha,manifest};
}
async function download(config,connection,options={}){
 const manifest=validate(connection.manifest);if(manifest.encrypted&&options.getPassword)config.password=await options.getPassword(manifest);const key=manifest.encrypted?await derive(config.password,unbase64(manifest.crypto.salt),'decrypt'):null,bytes=new Uint8Array(manifest.archiveBytes);let offset=0;
 for(let index=0;index<manifest.parts.length;index++){const part=manifest.parts[index],sealed=await assetBytes({...config,branch:connection.branch},part,options);if(sealed.length!==part.bytes||await hash(sealed)!==part.hash)throw Error('云端附件校验失败，未恢复任何资料。');const plain=await decrypt(sealed,part,key);if(plain.length!==part.plainBytes||await hash(plain)!==part.plainHash)throw Error('附件内容校验失败。');bytes.set(plain,offset);offset+=plain.length;options.onProgress?.('已下载并校验附件 '+(index+1)+'/'+manifest.parts.length)}
 if(offset!==manifest.archiveBytes||await hash(bytes)!==manifest.plaintextHash)throw Error('完整备份校验失败。');return{...connection,bytes};
}
return{upload,resume,download,validate};
});
