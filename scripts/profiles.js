let profileDrafts = null;
let profilePage = 0;
let pendingPortraits = 0;
let userPhoneSetupIndex = null;
const userPhoneCarriers=['中国移动','中国联通','中国电信','中国广电','自定义运营商'];
const profileDialog = document.getElementById('profileDialog');

function randomUserPhone(carrier){
  const prefixes={
    '中国移动':['134','135','136','137','138','139','147','150','151','152','157','158','159','178','182','183','184','187','188','195','197','198'],
    '中国联通':['130','131','132','145','155','156','166','175','176','185','186','196'],
    '中国电信':['133','149','153','173','177','180','181','189','190','199'],
    '中国广电':['192']
  };
  const pool=prefixes[carrier]||prefixes['中国移动'],prefix=pool[Math.floor(Math.random()*pool.length)];
  let suffix='';for(let digit=0;digit<8;digit++)suffix+=Math.floor(Math.random()*10);
  return `${prefix} ${suffix.slice(0,4)} ${suffix.slice(4)}`;
}
function phoneCarrierOptions(selected=''){
  return userPhoneCarriers.map(carrier=>`<option value="${esc(carrier)}" ${carrier===selected?'selected':''}>${esc(carrier)}</option>`).join('');
}

function openProfiles() {
  profileDrafts = state.users.map(user => ({ ...user }));
  profilePage = state.user;
  userPhoneSetupIndex = null;
  drawProfileList();
  profileDialog.showModal();
  profileDialog.focus();
}

function closeProfiles() {
  profileDialog.close();
}
profileDialog.addEventListener('close', () => { profileDrafts = null; if(!document.getElementById('settingsScreen').hidden) refreshSettings(); });
profileDialog.addEventListener('click', event => {
  if (event.target !== profileDialog) return;
  const bounds = profileDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeProfiles();
});

function drawEmptyProfiles() {
  profileDialog.innerHTML = `<header class="profile-heading"><span class="profile-eyebrow">IRIS / USER</span><button type="button" class="profile-close" aria-label="关闭用户面板">×</button></header><section class="empty-profiles"><div class="empty-profile-mark">${icon('user')}</div><h2>还没有用户</h2><p>创建一张个人档案，再开始聊天。</p><button type="button" class="profile-confirm" id="createFirstUser">创建用户 <span aria-hidden="true">＋</span></button></section>`;
  profileDialog.querySelector('.profile-close').onclick=closeProfiles;
  document.getElementById('createFirstUser').onclick=()=>{profileDrafts.push({name:'',nickname:'',gender:'',birthday:'',details:'',avatar:''});profilePage=0;drawProfile();profileDialog.querySelector('[name="name"]').focus()};
}

