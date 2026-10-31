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


test('enabling Iris from its profile preserves the current role, user, mode and conversation',{skip:!JSDOM},async()=>{
 for(const offline of [false,true]){
  const f=boot({char:0,user:0,offline,irisWelcomeChoice:'not-needed',irisGuideOrbHidden:true,users:[{name:'用户'},{name:'其他用户'}],characters:[{name:'甲',chatSettings:{userIndex:0}},{name:'乙',chatSettings:{userIndex:1}}],messages:{'0-0-chat':[{mine:false,text:'原有聊天'}]},settings:{}});
  try{const before=f.w.eval('JSON.stringify({char:state.char,user:state.user,offline:state.offline,messages:state.messages})');f.w.eval('window.originalRole=chars[state.char]');f.w.openCharacters();f.w.eval("drawCharacterEditor(characterDrafts.findIndex(c=>c.builtinRole==='iris-assistant'))");assert.match(f.w.document.querySelector('button[type=submit].profile-confirm').textContent,/开启悬浮助手/);f.w.document.querySelector('#characterForm').dispatchEvent(new f.w.Event('submit',{bubbles:true,cancelable:true}));await flush();assert.equal(f.w.eval('JSON.stringify({char:state.char,user:state.user,offline:state.offline,messages:state.messages})'),before);assert.equal(f.w.eval('chars[state.char]===originalRole'),true);assert.equal(f.w.document.querySelector('#characterDialog').open,false);assert.equal(f.w.document.querySelector('.iris-guide-widget').hidden,false);assert.equal(f.w.document.querySelector('.iris-guide-fab').hidden,false);assert.equal(f.w.document.querySelector('.iris-guide-panel').hidden,true);assert.ok(f.snapshots.some(s=>s.irisWelcomeChoice==='needed'&&!s.irisGuideOrbHidden));assert.deepEqual(f.errors,[])}finally{await flush();f.w.close()}
 }
});
test('ordinary character confirmation still selects that role and its bound user',{skip:!JSDOM},async()=>{
 const f=boot({char:0,user:0,users:[{name:'用户'},{name:'其他用户'}],characters:[{name:'甲'},{name:'乙',chatSettings:{userIndex:1}}],settings:{}});try{f.w.openCharacters();f.w.drawCharacterEditor(1);assert.match(f.w.document.querySelector('button[type=submit].profile-confirm').textContent,/确认使用此角色/);f.w.document.querySelector('#characterForm').dispatchEvent(new f.w.Event('submit',{bubbles:true,cancelable:true}));await flush();assert.equal(f.w.eval('state.char'),1);assert.equal(f.w.eval('state.user'),1);assert.deepEqual(f.errors,[])}finally{await flush();f.w.close()}
});

