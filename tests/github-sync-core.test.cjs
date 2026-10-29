const {test}=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const C=require('../scripts/github-sync-core.js'),B=require('../scripts/backup-core.js');
const {repository}=require('./helpers/github-repository.cjs');
const config={repo:'owner/iris-data',token:'fixture-token',password:'only-for-testing',encrypted:true};

test('only a private authorized repository is accepted and repository URLs normalize',async()=>{
 const r=repository();assert.equal(C.parseRepo('https://github.com/owner/iris-data.git'),'owner/iris-data');
 assert.equal((await C.connect(config,{fetcher:r.fetch})).manifest,null);
 r.setPrivate(false);await assert.rejects(C.connect(config,{fetcher:r.fetch}),/私有仓库/);
 await assert.rejects(C.connect({...config,token:'wrong'},{fetcher:r.fetch}),/未接受本次请求的 Token/);
 assert.throws(()=>C.parseRepo('https://untrusted.invalid/owner/repo'),/仓库请填写/);
});

test('encrypted multi-part snapshots round-trip and plaintext is never uploaded',async()=>{
 const r=repository(),bytes=new Uint8Array(crypto.randomBytes(C.CHUNK_SIZE+20)),saved=await C.upload(config,bytes,{expectedSha:null,fetcher:r.fetch});
 assert.equal(saved.manifest.parts.length,2);assert.equal(saved.manifest.encrypted,true);
 const restored=await C.download(config,{fetcher:r.fetch});assert.deepEqual(restored.bytes,bytes);
 assert.equal(r.requests.filter(x=>x.method==='PUT').at(-1).url.endsWith('/iris-sync/latest.json'),true);
 assert.notDeepEqual(r.files.get(saved.manifest.parts[0].path).bytes.subarray(0,32),Buffer.from(bytes.subarray(0,32)));
 await assert.rejects(C.download({...config,password:'wrong-password'},{fetcher:r.fetch}),/密码不正确/);
});

test('full Iris data including keys, IF dreams and media restore through the existing backup format',async()=>{
 const r=repository(),data={users:[{name:'用户',avatar:'data:image/png;base64,aGVsbG8='}],characters:[{name:'角色',experienceCharacterId:'role-1',ifWorld:{ownerId:'role-1',branches:[],dreams:[{id:'dream-1',roleId:'role-1',content:'梦境'}],archives:[]}}],messages:{'0-0-chat':[{mine:true,text:'聊天记录'}]},settings:{apiConfigs:[{key:'private-model-key'}]}};
 const backup=await B.make(data),archive=await B.zip(JSON.stringify(backup));await C.upload(config,new Uint8Array(await archive.arrayBuffer()),{fetcher:r.fetch});
 const restored=await C.download(config,{fetcher:r.fetch}),json=JSON.parse(new TextDecoder().decode(await B.unzip(restored.bytes)));
 assert.deepEqual((await B.validate(json)).data,data);
 for(const {bytes} of r.files.values())assert.ok(!bytes.toString().includes('private-model-key'));
});

test('partial upload and a concurrent publisher never replace the last usable snapshot',async()=>{
 const r=repository(),first=await C.upload({...config,encrypted:false},new Uint8Array([1,2,3]),{fetcher:r.fetch}),before=r.files.get(C.LATEST).sha;
 r.fail('part-0001');await assert.rejects(C.upload({...config,encrypted:false},new Uint8Array(C.CHUNK_SIZE+1),{expectedSha:first.sha,fetcher:r.fetch}),/GitHub 请求失败/);assert.equal(r.files.get(C.LATEST).sha,before);
 r.fail('');r.race(true);await assert.rejects(C.upload({...config,encrypted:false},new Uint8Array([4,5]),{expectedSha:first.sha,fetcher:r.fetch}),/仓库内容已变化/);assert.equal(r.files.get(C.LATEST).sha,before);
});