function drawProfileList() {
  const users = profileDrafts || [];
  const rosterScrollTop=profileDialog.querySelector('.profile-user-list')?.scrollTop||0;
  const rows = users.map((profile,index) => {const savedCarrier=profile.phoneCarrier||'',selectedCarrier=userPhoneCarriers.includes(savedCarrier)?savedCarrier:(savedCarrier?'自定义运营商':'中国移动');return `<article class="profile-user-row"><button type="button" class="profile-user-select" data-user-select="${index}" aria-label="切换到${esc(profile.name.trim()||'未命名用户')}"><span class="profile-user-avatar" style="background:${esc(profile.color||'#ededed')}">${profile.avatar?`<img src="${esc(profile.avatar)}" alt="">`:esc((profile.nickname||profile.name||'').slice(0,1))}</span><span class="profile-user-info"><strong><span class="roster-name">${esc(profile.name.trim()||'未命名用户')}</span></strong><small>${esc(profile.nickname||'个人档案')}</small>${profile.phoneNumber?`<small class="roster-phone">${esc([profile.phoneCarrier,profile.phoneNumber].filter(Boolean).join(' ') )}</small>`:''}</span><small class="profile-user-current">${index===state.user?'当前使用':''}</small></button><button type="button" class="profile-user-edit" data-user-edit="${index}">编辑</button>${profile.phoneNumber?'':`<button type="button" class="profile-phone-action" data-user-phone="${index}">开通号码</button>`}<button type="button" class="profile-roster-delete" data-user-delete="${index}" aria-label="删除${esc(profile.name.trim()||'未命名用户')}">删除</button>${userPhoneSetupIndex===index?`<form class="profile-phone-editor" data-user-phone-form="${index}"><label>运营商<select name="carrier">${phoneCarrierOptions(selectedCarrier)}</select></label><input name="customCarrier" ${selectedCarrier==='自定义运营商'?'':'hidden'} value="${esc(selectedCarrier==='自定义运营商'?savedCarrier:'')}" placeholder="填写运营商名称" aria-label="自定义运营商"><div class="profile-phone-editor-number"><label>自定义号码<input name="number" type="tel" maxlength="40" value="${esc(profile.phoneNumber||'')}" placeholder="可直接输入自己的号码"></label><button type="submit">保存号码</button></div><div class="profile-phone-editor-actions"><button type="button" data-user-phone-random="${index}">随机生成</button><button type="button" data-user-phone-cancel="${index}">取消</button></div></form>`:''}</article>`}).join('');
  profileDialog.innerHTML = '<header class="profile-heading"><span class="profile-eyebrow">IRIS / USERS</span><button type="button" class="profile-close" aria-label="关闭用户列表">×</button></header><div class="profile-title-row"><h2 id="profileTitle">my users</h2><button type="button" id="addProfile">＋ 新用户</button></div>' + (users.length ? '<section class="profile-roster profile-user-list" aria-label="用户列表">' + rows + '</section>' : '<section class="empty-profiles"><div class="empty-profile-mark">' + icon('user') + '</div><h2>还没有用户</h2><p>创建一张个人档案，再开始聊天。</p></section>');
  profileDialog.querySelector('.profile-user-list')?.scrollTo(0,rosterScrollTop);
  profileDialog.querySelector('.profile-close').onclick = closeProfiles;
  profileDialog.querySelector('#addProfile').onclick = () => {
    profileDrafts.push({name:'',nickname:'',gender:'',birthday:'',details:'',avatar:''});
    profilePage = profileDrafts.length - 1;
    drawProfile();
    profileDialog.querySelector('[name="name"]').focus();
  };
  profileDialog.querySelectorAll('[data-user-select]').forEach(button => button.onclick = (approved=false) => {
    if(approved!==true&&activeFeaturePage==='experiences'&&window.IrisExperiences?.requestLeave?.(()=>button.onclick(true))===false)return;
    const index = Number(button.dataset.userSelect);
    if (!profileDrafts[index].name.trim()) { profilePage = index; drawProfile(); profileDialog.querySelector('[name="name"]').focus(); return; }
    state.users = profileDrafts.map(profile => ({...profile,name:profile.name.trim(),nickname:profile.nickname.trim()}));
    state.user = index;
    save();
    render();
    closeProfiles();
  });
  profileDialog.querySelectorAll('[data-user-edit]').forEach(button => button.onclick = () => { profilePage = Number(button.dataset.userEdit); drawProfile(); });
  profileDialog.querySelectorAll('[data-user-delete]').forEach(button => button.onclick = () => deleteProfileAt(Number(button.dataset.userDelete)));
  profileDialog.querySelectorAll('[data-user-phone]').forEach(button=>button.onclick=()=>{const index=Number(button.dataset.userPhone);userPhoneSetupIndex=userPhoneSetupIndex===index?null:index;drawProfileList()});
  profileDialog.querySelectorAll('[data-user-phone-cancel]').forEach(button=>button.onclick=()=>{userPhoneSetupIndex=null;drawProfileList()});
  profileDialog.querySelectorAll('[data-user-phone-form]').forEach(form=>{
    form.elements.carrier.onchange=()=>{form.elements.customCarrier.hidden=form.elements.carrier.value!=='自定义运营商'};
    form.onsubmit=event=>{
    event.preventDefault();const index=Number(form.dataset.userPhoneForm),profile=profileDrafts[index],data=new FormData(form),selected=String(data.get('carrier')||''),carrier=selected==='自定义运营商'?String(data.get('customCarrier')||'').trim():selected,number=String(data.get('number')||'').trim();
    if(!carrier){toast('请填写运营商名称');form.elements.customCarrier.focus();return}if(number.replace(/\D/g,'').length<6){toast('请填写至少 6 位号码');form.elements.number.focus();return}
    profile.phoneCarrier=carrier;profile.phoneNumber=number;state.users=profileDrafts.map(item=>({...item,name:item.name.trim(),nickname:item.nickname.trim()}));save();userPhoneSetupIndex=null;drawProfileList();
    }
  });
  profileDialog.querySelectorAll('[data-user-phone-random]').forEach(button=>button.onclick=()=>{
    const index=Number(button.dataset.userPhoneRandom),form=profileDialog.querySelector(`[data-user-phone-form="${index}"]`);if(!form)return;const selected=form.elements.carrier.value,carrier=selected==='自定义运营商'?form.elements.customCarrier.value.trim():selected;
    if(!carrier){toast('请先填写运营商名称');form.elements.customCarrier.focus();return}const profile=profileDrafts[index];profile.phoneCarrier=carrier;profile.phoneNumber=randomUserPhone(userPhoneCarriers.includes(carrier)?carrier:'中国移动');state.users=profileDrafts.map(item=>({...item,name:item.name.trim(),nickname:item.nickname.trim()}));save();drawProfileList();
  });
}

