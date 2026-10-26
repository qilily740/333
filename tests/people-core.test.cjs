const {test}=require('node:test'),assert=require('node:assert/strict');
globalThis.crypto||=require('node:crypto').webcrypto;
const T=globalThis.IrisTimeline=require('../scripts/timeline-core.js'),P=require('../scripts/people-core.js'),B=require('../scripts/backup-core.js');
const quote='林老师又称小林，是她10岁入学后结识的导师，性格严谨。';
function state(){const s={characters:[{name:'甲',details:quote+'她9岁喜欢画画，14岁参加社团，18岁获得校内设计奖。'},{name:'乙',details:'另一个角色的私密设定'}],users:[{name:'用户'}],messages:{},settings:{},char:0,user:0};T.ensureIdentities(s.characters);const r=s.characters[0];r.lifeTimeline={...T.read(r),entries:[{id:'school',title:'入学',description:'10岁入学。',type:'学习',status:'confirmed',startAge:10,endAge:null,date:'2010'},{id:'award-event',title:'设计奖',description:'18岁获得校内设计奖。',type:'学习',status:'confirmed',startAge:18,endAge:null,date:'2018'},{id:'pending',title:'未来提案',description:'30岁成为校长。',status:'pending',startAge:30}]};return s}
function response(){return{npcs:[{key:'n1',name:'林老师',aliases:['小林'],identity:'导师',relationship:'老师',personality:'严谨',knownFromAge:10,knownFromYear:null,knownStage:'小学',source:'人设',quote}],reviews:[{npcKey:'n1',stage:'小学',startAge:10,endAge:10,year:null,body:'她总爱追问画面背后的道理，也肯反复修改。',eventIds:['school'],knowledgeQuote:quote,source:'人物设定'}]}}
test('sources include only current role, relevant books and confirmed event IDs',()=>{const s=state(),r=s.characters[0],context={worldbook:'林老师在学校任教。'};const prompt=P.prompt('reviews',r,context);assert.match(prompt,/林老师/);assert.match(prompt,/school/);assert.doesNotMatch(prompt,/另一个角色|未来提案|30岁成为校长/);assert.match(prompt,/不能全是笼统夸奖或全知旁白/)});
test('JSON fences and surrounding prose are accepted while malformed payloads are rejected',()=>{const r=state().characters[0];for(const text of [JSON.stringify(response()),'```json\n'+JSON.stringify(response())+'\n```','说明如下：\n'+JSON.stringify(response())+'\n完成。'])assert.equal(P.parseGeneration('reviews',text,r).reviews.length,1);assert.throws(()=>P.parseGeneration('reviews','{"npcs":[',r),/JSON/)});
test('NPC evidence and phase knowledge are checked and invalid records filtered',()=>{const r=state().characters[0],raw=response();raw.npcs.push({key:'fake',name:'陌生父亲',quote:'这段原文不存在'});raw.reviews.push({...raw.reviews[0],npcKey:'fake'});raw.reviews.push({...raw.reviews[0],startAge:9,endAge:9});raw.reviews.push({...raw.reviews[0],eventIds:['award-event']});const d=P.parseGeneration('reviews',raw,r);assert.equal(d.npcs.length,1);assert.equal(d.reviews.length,2);assert.equal(d.rejected,2);assert.equal(d.reviews[1].stage,'相识后');assert.equal(d.reviews[0].eventIds[0],'school');assert.equal(d.npcs[0].knownFromAge,10)});
test('unsupported exact ages are not fabricated and only stable confirmed event IDs link',()=>{const r=state().characters[0],raw=response();raw.reviews[0].startAge=11;raw.reviews[0].endAge=11;raw.reviews[0].eventIds=['pending','nonexistent','school'];const d=P.parseGeneration('reviews',raw,r);assert.equal(d.reviews[0].startAge,null);assert.equal(d.reviews[0].stage,'小学');assert.deepEqual(d.reviews[0].eventIds,['school'])});
test('proven aliases merge into the same NPC, ambiguous same-name roles remain separate',()=>{const r=state().characters[0];r.peopleAchievements=P.applyGeneration(P.read(r),P.parseGeneration('reviews',response(),r));const raw=response();raw.npcs[0].name='小林';raw.reviews[0].body='她的耐心比从前好了。';const next=P.applyGeneration(P.read(r),P.parseGeneration('reviews',raw,r));assert.equal(next.npcs.length,1);assert.equal(next.reviews.length,2);raw.npcs[0].identity='邻居';raw.npcs[0].relationship='邻里';assert.equal(P.applyGeneration(P.read(r),P.parseGeneration('reviews',raw,r)).npcs.length,2)});
test('awards distinguish quoted facts from fictional creations and reject unsupported real issuers',()=>{const r=state().characters[0],awards=[{name:'校内设计奖',type:'formal',stage:'大学',startAge:18,endAge:null,year:null,issuer:'',reason:'作品受到认可',provenance:'documented',quote:'18岁获得校内设计奖。',source:'角色人设'},{name:'最佳深夜改稿搭档',type:'fun',stage:'大学',startAge:18,endAge:null,year:null,issuer:'',reason:'为角色创作的改稿趣味纪念',provenance:'ai-created',source:'AI创作'},{name:'虚构设计成就',type:'formal',stage:'大学',startAge:null,endAge:null,year:null,issuer:'某现实委员会',issuerFictional:false,reason:'测试',provenance:'ai-created'}];const d=P.parseGeneration('awards',{awards},r);assert.equal(d.awards.length,2);assert.equal(d.rejected,1);assert.equal(d.awards[0].provenance,'documented');assert.equal(d.awards[1].provenance,'ai-created');assert.ok(d.awards.every(a=>a.createdAt&&a.updatedAt&&a.id))});
test('regenerating one review preserves its ID and all other manual records',()=>{const r=state().characters[0];r.peopleAchievements=P.applyGeneration(P.read(r),P.parseGeneration('reviews',response(),r));const old=P.read(r).reviews[0],raw=response();raw.npcs[0].existingId=P.read(r).npcs[0].id;raw.reviews[0].body='她有自己的判断，但仍愿意听取意见。';const scope={npcId:old.npcId,reviewId:old.id};const next=P.applyGeneration(P.read(r),P.parseGeneration('reviews',raw,r,undefined,scope),scope);assert.equal(next.reviews.length,1);assert.equal(next.reviews[0].id,old.id);assert.notEqual(next.reviews[0].body,old.body);assert.equal(next.reviews[0].createdAt,old.createdAt)});
test('saving is atomic, role-scoped and supports finishing background generation for the original role',async()=>{const s=state(),role=s.characters[0],update=d=>P.applyGeneration(d,P.parseGeneration('reviews',response(),role));await assert.rejects(P.commit(s,role,update,async()=>{throw Error('disk')}),/保存失败/);assert.equal(role.peopleAchievements,undefined);s.char=1;await assert.rejects(P.commit(s,role,update,async()=>{}),/角色/);await P.commit(s,role,update,async()=>{},{background:true});assert.equal(role.peopleAchievements.reviews.length,1);assert.equal(s.characters[1].peopleAchievements,undefined)});
test('category JSON and ZIP backups preserve ownership, deleted references and merge tombstones',async()=>{const s=state(),role=s.characters[0];role.peopleAchievements=P.applyGeneration(P.read(role),P.parseGeneration('reviews',response(),role));const npc=role.peopleAchievements.npcs[0];role.peopleAchievements=P.upsert(role.peopleAchievements,'awards',{name:'私人纪念',type:'fun',reason:'手动收藏',stage:'大学',startAge:'',endAge:'',year:'',eventIds:['deleted-event']});const selected=B.selectCategories(s,['peopleAchievements']);assert.equal(selected.characters[0].details,undefined);assert.equal(B.selectCategories(s,['characterProfiles']).characters[0].peopleAchievements,undefined);const backup=await B.make(selected,'custom',['peopleAchievements']),zip=await B.zip(JSON.stringify(backup)),checked=await B.validate(JSON.parse(new TextDecoder().decode(await B.unzip(await zip.arrayBuffer()))));assert.deepEqual(checked.data.characters[0].peopleAchievements,role.peopleAchievements);const current=JSON.parse(JSON.stringify(s));current.characters.reverse();const merged=B.merge(current,checked.data),target=merged.characters.find(x=>x.experienceCharacterId===role.experienceCharacterId);assert.equal(target.peopleAchievements.awards[0].eventIds[0],'deleted-event');const deleted=JSON.parse(JSON.stringify(s));deleted.characters[0].peopleAchievements=P.remove(role.peopleAchievements,'npcs',npc.id);const combined=B.merge(deleted,s);assert.equal(combined.characters[0].peopleAchievements.npcs.length,0);assert.equal(combined.characters[0].peopleAchievements.reviews.length,0);assert.equal(combined.characters[0].peopleAchievements.awards.length,1);const old=JSON.parse(JSON.stringify(s));delete old.characters[0].peopleAchievements;const replaced=B.replaceCategorySet(s,B.selectCategories(old,['characterProfiles']),['characterProfiles']);assert.deepEqual(replaced.characters[0].peopleAchievements,role.peopleAchievements);await B.validate(await B.make(old));const bad=JSON.parse(JSON.stringify(s));bad.characters[0].peopleAchievements.ownerId='foreign';await assert.rejects(B.validate(await B.make(bad)),/归属/)});
test('relationships are analyzed from the full profile without fixed family keywords in the quote',()=>{const r=state().characters[0],raw=response();r.details+='林老师也是她的生母。';raw.npcs[0].relationship='母亲';raw.npcs[0].quote='';assert.equal(P.parseGeneration('reviews',raw,r).npcs.length,1);const only=response();only.reviews=[];const result=P.parseGeneration('reviews',only,r);assert.equal(result.npcs.length,1);assert.equal(result.reviews.length,0);assert.equal(P.applyGeneration(P.read(r),result).npcs.length,1)});
test('unrelated co-occurring NPC names do not become aliases',()=>{const r=state().characters[0],raw=response(),other='林老师在教室见到了小王。小王的昵称是小林。';r.details+='\n'+other;raw.npcs[0].quote=other;raw.npcs[0].aliases=['小林'];raw.reviews[0].knowledgeQuote=other;const parsed=P.parseGeneration('reviews',raw,r);assert.equal(parsed.npcs.length,1);assert.deepEqual(parsed.npcs[0].aliases,[])});
test('missing stable role ownership is rejected before restoring a people archive',async()=>{const s=state(),r=s.characters[0];r.peopleAchievements=P.read(r);delete r.experienceCharacterId;delete r.peopleAchievements.ownerId;await assert.rejects(B.validate(await B.make(s)),/归属/)});
test('source quote whitespace differences do not reject otherwise supported NPCs and reviews',()=>{
 const r=state().characters[0],data=response();data.npcs[0].quote=quote.replace('，','，\n');data.reviews[0].knowledgeQuote=data.npcs[0].quote;
 const parsed=P.parseGeneration('reviews',data,r);assert.equal(parsed.npcs.length,1);assert.equal(parsed.reviews.length,1);assert.equal(parsed.rejected,0);
});
test('rejected records report their names and reasons without accepting unsupported facts',()=>{
 const r=state().characters[0],data=response();data.npcs[0].name='不存在的人';data.npcs[0].quote='这段没有资料依据。';
 const parsed=P.parseGeneration('reviews',data,r);assert.equal(parsed.npcs.length,0);assert.equal(parsed.rejected,2);assert.equal(parsed.rejections[0].name,'不存在的人');assert.match(parsed.rejections[0].reason,/未找到/);assert.match(parsed.rejections[1].reason,/人物未识别/);
});
test('evidence beyond 4000 characters remains available for all NPC and review checks',()=>{
 const r=state().characters[0];r.details='较长的角色背景资料。'.repeat(900)+quote;
 const parsed=P.parseGeneration('reviews',response(),r);
 assert.equal(parsed.npcs.length,1);assert.equal(parsed.reviews.length,1);assert.equal(parsed.rejected,0);
 const context={worldbook:'世界书背景。'.repeat(1200)+quote};r.details='角色简介';
 const fromBook=P.parseGeneration('reviews',response(),r,context);
 assert.equal(fromBook.npcs.length,1);assert.equal(fromBook.reviews.length,1);assert.equal(fromBook.rejected,0);
});
test('structured NPC names and relationship bios are verified within the same entry',()=>{
 const r=state().characters[0];r.details=`<NPC>
  - name:
      chinese: 周之逸
      english: Felix
    age: 23
    positioning: 花花公子，家境优渥的富家子弟
    bio:
      苏雨豪在一个留学生派对上认识的公子哥，两人在泡妞心得交流上很聊得来，可以说是相见恨晚
      他们经常互为僚机，周之逸偶尔会来苏雨豪的公寓蹭饭
  - name:
      chinese: 邱正伦
      english: Justin
    positioning: 苏雨豪社团里的前辈
    bio:
      苏雨豪刚来英国时，进入网球社认识的学长，二人经常一起训练
      学习上偶尔能帮助到苏雨豪
  - name:
      chinese: 奥利弗
      english: Oliver
    occupation: The MOTley Crew 车行技师
    bio:
      曼城本地人，经营着一家小有名气的汽车改装店，是个技术宅，聊起车来滔滔不绝
      为人实在，有点老派的英式幽默感。苏雨豪(Hugo)那辆三菱翼神的所有改装都是在他的店里完成的
  name: 苏志国
  positioning: 苏雨豪的父亲
  bio:
    occupation: 在宁波本地经营一家物流连锁公司。会不定时和兄妹二人视频查岗
</NPC>`;
 const entries=[['周之逸','Felix','苏雨豪在一个留学生派对上认识的公子哥，两人在泡妞心得交流上很聊得来，可以说是相见恨晚','朋友'],['邱正伦','Justin','苏雨豪刚来英国时，进入网球社认识的学长，二人经常一起训练','学长'],['奥利弗','Oliver','为人实在，有点老派的英式幽默感。苏雨豪(Hugo)那辆三菱翼神的所有改装都是在他的店里完成的','技师'],['苏志国','','在宁波本地经营一家物流连锁公司。会不定时和兄妹二人视频查岗','父亲']];
 const data={npcs:entries.map(([name,alias,quote,relationship],i)=>({key:'n'+i,name,aliases:alias?[alias]:[],relationship,quote})),reviews:entries.map((entry,i)=>({npcKey:'n'+i,stage:'目前',body:'这是符合关系的角色评价。',knowledgeQuote:entry[2]}))};
 const parsed=P.parseGeneration('reviews',data,r);
 assert.equal(parsed.rejected,0);assert.equal(parsed.npcs.length,4);assert.equal(parsed.reviews.length,4);
 assert.deepEqual(parsed.npcs[1].aliases,['Justin']);assert.ok(parsed.npcs[1].quote.includes('chinese: 邱正伦'));
 // A known NPC remains eligible even when the model selected a poor optional quote.
 data.npcs=[{key:'bad',name:'邱正伦',quote:entries[2][2],relationship:'技师'}];data.reviews=[];
 assert.equal(P.parseGeneration('reviews',data,r).npcs.length,1);
 data.npcs=[{key:'invented',name:'不存在的人',quote:entries[0][2]}];
 assert.equal(P.parseGeneration('reviews',data,r).npcs.length,0);
});
test('escaped Markdown line endings and HTML space entities preserve Oliver identity and bio evidence',()=>{
 const r=state().characters[0],bio='他有时会像个长辈一样，告诉苏雨豪一些自己的人生经验';
 r.details=['- name:\\','  &#x20; chinese: 奥利弗\\','  &#x20; english: Oliver\\','  age: 约40岁\\','  occupation: The MOTley Crew 车行技师\\','  positioning: 老派英国绅士，车行技师\\','  personality:','  - 稳重','  - 耐心\\','    bio:\\','    &#x20; 曼城本地人，经营着一家小有名气的汽车改装店，是个技术宅，聊起车来滔滔不绝\\','    &#x20; 为人实在，有点老派的英式幽默感。苏雨豪(Hugo)那辆三菱翼神的所有改装都是在他的店里完成的\\','    &#x20; '+bio].join('\n');
 const input={npcs:[{key:'n6',name:'奥利弗',aliases:['Oliver'],relationship:'车行技师',quote:bio}],reviews:[{npcKey:'n6',stage:'留学时期',body:'这是个热爱改装的年轻人。',knowledgeQuote:bio}]};
 const parsed=P.parseGeneration('reviews',input,r);assert.equal(parsed.rejected,0);assert.equal(parsed.npcs.length,1);assert.equal(parsed.reviews.length,1);assert.deepEqual(parsed.npcs[0].aliases,['Oliver']);
 assert.ok(r.details.includes('&#x20;'));assert.ok(r.details.includes('\\'));
 input.npcs[0].name='不存在的人';assert.equal(P.parseGeneration('reviews',input,r).npcs.length,0);
});