test('a stale baseline is rejected before any parts are uploaded',async()=>{
 const r=repository();await C.upload({...config,encrypted:false},new Uint8Array([1]),{fetcher:r.fetch});const count=r.requests.length;
 await assert.rejects(C.upload(config,new Uint8Array([2]),{expectedSha:null,fetcher:r.fetch}),/其他设备更新/);
 assert.equal(r.requests.slice(count).filter(x=>x.method==='PUT').length,0);
});

test('tampered parts and malicious manifest paths are rejected without returning data',async()=>{
 const r=repository(),saved=await C.upload({...config,encrypted:false},new Uint8Array([1,2,3]),{fetcher:r.fetch});
 r.files.get(saved.manifest.parts[0].path).bytes[0]=8;await assert.rejects(C.download(config,{fetcher:r.fetch}),/分片不完整或已损坏/);
 const manifest=structuredClone(saved.manifest);manifest.parts[0].path='../../secret';assert.throws(()=>C.validateManifest(manifest),/分片清单无效/);
});

test('segmented state splits large media and Unicode text, encrypts each part and restores fields incrementally',async()=>{
 const r=repository(),state={users:[{name:'小雨',details:'中文😀\n\u0000'.repeat(15000),avatar:'data:image/png;base64,'+'x'.repeat(400000)}],characters:[{name:'甲'}],messages:{'0-0-chat':[{mine:true,text:'分片恢复'}]},settings:{key:'a-secret-key'}};
 const before=await C.fingerprint(state,{chunkKB:128}),saved=await C.uploadState(config,state,{fetcher:r.fetch,expectedSha:null,chunkKB:128});
 assert.equal(saved.manifest.version,2);assert.ok(saved.manifest.parts.length>3);assert.ok(saved.manifest.parts.every(part=>part.bytes<=128*1024));assert.equal(saved.manifest.rootHash,before);
 assert.equal(new Set(saved.manifest.parts.map(part=>part.iv)).size,saved.manifest.parts.length);assert.ok(!JSON.stringify(saved.manifest).includes(config.password));
 assert.deepEqual((await C.downloadState(config,{fetcher:r.fetch})).data,state);
 await assert.rejects(C.downloadState({...config,password:'not-the-password'},{fetcher:r.fetch}),/密码不正确/);
});

test('a missing segmented upload and a damaged segmented download never publish or return partial state',async()=>{
 const r=repository(),state={users:[],characters:[],messages:{},settings:{image:'x'.repeat(300000)}};
 const saved=await C.uploadState({...config,encrypted:false},state,{fetcher:r.fetch,chunkKB:128}),sha=saved.sha;
 r.fail('part-0001');await assert.rejects(C.uploadState({...config,encrypted:false},state,{fetcher:r.fetch,chunkKB:128,expectedSha:sha}),/GitHub 请求失败/);assert.equal(r.files.get(C.LATEST).sha,sha);
 r.fail('');r.files.get(saved.manifest.parts[1].path).bytes[20]^=1;await assert.rejects(C.downloadState(config,{fetcher:r.fetch}),/分片不完整或已损坏/);
});

test('whole upload uses one payload and restores large files through authenticated raw content',async()=>{
 const r=repository(),bytes=new Uint8Array(crypto.randomBytes(1100000));
 const saved=await C.upload(config,bytes,{singleFile:true,fetcher:r.fetch,expectedSha:null});
 assert.equal(saved.manifest.mode,'whole');assert.equal(saved.manifest.parts.length,1);
 assert.equal(r.requests.filter(request=>request.method==='PUT').length,2);
 assert.deepEqual((await C.downloadState(config,{fetcher:r.fetch})).bytes,bytes);
});

