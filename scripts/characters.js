const characterDialog = document.getElementById('characterDialog');
let characterDrafts = null;
let characterPage = 0;
let characterPending = 0;
let characterImportNote = '';
const characterPhonePending = new Set();

function openCharacters() {
  characterDrafts = chars.map(c => ({...c}));
  characterPage = Math.max(0,state.char);
  characterImportNote = '';
  drawCharacterList(0);
  characterDialog.showModal();
  characterDialog.focus();
  $('#characters').setAttribute('aria-expanded','true');
}
characterDialog.addEventListener('close', () => {
  characterDrafts = null;
  $('#characters').setAttribute('aria-expanded','false');
  if(!document.getElementById('settingsScreen').hidden) refreshSettings();
});
characterDialog.addEventListener('click', event => {
  if(event.target !== characterDialog) return;
  const box=characterDialog.getBoundingClientRect();
  if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)characterDialog.close();
});
function characterNotice(text) {
  const el=characterDialog.querySelector('.character-feedback');
  if(el)el.textContent=text;
}
async function generateCharacterPhone(character) {
  const config=apiConfigForFeature('onlineChat'),model=apiModelForFeature('onlineChat',config);
  if(!config?.url||!config?.key||!model)throw new Error('请先在设置中连接聊天 API');
  const location=[characterResidence(character),character?.details||character?.desc||''].filter(Boolean).join('\n');
  const base=config.url.replace(/\/+$/,'').replace(/\/chat\/completions$/,'');
  const response=await fetch(`${base}/chat/completions`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${config.key}`},body:JSON.stringify({model,messages:[{role:'system',content:'为虚构角色生成一个符合其所在地的手机运营商和电话号码。根据角色资料判断国家/地区与当地常见运营商，号码格式按当地习惯；号码仅用于虚构聊天档案，不得生成真实人物的号码。只返回 JSON：{"carrier":"运营商名称","number":"含国家区号的电话号码"}。不要输出解释、Markdown 或其他字段。'},{role:'user',content:`角色：${character?.name||'未命名角色'}\n所在地与资料：${location||'资料未写明，请根据角色设定合理判断'}`} ]})});
  if(!response.ok)throw new Error(`API 请求失败（${response.status}）`);
  const result=await response.json();let content=result.choices?.[0]?.message?.content;
  if(Array.isArray(content))content=content.map(part=>part.text||'').join('');
  const raw=String(content||'').trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');let data;
  try{data=JSON.parse(raw)}catch{const start=raw.indexOf('{'),end=raw.lastIndexOf('}');if(start<0||end<=start)throw new Error('API 没有返回有效号码');try{data=JSON.parse(raw.slice(start,end+1))}catch{throw new Error('API 返回的号码格式无法识别')}}
  const carrier=String(data.carrier||'').trim().slice(0,80),number=String(data.number||'').trim().slice(0,40);
  if(!carrier||number.replace(/\D/g,'').length<6)throw new Error('API 返回的运营商或号码不完整');
  return{carrier,number};
}
function deleteCharacterAt(index) {
  const character=characterDrafts[index];
  if(!confirm(`确定删除“${character.name.trim()||'未命名角色'}”吗？该角色的聊天记录也会删除。此操作无法撤销。`))return;
  window.IrisReadingCore?.removeIdentity(state,{roleId:character.irisMarketId});
  characterDrafts.splice(index,1);
  remapSmsThreadsForRoleDeletion(index);
  chars.splice(0,chars.length,...characterDrafts);
  state.characters=chars;
  if(state.char===index)state.char=chars.length?Math.min(index,chars.length-1):-1;
  else if(state.char>index)state.char--;
  const remapped={};
  for(const [messageKey,value] of Object.entries(state.messages||{})){
    const match=messageKey.match(/^(-?\d+)-(-?\d+)-(chat|offline)$/);
    if(!match){remapped[messageKey]=value;continue}
    const roleIndex=Number(match[1]);
    if(roleIndex===index)continue;
    remapped[`${roleIndex>index?roleIndex-1:roleIndex}-${match[2]}-${match[3]}`]=value;
  }
  state.messages=remapped;
  save();render();drawCharacterList();
}
function characterHeader(title) {
  return `<header class="profile-heading"><span class="profile-eyebrow">IRIS / CHAR</span><button type="button" class="profile-close" aria-label="关闭角色面板">×</button></header><div class="profile-title-row"><h2 id="characterTitle">${title}</h2><button type="button" class="character-back" id="characterBack">返回列表</button></div>`;
}
function bindCharacterClose() {characterDialog.querySelector('.profile-close').onclick=()=>characterDialog.close()}
function drawCharacterList(scrollTop=characterDialog.querySelector('.character-list')?.scrollTop||0) {
  characterDialog.innerHTML=characterHeader('my characters')+`
    <div class="character-list${characterDrafts.length?'':' is-empty'}" aria-label="角色列表">${characterDrafts.length?'':`<div class="empty-characters"><span>${icon('user')}</span><strong>还没有角色</strong><small>导入角色卡，或手动新建一个</small></div>`}${characterDrafts.map((c,i)=>`<div class="character-row"><button type="button" class="character-row-main" data-role="${i}">${avatar(c)}<span class="character-row-info"><strong><span class="roster-name">${esc(c.name||'未命名角色')}</span></strong><small>${esc([c.gender,c.birthday].filter(Boolean).join(' · ')||'点击查看角色资料')}</small>${c.phoneNumber?`<small class="roster-phone">${esc([c.phoneCarrier,c.phoneNumber].filter(Boolean).join(' '))}</small>`:''}</span>${state.char===i?'<span class="character-current">当前</span>':icon('arrow')}</button>${c.phoneNumber?'':`<button type="button" class="character-phone-action" data-character-phone="${i}" ${characterPhonePending.has(i)?'disabled':''}>${characterPhonePending.has(i)?'开通中…':'开通号码'}</button>`}<button type="button" class="character-row-delete" data-delete-role="${i}" aria-label="删除${esc(c.name||'未命名角色')}" ${characterPhonePending.size?'disabled':''}>删除</button></div>`).join('')}</div>
    <div class="character-import-actions"><button type="button" id="importCharacter">${icon('plus')}<span>导入角色</span></button><button type="button" id="newCharacter">手动新建</button></div>
    <button type="button" class="character-header-arrange" id="arrangeHeaderAvatars">编辑顶部头像排列</button>
    <input id="characterFile" type="file" accept=".json,.png,.txt,.docx" hidden>
    <p class="character-formats">JSON / PNG / TXT / DOCX</p><p class="character-feedback" role="status">${esc(characterImportNote||'选择角色，确认后切换')}</p>`;
  bindCharacterClose();
  document.querySelector('.character-list').scrollTop=scrollTop;
  document.getElementById('characterBack').hidden=true;
  document.getElementById('arrangeHeaderAvatars').onclick=()=>{characterDialog.close();openHeaderAvatars()};
  characterDialog.querySelectorAll('[data-role]').forEach(button=>button.onclick=()=>drawCharacterEditor(+button.dataset.role));
  characterDialog.querySelectorAll('[data-character-phone]').forEach(button=>button.onclick=async()=>{
    const index=Number(button.dataset.characterPhone),session=characterDrafts;if(!session||characterPhonePending.has(index))return;
    characterPhonePending.add(index);characterImportNote=`正在为${session[index]?.name||'角色'}开通号码…`;drawCharacterList();
    try{
      const phone=await generateCharacterPhone(session[index]);if(characterDrafts!==session)return;
      const savedPhone={phoneCarrier:phone.carrier,phoneNumber:phone.number};Object.assign(session[index],savedPhone);if(chars[index])Object.assign(chars[index],savedPhone);state.characters=chars;characterImportNote=`已为${session[index].name||'角色'}开通号码`;save();
    }catch(error){if(characterDrafts===session)characterImportNote=`号码开通失败：${error.message||'请检查 API 后重试'}`}
    finally{characterPhonePending.delete(index);if(characterDrafts===session)drawCharacterList()}
  });
  characterDialog.querySelectorAll('[data-delete-role]').forEach(button=>button.onclick=()=>deleteCharacterAt(+button.dataset.deleteRole));
  document.getElementById('newCharacter').onclick=()=>{
    characterDrafts.push({name:'',nickname:'',gender:'',birthday:'',details:'',avatar:'',initial:'',color:'#ededed'});
    characterImportNote='';drawCharacterEditor(characterDrafts.length-1);
    characterDialog.querySelector('[name=name]').focus();
  };
  document.getElementById('importCharacter').onclick=()=>document.getElementById('characterFile').click();
  document.getElementById('characterFile').onchange=async event=>{
    const file=event.target.files[0];if(!file)return;
    const session=characterDrafts;const button=document.getElementById('importCharacter');button.disabled=true;characterNotice('正在读取角色资料…');
    characterPending++;
    try{
      const imported=await CharacterImport.parse(file);
      if(characterDrafts!==session)return;
      const sameName=characterDrafts.findIndex(role=>(role.name||'').trim().toLocaleLowerCase()===(imported.character.name||'').trim().toLocaleLowerCase());
      if(imported.character.worldBook?.length&&sameName>=0&&!(characterDrafts[sameName].worldBook?.length)){
        characterDrafts[sameName].worldBook=imported.character.worldBook;
        characterImportNote=imported.note||'世界书条目已同步到已有角色。';drawCharacterEditor(sameName);
      }else{
        characterDrafts.push(imported.character);characterImportNote=imported.note||'资料已识别，可补充或修改后确认。';drawCharacterEditor(characterDrafts.length-1);
      }
    }catch(error){if(characterDrafts===session)characterNotice(error.message||'文件无法读取，请检查格式')}
    finally{characterPending--;button.disabled=false;event.target.value=''}
  };
}
function drawCharacterEditor(index) {
  characterPage=index;const c=characterDrafts[index];
  characterDialog.innerHTML=characterHeader('my little devil')+`
    <form id="characterForm">
      <section class="profile-identity devil-identity">
        <svg class="devil-wings" viewBox="0 0 240 120" aria-hidden="true"><path d="M94 83C72 77 51 44 24 39c9 13 6 22 3 31 10-2 19 4 22 16 13-4 25 0 29 13l16-16ZM146 83c22-6 43-39 70-44-9 13-6 22-3 31-10-2-19 4-22 16-13-4-25 0-29 13l-16-16Z"/><path class="devil-feather" d="M38 53c15 8 27 20 39 30M202 53c-15 8-27 20-39 30"/></svg>
        <svg class="devil-horns" viewBox="0 0 110 55" aria-hidden="true"><path d="M13 39C0 35 3 13 15 5c-3 13 1 19 11 22l-13 12ZM97 39c13-4 10-26-2-34 3 13-1 19-11 22l13 12Z"/></svg>
        <svg class="devil-tail" viewBox="0 0 70 90" aria-hidden="true"><path d="M10 64c33 0 41-9 35-23-4-10-12-9-15-3"/><path class="tail-tip" d="m30 24 15 8-17 12Z"/></svg>
        <svg class="devil-star" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/></svg>
        <div class="portrait-control"><button type="button" class="profile-portrait" id="characterPortrait" aria-label="设置角色头像"></button><span class="portrait-plus" aria-hidden="true">＋</span><input id="characterPortraitFile" type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden></div>
        <div class="profile-preview"><span class="profile-number">char ${String(index+1).padStart(2,'0')}</span><h3 id="characterDisplayName"></h3><p id="characterDisplayNickname"></p><button type="button" id="removeCharacterPortrait" ${c.avatar?'':'hidden'}>移除头像</button></div>
      </section>
      <div class="profile-fields">
        <label class="name-paper">名字 <span>NAME</span><input name="name" maxlength="80" required value="${esc(c.name||'')}" placeholder="角色名字"></label>
        <label class="nickname-paper">网名 <span>NICKNAME</span><input name="nickname" maxlength="80" value="${esc(c.nickname||'')}"></label>
        <label>性别 <span>GENDER</span><input name="gender" maxlength="40" value="${esc(c.gender||'')}" placeholder="填写性别"></label>
        <label>生日 <span>BIRTHDAY</span><input name="birthday" maxlength="40" value="${esc(c.birthday||'')}" placeholder="YYYY-MM-DD / MM-DD"></label>
        <label class="profile-wide details-note">具体信息 <span>ABOUT CHAR</span><textarea name="details" maxlength="100000" rows="3" placeholder="性格、背景和角色设定…">${esc(c.details||c.desc||'')}</textarea></label>
      </div>
      <div class="profile-pagination"><button type="button" id="previousCharacter" ${index===0?'disabled':''}>← 上一页</button><span>${String(index+1).padStart(2,'0')}<i>/</i>${String(characterDrafts.length).padStart(2,'0')}</span><button type="button" id="nextCharacter" ${index===characterDrafts.length-1?'disabled':''}>下一页 →</button></div>
      <button type="submit" class="profile-confirm">确认使用此角色 <span aria-hidden="true">↗</span></button>
      <p class="character-feedback" role="status">${esc(characterImportNote||'确认后保存资料并切换角色')}</p>
    </form>`;
  bindCharacterClose();refreshCharacterPortrait();
  document.getElementById('characterBack').onclick=drawCharacterList;
  document.getElementById('previousCharacter').onclick=()=>{drawCharacterEditor(index-1);document.getElementById('nextCharacter').focus()};
  document.getElementById('nextCharacter').onclick=()=>{drawCharacterEditor(index+1);document.getElementById('previousCharacter').focus()};
  const form=document.getElementById('characterForm');
  bindProfileDetailsAutoGrow(form.querySelector('[name="details"]'));
  form.oninput=event=>{if(['name','nickname','gender','birthday','details'].includes(event.target.name)){c[event.target.name]=event.target.value;if(['name','nickname'].includes(event.target.name))refreshCharacterPortrait()}};
  form.onsubmit=event=>{
    event.preventDefault();if(characterPending){characterNotice('文件处理中，请稍候');return}
    const unnamed=characterDrafts.findIndex(role=>!role.name.trim());
    if(unnamed>=0){drawCharacterEditor(unnamed);characterNotice('请先填写角色名字');characterDialog.querySelector('[name=name]').focus();return}
    for(const role of characterDrafts){role.name=role.name.trim();role.initial=role.initial||role.name.slice(0,1);role.birthday=CharacterImport.normalizeDate(role.birthday)}
    const activeMode=Boolean(state.offline);chars.splice(0,chars.length,...characterDrafts);state.characters=chars;state.char=index;chars[index].offlineMode=activeMode;state.offline=activeMode;const boundUser=chars[index]?.chatSettings?.userIndex;if(Number.isInteger(boundUser)&&state.users[boundUser])state.user=boundUser;save();render();characterDialog.close();
  };
  document.getElementById('characterPortrait').onclick=()=>document.getElementById('characterPortraitFile').click();
  document.getElementById('removeCharacterPortrait').onclick=()=>{c.avatar='';refreshCharacterPortrait()};
  document.getElementById('characterPortraitFile').onchange=async event=>{
    const file=event.target.files[0];if(!file)return;
    if(!/^image\/(png|jpeg|webp|gif)$/.test(file.type)||file.size>12*1024*1024){characterNotice('请选择小于 12 MB 的头像图片');return}
    const session=characterDrafts;characterPending++;
    try{const data=await CharacterImport.portrait(file);if(characterDrafts===session){c.avatar=data;if(characterPage===index&&document.getElementById('characterPortrait'))refreshCharacterPortrait()}}
    catch{if(characterDrafts===session)characterNotice('头像无法读取，请换一张图片')}
    finally{characterPending--}
  };
}
function refreshCharacterPortrait() {
  const c=characterDrafts[characterPage];
  document.getElementById('characterDisplayName').textContent=c.name.trim()||'角色名字';
  document.getElementById('characterDisplayNickname').textContent=c.nickname?`@ ${c.nickname}`:'点击头像，设置角色的模样';
  document.getElementById('characterPortrait').innerHTML=c.avatar?`<img src="${esc(c.avatar)}" alt="角色头像">`:icon('user');
  document.getElementById('removeCharacterPortrait').hidden=!c.avatar;
}