function deleteProfileAt(index) {
  const user = profileDrafts[index];
  if (!confirm(`确定删除“${user.name.trim() || '未命名用户'}”吗？此操作无法撤销。`)) return;
  if(index<state.users.length)removeLocalIdentity('user',index);
  profileDrafts.splice(index,1);
  profilePage = state.users.length ? Math.min(profilePage, state.users.length - 1) : 0;
  save();
  render();
  drawProfileList();
}

function drawProfile() {
  if (!profileDrafts.length) { drawEmptyProfiles(); return; }
  const user = profileDrafts[profilePage];
  const number = String(profilePage + 1).padStart(2, '0');
  profileDialog.innerHTML = `
    <header class="profile-heading">
      <span class="profile-eyebrow">IRIS / USER</span>
      <button type="button" class="profile-close" aria-label="关闭用户面板">×</button>
    </header>
    <div class="profile-title-row"><h2 id="profileTitle"><span class="sr-only">用户档案</span><span aria-hidden="true">my little world</span></h2><button type="button" id="profileBackToList">返回列表</button></div>
    <section class="profile-roster" aria-label="用户列表">${profileDrafts.map((profile,i)=>`<div class="profile-roster-row"><button type="button" class="profile-roster-entry${i===profilePage?' active':''}" data-user-edit="${i}"><span>${esc(profile.name.trim()||'未命名用户')}</span><small>${i===profilePage?'正在编辑':'用户 '+String(i+1).padStart(2,'0')}</small></button><button type="button" class="profile-roster-delete" data-user-delete="${i}" aria-label="删除${esc(profile.name.trim()||'未命名用户')}">删除</button></div>`).join('')}</section>
    <form id="profileForm">
      <section class="profile-identity">
        <svg class="angel-wings" viewBox="0 0 240 130" aria-hidden="true" focusable="false">
          <g class="angel-wing">
            <path d="M98 91c-5-12-21-19-38-33C45 45 31 30 23 37c-9 8-4 23 4 34-9-5-12 7-6 18 3 6 9 11 15 14-7 1-5 10 3 13 16 7 43 0 55-12 5-5 6-9 4-13Z" fill="#fafafa" stroke="#d4d4d4" stroke-width="5" stroke-linejoin="round"/>
            <path d="M98 91c-5-12-21-19-38-33C45 45 31 30 23 37c-9 8-4 23 4 34-9-5-12 7-6 18 3 6 9 11 15 14-7 1-5 10 3 13 16 7 43 0 55-12 5-5 6-9 4-13Z" fill="none" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/>
            <path d="M27 71q6 9 15 14M36 103q10 4 21 2" fill="none" stroke="#d9d9d9" stroke-width="1.2" stroke-linecap="round"/>
            <path d="m37 51 1.8 4 4.3.3-3.3 2.9 1.1 4.3-3.9-2.3-3.9 2.3 1.1-4.3-3.3-2.9 4.3-.3Z" fill="#c4c4c4"/>
            <path d="m60 86 1.4 3.2 3.4.2-2.6 2.3.9 3.4-3.1-1.8-3.1 1.8.9-3.4-2.6-2.3 3.4-.2Z" fill="#dedede"/>
            <path d="m78 83 1 2.2 2.4.2-1.8 1.6.6 2.4-2.2-1.3-2.2 1.3.6-2.4-1.8-1.6 2.4-.2Z" fill="#bebebe"/>
            <circle cx="38" cy="90" r=".8" fill="#ccc"/><circle cx="50" cy="72" r=".8" fill="#ccc"/>
          </g>
          <g transform="translate(240 0) scale(-1 1)" class="angel-wing">
            <path d="M98 91c-5-12-21-19-38-33C45 45 31 30 23 37c-9 8-4 23 4 34-9-5-12 7-6 18 3 6 9 11 15 14-7 1-5 10 3 13 16 7 43 0 55-12 5-5 6-9 4-13Z" fill="#fafafa" stroke="#d4d4d4" stroke-width="5" stroke-linejoin="round"/>
            <path d="M98 91c-5-12-21-19-38-33C45 45 31 30 23 37c-9 8-4 23 4 34-9-5-12 7-6 18 3 6 9 11 15 14-7 1-5 10 3 13 16 7 43 0 55-12 5-5 6-9 4-13Z" fill="none" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/>
            <path d="M27 71q6 9 15 14M36 103q10 4 21 2" fill="none" stroke="#d9d9d9" stroke-width="1.2" stroke-linecap="round"/>
            <path d="m37 51 1.8 4 4.3.3-3.3 2.9 1.1 4.3-3.9-2.3-3.9 2.3 1.1-4.3-3.3-2.9 4.3-.3Z" fill="#c4c4c4"/>
            <path d="m60 86 1.4 3.2 3.4.2-2.6 2.3.9 3.4-3.1-1.8-3.1 1.8.9-3.4-2.6-2.3 3.4-.2Z" fill="#dedede"/>
            <path d="m78 83 1 2.2 2.4.2-1.8 1.6.6 2.4-2.2-1.3-2.2 1.3.6-2.4-1.8-1.6 2.4-.2Z" fill="#bebebe"/>
            <circle cx="38" cy="90" r=".8" fill="#ccc"/><circle cx="50" cy="72" r=".8" fill="#ccc"/>
          </g>
        </svg>
        <span class="angel-halo" aria-hidden="true"></span>
        <svg class="star-sticker" viewBox="0 0 60 60" aria-hidden="true"><path d="m30 7 6 16 18 1-14 12 4 18-14-10-16 10 5-18L5 24l18-1Z"/></svg>
        <span class="music-sticker" aria-hidden="true">${icon('music')}</span>
        <svg class="little-star" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/></svg>
        <div class="portrait-control">
          <button type="button" class="profile-portrait" id="changePortrait" aria-label="上传用户头像"></button>
          <span class="portrait-plus" aria-hidden="true">＋</span>
          <input type="file" id="portraitFile" accept="image/png,image/jpeg,image/webp,image/gif" hidden>
        </div>
        <div class="profile-preview"><span class="profile-number">user ${number}</span><h3 id="profileDisplayName"></h3><p id="profileDisplayNickname"></p><small id="profileBoundRoleCount"></small><button type="button" id="removePortrait" ${user.avatar ? '' : 'hidden'}>移除头像</button></div>
      </section>
      <div class="profile-fields">
        <label class="name-paper">名字 <span>NAME</span><input name="name" maxlength="40" required autocomplete="off" placeholder="你的名字" value="${esc(user.name)}"></label>
        <label class="nickname-paper">网名 <span>NICKNAME</span><input name="nickname" maxlength="40" autocomplete="off" placeholder="怎么称呼你" value="${esc(user.nickname)}"></label>
        <div class="profile-demographics"><label>性别 <span>GENDER</span><select name="gender"><option value="" ${user.gender?'':'selected'}>请选择</option><option value="Male" ${user.gender==='Male'?'selected':''}>Male</option><option value="Female" ${user.gender==='Female'?'selected':''}>Female</option></select></label><label>生日 <span>BIRTHDAY</span><input name="birthday" maxlength="40" value="${esc(user.birthday||'')}" placeholder="YYYY-MM-DD / MM-DD"></label></div>
        <label class="profile-wide details-note">具体信息 <span>ABOUT YOU</span><span class="note-decoration" aria-hidden="true">${icon('music')}</span><textarea name="details" maxlength="2000" rows="3" placeholder="性格、喜好，或想被记住的小事…">${esc(user.details)}</textarea></label>
      </div>
      <div class="profile-pagination"><button type="button" id="previousProfile" ${profilePage === 0 ? 'disabled' : ''}><span aria-hidden="true">←</span> 上一页</button><span aria-live="polite">${number}<i>/</i>${String(profileDrafts.length).padStart(2, '0')}</span><button type="button" id="nextProfile" ${profilePage === profileDrafts.length - 1 ? 'disabled' : ''}>下一页 <span aria-hidden="true">→</span></button></div>
      <div class="profile-save-actions"><button type="button" class="profile-confirm profile-save-only" id="saveProfileOnly">保存资料</button><button type="submit" class="profile-confirm">确认使用此身份 <span aria-hidden="true">↗</span></button></div>
      <p class="profile-footnote" id="profileFeedback" role="status">保存资料后无需切换用户</p>
    </form>`;
  profileDialog.querySelector('.profile-roster')?.remove();
  updateProfilePreview();
  profileDialog.querySelector('.profile-close').onclick = closeProfiles;
  document.getElementById('profileBackToList').onclick = drawProfileList;
  document.getElementById('previousProfile').onclick = () => { profilePage--; drawProfile(); document.getElementById('nextProfile').focus(); };
  document.getElementById('nextProfile').onclick = () => { profilePage++; drawProfile(); document.getElementById('previousProfile').focus(); };
  const form = document.getElementById('profileForm');
  bindProfileDetailsAutoGrow(form.querySelector('[name="details"]'));
  form.addEventListener('input', event => {
    if (!['name','nickname','gender','birthday','details'].includes(event.target.name)) return;
    user[event.target.name] = event.target.value;
    if (event.target.name === 'name' || event.target.name === 'nickname') updateProfilePreview();
  });
  form.addEventListener('change', event => {if(event.target.name==='gender')user.gender=event.target.value});
  document.getElementById('saveProfileOnly').onclick=()=>{
    if(pendingPortraits){profileNotice('头像处理中，请稍候');return}
    if(!user.name.trim()){profileNotice('请先填写名字');form.elements.name.focus();return}
    state.users[profilePage]={...user,name:user.name.trim(),nickname:user.nickname.trim()};
    save();render();profileNotice('资料已保存');
  };
  form.onsubmit = event => {
    event.preventDefault();
    if (pendingPortraits) { profileNotice('头像处理中，请稍候'); return; }
    const missingName = profileDrafts.findIndex(profile => !profile.name.trim());
    if (missingName !== -1) {
      profilePage = missingName;
      drawProfile();
      const field = profileDialog.querySelector('[name="name"]');
      field.setCustomValidity('请填写名字');
      field.reportValidity();
      field.oninput = () => field.setCustomValidity('');
      return;
    }
    state.users = profileDrafts.map(profile => ({...profile,name:profile.name.trim(),nickname:profile.nickname.trim()}));
    state.user = profilePage;
    save();
    render();
    closeProfiles();
  };
  document.getElementById('changePortrait').onclick = () => document.getElementById('portraitFile').click();
  document.getElementById('removePortrait').onclick = () => { user.avatar = ''; updateProfilePreview(); };
  document.getElementById('portraitFile').onchange = event => uploadPortrait(event.target.files[0], user, profileDrafts);
}