test('inferred reviews accept prose JSON and table sources without copying quotes',()=>{
 for(const details of ['林艺是角色的阿姊，性格直率。',JSON.stringify({npc:{name:'林艺',relation:'阿姊',personality:'直率'}}),'| 姓名 | 关系 | 性格 |\n| 林艺 | 阿姊 | 直率 |']){
  const r=state().characters[0];r.details=details;
  const value={npcs:[{key:'n1',name:'林艺',relationship:'姐姐',personality:'直率'}],reviews:[{npcKey:'n1',body:'她做事太爱逞强，但我知道她也会累。'}]};
  const parsed=P.parseGeneration('reviews',value,r);
  assert.equal(parsed.rejected,0);assert.equal(parsed.reviews.length,1);assert.equal(parsed.reviews[0].stage,'目前');assert.equal(parsed.reviews[0].knowledgeQuote,'');assert.match(parsed.reviews[0].source,/推测/);
 }
});

test('future event links are removed without discarding inferred reviews or valid links',()=>{
 const r=state().characters[0],raw=response();raw.reviews[0].eventIds=['school','award-event'];raw.reviews[0].knowledgeQuote='';
 const parsed=P.parseGeneration('reviews',raw,r);
 assert.equal(parsed.rejected,0);assert.equal(parsed.reviews.length,1);assert.equal(parsed.reviews[0].body,raw.reviews[0].body);assert.deepEqual(parsed.reviews[0].eventIds,['school']);
 raw.reviews[0].startAge=9;raw.reviews[0].endAge=9;raw.reviews[0].eventIds=[];
 const inferred=P.parseGeneration('reviews',raw,r);assert.equal(inferred.reviews.length,1);assert.equal(inferred.rejected,0);assert.equal(inferred.reviews[0].stage,'相识后');assert.equal(inferred.reviews[0].startAge,null);
});

