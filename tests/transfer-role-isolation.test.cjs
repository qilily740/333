const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../scripts/app.js'),'utf8');
const coreContext={window:{}};vm.runInNewContext(fs.readFileSync(require.resolve('../scripts/market-core.js'),'utf8'),coreContext);const currencyForRole=coreContext.window.IrisMarketCore.currencyForRole;
const currencies=source.slice(source.indexOf('function characterResidence('),source.indexOf('function currencyPresentation('));
test('current residence wins over foreign backstory and role switches do not share currency',()=>{
 const c=vm.createContext({window:{IrisMarketCore:{currencyForRole}}});vm.runInContext(currencies,c);
 const british={residence:'英国伦敦',details:'中国出生，目前在英国工作'},chinese={residence:'中国上海',details:'朋友在英国伦敦，以前去过英国'};
 assert.equal(c.characterTransferCurrency(british),'GBP');assert.equal(c.characterTransferCurrency(chinese),'CNY');assert.equal(c.characterTransferCurrency(british),'GBP');
 assert.equal(c.characterTransferCurrency({details:'过去在英国留学。\n现居地：上海\n朋友在伦敦'}),'CNY');
 assert.equal(c.characterTransferCurrency({details:'现居地：伦敦\n出生于中国'}),'GBP');
 assert.equal(c.characterTransferCurrency({currency:'CNY',residence:'英国'}),'GBP');
 assert.equal(c.characterTransferCurrency({currency:'GBP',residence:'中国上海'}),'CNY');
 assert.equal(c.characterTransferCurrency({currency:'GBP',details:'常住地未知'}),'GBP');
 assert.equal(c.characterTransferCurrency({details:'朋友在英国，家人在中国'}),'CNY');
});
function deferred(){let resolve;const promise=new Promise(r=>resolve=r);return{promise,resolve}}
test('two overlapping replies keep transfers in their original role threads across reflection awaits',{timeout:3000},async()=>{
 const modelA=deferred(),modelAEntered=deferred(),reflectionA=deferred(),reflectionB=deferred(),aEntered=deferred(),bEntered=deferred(),notices=[];
 const user={name:'用户'},roles=[{name:'英镑角色',residence:'英国',irisMarketId:'gbp-role'},{name:'人民币角色',residence:'中国',irisMarketId:'cny-role'}];roles.forEach(role=>role.chatSettings={userIndex:0,more:{timeAwarenessEnabled:false},memory:{enabled:false}});
 const threads=[[],[]];let sequence=0;
 const c={state:{char:0,user:0,offline:false,users:[user],settings:{}},chars:roles,window:{IrisMarketCore:{currencyForRole,normalize(){},id:()=>String(++sequence),personaId:()=> 'user-0'}},key:()=>`${c.state.char}-0-chat`,messages:()=>threads[c.state.char],currentRoleChatSettings:()=>roles[c.state.char].chatSettings,apiConfigForFeature:()=>({url:'https://test.invalid',key:'test'}),apiModelForFeature:()=> 'test',enabledRoleStickers:()=>[],messagePromptContent:m=>m.text||'',buildOnlineSystemPrompt:({character})=>character.name,vectorMemoryContext:async()=>'',attachChatImages:async()=>'',removeInternalReplyLeakage:String,recoverOnlinePayload:()=>null,expandOnlineReplyMessages:items=>items,hasDedicatedReflectionApi:()=>true,attachLifeMutation(){},applyTransferExchangeRates:async()=>{},save(){},render(){},maybeSummarizeOnlineMemory(){},openNewChatTravelAgreement(){},ensureChatTravelAgreement:async()=>{},toast:message=>notices.push(message),requestConfiguredChatCompletion:async(api,model,prompt)=>{if(prompt===roles[0].name){modelAEntered.resolve();await modelA.promise}return{choices:[{message:{content:'给你转一笔。 [[IRIS_ACTION {"type":"transfer","amount":88}]]'}}]}},collectChatTravelPlaces:async()=>[],prepareOnlineReflection:async role=>{if(role===roles[0]){aEntered.resolve();await reflectionA.promise}else{bEntered.resolve();await reflectionB.promise}}};
 vm.createContext(c);vm.runInContext(currencies,c);vm.runInContext(source.slice(source.indexOf('function parseRoleActions('),source.indexOf('function openTransferComposer(')),c);vm.runInContext(source.slice(source.indexOf('function decodeOnlineReply('),source.indexOf('async function prepareOnlineReflection(')),c);vm.runInContext(source.slice(source.indexOf('async function enrichOnlineReply('),source.indexOf('async function sendOnlineMessage(')),c);vm.runInContext(source.slice(source.indexOf('async function sendOnlineMessage('),source.indexOf('async function replyToGiftImmediately(')),c);
 const waiting=async(gate,request)=>Promise.race([gate.promise,request.then(value=>{throw Error('request ended early: '+value+' '+notices.join(';'))})]);
 const first=c.sendOnlineMessage();await waiting(modelAEntered,first);c.state.char=1;const second=c.sendOnlineMessage();await waiting(bEntered,second);modelA.resolve();await waiting(aEntered,first);reflectionB.resolve();assert.equal(await second,true,notices.join(';'));reflectionA.resolve();assert.equal(await first,true,notices.join(';'));
 const a=threads[0].filter(m=>m.type==='transfer'),b=threads[1].filter(m=>m.type==='transfer');assert.equal(a.length,1);assert.equal(b.length,1);assert.equal(a[0].currency,'GBP');assert.equal(a[0].characterId,'gbp-role');assert.equal(a[0].fromName,'英镑角色');assert.equal(b[0].currency,'CNY');assert.equal(b[0].characterId,'cny-role');assert.equal(b[0].fromName,'人民币角色');
});
