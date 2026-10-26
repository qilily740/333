const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
let JSDOM,VirtualConsole;try{({JSDOM,VirtualConsole}=require('jsdom'))}catch{}
const root=path.join(__dirname,'..');
const flush=async()=>{for(let i=0;i<6;i++)await new Promise(resolve=>setImmediate(resolve))};
function boot(saved,fetcher){
 const errors=[],snapshots=[],html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,''),console=new VirtualConsole();
 const dom=new JSDOM(html,{runScripts:'dangerously',url:'http://localhost/',pretendToBeVisual:true,virtualConsole:console,beforeParse(w){
  w.IRIS_BOOT_STATE=saved;w.IRIS_STYLES_READY=Promise.resolve();w.fetch=async(url,...args)=>String(url).startsWith('assets/earth-cities.json')?{ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(root,'assets/earth-cities.json'),'utf8'))}:(fetcher||async function(){throw Error('no external network in local integration test')})(url,...args);w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});w.confirm=()=>true;w.scrollTo=()=>{};
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};
  w.IrisStorage={mode:'test',save:async value=>snapshots.push(JSON.parse(JSON.stringify(value)))};
  w.addEventListener('error',event=>errors.push(event.error?.stack||event.message));
 }});
 const scripts=JSON.parse(fs.readFileSync(path.join(root,'scripts/storage-bootstrap.js'),'utf8').match(/const scripts = (\[[^\n]+\]);/)[1].replace(/'/g,'"'));
 for(const file of scripts){const tag=dom.window.document.createElement('script');Object.defineProperty(tag,'src',{value:'http://localhost/'+file});tag.textContent=fs.readFileSync(path.join(root,file),'utf8');dom.window.document.body.append(tag)}
 return{dom,w:dom.window,errors,snapshots};
}

const avatarFixture=()=>boot({char:0,user:0,users:[{name:'测试用户'}],characters:[{name:'甲',chatSettings:{userIndex:0}},{name:'乙',chatSettings:{userIndex:0}}],messages:{'0-0-chat':[{mine:true,text:'你好'},{mine:false,text:'你好呀'}]},settings:{},reflectionPanel:'original'});
test('an avatar without generated reflection opens a loading panel and joins the existing generation',{skip:!JSDOM},async()=>{
 const f=avatarFixture();try{
  f.w.eval("window.baseCalls=0;generateOnlineReflection=()=>{baseCalls++;return new Promise(resolve=>window.finishBase=()=>resolve({status:'开心',thought:'想继续聊'}))}");
  assert.ok(f.w.document.querySelector('[data-role-reflection="1"]'));
  f.w.eval('window.baseJob=prepareOnlineReflection(chars[0],state.users[0],currentRoleChatSettings(),messages().slice(0,1),[messages()[1]])');
  f.w.openRoleReflection(1);await flush();assert.match(f.w.document.querySelector('.reflection-pending-host').textContent,/正在生成/);assert.equal(f.w.baseCalls,1);
  f.w.finishBase();await flush();assert.match(f.w.document.querySelector('.reflection-panel-host').textContent,/想继续聊/);assert.equal(f.w.baseCalls,1);
  await f.w.eval('prepareOnlineReflection(chars[0],state.users[0],currentRoleChatSettings(),messages().slice(0,1),[messages()[1]])');assert.equal(f.w.baseCalls,1);assert.deepEqual(f.errors,[]);
 }finally{f.w.close()}
});
test('failed reflection stays accessible and retries once per click without duplicating requests',{skip:!JSDOM},async()=>{
 const f=avatarFixture();try{
  f.w.eval("window.baseCalls=0;generateOnlineReflection=async()=>{baseCalls++;if(baseCalls===1)throw Error('测试接口失败');return{status:'轻松',thought:'重试成功'}}");
  f.w.openRoleReflection(1);await flush();assert.match(f.w.document.querySelector('[data-reflection-status]').textContent,/测试接口失败/);
  const retry=f.w.document.querySelector('[data-reflection-retry]');assert.equal(retry.hidden,false);retry.click();retry.click();await flush();assert.equal(f.w.baseCalls,2);assert.match(f.w.document.querySelector('.reflection-panel-host').textContent,/重试成功/);assert.deepEqual(f.errors,[]);
 }finally{f.w.close()}
});
test('avatar click survives a conversation rerender during the double-tap delay',{skip:!JSDOM},async()=>{
 const f=avatarFixture();try{
  f.w.eval("window.avatarTimers=[];window.avatarNativeTimeout=setTimeout;window.setTimeout=(fn,delay,...args)=>delay===480?(avatarTimers.push(fn),90000):avatarNativeTimeout(fn,delay,...args);generateOnlineReflection=async()=>({status:'放松',thought:'头像重绘后也能打开'})");
  const old=f.w.document.querySelector('[data-role-reflection="1"]');old.click();f.w.eval("messages()[1].text='文字更新';render()");assert.equal(old.isConnected,false);f.w.avatarTimers.shift()();await flush();assert.match(f.w.document.querySelector('.reflection-panel-host').textContent,/头像重绘后也能打开/);assert.deepEqual(f.errors,[]);
 }finally{f.w.close()}
});
test('opening reflection during bubble delivery waits and joins the background request',{skip:!JSDOM},async()=>{
 const f=avatarFixture();try{
  f.w.eval("window.waitTimers=[];window.waitNativeTimeout=setTimeout;window.setTimeout=(fn,delay,...args)=>delay===100?(waitTimers.push(fn),90001):waitNativeTimeout(fn,delay,...args);window.baseCalls=0;generateOnlineReflection=()=>{baseCalls++;return new Promise(resolve=>window.finishBase=()=>resolve({status:'开心',thought:'只调用一次'}))};chatReplyInFlight.add(key())");
  f.w.openRoleReflection(1);await flush();assert.equal(f.w.baseCalls,0);
  f.w.eval('chatReplyInFlight.delete(key());window.baseJob=prepareOnlineReflection(chars[0],state.users[0],currentRoleChatSettings(),messages().slice(0,1),[messages()[1]])');f.w.waitTimers.shift()();await flush();assert.equal(f.w.baseCalls,1);f.w.finishBase();await flush();assert.match(f.w.document.querySelector('.reflection-panel-host').textContent,/只调用一次/);assert.deepEqual(f.errors,[]);
 }finally{f.w.close()}
});
test('late reflection does not reopen a closed panel or switch to another role',{skip:!JSDOM},async()=>{
 const f=avatarFixture();try{
  f.w.eval("generateOnlineReflection=()=>new Promise(resolve=>window.finishBase=()=>resolve({status:'开心',thought:'甲的心声'}))");f.w.openRoleReflection(1);await flush();f.w.closeSheet();f.w.eval('state.char=1;render()');f.w.finishBase();await flush();assert.equal(f.w.document.querySelector('#sheet').hidden,true);assert.equal(f.w.eval('state.char'),1);assert.ok(f.snapshots.some(value=>value.messages['0-0-chat'][1].reflection?.thought==='甲的心声'));assert.deepEqual(f.errors,[]);
 }finally{f.w.close()}
});
