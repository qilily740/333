(() => {
 'use strict';
 let session=null;
 const basic={
  api:[['#settings','点击这里，打开全局设置。'],['[data-system-tab="api"]','选择 API 配置。'],['[data-api-connection="chat"]','选择聊天 API 分类。'],['#addApiConfig','点击新建配置；已有配置也可以在结束引导后选择编辑。'],['#apiName','给配置起一个容易认出的名字。填写后点下一步。','field'],['#apiUrl','填入服务商提供的 API 地址。','field'],['#apiKey','在这个密码框填写 API Key，不要发到聊天里。','field'],['#apiModel','填写服务商支持的完整模型名，也可使用拉取模型。','field'],['#apiForm button[type="submit"]','核对填写内容后，由你点击保存配置。','save']],
  'create-character':[['#characters','打开角色列表。'],['#newCharacter','点击手动新建。'],['#characterForm [name="name"]','填写角色名字。','field'],['#characterForm [name="details"]','补充角色的性格、背景与说话方式。','field'],['#saveCharacterOnly','点击保存资料。这一步只保存，不切换你原来的聊天。','save']],
  'create-user':[['[data-nav="3"]','打开用户面具列表。'],['#addProfile','点击新用户。'],['#profileForm [name="name"]','填写你想使用的身份名字。','field'],['#profileForm [name="details"]','补充这个身份的资料。','field'],['#saveProfileOnly','点击保存资料。创建后可以再把它绑定到角色。','save']]
 };
 function stop(){if(!session)return;session.observer.disconnect();document.removeEventListener('click',session.click,true);document.removeEventListener('change',session.change,true);window.removeEventListener('resize',session.position);window.removeEventListener('scroll',session.position,true);session.target?.classList.remove('assistant-guide-highlight');session.panel.remove();session.spot.remove();session=null}
 function start(id,ctx){
  stop();const route=ctx.routes.find(item=>item.id===id);if(!route)return;
  const steps=basic[id]?.map(step=>[...step]);
  if(steps)ctx.home();else ctx.open(id,id==='role-user');
  const destination=route.destination||{},role=id==='role-worldbook'||id==='experiences'||destination.roleTab||Number.isInteger(destination.category);
  const generic=[];
  if(!steps){if(role)generic.push(['.iris-assistant-role-dialog [data-assistant-role]','先点击要设置的角色。']);generic.push([destination.target||(destination.roleTab==='user'?'[data-role-user]':destination.roleTab?'#onlineSettingsPanel':destination.page||['worldbook','experiences','music','reading','forum','market','business','sms','beautify'].includes(id)?'#featurePageContent':'#settingsContent'),'这里就是对应页面。你可以直接操作，也可以结束引导后继续询问用法。','field'])}
  if(id==='role-user'){generic.splice(0,generic.length,
   ['.iris-assistant-role-dialog [data-assistant-role]','先选要绑定用户的角色。'],
   ['#chatTitle','点击聊天顶部的角色名字，进入这个角色的聊天设置。'],
   ['[data-online-tab="user"]','进入 User 分类，管理这个角色使用的用户身份。'],
   ['[data-role-user]','展开用户列表，选择要与这个角色聊天的身份。选中后自动保存。','change']);
  }
  const panel=document.createElement('section');panel.className='assistant-guide-panel';panel.setAttribute('role','region');panel.setAttribute('aria-label','功能操作引导');
  const spot=document.createElement('div');spot.className='iris-guide-spotlight assistant-guide-spotlight';spot.setAttribute('aria-hidden','true');
  const token=session={steps:steps||generic,index:0,target:null,panel,spot,observer:null,click:null,position:null};
  token.position=()=>{if(session!==token||!token.target)return;const rect=token.target.getBoundingClientRect();Object.assign(spot.style,{left:`${Math.max(0,rect.left-5)}px`,top:`${Math.max(0,rect.top-5)}px`,width:`${rect.width+10}px`,height:`${rect.height+10}px`});const height=window.visualViewport?.height||window.innerHeight;panel.style.top=rect.top<height/2?'auto':'max(70px, env(safe-area-inset-top))';panel.style.bottom=rect.top<height/2?'max(24px, env(safe-area-inset-bottom))':'auto'};
  function draw(){
   if(session!==token)return;const step=token.steps[token.index];if(!step){stop();ctx.done();return}
   const target=document.querySelector(step[0]);token.target?.classList.remove('assistant-guide-highlight');token.target=target;
   const parent=target?.closest('dialog[open]')||[...document.querySelectorAll('dialog[open]')].at(-1)||document.body;if(spot.parentElement!==parent)parent.append(spot);if(panel.parentElement!==parent)parent.append(panel);
   const missing=!target||target.closest('[hidden]');spot.hidden=!!missing;
   panel.innerHTML=`<small>操作引导 · ${token.index+1} / ${token.steps.length}</small><p>${ctx.esc(missing?'当前步骤暂未出现。请先完成页面中的选择，或结束引导重新开始。':step[1])}</p><div><button type="button" data-guide-stop>结束引导</button>${step[2]==='field'?'<button type="button" data-guide-next>下一步</button>':''}</div>`;
   panel.querySelector('[data-guide-stop]').onclick=stop;panel.querySelector('[data-guide-next]')?.addEventListener('click',()=>{token.index++;draw()});
   if(target&&!missing){target.classList.add('assistant-guide-highlight');target.scrollIntoView?.({block:'center',behavior:'smooth'});token.position()}
  }
  token.click=event=>{if(session!==token||!token.target||panel.contains(event.target))return;const step=token.steps[token.index];if(step[2]==='field'||step[2]==='change'||!token.target.contains(event.target))return;
   if(step[2]==='save'){panel.querySelector('p').textContent='请查看页面的保存结果；如果提示缺少内容，请补全后重新保存。确认成功后可以结束引导。';return}
   token.index++;queueMicrotask(draw);
  };
  token.change=event=>{if(session!==token||token.steps[token.index]?.[2]!=='change'||event.target!==token.target||!event.target.value)return;queueMicrotask(()=>{if(session!==token)return;stop();ctx.done()})};document.addEventListener('change',token.change,true);
  token.observer=new MutationObserver(records=>{if(session!==token)return;if(records.every(record=>panel.contains(record.target)))return;const step=token.steps[token.index];const next=document.querySelector(step?.[0]||'body');if(next!==token.target)queueMicrotask(draw)});
  token.observer.observe(document.body,{childList:true,subtree:true});document.addEventListener('click',token.click,true);window.addEventListener('resize',token.position);window.addEventListener('scroll',token.position,true);draw();
 }
 window.IrisAssistantGuide={start,stop};
})();
