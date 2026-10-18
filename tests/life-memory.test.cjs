const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const M=require('../scripts/life-memory.js');
const now=Date.parse('2026-10-18T10:00:00+08:00'),hour=3600000;
const message={mine:true,text:'周五要面试，有点紧张',createdAt:now};
const source=M.sourceId(message);
function create(slot={},changes=[{action:'upsert',sourceId:source,quote:'周五要面试',title:'面试的后续',dueAt:'2026-10-23T19:00:00+08:00'}]){
 M.apply(slot,{id:'request-1',revision:0,sources:[source],changes},[message],now);return slot;
}
test('follow-ups come from real user evidence, become due after the event, and are asked only once',()=>{
 const slot=create();assert.equal(slot.items.length,1);assert.equal(M.due(slot,now).length,0);
 const later=Date.parse('2026-10-24T10:00:00+08:00'),id=slot.items[0].id;assert.equal(M.due(slot,later).length,1);
 M.apply(slot,{id:'asked',revision:slot.revision,sources:[],changes:[],askedId:id},[message],later);
 assert.equal(slot.items[0].status,'asked');assert.equal(M.due(slot,later+100*hour).length,0);
});
test('fabricated quotes, role messages, deleted source messages and stale in-flight changes cannot create memories',()=>{
 for(const changes of [[{action:'upsert',sourceId:source,quote:'没有说过',title:'虚构'}],[{action:'upsert',sourceId:M.sourceId({...message,mine:false}),quote:message.text,title:'串线'}]])assert.equal(create({},changes).items.length,0);
 const slot={revision:2};assert.equal(M.apply(slot,{id:'late',revision:0,sources:[source],changes:[{action:'upsert',sourceId:source,quote:message.text,title:'旧结果'}]},[message],now),false);
 const recorded=create();M.reconcile(recorded,[]);assert.equal(recorded.items.length,0);
});
test('forgetting is persistent, repeated generation is deduplicated, and completion stops contact',()=>{
 const slot=create(),op={action:'upsert',sourceId:source,quote:'周五要面试',title:'面试有结果了吗'};
 M.apply(slot,{id:'request-2',revision:slot.revision,sources:[source],changes:[op]},[message],now);assert.equal(slot.items.length,1);
 M.forget(slot,slot.items[0].id);M.apply(slot,{id:'request-3',revision:slot.revision,sources:[source],changes:[op]},[message],now);assert.equal(slot.items.length,0);
 const other=create();M.apply(other,{id:'finish',revision:other.revision,sources:[source],changes:[{action:'complete',id:other.items[0].id,sourceId:source,quote:'周五要面试'}]},[message],now);assert.equal(M.due(other,now+200*hour).length,0);
});
test('untimed matters wait 48 hours and disabling retains records without triggering them',()=>{
 const slot=create({},[{action:'upsert',sourceId:source,quote:'周五要面试',title:'面试'}]);assert.equal(slot.items[0].dueAt,now+48*hour);slot.enabled=false;assert.equal(M.due(slot,now+100*hour).length,0);assert.equal(slot.items.length,1);
});
function fetcher(log){return async(url,options)=>{const body=JSON.parse(options.body);log.push({url,body});return{ok:true,json:async()=>({data:body.input.map((text,index)=>({index,embedding:/面试|工作/.test(text)?[1,0]:[0,1]})).reverse()})}}}
test('semantic recall ranks actual vectors, reuses document embeddings and invalidates edited/deleted documents',async()=>{
 const log=[],cache={},config={url:'https://example.invalid/v1/chat/completions',key:'secret',model:'embed'},documents=[{id:'interview',text:'上次面试的结果'},{id:'music',text:'喜欢的音乐'}];
 const recalled=await M.recall(config,cache,documents,'工作面试',1,fetcher(log));assert.equal(recalled[0].id,'interview');assert.equal(log[0].url,'https://example.invalid/v1/embeddings');assert.equal(log[0].body.model,'embed');
 log.length=0;await M.recall(config,cache,documents,'工作',1,fetcher(log));assert.equal(log.length,1,'cached documents are not re-embedded');
 log.length=0;await M.recall(config,cache,[{id:'interview',text:'面试通过了'}],'工作',1,fetcher(log));assert.equal(log.length,2);assert.equal(cache.documents.music,undefined);
 log.length=0;await M.recall({...config,model:'new-model'},cache,documents,'工作',1,fetcher(log));assert.equal(log.length,2);
});
test('invalid and failed embedding responses never manufacture recall results',async()=>{
 const config={url:'https://test.invalid/v1',model:'embed'};
 await assert.rejects(M.embed(config,['a','b'],async()=>({ok:true,json:async()=>({data:[{index:0,embedding:[1,0]},{index:0,embedding:[0,1]}]})})),/格式/);
 await assert.rejects(M.embed(config,['a'],async()=>({ok:true,json:async()=>({data:[{index:0,embedding:[0,0]}]})})),/格式/);
 await assert.rejects(M.embed(config,['a'],async()=>({ok:false,status:401})),/401/);assert.equal(M.cosine([1,0],[0,1]),0);assert.equal(M.cosine([1,0],[1]),-1);
});
function integration(){
 const app=fs.readFileSync(require.resolve('../scripts/app.js'),'utf8'),user={},role={chatSettings:{userIndex:0}},thread=[{...message,createdAt:now-100*hour},{mine:false,text:'面试顺利',createdAt:now-90*hour}],state={char:0,offline:false,users:[user],settings:{},messages:{'0-0-chat':thread}},views={};let resolveRequest,calls=0;
 const context=vm.createContext({window:{IrisLifeMemory:M},state,chars:[role],document:{hidden:false,querySelector:()=>null},$:(key)=>views[key]||={hidden:true},videoCallActive:false,chatReplyInFlight:new Set(),pendingReplyKeys:new Set(),apiConfigForFeature:()=>({url:'https://test.invalid',key:'test'}),apiModelForFeature:()=> 'chat',save(){},render(){},refreshSettings(){},updateChatReplyIndicator(){},Date:class extends Date{static now(){return now}},sendOnlineMessage:async options=>{calls++;await new Promise(resolve=>resolveRequest=resolve);if(options.isCurrent()){const replies=[{mine:false,text:'面试后来怎么样？',createdAt:now}];context.attachLifeMutation(replies,[],role,user,options.thread,options.followUpId);options.thread.push(...replies);return true}return false}});
 vm.runInContext(app.slice(app.indexOf("let apiConnectionTab='chat';"),app.indexOf('const memorySummaryPending=')),context);
 const slot=context.lifeSlot(role,user);slot.items=[{id:'due',title:'面试',sourceId:M.sourceId(thread[0]),createdAt:now-100*hour,dueAt:now-hour,status:'pending'}];return{context,state,role,user,thread,slot,calls:()=>calls,finish:()=>resolveRequest()};
}
test('automatic follow-up freezes identity and discards replies if the user sends a new message or switches persona',async()=>{
 for(const change of [f=>f.thread.push({mine:true,text:'先说别的',createdAt:now}),f=>f.role.chatSettings.userIndex=1,f=>f.slot.revision++]){
 const f=integration(),pending=f.context.syncLifeFollowUps();assert.equal(f.calls(),1);await f.context.syncLifeFollowUps();assert.equal(f.calls(),1);change(f);f.finish();await pending;assert.equal(f.thread.some(x=>x.text==='面试后来怎么样？'),false);assert.equal(f.slot.items[0].status,'pending');
 }
});
test('role and user memory stores are isolated, including their vector caches',()=>{
 const f=integration(),another={};assert.notEqual(f.context.lifeSlot(f.role,another),f.slot);assert.notEqual(f.context.lifeSlot({chatSettings:{}},f.user),f.slot);
});

