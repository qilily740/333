const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const {JSDOM,VirtualConsole}=require('jsdom');
const source=fs.readFileSync(require.resolve('../scripts/app.js'),'utf8');
function fixture(){
 const context=vm.createContext({});
 vm.runInContext(source.slice(source.indexOf('function onlineChromeThemeCss('),source.indexOf('function refreshBundledIMessageCss(')),context);
 vm.runInContext(source.slice(source.indexOf('function scopeBeautifySelector('),source.indexOf('function setBeautifyCss(')),context);
 const theme=context.onlineChatThemeCss('imessage');
 const root='.phone:has(#conversation:not(.is-offline-story)):not(:has(> #featureScreen.is-group-chat-conversation))';
 const row=(mine,longQuote)=>`<article class="message message-type-text ${mine?'mine':''}"><span class="avatar">人</span><div class="message-content"><div class="message-bubble-line"><div class="wechat-quoted-stack"><div class="bubble"><div class="bubble-text">${longQuote?'嗯':'正文很长。'.repeat(30)}</div></div><div class="bubble-quote">${longQuote?'引用内容。'.repeat(40):'短引用'}</div></div><time class="message-time">19:45</time></div><div class="bubble-translation">译文有连续的白色轮廓。</div></div></article>`;
 const rows=[row(false,true),row(true,true),row(false,false),row(true,false)].join('');
 const footer=group=>`<footer class="bottom ${group?'group-chat-bottom':''}"><nav class="dock"><div class="dock-capsule">用户、线下、输入</div><button class="dock-add">功能</button></nav><form class="composer"><button ${group?'data-group-functions':'id="inputFunctions"'}>功能</button><div class="input-wrap"><textarea></textarea></div><button ${group?'data-group-reply':'id="reply"'}>重 roll</button></form></footer>`;
 const dom=new JSDOM(`<main class="phone" id="private"><section id="conversation" class="conversation">${rows}</section>${footer(false)}</main><main class="phone"><section id="featureScreen" class="group-chat-shell is-group-chat-conversation"><div class="group-chat-room"><section class="conversation group-chat-thread">${rows}</section>${footer(true)}</div></section></main>`,{virtualConsole:new VirtualConsole()});
 const style=dom.window.document.createElement('style');
 style.textContent=fs.readFileSync(require.resolve('../style.css'),'utf8')+context.scopeBeautifyCss(theme,root,'online')+context.scopeBeautifyCss(theme,'#featureScreen.is-group-chat-conversation','group');dom.window.document.head.append(style);
 return{dom,document:dom.window.document,css:node=>dom.window.getComputedStyle(node)};
}
test('quoted private and group timestamps remain in the main row without out-of-flow offsets',()=>{
 const f=fixture();try{for(const row of f.document.querySelectorAll('.message')){
  const line=f.css(row.querySelector('.message-bubble-line')),time=f.css(row.querySelector('.message-time')),quote=f.css(row.querySelector('.bubble-quote'));
  assert.equal(line.display,'grid');assert.equal(time.position,'static');assert.equal(time.transform,'none');assert.equal(time.gridRow,'1');assert.equal(quote.gridRow,'2');
  assert.equal(time.gridColumn,row.classList.contains('mine')?'1':'2');assert.equal(line.maxWidth,'100%');assert.equal(line.minWidth,'0');
 }}finally{f.dom.window.close()}
});
test('iMessage input and home controls lose their glass styling on entry to offline mode',()=>{
 const f=fixture();try{
  for(const selector of ['#private .dock-capsule','#private .dock-add','#private .input-wrap','.group-chat-bottom .input-wrap'])assert.match(f.css(f.document.querySelector(selector)).backgroundColor,/rgba\(255, 255, 255, 0\.42\)/,selector);
  for(const selector of ['#inputFunctions','#reply','[data-group-functions]','[data-group-reply]'])assert.equal(f.css(f.document.querySelector(selector)).backgroundColor,'rgb(255, 255, 255)');
  f.document.querySelector('#conversation').classList.add('is-offline-story');
  for(const selector of ['#private .dock-capsule','#private .dock-add','#private .input-wrap','#inputFunctions','#reply'])assert.notEqual(f.css(f.document.querySelector(selector)).backgroundColor,'rgba(255, 255, 255, 0.42)',selector);
  assert.equal(f.css(f.document.querySelector('[data-group-reply]')).backgroundColor,'rgb(255, 255, 255)');
 }finally{f.dom.window.close()}
});
