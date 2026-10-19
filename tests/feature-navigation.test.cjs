const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const app=fs.readFileSync(require.resolve('../scripts/app.js'),'utf8');
function fixture(){
 const header={children:[]},title={innerHTML:'Business',parentElement:header},back={};
 const extra=className=>({className,remove(){header.children=header.children.filter(node=>node!==this)}});
 header.children=[title,extra('reading-topbar-actions'),extra('perfumery-topbar-user'),extra('sms-user-switch')];
 const content={innerHTML:'经营内容',onclick(){},onsubmit(){},onwheel(){},querySelector:()=>null};
 const screen={hidden:false,querySelector:()=>null};
 const nodes={'#featurePageTitle':title,'#featurePageContent':content,'#featureScreen':screen,'#featureBack':back};
 const context=vm.createContext({activeFeaturePage:'worldbook',activeSmsThread:null,$:selector=>nodes[selector]||null,document:{body:{}},window:{},renderGlobalWorldBookPanel:()=>'<worldbook>世界书</worldbook>',bindGlobalWorldBookPanel(){},renderSmsInbox:()=>'<sms>短信</sms>',bindSmsPage(){},positionSmsMessageActions(){}});
 const start=app.includes('function resetFeaturePageChrome(')?app.indexOf('function resetFeaturePageChrome('):app.indexOf('function renderFeaturePage(');
 vm.runInContext(app.slice(start,app.indexOf('function renderGlobalWorldBookPanel(',start)),context);
 return{context,header,title,content,screen};
}
test('switching to worldbook removes foreign topbar avatars and old content delegates',()=>{
 const f=fixture();f.context.renderFeaturePage('worldbook');
 assert.deepEqual(f.header.children,[f.title]);
 assert.match(f.title.innerHTML,/World Book/);
 assert.match(f.content.innerHTML,/世界书/);
 for(const handler of ['onclick','onsubmit','onwheel'])assert.equal(f.content[handler],null);
});
test('late SMS renders cannot replace the active business title or content',()=>{
 const f=fixture();f.context.activeFeaturePage='business';f.context.renderFeaturePage('sms');
 assert.equal(f.title.innerHTML,'Business');assert.equal(f.content.innerHTML,'经营内容');
});
test('late results cannot rerender a closed feature screen',()=>{
 const f=fixture();f.screen.hidden=true;f.context.renderFeaturePage('worldbook');
 assert.equal(f.title.innerHTML,'Business');assert.equal(f.content.innerHTML,'经营内容');
});
const flush=async()=>{for(let i=0;i<12;i++)await new Promise(resolve=>setImmediate(resolve))};
const sharedContent=()=>({innerHTML:'',scrollTop:0,closest:()=>null,querySelector:()=>null,querySelectorAll:()=>[]});
test('market search finishing after navigation keeps its data but cannot overwrite another page',async()=>{
 let active=true,finish;const window={},content=sharedContent(),title={querySelector:()=>null};
 const context=vm.createContext({window,console,setTimeout,FormData:class{get(){return '测试独立搜索'}}});
 for(const name of ['market-core','market'])vm.runInContext(fs.readFileSync(require.resolve('../scripts/'+name+'.js'),'utf8'),context);
 const state={users:[{name:'用户'}],characters:[],user:0,char:-1};
 window.IrisMarket.render({state,characters:[],content,title,esc:String,save(){},isActive:()=>active,request:()=>new Promise(resolve=>finish=resolve)});
 const pending=content.onsubmit({preventDefault(){},target:{matches:selector=>selector==='.market-search'}});
 assert.equal(typeof finish,'function');active=false;content.innerHTML='世界书内容';
 finish(JSON.stringify({products:[1,2].map(i=>({name:'测试商品'+i,category:'礼盒',shop:'测试店铺',brand:'测试',price:20+i,description:'描述',colors:['白'],specName:'规格',spec:'标准',material:'纸',reviews:[{author:'用户',rating:4,text:'评价'}]}))}));
 await pending;assert.equal(content.innerHTML,'世界书内容');
 assert.ok(state.market.aiCache['测试独立搜索'],'successful background results remain cached');
});
test('forum feed finishing after navigation cannot replace the new page',async()=>{
 let active=true,finish;const timers=[],content=sharedContent(),window={IrisForumCore:require('../scripts/forum-core.js')};
 const context=vm.createContext({window,document:{querySelector:()=>null},setTimeout:fn=>timers.push(fn),console});
 vm.runInContext(fs.readFileSync(require.resolve('../scripts/forum.js'),'utf8'),context);
 const state={users:[{name:'用户'}],user:0,forums:{}};
 const reply=new Promise(resolve=>finish=resolve);let calls=0;
 window.IrisForum.render({state,characters:[],content,esc:String,save(){},isActive:()=>active,apiConfigured:true,request:()=>{calls++;return reply}});
 for(const timer of timers.splice(0))timer();await flush();assert.ok(calls>0);
 active=false;content.innerHTML='商场内容';finish(JSON.stringify({posts:[],comments:[]}));await flush();
 assert.equal(content.innerHTML,'商场内容');
});
