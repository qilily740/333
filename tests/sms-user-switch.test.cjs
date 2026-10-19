const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const app=fs.readFileSync(require.resolve('../scripts/app.js'),'utf8');
const users=[{name:'用户甲'},{name:'用户乙',avatar:'https://example.invalid/avatar.png'}];
test('SMS header exposes the current user and all available masks',()=>{
 const header={children:[],append(node){this.children.push(node)}};
 const context=vm.createContext({state:{users,user:1},document:{createElement:()=>({})},$:()=>({parentElement:header}),esc:String,avatar:user=>`<span class="avatar">${user.name}</span>`});
 vm.runInContext(app.slice(app.indexOf('function renderSmsUserSwitch('),app.indexOf('function renderSmsInbox(')),context);
 context.renderSmsUserSwitch();assert.equal(header.children.length,1);
 const box=header.children[0];assert.equal(box.className,'sms-user-switch');
 assert.match(box.innerHTML,/id="smsUserToggle"[^>]*当前用户乙/);
 assert.equal((box.innerHTML.match(/data-sms-user-select=/g)||[]).length,2);
 assert.match(box.innerHTML,/data-sms-user-select="1"[^>]*aria-checked="true"/);
});
test('switching the SMS mask leaves the previous conversation and preserves stored messages',()=>{
 const timers=[],events={},renders=[],attributes={},buttons=users.map((_,index)=>({dataset:{smsUserSelect:String(index)}}));
 const toggle={setAttribute:(name,value)=>attributes[name]=value,getBoundingClientRect:()=>({bottom:60,right:370}),contains:()=>false};
 const menu={hidden:true,style:{},querySelectorAll:()=>buttons,contains:()=>false};
 const content={querySelectorAll:()=>[],querySelector:()=>null};
 const state={users,user:0,smsMessages:{'0-0':[{text:'甲的短信'}],'0-1':[{text:'乙的短信'}]}};
 const original=JSON.stringify(state.smsMessages);let saves=0;
 const document={documentElement:{dataset:{smsActionDismiss:'true'}},addEventListener:(name,fn)=>events[name]=fn,removeEventListener:name=>delete events[name]};
 const context=vm.createContext({state,activeSmsThread:{roleIndex:0,userIndex:0},activeSmsMessageActionIndex:2,smsSelectionThreadKey:'0-0',smsSelectedMessageIndices:new Set([0]),smsClearMenuOpen:true,document,window:{innerHeight:800,innerWidth:390},$:selector=>({'#featurePageContent':content,'#smsUserToggle':toggle,'#smsUserMenu':menu})[selector],setTimeout:fn=>timers.push(fn),save:()=>saves++,renderFeaturePage:page=>renders.push(page)});
 vm.runInContext(app.slice(app.indexOf('function bindSmsPage('),app.indexOf('function openFeaturePage(')),context);context.bindSmsPage();
 toggle.onclick({stopPropagation(){}});assert.equal(menu.hidden,false);assert.equal(attributes['aria-expanded'],'true');
 timers.shift()();events.pointerdown({target:{}});assert.equal(menu.hidden,true);assert.equal(attributes['aria-expanded'],'false');
 buttons[1].onclick();assert.equal(state.user,1);assert.equal(context.activeSmsThread,null);assert.equal(context.activeSmsMessageActionIndex,null);assert.equal(context.smsSelectedMessageIndices.size,0);assert.equal(context.smsSelectionThreadKey,'');assert.equal(saves,1);assert.deepEqual(renders,['sms']);assert.equal(JSON.stringify(state.smsMessages),original);
});