test('assistant opens ordinary chat, preserves other threads and renders working routes',{skip:!JSDOM},async()=>{
 const f=boot({char:0,user:0,users:[{name:'用户'}],characters:[{name:'甲',chatSettings:{userIndex:0}}],messages:{'0-0-chat':[{mine:true,text:'原对话'}]},settings:{}});
 try{
  const original=f.w.eval('JSON.stringify(state.messages["0-0-chat"])');f.w.openCharacters();f.w.eval("drawCharacterEditor(characterDrafts.findIndex(c=>c.builtinRole==='iris-assistant'))");
  assert.equal(f.w.document.querySelectorAll('.profile-save-actions button').length,3);f.w.document.querySelector('#openAssistantChat').click();
  assert.equal(f.w.eval('activeFeaturePage'),null);assert.equal(f.w.eval("chars[state.char].builtinRole"),'iris-assistant');assert.equal(f.w.eval('state.offline'),false);assert.equal(f.w.document.querySelector('#featureScreen').hidden,true);assert.ok(f.w.document.querySelector('#composer'));
  f.w.document.querySelector('#messageInput').value='全局世界书在哪里';await f.w.submitMessage();await f.w.requestChatReply();await flush();
  assert.match(f.w.document.querySelector('#conversation').textContent,/在这里/);assert.ok(f.w.document.querySelector('.bubble [data-assistant-route="worldbook"]'));
  f.w.document.querySelector('.bubble [data-assistant-route="worldbook"]').click();assert.equal(f.w.eval('activeFeaturePage'),'worldbook');
  assert.equal(f.w.eval('JSON.stringify(state.messages["0-0-chat"])'),original);
  f.w.closeFeaturePage();f.w.openAssistantChat();assert.match(f.w.document.querySelector('#conversation').textContent,/全局世界书在哪里/);
  f.w.openAssistantDestination('role-worldbook');f.w.document.querySelector('[data-assistant-role="0"]').click();assert.equal(f.w.eval('onlineSettingsTab'),'world');assert.ok(f.w.document.querySelector('.role-worldbook-tabs'));assert.deepEqual(f.errors,[]);
 }finally{await flush();f.w.close()}
});
test('usage questions call the model with guidance rather than receiving only a shortcut; reply lifecycle survives navigation',{skip:!JSDOM},async()=>{
 const f=boot({char:0,user:0,users:[{name:'用户'}],characters:[{name:'甲'}],settings:{}});
 try{
  f.w.openAssistantChat();assert.equal(f.w.IrisAssistantChat.localReply('怎么打开和使用世界书？'),null);
  let resolve,captured;f.w.assistantRequest=(...args)=>{captured=args;return new Promise(r=>resolve=r)};f.w.eval('requestConfiguredChatCompletion=(...args)=>window.assistantRequest(...args)');
  f.w.document.querySelector('#messageInput').value='世界书怎么用？';await f.w.submitMessage();const pending=f.w.requestChatReply();await flush();assert.ok(resolve);assert.match(captured[2],/不得用一个入口按钮代替/);assert.match(captured[2],/已核实的功能知识/);
  f.w.eval('state.char=0;render()');resolve('{"text":"可以先创建一本书，添加设定条目，再选择挂载角色与读取范围。","actions":["worldbook","https://evil.example"]}');await pending;await flush();
  f.w.openAssistantChat();assert.match(f.w.document.querySelector('#conversation').textContent,/创建一本书/);assert.equal(f.w.document.querySelectorAll('.message[data-message-index] .bubble [data-assistant-route]').length,1);
  f.w.assistantRequest=async()=>{throw Error('测试网络失败')};f.w.document.querySelector('#messageInput').value='再讲详细些';await f.w.submitMessage();await f.w.requestChatReply();await flush();assert.equal(f.w.eval('messages().filter(m=>m.mine).length'),2);
  f.w.assistantRequest=async()=>'{"text":"先填写书名，再添加条目。","actions":[]}';await f.w.requestChatReply();await flush();assert.equal(f.w.eval('messages().filter(m=>m.mine).length'),2);assert.match(f.w.document.querySelector('#conversation').textContent,/先填写书名/);assert.deepEqual(f.errors,[]);
 }finally{await flush();f.w.close()}
});
test('old assistant preview history migrates once into its ordinary chat',{skip:!JSDOM},async()=>{
 const f=boot({char:0,user:0,users:[{name:'用户'}],characters:[{name:'甲'}],irisAssistantChat:[{mine:true,text:'以前的问题'},{mine:false,text:'以前的回答',actions:['worldbook']}],settings:{}});try{f.w.openAssistantChat();assert.equal(f.w.eval('messages().length'),2);f.w.openAssistantChat();assert.equal(f.w.eval('messages().length'),2);assert.match(f.w.document.querySelector('#conversation').textContent,/以前的回答/);assert.deepEqual(f.errors,[])}finally{await flush();f.w.close()}
});
test('detailed assistant routes open exact settings and experience categories without triggering generation',{skip:!JSDOM},async()=>{
 const f=boot({char:0,user:0,users:[{name:'用户'}],characters:[{name:'甲',chatSettings:{userIndex:0}}],settings:{}});try{
  assert.ok(f.w.IrisAssistantChat.routes.length>=35);assert.equal(f.w.IrisAssistantChat.localReply('时间戳在哪里').actions[0],'timestamps');assert.equal(f.w.IrisAssistantChat.localReply('IF世界入口').actions[0],'if-world');
  f.w.openAssistantDestination('timestamps');f.w.document.querySelector('[data-assistant-role="0"]').click();assert.equal(f.w.eval('onlineSettingsTab'),'more');assert.equal(f.w.document.querySelector('[data-more-group="messages"]').open,true);assert.ok(f.w.document.querySelector('[data-more-value="timestampDisplay"]').classList.contains('assistant-entry-target'));
  f.w.openAssistantDestination('role-mounts');f.w.document.querySelector('[data-assistant-role="0"]').click();assert.equal(f.w.eval('roleWorldBookTab'),'global');assert.ok(f.w.document.querySelector('.role-global-worldbooks'));
  f.w.openAssistantDestination('growth');f.w.document.querySelector('[data-assistant-role="0"]').click();assert.equal(f.w.document.querySelector('#experience-tab-1').getAttribute('aria-selected'),'true');
  f.w.openAssistantDestination('worldbook-scope');assert.ok(f.w.document.querySelector('.global-worldbook-scope').classList.contains('assistant-entry-target'));assert.deepEqual(f.errors,[]);
 }finally{await flush();f.w.close()}
});
test('assistant startup offers essential direct and guided routes; guide advances only on selected clicks',{skip:!JSDOM},async()=>{
 const f=boot({char:0,user:0,users:[{name:'用户'}],characters:[{name:'甲'}],settings:{}});try{
  f.w.openAssistantChat();const card=f.w.document.querySelector('#conversation');assert.ok(card);for(const id of ['api','create-character','create-user','role-user']){assert.ok(card.querySelector('[data-assistant-route="'+id+'"]'));assert.ok(card.querySelector('[data-assistant-guide="'+id+'"]'))}
  card.querySelector('[data-assistant-tutorial="no"]').click();assert.equal(card.querySelector('.assistant-suggestions').open,false);card.querySelector('[data-assistant-tutorial="yes"]').click();assert.equal(card.querySelector('.assistant-suggestions').open,true);
  card.querySelector('[data-assistant-guide="api"]').click();assert.ok(f.w.document.querySelector('#settings.assistant-guide-highlight'));assert.equal(f.w.document.querySelector('#settingsScreen').hidden,true);
  f.w.document.querySelector('#settings').click();await flush();assert.ok(f.w.document.querySelector('[data-system-tab="api"].assistant-guide-highlight'));
  f.w.document.querySelector('[data-system-tab="api"]').click();await flush();f.w.document.querySelector('[data-api-connection="chat"]').click();await flush();assert.ok(f.w.document.querySelector('#addApiConfig.assistant-guide-highlight'));
  f.w.document.querySelector('#addApiConfig').click();await flush();assert.ok(f.w.document.querySelector('#apiName.assistant-guide-highlight'));assert.equal(f.w.document.querySelector('#apiName').value,'');f.w.document.querySelector('[data-guide-next]').click();assert.ok(f.w.document.querySelector('#apiUrl.assistant-guide-highlight'));
  f.w.document.querySelector('[data-guide-stop]').click();assert.equal(f.w.document.querySelector('.assistant-guide-panel'),null);assert.equal(f.w.document.querySelector('.assistant-guide-highlight'),null);
  f.w.openAssistantChat();f.w.startAssistantRouteGuide('create-character');f.w.document.querySelector('#characters').click();await flush();assert.ok(f.w.document.querySelector('#newCharacter.assistant-guide-highlight'));assert.ok(f.w.document.querySelector('#characterDialog .assistant-guide-panel'));f.w.document.querySelector('#newCharacter').click();await flush();assert.ok(f.w.document.querySelector('#characterForm [name="name"].assistant-guide-highlight'));f.w.IrisAssistantGuide.stop();
  assert.deepEqual(f.errors,[]);
 }finally{f.w.IrisAssistantGuide?.stop();await flush();f.w.close()}
});
test('binding guide teaches the real role settings path and waits for a saved user choice',{skip:!JSDOM},async()=>{
 const f=boot({char:0,user:0,users:[{name:'甲用户'},{name:'乙用户'}],characters:[{name:'角色甲',chatSettings:{userIndex:0}}],settings:{}});try{
  f.w.openAssistantChat();assert.equal(f.w.document.querySelectorAll('.assistant-start-message .bubble').length,2);
  f.w.startAssistantRouteGuide('role-user');assert.ok(f.w.document.querySelector('.iris-assistant-role-dialog [data-assistant-role].assistant-guide-highlight'));
  f.w.document.querySelector('[data-assistant-role="0"]').click();await flush();assert.equal(f.w.document.querySelector('#settingsScreen').hidden,true);assert.ok(f.w.document.querySelector('#chatTitle.assistant-guide-highlight'));
  f.w.document.querySelector('#chatTitle').click();await flush();assert.ok(f.w.document.querySelector('[data-online-tab="user"].assistant-guide-highlight'));
  f.w.document.querySelector('[data-online-tab="user"]').click();await flush();const select=f.w.document.querySelector('[data-role-user]');assert.ok(select.classList.contains('assistant-guide-highlight'));select.click();await flush();assert.ok(f.w.document.querySelector('.assistant-guide-panel'));
  select.value='1';select.dispatchEvent(new f.w.Event('change',{bubbles:true}));await flush();assert.equal(f.w.eval('chars[0].chatSettings.userIndex'),1);assert.equal(f.w.document.querySelector('.assistant-guide-panel'),null);assert.deepEqual(f.errors,[]);
 }finally{f.w.IrisAssistantGuide.stop();await flush();f.w.close()}
});
test('assistant restores the original button tutorial and stops the other guide before opening it',{skip:!JSDOM},async()=>{
 const f=boot({char:0,user:0,users:[{name:'用户'}],characters:[{name:'甲'}],irisWelcomeChoice:'not-needed',irisGuideOrbHidden:true,settings:{}});try{
  f.w.openAssistantChat();f.w.document.querySelector('[data-assistant-tutorial="yes"]').click();await flush();assert.equal(f.w.eval('state.irisWelcomeChoice'),'needed');assert.equal(f.w.document.querySelector('.iris-guide-widget').hidden,false);assert.equal(f.w.document.querySelector('.iris-guide-fab').hidden,false);
  f.w.startAssistantRouteGuide('api');assert.ok(f.w.document.querySelector('.assistant-guide-spotlight'));f.w.document.querySelector('[data-guide-stop]').click();
  f.w.document.querySelector('[data-assistant-button-tour]').click();await flush();assert.equal(f.w.eval('irisGuideOpen'),true);assert.equal(f.w.document.querySelector('.assistant-guide-spotlight'),null);assert.equal(f.w.document.querySelector('.iris-guide-widget').hidden,false);assert.deepEqual(f.errors,[]);
 }finally{f.w.IrisAssistantGuide.stop();await flush();f.w.close()}
});
test('real API response envelopes render assistant explanations rather than object coercions',{skip:!JSDOM},async()=>{
 const f=boot({char:0,user:0,users:[{name:'用户'}],characters:[{name:'甲'}],settings:{}});try{
  f.w.openAssistantChat();f.w.assistantResponse={choices:[{message:{content:JSON.stringify({text:'记忆总结用于整理已经发生的对话，方便后续读取。',actions:['role-memory']})}}]};f.w.eval('requestConfiguredChatCompletion=async()=>window.assistantResponse');
  f.w.document.querySelector('#messageInput').value='这个记忆总结怎么用啊';await f.w.submitMessage();await f.w.requestChatReply();await flush();assert.match(f.w.document.querySelector('#conversation').textContent,/整理已经发生的对话/);assert.doesNotMatch(f.w.document.querySelector('#conversation').textContent,/\[object Object\]/);
  const parse=f.w.IrisAssistantChat.parse;
  assert.equal(parse({choices:[{message:{content:[{type:'text',text:'{"text":"分段回答","actions":[]}' }]}}]}).text,'分段回答');
  assert.equal(parse({content:[{type:'text',text:'直接文字回答'}]}).text,'直接文字回答');assert.equal(parse({output_text:'{"text":"响应回答","actions":[]}'}).text,'响应回答');
  assert.throws(()=>parse({choices:[{message:{content:null}}]}),/没有返回/);assert.throws(()=>parse({unexpected:{}}),/没有返回/);assert.deepEqual(f.errors,[]);
 }finally{await flush();f.w.close()}
});
