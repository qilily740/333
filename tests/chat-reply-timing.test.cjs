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
test('online replies show typing immediately and deliver bubbles at fixed three-second intervals',{skip:!JSDOM},async()=>{
 const f=boot({char:0,user:0,users:[{name:'用户'}],characters:[{name:'甲'}],messages:{},settings:{}});
 try{
  f.w.eval(`state.messages[key()]=[{mine:true,text:'你好'}];pendingReplyKeys.add(key());
   window.replyTestTimers=[];window.replyTestNativeTimeout=window.setTimeout;
   window.setTimeout=(fn,delay,...args)=>{if(delay===0||delay===3000){replyTestTimers.push({fn,delay});return 90000+replyTestTimers.length}return replyTestNativeTimeout(fn,delay,...args)};
   sendOnlineMessage=({thread,deferEnrichment})=>new Promise(resolve=>{window.finishReplyTest=()=>{const replies=[{mine:false,text:'第一条'},{mine:false,text:'第二条消息稍长一些，也保持三秒'}];thread.push(...replies);deferEnrichment(()=>new Promise(done=>{window.finishEnrichmentTest=()=>{replies[1].reflection={thought:'后台生成的心声'};done()}}));resolve(true)}});
   maybeSummarizeOnlineMemory=async()=>{};syncChatTravelMap=async()=>{};
   scheduleChatReply();`);
  assert.equal(f.w.replyTestTimers[0].delay,0);
  f.w.replyTestTimers.shift().fn();await flush();
  assert.ok(f.w.document.querySelector('.reply-typing-bubble'));
  assert.equal(f.w.eval('messages().length'),1);
  f.w.finishReplyTest();await flush();
  assert.equal(f.w.replyTestTimers[0].delay,3000);
  assert.equal(f.w.eval('messages().length'),2);
  assert.equal(f.w.eval('messages()[1].text'),'第一条');
  assert.ok(f.w.document.querySelector('.reply-typing-bubble'));
  assert.equal(f.w.replyTestTimers[0].delay,3000);
  f.w.replyTestTimers.shift().fn();await flush();
  assert.equal(f.w.eval('messages().length'),3);
  assert.equal(f.w.document.querySelector('.reply-typing-bubble'),null);
  assert.equal(typeof f.w.finishEnrichmentTest,'function');f.w.finishEnrichmentTest();await flush();
  assert.equal(f.w.eval('messages()[2].reflection.thought'),'后台生成的心声');
  assert.equal(f.w.eval('messages()[0].replyVersions[0][1].reflection.thought'),'后台生成的心声');
  assert.deepEqual(f.errors,[]);
 }finally{f.w.close()}
});
