const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const app=fs.readFileSync(require.resolve('../scripts/app.js'),'utf8');
function versionContext(release){const c=vm.createContext({APP_VERSION:'5.7.9',APP_RELEASE:release,window:{}});vm.runInContext(app.slice(app.indexOf('const compareAppVersions='),app.indexOf('let INSTALLED_APP_VERSION=')),c);return c}
test('same public version detects a newer resource revision without downgrading',()=>{
 for(const [installed,remote,expected] of [['5.7.9-r3','5.7.9-r4',true],['5.7.9-r4','5.7.9-r4',false],['5.7.9-r4','5.7.9-r3',false],['5.7.9-r4','5.7.9-r10',true]]){const c=versionContext(installed);c.remote={version:'5.7.9',release:remote};assert.equal(vm.runInContext('isAppUpdateAvailable(remote)',c),expected)}
 const c=versionContext('5.7.9-r4');c.remote={version:'5.8.0',release:'5.8.0-r1'};assert.equal(vm.runInContext('isAppUpdateAvailable(remote)',c),true);c.remote={version:'5.7.8',release:'5.7.8-r100'};assert.equal(vm.runInContext('isAppUpdateAvailable(remote)',c),false);
});
test('release is 5.9.3 and all resource entry points use the current revision',()=>{
 const release=require('../version.json').release;
 for(const name of ['../version.json','../config/version.json']){const data=require(name);assert.equal(data.version,'5.9.3');assert.equal(data.release,release)}
 assert.match(app,/const APP_VERSION='5\.9\.3'/);assert.ok(app.includes(`const APP_RELEASE='${release}'`));
 for(const file of ['../index.html','../scripts/storage-bootstrap.js']){const text=fs.readFileSync(require.resolve(file),'utf8');assert.ok(text.includes(release));assert.doesNotMatch(text,/5\.7\.9-r[34]/)}

});
test('first-message menus clamp below the header when opened and after scrolling',()=>{
 let rowTop=125;const style={top:'',left:'',right:''},row={getBoundingClientRect:()=>({top:rowTop,left:20})};
 const menu={style,parentElement:row,get offsetTop(){return style.top?parseFloat(style.top):-34},get offsetLeft(){return style.left?parseFloat(style.left):46},getBoundingClientRect(){return{top:rowTop+this.offsetTop,left:20+this.offsetLeft,width:260,height:36,bottom:rowTop+this.offsetTop+36,right:20+this.offsetLeft+260}}};
 const header={getBoundingClientRect:()=>({bottom:132})},container={querySelector:()=>menu,getBoundingClientRect:()=>({top:120,bottom:720,left:16,right:350}),closest:selector=>selector==='.phone'?{querySelector:()=>header}:null};
 const c=vm.createContext({window:{innerWidth:390,innerHeight:844,visualViewport:{offsetTop:0,height:844}}});vm.runInContext(app.slice(app.indexOf('function positionMessageActionMenu('),app.indexOf('function bindConversationMedia(')),c);
 for(const top of [125,-100,720]){rowTop=top;c.positionMessageActionMenu(container);const rect=menu.getBoundingClientRect();assert.ok(rect.top>=138);assert.ok(rect.bottom<=714);assert.ok(rect.left>=22);assert.ok(rect.right<=344)}
 c.window.visualViewport={offsetTop:40,height:380};rowTop=400;c.positionMessageActionMenu(container);assert.ok(menu.getBoundingClientRect().bottom<=414);
});
