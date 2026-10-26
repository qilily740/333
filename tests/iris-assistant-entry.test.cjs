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


test('enabling Iris from its profile preserves the current role, user, mode and conversation',{skip:!JSDOM},async()=>{
 for(const offline of [false,true]){
  const f=boot({char:0,user:0,offline,irisWelcomeChoice:'not-needed',irisGuideOrbHidden:true,users:[{name:'用户'},{name:'其他用户'}],characters:[{name:'甲',chatSettings:{userIndex:0}},{name:'乙',chatSettings:{userIndex:1}}],messages:{'0-0-chat':[{mine:false,text:'原有聊天'}]},settings:{}});
  try{const before=f.w.eval('JSON.stringify({char:state.char,user:state.user,offline:state.offline,messages:state.messages})');f.w.eval('window.originalRole=chars[state.char]');f.w.openCharacters();f.w.eval("drawCharacterEditor(characterDrafts.findIndex(c=>c.builtinRole==='iris-assistant'))");assert.match(f.w.document.querySelector('.profile-confirm').textContent,/开启悬浮助手/);f.w.document.querySelector('#characterForm').dispatchEvent(new f.w.Event('submit',{bubbles:true,cancelable:true}));await flush();assert.equal(f.w.eval('JSON.stringify({char:state.char,user:state.user,offline:state.offline,messages:state.messages})'),before);assert.equal(f.w.eval('chars[state.char]===originalRole'),true);assert.equal(f.w.document.querySelector('#characterDialog').open,false);assert.equal(f.w.document.querySelector('.iris-guide-widget').hidden,false);assert.equal(f.w.document.querySelector('.iris-guide-fab').hidden,false);assert.equal(f.w.document.querySelector('.iris-guide-panel').hidden,true);assert.ok(f.snapshots.some(s=>s.irisWelcomeChoice==='needed'&&!s.irisGuideOrbHidden));assert.deepEqual(f.errors,[])}finally{f.w.close()}
 }
});
test('ordinary character confirmation still selects that role and its bound user',{skip:!JSDOM},async()=>{
 const f=boot({char:0,user:0,users:[{name:'用户'},{name:'其他用户'}],characters:[{name:'甲'},{name:'乙',chatSettings:{userIndex:1}}],settings:{}});try{f.w.openCharacters();f.w.drawCharacterEditor(1);assert.match(f.w.document.querySelector('.profile-confirm').textContent,/确认使用此角色/);f.w.document.querySelector('#characterForm').dispatchEvent(new f.w.Event('submit',{bubbles:true,cancelable:true}));await flush();assert.equal(f.w.eval('state.char'),1);assert.equal(f.w.eval('state.user'),1);assert.deepEqual(f.errors,[])}finally{f.w.close()}
});