function stageStore(){const entries=new Map();return{entries,get:async key=>structuredClone(entries.get(key)),set:async(key,value)=>{entries.set(key,structuredClone(value))},clear:async()=>entries.clear()}}
test('interrupted segmented upload resumes only missing pieces from its persisted original snapshot',async()=>{
 const r=repository(),store=stageStore(),state={users:[],characters:[],messages:{},settings:{image:'原始😀'.repeat(90000)}};
 r.fail('part-0001');await assert.rejects(C.uploadState(config,state,{store,fetcher:r.fetch,chunkKB:128,expectedSha:null}),/GitHub 请求失败/);
 const task=await store.get('task'),first=task.manifest.parts[0].path;assert.ok(r.files.has(first));assert.ok(!r.files.has(C.LATEST));
 assert.ok(!JSON.stringify([...store.entries]).includes(config.password));assert.ok(!JSON.stringify([...store.entries]).includes('原始'));
 state.settings.image='中断后的修改';r.fail('');const start=r.requests.length;
 await C.uploadState(config,state,{store,fetcher:r.fetch,chunkKB:512});
 assert.equal(r.requests.slice(start).filter(x=>x.method==='PUT'&&decodeURIComponent(new URL(x.url).pathname).endsWith(first)).length,0);
 assert.equal((await C.downloadState(config,{fetcher:r.fetch})).data.settings.image,'原始😀'.repeat(90000));assert.equal(await store.get('task'),undefined);
});
test('resume retains progress on wrong password or changed remote and reconciles a lost successful PUT response',async()=>{
 const r=repository(),store=stageStore(),state={settings:{image:'x'.repeat(300000)}};let lost=true;
 const fetcher=async(url,options)=>{const result=await r.fetch(url,options);if(lost&&options.method==='PUT'&&url.includes('part-0000')){lost=false;throw Error('response lost')}return result};
 await assert.rejects(C.uploadState(config,state,{store,fetcher,chunkKB:128}),/上传连接中断/);
 const task=await store.get('task');await assert.rejects(C.resumeState({...config,password:'wrong'},store,{fetcher:r.fetch}),/加密密码/);assert.ok(await store.get('task'));
 const before=r.requests.length;await C.resumeState(config,store,{fetcher:r.fetch});assert.equal(r.requests.slice(before).filter(x=>x.method==='PUT'&&x.url.includes('part-0000')).length,0);
 r.fail('part-0001');await assert.rejects(C.uploadState(config,state,{store,fetcher:r.fetch,chunkKB:128}),/GitHub 请求失败/);r.files.get(C.LATEST).sha='other-device';r.fail('');
 await assert.rejects(C.resumeState(config,store,{fetcher:r.fetch}),/其他设备更新/);assert.ok(await store.get('task'));
});

test('empty repository contents errors allow first whole and segmented uploads on the default branch',async()=>{
 for(const mode of ['whole','segmented','staged']){const r=repository(),fetcher=async(url,options)=>{if(!r.files.size&&new URL(url).pathname.includes('/contents/')){if((options.method||'GET')==='GET')return{ok:false,status:400,json:async()=>({message:'This repository is empty.'})};assert.equal(JSON.parse(options.body).branch,undefined,'first commit should let GitHub initialize its default branch')}return r.fetch(url,options)};
  const input={...config,branch:'main'};if(mode==='whole')await C.upload(input,new Uint8Array([1,2,3]),{singleFile:true,fetcher});else await C.uploadState(input,{settings:{x:1}},{fetcher,...(mode==='staged'?{store:stageStore()}: {})});assert.ok(r.files.has(C.LATEST));
 }
});
test('GitHub 400 details identify the failing step and file size without exposing credentials or encoded data',async()=>{
 const r=repository(),bytes=new Uint8Array([1,2,3]),fetcher=async(url,options)=>options.method==='PUT'?{ok:false,status:400,text:async()=>JSON.stringify({message:'Invalid branch '+config.token+' '+config.password+' '+'A'.repeat(200),errors:[{field:'branch',code:'invalid'}]})}:r.fetch(url,options);
 await assert.rejects(C.upload(config,bytes,{singleFile:true,fetcher}),error=>{assert.equal(error.status,400);assert.match(error.message,/上传备份文件/);assert.match(error.message,/Invalid branch/);assert.match(error.message,/branch:invalid/);assert.match(error.message,/MB/);assert.ok(!error.message.includes(config.token));assert.ok(!error.message.includes(config.password));assert.ok(!error.message.includes('A'.repeat(100)));return true});assert.ok(!r.files.has(C.LATEST));
});
test('nonempty-repository 400 failures are not mistaken for a missing snapshot',async()=>{
 const r=repository(),fetcher=async(url,options)=>new URL(url).pathname.includes('/contents/')?{ok:false,status:400,json:async()=>({message:'Invalid ref parameter'})}:r.fetch(url,options);await assert.rejects(C.connect(config,{fetcher}),/Invalid ref parameter/);
});

