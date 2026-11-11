const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const Backup=require('../scripts/backup-core.js');

const source=fs.readFileSync(require.resolve('../scripts/app.js'),'utf8');
function bookmarkFixture(){
 const state={char:0,user:0,messages:{'0-0-chat':[{mine:true,text:'第一条'},{mine:false,text:'第二条'}]}};
 const context={state,chars:[{name:'角色'}],key:()=> '0-0-chat',messages:()=>state.messages['0-0-chat'],save:()=>{},structuredClone,expandedImageBatches:new Set()};
 vm.createContext(context);
 vm.runInContext(source.slice(source.indexOf('const chatBookmarks='),source.indexOf('let bookmarkRoleFilter='))+';globalThis.bookmarksApi={bookmarkMessages,unbookmarkMessages,bookmarkVisibleMessageIndex,bookmarkMessagePreview}',context);
 return {state,expandedImageBatches:context.expandedImageBatches,...context.bookmarksApi};
}

test('single and multiple favorites keep independent copies and avoid duplicates',()=>{
 const {state,bookmarkMessages}=bookmarkFixture();
 state.users=[{name:'用户'}];
 assert.equal(bookmarkMessages([0]),1);
 assert.equal(bookmarkMessages([0,1]),1);
 assert.equal(state.chatBookmarks.length,2);
 assert.equal(state.chatBookmarks[0].roleIndex,0);
 assert.equal(state.chatBookmarks[0].userIndex,0);
 state.messages['0-0-chat'][0].text='修改后的原文';
 assert.equal(state.chatBookmarks[0].message.text,'第一条');
 state.messages['0-0-chat'].splice(0,1);
 assert.equal(state.chatBookmarks[0].message.text,'第一条');
});

test('a favorite in a collapsed image batch points to its visible card',()=>{
 const {bookmarkVisibleMessageIndex,bookmarkMessagePreview,expandedImageBatches}=bookmarkFixture();
 const thread=[{type:'image',imageBatchId:'batch',imageData:'first'},{type:'image',imageBatchId:'batch',imageData:'second'}];
 assert.equal(bookmarkVisibleMessageIndex(thread,1),0);
 expandedImageBatches.add('batch');
 assert.equal(bookmarkVisibleMessageIndex(thread,1),1);
 assert.equal(bookmarkVisibleMessageIndex(thread,1,true),0);
 assert.equal(bookmarkMessagePreview({type:'voice',voiceText:'语音正文'}),'语音正文');
});

test('scoped restore replaces covered favorites and retains other conversations',()=>{
 const current={users:[{id:'u',name:'用户'}],characters:[{id:'r',name:'角色'}],messages:{'0-0-chat':[{}],'0-0-offline':[{}]},chatBookmarks:[{id:'old-online',threadKey:'0-0-chat'},{id:'offline',threadKey:'0-0-offline'}]};
 const incoming={users:current.users,characters:current.characters,messages:{'0-0-chat':[{}]},chatBookmarks:[{id:'new-online',threadKey:'0-0-chat'}]};
 assert.deepEqual(Backup.select(current,'online').chatBookmarks.map(item=>item.id),['old-online']);
 assert.deepEqual(Backup.replaceScope(current,incoming,'online').chatBookmarks.map(item=>item.id),['offline','new-online']);
 assert.deepEqual(Backup.replaceCategorySet(current,incoming,['onlineChat']).chatBookmarks.map(item=>item.id),['offline','new-online']);
});

test('multi-select favorites fold together, show stickers, and remain searchable',()=>{
 const state={char:0,user:0,users:[{name:'用户'}],messages:{'0-0-chat':[{mine:true,text:'第一条'},{mine:false,type:'sticker',sticker:'开心',stickerUrl:'data:image/png;base64,abc'}]}};
 const context={state,chars:[{name:'角色'}],key:()=> '0-0-chat',messages:()=>state.messages['0-0-chat'],save:()=>{},structuredClone,expandedImageBatches:new Set(),esc:value=>String(value)};
 vm.createContext(context);
 vm.runInContext(source.slice(source.indexOf('const chatBookmarks='),source.indexOf('function quoteMessage(index)'))+';globalThis.bookmarksView={bookmarkMessages,renderChatBookmarkList,setQuery:value=>bookmarkQuery=value}',context);
 const view=context.bookmarksView;
 assert.equal(view.bookmarkMessages([0,1]),2);
 assert.equal(state.chatBookmarks[0].batchId,state.chatBookmarks[1].batchId);
 assert.match(view.renderChatBookmarkList(),/chat-bookmark-batch/);
 assert.match(view.renderChatBookmarkList(),/chat-bookmark-sticker/);
 view.setQuery('开心');
 assert.match(view.renderChatBookmarkList(),/chat-bookmark-sticker/);
 view.setQuery('不存在');
 assert.match(view.renderChatBookmarkList(),/没有找到匹配的收藏/);
});


test('private message favorites can be removed and saved again without affecting another conversation',()=>{
 const {state,bookmarkMessages,unbookmarkMessages}=bookmarkFixture();state.users=[{name:'用户'}];
 bookmarkMessages([0,1]);const sourceId=state.messages['0-0-chat'][0].bookmarkSourceId;
 state.chatBookmarks.push({id:'other',threadKey:'1-0-chat',sourceId});
 assert.equal(unbookmarkMessages([0]),1);
 assert.equal(state.chatBookmarks.length,2);
 assert.ok(state.chatBookmarks.some(item=>item.id==='other'));
 assert.equal(state.messages['0-0-chat'][0].text,'第一条');
 assert.equal(unbookmarkMessages([0]),0);
 assert.equal(bookmarkMessages([0]),1);
 assert.equal(state.chatBookmarks.filter(item=>item.threadKey==='0-0-chat'&&item.sourceId===sourceId).length,1);
 assert.equal((source.match(/取消收藏':'收藏'/g)||[]).length>=2,true);
 assert.doesNotMatch(source,/bookmarkedSourceIds\.has\(message\.bookmarkSourceId\)\?'disabled'/);
});