test('review instructions request natural individual NPC voices instead of cold assessment prose',()=>{
 const prompt=P.prompt('reviews',state().characters[0]);
 assert.match(prompt,/私下聊起角色/);assert.match(prompt,/不强行亲昵/);assert.match(prompt,/不罗列性格标签/);assert.match(prompt,/不同 NPC 的用词、关注点和情绪要有区别/);assert.match(prompt,/不为增加生活感捏造共同往事/);
});
test('awards accept direct arrays and standard response wrappers without losing valid rows',()=>{
 const r=state().characters[0],awards=[{name:'最佳搭档',reason:'依据设定创作的趣味纪念',type:'fun',stage:'目前',provenance:'ai-created'}];
 for(const value of [{awards},awards,{data:{awards}},{result:awards},{output:{data:{awards}}},JSON.stringify(awards),'```json\n'+JSON.stringify(awards)+'\n```','生成如下：\n'+JSON.stringify({data:{awards}})+'\n结束。',{choices:[{message:{content:[{type:'text',text:JSON.stringify({awards})}]}}]}]){
  const parsed=P.parseGeneration('awards',value,r);assert.equal(parsed.awards.length,1);assert.equal(parsed.rejected,0);
 }
 assert.throws(()=>P.parseGeneration('awards',{choices:[{finish_reason:'length',message:{content:JSON.stringify({awards})}}]},r),/截断/);
 assert.throws(()=>P.parseGeneration('awards','{"awards":'+JSON.stringify(awards),r),/不完整/);
 assert.throws(()=>P.parseGeneration('awards',{npcs:[]},r),/有效内容/);
 assert.throws(()=>P.parseGeneration('awards','{"reviews":[]}',r),/awards/);
});
