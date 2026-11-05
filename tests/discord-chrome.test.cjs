const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {TextEncoder,TextDecoder}=require('node:util');
const {JSDOM,VirtualConsole}=require('jsdom');
const root=path.join(__dirname,'..');
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
function library(w){w.openFeaturePage('beautify');w.document.querySelector('[data-online-theme="discord"]').click()}
test('apply-to picker stays above the open appearance page and role bindings apply without leaving it',async()=>{
 const f=boot(),{w,d}=f;try{
  library(w);d.querySelector('[data-online-theme-apply-to]').click();
  const z=selector=>Number(w.getComputedStyle(d.querySelector(selector)).zIndex);
  assert.equal(d.querySelector('#featureScreen').hidden,false);assert.equal(d.querySelector('#sheet').hidden,false);assert.ok(z('#sheet')>z('#shade'));assert.ok(z('#shade')>z('#featureScreen'));
  d.querySelector('[data-appearance-role="0"]').click();d.querySelector('[data-appearance-role="1"]').click();assert.equal(d.querySelector('.appearance-target-picker [type="submit"]').disabled,false);d.querySelector('.appearance-target-picker').requestSubmit();
  assert.equal(w.eval('chars[0].chatSettings.onlineAppearanceId'),'discord');assert.equal(w.eval('chars[1].chatSettings.onlineAppearanceId'),'discord');assert.equal(d.querySelector('#featureScreen').hidden,false);assert.equal(d.querySelector('#sheet').hidden,true);assert.equal(d.querySelector('#sheet').classList.contains('is-feature-overlay'),false);
  w.closeFeaturePage();w.sheet('Test','普通聊天面板','<p>内容</p>');assert.equal(d.querySelector('#sheet').classList.contains('is-feature-overlay'),false);assert.deepEqual(f.errors,[]);
 }finally{await f.close()}
});
test('setting Discord as default immediately synchronizes header, controls and capsule input; switching back restores normal chrome',async()=>{
 const f=boot(),{w,d}=f;try{
  library(w);d.querySelector('[data-online-theme-default]').click();
  assert.ok(d.querySelector('#chatTitle .discord-title-icon'));assert.ok(d.querySelector('#chatTitle .discord-title-chevron'));assert.match(d.querySelector('#settings svg').innerHTML,/<circle/);assert.equal(d.querySelector('#messageInput').placeholder,'');
  w.closeFeaturePage();w.input();const css=selector=>w.getComputedStyle(d.querySelector(selector));
  assert.equal(css('#chatTitle').alignItems,'center');assert.equal(css('#chatTitle .chat-character-name').maxWidth,'none');assert.equal(css('#chatTitle').gridRow,'1');assert.equal(css('#settings').gridRow,'1');assert.equal(css('#characters').gridRow,'1');assert.equal(css('.input-wrap').backgroundColor,'rgba(0, 0, 0, 0)');assert.equal(css('.input-wrap').borderTopWidth,'0px');assert.equal(css('#messageInput').fontSize,'16px');assert.equal(css('#reply').width,'32px');
  const field=d.querySelector('#messageInput');field.value='只发送一次';field.dispatchEvent(new w.Event('input'));w.eval('chatReplyInFlight.add(key());updateChatReplyIndicator()');assert.equal(d.querySelector('#reply').disabled,false);assert.equal(d.querySelector('#reply').getAttribute('aria-label'),'发送消息');d.querySelector('#reply').click();assert.equal(w.eval('messages().filter(m=>m.mine&&m.text==="只发送一次").length'),1);assert.equal(field.value,'');assert.equal(d.querySelector('#composer').hidden,false);w.eval('chatReplyInFlight.clear();updateChatReplyIndicator()');
  library(w);d.querySelector('[data-online-theme="default"]').click();d.querySelector('[data-online-theme-default]').click();assert.equal(d.querySelector('#chatTitle .discord-title-icon'),null);assert.equal(field.placeholder,'Type a message…');w.exitInput();assert.equal(css('#composer').display,'none');assert.deepEqual(f.errors,[]);
 }finally{await f.close()}
});
test('saved Discord CSS receives current chrome fixes without rewriting the saved theme',async()=>{
 const f=boot(),{w,d}=f;try{
  const legacy='.phone{--iris-discord-chat:1}.composer{border-radius:20px}.bubble{color:rgb(12,34,56)}';w.legacyDiscord=legacy;w.eval('state.settings.beautifyCss.online=legacyDiscord;applyBeautifyCss();input()');
  assert.ok(d.querySelector('.discord-title-chevron'));assert.equal(w.getComputedStyle(d.querySelector('.topbar')).display,'grid');assert.equal(w.getComputedStyle(d.querySelector('#chatTitle')).gridColumn,'2');assert.equal(w.getComputedStyle(d.querySelector('#chatTitle')).fontSize,'17px');assert.equal(w.getComputedStyle(d.querySelector('.input-wrap')).backgroundColor,'rgba(0, 0, 0, 0)');assert.equal(w.getComputedStyle(d.querySelector('#messageInput')).fontSize,'16px');assert.equal(w.eval('state.settings.beautifyCss.online'),legacy);assert.match(d.querySelector('#iris-beautify-online').textContent,/12,34,56/);assert.deepEqual(f.errors,[]);
 }finally{await f.close()}
});
test('appearance previews reset cloned controls to the selected theme instead of copying the live composer state',async()=>{
 const f=boot(),{w,d}=f;try{
  const field=d.querySelector('#messageInput');field.value='尚未发送的草稿';field.dispatchEvent(new w.Event('input'));assert.equal(d.querySelector('#emoji').classList.contains('is-send'),true);
  const template=d.createElement('template');template.innerHTML=w.eval("beautifyChatPreviewMarkup('online','input',discordChatThemeCss())");assert.equal(template.content.querySelector('#emoji').classList.contains('is-send'),false);assert.equal(template.content.querySelector('#messageInput').placeholder,'');assert.equal(template.content.querySelector('#reply').disabled,false);assert.match(template.content.querySelector('#reply').innerHTML,/<rect/);assert.ok(template.content.querySelector('.discord-title-chevron'));assert.equal(field.value,'尚未发送的草稿');
  w.eval("chars[0].chatSettings.onlineAppearanceId='discord';render()");template.innerHTML=w.eval("beautifyChatPreviewMarkup('online','input','')");assert.equal(template.content.querySelector('.discord-title-chevron'),null);assert.equal(template.content.querySelector('#settings circle'),null);assert.equal(template.content.querySelector('#messageInput').placeholder,'Type a message…');assert.deepEqual(f.errors,[]);
 }finally{await f.close()}
});
