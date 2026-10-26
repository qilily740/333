const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
let JSDOM;try{({JSDOM}=require('jsdom'))}catch{}
test('returning from the account ledger restores the shorter bank card height',{skip:!JSDOM},()=>{
 const dom=new JSDOM('<section id="sheet"></section>',{runScripts:'dangerously'}),w=dom.window,timers=[];
 try{
  w.state={user:0,users:[{name:'用户'}],characters:[]};w.esc=String;w.save=()=>{};w.$=selector=>w.document.querySelector(selector);w.matchMedia=()=>({matches:false});
  w.setTimeout=(fn,delay)=>{timers.push({fn,delay});return timers.length};
  w.sheet=(title,subtitle,body)=>{w.document.querySelector('#sheet').innerHTML='<div class="sheet-head"><h2></h2></div>'+body};
  w.HTMLElement.prototype.getBoundingClientRect=function(){return{height:this.classList.contains('chat-bank-front')?210:360}};
  w.eval(fs.readFileSync(require.resolve('../scripts/market-core.js'),'utf8'));
  const source=fs.readFileSync(require.resolve('../scripts/app.js'),'utf8');w.eval(source.slice(source.indexOf('function showChatUserWallet('),source.indexOf('function recordChatPat(')));
  w.showChatUserWallet(0);const rotor=w.document.querySelector('.chat-bank-rotor');assert.equal(rotor.style.gridTemplateRows,'210px');
  w.document.querySelector('.chat-bank-front').click();assert.equal(rotor.style.gridTemplateRows,'360px');timers.shift().fn();
  w.document.querySelector('[data-bank-front]').click();assert.equal(rotor.style.gridTemplateRows,'360px','keep space during the flip animation');
  timers.shift().fn();const restore=timers.shift();assert.equal(restore.delay,830);restore.fn();assert.equal(rotor.style.gridTemplateRows,'210px');
 }finally{w.close()}
});
