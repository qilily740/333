const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {TextEncoder,TextDecoder}=require('node:util');
const {JSDOM,VirtualConsole}=require('jsdom');
const root=process.env.IRIS_WALLPAPER_TEST_ROOT||path.join(__dirname,'..');
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
test('removing the default wallpaper persists immediately without saving or discarding pending CSS edits',async()=>{
 const f=boot(),{w,d}=f;try{
  w.eval("state.settings.onlineBeautifyLibrary={active:'imessage',items:[]};state.settings.beautifyCss.online=onlineChatThemeCss('imessage');state.settings.beautifyBackgrounds.online='https://images.test/default-wallpaper.jpg';applyBeautifyCss();openOnlineAppearanceLibrary('inherit')");
  const original=w.eval('state.settings.beautifyCss.online'),field=d.querySelector('[data-beautify-editor]');field.value+='\n.bubble{letter-spacing:2px}';field.dispatchEvent(new w.Event('input'));const draft=field.value;d.querySelector('[data-beautify-background-clear]').click();assert.equal(w.eval('state.settings.beautifyBackgrounds.online'),'');assert.equal(w.eval('state.settings.beautifyCss.online'),original);assert.equal(d.querySelector('[data-beautify-editor]').value,draft);assert.equal(d.querySelector('[data-beautify-background-clear]').disabled,true);assert.equal(d.querySelector('.beautify-background-thumb'),null);assert.equal(d.querySelector('#iris-beautify-online').textContent.includes('default-wallpaper.jpg'),false);assert.deepEqual(f.errors,[]);
 }finally{await f.close()}
});
test('removing a role-bound scheme wallpaper changes that scheme immediately and preserves other wallpapers and CSS',async()=>{
 const f=boot(),{w,d}=f;try{
  w.eval("state.settings.onlineBeautifyLibrary={active:'default',items:[{id:'selected',name:'当前方案',css:'.bubble{color:purple}',background:'https://images.test/selected.jpg'},{id:'other',name:'其他方案',css:'.bubble{color:blue}',background:'https://images.test/other.jpg'}]};state.settings.beautifyBackgrounds.online='https://images.test/global.jpg';chars[0].chatSettings.onlineAppearanceId='selected';applyBeautifyCss();openOnlineAppearanceLibrary('selected')");
  assert.match(d.querySelector('.beautify-background-thumb').src,/selected.jpg/);d.querySelector('[data-beautify-background-clear]').click();assert.equal(w.eval('state.settings.onlineBeautifyLibrary.items[0].background'),'');assert.equal(w.eval('state.settings.onlineBeautifyLibrary.items[0].css'),'.bubble{color:purple}');assert.equal(w.eval('state.settings.onlineBeautifyLibrary.items[1].background'),'https://images.test/other.jpg');assert.equal(w.eval('state.settings.beautifyBackgrounds.online'),'https://images.test/global.jpg');assert.equal(w.eval('privateOnlineAppearance().background'),'');assert.equal(d.querySelector('#iris-beautify-online').textContent.includes('selected.jpg'),false);assert.deepEqual(f.errors,[]);
 }finally{await f.close()}
});
test('adding and replacing the default wallpaper takes effect immediately while CSS edits remain drafts',async()=>{
 const f=boot(),{w,d}=f;try{
  w.eval("state.settings.onlineBeautifyLibrary={active:'imessage',items:[]};state.settings.beautifyCss.online=onlineChatThemeCss('imessage');openOnlineAppearanceLibrary('inherit')");const original=w.eval('state.settings.beautifyCss.online');let field=d.querySelector('[data-beautify-editor]');field.value+='\n.bubble{letter-spacing:3px}';field.dispatchEvent(new w.Event('input'));const draft=field.value;
  for(const image of ['https://images.test/first.jpg','https://images.test/replaced.jpg']){w.compressBeautifyImage=async()=>image;const input=d.querySelector('[data-beautify-background-input]');Object.defineProperty(input,'files',{value:[new w.File(['image'],'wallpaper.png',{type:'image/png'})],configurable:true});await input.onchange();assert.equal(w.eval('state.settings.beautifyBackgrounds.online'),image);assert.equal(w.eval('privateOnlineAppearance().background'),image);assert.ok(d.querySelector('#iris-beautify-online').textContent.includes(image));assert.equal(d.querySelector('[data-beautify-editor]').value,draft);assert.equal(w.eval('state.settings.beautifyCss.online'),original);assert.equal(d.querySelector('[data-beautify-background-clear]').disabled,false);assert.equal(d.querySelector('#toast').textContent,'聊天背景已更新')}
  d.querySelector('[data-beautify-background-clear]').click();assert.equal(w.eval('privateOnlineAppearance().background'),'');assert.deepEqual(f.errors,[]);
 }finally{await f.close()}
});
test('a new wallpaper is saved immediately to its role-bound scheme without changing other scheme backgrounds',async()=>{
 const f=boot(),{w,d}=f;try{
  w.eval("state.settings.onlineBeautifyLibrary={active:'default',items:[{id:'chosen',name:'当前方案',css:'.bubble{color:purple}',background:''},{id:'other',name:'其他方案',css:'.bubble{color:blue}',background:'https://images.test/other.jpg'}]};state.settings.beautifyBackgrounds.online='https://images.test/global.jpg';chars[0].chatSettings.onlineAppearanceId='chosen';openOnlineAppearanceLibrary('chosen')");w.compressBeautifyImage=async()=>'https://images.test/new-chosen.jpg';const input=d.querySelector('[data-beautify-background-input]');Object.defineProperty(input,'files',{value:[new w.File(['image'],'chosen.png',{type:'image/png'})],configurable:true});await input.onchange();assert.equal(w.eval('state.settings.onlineBeautifyLibrary.items[0].background'),'https://images.test/new-chosen.jpg');assert.equal(w.eval('privateOnlineAppearance().background'),'https://images.test/new-chosen.jpg');assert.equal(w.eval('state.settings.onlineBeautifyLibrary.items[0].css'),'.bubble{color:purple}');assert.equal(w.eval('state.settings.onlineBeautifyLibrary.items[1].background'),'https://images.test/other.jpg');assert.equal(w.eval('state.settings.beautifyBackgrounds.online'),'https://images.test/global.jpg');assert.match(d.querySelector('.beautify-background-thumb').src,/new-chosen.jpg/);assert.deepEqual(f.errors,[]);
 }finally{await f.close()}
});