test('successful automatic contact commits the natural reply and never asks the same matter again',async()=>{
 const f=integration(),pending=f.context.syncLifeFollowUps();f.finish();await pending;assert.equal(f.thread.at(-1).text,'面试后来怎么样？');assert.equal(f.slot.items[0].status,'asked');await f.context.syncLifeFollowUps();assert.equal(f.calls(),1);
});

test('vector configuration uses the fetched single selection directly, without feature routing',async()=>{
 const f=integration(),controls={},elements={url:{value:'https://example.invalid/v1'},key:{value:'test'},model:{value:''}},form={elements},feedback={};
 const radio=['embed-a','embed-b'].map(model=>({dataset:{vectorModel:model}})),keep={addEventListener(_event,callback){this.click=callback}};
 const dialog={open:false,showModal(){this.open=true},close(){this.open=false},querySelectorAll(selector){return selector==='[data-vector-model]'?radio:[]},querySelector(selector){return selector==='[data-vector-keep]'&&this.innerHTML.includes('data-vector-keep')?keep:null}};
 const content={querySelectorAll(){return[]},querySelector(selector){return selector==='[data-vector-form]'?form:selector==='[data-vector-feedback]'?feedback:controls[selector]||={addEventListener(event,callback){this[event]=callback}}}};
 f.context.$=()=>dialog;f.context.esc=String;f.context.AbortController=AbortController;f.context.setTimeout=setTimeout;f.context.clearTimeout=clearTimeout;
 f.context.fetch=async()=>({ok:true,json:async()=>({data:[{id:'embed-a'},{id:'embed-b'}]})});
 f.context.renderVectorConfig(content,'');await controls['[data-vector-models]'].onclick({target:controls['[data-vector-models]']});
 assert.match(dialog.innerHTML,/type="radio"/);assert.doesNotMatch(dialog.innerHTML,/type="checkbox"|全选/);
 radio[0].onchange();radio[1].onchange();keep.click();assert.equal(elements.model.value,'embed-b');assert.equal(f.state.settings.vectorApi,undefined);
 form.onsubmit({preventDefault(){}});assert.equal(f.state.settings.vectorApi.model,'embed-b');assert.equal(f.state.settings.apiFeatureRoutes,undefined);
 const first=f.state.settings.vectorConfigs[0].id;
 controls['[data-vector-add]'].onclick();f.context.renderVectorConfig(content,'');elements.model.value='embed-c';form.onsubmit({preventDefault(){}});
 assert.equal(f.state.settings.vectorConfigs.length,2);assert.equal(f.state.settings.vectorApi.model,'embed-c');assert.notEqual(f.state.settings.activeVectorConfigId,first);
 f.context.renderVectorConfig(content,'');controls['[data-vector-profile]'].onchange({target:{value:first}});assert.equal(f.state.settings.vectorApi.model,'embed-b');
 assert.doesNotMatch(content.innerHTML,/保存后，记忆语义召回直接使用此接口/);
});
