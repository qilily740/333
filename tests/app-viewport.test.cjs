const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const app=fs.readFileSync(require.resolve('../scripts/app.js'),'utf8');
const source=app.slice(app.indexOf('(function bindAppViewport(){'),app.indexOf('// Restore an unfinished blocked-contact SMS'));
function fixture(ios=true,safeBottom=0,metrics={}){
 const documentEvents={},windowEvents={},viewportEvents={},frames=[],properties={},focuses=[],scrolls=[];
 const style={setProperty(name,value){properties[name]=value}};
 const conversation={scrollHeight:900,clientHeight:500,scrollTop:400,isConnected:true};
 class Input{constructor(type='text'){this.type=type;this.style={opacity:''};this.readOnly=false;this.disabled=false;this.isConnected=true;this.parentElement=null}closest(){return null}matches(){return false}focus(options){focuses.push({input:this,options,opacity:this.style.opacity,readOnly:this.readOnly});document.activeElement=this}blur(){if(document.activeElement===this)document.activeElement=null}}
 class Textarea extends Input{}
 const add=(map,name,fn)=>(map[name]||=[]).push(fn);
 const viewport={height:844,offsetTop:0,addEventListener:(name,fn)=>add(viewportEvents,name,fn)};
 const document={activeElement:null,documentElement:{style,setAttribute(){}},body:{append(){}},createElement:()=>({style:{},getBoundingClientRect(){return {height:this.style.height==='100vh'?(metrics.vh||0):this.style.cssText.includes('height:100dvh')?(metrics.dvh||0):safeBottom}},remove(){}}),addEventListener:(name,fn)=>add(documentEvents,name,fn)};
 const window={visualViewport:viewport,innerWidth:390,innerHeight:844,scrollX:0,scrollY:0,addEventListener:(name,fn)=>add(windowEvents,name,fn),scrollTo(x,y){scrolls.push([x,y]);this.scrollX=x;this.scrollY=y}};
 const input=new Textarea();
 const context=vm.createContext({document,window,navigator:{userAgent:ios?'iPhone':'Android',platform:'',maxTouchPoints:1},HTMLInputElement:Input,HTMLTextAreaElement:Textarea,matchMedia:()=>({matches:!!metrics.standalone}),requestAnimationFrame:fn=>(frames.push(fn),frames.length),cancelAnimationFrame(){},performance:{now:()=>0},setTimeout(){},getComputedStyle:()=>({overflowY:'visible',paddingBottom:safeBottom+'px'}),$:s=>s==='#conversation'?conversation:s==='#messageInput'?input:null,keepLatestChatMessageVisible(){},keepLatestSmsMessageVisible(){},positionIrisGuideOrb(){}});
 vm.runInContext(source,context);
 for(const frame of frames.splice(0))frame();
 const emit=(map,type,event={})=>{event.type=type;for(const fn of map[type]||[])fn(event)};
 const touch=(type,extra={})=>{const event={target:input,pointerType:'touch',pointerId:1,clientX:10,clientY:20,prevented:false,preventDefault(){this.prevented=true},stopImmediatePropagation(){this.stopped=true},...extra};emit(documentEvents,type,event);return event};
 return{document,window,viewport,input,frames,properties,focuses,scrolls,conversation,touch,emitViewport:type=>emit(viewportEvents,type),emitWindow:type=>emit(windowEvents,type)};
}
test('iOS taps focus invisibly before native keyboard scrolling and restore the field after two frames',()=>{
 const f=fixture();assert.equal(f.touch('pointerdown').prevented,true);assert.equal(f.document.activeElement,null);assert.equal(f.input.readOnly,true);
 f.touch('pointerup');assert.equal(f.focuses.length,1);assert.equal(f.focuses[0].opacity,'0');assert.equal(f.focuses[0].options.preventScroll,true);assert.equal(f.focuses[0].readOnly,false);
 const click=f.touch('click');assert.equal(click.prevented,true);assert.equal(click.stopped,true);
 f.frames.shift()();assert.equal(f.input.style.opacity,'0');f.frames.shift()();assert.equal(f.input.style.opacity,'');
});
test('dragging across a chat field scrolls without focusing or opening the keyboard',()=>{const f=fixture();f.touch('pointerdown');f.touch('pointermove',{clientY:60});f.touch('pointerup',{clientY:60});assert.equal(f.focuses.length,0);assert.equal(f.input.readOnly,false);assert.equal(f.touch('click').prevented,true)});
test('a cancelled touch restores editability without opening the keyboard',()=>{const f=fixture();f.touch('pointerdown');f.touch('pointercancel');assert.equal(f.focuses.length,0);assert.equal(f.input.readOnly,false)});
test('keyboard opening and closing compensates every viewport pan without changing header spacing',()=>{
 const f=fixture();f.document.activeElement=f.input;for(const [height,top]of [[780,18],[600,72],[510,96],[600,66],[780,12],[844,0]]){f.viewport.height=height;f.viewport.offsetTop=top;f.emitViewport('resize');f.emitViewport('scroll');const keyboardOpen=844-height>100;assert.equal(f.properties['--app-viewport-height'],keyboardOpen?height+'px':'100dvh');assert.equal(f.properties['--app-viewport-top'],(keyboardOpen?top:0)+'px');assert.equal(f.properties['--app-safe-top'],'0px')}
 f.window.scrollY=60;f.emitWindow('scroll');assert.deepEqual(f.scrolls,[[0,0]]);assert.equal(f.window.scrollY,0);
});
test('already focused fields retain native caret selection',()=>{const f=fixture();f.document.activeElement=f.input;assert.equal(f.touch('pointerdown').prevented,false);f.touch('pointerup');assert.equal(f.focuses.length,0)});
test('Android keeps native tap focus while retaining viewport resize updates',()=>{const f=fixture(false);assert.equal(f.touch('pointerdown').prevented,false);f.touch('pointerup');assert.equal(f.focuses.length,0);f.document.activeElement=f.input;f.viewport.height=420;f.emitViewport('resize');assert.equal(f.properties['--app-viewport-height'],'420px')});