test('upload timeout scales with payload and network failures identify the upload stage',async()=>{
 assert.equal(C.transferTimeout('GET'),45000);assert.equal(C.transferTimeout('PUT',{content:'AAAA'}),180000);assert.equal(C.transferTimeout('PUT',{content:'A'.repeat(28*1048576)}),900000);
 assert.equal(C.transferTimeout('PUT',{content:'A'.repeat(8*1048576)}),270000);
 const r=repository();for(const timeout of [false,true]){const fetcher=async(url,options)=>{if(options.method==='PUT'){if(!timeout)throw TypeError('Failed to fetch');return new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(Object.assign(Error('abort'),{name:'AbortError'}))))}return r.fetch(url,options)};
 await assert.rejects(C.upload(config,new Uint8Array([1,2,3]),{singleFile:true,fetcher,timeoutMs:15}),error=>{assert.equal(error.code,timeout?'REQUEST_TIMEOUT':'NETWORK_ERROR');assert.match(error.message,timeout?/上传等待超时/:/上传连接中断/);assert.match(error.message,/MB/);assert.ok(!error.message.includes(config.token));return true});assert.ok(!r.files.has(C.LATEST));}
});

test('upload progress separates sending payload from publishing the completed snapshot',async()=>{
 const r=repository(),messages=[];await C.upload(config,new Uint8Array([1,2,3]),{singleFile:true,fetcher:r.fetch,onProgress:message=>messages.push(message)});assert.ok(messages.some(message=>message.includes('发送备份文件')));assert.ok(messages.some(message=>message.includes('发布最新备份')));assert.ok(r.files.has(C.LATEST));
});

test('browser upload reports real body progress and waits for GitHub success before publishing',async()=>{
 const r=repository(),messages=[],calls=[];
 const xhrFactory=()=>({upload:{},headers:{},open(method,url){this.method=method;this.url=url},setRequestHeader(name,value){this.headers[name]=value},abort(){this.onabort?.()},send(body){calls.push(this);queueMicrotask(async()=>{this.upload.onprogress({loaded:50,total:100,lengthComputable:true});this.upload.onload();const response=await r.fetch(this.url,{method:this.method,headers:this.headers,body});this.status=response.status;this.responseText=JSON.stringify(await response.json());this.onload()})}});
 await C.upload(config,new Uint8Array([1,2,3]),{singleFile:true,fetcher:r.fetch,xhrFactory,onProgress:message=>messages.push(message)});
 assert.equal(calls.length,2);assert.ok(messages.some(message=>message.includes('已发送 50%')));assert.ok(messages.some(message=>message.includes('文件已发送，等待 GitHub 保存确认')));assert.ok(messages.some(message=>message.includes('MB')));assert.ok(r.files.has(C.LATEST));
});
test('stalled browser uploads abort at the deadline and do not publish a backup',async()=>{
 const r=repository();let aborted=false;const xhrFactory=()=>({upload:{},open(){},setRequestHeader(){},send(){},abort(){aborted=true;this.onabort?.()}});
 await assert.rejects(C.upload(config,new Uint8Array([1,2,3]),{singleFile:true,fetcher:r.fetch,xhrFactory,timeoutMs:15}),error=>error.code==='REQUEST_TIMEOUT');assert.equal(aborted,true);assert.ok(!r.files.has(C.LATEST));
});