function updateProfilePreview() {
  const user = profileDrafts[profilePage];
  document.getElementById('profileDisplayName').textContent = user.name.trim() || '你的名字';
  document.getElementById('profileDisplayNickname').textContent = user.nickname.trim() ? `@ ${user.nickname.trim()}` : '点击头像，设置你的模样';
  const boundRoles = (state.characters || []).filter(character => character.chatSettings && character.chatSettings.userIndex === profilePage).length;
  document.getElementById('profileBoundRoleCount').textContent = `绑定角色 · ${boundRoles} 个`;
  document.getElementById('changePortrait').innerHTML = user.avatar ? `<img src="${esc(user.avatar)}" alt="用户头像">` : icon('user');
  document.getElementById('removePortrait').hidden = !user.avatar;
}

function profileNotice(message) {
  const feedback = document.getElementById('profileFeedback');
  if (feedback) feedback.textContent = message;
}

async function uploadPortrait(file, user, session) {
  if (!file) return;
  if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type)) { profileNotice('请选择 PNG、JPG、WebP 或 GIF 图片'); return; }
  if (file.size > 12 * 1024 * 1024) { profileNotice('请选择小于 12 MB 的图片'); return; }
  pendingPortraits++;
  const objectUrl = URL.createObjectURL(file);
  try {
    const photo = new Image();
    await new Promise((resolve, reject) => { photo.onload = resolve; photo.onerror = reject; photo.src = objectUrl; });
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const edge = Math.min(photo.naturalWidth, photo.naturalHeight);
    canvas.getContext('2d').drawImage(photo, (photo.naturalWidth-edge)/2, (photo.naturalHeight-edge)/2, edge, edge, 0, 0, 256, 256);
    if (profileDrafts !== session) return;
    user.avatar = canvas.toDataURL('image/jpeg', .85);
    if (profileDrafts[profilePage] === user) updateProfilePreview();
  } catch { profileNotice('这张图片无法读取，请换一张'); }
  finally { URL.revokeObjectURL(objectUrl); pendingPortraits--; }
}
