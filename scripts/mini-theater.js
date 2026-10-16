/* Offline side stories: parsing, send-only filtering and isolated interactive rendering. */
(() => {
 'use strict';
 const prompt = `<随机互动小剧场>

【创作定位】

每轮正式正文结束后，生成一个与近期剧情、人物关系、角色性格及重要细节紧密相关的HTML+CSS+JavaScript互动小剧场。

将小剧场视为一件独立设计、真正可玩的微型数字作品。

每次自由构思主题、视觉形式和玩法，可以是小游戏、私人记录、模拟应用、可操作物品、互动故事、虚拟档案或其他原创形式。

小剧场应带来正文之外的新体验，不重复正文内容，不改变主线事实，不擅自替{{user}}作出选择。

【互动创作】

根据主题设计具有明确目标和实际反馈的交互。

允许点击、拖动、输入、翻页、拆封、组合、排序、选择、探索和解锁等不同玩法。

用户的操作必须真实改变界面内容或内部状态。

可以设计多阶段推进、自由探索、分支反馈、结果判断或持续操作的互动界面。

每个按钮和可操作元素都必须具有完整的JavaScript逻辑。

复杂玩法需要维护正确的进度、条件和结果；简单玩法也应具有实际探索价值。

让不同操作产生符合当前情境的反馈，使用户真正参与小剧场，而不仅仅是观看文字变化。

根据剧情自由选择互动深度，不固定为问答、清单或选项游戏。

【题材范围】
小剧场可以呈现群聊、私信、通话记录、论坛帖子、日记、备忘录、问卷、行程、寻物启事、订单物流、购物车、菜单、相册、歌单、追星记录、演唱会、节日活动、小游戏、解谜、互动故事、角色档案等多种内容。

也可以创作平行世界、身份互换，或角色与{{user}}变成小孩、小狗、小猫等趣味番外。以上仅供启发，题材和形式不限于清单。每次结合剧情选择合适的方向，并留意近期小剧场，尽量更换题材或玩法。平行世界和身份变化只属于本次番外，不自动成为主线事实。

【视觉与样式】

先确定这次小剧场呈现的内容和形式，再让题材决定颜色、布局与质感。不要默认套用深色背景或大块深色面板；只有剧情场景确实需要时才用深色，例如夜间演唱会的灯光或深夜终端。日记可以像手写页面，群聊可以像真实聊天记录；也可以采用明亮、鲜艳、照片感、纸感或纯文字等适合题材的表现，不强制浅色，也不固定使用卡片布局。每次改变呈现方式，让内容具体贴合人物和情境，避免所有小剧场都像同一套精致网页。

手机端优先：正文清楚、按钮好点、长文字自然换行，不出现横向溢出。通过字号、对齐和间距区分主次，避免大片无意义留白和层层套框。

同一作品内保持字体、配色与图标协调。文字清楚耐读，装饰和特效符合题材并服务于内容，不为追求精致堆叠卡片、阴影、纹理或渐变。

人物表达与信息应具体、贴合情境。减少泛泛的抒情文案、装饰性英文和重复说明，不为简单内容强加封面或宣传语。

动画应对应实际动作，如翻页、展开、切换和确认，幅度适中，阅读区域保持稳定。完成后删去无作用的装饰，检查窄屏中的文字、间距和操作位置。

【页面尺寸】

小剧场是嵌入iris聊天区域的独立作品。

页面高度由实际内容自然决定。

html与body保持透明背景，具体视觉背景设置在作品自身的内容容器中。

采用适合小手机的响应式布局，使整体宽度跟随聊天容器变化。

合理处理文字换行、内容高度、交互区域和触屏操作。

页面应紧凑、舒适、完整，呈现自然的嵌入式视觉效果。

【代码实现】

使用原生HTML、CSS、JavaScript生成完整、可运行的独立页面。

CSS和JavaScript均写在HTML文档内部。

交互必须具有真实的事件处理、状态维护和反馈机制。

允许使用CSS绘图及内联SVG实现具有主题感的视觉元素。

作品应能够在受限的独立运行环境中完成本地交互。

所有交互逻辑必须自包含，不依赖外部服务或额外API。

【交互兼容要求】

只使用HTML内的普通JavaScript脚本，不使用type="module"、外部脚本、import、eval或依赖第三方库的代码。

优先使用addEventListener绑定事件，并确保绑定时目标DOM元素已经存在；可以在DOMContentLoaded中初始化。

若使用HTML内联onclick等事件属性，所调用的函数必须明确挂载到window上；不要从模块、闭包或局部作用域调用无法访问的函数。

逐一核对每个控件的选择器、事件监听、状态变化和可见反馈，确保元素ID真实存在、变量已定义、每个操作都能改变作品状态。

【角色与剧情】

所有人物反应遵守既定人设、当前关系及故事背景。

允许出现有趣、微妙、复杂或出人意料的互动，但应符合已有情节。

小剧场属于独立番外，里面的选择、假设与结局默认不成为正式剧情事实。

【折叠兼容】

小剧场的折叠与展开由iris前端负责。

AI只生成内部互动作品，不额外生成折叠按钮。

【输出格式】

先完成正式正文，再生成一个小剧场。

使用固定标签：

<mini_theater>
\`\`\`html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
/* 当前作品的完整CSS */
</style>
</head>
<body>
<!-- 当前作品的完整HTML结构 -->
<script>
/* 当前作品的完整JavaScript交互逻辑 */
</script>
</body>
</html>
\`\`\`
</mini_theater>

实际生成时填写完整代码，不保留示例注释。

小剧场代码必须完整放在 Markdown HTML 代码围栏中：以 \`\`\`html 单独一行开始，以 \`\`\` 单独一行结束。外围固定使用 <mini_theater> 和 </mini_theater> 标签；围栏内只放完整 HTML 文档，不额外输出说明。

</随机互动小剧场>`;
 function upgradePrompt(value){
  const source=String(value||'');
  if(!source.includes('每次都必须采用明亮界面')&&!source.includes('夜间演唱会可以使用暗色灯光，日记可以像手写页面'))return source;
  const start=source.includes('【视觉创作】')?source.indexOf('【视觉创作】'):source.indexOf('【题材范围】');
  const end=source.indexOf('【页面尺寸】',start);
  const currentStart=prompt.indexOf('【题材范围】'),currentEnd=prompt.indexOf('【页面尺寸】',currentStart);
  if(start<0||end<0||currentStart<0||currentEnd<0)return source;
  return source.slice(0,start)+prompt.slice(currentStart,currentEnd)+source.slice(end);
 }
 const ruleId='offline-no-mini-theater';
 const rule=()=>({id:ruleId,name:'不发送小剧场',find:'/<mini_theater\\b[^>]*>[\\s\\S]*?<\\/mini_theater\\s*>/gi',replace:'',enabled:true,contextEnabled:true,displayEnabled:false,target:['ai']});
 const completePattern=()=>/<mini_theater\b[^>]*>[\s\S]*?<\/mini_theater\s*>/gi;
 function unwrapHtmlFence(value){const source=String(value??'');const match=/^\s*```(?:html)?[ \t]*\r?\n([\s\S]*?)\r?\n```[ \t]*\s*$/i.exec(source);return match?match[1].trim():source}
 function split(value,streaming=false){
  const source=String(value??''),theaters=[];let prose='',cursor=0;
  const opening=/<mini_theater\b[^>]*>/gi;let match;
  while((match=opening.exec(source))){
   prose+=source.slice(cursor,match.index);
   const close=/<\/mini_theater\s*>/gi;close.lastIndex=opening.lastIndex;const end=close.exec(source);
   if(end){theaters.push(unwrapHtmlFence(source.slice(opening.lastIndex,end.index)));cursor=close.lastIndex;opening.lastIndex=cursor;continue}
   const tail=source.slice(opening.lastIndex),htmlEnd=/<\/html\s*>/i.exec(tail);
   // For malformed historical labels, remove recognizable HTML only, retaining ordinary prose.
   if(!streaming){if(/^\s*(?:<!doctype\b|<(?:html|head|body|style|script|meta)\b)/i.test(tail)){if(htmlEnd)prose+=tail.slice(htmlEnd.index+htmlEnd[0].length)}else prose+=tail}
   cursor=source.length;break;
  }
  prose+=source.slice(cursor);
  prose=prose.replace(/<\/mini_theater\s*>/gi,'');
  const partial=/<(?:\/?mini_theater\b[^>]*|\/?m(?:i(?:n(?:i(?:_(?:t(?:h(?:e(?:a(?:t(?:e(?:r)?)?)?)?)?)?)?)?)?)?)?)$/i.exec(prose);
  if(partial&&(streaming||/^<\/?mini_theater\b/i.test(partial[0])))prose=prose.slice(0,partial.index);
  return{prose,theaters}
 }
 function filterHistory(value){return split(String(value??'').replace(completePattern(),''),false).prose}
 function hash(value){let n=2166136261;for(const c of String(value))n=Math.imul(n^c.charCodeAt(0),16777619);return(n>>>0).toString(36)}
 const documents=new Map(),sourceInfo=new Map(),bound=new WeakSet(),frames=new Map(),runtimeInfo=new WeakMap();
 const debugEnabled=()=>window.__IRIS_DEV__===true;
 function generationInfo(systemPrompt){const sections=String(systemPrompt||'').match(/<随机互动小剧场>[\s\S]*?<\/随机互动小剧场>/g)||[];return{rendererVersion:'mini-diagnostics-3',builtinPromptHash:hash(prompt),sentPromptHashes:sections.map(hash),instructionCount:sections.length,...(debugEnabled()?{sentTheaterPrompts:sections}:{})}}
 function recordRuntime(frame,category,detail=''){let info=runtimeInfo.get(frame);if(!info){info={events:[]};runtimeInfo.set(frame,info)}info.events.push({category,detail,time:Date.now()});if(info.events.length>50)info.events.shift()}
 function markup(message,threadKey,escape){
  const html=unwrapHtmlFence(message?.miniTheater||split(message?.text).theaters[0]||split(message?.rawResponse).theaters[0]||'');
  if(!html.trim())return'';
  const key=hash(`${threadKey}:${message?.miniTheaterId||message?.id||message?.createdAt||''}:${html}`);
  documents.set(key,html);sourceInfo.set(key,{createdAt:Number(message?.createdAt)||null,rawExtractedHtml:split(message?.rawResponse).theaters[0]||null,generation:message?.miniTheaterGeneration||null});
  return `<details class="offline-mini-theater" data-mini-theater-key="${escape(key)}"><summary>小剧场</summary></details>`
 }
 function documentFor(html,token){
  const doc=new DOMParser().parseFromString(String(html),'text/html');
  doc.querySelectorAll('base,meta[http-equiv],link,iframe,frame,object,embed,portal').forEach(node=>node.remove());
  const inlineScripts=[];doc.querySelectorAll('script').forEach(script=>{if(script.hasAttribute('src')||script.hasAttribute('href')||script.hasAttribute('xlink:href'))script.remove();else{const type=(script.getAttribute('type')||'').trim().toLowerCase(),executable=!type||type==='module'||/(?:text|application)\/(?:java|ecma)script/.test(type);if(executable){script.removeAttribute('async');script.removeAttribute('defer');script.remove();inlineScripts.push(script)}}});
  // Generated scripts sometimes arrive in <head> or before their controls. Re-run them
  // after parsing the page body so direct DOM queries and listener binding can succeed.
  doc.body.append(...inlineScripts);
  doc.querySelectorAll('a,area').forEach(link=>{if(!String(link.getAttribute('href')||'').startsWith('#'))link.removeAttribute('href');link.removeAttribute('target');link.removeAttribute('ping');link.removeAttribute('download')});
  doc.querySelectorAll('form').forEach(form=>{form.removeAttribute('action');form.removeAttribute('target')});
  const policy=doc.createElement('meta');policy.httpEquiv='Content-Security-Policy';
  policy.content=`default-src 'none'; script-src 'unsafe-inline'; script-src-attr 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src 'none'; connect-src 'none'; frame-src 'none'; child-src 'none'; worker-src 'none'; object-src 'none'; media-src 'none'; form-action 'none'; base-uri 'none'`;
  const shim=doc.createElement('script');
  shim.textContent=`(()=>{const token=${JSON.stringify(token)};for(const name of ['RTCPeerConnection','webkitRTCPeerConnection','WebSocket','Worker','SharedWorker']){try{Object.defineProperty(window,name,{value:undefined,writable:false,configurable:false})}catch{}}document.addEventListener('submit',event=>event.preventDefault(),true);let queued=false,ready=false;const listenerCounts=new WeakMap(),originalAdd=EventTarget.prototype.addEventListener;EventTarget.prototype.addEventListener=function(type,listener,...options){if(listener){let types=listenerCounts.get(this);if(!types){types=new Set();listenerCounts.set(this,types)}if(/^(click|dblclick|input|change|pointer[a-z]*|touch[a-z]*|mouse[a-z]*|key[a-z]*|drag[a-z]*|drop|submit)$/.test(String(type)))types.add(String(type))}return originalAdd.call(this,type,listener,...options)};const resizeObserver=window.ResizeObserver?new ResizeObserver(resize):null;function post(data){try{parent.postMessage(data,'*')}catch{}}function diagnose(category,detail=''){post({type:'iris-mini-diagnostic',token,category,detail})}function resize(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;const body=document.body,root=document.documentElement;if(!body||!root)return;const height=Math.ceil(Math.max(body.scrollHeight,body.offsetHeight,body.getBoundingClientRect().height,root.scrollHeight,root.offsetHeight,root.getBoundingClientRect().height));post({type:'iris-mini-height',token,height})})}addEventListener('DOMContentLoaded',()=>{ready=true;const body=document.body,root=document.documentElement;if(body){resizeObserver?.observe(body);new MutationObserver(resize).observe(body,{subtree:true,childList:true,attributes:true,characterData:true})}if(root)resizeObserver?.observe(root);resize();post({type:'iris-mini-ready',token});addEventListener('load',()=>setTimeout(()=>{const controls=document.querySelectorAll('button,input,select,textarea,[role="button"],[tabindex]'),delegated=[document,body,root,window].some(target=>target&&listenerCounts.get(target)?.size>0),bound=Array.from(controls).some(control=>listenerCounts.get(control)?.size>0||control.onclick||control.onchange||control.oninput||control.hasAttribute('onclick')||control.hasAttribute('onchange')||control.hasAttribute('oninput'));if(controls.length&&!delegated&&!bound)diagnose('event-binding-missing','no-control-listeners-detected')},0),{once:true})},{once:true});addEventListener('load',resize,{once:true});addEventListener('resize',resize);addEventListener('error',event=>{if(event.target!==window)return;const syntax=event.error?.name==='SyntaxError'||/syntax|unexpected token|unterminated/i.test(String(event.message||''));diagnose(syntax?'javascript-syntax-error':ready?'javascript-runtime-error':'javascript-initialization-error',syntax?'syntax-error':(['TypeError','ReferenceError','RangeError','URIError','EvalError','AggregateError'].includes(event.error?.name)?event.error.name:'script-error')+';line='+String(Number.isFinite(event.lineno)?event.lineno:0)+';column='+String(Number.isFinite(event.colno)?event.colno:0))});addEventListener('unhandledrejection',event=>diagnose(ready?'javascript-runtime-error':'javascript-initialization-error',(['TypeError','ReferenceError','RangeError','URIError','EvalError','AggregateError'].includes(event.reason?.name)?event.reason.name:'unhandled-rejection')));addEventListener('securitypolicyviolation',event=>{if(/^script-src/.test(event.violatedDirective||''))diagnose('csp-script-blocked',(['script-src','script-src-elem','script-src-attr'].includes(event.effectiveDirective)?event.effectiveDirective:'script-src'))});})();`;
  const css=doc.createElement('style');css.textContent='html,body{height:auto!important;min-height:0!important;max-height:none!important;background:transparent!important;pointer-events:auto!important}html{max-width:100%;overflow-x:hidden}body{min-width:0;max-width:100%;margin:0!important;overflow-wrap:anywhere}*,*::before,*::after{box-sizing:border-box}img,svg,canvas,video,table,input,textarea{max-width:100%}body button,body input,body textarea,body select,body summary,body label,body a,body [role="button"],body [tabindex]{pointer-events:auto!important;touch-action:manipulation;-webkit-tap-highlight-color:transparent}';
  const viewport=doc.createElement('meta');viewport.name='viewport';viewport.content='width=device-width,initial-scale=1';
  doc.head.prepend(policy,viewport,shim,css);
  return'<!DOCTYPE html>\n'+doc.documentElement.outerHTML
 }
 function mount(container){
  container?.querySelectorAll('[data-mini-theater-key]').forEach(details=>{
   if(bound.has(details))return;bound.add(details);
   details.addEventListener('toggle',()=>{
    if(!details.open||details.querySelector('iframe'))return;
    const html=documents.get(details.dataset.miniTheaterKey);if(!html)return;
    const token=Array.from(crypto.getRandomValues(new Uint8Array(16)),n=>n.toString(16).padStart(2,'0')).join('');
    const frame=document.createElement('iframe');frame.title='互动小剧场';frame.className='offline-mini-theater-frame';frame.setAttribute('sandbox','allow-scripts');frame.setAttribute('referrerpolicy','no-referrer');frame.setAttribute('credentialless','');
    frame.dataset.miniTheaterKey=details.dataset.miniTheaterKey;recordRuntime(frame,'created');
    frame.addEventListener('error',()=>showDiagnostic(frame,'iframe-load-failed','iframe-error'),{once:true});
    frame.addEventListener('load',()=>{recordRuntime(frame,'iframe-load');setTimeout(()=>{if(frame.isConnected&&!frame.dataset.miniTheaterReady)showDiagnostic(frame,'csp-or-bootstrap-blocked','frame-loaded-without-script-ready')},3000)},{once:true});
    frames.set(token,frame);details.append(frame);
    try{frame.srcdoc=documentFor(html,token)}catch(error){showDiagnostic(frame,'html-parse-failed',error?.name||'document-build-error')}
   });
  });
  for(const [token,frame]of frames)if(!frame.isConnected)frames.delete(token);
  const active=new Set(Array.from(document.querySelectorAll('[data-mini-theater-key]'),node=>node.dataset.miniTheaterKey));
  for(const key of documents.keys())if(!active.has(key)){documents.delete(key);sourceInfo.delete(key)}
 }
 function patchEntry(previous,incoming){
  const live=previous.querySelector(':scope > [data-mini-theater-key]'),next=incoming.querySelector(':scope > [data-mini-theater-key]');
  if(!live||!next||live.dataset.miniTheaterKey!==next.dataset.miniTheaterKey)return false;
  // Keep the connected iframe node in place while surrounding message markup changes.
  for(const attr of Array.from(previous.attributes))previous.removeAttribute(attr.name);
  for(const attr of Array.from(incoming.attributes))previous.setAttribute(attr.name,attr.value);
  for(const child of Array.from(previous.childNodes))if(child!==live)child.remove();
  let after=false;for(const child of Array.from(incoming.childNodes)){if(child===next){after=true;continue}if(after)previous.append(child);else previous.insertBefore(child,live)}
  return true
 }
 function showDiagnostic(frame,category,detail=''){
  recordRuntime(frame,category,detail);
  let status=frame.nextElementSibling;if(!status||!status.classList.contains('offline-mini-theater-status')){status=document.createElement('div');status.className='offline-mini-theater-status';status.setAttribute('role','status');frame.after(status)}
  status.textContent=category==='event-binding-missing'?'尚未检测到交互事件绑定；这是一项诊断提示。':'互动内容暂时无法运行，请继续阅读正文或稍后重试。';status.dataset.diagnostic=category;
  if(debugEnabled())console.warn('[Iris mini theater]',category,String(detail).slice(0,160));
 }
 window.addEventListener('message',event=>{
  const data=event.data;if(!data||typeof data!=='object'||Array.isArray(data)||typeof data.token!=='string')return;
  const frame=frames.get(data.token);if(!frame?.isConnected||event.source!==frame.contentWindow)return;
  if(data.type==='iris-mini-height'&&Object.keys(data).length===3&&typeof data.height==='number'&&Number.isFinite(data.height)){
   frame.style.height=`${Math.max(48,Math.min(6000,Math.ceil(data.height)))}px`;return
  }
  if(data.type==='iris-mini-ready'&&Object.keys(data).length===2){frame.dataset.miniTheaterReady='true';recordRuntime(frame,'dom-ready','not-proof-of-work-script-success');return}
  if(data.type==='iris-mini-diagnostic'&&Object.keys(data).length===4&&['html-parse-failed','javascript-syntax-error','javascript-initialization-error','javascript-runtime-error','csp-script-blocked','event-binding-missing','iframe-load-failed','csp-or-bootstrap-blocked'].includes(data.category)&&typeof data.detail==='string'&&data.detail.length<=160){
   showDiagnostic(frame,data.category,data.detail)
  }
 });
 function enableDiagnostics(){window.__IRIS_DEV__=true;return '小剧场诊断已启用；无需刷新。生成新小剧场可记录实际发送的小剧场提示词。'}
 function diagnosticKeys(){if(!debugEnabled())throw Error('请先调用 IrisMiniTheater.enableDiagnostics()');return Array.from(documents.keys())}
 function exportDiagnostics(key){
  if(!debugEnabled())throw Error('请先调用 IrisMiniTheater.enableDiagnostics()');
  if(!documents.has(key))throw Error('未找到当前聊天中对应的小剧场');
  const originalHtml=documents.get(key),frame=Array.from(frames.values()).find(item=>item.isConnected&&item.dataset.miniTheaterKey===key),doc=new DOMParser().parseFromString(originalHtml,'text/html');
  const scripts=Array.from(doc.querySelectorAll('script'),(script,index)=>({index,type:script.getAttribute('type')||'classic',external:script.hasAttribute('src'),async:script.hasAttribute('async'),defer:script.hasAttribute('defer'),source:script.textContent}));
  const inlineHandlers=Array.from(doc.querySelectorAll('*')).flatMap((node)=>Array.from(node.attributes).filter(attr=>/^on/i.test(attr.name)).map(attr=>({tag:node.tagName,id:node.id||'',event:attr.name,code:attr.value})));
  return {rendererVersion:'mini-diagnostics-3',key,currentBuiltinPromptHash:hash(prompt),...sourceInfo.get(key),originalHtml,finalSrcdoc:frame?.srcdoc||null,sandbox:frame?.getAttribute('sandbox')||null,domReady:frame?.dataset.miniTheaterReady==='true',runtime:runtimeInfo.get(frame)?.events||[],scripts,inlineHandlers,limitations:['DOM ready does not prove work script initialization','No automatic scope repair','Export contains only this theater; inspect its fictional content before sharing']};
 }
 function downloadDiagnostics(key){const report=exportDiagnostics(key),url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='iris-mini-theater-diagnostics.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),0);return '已下载本地诊断文件；未上传任何数据'}
 window.IrisMiniTheater={prompt,upgradePrompt,rule,ruleId,split,filterHistory,markup,mount,patchEntry,documentFor,generationInfo,enableDiagnostics,diagnosticKeys,exportDiagnostics,downloadDiagnostics};
})();
