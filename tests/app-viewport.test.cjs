const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const app=fs.readFileSync(require.resolve('../scripts/app.js'),'utf8');
const source=app.slice(app.indexOf('(function bindAppViewport(){'),app.indexOf('// Restore an unfinished blocked-contact SMS'));
function fixture(ios=true,safeBottom=0){
 const documentEvents={},windowEvents={},viewportEvents={},frames=[],properties={},focuses=[],scrolls=[];
 const style={setProperty(name,value){properties[name]=value}};
 const conversation={scrollHeight:900,clientHeight:500,scrollTop:400,isConnected:true};
 class Input{constructor(type='text'){this.type=type;this.style={opacity:''};this.readOnly=false;this.disabled=false;this.isConnected=true;this.parentElement=null}closest(){return null}matches(){return false}focus(options){focuses.push({input:this,options,opacity:this.style.opacity,readOnly:this.readOnly});document.activeElement=this}blur(){if(document.activeElement===this)document.activeElement=null}}
 class Textarea extends Input{}
 const add=(map,name,fn)=>(map[name]||=[]).push(fn);
 const viewport={height:844,offsetTop:0,addEventListener:(name,fn)=>add(viewportEvents,name,fn)};
 const document={activeElement:null,documentElement:{style},body:{append(){}},createElement:()=>({style:{},getBoundingClientRect(){return {height:this.style.cssText.includes('height:100dvh')?0:safeBottom}},remove(){}}),addEventListener:(name,fn)=>add(documentEvents,name,fn)};
 const window={visualViewport:viewport,innerWidth:390,innerHeight:844,scrollX:0,scrollY:0,addEventListener:(name,fn)=>add(windowEvents,name,fn),scrollTo(x,y){scrolls.push([x,y]);this.scrollX=x;this.scrollY=y}};
 const input=new Textarea();
 const context=vm.createContext({document,window,navigator:{userAgent:ios?'iPhone':'Android',platform:'',maxTouchPoints:1},HTMLInputElement:Input,HTMLTextAreaElement:Textarea,matchMedia:()=>({matches:false}),requestAnimationFrame:fn=>(frames.push(fn),frames.length),cancelAnimationFrame(){},performance:{now:()=>0},setTimeout(){},getComputedStyle:()=>({overflowY:'visible',paddingBottom:safeBottom+'px'}),$:s=>s==='#conversation'?conversation:s==='#messageInput'?input:null,keepLatestChatMessageVisible(){},keepLatestSmsMessageVisible(){}});
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
