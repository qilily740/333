const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
let JSDOM,VirtualConsole;try{({JSDOM,VirtualConsole}=require('./helpers/jsdom.cjs'))}catch{}
const {repository}=require('./helpers/github-repository.cjs'),root=path.join(__dirname,'..');
const wait=async check=>{for(let i=0;i<600;i++){if(check())return;await new Promise(resolve=>setTimeout(resolve,10))}throw Error('Timed out waiting for sync')};
function boot(repo,{savedLocal={},savedSession={},idbRecords=null,autoPassword=true}={}){
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,''),errors=[],snapshots=[];
 let recovery=null;
 const dom=new JSDOM(html,{url:'http://localhost/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:new VirtualConsole(),beforeParse(w){
  for(const [key,value] of Object.entries(savedLocal))w.localStorage.setItem(key,value);
  for(const [key,value] of Object.entries(savedSession))w.sessionStorage.setItem(key,value);
  if(idbRecords)Object.defineProperty(w,'indexedDB',{value:{open(){const request={};queueMicrotask(()=>{request.result={transaction(){const tx={};tx.objectStore=()=>({get(key){const r={};queueMicrotask(()=>{r.result=structuredClone(idbRecords.get(key));r.onsuccess?.();tx.oncomplete?.()});return r},put(value,key){const r={};queueMicrotask(()=>{idbRecords.set(key,structuredClone(value));r.onsuccess?.();tx.oncomplete?.()});return r},clear(){const r={};queueMicrotask(()=>{idbRecords.clear();r.onsuccess?.();tx.oncomplete?.()});return r}});return tx}};request.onsuccess?.()});return request}}});
  w.IRIS_BOOT_STATE={char:0,user:0,users:[{name:'用户',details:'原始资料'}],characters:[{name:'甲',chatSettings:{userIndex:0}}],messages:{'0-0-chat':[{mine:true,text:'完整备份测试'}]},settings:{apiConfigs:[{id:'api',name:'测试',key:'fixture-api-secret',url:'https://fixture.invalid',models:[],model:''}]}};
  const interval=w.setInterval.bind(w);w.setInterval=(fn,ms,...args)=>{if(fn.name==='automaticTick')w.runAutomaticUpload=fn;return interval(fn,ms,...args)};
  w.IRIS_STYLES_READY=Promise.resolve();Object.defineProperty(w,'crypto',{value:require('node:crypto').webcrypto});
  w.XMLHttpRequest=undefined;w.Blob=global.Blob;w.Response=global.Response;w.CompressionStream=global.CompressionStream;w.DecompressionStream=global.DecompressionStream;w.AbortController=global.AbortController;
  w.fetch=async(url,options)=>String(url).startsWith('assets/earth-cities.json')?{ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(root,'assets/earth-cities.json'),'utf8'))}:repo.fetch(url,options);
  w.confirm=()=>true;w.scrollTo=()=>{};w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
  w.passwordPromptTitles=[];w.HTMLDialogElement.prototype.showModal=function(){this.open=true;if(this.matches('.github-password-dialog'))w.passwordPromptTitles.push(this.querySelector('h3').textContent);if(autoPassword&&this.matches('.github-password-dialog'))queueMicrotask(()=>{this.querySelectorAll('input').forEach(input=>input.value=w.testBackupPassword||'only-for-testing');this.querySelector('form').dispatchEvent(new w.Event('submit',{cancelable:true}))})};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};
  w.IrisStorage={flush:async()=>{},save:async value=>snapshots.push(JSON.parse(JSON.stringify(value))),saveRecovery:async value=>{recovery={data:JSON.parse(JSON.stringify(value))}},readRecovery:async()=>recovery};w.addEventListener('error',event=>errors.push(event.error?.stack||event.message));
 }});
 const scripts=JSON.parse(fs.readFileSync(path.join(root,'scripts/storage-bootstrap.js'),'utf8').match(/const scripts = (\[[^\n]+\]);/)[1].replace(/'/g,'"'));
 for(const name of scripts){const tag=dom.window.document.createElement('script');Object.defineProperty(tag,'src',{value:'http://localhost/'+name});tag.textContent=fs.readFileSync(path.join(root,name),'utf8');dom.window.document.body.append(tag)}
 const w=dom.window;w.openSettings();w.eval("systemSettingsTab='storage';refreshSettings()");return{w,errors,snapshots};
}
function connectFields(f){f.w.document.querySelector('[data-storage-connection="github"]').click();const q=selector=>f.w.document.querySelector(selector);q('[data-github-config="token"]').value='fixture-token';q('[data-github-config="repo"]').value='owner/iris-data';const mode=q('[data-github-config="uploadMode"]');mode.value='incremental';mode.dispatchEvent(new f.w.Event('change'));return q}

test('storage has compact local/GitHub categories and credentials stay outside Iris backup data',{skip:!JSDOM},async()=>{
 const r=repository(),f=boot(r);try{
  assert.ok(f.w.document.querySelector('#exportData'));assert.deepEqual(Array.from(f.w.document.querySelectorAll('[data-storage-connection]'),node=>node.textContent),['本地备份','GitHub 同步']);
  const q=connectFields(f);assert.equal(q('#exportData'),null);q('[data-github-action="connect"]').click();await wait(()=>q('[data-github-status]').textContent.includes('连接成功'));
  assert.equal(q('.github-sync-heading'),null);assert.equal(q('.github-advanced').open,false);assert.deepEqual(Array.from(q('[data-github-config="autoMinutes"]').options,node=>node.textContent),['关闭','每 5 分钟','每 15 分钟','每 30 分钟','每 1 小时','每 2 小时']);
  assert.deepEqual(Array.from(q('[data-github-config="chunkKB"]').options,node=>node.value),['128','256','512']);
  const stored=JSON.parse(f.w.localStorage.getItem('iris-github-sync-connection-v1'));assert.equal(stored.token,'fixture-token');assert.equal(stored.rememberToken,true);assert.equal(stored.repo,'owner/iris-data');assert.ok(!f.w.eval('JSON.stringify(state)').includes('fixture-token'));
  q('[data-github-config="rememberToken"]').checked=true;q('[data-github-config="rememberToken"]').dispatchEvent(new f.w.Event('change'));assert.equal(JSON.parse(f.w.localStorage.getItem('iris-github-sync-connection-v1')).token,'fixture-token');
  q('[data-storage-connection="local"]').click();assert.ok(q('#exportData'));assert.equal(q('[data-github-config="token"]'),null);assert.deepEqual(f.errors,[]);
 }finally{await new Promise(resolve=>setImmediate(resolve));f.w.close()}
});

test('encrypted upload and download show a restore preview before any local data changes',{skip:!JSDOM},async()=>{
 const r=repository(),f=boot(r);try{
  const q=connectFields(f);q('[data-github-action="upload"]').click();await wait(()=>q('[data-github-status]').textContent.includes('完整备份已上传'));
  const latest=JSON.parse(r.files.get('iris-sync/latest.json').bytes.toString());assert.equal(latest.encrypted,true);
  assert.equal(latest.version,3);assert.ok(!f.w.localStorage.getItem('iris-github-sync-connection-v1').includes('only-for-testing'));
  f.w.eval("state.users[0].details='本地临时修改'");q('[data-github-action="download"]').click();await wait(()=>q('#restoreBackup'));
  assert.equal(f.w.eval('state.users[0].details'),'本地临时修改');assert.equal(q('[data-github-config="autoMinutes"]').value,'0');
  assert.match(q('#backupPreview').textContent,/备份内容已通过校验/);q('#restoreBackup').click();await wait(()=>q('#storageFeedback').textContent.includes('恢复完成'));
  assert.equal(f.w.eval('state.users[0].details'),'原始资料');assert.ok(f.w.eval("state.settings.apiConfigs.some(config=>config.key==='fixture-api-secret')"));assert.ok(!r.files.get(latest.parts[0].path).bytes.toString().includes('fixture-api-secret'));assert.deepEqual(f.errors,[]);
  assert.equal((await f.w.IrisStorage.readRecovery()).data.users[0].details,'本地临时修改');
 }finally{await new Promise(resolve=>setImmediate(resolve));f.w.close()}
});

test('chosen automatic interval skips unchanged data and stops rather than overwriting another device', {skip:!JSDOM},async()=>{
 const r=repository(),f=boot(r);try{
  let now=Date.now();f.w.Date.now=()=>now;const q=connectFields(f),select=q('[data-github-config="autoMinutes"]');select.value='5';select.dispatchEvent(new f.w.Event('change'));
  now+=4*60000;f.w.runAutomaticUpload();assert.equal(r.requests.filter(x=>x.method==='PUT').length,0);
  now+=60000;q('[data-github-action="upload"]').click();await wait(()=>q('[data-github-status]').textContent.includes('完整备份已上传'));
  const first=r.files.get('iris-sync/latest.json').sha,writes=r.requests.filter(x=>x.method==='PUT').length;
  now+=5*60000;f.w.runAutomaticUpload();await wait(()=>q('[data-github-status]').textContent.includes('无需重复上传'));assert.equal(r.requests.filter(x=>x.method==='PUT').length,writes);
  select.value='30';select.dispatchEvent(new f.w.Event('change'));f.w.eval("state.users[0].details='修改后'");now+=15*60000;f.w.runAutomaticUpload();assert.equal(r.files.get('iris-sync/latest.json').sha,first);
  now+=15*60000;f.w.runAutomaticUpload();await wait(()=>r.files.get('iris-sync/latest.json').sha!==first);await wait(()=>!q('[data-github-action="upload"]').disabled);
  r.files.get('iris-sync/latest.json').sha='another-device';f.w.eval("state.users[0].details='再次修改'");now+=30*60000;f.w.runAutomaticUpload();await wait(()=>q('[data-github-status]').textContent.includes('自动备份已暂停'));assert.equal(r.files.get('iris-sync/latest.json').sha,'another-device');assert.equal(select.value,'0');assert.deepEqual(f.errors,[]);
 }finally{await new Promise(resolve=>setImmediate(resolve));f.w.close()}
});

test('a failed local safety copy blocks GitHub restore without replacing current data',{skip:!JSDOM},async()=>{
 const r=repository(),f=boot(r);try{
  const q=connectFields(f);q('[data-github-action="upload"]').click();await wait(()=>q('[data-github-status]').textContent.includes('完整备份已上传'));
  f.w.eval("state.users[0].details='必须保留'");q('[data-github-action="download"]').click();await wait(()=>q('#restoreBackup'));
  f.w.IrisStorage.saveRecovery=async()=>{throw Error('本机副本写入失败')};q('#restoreBackup').click();await wait(()=>q('#storageFeedback').textContent.includes('恢复失败'));
  assert.equal(f.w.eval('state.users[0].details'),'必须保留');assert.deepEqual(f.errors,[]);
 }finally{await new Promise(resolve=>setImmediate(resolve));f.w.close()}
});

test('wrong passwords clear stale previews and failed writes keep cloud backup and local data intact',{skip:!JSDOM},async()=>{
 const r=repository(),f=boot(r);try{
  const q=connectFields(f);q('[data-github-action="upload"]').click();await wait(()=>q('[data-github-status]').textContent.includes('完整备份已上传'));
  const sha=r.files.get('iris-sync/latest.json').sha,before=f.w.eval('JSON.stringify(state)');f.w.testBackupPassword='wrong-password';q('[data-github-action="download"]').click();await wait(()=>q('[data-github-status]').textContent.includes('密码不正确'));
  assert.equal(q('#restoreBackup'),null);assert.equal(f.w.eval('JSON.stringify(state)'),before);assert.equal(r.files.get('iris-sync/latest.json').sha,sha);assert.deepEqual(f.errors,[]);
 }finally{await new Promise(resolve=>setImmediate(resolve));f.w.close()}
});

test('whole upload is selectable and restores automatically with its chosen format',{skip:!JSDOM},async()=>{
 const r=repository(),f=boot(r);try{
  const q=connectFields(f),mode=q('[data-github-config="uploadMode"]');
  assert.deepEqual(Array.from(mode.options,node=>node.textContent),['增量上传（推荐）','一次性上传','分片上传']);
  mode.value='whole';mode.dispatchEvent(new f.w.Event('change'));
  assert.equal(q('[data-github-config="chunkKB"]').disabled,true);assert.equal(q('[data-github-action="upload"]').textContent,'一次性上传');
  q('[data-github-action="upload"]').click();await wait(()=>q('[data-github-status]').textContent.includes('完整备份已上传'));
  const manifest=JSON.parse(r.files.get('iris-sync/latest.json').bytes.toString());assert.equal(manifest.mode,'archive');assert.equal(manifest.version,4);assert.equal(manifest.parts.length,1);
  f.w.eval("state.users[0].details='临时更改'");q('[data-github-action="download"]').click();await wait(()=>q('#restoreBackup'));
  q('#restoreBackup').click();await wait(()=>q('#storageFeedback').textContent.includes('恢复完成'));assert.equal(f.w.eval('state.users[0].details'),'原始资料');
  assert.equal(JSON.parse(f.w.localStorage.getItem('iris-github-sync-connection-v1')).uploadMode,'whole');assert.deepEqual(f.errors,[]);
 }finally{await new Promise(resolve=>setImmediate(resolve));f.w.close()}
});

test('interrupted upload offers continue after remount and never resends successful pieces',{skip:!JSDOM},async()=>{
 const r=repository(),f=boot(r);try{
  let q=connectFields(f);f.w.eval("state.users[0].details='原始'.repeat(300000)");r.fail('part-0001');
  q('[data-github-action="upload"]').click();await wait(()=>q('[data-github-action="upload"]').textContent==='继续上传'&&!q('[data-github-action="upload"]').disabled);
  assert.match(q('[data-github-status]').textContent,/进度已保留/);const first=[...r.files.keys()].find(key=>key.endsWith('part-0000.bin'));assert.ok(first);
  f.w.eval("state.users[0].details='后来的资料'");q('[data-storage-connection="local"]').click();q('[data-storage-connection="github"]').click();
  await wait(()=>q('[data-github-action="upload"]').textContent==='继续上传');r.fail('');const before=r.requests.length;
  q('[data-github-action="upload"]').click();await wait(()=>q('[data-github-status]').textContent.includes('完整备份已上传'));
  assert.equal(r.requests.slice(before).filter(x=>x.method==='PUT'&&decodeURIComponent(new URL(x.url).pathname).endsWith(first)).length,0);
  q('[data-github-action="download"]').click();await wait(()=>q('#restoreBackup'));q('#restoreBackup').click();await wait(()=>q('#storageFeedback').textContent.includes('恢复完成'));
  assert.equal(f.w.eval('state.users[0].details'),'原始'.repeat(300000));assert.deepEqual(f.errors,[]);
 }finally{await new Promise(resolve=>setImmediate(resolve));f.w.close()}
});

for(const backend of ['indexeddb','fallback'])test(`resume survives a fresh page session using ${backend} without uploading completed chunks again`,{skip:!JSDOM},async()=>{
 const r=repository(),idbRecords=backend==='indexeddb'?new Map():null;let f=boot(r,{idbRecords});try{
  let q=connectFields(f);f.w.eval("state.users[0].details='刷新前'.repeat(140000)");r.fail('part-0001');q('[data-github-action="upload"]').click();
  await wait(()=>q('[data-github-action="upload"]').textContent==='继续上传'&&!q('[data-github-action="upload"]').disabled);
  const first=[...r.files.keys()].find(key=>key.endsWith('part-0000.bin')),savedLocal=Object.fromEntries(Object.keys(f.w.localStorage).map(key=>[key,f.w.localStorage.getItem(key)]));
  f.w.close();f=boot(r,{savedLocal,idbRecords});q=connectFields(f);await wait(()=>q('[data-github-action="upload"]').textContent==='继续上传');
  r.fail('');const before=r.requests.length;q('[data-github-action="upload"]').click();await wait(()=>q('[data-github-status]').textContent.includes('完整备份已上传'));
  assert.equal(r.requests.slice(before).filter(x=>x.method==='PUT'&&decodeURIComponent(new URL(x.url).pathname).endsWith(first)).length,0);
  q('[data-github-action="download"]').click();await wait(()=>q('#restoreBackup'));q('[name="backupMode"][value="replace"]').checked=true;q('#restoreBackup').click();await wait(()=>q('#storageFeedback').textContent.includes('恢复完成'));
  assert.equal(f.w.eval("state.users.some(user=>user.details==='刷新前'.repeat(140000))"),true);assert.deepEqual(f.errors,[]);
 }finally{await new Promise(resolve=>setImmediate(resolve));f.w.close()}
});

test('password appears only during encrypted actions, confirms new passwords and can cancel without uploading',{skip:!JSDOM},async()=>{
 const r=repository(),f=boot(r,{autoPassword:false});try{
  const q=connectFields(f);assert.equal(q('[data-password-value]'),null);assert.equal(q('[data-github-password]'),null);assert.match(q('.github-encryption-option').textContent,/恢复时用同一密码/);
  q('[data-github-action="connect"]').click();await wait(()=>q('[data-github-status]').textContent.includes('连接成功'));assert.equal(q('.github-password-dialog'),null);
  q('[data-github-action="upload"]').click();await wait(()=>q('.github-password-dialog'));assert.match(q('#githubPasswordTitle').textContent,/设置备份密码/);assert.match(q('#githubPasswordPurpose').textContent,/必须输入同一个密码/);
  q('[data-password-value]').value='test-password';q('[data-password-confirm]').value='different';q('.github-password-dialog form').dispatchEvent(new f.w.Event('submit',{cancelable:true}));assert.match(q('.github-password-error').textContent,/不一致/);assert.equal(r.requests.filter(x=>x.method==='PUT').length,0);
  q('[data-password-cancel]').click();await wait(()=>!q('[data-github-action="upload"]').disabled);assert.equal(q('.github-password-dialog'),null);assert.equal(r.requests.filter(x=>x.method==='PUT').length,0);
  q('[data-github-action="upload"]').click();await wait(()=>q('.github-password-dialog'));q('[data-password-value]').value='test-password';q('[data-password-confirm]').value='test-password';q('.github-password-dialog form').dispatchEvent(new f.w.Event('submit',{cancelable:true}));await wait(()=>q('[data-github-status]').textContent.includes('完整备份已上传'));assert.equal(q('.github-password-dialog'),null);assert.ok(!f.w.localStorage.getItem('iris-github-sync-connection-v1').includes('test-password'));
  const toggle=q('[data-github-config="encrypted"]');toggle.checked=false;toggle.dispatchEvent(new f.w.Event('change'));
  q('[data-github-action="download"]').click();await wait(()=>q('.github-password-dialog'));assert.match(q('#githubPasswordTitle').textContent,/输入解密密码/);assert.equal(q('[data-password-confirm]'),null);assert.equal(q('[data-password-value]').value,'');q('[data-password-cancel]').click();await wait(()=>!q('[data-github-action="download"]').disabled);assert.equal(q('#restoreBackup'),null);assert.equal(f.w.eval('state.users[0].details'),'原始资料');assert.deepEqual(f.errors,[]);
 }finally{await new Promise(resolve=>setImmediate(resolve));f.w.close()}
});

test('unencrypted upload and restore never ask for a password',{skip:!JSDOM},async()=>{
 const r=repository(),f=boot(r,{autoPassword:false});try{
  const q=connectFields(f),toggle=q('[data-github-config="encrypted"]');toggle.checked=false;toggle.dispatchEvent(new f.w.Event('change'));q('[data-github-action="upload"]').click();await wait(()=>q('[data-github-status]').textContent.includes('完整备份已上传'));assert.equal(q('.github-password-dialog'),null);assert.equal(JSON.parse(r.files.get('iris-sync/latest.json').bytes.toString()).encrypted,false);
  q('[data-github-action="download"]').click();await wait(()=>q('#restoreBackup'));assert.equal(q('.github-password-dialog'),null);assert.deepEqual(f.errors,[]);
 }finally{await new Promise(resolve=>setImmediate(resolve));f.w.close()}
});

test('enabling encryption opens password setup immediately and upload reuses that password',{skip:!JSDOM},async()=>{
 const r=repository(),f=boot(r,{autoPassword:false});try{
  const q=connectFields(f),toggle=q('[data-github-config="encrypted"]');toggle.checked=false;toggle.dispatchEvent(new f.w.Event('change'));
  toggle.checked=true;toggle.dispatchEvent(new f.w.Event('change'));await wait(()=>q('.github-password-dialog'));assert.match(q('#githubPasswordTitle').textContent,/设置备份密码/);assert.equal(q('.github-password-dialog [type="submit"]').textContent,'确认设置');
  q('[data-password-cancel]').click();await wait(()=>!q('[data-github-action="upload"]').disabled);assert.equal(toggle.checked,false);assert.equal(JSON.parse(f.w.localStorage.getItem('iris-github-sync-connection-v1')).encrypted,false);
  toggle.checked=true;toggle.dispatchEvent(new f.w.Event('change'));await wait(()=>q('.github-password-dialog'));q('[data-password-value]').value='toggle-password';q('[data-password-confirm]').value='toggle-password';q('.github-password-dialog form').dispatchEvent(new f.w.Event('submit',{cancelable:true}));await wait(()=>!q('[data-github-action="upload"]').disabled);assert.equal(toggle.checked,true);assert.match(q('.github-encryption-option small').textContent,/密码已设置/);assert.equal(r.requests.filter(x=>x.method==='PUT').length,0);
  q('[data-github-action="upload"]').click();await wait(()=>q('[data-github-status]').textContent.includes('完整备份已上传'));assert.equal(q('.github-password-dialog'),null);assert.equal(JSON.parse(r.files.get('iris-sync/latest.json').bytes.toString()).encrypted,true);assert.ok(!f.w.localStorage.getItem('iris-github-sync-connection-v1').includes('toggle-password'));assert.deepEqual(f.errors,[]);
 }finally{await new Promise(resolve=>setImmediate(resolve));f.w.close()}
});

test('encryption can be toggled off and on while keeping the original password until explicitly changed',{skip:!JSDOM},async()=>{
 const r=repository(),f=boot(r,{autoPassword:false});try{
  const q=connectFields(f),toggle=q('[data-github-config="encrypted"]');q('[data-github-action="password"]').click();await wait(()=>q('.github-password-dialog'));q('[data-password-value]').value='first-password';q('[data-password-confirm]').value='first-password';q('.github-password-dialog form').dispatchEvent(new f.w.Event('submit',{cancelable:true}));await wait(()=>!q('[data-github-action="upload"]').disabled);
  toggle.checked=false;toggle.dispatchEvent(new f.w.Event('change'));assert.equal(q('[data-github-action="password"]').hidden,true);
  toggle.checked=true;toggle.dispatchEvent(new f.w.Event('change'));assert.equal(q('.github-password-dialog'),null);assert.match(q('.github-encryption-option small').textContent,/密码已设置/);assert.equal(q('[data-github-action="password"]').textContent,'重新设置');
  q('[data-github-action="password"]').click();await wait(()=>q('.github-password-dialog'));q('[data-password-cancel]').click();await wait(()=>!q('[data-github-action="upload"]').disabled);assert.equal(toggle.checked,true);
  q('[data-github-action="upload"]').click();await wait(()=>q('[data-github-status]').textContent.includes('完整备份已上传'));assert.equal(q('.github-password-dialog'),null);
  const restored=await f.w.IrisGitHubSyncCore.downloadState({repo:'owner/iris-data',token:'fixture-token',password:'first-password'});assert.equal(restored.data.users[0].details,'原始资料');
  q('[data-github-action="password"]').click();await wait(()=>q('.github-password-dialog'));q('[data-password-value]').value='second-password';q('[data-password-confirm]').value='second-password';q('.github-password-dialog form').dispatchEvent(new f.w.Event('submit',{cancelable:true}));await wait(()=>!q('[data-github-action="upload"]').disabled);
  q('[data-github-action="upload"]').click();await wait(()=>!q('[data-github-action="upload"]').disabled);await assert.rejects(f.w.IrisGitHubSyncCore.downloadState({repo:'owner/iris-data',token:'fixture-token',password:'first-password'}),/密码不正确/);assert.equal((await f.w.IrisGitHubSyncCore.downloadState({repo:'owner/iris-data',token:'fixture-token',password:'second-password'})).data.users[0].details,'原始资料');assert.deepEqual(f.errors,[]);
 }finally{await new Promise(resolve=>setImmediate(resolve));f.w.close()}
});

test('setting a password before filling repository details is retained for the first whole upload',{skip:!JSDOM},async()=>{
 const r=repository(),f=boot(r);try{
  f.w.document.querySelector('[data-storage-connection="github"]').click();const q=selector=>f.w.document.querySelector(selector);q('[data-github-action="password"]').click();await wait(()=>!q('[data-github-action="upload"]').disabled);assert.equal(f.w.passwordPromptTitles.length,1);
  q('[data-github-config="repo"]').value='owner/iris-data';q('[data-github-config="token"]').value='fixture-token';const mode=q('[data-github-config="uploadMode"]');mode.value='whole';mode.dispatchEvent(new f.w.Event('change'));q('[data-github-action="upload"]').click();await wait(()=>q('[data-github-status]').textContent.includes('完整备份已上传'));assert.equal(f.w.passwordPromptTitles.length,1);assert.equal(JSON.parse(r.files.get('iris-sync/latest.json').bytes.toString()).mode,'archive');assert.deepEqual(f.errors,[]);
 }finally{await new Promise(resolve=>setImmediate(resolve));f.w.close()}
});
test('retrying an interrupted upload reuses the current session password while restore still asks to decrypt',{skip:!JSDOM},async()=>{
 const r=repository(),f=boot(r);try{
  const q=connectFields(f);f.w.eval("state.users[0].details='测试'.repeat(300000)");r.fail('part-0001');q('[data-github-action="upload"]').click();await wait(()=>q('[data-github-action="upload"]').textContent==='继续上传'&&!q('[data-github-action="upload"]').disabled);assert.equal(f.w.passwordPromptTitles.length,1);
  r.fail('');q('[data-github-action="upload"]').click();await wait(()=>q('[data-github-status]').textContent.includes('完整备份已上传'));assert.equal(f.w.passwordPromptTitles.length,1);q('[data-github-action="download"]').click();await wait(()=>q('#restoreBackup'));assert.equal(f.w.passwordPromptTitles.length,2);assert.equal(f.w.passwordPromptTitles.at(-1),'输入解密密码');assert.deepEqual(f.errors,[]);
 }finally{await new Promise(resolve=>setImmediate(resolve));f.w.close()}
});

test('token guide precedes repository and a fresh browser session retains password and token',{skip:!JSDOM},async()=>{
 const r=repository();let f=boot(r);try{
  let q=connectFields(f);const guide=q('.github-token-guide');assert.equal(guide.open,true);q('[data-storage-connection="local"]').click();q('[data-storage-connection="github"]').click();assert.equal(q('.github-token-guide').open,false);q=connectFields(f);assert.equal(guide.querySelectorAll('span').length,6);assert.match(guide.textContent,/All repositories/);assert.match(guide.textContent,/Contents → Read and write/);assert.ok(q('.github-token-guide').compareDocumentPosition(q('[data-github-config="repo"]'))&4);
  q('[data-github-action="password"]').click();await wait(()=>!q('[data-github-action="upload"]').disabled);
  const savedLocal=Object.fromEntries(Object.keys(f.w.localStorage).map(k=>[k,f.w.localStorage.getItem(k)])),savedSession=Object.fromEntries(Object.keys(f.w.sessionStorage).map(k=>[k,f.w.sessionStorage.getItem(k)]));assert.equal(savedLocal['iris-github-sync-device-password-v1'],'only-for-testing');assert.equal(savedSession['iris-github-sync-session-password-v1'],undefined);assert.ok(!f.w.eval('JSON.stringify(state)').includes('only-for-testing'));
  f.w.close();f=boot(r,{savedLocal,autoPassword:false});f.w.document.querySelector('[data-storage-connection="github"]').click();q=selector=>f.w.document.querySelector(selector);assert.equal(q('[data-github-config="token"]').value,'fixture-token');assert.equal(q('.github-token-guide').open,false);q('[data-github-action="upload"]').click();await wait(()=>q('[data-github-status]').textContent.includes('完整备份已上传'));assert.equal(f.w.passwordPromptTitles.length,0);
  q('[data-github-action="disconnect"]').click();assert.equal(f.w.localStorage.getItem('iris-github-sync-device-password-v1'),null);assert.deepEqual(f.errors,[]);
 }finally{f.w.close()}
});

test('remember Token defaults on but an explicit opt-out survives restarting the page',{skip:!JSDOM},async()=>{
 const r=repository();let f=boot(r);try{let q=connectFields(f);const toggle=q('[data-github-config="rememberToken"]');assert.equal(toggle.checked,true);toggle.checked=false;toggle.dispatchEvent(new f.w.Event('change'));const savedLocal=Object.fromEntries(Object.keys(f.w.localStorage).map(k=>[k,f.w.localStorage.getItem(k)]));assert.equal(JSON.parse(savedLocal['iris-github-sync-connection-v1']).token,'');await new Promise(resolve=>setImmediate(resolve));f.w.close();f=boot(r,{savedLocal});f.w.document.querySelector('[data-storage-connection="github"]').click();q=s=>f.w.document.querySelector(s);assert.equal(q('[data-github-config="rememberToken"]').checked,false);assert.equal(q('[data-github-config="token"]').value,'');}finally{await new Promise(resolve=>setImmediate(resolve));f.w.close()}
});

test('binary attachment authentication failure retries safely without changing the password',{skip:!JSDOM},async()=>{
 const r=repository(),original=r.fetch;let rejected=false;r.fetch=async(url,options)=>{if(!rejected&&new URL(url).hostname==='uploads.github.com'){rejected=true;return{ok:false,status:401,json:async()=>({message:'Bad credentials'})}}return original(url,options)};const f=boot(r);try{
  const q=connectFields(f),mode=q('[data-github-config="uploadMode"]');mode.value='whole';mode.dispatchEvent(new f.w.Event('change'));q('[data-github-action="upload"]').click();await wait(()=>q('[data-github-status]').textContent.includes('完整备份已上传'));assert.equal(rejected,true);assert.equal(mode.value,'whole');assert.equal(f.w.passwordPromptTitles.length,1);assert.equal(JSON.parse(r.files.get('iris-sync/latest.json').bytes.toString()).version,4);const downloaded=await f.w.IrisGitHubSyncCore.downloadState({repo:'owner/iris-data',token:'fixture-token',password:'only-for-testing'});assert.equal(JSON.parse(new TextDecoder().decode(await f.w.IrisBackup.unzip(downloaded.bytes))).data.users[0].details,'原始资料');assert.deepEqual(f.errors,[]);
 }finally{await new Promise(resolve=>setImmediate(resolve));f.w.close()}
});

test('default whole backup can create a private repository from only a token and shows a full restore preview',{skip:!JSDOM},async()=>{
 const r=repository();r.repos.clear();const f=boot(r);try{f.w.document.querySelector('[data-storage-connection="github"]').click();const q=s=>f.w.document.querySelector(s);assert.equal(q('[data-github-config="uploadMode"]').value,'whole');q('[data-github-config="token"]').value='fixture-token';q('[data-github-action="connect"]').click();await wait(()=>q('[data-github-status]').textContent.includes('连接成功'));assert.equal(q('[data-github-config="repo"]').value,'owner/iris-data');assert.ok(r.repos.has('owner/iris-data'));q('[data-github-action="upload"]').click();await wait(()=>q('[data-github-status]').textContent.includes('完整备份已上传'));assert.equal(JSON.parse(r.files.get('iris-sync/latest.json').bytes.toString()).mode,'archive');q('[data-github-action="download"]').click();await wait(()=>q('#restoreBackup'));assert.equal(f.w.passwordPromptTitles.length,2);assert.deepEqual(f.errors,[]);}finally{await new Promise(resolve=>setImmediate(resolve));f.w.close()}
});

test('an interrupted binary backup survives reopening the page and continues without asking for the password again',{skip:!JSDOM},async()=>{
 const r=repository();r.fail('block-0000');let f=boot(r);try{
  f.w.document.querySelector('[data-storage-connection="github"]').click();let q=s=>f.w.document.querySelector(s);q('[data-github-config="token"]').value='fixture-token';q('[data-github-action="upload"]').click();await wait(()=>q('[data-github-action="upload"]').textContent==='继续上传'&&!q('[data-github-action="upload"]').disabled);assert.equal(f.w.passwordPromptTitles.length,1);assert.ok(!r.files.has('iris-sync/latest.json'));const savedLocal=Object.fromEntries(Object.keys(f.w.localStorage).map(key=>[key,f.w.localStorage.getItem(key)]));await new Promise(resolve=>setImmediate(resolve));f.w.close();r.fail('');f=boot(r,{savedLocal,autoPassword:false});f.w.document.querySelector('[data-storage-connection="github"]').click();q=s=>f.w.document.querySelector(s);await wait(()=>q('[data-github-action="upload"]').textContent==='继续上传');q('[data-github-action="upload"]').click();await wait(()=>q('[data-github-status]').textContent.includes('完整备份已上传'));assert.equal(f.w.passwordPromptTitles.length,0);assert.equal(r.releases.size,1);assert.equal(q('[data-github-location]').href,'https://github.com/owner/iris-data/releases');assert.deepEqual(f.errors,[]);
 }finally{await new Promise(resolve=>setImmediate(resolve));f.w.close()}
});
