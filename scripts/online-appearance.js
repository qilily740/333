(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.IrisOnlineAppearance=api})(typeof globalThis==='object'?globalThis:null,function(){
 'use strict';
 const schemes=(state,builtins)=>[...builtins,...(state.settings?.onlineBeautifyLibrary?.items||[])];
 function resolve(state,builtins,{role,group}={}){const settings=state.settings||{},library=settings.onlineBeautifyLibrary||{},groupSettings=group?.settings||{},bound=group?groupSettings.onlineAppearanceId:role?.chatSettings?.onlineAppearanceId,all=schemes(state,builtins);let css,background,name,id=typeof bound==='string'?bound:'inherit';
  if(group&&typeof bound!=='string'&&groupSettings.followOnline===false){id=groupSettings.theme||'default';const item=all.find(s=>s.id===id);css=item?.css||'';background=groupSettings.background||'';name=item?.name||'默认'}
  else if(id==='inherit'){const item=all.find(s=>s.id===library.active);css=String(settings.beautifyCss?.online||'');background=String(settings.beautifyBackgrounds?.online||'');name=item&&item.css===css?item.name:css?'自定义默认方案':'默认'}
  else{const item=all.find(s=>s.id===id);css=item?.css||'';background=Object.hasOwn(item||{},'background')?item.background:String(settings.beautifyBackgrounds?.online||'');name=item?.name||'默认';if(!item)id='default'}
  if(group){css+='\n'+String(groupSettings.css||'');background=groupSettings.background||background}
  return{id,name,css,background,inherited:bound==null||bound==='inherit'};
 }
 function assign(state,builtins,{roles=[],groups=[],schemeId}){if(schemeId!=='inherit'&&!schemes(state,builtins).some(item=>item.id===schemeId))throw Error('美化方案不存在');const indices=[...new Set(roles)],ids=[...new Set(groups)];if(indices.some(i=>!Number.isInteger(i)||!state.characters?.[i])||ids.some(id=>!state.groupChats?.items?.some(g=>g.id===id)))throw Error('角色或群聊已变化，请重新选择');for(const i of indices){state.characters[i].chatSettings||={};state.characters[i].chatSettings.onlineAppearanceId=schemeId}for(const id of ids){const group=state.groupChats.items.find(g=>g.id===id);group.settings||={};group.settings.onlineAppearanceId=schemeId;group.updatedAt=Date.now()}return indices.length+ids.length}
 return{schemes,resolve,assign};
});
