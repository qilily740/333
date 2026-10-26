const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../scripts/app.js'),'utf8'),catalog=[{text:'鄙夷',url:'https://example.com/sticker.jpg'}];
function fixture(){
 const c={chars:[{chatSettings:{more:{bilingual:false}}}],state:{char:0},normalizeReflectionPanels:()=>({}),parseRoleActions:()=>({actions:[{mine:false,type:'sticker',sticker:'鄙夷',stickerUrl:catalog[0].url}]})};vm.createContext(c);
 vm.runInContext(source.slice(source.indexOf('function hasOngoingSharedTravel('),source.indexOf('function isSharedTravelReply(')),c);
 vm.runInContext(source.slice(source.indexOf('function splitOnlineBubbleText('),source.indexOf('async function prepareOnlineReflection(')),c);return c;
}
test('standalone generated sticker narration resolves to the exact enabled image',()=>{
 const c=fixture(),message={mine:false,text:'你发送了表情包：鄙夷',createdAt:123};const [reply]=c.expandOnlineReplyMessages([message],catalog);
 assert.equal(reply.type,'sticker');assert.equal(reply.stickerUrl,catalog[0].url);assert.equal(reply.createdAt,123);assert.equal(reply.text,undefined);assert.equal(message.text,'你发送了表情包：鄙夷');
});
test('user text, quotes, unknown names and ordinary mentions remain text',()=>{
 const c=fixture();for(const item of [{mine:true,text:'你发送了表情包：鄙夷'},{mine:false,text:'你发送了表情包：鄙夷',quote:{text:'引用'}},{mine:false,text:'你发送了表情包：不存在'},{mine:false,text:'“你发送了表情包：鄙夷”'},{mine:false,text:'不要发送表情包：鄙夷'}])assert.notEqual(c.expandOnlineReplyMessages([item],catalog)[0].type,'sticker');
 assert.equal(c.expandOnlineReplyMessages([{mine:false,text:'你发送了表情包：鄙夷'}],[])[0].type,undefined);
});
test('a separate sticker bubble in a generated multi-bubble reply becomes an image',()=>{
 const c=fixture(),reply=c.expandOnlineReplyMessages([{mine:false,text:'我知道了[[MSG]]你发送了表情包：鄙夷'}],catalog);assert.equal(reply.length,2);assert.equal(reply[0].text,'我知道了');assert.equal(reply[1].type,'sticker');
});
test('JSON replies deduplicate the matching sticker action and converted narration',()=>{
 const c=fixture(),reply=c.decodeOnlineReply(JSON.stringify({messages:[{text:'你发送了表情包：鄙夷'}],actions:[{type:'sticker',value:'鄙夷'}]}),[],catalog,{});
 assert.equal(reply.length,1);assert.equal(reply[0].type,'sticker');assert.equal(reply[0].stickerUrl,catalog[0].url);
});

test('r9 sticker metadata and explanation become a single real sticker without leaked prose',()=>{
 const c=fixture(),raw='【角色实际发送的表情包】名称：鄙夷。这是图片表情消息，不是聊天台词。';
 const reply=c.decodeOnlineReply(JSON.stringify({messages:[{text:'给'},{text:raw}],actions:[{type:'sticker',value:'鄙夷'}]}),[],catalog,{});
 assert.equal(reply.length,2);assert.equal(reply[0].text,'给');assert.equal(reply[1].type,'sticker');assert.equal(reply[1].stickerUrl,catalog[0].url);
 assert.equal(JSON.stringify(reply).includes('不是聊天台词'),false);
});
test('split r9 metadata is filtered and user quotations remain intact',()=>{
 const c=fixture(),reply=c.expandOnlineReplyMessages([{mine:false,text:'【角色实际发送的表情包】名称：鄙夷。'},{mine:false,text:'这是图片表情消息，不是聊天台词。'}],catalog);
 assert.equal(reply.length,1);assert.equal(reply[0].type,'sticker');
 assert.equal(c.isStickerContextLeakage({mine:false,text:'这是图片表情消息，不是聊天台词。'}),true);
 assert.equal(c.isStickerContextLeakage({mine:true,text:'这是图片表情消息，不是聊天台词。'}),false);
 assert.equal(c.isStickerContextLeakage({mine:false,text:'【角色实际发送的表情包】名称：鄙夷。',quote:{text:'原话'}}),false);
 assert.equal(c.expandOnlineReplyMessages([{mine:true,text:'这是图片表情消息，不是聊天台词。'}],catalog)[0].text,'这是图片表情消息，不是聊天台词。');
 assert.equal(c.expandOnlineReplyMessages([{mine:false,text:'【角色实际发送的表情包】名称：未启用。'}],catalog).length,0);
});