test('dismissing the keyboard restores fullscreen even when Safari retains its old shrunken height',()=>{
 const f=fixture();f.document.activeElement=f.input;f.viewport.height=510;f.viewport.offsetTop=96;f.emitViewport('resize');assert.equal(f.properties['--app-viewport-height'],'510px');
 f.document.activeElement=null;f.emitViewport('scroll');assert.equal(f.properties['--app-viewport-height'],'100dvh');assert.equal(f.properties['--app-viewport-top'],'0px');
});
test('reopening the app with a stale visual viewport cannot create a bottom gap',()=>{
 const f=fixture();f.viewport.height=620;f.viewport.offsetTop=30;f.emitWindow('pageshow');assert.equal(f.properties['--app-viewport-height'],'100dvh');assert.equal(f.properties['--app-viewport-top'],'0px');
});
test('rotation discards the old portrait keyboard height',()=>{
 const f=fixture();f.document.activeElement=f.input;f.viewport.height=510;f.emitViewport('resize');assert.equal(f.properties['--app-viewport-height'],'510px');
 f.window.innerWidth=844;f.window.innerHeight=390;f.viewport.height=390;f.emitWindow('resize');assert.equal(f.properties['--app-viewport-height'],'100dvh');assert.equal(f.properties['--app-viewport-top'],'0px');
});