test('upload 401 rechecks the same token without resending the file or misreporting expiration',async()=>{
 for(const readStillWorks of [true,false]){const r=repository();let rejected=false,puts=0;const fetcher=async(url,options)=>{if(options.method==='PUT'){rejected=true;puts++;return{ok:false,status:401,json:async()=>({message:'Bad credentials'})}}if(rejected&&!readStillWorks)return{ok:false,status:401,json:async()=>({message:'Bad credentials'})};return r.fetch(url,options)};
 await assert.rejects(C.upload(config,new Uint8Array([1,2,3]),{singleFile:true,fetcher}),error=>{assert.equal(error.code,readStillWorks?'UPLOAD_AUTH_REJECTED':'TOKEN_AUTH_REJECTED');assert.match(error.message,readStillWorks?/仍可连接仓库/:/复查连接也被拒绝/);assert.ok(!error.message.includes(config.token));return true});assert.equal(puts,1);assert.ok(!r.files.has(C.LATEST));}
});
test('browsers without raw DEFLATE still create compressed standard ZIPs and can restore them',async()=>{
 const vm=require('node:vm'),fs=require('node:fs'),context={TextEncoder,TextDecoder,Response,Blob,Uint8Array,DataView,CompressionStream:class{constructor(format){if(format==='deflate-raw')throw TypeError('unsupported');return new CompressionStream(format)}},DecompressionStream:class{constructor(format){if(format==='deflate-raw')throw TypeError('unsupported');return new DecompressionStream(format)}}};vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../scripts/backup-core.js'),'utf8'),context);
 const text=JSON.stringify({text:'可压缩的备份资料'.repeat(20000)}),zip=await context.IrisBackup.zip(text),bytes=new Uint8Array(await zip.arrayBuffer());assert.ok(bytes.length<new TextEncoder().encode(text).length/10);assert.equal(new DataView(bytes.buffer).getUint16(8,true),8);assert.equal(new TextDecoder().decode(await context.IrisBackup.unzip(bytes)),text);assert.equal(new TextDecoder().decode(await B.unzip(bytes)),text);
 const native=await B.zip(text);assert.equal(new TextDecoder().decode(await context.IrisBackup.unzip(new Uint8Array(await native.arrayBuffer()))),text);
 bytes[30+new DataView(bytes.buffer).getUint16(26,true)+5]^=1;await assert.rejects(context.IrisBackup.unzip(bytes));
});

