const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {TextEncoder,TextDecoder}=require('node:util');
const {JSDOM,VirtualConsole}=require('jsdom');
const root=process.env.IRIS_TRANSFER_TEST_ROOT||path.join(__dirname,'..');
const flush=async()=>{for(let i=0;i<10;i++)await new Promise(resolve=>setImmediate(resolve))};
function boot(){
 const errors=[],saved={users:[{name:'测试用户'}],characters:[{name:'角色名字',chatSettings:{userIndex:0}},{name:'另一个角色',chatSettings:{userIndex:0}}],messages:{},char:0,user:0,offline:false,irisWelcomeChoice:'not-needed',irisGuideOrbHidden:true,settings:{}};
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
 const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/',virtualConsole:new VirtualConsole(),beforeParse(w){
  w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;w.IRIS_BOOT_STATE=saved;w.IRIS_STYLES_READY=Promise.resolve();w.fetch=async()=>{throw Error('network disabled in test')};w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});w.confirm=()=>true;w.scrollTo=()=>{};
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};w.IrisStorage={mode:'test',save:async()=>{}};w.addEventListener('error',e=>errors.push(e.error?.stack||e.message));
 }});
 const w=dom.window,d=w.document,style=d.createElement('style');style.textContent=fs.readFileSync(path.join(root,'style.css'),'utf8');d.head.append(style);
 const scripts=JSON.parse(fs.readFileSync(path.join(root,'scripts/storage-bootstrap.js'),'utf8').match(/const scripts = (\[[^\n]+\]);/)[1].replace(/'/g,'"'));
 for(const file of scripts){const tag=d.createElement('script');Object.defineProperty(tag,'src',{value:'http://localhost/'+file});tag.textContent=fs.readFileSync(path.join(root,file),'utf8');d.body.append(tag)}
 return{w,d,errors,close:async()=>{await flush();w.close()}};
}

function returnedRule(w){return [...w.document.querySelector('#iris-beautify-online').sheet.cssRules].filter(rule=>rule.selectorText?.includes('[data-transfer-status="returned"]')&&rule.selectorText.includes('.transfer-symbol::before')).at(-1)}
function assertVector(w){const rule=returnedRule(w);assert.ok(rule);assert.equal(rule.style.getPropertyValue('content'),'""');const background=rule.style.getPropertyValue('background-image');assert.match(background,/data:image\/svg\+xml/);const url=background.replace(/^url\(["']?/,'').replace(/["']?\)$/,'');const svg=new w.DOMParser().parseFromString(decodeURIComponent(url.slice(url.indexOf(',')+1)),'image/svg+xml');assert.equal(svg.querySelector('parsererror'),null);assert.equal(svg.documentElement.getAttribute('stroke'),'#fff');assert.ok(svg.querySelector('path').getAttribute('d'));}
test('WeChat returned transfers use a white SVG return arrow while transfer amounts and statuses stay unchanged',async()=>{
 const f=boot(),{w,d}=f;try{
  w.eval("state.settings.onlineBeautifyLibrary={active:'wechat',items:[]};state.settings.beautifyCss.online=onlineChatThemeCss('wechat');messages().push(...['pending','accepted','returned'].map(status=>({mine:true,type:'transfer',status,amount:10,currency:'CNY',createdAt:Date.now()})));render()");assertVector(w);const cards=d.querySelectorAll('.transfer-message-card');assert.equal(cards.length,3);assert.match(cards[2].textContent,/已退回/);assert.match(cards[2].querySelector('.transfer-amount').textContent,/10.00/);assert.match(cards[1].textContent,/已收下/);assert.equal(cards[0].dataset.transferStatus,'pending');assert.deepEqual(f.errors,[]);
 }finally{await f.close()}
});
test('saved WeChat schemes receive the SVG correction without rewriting user CSS or changing other themes',async()=>{
 const f=boot(),{w}=f;try{
  const legacy='.phone{--iris-wechat-home-dock:1}.bubble{color:purple}.transfer-message-card[data-transfer-status="returned"] .transfer-symbol::before{content:"↩"}';w.legacyTransferCss=legacy;w.eval('state.settings.onlineBeautifyLibrary={active:"custom-wechat",items:[{id:"custom-wechat",name:"旧方案",css:legacyTransferCss}]};state.settings.beautifyCss.online=legacyTransferCss;applyBeautifyCss()');assertVector(w);assert.equal(w.eval('state.settings.beautifyCss.online'),legacy);assert.equal(w.eval('state.settings.onlineBeautifyLibrary.items[0].css'),legacy);const other=w.eval('scopeBeautifyCss(onlineChatThemeCss("imessage"),beautifyRoots.online,"online")');assert.equal(other.includes('data:image/svg+xml'),false);assert.deepEqual(f.errors,[]);
 }finally{await f.close()}
});