for(const ios of [true,false])test(`${ios?'iOS':'Android'} safe area stays inside the shell through keyboard dismissal`,()=>{
 const f=fixture(ios,34);
 assert.equal(f.properties['--app-safe-bottom'],'34px');
 assert.equal(f.properties['--app-safe-top'],'0px');
 assert.equal(f.properties['--app-viewport-bottom'],'0px');
 assert.match(f.properties['--app-bottom-gap'],/20px \+ var\(--app-safe-bottom/);
 f.document.activeElement=f.input;f.viewport.height=510;f.viewport.offsetTop=20;f.emitViewport('resize');
 assert.equal(f.properties['--app-viewport-bottom'],'314px');
 assert.equal(f.properties['--app-bottom-gap'],'20px');
 f.document.activeElement=null;f.emitViewport('scroll');
 assert.equal(f.properties['--app-viewport-bottom'],'0px');
 assert.equal(f.properties['--app-viewport-height'],'100dvh');
 assert.match(f.properties['--app-bottom-gap'],/20px \+ var\(--app-safe-bottom/);
});

for(const ios of [true,false])test(`${ios?'iOS':'Android'} wallpaper keeps its full height while the content follows the keyboard`,()=>{
 const f=fixture(ios,34);
 assert.equal(f.properties['--app-wallpaper-height'],'844px');
 f.document.activeElement=f.input;f.window.innerHeight=510;f.viewport.height=510;f.emitViewport('resize');
 assert.equal(f.properties['--app-viewport-height'],'510px');
 assert.equal(f.properties['--app-wallpaper-height'],'844px');
 f.document.activeElement=null;f.window.innerHeight=844;f.viewport.height=844;f.emitViewport('resize');
 assert.equal(f.properties['--app-wallpaper-height'],'844px');
 assert.equal(f.properties['--app-viewport-height'],'100dvh');
});

test('online and offline wallpapers fill a separate full-shell layer instead of letterboxing the resized shell',()=>{
 const start=app.indexOf('function beautifyCanvasBackgroundRule('),end=app.indexOf('\n',app.indexOf('function beautifyBackgroundRule('));
 const context=vm.createContext({state:{settings:{beautifyBackgrounds:{online:'data:image/png;base64,online',offline:'data:image/png;base64,offline'}}},beautifyBackgroundRoots:{online:'.phone.online',offline:'.phone.offline'}});
 vm.runInContext(app.slice(start,end),context);
 for(const tab of ['online','offline']){
  const css=vm.runInContext(`beautifyBackgroundRule('${tab}')`,context);
  assert.ok(css.includes(`.phone.${tab}::before{`));
  assert.ok(css.includes('position:fixed;inset:0;min-height:var(--app-wallpaper-height,100dvh)'));
  assert.ok(css.includes('background-size:cover!important'));
  assert.ok(css.includes('pointer-events:none'));
  assert.ok(!css.includes('background-size:contain'));
  assert.ok(css.includes('html[data-ios-standalone]:has('));
  assert.ok(css.includes(':not(:has(#settingsScreen:not([hidden]),#featureScreen:not([hidden])))'));
  assert.ok(!css.includes(':has(.phone:has('));
 }
});

test('the app declares viewport-fit once so the layout can cover the iOS safe areas',()=>{
 const html=fs.readFileSync(require.resolve('../index.html'),'utf8'),matches=html.match(/<meta\s+name="viewport"/gi)||[];
 assert.equal(matches.length,1);
 assert.match(html.match(/<meta\s+name="viewport"[^>]*>/i)?.[0]||'',/width=device-width/);
 assert.match(html.match(/<meta\s+name="viewport"[^>]*>/i)?.[0]||'',/viewport-fit=cover/);
});

test('Iris guide dragging uses the visual viewport and keeps the entire orb inside it',()=>{
 const start=app.indexOf('function irisGuideViewportBounds(){'),end=app.indexOf('function irisGuideInfo(element)',start);
 const handlers={},listeners={},view={offsetLeft:10,offsetTop:20,width:340,height:600,addEventListener(type,fn){listeners[type]=fn}};
 const ball={style:{},offsetWidth:48,offsetHeight:48,addEventListener(type,fn){handlers[type]=fn},setPointerCapture(){},getBoundingClientRect(){return{left:Number.parseFloat(this.style.left)||40,top:Number.parseFloat(this.style.top)||50,width:48,height:48,right:(Number.parseFloat(this.style.left)||40)+48,bottom:(Number.parseFloat(this.style.top)||50)+48}}};
 const root={hidden:false,dataset:{},querySelector(selector){if(selector==='.iris-guide-fab')return ball;return{hidden:true}},};
 const context=vm.createContext({window:{visualViewport:view,innerWidth:390,innerHeight:844,addEventListener(type,fn){listeners['window:'+type]=fn}},document:{documentElement:{clientWidth:390,clientHeight:844},querySelector(){return root}},state:{irisGuidePosition:{edge:'right',y:1}},save(){},setTimeout(){}});
 context.root=root;
 vm.runInContext(app.slice(start,end),context);
 vm.runInContext('bindIrisGuideDrag(root)',context);
 vm.runInContext('positionIrisGuideOrb()',context);
 assert.equal(ball.style.left,'294px');
 assert.equal(ball.style.top,'564px');
 handlers.pointerdown({button:0,pointerId:1,clientX:300,clientY:570});
 handlers.pointermove({pointerId:1,clientX:300,clientY:900});
 assert.equal(ball.style.top,'564px');
 handlers.pointerup({pointerId:1});
 assert.ok(context.state.irisGuidePosition.y<=1);
 assert.equal(typeof listeners.resize,'function');
 assert.equal(typeof listeners['window:resize'],'function');
 context.window.IRIS_APP_VIEWPORT={offsetLeft:0,offsetTop:0,width:390,height:844};
 context.state.irisGuidePosition={edge:'right',y:1};
 vm.runInContext('positionIrisGuideOrb()',context);
 assert.equal(ball.style.top,'788px');
 assert.equal(ball.style.left,'334px');
 context.window.IRIS_APP_VIEWPORT.height=510;
 vm.runInContext('positionIrisGuideOrb()',context);
 assert.equal(ball.style.top,'454px');
});

for(const vh of [844,810])test(`installed iOS fills the full viewport when CSS or visual viewport omits the home area (${vh})`,()=>{
 const metrics={standalone:true,vh,dvh:810},f=fixture(true,34,metrics);
 f.viewport.height=810;f.emitWindow('pageshow');
 assert.equal(f.properties['--app-viewport-height'],'844px');
 assert.equal(f.properties['--app-wallpaper-height'],'844px');
 assert.equal(f.window.IRIS_APP_VIEWPORT.height,844);
 f.document.activeElement=f.input;f.viewport.height=510;f.viewport.offsetTop=20;f.window.innerHeight=510;f.emitViewport('resize');
 assert.equal(f.properties['--app-viewport-height'],'510px');
 assert.equal(f.window.IRIS_APP_VIEWPORT.height,510);
 assert.equal(f.properties['--app-wallpaper-height'],'844px');
 f.document.activeElement=null;f.window.innerHeight=844;f.emitViewport('resize');
 assert.equal(f.properties['--app-viewport-height'],'844px');
 assert.equal(f.window.IRIS_APP_VIEWPORT.offsetTop,0);
 metrics.vh=390;f.window.innerWidth=844;f.window.innerHeight=390;f.viewport.height=356;f.emitWindow('resize');
 assert.equal(f.properties['--app-viewport-height'],'390px');
 assert.equal(f.window.IRIS_APP_VIEWPORT.height,390);
});
test('installed iOS explicit shell and body heights override their fixed bottom constraints',()=>{
 const css=fs.readFileSync(require.resolve('../style.css'),'utf8');
 assert.match(css,/html\[data-ios-standalone\] body\{position:static;bottom:auto;height:var\(--app-wallpaper-height,100vh\);background:transparent\}/);
 assert.match(css,/html\[data-ios-standalone\] \.phone\{bottom:auto;height:var\(--app-viewport-height,100vh\)\}/);
});
