const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
let JSDOM,VirtualConsole;try{({JSDOM,VirtualConsole}=require('./helpers/jsdom.cjs'))}catch{}
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


function fixture(){return{char:0,user:0,users:[{name:'用户'}],characters:[{name:'甲',details:'喜欢美术馆',chatSettings:{userIndex:0}},{name:'乙',details:'OTHER_PRIVATE_ROLE'}],messages:{'0-0-chat':[{mine:true,travelInvitation:{id:'t',destination:'东京',departure:'2026-11-01T09:00',days:3}},{mine:false,travelEvent:{id:'t',event:'accept',baseRevision:0}}]},settings:{apiConfigs:[{id:'exp',url:'https://experiences.invalid/v1',key:'test',model:'exp-model',models:['exp-model']}],apiFeatureRoutes:{experiences:'exp'},apiFeatureModels:{experiences:'exp-model'}}}}
const completion=places=>({ok:true,headers:{get:()=> 'application/json'},json:async()=>({choices:[{message:{content:JSON.stringify({places})}}]})});
const place={name:'东京国立博物馆',city:'东京',day:1,period:'上午'};
test('specific places button uses one Experiences request, prevents duplicate clicks and opens the map',{skip:!JSDOM},async()=>{
 let finish;const calls=[],f=boot(fixture(),async(url,options)=>{calls.push({url,body:JSON.parse(options.body)});return new Promise(resolve=>finish=resolve)});
 try{f.w.eval('window.mapOpened=0;openTravelMap=async()=>{mapOpened++}');f.w.openTravelDetail('t');assert.equal(f.w.document.querySelector('[data-travel-map]').nextElementSibling.dataset.travelGeneratePlaces,'');f.w.document.querySelector('[data-travel-generate-places]').click();f.w.generateTravelSpecificPlaces('t');assert.equal(calls.length,1);assert.equal(f.w.document.querySelector('[data-travel-generate-places]').disabled,true);finish(completion([place,place]));await flush();assert.equal(calls[0].url,'https://experiences.invalid/v1/chat/completions');assert.equal(calls[0].body.model,'exp-model');assert.doesNotMatch(JSON.stringify(calls),/OTHER_PRIVATE_ROLE/);assert.equal(f.w.eval("travelState(messages(),'t').placeProposals.length"),1);assert.equal(f.w.eval("travelState(messages(),'t').placeProposals[0].exact"),true);assert.equal(f.w.mapOpened,1);assert.deepEqual(f.errors,[])}finally{f.w.close()}
});
test('late place generation cannot write into a changed trip or another role',{skip:!JSDOM},async()=>{
 for(const change of ["state.char=1","messages().push({mine:true,travelEvent:{id:'t',event:'cancel',baseRevision:1}})"]){let finish;const f=boot(fixture(),async()=>new Promise(resolve=>finish=resolve));try{const task=f.w.generateTravelSpecificPlaces('t');f.w.eval(change);finish(completion([place]));await task;assert.equal(f.w.eval("travelState(state.messages['0-0-chat'],'t').placeProposals.length"),0);assert.deepEqual(f.errors,[])}finally{f.w.close()}}
});
test('invalid generated dates and failed persistence do not leave partial places',{skip:!JSDOM},async()=>{
 for(const invalid of [true,false]){const f=boot(fixture(),async()=>completion([{...place,day:invalid?99:1}]));try{if(!invalid)f.w.IrisStorage.save=async()=>{throw Error('save failed')};await f.w.generateTravelSpecificPlaces('t');assert.equal(f.w.eval("travelState(messages(),'t').placeProposals.length"),0);assert.equal(f.w.eval('travelSpecificPlaceJobs.size'),0);assert.deepEqual(f.errors,[])}finally{f.w.close()}}
});
test('a five-day trip can generate ten places in one request and persist every day atomically',{skip:!JSDOM},async()=>{
 const saved=fixture();saved.messages['0-0-chat'][0].travelInvitation.days=5;const places=Array.from({length:10},(_,i)=>({name:'具体景点'+i,city:'东京',day:Math.floor(i/2)+1,period:i%2?'午后':'上午'}));let calls=0,prompt='';const f=boot(saved,async(url,options)=>{calls++;prompt=JSON.parse(options.body).messages[0].content;return completion(places)});
 try{f.w.eval('openTravelMap=async()=>{}');f.w.openTravelDetail('t');assert.equal(f.w.document.querySelector('[data-travel-generate-places]').textContent,'生成地点');await f.w.generateTravelSpecificPlaces('t');assert.equal(calls,1);assert.match(prompt,/逐天规划/);assert.match(prompt,/"days":5/);assert.equal(f.w.eval("travelState(messages(),'t').placeProposals.length"),10);assert.equal(f.w.eval("new Set(travelState(messages(),'t').placeProposals.map(p=>p.day)).size"),5);assert.equal(f.w.eval("travelState(messages(),'t').revision"),3);assert.deepEqual(f.errors,[])}finally{f.w.close()}
});
test('invalid dates in a later batch leave the entire generated itinerary unchanged',{skip:!JSDOM},async()=>{
 const saved=fixture();saved.messages['0-0-chat'][0].travelInvitation.days=5;const places=Array.from({length:10},(_,i)=>({name:'景点'+i,city:'东京',day:i===9?6:Math.floor(i/2)+1,period:'上午'}));const f=boot(saved,async()=>completion(places));try{await f.w.generateTravelSpecificPlaces('t');assert.equal(f.w.eval("travelState(messages(),'t').placeProposals.length"),0);assert.equal(f.w.eval("travelState(messages(),'t').revision"),1);assert.deepEqual(f.errors,[])}finally{f.w.close()}
});