test('incremental compressed backups reuse media, upload only edited conversations and restore a full snapshot',async()=>{
 const r=repository(),store=stageStore(),state={users:[{name:'用户',avatar:crypto.randomBytes(700000).toString('base64')}],characters:[{name:'甲',avatar:crypto.randomBytes(700000).toString('base64')}],messages:{one:[{text:'旧聊天'}],two:[{text:'另一个聊天'}]},settings:{key:'private-api-key'}};
 const options={fetcher:r.fetch,store,incremental:true,chunkKB:256};
 const first=await C.uploadState(config,state,{...options,expectedSha:null});assert.equal(first.manifest.version,3);assert.ok(first.manifest.parts.some(part=>part.compression==='gzip'));assert.ok(first.manifest.parts.every(part=>part.bytes<=256*1024));assert.equal(first.manifest.rootHash,await C.fingerprint(state,{incremental:true,chunkKB:256}));
 state.messages.one.push({text:'新增的聊天记录'});const start=r.requests.length,second=await C.uploadState(config,state,{...options,expectedSha:first.sha});assert.ok(second.reusedParts>2);assert.ok(second.uploadedBytes<first.uploadedBytes/20);assert.ok(second.manifest.parts.some(part=>first.manifest.parts.some(old=>old.path===part.path)));assert.deepEqual((await C.downloadState(config,{fetcher:r.fetch})).data,state);
 assert.ok(r.requests.slice(start).filter(request=>request.method==='PUT').length<first.manifest.parts.length/2);assert.equal(second.manifest.parts.length,new Set(second.manifest.parts.map(part=>part.path)).size);
 const before=r.requests.length,unchanged=await C.uploadState(config,state,{...options,expectedSha:second.sha});assert.equal(unchanged.unchanged,true);assert.equal(unchanged.uploadedBytes,0);assert.equal(r.requests.slice(before).filter(request=>request.method==='PUT').length,0);
});
test('changing the incremental encryption password creates fresh ciphertext and preserves the previous snapshot',async()=>{
 const r=repository(),state={users:[],characters:[],messages:{one:[{text:'加密聊天'.repeat(10000)}]}};
 const old=await C.uploadState(config,state,{fetcher:r.fetch,incremental:true});const changed={...config,password:'new-backup-password'};
 const saved=await C.uploadState(changed,state,{fetcher:r.fetch,incremental:true,expectedSha:old.sha});assert.equal(saved.reusedParts,0);assert.notEqual(saved.manifest.crypto.salt,old.manifest.crypto.salt);assert.ok(saved.manifest.parts.every(part=>old.manifest.parts.every(previous=>part.path!==previous.path)));assert.deepEqual((await C.downloadState(changed,{fetcher:r.fetch})).data,state);await assert.rejects(C.downloadState(config,{fetcher:r.fetch}),/密码不正确/);assert.ok(old.manifest.parts.every(part=>r.files.has(part.path)));
});
test('incremental resume retains reused chunks and the original edited data after interruption',async()=>{
 const r=repository(),store=stageStore(),state={users:[{name:'用户'}],characters:[],messages:{one:[{text:'原始记录'}]},settings:{image:'x'.repeat(400000)}};
 const first=await C.uploadState(config,state,{fetcher:r.fetch,store,incremental:true,chunkKB:128});state.messages.one.push({text:'中断前的修改'});r.fail('part-');await assert.rejects(C.uploadState(config,state,{fetcher:r.fetch,store,incremental:true,chunkKB:128,expectedSha:first.sha}),/GitHub 请求失败/);const task=await store.get('task');assert.ok(task.reused.length>0);assert.equal(r.files.get(C.LATEST).sha,first.sha);state.messages.one.push({text:'中断后的修改不应混入'});r.fail('');const saved=await C.resumeState(config,store,{fetcher:r.fetch});assert.equal(saved.manifest.version,3);assert.equal((await C.downloadState(config,{fetcher:r.fetch})).data.messages.one.length,2);assert.equal(await store.get('task'),undefined);
});
test('incremental manifests reject unrelated paths and enforce decompression bounds',async()=>{
 const r=repository(),input={...config,encrypted:false},saved=await C.uploadState(input,{settings:{text:'x'.repeat(100000)}},{fetcher:r.fetch,incremental:true});const manifest=structuredClone(saved.manifest),part=manifest.parts.find(part=>part.compression==='gzip');assert.ok(part);const invalid=structuredClone(manifest);invalid.parts[0].path='iris-sync/snapshots/../../token';assert.throws(()=>C.validateManifest(invalid));part.plainBytes=1;r.files.get(C.LATEST).bytes=Buffer.from(JSON.stringify(manifest));await assert.rejects(C.downloadState(input,{fetcher:r.fetch}),/解压大小超过上限/);
});
test('a rejected browser upload switches transport once with the same credentials and publishes only after success',async()=>{
 const r=repository(),messages=[];let nativeCalls=0;const xhrFactory=()=>({upload:{},open(){},setRequestHeader(){},abort(){this.onabort?.()},send(){nativeCalls++;queueMicrotask(()=>{this.status=401;this.responseText=JSON.stringify({message:'Bad credentials'});this.onload()})}});
 const saved=await C.upload(config,new Uint8Array([1,2,3]),{fetcher:r.fetch,xhrFactory,singleFile:true,onProgress:message=>messages.push(message)});assert.equal(nativeCalls,1);assert.ok(messages.some(message=>message.includes('切换发送方式')));assert.ok(r.files.has(C.LATEST));assert.deepEqual((await C.downloadState(config,{fetcher:r.fetch})).bytes,new Uint8Array([1,2,3]));assert.equal(saved.manifest.mode,'whole');
});

