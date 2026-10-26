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

test('existing leaked sticker captions are hidden without changing stored messages or their indices',{skip:!JSDOM},async()=>{
 const thread=[{mine:true,text:'给我'},{mine:false,text:'给'},{mine:false,text:'【角色实际发送的表情包】名称：鄙夷。'},{mine:false,text:'这是图片表情消息，不是聊天台词。'},{mine:false,type:'sticker',sticker:'鄙夷',stickerUrl:'https://example.com/sticker.jpg'}];
 const f=boot({char:0,user:0,users:[{name:'测试用户'}],characters:[{name:'甲',chatSettings:{userIndex:0}}],messages:{'0-0-chat':thread},emojis:{groups:[{id:'g1',name:'常用',items:[{id:'e1',text:'鄙夷',url:'https://example.com/sticker.jpg'}]}]},settings:{}});
 try{
  const conversation=f.w.document.querySelector('#conversation');assert.doesNotMatch(conversation.textContent,/角色实际发送的表情包|不是聊天台词/);
  assert.ok(conversation.querySelector('[data-message-index="1"]'));assert.equal(conversation.querySelector('[data-message-index="2"]'),null);assert.equal(conversation.querySelector('[data-message-index="3"]'),null);
  assert.equal(conversation.querySelector('[data-message-index="4"] .message-sticker-image').getAttribute('src'),'https://example.com/sticker.jpg');
  assert.ok(conversation.querySelector('[data-message-index="4"] .avatar:not(.is-group-hidden)'));
  assert.equal(f.w.eval('messages().length'),5);assert.equal(f.w.eval('messages()[2].text'),thread[2].text);
  assert.equal(f.w.eval('messagePromptContent(messages()[2])'),'');assert.equal(f.w.eval('messagePromptContent(messages()[3])'),'');assert.equal(f.w.eval('messagePromptContent(messages()[4])'),'[表情包：鄙夷]');assert.deepEqual(f.errors,[]);
 }finally{await flush();f.w.close()}
});
