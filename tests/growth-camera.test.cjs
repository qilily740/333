const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
let JSDOM;try{({JSDOM}=require('jsdom'))}catch{}
const uiTest=(name,fn)=>test(name,{skip:!JSDOM},fn);
const flush=async()=>{for(let i=0;i<5;i++)await new Promise(resolve=>setImmediate(resolve))};
function fixture(){
 const dom=new JSDOM('<header><div id="title"><small class="experiences-page-subtitle"></small></div></header><main></main>',{runScripts:'outside-only',url:'http://localhost/'}),w=dom.window;
 for(const file of ['timeline-core','growth-core','growth','experiences'])w.eval(fs.readFileSync(require.resolve('../scripts/'+file+'.js'),'utf8'));
 const state={char:0,characters:[{name:'A',details:'Childhood: enjoys drawing. Childhood: quiet.'},{name:'B',details:'Other profile.'}],users:[],messages:{}};
 const saved=[];let fail=false;
 const options={state,content:w.document.querySelector('main'),title:w.document.querySelector('#title'),esc:value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),isActive:()=>true,confirm:()=>true,persist:async data=>{if(fail)throw Error('storage full');saved.push(JSON.parse(JSON.stringify(data)))},switchRole:index=>{state.char=index;w.IrisExperiences.sync()},analyze:async()=>({stages:[]})};
 // Existing cases mock the initial generation; refinement defaults to no change.
 let primaryAnalyze=options.analyze;
 Object.defineProperty(options,'analyze',{get:()=>((prompt,role,request)=>request?.refinement?(options.refine?.(prompt,role,request)||Promise.resolve({stages:[]})):primaryAnalyze(prompt,role,request)),set:value=>primaryAnalyze=value});
 w.IrisExperiences.render(options);w.document.querySelector('#experience-tab-1').click();
 const find=selector=>w.document.querySelector(selector),click=selector=>find(selector).click();
 const submit=async()=>{find('.growth-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await flush()};
 return{dom,w,state,saved,options,find,click,submit,fail:()=>fail=true};
}
uiTest('four empty frames can be scrubbed without saving; editing a frame retains the other templates and role isolation',async()=>{
 const f=fixture();try{
  assert.equal(f.find('[data-growth-ruler]').getAttribute('aria-valuemax'),'3');assert.equal(f.saved.length,0);assert.equal(f.state.characters[0].growthArchive,undefined);assert.ok(f.find('.growth-default-avatar'));assert.equal(f.find('.growth-thread'),null);
  const ruler=f.find('[data-growth-ruler]');ruler.dispatchEvent(new f.w.KeyboardEvent('keydown',{key:'End',bubbles:true}));assert.equal(ruler.getAttribute('aria-valuenow'),'3');
  ruler.onpointerdown({pointerId:1,clientX:100,button:0});ruler.onpointermove({pointerId:1,clientX:180});ruler.onpointerup({pointerId:1,clientX:180,type:'pointerup'});assert.equal(ruler.getAttribute('aria-valuenow'),'2');
  const name=f.find('[data-growth-frame-title]').textContent;f.click('[data-growth-flash]');assert.equal(f.find('[data-growth-flash]').getAttribute('aria-pressed'),'true');assert.ok(f.find('.growth-camera.is-flash-preview'));f.click('[data-growth-grid]');assert.ok(f.find('.growth-camera.has-grid'));f.click('[data-growth-shutter]');assert.ok(f.find('.growth-camera.is-shutter-flashing'));await new Promise(resolve=>setTimeout(resolve,220));assert.equal(f.find('[name="name"]').value,name);assert.ok(f.find('.growth-detail-avatar svg'));assert.ok(f.find('[data-growth-stage-generate]'));
  f.find('[name="interests"]').value='drawing';f.find('[name="startAge"]').value='20';await f.submit();
  const archive=f.state.characters[0].growthArchive;assert.equal(archive.stages.length,4);assert.equal(archive.stages.filter(stage=>stage.isTemplate).length,3);assert.equal(archive.stages.find(stage=>stage.name===name).interests,'drawing');assert.equal(f.state.characters[1].growthArchive,undefined);assert.equal(f.find('[name="name"]').value,name);assert.equal(f.find('[data-growth-ruler]'),null);f.w.IrisGrowthPage.back();assert.equal(f.find('[data-growth-ruler]').getAttribute('aria-valuenow'),'2');assert.equal(f.find('[data-growth-frame-title]').textContent,name);
  f.w.IrisExperiences.render(f.options);assert.equal(f.find('[data-growth-ruler]').getAttribute('aria-valuemax'),'3');assert.equal(f.state.characters[0].growthArchive.stages.length,4);
 }finally{f.dom.window.close()}
});
uiTest('stage API suggestions require field selection and explicit save, preserving handwritten content',async()=>{
 const f=fixture();try{
  f.click('[data-growth-open]');const form=f.find('.growth-form');form.elements.personality.value='My own description';let request='',requests=0;
  f.options.analyze=async prompt=>{requests++;request=prompt;return{stages:[{name:form.elements.name.value,personality:'Quiet',interests:'Drawing',certainty:'explicit',sources:[{field:'personality',name:'\u89d2\u8272\u4eba\u8bbe',quote:'Childhood: quiet.'},{field:'interests',name:'\u89d2\u8272\u4eba\u8bbe',quote:'Childhood: enjoys drawing.'}]}]}};
  f.click('[data-growth-api]');assert.equal(request,'');assert.equal(f.find('[data-growth-api]').disabled,false);assert.equal(f.find('.growth-stage-ai').hidden,false);assert.equal(f.find('[data-growth-stage-generate]').parentElement,f.find('.growth-stage-sources'));f.click('[data-growth-stage-generate]');assert.equal(f.find('[data-growth-api]').disabled,true);await flush();assert.equal(f.find('[data-growth-api]').disabled,false);assert.equal(f.find('.growth-stage-ai').open,true);assert.ok(request.includes(form.elements.name.value));assert.equal(f.saved.length,0);assert.equal(form.elements.interests.value,'');assert.equal(f.find('[data-growth-apply-field="personality"]').checked,false);assert.equal(f.find('[data-growth-apply-field="interests"]').checked,true);
  assert.equal(requests,1);f.click('[data-growth-stage-generate]');assert.equal(f.find('[data-growth-apply]'),null);await flush();assert.equal(requests,2);assert.ok(f.find('[data-growth-apply]'));
  f.click('[data-growth-apply]');assert.equal(form.elements.personality.value,'My own description');assert.equal(form.elements.interests.value,'Drawing');assert.equal(f.saved.length,0);await f.submit();
  const stage=f.state.characters[0].growthArchive.stages.find(stage=>!stage.isTemplate);assert.equal(stage.interests,'Drawing');assert.equal(stage.personality,'My own description');assert.equal(stage.provenance.length,1);assert.equal(stage.status,'confirmed');
 }finally{f.dom.window.close()}
});
uiTest('late stage API response cannot fill another character form',async()=>{
 const f=fixture();try{
  f.click('[data-growth-open]');let resolve;f.options.analyze=()=>new Promise(done=>resolve=done);const pending=f.find('[data-growth-stage-generate]').onclick();
  const picker=f.find('[data-timeline-role]');picker.value=f.state.characters[1].experienceCharacterId;picker.dispatchEvent(new f.w.Event('change'));f.click('[data-growth-open]');
  resolve({stages:[{name:'Childhood',interests:'Drawing',certainty:'explicit',sources:[{field:'interests',name:'\u89d2\u8272\u4eba\u8bbe',quote:'Childhood: enjoys drawing.'}]}]});await pending;
  assert.equal(f.find('[name="interests"]').value,'');assert.equal(f.find('[data-growth-apply]'),null);assert.equal(f.saved.length,0);assert.equal(f.state.characters[0].growthArchive,undefined);assert.equal(f.state.characters[1].growthArchive,undefined);
 }finally{f.dom.window.close()}
});
uiTest('failed first save keeps the default frame draft and does not initialize stored templates',async()=>{
 const f=fixture();try{f.click('[data-growth-open]');f.find('[name="interests"]').value='Unsaved draft';f.fail();await f.submit();assert.equal(f.state.characters[0].growthArchive,undefined);assert.equal(f.find('[name="interests"]').value,'Unsaved draft');assert.match(f.find('[data-growth-feedback]').textContent,/storage full/)}finally{f.dom.window.close()}
});
uiTest('removing a stage photo restores the generic avatar and saves only to that stage',async()=>{
 const f=fixture();try{
  f.click('[data-growth-open]');await f.submit();const stage=f.state.characters[0].growthArchive.stages[0];stage.photo='data:image/jpeg;base64,AA==';f.w.IrisExperiences.render(f.options);assert.ok(f.find('[data-growth-frame-image] img'));f.click('[data-growth-open]');f.click('[data-growth-photo-remove]');assert.ok(f.find('.growth-detail-avatar svg'));await f.submit();assert.equal(f.state.characters[0].growthArchive.stages[0].photo,'');assert.ok(f.find('.growth-detail-avatar svg'));f.w.IrisGrowthPage.back();assert.ok(f.find('[data-growth-frame-image] .growth-default-avatar'));
 }finally{f.dom.window.close()}
});
uiTest('newer empty templates never replace an edited stage during backup merge',async()=>{
 const f=fixture();try{
  f.click('[data-growth-open]');f.find('[name="interests"]').value='Retain this content';await f.submit();
  const B=require('../scripts/backup-core.js'),current=JSON.parse(JSON.stringify(f.state)),incoming=JSON.parse(JSON.stringify(f.state));
  const real=current.characters[0].growthArchive.stages[0],empty=incoming.characters[0].growthArchive.stages[0];empty.interests='';empty.isTemplate=true;empty.updatedAt=real.updatedAt+1000;
  assert.equal(B.merge(current,incoming).characters[0].growthArchive.stages[0].interests,'Retain this content');
  assert.equal(B.merge(incoming,current).characters[0].growthArchive.stages[0].interests,'Retain this content');
 }finally{f.dom.window.close()}
});
uiTest('detail returns through the header brand and the camera has no extra toolbar or focus square',()=>{
 const f=fixture();try{
  assert.equal(f.find('.growth-tools'),null);assert.equal(f.find('.growth-focus-mark'),null);
  const brand=f.w.document.createElement('button');brand.id='featureBack';brand.textContent='Experiences';f.find('#title').prepend(brand);let exits=0;brand.onclick=()=>{if(!f.w.IrisExperiences.back())exits++};
  f.click('[data-growth-open]');assert.equal(f.find('[data-growth-back]'),null);assert.ok(f.find('.growth-form'));f.find('[name="interests"]').value='Unsaved';f.find('.growth-form').dispatchEvent(new f.w.Event('input',{bubbles:true}));
  f.options.confirm=()=>false;brand.click();assert.ok(f.find('.growth-form'));assert.equal(exits,0);
  f.options.confirm=()=>true;brand.click();assert.ok(f.find('.growth-camera'));assert.equal(f.find('.growth-form'),null);assert.equal(exits,0);brand.click();assert.equal(exits,1);
 }finally{f.dom.window.close()}
});
uiTest('fixed detail actions navigate safely and save inline stable traits with a newly created stage',async()=>{
 const f=fixture();try{
  f.click('[data-growth-open]');assert.ok(f.find('.growth-stage-header .growth-photo-edit'));assert.ok(f.find('.growth-stage-meta [name="startAge"]'));assert.equal(f.find('.growth-detail-actions').parentElement,f.find('#experience-growth-panel'));assert.equal(f.find('[data-growth-previous]').disabled,true);
  const first=f.find('[name="name"]').value;f.click('[data-growth-following]');assert.notEqual(f.find('[name="name"]').value,first);f.click('[data-growth-previous]');assert.equal(f.find('[name="name"]').value,first);
  f.find('[name="stableTraits"]').value='A steady core';f.find('.growth-form').dispatchEvent(new f.w.Event('input',{bubbles:true}));f.options.confirm=()=>false;f.click('[data-growth-following]');assert.equal(f.find('[name="name"]').value,first);assert.equal(f.find('[name="stableTraits"]').value,'A steady core');
  f.click('[data-growth-save]');await flush();assert.equal(f.state.characters[0].growthArchive.stableTraits,'A steady core');assert.equal(f.state.characters[1].growthArchive,undefined);
  assert.equal(f.find('[name="stableTraits"]').value,'A steady core');f.options.confirm=()=>true;f.click('[data-growth-new]');assert.equal(f.find('[name="name"]').value,'');assert.equal(f.find('[data-growth-delete]').disabled,true);assert.equal(f.state.characters[0].growthArchive.stages.length,4);
  f.find('[name="name"]').value='A new stage';f.find('[name="interests"]').value='New interest';f.click('[data-growth-save]');await flush();assert.equal(f.state.characters[0].growthArchive.stages.length,5);assert.equal(f.state.characters[0].growthArchive.stableTraits,'A steady core');assert.equal(f.state.characters[0].growthArchive.stages.find(stage=>stage.name==='A new stage').interests,'New interest');
 }finally{f.dom.window.close()}
});
uiTest('inline stable traits and stage edits roll back together on storage failure',async()=>{
 const f=fixture();try{
  f.click('[data-growth-open]');f.find('[name="stableTraits"]').value='Original core';f.click('[data-growth-save]');await flush();f.find('[name="stableTraits"]').value='Unsaved core';f.find('[name="interests"]').value='Unsaved stage content';f.fail();f.click('[data-growth-save]');await flush();
  assert.equal(f.state.characters[0].growthArchive.stableTraits,'Original core');assert.equal(f.state.characters[0].growthArchive.stages[0].interests,'');assert.equal(f.find('[name="stableTraits"]').value,'Unsaved core');assert.equal(f.find('[name="interests"]').value,'Unsaved stage content');assert.equal(f.find('[data-growth-save]').disabled,false);
 }finally{f.dom.window.close()}
});
uiTest('structured design output maps into editable fields with inference labels and review questions',()=>{
 const f=fixture();try{
  const materials=[{name:'角色人设',text:'Childhood: quiet. Childhood: enjoys drawing.'}];
  const response={coreIdentity:{stableTraits:[{trait:'安静而关注细节',basis:'资料写明安静',status:'inferred',confidence:'medium'}],sources:[{field:'stableTraits',name:'角色人设',quote:'Childhood: quiet.'}]},stages:[{stageId:'untrusted-model-id',label:'童年',ageStart:8,personalityExpression:[{trait:'安静',expression:'可能先观察同伴，再用简短的话表达自己的需求。',basis:'从 quiet 推演表达倾向，尚未确认实际行为。',status:'inferred',confidence:'medium'}],appearance:[{detail:'眼睛是蓝色',status:'explicit'}],interestsAndHabits:[{description:'喜欢画画',basis:'明确提到绘画',status:'explicit',confidence:'high'}],sources:[{field:'personality',name:'角色人设',quote:'Childhood: quiet.'},{field:'interests',name:'角色人设',quote:'Childhood: enjoys drawing.'}]}],consistencyReview:{possibleContradictions:['阶段年龄尚未明确'],questionsForUser:['是否更习惯独自画画？']}};
  const drafts=f.w.IrisGrowth.drafts(response,materials),draft=drafts[0];assert.equal(drafts.length,1);assert.equal(draft.name,'童年');assert.match(draft.personality,/安静/);assert.doesNotMatch(draft.personality,/【/);assert.equal(draft.interests,'喜欢画画');assert.match(draft.stableTraits,/安静而关注细节/);assert.equal(draft.appearance,'眼睛是蓝色');assert.equal(draft.fieldReview.find(entry=>entry.field==='appearance').status,'needs_confirmation');assert.equal(draft.startAge,null);assert.equal(draft.certainty,'inferred');assert.match(draft.uncertainty,/是否更习惯独自画画/);assert.match(draft.uncertainty,/从 quiet 推演/);assert.equal(f.state.characters[0].growthArchive,undefined);
  const empty=f.w.IrisGrowth.drafts({stages:[],consistencyReview:{questionsForUser:['请补充年龄']}},materials);assert.equal(empty.length,0);assert.equal(empty.review.questionsForUser[0],'请补充年龄');
 }finally{f.dom.window.close()}
});
uiTest('structured stage suggestions appear in the existing API review and require adoption',async()=>{
 const f=fixture();try{
  f.click('[data-growth-open]');f.options.analyze=async prompt=>{assert.match(prompt,/coreIdentity/);assert.match(prompt,/consistencyReview/);assert.match(prompt,/成长与 OOC 控制/);return{coreIdentity:{},stages:[{label:'童年',personalityExpression:[{expression:'倾向先观察再开口，需要确认。',status:'inferred',basis:'资料称其安静'}],sources:[{field:'personality',name:'角色人设',quote:'Childhood: quiet.'}]}],consistencyReview:{questionsForUser:['是否很少主动求助？']}}};
  f.click('[data-growth-api]');f.click('[data-growth-stage-generate]');await flush();assert.match(f.find('.growth-stage-review').textContent,/是否很少主动求助/);assert.equal(f.find('[name="personality"]').value,'');f.click('[data-growth-apply]');assert.match(f.find('[name="personality"]').value,/倾向先观察再开口/);assert.doesNotMatch(f.find('[name="personality"]').value,/【/);assert.equal(f.saved.length,0);
 }finally{f.dom.window.close()}
});
uiTest('adopting AI fields automatically links only their verified confirmed timeline sources',async()=>{
 const f=fixture();try{
  const role=f.state.characters[0],timeline=f.w.IrisTimeline;role.lifeTimeline=timeline.upsert(timeline.read(role),{title:'学习绘画',description:'小时候跟随老师学习绘画。',type:'学习',status:'confirmed'});role.lifeTimeline=timeline.upsert(role.lifeTimeline,{title:'搬迁',description:'搬到新城市。',type:'搬迁',status:'confirmed'});role.lifeTimeline=timeline.upsert(role.lifeTimeline,{title:'旅行草稿',description:'未确认。',type:'旅行',status:'pending'});
  const painting=role.lifeTimeline.entries.find(entry=>entry.title==='学习绘画'),move=role.lifeTimeline.entries.find(entry=>entry.title==='搬迁');f.click('[data-growth-open]');
  f.options.analyze=async()=>({stages:[{name:'童年',personality:'可能先观察新环境。',interests:'喜欢画画。',certainty:'inferred',timelineIds:['forged-id',move.id],sources:[{field:'personality',name:'已确认经历 · 搬迁',quote:'搬到新城市。'},{field:'interests',name:'已确认经历 · 学习绘画',quote:'小时候跟随老师学习绘画。'}]}]});
  f.click('[data-growth-api]');f.click('[data-growth-stage-generate]');await flush();assert.equal(f.find(`[name=timelineIds][value="${painting.id}"]`).checked,false);
  f.find('[data-growth-apply-field="personality"]').checked=false;f.click('[data-growth-apply]');assert.equal(f.find(`[name=timelineIds][value="${painting.id}"]`).checked,true);assert.equal(f.find(`[name=timelineIds][value="${move.id}"]`).checked,false);assert.equal(f.find('.growth-links').open,false);assert.match(f.find('[data-growth-link-summary]').textContent,/1/);assert.equal(f.saved.length,0);
  await f.submit();const stage=role.growthArchive.stages.find(stage=>!stage.isTemplate);assert.deepEqual([...stage.timelineIds],[painting.id]);assert.equal(f.state.characters[1].growthArchive,undefined);
 }finally{f.dom.window.close()}
});
uiTest('background generation survives leaving the stage and remounting the Experiences page',async()=>{
 const f=fixture();try{
  f.click('[data-growth-open]');let resolve,calls=0;f.options.analyze=()=>{calls++;return new Promise(done=>resolve=done)};f.click('[data-growth-api]');f.click('[data-growth-stage-generate]');assert.equal(calls,1);
  assert.equal(f.w.IrisGrowthPage.back(),true);assert.ok(f.find('[data-growth-open]'));f.options.content.innerHTML='<p>Another feature page</p>';
  resolve({stages:[{name:'童年',interests:'【合理推演】愿意长时间练习绘画，并反复观察细节。',certainty:'inferred',sources:[{field:'interests',name:'角色人设',quote:'Childhood: enjoys drawing.'}]}]});await flush();assert.equal(f.saved.length,0);
  f.w.IrisExperiences.render(f.options);f.click('[data-growth-open]');assert.equal(f.find('.growth-stage-ai').hidden,false);assert.ok(f.find('[data-growth-apply]'));assert.equal(f.find('[name="interests"]').value,'');assert.equal(calls,1);f.click('[data-growth-apply]');assert.equal(f.find('[name="interests"]').value,'愿意长时间练习绘画，并反复观察细节。');assert.equal(f.saved.length,0);
 }finally{f.dom.window.close()}
});
uiTest('returning to an in-flight stage restores its progress and attaches the eventual result',async()=>{
 const f=fixture();try{
  f.click('[data-growth-open]');let resolve;f.options.analyze=()=>new Promise(done=>resolve=done);f.click('[data-growth-api]');f.click('[data-growth-stage-generate]');f.w.IrisGrowthPage.back();f.click('[data-growth-open]');assert.equal(f.find('[data-growth-stage-generate]').disabled,true);
  resolve({stages:[{name:'童年',personality:'安静地观察周围。',certainty:'inferred',sources:[{field:'personality',name:'角色人设',quote:'Childhood: quiet.'}]}]});await flush();assert.equal(f.find('[data-growth-stage-generate]').disabled,false);assert.ok(f.find('[data-growth-apply]'));assert.equal(f.saved.length,0);
 }finally{f.dom.window.close()}
});
uiTest('a background result stays with its character and rejects changed source material',async()=>{
 const f=fixture();try{
  f.click('[data-growth-open]');let resolve;f.options.analyze=()=>new Promise(done=>resolve=done);f.click('[data-growth-api]');f.click('[data-growth-stage-generate]');const picker=f.find('[data-timeline-role]');picker.value=f.state.characters[1].experienceCharacterId;picker.dispatchEvent(new f.w.Event('change'));f.click('[data-growth-open]');
  resolve({stages:[{name:'童年',personality:'安静地观察。',sources:[{field:'personality',name:'角色人设',quote:'Childhood: quiet.'}]}]});await flush();assert.equal(f.find('[data-growth-apply]'),null);f.state.characters[0].details='Changed profile';const back=f.find('[data-timeline-role]');back.value=f.state.characters[0].experienceCharacterId;back.dispatchEvent(new f.w.Event('change'));f.click('[data-growth-open]');assert.match(f.find('[data-growth-stage-result]').textContent,/来源资料已改变/);assert.equal(f.find('[data-growth-apply]'),null);assert.equal(f.saved.length,0);
 }finally{f.dom.window.close()}
});
uiTest('each archive field is reviewed and unsupported appearance has a visible reason',async()=>{
 const f=fixture();try{
  f.click('[data-growth-open]');f.options.analyze=async prompt=>{assert.match(prompt,/逐栏完成检查/);return{stages:[{label:'童年',personalityExpression:[{expression:'安静地观察。',status:'inferred'}],appearance:[{detail:'未知来源的外貌描述',status:'inferred'}],fieldReview:[{field:'clothing',status:'missing_information',reason:'没有时代背景或日常活动环境。',question:'平时主要在哪里生活、活动？'}],speechStyle:{description:'可能偏好简短表达。',status:'inferred'},sources:[{field:'personalityExpression',name:'角色人设',quote:'Childhood: quiet.'},{field:'speechStyle',name:'角色人设',quote:'Childhood: quiet.'}]}]}};
  f.click('[data-growth-api]');f.click('[data-growth-stage-generate]');await flush();assert.ok(f.find('[data-growth-apply-field="personality"]'));assert.ok(f.find('[data-growth-apply-field="speech"]'));assert.ok(f.find('[data-growth-apply-field="appearance"]'));assert.match(f.find('.growth-stage-review').textContent,/缺少可核对的原文依据/);assert.match(f.find('.growth-coverage').textContent,/平时主要在哪里生活/);assert.equal(f.saved.length,0);
 }finally{f.dom.window.close()}
});
uiTest('clothing and speech without direct quotes remain adoptable hypotheses and save their review provenance',async()=>{
 const f=fixture();try{
  f.click('[data-growth-open]');f.options.analyze=async prompt=>{assert.match(prompt,/七个描述栏目必须全部有实质建议/);return{stages:[{label:'童年',clothing:[{detail:'可优先考虑便于活动、轮廓简洁的日常衣物，具体款式仍可调整。',basis:'缺少明确衣着设定，这是待确认的可选方向。',status:'needs_confirmation'}],speechStyle:{description:'可能更习惯用短句表达需求，面对不熟悉的人会先观察再开口。',basis:'依安静的底色提出表达方向，需用户确认。',status:'inferred'},ageStart:9,influences:'曾因搬家改变生活习惯。',sources:[]}]}};
  f.click('[data-growth-api]');f.click('[data-growth-stage-generate]');await flush();assert.ok(f.find('[data-growth-apply-field="clothing"]'));assert.ok(f.find('[data-growth-apply-field="speech"]'));assert.equal(f.find('[data-growth-apply-field="influences"]'),null);assert.equal(f.find('[data-growth-apply-field="startAge"]'),null);assert.equal(f.saved.length,0);
  f.click('[data-growth-apply]');assert.match(f.find('[name="clothing"]').value,/便于活动/);assert.match(f.find('[name="speech"]').value,/短句/);assert.doesNotMatch(f.find('[name="clothing"]').value,/【/);await f.submit();const stage=f.state.characters[0].growthArchive.stages.find(stage=>!stage.isTemplate);assert.match(stage.clothing,/便于活动/);assert.equal(stage.influences,'');assert.equal(stage.startAge,null);assert.ok(stage.provenance.some(source=>source.field==='clothing'&&source.status==='needs_confirmation'&&source.quote===''));
 }finally{f.dom.window.close()}
});
uiTest('short appearance and clothing never trigger an extra API request',async()=>{
 const f=fixture();try{
  let initial=0,refinements=0;const appearance='神态与站姿可以呈现较安静的方向，观察环境时略作停顿；具体五官仍由用户确认。'.repeat(7),clothing='日常穿着可以考虑便于活动的简洁搭配，减少妨碍动作的装饰；具体款式与色系仍是可选建议。'.repeat(6);
  f.options.analyze=async()=>{initial++;return{stages:[{name:'童年',personality:'保留的性格内容',appearance:'清秀',clothing:'简单干净',certainty:'inferred',sources:[]}]}};
  f.options.refine=async(prompt,role,request)=>{refinements++;assert.match(prompt,/定向细化补写/);assert.match(prompt,/220—320/);assert.equal(request.background,true);return{stages:[{name:'童年',personality:'补写时不应覆盖的性格',appearance,clothing,certainty:'inferred',sources:[]}]}};
  f.click('[data-growth-open]');f.click('[data-growth-api]');f.click('[data-growth-stage-generate]');await flush();assert.equal(initial,1);assert.equal(refinements,0);f.click('[data-growth-apply]');assert.equal(f.find('[name="personality"]').value,'保留的性格内容');assert.equal(f.find('[name="appearance"]').value,'清秀');assert.equal(f.find('[name="clothing"]').value,'简单干净');assert.equal(f.saved.length,0);
 }finally{f.dom.window.close()}
});
uiTest('first-pass suggestions remain available without any refinement request',async()=>{
 const f=fixture();try{
  let attempts=0;f.options.analyze=async()=>({stages:[{name:'童年',appearance:'已有外貌草稿',clothing:'已有穿着草稿',sources:[]}]});f.options.refine=async()=>{attempts++;throw Error('network unavailable')};f.click('[data-growth-open]');f.click('[data-growth-api]');f.click('[data-growth-stage-generate]');await flush();assert.equal(attempts,0);assert.ok(f.find('[data-growth-apply]'));f.click('[data-growth-apply]');assert.equal(f.find('[name="clothing"]').value,'已有穿着草稿');assert.equal(f.saved.length,0);
 }finally{f.dom.window.close()}
});

uiTest('camera thumbnail and cycle are decorative and do not navigate or change stages',()=>{
 const f=fixture();try{
  const before=f.find('[data-growth-ruler]').getAttribute('aria-valuenow');
  for(const selector of ['[data-growth-thumbnail]','[data-growth-cycle]']){
   const node=f.find(selector);assert.equal(node.tagName,'SPAN');assert.equal(node.getAttribute('aria-hidden'),'true');node.click();
   assert.ok(f.find('.growth-camera'));assert.equal(f.find('[data-growth-ruler]').getAttribute('aria-valuenow'),before);assert.equal(f.find('.growth-form'),null);
  }
 }finally{f.dom.window.close()}
});

uiTest('API stage ages are numeric reviewable estimates and apply with provenance in one request',async()=>{const f=fixture();try{let calls=0;f.options.analyze=async prompt=>{calls++;assert.match(prompt,/ageBasis/);return{stages:[{label:'童年',ageStart:0,ageEnd:11,ageEstimated:true,ageBasis:'普通人类童年阶段，资料未给出更特殊的划分',personalityExpression:[{expression:'安静地观察周围',status:'inferred'}]}]}};f.click('[data-growth-open]');f.click('[data-growth-api]');f.click('[data-growth-stage-generate]');await flush();assert.equal(calls,1);assert.match(f.find('[data-growth-apply-field="endAge"]').closest('label').textContent,/11 岁/);f.click('[data-growth-apply]');assert.equal(f.find('[name="startAge"]').value,'0');assert.equal(f.find('[name="endAge"]').value,'11');await f.submit();const stage=f.state.characters[0].growthArchive.stages.find(stage=>!stage.isTemplate);assert.equal(stage.endAge,11);assert.ok(stage.provenance.some(source=>source.field==='endAge'&&source.status==='needs_confirmation'))}finally{f.dom.window.close()}});
uiTest('user age boundaries override model estimates and inverted estimates fail without saving',()=>{const f=fixture();try{const G=f.w.IrisGrowth,materials=[{name:'角色人设',text:'安静的普通人。'}],raw={stages:[{name:'少年',startAge:12,endAge:17,ageEstimated:true,ageBasis:'普通少年阶段',personality:'安静',sources:[]}]};const entry=G.drafts(raw,materials,{age_stages:[{name:'少年',startAge:13,endAge:16}]})[0];assert.equal(entry.startAge,13);assert.equal(entry.endAge,16);raw.stages[0].endAge=9;assert.throws(()=>G.drafts(raw,materials),/结束年龄/);assert.equal(f.saved.length,0)}finally{f.dom.window.close()}});

uiTest('applying suggestions hides generation controls and returns to the photo without opening linked events',async()=>{const f=fixture();try{const role=f.state.characters[0];role.lifeTimeline=f.w.IrisTimeline.upsert(f.w.IrisTimeline.read(role),{title:'绘画',description:'Childhood: enjoys drawing.',type:'学习',status:'confirmed'});f.options.analyze=async()=>({stages:[{name:'童年',interests:'喜欢绘画',sources:[{field:'interests',name:'已确认经历 · 绘画',quote:'Childhood: enjoys drawing.'}]}]});f.click('[data-growth-open]');f.click('[data-growth-api]');f.click('[data-growth-stage-generate]');await flush();const scroller=f.find('.growth-detail-scroll');scroller.scrollTop=900;f.click('[data-growth-apply]');assert.equal(scroller.scrollTop,0);assert.equal(f.find('.growth-stage-ai').hidden,true);assert.equal(f.find('.growth-stage-ai').open,false);assert.equal(f.find('[data-growth-stage-result]').childNodes.length,0);assert.equal(f.find('.growth-links').open,false);assert.equal(f.find('[name="timelineIds"]').checked,true);assert.equal(f.find('[name="interests"]').value,'喜欢绘画');assert.equal(f.saved.length,0);f.click('[data-growth-api]');assert.equal(f.find('.growth-stage-ai').hidden,false);assert.equal(f.find('.growth-stage-ai').open,true)}finally{f.dom.window.close()}});

uiTest('saving stays in stage detail, preserves scroll and supports repeated saves without duplicate stages',async()=>{const f=fixture();try{f.click('[data-growth-open]');f.find('[name="interests"]').value='第一次';f.find('.growth-detail-scroll').scrollTop=280;f.find('.growth-field-section').open=true;await f.submit();assert.equal(f.find('[data-growth-open]'),null);assert.equal(f.find('.growth-detail-scroll').scrollTop,280);assert.equal(f.find('.growth-field-section').open,true);assert.equal(f.find('[name="interests"]').value,'第一次');f.find('[name="interests"]').value='第二次';await f.submit();assert.equal(f.state.characters[0].growthArchive.stages.length,4);assert.equal(f.state.characters[0].growthArchive.stages[0].interests,'第二次');assert.equal(f.w.IrisGrowthPage.isDirty(),false)}finally{f.dom.window.close()}});
uiTest('adopting stage bounds links all confirmed overlapping ages including middle events and respects later deselection',async()=>{const f=fixture();try{const role=f.state.characters[0],T=f.w.IrisTimeline;for(const [title,startAge,endAge,status] of [['首',6,null,'confirmed'],['中间',9,null,'confirmed'],['尾',12,null,'confirmed'],['跨阶段',4,7,'confirmed'],['阶段外',18,null,'confirmed'],['未知',null,null,'confirmed'],['草稿',8,null,'pending']])role.lifeTimeline=T.upsert(T.read(role),{title,type:'学习',startAge,endAge,status});f.options.analyze=async()=>({stages:[{name:'童年',startAge:6,endAge:12,ageEstimated:true,ageBasis:'根据小学阶段推定',interests:'绘画',sources:[]}]});f.click('[data-growth-open]');f.click('[data-growth-api]');f.click('[data-growth-stage-generate]');await flush();f.click('[data-growth-apply]');const selected=()=>[...f.w.document.querySelectorAll('[name=timelineIds]:checked')].map(el=>role.lifeTimeline.entries.find(e=>e.id===el.value).title);assert.deepEqual(selected(),['首','中间','尾','跨阶段']);await f.submit();const middle=role.lifeTimeline.entries.find(e=>e.title==='中间');f.find(`[name=timelineIds][value="${middle.id}"]`).checked=false;await f.submit();f.w.IrisGrowthPage.back();f.click('[data-growth-open]');assert.deepEqual(selected(),['首','尾','跨阶段']);assert.equal(role.growthArchive.stages[0].timelineIds.includes(middle.id),false)}finally{f.dom.window.close()}});

uiTest('timeline regeneration cleans old growth links and confirmation relinks year-derived ages while retaining exclusions',async()=>{const f=fixture();try{const role=f.state.characters[0],T=f.w.IrisTimeline,G=f.w.IrisGrowth;role.details='1990年出生。1996年入学。1999年搬家。2002年毕业。';const drafts=()=>T.parseDrafts({events:[{title:'入学',type:'学习',date:'1996',evidence:'1996年入学。'},{title:'搬家',type:'搬迁',date:'1999',evidence:'1999年搬家。'},{title:'毕业',type:'学习',date:'2002',evidence:'2002年毕业。'}]},role);role.lifeTimeline=T.rerollDrafts(T.read(role),drafts());role.lifeTimeline.entries.forEach(e=>e.status='confirmed');const oldIds=role.lifeTimeline.entries.map(e=>e.id);role.growthArchive={schemaVersion:1,ownerId:role.experienceCharacterId,stableTraits:'底色',stages:[G.stage({name:'小学阶段',startAge:6,endAge:12,personality:'原档案正文',timelineIds:[oldIds[0],oldIds[2]],rangeLinksReviewed:true})]};await T.commit(f.state,role,data=>T.rerollDrafts(data,drafts()),f.options.persist);assert.equal(role.growthArchive.stages[0].timelineIds.length,0);assert.equal(role.growthArchive.stages[0].personality,'原档案正文');await T.commit(f.state,role,data=>({...data,entries:data.entries.map(e=>({...e,status:'confirmed'}))}),f.options.persist);const ids=role.growthArchive.stages[0].timelineIds;assert.equal(ids.length,2);assert.ok(ids.every(id=>!oldIds.includes(id)));assert.deepEqual(Array.from(role.lifeTimeline.entries.filter(e=>ids.includes(e.id)),e=>e.title),['入学','毕业']);assert.equal(f.state.characters[1].growthArchive,undefined)}finally{f.dom.window.close()}});
uiTest('new confirmed middle events join existing stages and failed writes roll back both timeline and growth links',async()=>{const f=fixture();try{const role=f.state.characters[0],T=f.w.IrisTimeline,G=f.w.IrisGrowth;role.growthArchive={schemaVersion:1,ownerId:role.experienceCharacterId,stableTraits:'',stages:[G.stage({name:'童年',startAge:0,endAge:11,timelineIds:[],rangeLinksReviewed:true})]};await T.commit(f.state,role,data=>T.upsert(data,{title:'中间经历',type:'学习',startAge:8,status:'confirmed'}),f.options.persist);assert.equal(role.growthArchive.stages[0].timelineIds[0],role.lifeTimeline.entries[0].id);const timeline=JSON.stringify(role.lifeTimeline),growth=JSON.stringify(role.growthArchive);await assert.rejects(T.commit(f.state,role,data=>T.rerollDrafts(data,[]),async()=>{throw Error('disk full')}),/保存失败/);assert.equal(JSON.stringify(role.lifeTimeline),timeline);assert.equal(JSON.stringify(role.growthArchive),growth)}finally{f.dom.window.close()}});
