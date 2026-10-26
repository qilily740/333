const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync(require.resolve('../scripts/app.js'),'utf8');
const start=source.indexOf('function ifDreamContext(');
const end=source.indexOf('function travelPlaceKey(',start);
const ifDreamContext=vm.runInNewContext(`${source.slice(start,end)};ifDreamContext`);

test('an injected IF dream identifies the bound user as the dream participant',()=>{
 const character={experienceCharacterId:'role-1',ifWorld:{ownerId:'role-1',dreams:[
  {roleId:'role-1',userId:'user-1',userName:'小雨',stage:{age:12,name:'少年时期',source:'入学'},injectOnline:true,content:'角色和用户在旧车站遇见阿岚，约好去海边。'},
  {roleId:'role-1',userId:'user-2',userName:'别人',injectOnline:true,content:'另一位用户的梦境'}
 ]}};
 const prompt=ifDreamContext(character,'online',{name:'小雨',irisMarketId:'user-1'});
 assert.match(prompt,/梦中出现的用户：小雨/);
 assert.match(prompt,/当前角色自己做过/);
 assert.match(prompt,/角色单方面的梦境记忆/);
 assert.match(prompt,/默认处于这一阶段/);
 assert.match(prompt,/只有当前或此前真实聊天中，用户明确说自己也梦到这件事/);
 assert.match(prompt,/只提到梦中的姓名、设定或细节时/);
 assert.match(prompt,/由当前角色人设、现实关系和对话决定/);
 assert.match(prompt,/不自动改变角色醒来后的性格、立场或现实关系/);
 assert.match(prompt,/旧车站遇见阿岚/);
 assert.match(prompt,/梦境开始时的角色阶段：12岁 · 少年时期 · 从「入学」开始/);
 assert.match(prompt,/梦中阶段不是角色醒来后的当前年龄或身份/);
 assert.ok(!prompt.includes('另一位用户的梦境'));
});

test('a legacy dream without a saved user name still refers to the current bound user',()=>{
 const character={experienceCharacterId:'role-1',ifWorld:{ownerId:'role-1',dreams:[{roleId:'role-1',injectOffline:true,content:'梦里一起坐船'}]}};
 assert.match(ifDreamContext(character,'offline',{name:'小雨'}),/梦中出现的用户：小雨/);
 assert.match(ifDreamContext(character,'offline',{name:'小雨'}),/梦境开始时的角色阶段：未明确/);
});
