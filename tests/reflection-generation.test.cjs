const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../scripts/app.js'),'utf8');
function fixture({dedicated=false,complete=false,custom=null,fail=false}={}){
 const calls=[],thread=[{mine:true,text:'你好'}],reply=[{mine:false,text:'你好',reflection:{status:'开心',thought:'想聊天',panels:complete?{ready:true}:{}}}],settings={more:{bilingual:true}};
 const context={state:{reflectionPanel:custom?.id||'original'},reflectionReplyTarget:items=>items.at(-1),hasDedicatedReflectionApi:()=>dedicated,customReflectionThemes:()=>custom?[custom]:[],reflectionBuiltInsComplete:panels=>Boolean(panels?.ready),generateOnlineReflection:async()=>{calls.push('base');return{status:'新状态',thought:'新心声'}},generateReflectionPanels:async(snapshot,index,character,theme,options)=>{calls.push('panels');assert.equal(snapshot[index],reply[0]);assert.equal(snapshot[0],thread[0]);assert.equal(theme||null,custom);assert.equal(options.roleSettings,settings);assert.equal(options.deferCommit,true);if(fail)throw Error('接口失败');snapshot[index].reflection.panels={ready:true}},toast:message=>calls.push(message)};
 vm.createContext(context);vm.runInContext(source.slice(source.indexOf('async function prepareOnlineReflection('),source.indexOf('async function generateOnlineReflection(')),context);
 return{calls,reply,thread,run:()=>context.prepareOnlineReflection({}, {},settings,thread,reply)};
}
test('missing panels are deferred until opened without committing the thread',async()=>{const f=fixture();await f.run();assert.deepEqual(f.calls,[]);assert.equal(f.reply[0].reflection.panels.ready,undefined);assert.equal(f.thread.length,1)});
test('complete inline reflection requires no additional request',async()=>{const f=fixture({complete:true});await f.run();assert.deepEqual(f.calls,[])});
test('dedicated reflection generates base with only one automatic call',async()=>{const f=fixture({dedicated:true});await f.run();assert.deepEqual(f.calls,['base'])});
test('custom theme is deferred until opened',async()=>{const f=fixture({complete:true,custom:{id:'custom',revision:2}});await f.run();assert.deepEqual(f.calls,[])});
test('reply preparation does not trigger panel failures or retries',async()=>{const f=fixture({fail:true});await f.run();assert.deepEqual(f.calls,[]);assert.equal(f.reply[0].text,'你好');assert.equal(f.reply[0].reflection.thought,'想聊天')});

function panelRequestFixture(){
 const context={};vm.createContext(context);
 vm.runInContext(source.slice(source.indexOf('function balancedJsonValue('),source.indexOf('function decodeJsonStringField(')),context);
 vm.runInContext(source.slice(source.indexOf('function parseReflectionPanelJson('),source.indexOf('async function generateReflectionPanelsOnce(')),context);
 return context;
}
test('panel parser accepts a complete JSON object wrapped in model explanation',()=>{
 const c=panelRequestFixture();assert.equal(c.parseReflectionPanelJson('以下是生成的面板：\n```json\n{"notes":{"title":"备忘录","text":"含有 } 的文字"}}\n```\n已生成。').notes.title,'备忘录');
 assert.throws(()=>c.parseReflectionPanelJson('{"notes":{"title":"还没生成完'),/完整 JSON/);
});
test('concurrent requests for the same reflection panel share one API call and can retry after failure',async()=>{
 const c=panelRequestFixture(),reflection={},thread=[{reflection}];let calls=0,finish;
 c.generateReflectionPanelsOnce=()=>{calls++;return new Promise((resolve,reject)=>finish={resolve,reject})};
 const first=c.generateReflectionPanels(thread,0,{}),second=c.generateReflectionPanels(thread,0,{});
 assert.equal(calls,1);finish.resolve();await Promise.all([first,second]);
 const failing=c.generateReflectionPanels(thread,0,{});assert.equal(calls,2);finish.reject(Error('请求失败'));await assert.rejects(failing,/请求失败/);
 const retry=c.generateReflectionPanels(thread,0,{});assert.equal(calls,3);finish.resolve();await retry;
});
