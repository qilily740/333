const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
let JSDOM,VirtualConsole;try{({JSDOM,VirtualConsole}=require('./helpers/jsdom.cjs'))}catch{}
const root=path.join(__dirname,'..');
const flush=async()=>{for(let i=0;i<6;i++)await new Promise(resolve=>setImmediate(resolve))};
function boot(saved,fetcher){
 const errors=[],snapshots=[],html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,''),console=new VirtualConsole();
 const dom=new JSDOM(html,{runScripts:'dangerously',url:'http://localhost/',pretendToBeVisual:true,virtualConsole:console,beforeParse(w){
  w.IRIS_BOOT_STATE=saved;w.IRIS_STYLES_READY=Promise.resolve();w.fetch=fetcher||async function(){throw Error('no external network in local integration test')};w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});w.confirm=()=>true;w.scrollTo=()=>{};
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'))};
  w.IrisStorage={mode:'test',save:async value=>snapshots.push(JSON.parse(JSON.stringify(value)))};
  w.addEventListener('error',event=>errors.push(event.error?.stack||event.message));
 }});
 const scripts=JSON.parse(fs.readFileSync(path.join(root,'scripts/storage-bootstrap.js'),'utf8').match(/const scripts = (\[[^\n]+\]);/)[1].replace(/'/g,'"'));
 for(const file of scripts){const tag=dom.window.document.createElement('script');Object.defineProperty(tag,'src',{value:'http://localhost/'+file});tag.textContent=fs.readFileSync(path.join(root,file),'utf8');dom.window.document.body.append(tag)}
 return{dom,w:dom.window,errors,snapshots};
}
test('main-menu language capsule switches all function names immediately and persists without changing actions or messages',{skip:!JSDOM},async()=>{
 const f=boot({char:0,user:0,users:[{name:'用户'}],characters:[{name:'甲'}],messages:{'0-0-chat':[{mine:true,text:'这条消息保持原样'}],'0-0-offline':[]},settings:{}});let reopened;
 try{
  const doc=f.w.document,menu=doc.querySelector('#dockFeatureMenu'),english=doc.querySelector('[data-menu-language="en"]');assert.ok(menu.lastElementChild.matches('.function-language-switch'));assert.equal(doc.querySelector('[data-menu-language="zh"]').getAttribute('aria-pressed'),'true');
  const before=f.w.eval('JSON.stringify(state.messages)'),destinations=Array.from(menu.querySelectorAll('[data-dock-feature]'),node=>node.dataset.dockFeature),icons=Array.from(menu.querySelectorAll('[data-dock-feature] svg'),node=>node.outerHTML);
  doc.querySelector('.dock-add').click();english.dispatchEvent(new f.w.MouseEvent('pointerdown',{bubbles:true}));assert.equal(menu.hidden,false);english.click();assert.equal(menu.hidden,false);assert.equal(english.getAttribute('aria-pressed'),'true');assert.equal(f.w.eval('state.settings.functionButtonLanguage'),'en');
  assert.deepEqual(Array.from(menu.querySelectorAll('[data-dock-feature]>span:first-child'),node=>node.textContent),['Experiences','World Book','Beautify','Forum','Market','Business','SMS']);assert.deepEqual(Array.from(menu.querySelectorAll('[data-dock-feature]'),node=>node.dataset.dockFeature),destinations);assert.deepEqual(Array.from(menu.querySelectorAll('[data-dock-feature] svg'),node=>node.outerHTML),icons);
  f.w.eval('renderQuickFeatures()');assert.deepEqual(Array.from(doc.querySelectorAll('#quickFeatures [data-quick]'),node=>node.textContent),['Voice','Video','Image','Transfer','Location','Music','Read','Exit','Clear','Block','Delete']);assert.equal(doc.querySelector('[data-quick="清除聊天"]').dataset.quick,'清除聊天');
  f.w.eval('state.characters[0].offlineMode=true;render();renderQuickFeatures()');assert.deepEqual(Array.from(doc.querySelectorAll('#quickFeatures [data-quick]'),node=>node.textContent),['Mask','Save','Delete','Exit']);assert.equal(f.w.eval('JSON.stringify(state.messages)'),before);
  reopened=boot(f.snapshots.at(-1));assert.equal(reopened.w.document.querySelector('[data-dock-feature="worldbook"]>span').textContent,'World Book');assert.equal(reopened.w.document.querySelector('[data-menu-language="en"]').getAttribute('aria-pressed'),'true');reopened.w.document.querySelector('.dock-add').click();reopened.w.document.querySelector('[data-menu-language="zh"]').click();assert.equal(reopened.w.document.querySelector('[data-dock-feature="worldbook"]>span').textContent,'世界书');reopened.w.openFeaturePage('worldbook');assert.equal(reopened.w.document.querySelector('.feature-page-wordmark').textContent,'World Book');assert.deepEqual(f.errors,[]);assert.deepEqual(reopened.errors,[]);
 }finally{await flush();f.w.close();reopened?.w.close()}
});
test('invalid function-name language falls back to Chinese and the English unblock label follows state',{skip:!JSDOM},async()=>{const f=boot({char:0,user:0,users:[{name:'用户'}],characters:[{name:'甲',chatSettings:{blocked:true}}],messages:{},settings:{functionButtonLanguage:'invalid'}});try{assert.equal(f.w.document.querySelector('[data-dock-feature="worldbook"]>span').textContent,'世界书');f.w.document.querySelector('[data-menu-language="en"]').click();f.w.eval('state.offline=false;renderQuickFeatures()');assert.equal(f.w.document.querySelector('[data-quick="拉黑好友"]').textContent,'Unblock');assert.equal(f.w.document.querySelector('[data-quick="拉黑好友"]').dataset.quick,'拉黑好友');assert.deepEqual(f.errors,[])}finally{await flush();f.w.close()}});
