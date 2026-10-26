(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.IrisBackup=api})(typeof globalThis==='object'?globalThis:null,function(){
 'use strict';
 const FORMAT='iris-backup',VERSION=4;
 const CATEGORIES=['userProfiles','characterProfiles','lifeTimeline','peopleAchievements','earthTravel','growthArchive','ifWorld','appSettings','onlineChat','onlineSettings','videoCalls','onlineSummaries','onlineMemories','offlineActive','offlineStories','offlineSummaries','offlineStageMemory','offlineSettings','sms','forums','market','localFeatures'];
 const V3_CATEGORIES=['profiles','onlineChat','videoCalls','onlineSummaries','offlineStories','offlineSummaries'];
 const canonical=value=>{
  if(Array.isArray(value))return`[${value.map(canonical).join(',')}]`;
  if(value&&typeof value==='object')return`{${Object.keys(value).sort().map(key=>`${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
 };
 const walk=(value,visit,path='')=>{if(Array.isArray(value)){value.forEach((item,index)=>walk(item,visit,`${path}[${index}]`));return}if(value&&typeof value==='object'){for(const[key,item]of Object.entries(value))walk(item,visit,path?`${path}.${key}`:key);return}visit(value,path)};
 const counts=data=>{
  let messages=0,smsMessages=0,photos=0,localBlobRefs=0,onlineChatMessages=0,videoCalls=0,offlineChatMessages=0;
  for(const[key,thread]of Object.entries(data.messages||{}))if(Array.isArray(thread)){messages+=thread.length;const isOnline=/^-?\d+-\d+-chat$/.test(key);for(const item of thread){if(item?.type==='call-summary')videoCalls++;else if(isOnline)onlineChatMessages++;else if(/^-?\d+-\d+-offline(?:-.+)?$/.test(key))offlineChatMessages++}}
  for(const thread of Object.values(data.smsMessages||{}))if(Array.isArray(thread))smsMessages+=thread.length;
  walk(data,(value,path)=>{if(typeof value!=='string')return;const isImageField=/(image|photo|avatar|portrait|attachment|cover|banner)/i.test(path);if(/^blob:/i.test(value))localBlobRefs++;if(isImageField&&/^(?:data:image\/|https?:\/\/|blob:)/i.test(value))photos++});
  const forumWorlds=data.forums?.worlds||[],market=data.market||{};
  const known=new Set(['settings','users','characters','messages','smsMessages','char','user','offline','forums','market']);
  const uniqueRecords=new Map(),onlineSummaryCount=(data.characters||[]).reduce((sum,character)=>sum+Boolean(character?.chatSettings?.memory?.summaryText),0),onlineMemoryCount=(data.characters||[]).reduce((sum,character)=>sum+(character?.chatSettings?.memory?.entries||[]).filter(entry=>entry?.source!=='video-call'&&entry?.scope!=='offline').length,0),onlineSettingsCount=(data.characters||[]).filter(character=>character?.chatSettings&&Object.keys(character.chatSettings).some(key=>key!=='memory')).length,offlineSettingsCount=(data.characters||[]).filter(character=>character?.offlineData?.settings).length,invitations=Object.keys(data.invitations||{}).length;
  for(const record of [...(data.offlineRecords||[]),...(data.characters||[]).flatMap(character=>character?.offlineData?.records||[])]){const id=record?.id||`${record?.characterIndex||''}:${record?.createdAt||''}:${record?.characterName||''}`;uniqueRecords.set(id,record)}
  let offlineSummaries=0;for(const record of uniqueRecords.values())if(String(record?.summary||'').trim())offlineSummaries++;
  let offlineStageMemory=0;for(const character of data.characters||[]){const visit=value=>{if(Array.isArray(value)){for(const item of value)visit(item);return}if(value&&typeof value==='object'){if(typeof value.summary==='string'&&value.summary.trim()){offlineSummaries++;offlineStageMemory++}for(const child of Object.values(value))visit(child)}};visit(character?.offlineData?.stageMemorySessions)}
  return{ifBranches:(data.characters||[]).reduce((n,c)=>n+(c?.ifWorld?.branches?.length||0),0),ifDreams:(data.characters||[]).reduce((n,c)=>n+(c?.ifWorld?.dreams?.length||0),0),ifArchives:(data.characters||[]).reduce((n,c)=>n+new Set([...(c?.ifWorld?.archives||[]),...(c?.ifWorld?.branches||[]).flatMap(b=>b.archives||[])].map(a=>a.id)).size,0),npcProfiles:(data.characters||[]).reduce((n,c)=>n+(c?.peopleAchievements?.npcs?.length||0),0),npcReviews:(data.characters||[]).reduce((n,c)=>n+(c?.peopleAchievements?.reviews?.length||0),0),characterAwards:(data.characters||[]).reduce((n,c)=>n+(c?.peopleAchievements?.awards?.length||0),0),growthStages:(data.characters||[]).reduce((sum,character)=>sum+(Array.isArray(character?.growthArchive?.stages)?character.growthArchive.stages.length:0),0),timelineEntries:(data.characters||[]).reduce((sum,character)=>sum+(Array.isArray(character?.lifeTimeline?.entries)?character.lifeTimeline.entries.length:0),0),settings:data.settings?1:0,users:Array.isArray(data.users)?data.users.length:0,characters:Array.isArray(data.characters)?data.characters.length:0,messages,onlineChatMessages,videoCalls,offlineChatMessages,smsMessages,offlineRecords:uniqueRecords.size,offlineStoryTranscripts:[...uniqueRecords.values()].filter(record=>Array.isArray(record?.messages)).length,onlineSummaries:onlineSummaryCount,onlineMemories:onlineMemoryCount,onlineSettings:onlineSettingsCount,offlineSummaries,offlineStageMemory,offlineSettings:offlineSettingsCount,invitations,photos,forumWorlds:Array.isArray(forumWorlds)?forumWorlds.length:0,forumPosts:Array.isArray(forumWorlds)?forumWorlds.reduce((sum,world)=>sum+(world?.posts?.length||0),0):0,forumComments:Array.isArray(forumWorlds)?forumWorlds.reduce((sum,world)=>sum+(world?.comments?.length||0),0):0,marketProducts:Array.isArray(market.products)?market.products.length:0,marketOrders:Object.values(market.personas||{}).reduce((sum,persona)=>sum+(persona?.orders?.length||0),0),otherLocalData:Object.keys(data).filter(key=>!known.has(key)).length,localBlobRefs};
 };
 const legacyManifestCounts=(data,version)=>{const current=counts(data),keys=version===2?['settings','users','characters','messages','smsMessages','photos','forumWorlds','forumPosts','forumComments','marketProducts','marketOrders','otherLocalData','localBlobRefs']:['settings','users','characters','messages','onlineChatMessages','videoCalls','offlineChatMessages','smsMessages','photos','forumWorlds','forumPosts','forumComments','marketProducts','marketOrders','otherLocalData','localBlobRefs','offlineRecords','onlineSummaries','offlineSummaries'],values={...current};if(version===3)values.onlineSummaries=(current.onlineSummaries||0)+(current.onlineMemories||0);return Object.fromEntries(keys.map(key=>[key,values[key]]))};
 const digest=async value=>{
  if(!globalThis.crypto?.subtle)throw Error('当前浏览器不支持备份完整性校验，请使用较新的浏览器并通过 HTTPS 或 localhost 打开。');
  const bytes=new TextEncoder().encode(canonical(value));
  const hash=await globalThis.crypto.subtle.digest('SHA-256',bytes);
  return Array.from(new Uint8Array(hash),byte=>byte.toString(16).padStart(2,'0')).join('');
 };
 const crcTable=(()=>{const table=new Uint32Array(256);for(let n=0;n<256;n++){let value=n;for(let bit=0;bit<8;bit++)value=value&1?0xedb88320^(value>>>1):value>>>1;table[n]=value>>>0}return table})();
 const crc32=bytes=>{let value=0xffffffff;for(const byte of bytes)value=crcTable[(value^byte)&255]^(value>>>8);return(value^0xffffffff)>>>0};
 const zip=async(text,filename='iris-backup.json')=>{
  const source=new TextEncoder().encode(text),name=new TextEncoder().encode(filename);let method=0,body=source;
  try{if(typeof CompressionStream==='function'){const compressed=new Uint8Array(await new Response(new Blob([source]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer());if(compressed.length<source.length){body=compressed;method=8}}}catch{}
  if(source.length>0xffffffff||body.length>0xffffffff)throw Error('备份文件超过 ZIP 格式支持的大小。');
  const crc=crc32(source),stamp=new Date(),time=(stamp.getHours()<<11)|(stamp.getMinutes()<<5)|(stamp.getSeconds()>>1),date=((stamp.getFullYear()-1980)<<9)|((stamp.getMonth()+1)<<5)|stamp.getDate(),flags=0x0800;
  const local=new Uint8Array(30+name.length+body.length),lv=new DataView(local.buffer);lv.setUint32(0,0x04034b50,true);lv.setUint16(4,20,true);lv.setUint16(6,flags,true);lv.setUint16(8,method,true);lv.setUint16(10,time,true);lv.setUint16(12,date,true);lv.setUint32(14,crc,true);lv.setUint32(18,body.length,true);lv.setUint32(22,source.length,true);lv.setUint16(26,name.length,true);lv.setUint16(28,0,true);local.set(name,30);local.set(body,30+name.length);
  const central=new Uint8Array(46+name.length),cv=new DataView(central.buffer);cv.setUint32(0,0x02014b50,true);cv.setUint16(4,0x0314,true);cv.setUint16(6,20,true);cv.setUint16(8,flags,true);cv.setUint16(10,method,true);cv.setUint16(12,time,true);cv.setUint16(14,date,true);cv.setUint32(16,crc,true);cv.setUint32(20,body.length,true);cv.setUint32(24,source.length,true);cv.setUint16(28,name.length,true);cv.setUint16(30,0,true);cv.setUint16(32,0,true);cv.setUint16(34,0,true);cv.setUint16(36,0,true);cv.setUint32(38,0,true);cv.setUint32(42,0,true);central.set(name,46);
  const end=new Uint8Array(22),ev=new DataView(end.buffer);ev.setUint32(0,0x06054b50,true);ev.setUint16(4,0,true);ev.setUint16(6,0,true);ev.setUint16(8,1,true);ev.setUint16(10,1,true);ev.setUint32(12,central.length,true);ev.setUint32(16,local.length,true);ev.setUint16(20,0,true);
  return new Blob([local,central,end],{type:'application/zip'});
 };
 const unzip=async input=>{
  const bytes=input instanceof Uint8Array?input:new Uint8Array(input),view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let end=-1;
  for(let offset=bytes.length-22;offset>=Math.max(0,bytes.length-65557);offset--)if(view.getUint32(offset,true)===0x06054b50){end=offset;break}
  if(end<0)throw Error('ZIP 文件目录无效或文件不完整。');const entries=view.getUint16(end+10,true),directory=view.getUint32(end+16,true);let cursor=directory,chosen=null;
  for(let index=0;index<entries;index++){if(cursor+46>bytes.length||view.getUint32(cursor,true)!==0x02014b50)throw Error('ZIP 文件目录损坏。');const method=view.getUint16(cursor+10,true),crc=view.getUint32(cursor+16,true),compressedSize=view.getUint32(cursor+20,true),size=view.getUint32(cursor+24,true),nameLength=view.getUint16(cursor+28,true),extraLength=view.getUint16(cursor+30,true),commentLength=view.getUint16(cursor+32,true),localOffset=view.getUint32(cursor+42,true),name=new TextDecoder().decode(bytes.subarray(cursor+46,cursor+46+nameLength));if(!name.endsWith('/')){if(!chosen||name==='iris-backup.json'||name.endsWith('.json'))chosen={method,crc,compressedSize,size,localOffset,name};if(name==='iris-backup.json')break}cursor+=46+nameLength+extraLength+commentLength}
  if(!chosen)throw Error('ZIP 压缩包中没有找到 JSON 备份文件。');if(chosen.size>0x7fffffff)throw Error('ZIP 中的备份文件过大，无法在此设备上安全读取。');const offset=chosen.localOffset;if(view.getUint32(offset,true)!==0x04034b50)throw Error('ZIP 备份文件头损坏。');const start=offset+30+view.getUint16(offset+26,true)+view.getUint16(offset+28,true),compressed=bytes.subarray(start,start+chosen.compressedSize);let result;
  if(chosen.method===0)result=compressed.slice();else if(chosen.method===8&&typeof DecompressionStream==='function')result=new Uint8Array(await new Response(new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());else throw Error('此 ZIP 使用了当前浏览器不支持的压缩方式。');
  if(result.length!==chosen.size||crc32(result)!==chosen.crc)throw Error('ZIP 内容校验失败，压缩包可能已损坏。');return result;
 };
 const make=async(data,scope='all',categories=[])=>({format:FORMAT,version:VERSION,scope,categories:scope==='custom'?[...categories]:[],createdAt:new Date().toISOString(),manifest:{scope,categories:scope==='custom'?[...categories]:[],counts:counts(data)},integrity:{algorithm:'SHA-256',checksum:await digest({scope,categories:scope==='custom'?[...categories]:[],data})},data});
 const validate=async backup=>{
  if(!backup||typeof backup!=='object'||backup.format!==FORMAT)throw Error('这不是 Iris 备份文件。请检查是否选错文件。');
  if(![2,3,VERSION].includes(backup.version))throw Error(`此备份格式版本为 ${String(backup.version)}，当前应用仅支持版本 2 至 ${VERSION}。请使用兼容版本的 Iris 恢复。`);
  const data=backup.data;
  if(!data||typeof data!=='object'||Array.isArray(data)||!Array.isArray(data.users)||!Array.isArray(data.characters)||!data.messages||typeof data.messages!=='object'||Array.isArray(data.messages))throw Error('备份数据结构不完整，文件可能已损坏。');
  let unsafeKey=false;const inspectKeys=value=>{if(!value||typeof value!=='object')return;if(Object.prototype.hasOwnProperty.call(value,'__proto__'))unsafeKey=true;for(const child of Object.values(value))inspectKeys(child)};inspectKeys(data);if(unsafeKey)throw Error('备份包含不安全的数据字段，已停止恢复。');
  const ownerIds=new Set();for(const character of data.characters){
   if(character?.experienceCharacterId){if(ownerIds.has(character.experienceCharacterId))throw Error('备份包含重复的经历角色身份，已停止恢复。');ownerIds.add(character.experienceCharacterId)}
   if(character?.ifWorld!==undefined){const archive=character.ifWorld,owner=character.experienceCharacterId;if(!owner||!archive||archive.ownerId!==owner||!Array.isArray(archive.branches)||!Array.isArray(archive.dreams)||archive.archives!==undefined&&!Array.isArray(archive.archives))throw Error('备份中的 IF 世界归属或结构无效。');for(const [kind,records]of [['branches',archive.branches],['dreams',archive.dreams],['archives',archive.archives||[]]]){const ids=new Set();for(const record of records){if(!record||typeof record.id!=='string'||!record.id||ids.has(record.id)||record.roleId!==owner)throw Error('备份中的 IF 记录归属无效或重复。');ids.add(record.id);if(kind==='branches'&&(!Array.isArray(record.messages)||record.nodeSnapshot?.id!==record.sourceNodeId)||kind!=='branches'&&typeof record.content!=='string')throw Error('备份中的 IF 记录不完整。')}}}
   if(character?.growthArchive!==undefined){const archive=character.growthArchive;if(!archive||archive.ownerId!==character.experienceCharacterId||!character.experienceCharacterId||!Array.isArray(archive.stages)||typeof archive.stableTraits!=='string')throw Error('备份中的成长档案归属或结构无效。');const ids=new Set();for(const stage of archive.stages){if(!stage||typeof stage.id!=='string'||!stage.id||ids.has(stage.id)||typeof stage.name!=='string'||stage.status!=='confirmed')throw Error('备份中的成长阶段无效或重复。');ids.add(stage.id);for(const field of ['startAge','endAge'])if(stage[field]!==null&&stage[field]!==undefined&&(typeof stage[field]!=='number'||!Number.isFinite(stage[field])||stage[field]<0))throw Error('备份中的成长阶段年龄无效。')}}
   if(character?.peopleAchievements!==undefined){const P=globalThis.IrisPeople||(typeof require==='function'?require('./people-core.js'):null);if(!P)throw Error('人物档案校验模块不可用。');P.validate(character.peopleAchievements,character.experienceCharacterId)}
   if(character?.earthTravel!==undefined){const d=character.earthTravel;if(!d||!character.experienceCharacterId||d.ownerId!==character.experienceCharacterId||!Array.isArray(d.routes)||!Array.isArray(d.questions))throw Error('地球地图归属或结构无效');const ids=new Set();for(const r of d.routes){if(!r||typeof r.id!=='string'||ids.has(r.id)||!['pending','confirmed','ignored'].includes(r.review)||!['设定明确','合理推演','待用户确认'].includes(r.status)||typeof r.from!=='string'||typeof r.to!=='string'||!Number.isFinite(r.confidence)||r.confidence<0||r.confidence>1)throw Error('旅行航线无效');ids.add(r.id)}}
   if(character?.lifeTimeline!==undefined){const timeline=character.lifeTimeline;if(!timeline||typeof timeline!=='object'||!Array.isArray(timeline.entries)||!character.experienceCharacterId||timeline.ownerId!==character.experienceCharacterId)throw Error('备份中的人生经历归属或结构无效。');const ids=new Set();for(const entry of timeline.entries){if(!entry||typeof entry!=='object'||typeof entry.id!=='string'||!entry.id||ids.has(entry.id)||typeof entry.title!=='string'||!['confirmed','pending'].includes(entry.status))throw Error('备份中的人生经历条目无效或重复。');ids.add(entry.id)}}
  }
  if(!backup.integrity||backup.integrity.algorithm!=='SHA-256'||typeof backup.integrity.checksum!=='string')throw Error('备份缺少完整性校验信息，无法安全恢复。');
  const scope=backup.scope||backup.manifest?.scope||'all',categories=scope==='custom'?(backup.categories||backup.manifest?.categories):[];
  if(backup.version===2&&scope==='custom')throw Error('此备份分类版本不受支持。');
  const supportedCategories=backup.version===3?V3_CATEGORIES:CATEGORIES;
  if(!['all','online','offline','custom'].includes(scope))throw Error('备份的数据分类不受支持。');
  if(scope==='custom'&&(!Array.isArray(categories)||!categories.length||categories.some(category=>!supportedCategories.includes(category))||new Set(categories).size!==categories.length))throw Error('备份的数据分类不受支持。');
  const expected=backup.version===2?await digest({scope,data}):backup.version===3?await digest({scope,categories:scope==='custom'?categories:[],data}):await digest({scope,categories:scope==='custom'?categories:[],data});if(expected!==backup.integrity.checksum)throw Error('备份完整性校验失败。文件内容可能已损坏或被修改，未导入任何数据。');
  const actual=backup.version===VERSION?counts(data):legacyManifestCounts(data,backup.version),listed=backup.manifest?.counts;
  if(!listed||Object.entries(listed).some(([key,value])=>actual[key]!==value))throw Error('备份数据清单与文件内容不一致，文件可能已损坏。');
  if(backup.manifest.scope&&backup.manifest.scope!==scope)throw Error('备份分类信息不一致，文件可能已损坏。');
  if(scope==='custom'&&backup.version!==2&&canonical(backup.manifest.categories||[])!==canonical(categories))throw Error('备份分类信息不一致，文件可能已损坏。');
  return{data,counts:actual,createdAt:backup.createdAt||'',scope,categories,version:backup.version};
 };
 const identity=value=>value&&typeof value==='object'&&!Array.isArray(value)?['id','experienceCharacterId','irisMarketId','forumCharacterId','forumPersonaId'].map(key=>value[key]?`${key}:${value[key]}`:'').find(Boolean)||'':'';
 const union=(current,incoming)=>{const out=Array.isArray(current)?current.slice():[],exact=new Map(out.map((value,index)=>[canonical(value),index])),ids=new Map(out.map((value,index)=>[identity(value),index]).filter(([key])=>key));for(const value of incoming){const key=canonical(value),id=identity(value);if(exact.has(key))continue;if(id&&ids.has(id)){const index=ids.get(id);out[index]=merge(out[index],value);exact.set(key,index)}else{const index=out.push(value)-1;exact.set(key,index);if(id)ids.set(id,index)}}return out};
 const select=(source,scope='all')=>{const data=JSON.parse(JSON.stringify(source));if(scope==='all')return data;if(!['online','offline'].includes(scope))throw Error('未知的备份数据分类。');const threadKind=key=>{const match=String(key).match(/^(-?\d+)-(-?\d+)-(chat|offline(?:-.+)?)$/);return match?match[3]==='chat'?'online':'offline':'other'};if(scope==='online'){const linkedOffline=new Set(Object.values(data.invitations||{}).map(invite=>invite?.offlineThreadKey).filter(Boolean));data.messages=Object.fromEntries(Object.entries(data.messages||{}).filter(([key])=>threadKind(key)==='online'||linkedOffline.has(key)));delete data.offlineRecords;delete data.activeOfflineThreads;data.characters=(data.characters||[]).map(character=>{const copy={...character};delete copy.offlineData;delete copy.offlineMode;return copy})}else{data.messages=Object.fromEntries(Object.entries(data.messages||{}).filter(([key])=>threadKind(key)==='offline'||threadKind(key)==='other'));data.smsMessages={};delete data.forums;delete data.market;delete data.invitations;data.characters=(data.characters||[]).map(character=>{const copy={...character};if(character.chatSettings)copy.chatSettings={userIndex:character.chatSettings.userIndex};else delete copy.chatSettings;return copy})}return data};
 const selectLegacyCategories=(source,categories)=>{
  if(!Array.isArray(categories)||!categories.length||categories.some(category=>!V3_CATEGORIES.includes(category)))throw Error('请至少选择一个有效的数据分类。');
  if(new Set(categories).size!==categories.length)throw Error('数据分类重复，请重新选择。');
  const chosen=new Set(categories),data=JSON.parse(JSON.stringify(source)),threadKind=key=>{const match=String(key).match(/^(-?\d+)-(-?\d+)-(chat|offline(?:-.+)?)$/);return match?match[3]==='chat'?'online':'offline':'other'};
  const wantOnline=chosen.has('onlineChat'),wantCalls=chosen.has('videoCalls'),wantOffline=chosen.has('offlineStories');
  data.messages=Object.fromEntries(Object.entries(data.messages||{}).flatMap(([key,items])=>{const kind=threadKind(key);if(kind==='online'||kind==='offline'){const selected=(Array.isArray(items)?items:[]).filter(item=>item?.type==='call-summary'?wantCalls:kind==='online'?wantOnline:wantOffline);return selected.length?[[key,selected]]:[]}return[[key,items]]}));
  data.smsMessages={};delete data.forums;delete data.market;delete data.activeOfflineThreads;delete data.invitations;
  data.users=chosen.has('profiles')?(data.users||[]):(data.users||[]).map(user=>typeof user==='string'?user:{name:user?.name||'',nickname:user?.nickname||''});
  data.characters=(data.characters||[]).map(character=>{
   const copy=chosen.has('profiles')?{...character}:{name:character.name||''},chat=character.chatSettings||{},memory=chat.memory||{};
   delete copy.offlineMode;delete copy.offlineData;
   if(chosen.has('profiles')){if(!chosen.has('onlineSummaries')&&!chosen.has('videoCalls')){if(chat.userIndex!==undefined)copy.chatSettings={userIndex:chat.userIndex};else delete copy.chatSettings}}
   else {const ref={};for(const key of ['id','name','avatar','portrait','image'])if(character[key]!==undefined)ref[key]=character[key];copy.name=ref.name||character.name||'';for(const key of ['id','avatar','portrait','image'])if(ref[key]!==undefined)copy[key]=ref[key];if(chosen.has('onlineSummaries')||chosen.has('videoCalls'))copy.chatSettings={userIndex:chat.userIndex,memory:{...memory,entries:[]}};else if(chat.userIndex!==undefined)copy.chatSettings={userIndex:chat.userIndex};else delete copy.chatSettings}
   if(chosen.has('onlineSummaries')||chosen.has('videoCalls')){
    const nextMemory={};for(const key of ['summaryText','summaryThroughRound','summaryUpdatedAt','summaryError'])if(chosen.has('onlineSummaries')&&memory[key]!==undefined)nextMemory[key]=memory[key];
    const entries=(memory.entries||[]).filter(entry=>entry?.source==='video-call'?chosen.has('videoCalls'):chosen.has('onlineSummaries')&&entry?.scope!=='offline');
    if(entries.length)nextMemory.entries=entries;
    copy.chatSettings={...(copy.chatSettings||{}),memory:nextMemory};if(chat.more!==undefined&&chosen.has('profiles'))copy.chatSettings.more=chat.more;
   }
   if(chosen.has('offlineStories')||chosen.has('offlineSummaries')){
    const offline=character.offlineData||{},records=(offline.records||[]).flatMap(record=>{const out={...record};if(!chosen.has('offlineStories'))delete out.messages;if(!chosen.has('offlineSummaries'))delete out.summary;return chosen.has('offlineStories')||String(out.summary||'').trim()?[out]:[]});
    const nextOffline={records};if(chosen.has('offlineSummaries')&&offline.stageMemorySessions)nextOffline.stageMemorySessions=offline.stageMemorySessions;if(chosen.has('profiles')){if(offline.settings)nextOffline.settings=offline.settings;if(offline.lastGeneration)nextOffline.lastGeneration=offline.lastGeneration}copy.offlineData=nextOffline;
   }
   return copy;
  });
  if(chosen.has('offlineStories')||chosen.has('offlineSummaries'))data.offlineRecords=(source.offlineRecords||[]).flatMap(record=>{const out={...record};if(!chosen.has('offlineStories'))delete out.messages;if(!chosen.has('offlineSummaries'))delete out.summary;return chosen.has('offlineStories')||String(out.summary||'').trim()?[out]:[]});else delete data.offlineRecords;
  if(!chosen.has('offlineStories'))delete data.activeOfflineThreads;
  if(!chosen.has('profiles'))delete data.settings;
  if(wantOffline&&source.invitations)data.invitations=source.invitations;
  return data;
 };
 const selectCategories=(source,categories)=>{
  if(!Array.isArray(categories)||!categories.length||categories.some(category=>!CATEGORIES.includes(category)))throw Error('请至少选择一个有效的数据分类。');
  if(new Set(categories).size!==categories.length)throw Error('数据分类重复，请重新选择。');
  const chosen=new Set(categories),data=JSON.parse(JSON.stringify(source)),linkedOffline=new Set(Object.values(source.invitations||{}).map(i=>i?.offlineThreadKey).filter(Boolean)),isOnline=key=>/^-?\d+-\d+-chat$/.test(key),isOffline=key=>/^-?\d+-\d+-offline(?:-.+)?$/.test(key);
  data.messages=Object.fromEntries(Object.entries(source.messages||{}).flatMap(([key,items])=>{
   if(!Array.isArray(items))return chosen.has('localFeatures')?[[key,items]]:[];
   const filtered=items.flatMap(item=>{
    if(item?.type==='call-summary')return chosen.has('videoCalls')?[item]:[];
    if(isOnline(key)){if(chosen.has('onlineChat'))return[item];if(chosen.has('earthTravel')&&(item?.travelInvitation||item?.travelEvent)){const fields=['id','mine','createdAt','travelInvitation','travelEvent','travelBookings','travelBilling','travelPlaces','travelJournal','travelQuickHidden'];return[Object.fromEntries(fields.filter(f=>item[f]!==undefined).map(f=>[f,item[f]]))]}return[]}
    return (isOffline(key)?chosen.has('offlineActive')||chosen.has('onlineChat')&&linkedOffline.has(key):chosen.has('localFeatures'))?[item]:[];
   });
   return filtered.length?[[key,filtered]]:[];
  }));
  data.users=chosen.has('userProfiles')?(source.users||[]):(source.users||[]).map(user=>typeof user==='string'?user:{name:user?.name||'',nickname:user?.nickname||'',...Object.fromEntries(['id','irisMarketId','irisLifeMemoryId','forumPersonaId'].filter(key=>user?.[key]).map(key=>[key,user[key]]))});
  data.characters=(source.characters||[]).map(character=>{
   const copy=chosen.has('characterProfiles')?{...character}:{name:character?.name||''},chat=character?.chatSettings||{},memory=chat.memory||{},offline=character?.offlineData||{};
   for(const key of ['id','experienceCharacterId','irisMarketId','invitationCharacterId','forumCharacterId','builtinRole','name','avatar','portrait','image'])if(character?.[key]!==undefined)copy[key]=character[key];
   delete copy.ifWorld;if(chosen.has('ifWorld')&&character.ifWorld)copy.ifWorld=character.ifWorld;delete copy.peopleAchievements;if(chosen.has('peopleAchievements')&&character.peopleAchievements)copy.peopleAchievements=character.peopleAchievements;delete copy.earthTravel;if(chosen.has('earthTravel')&&character.earthTravel)copy.earthTravel=character.earthTravel;delete copy.chatSettings;delete copy.offlineData;delete copy.offlineMode;delete copy.growthArchive;if(chosen.has('growthArchive')&&character.growthArchive)copy.growthArchive=character.growthArchive;delete copy.lifeTimeline;if(chosen.has('lifeTimeline')&&character.lifeTimeline)copy.lifeTimeline=character.lifeTimeline;
   const chatSettings=chosen.has('onlineSettings')?Object.fromEntries(Object.entries(chat).filter(([key])=>key!=='memory')):{};
   if(chat.userIndex!==undefined)chatSettings.userIndex=chat.userIndex;
   if(['onlineSummaries','onlineMemories','videoCalls'].some(key=>chosen.has(key))){const nextMemory={};if(chosen.has('onlineSummaries'))for(const key of ['summaryText','summaryThroughRound','summaryUpdatedAt','summaryError'])if(memory[key]!==undefined)nextMemory[key]=memory[key];const entries=(memory.entries||[]).filter(entry=>entry?.source==='video-call'?chosen.has('videoCalls'):chosen.has('onlineMemories')&&entry?.scope!=='offline');if(entries.length)nextMemory.entries=entries;chatSettings.memory=nextMemory}
   if(Object.keys(chatSettings).length)copy.chatSettings=chatSettings;
   if(chosen.has('offlineActive'))copy.offlineMode=Boolean(character?.offlineMode);
   const selectedOffline={};
   if(chosen.has('offlineStories')||chosen.has('offlineSummaries'))selectedOffline.records=(offline.records||[]).flatMap(record=>{const out={...record};if(!chosen.has('offlineStories'))delete out.messages;if(!chosen.has('offlineSummaries'))delete out.summary;return chosen.has('offlineStories')||String(out.summary||'').trim()?[out]:[]});
   if(chosen.has('offlineStageMemory')&&offline.stageMemorySessions)selectedOffline.stageMemorySessions=offline.stageMemorySessions;
   if(chosen.has('offlineSettings')){if(offline.settings)selectedOffline.settings=offline.settings;if(offline.lastGeneration)selectedOffline.lastGeneration=offline.lastGeneration}
   if(Object.keys(selectedOffline).length)copy.offlineData=selectedOffline;
   return copy;
  });
  const selectedRoot=new Set(['char','user','users','characters','messages','offline','settings','smsMessages','forums','market','activeOfflineThreads','offlineRecords','invitations']);
  if(!chosen.has('appSettings'))delete data.settings;
  if(!chosen.has('sms'))data.smsMessages={};
  if(!chosen.has('forums'))delete data.forums;
  if(!chosen.has('market'))delete data.market;
  if(!chosen.has('offlineActive'))delete data.activeOfflineThreads;
  if(chosen.has('offlineStories')||chosen.has('offlineSummaries'))data.offlineRecords=(source.offlineRecords||[]).flatMap(record=>{const out={...record};if(!chosen.has('offlineStories'))delete out.messages;if(!chosen.has('offlineSummaries'))delete out.summary;return chosen.has('offlineStories')||String(out.summary||'').trim()?[out]:[]});else delete data.offlineRecords;
  if(chosen.has('onlineChat')){if(source.invitations)data.invitations=source.invitations}else if(chosen.has('offlineActive'))data.invitations=Object.fromEntries(Object.entries(source.invitations||{}).filter(([,invite])=>data.messages[invite.offlineThreadKey]));else delete data.invitations;
  if(chosen.has('localFeatures')){for(const key of Object.keys(source))if(!selectedRoot.has(key))data[key]=source[key]}else for(const key of Object.keys(source))if(!selectedRoot.has(key))delete data[key];
  return data;
 };
 const replaceScope=(current,incoming,scope)=>{if(scope==='all'){const aligned=alignIncoming(current,incoming),next={...aligned};next.users=(aligned.users||[]).map((user,index)=>({...asProfile(current.users?.[index]),...asProfile(user)}));next.characters=(aligned.characters||[]).map((role,index)=>({...current.characters?.[index],...role}));return next;}const base=JSON.parse(JSON.stringify(current)),isThread=(key,kind)=>{const match=String(key).match(/^(-?\d+)-(-?\d+)-(chat|offline(?:-.+)?)$/);return match&&(kind==='online'?match[3]==='chat':match[3]!=='chat')};base.messages=Object.fromEntries(Object.entries(base.messages||{}).filter(([key])=>!isThread(key,scope)));if(scope==='online'){base.smsMessages={};delete base.forums;delete base.market;base.invitations={};base.settings={}}else{base.offlineRecords=[];base.activeOfflineThreads={};base.characters=(base.characters||[]).map(character=>{const copy={...character};delete copy.offlineData;delete copy.offlineMode;return copy})}return merge(base,incoming)};
 const replaceCategories=(current,incoming,categories)=>{
  incoming=alignIncoming(current,incoming);
  const base=JSON.parse(JSON.stringify(current)),chosen=new Set(categories||[]),isThread=(key,kind)=>{const match=String(key).match(/^(-?\d+)-(-?\d+)-(chat|offline(?:-.+)?)$/);return match&&(kind==='online'?match[3]==='chat':match[3]!=='chat')};
  base.messages=Object.fromEntries(Object.entries(base.messages||{}).flatMap(([key,items])=>{if(!Array.isArray(items))return[[key,items]];const kind=key.match(/^(-?\d+)-(-?\d+)-(chat|offline(?:-.+)?)$/)?.[3]==='chat'?'online':'offline';const kept=items.filter(item=>kind==='online'?item?.type==='call-summary'?!chosen.has('videoCalls'):!chosen.has('onlineChat'):!chosen.has('offlineStories'));return kept.length?[[key,kept]]:[]}));
  if(chosen.has('offlineStories')){delete base.activeOfflineThreads;base.invitations={}}
  base.characters=(base.characters||[]).map(character=>{const copy={...character},chat=copy.chatSettings||{},memory=chat.memory||{};if(chosen.has('onlineSummaries')||chosen.has('videoCalls')){const next={...memory,entries:(memory.entries||[]).filter(entry=>chosen.has(entry?.source==='video-call'?'videoCalls':'onlineSummaries'))};if(chosen.has('onlineSummaries'))for(const key of ['summaryText','summaryThroughRound','summaryUpdatedAt','summaryError'])delete next[key];copy.chatSettings={...chat,memory:next}}if(chosen.has('offlineStories')||chosen.has('offlineSummaries')){const offline=copy.offlineData||{};copy.offlineData={...offline,records:(offline.records||[]).flatMap(record=>{const out={...record};if(chosen.has('offlineStories'))delete out.messages;if(chosen.has('offlineSummaries'))out.summary='';return out.messages||String(out.summary||'').trim()?[out]:[]})};if(chosen.has('offlineSummaries'))delete copy.offlineData.stageMemorySessions}return copy});
  return merge(base,incoming);
 };
 const replaceCategorySet=(current,incoming,categories)=>{
  incoming=alignIncoming(current,incoming);
  const chosen=new Set(categories||[]),base=JSON.parse(JSON.stringify(current)),currentCharacters=base.characters||[],onlineTouched=['onlineSettings','videoCalls','onlineSummaries','onlineMemories'].some(key=>chosen.has(key)),offlineTouched=['offlineActive','offlineStories','offlineSummaries','offlineStageMemory','offlineSettings'].some(key=>chosen.has(key)),isOnline=key=>/^-?\d+-\d+-chat$/.test(key),isOffline=key=>/^-?\d+-\d+-offline(?:-.+)?$/.test(key);
  if(chosen.has('userProfiles'))base.users=mergeValue(base.users||[],incoming.users||[],'users');
  if(chosen.has('characterProfiles'))base.characters=(incoming.characters||[]).map((character,index)=>{const old=currentCharacters[index]||{},copy=Object.keys(character||{}).length?{...character}:{...old};if(old.ifWorld&&(!chosen.has('ifWorld')||!Object.prototype.hasOwnProperty.call(character||{},'ifWorld')))copy.ifWorld=old.ifWorld;if(old.peopleAchievements&&(!chosen.has('peopleAchievements')||!Object.prototype.hasOwnProperty.call(character||{},'peopleAchievements')))copy.peopleAchievements=old.peopleAchievements;if(old.earthTravel&&(!chosen.has('earthTravel')||!Object.prototype.hasOwnProperty.call(character||{},'earthTravel')))copy.earthTravel=old.earthTravel;if(old.growthArchive&&(!chosen.has('growthArchive')||!Object.prototype.hasOwnProperty.call(character||{},'growthArchive')))copy.growthArchive=old.growthArchive;if(old.lifeTimeline&&(!chosen.has('lifeTimeline')||!Object.prototype.hasOwnProperty.call(character||{},'lifeTimeline')))copy.lifeTimeline=old.lifeTimeline;if(old.experienceCharacterId&&!copy.experienceCharacterId)copy.experienceCharacterId=old.experienceCharacterId;if(!onlineTouched&&old.chatSettings)copy.chatSettings=old.chatSettings;if(!offlineTouched&&old.offlineData)copy.offlineData=old.offlineData;if(!chosen.has('offlineActive')&&old.offlineMode!==undefined)copy.offlineMode=old.offlineMode;return copy});
  if(chosen.has('appSettings'))base.settings=incoming.settings||{};
  base.messages=Object.fromEntries(Object.entries(base.messages||{}).flatMap(([key,items])=>{if(!Array.isArray(items))return chosen.has('localFeatures')?[]:[[key,items]];const filtered=items.filter(item=>item?.type==='call-summary'?!chosen.has('videoCalls'):isOnline(key)?!chosen.has('onlineChat'):isOffline(key)?!chosen.has('offlineActive'):!chosen.has('localFeatures'));return filtered.length?[[key,filtered]]:[]}));
  if(chosen.has('onlineChat'))base.invitations={};
  if(chosen.has('sms'))base.smsMessages={};if(chosen.has('forums'))delete base.forums;if(chosen.has('market'))delete base.market;
  if(chosen.has('offlineActive')){base.activeOfflineThreads={};base.offline=false}
  if(chosen.has('offlineStories')||chosen.has('offlineSummaries'))base.offlineRecords=(base.offlineRecords||[]).flatMap(record=>{const out={...record};if(chosen.has('offlineStories'))delete out.messages;if(chosen.has('offlineSummaries'))out.summary='';return out.messages||String(out.summary||'').trim()?[out]:[]});
  base.characters=(base.characters||[]).map((character,index)=>{
   const oldCharacter=currentCharacters[index]||{},copy={...character},incomingCharacter=incoming.characters?.[index]||{},chat=copy.chatSettings||{},memory=chat.memory||{};
   if(chosen.has('ifWorld')&&Object.prototype.hasOwnProperty.call(incomingCharacter,'ifWorld'))copy.ifWorld=JSON.parse(JSON.stringify(incomingCharacter.ifWorld));
   if(chosen.has('peopleAchievements')&&Object.prototype.hasOwnProperty.call(incomingCharacter,'peopleAchievements'))copy.peopleAchievements=JSON.parse(JSON.stringify(incomingCharacter.peopleAchievements));
   if(chosen.has('earthTravel')&&Object.prototype.hasOwnProperty.call(incomingCharacter,'earthTravel'))copy.earthTravel=JSON.parse(JSON.stringify(incomingCharacter.earthTravel));
   if(chosen.has('growthArchive')&&Object.prototype.hasOwnProperty.call(incomingCharacter,'growthArchive'))copy.growthArchive=JSON.parse(JSON.stringify(incomingCharacter.growthArchive));
   if(chosen.has('lifeTimeline')&&Object.prototype.hasOwnProperty.call(incomingCharacter,'lifeTimeline'))copy.lifeTimeline=JSON.parse(JSON.stringify(incomingCharacter.lifeTimeline));
   if(chosen.has('characterProfiles')){if(!onlineTouched&&oldCharacter.chatSettings)copy.chatSettings=oldCharacter.chatSettings;if(!offlineTouched&&oldCharacter.offlineData)copy.offlineData=oldCharacter.offlineData;if(!chosen.has('offlineActive')&&oldCharacter.offlineMode!==undefined)copy.offlineMode=oldCharacter.offlineMode}
   if(chosen.has('onlineSettings')){const keptMemory=onlineTouched?undefined:chat.memory;copy.chatSettings={...(incomingCharacter.chatSettings||{})};if(keptMemory)copy.chatSettings.memory=keptMemory}
   if(chosen.has('onlineSummaries')||chosen.has('onlineMemories')||chosen.has('videoCalls')){const nextMemory={...memory,entries:(memory.entries||[]).filter(entry=>entry?.source==='video-call'?!chosen.has('videoCalls'):!chosen.has('onlineMemories'))};if(chosen.has('onlineSummaries'))for(const key of ['summaryText','summaryThroughRound','summaryUpdatedAt','summaryError'])delete nextMemory[key];copy.chatSettings={...copy.chatSettings,memory:nextMemory}}
   if(chosen.has('offlineActive'))delete copy.offlineMode;
   if(['offlineStories','offlineSummaries','offlineStageMemory','offlineSettings'].some(key=>chosen.has(key))){const offline={...(copy.offlineData||{})};if(chosen.has('offlineStories')||chosen.has('offlineSummaries'))offline.records=(offline.records||[]).flatMap(record=>{const out={...record};if(chosen.has('offlineStories'))delete out.messages;if(chosen.has('offlineSummaries'))out.summary='';return out.messages||String(out.summary||'').trim()?[out]:[]});if(chosen.has('offlineStageMemory'))delete offline.stageMemorySessions;if(chosen.has('offlineSettings')){delete offline.settings;delete offline.lastGeneration}if(Object.keys(offline).length)copy.offlineData=offline;else delete copy.offlineData}
   return copy;
  });
  if(chosen.has('localFeatures')){const known=new Set(['char','user','users','characters','messages','smsMessages','offline','settings','invitations','activeOfflineThreads','offlineRecords','forums','market']);for(const key of Object.keys(base))if(!known.has(key))delete base[key]}
  return merge(base,incoming);
 };
 const PROFILE_IDS=['experienceCharacterId','id','irisMarketId','forumCharacterId','forumPersonaId','irisLifeMemoryId','invitationCharacterId','builtinRole'];
 const asProfile=value=>typeof value==='string'?{name:value}:value||{};
 const findProfile=(list,value)=>{
  const incoming=asProfile(value),conflict=other=>PROFILE_IDS.some(key=>incoming[key]&&other[key]&&incoming[key]!==other[key]);
  const exact=[];list.forEach((value,index)=>{const other=asProfile(value);if(!conflict(other)&&PROFILE_IDS.some(key=>incoming[key]&&incoming[key]===other[key]))exact.push(index)});if(exact.length===1)return exact[0];if(exact.length>1)return-1;
  const matches=[];list.forEach((value,index)=>{const other=asProfile(value);if(conflict(other)||!incoming.name||incoming.name!==other.name)return;if(incoming.birthday&&other.birthday&&incoming.birthday!==other.birthday)return;matches.push(index)});return matches.length===1?matches[0]:-1;
 };
 const alignIncoming=(current,incoming)=>{
  const copy=JSON.parse(JSON.stringify(incoming)),mapPeople=(existing,values)=>{const known=existing.slice(),aligned=existing.map(()=>({})),indices=[];for(const [index,value] of values.entries()){if(!Object.keys(asProfile(value)).length){indices[index]=index;continue}let target=findProfile(known,value);if(target<0){target=known.length;known.push(value)}indices[index]=target;aligned[target]=aligned[target]&&Object.keys(aligned[target]).length?mergeValue(aligned[target],asProfile(value)):asProfile(value)}return{aligned,indices}};
  const roles=mapPeople(current.characters||[],copy.characters||[]),users=mapPeople(current.users||[],copy.users||[]);
  const remap=(index,indices)=>Number.isInteger(index)&&index>=0&&indices[index]!==undefined?indices[index]:index;
  const thread=key=>{const match=String(key).match(/^(-?\d+)-(-?\d+)(.*)$/);return match?`${remap(Number(match[1]),roles.indices)}-${remap(Number(match[2]),users.indices)}${match[3]}`:key};
  const walk=value=>{if(Array.isArray(value))return value.map(walk);if(!value||typeof value!=='object')return value;const result={};for(const [key,item] of Object.entries(value)){if(['roleIndex','characterIndex'].includes(key))result[key]=remap(item,roles.indices);else if(['userIndex','onlineUserIndex'].includes(key))result[key]=remap(item,users.indices);else if(['threadKey','sourceThreadKey','offlineThreadKey'].includes(key)&&typeof item==='string')result[key]=thread(item);else result[key]=walk(item)}return result};
  const result=walk(copy);result.characters=roles.aligned.map(walk);result.users=users.aligned.map(walk);
  for(const key of ['messages','smsMessages','activeOfflineThreads'])if(copy[key])result[key]=Object.fromEntries(Object.entries(copy[key]).map(([name,value])=>[thread(name),key==='activeOfflineThreads'&&typeof value==='string'?thread(value):walk(value)]));
  if(Number.isInteger(copy.char))result.char=remap(copy.char,roles.indices);if(Number.isInteger(copy.user))result.user=remap(copy.user,users.indices);return result;
 };
 const mergeTimeline=(current,incoming)=>{
  if(current.ownerId&&incoming.ownerId&&current.ownerId!==incoming.ownerId)throw Error('人生经历归属不一致，已停止恢复。');
  const entries=(current.entries||[]).slice(),indices=new Map(entries.map((entry,index)=>[entry.id,index]));for(const entry of incoming.entries||[]){const index=indices.get(entry.id);if(index===undefined){indices.set(entry.id,entries.length);entries.push(entry)}else if(Number(entry.updatedAt||0)>Number(entries[index].updatedAt||0))entries[index]=entry}
  return{...current,...incoming,entries};
 };
 const mergeValue=(current,incoming,key='')=>{
  if(key==='ifWorld'&&current&&incoming){if(current.ownerId!==incoming.ownerId)throw Error('IF 世界归属不一致，已停止恢复。');const mergeRecords=(a=[],b=[])=>{const records=new Map(a.map(r=>[r.id,r]));for(const record of b){const old=records.get(record.id);if(!old||Number(record.updatedAt||record.createdAt||0)>Number(old.updatedAt||old.createdAt||0))records.set(record.id,record)}return [...records.values()]};return{...current,...incoming,branches:mergeRecords(current.branches,incoming.branches),dreams:mergeRecords(current.dreams,incoming.dreams),archives:mergeRecords(current.archives,incoming.archives)}}
  if(key==='growthArchive'&&current&&incoming){if(current.ownerId!==incoming.ownerId)throw Error('成长档案归属不一致，已停止恢复。');const stages=(current.stages||[]).slice();for(const stage of incoming.stages||[]){const index=stages.findIndex(value=>value.id===stage.id);if(index<0)stages.push(stage);else if((stages[index].isTemplate&&!stage.isTemplate)||(!(stage.isTemplate&&!stages[index].isTemplate)&&Number(stage.updatedAt||0)>Number(stages[index].updatedAt||0)))stages[index]=stage}return{...(Number(incoming.updatedAt||0)>Number(current.updatedAt||0)?incoming:current),stages}}
  if(key==='peopleAchievements'&&current&&incoming){if(current.ownerId!==incoming.ownerId)throw Error('人物与成就归属不一致。');const out={...current,deleted:{}};for(const kind of ['npcs','reviews','awards']){const dead=new Map();for(const r of [...(current.deleted?.[kind]||[]),...(incoming.deleted?.[kind]||[])])if(!dead.has(r.id)||r.deletedAt>dead.get(r.id).deletedAt)dead.set(r.id,r);const records=new Map();for(const r of [...current[kind],...incoming[kind]])if(!records.has(r.id)||r.updatedAt>records.get(r.id).updatedAt)records.set(r.id,r);out[kind]=[...records.values()].filter(r=>!dead.has(r.id)||dead.get(r.id).deletedAt<r.updatedAt);out.deleted[kind]=[...dead.values()]}out.reviews=out.reviews.filter(r=>out.npcs.some(n=>n.id===r.npcId));return out}
  if(key==='earthTravel'&&current&&incoming){if(current.ownerId!==incoming.ownerId)throw Error('地球地图归属不一致');const routes=current.routes.slice();for(const r of incoming.routes){const i=routes.findIndex(x=>x.id===r.id);if(i<0)routes.push(r);else if(Number(r.updatedAt||0)>Number(routes[i].updatedAt||0))routes[i]=r}return{...current,...incoming,routes,questions:[...new Set([...current.questions,...incoming.questions])]}}
  if(key==='lifeTimeline'&&current&&incoming)return mergeTimeline(current,incoming);
  if((key==='users'||key==='characters')&&Array.isArray(current)&&Array.isArray(incoming)){const out=current.slice();incoming.forEach((value,index)=>{out[index]=index<out.length?mergeValue(out[index],value):value});return out}
  if(Array.isArray(current)&&Array.isArray(incoming))return union(current,incoming);
  if(current&&incoming&&typeof current==='object'&&typeof incoming==='object'&&!Array.isArray(current)&&!Array.isArray(incoming)){
   const out={...current};for(const[childKey,value]of Object.entries(incoming))out[childKey]=childKey in current?mergeValue(current[childKey],value,childKey):value;return out;
  }
  if(typeof current==='string'&&incoming&&typeof incoming==='object'&&Object.keys(incoming).length===0)return current;
  return incoming;
 };
 const merge=(current,incoming,key='')=>mergeValue(current,key===''&&(Array.isArray(incoming?.characters)||Array.isArray(incoming?.users))?alignIncoming(current,incoming):incoming,key);
 return{FORMAT,VERSION,CATEGORIES,canonical,counts,digest,make,validate,merge,select,selectCategories,replaceScope,replaceCategories,replaceCategorySet,zip,unzip};
});
