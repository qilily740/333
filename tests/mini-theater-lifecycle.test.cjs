// Non-browser fixtures: these are compatibility probes, not saved AI output.
const vm=require('node:vm'),assert=require('node:assert/strict');
const {srcdoc,mini}=require('./mini-theater-interaction.test.cjs');
const bootstrap=[...srcdoc.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)][0][1];
function environment(){
 class Target {
  constructor(){this.handlers=new Map();this.textContent='';this.checked=false}
  addEventListener(type,fn){if(!this.handlers.has(type))this.handlers.set(type,[]);this.handlers.get(type).push(fn)}
  dispatch(type,extra={}){const event={type,target:this,...extra};for(const fn of [...(this.handlers.get(type)||[])])fn.call(this,event);this['on'+type]?.call(this,event)}
  hasAttribute(){return false}
 }
 const context=new Target(),document=new Target(),controls={},posts=[],timers=[];
 for(const id of ['one','two','next','check','result'])controls[id]=new Target();
 Object.assign(document,{body:new Target(),documentElement:new Target(),getElementById:id=>controls[id]||null,querySelectorAll:()=>[controls.one,controls.two,controls.next,controls.check]});
 Object.assign(context,{document,EventTarget:Target,MutationObserver:class{observe(){}},requestAnimationFrame(){},setTimeout:fn=>timers.push(fn),parent:{postMessage:message=>posts.push(message)}});
 context.window=context;vm.createContext(context);vm.runInContext(bootstrap,context);
 return {context,document,controls,posts,flush:()=>{while(timers.length)timers.shift()()}};
}
(async()=>{
 const env=environment();
 vm.runInContext(`let stage=0,choice='';function choose(value){choice=value;document.getElementById('result').textContent='选择:'+choice}document.getElementById('one').onclick=()=>choose('A');document.getElementById('two').addEventListener('click',()=>choose('B'));addEventListener('DOMContentLoaded',()=>document.getElementById('next').addEventListener('click',()=>{stage++;document.getElementById('result').textContent=stage===1?'第二页':stage===2&&choice==='B'?'通关':'继续'}));document.getElementById('check').addEventListener('change',event=>document.getElementById('result').textContent=event.target.checked?'选中':'取消');window.onload=()=>document.getElementById('result').textContent='已初始化';`,env.context);
 env.context.dispatch('DOMContentLoaded');env.context.dispatch('load');env.flush();
 assert.equal(env.controls.result.textContent,'已初始化');env.controls.one.dispatch('click');assert.equal(env.controls.result.textContent,'选择:A');env.controls.two.dispatch('click');assert.equal(env.controls.result.textContent,'选择:B');env.controls.check.checked=true;env.controls.check.dispatch('change');assert.equal(env.controls.result.textContent,'选中');env.controls.next.dispatch('click');assert.equal(env.controls.result.textContent,'第二页');env.controls.next.dispatch('click');assert.equal(env.controls.result.textContent,'通关');assert(!env.posts.some(x=>x.category==='event-binding-missing'));
 const missing=environment();missing.context.dispatch('DOMContentLoaded');missing.context.dispatch('load');missing.flush();assert(missing.posts.some(x=>x.category==='event-binding-missing'),'bootstrap listeners must not disguise missing work listeners');
 const delayed=environment();vm.runInContext(`window.onload=()=>document.getElementById('one').addEventListener('click',()=>document.getElementById('result').textContent='有效');`,delayed.context);delayed.context.dispatch('DOMContentLoaded');delayed.context.dispatch('load');delayed.flush();assert(!delayed.posts.some(x=>x.category==='event-binding-missing'));delayed.controls.one.dispatch('click');assert.equal(delayed.controls.result.textContent,'有效');
 const scoped=environment();vm.runInContext(`(()=>{function choose(){return 1}})();`,scoped.context);assert.throws(()=>vm.runInContext('choose()',scoped.context),/choose is not defined/);
 if(typeof vm.SourceTextModule==='function'){
  const module=new vm.SourceTextModule('function choose(){return 2}',{context:scoped.context});await module.link(()=>{});await module.evaluate();assert.throws(()=>vm.runInContext('choose()',scoped.context),/choose is not defined/,'module functions are not globals for inline onclick');
 }else{
  // The ordinary test command also runs the module-scope check with its required Node flag.
  const moduleProbe=`const vm=require('node:vm'),assert=require('node:assert/strict');(async()=>{const context=vm.createContext({});const module=new vm.SourceTextModule('function choose(){return 2}',{context});await module.link(()=>{});await module.evaluate();assert.throws(()=>vm.runInContext('choose()',context),/choose is not defined/,'module functions are not globals for inline onclick')})().catch(error=>{console.error(error);process.exitCode=1})`;
  require('node:child_process').execFileSync(process.execPath,['--experimental-vm-modules','-e',moduleProbe],{stdio:'pipe'});
 }
 scoped.context.dispatch('error',{target:vm.runInContext('window',scoped.context),error:{name:'ReferenceError'},message:'private text'});assert(scoped.posts.some(x=>x.category==='javascript-initialization-error'&&x.detail.startsWith('ReferenceError;line=')));assert(!JSON.stringify(scoped.posts).includes('private text'));
 scoped.context.dispatch('securitypolicyviolation',{violatedDirective:'script-src-elem',effectiveDirective:'script-src-elem'});assert(scoped.posts.some(x=>x.category==='csp-script-blocked'));
 const classic=environment();vm.runInContext('function choose(){document.getElementById("result").textContent="全局调用成功"}',classic.context);classic.controls.one.onclick=vm.runInContext('(function(){choose()})',classic.context);classic.controls.one.dispatch('click');assert.equal(classic.controls.result.textContent,'全局调用成功');
 const info=mini.generationInfo('base'+mini.prompt);assert.equal(info.instructionCount,1);assert.equal(mini.generationInfo('base').instructionCount,0);assert.equal(mini.generationInfo(mini.prompt+mini.prompt).instructionCount,2);
 console.log('PASS complete bootstrap, onclick/global/module/IIFE scope, listeners, lifecycle, checkbox, choices, stages and safe diagnostics. Browser CSP and touch behavior remain unverified.');
})().catch(error=>{console.error(error);process.exitCode=1});