test('repository setup resolves the account, creates only private owned repositories and reuses existing ones',async()=>{
 const r=repository();const fresh=await C.prepareRepository({token:config.token,repo:''},{fetcher:r.fetch,create:true});assert.equal(fresh.repo,'owner/iris-data');assert.equal(fresh.created,false);
 const made=await C.prepareRepository({token:config.token,repo:'my-iris-vault'},{fetcher:r.fetch,create:true});assert.equal(made.repo,'owner/my-iris-vault');assert.equal(made.created,true);const create=r.requests.find(request=>new URL(request.url).pathname==='/user/repos');assert.equal(create.body.private,true);assert.equal(create.body.auto_init,false);
 const count=r.requests.filter(request=>request.method==='POST').length;await C.prepareRepository({token:config.token,repo:made.repo},{fetcher:r.fetch,create:true});assert.equal(r.requests.filter(request=>request.method==='POST').length,count);
 await assert.rejects(C.prepareRepository({token:config.token,repo:'someone/private-data'},{fetcher:r.fetch,create:true}),/只能自动创建/);await assert.rejects(C.prepareRepository({token:config.token,repo:'missing'},{fetcher:r.fetch,create:false}));assert.ok(!r.repos.has('owner/missing'));r.setPrivate(false);await assert.rejects(C.prepareRepository(config,{fetcher:r.fetch,create:true}),/私有仓库/);assert.throws(()=>C.parseRepo('owner/..'));
});
test('binary archive upload sends original encrypted bytes in bounded assets and restores the full archive',async()=>{
 const r=repository(),store=stageStore(),bytes=new Uint8Array(crypto.randomBytes(8*1048576+1234));const messages=[],saved=await C.uploadArchive(config,bytes,{fetcher:r.fetch,store,expectedSha:null,onProgress:message=>messages.push(message)});assert.ok(messages.some(message=>message.includes('每段最多 8 MB，本次共 2 段')));assert.ok(messages.some(message=>message.includes('第 1/2 段')));assert.ok(messages.some(message=>message.includes('第 2/2 段')));assert.equal(saved.manifest.version,4);assert.equal(saved.manifest.parts.length,2);assert.equal(saved.manifest.archiveBytes,bytes.length);assert.equal(saved.manifest.byteLength,bytes.length+32);assert.ok([...r.assets.values()].every(asset=>asset.bytes.length<=8*1048576+16));assert.deepEqual([...r.files.keys()].sort(),['iris-sync/latest.json','iris-sync/storage.json']);
 const uploads=r.requests.filter(request=>new URL(request.url).hostname==='uploads.github.com');assert.equal(uploads.length,2);assert.ok(uploads.every(request=>request.body instanceof Uint8Array));assert.equal(uploads.reduce((total,request)=>total+request.body.byteLength,0),bytes.length+32);assert.equal(await store.get('task'),undefined);assert.ok([...r.releases.values()].every(release=>release.draft===false));assert.deepEqual((await C.downloadState(config,{fetcher:r.fetch})).bytes,bytes);
 await assert.rejects(C.downloadState({...config,password:'wrong-password'},{fetcher:r.fetch}),/密码不正确/);r.assets.get(saved.manifest.parts[0].assetId).bytes[10]^=1;await assert.rejects(C.downloadState(config,{fetcher:r.fetch}),/附件校验失败/);
});
test('archive resume keeps confirmed assets and the original password and does not resend them',async()=>{
 const r=repository(),store=stageStore(),bytes=new Uint8Array(crypto.randomBytes(8*1048576+123));r.fail('block-0001');await assert.rejects(C.uploadArchive(config,bytes,{fetcher:r.fetch,store}),/GitHub 请求失败/);const task=await store.get('task');assert.equal(task.kind,'archive');assert.ok(task.manifest.releaseId);assert.equal(r.assets.size,1);assert.ok(!r.files.has(C.LATEST));
 await assert.rejects(C.resumeState({...config,password:'wrong-password'},store,{fetcher:r.fetch}),error=>error.code==='RESUME_PASSWORD_MISMATCH');assert.ok(await store.get('task'));r.fail('');const before=r.requests.length;await C.resumeState(config,store,{fetcher:r.fetch});assert.equal(r.requests.slice(before).filter(request=>new URL(request.url).hostname==='uploads.github.com'&&request.url.includes('block-0000')).length,0);assert.equal(r.releases.size,1);assert.deepEqual((await C.downloadState(config,{fetcher:r.fetch})).bytes,bytes);
});
test('a lost asset response is reconciled by digest before another upload is attempted',async()=>{
 const r=repository(),store=stageStore(),bytes=new Uint8Array([1,2,3]);let lost=true;const fetcher=async(url,options)=>{const response=await r.fetch(url,options);if(lost&&new URL(url).hostname==='uploads.github.com'){lost=false;throw TypeError('Response lost')}return response};await C.uploadArchive(config,bytes,{fetcher,store});assert.equal(r.requests.filter(request=>new URL(request.url).hostname==='uploads.github.com').length,1);assert.deepEqual((await C.downloadState(config,{fetcher:r.fetch})).bytes,bytes);
});
test('a lost release-creation response retains the checkpoint and resumes the same draft',async()=>{
 const r=repository(),store=stageStore();let lost=true;const fetcher=async(url,options)=>{const response=await r.fetch(url,options);if(lost&&options.method==='POST'&&new URL(url).pathname.endsWith('/releases')){lost=false;throw TypeError('Response lost')}return response};await assert.rejects(C.uploadArchive(config,new Uint8Array([1,2,3]),{fetcher,store}));assert.equal(r.releases.size,1);assert.ok(await store.get('task'));await C.resumeState(config,store,{fetcher:r.fetch});assert.equal(r.releases.size,1);assert.ok(r.files.has(C.LATEST));
});
test('persistent attachment authentication failures retain resume data and never publish an incomplete backup',async()=>{
 const r=repository(),store=stageStore();let attempts=0;const fetcher=async(url,options)=>{if(new URL(url).hostname==='uploads.github.com'){attempts++;return{ok:false,status:401,json:async()=>({message:'Bad credentials'})}}return r.fetch(url,options)};await assert.rejects(C.uploadArchive(config,new Uint8Array([1,2,3]),{fetcher,store}),error=>error.code==='UPLOAD_AUTH_REJECTED');assert.equal(attempts,2);assert.ok(await store.get('task'));assert.ok(!r.files.has(C.LATEST));assert.ok([...r.releases.values()].every(release=>release.draft===true));
});
test('archive publication conflicts preserve the existing complete backup and staged data',async()=>{
 const r=repository(),old=await C.uploadState(config,{users:[],characters:[],messages:{}},{fetcher:r.fetch,incremental:true}),store=stageStore();r.race(true);await assert.rejects(C.uploadArchive(config,new Uint8Array([1,2,3]),{fetcher:r.fetch,store,expectedSha:old.sha}),/仓库内容已变化/);assert.equal(r.files.get(C.LATEST).sha,old.sha);assert.ok(await store.get('task'));r.race(false);await C.resumeState(config,store,{fetcher:r.fetch});assert.deepEqual((await C.downloadState(config,{fetcher:r.fetch})).bytes,new Uint8Array([1,2,3]));
});
