/* 凝光: a compact, single-level settings navigator and grouped native-style forms. */
(function(root){
'use strict';
const pages=[
 {id:'api/chat',label:'接口',title:'模型接口',description:'连接模型，管理配置与功能分配。',color:'blue',glyph:'<path d="M8 3v5m8-5v5M6 8h12v3a6 6 0 0 1-12 0V8Zm6 9v4"/>'},
 {id:'api/vector',label:'向量',title:'向量记忆',description:'为长期记忆连接向量模型。',color:'purple',glyph:'<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>'},
 {id:'storage/local',label:'备份',title:'本地备份',description:'保存你的资料，或从备份中恢复。',color:'orange',glyph:'<rect x="3" y="4" width="18" height="5" rx="1.5"/><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9m-10 4h6"/>'},
 {id:'storage/github',label:'同步',title:'云端同步',description:'通过 GitHub 私有仓库备份资料。',color:'cyan',glyph:'<path d="M6 17a5 5 0 1 1 1-9.9A6 6 0 0 1 19 9a4 4 0 0 1 0 8M12 21V11m-3 3 3-3 3 3"/>'},
 {id:'background',label:'后台',title:'后台运行',description:'管理离开页面后的运行方式。',color:'indigo',glyph:'<path d="M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z"/>'},
 {id:'version',label:'关于',title:'关于 Iris',description:'版本信息与软件更新。',color:'gray',glyph:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.5" r=".8" fill="currentColor" stroke="none"/>'}
];
const rolePages={
 online:[
  {id:'user',label:'用户',title:'用户与经历',color:'blue',glyph:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>'},
  {id:'world',label:'世界书',title:'世界书',color:'orange',glyph:'<path d="M12 5v16M3 4c4-1 7 0 9 2 2-2 5-3 9-2v15c-4-1-7 0-9 2-2-2-5-3-9-2V4Z"/>'},
  {id:'memory',label:'记忆',title:'记忆与总结',color:'purple',glyph:pages[1].glyph},
  {id:'more',label:'设置',title:'设置',color:'gray',glyph:'<path d="M4 7h16M4 17h16M8 3v8M16 13v8"/>'},
  {id:'bookmarks',label:'收藏',title:'聊天收藏',color:'orange',glyph:'<path d="M6 3h12v19l-6-4-6 4V3Z"/>'}
 ],
 offline:[
  {id:'settings',label:'写作',title:'写作设置',color:'blue',glyph:'<path d="m15 3 6 6-12 12H3v-6L15 3ZM12 6l6 6"/>'},
  {id:'style',label:'文风',title:'文风',color:'purple',glyph:'<path d="M12 3a9 9 0 1 0 0 18h2a2 2 0 0 0 0-4h-1a2 2 0 0 1 0-4h5a3 3 0 0 0 3-3c0-4-4-7-9-7Z"/><path d="M7 9h.01M11 6h.01M16 7h.01M6 14h.01"/>'},
  {id:'prompt',label:'提示词',title:'提示词',color:'orange',glyph:'<path d="M6 3h9l4 4v14H6V3Zm9 0v5h4M9 12h7M9 16h7"/>'},
  {id:'requirements',label:'扩展',title:'写作扩展',color:'indigo',glyph:'<path d="M4 7h16M4 17h16M8 3v8M16 13v8"/>'},
  {id:'regex',label:'正则',title:'正则规则',color:'cyan',glyph:'<path d="m8 5-6 7 6 7m8-14 6 7-6 7M14 3l-4 18"/>'},
  {id:'stage-memory',label:'阶段记忆',title:'阶段记忆',color:'purple',glyph:pages[1].glyph},
  {id:'records',label:'记录',title:'线下记录',color:'orange',glyph:pages[2].glyph}
 ]
};
const onlineChildren={
 world:[{id:'local',label:'局部世界书',color:'orange',glyph:rolePages.online[1].glyph},{id:'global',label:'全局世界书',color:'cyan',glyph:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>'}],
 more:[{id:'messages',label:'聊天显示',color:'blue',glyph:'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 9h10M7 14h6"/>'},{id:'stickers',label:'表情包',color:'orange',glyph:'<circle cx="12" cy="12" r="9"/><path d="M8 14a4 4 0 0 0 8 0M8 8h.01M16 8h.01"/>'},{id:'interaction',label:'角色互动',color:'purple',glyph:'<path d="M21 11a8 8 0 0 1-8 8H7l-5 3V11a9 9 0 0 1 19 0ZM7 10h10M7 14h6"/>'},{id:'time',label:'时间与日历',color:'cyan',glyph:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>'}]
};
const roleActive=context=>context.mode==='offline'?context.offlinePane:context.tab;
function onlineOverview(context){
 const section=root.document.createElement('section');section.className='ng-online-overview';
 if(context.tab==='world'){
  const profile=root.document.createElement('div');profile.className='ng-world-profile';profile.innerHTML=`<div class="ng-profile-frame">${context.avatarHtml||''}</div>`;
  const name=root.document.createElement('strong');name.textContent=context.roleName||'尚未选择角色';profile.querySelector('.ng-profile-frame').append(name);section.append(profile);
 }
 const list=root.document.createElement('div');list.className='ng-online-page-list';
 (onlineChildren[context.tab]||[]).forEach(page=>{
  const button=root.document.createElement('button');button.type='button';button.dataset.onlineSettingsPage=page.id;button.className='ng-online-page-row';
  const label=root.document.createElement('span');label.textContent=page.label;
  const arrow=root.document.createElement('i');arrow.setAttribute('aria-hidden','true');button.append(label,arrow);list.append(button);
 });section.append(list);return section.outerHTML;
}
function enhanceUserProfile(panel,context){
 const select=panel.querySelector('[data-role-user]');if(!select||select.closest('.ng-user-profile'))return;
 const field=select.closest('.setting-field'),section=panel.querySelector('.online-setting-section');if(!section)return;
 section.querySelectorAll('.setting-user-card,.setting-empty-user,.chat-user-binding-notice').forEach(node=>node.remove());
 const profile=root.document.createElement('label');profile.className='ng-user-profile';
 const frame=root.document.createElement('span');frame.className='ng-profile-frame';frame.innerHTML=context.userAvatarHtml||'';
 const name=root.document.createElement('strong');name.textContent=context.userName||'选择用户';
 select.setAttribute('aria-label','切换绑定用户');frame.append(name);profile.append(frame,select);section.prepend(profile);field?.remove();
}
function enhanceExperienceSort(panel){
 const sort=panel.querySelector('.experience-sort');if(!sort||sort.querySelector('.ng-experience-segments'))return;
 const segments=root.document.createElement('div');segments.className='ng-experience-segments';segments.setAttribute('role','group');segments.setAttribute('aria-label','经历排序');
 sort.querySelectorAll('button').forEach(button=>segments.append(button));sort.replaceChildren(segments);
}
function enhanceMountedBooks(panel){
 const section=panel.querySelector('.role-global-worldbooks'),list=section?.querySelector('.role-global-worldbooks-list');if(!list||list.dataset.ngMounted)return;
 list.dataset.ngMounted='true';list.setAttribute('aria-label','已挂载的全局世界书');
 const title=section.querySelector('h3');if(title)title.textContent='已挂载';
 const available=root.document.createElement('details');available.className='ng-available-worldbooks';available.open=true;
 const summary=root.document.createElement('summary');summary.textContent='挂载世界书';
 const choices=root.document.createElement('div');choices.className='ng-available-worldbook-list';
 const rows=Array.from(list.querySelectorAll('.role-global-worldbook-row'));
 rows.forEach(row=>{if(!row.querySelector('input')?.checked)choices.append(row)});
 if(!list.querySelector('input')){const empty=root.document.createElement('p');empty.className='ng-worldbook-empty';empty.textContent='还没有挂载世界书';list.append(empty);available.open=true}
 if(choices.children.length){available.append(summary,choices);section.append(available)}
}
function enhanceBookmarkIdentity(panel,context){
 const filters=panel.querySelector('.chat-bookmark-filters');if(!filters)return;
 const update=()=>{
  filters.querySelectorAll('.ng-bookmark-person').forEach(label=>{
   const select=label.querySelector('select'),kind=select.matches('[data-bookmark-user]')?'user':'role',name=select.selectedOptions[0]?.textContent||'全部';
   label.querySelector('.ng-bookmark-person-name').textContent=name;
   label.querySelector('.ng-bookmark-avatar').innerHTML=context.bookmarkAvatar?.(kind,select.value,name)||'';
  });
 };
 if(!filters.classList.contains('ng-bookmark-pair')){
  filters.classList.add('ng-bookmark-pair');
  const labels=Array.from(filters.querySelectorAll('label'));
  labels.forEach(label=>{
   const select=label.querySelector('select');if(!select)return;
   select.setAttribute('aria-label',select.matches('[data-bookmark-user]')?'选择收藏用户':'选择收藏角色');
   Array.from(label.children).filter(child=>child!==select).forEach(child=>child.remove());
   const picture=root.document.createElement('span');picture.className='ng-bookmark-avatar';const name=root.document.createElement('span');name.className='ng-bookmark-person-name';
   label.classList.add('ng-bookmark-person');label.prepend(picture,name);
  });
  const cross=root.document.createElement('i');cross.className='ng-bookmark-pair-cross';cross.setAttribute('aria-hidden','true');cross.textContent='×';labels[0]?.after(cross);
  filters.addEventListener('change',update);
 }
 update();
}
function enhanceBookmarkList(panel,context){
 if(!root.document.querySelector('#settingsScreen.apple-role-settings:not([hidden])')||!panel?.closest('#settingsContent'))return;
 panel.querySelectorAll('.chat-bookmark-card').forEach(card=>{
  if(card.querySelector('.ng-bookmark-record-avatar'))return;
  const id=card.querySelector('[data-bookmark-remove]')?.dataset.bookmarkRemove,record=context.bookmarkRecord?.(id);if(!record)return;
  const picture=root.document.createElement('span');picture.className='ng-bookmark-record-avatar';picture.innerHTML=record.avatarHtml;
  const meta=card.querySelector('.chat-bookmark-meta');if(meta)meta.prepend(picture);
 });
}
function roleNavigation(context){
 const active=roleActive(context);
 return `<nav class="system-setting-tabs ng-sidebar ng-role-sidebar" aria-label="${context.mode==='online'?'线上':'线下'}设置分类">${rolePages[context.mode].map(page=>`<button type="button" class="system-setting-tab ${active===page.id?'active':''}" data-role-settings-route="${page.id}" aria-current="${active===page.id?'page':'false'}">${glyph(page)}<span>${page.label}</span></button>`).join('')}</nav>`;
}
function enhanceNotifications(panel){
 if(!panel?.closest('#settingsScreen.apple-role-settings'))return;
  panel.querySelectorAll('[data-bg-action="enable"],[data-bg-action="disable"]').forEach(button=>{const on=button.dataset.bgAction==='disable';button.classList.add('ng-notification-switch');button.setAttribute('role','switch');button.setAttribute('aria-checked',String(on));button.setAttribute('aria-label','开启系统通知');button.textContent='';const heading=button.closest('.proactive-background')?.querySelector('.bg-heading');heading?.classList.add('ng-preference-row');heading?.append(button)});
}
function enhanceRolePanel(panel,context){
 if(!root.document.querySelector('#settingsScreen.apple-role-settings:not([hidden])')||!panel?.closest('#settingsContent'))return;
 panel.classList.add('ng-role-panel');panel.dataset.roleSettingsMode=context.mode;
 panel.querySelectorAll(':scope>.ng-role-heading>.ng-heading-action').forEach(button=>panel.append(button));
 panel.querySelector(':scope>.ng-role-heading')?.remove();
 const current=rolePages[context.mode].find(page=>page.id===roleActive(context))||rolePages[context.mode][0];
 const child=context.mode==='online'&&context.subpage?([{id:'followups',label:'记挂的事情'},...(onlineChildren[context.tab]||[])]).find(page=>page.id===context.subpage):null;
 const topbar=root.document.querySelector('#closeSettings');
 if(topbar){
  topbar.textContent=child?.label||(context.mode==='online'?'线上设置':'线下设置');
  topbar.toggleAttribute('data-online-settings-back',Boolean(child));
  topbar.setAttribute('aria-label',child?'返回'+current.title:'返回聊天');
 }
 if(!child){
  const heading=root.document.createElement('header');heading.className='ng-role-heading';
  const title=root.document.createElement('h2');title.textContent=current.title;heading.append(title);
  if(context.roleName){const name=root.document.createElement('span');name.textContent=context.roleName;name.title=context.roleName;heading.append(name)}panel.prepend(heading);
 }
 panel.dataset.ngRoleEnhanced='true';
 if(context.mode==='online'){
  panel.dataset.onlineSubpage=context.subpage||'';
  panel.querySelector('.role-worldbook-tabs')?.remove();
  if(context.tab==='world'&&context.subpage==='global')enhanceMountedBooks(panel);
  if(context.tab==='world'&&context.subpage==='local'){const label=panel.querySelector('.lore-character-card>div>strong');if(label)label.textContent='启用世界书'}
  if(context.tab==='user'){enhanceUserProfile(panel,context);enhanceExperienceSort(panel)}
  if(context.tab==='bookmarks')enhanceBookmarkIdentity(panel,context);
  const life=panel.querySelector('.life-followup-disclosure'),lifeToggle=panel.querySelector('[data-life-enabled]');
  if(life&&lifeToggle){
   if(context.subpage==='followups'){life.open=true;life.querySelector(':scope>summary')?.remove();lifeToggle.closest('label').hidden=true}
   else{const entry=root.document.createElement('button');entry.type='button';entry.className='ng-online-page-row';entry.dataset.onlineSettingsPage='followups';entry.innerHTML='<span>记挂的事情</span><i aria-hidden="true"></i>';entry.hidden=!lifeToggle.checked;life.replaceWith(entry);lifeToggle.addEventListener('change',()=>{entry.hidden=!lifeToggle.checked})}
  }
  const pace=panel.querySelector('.proactive-options>.proactive-frequency'),custom=panel.querySelector('.proactive-custom-time');
  if(pace&&custom){custom.querySelector('span:first-child')?.remove();const choice=pace.querySelector('[data-proactive-pace="custom"]');const inline=root.document.createElement('div');inline.className='ng-custom-pace';if(choice)inline.append(choice);inline.append(custom);pace.append(inline)}
  panel.querySelectorAll('.proactive-field-heading').forEach(heading=>{if(heading.querySelector('span')?.textContent==='可以邀请我')heading.remove()});
  enhanceNotifications(panel);

  panel.querySelectorAll('[data-more-group]').forEach(group=>{const active=group.dataset.moreGroup===context.moreGroup;group.hidden=!active;group.open=active});
 }else{
  const pane=context.offlinePane;panel.dataset.offlinePane=pane;
  const grid=panel.querySelector('.offline-general-grid');
  const extras=panel.querySelector('.offline-extra-settings');
  if(grid?.contains(extras))grid.after(extras);
  grid?.querySelectorAll(':scope>label').forEach(label=>{if(label.querySelector('.ng-offline-label'))return;const name=root.document.createElement('span');name.className='ng-offline-label';Array.from(label.childNodes).filter(node=>node.nodeType===3).forEach(node=>name.append(node));label.prepend(name)});
  panel.querySelector('.offline-prompt-guide')?.remove();

  if(grid)Array.from(grid.children).forEach(node=>{
   const selected=node.matches('.offline-style-fold')?pane==='style':node.matches('.offline-general-prompt')?pane==='prompt':pane==='settings';
   node.hidden=!selected;if(selected&&node.matches('details'))node.open=true;
  });
  if(extras)extras.hidden=!['requirements','regex'].includes(pane);
  panel.querySelector('.offline-extra-tabs')?.remove();
  panel.querySelectorAll('[data-offline-extra-pane]').forEach(node=>node.hidden=node.dataset.offlineExtraPane!==pane);
  const heading=panel.querySelector('.ng-role-heading');
  const add=panel.querySelector(pane==='style'?'[data-offline-style-add]':pane==='requirements'?'[data-offline-extra-add="requirements"]':pane==='regex'?'[data-offline-extra-add="regex"]':pane==='records'?'[data-offline-save-record]':'.ng-no-action');
  if(add&&heading){add.classList.add('ng-heading-action');if(pane==='requirements')add.textContent='添加额外要求';if(pane==='regex')add.textContent='添加正则';if(pane==='style')add.textContent='新增文风';if(pane==='records')add.textContent='保存当前聊天';heading.append(add)}
  panel.querySelectorAll('.offline-style-manager>header,.offline-records-heading').forEach(header=>{if(!header.querySelector('button'))header.remove()});
  const ranges=panel.querySelector('.offline-paragraph-ranges');
  if(ranges&&!ranges.querySelector('.ng-paragraph-caption')){const legend=ranges.querySelector('legend'),caption=root.document.createElement('span');caption.className='ng-paragraph-caption';caption.textContent='全文段落';ranges.setAttribute('aria-label','全文段落数范围');legend?.remove();ranges.prepend(caption)}

 }
 panel.querySelectorAll('.ng-online-page-row,.more-card-heading,.settings-switch-row,.chat-avatar-setting,.memory-settings-fold>summary,.memory-advanced>summary,.offline-general-grid>label,.offline-paragraph-ranges,.offline-style-picker,.offline-prompt-picker,.offline-extra-fold>summary,.offline-regex-rule>summary,.bg-heading').forEach(row=>row.classList.add('ng-preference-row'));
}
function enhanceRole(content,context){
 content.classList.add('ng-role-settings');
 const panel=content.querySelector('#onlineSettingsPanel,[data-offline-settings-body]');if(panel&&!panel.dataset.ngRoleEnhanced)enhanceRolePanel(panel,context);
}
const activeId=context=>context.section==='api'?'api/'+context.apiTab:context.section==='storage'?'storage/'+context.storageTab:context.section;
const glyph=page=>`<span class="ng-symbol" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${page.glyph}</svg></span>`;
function navigation(context){
 const active=activeId(context);
 return `<nav class="system-setting-tabs ng-sidebar" aria-label="全局设置分类">${pages.map(page=>`<button type="button" class="system-setting-tab ${active===page.id?'active':''}" data-settings-route="${page.id}" aria-current="${active===page.id?'page':'false'}">${glyph(page)}<span>${page.label}</span></button>`).join('')}</nav>`;
}
function groupForm(form){
 const labels=Array.from(form.children).filter(node=>node.matches('label'));
 if(!labels.length)return;
 const group=root.document.createElement('div');group.className='ng-field-group';
 labels[0].before(group);labels.forEach(label=>{
  label.classList.add('ng-field');
  const caption=root.document.createElement('span');caption.className='ng-field-name';
  Array.from(label.childNodes).filter(node=>node.nodeType===3).forEach(node=>caption.append(node));
  label.prepend(caption);group.append(label);
 });
}
let activeProfileId=null;
function refreshProfileSummaries(routing){
 routing.querySelector('.ng-profile-carousel')?.dispatchEvent(new root.Event('ng-profiles-change'));
}
function carouselProfiles(routing){
 routing.querySelector('.api-profile-routing-heading small')?.remove();
 const title=routing.querySelector('.api-profile-routing-heading strong');if(title)title.textContent='功能与模型';
 const list=routing.querySelector('.api-config-list');if(!list)return;
 list.classList.add('ng-profile-carousel');list.setAttribute('role','region');list.setAttribute('aria-label','接口配置卡片，左右滑动切换');list.tabIndex=0;
 const cards=()=>Array.from(list.querySelectorAll('.api-profile-card'));
 cards().forEach(card=>{
  card.hidden=false;card.setAttribute('role','group');
  card.setAttribute('aria-label',card.querySelector('.api-profile-summary strong')?.textContent||'接口配置');
  const subtitle=card.querySelector('.api-profile-summary small');if(subtitle){subtitle.textContent=subtitle.textContent.split(' · ').at(-1);subtitle.title=subtitle.textContent}
  card.querySelector('.api-profile-actions')?.remove();
  card.querySelector('.api-profile-uses>small')?.remove();
 });
 const controls=root.document.createElement('div');controls.className='ng-profile-controls';
 const previous=root.document.createElement('button'),next=root.document.createElement('button'),status=root.document.createElement('span');
 previous.type=next.type='button';previous.textContent='‹';next.textContent='›';previous.setAttribute('aria-label','上一个接口');next.setAttribute('aria-label','下一个接口');
 status.setAttribute('aria-live','polite');status.setAttribute('aria-atomic','true');controls.append(previous,status,next);
 routing.querySelector('.api-profile-routing-heading')?.append(controls);
 let index=Math.max(0,cards().findIndex(card=>card.dataset.apiProfileCard===activeProfileId)),frame=0;
 function update(){
  const all=cards();index=Math.max(0,Math.min(index,all.length-1));activeProfileId=all[index]?.dataset.apiProfileCard||null;
  list.dataset.activeProfile=activeProfileId||'';status.textContent=all.length?`${index+1} / ${all.length}`:'0 / 0';
  controls.hidden=all.length<2;previous.disabled=index===0;next.disabled=index>=all.length-1;
  all.forEach((card,i)=>{card.dataset.carouselCurrent=String(i===index);card.setAttribute('aria-roledescription','幻灯片')});
 }
 function go(value,behavior='smooth'){
  const all=cards();index=Math.max(0,Math.min(value,all.length-1));update();const card=all[index];if(!card)return;
  const padding=parseFloat(root.getComputedStyle(list).paddingLeft)||0,left=card.getBoundingClientRect().left-list.getBoundingClientRect().left+list.scrollLeft-padding;
  if(typeof list.scrollTo==='function')list.scrollTo({left,behavior:root.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':behavior});else list.scrollLeft=left;
 }
 previous.onclick=()=>go(index-1);next.onclick=()=>go(index+1);
 list.addEventListener('keydown',event=>{if(event.target!==list||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();go(event.key==='Home'?0:event.key==='End'?cards().length-1:index+(event.key==='ArrowRight'?1:-1))});
 list.addEventListener('scroll',()=>{if(frame)return;frame=root.requestAnimationFrame(()=>{
  frame=0;if(!list.isConnected)return;const all=cards(),edge=list.getBoundingClientRect().left+(parseFloat(root.getComputedStyle(list).paddingLeft)||0);
  let closest=index,distance=Infinity;all.forEach((card,i)=>{const value=Math.abs(card.getBoundingClientRect().left-edge);if(value<distance){closest=i;distance=value}});index=closest;update();
 })},{passive:true});
 list.addEventListener('focusin',event=>{const card=event.target.closest('.api-profile-card');const target=cards().indexOf(card);if(target>=0&&target!==index)go(target)});
 list.addEventListener('ng-profiles-change',()=>{const retained=cards().findIndex(card=>card.dataset.apiProfileCard===activeProfileId);if(retained>=0)index=retained;go(index,'auto')});
 update();root.requestAnimationFrame(()=>{if(list.isConnected)go(index,'auto')});
}
function joinEditor(panel){
 const form=panel.querySelector('form.settings-form');if(!form)return;
 form.classList.add('ng-editor-card');
 const picker=panel.querySelector('.api-profile-editor-switch');if(picker)form.prepend(picker);
 form.querySelectorAll(':scope>.settings-note:not([id]):not([role])').forEach(note=>note.remove());
 const retained=form.querySelector('#apiRetainedModelNote');if(retained)retained.hidden=true;
 const feedback=form.querySelector('#apiFeedback,[data-vector-feedback]');if(feedback)feedback.textContent='';
 const modelList=form.querySelector('#apiCurrentModelList');
 if(modelList){
  const count=modelList.querySelectorAll('.api-current-model-option').length;
  if(count){const details=root.document.createElement('details'),summary=root.document.createElement('summary');details.className='ng-model-disclosure';summary.textContent=`已保留 ${count} 个模型`;modelList.before(details);details.append(summary,modelList)}else modelList.hidden=true;
  modelList.querySelector(':scope>small')?.remove();
 }
 const save=form.querySelector('.api-form-actions .settings-primary');if(save)save.textContent='保存';
}
function simplifyBackup(panel){
 const categories=Array.from(panel.querySelectorAll('.backup-category-group'));
 if(categories.length){const group=root.document.createElement('div');group.className='ng-backup-categories';categories[0].before(group);categories.forEach(category=>group.append(category))}
 const format=panel.querySelector('.backup-format-picker'),exportButton=panel.querySelector('#exportData');
 if(format&&exportButton){const group=root.document.createElement('div');group.className='ng-backup-export';format.before(group);group.append(format,exportButton)}

 panel.querySelectorAll('#backupScopeDescription,#backupScopeCounts').forEach(node=>node.hidden=true);
 panel.querySelectorAll('.backup-section>header>small,.storage-media-info').forEach(node=>node.remove());
 const restore=panel.querySelector('.backup-restore-section');if(restore){restore.querySelector('header')?.remove();restore.querySelector(':scope>p')?.remove()}
 const importButton=panel.querySelector('#importDataButton');if(importButton)importButton.textContent='导入备份文件';
}
function showChoice(dialog,cancel,confirm){
 return new Promise(resolve=>{
  let accepted=false;const previous=root.document.activeElement;
  cancel.onclick=()=>dialog.close();confirm.onclick=()=>{accepted=true;dialog.close()};
  dialog.addEventListener('cancel',event=>{event.preventDefault();dialog.close()});
  dialog.addEventListener('close',()=>{dialog.remove();if(previous?.isConnected)previous.focus({preventScroll:true});resolve(accepted)},{once:true});
  root.document.body.append(dialog);dialog.showModal();cancel.focus();
 });
}
function confirmExport({categories,counts,format}){
 const dialog=root.document.createElement('dialog');dialog.className='ng-confirm-dialog ng-export-dialog';dialog.setAttribute('aria-labelledby','ngExportTitle');
 const heading=root.document.createElement('h2');heading.id='ngExportTitle';heading.textContent='确认导出备份';
 const formatLabel=root.document.createElement('p');formatLabel.className='ng-export-format';formatLabel.textContent=`${format.toUpperCase()} · ${categories.length} 类资料`;
 const body=root.document.createElement('div');body.className='ng-export-body';
 const categoryTitle=root.document.createElement('h3');categoryTitle.textContent='已选内容';
 const list=root.document.createElement('ul');list.className='ng-export-categories';categories.forEach(name=>{const item=root.document.createElement('li');item.textContent=name;list.append(item)});
 const countTitle=root.document.createElement('h3');countTitle.textContent='数据数量';
 const totals=root.document.createElement('dl');totals.className='ng-export-counts';
 const labels={users:'用户',characters:'角色',messages:'消息',photos:'图片',timelineEntries:'经历',ifBranches:'IF 分支',ifDreams:'梦境',ifArchives:'封存故事',growthStages:'成长阶段',npcProfiles:'档案人物',npcReviews:'人物评价',characterAwards:'成就'};
 Object.entries(labels).forEach(([key,label])=>{const row=root.document.createElement('div'),name=root.document.createElement('dt'),value=root.document.createElement('dd');name.textContent=label;value.textContent=String(counts[key]||0);row.append(name,value);totals.append(row)});
 body.append(categoryTitle,list,countTitle,totals);
 const footer=root.document.createElement('footer'),cancel=root.document.createElement('button'),confirm=root.document.createElement('button');cancel.type=confirm.type='button';cancel.textContent='取消';confirm.textContent='导出备份';confirm.dataset.exportConfirm='';footer.append(cancel,confirm);dialog.append(heading,formatLabel,body,footer);
 return showChoice(dialog,cancel,confirm);
}
function enhanceBeautify(content,{appearance}={}){
 const screen=content?.closest('#featureScreen');screen?.classList.toggle('apple-beautify',appearance==='apple');
 if(appearance!=='apple'){content?.querySelector('.ng-beautify-intro')?.remove();return}
 const title=screen?.querySelector('.feature-page-wordmark');if(title)title.textContent='美化';screen?.querySelector('.feature-page-brand>small')?.setAttribute('hidden','');
 const workspace=content.querySelector('.beautify-workspace'),panel=content.querySelector('[data-beautify-panel]');if(!workspace||!panel)return;
 workspace.querySelector('.ng-beautify-intro')?.remove();
 const code=panel.querySelector('.beautify-code-panel');
 if(code&&!code.closest('.ng-beautify-editor')){const fold=root.document.createElement('details');fold.className='ng-beautify-editor';const summary=root.document.createElement('summary');summary.textContent='编辑 CSS';code.before(fold);fold.append(summary,code);panel.querySelector('[data-online-theme-edit]')?.addEventListener('click',()=>{fold.open=true},{capture:true})}
 const tools=panel.querySelector('.beautify-theme-tools');
 if(tools&&!tools.closest('.ng-beautify-tools')){const fold=root.document.createElement('details');fold.className='ng-beautify-tools';const summary=root.document.createElement('summary');summary.textContent='方案操作';tools.before(fold);fold.append(summary,tools)}
}
function enhanceVideoCall(screen,{appearance}={}){
 if(!screen)return;
 const enabled=appearance==='apple';screen.classList.toggle('apple-video-call',enabled);
 for(const [selector,text] of [['.video-call-title',screen.classList.contains('group-video-screen')?'群视频':'视频通话'],['.video-call-camera-off small','摄像头已关闭']]){
  const node=screen.querySelector(selector);if(!node)continue;
  if(enabled){if(!node.dataset.ngOriginalText)node.dataset.ngOriginalText=node.textContent;node.textContent=text}else if(node.dataset.ngOriginalText){node.textContent=node.dataset.ngOriginalText;delete node.dataset.ngOriginalText}
 }
 const chip=root.document.querySelector('#videoCallReturn');if(screen.id==='videoCallScreen'&&chip){chip.classList.toggle('apple-video-return',enabled);const title=chip.querySelector('strong');if(title)title.textContent=enabled?'视频通话':'Video Call'}
}
function enhanceChatSheet(panel,{appearance}={}){
 if(!panel)return;
 const supported=Boolean(panel.querySelector('.transfer-composer,.voice-composer,.location-composer,.image-send-choices,.image-description-form,.call-summary-detail,.offline-redaction-form'));
 const enabled=appearance==='apple'&&supported;
 panel.classList.toggle('apple-chat-sheet',enabled);
 const title=panel.querySelector('.sheet-head h2');
 if(title){if(enabled){if(!panel.dataset.ngChatTitle)panel.dataset.ngChatTitle=title.textContent;title.textContent=({Transfer:'转账',Voice:'语音',Location:'定位',Image:'图片','Call Summary':'通话记录',Redaction:'打码'})[panel.dataset.ngChatTitle]||panel.dataset.ngChatTitle}else if(panel.dataset.ngChatTitle){title.textContent=panel.dataset.ngChatTitle;delete panel.dataset.ngChatTitle}}
 root.document.querySelector('#shade')?.classList.toggle('apple-chat-shade',enabled&&!panel.hidden);
}
let globalObserver=null,globalRefreshPending=false;
const unifiedDialogSelector='.profile-dialog,.author-feedback-dialog,.author-notice-dialog,.release-notice-dialog,.gift-reaction-dialog,.iris-task-dialog,.iris-assistant-role-dialog,.travel-font-dialog,.extras-story-settings,.novel-offers-dialog,.novel-version-dialog,body>dialog.people-dialog,.earth-trip-dialog,.earth-ticket-dialog,.reading-copyright-welcome-card,.reading-identity-panel';
const translatedTitles=new Map();
const titleTranslations={'group chats':'群聊管理','my users':'用户管理','my little world':'用户资料','my characters':'角色管理','my little devil':'角色资料','Characters':'角色管理','Users':'用户管理','Edit Message':'编辑消息','Header Portraits':'顶栏头像','Bank Card':'银行卡','Gift':'礼物详情','Apply Appearance':'应用美化','Investment':'合作出资','Share Novel':'分享小说','Inner Voice':'心声','Together':'一起旅行'};
function refreshGlobalSurfaces(){
 if(!root.document?.body)return;
 const enabled=root.document.body?.dataset.irisAppearance==='apple';
 for(const [node,original] of translatedTitles){if(!node.isConnected){translatedTitles.delete(node);continue}if(!enabled){node.textContent=original;translatedTitles.delete(node)}}
 if(!enabled)return;
 root.document.querySelectorAll(unifiedDialogSelector).forEach(node=>{if(!node.classList.contains('ng-unified-dialog'))node.classList.add('ng-unified-dialog')});
 const sheet=root.document.querySelector('#sheet');if(sheet){if(!sheet.classList.contains('ng-unified-sheet'))sheet.classList.add('ng-unified-sheet');}
 const feature=root.document.querySelector('#featureScreen');
 if(feature){const management=Boolean(feature.querySelector('.group-chat-settings,.group-chat-management,.group-chat-create'));if(feature.classList.contains('ng-group-management')!==management)feature.classList.toggle('ng-group-management',management)}
 root.document.querySelectorAll('.profile-title-row h2,.sheet-head h2,.reflection-editor-topbar>[data-theme-topback]').forEach(node=>{const original=node.textContent.trim(),translated=titleTranslations[original];if(translated&&!translatedTitles.has(node)){translatedTitles.set(node,node.textContent);node.textContent=translated}});
}
function syncGlobalAppearance(appearance){
 const body=root.document.body;if(!body)return;
 const next=appearance==='apple'?'apple':'classic';if(body.dataset.irisAppearance!==next)body.dataset.irisAppearance=next;
 refreshGlobalSurfaces();
 if(!globalObserver&&root.MutationObserver){globalObserver=new root.MutationObserver(()=>{if(globalRefreshPending||body.dataset.irisAppearance!=='apple')return;globalRefreshPending=true;queueMicrotask(()=>{globalRefreshPending=false;refreshGlobalSurfaces()})});globalObserver.observe(body,{childList:true,subtree:true})}
}
function isNingguang(){return root.document.body?.dataset.irisAppearance==='apple'}
function guardNavigation(message,retry){
 if(!isNingguang())return root.confirm(message);
 void confirmAction(message,{title:'未保存的修改',accept:'放弃并离开',destructive:true}).then(approved=>{if(approved)retry()});return false;
}
const extrasFoldState=new Map();
function enhanceExtrasSetup(content,{appearance,kind='phone'}={}){
 const setup=content?.querySelector('.pp-setup');if(!setup)return;
 for(const fold of setup.querySelectorAll('.ng-extras-fold'))extrasFoldState.set(fold.dataset.foldKey,fold.open);
 if(appearance!=='apple'){
  Array.from(setup.querySelectorAll('.ng-extras-fold')).reverse().forEach(fold=>{
   const heading=fold.querySelector(':scope>summary>.pp-section-title'),body=fold.querySelector(':scope>.ng-extras-fold-body');
   fold.replaceWith(...(heading?[heading]:[]),...body.childNodes);
  });return;
 }
 const foldNodes=(nodes,label,key,heading=null,preview=()=>'',open=false)=>{
  if(!nodes.length||nodes[0].closest('.ng-extras-fold'))return;
  const fold=root.document.createElement('details');fold.className='ng-extras-fold';fold.dataset.foldKey=kind+':'+key;fold.open=extrasFoldState.get(fold.dataset.foldKey)??open;
  const summary=root.document.createElement('summary'),name=root.document.createElement('span'),value=root.document.createElement('small');name.textContent=label;
  const body=root.document.createElement('div');body.className='ng-extras-fold-body';
  nodes[0].before(fold);if(heading)summary.append(heading);else summary.append(name);summary.append(value);fold.append(summary,body);nodes.forEach(node=>body.append(node));
  const refresh=()=>{value.textContent=preview(body)||'可选';};refresh();
  fold.addEventListener('toggle',()=>{if(fold.isConnected)extrasFoldState.set(fold.dataset.foldKey,fold.open)});
  body.addEventListener('input',refresh);body.addEventListener('change',refresh);
 };
 for(const [index,section] of Array.from(setup.querySelectorAll(':scope>.pp-section')).entries()){
  if(section.querySelector(':scope>.ng-extras-fold'))continue;
  const heading=section.querySelector(':scope>.pp-section-title'),title=heading?.querySelector('h3')?.textContent;
  if(['出场人物','故事类型','阅读口味'].includes(title)){
   const nodes=Array.from(section.childNodes).filter(node=>node!==heading);
   foldNodes(nodes,title,'section-'+index,heading,body=>{
    if(title==='出场人物'){const count=body.querySelectorAll('.pp-person input:checked').length;return count?count+' 人已选':'选择人物'}
    const choices=Array.from(body.querySelectorAll('.pp-tags button[aria-pressed="true"]'),button=>button.textContent);return choices.join('、')||'未选择';
   });continue;
  }
  const tags=section.querySelector(':scope>.pp-tags');if(tags)foldNodes([tags],'故事偏好','tags',null,body=>Array.from(body.querySelectorAll('[aria-pressed="true"]'),button=>button.textContent).join('、')||'未选择');
  const extra=Array.from(section.children).filter(node=>node.matches('label')&&node.querySelector('[data-pp-field="customInstructions"],[data-pp-field="context"],[data-fs-field="customInstructions"],[data-fs-field="context"]'));
  if(extra.length){
   const nodes=[];for(const field of extra){nodes.push(field);let next=field.nextElementSibling;while(next?.matches('.pp-caption')){nodes.push(next);next=next.nextElementSibling}}
   foldNodes(Array.from(new Set(nodes)),'更多设定','extra-'+index,null,body=>{const custom=body.querySelector('textarea')?.value.trim(),context=body.querySelector('input[type="checkbox"]')?.checked;return [custom?'已填补充设定':'',context?'参考聊天':''].filter(Boolean).join(' · ')||'补充设定与聊天参考'});
  }
 }
}
function enhanceSupplement(content,{appearance,page}={}){
 const screen=content?.closest?.('#featureScreen');
 for(const name of ['extras','business','reading','music'])screen?.classList.toggle('apple-'+name,appearance==='apple'&&page===name);
}
function enhanceExperiences(content,{appearance}={}){
 const screen=content?.closest?.('#featureScreen');screen?.classList.toggle('apple-experiences',appearance==='apple');const title=screen?.querySelector('.feature-page-wordmark');if(title)title.textContent=appearance==='apple'?'经历':'Experiences';
}
function enhanceNovels(content,{appearance,view}={}){
 const screen=content?.closest?.('#featureScreen');screen?.classList.toggle('apple-novels',appearance==='apple');if(appearance!=='apple'||!screen){const title=screen?.querySelector('.feature-page-wordmark');if(title)title.textContent='Novels';return;}
 screen.dataset.novelView=view||'home';const title=screen.querySelector('.feature-page-wordmark');if(title)title.textContent=view==='reader'?'阅读':'小说';
}
function enhanceSms(content,{appearance}={}){
 const screen=content?.closest?.('#featureScreen');screen?.classList.toggle('apple-sms',appearance==='apple');if(appearance!=='apple'||!screen)return;
 const title=screen.querySelector('.feature-page-wordmark'),subtitle=screen.querySelector('.feature-page-brand>small');if(title)title.textContent=content.querySelector('.sms-inbox')?'短信':subtitle?.textContent||'短信';if(subtitle)subtitle.hidden=true;
}
function enhanceMarket(content,{appearance,view='home'}={}){
 const screen=content?.closest?.('#featureScreen');screen?.classList.toggle('apple-market',appearance==='apple');if(appearance!=='apple'||!screen)return;
 const titles={home:'商城',category:'分类',detail:'商品详情',cart:'购物车',orders:'我的订单',order:'订单详情',mine:'我的商城',checkout:'确认订单',favorites:'收藏商品',addresses:'收货地址',wallet:'钱包',shop:'店铺','gift-checkout':'赠送礼物',owned:'个人物品',gifts:'礼物记录',ledger:'钱包明细'};
 const title=screen.querySelector('.feature-page-wordmark');if(title)title.textContent=titles[view]||'商城';screen.querySelector('.feature-page-brand>small')?.setAttribute('hidden','');
 let welcome=content.querySelector('.market-welcome');if(view==='home'&&!welcome){welcome=root.document.createElement('header');welcome.className='market-welcome';const heading=root.document.createElement('h1');heading.textContent='精选好物';welcome.append(heading);content.querySelector('.iris-market')?.prepend(welcome)}if(welcome){welcome.querySelector('small')?.remove();const heading=welcome.querySelector('h1');if(heading)heading.textContent='精选好物'}
 screen.dataset.marketView=view;
}
function enhanceForum(content,{appearance,page='feed',user}={}){
 const screen=content?.closest('#featureScreen');screen?.classList.toggle('apple-forum',appearance==='apple');if(appearance!=='apple'||!screen)return;
 screen.dataset.forumView=page;
 const topbar=screen.querySelector('.feature-page-topbar');
 if(topbar){let chrome=topbar.querySelector('.ng-forum-top-controls');if(!chrome){chrome=root.document.createElement('div');chrome.className='ng-forum-top-controls';chrome.innerHTML='<span class="ng-forum-mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.64 7.584H.47l8.6-9.835L0 1.154h7.594l5.243 6.932 6.064-6.933ZM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644Z"/></svg></span>';const account=root.document.createElement('button');account.type='button';account.className='ng-forum-account';account.setAttribute('aria-label','我的论坛主页');account.onclick=()=>screen.querySelector('.forum-dock [data-forum-page="profile"]')?.click();chrome.append(account);topbar.append(chrome)}chrome.querySelector('.ng-forum-mark').hidden=page!=='feed';const account=chrome.querySelector('.ng-forum-account');account.textContent=(user?.nickname||user?.name||'我').slice(0,1);if(/^(https:\/\/|data:image\/)/.test(user?.avatar||'')){const img=root.document.createElement('img');img.src=user.avatar;img.alt='';account.replaceChildren(img)}}

 content.querySelectorAll('.forum-post:not(.forum-post-full)').forEach(post=>{
  if(post.querySelector(':scope>.ng-tweet-body'))return;
  const avatar=post.querySelector('.forum-post-author>.forum-avatar'),rail=root.document.createElement('div'),body=root.document.createElement('div');rail.className='ng-tweet-avatar';body.className='ng-tweet-body';if(avatar)rail.append(avatar);while(post.firstChild)body.append(post.firstChild);post.append(rail,body);post.classList.add('ng-tweet');
 });
 const tabs=content.querySelector('.forum-main-tabs');
 if(page==='feed'&&tabs&&!content.querySelector('.ng-forum-compose-entry')&&content.querySelector('.forum-compose-fab')){
  const entry=root.document.createElement('div');entry.className='ng-forum-compose-entry';const portrait=root.document.createElement('span');portrait.className='ng-forum-own-avatar';portrait.textContent=(user?.nickname||user?.name||'我').slice(0,1);if(/^(https:\/\/|data:image\/)/.test(user?.avatar||'')){const img=root.document.createElement('img');img.src=user.avatar;img.alt='';portrait.replaceChildren(img)}const button=root.document.createElement('button');button.type='button';button.dataset.forumPage='compose';button.textContent='有什么新鲜事？';const post=root.document.createElement('button');post.type='button';post.dataset.forumPage='compose';post.className='ng-forum-post-entry';post.textContent='发布';entry.append(portrait,button,post);tabs.after(entry);
 }

 const subtitle=screen.querySelector('.forum-page-subtitle'),title=screen.querySelector('.feature-page-wordmark');if(title)title.textContent=page==='feed'?'论坛':subtitle?.textContent||'论坛';if(subtitle)subtitle.hidden=true;
 const paths={like:'<path d="m12 20-7.3-7A4.7 4.7 0 0 1 11.3 6l.7.8.7-.8a4.7 4.7 0 0 1 6.6 7Z"/>',comment:'<path d="M20.5 11a8 8 0 0 1-8 8H8l-5 3V11a8.7 8.7 0 0 1 17.5 0Z"/>',bookmark:'<path d="M6 3h12v18l-6-4-6 4V3Z"/>',view:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',interact:'<path d="m12 3 1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8L12 3Z"/>'};
 content.querySelectorAll('.forum-post-actions>button').forEach(button=>{
  const action=button.dataset.forumAction,kind=button.hasAttribute('data-forum-open-post')?'comment':action;if(!paths[kind]||button.classList.contains('is-loading'))return;
  const count=button.querySelector('span')?.textContent||(['like','comment'].includes(kind)?button.textContent.match(/\d+/)?.[0]||'0':'');
  const labels={like:'点赞',comment:'评论',bookmark:'收藏',view:'查看',interact:'邀请互动'};button.setAttribute('aria-label',labels[kind]);button.title=labels[kind];button.dataset.ngForumIcon=kind;
  const icon=root.document.createElementNS('http://www.w3.org/2000/svg','svg');icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('aria-hidden','true');icon.innerHTML=paths[kind];button.replaceChildren(icon);if(count){const number=root.document.createElement('span');number.textContent=count;button.append(number)}
 });
 screen.querySelectorAll('.forum-dock [data-forum-page]').forEach(button=>{const label=button.querySelector('span')?.textContent;if(label)button.setAttribute('aria-label',label)});
 content.querySelectorAll('.forum-world-form>label,.forum-compose-form>label').forEach(label=>{if(label.querySelector(':scope>.ng-forum-field-name'))return;const text=Array.from(label.childNodes).filter(node=>node.nodeType===3&&node.textContent.trim());if(!text.length)return;const name=root.document.createElement('span');name.className='ng-forum-field-name';text.forEach(node=>name.append(node));label.prepend(name)});
 const nickname=content.querySelector('.forum-profile-nickname');if(nickname&&!nickname.querySelector('.ng-forum-field-name')){const label=root.document.createElement('span');label.className='ng-forum-field-name';label.textContent='网名';nickname.prepend(label)}
 const management=content.querySelector('.forum-profile-settings');if(management&&!management.querySelector('.ng-forum-management-heading')){const title=management.querySelector('h3'),actions=management.querySelector('.forum-world-rail-actions'),heading=root.document.createElement('header');heading.className='ng-forum-management-heading';if(title){title.before(heading);heading.append(title);if(actions)heading.append(actions)}}
 content.querySelectorAll('.forum-member-card').forEach(card=>{if(card.querySelector('.ng-forum-member-head'))return;const head=root.document.createElement('div');head.className='ng-forum-member-head';for(const node of [card.querySelector(':scope>.forum-avatar'),card.querySelector(':scope>.forum-member-details')])if(node)head.append(node);card.prepend(head);const controls=root.document.createElement('footer');controls.className='ng-forum-member-actions';card.querySelectorAll(':scope>button').forEach(button=>controls.append(button));if(controls.children.length)card.append(controls)});
 if(management){management.setAttribute('aria-label','个人主页管理');const heading=management.querySelector('.ng-forum-management-heading'),tabs=management.querySelector('.forum-profile-manager-tabs');if(heading&&tabs){heading.querySelector('h3')?.remove();tabs.hidden=false;heading.prepend(tabs);tabs.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.classList.contains('is-active'))));const actions=heading.querySelector('.forum-world-rail-actions');if(actions)management.append(actions)}}

 const collections=content.querySelector('.forum-profile-collection-tabs');if(collections&&!collections.closest('.ng-forum-collections-toolbar')){const toolbar=root.document.createElement('div');toolbar.className='ng-forum-collections-toolbar';collections.before(toolbar);toolbar.append(collections);const create=collections.querySelector('.forum-profile-new-collection');if(create){create.textContent='新建合集';toolbar.append(create)}}
 const ownHero=content.querySelector('.forum-profile-hero');if(ownHero?.querySelector('[data-forum-page="profile-edit"]')){const avatar=ownHero.querySelector('.forum-avatar');if(avatar){avatar.dataset.forumPage='profile-edit';avatar.setAttribute('aria-label','编辑论坛头像')}}
 const compose=content.querySelector('.forum-compose-fab');if(compose){compose.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 4 6 6-10 10H4v-6L14 4ZM12 6l6 6M4 4h5M6.5 1.5v5"/></svg>';compose.title='发布帖子'}
}
function enhanceWorldBook(content,{appearance,books=[],bookName,detail=false,renderBook,onSelect,onBack,drafts=new Map()}={}){
 const screen=content?.closest('#featureScreen'),page=content?.querySelector('.global-worldbook');
 screen?.classList.toggle('apple-worldbook',appearance==='apple'&&Boolean(page));
 if(appearance!=='apple'||!page)return content;
 if(page.dataset.ngWorldbook)return page.querySelector('.ng-wb-slide.is-active')||content;
 page.dataset.ngWorldbook='true';page.dataset.worldbookLevel=detail?'detail':'library';
 const activeId=page.querySelector('.global-worldbook-book.is-selected [data-global-worldbook-select]')?.dataset.globalWorldbookSelect;
 const heading=(title,className)=>{const row=root.document.createElement('header');row.className=className;const name=root.document.createElement('h2');name.textContent=title;const actions=root.document.createElement('div');row.append(name,actions);return row};
 const libraryHeading=heading('世界书','ng-wb-heading ng-wb-library-heading'),library=page.querySelector('.global-worldbook-library'),toolbar=page.querySelector('.global-worldbook-toolbar');
 for(const selector of ['[data-global-worldbook-import]','[data-global-worldbook-new-book]']){const button=page.querySelector(selector);button?.querySelector('span')?.remove();if(button)libraryHeading.lastChild.append(button)}
 library?.before(libraryHeading);library?.setAttribute('aria-label','全局世界书列表');
 const bookForm=page.querySelector('[data-global-worldbook-book-form]');if(bookForm)libraryHeading.after(bookForm);
 const file=page.querySelector('[data-global-worldbook-file]');if(file)page.append(file);
 const carousel=root.document.createElement('div');carousel.className='ng-wb-carousel';carousel.tabIndex=0;carousel.setAttribute('role','region');carousel.setAttribute('aria-label','世界书卡片，左右滑动切换');
 const prepareCard=(source,book)=>{
  const card=root.document.createElement('article');card.className='ng-wb-slide';card.dataset.worldbookCard=book.id;card.setAttribute('aria-label',book.name||'未命名世界书');
  const selectedHeading=heading(book.name||'当前世界书','ng-wb-selected-heading');
  for(const selector of ['[data-global-worldbook-edit-book]','[data-global-worldbook-delete-book]']){const button=source.querySelector(selector);if(button){button.textContent=selector.includes('delete')?'删除':'编辑';selectedHeading.lastChild.append(button)}}
  const selection=root.document.createElement('section');selection.className='ng-wb-selection';selection.append(selectedHeading);
  const rename=source.querySelector('[data-global-worldbook-rename-form]');if(rename)selection.append(rename);
  const enabled=root.document.createElement('div');enabled.className='ng-wb-enable-row';const enabledLabel=root.document.createElement('span');enabledLabel.textContent='启用世界书';enabled.append(enabledLabel);
  const toggle=Array.from(source.querySelectorAll('[data-global-worldbook-book-enabled]')).find(button=>button.dataset.globalWorldbookBookEnabled===book.id);if(toggle)enabled.append(toggle);selection.append(enabled);
  for(const selector of ['.global-worldbook-scope','.worldbook-audience']){const node=source.querySelector(selector);if(node){node.hidden=book.enabled===false;selection.append(node)}}
  card.append(selection);
  const entryHeading=heading('条目','ng-wb-heading'),add=source.querySelector('[data-global-worldbook-add]');if(add){add.textContent='新增条目';entryHeading.lastChild.append(add)}card.append(entryHeading);
  for(const selector of ['[data-global-worldbook-form]','.global-worldbook-list','[data-global-worldbook-status]']){const node=source.querySelector(selector);if(node)card.append(node)}
  card.querySelectorAll('.global-worldbook-entry-top').forEach(row=>{
   const summary=row.querySelector('summary');if(!summary)return;const title=root.document.createElement('span');title.className='ng-wb-entry-title';while(summary.firstChild)title.append(summary.firstChild);summary.append(title);
   const actions=row.querySelector('.global-worldbook-actions'),toggle=row.querySelector('.global-worldbook-toggle');if(toggle)summary.append(toggle);if(actions)summary.append(actions);
  });
  card.querySelectorAll('.global-worldbook-book-form').forEach(form=>{const actions=root.document.createElement('div');actions.className='ng-wb-form-actions';Array.from(form.children).filter(node=>node.matches('button')).forEach(button=>actions.append(button));form.append(actions)});
  return card;
 };
 const slides=books.map(book=>{let source=page;if(book.id!==activeId){const template=root.document.createElement('template');template.innerHTML=renderBook(book);source=template.content}const card=prepareCard(source,book);carousel.append(card);return card});
 const index=Math.max(0,books.findIndex(book=>book.id===activeId)),active=slides[index];
 library?.querySelectorAll('.global-worldbook-book-toggle').forEach(toggle=>toggle.remove());
 toolbar?.remove();page.querySelector(':scope>.global-worldbook-scope')?.remove();
 page.append(carousel);
 if(bookForm){const actions=root.document.createElement('div');actions.className='ng-wb-form-actions';Array.from(bookForm.children).filter(node=>node.matches('button')).forEach(button=>actions.append(button));bookForm.append(actions)}
 const controls=root.document.createElement('nav');controls.className='ng-wb-carousel-nav';controls.setAttribute('aria-label','切换世界书');
 const previous=root.document.createElement('button'),next=root.document.createElement('button'),status=root.document.createElement('span');previous.type=next.type='button';previous.textContent='上一本';next.textContent='下一本';previous.setAttribute('aria-label','切换到上一本世界书');next.setAttribute('aria-label','切换到下一本世界书');previous.dataset.worldbookPrevious='';next.dataset.worldbookNext='';previous.disabled=index===0;next.disabled=index===slides.length-1;status.textContent=`${index+1} / ${slides.length}`;status.setAttribute('aria-live','polite');controls.append(previous,status,next);carousel.before(controls);
 const importStatus=root.document.createElement('p');importStatus.className='global-worldbook-import-status';importStatus.dataset.worldbookImportStatus='';library.after(importStatus);
 libraryHeading.hidden=library.hidden=Boolean(detail);carousel.hidden=!detail;controls.hidden=!detail||slides.length<2;if(bookForm&&detail)bookForm.hidden=true;
 slides.forEach((slide,i)=>{slide.classList.toggle('is-active',i===index);slide.inert=i!==index;slide.setAttribute('aria-hidden',String(i!==index));slide.setAttribute('aria-roledescription','幻灯片')});
 const formSelectors=['[data-global-worldbook-form]','[data-global-worldbook-rename-form]'];
 const remember=()=>{if(!active)return;drafts.set(activeId,formSelectors.map(selector=>{const form=active.querySelector(selector);return{selector,hidden:form.hidden,index:form.dataset.entryIndex,fields:Array.from(form.elements).filter(field=>field.name).map(field=>[field.name,field.value])}}))};
 for(const draft of drafts.get(activeId)||[]){const form=active?.querySelector(draft.selector);if(!form)continue;form.hidden=draft.hidden;if(draft.index!==undefined)form.dataset.entryIndex=draft.index;for(const [name,value]of draft.fields)if(form.elements.namedItem(name))form.elements.namedItem(name).value=value}
 let timer;
 const align=()=>{if(!carousel.isConnected)return;carousel.scrollLeft=index*(carousel.clientWidth+12)};
 const go=target=>{if(target<0||target>=slides.length||target===index)return;remember();onSelect?.(books[target].id)};
 previous.onclick=()=>go(index-1);next.onclick=()=>go(index+1);
 carousel.addEventListener('keydown',event=>{if(event.target!==carousel||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();go(event.key==='Home'?0:event.key==='End'?slides.length-1:index+(event.key==='ArrowRight'?1:-1))});
 carousel.addEventListener('scroll',()=>{root.clearTimeout(timer);timer=root.setTimeout(()=>{if(!carousel.isConnected||!carousel.clientWidth)return;go(Math.max(0,Math.min(slides.length-1,Math.round(carousel.scrollLeft/(carousel.clientWidth+12)))))},120)},{passive:true});
 if(root.ResizeObserver){const observer=new root.ResizeObserver(()=>{if(!carousel.isConnected){observer.disconnect();return}align()});observer.observe(carousel)}
 root.requestAnimationFrame(align);
 const brand=screen?.querySelector('.feature-page-wordmark');if(brand)brand.textContent=detail?(bookName||'世界书'):'全局世界书';screen?.querySelector('.feature-page-brand>small')?.setAttribute('hidden','');
 const back=screen?.querySelector('#featureBack');if(back&&detail){back.setAttribute('aria-label','返回世界书列表');back.onclick=()=>{remember();onBack?.()}}
 return active||content;
}
function confirmAction(message,{title='确认操作',accept='继续',destructive=false}={}){
 const screen=root.document.querySelector('#settingsScreen');
 if(!isNingguang()&&!(screen?.classList.contains('apple-settings')&&!screen.hidden)&&!root.document.querySelector('#featureScreen.apple-worldbook:not([hidden])'))return Promise.resolve(root.confirm(message));
 const dialog=root.document.createElement('dialog');dialog.className='ng-confirm-dialog';
 dialog.setAttribute('aria-labelledby','ngConfirmTitle');dialog.setAttribute('aria-describedby','ngConfirmMessage');
 const heading=root.document.createElement('h2');heading.id='ngConfirmTitle';heading.textContent=title;
 const copy=root.document.createElement('p');copy.id='ngConfirmMessage';copy.textContent=message;
 const footer=root.document.createElement('footer'),cancel=root.document.createElement('button'),confirm=root.document.createElement('button');
 cancel.type=confirm.type='button';cancel.textContent='取消';cancel.autofocus=true;confirm.textContent=accept;confirm.dataset.confirmAccept='';
 if(destructive)confirm.className='is-destructive';footer.append(cancel,confirm);dialog.append(heading,copy,footer);
 return showChoice(dialog,cancel,confirm);
}
function enhance(content,context){
 const page=pages.find(page=>page.id===activeId(context))||pages[0];
 const panel=content.querySelector(':scope > .api-config-panel,:scope > .settings-page-body');if(!panel)return;
 panel.classList.add('ng-detail');panel.dataset.settingsPage=page.id;
 const heading=root.document.createElement('header');heading.className='ng-page-header';
 heading.innerHTML=`${glyph(page)}<h2>${page.title}</h2>`;
 panel.prepend(heading);
 const tools=panel.querySelector('.api-config-heading');
 if(tools){const add=tools.querySelector('button.api-add-config');if(add){add.textContent='新建配置';add.classList.add('ng-add-config');heading.append(add)}tools.remove()}
 panel.querySelector('.api-editing-label')?.remove();
 panel.querySelectorAll('form.settings-form').forEach(groupForm);
 joinEditor(panel);
 if(page.id==='storage/local')simplifyBackup(panel);
 const routing=panel.querySelector('.api-profile-routing');
 if(routing)carouselProfiles(routing);
 const versionLabels=panel.querySelectorAll('.version-current>small,.version-available>small');versionLabels.forEach(label=>{label.textContent=label.closest('.version-current')?'当前版本':'最新版本'});
 const redundantCaption=panel.querySelector('.version-caption');if(redundantCaption)redundantCaption.remove();
}
root.IrisSettingsAppearance={syncGlobalAppearance,refreshGlobalSurfaces,isNingguang,guardNavigation,navigation,enhance,roleNavigation,enhanceRole,enhanceRolePanel,enhanceNotifications,enhanceBeautify,enhanceExtrasSetup,enhanceVideoCall,enhanceChatSheet,enhanceSupplement,enhanceExperiences,enhanceNovels,enhanceSms,enhanceMarket,enhanceForum,enhanceWorldBook,onlineOverview,enhanceBookmarkList,confirm:confirmAction,confirmExport,refreshProfileSummaries};
})(window);
