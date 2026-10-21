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
test('missing panels finish before reply preparation resolves without committing the thread',async()=>{const f=fixture();await f.run();assert.deepEqual(f.calls,['panels']);assert.equal(f.reply[0].reflection.panels.ready,true);assert.equal(f.thread.length,1)});
test('complete inline reflection requires no additional request',async()=>{const f=fixture({complete:true});await f.run();assert.deepEqual(f.calls,[])});
test('dedicated reflection generates base and panels during reply preparation',async()=>{const f=fixture({dedicated:true});await f.run();assert.deepEqual(f.calls,['base','panels'])});
test('selected custom theme is prepared even when built-ins are complete',async()=>{const f=fixture({complete:true,custom:{id:'custom',revision:2}});await f.run();assert.deepEqual(f.calls,['panels'])});
test('panel failure preserves reply and base reflection for manual retry',async()=>{const f=fixture({fail:true});await f.run();assert.deepEqual(f.calls,['panels','接口失败']);assert.equal(f.reply[0].text,'你好');assert.equal(f.reply[0].reflection.thought,'想聊天')});
