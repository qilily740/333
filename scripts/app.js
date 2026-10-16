const $=s=>document.querySelector(s);
const paths={plus:'<path d="M12 5v14M5 12h14"/>',write:'<path d="m16 3 5 5-12 12H4v-5L16 3Z"/><path d="m13 6 5 5"/>',offline:'<path d="M4 21V8l8-5 8 5v13M9 21v-7h6v7M8 9h.01M16 9h.01"/>',user:'<circle cx="12" cy="8" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>',arrow:'<path d="m9 5 7 7-7 7"/>',send:'<path d="m12 19 0-14m-6 6 6-6 6 6"/>',reply:'<path d="M20 10a8 8 0 1 0-2 8M20 4v6h-6"/>',smile:'<circle cx="12" cy="12" r="9"/><path d="M8 14s1 3 4 3 4-3 4-3M8 9h.01M16 9h.01"/>',play:'<path d="m8 5 11 7-11 7V5Z"/>',pause:'<path d="M8 5v14M16 5v14"/>',palette:'<circle cx="12" cy="12" r="8"/><path d="M12 4v16"/>',online:'<path d="m9 5-6 6 6 6M3 11h11a6 6 0 0 1 6 6v3"/>',music:'<path d="M9 18V5l11-2v13M9 9l11-2"/><ellipse cx="6" cy="18" rx="3" ry="3"/><ellipse cx="17" cy="16" rx="3" ry="3"/>',book:'<path d="M12 5v16M12 5C8 2 3 4 3 4v15s5-2 9 2c4-4 9-2 9-2V4s-5-2-9 1Z"/>',transfer:'<path d="M3 8h18l-4-4M21 16H3l4 4"/>',mic:'<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3m-4 0h8"/>',video:'<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3z"/>' ,image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m21 15-5-5L5 20"/>',location:'<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>'};
const icon=n=>`<svg viewBox="0 0 24 24" aria-hidden="true">${paths[n]||paths.plus}</svg>`;
Object.assign(paths,{
 save:'<path d="M5 3h12l4 4v14H3V3h2Z"/><path d="M7 3v6h10V3M7 21v-7h10v7"/>',
 trash:'<path d="M4 7h16M10 11v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3"/>',
 clearChat:'<path d="M11 18H8l-5 3V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v4M7 8h10M7 12h5"/><path d="m15 14 6 6m0-6-6 6"/>',
 block:'<circle cx="8" cy="6" r="3"/><path d="M2 20v-2a6 6 0 0 1 8-5.66"/><circle cx="17" cy="17" r="4.5"/><path d="m13.82 13.82 6.36 6.36"/>',
 userX:'<circle cx="8" cy="6" r="3"/><path d="M2 20v-2a6 6 0 0 1 8-5.66M15 14l6 6m0-6-6 6"/>'
});
function bindProfileDetailsAutoGrow(textarea){
 if(!textarea)return;
 const resize=(expanded=true)=>{if(!expanded){textarea.style.height='51px';textarea.style.overflowY='hidden';return}textarea.style.height='auto';const maxHeight=280,contentHeight=textarea.scrollHeight;textarea.style.height=`${Math.min(maxHeight,Math.max(150,contentHeight))}px`;textarea.style.overflowY=contentHeight>maxHeight?'auto':'hidden'};
 textarea.addEventListener('focus',()=>resize(true));
 textarea.addEventListener('input',()=>resize(true));
 textarea.addEventListener('blur',()=>resize(false));
}
paths.settings='<path d="M4 7h16M4 17h16M8 4v6m8 4v6"/><circle cx="8" cy="7" r="2"/><circle cx="16" cy="17" r="2"/>';
paths.save='<path d="M5 4h12l3 3v13H4V4h1Z"/><path d="M8 4v6h8V4M8 20v-6h8v6"/>';
paths.retry='<path d="M19.5 8.5A8 8 0 1 0 20 14"/><path d="M19.5 3.5v5h-5"/>';
paths.respond='<path d="m9 5-5 5 5 5"/><path d="M4 10h9a7 7 0 0 1 7 7v2"/>';
paths.previous='<path d="m15 5-7 7 7 7"/>';
paths.next='<path d="m9 5 7 7-7 7"/>';
paths.cameraFlip='<path d="M8 5 9.5 3h5L16 5h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3Z"/><path d="M8 11a4.5 4.5 0 0 1 7.5-1L17 12m0-3v3h-3M16 15a4.5 4.5 0 0 1-7.5 1L7 14m0 3v-3h3"/>';
paths.dockStory='<circle cx="8" cy="7.5" r="2.5"/><circle cx="16.5" cy="8.5" r="2"/><path d="M3.5 19v-2a4.5 4.5 0 0 1 9 0v2M15 13a4 4 0 0 1 5.5 3.7V19"/>';
paths.dockChat='<path d="M13 4.5H7A2.5 2.5 0 0 0 4.5 7v10A2.5 2.5 0 0 0 7 19.5h10a2.5 2.5 0 0 0 2.5-2.5v-6"/><path d="m11 13 1-4 6.3-6.3a1.4 1.4 0 0 1 2 2L14 11l-3 2ZM16.5 4.5l2 2"/>';
paths.dockProfile='<circle cx="12" cy="8" r="3.25"/><path d="M5 20v-1.5a7 5.5 0 0 1 14 0V20"/>';
paths.dockPlus='<path d="M12 5v14M5 12h14"/>';
paths.dockWorldBook='<path d="M12 5.5C9.5 3.8 6.2 3.8 3.5 5v14c2.7-1.2 6-1.2 8.5.5 2.5-1.7 5.8-1.7 8.5-.5V5c-2.7-1.2-6-1.2-8.5.5Z"/><path d="M12 6v13.5M6.5 8.5c1.3-.4 2.7-.3 4 .2M6.5 12c1.3-.4 2.7-.3 4 .2m7-3.7c-1.3-.4-2.7-.3-4 .2m4 3.1c-1.3-.4-2.7-.3-4 .2"/>';
paths.dockBeautify='<path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/>';
paths.dockForum='<path d="M4 5.5h11a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H9l-4.5 3v-3.6A3 3 0 0 1 2.5 12.5v-4a3 3 0 0 1 1.5-3Z"/><path d="M10 5.5v-1A2.5 2.5 0 0 1 12.5 2h6A2.5 2.5 0 0 1 21 4.5v5a2.5 2.5 0 0 1-2 2.45M6.5 9h6M6.5 12h4"/>';
paths.dockMarket='<path d="M4 9.5h16l-1.2-5H5.2L4 9.5Z"/><path d="M5 9.5V20h14V9.5M9 20v-6h6v6M4 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0"/>';
paths.dockBusiness='<circle cx="12" cy="12" r="9"/><path d="M12 6v12m3-9.5c-.7-.8-1.7-1.2-3-1.2-1.7 0-3 .9-3 2.3 0 3.6 6 1.5 6 4.9 0 1.4-1.2 2.5-3 2.5-1.3 0-2.4-.5-3.2-1.4"/>';
paths.dockSms='<path d="M5 4.5h14A2.5 2.5 0 0 1 21.5 7v8a2.5 2.5 0 0 1-2.5 2.5h-7l-5.5 3v-3A2.5 2.5 0 0 1 4 15V7a2.5 2.5 0 0 1 1-2.5Z"/><path d="M8 9h8M8 13h5"/>';
const headerChars=[{name:'char 01',initial:'c',desc:'',color:'#d4d4d4'},{name:'char 02',initial:'h',desc:'',color:'#ababab'},{name:'char 03',initial:'a',desc:'',color:'#737373'},{name:'char 04',initial:'r',desc:'',color:'#292929'}];
let state={char:-1,user:-1,users:[],characters:[],messages:{},smsMessages:{},offline:false};try{Object.assign(state,window.IRIS_BOOT_STATE||JSON.parse(localStorage.getItem('iris-v1')||'{}'))}catch{};
state.smsMessages=state.smsMessages&&typeof state.smsMessages==='object'?state.smsMessages:{};
state.invitations=state.invitations&&typeof state.invitations==='object'?state.invitations:{};
state.activeOfflineThreads=state.activeOfflineThreads&&typeof state.activeOfflineThreads==='object'?state.activeOfflineThreads:{};
for(const invite of Object.values(state.invitations))if(invite?.status==='generating'){invite.status='generation_failed';invite.updatedAt=Date.now();if(invite.offlineThreadKey&&!state.messages?.[invite.offlineThreadKey]?.length)delete state.messages[invite.offlineThreadKey];delete invite.offlineThreadKey}
state.users=(Array.isArray(state.users)?state.users:[]).map(u=>typeof u==='string'?{name:u,nickname:'',gender:'',birthday:'',details:'',avatar:''}:{name:'',nickname:'',gender:'',birthday:'',details:'',avatar:'',...u}).filter(u=>!['我','另一个我'].includes(u.name));
const chars=(Array.isArray(state.characters)?state.characters:[]).filter(c=>!/^char 0[1-4]$/i.test(c.name||''));
state.characters=chars;
state.char=chars.length?Math.max(0,Math.min(state.char,chars.length-1)):-1;
state.user=state.users.length?Math.max(0,Math.min(state.user,state.users.length-1)):-1;
const initialRoleUser=chars[state.char]?.chatSettings?.userIndex;if(Number.isInteger(initialRoleUser)&&state.users[initialRoleUser])state.user=initialRoleUser;
state.settings={apiUrl:'',apiKey:'',apiModel:'',keepAlive:false,offlineSurface:'#f4f4f4',surface:'#f4f4f4',timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,onlineUserIndex:null,emojiPack:'soft',bilingualTranslation:false,translationLanguage:'English',memorySummaryEnabled:true,memorySummary:'',beautifyCss:{},beautifyBackgrounds:{online:'',offline:''},...(state.settings||{})};
if(!state.settings.beautifyCss||typeof state.settings.beautifyCss!=='object'||Array.isArray(state.settings.beautifyCss))state.settings.beautifyCss={};
if(!state.settings.beautifyBackgrounds||typeof state.settings.beautifyBackgrounds!=='object'||Array.isArray(state.settings.beautifyBackgrounds))state.settings.beautifyBackgrounds={online:'',offline:''};
state.settings.apiConfigs=Array.isArray(state.settings.apiConfigs)?state.settings.apiConfigs:[];
if(!state.settings.apiConfigs.length&&(state.settings.apiUrl||state.settings.apiKey||state.settings.apiModel))state.settings.apiConfigs.push({id:'legacy-api',name:'Default',url:state.settings.apiUrl,key:state.settings.apiKey,model:state.settings.apiModel});
state.settings.apiConfigs=state.settings.apiConfigs.map(config=>({...config,models:Array.isArray(config.models)?config.models.filter(model=>typeof model==='string'):(config.model?[config.model]:[])}));
state.settings.activeApiConfigId=state.settings.apiConfigs.some(config=>config.id===state.settings.activeApiConfigId)?state.settings.activeApiConfigId:(state.settings.apiConfigs[0]?.id||'');
state.settings.apiFeatureRoutes=state.settings.apiFeatureRoutes&&typeof state.settings.apiFeatureRoutes==='object'?state.settings.apiFeatureRoutes:{};
state.settings.apiFeatureModels=state.settings.apiFeatureModels&&typeof state.settings.apiFeatureModels==='object'?state.settings.apiFeatureModels:{};
const nativeApiFetch=window.fetch.bind(window);
function apiConfigForFeature(feature){const settings=state.settings,routes=settings.apiFeatureRoutes||{},ownRoute=settings.apiConfigs.find(config=>config.id===routes[feature]),inheritsChatRoute=['forum','market','business','reading'].includes(feature)&&!ownRoute,chatRoute=inheritsChatRoute?settings.apiConfigs.find(config=>config.id===routes.onlineChat):null;return ownRoute||chatRoute||settings.apiConfigs.find(config=>config.id===settings.activeApiConfigId)||settings.apiConfigs[0]||null}
function apiModelForFeature(feature,config=apiConfigForFeature(feature)){const settings=state.settings,routes=settings.apiFeatureRoutes||{},hasOwnRoute=settings.apiConfigs.some(item=>item.id===routes[feature]),inheritsChatModel=['forum','market','business','reading'].includes(feature)&&!hasOwnRoute,selected=settings.apiFeatureModels?.[feature]||(inheritsChatModel?settings.apiFeatureModels?.onlineChat:'');const models=Array.isArray(config?.models)?config.models:[];return selected&&models.includes(selected)?selected:(config?.model||models[0]||'')}
function firstRoutedApiConfigId(){const routes=state.settings.apiFeatureRoutes||{};for(const feature of ['onlineChat','offlineStory','onlineSummary','offlineSummary','videoCall','callSummary','sms','forum','market','business','reading']){const id=routes[feature];if(state.settings.apiConfigs.some(config=>config.id===id))return id}return''}
function zonedDateTime(date,zone){try{return new Intl.DateTimeFormat('zh-CN',{timeZone:zone,year:'numeric',month:'long',day:'numeric',weekday:'long',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(date)}catch{return new Intl.DateTimeFormat('zh-CN',{year:'numeric',month:'long',day:'numeric',weekday:'long',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(date)}}
function localCalendarDate(date=new Date()){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:localTimezone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date),value=type=>parts.find(part=>part.type===type)?.value||'00';return`${value('year')}-${value('month')}-${value('day')}`}
let dailyCalendarLookupPromise=null;
async function fetchDailyHolidayContext(api,model,date){
 let parsed;try{parsed=new URL(api.url)}catch{return{status:'unsupported'}}
 const prompt=`请联网核验中国大陆 ${date} 是否为法定节假日、节假日调休日期或正常工作日。优先查询国务院、国务院办公厅及其他中国政府网（gov.cn）官方公告；只根据官方来源作答，不要依模型记忆推断。用中文简短说明日期、节日或调休性质；如果找不到可核验的官方来源，只输出 NO_VERIFIED_OFFICIAL_RESULT。不要写问候或额外建议。`;
 let answer='',sourceUrls=[];
 if(parsed.hostname.toLowerCase()==='api.openai.com'){
  const clean=api.url.replace(/\/+$/,'').replace(/\/chat\/completions$/,'');const endpoint=/\/v\d+$/i.test(clean)?`${clean}/responses`:`${clean}/v1/responses`;
  const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${api.key}`},body:JSON.stringify({model,tools:[{type:'web_search',search_context_size:'low',filters:{allowed_domains:['gov.cn']}}],tool_choice:'required',include:['web_search_call.action.sources'],input:prompt})});
  if(!response.ok)throw Error(`search request failed (${response.status})`);const result=await response.json();
  answer=String(result.output_text||'').trim();
  for(const item of result.output||[]){for(const source of item.action?.sources||[])if(source.url)sourceUrls.push(source.url);for(const part of item.content||[])for(const annotation of part.annotations||[]){const citation=annotation.url_citation||annotation;if(citation.url)sourceUrls.push(citation.url)}}
 }else if(parsed.hostname.toLowerCase()==='generativelanguage.googleapis.com'){
  const modelId=String(model||'').replace(/^models\//,'');if(!modelId)return{status:'unsupported'};
  const endpoint=`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelId)}:generateContent`;
  const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':api.key},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],tools:[{google_search:{}}],generationConfig:{temperature:0.1,maxOutputTokens:220}})});
  if(!response.ok)throw Error(`search request failed (${response.status})`);const result=await response.json(),candidate=result.candidates?.[0];
  answer=(candidate?.content?.parts||[]).map(part=>part.text||'').join('\n').trim();sourceUrls=(candidate?.groundingMetadata?.groundingChunks||[]).map(chunk=>chunk.web?.uri).filter(Boolean);
 }else return{status:'unsupported'};
 const officialSources=[...new Set(sourceUrls)].filter(url=>{try{return new URL(url).hostname.toLowerCase().endsWith('.gov.cn')}catch{return false}});
 if(!answer||/NO_VERIFIED_OFFICIAL_RESULT/i.test(answer)||!officialSources.length)return{status:'unverified'};
 return{status:'ready',date,text:answer.replace(/\s+/g,' ').slice(0,360),sources:officialSources.slice(0,4)};
}
async function ensureDailyHolidayContext(api,model){
 const date=localCalendarDate(),saved=state.settings.dailyHolidayContext;
 if(saved?.date===date&&saved.status!=='checking')return saved;
 if(dailyCalendarLookupPromise)return dailyCalendarLookupPromise;
 if(saved?.date===date&&saved.status==='checking'&&Date.now()-(Number(saved.attemptedAt)||0)<5*60*1000)return saved;
 const pending={date,status:'checking',attemptedAt:Date.now()};state.settings.dailyHolidayContext=pending;save();
 dailyCalendarLookupPromise=(async()=>{try{const result=await fetchDailyHolidayContext(api,model,date);state.settings.dailyHolidayContext={...pending,...result,checkedAt:Date.now()}}catch{state.settings.dailyHolidayContext={...pending,status:'unavailable',checkedAt:Date.now()}}save();return state.settings.dailyHolidayContext})();
 try{return await dailyCalendarLookupPromise}finally{dailyCalendarLookupPromise=null}
}
async function actualTimePromptContext(api,model,thread,more,online=false){
 const timeEnabled=more.timeAwarenessEnabled!==false,holidayEnabled=more.holidayAwarenessEnabled===true||(more.holidayAwarenessEnabled===undefined&&more.actualTimeEnabled===true);
 const userZone=more.timezoneEnabled?more.userTimezone:localTimezone,characterZone=more.timezoneEnabled?more.characterTimezone:localTimezone;
 const pieces=[];
 if(timeEnabled){
  const latestUserIndex=thread.map(item=>item.mine).lastIndexOf(true),latestUser=thread[latestUserIndex],previousMessage=latestUserIndex>0?thread.slice(0,latestUserIndex).reverse().find(item=>Number(item.createdAt)):null;
  if(previousMessage&&Number(latestUser?.createdAt)){const gap=Math.max(0,Number(latestUser.createdAt)-Number(previousMessage.createdAt));if(gap>=10*60*1000){const minutes=Math.floor(gap/60000),hours=Math.floor(minutes/60),days=Math.floor(hours/24),remainder=hours%24,elapsed=days?`${days} 天${remainder?` ${remainder} 小时`:''}`:hours?`${hours} 小时${minutes%60?` ${minutes%60} 分钟`:''}`:`${minutes} 分钟`;pieces.push(`用户这条消息距离上一条实际聊天消息约 ${elapsed}。这是两条记录之间的现实间隔，不代表用户在这段时间里做了什么；可结合角色性格自然承接，但不得编造用户空档期间的经历、行为或心理。`)}}
  const now=new Date();
  pieces.push(online?`本轮线上聊天时间统一使用现实用户所在地的时区：${zonedDateTime(now,userZone)}（${userZone}）。读取设备当前时钟，不取聊天记录时间；线上消息时间戳也全部按此时区理解。不要混用角色所在地时间，不要取整或推测。`:`本轮请求发起时的现实时间（读取设备当前时钟，不取聊天记录时间）：用户所在地 ${zonedDateTime(now,userZone)}（${userZone}）；角色所在地 ${zonedDateTime(now,characterZone)}（${characterZone}）。时间以此处为准，不要沿用旧消息时间，也不要取整或推测。`);
  pieces.push('只在对话确实相关时自然参考时间，不要每轮报时。');
 }
 if(holidayEnabled){const holidayDate=localCalendarDate(),calendar=await ensureDailyHolidayContext(api,model);if(calendar?.status==='ready')pieces.push(`中国大陆日期 ${holidayDate} 的节假日与调休（已联网查询并核对政府来源）：${calendar.text}`);else pieces.push(`中国大陆日期 ${holidayDate} 的节假日与调休未能通过官方来源核实；不要猜测或声称当天是特定节日。`);pieces.push('不要把日期信息扩写成天气、新闻或其他未提供的实时事实。')}
 return pieces.length?`【现实时间感知】\n${pieces.join('\n')}`:'';
}
async function fetchApiModelList(baseUrl,key){
 const normalized=String(baseUrl||'').trim().replace(/\/+$/,'');if(!normalized)throw Error('请先填写 API 地址。');
 let parsed;try{parsed=new URL(normalized)}catch{throw Error('API 地址格式不正确。')}
 const host=parsed.hostname.toLowerCase(),isGemini=host==='generativelanguage.googleapis.com',isAnthropic=host==='api.anthropic.com';
 const path=parsed.pathname.replace(/\/+$/,'');let endpoint;
 if(isGemini&&!/\/openai(?:\/|$)/i.test(path)){
  endpoint=/\/models$/i.test(path)?parsed.toString():`${parsed.origin}${path==='/'||path==='/v1'?'/v1beta/models':path.endsWith('/v1beta')?`${path}/models`:`${path}/models`}`;
 }else endpoint=/\/models$/i.test(path)?parsed.toString():`${parsed.origin}${isAnthropic&&(!path||path==='/')?'/v1/models':path==='/v1'?'/v1/models':`${path}/models`}`;
 const attempts=[];
 if(isGemini&&!/\/openai(?:\/|$)/i.test(path)){
  attempts.push({url:endpoint,headers:key?{'x-goog-api-key':key}:{},label:'Gemini API Key'});
  if(key){const withQuery=new URL(endpoint);withQuery.searchParams.set('key',key);attempts.push({url:withQuery.toString(),headers:{},label:'Gemini key 参数'})}
 }else if(isAnthropic){
  attempts.push({url:endpoint,headers:key?{'x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'}:{'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},label:'Anthropic API Key'});
 }else{attempts.push({url:endpoint,headers:key?{Authorization:`Bearer ${key}`}:{},label:'Bearer API Key'});if(key){attempts.push({url:endpoint,headers:{'x-api-key':key},label:'x-api-key'});attempts.push({url:endpoint,headers:{'api-key':key},label:'api-key'})}}
 let lastError;
 for(const attempt of attempts){
  let response;try{response=await nativeApiFetch(attempt.url,{headers:attempt.headers})}catch(error){throw Error(`无法连接模型列表接口（${new URL(attempt.url).host}）。可能是跨域限制或网络错误：${error.message||'请求失败'}`)}
  if(response.ok){let result;try{result=await response.json()}catch{throw Error('接口已响应，但返回内容不是有效 JSON。')}const items=Array.isArray(result)?result:(result.data||result.models||result.result?.models||[]),models=[...new Set(items.map(item=>typeof item==='string'?item:(item.id||item.name)).filter(Boolean).map(String))];if(!models.length)throw Error('接口响应成功，但没有找到可用模型。');return{models,endpoint:attempt.url,label:attempt.label}}
  let detail='';try{const body=await response.text();if(body){try{const parsedBody=JSON.parse(body);detail=parsedBody.error?.message||parsedBody.message||body}catch{detail=body}detail=String(detail).replace(/\s+/g,' ').slice(0,220)}}catch{}
  lastError=Error(`模型列表请求失败（${response.status}，${attempt.label}）${detail?`：${detail}`:''}`);
  if(response.status!==401&&response.status!==403)break;
 }
 throw lastError||Error('模型列表请求失败。');
}
state.offlineRecords=Array.isArray(state.offlineRecords)?state.offlineRecords:[];delete state.offlinePresets;delete state.activeOfflinePresetId;
state.emojis=state.emojis&&typeof state.emojis==='object'?state.emojis:{groups:[]};
state.emojis.groups=(Array.isArray(state.emojis.groups)?state.emojis.groups:[]).map(group=>({...group,id:String(group.id||`emoji-${Math.random().toString(36).slice(2,9)}`),name:String(group.name||'未命名分组'),items:(Array.isArray(group.items)?group.items:[]).map(item=>({...item,id:String(item.id||`sticker-${Math.random().toString(36).slice(2,9)}`),url:String(item.url||''),text:String(item.text||'表情包')}))}));
const cloneData=value=>JSON.parse(JSON.stringify(value));
const offlineWritingStyles = {
    natural: { name:'自然细腻 · 日常 · 含蓄', description:'让情绪藏在行动、物件和日常细节里。只写当前视角能感知的内容，少直接命名情绪；句子随场景节奏变化，每段都推动关系或事件发生一点变化。', prompt:'[CRAFT REFERENCES] Draw only on broad, non-copying techniques: Wang Zengqi\'s use of food, objects, weather, and local routines to make a setting credible, with feeling carried by what people do; and Chekhov\'s use of hesitation, self-correction, ineffective gestures, and material circumstances to reveal contradiction without diagnosing the character. [BLENDING METHOD] Select two or three concrete details already present in the scene, then let action and dialogue change the relationship. Narrate only what the viewpoint character can presently perceive. Do not name an emotion when behavior can carry it. Vary sentence length with the speed of action. End on a specific change that remains open to response.' },
    cinematic: { name:'电影感 · 空间 · 动作', description:'先交代人物位置、空间关系和关键物件，再用连续动作、对白与现场变化推进。紧张时收短句子，安静时放慢观察；不写镜头术语，也不重复解释读者已经看见的动作。', prompt:'[CRAFT REFERENCES] Draw only on broad, non-copying techniques: the distance between surface dialogue and actual intent in Hemingway\'s Hills Like White Elephants, where pauses and evasions carry crucial information; and the clear blocking, physical action, and object states used to propel scenes in Dashiell Hammett\'s The Maltese Falcon. [BLENDING METHOD] Establish the positions of people, exits, and consequential objects, then alternate action, dialogue, and environmental consequence. Use shorter sentences under pressure and longer observation during quiet intervals. Never use camera terminology. Do not explain what the visible action has already established. [ORIGINAL DEMONSTRATION — NEVER COPY OR PARAPHRASE] The lock clicked twice. Fang Yikai did not turn around. He slid the second cup behind the newspaper.' },
    literary: { name:'文学抒情 · 感官 · 克制', description:'以克制的感官细节和稀疏意象承接人物感受。联想可以短暂打开记忆，但要回到当前场景；意象必须来自真实存在的事物，并参与情节或关系变化，不空泛议论主题。', prompt:'[CRAFT REFERENCES] Draw only on broad, non-copying techniques: Shen Congwen\'s integration of landscape, daily order, and human fate in Border Town; Calvino\'s structural repetition and light conceptual architecture in Invisible Cities; and Virginia Woolf\'s close sensory attention, where a present object briefly opens memory before returning to the room. [BLENDING METHOD] Images must come from objects that truly exist in the current scene and must later affect meaning or action. Perception and memory may briefly overlap, but narration must promptly return to physical space and ongoing action. Keep figurative language sparse. Never announce a theme or moral. [ORIGINAL DEMONSTRATION — NEVER COPY OR PARAPHRASE] At the sixth bell, Su Qian folded the letter along its old crease. The umbrellas below had dispersed; the cut left by the paper still marked her finger.' },
    concise: { name:'克制简洁 · 精准 · 留白', description:'优先准确动词和具体名词，删去不改变意思的修饰。每段完成一个动作或交流，不重复已知信息；对白可以短，但要有明确对象和作用，沉默也要带来可见后果。', prompt:'[CRAFT REFERENCES] Draw only on broad, non-copying techniques: Hemingway\'s omission of explanation so facts, actions, and dialogue carry subtext; and Raymond Carver\'s use of kitchens, bills, ashtrays, and unfinished speech to create relational pressure. [BLENDING METHOD] Prefer exact verbs and concrete nouns. Remove modifiers that do not change meaning. Each paragraph completes one action or exchange without restating known information. Dialogue may be brief, but it needs a clear addressee and immediate purpose. Silence must be shown through an interrupted action, an unanswered question, or unfinished work. [ORIGINAL DEMONSTRATION — NEVER COPY OR PARAPHRASE] He finished reading the bill and placed his phone facedown. “Next month.” The refrigerator stopped humming. The tap continued to drip.' },
    suspense: { name:'悬疑紧张 · 线索 · 压迫', description:'控制线索出现的先后，让普通细节逐渐改变含义。每段落下一条可核实的信息，压力来自选择变少和事实冲突；误导必须能回看解释，不靠夸张情绪或突然揭底。', prompt:'[CRAFT REFERENCES] Draw only on broad, non-copying techniques: Agatha Christie\'s control over the order of clues, allowing ordinary details to acquire new meaning later; Borges\'s use of catalogues, maps, mirrored structures, and branching time; and Edgar Allan Poe\'s accumulation of pressure through enclosed spaces, recurring sounds, and altered objects. [BLENDING METHOD] Add only one verifiable fact per paragraph. Clues must arise from behavior, spatial change, object state, or conflicting testimony. Misdirection must remain retrospectively explainable; never invent the answer at the reveal. Fear should grow from narrowing choices, not exaggerated emotional vocabulary. [ORIGINAL DEMONSTRATION — NEVER COPY OR PARAPHRASE] The roster showed that no one entered the archive overnight. Fang Yikai turned it over. His signature appeared beside 3:00 a.m., and the ink had not dried.' },
    daily: { name:'生活流 · 日常 · 关系', description:'围绕吃饭、出行、做事和日常停顿展开。关系变化落在称呼、分工、回避、玩笑与小摩擦里；对白可以绕开重点或自我修正，但不把琐事堆成流水账。', prompt:'[CRAFT REFERENCES] Draw only on broad, non-copying techniques: Wang Zengqi\'s attention to food, seasons, and practiced hands; Lao She\'s dialogue shaped by profession, social position, and relational distance; and Jane Austen\'s judgments, misunderstandings, and social calibration beneath polite speech. [BLENDING METHOD] Build scenes around meals, travel, errands, tidying, and pauses in work. Let relationships shift through forms of address, division of labor, avoidance, jokes, and minor friction. Dialogue may pause, self-correct, or answer sideways. Do not manufacture quotable aphorisms. [ORIGINAL DEMONSTRATION — NEVER COPY OR PARAPHRASE] Su Qian said she did not eat breakfast. Ten minutes later, she took half a slice of toast from Fang Yikai\'s plate. He moved the jam toward her without comment.' },
    humidNarrative: { name:'潮湿叙事 · 余韵 · 体感', description:'让情绪在日常关系和行为后果中停留、发酵；用具体生活与身体感受承载亲密和摩擦，不靠天气意象或反复解释情绪。', prompt:"[CRAFT REFERENCES]\nDraw only on broad, non-copying literary techniques: Lai Hsiang-yin's emotional aftermath and the persistence of unresolved attachment in The Aftermath; Chu T'ien-hsin's treatment of urban memory, familiar spaces, and estrangement in The Old Capital; Wu Ming-yi's attention to physical environments, sensory experience, and material reality in The Man with the Compound Eyes; and Li Ang's exploration of bodily experience, desire, repression, and unequal relationships in The Butcher's Wife. Borrow narrative principles rather than distinctive language, imagery, plots, or sentence structures. Blend these influences into an original form of emotionally humid realism.\n\n[HUMIDITY PRINCIPLE]\nHumidity must exist in emotion before it appears in weather. Let affection linger with resentment, longing with embarrassment, tenderness with impatience, and desire with self-protection. Feelings need not disappear when their immediate cause has passed. A conversation may end while its emotional consequences continue through ordinary behavior. Preserve the uncomfortable persistence of feelings without repeatedly naming or explaining them.\n\n[BLENDING METHOD]\nBuild scenes through ordinary life: meals, errands, commuting, shared spaces, unfinished chores, inconvenient encounters, and familiar routines. Let relationships change through forms of address, practical obligations, remembered habits, withheld assistance, delayed responses, minor selfishness, and imperfect kindness. Combine environmental realism with emotional tension, allowing intimate contradictions to emerge through actual events rather than decorative introspection.\n\n[EMOTIONAL RESIDUE]\nAn unresolved feeling should influence subsequent choices. A careless remark may change how someone accepts help, answers a question, or behaves during an otherwise ordinary activity. Characters may retain hurt, jealousy, affection, shame, or resentment without consciously recognizing every cause. Emotional continuity must appear through altered behavior and judgment, not recurring declarations of sadness or longing.\n\n[RELATIONAL FRICTION]\nTreat intimacy as a continuous negotiation between attachment and independence. People may care deeply while behaving unfairly, refusing help, protecting their pride, or making selfish decisions. Allow affection, irritation, possessiveness, embarrassment, and dependence to coexist when consistent with character. Do not romanticize every conflict or force emotional contradictions into reconciliation, punishment, or personal growth.\n\n[ENVIRONMENTAL REALISM]\nUse the material specificity of subtropical life when appropriate: heat retained by concrete, damp clothing, slow-drying laundry, condensation, crowded interiors, ordinary food, or the physical discomfort of humidity. Environmental details must arise from the actual location, season, and circumstances. Never insert rain, mist, moisture, or tropical imagery merely to signal emotional depth. The writing must remain emotionally humid even in a dry room beneath a clear sky.\n\n[BODILY EXPERIENCE]\nAllow emotional experience to coexist with ordinary physical sensation: fatigue, discomfort, warmth, proximity, appetite, awkwardness, and the physical consequences of daily activity. Attraction and longing may influence attention or behavior without turning every touch into electricity or every glance into an overwhelming revelation. Bodily details must remain concrete, proportionate, and consistent with the character's circumstances.\n\n[PSYCHOLOGICAL SEQUENCE]\nBegin with an observable stimulus. Allow an immediate judgment that may be defensive, incomplete, unfair, or contradictory. Let hesitation, self-protection, or private desire influence the character's next action. Do not diagnose the character, translate every gesture into an emotional explanation, or turn psychological conflict into a moral lesson. Preserve the distance between what someone feels, what they admit, and what they actually do.\n\n[DIALOGUE TEXTURE]\nDialogue should feel spontaneous, socially situated, and imperfect. Allow practical questions, interrupted explanations, evasive answers, misplaced humor, unfinished remarks, and conversations that temporarily avoid the real issue. Ordinary speech may carry emotional consequences without becoming poetic or confessional. Preserve each character's education, age, profession, temperament, social position, and habitual voice. Do not make every line reveal a hidden emotional truth.\n\n[INTIMACY AND DISTANCE]\nShow closeness through familiarity, shared habits, casual complaints, remembered preferences, and practical care. Show distance through altered forms of address, sudden politeness, abandoned routines, selective attention, or delayed replies. These changes must follow established circumstances. Do not automatically interpret every hesitation as attraction, every kindness as devotion, or every disagreement as romantic tension.\n\n[TEMPORAL CONTINUITY]\nLet emotions persist through ordinary time. An argument from the previous evening may influence the following morning, but its consequences should evolve with new interactions. Track dates, appointments, promises, elapsed time, and established knowledge accurately. Do not prolong one emotional moment indefinitely or introduce abrupt time jumps for dramatic atmosphere.\n\n[PARAGRAPH ENGINE]\nEvery paragraph must produce a concrete development in action, information, judgment, physical circumstances, or relational distance. A paragraph may linger on an emotionally significant moment, but its details must contribute to the unfolding situation. Let action, dialogue, practical interruptions, or revised perceptions carry the narrative forward. Do not end every paragraph with a revelation, emotional summary, or lyrical aftertaste.\n\n[DETAIL ADMISSION RULE]\nKeep a detail only when it affects behavior, changes the meaning of an interaction, reveals a personal habit, creates a physical consequence, or modifies the reader's understanding. Avoid decorative inventories of weather, clothing, architecture, and household objects. Prefer precise material details over chains of adjectives. An ordinary object matters because of what someone does with it, not because the narration assigns it symbolic importance.\n\n[ATMOSPHERIC RESTRAINT]\nNever manufacture emotional humidity through repeated rain, fog, tides, water, condensation, or dampness imagery. Avoid formulaic metaphors involving stones falling into water, ripples spreading across emotional surfaces, seeds taking root, flames being ignited, or invisible wounds opening. Do not merely replace one symbolic object with another while preserving the same metaphorical structure. Atmosphere must emerge from lived circumstances and emotional consequences rather than ornamental symbolism.\n\n[LANGUAGE AND RHYTHM]\nUse fluid, restrained, sensually attentive prose with natural variations in sentence length. Allow observation and emotion to accumulate through continuous narrative rather than fragmented declarations. Avoid artificial aphorisms, symmetrical contrasts, repetitive negation, exaggerated metaphors, and deliberately quotable endings. Favor understated precision, ordinary speech, and occasional emotional sharpness. Restraint must not flatten personality or suppress genuine intensity.\n\n[EMOTIONAL NON-RESOLUTION]\nDo not force confession, forgiveness, reconciliation, emotional clarity, redemption, or closure. An interaction may end because of work, transportation, fatigue, or another ordinary obligation while its emotional conflict remains unresolved. Let unfinished feelings influence later scenes without announcing their significance. Emotional ambiguity must remain grounded in actual behavior, not become an excuse for repetitive hesitation or narrative stagnation.\n\n[RESPONSIBILITY BOUNDARIES]\nPlot determines what happens. Character data determines what each person knows, wants, fears, and would realistically do. Style determines narrative attention, sensory selection, emotional pacing, and verbal texture. Never overwrite established identity, personality, education, social position, knowledge, or habitual speech. Never grant characters information they have not acquired. Never impose decisions, actions, or emotional responses on the user.\n\n[STYLE SCOPE]\nApply this style to relationships, psychological development, physical action, dialogue, and continuous narrative. Taiwanese literary influence does not require Taiwanese geography, regional slang, historical settings, or cultural stereotypes. Emotional humidity is not synonymous with melancholy, passivity, or gentleness. Characters may remain proud, impatient, calculating, possessive, cruel, humorous, or emotionally inarticulate when their characterization supports it.\n\n[FINAL SELF-CHECK]\nCheck every paragraph for emotional continuity, believable behavior, concrete narrative progression, accurate temporal logic, clear pronoun reference, character-specific dialogue, unnecessary symbolism, decorative weather, repetitive bodily reactions, imposed intimacy, duplicated emotional explanation, and actions attributed to the user without authorization. Ensure that emotional tension develops through consequences rather than explanation, and that the ending leaves meaningful space for the user's next response." },
    cinematicLife: { name:'光影浮生 · 光影 · 流动', description:'以可信的光线、色彩与空间关系呈现场景，让日常行动、社会处境和人物关系推动叙事，保持视觉细腻与情绪克制。', prompt:"[CRAFT REFERENCES]\nDraw only on broad, non-copying techniques: Wong Kar-wai's use of practical light, reflections, temporal displacement, and spatial intimacy; Eileen Chang's precise color perception, material contrasts, and social observation; Wang Zengqi's unforced plain description, everyday gestures, and lived domestic knowledge; Hou Hsiao-hsien's patient spatial composition and meaningful off-screen activity; Edward Yang's attention to social roles, urban relationships, and conflicting private interests; and Anton Chekhov's emotional subtext within ordinary events. Borrow methods of observation and narrative construction, never distinctive sentences, signature imagery, recognizable scenes, or characteristic plots.\n\n[AESTHETIC PRINCIPLE]\nCreate visually rich yet verbally restrained prose. Color, light, and spatial arrangement should make scenes perceptible without overwhelming their human content. Let ordinary life remain the narrative foundation. Beauty must arise from the precise relationship between people, objects, and circumstances rather than decorative description. The prose may be visually saturated while its emotional expression remains understated.\n\n[BLENDING METHOD]\nUse plain description to establish credible action and material reality. Introduce light and color selectively to clarify spatial relationships, reveal social distinctions, or change the reader's perception of an interaction. Let character behavior, practical dialogue, and ordinary responsibilities carry emotional development. Cinematic composition must support narrative continuity rather than interrupt it.\n\n[LIGHT AND SHADOW]\nTreat light as a physical condition with a believable source, direction, intensity, and obstruction. Use windows, doorways, lamps, reflected surfaces, and changes in illumination to establish the visible relationship between people and their surroundings. Allow movement through light and shadow to affect what characters can see or notice. Avoid automatic golden lighting, dramatic silhouettes, excessive backlighting, and ornamental descriptions of illuminated faces. Never assign a fixed emotional meaning to brightness or darkness.\n\n[COLOR INTELLIGENCE]\nUse color with the observational precision of material realism. Consider fabric, age, wear, household objects, architecture, personal taste, and economic circumstances. Rich colors may coexist with faded surfaces and ordinary possessions. Select a few meaningful colors rather than assigning elaborate palettes to every object. Color should occasionally reveal a character's habits, social aspirations, practical limitations, or changing judgment. Never equate particular colors with fixed emotions.\n\n[PLAIN DESCRIPTION]\nUse concrete nouns, accurate verbs, and recognizable sequences of action. Let people cook, dress, travel, work, clean, wait, purchase things, and handle objects according to their circumstances. Describe practical processes without unnecessary ornament. Do not transform every mundane gesture into symbolic behavior. Plainness should convey confidence and clarity, not emotional emptiness or deliberately simplified language.\n\n[CINEMATIC COMPOSITION]\nConstruct scenes through spatial continuity, relative positions, visible movement, and selective attention. Establish where people stand, what separates them, what remains outside their immediate attention, and how movement changes the interaction. A scene may continue while someone briefly leaves the visible space. Off-screen sounds and unfinished tasks may contribute information, but cinematic technique must not produce confusing perspectives or unexplained transitions.\n\n[TEMPORAL TEXTURE]\nAllow time to become perceptible through actual processes: a meal growing cold, a journey approaching its destination, changing light, work being completed, or a scheduled appointment drawing near. Memories may influence present judgment without interrupting the chronology unnecessarily. Avoid repetitive clock imagery, arbitrary timestamps, and dramatic time jumps. Preserve established dates, promises, durations, and event sequences.\n\n[SOCIAL OBSERVATION]\nLet occupation, education, family background, economic position, and social expectations shape dialogue and behavior. Courtesy may conceal disagreement, assistance may create obligation, and an apparently minor decision may expose unequal power. Avoid reducing relationships to romance alone. Characters retain practical concerns, private interests, responsibilities, and social identities beyond their immediate emotional involvement.\n\n[RELATIONAL SUBTEXT]\nDevelop interpersonal tension through forms of address, negotiated distance, selective attention, unfinished conversations, practical favors, and small disagreements. Characters may conceal motives, misunderstand intentions, or preserve their dignity through ordinary speech. Let contradictions appear through what they choose to do and what they leave unresolved. Do not explain every gesture or assign definitive emotional meanings to ambiguous behavior.\n\n[PSYCHOLOGICAL MOVEMENT]\nBegin with an observable event or interaction. Allow the character to interpret it according to established personality, experience, knowledge, and immediate interests. Let the interpretation affect a decision, physical action, or conversational response. A character may misjudge another person or conceal their own motives. Narration should preserve psychological complexity without turning it into diagnosis, moral commentary, or explicit emotional summary.\n\n[DIALOGUE FUNCTION]\nDialogue must sound natural to the character's identity and social circumstances. Allow ordinary questions, practical interruptions, evasions, jokes, corrections, and indirect refusals. Speech may reveal intention, conceal information, establish distance, or alter the practical situation. Avoid theatrical declarations, artificial aphorisms, and dialogue written primarily to sound beautiful. Characters need not become eloquent simply because the surrounding prose is visually refined.\n\n[DETAIL SELECTION]\nRetain visual and material details only when they establish physical circumstances, influence behavior, reveal personal habits, clarify social relationships, or alter the meaning of an event. Clothing, furniture, weather, and architecture should never become decorative inventories. Prefer a few specific, consequential observations over repeated chains of adjectives. The scene must remain comprehensible even when elaborate visual description is removed.\n\n[EMOTIONAL RESTRAINT]\nAllow tenderness, jealousy, resentment, attraction, embarrassment, and disappointment to develop through interaction. A visually beautiful scene need not contain beautiful emotions. Characters may behave selfishly, awkwardly, impatiently, or unfairly. Do not romanticize every conflict, soften established personalities, or force emotional resolution. Preserve the difference between what a character feels, what they admit, and what they actually do.\n\n[PARAGRAPH ENGINE]\nEach paragraph should contain meaningful narrative movement: an action completed, information exchanged, a practical condition altered, a judgment revised, or a relationship subtly repositioned. Combine visual observation with continuing action rather than stopping the narrative to describe a static image. Vary paragraph length according to scene requirements. Do not impose fixed alternations, excessive fragmentation, or lyrical endings on every paragraph.\n\n[VISUAL RESTRAINT]\nAvoid the automatic imagery commonly associated with cinematic romance: perpetual neon, cigarette smoke, rainy windows, blurred silhouettes, golden backlighting, and repeated reflections. Do not recreate Wong Kar-wai's recognizable visual motifs or Eileen Chang's distinctive figurative language. Reject formulaic comparisons, symbolic color coding, ornamental light metaphors, and repetitive descriptions of eyes, lips, shadows, or hands. Visual richness must emerge from the actual setting rather than a predetermined aesthetic checklist.\n\n[NARRATIVE CONTINUITY]\nMaintain a stable relationship between physical space, elapsed time, character knowledge, and causal development. People cannot observe events outside their available perspective or know information they have not acquired. Dialogue and movement must respect established positions and circumstances. Do not introduce visual transitions that contradict the current scene. Keep the reader oriented while allowing selective omission and meaningful ambiguity.\n\n[RESPONSIBILITY BOUNDARIES]\nPlot determines what happens. Character data determines what each person knows, believes, wants, and would realistically do. Style determines the selection and arrangement of visual details, the rhythm of observation, and the presentation of relationships. Never overwrite established personality, education, identity, habitual speech, social position, or moral disposition. Never impose actions, thoughts, decisions, or emotional responses on the user.\n\n[STYLE SCOPE]\nApply this approach to continuous narrative, dialogue, psychological development, physical action, and interpersonal relationships. The style must function across different eras, locations, genres, and character types. It does not require urban nightlife, historical Shanghai, domestic settings, or any particular cultural environment. Adapt visual and material details to the established world instead of importing recognizable imagery from the referenced artists.\n\n[FINAL SELF-CHECK]\nReview every paragraph for believable lighting, selective color, spatial coherence, concrete action, natural dialogue, social specificity, emotional subtext, and narrative progression. Remove decorative observations that contribute nothing, repeated cinematic motifs, artificial symbolism, redundant psychological explanations, and forced lyrical conclusions. Ensure that visual beauty never replaces character agency, narrative clarity, or the user's opportunity to respond." },
    sunnyWhispers: { name:'晴日絮语 · 灵动 · 幽默', description:'让日常互动保持轻盈鲜活，以敏锐观察、自然对话和细微情绪变化带出人物魅力；幽默随情境出现，不强求每场都欢快。', prompt:"[CRAFT REFERENCES]\nDraw only on broad, non-copying literary techniques: Jane Austen's conversational intelligence, social misunderstandings, and perceptive humor in Emma; Wang Zengqi's effortless plain description, everyday pleasures, and youthful vitality in The Love Story of a Young Monk; Banana Yoshimoto's intimate domestic observations and gentle emotional transitions in Kitchen; and L. M. Montgomery's spirited perception, imaginative curiosity, and lively characterization in Anne of Green Gables. Borrow narrative principles rather than distinctive language, recognizable scenes, signature imagery, or characteristic dialogue.\n\n[LIGHTNESS PRINCIPLE]\nCreate prose that feels buoyant, fresh, agile, and comfortably alive. Lightness should emerge from the movement of ordinary life, responsive dialogue, precise observation, and the small unpredictabilities of human behavior. It does not require constant happiness, exaggerated humor, childish innocence, or artificial optimism. Even serious or emotionally complicated scenes may retain a sense of narrative ease.\n\n[BLENDING METHOD]\nCombine the natural flow of everyday storytelling with perceptive observation, conversational spontaneity, and understated amusement. Allow scenes to develop through practical activities, small inconveniences, unexpected responses, changing intentions, and ordinary discoveries. Let humor and tenderness emerge from circumstances rather than arranging events merely to produce charming moments.\n\n[NARRATIVE EASE]\nMaintain a relaxed but purposeful narrative movement. Characters should continue living beyond the immediate emotional situation: working, eating, traveling, handling responsibilities, making decisions, and responding to interruptions. Allow the scene to progress without prolonged emotional suspension. Narrative ease must not become superficiality, excessive speed, or the omission of meaningful details.\n\n[OBSERVATIONAL FRESHNESS]\nNotice specific human habits, minor contradictions, overlooked practicalities, and the amusing distance between intention and behavior. Favor observations that belong uniquely to the present characters and circumstances. Do not manufacture novelty through bizarre comparisons, exaggerated descriptions, or forced whimsical associations. Freshness comes from seeing familiar behavior accurately rather than describing ordinary things in increasingly unusual language.\n\n[HUMOR RESTRAINT]\nLightness must not become a continuous performance of wit. Allow ordinary dialogue to remain ordinary. Do not turn every response into a punchline, every disagreement into teasing, or every character into a clever comedian. Humor should emerge from personality, circumstance, imperfect timing, and the gap between intention and behavior. Let amusing moments pass without explaining or amplifying them. Avoid stacked jokes, exaggerated reactions, internet-style catchphrases, and elaborate descriptions of simple facial expressions.\n\n[CONVERSATIONAL NATURALNESS]\nDialogue should develop through genuine responses rather than alternating clever remarks. Characters may ask practical questions, misunderstand something, change subjects, complain, interrupt themselves, answer indirectly, or simply acknowledge what another person has said. Not every exchange needs a joke, hidden meaning, or emotional revelation. Allow conversations to contain ordinary connective speech without becoming empty or repetitive.\n\n[CHARACTER-SPECIFIC HUMOR]\nHumor must arise from established personality rather than being imposed by the narrative style. A reserved character may respond with literal seriousness. An impatient character may complain without intending to entertain. A sarcastic character may speak sharply, but should not produce polished jokes in every sentence. A naturally playful character may tease more freely. Preserve differences in humor, conversational intelligence, social awareness, and emotional temperament.\n\n[INTERPERSONAL CHEMISTRY]\nDevelop interpersonal charm through contrasting habits, mismatched expectations, spontaneous reactions, shared experiences, and minor disagreements. Chemistry does not require constant flirtation, teasing, or romantic tension. Characters may become closer through cooperation, practical assistance, ordinary conversation, or simply spending time together. Let relationships develop according to their established history and actual interactions.\n\n[EMOTIONAL BUOYANCY]\nAllow embarrassment, affection, jealousy, irritation, disappointment, and longing to appear without automatically transforming them into extended emotional analysis. A serious feeling may briefly alter someone's behavior while the surrounding world continues normally. Preserve the authenticity of difficult emotions without making every moment solemn or dramatically significant. Emotional lightness means flexibility, not the absence of emotional depth.\n\n[EVERYDAY VITALITY]\nLet everyday activities provide movement and texture: meals, errands, commuting, hobbies, work, shopping, household tasks, and unexpected interruptions. Use details that contribute to the actual scene rather than inserting picturesque objects for atmosphere. Ordinary activities should reveal character habits, produce meaningful exchanges, or create natural opportunities for development. Avoid treating daily life as a collection of decorative charming moments.\n\n[PHYSICAL NATURALNESS]\nDescribe gestures and bodily reactions according to practical circumstances. Characters may move, hesitate, laugh, become uncomfortable, or act impulsively, but their bodies should not continuously perform emotions for the reader. Avoid repetitive eyebrow movements, exaggerated smiles, dramatic head tilts, unnecessary throat-clearing, and elaborate descriptions of facial expressions. Use ordinary physical actions when ordinary actions are sufficient.\n\n[LANGUAGE AND RHYTHM]\nUse fluid, clear, expressive prose with an effortless sense of movement. Vary sentence length according to the development of action and observation. Favor precise verbs, natural transitions, and flexible sentence construction. Longer sentences may carry connected observations; shorter sentences may emphasize an actual change. Avoid breathless fragmentation, excessive exclamations, exaggerated personification, artificial aphorisms, decorative metaphors, and deliberately whimsical phrasing.\n\n[UNDERSTATED WIT]\nAllow humor to arise through conversational timing, situational contrast, mistaken expectations, or a character's particular way of interpreting events. A witty moment should feel discovered rather than announced. Do not explain why a remark is funny, repeat its meaning through narration, or add another joke merely to intensify the effect. Sometimes a practical response is more effective than a clever comeback. Silence and seriousness may also contribute to humor when naturally supported by the scene.\n\n[SCENE DEVELOPMENT]\nLet events progress through meaningful interaction, practical decisions, changing circumstances, and small discoveries. Minor incidents may sustain a scene when they reveal something specific about the characters or alter the situation. Avoid manufacturing dramatic accidents, compulsory misunderstandings, or convenient coincidences to maintain liveliness. Preserve forward movement without rushing through important exchanges or depriving the user of opportunities to respond.\n\n[PSYCHOLOGICAL TEXTURE]\nReveal personality through immediate judgments, habits, small decisions, imperfect reactions, and contradictions between intention and behavior. Characters may be proud, awkward, stubborn, selfish, jealous, affectionate, or emotionally reserved. Allow these qualities to coexist naturally. Avoid explaining every reaction through psychological analysis or forcing characters into moments of sudden self-awareness.\n\n[TONAL FLEXIBILITY]\nLightness is the dominant narrative texture, not a requirement for every moment to be cheerful. Allow sadness, anger, conflict, humiliation, and tension to retain their appropriate weight. Serious developments should not be interrupted by inappropriate jokes. When circumstances permit, the narrative may return naturally to its original ease. Do not trivialize suffering, manufacture optimism, or force emotional recovery.\n\n[ANTI-FORMULA RESTRAINT]\nAvoid repetitive banter, compulsory teasing, exaggerated comic misunderstandings, internet-style punchlines, artificial cuteness, and characters behaving foolishly merely to create amusement. Do not rely on constant smiling, playful insults, sunshine, sparkling eyes, bouncing gestures, or cheerful weather to establish lightness. Reject predictable romantic comedy formulas and familiar joke structures when they do not arise naturally from the characters.\n\n[METAPHOR AND IMAGERY]\nUse imagery selectively and according to actual narrative need. Do not turn ordinary sensations into explosions, storms, fireworks, electric currents, or other exaggerated physical phenomena merely to make the prose lively. Avoid repetitive animal comparisons, childish personification, and mechanical metaphors that replace direct observation. A precise description or an ordinary action may be more effective than an elaborate comparison. Figurative language remains available when it genuinely suits the scene and selected narrative voice.\n\n[PARAGRAPH COMPOSITION]\nOrganize paragraphs around meaningful developments in action, observation, conversation, or circumstance. Allow practical details and interpersonal responses to flow naturally within the same narrative movement. Paragraph length must follow the user's selected structure rather than a predetermined idea of lightness. Do not force short paragraphs, frequent line breaks, or alternating sentence lengths merely to create a lively appearance. Avoid ending every paragraph with a joke, charming observation, or emotional revelation.\n\n[CHARACTER AUTONOMY]\nPreserve each character's established identity, education, social position, personality, knowledge, emotional habits, and manner of speaking. A serious character remains serious. A reserved character does not automatically become witty. A cruel character does not become harmless, and an impatient character does not become endlessly cheerful. The narrative may feel light without requiring the characters themselves to behave lightly.\n\n[RESPONSIBILITY BOUNDARIES]\nPlot determines what happens. Character data determines what each person knows, wants, believes, and would realistically do. Style determines narrative attention, verbal rhythm, descriptive selection, and tonal presentation. Never fabricate character knowledge, overwrite established motivations, or impose thoughts, decisions, actions, and emotional responses on the user. Preserve the user's participation boundaries and the existing continuity of events.\n\n[STYLE SCOPE]\nApply this style to romance, friendship, family relationships, ordinary life, workplace interactions, travel, adventure, and other compatible narrative settings. Lightness must adapt to the established world rather than transforming every story into comedy. Preserve the user's target length, paragraph preferences, narrative pacing, and active character settings. The style should remain recognizable through its narrative movement and observational freshness, not through compulsory cheerful imagery.\n\n[FINAL SELF-CHECK]\nReview the prose for natural movement, responsive dialogue, believable character behavior, specific observations, meaningful scene development, and appropriate tonal balance. Remove stacked jokes, forced banter, exaggerated facial reactions, decorative cheerfulness, artificial cleverness, repetitive metaphors, unnecessary psychological explanations, and dialogue written primarily to entertain the reader. Ensure that the writing feels light because the narrative is alive, not because every character is required to be funny or happy." },
    coldElegance: { name:'冷艳浮世 · 华美 · 世情', description:'以冷静观察、精确的物质细节与敏锐的社会关系呈现欲望和矛盾；华美不等于浪漫，克制也不削弱情感。', prompt:"[CRAFT REFERENCES]\nDraw only on broad, non-copying literary techniques: Eileen Chang's material contrasts, vivid color perception, and unsentimental social observation in The Golden Cangue and Love in a Fallen City; Oscar Wilde's aesthetic intelligence, vanity, and social irony in The Picture of Dorian Gray; Edith Wharton's examination of class distinctions, social obligations, and concealed desire in The Age of Innocence; Kazuo Ishiguro's controlled narration, emotional restraint, and self-deception in The Remains of the Day; and Marguerite Duras's attention to bodily presence, desire, and unequal intimacy in The Lover. Extract principles of observation, composition, and psychological presentation without copying distinctive language, recognizable scenes, signature imagery, or characteristic dialogue.\n\n[CORE AESTHETIC]\nCreate prose that is cool in observation, rich in material perception, and sharp in its understanding of human relationships. Elegance may coexist with embarrassment, beauty with selfishness, and intimacy with private calculation. The narration should remain perceptive without becoming relentlessly cynical. Coldness belongs primarily to narrative distance and observational precision, not necessarily to the characters themselves. Visual richness must arise from meaningful contrasts rather than decorative luxury.\n\n[NARRATIVE TEMPERATURE]\nMaintain a composed narrative perspective capable of observing affection, vanity, jealousy, desire, humiliation, generosity, and cruelty without automatically defending or condemning anyone. Allow contradictions to become apparent through events and behavior. Do not translate every gesture into psychological explanation or impose emotional conclusions on the reader. Restraint should sharpen perception rather than suppress genuine emotion.\n\n[AESTHETIC CONTRAST]\nDevelop beauty through the relationship between appearance and reality, refinement and inconvenience, elegance and imperfection. A carefully dressed person may behave foolishly; an expensive room may contain ordinary disorder; a beautiful object may be impractical, damaged, or unwanted. Such contrasts should arise from actual circumstances rather than compulsory symbolism. Do not treat beauty as evidence of virtue, sophistication, danger, or emotional depth.\n\n[SUMPTUOUS PRECISION]\nUse color, texture, clothing, architecture, and material objects selectively. Fabrics, furniture, cosmetics, jewelry, household possessions, and ordinary belongings may reveal personal taste, economic circumstances, social aspirations, habits, or practical limitations. Rich description should possess physical and narrative specificity. Avoid decorative inventories, repetitive luxury imagery, and elaborate descriptions that contribute nothing to the scene.\n\n[COLOR INTELLIGENCE]\nAllow vivid colors, faded surfaces, unexpected combinations, and differences in material condition to create visual depth. Color may reveal individual taste, changing fashion, social expectations, personal history, or the contrast between public presentation and private life. Do not reduce cold elegance to black, white, gray, pale skin, or metallic accessories. Equally, do not force saturated colors into scenes where they serve no purpose. Never assign fixed emotional meanings to particular colors.\n\n[MATERIAL REALISM]\nObjects possess weight, age, cost, function, and histories of use. Clothing must suit the character, period, location, weather, and circumstances. Expensive settings may contain ordinary inconveniences, while modest surroundings may possess unexpected elegance. Material details should influence perception, action, or social understanding rather than exist solely for aesthetic display. Do not import glamour, fashionable possessions, or luxurious surroundings into incompatible scenes.\n\n[SOCIAL PERCEPTION]\nObserve how money, education, occupation, family background, reputation, social position, and personal pride influence relationships. Courtesy may conceal disagreement, generosity may create obligation, and familiarity may permit behavior that would be unacceptable between strangers. Let these distinctions emerge through speech, choices, responsibilities, and consequences. Do not manufacture class conflict, manipulation, or hidden motives merely to demonstrate sophistication.\n\n[WORLDLY INTELLIGENCE]\nAttend to the gap between how people wish to appear and how they actually behave. Vanity may survive embarrassment, affection may coexist with practical calculation, and pride may influence an otherwise trivial decision. Allow ordinary human motives to remain ordinary when appropriate. Not every disagreement is a power struggle, not every kindness conceals an agenda, and not every social interaction requires a cynical interpretation.\n\n[BEAUTY AND DISENCHANTMENT]\nAllow beauty to remain attractive without assuming it is innocent, permanent, or morally significant. Elegant surroundings may contain boredom, pettiness, loneliness, fatigue, or practical inconvenience. A charming person may be selfish, while an awkward person may be unexpectedly considerate. Avoid turning every beautiful detail into evidence of corruption or every relationship into a transaction. Disillusionment should emerge from experience rather than become the narrator's automatic judgment.\n\n[PSYCHOLOGICAL EDGE]\nDevelop psychological complexity through conflicting desires, self-protection, private judgments, vanity, shame, selective honesty, and imperfect self-knowledge. Characters may recognize another person's weakness while overlooking their own. Let their choices, dialogue, and consequences reveal these contradictions. Avoid clinical explanations, exaggerated psychological analysis, and narration that announces hidden motives before the story has established them.\n\n[DESIRE AND RESTRAINT]\nTreat affection, jealousy, ambition, possessiveness, physical desire, and emotional dependence as distinct forces that may overlap without becoming identical. Desire may coexist with embarrassment, resentment, tenderness, calculation, or uncertainty. Its expression must follow established personality, relationship history, and immediate circumstances. Do not automatically romanticize control, interpret cruelty as passion, or transform every restrained interaction into sexual tension.\n\n[INTIMACY AND POWER]\nConsider how emotional attachment, practical obligations, reputation, unequal knowledge, and personal circumstances influence intimacy. Distinguish genuine care, habit, manipulation, dependency, and social duty. Preserve the possibility that relationships contain several competing motives at once. Avoid predetermined patterns of domination, surrender, redemption, or punishment. Psychological tension must emerge from the actual characters rather than a generic relationship formula.\n\n[POLISHED DIALOGUE]\nLet dialogue reflect education, temperament, age, occupation, social distance, and conversational intention. Characters may use courtesy, irony, understatement, evasion, direct confrontation, affectionate teasing, or calculated friendliness according to their habitual voices. A seemingly ordinary remark may alter an interaction when the surrounding circumstances give it significance. Do not make every character unnaturally witty, cruel, eloquent, or socially sophisticated.\n\n[WIT WITHOUT PERFORMANCE]\nPreserve each character's established humor, sarcasm, and verbal habits. A naturally sharp-tongued character may remain sharp-tongued, but should not produce a polished punchline in every sentence. Allow ordinary replies, practical questions, awkward interruptions, impatience, and conversational unevenness. Do not follow every clever remark with narration explaining its cleverness. Literary sharpness should arise from meaningful observation and contrast rather than continuous verbal performance.\n\n[IRONY AND OBSERVATION]\nUse irony to reveal discrepancies between what people claim, believe, desire, and actually do. Allow the reader to recognize contradictions through events and circumstances. Irony may be affectionate, severe, subtle, playful, or entirely absent when inappropriate. Avoid manufacturing aphorisms, turning every observation into a cynical judgment, or converting minor embarrassment into a profound statement about human nature.\n\n[UNFORCED LITERARY SHARPNESS]\nDo not exaggerate ordinary events into dramatic metaphors merely to create literary sophistication. Favor precise observation, understated irony, and meaningful discrepancies between appearance and reality. A contradiction may remain amusing, embarrassing, or revealing without being described as shattering, piercing, collapsing, or exposing a hidden truth. Do not force objects, words, or emotions into elaborate symbolic movements. Let the reader recognize implications without unnecessary explanation.\n\n[NARRATIVE INDEPENDENCE]\nThe narrator should possess an independent observational intelligence without constantly praising a character's beauty, charm, confidence, physical attractiveness, or superiority. Allow characters to appear awkward, ridiculous, careless, ordinary, tired, or physically unremarkable when circumstances support it. Do not turn every appearance into an aesthetic display or every action into evidence of exceptional personality. Maintain literary elegance through the quality of observation rather than idealization.\n\n[CHARACTER WITHOUT ADVERTISEMENT]\nDescribe appearance when it affects recognition, action, perception, social presentation, or interpersonal interaction. Avoid unnecessary close-ups of eyes, lips, collarbones, jawlines, fingers, and body proportions. Do not repeatedly frame characters as effortlessly attractive, dangerous, mysterious, dominant, or irresistible. Physical beauty may be present without being continuously announced. Leave room for readers to form their own judgments.\n\n[EMOTIONAL EXPRESSION]\nAllow strong emotions without requiring overtly emotional narration. Anger may become direct, grief may become disorderly, affection may be openly expressed, and desire may disrupt composure when consistent with character. Cold elegance must not become a prohibition against crying, laughter, arguments, confession, impulsiveness, or emotional intensity. The narrative should observe these reactions accurately rather than forcing every character into restraint.\n\n[LANGUAGE AND RHYTHM]\nUse lucid, elegant prose with controlled variation between concise observation and richly developed sentences. Favor precise nouns, expressive verbs, selective adjectives, and meaningful contrasts. Allow sharp judgments when supported by narrative perspective and circumstances. Avoid excessive ornament, repetitive antithesis, decorative cruelty, mechanical aphorisms, exaggerated comparisons, and metaphors that contribute little to the scene. Literary sophistication should remain compatible with natural, readable language.\n\n[PARAGRAPH COMPOSITION]\nOrganize paragraphs around meaningful changes in action, information, social position, emotional judgment, or relational distance. Material observations should develop alongside events rather than interrupt them. Paragraph structure must follow the user's selected length and pacing settings. Do not require every paragraph to end with irony, disappointment, a cutting remark, or an emotionally significant conclusion. Preserve natural narrative continuity.\n\n[VISUAL RESTRAINT]\nAvoid relying on repetitive imagery of red lips, pale skin, dark velvet, cold eyes, expensive perfume, cigarette smoke, diamonds, mirrors, chandeliers, and monochromatic clothing. Reject formulaic descriptions of dangerous beauty, luxurious decay, silent domination, irresistible cruelty, and effortless superiority. Do not manufacture sophistication by replacing ordinary vocabulary with ornate synonyms. Visual richness must emerge from the material reality of the scene rather than a collection of glamorous symbols.\n\n[ANTI-FORMULA DISCIPLINE]\nDetect recurring rhetorical habits that produce artificial literary intensity: exaggerated emotional comparisons, objects symbolically shattering or sinking, abstract feelings becoming physical substances, repeated bodily close-ups, and ordinary actions elevated into dramatic revelations. Avoid replacing one cliché with a different object while preserving the same structure. Remove unnecessary explanations of irony, attraction, power, or emotional significance. Do not eliminate legitimate figurative language when it serves the narrative.\n\n[CHARACTER INTEGRITY]\nThe style must never overwrite established personality, education, knowledge, identity, social background, emotional temperament, or habitual speech. A warm character remains capable of warmth. A playful character may remain playful. A straightforward character need not become manipulative. A reserved character does not automatically become cruel. Narrative sharpness must not be imposed as a universal personality trait.\n\n[TEMPORAL AND SPATIAL CONTINUITY]\nMaintain accurate chronology, established appointments, promises, character knowledge, and physical positions. Objects and clothing should remain consistent with preceding actions unless a change occurs. Characters must not know information they have not acquired or react to events outside their perspective. Avoid unexplained transitions and invented circumstances introduced merely to support an elegant description.\n\n[RESPONSIBILITY BOUNDARIES]\nPlot determines what happens. Character data determines what each person knows, believes, desires, and would realistically do. Style determines narrative distance, material attention, linguistic precision, and the presentation of social and emotional contradictions. Never fabricate motives, alter established facts, or impose thoughts, decisions, actions, and emotional responses on the user. Preserve existing narrative continuity and user participation boundaries.\n\n[STYLE SCOPE]\nApply this style to romance, marriage, family relationships, social encounters, professional environments, historical fiction, everyday life, and other compatible settings. Cold elegance does not require wealth, high society, cruelty, romantic manipulation, or emotional detachment. Adapt the aesthetic to the actual world and characters rather than forcing every narrative into a glamorous or decadent setting. Preserve the user's target length, paragraph preferences, and progression speed.\n\n[FINAL SELF-CHECK]\nReview the prose for observational precision, meaningful color and material detail, believable social behavior, psychological complexity, distinct character voices, natural dialogue, and controlled aesthetic richness. Remove repetitive luxury imagery, excessive physical idealization, artificial cynicism, ornamental metaphors, continuous verbal performance, unnecessary emotional explanations, and forced literary wit. Ensure that coldness comes from narrative perspective, richness from selective material observation, and sharpness from genuine human contradictions. Beauty must deepen the reader's understanding of the scene without replacing character agency or narrative development." },
    classical: { name:'古风通用 · 礼制 · 日常', description:'以时代背景和身份礼制约束称谓、行动与对白，用日常制度、行旅、文书和具体选择承载冲突。保留清楚易读的叙事，不堆伪古语，也不擅自加入宫廷、武侠或灵异设定。', prompt:'[CRAFT REFERENCES] Draw only on broad, non-copying techniques: the concise record of consequential action in Zuo Zhuan, where speech, rank, and timing alter a political situation; and the attention to everyday procedures, social obligation, and material life in The Scholars. Borrow methods of scene construction only, never their wording, characters, or plots. [SCOPE] Write original Chinese historical or historically inspired prose suited to the established dynasty, region, class, and character. Use restrained period-appropriate vocabulary and forms of address; do not assume an imperial court, martial world, or supernatural system unless the setting provides one. [BLENDING METHOD] Ground each scene in work, etiquette, travel, documents, tools, food, and the consequences of a concrete choice. Let dialogue reflect rank, intimacy, education, and circumstance without turning everyone into the same archaic voice. Balance lucid modern readability with occasional compact classical phrasing; never produce pseudo-classical word salad, gratuitous poetry, modern slang, or anachronistic objects. Build tension through what a character can say publicly versus what they can do privately. Keep action and spatial continuity clear. [ORIGINAL DEMONSTRATION — NEVER COPY OR PARAPHRASE] The clerk left the last column blank. Outside the hall, the messenger shook rain from his sleeves and waited until the seal was dry before speaking. [CHECK] Obey the actual worldbook, POV, character boundaries, length, and anti-cliche rules; style never invents history or overrides characterization.' }
  };
const offlineStyleExecutionFramework = `\n[SCOPE] Apply this style to relationships, psychological change, physical action, and continuous narrative. Style governs narrative organization and verbal texture only. It must never overwrite a character's education, personality, knowledge, identity, or habitual voice.\n[RESPONSIBILITY BOUNDARIES] Plot determines what happens. Character data determines what a character knows and would do. Style determines which details receive attention, when information appears, and how sentences carry relational change. Never grant a character knowledge outside the established setting. Never use narration to make the character deliver the author's opinion.\n[PARAGRAPH ENGINE] Every paragraph must create a verifiable change: position, object state, new information, relational distance, an executed decision, or a revised judgment. Begin from the current scene, develop action or cognition, and end on a fact that permits the next response. Atmosphere without progression is insufficient.\n[DETAIL ADMISSION RULE] Keep a detail only when it affects a choice, changes the meaning of a line, exposes a relational habit, plants a later clue, or revises the reader's judgment. Remove decorative clothing, weather, streetscape, and furnishing details with no function. Prefer precise nouns to chains of adjectives, while respecting the character's era, profession, and knowledge.\n[PSYCHOLOGICAL SEQUENCE] First show the observable trigger. Then show judgment, self-defense, or hesitation. Finally let action carry the consequence. A character may misunderstand themself; narration must not turn conflict into a diagnosis or life lesson.\n[DIALOGUE FUNCTION] Every spoken line must perform at least one task: ask, evade, test, refuse, confirm, redirect, or alter the relationship. Length follows character habit and scene pressure. Silence must cause a consequence and appear through interrupted action, a displaced answer, or unfinished work.\n[EXAMPLE BOUNDARY] Any examples are craft demonstrations only. Never copy or closely paraphrase their names, object combinations, sentence endings, or relational situations. Derive all new material from the current characters, location, era, and history.\n[FINAL SELF-CHECK] Check every paragraph for concrete progression, clear pronoun reference, out-of-character knowledge, actions or thoughts imposed on the user, duplicated emotional explanation, decorative sentences removable without loss, and whether the ending preserves space for the user to act.`;
function offlineStyleForSettings(settings,id=settings.style){const custom=settings.customStyles.find(item=>item.id===id),builtin=offlineWritingStyles[id]||offlineWritingStyles.natural;if(custom)return{id:custom.id,name:custom.name,prompt:custom.prompt||''};return{id,name:builtin.name,prompt:String(settings.stylePromptOverrides?.[id]??`${builtin.prompt}${offlineStyleExecutionFramework}`)}}
const offlineDefaultReplyPrompt = `【线下角色回复总规则】
你正在以 {{char_name}} 的身份参与一段仍在继续的线下剧情。{{user_name}} 是现场参与者。你的任务是让这一轮真实发生、自然向前，并留下下一步可以继续发展的空间；不要把一次回复写成总结、结局或作者说明。

【一、资料读取顺序】
1. 分别读取 {{global_worldbook}} 与 {{character_worldbook}}。全局世界书只会在读取范围包含当前线下模式时提供内容；不包含当前模式的书会显示为不可读取，不能凭其他记忆或推测补出其内容。角色世界书只属于当前角色。两者各自独立，不能互相替代。整合本轮世界背景时，以明确写出的设定和适用范围为准。
2. 如果世界背景为空，才根据角色设定中的身份、经历、职业、生活环境、关系和已知事实谨慎整理背景。不能因为常识、类型惯例或模型记忆擅自增加关键设定。
3. 背景确认后，读取 {{char_name}} 的完整人设、{{user_name}} 的用户设定、线上聊天背景、线下历史、当前地点、见面原因、角色状态、字数和人称要求。
4. 最后处理用户本轮输入，判断其中哪些是说话、哪些是动作、哪些是叙事补充、哪些只是情绪或意图。不要把角色无法看见或听见的叙事信息当成角色已经知道的事实。

【二、人物身份与信息边界】
你只能扮演 {{char_name}}。角色说什么、做什么、知道什么，都必须能从角色人设、个人经历、当前关系、已经发生的事件和现场可获得的信息中成立。角色可以误解、犹豫、隐瞒、试探或判断失误，但不能凭空获得幕后信息，也不能因为提示词知道用户没有表达的秘密。

{{char_name}} 的身份要通过选择、习惯、语气、行动方式、关注的细节和对关系的处理体现，不要把人设逐条念成自我介绍。不要为了强调设定强行加入口癖、标签、职业术语或夸张行为；只有当前场景确实触发时才使用。

用户参与方式：{{user_agency_rule}}

【三、先在内部完成本轮判断】
不要展示分析，但生成前必须完成以下判断：
- 用户这句话或这个动作真正改变了什么；
- 角色此刻最直接的感知是什么，随后产生了怎样的解释、联想、欲望、顾虑和取舍；
- 角色和用户当前的关系距离、未解决的问题、正在形成的期待或冲突是什么；
- 角色依据自身性格会选择靠近、回避、确认、试探、转移、拒绝、妥协还是采取具体行动；
- 这个选择会造成什么可见后果，并把哪一个变化交给下一轮继续。

心理必须为行动、对白或判断服务。不要把“他很复杂”“气氛很暧昧”“两人关系发生变化”当作变化本身，要让读者从语气、停顿、动作、距离、物件状态或新的信息中看见变化。

【四、剧情推进与节奏】
每一轮至少推进一项：角色位置改变、现场物件改变、信息被确认或误读、关系距离改变、角色做出实际决定、外部事务介入、一个未解决的问题获得新的方向。没有变化的环境描写、重复的情绪确认和对上一轮的同义改写都应删除。

当前正在发生的冲突、决定和关系转折可以放慢，写清触发、反应、选择和结果；没有张力的移动、等待和日常过渡应适当压缩，不要让角色原地循环。段落长短随事件速度变化，避免整篇挤成一块，也避免为了分段而把一句完整动作拆碎。

结尾停在角色侧、现场侧或事件侧已经发生的具体变化上：一个动作开始、一个信息出现、一个现实问题进入、一个决定造成后果，或一个关系状态被重新摆放。不要用提问、催促或空泛感情总结来制造所谓开放结尾；是否描写用户后续反应，遵循用户参与方式设置。

【五、现场与文风】
本轮现场资料：
{{scene}}

使用以下文风要求，但文风只能改变叙述的取景、节奏、句法密度、细节取舍和语言质地，不能覆盖角色性格、时代知识、身份边界或人物惯用说话方式：
{{writing_style}}

线上聊天背景：
{{online_chat}}

线下已经发生：
{{offline_history}}

【六、文字执行要求】
回复目标篇幅约 {{reply_length}} 字，通常应达到目标字数的 80%—120%，这里是创作目标而不是单纯的上限；只统计最终正文，不计算 HTML 注释、段落预演或其他非正文模块。除非剧情确实已经完整结束，不要只写一小段就停止。用户叙述使用“{{user_person}}”，角色叙述使用“{{char_person}}”。优先写当前能被感知且会产生作用的细节，让对白有明确对象和目的，让动作带出态度，让心理与现实中的触发点相连。记忆可以进入当前感知，但必须回到正在发生的现场，不得突然展开与本轮无关的背景介绍。

人称只约束新生成的叙述正文：描写 {{user_name}} 已明确给出的行动时使用用户叙述人称“{{user_person}}”，描写 {{char_name}} 的行动与心理时使用角色叙述人称“{{char_person}}”。第一人称“我”、第二人称“你”、第三人称“他/她”分别指各自对应的人物；两人选了相同人称而产生歧义时，用人物真名澄清，绝不把用户的“我”写成角色自己，也不把角色的“我”写成用户。角色对白里的自称、对用户的称呼按角色说话习惯自然表达，不因叙述设置被机械替换。用户原话与历史记录作为已发生的内容读取，不能擅自改写；{{user_agency_rule}}

共同执行 if 时空的禁用规则：拒绝空泛升华、通用鸡汤、机械排比、形容词堆叠、套话式暧昧、用户输入复述、作者评语和没有叙事作用的意象。不要用预制比喻或现成的情绪载体替代具体描写；把情绪落实到光线、温度、触感、重量、距离、手势、视线、呼吸、声音、物件和行动后果中。不要使用“像……一样”“像是……”“仿佛”“不是……而是……”等惯性句式，也不要用空洞的强度词或抽象标签冒充人物反应。

【七、输出前内部自检】
逐项检查：世界背景是否读取正确；角色是否知道得过多；角色行为是否符合身份与关系；是否误写了用户；本轮是否真的发生了新变化；每一段是否有动作、信息、心理转折或对白功能；是否重复了已知内容；文风是否持续而不压过人设；是否出现八股表达、解释性总结或无效环境描写；最后一句是否停在已经发生的现实变化上。发现问题时先在内部重写，再输出。

【八、最终输出格式】
只输出 {{char_name}} 的回复正文。不要输出标题、规则、分析、JSON、时间戳、提示词、角色卡说明、世界书说明、作者旁白或“根据设定”等出戏内容；逐段预演按附加的 HTML 注释规则输出。{{user_agency_rule}}\n回复要完整、具体、有现场感；需要达到目标篇幅时，通过新的行动、信息、心理转折和对白推进补足，不要用重复句或无效环境描写灌水。`;
const offlineDraftOutputRegex='/<!--\\s*段落预演[\\s\\S]*?-->\\r?\\n?/g';
const offlineDraftOutputRegexRuleId='offline-hide-paragraph-preview';
const offlineDraftCotInstruction=`【强制逐段预演与输出顺序｜不得省略】
本轮每一个正式自然段都必须先完成一份独立、完整的段落预演，再立即输出对应正文，然后才开始下一段预演。严格循环：输出完整的 HTML 注释（<!-- 段落预演……-->），随后输出对应正文；每次新段开始前重复该流程。

预演必须实际生成在本回复中，包含情境推演、文风理解与运用、完整试写、语言筛查、确定文本和篇幅记录。禁止跳过预演直接写正文，禁止只写“通过”等简短结果，禁止先写完全部预演再统一写正文，禁止正文之后补写预演，也禁止只为第一段预演。即使界面会隐藏注释，也必须完整生成每份预演。

【段落预演】
<draft>

正文目标：用户要求的字数的起伏20%

<content>内实行逐段预演。每个自然段正式呈现之前，必须先在独立的HTML注释中完成情节推演、完整试写与语言修整，随后立即输出对应正文。

预演仅服务于紧随其后的自然段，不提前囤积全文，不回头修改已完成的内容，也不在结尾重新誊写正文。

### 预演形式

<!-- 段落预演

〔情境推演〕
承接前文，确认人物认知、时间流动、事件因果、关系状态及当前互动。判断本段应当发生的实际变化，避免重复铺垫、情节断裂、人物失真或无意义的情绪循环。

〔文风理解与运用〕
读取本轮当前选中文风的完整内容，结合当前场景理解其叙述方式。

第一段预演时，建立本轮的文风理解：

1. 叙述关注
该文风通常怎样观察人物、关系与环境？哪些细节具有叙事作用，它们如何改变人物判断、行动或读者对当前场景的理解？

2. 语言与节奏
该文风如何组织句子、衔接观察与行动、安排对白和心理活动？理解这些写法之间的关系，不仅概括为“细腻”“克制”“轻盈”等形容词。

3. 情绪呈现
该文风怎样呈现情绪的形成、变化与后果？哪些感受适合直接写出，哪些适合通过行为、对白、物件或叙述距离表现？以当前文风的具体要求为依据。

4. 适用边界
哪些写法容易使本轮偏离当前文风？检查装饰性细节、固定意象、惯性句式、刻意的幽默或讽刺，以及对参考作品的表面模仿。文风不得改变人物身份、知识、性格和已发生的事实。

随后，为当前段落确定运用方式：
先确认本段要发生的具体变化，再从上述理解中选择最适合本段的两三项特点，说明它们准备落实在哪个观察、动作、对白、心理转折或节奏安排上。

人物对白遵循各自的语言习惯；叙述的取景、组织与语言质地体现当前文风。所有细节从已有场景中生长，不为展示文风补造事实。

随后生成的完整试写必须实际执行这些选择。

第二段及后续段落，承接已经建立的文风理解，只回顾当前段落适用的部分；根据情境变化调整运用方式，避免每段重复相同手法和完整说明。

〔完整试写〕
写出即将呈现的完整自然段，遵循当前人物设定、叙述视角与文学风格，不得以提纲、摘要或写作计划代替。

〔语言筛查〕
全面审查试写内容，核对禁用字词、固定句式、人物行为、叙述视角、情节逻辑及文学风格。

对照本段的文风理解与运用计划，检查完整试写：
哪些具体句子、细节或叙述安排体现了当前文风？这些写法是否适合现场，并产生了实际叙事作用？是否沿用了历史正文的惯性表达，或使不同人物失去各自的说话方式？是否出现生硬套用、重复手法或参考作品的标志性表达？
记录实际发现的问题，并在确定文本中完成修订。文风说明与实际试写不一致时，以修订后的完整段落体现文风要求。

所有已经明确规定的禁令均须执行，不得遗漏，也不得通过机械替换近义词、拆分词语或变换表面措辞规避限制。

重点排查以下惯性表达：

① 否定转折：不是……而是……、没有……只有……、并非……只是……、与其说……不如说……，以及通过反复否定制造强调的句式。

② 心理解说：他知道、她明白、他意识到、这意味着、这说明、说到底、归根结底，以及直接替读者解释人物情绪和潜台词的旁白。

③ 抽象包装：某种情绪、一种感觉、无形的压力、微妙的变化、难以言喻、说不清道不明等缺乏实际内容的概括。

④ 动作模板：指尖微顿、喉结滚动、眸色一沉、眼底掠过、嘴角勾起、呼吸一滞、身体僵住，以及反复出现的垂眸、抬眼、攥拳和停顿。

⑤ 氛围套话：空气凝固、时间静止、世界安静、心脏漏跳、无声宣告、不容置疑、不容拒绝、无处遁形等机械化描写。

⑥ 句式八股：连续短句、三连排比、刻意单句成段、频繁使用破折号与省略号，以及“……比……更……”“明明……却……”“直到……才……”“……的时候”等公式化结构。

⑦ 伪文学表达：将普通动作过度诗化，以抽象比喻代替具体描写，用含混辞藻制造深刻感，刻意追求金句、哲理或情绪升华。

⑧ 物象隐喻：投石入水、心湖涟漪、激起波澜、投入深水、添柴加火、心底埋种、裂缝蔓延、情绪沉底等模板。重点排查将话语、目光、沉默或情绪转化为石子、水面、潮汐、火焰、针刺、刀刃、种子、锁链等物象，再通过投下、落入、刺穿、点燃、蔓延、撕裂、吞没等动作制造虚假的文学深度。禁止仅替换物体而沿用相同修辞结构。

⑨ 关系解说：替人物定义感情、宣布关系变化、提前解释潜台词，以旁白代替互动，强迫人物顿悟、和解、成长或突然改变立场。

⑩ 收尾套路：这一刻终于明白、有什么悄然改变、一切才刚刚开始、未来尚不可知、无人知道答案，以及无必要的悬念、总结和升华。

⑪ 指定禁令：清除“极”“像／如同／仿佛／好像／好似／犹如”“不是……”“没有……没有……”“够了／就够了／这就够了”“带着……”“属于……的”“……的，……的”“很他／很她／很＋姓名”“他／她／姓名＋记着／等着”“他知道／她知道／他认／我认”等指定表达，同时遵守其他已启用的写作限制。

特别检查套路化破折号：若破折号只用于制造停顿、强调情绪或套用硬转折，且没有必要的语义或节奏作用，直接删去；需要保留信息时，改用自然标点或重组句子。不要把破折号机械替换成省略号，也不要一律禁用有实际作用的破折号。

以上项目用于识别机械化表达。普通物体、合理动作与真实场景描写不因出现在示例中而一律禁止；明确列为绝对禁令的表达则必须严格排除。

发现问题时优先删除冗余内容，其次调整句式，必要时通过人物行动、对白、物品、环境与感官细节重新呈现。

禁止机械替换近义词、破坏正常词汇或牺牲情节逻辑。

只记录实际存在的问题，无违规则注明“通过”。

〔确定文本〕
存在违规时，写出修订后的完整自然段；无需修改则填写“沿用试写”。

〔篇幅记录〕
当前累计正文：n字。

-->

### 正文衔接

每次注释关闭后，立即呈现对应正文。注明“沿用试写”时原样输出试写内容，否则严格采用修订后的确定文本。

每当叙事进入新的自然段，重新开启独立预演。各段通过自然顺序对应，不设置编号，也不建立额外修订记录。

已经呈现的正文成为后续叙事的固定依据，不得撤回、替换、重复或重新生成。

人物应保持独立意志与稳定认知，时间、地点、对白承诺及事件因果必须连续。

动作应符合实际处境，对白应承担真实交流作用。避免通过重复的身体反应、抽象旁白或刻意制造冲突来推动情绪。

尊重既定的人物控制权，不擅自替用户角色作出重大决定。

### 篇幅与结束

逐段统计正式正文累计字数，不计算HTML注释及其他非正文模块。

根据剩余篇幅调整情节推进，接近目标时自然完成当前场景，不通过重复对白、动作或心理描写凑字数。

最后一段正文完成后，不再生成全文审查、第二份正文、叙事总结或额外修订。

若启用了时间栏、状态栏、人物追踪及其他附加模块，依照各模块规定的位置输出，不得被预演内容替代。

所有预演、检查、修正及篇幅记录仅保留在HTML注释内部。

</draft>`;
function offlineDraftInstructionForSettings(settings){return String(settings?.draftCotPrompt||'').trim()||offlineDraftCotInstruction}
const createOfflineSettings=()=>({rolePerspective:'third',userPerspective:'second',userAgency:'takeover',paragraphRequirement:'alternating',wordCount:1000,paragraphCountMin:13,paragraphCountMax:18,pacing:'free',style:'natural',customStyles:[],stylePromptOverrides:{},customPrompt:'',customPromptEnabled:false,draftCotEnabled:true,draftCotDeleted:false,miniTheaterEnabled:false,miniTheaterDeleted:false,miniTheaterPrompt:'',regexRules:[],prompt:offlineDefaultReplyPrompt,promptTemplates:[],activePromptTemplateId:'',promptVersion:2});
function normalizeOfflineSettings(value={}){
 const settings={...createOfflineSettings(),...(value||{})},legacyStyle=String(value?.style||'');
 settings.customStyles=(Array.isArray(value?.customStyles)?value.customStyles:[]).filter(style=>style&&typeof style==='object').map((style,index)=>({id:String(style.id||`custom-style-${index+1}`),name:String(style.name||'未命名文风').slice(0,60),prompt:String(style.prompt||'').slice(0,12000)}));
 settings.stylePromptOverrides=value?.stylePromptOverrides&&typeof value.stylePromptOverrides==='object'?{...value.stylePromptOverrides}:{};
 settings.promptTemplates=(Array.isArray(value?.promptTemplates)?value.promptTemplates:[]).filter(item=>item&&typeof item==='object').map((item,index)=>({id:String(item.id||`offline-prompt-${index+1}`),name:String(item.name||'未命名提示词').slice(0,60),content:String(item.content||'').slice(0,24000)})).filter(item=>item.content.trim());
 settings.activePromptTemplateId=settings.promptTemplates.some(item=>item.id===value?.activePromptTemplateId)?String(value.activePromptTemplateId):'';
 if(legacyStyle==='custom'&&!settings.customStyles.length&&String(value?.customStyle||'').trim())settings.customStyles.push({id:'custom-style-legacy',name:'自定义文风',prompt:String(value.customStyle).slice(0,12000)});
 if(!Object.prototype.hasOwnProperty.call(offlineWritingStyles,settings.style)&&!settings.customStyles.some(style=>style.id===settings.style))settings.style=legacyStyle==='自然写实'||!legacyStyle?'natural':(settings.customStyles[0]?.id||'natural');
 let customPrompt=String(value?.customPrompt||'').slice(0,24000);
 const cotMarker='【段落预演｜内置规则】',legacyCotEnd='所有预演模块只使用 HTML 注释包裹；正文仍按当前输出格式呈现。';
 if(customPrompt.startsWith(cotMarker)){const markerEnd=customPrompt.indexOf(legacyCotEnd);if(markerEnd>=0)customPrompt=customPrompt.slice(markerEnd+legacyCotEnd.length).replace(/^\s+/, '');else if(customPrompt.startsWith(offlineDraftCotInstruction))customPrompt=customPrompt.slice(offlineDraftCotInstruction.length).replace(/^\s+/, '')}
 settings.customPrompt=customPrompt;settings.customPromptName=String(value?.customPromptName||'额外要求').slice(0,60);
 settings.miniTheaterEnabled=Boolean(value?.miniTheaterEnabled);
 settings.miniTheaterDeleted=Boolean(value?.miniTheaterDeleted);
 settings.miniTheaterPrompt=String(value?.miniTheaterPrompt||'').slice(0,24000);if(window.IrisMiniTheater?.upgradePrompt)settings.miniTheaterPrompt=window.IrisMiniTheater.upgradePrompt(settings.miniTheaterPrompt);
 settings.draftCotDeleted=Boolean(value?.draftCotDeleted);
 settings.draftCotEnabled=settings.draftCotDeleted?false:Boolean(value?.draftCotEnabled??true);
 settings.customPromptEnabled=Boolean(settings.customPrompt.trim())&&value?.customPromptEnabled!==false;
 const legacyFind=String(value?.outputRegexFind??value?.customRegexPrompt??'').slice(0,4000),legacyEnabled=Boolean(value?.outputRegexEnabled??value?.customRegexPromptEnabled??legacyFind.trim());
 settings.regexRules=(Array.isArray(value?.regexRules)?value.regexRules:[]).filter(rule=>rule&&typeof rule==='object').map((rule,index)=>({id:String(rule.id||`offline-regex-${index+1}`),name:String(rule.name||`正则 ${index+1}`).slice(0,80),find:String(rule.find||'').slice(0,4000),replace:String(rule.replace??'').slice(0,4000),enabled:rule.enabled!==false,contextEnabled:rule.contextEnabled!==false,displayEnabled:Boolean(rule.displayEnabled),target:Array.isArray(rule.target)?(rule.target.filter(target=>target==='ai'||target==='user').length?rule.target.filter(target=>target==='ai'||target==='user'):['ai']):rule.target==='user'?['user']:['ai']})).filter(rule=>rule.find.trim());
 if(!settings.regexRules.length&&legacyEnabled)settings.regexRules.push({id:'offline-regex-legacy',name:'旧正则',find:legacyFind.trim()||offlineDraftOutputRegex,replace:String(value?.outputRegexReplace||'').slice(0,4000),enabled:true,contextEnabled:true,displayEnabled:false,target:['ai']});
 if(!settings.regexRules.some(rule=>rule.id===offlineDraftOutputRegexRuleId))settings.regexRules.push({id:offlineDraftOutputRegexRuleId,name:'隐藏段落',find:offlineDraftOutputRegex,replace:'',enabled:true,contextEnabled:true,displayEnabled:true,target:['ai']});
 if(!settings.regexRules.some(rule=>rule.id===IrisMiniTheater.ruleId))settings.regexRules.push(IrisMiniTheater.rule());
 delete settings.draftCotInExtraRequirements;delete settings.outputRegexEnabled;delete settings.outputRegexFind;delete settings.outputRegexReplace;delete settings.customRegexPrompt;delete settings.customRegexPromptEnabled;delete settings.thinkingPrompt;
 settings.prompt=String(value?.prompt||offlineDefaultReplyPrompt);if(Number(value?.promptVersion)<2&&!String(value?.prompt||'').trim())settings.prompt=offlineDefaultReplyPrompt;
 delete settings.usePreset;
 if(!['first','second','third'].includes(settings.rolePerspective))settings.rolePerspective='first';if(!['first','second','third'].includes(settings.userPerspective))settings.userPerspective='second';if(!['takeover','no-takeover'].includes(settings.userAgency))settings.userAgency='no-takeover';if(!['long','short','alternating'].includes(settings.paragraphRequirement))settings.paragraphRequirement='alternating';if(!['fast','slow','free'].includes(settings.pacing))settings.pacing='free';settings.wordCount=Math.max(100,Math.min(5000,Number(settings.wordCount)||600));for(const [key,fallback] of [['paragraphCountMin',3],['paragraphCountMax',5]])settings[key]=Math.max(1,Math.min(30,Math.floor(Number(settings[key])||fallback)));if(settings.paragraphCountMin>settings.paragraphCountMax)settings.paragraphCountMax=settings.paragraphCountMin;delete settings.longParagraphMin;delete settings.longParagraphMax;delete settings.shortParagraphMin;delete settings.shortParagraphMax;settings.promptVersion=2;return settings
}
for(const [index,role] of chars.entries()){
 const legacyCurrent=index===state.char;
 role.offlineData||={
  records:state.offlineRecords.filter(record=>record.characterIndex===index||(!Number.isInteger(record.characterIndex)&&record.characterName===role.name&&chars.findIndex(candidate=>candidate.name===record.characterName)===index)||(legacyCurrent&&!record.characterName)).map(record=>({...record,characterIndex:index}))
 };
 delete role.offlineData.presets;
 delete role.offlineData.activePresetId;delete role.offlineData.usePreset;
 if(!Array.isArray(role.offlineData.records))role.offlineData.records=[];
 if(!role.offlineData.stageMemorySessions||typeof role.offlineData.stageMemorySessions!=='object')role.offlineData.stageMemorySessions={};
 role.offlineData.settings=normalizeOfflineSettings(role.offlineData.settings);
 role.offlineMode=typeof role.offlineMode==='boolean'?role.offlineMode:(legacyCurrent&&Boolean(state.offline));
}
function currentRoleOfflineData(role=chars[state.char]){
 if(!role)return{records:state.offlineRecords,settings:createOfflineSettings()};
 role.offlineData||={records:[],settings:createOfflineSettings()};
 delete role.offlineData.presets;
 delete role.offlineData.activePresetId;delete role.offlineData.usePreset;
 if(!role.offlineData.stageMemorySessions||typeof role.offlineData.stageMemorySessions!=='object')role.offlineData.stageMemorySessions={};
 role.offlineData.settings=normalizeOfflineSettings(role.offlineData.settings);
 return role.offlineData;
}
if(chars[state.char])state.offline=Boolean(chars[state.char].offlineMode);
state.globalWorldBook=Array.isArray(state.globalWorldBook)?state.globalWorldBook:[];
state.globalWorldBooks=Array.isArray(state.globalWorldBooks)?state.globalWorldBooks:[];
if(!state.globalWorldBooks.length)state.globalWorldBooks=[{id:'global-default',name:'默认世界书',entries:state.globalWorldBook}];
state.globalWorldBooks=state.globalWorldBooks.filter(book=>book&&Array.isArray(book.entries)).map((book,index)=>({...book,id:book.id||`global-book-${index+1}`,name:book.name||`世界书 ${index+1}`,enabled:book.enabled!==false,scope:['online','offline','both'].includes(book.scope)?book.scope:'both'}));
if(!state.globalWorldBooks.length)state.globalWorldBooks=[{id:'global-default',name:'默认世界书',entries:[]}];
state.activeGlobalWorldBookId=state.globalWorldBooks.some(book=>book.id===state.activeGlobalWorldBookId)?state.activeGlobalWorldBookId:state.globalWorldBooks[0].id;
function activeGlobalWorldBook(){return state.globalWorldBooks.find(book=>book.id===state.activeGlobalWorldBookId)||state.globalWorldBooks[0]}
function resolvePromptVariables(template,values){return String(template||'').replace(/\{\{\s*([a-z_]+)\s*\}\}/gi,(match,name)=>Object.prototype.hasOwnProperty.call(values,name.toLowerCase())?String(values[name.toLowerCase()]??''):match)}
function worldBookPromptValues(character=chars[state.char],chatSettings=currentRoleChatSettings(),channel=state.offline?'offline':'online'){
 const roleBook=character?.worldBooks?.find(book=>book.id===character.activeWorldBookId)||{name:'默认世界书',entries:Array.isArray(character?.worldBook)?character.worldBook:[]},globalBook=activeGlobalWorldBook(),roleEntries=chatSettings.worldBookEnabled===false?[]:(roleBook.entries||[]).filter(entry=>entry.enabled!==false),scope=globalBook?.scope||'both',scopeMatches=scope==='both'||scope===channel,globalEntries=globalBook?.enabled===false||!scopeMatches?[]:(globalBook?.entries||[]).filter(entry=>entry.enabled!==false);
 const format=(label,book,entries)=>entries.length?`${label}「${book?.name||'世界书'}」：\n${entries.map(entry=>`${entry.name||'条目'}：${entry.content||''}`).join('\n')}`:'';
 const characterWorldbook=format('角色世界书',roleBook,roleEntries),globalWorldbook=format('全局世界书',globalBook,globalEntries),channelName=channel==='offline'?'线下':'线上';
 return{character_worldbook:characterWorldbook||'暂无已启用的角色世界书内容。',global_worldbook:globalWorldbook||`当前${channelName}模式没有可读取的全局世界书内容。`,world_background:[characterWorldbook,globalWorldbook].filter(Boolean).join('\n\n')||'当前模式没有可读取的世界书内容。'}
}
function currentWorldBackground(character=chars[state.char],chatSettings=currentRoleChatSettings()){
 return worldBookPromptValues(character,chatSettings,state.offline?'offline':'online').world_background
}
function onlinePromptVariableValues(character,bound,roleSettings,thread){
 const userName=bound?.nickname||bound?.name||'用户',characterName=character?.name||'角色',lastUser=[...thread].reverse().find(item=>item.mine),recentOnline=thread.slice(-20).map(item=>`${item.mine?userName:characterName}：${messagePromptContent(item)}`).join('\n')||'暂无线上聊天记录。';
 return{char_name:characterName,user_name:userName,char_person:'角色以自己的身份自然对话，不添加旁白。',user_person:'用户的语言、动作和心理由用户本人决定。',user_agency_rule:'不得代替用户发言、行动、决定或补写心理。',reply_length:'按当前情境自然回应，不设固定字数。',...worldBookPromptValues(character,roleSettings,'online'),writing_style:'保持自然、完整，并贴合当前角色的说话方式。',scene:'依据已发生的聊天内容回应，不擅自补造现场设定。',online_chat:recentOnline,offline_history:'',user_message:lastUser?messagePromptContent(lastUser):'暂无用户新消息。'}
}
let storageWarningShown=false;const save=()=>{try{const result=window.IrisStorage?.save(state);if(result&&typeof result.catch==='function')result.catch(()=>{if(!storageWarningShown){storageWarningShown=true;toast('本地存储空间不足，建议先导出数据备份')}})}catch{if(!storageWarningShown){storageWarningShown=true;toast('本地存储不可用，建议先导出数据备份')}}};save();
let irisKeepAliveAudio=null,irisKeepAliveAudioUrl='',irisKeepAliveState=state.settings.keepAlive?'paused':'off';
function irisOtherAudioIsPlaying(){return[...document.querySelectorAll('audio')].some(audio=>audio!==irisKeepAliveAudio&&!audio.paused&&!audio.ended)}
function irisKeepAliveArtwork(){const icon=document.querySelector('link[rel="apple-touch-icon"]');return new URL(icon?.getAttribute('href')||'assets/iris-app-icon-512.webp',document.baseURI).href}
function updateIrisKeepAliveMediaSession(active){const session=navigator.mediaSession;if(!session)return;if(!active){try{session.playbackState='none';session.metadata=null}catch{}return}try{if(typeof MediaMetadata==='function'){const artwork=irisKeepAliveArtwork();session.metadata=new MediaMetadata({title:'Iris',artist:'后台保持连接',album:'Iris',artwork:[{src:artwork,sizes:'180x180',type:'image/png'}]})}session.playbackState='playing';[['play',()=>void syncIrisKeepAlive()],['pause',()=>void stopIrisKeepAliveAudio()],['stop',()=>void stopIrisKeepAliveAudio()]].forEach(([action,handler])=>{try{session.setActionHandler(action,handler)}catch{}})}catch{}}
function ensureIrisKeepAliveAudio(){if(irisKeepAliveAudio)return irisKeepAliveAudio;const sampleRate=8000,sampleCount=80000,bytes=new Uint8Array(44+sampleCount),view=new DataView(bytes.buffer),write=(offset,value)=>[...value].forEach((character,index)=>view.setUint8(offset+index,character.charCodeAt(0)));write(0,'RIFF');view.setUint32(4,36+sampleCount,true);write(8,'WAVE');write(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,sampleRate,true);view.setUint32(28,sampleRate,true);view.setUint16(32,1,true);view.setUint16(34,8,true);write(36,'data');view.setUint32(40,sampleCount,true);bytes.fill(128,44);irisKeepAliveAudioUrl=URL.createObjectURL(new Blob([bytes],{type:'audio/wav'}));irisKeepAliveAudio=document.createElement('audio');irisKeepAliveAudio.className='iris-keepalive-audio';irisKeepAliveAudio.preload='auto';irisKeepAliveAudio.loop=true;irisKeepAliveAudio.playsInline=true;irisKeepAliveAudio.volume=1;irisKeepAliveAudio.muted=false;irisKeepAliveAudio.src=irisKeepAliveAudioUrl;irisKeepAliveAudio.addEventListener('play',()=>{irisKeepAliveState='running';updateIrisKeepAliveMediaSession(true);renderIrisKeepAliveStatus()});irisKeepAliveAudio.addEventListener('pause',()=>{if(state.settings.keepAlive&&irisKeepAliveState==='running'){irisKeepAliveState='paused';updateIrisKeepAliveMediaSession(false);renderIrisKeepAliveStatus()}});document.body.appendChild(irisKeepAliveAudio);return irisKeepAliveAudio}
function renderIrisKeepAliveStatus(){const status=$('#keepAliveStatus');if(!status)return;status.textContent=!state.settings.keepAlive?'已关闭':irisKeepAliveState==='running'?'系统播放中':irisKeepAliveState==='media'?'其他音频播放中，已让位':irisKeepAliveState==='blocked'?'请点开关授权播放':irisKeepAliveState==='paused'?'已暂停':'已开启'}
async function stopIrisKeepAliveAudio(){if(irisKeepAliveAudio&&!irisKeepAliveAudio.paused)irisKeepAliveAudio.pause();updateIrisKeepAliveMediaSession(false);irisKeepAliveState=state.settings.keepAlive?'paused':'off';renderIrisKeepAliveStatus()}
async function syncIrisKeepAlive(){if(!state.settings.keepAlive){await stopIrisKeepAliveAudio();return false}if(irisOtherAudioIsPlaying()){if(irisKeepAliveAudio&&!irisKeepAliveAudio.paused)irisKeepAliveAudio.pause();updateIrisKeepAliveMediaSession(false);irisKeepAliveState='media';renderIrisKeepAliveStatus();return false}const audio=ensureIrisKeepAliveAudio();if(!audio.paused&&!audio.ended){irisKeepAliveState='running';updateIrisKeepAliveMediaSession(true);renderIrisKeepAliveStatus();return true}try{audio.muted=false;await audio.play();irisKeepAliveState='running';updateIrisKeepAliveMediaSession(true);renderIrisKeepAliveStatus();return true}catch{irisKeepAliveState='blocked';renderIrisKeepAliveStatus();return false}}
window.IrisKeepAlive={sync:syncIrisKeepAlive,async setEnabled(enabled){state.settings.keepAlive=Boolean(enabled);save();await syncIrisKeepAlive();return irisKeepAliveState==='running'}};
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&state.settings.keepAlive)void syncIrisKeepAlive()});
document.addEventListener('play',event=>{if(event.target!==irisKeepAliveAudio&&state.settings.keepAlive)void syncIrisKeepAlive()},true);
document.addEventListener('pause',event=>{if(event.target!==irisKeepAliveAudio&&state.settings.keepAlive&&!irisOtherAudioIsPlaying())setTimeout(()=>void syncIrisKeepAlive(),250)},true);
document.addEventListener('ended',event=>{if(event.target!==irisKeepAliveAudio&&state.settings.keepAlive&&!irisOtherAudioIsPlaying())setTimeout(()=>void syncIrisKeepAlive(),250)},true);
document.addEventListener('click',()=>{if(state.settings.keepAlive&&irisKeepAliveState!=='running')void syncIrisKeepAlive()},{once:true});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const avatar=(c,active=false)=>{c=c||{};return `<span class="avatar${active?' is-active':''}" style="background:${esc(c.color||'#ededed')}">${c.avatar?`<img src="${esc(c.avatar)}" alt="">`:esc(c.initial||(c.name||'').slice(0,1))}</span>`};
const pairKey=(roleIndex=state.char,userIndex=state.user)=>`${roleIndex}-${userIndex}`;
const key=()=>`${state.char}-${state.user}-${state.offline?(state.activeOfflineThreads[pairKey()]||'offline'):'chat'}`;
const messages=()=>state.messages[key()]||(state.messages[key()]=[]);
function invitationRoleId(role){if(!role)return'';if(!role.invitationCharacterId)role.invitationCharacterId=IrisInvitations.createId();return role.invitationCharacterId}
function invitationStatusLabel(invite){return({pending:'待回应',accepted:'已接受',declined:'已婉拒',expired:'已失效',generating:'正在生成线下开场',generation_failed:'生成失败，可重试',created:'已进入线下会话'})[invite?.status]||'邀约状态未知'}
function invitationOpeningContext(invite){return`【已接受的角色邀约】\n角色邀约原因：${invite.intent}\n双方明确的见面时间：${invite.timeText}\n双方明确的见面地点：${invite.placeText}\n约定的绝对时间（仅供判断时间线）：${invite.startsAt||'未能可靠解析'}\n用户只同意了见面，不代表用户已经出门、抵达或采取了其他行动。根据角色自己的行程和当前日期，选择合理的见面前准备、等待或临近赴约节点；不得改动约定日期地点、擅自认定用户已到场，也不得替用户写未经确认的动作、言语和心理。线下开场需承接近期线上对话，不复述整段聊天，并严格遵守当前线下模式的角色设定、文风、篇幅和用户参与规则。`}
function markInvitationOpening(invite,threadKey,variantIndex){const thread=state.messages[threadKey]||[],last=[...thread].reverse().find(item=>!item.mine&&String(item.text||'').trim());if(!last)return false;last.offlineOpeningInviteId=invite.id;invite.openingVariants||=[];invite.openingVariants[variantIndex]=cloneReplyMessages(thread);invite.activeOpeningVariant=variantIndex;return true}
async function rerollInvitationOpening(inviteId,direction=1){const invite=state.invitations[inviteId],threadKey=invite?.offlineThreadKey;if(!invite||!threadKey||key()!==threadKey||!state.offline||invitationGenerationLocks.has(inviteId))return;const currentThread=state.messages[threadKey]||[];if(currentThread.at(-1)?.offlineOpeningInviteId!==inviteId)return;const variants=Array.isArray(invite.openingVariants)?invite.openingVariants:[],active=Math.max(0,Math.min(Number(invite.activeOpeningVariant)||0,Math.max(0,variants.length-1)));if(direction<0){if(variants.length<2)return;const next=(active-1+variants.length)%variants.length;state.messages[threadKey]=cloneReplyMessages(variants[next]);invite.activeOpeningVariant=next;save();render();return}if(active<variants.length-1){const next=active+1;state.messages[threadKey]=cloneReplyMessages(variants[next]);invite.activeOpeningVariant=next;save();render();return}
 const roleIndex=invite.characterIndex,userIndex=invite.userIndex,role=chars[roleIndex];if(!role||!state.users[userIndex]){toast('角色或面具已不存在，无法重新生成开场');return}invitationGenerationLocks.add(inviteId);chatReplyInFlight.add(threadKey);offlineStreamingReplies.set(threadKey,'');offlineStreamingDisplayStates.delete(threadKey);updateChatReplyIndicator();render();const generated=[];
 try{const completed=await sendOnlineMessage({feature:'offlineStory',roleIndex,userIndex,threadKey,thread:generated,invitationContext:invitationOpeningContext(invite),deferCommit:true,onStreamText:text=>updateOfflineStreamingDraft(threadKey,text)});if(completed)await finishOfflineStreamingDraft(threadKey);if(!completed||!generated.some(item=>!item.mine&&String(item.text||'').trim()))throw Error('开场白没有生成成功');const nextIndex=variants.length;state.messages[threadKey]=generated;if(!markInvitationOpening(invite,threadKey,nextIndex))throw Error('开场白内容为空');state.messages[threadKey]=cloneReplyMessages(invite.openingVariants[nextIndex]);invite.updatedAt=Date.now();save();toast(`已生成第 ${nextIndex+1} 版开场白`)}catch(error){offlineStreamingReplies.delete(threadKey);offlineStreamingDisplayStates.delete(threadKey);state.messages[threadKey]=cloneReplyMessages(variants[active]||[]);save();toast(error.message||'开场白重新生成失败')}finally{chatReplyInFlight.delete(threadKey);invitationGenerationLocks.delete(inviteId);offlineStreamingReplies.delete(threadKey);offlineStreamingDisplayStates.delete(threadKey);if(key()===threadKey)render();else updateChatReplyIndicator()}}
function saveInviteProposal(replyMessages,threadKey,role,roleIndex,userIndex){
 const message=[...replyMessages].reverse().find(item=>item&&!item.mine&&item.invitationProposal);if(!message)return;
 const proposal=IrisInvitations.normalizeProposal(message.invitationProposal);delete message.invitationProposal;if(!proposal)return;
 const roleId=invitationRoleId(role),existing=proposal.updateId&&state.invitations[proposal.updateId];
 if(existing&&existing.characterId===roleId&&existing.sourceThreadKey===threadKey&&existing.status==='pending'){
  if(proposal.cancelled){existing.status='expired';existing.updatedAt=Date.now();return}
  if(proposal.intent)existing.intent=proposal.intent;
  if(proposal.timeText){existing.timeText=proposal.timeText;existing.timePending=proposal.timePending}
  if(proposal.placeText)existing.placeText=proposal.placeText;
  if(proposal.startsAt){existing.startsAt=proposal.startsAt;existing.timePending=false}
  if(IrisInvitations.isExpired(existing))existing.status='expired';
  existing.updatedAt=Date.now();
  if(IrisInvitations.isReady(existing)){
   message.id||=`message-${IrisInvitations.createId()}`;
   for(const threadMessage of state.messages[threadKey]||[])if(threadMessage.invitationId===existing.id)delete threadMessage.invitationId;
   message.invitationId=existing.id;existing.messageId=message.id;roleInvitationLetterOpen.set(existing.id,true);roleInvitationNeedsFollowLatest=true;
  }
  return;
 }
 if(Object.values(state.invitations).some(invite=>invite?.characterId===roleId&&invite.sourceThreadKey===threadKey&&invite.status==='pending'))return;
 message.id||=`message-${IrisInvitations.createId()}`;
 const id=IrisInvitations.createId(),invite={id,characterId:roleId,characterIndex:roleIndex,userIndex,sourceThreadKey:threadKey,messageId:message.id,intent:proposal.intent,timeText:proposal.timeText,timePending:proposal.timePending,placeText:proposal.placeText,startsAt:proposal.startsAt,status:'pending',createdAt:Date.now(),updatedAt:Date.now()};
 if(IrisInvitations.isExpired(invite))invite.status='expired';
 state.invitations[id]=invite;message.invitationId=id;
}
const invitationGenerationLocks=new Set();
function enterInviteOffline(invite){
 const role=chars[invite?.characterIndex];if(!invite||invite.status!=='created'||!role||invitationRoleId(role)!==invite.characterId)return false;
 const thread=invite.offlineThreadKey,items=state.messages[thread];if(!thread||!Array.isArray(items)||!items.some(item=>!item.mine&&String(item.text||'').trim()))return false;
 state.activeOfflineThreads[pairKey(invite.characterIndex,invite.userIndex)]=thread.slice(`${invite.characterIndex}-${invite.userIndex}-`.length);
 state.char=invite.characterIndex;state.user=invite.userIndex;role.offlineMode=true;state.offline=true;save();render();return true;
}
async function handleRoleInvitation(inviteId,action){
 const invite=state.invitations[inviteId];if(!invite||state.offline||key()!==invite.sourceThreadKey||invite.characterId!==invitationRoleId(chars[state.char]))return;
 if(action==='open'){if(!enterInviteOffline(invite))toast('对应的线下会话暂时不可用');return}
 if(action==='decline'){
  if(!IrisInvitations.transition(invite,'declined'))return;
  const thread=state.messages[invite.sourceThreadKey]||(state.messages[invite.sourceThreadKey]=[]);
  thread.push({mine:true,text:'这次见面我暂时不接受。',createdAt:Date.now()});
  save();render();void requestChatReply(invite.sourceThreadKey,'normal');return;
 }
 if(action!=='accept')return;
 if(invite.status==='created'){if(!enterInviteOffline(invite))toast('对应的线下会话暂时不可用');return}
 if(!IrisInvitations.isReady(invite)){toast('请先在原线上聊天中确认邀约时间和地点');return}
 if(IrisInvitations.isExpired(invite)){IrisInvitations.transition(invite,'expired');save();render();toast('这项邀约的约定时间已过');return}
 if(invitationGenerationLocks.has(invite.id)||invite.status==='generating')return;
 const role=chars[invite.characterIndex],roleSettings=role?.chatSettings||{},userIndex=invite.userIndex,offlineThreadKey=`${invite.characterIndex}-${userIndex}-offline-invite-${invite.id}`;
 if(invite.offlineThreadKey&&state.messages[invite.offlineThreadKey]?.some(item=>!item.mine&&String(item.text||'').trim())){invite.status='created';save();enterInviteOffline(invite);return}
 if(invite.status==='pending'&&!IrisInvitations.transition(invite,'accepted'))return;
 if(!IrisInvitations.transition(invite,'generating'))return;
 invitationGenerationLocks.add(invite.id);invite.offlineThreadKey=offlineThreadKey;state.messages[offlineThreadKey]=[];save();render();
 try{
  const completed=await sendOnlineMessage({feature:'offlineStory',roleIndex:invite.characterIndex,userIndex,threadKey:offlineThreadKey,thread:state.messages[offlineThreadKey],invitationContext:invitationOpeningContext(invite),deferCommit:true});
  const created=completed&&state.messages[offlineThreadKey]?.some(item=>!item.mine&&String(item.text||'').trim());
  if(!created){delete state.messages[offlineThreadKey];delete invite.offlineThreadKey;invite.status='generation_failed';invite.updatedAt=Date.now();save();render();return}
  invite.status='created';invite.openingVariants=[];if(!markInvitationOpening(invite,offlineThreadKey,0))throw Error('开场白内容为空');invite.updatedAt=Date.now();role.chatSettings||={};role.offlineMode=true;state.activeOfflineThreads[pairKey(invite.characterIndex,userIndex)]=`offline-invite-${invite.id}`;state.char=invite.characterIndex;state.user=userIndex;state.offline=true;save();render();toast('已进入邀约线下剧情');
 }catch(error){delete state.messages[offlineThreadKey];delete invite.offlineThreadKey;invite.status='generation_failed';invite.updatedAt=Date.now();save();render();toast(error.message||'线下开场生成失败，可以重试')}
 finally{invitationGenerationLocks.delete(invite.id)}
}
let timer;function toast(s){const target=$('#toast'),message=String(s??''),isError=/(?:\bapi\b|\bmodel\b|\bfailed\b|\berror\b|request failed|请求失败|失败|错误|无法连接|未获得|没有获得)/i.test(message);target.textContent=message;target.classList.toggle('is-compact',message==='待开发');target.classList.toggle('is-error',isError);target.setAttribute('role',isError?'alert':'status');target.hidden=false;clearTimeout(timer);timer=setTimeout(()=>target.hidden=true,isError?12000:2500)}
const pendingReplyKeys=new Set(),chatReplyTimers=new Map(),chatReplyInFlight=new Set(),chatReplyTyping=new Set(),offlineStreamingReplies=new Map(),unblockChatRequests=new Map();
let activeMessageActionIndex=null,messageSelectionMode=false,messageSelectionThreadKey='',messageLongPressTimer=null,messageLongPressStart=null,longPressDidTrigger=false;
const selectedMessageIndices=new Set(),autoReplySuppressed=new Set();
const offlineExpandedStageFolds=new Set();let offlineStageFoldStateThreadKey='';
const animatedReflectionInstances=new WeakSet();
const reflectionAvatarClickTimers=new WeakMap(),lastRoleAvatarPointerUps=new WeakMap();let suppressReflectionAvatarClick=null,lastRoleAvatarPatTarget=null,lastRoleAvatarPatAt=0;
function updateChatReplyIndicator(){const threadKey=key(),inFlight=chatReplyInFlight.has(threadKey),title=$('#chatTitle'),reply=$('#reply'),status=$('#offlineReplyStatus'),hasReply=Boolean(latestReplyTurn()?.activeReplies.length);if(reply){reply.disabled=inFlight||(!hasUnansweredUserMessage()&&!hasReply);reply.setAttribute('aria-label',hasReply?'重新生成本轮回复':'让角色回复');reply.title=hasReply?'重新生成本轮回复':'让角色回复';reply.innerHTML=icon('reply')}document.querySelectorAll('.reply-variant-controls button').forEach(button=>button.disabled=inFlight);if(status){status.hidden=!(inFlight&&state.offline);if(!status.hidden){const role=chars[state.char]||{};status.innerHTML=`${avatar(role)}<span class="offline-reply-status-name">${esc(role.name||'角色')}</span><span class="offline-reply-status-label">正在回复</span><span class="chat-reply-dots" aria-hidden="true"><i></i><i></i><i></i></span>`}}if(!title)return;title.querySelector('.chat-reply-indicator')?.remove();if(!inFlight||state.offline)return;const indicator=document.createElement('span');indicator.className='chat-reply-indicator';indicator.setAttribute('role','status');indicator.setAttribute('aria-label','回复中');indicator.innerHTML='<span class="chat-reply-label">回复中</span><span class="chat-reply-dots" aria-hidden="true"><i></i><i></i><i></i></span>';title.append(indicator)}
function hasUnansweredUserMessage(thread=messages()){let waiting=false;for(const item of thread){if(item.type==='pat')continue;if(item.mine)waiting=true;else if(item.type!=='call-summary')waiting=false}return waiting}
function cloneReplyMessages(items){return items.map(item=>({...item}))}
function replyTypingDuration(message){const length=[message?.text,message?.translation,message?.voiceText,message?.imageDescription,message?.placeName,message?.detail,message?.sticker,message?.note].filter(Boolean).join('').length;return 3000+Math.min(2000,length/70*1000)}
function replyTypingMarkup(character){return `<div class="message reply-typing-message"><span class="avatar" style="background:${esc(character?.color||'#ededed')}">${character?.avatar?`<img src="${esc(character.avatar)}" alt="">`:esc(character?.initial||(character?.name||'').slice(0,1))}</span><div class="message-content"><div class="message-bubble-line"><span class="reply-typing-bubble" role="status" aria-label="正在输入"><i></i><i></i><i></i></span></div></div></div>`}
function formatOfflineStoryBodyMarkup(visible,format=true,preserveUserLineBreaks=false){const paragraphs=String(visible||'').split(preserveUserLineBreaks?/\n[ \t]*\n+/:/\n+/).filter(part=>part.trim());const inline=value=>{const escaped=esc(value);return format?escaped.replace(/(\*\*[\s\S]+?\*\*|\*(?!\*)[^*\n]+?\*(?!\*)|“[^”]*”)/g,token=>token.startsWith('*')?`<em class="offline-prose-thought">${esc(token.startsWith('**')?token.slice(2,-2):token.slice(1,-1))}</em>`:`<strong class="offline-prose-dialogue">${esc(token)}</strong>`):escaped};return paragraphs.map(part=>preserveUserLineBreaks?`<div class="offline-user-paragraph">${part.split(/\n/).map(line=>`<p class="offline-prose-paragraph">${inline(line)}</p>`).join('')}</div>`:`<p class="offline-prose-paragraph">${inline(part)}</p>`).join('')}
function renderOfflineStoryBody(text,format=true,target='ai',streaming=false){let visible=String(text||'');if(target==='ai')visible=filterOfflineSystemDisplay(IrisMiniTheater.split(visible,streaming).prose,streaming);visible=visible.replace(/\r/g,'');const settings=currentRoleOfflineData().settings;if(streaming){const boundary=visible.lastIndexOf('\n\n');if(boundary>=0)visible=applyOfflineRegexRules(visible.slice(0,boundary+2),settings,target,'display')+visible.slice(boundary+2)}else visible=applyOfflineRegexRules(visible,settings,target,'display');return formatOfflineStoryBodyMarkup(visible,format,target==='user')}
function formatOfflineExcerptTime(value){const date=new Date(value);if(!Number.isFinite(date.getTime()))return'时间未记录';const pad=part=>String(part).padStart(2,'0');return`${date.getFullYear()}/${pad(date.getMonth()+1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`}
function splitOfflineStreamingParts(source,finished=false){
 source=IrisMiniTheater.split(source,true).prose;
 const parts=[];let cursor=0;
 while(cursor<source.length){
  if(source.startsWith('<!--',cursor)){
   const close=source.indexOf('-->',cursor+4),end=close<0?source.length:close+3;
   const body=source.slice(cursor+4,close<0?end:close).trimStart();
   const isDraft=body.startsWith('段落预演')||(close<0&&'段落预演'.startsWith(body.trim()));
   parts.push({type:isDraft?'draft':'comment',text:source.slice(cursor,end),end,complete:close>=0});cursor=end;
   if(close<0)break;
  }else{
   const open=source.indexOf('<!--',cursor),limit=open<0?source.length:open;
   const separator=/\n[ \t]*\n/.exec(source.slice(cursor,limit));
   const end=separator?cursor+separator.index+separator[0].length:limit;
   parts.push({type:'prose',text:source.slice(cursor,end),end,complete:Boolean(separator)||open>=0||finished});cursor=end;
  }
 }
 return parts
}
const offlineStreamingDisplayStates=new Map();
function renderOfflineStreamingDraft(text,format=true,pendingEnd=0,finished=false,settledEnd=0){
 const settings=currentRoleOfflineData().settings;
 return splitOfflineStreamingParts(String(text||''),finished).map(part=>{
  if(part.type==='comment')return'';
  if((!part.complete&&part.end>settledEnd)||part.end===pendingEnd)return part.text.trim()?`<p class="offline-prose-paragraph offline-streaming-plain">${esc(part.text)}</p>`:'';
  if(part.type==='draft')return'';
  return formatOfflineStoryBodyMarkup(applyOfflineRegexRules(part.text,settings,'ai','display'),format)
 }).join('')
}
function renderOfflineStreamingMarkup(character=chars[state.char]){
 const threadKey=key(),text=offlineStreamingReplies.get(threadKey),display=offlineStreamingDisplayStates.get(threadKey);
 if(!state.offline||!chatReplyInFlight.has(threadKey)||!text)return'';
 const body=renderOfflineStreamingDraft(text,true,display?.pendingEnd||0,Boolean(display?.finished&&text===display.latest),display?.settled||0);
 if(!body.trim())return'';
 return `<article class="offline-prose-entry offline-streaming-entry"><header class="offline-prose-heading"><strong>${esc(character?.name||'角色')}</strong></header><div class="offline-prose-body">${body}</div></article>`
}
function paintOfflineStreamingDraft(threadKey){
 if(threadKey!==key()||!state.offline)return;
 const conversation=$('#conversation'),entry=conversation?.querySelector('.offline-streaming-entry'),markup=renderOfflineStreamingMarkup();
 if(entry){if(markup)entry.outerHTML=markup;else entry.remove()}
 else if(markup)conversation?.insertAdjacentHTML('beforeend',markup);
 if(conversation&&markup)conversation.scrollTop=conversation.scrollHeight
}
function advanceOfflineStreamingDraft(threadKey,display){
 if(display.task)return display.task;
 display.task=(async()=>{
  while(offlineStreamingDisplayStates.get(threadKey)===display){
   const next=splitOfflineStreamingParts(display.latest,display.finished).find(part=>part.complete&&part.end>display.settled);
   if(!next){offlineStreamingReplies.set(threadKey,display.latest);display.pendingEnd=0;paintOfflineStreamingDraft(threadKey);break}
   if(next.type==='comment'||!next.text.trim()){display.settled=next.end;continue}
   offlineStreamingReplies.set(threadKey,display.latest.slice(0,next.end));display.pendingEnd=next.end;paintOfflineStreamingDraft(threadKey);
   // Give the complete raw block a visible frame before replacing it with rendered text.
   await new Promise(resolve=>setTimeout(resolve,150));
   if(offlineStreamingDisplayStates.get(threadKey)!==display)return;
   display.settled=next.end;display.pendingEnd=0;paintOfflineStreamingDraft(threadKey);
   await new Promise(resolve=>setTimeout(resolve,60));
  }
 })().finally(()=>{
  display.task=null;
  if(offlineStreamingDisplayStates.get(threadKey)===display&&(offlineStreamingReplies.get(threadKey)!==display.latest||splitOfflineStreamingParts(display.latest,display.finished).some(part=>part.complete&&part.end>display.settled)))void advanceOfflineStreamingDraft(threadKey,display);
 });
 return display.task
}
function updateOfflineStreamingDraft(threadKey,text){
 const latest=String(text||'').replace(/&lt;\s*!--/gi,'<!--').replace(/--\s*&gt;/gi,'-->').replace(/\r/g,'');
 let display=offlineStreamingDisplayStates.get(threadKey);
 if(!display||!latest.startsWith(display.latest)){
  display={latest:'',settled:0,pendingEnd:0,finished:false,task:null};offlineStreamingDisplayStates.set(threadKey,display);
 }
 display.latest=latest;
 void advanceOfflineStreamingDraft(threadKey,display)
}
async function finishOfflineStreamingDraft(threadKey){
 const display=offlineStreamingDisplayStates.get(threadKey);if(!display)return;
 display.finished=true;
 do{await advanceOfflineStreamingDraft(threadKey,display)}while(offlineStreamingDisplayStates.get(threadKey)===display&&splitOfflineStreamingParts(display.latest,true).some(part=>part.complete&&part.end>display.settled))
}
function latestReplyTurn(thread=messages()){
 let userIndex=-1;for(let index=thread.length-1;index>=0;index--)if(thread[index].mine&&thread[index].type!=='pat'){userIndex=index;break}
 if(userIndex<0)return null;
 let end=userIndex+1;while(end<thread.length&&!thread[end].mine&&thread[end].type!=='call-summary')end++;
 const user=thread[userIndex],replyIndices=[];for(let index=userIndex+1;index<end;index++)if(thread[index].type!=='pat')replyIndices.push(index);const activeReplies=replyIndices.map(index=>thread[index]);
 if(activeReplies.length){
  if(!Array.isArray(user.replyVersions)||!user.replyVersions.length)user.replyVersions=[cloneReplyMessages(activeReplies)];
  user.activeReplyVersion=Math.max(0,Math.min(Number(user.activeReplyVersion)||0,user.replyVersions.length-1));
  user.replyVersions[user.activeReplyVersion]=cloneReplyMessages(activeReplies);
 }else if(!Array.isArray(user.replyVersions))user.replyVersions=[];
 return{user,userIndex,endIndex:end,lastReplyIndex:replyIndices.at(-1)??-1,activeReplies,versions:user.replyVersions,activeVersion:user.activeReplyVersion||0};
}
function replaceChatReplyMessages(thread,userIndex,endIndex,replies){const current=thread.slice(userIndex+1,endIndex),next=[];let replyIndex=0;for(const item of current){if(item.type==='pat')next.push(item);else if(replyIndex<replies.length)next.push(replies[replyIndex++])}while(replyIndex<replies.length)next.push(replies[replyIndex++]);thread.splice(userIndex+1,current.length,...next)}
function syncInvitationsToReply(thread,userIndex,invitationIds){
 const ids=[...new Set(invitationIds)].filter(id=>state.invitations[id]);if(!ids.length)return;
 let end=userIndex+1;while(end<thread.length&&!thread[end].mine&&thread[end].type!=='call-summary')end++;
 const latestReply=[...thread.slice(userIndex+1,end)].reverse().find(message=>!message.mine&&message.type!=='pat');if(!latestReply)return;
 latestReply.id||=`message-${IrisInvitations.createId()}`;
 for(const message of thread)if(ids.includes(message.invitationId))delete message.invitationId;
 latestReply.invitationId=ids[0];
 for(const id of ids){const invite=state.invitations[id];if(invite)invite.messageId=latestReply.id}
 const user=thread[userIndex];if(user?.replyVersions?.[user.activeReplyVersion])user.replyVersions[user.activeReplyVersion]=cloneReplyMessages(thread.slice(userIndex+1,end).filter(message=>message.type!=='pat'));
}
function scheduleChatReply(reset=false,threadKey=key()){
 if(state.offline||autoReplySuppressed.has(threadKey))return;
 if(!pendingReplyKeys.has(threadKey))return;
 if(chatReplyTimers.has(threadKey)){if(!reset)return;clearTimeout(chatReplyTimers.get(threadKey))}
 const timerId=setTimeout(()=>{chatReplyTimers.delete(threadKey);if(key()===threadKey)void requestChatReply(threadKey)},7000);
 chatReplyTimers.set(threadKey,timerId)
}
function noteReplyCompositionActivity(event){
 const target=event.target instanceof Element?event.target:null;
 if(!target?.closest('.phone'))return;
 const threadKey=key();
 if(chatReplyInFlight.has(threadKey))return;
 if(pendingReplyKeys.has(threadKey))scheduleChatReply(true,threadKey);
}
['pointerdown','click','input','change','scroll'].forEach(type=>document.addEventListener(type,noteReplyCompositionActivity,true));
function scrollOfflineReplyToStart(threadKey,messageIndex){
 const position=()=>{
  if(!state.offline||key()!==threadKey||messageIndex<0)return;
  const conversation=$('#conversation'),entry=conversation?.querySelector(`.offline-prose-entry[data-message-index="${messageIndex}"]`);
  if(!entry)return;
  conversation.scrollTop=Math.max(0,conversation.scrollTop+entry.getBoundingClientRect().top-conversation.getBoundingClientRect().top-conversation.clientTop-12);
  chatPinnedToBottom=false;
 };
 position();requestAnimationFrame(position)
}
async function requestChatReply(threadKey=key(),mode='normal'){
 if(key()!==threadKey||chatReplyInFlight.has(threadKey))return;
 const replyRoleIndex=state.char,replyRole=chars[replyRoleIndex],replyRoleSettings=replyRole?.chatSettings||{};
 const replyWasOffline=state.offline;
 const replyUserIndex=Number.isInteger(replyRoleSettings.userIndex)&&state.users[replyRoleSettings.userIndex]?replyRoleSettings.userIndex:(state.users[state.user]?state.user:-1);
 const thread=state.messages[threadKey]||[];
 let turn=latestReplyTurn(thread);
 if(!turn){pendingReplyKeys.delete(threadKey);return}
 const hasReply=turn.activeReplies.length>0;
 const previousReplies=cloneReplyMessages(turn.activeReplies),previousVersions=turn.versions.map(version=>cloneReplyMessages(version)),previousActiveVersion=turn.activeVersion,previousInvitationIds=[...new Set([...previousReplies,...previousVersions.flat()].map(message=>message.invitationId).filter(id=>id&&state.invitations[id]))],previousInviteStates=Object.fromEntries(previousInvitationIds.map(id=>[id,state.invitations[id].status]));
 if(mode==='normal'&&hasReply){pendingReplyKeys.delete(threadKey);return}
 if(mode==='variant'&&!hasReply)mode='normal';
 if(mode==='normal'&&!hasUnansweredUserMessage(thread)){pendingReplyKeys.delete(threadKey);return}
 if(mode==='variant'&&turn.versions.length)turn.versions[turn.activeVersion]=cloneReplyMessages(turn.activeReplies);
 const requestThread=thread.slice(0,turn.userIndex+1),storedVersions=mode==='variant'?turn.versions.map(version=>cloneReplyMessages(version)):[];
 const targetUser=turn.user;
 let blockedSmsRequest=null,offlineReplyStartMessage=null;
 const timerId=chatReplyTimers.get(threadKey);if(timerId)clearTimeout(timerId);chatReplyTimers.delete(threadKey);
 chatReplyInFlight.add(threadKey);
 if(replyWasOffline){offlineStreamingReplies.set(threadKey,'');offlineStreamingDisplayStates.delete(threadKey)}
 updateChatReplyIndicator();
 if(key()===threadKey)render();
 if(mode==='reroll'||mode==='variant'){
  replaceChatReplyMessages(thread,turn.userIndex,turn.endIndex,[]);
  if(mode==='reroll'){targetUser.replyVersions=[];targetUser.activeReplyVersion=0}
  save();render();
 }
 try{
  const completed=await sendOnlineMessage({thread:requestThread,deferCommit:true,onStreamText:replyWasOffline?(text=>updateOfflineStreamingDraft(threadKey,text)):null});
  if(replyWasOffline&&completed)await finishOfflineStreamingDraft(threadKey);
  const generated=requestThread.slice(turn.userIndex+1);
  const blockAtGeneration=!replyWasOffline&&Boolean(replyRole?.chatSettings?.blocked);
  if(blockAtGeneration)generated.forEach(message=>{message.deliveryFailed=true;message.deliveryFailedAt=Date.now()});
  if(completed&&generated.length&&blockAtGeneration&&state.users[replyUserIndex]){
   const settings=replyRole.chatSettings,blockEvent=Number(settings.blockedAt)||0;
   if(!hasCompletedBlockedSms(replyRoleIndex,replyUserIndex,blockEvent)){
    blockedSmsRequest={roleIndex:replyRoleIndex,userIndex:replyUserIndex,blockEvent,failedMessages:cloneReplyMessages(generated)};
    settings.blockedSmsPending={userIndex:replyUserIndex,blockEvent,failedMessages:cloneReplyMessages(generated)};save();
   }
  }
  const currentUserIndex=thread.indexOf(targetUser);
  if(completed&&generated.length&&currentUserIndex>=0){
   if(mode==='variant')storedVersions.push(cloneReplyMessages(generated));else storedVersions.splice(0,storedVersions.length,cloneReplyMessages(generated));
   const currentTurn=latestReplyTurn(thread);
   const isStillLatest=currentTurn?.user===targetUser;
   if(mode!=='variant'||isStillLatest){
    targetUser.replyVersions=storedVersions;
    targetUser.activeReplyVersion=storedVersions.length-1;
    offlineStreamingReplies.delete(threadKey);if(!replyWasOffline)chatReplyTyping.add(threadKey);render();
    for(const replyMessage of generated){
     if(!thread.includes(targetUser))break;
     if(!replyWasOffline)await new Promise(resolve=>setTimeout(resolve,replyTypingDuration(replyMessage)));
     const liveUserIndex=thread.indexOf(targetUser);if(liveUserIndex<0)break;
     if(!state.offline&&chars[state.char]?.chatSettings?.blocked){replyMessage.deliveryFailed=true;replyMessage.deliveryFailedAt=Date.now()}
     let insertAt=liveUserIndex+1;while(insertAt<thread.length&&!thread[insertAt].mine&&thread[insertAt].type!=='call-summary')insertAt++;
     const committedReply={...replyMessage};thread.splice(insertAt,0,committedReply);if(replyWasOffline&&!offlineReplyStartMessage)offlineReplyStartMessage=committedReply;render();
    }
    syncInvitationsToReply(thread,currentUserIndex,previousInvitationIds);
   }
   targetUser.replyVersions=storedVersions;
   pendingReplyKeys.delete(threadKey);
   if(pendingReplyKeys.has(threadKey))scheduleChatReply(true,threadKey)
   save();render();
   if(replyWasOffline)void maybeUpdateOfflineStageMemory(replyRoleIndex,replyUserIndex,threadKey,thread);else void maybeSummarizeOnlineMemory(replyRoleIndex,replyUserIndex,thread);
  }else if((mode==='reroll'||mode==='variant')&&thread.includes(targetUser)){
   const liveUserIndex=thread.indexOf(targetUser);let end=liveUserIndex+1;while(end<thread.length&&!thread[end].mine&&thread[end].type!=='call-summary')end++;
   replaceChatReplyMessages(thread,liveUserIndex,end,previousReplies);for(const [id,status] of Object.entries(previousInviteStates)){if(state.invitations[id])state.invitations[id].status=status}
   targetUser.replyVersions=previousVersions;targetUser.activeReplyVersion=previousActiveVersion;save();render();
  }
 }finally{chatReplyTyping.delete(threadKey);chatReplyInFlight.delete(threadKey);offlineStreamingDisplayStates.delete(threadKey);offlineStreamingReplies.delete(threadKey);if(blockedSmsRequest)void sendBlockedProactiveSms(blockedSmsRequest);try{if(key()===threadKey){render();if(replyWasOffline&&offlineReplyStartMessage)scrollOfflineReplyToStart(threadKey,thread.indexOf(offlineReplyStartMessage))}else updateChatReplyIndicator()}finally{displayNextSmsNotification()}}
}
function selectReplyVersion(threadKey,userIndex,direction){
 if(key()!==threadKey)return;const thread=state.messages[threadKey]||[],turn=latestReplyTurn(thread);if(!turn||turn.userIndex!==userIndex||turn.versions.length<2)return;
 const invitationIds=[...new Set(turn.versions.flat().map(message=>message.invitationId).filter(id=>id&&state.invitations[id]))],next=(turn.activeVersion+direction+turn.versions.length)%turn.versions.length,version=cloneReplyMessages(turn.versions[next]);replaceChatReplyMessages(thread,turn.userIndex,turn.endIndex,version);turn.user.activeReplyVersion=next;syncInvitationsToReply(thread,turn.userIndex,invitationIds);save();render();
}
function advanceReplyVersionOrGenerate(threadKey,userIndex){if(key()!==threadKey)return;const turn=latestReplyTurn(state.messages[threadKey]||[]);if(!turn||turn.userIndex!==userIndex)return;if(turn.activeVersion<turn.versions.length-1){selectReplyVersion(threadKey,userIndex,1);return}void requestChatReply(threadKey,'variant')}
function formatMessageTime(value,mine=false){if(!value)return'';const more=chars[state.char]?.chatSettings?.more;const zone=more?.timezoneEnabled?more.userTimezone:undefined;try{return new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',...(zone?{timeZone:zone}:{})}).format(new Date(value))}catch{return new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit'}).format(new Date(value))}}
function drawnLocationMap(seed){
 let randomState=(Number(seed)||1)>>>0;const random=()=>{randomState=(randomState*1664525+1013904223)>>>0;return randomState/4294967296};
 const roads=[];
 const addRoad=(d,width)=>roads.push(`<path d="${d}" fill="none" stroke="#dededb" stroke-width="${width+2}"/><path d="${d}" fill="none" stroke="#fff" stroke-width="${width}"/>`);
 const horizontalY=26+random()*98,secondY=22+random()*106,verticalX=35+random()*280,secondX=35+random()*280;
 const paths=[
  `M-15 ${horizontalY.toFixed(1)} C${(40+random()*50).toFixed(1)} ${(horizontalY+random()*38-19).toFixed(1)} ${(115+random()*50).toFixed(1)} ${(horizontalY+random()*38-19).toFixed(1)} 375 ${(18+random()*112).toFixed(1)}`,
  `M-15 ${secondY.toFixed(1)} C${(58+random()*40).toFixed(1)} ${(secondY+random()*32-16).toFixed(1)} ${(186+random()*48).toFixed(1)} ${(secondY+random()*32-16).toFixed(1)} 375 ${(secondY+random()*32-16).toFixed(1)}`,
  `M${verticalX.toFixed(1)} -18 C${(verticalX+random()*38-19).toFixed(1)} 32 ${(verticalX+random()*38-19).toFixed(1)} 92 ${(verticalX+random()*38-19).toFixed(1)} 168`,
  `M${secondX.toFixed(1)} -18 C${(secondX+random()*36-18).toFixed(1)} 41 ${(secondX+random()*36-18).toFixed(1)} 108 ${(secondX+random()*36-18).toFixed(1)} 168`
 ];
 addRoad(paths[0],8);addRoad(paths[1],5);addRoad(paths[2],4);addRoad(paths[3],4);
 return`<div class="location-map location-map-placeholder"><svg class="location-placeholder-art" viewBox="0 0 360 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="360" height="150" fill="#f3f3f1"/>${roads.join('')}</svg><span class="location-pin">${icon('location')}</span></div>`
}
function locationMapMarkup(coordinates,seed){
 const match=String(coordinates||'').match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);if(!match)return drawnLocationMap(seed);
 const latitude=Math.max(-85.05112878,Math.min(85.05112878,Number(match[1]))),longitude=Math.max(-180,Math.min(180,Number(match[2])));if(!Number.isFinite(latitude)||!Number.isFinite(longitude))return drawnLocationMap(seed);
 const zoom=16,count=2**zoom,worldX=(longitude+180)/360*count*256,latRad=latitude*Math.PI/180,worldY=(1-Math.asinh(Math.tan(latRad))/Math.PI)/2*count*256,tileX=Math.floor(worldX/256),tileY=Math.floor(worldY/256),localX=worldX-tileX*256,localY=worldY-tileY*256,shiftX=localX<137?1:0,shiftY=localY<52.5?1:0,startX=tileX-shiftX,startY=tileY-shiftY,tiles=Array.from({length:4},(_,index)=>{const x=((startX+index%2)%count+count)%count,y=Math.max(0,Math.min(count-1,startY+Math.floor(index/2)));return`<img src="https://tile.openstreetmap.org/${zoom}/${x}/${y}.png" alt="" loading="lazy" draggable="false">`}).join('');
 return`<div class="location-map"><div class="location-tiles" style="left:calc(50% - ${localX.toFixed(2)}px - ${shiftX*256}px);top:calc(50% - ${localY.toFixed(2)}px - ${shiftY*256}px)">${tiles}</div><span class="location-pin">${icon('location')}</span><a class="location-attribution" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap contributors</a></div>`
}
function syncChatGifts(user){
 const C=window.IrisMarketCore,index=state.users.indexOf(user);if(!C||index<0)return;
 const orders=C.persona(state,index).orders,before=JSON.stringify(orders);C.advance(state,index);const changed=C.syncGiftCards(state,index);if(changed||before!==JSON.stringify(orders))save();
}
function chatGiftOrder(message,user,character){
 const event=message?.marketEvent;if(event?.userId!==user?.irisMarketId||event?.characterId!==character?.irisMarketId)return null;
 return window.IrisMarketCore?.giftOrder(state,event)||null;
}
function chatGiftStatus(order){return order.kind==='role-gift'?(order.status==='待发货'?'商家备货中':order.status):window.IrisMarketCore.giftStatus(order)}
function giftCardMarkup(message,index,user,character){
 const order=chatGiftOrder(message,user,character);if(!order)return '<span class="chat-gift-unavailable">礼物订单已不可用</span>';
 const name=order.characterName||character?.name||'收礼人',title=order.kind==='role-gift'?`${name}送来的礼物`:`送给${name}的礼物`;
 return `<button type="button" class="chat-gift-box" data-chat-gift-order="${index}" aria-label="${esc(title)}，查看礼物详情"><img class="chat-gift-image" src="assets/chat-gift-box.webp" alt="" loading="lazy" decoding="async" onerror="this.hidden=true"><span class="chat-gift-caption">${esc(title)}</span><small>${esc(chatGiftStatus(order))}</small></button>`;
}
function openChatGiftOrder(index){
 const settings=currentRoleChatSettings(),user=state.users[Number.isInteger(settings.userIndex)?settings.userIndex:state.user],role=chars[state.char];syncChatGifts(user);
 const order=chatGiftOrder(messages()[index],user,role);if(!order){toast('这份礼物的订单已不可用');return false}
 const C=window.IrisMarketCore;sheet('Gift',order.kind==='role-gift'?`${esc(order.characterName||role.name)}送来的礼物`:`送给${esc(order.characterName||role.name)}的礼物`,`<section class="chat-gift-detail"><p>${esc(chatGiftStatus(order))}</p><div class="chat-gift-items">${order.items.map(item=>`<p class="chat-gift-line"><span class="chat-gift-item-copy"><strong>${esc(item.name)}</strong>${item.specName?`<small>${esc(item.specName)}</small>`:''}</span><b>× ${item.quantity}</b></p>`).join('')}</div><p>合计 ${esc(order.currency||'CNY')} ${C.yuan(order.totalCents)}</p>${order.note?`<blockquote>${esc(order.note)}</blockquote>`:''}<ol>${(order.shippingEvents||[]).map(event=>`<li class="${event.applied?'is-done':''}"><span>${esc(event.status)}${event.applied?'':' · 预计'}</span><time>${esc(new Date(event.at).toLocaleString())}</time></li>`).join('')}</ol>${order.giftReaction?.reply?`<p>${esc(order.characterName)}：${esc(order.giftReaction.reply)}</p>`:''}<small>订单 ${esc(order.id)}</small></section>`,{centered:true});
 return true;
}
function renderMessageContent(message,index,user,character){
  const type=message.type||'text';
 if(type==='image'){if(!message.imageDescription)return`<button type="button" class="message-image" data-image-preview="${index}" aria-label="查看图片"><img src="${esc(message.imageData||'')}" alt="${esc(message.fileName||'聊天图片')}"></button>`;const ratioMatch=String(message.imageRatio||'1:1').match(/^([1-9]\d?):([1-9]\d?)$/),ratioWidth=Number(ratioMatch?.[1])||1,ratioHeight=Number(ratioMatch?.[2])||1,ratio=`${ratioWidth} / ${ratioHeight}`,frameWidth=Math.min(240,320*ratioWidth/ratioHeight);return`<div class="image-description-card" style="--image-frame-width:${frameWidth.toFixed(1)}px;--image-ratio:${ratio}"><div class="image-description-preview"><div class="image-description-mark">${icon('image')}<span>文字描述图片</span></div><p>${esc(message.imageDescription)}</p><small>${ratioWidth}:${ratioHeight}</small></div></div>`}
 if(type==='sticker')return message.stickerUrl?`<div class="message-sticker message-sticker-custom" role="img" aria-label="${esc(message.sticker||'表情包')}"><img class="message-sticker-image" src="${esc(message.stickerUrl)}" alt="${esc(message.sticker||'表情包')}" loading="lazy" referrerpolicy="no-referrer"></div>`:`<div class="message-sticker" role="img" aria-label="表情包">${esc(message.sticker||'☺')}</div>`;
 if(type==='voice'){const duration=Math.max(1,Math.min(60,Number(message.duration)||1)),voiceWidth=Math.min(360,140+duration*6);return `<div class="voice-message-wrap" style="--voice-width:${voiceWidth}px"><button type="button" class="voice-message-card" data-voice-toggle aria-expanded="false" aria-label="展开语音文字"><span class="voice-mark" aria-hidden="true">${icon('mic')}</span><span class="voice-wave" aria-hidden="true">${[5,9,14,8,18,11,21,13,7,16,23,11,18,8,14,20,9,16,6,12,19,8,14,5].map(height=>`<i style="height:${height}px"></i>`).join('')}</span><span class="voice-duration">${duration}″</span><span class="voice-toggle-mark" aria-hidden="true"></span></button>${message.voiceText?`<p class="voice-transcript" hidden>${esc(message.voiceText)}${message.voiceTranslation?`<span class="voice-translation">${esc(message.voiceTranslation)}</span>`:''}</p>`:''}</div>`}
 if(type==='transfer'){const incoming=!message.mine,status=message.status==='accepted'?'已收下':message.status==='returned'?'已退回':incoming?'待你收下':'待角色确认',currency=message.currency||'CNY',presentation=currencyPresentation(currency),amount=formatTransferNumber(message.amount,currency),fromName=message.fromName||(incoming?character?.name:user?.nickname||user?.name||'用户'),toName=message.toName||(incoming?user?.nickname||user?.name||'用户':character?.name||'角色'),characterCurrency=message.characterCurrency||characterTransferCurrency(character),exchangeLine=message.mine&&currency==='CNY'&&characterCurrency!=='CNY'?(Number.isFinite(Number(message.characterAmount))?`约合 ${esc(characterCurrency)} ${esc(currencyPresentation(characterCurrency).symbol)}${esc(formatTransferNumber(message.characterAmount,characterCurrency))} · 参考汇率${message.characterExchangeRateDate?` ${esc(message.characterExchangeRateDate)}`:''}`:'角色货币参考汇率暂不可用'):currency!=='CNY'?(Number.isFinite(Number(message.cnyAmount))?`约合 ${currencyPresentation('CNY').symbol}${formatTransferNumber(message.cnyAmount,'CNY')} · 参考汇率${message.exchangeRateDate?` ${esc(message.exchangeRateDate)}`:''}`:'人民币参考汇率暂不可用'):'';return `<article class="transfer-message-card ${incoming?'is-incoming':'is-outgoing'}"><div class="transfer-card-head"><span class="transfer-symbol">${icon('transfer')}</span><span>转账</span><small>${status}</small></div><div class="transfer-amount"><span>${esc(currency)}</span><strong>${esc(presentation.symbol)}${esc(amount)}</strong></div>${exchangeLine?`<div class="transfer-exchange">${exchangeLine}</div>`:''}<div class="transfer-parties"><span>来自</span><strong>${esc(fromName)}</strong><i>转给</i><strong>${esc(toName)}</strong></div><div class="transfer-note"><small>备注</small><p>${esc(message.note||'转账给你')}${message.noteTranslation?`<span class="transfer-note-translation">${esc(message.noteTranslation)}</span>`:''}</p></div>${incoming&&message.status==='pending'?`<div class="transfer-actions"><button type="button" data-transfer-action="accept" data-message-index="${index}">收下</button><button type="button" data-transfer-action="return" data-message-index="${index}">退回</button></div>`:''}</article>`}
 if(type==='location')return `<article class="location-message-card">${locationMapMarkup(message.coordinates,Number(message.createdAt||0)+index)}<div class="location-info"><div class="location-name"><small>目的地</small><strong>${esc(message.placeName||'分享的位置')}</strong></div><div class="location-distance"><small>距离</small><strong>${esc(message.distance||'未注明')}</strong></div>${message.detail?`<div class="location-detail"><small>备注</small><span>${esc(message.detail)}</span></div>`:''}</div>${message.coordinates?`<div class="location-card-foot"><span>坐标</span><small>${esc(message.coordinates)}</small></div>`:''}</article>`;
 const quote=message.quote&&typeof message.quote==='object'?`<blockquote class="bubble-quote"><span class="bubble-quote-speaker">${esc(message.quote.speaker||'引用消息')}</span><p>${esc(message.quote.text||'')}</p>${message.quote.translation?`<small>${esc(message.quote.translation)}</small>`:''}</blockquote>`:'';
 return `<div class="bubble">${quote}<div class="bubble-text">${esc(message.text||'')}</div></div>`;
}
const roleInvitationLetterOpen=new Map();
let roleInvitationNeedsFollowLatest=false;
function renderInvitationEntry(invite,character=chars[invite?.characterIndex]){
 if(!invite)return'';
 const fields=`<div class="role-invitation-details"><span><small>时间</small>${esc(invite.timeText||'待定')}</span><span><small>地点</small>${esc(invite.placeText||'待定')}</span></div>`;
 const actions=invite.status==='pending'?`<div class="role-invitation-actions"><button type="button" data-invitation-action="accept" data-invitation-id="${esc(invite.id)}" ${IrisInvitations.isReady(invite)?'':'disabled'}>接受邀请</button><button type="button" data-invitation-action="decline" data-invitation-id="${esc(invite.id)}">暂不接受</button></div>${IrisInvitations.isReady(invite)?'':'<small class="role-invitation-hint">请先在聊天中确认时间和地点</small>'}`:invite.status==='created'?`<button type="button" class="role-invitation-reopen" data-invitation-action="open" data-invitation-id="${esc(invite.id)}">进入线下聊天</button>`:invite.status==='accepted'||invite.status==='generation_failed'?`<button type="button" class="role-invitation-reopen" data-invitation-action="accept" data-invitation-id="${esc(invite.id)}">${invite.status==='accepted'?'继续生成':'重试生成'}</button>`:invite.status==='generating'?'<small class="role-invitation-hint">正在生成线下开场…</small>':`<small class="role-invitation-hint">${esc(invitationStatusLabel(invite))}</small>`;
 const sender=esc(character?.name||'对方'),status=esc(invitationStatusLabel(invite)),opened=roleInvitationLetterOpen.get(String(invite.id))??invite.status!=='pending';
 return `<details class="role-invitation" data-invitation-id="${esc(invite.id)}" ${opened?'open':''}><summary class="role-invitation-envelope" aria-label="${sender}的见面邀请，展开或收起信纸"><svg class="role-invitation-folds" viewBox="0 0 360 180" preserveAspectRatio="none" aria-hidden="true"><path class="role-invitation-pocket-side" d="M0 0L184 111L0 180ZM360 0L176 111L360 180Z"/><path class="role-invitation-pocket-front" d="M0 180L163 79Q180 69 197 79L360 180Z"/><path class="role-invitation-seams" d="M0 180L163 79Q180 69 197 79L360 180"/></svg><svg class="role-invitation-flap-layer" viewBox="0 0 360 180" preserveAspectRatio="none" aria-hidden="true"><path class="role-invitation-flap" d="M0 1H360L193 100Q180 108 167 100Z"/><path class="role-invitation-flap-crease" d="M12 6H348M1 2L167 100Q180 108 193 100L359 2"/></svg><span class="role-invitation-letterhead">Private invitation</span><span class="role-invitation-envelope-status">${status}</span><span class="role-invitation-seal" aria-hidden="true"><i>I</i></span><span class="role-invitation-address">${sender}<span>致你</span></span><span class="role-invitation-unseal"><span class="role-invitation-open-label">轻触拆信</span><span class="role-invitation-close-label">收起信纸</span></span></summary><div class="role-invitation-paper"><header><strong>${sender}邀请你见面</strong><small>${status}</small></header><p>${esc(invite.intent)}</p>${fields}${actions}</div></details>`;
}
async function toggleRoleInvitationLetter(letter){
 if(!letter||letter.dataset.letterAnimating)return;
 const opening=!letter.open,paper=letter.querySelector('.role-invitation-paper');
 roleInvitationLetterOpen.set(letter.dataset.invitationId,opening);
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){letter.open=opening;return}
 letter.dataset.letterAnimating='true';
 if(paper)paper.inert=true;
 try{
  if(opening){
   letter.classList.add('is-unsealing');
   await new Promise(resolve=>setTimeout(resolve,620));
   if(!letter.isConnected)return;
   letter.open=true;letter.classList.remove('is-unsealing');
   if(paper)letter.style.setProperty('--invitation-paper-height',paper.getBoundingClientRect().height+'px');
   letter.classList.add('is-opening');
   await new Promise(resolve=>setTimeout(resolve,660));
  }else{
   if(paper)letter.style.setProperty('--invitation-paper-height',paper.getBoundingClientRect().height+'px');
   letter.classList.add('is-closing');
   await new Promise(resolve=>setTimeout(resolve,220));
   if(letter.isConnected)letter.open=false;
  }
 }finally{
  letter.classList.remove('is-unsealing','is-opening','is-closing');
  letter.style.removeProperty('--invitation-paper-height');
  delete letter.dataset.letterAnimating;
  if(paper)paper.inert=false;
 }
}
function renderVideoCallText(text){return String(text||'').split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map(part=>{if(part.startsWith('**')&&part.endsWith('**'))return`<span class="video-call-action">${esc(part.slice(2,-2))}</span>`;if(part.startsWith('*')&&part.endsWith('*'))return`<span class="video-call-action">${esc(part.slice(1,-1))}</span>`;return esc(part)}).join('')}
function showChatUserWallet(userIndex){
 const user=state.users?.[userIndex];if(!user)return;
 const accountData=window.IrisMarketCore.persona(state,userIndex);save();const wallet=accountData.wallet,name=user.nickname||user.name||'当前面具',currency=String(wallet.currency||'CNY'),known=Number.isSafeInteger(wallet.balanceCents),amount=known?`${currency==='CNY'?'¥':`${esc(currency)} `}${(wallet.balanceCents/100).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2})}`:'余额未设定',account=String(wallet.accountNumber||'尚未建立账户').replace(/(\d{4})(?=\d)/g,'$1 '),reference=currency!=='CNY'&&known&&Number.isFinite(wallet.cnyReference?.rate)&&wallet.cnyReference.rate>0?`<small class="market-cny-reference">≈ ¥${(Math.round(wallet.balanceCents*wallet.cnyReference.rate)/100).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2})} 人民币</small>`:'';
 const card=`<div class="market-bank-card chat-user-bank-card"><header><span>${esc(wallet.bankName||'IRIS BANK')}</span><span class="market-card-type">DEBIT</span><svg class="market-card-contactless" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9a5 5 0 0 1 0 6M11 6a10 10 0 0 1 0 12M15 3a15 15 0 0 1 0 18"/></svg></header><div class="market-card-chip" aria-hidden="true"><svg viewBox="0 0 40 30"><rect x="1" y="1" width="38" height="28" rx="5"/><path d="M14 1v8H1m25-8v8h13M14 29v-8H1m25 8v-8h13M14 9h12v12H14zM1 15h13m12 0h13"/></svg></div><small>可用余额 · ${esc(currency)}</small><strong>${amount}</strong>${reference}<div class="market-card-number">${esc(account)}</div><footer><span>${esc(user.name||name)}</span><span class="market-card-expiry"><small>VALID THRU</small>${esc(wallet.accountExpiry||'— / —')}</span></footer></div>`;
 sheet('Bank Card',`${esc(name)}`,`<div class="chat-bank-flipper"><div class="chat-bank-rotor"><div class="chat-bank-face chat-bank-front" role="button" tabindex="0" aria-label="翻面查看流水">${card}<span class="chat-bank-flip-hint">点击卡片 · 查看流水</span></div><section class="chat-bank-face chat-bank-back" inert><header><strong>账户流水</strong><button type="button" data-bank-front>返回卡面 ↻</button></header><nav aria-label="收支筛选"><button type="button" data-bank-kind="all" class="is-active">全部</button><button type="button" data-bank-kind="income">收入</button><button type="button" data-bank-kind="expense">支出</button></nav><div class="chat-bank-period"><label>时间 <select aria-label="流水时间范围"><option value="0">全部时间</option><option value="7">最近 7 天</option><option value="30">最近 30 天</option><option value="90">最近 90 天</option></select></label><button type="button" data-bank-sort>最新在前 ↓</button></div><div class="chat-bank-ledger" aria-live="polite"></div></section></div></div>`,{centered:true});$('#sheet .sheet-head h2')?.classList.add('chat-bank-sheet-title');
 const panel=$('#sheet'),flipper=panel.querySelector('.chat-bank-flipper'),front=panel.querySelector('.chat-bank-front'),back=panel.querySelector('.chat-bank-back');let kind='all',days=0,ascending=false;
 const renderLedger=()=>{const rows=accountData.ledger.filter(row=>(kind==='all'||(kind==='income'?row.amountCents>0:row.amountCents<0))&&(!days||row.createdAt>=Date.now()-days*86400000)).slice().sort((a,b)=>ascending?a.createdAt-b.createdAt:b.createdAt-a.createdAt);panel.querySelector('.chat-bank-ledger').innerHTML=rows.length?rows.map(row=>`<article><div><strong>${esc(row.description||'账户变动')}</strong><time>${esc(new Date(row.createdAt).toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}))}</time></div><b>${row.amountCents>0?'+':'−'}${esc(row.currency||currency)} ${(Math.abs(row.amountCents)/100).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2})}</b></article>`).join(''):'<p class="chat-bank-empty">这段时间暂无流水</p>'};
 let flipBusy=false;
 const flip=value=>{
  if(flipBusy)return;const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  flipBusy=true;front.inert=true;back.inert=true;
  flipper.classList.toggle('is-flipped',value);flipper.classList.toggle('is-turning-back',!value);flipper.classList.add('is-turning');
  window.setTimeout(()=>{flipper.classList.remove('is-turning','is-turning-back');flipBusy=false;front.inert=value;back.inert=!value;if(flipper.isConnected)(value?back.querySelector('button'):front).focus({preventScroll:true})},reduced?0:820);
 };
 front.onclick=()=>{renderLedger();flip(true)};front.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();front.click()}};panel.querySelector('[data-bank-front]').onclick=()=>flip(false);
 panel.querySelectorAll('[data-bank-kind]').forEach(button=>button.onclick=()=>{kind=button.dataset.bankKind;panel.querySelectorAll('[data-bank-kind]').forEach(node=>{node.classList.toggle('is-active',node===button);node.setAttribute('aria-pressed',String(node===button))});renderLedger()});panel.querySelector('.chat-bank-period select').onchange=event=>{days=Number(event.target.value);renderLedger()};panel.querySelector('[data-bank-sort]').onclick=event=>{ascending=!ascending;event.currentTarget.textContent=ascending?'最早在前 ↑':'最新在前 ↓';renderLedger()};
}
function recordChatPat(actor){
 const role=chars[state.char];if(!role||state.offline)return;const roleName=role.nickname||role.name||'角色';
 messages().push({id:`pat-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,type:'pat',mine:actor==='user',patBy:actor,actorName:actor==='role'?roleName:'我',targetName:actor==='role'?'我':roleName,characterId:role.irisMarketId,createdAt:Date.now()});save();render();
}
function triggerRoleAvatarPat(avatarButton){
 const now=Date.now();if(lastRoleAvatarPatTarget===avatarButton&&now-lastRoleAvatarPatAt<650)return;lastRoleAvatarPatTarget=avatarButton;lastRoleAvatarPatAt=now;
 const clickTimer=reflectionAvatarClickTimers.get(avatarButton);if(clickTimer)clearTimeout(clickTimer);reflectionAvatarClickTimers.delete(avatarButton);
 if(avatarButton.matches('[data-role-reflection]')){suppressReflectionAvatarClick=avatarButton;setTimeout(()=>{if(suppressReflectionAvatarClick===avatarButton)suppressReflectionAvatarClick=null},650)}
 recordChatPat('user');
}
function renderConversation(user,character,conversationItems=messages(),videoCall=false){
 if(!videoCall&&!state.offline)syncChatGifts(user);
 if(!videoCall&&cleanSplitInternalReplyLeakage(conversationItems))save();
 const items=conversationItems;
 const latestTurn=videoCall?null:latestReplyTurn(items),latestReplyIndex=latestTurn?.lastReplyIndex??-1;
 const threadKey=key();
 const foldStarts=new Map(),foldedMessageIndexes=new Set();
 if(state.offline&&!videoCall&&!messageSelectionMode){
  let foldedThrough=-1;
  for(const range of offlineStageFoldRanges(threadKey,items)){
   if(range.startIndex<=foldedThrough)continue;
   const foldKey=`${threadKey}:${range.sessionId}:${range.fromRound}-${range.toRound}`;
   const expanded=offlineExpandedStageFolds.has(foldKey);
   foldStarts.set(range.startIndex,{...range,foldKey,expanded});
   if(!expanded)for(let index=range.startIndex;index<=range.endIndex;index++)foldedMessageIndexes.add(index);
   foldedThrough=range.endIndex;
  }
 }
 const rendered=items.map((message,index)=>{
  const fold=foldStarts.get(index);
  const foldMarkup=fold?`<button type="button" class="offline-stage-fold" data-offline-stage-fold="${esc(fold.foldKey)}" aria-expanded="${fold.expanded?'true':'false'}" aria-label="${fold.expanded?'收起':'展开'}已总结的第 ${fold.fromRound} 至 ${fold.toRound} 轮">${fold.expanded?'▾':'▸'} 已总结 · 第${fold.fromRound}—${fold.toRound}轮</button>`:'';
  if(fold&&!fold.expanded)return foldMarkup;
  if(foldedMessageIndexes.has(index))return '';
  const type=message.type||'text';
  if((type==='gift-card'||(type==='market-event'&&message.marketEvent?.type==='role-gift'))&&!videoCall)return `<div class="chat-gift-row">${giftCardMarkup(message,index,user,character)}</div>`;
  if(type==='pat')return `<div class="chat-pat-row" data-message-index="${index}" role="status"><span class="chat-pat-card">${esc(message.patBy==='role'?`${message.actorName||character?.name||'角色'}拍了拍我`:`我拍了拍${message.targetName||character?.name||'角色'}`)}</span></div>`;
  if(!videoCall&&type==='call-summary'){const time=message.createdAt?new Intl.DateTimeFormat('zh-CN',{hour:'2-digit',minute:'2-digit'}).format(new Date(message.createdAt)):'';const callAction=activeMessageActionIndex===index&&!messageSelectionMode?`<div class="message-action-menu" role="toolbar" aria-label="通话记录操作"><button type="button" data-message-action="delete" data-message-index="${index}">删除</button></div>`:'';return `<article class="call-summary-message" data-message-index="${index}">${callAction}<div class="call-summary-kicker"><i></i><span>Video Call</span><i></i></div><button type="button" class="call-summary-open" data-call-summary="${esc(message.id||'')}" aria-label="查看通话总结和逐条记录"><span class="call-summary-copy"><strong>视频通话已结束</strong><small>${esc(message.characterName||character?.name||'角色')} · ${esc(message.duration||'')} · ${esc(time)}</small></span><span class="call-summary-link">查看回顾 <i>›</i></span></button></article>`}
  const previousSame=!foldedMessageIndexes.has(index-1)&&!foldStarts.has(index)&&items[index-1]?.mine===message.mine,nextSame=!foldedMessageIndexes.has(index+1)&&!foldStarts.has(index+1)&&items[index+1]?.mine===message.mine;
  const groupClass=previousSame?(nextSame?'group-middle':'group-last'):(nextSame?'group-first':'group-single');
  const avatarClass=videoCall?(previousSame?' is-group-hidden':''):(nextSame?' is-group-hidden':'');
  let messageAvatar=message.mine?`<button type="button" class="avatar chat-user-wallet-avatar${avatarClass}" data-chat-user-wallet="${Math.max(0,state.users?.indexOf(user)??state.user)}" aria-label="查看${esc(user?.nickname||user?.name||'用户')}的银行卡">${user?.avatar?`<img src="${esc(user.avatar)}" alt="">`:esc((user?.nickname||user?.name||'').slice(0,1))}</button>`:avatar(character).replace('class="avatar',`class="avatar${avatarClass}`);
  const reflectionHasContent=message.reflection&&[message.reflection.thought,message.reflection.status,message.reflection.thoughtTranslation,message.reflection.statusTranslation].some(value=>String(value||'').trim());
  if(!videoCall&&!message.mine&&reflectionHasContent){
   const hasUnreadThought=Boolean(String(message.reflection.thought||'').trim()||String(message.reflection.thoughtTranslation||'').trim()),unread=Boolean(hasUnreadThought&&message.reflection.generatedAt&&!message.reflection.readAt),animateReflection=unread&&!message.reflection.animationPlayedAt&&!animatedReflectionInstances.has(message.reflection);if(animateReflection){animatedReflectionInstances.add(message.reflection);message.reflection.animationPlayedAt=Date.now();save()}
   messageAvatar=avatar(character).replace('<span class="avatar','<button type="button" data-role-reflection="'+index+'" aria-label="'+(unread?'查看未读心声与状态':'查看心声与状态')+'" class="avatar reflection-avatar').replace('</span>',(unread?'<span class="reflection-unread-tag'+(animateReflection?' is-new':'')+'" aria-hidden="true"><svg viewBox="0 0 28 18"><path d="M5 1H21Q22 1 22.7 1.7L26.3 5.3Q27 6 27 7V13Q27 17 23 17H5Q1 17 1 13V5Q1 1 5 1Z"/></svg><span class="reflection-tag-dots"><i></i><i></i><i></i></span></span>':'')+'</button>');
  }
  const timestamp=!state.offline&&!nextSame&&message.createdAt?`<time class="message-time">${formatMessageTime(message.createdAt,message.mine)}</time>`:'';
  const content=renderMessageContent(message,index,user,character);
  const deliveryStatus=!message.mine&&message.deliveryFailed?'<span class="message-delivery-failed" role="img" aria-label="发送失败" title="发送失败">!</span>':'';
  const hasReplyControls=index===latestReplyIndex;
  const replyCanAdvance=latestTurn?.versions.length>=2&&latestTurn.activeVersion<latestTurn.versions.length-1;
  const replyControls=hasReplyControls?`<div class="reply-variant-controls" aria-label="角色回复版本">${latestTurn.versions.length>=2?`<button type="button" data-reply-previous="${latestTurn.userIndex}" aria-label="切换到上一版回复" title="查看上一版回复">${icon('previous')}</button>`:`<span class="reply-variant-spacer" aria-hidden="true"></span>`}<span class="reply-variant-count" ${latestTurn.versions.length>=2?'':'aria-hidden="true"'}>${latestTurn.versions.length>=2?`${latestTurn.activeVersion+1} / ${latestTurn.versions.length}`:''}</span><button type="button" data-reply-next="${latestTurn.userIndex}" aria-label="${replyCanAdvance?'查看下一版回复':'生成新回复并保留旧回复'}" title="${replyCanAdvance?'查看下一版回复':'生成另一版回复'}">${icon('next')}</button></div>`:'';
  if(videoCall)return `<div class="message video-call-message ${message.mine?'mine':''} ${previousSame?'is-grouped':''} ${groupClass}">${messageAvatar}<div class="message-content"><div class="video-call-text">${renderVideoCallText(message.text||'')}</div></div></div>`;
  const selected=messageSelectionMode&&messageSelectionThreadKey===threadKey&&selectedMessageIndices.has(index);
  const actionPanel=activeMessageActionIndex===index&&!messageSelectionMode?`<div class="message-action-menu" role="toolbar" aria-label="消息操作"><button type="button" data-message-action="edit" data-message-index="${index}" ${type==='text'?'':'disabled'}>编辑</button><button type="button" data-message-action="quote" data-message-index="${index}">引用</button><button type="button" data-message-action="delete" data-message-index="${index}">删除</button><button type="button" data-message-action="select" data-message-index="${index}">多选</button></div>`:'';
  if(state.offline&&!videoCall){
   const speaker=message.mine?(user?.name||'用户'):(character?.name||'角色'),reflectionAction=reflectionHasContent?`<button type="button" class="offline-prose-reflection" data-role-reflection="${index}" aria-label="查看心声与状态">心声</button>`:'',offlineExcerpt=!previousSame?`<span class="offline-prose-excerpt">摘录于 ${esc(formatOfflineExcerptTime(message.createdAt))}</span>`:'';
   const offlineQuote=message.quote?`<blockquote class="offline-prose-quote"><small>${esc(message.quote.speaker||'引用内容')}</small><p>${esc(message.quote.text||'')}</p></blockquote>`:'';
   const offlineBody=type==='text'?`${offlineQuote}${message.mine?renderOfflineStoryBody(message.text||'',false,'user'):renderOfflineStoryBody(message.text||'',true,'ai')}`:content;
   const openingInvite=message.offlineOpeningInviteId&&items.at(-1)===message?state.invitations[message.offlineOpeningInviteId]:null,openingVariants=openingInvite?.openingVariants||[],openingActive=Math.max(0,Math.min(Number(openingInvite?.activeOpeningVariant)||0,Math.max(0,openingVariants.length-1))),openingBusy=Boolean(openingInvite&&invitationGenerationLocks.has(openingInvite.id)),openingControls=openingInvite?`<div class="reply-variant-controls offline-opening-controls" aria-label="线下开场白版本">${openingVariants.length>1?`<button type="button" data-offline-opening-previous="${esc(openingInvite.id)}" aria-label="查看上一版开场白" title="查看上一版开场白" ${openingBusy?'disabled':''}>${icon('previous')}</button>`:`<span class="reply-variant-spacer" aria-hidden="true"></span>`}<span class="reply-variant-count">${openingActive+1} / ${Math.max(1,openingVariants.length)}</span><button type="button" data-offline-opening-next="${esc(openingInvite.id)}" aria-label="${openingActive<openingVariants.length-1?'查看下一版开场白':'重新生成开场白'}" title="${openingActive<openingVariants.length-1?'查看下一版开场白':'重新生成开场白'}" ${openingBusy?'disabled':''}>${icon('next')}</button></div>`:'';
   const showSpeaker=!previousSame||Boolean(reflectionAction);
   return `${foldMarkup}<article class="message offline-prose-entry ${message.mine?'is-user':''} ${previousSame?'is-continuation':''} ${nextSame?'has-next-same-speaker':''} ${hasReplyControls?'has-reply-variants':''} ${selected?'is-selected':''} ${messageSelectionMode?'selection-mode':''}" data-message-index="${index}">${actionPanel}${showSpeaker?`<header class="offline-prose-heading"><span class="offline-prose-author">${!previousSame?`<strong>${esc(speaker)}</strong>`:''}${offlineExcerpt}</span>${reflectionAction}</header>`:''}<div class="offline-prose-body">${offlineBody}</div>${!message.mine?IrisMiniTheater.markup(message,key(),esc):''}${message.translation?`<div class="offline-prose-translation">${esc(message.translation)}</div>`:''}${replyControls}${openingControls}${messageSelectionMode?`<span class="message-selection-check" aria-hidden="true">${selected?'✓':''}</span>`:''}</article>`
  }
  const invite=message.invitationId?state.invitations[message.invitationId]:null,inviteMarkup=!state.offline&&!message.mine&&invite&&String(invite.messageId)===String(message.id)?renderInvitationEntry(invite,character):'';
  return `<div class="message ${message.mine?'mine':''} ${previousSame?'is-grouped':''} ${groupClass}${hasReplyControls?' has-reply-variants':''} ${selected?'is-selected':''} ${messageSelectionMode?'selection-mode':''} message-type-${esc(type)}${type==='image'&&message.imageDescription?' message-image-description':''}" data-message-index="${index}">${actionPanel}${messageAvatar}<div class="message-content"><div class="message-bubble-line">${message.mine?timestamp:''}${deliveryStatus?`<div class="message-delivery-anchor">${content}${deliveryStatus}</div>`:content}${message.mine?'':timestamp}</div>${message.translation?`<div class="bubble-translation">${esc(message.translation)}</div>`:''}${replyControls}${inviteMarkup}</div>${messageSelectionMode?`<span class="message-selection-check" aria-hidden="true">${selected?'✓':''}</span>`:''}</div>`;
 }).join('');
 return rendered+(messageSelectionMode&&messageSelectionThreadKey===threadKey?`<div class="message-selection-bar"><span>已选 ${selectedMessageIndices.size} 条</span><button type="button" data-selection-cancel>取消</button><button type="button" data-selection-delete ${selectedMessageIndices.size?'':'disabled'}>删除所选</button></div>`:'');
}
function openMessageEditor(index){
 const message=messages()[index];if(!message||message.type&&message.type!=='text'){toast('目前只能编辑文字消息');return}
 const original=String(message.text||''),translation=String(message.translation||'');
 sheet('Edit Message','修改后会更新聊天记录和后续记忆',`<form id="messageEditForm" class="message-edit-form"><label>消息内容<textarea name="text" rows="5" maxlength="12000" required>${esc(original)}</textarea></label>${translation?`<label>译文<textarea name="translation" rows="2" maxlength="12000">${esc(translation)}</textarea></label>`:''}<button class="primary" type="submit">保存修改</button></form>`,{centered:true});$('#sheet').classList.add('is-message-edit');
 $('#messageEditForm').onsubmit=event=>{event.preventDefault();const form=event.currentTarget,current=messages()[index];if(!current)return;const next=form.elements.text.value.trim();if(!next){toast('消息内容不能为空');return}current.text=next;if(translation)current.translation=form.elements.translation.value.trim();invalidateDeletedContentFromMemory();closeSheet();activeMessageActionIndex=null;save();render();toast('消息已更新')};
}
function invalidateDeletedContentFromMemory(){
 if(state.offline)return;const role=chars[state.char];if(!role)return;role.chatSettings||={};const memory={...defaultOnlineMemory,...(role.chatSettings.memory||{})};
 if(memory.summaryText||Number(memory.summaryThroughRound)>0){memory.summaryText='';memory.summaryThroughRound=0;memory.summaryUpdatedAt=0;memory.summaryError='';role.chatSettings.memory=memory;toast('自动记忆摘要已清空，后续总结将按当前聊天记录重新生成')}
}
function removeMessagesByIndices(indices){
 const thread=messages(),descending=[...new Set(indices)].filter(index=>Number.isInteger(index)&&index>=0&&index<thread.length).sort((a,b)=>b-a);if(!descending.length)return;const removedInviteIds=descending.map(index=>thread[index]?.invitationId).filter(Boolean);
 descending.forEach(index=>thread.splice(index,1));removedInviteIds.forEach(id=>{delete state.invitations[id]});invalidateDeletedContentFromMemory();
 const threadKey=key(),replyTimer=chatReplyTimers.get(threadKey);if(replyTimer)clearTimeout(replyTimer);chatReplyTimers.delete(threadKey);pendingReplyKeys.delete(threadKey);autoReplySuppressed.add(threadKey);
 activeMessageActionIndex=null;messageSelectionMode=false;selectedMessageIndices.clear();messageSelectionThreadKey='';save();render();toast(`已删除 ${descending.length} 条消息`);
}
function quoteMessage(index){
 const message=messages()[index];if(!message)return;const roleSettings=currentRoleChatSettings(),userIndex=Number.isInteger(roleSettings.userIndex)?roleSettings.userIndex:state.user,speaker=message.mine?(state.users[userIndex]?.nickname||state.users[userIndex]?.name||'我'):(chars[state.char]?.name||'角色'),text=messagePromptContent(message).trim();if(!text){toast('这条消息没有可引用的文字');return}
 input();const field=$('#messageInput');field.dataset.quoteDraft=JSON.stringify({speaker,text:message.text||text,translation:message.translation||''});showQuoteDraft(JSON.parse(field.dataset.quoteDraft));field.focus();updateComposerAction();activeMessageActionIndex=null;render();
}
function showQuoteDraft(quote){
 let preview=$('#quoteComposerPreview');if(!preview){preview=document.createElement('div');preview.id='quoteComposerPreview';preview.className='quote-composer-preview';$('#composer').parentElement.insertBefore(preview,$('#composer'))}
 preview.innerHTML=`<div><span>${esc(quote.speaker||'引用消息')}</span><p>${esc(quote.text||'')}</p></div><button type="button" aria-label="取消引用" data-quote-cancel>×</button>`;preview.hidden=false;preview.querySelector('[data-quote-cancel]').onclick=()=>{delete $('#messageInput').dataset.quoteDraft;preview.remove()};
}
function toggleMessageSelection(index){
 if(messageSelectionThreadKey!==key()){selectedMessageIndices.clear();messageSelectionThreadKey=key()}
 messageSelectionMode=true;activeMessageActionIndex=null;if(selectedMessageIndices.has(index))selectedMessageIndices.delete(index);else selectedMessageIndices.add(index);render();
}
function bindConversationMedia(container=$('#conversation')){
 IrisMiniTheater.mount(container);
 if(!container.dataset.invitationToggleTracking){container.dataset.invitationToggleTracking='true';container.addEventListener('toggle',event=>{const letter=event.target;if(letter instanceof HTMLDetailsElement&&letter.matches('.role-invitation[data-invitation-id]'))roleInvitationLetterOpen.set(letter.dataset.invitationId,letter.open)},true)}
 if(container===$('#conversation')&&!container.dataset.chatScrollTracking){container.dataset.chatScrollTracking='true';container.addEventListener('scroll',()=>{chatPinnedToBottom=container.scrollHeight-container.clientHeight-container.scrollTop<48},{passive:true});container.addEventListener('load',event=>{if(event.target instanceof HTMLImageElement&&event.target.closest('.message')&&chatPinnedToBottom)requestAnimationFrame(()=>{if(container.isConnected&&chatPinnedToBottom)container.scrollTop=container.scrollHeight})},true)}
 if(container===$('#conversation')&&!container.dataset.messageActions){
  container.dataset.messageActions='true';
  if(!document.documentElement.dataset.messageActionDismiss){document.documentElement.dataset.messageActionDismiss='true';document.addEventListener('click',event=>{if(activeMessageActionIndex===null)return;const target=event.target instanceof Element?event.target:null;if(target?.closest('.message-action-menu'))return;activeMessageActionIndex=null;render()})}
  const cancelLongPress=()=>{clearTimeout(messageLongPressTimer);messageLongPressTimer=null;messageLongPressStart=null};
  container.addEventListener('pointerdown',event=>{longPressDidTrigger=false;const target=event.target instanceof Element?event.target:null,message=target?.closest('.message[data-message-index],.call-summary-message[data-message-index]'),callSummary=message?.matches('.call-summary-message');if(!message||(!callSummary&&target.closest('button,a,input,textarea,summary,.offline-mini-theater,[contenteditable="true"]'))||(callSummary&&target.closest('.message-action-menu')))return;if(messageSelectionMode)return;cancelLongPress();const index=Number(message.dataset.messageIndex);messageLongPressStart={x:event.clientX,y:event.clientY,index};messageLongPressTimer=setTimeout(()=>{activeMessageActionIndex=index;longPressDidTrigger=true;messageLongPressTimer=null;messageLongPressStart=null;render()},520)});
  container.addEventListener('click',event=>{if(!longPressDidTrigger)return;longPressDidTrigger=false;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation()},true);
  container.addEventListener('pointermove',event=>{if(!messageLongPressStart)return;if(Math.hypot(event.clientX-messageLongPressStart.x,event.clientY-messageLongPressStart.y)>10)cancelLongPress()},{passive:true});
  ['pointerup','pointercancel','pointerleave'].forEach(type=>container.addEventListener(type,cancelLongPress,{passive:true}));
  container.addEventListener('pointerup',event=>{if(event.pointerType!=='touch'||state.offline||messageSelectionMode)return;const target=event.target instanceof Element?event.target:null,avatarButton=target?.closest('.message:not(.mine) .avatar:not(.chat-user-wallet-avatar)');if(!avatarButton)return;const previous=lastRoleAvatarPointerUps.get(container),now=Date.now();if(previous?.avatar===avatarButton&&now-previous.at<450&&Math.hypot(event.clientX-previous.x,event.clientY-previous.y)<28){event.preventDefault();lastRoleAvatarPointerUps.delete(container);triggerRoleAvatarPat(avatarButton)}else lastRoleAvatarPointerUps.set(container,{avatar:avatarButton,at:now,x:event.clientX,y:event.clientY})},{passive:false});
  container.addEventListener('dblclick',event=>{if(state.offline||messageSelectionMode)return;const target=event.target instanceof Element?event.target:null,avatarButton=target?.closest('.message:not(.mine) .avatar:not(.chat-user-wallet-avatar)');if(!avatarButton)return;event.preventDefault();event.stopPropagation();triggerRoleAvatarPat(avatarButton)});
  container.addEventListener('contextmenu',event=>{const target=event.target instanceof Element?event.target:null,message=target?.closest('.message[data-message-index]');if(!message||target.closest('button,a,input,textarea'))return;event.preventDefault();cancelLongPress();activeMessageActionIndex=Number(message.dataset.messageIndex);render()});
   container.addEventListener('click',event=>{if(longPressDidTrigger){longPressDidTrigger=false;event.preventDefault();event.stopPropagation();return}const target=event.target instanceof Element?event.target:null;if(!target)return;
   const userWalletAvatar=target.closest('[data-chat-user-wallet]');if(userWalletAvatar){event.preventDefault();event.stopPropagation();showChatUserWallet(Number(userWalletAvatar.dataset.chatUserWallet));return}
   const invitationEnvelope=target.closest('.role-invitation-envelope');if(invitationEnvelope){event.preventDefault();event.stopPropagation();if(messageSelectionMode){const message=invitationEnvelope.closest('.message[data-message-index]');if(message)toggleMessageSelection(Number(message.dataset.messageIndex));return}void toggleRoleInvitationLetter(invitationEnvelope.closest('.role-invitation'));return}
   const invitationButton=target.closest('[data-invitation-action]');if(invitationButton){event.preventDefault();event.stopPropagation();void handleRoleInvitation(invitationButton.dataset.invitationId,invitationButton.dataset.invitationAction);return}
   const stageFold=target.closest('[data-offline-stage-fold]');if(stageFold){event.preventDefault();event.stopPropagation();const foldKey=stageFold.dataset.offlineStageFold;if(offlineExpandedStageFolds.has(foldKey))offlineExpandedStageFolds.delete(foldKey);else offlineExpandedStageFolds.add(foldKey);render();return}
   const actionButton=target.closest('[data-message-action]');if(actionButton){event.preventDefault();event.stopPropagation();const index=Number(actionButton.dataset.messageIndex),action=actionButton.dataset.messageAction,item=messages()[index];activeMessageActionIndex=null;if(action==='edit')openMessageEditor(index);else if(action==='quote')quoteMessage(index);else if(action==='delete'&&item?.type==='call-summary'){if(window.confirm('删除后，这条通话记录会从当前聊天和对应的线上记忆中移除。确定删除吗？')){if(deleteCallSummary(item.id)){render();toast('通话记录已删除')}}else render()}else if(action==='delete'){if(window.confirm('删除这条消息？它会从聊天记录和后续记忆总结中移除。'))removeMessagesByIndices([index]);else render()}else if(action==='select')toggleMessageSelection(index);return}
   if(target.closest('[data-selection-cancel]')){messageSelectionMode=false;selectedMessageIndices.clear();messageSelectionThreadKey='';render();return}
   if(target.closest('[data-selection-delete]')){if(!selectedMessageIndices.size)return;if(window.confirm(`删除选中的 ${selectedMessageIndices.size} 条消息？它们会从聊天记录和后续记忆总结中移除。`))removeMessagesByIndices([...selectedMessageIndices]);return}
   if(messageSelectionMode){const message=target.closest('.message[data-message-index]');if(message&&!target.closest('button,a,input,textarea'))toggleMessageSelection(Number(message.dataset.messageIndex));return}
   if(activeMessageActionIndex!==null&&!target.closest('.message-action-menu')){activeMessageActionIndex=null;render()}
  });
 }
 container.querySelectorAll('[data-role-reflection]').forEach(button=>button.onclick=()=>{if(!button.classList.contains('reflection-avatar')){openRoleReflection(Number(button.dataset.roleReflection));return}if(suppressReflectionAvatarClick===button){suppressReflectionAvatarClick=null;return}const previous=reflectionAvatarClickTimers.get(button);if(previous)clearTimeout(previous);reflectionAvatarClickTimers.set(button,setTimeout(()=>{reflectionAvatarClickTimers.delete(button);if(button.isConnected)openRoleReflection(Number(button.dataset.roleReflection))},480))});
 container.querySelectorAll('[data-reply-previous]').forEach(button=>button.onclick=()=>selectReplyVersion(key(),Number(button.dataset.replyPrevious),-1));
 container.querySelectorAll('[data-reply-next]').forEach(button=>button.onclick=()=>advanceReplyVersionOrGenerate(key(),Number(button.dataset.replyNext)));
 container.querySelectorAll('[data-offline-opening-previous]').forEach(button=>button.onclick=()=>void rerollInvitationOpening(button.dataset.offlineOpeningPrevious,-1));
 container.querySelectorAll('[data-offline-opening-next]').forEach(button=>button.onclick=()=>void rerollInvitationOpening(button.dataset.offlineOpeningNext,1));
 container.querySelectorAll('[data-chat-gift-order]').forEach(button=>button.onclick=()=>openChatGiftOrder(Number(button.dataset.chatGiftOrder)));
 container.querySelectorAll('[data-transfer-action]').forEach(button=>button.onclick=async()=>{
  const item=messages()[Number(button.dataset.messageIndex)],settings=currentRoleChatSettings(),userIndex=Number.isInteger(settings.userIndex)?settings.userIndex:state.user,user=state.users[userIndex];
  if(!item||item.type!=='transfer'||item.status!=='pending'||button.disabled)return;
  button.disabled=true;
  try{const action=button.dataset.transferAction==='accept'?'accept':'return',currentIndex=state.users.indexOf(user);if(currentIndex<0)throw Error('面具已删除');let roleSettlement;if(action==='accept'){await applyTransferExchangeRates([item]);if(!item.mine&&item.characterId){const C=window.IrisMarketCore,wallet=C.roleWallet(state,item.characterId,currentIndex,true),known=Number.isSafeInteger(wallet.balanceCents)||Boolean(wallet.historyGeneratedAt)||wallet.ledger.some(row=>row.kind!=='opening'),roleCurrency=known?wallet.currency||'CNY':item.currency||'CNY',sourceCurrency=item.currency||'CNY';let amount;if(roleCurrency===sourceCurrency)amount=Number(item.amount);else{const cnyAmount=sourceCurrency==='CNY'?Number(item.amount):Number(item.cnyAmount);if(!Number.isFinite(cnyAmount))throw Error('汇率暂不可用，转账暂时无法入账');if(roleCurrency==='CNY')amount=cnyAmount;else{const rate=await exchangeRateToCny(roleCurrency);if(!rate?.rate)throw Error('角色钱包汇率暂不可用，转账暂时无法入账');amount=cnyAmount/rate.rate}}roleSettlement={roleCurrency,roleAmountCents:C.cents(amount)}}}window.IrisMarketCore.settleTransfer(state,currentIndex,item,action,roleSettlement);save();render()}catch(error){toast(error.message);button.disabled=false}
 });
 container.querySelectorAll('[data-image-preview]').forEach(button=>button.onclick=()=>{const image=button.querySelector('img');if(!image)return;sheet('Image',image.alt||'聊天图片',`<img class="image-preview-large" src="${esc(image.src)}" alt="${esc(image.alt)}">`,{centered:true})});
 container.querySelectorAll('[data-call-summary]').forEach(button=>button.onclick=()=>{const item=messages().find(message=>message.type==='call-summary'&&message.id===button.dataset.callSummary);if(!item)return;const time=item.createdAt?new Intl.DateTimeFormat('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(item.createdAt)):'';const hasSavedTranscript=Array.isArray(item.thread),transcript=hasSavedTranscript?item.thread:[],lines=transcript.map((line,index)=>{const lineTime=line.createdAt?new Intl.DateTimeFormat('zh-CN',{hour:'2-digit',minute:'2-digit'}).format(new Date(line.createdAt)):'';const speaker=line.mine?(item.userName||'用户'):(item.characterName||'角色');return `<article class="call-summary-transcript-line ${line.mine?'is-user':''}"><header><strong>${esc(speaker)}</strong><time>${esc(lineTime||String(index+1).padStart(2,'0'))}</time></header><p>${renderVideoCallText(line.text||'')}</p></article>`}).join(''),emptyTranscript=hasSavedTranscript?'本次通话没有文字记录。':'旧版本的通话只保存了总结，未保存逐条记录。';sheet('Call Summary',`${esc(item.characterName||'角色')} · ${esc(item.duration||'')} · ${esc(time)}`,`<div class="call-summary-detail"><section class="call-summary-overview"><small>通话总结</small><button type="button" class="summary-expandable call-summary-summary is-summary-collapsed" data-summary-expand aria-expanded="false">${esc(item.summary||'本次通话尚未生成总结。')}</button></section><section class="call-summary-transcript"><header><small>通话记录</small><span>${transcript.length} 条</span></header><div class="call-summary-transcript-list">${lines||`<p class="call-summary-transcript-empty">${emptyTranscript}</p>`}</div><button type="button" class="call-summary-delete" data-call-summary-delete="${esc(item.id)}">删除这条通话记录</button></section></div>`,{centered:true});$('#sheet').querySelector('[data-summary-expand]')?.addEventListener('click',event=>toggleSummaryExpansion(event.currentTarget));$('#sheet').querySelector('[data-call-summary-delete]').onclick=()=>{if(!window.confirm('删除后，这条通话记录会从当前聊天和对应的线上记忆中移除。确定删除吗？'))return;if(!deleteCallSummary(item.id))return;closeSheet();render();toast('通话记录已删除')}});
 container.querySelectorAll('[data-voice-toggle]').forEach(button=>button.onclick=()=>{const transcript=button.parentElement.querySelector('.voice-transcript');if(!transcript)return;const expanded=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(expanded));button.setAttribute('aria-label',expanded?'收起语音文字':'展开语音文字');button.classList.toggle('is-expanded',expanded);transcript.hidden=!expanded});
}
function headerAvatarSlots(){
 return Array.from({length:4},(_,index)=>state.settings.headerAvatars?.[index]||{type:'default',index});
}
function headerRoleId(role){return role.headerAvatarId||(role.headerAvatarId=`header-role-${Date.now()}-${Math.random().toString(36).slice(2,8)}`)}
function headerAvatarSource(slot,index){
 if(slot.type==='image')return {avatar:slot.image,name:'自定义图片'};
 if(slot.type==='character')return chars.find(role=>role.headerAvatarId===slot.roleId)||headerChars[index];
 return headerChars[slot.index??index];
}
function renderHeaderAvatars(){const button=$('#characters');const markup=headerAvatarSlots().map((slot,index)=>avatar(headerAvatarSource(slot,index))).join('');if(button.innerHTML!==markup)button.innerHTML=markup;button.setAttribute('aria-label','切换角色');button.title='切换角色'}
function openHeaderAvatars(){
 closeFeatureMenu();let draft=headerAvatarSlots().map(slot=>({...slot}));
 const draw=()=>{sheet('Header Portraits','从左到右排列，可混合角色头像与自选图片',`<div class="header-avatar-preview">${draft.map((slot,index)=>avatar(headerAvatarSource(slot,index))).join('')}</div><div class="header-avatar-config">${draft.map((slot,index)=>`<div class="header-avatar-config-row"><span class="header-avatar-number">0${index+1}</span>${avatar(headerAvatarSource(slot,index))}<div class="header-avatar-controls"><select data-header-role="${index}" aria-label="第 ${index+1} 个头像来源"><option value="default" ${slot.type==='default'?'selected':''}>默认字母</option>${slot.type==='image'?'<option value="image" selected>自选图片</option>':''}${chars.map(role=>`<option value="${esc(headerRoleId(role))}" ${slot.type==='character'&&slot.roleId===headerRoleId(role)?'selected':''}>${esc(role.name||'未命名角色')}</option>`).join('')}</select><div><button type="button" data-header-upload="${index}">换图片</button><button type="button" data-header-move="${index}" data-direction="-1" ${index===0?'disabled':''}>左移</button><button type="button" data-header-move="${index}" data-direction="1" ${index===3?'disabled':''}>右移</button></div></div></div>`).join('')}</div><input type="file" data-header-file accept="image/*" hidden><div class="header-avatar-actions"><button type="button" data-header-characters>切换聊天角色</button><button type="button" data-header-save>保存排列</button></div>`,{centered:true});
 $('#sheet').querySelectorAll('[data-header-role]').forEach(select=>select.onchange=()=>{const index=Number(select.dataset.headerRole);if(select.value==='image')return;draft[index]=select.value==='default'?{type:'default',index}:{type:'character',roleId:select.value};draw()});
 $('#sheet').querySelectorAll('[data-header-move]').forEach(button=>button.onclick=()=>{const index=Number(button.dataset.headerMove),next=index+Number(button.dataset.direction);[draft[index],draft[next]]=[draft[next],draft[index]];draw()});
 const fileInput=$('#sheet').querySelector('[data-header-file]');let target=0;
 $('#sheet').querySelectorAll('[data-header-upload]').forEach(button=>button.onclick=()=>{target=Number(button.dataset.headerUpload);fileInput.click()});
 fileInput.onchange=async()=>{const file=fileInput.files[0];if(!file)return;try{const image=await createImageBitmap(file),canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d'),side=Math.min(image.width,image.height);ctx.drawImage(image,(image.width-side)/2,(image.height-side)/2,side,side,0,0,256,256);image.close();draft[target]={type:'image',image:canvas.toDataURL('image/png')};draw()}catch{toast('图片无法读取，请换一张图片')}};
 $('#sheet').querySelector('[data-header-characters]').onclick=characters;
 $('#sheet').querySelector('[data-header-save]').onclick=()=>{state.settings.headerAvatars=draft.map(slot=>({...slot}));save();renderHeaderAvatars();closeSheet();toast('头像排列已保存')};
 };draw();
}
let videoCallActive=false,videoCallStream=null,videoCallFrameTimer=null,videoCallFrameBuffer=[],videoCallThread=[],videoCallHasReply=false,videoCallReturnPositioner=null,videoCallStartedAt=0,videoCallPinnedToBottom=true;
const chatNodeMarkup=new WeakMap();
let chatRenderedKey=null,chatRenderedMarkup=null,chatPinnedToBottom=true;
function updateChatConversation(markup){
 const container=$('#conversation'),conversationKey=key();
 if(chatRenderedMarkup===markup&&chatRenderedKey===conversationKey)return;
 const previousScroll=container.scrollTop,nearBottom=container.scrollHeight-container.clientHeight-previousScroll<48;
 const changedConversation=chatRenderedKey!==conversationKey;
 const template=document.createElement('template');template.innerHTML=markup;
 const incoming=Array.from(template.content.children),existing=Array.from(container.children);
 incoming.forEach((node,index)=>{
  const previous=existing[index],signature=node.outerHTML;
  if(!changedConversation&&previous&&chatNodeMarkup.get(previous)===signature)return;
  chatNodeMarkup.set(node,signature);
  if(previous){if(IrisMiniTheater.patchEntry(previous,node))chatNodeMarkup.set(previous,signature);else previous.replaceWith(node)}else container.append(node);
 });
 existing.slice(incoming.length).forEach(node=>node.remove());
 chatRenderedMarkup=markup;chatRenderedKey=conversationKey;
 bindConversationMedia();
 const followLatest=changedConversation||nearBottom||roleInvitationNeedsFollowLatest;roleInvitationNeedsFollowLatest=false;chatPinnedToBottom=followLatest;
 container.scrollTop=followLatest?container.scrollHeight:previousScroll;
}
function keepLatestChatMessageVisible(duration=0){
 const started=performance.now();
 const follow=()=>{const conversation=$('#conversation');if(conversation)conversation.scrollTop=conversation.scrollHeight;if(performance.now()-started<duration)requestAnimationFrame(follow)};
 requestAnimationFrame(follow);
}
function keepLatestSmsMessageVisible(duration=0){
 const started=performance.now();
 const follow=()=>{const messages=activeFeaturePage==='sms'?$('#featurePageContent [data-sms-messages]'):null;if(messages)messages.scrollTop=messages.scrollHeight;if(performance.now()-started<duration)requestAnimationFrame(follow)};
 requestAnimationFrame(follow);
}
function render(){const c=chars[state.char];if(c){if(typeof c.offlineMode!=='boolean')c.offlineMode=false;state.offline=c.offlineMode;}if(!state.offline||offlineStageFoldStateThreadKey!==key()){offlineExpandedStageFolds.clear();offlineStageFoldStateThreadKey=state.offline?key():''}if(state.offline&&reconcileOfflineStageMemory(key(),messages())){const bound=currentRoleChatSettings().userIndex,userIndex=Number.isInteger(bound)?bound:state.user;void maybeUpdateOfflineStageMemory(state.char,userIndex,key(),messages())}if(messageSelectionMode&&messageSelectionThreadKey!==key()){messageSelectionMode=false;selectedMessageIndices.clear();messageSelectionThreadKey=key()}const roleSettings=currentRoleChatSettings(),boundIndex=roleSettings.userIndex,user=state.users[Number.isInteger(boundIndex)?boundIndex:state.user];renderHeaderAvatars();$('#chatTitle').innerHTML=`${state.offline?'Offline':'Chat'}${c?.name?`<span class="chat-character-name">${esc(c.name)}</span>`:''}`;updateChatReplyIndicator();updateComposerAction();$('#chatTitle').setAttribute('aria-label',state.offline?'Open offline settings':'Open chat settings');document.documentElement.style.setProperty('--surface',state.offline?state.settings.offlineSurface:(state.settings.surface||'#f4f4f4'));const modeButton=$('[data-nav="2"]');modeButton.innerHTML=icon(state.offline?'online':'dockStory')+`<span>${state.offline?'Online':'Offline'}</span>`;modeButton.setAttribute('aria-label',state.offline?'Switch to online':'Switch to offline');modeButton.title=state.offline?'Switch to online':'Switch to offline';modeButton.classList.toggle('is-current',state.offline);$('[data-nav="1"]').classList.toggle('is-current',!state.offline);$('#conversation').classList.toggle('is-offline-story',state.offline);applyBeautifyCss();updateChatConversation(renderConversation(user,c)+(chatReplyTyping.has(key())?replyTypingMarkup(c):'')+renderOfflineStreamingMarkup(c));if(!state.offline&&pendingReplyKeys.has(key())&&!chatReplyInFlight.has(key()))scheduleChatReply(false,key());if(!state.offline)resumeUnblockProactiveChat(state.char);if(videoCallActive)renderVideoCallMessages();}

function stopVideoCallCamera(){if(videoCallFrameTimer)clearInterval(videoCallFrameTimer);videoCallFrameTimer=null;videoCallFrameBuffer=[];videoCallStream?.getTracks().forEach(track=>track.stop());videoCallStream=null;const video=document.querySelector('#videoCallScreen [data-call-video]');if(video)video.srcObject=null}
function setVideoCallReplyState(hasReply){videoCallHasReply=hasReply;document.querySelector('#videoCallReturn')?.classList.toggle('has-reply',hasReply)}
function closeVideoCall(){stopVideoCallCamera();videoCallActive=false;videoCallThread=[];videoCallPinnedToBottom=true;setVideoCallReplyState(false);if(videoCallReturnPositioner)window.removeEventListener('resize',videoCallReturnPositioner);videoCallReturnPositioner=null;document.querySelector('#videoCallScreen')?.remove();document.querySelector('#videoCallReturn')?.remove()}
window.addEventListener('pagehide',()=>{if(videoCallActive)closeVideoCall()});
function videoCallDuration(milliseconds){const seconds=Math.max(0,Math.floor(milliseconds/1000));return`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`}
function fallbackVideoCallSummary(context){const userLines=context.thread.filter(message=>message.mine).map(message=>String(message.text||'').trim()).filter(Boolean),characterLines=context.thread.filter(message=>!message.mine).map(message=>String(message.text||'').replace(/\*([^*]+)\*/g,'$1').trim()).filter(Boolean),excerpt=value=>value.length>90?`${value.slice(0,89)}…`:value;if(!userLines.length&&!characterLines.length)return'本次通话没有产生文字交流。';const parts=[];if(userLines.length)parts.push(`用户提到「${excerpt(userLines.slice(-2).join('；'))}」`);if(characterLines.length)parts.push(`${context.characterName}回应「${excerpt(characterLines.slice(-2).join('；'))}」`);return`本次通话中，${parts.join('；')}。`}
async function requestConfiguredSummary(feature,transcript,instruction,maxChars=1200){if(feature==='offlineSummary')transcript=IrisMiniTheater.filterHistory(transcript);const config=apiConfigForFeature(feature),model=apiModelForFeature(feature,config);if(!config?.url||!config?.key||!model)return'';const base=config.url.replace(/\/+$/,'').replace(/\/chat\/completions$/,'');try{const response=await fetch(`${base}/chat/completions`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${config.key}`},body:JSON.stringify({model,messages:[{role:'system',content:instruction},{role:'user',content:transcript}]})});if(!response.ok)return'';const result=await response.json();let summary=result.choices?.[0]?.message?.content;if(Array.isArray(summary))summary=summary.map(part=>part.text||'').join('');return String(summary||'').replace(/```(?:text)?|```/g,'').trim().slice(0,maxChars)}catch{return''}}
const offlineStageMemoryPending=new Set();
function offlineStageMemorySession(threadKey=key(),role=chars[state.char]){if(!role)return null;const data=currentRoleOfflineData(role);data.stageMemorySessions||={};let session=data.stageMemorySessions[threadKey];if(!session||typeof session!=='object')session=data.stageMemorySessions[threadKey]={currentId:'stage-session-1',sessions:{'stage-session-1':{id:'stage-session-1',small:[],large:[],archived:false}}};session.sessions||={};session.currentId||='stage-session-1';let current=session.sessions[session.currentId];if(!current)current=session.sessions[session.currentId]={id:session.currentId,small:[],large:[],archived:false};current.small=Array.isArray(current.small)?current.small:[];current.large=Array.isArray(current.large)?current.large:[];return{data,threadKey,session,current}}
function archiveOfflineStageMemory(threadKey){const slot=offlineStageMemorySession(threadKey);if(!slot)return;slot.current.archived=true;const nextId=`stage-session-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;slot.session.currentId=nextId;slot.session.sessions[nextId]={id:nextId,small:[],large:[],archived:false}}
function offlineCompletedRounds(items){const rounds=[];let current=null;const finish=()=>{if(current&&current.assistantCount)rounds.push(current);current=null};for(let index=0;index<items.length;index++){const message=items[index];if(message.mine){if(current&&current.assistantCount)finish();if(!current)current={startIndex:index,endIndex:index,messages:[],assistantCount:0};current.messages.push(message);current.endIndex=index}else if(current){current.messages.push(message);current.endIndex=index;if(message.type!=='call-summary')current.assistantCount++}}finish();return rounds}
function offlineStageHash(value){const source=String(value||'');let a=2166136261,b=2246822519;for(let i=0;i<source.length;i++){const code=source.charCodeAt(i);a=Math.imul(a^code,16777619);b=Math.imul(b^code,3266489917)}return`${(a>>>0).toString(36)}-${(b>>>0).toString(36)}-${source.length}`}
function offlineStageRoundSource(rounds,startRound,endRound){return rounds.slice(startRound-1,endRound).flatMap(round=>round.messages).map(message=>`${message.mine?'用户':'角色'}：${offlineMainStoryContent(message)}`).join('\n')}
function reconcileOfflineStageMemory(threadKey=key(),items=messages()){const slot=offlineStageMemorySession(threadKey);if(!slot)return false;const rounds=offlineCompletedRounds(items),memory=slot.current;let changed=false;for(const item of memory.small){const source=rounds.length>=item.toRound?offlineStageHash(offlineStageRoundSource(rounds,item.fromRound,item.toRound)):'';const stale=!source||source!==item.sourceHash;if(Boolean(item.stale)!==stale){item.stale=stale;changed=true}}for(const item of memory.large){const parts=memory.small.filter(small=>small.fromRound>=item.fromRound&&small.toRound<=item.toRound).sort((a,b)=>a.fromRound-b.fromRound),complete=parts.length===5&&parts.every(part=>!part.stale),source=complete?offlineStageHash(parts.map(part=>`${part.sourceHash}:${part.summary}`).join('\n')):'',stale=!source||source!==item.sourceHash;if(Boolean(item.stale)!==stale){item.stale=stale;changed=true}}if(changed){slot.current.updatedAt=Date.now();save()}return changed}
function offlineStageContext(threadKey=key(),items=messages()){reconcileOfflineStageMemory(threadKey,items);const slot=offlineStageMemorySession(threadKey),memory=slot?.current;if(!memory)return{memories:[],rawMessages:items};const rounds=offlineCompletedRounds(items),summaries=[],covered=new Set();let through=0;for(const item of [...memory.large].sort((a,b)=>a.fromRound-b.fromRound)){if(item.stale||item.fromRound!==through+1)continue;summaries.push({fromRound:item.fromRound,toRound:item.toRound,summary:applyOfflineRegexRules(item.summary,currentRoleOfflineData().settings,'any','context'),kind:'大总结'});for(const round of rounds.slice(item.fromRound-1,item.toRound))for(let index=round.startIndex;index<=round.endIndex;index++)covered.add(index);through=item.toRound}for(const item of [...memory.small].sort((a,b)=>a.fromRound-b.fromRound)){if(item.stale||item.fromRound!==through+1)continue;summaries.push({fromRound:item.fromRound,toRound:item.toRound,summary:applyOfflineRegexRules(item.summary,currentRoleOfflineData().settings,'any','context'),kind:'小总结'});for(const round of rounds.slice(item.fromRound-1,item.toRound))for(let index=round.startIndex;index<=round.endIndex;index++)covered.add(index);through=item.toRound}return{memories:summaries,rawMessages:items.filter((_,index)=>!covered.has(index))}}
function offlineStageFoldRanges(threadKey,items){const slot=offlineStageMemorySession(threadKey),rounds=offlineCompletedRounds(items);if(!slot||!rounds.length)return[];const accepted=offlineStageContext(threadKey,items).memories,ranges=[],seen=new Set();for(const memory of accepted){const span=memory.kind==='大总结'?100:20;if(memory.toRound-memory.fromRound+1<span||memory.fromRound<1)continue;for(let fromRound=memory.fromRound;fromRound+span-1<=memory.toRound;fromRound+=20){const toRound=fromRound+19;if(toRound>rounds.length||seen.has(`${fromRound}-${toRound}`))continue;seen.add(`${fromRound}-${toRound}`);ranges.push({sessionId:slot.current.id,fromRound,toRound,startIndex:rounds[fromRound-1].startIndex,endIndex:rounds[toRound-1].endIndex})}}return ranges.sort((a,b)=>a.fromRound-b.fromRound)}
async function generateOfflineStageSmall(roleIndex,userIndex,threadKey,items,fromRound,toRound){const role=chars[roleIndex],slot=offlineStageMemorySession(threadKey,role),rounds=offlineCompletedRounds(items);if(!role||rounds.length<toRound||slot?.current.archived)return false;const transcript=offlineStageRoundSource(rounds,fromRound,toRound),sourceHash=offlineStageHash(transcript),snapshot=JSON.stringify(items),user=state.users[userIndex],transcriptWithNames=rounds.slice(fromRound-1,toRound).flatMap(round=>round.messages).map(message=>`${message.mine?(user?.nickname||user?.name||'用户'):(role.name||'角色')}：${offlineMainStoryContent(message)}`).join('\n');const result=await requestConfiguredSummary('offlineSummary',transcriptWithNames,`你负责生成线下聊天的阶段小总结。这只是当前聊天的上下文压缩，不是用户保存的线下总结。整理第 ${fromRound} 至 ${toRound} 轮的实际内容，保留人物认知、关系状态、事件因果、重要细节、明确约定与未解决事项；区分用户和角色，不把推测当事实，不补写后续剧情。输出供后续对话继续使用的精炼中文记忆，不加标题，不超过 900 字。`,1200);if(!result)return false;if(JSON.stringify(items)!==snapshot)return false;const current=offlineStageMemorySession(threadKey,role);if(!current||current.current.archived)return false;const entry={id:`small-${fromRound}-${toRound}`,fromRound,toRound,sourceHash,summary:result,createdAt:Date.now(),stale:false},index=current.current.small.findIndex(item=>item.fromRound===fromRound);if(index>=0)current.current.small[index]=entry;else current.current.small.push(entry);current.current.small.sort((a,b)=>a.fromRound-b.fromRound);current.current.error='';current.current.updatedAt=Date.now();save();if(threadKey===key()&&state.offline)render();return true}
async function generateOfflineStageLarge(roleIndex,threadKey,items,fromRound,toRound){const role=chars[roleIndex],slot=offlineStageMemorySession(threadKey,role);if(!slot||slot.current.archived)return false;const small=slot.current.small.filter(item=>item.fromRound>=fromRound&&item.toRound<=toRound).sort((a,b)=>a.fromRound-b.fromRound);if(small.length!==5||small.some(item=>item.stale))return false;const sourceHash=offlineStageHash(small.map(item=>`${item.sourceHash}:${item.summary}`).join('\n')),transcript=small.map(item=>`第 ${item.fromRound}—${item.toRound} 轮小总结：\n${item.summary}`).join('\n\n'),snapshot=JSON.stringify(items),result=await requestConfiguredSummary('offlineSummary',transcript,`请将以下五份线下阶段小总结整合为一份大总结，覆盖第 ${fromRound} 至 ${toRound} 轮。它仅供当前线下聊天后续上下文使用，不是线下总结记录。合并重复事实，保留人物认知与关系变化、关键事件顺序、重要约定、持续问题和后续必须记住的信息；不添加材料中没有的剧情。只输出精炼中文记忆，不加标题，不超过 1600 字。`,2000);if(!result||JSON.stringify(items)!==snapshot)return false;const current=offlineStageMemorySession(threadKey,role);if(!current||current.current.archived)return false;const entry={id:`large-${fromRound}-${toRound}`,fromRound,toRound,sourceHash,summary:result,smallIds:small.map(item=>item.id),createdAt:Date.now(),stale:false},index=current.current.large.findIndex(item=>item.fromRound===fromRound);if(index>=0)current.current.large[index]=entry;else current.current.large.push(entry);current.current.large.sort((a,b)=>a.fromRound-b.fromRound);current.current.error='';current.current.updatedAt=Date.now();save();return true}
async function maybeUpdateOfflineStageMemory(roleIndex,userIndex,threadKey,items=messages()){const lock=`${threadKey}`;if(offlineStageMemoryPending.has(lock))return;offlineStageMemoryPending.add(lock);try{const slot=offlineStageMemorySession(threadKey,chars[roleIndex]);if(!slot||slot.current.archived)return;reconcileOfflineStageMemory(threadKey,items);const rounds=offlineCompletedRounds(items),config=apiConfigForFeature('offlineSummary');if(!config?.url||!config?.key||!apiModelForFeature('offlineSummary',config)){slot.current.error='未配置线下总结 API；阶段记忆未生成，原始上下文会继续发送。';save();return}for(let start=1;start+19<=rounds.length;start+=20){const end=start+19,existing=slot.current.small.find(item=>item.fromRound===start&&item.toRound===end);if(existing&&!existing.stale)continue;const ok=await generateOfflineStageSmall(roleIndex,userIndex,threadKey,items,start,end);if(!ok){slot.current.error='阶段小总结生成失败；未压缩对应历史上下文。';save();return}}for(let start=1;start+99<=rounds.length;start+=100){const end=start+99,existing=slot.current.large.find(item=>item.fromRound===start&&item.toRound===end);if(existing&&!existing.stale)continue;const ok=await generateOfflineStageLarge(roleIndex,threadKey,items,start,end);if(!ok){slot.current.error='阶段大总结生成失败；仍使用可用的小总结或原始上下文。';save();return}}}catch(error){const slot=offlineStageMemorySession(threadKey,chars[roleIndex]);if(slot){slot.current.error=error.message||'阶段记忆更新失败；原始上下文保留。';save()}}finally{offlineStageMemoryPending.delete(lock)}}
async function regenerateOfflineStageMemory(threadKey,kind,fromRound){const slot=offlineStageMemorySession(threadKey);if(!slot||slot.current.archived)return false;const items=state.messages[threadKey]||[],roleIndex=Number(threadKey.split('-')[0]),role=chars[roleIndex],userIndex=Number(threadKey.split('-')[1]);if(kind==='small'){const item=slot.current.small.find(value=>value.fromRound===fromRound);if(!item)return false;const ok=await generateOfflineStageSmall(roleIndex,userIndex,threadKey,items,item.fromRound,item.toRound);if(ok)reconcileOfflineStageMemory(threadKey,items);return ok}const item=slot.current.large.find(value=>value.fromRound===fromRound);if(!item)return false;const ok=await generateOfflineStageLarge(roleIndex,threadKey,items,item.fromRound,item.toRound);if(ok)reconcileOfflineStageMemory(threadKey,items);return ok}

const memorySummaryPending=new Set();
function refreshVisibleOnlineMemory(roleIndex){if(state.char!==roleIndex||$('#settingsScreen').hidden||!modeSettings||settingsSection!=='online'||onlineSettingsTab!=='memory')return;const {entries=[],...memory}=currentRoleChatSettings().memory||{};onlineMemoryDraft={...defaultOnlineMemory,...memory};onlineMemoryEntries=Array.isArray(entries)?entries.map(entry=>({...entry})):[];refreshSettings()}
async function maybeSummarizeOnlineMemory(roleIndex,userIndex,conversationItems){
 const role=chars[roleIndex];if(!role||!Array.isArray(conversationItems))return;role.chatSettings||={};const memory={...defaultOnlineMemory,...(role.chatSettings.memory||{})};if(!memory.enabled||!memory.autoSummary)return;
 const rounds=[];let currentRound=[];for(const message of conversationItems){if(message.mine&&currentRound.some(item=>!item.mine)){rounds.push(currentRound);currentRound=[message]}else currentRound.push(message)}if(currentRound.some(item=>!item.mine))rounds.push(currentRound);
 const summarized=Math.max(0,Number(memory.summaryThroughRound)||0),interval=Math.max(2,Number(memory.summaryEveryRounds)||10);if(rounds.length-summarized<interval)return;
 const lock=`online-summary-${roleIndex}-${userIndex}`;if(memorySummaryPending.has(lock))return;memorySummaryPending.add(lock);delete memory.summaryError;role.chatSettings.memory={...memory};save();refreshVisibleOnlineMemory(roleIndex);
 let sourceSnapshot='';try{
  const config=apiConfigForFeature('onlineSummary'),model=apiModelForFeature('onlineSummary',config);
  if(!config?.url||!config?.key||!model)throw Error('没有可用的线上总结 API，请在 API 设置中配置线上总结功能。');
  const transcript=rounds.slice(summarized).flat().map(message=>`${message.mine?'用户':role.name||'角色'}：${messagePromptContent(message)}`).join('\n'),prior=String(memory.summaryText||'');sourceSnapshot=JSON.stringify(conversationItems);
  const text=await requestConfiguredSummary('onlineSummary',`已有记忆摘要（可能为空）：\n${prior}\n\n本次新增聊天：\n${transcript}`,`你负责整理线上聊天的长期记忆。保留关系变化、重要事件、明确偏好、约定、持续中的问题和稳定事实；区分用户与角色，不把推测写成事实，不重复旧摘要。输出一段精炼中文摘要，最多 ${Math.max(100,Number(memory.summaryMaxChars)||300)} 字，只输出摘要正文。`,Math.max(100,Number(memory.summaryMaxChars)||300));
  if(JSON.stringify(conversationItems)!==sourceSnapshot)return;
  if(!text)throw Error('总结 API 没有返回内容，请检查地址、Key、模型和接口权限。');
  role.chatSettings.memory={...memory,summaryText:text,summaryThroughRound:rounds.length,summaryUpdatedAt:Date.now(),summaryError:''};save();refreshVisibleOnlineMemory(roleIndex);
 }catch(error){if(sourceSnapshot&&JSON.stringify(conversationItems)!==sourceSnapshot)return;role.chatSettings.memory={...memory,summaryError:error.message||'自动总结失败，请检查 API 配置。'};save();refreshVisibleOnlineMemory(roleIndex)}finally{memorySummaryPending.delete(lock);refreshVisibleOnlineMemory(roleIndex)}
}
async function createVideoCallSummary(context){if(!context.thread.some(message=>String(message.text||'').trim()))return'本次通话没有产生文字交流。';const config=apiConfigForFeature('callSummary');if(!config?.url||!config?.key||!apiModelForFeature('callSummary',config))return fallbackVideoCallSummary(context);const transcript=context.thread.map(message=>`${message.mine?context.userName:context.characterName}：${String(message.text||'').replace(/\*([^*]+)\*/g,'$1').trim()}`).filter(line=>!line.endsWith('：')).slice(-80).join('\n');if(!transcript)return'本次通话没有产生文字交流。';try{const base=config.url.replace(/\/+$/,'').replace(/\/chat\/completions$/,'');const response=await fetch(`${base}/chat/completions`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${config.key}`},body:JSON.stringify({model:apiModelForFeature('callSummary',config),messages:[{role:'system',content:'请把下面的实时视频通话文字记录整理成简洁准确的中文回顾，概括主要话题、重要信息、约定和情绪变化；只写记录能够支持的内容，不推测，不添加建议，不写标题，控制在 2 至 4 句。'},{role:'user',content:transcript}]})});if(!response.ok)throw Error('summary request failed');const result=await response.json();let summary=result.choices?.[0]?.message?.content;if(Array.isArray(summary))summary=summary.map(part=>part.text||'').join('');summary=String(summary||'').replace(/```(?:text)?|```/g,'').trim();return summary||fallbackVideoCallSummary(context)}catch{return fallbackVideoCallSummary(context)}}
function addCallSummaryToMemory(context,summary){if(context.offline)return;const role=chars[context.characterIndex];if(!role)return;role.chatSettings||={};const memory={...defaultOnlineMemory,...(role.chatSettings.memory||{})},entries=Array.isArray(memory.entries)?memory.entries:[],date=new Intl.DateTimeFormat('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(context.endedAt));entries.unshift({id:`memory-call-${context.id}`,scope:'online',owner:'shared',title:`视频通话 · ${date}`,content:summary,updatedAt:context.endedAt,source:'video-call'});role.chatSettings.memory={...memory,entries};if(state.char===context.characterIndex)onlineMemoryEntries=entries.map(entry=>({...entry}));save();if(state.char===context.characterIndex&&!$('#settingsScreen').hidden&&modeSettings&&settingsSection==='online')refreshSettings()}
function deleteCallSummary(id){const thread=messages(),index=thread.findIndex(message=>message.type==='call-summary'&&message.id===id);if(index<0)return false;thread.splice(index,1);const role=chars[state.char],memory=role?.chatSettings?.memory,memoryId=`memory-call-${String(id).replace(/^call-/,'')}`;if(memory&&Array.isArray(memory.entries)){memory.entries=memory.entries.filter(entry=>entry.id!==memoryId);onlineMemoryEntries=memory.entries.map(entry=>({...entry}))}invalidateDeletedContentFromMemory();save();return true}
async function finishVideoCall(){if(!videoCallActive){closeVideoCall();return}const endedAt=Date.now(),roleSettings=currentRoleChatSettings(),user=state.users[Number.isInteger(roleSettings.userIndex)?roleSettings.userIndex:state.user],context={id:`${endedAt}-${Math.random().toString(36).slice(2,7)}`,characterIndex:state.char,characterName:chars[state.char]?.name||'角色',userName:user?.nickname||user?.name||'用户',offline:state.offline,messageKey:key(),startedAt:videoCallStartedAt,endedAt,duration:videoCallDuration(endedAt-videoCallStartedAt),thread:videoCallThread.map(message=>({mine:Boolean(message.mine),text:String(message.text||''),createdAt:Number(message.createdAt)||endedAt}))};closeVideoCall();const callMessage={id:`call-${context.id}`,mine:false,type:'call-summary',characterName:context.characterName,userName:context.userName,duration:context.duration,summary:'正在整理本次通话…',thread:context.thread,startedAt:context.startedAt,createdAt:endedAt};(state.messages[context.messageKey]||(state.messages[context.messageKey]=[])).push(callMessage);save();if(context.messageKey===key()&&$('#settingsScreen').hidden&&$('#featureScreen').hidden)render();const summary=await createVideoCallSummary(context);if(!(state.messages[context.messageKey]||[]).some(message=>message.id===callMessage.id))return;callMessage.summary=summary;if(!context.offline&&context.thread.some(message=>String(message.text||'').trim()))addCallSummaryToMemory(context,summary);save();if(context.messageKey===key()&&$('#settingsScreen').hidden&&$('#featureScreen').hidden)render()}
let finishReflectionRead=null;
const reflectionPanelNames={original:'心声',x:'X',notes:'备忘录',gpt:'GPT'};
const reflectionPanelInstructions=`【独立心声面板】
在 reflection.panels 中同时提供三套不同内容，绝不能复用同一段心声。它们只显示在私人面板，不能放进 messages。
x: {"text":"一条带暧昧张力的角色 X 帖子","translation":"帖子译文","replies":[{"name":"NPC姓名","nickname":"NPC网名","relation":"与角色的关系","text":"评论正文","translation":"评论译文"}]}。这是公开动态，不是私人日记或心声。口吻像真实用户发帖，带角色自己的语气、观点和生活感。角色已明确设定为成年人时，每条都必须带明显但不露骨的撩拨感：至少包含一个暧昧双关、挑逗性反问、克制的性张力或让人浮想联翩的暗示；写得大胆、有点坏、有吸引力，避免平淡鸡汤、纯情绪总结和只聊日常。可用欲言又止、挑衅、吃醋、深夜邀约、贴近距离等方式营造成人暧昧，但不描写露骨性行为或身体部位细节。若年龄未明确或角色未成年，不写性暗示，改用俏皮、心动、轻微挑逗的非成人暧昧。每条控制在一到三句，像可直接发出的 X 帖子，不要添加“草稿”字样。x 还必须包含 replies 数组。写 2 至 4 条与帖子有关、有来有回感的虚构 NPC 评论。优先使用角色设定、世界书或对话里已有的朋友、同事、家人等 NPC，保持其性格与关系；不要替用户发言。没有已知 NPC 时可创作普通同事或朋友，不捏造重要共同经历，也不能让 NPC 知道未公开的私聊细节。
notes: {"title":"简短备忘录标题","titleTranslation":"标题译文","todo":[{"text":"待做事项","translation":"事项译文"}],"done":[{"text":"已完成事项","translation":"事项译文"}]}。只写有对话依据的具体行动或明确约定，延续此前未完成事项，只有确认完成才能移到 done；禁止把愿望、情绪或猜测当已完成，允许空数组。
gpt: {"messages":[{"speaker":"character","text":"角色向 GPT 提出私下的困扰","translation":"译文"},{"speaker":"gpt","text":"GPT 的回应","translation":"译文"}]}。模拟角色与 GPT 的私人对话，必须连续交谈 3 至 5 轮（6 至 10 条消息），character 与 gpt 严格交替，角色会针对上一次回答继续追问或补充，不能重复同一个问题。角色保持人设，GPT 简洁温和、具体回应，不全知、不诊断。内容围绕当下烦恼或没说出口的感受，不复述聊天，不输出模型推理过程。这不是实际向另一服务发送信息。
三套内容都必须基于当前角色与截至本轮的对话，字符串为纯文本，不输出 HTML。`;
function normalizeReflectionPanels(value){
 const panels={},text=(v,n=1600)=>typeof v==='string'?v.trim().slice(0,n):'';
 if(!value||typeof value!=='object')return panels;
 if(text(value.x?.text))panels.x={text:text(value.x.text),translation:text(value.x.translation||value.x.textTranslation,1600),version:Number(value.x.version)||1,replies:Array.isArray(value.x.replies)?value.x.replies.filter(v=>v&&text(v.name)&&text(v.text)).slice(0,8).map(v=>({name:text(v.name,60),nickname:text(v.nickname||v.name,60),relation:text(v.relation,80),text:text(v.text,800),translation:text(v.translation,1200)})):[]};
 if(value.notes&&Array.isArray(value.notes.todo)&&Array.isArray(value.notes.done)){const list=(items,translations)=>items.slice(0,20).map((entry,index)=>{const item=typeof entry==='string'?{text:entry,translation:translations?.[index]}:entry||{};return{text:text(item.text,240),translation:text(item.translation,1200)}}).filter(item=>item.text);panels.notes={title:text(value.notes.title,80)||'一些要记住的事',titleTranslation:text(value.notes.titleTranslation||value.notes.title_translation,400),todo:list(value.notes.todo,value.notes.todoTranslations),done:list(value.notes.done,value.notes.doneTranslations)}}
 if(Array.isArray(value.gpt?.messages)){const items=value.gpt.messages.filter(v=>v&&['character','gpt'].includes(v.speaker)&&text(v.text)).slice(0,10).map(v=>({speaker:v.speaker,text:text(v.text),translation:text(v.translation,1600)}));if(items.some(v=>v.speaker==='character')&&items.some(v=>v.speaker==='gpt'))panels.gpt={messages:items};}
 return panels;
}
function reflectionBuiltInsComplete(value){const panels=normalizeReflectionPanels(value);return Boolean(panels.x?.text&&panels.x.replies.length&&panels.notes&&panels.gpt?.messages.length>=6&&panels.gpt.messages.every((item,i)=>item.speaker===(i%2?'gpt':'character')))}
const reflectionPanelRequests=new WeakSet();
const reflectionTranslationRequests=new WeakSet();
const reflectionGlyph=name=>{const shapes={grok:'<path d="M20 3 4 21M7 18a8 8 0 0 1 9-13M17 6a8 8 0 0 1-9 13M3 19l4-1M17 6l4-3"/>',back:'<path d="m14 5-7 7 7 7M7 12h14"/>',more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',share:'<path d="M8 8H5v13h14V8h-3M12 15V2m-4 4 4-4 4 4"/>',checklist:'<circle cx="5" cy="6" r="3"/><path d="m3.5 6 1 1 2-2M12 6h9M12 18h9"/><circle cx="5" cy="18" r="3"/>',pen:'<circle cx="12" cy="12" r="10"/><path d="m8 19 2-9h4l2 9M10 10l2-6 2 6"/>',camera:'<path d="M3 6h5l2-3h4l2 3h5v15H3Z"/><circle cx="12" cy="13" r="4"/>',menu:'<path d="M4 7h16M4 15h10"/>',comment:'<path d="M21 11a9 8 0 0 1-10 8l-6 3 1-6a9 8 0 1 1 15-5Z"/>',heart:'<path d="M12 21 3 12C-3 3 8-1 12 6c4-7 15-3 9 6Z"/>',repost:'<path d="m3 7 4-4 4 4M7 3v13h6m8 1-4 4-4-4m4 4V8h-6"/>',bookmark:'<path d="M5 3h14v19l-7-5-7 5Z"/>',search:'<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',home:'<path d="m3 10 9-8 9 8v12h-6v-8H9v8H3Z"/>',bell:'<path d="M5 17V9a7 7 0 0 1 14 0v8l2 3H3ZM10 23h4"/>',copy:'<rect x="7" y="3" width="14" height="15" rx="3"/><rect x="3" y="7" width="14" height="15" rx="3"/>',voice:'<path d="M4 9v6M8 5v14M12 8v8M16 3v18M20 9v6"/>'};return `<svg viewBox="0 0 24 24" aria-hidden="true">${shapes[name]||paths[name]||paths.plus}</svg>`};
// Dedicated X glyphs: navigation and post actions use different speech bubbles.
function reflectionXGlyph(name,active=false){
 const allowed=['home','search','grok','bell','message','comment','repost','heart','bookmark','share'];if(!allowed.includes(name))return'';
 const suffix=active&&['heart','bookmark','repost'].includes(name)?'-active':'';
 return `<img class="reflection-x-icon" data-x-icon="${name}" src="assets/x-icons/${name}${suffix}.webp" alt="" aria-hidden="true" draggable="false">`;
}
function reflectionGptGlyph(name){const extension=name==='feedback'?'webp':'svg';return `<img class="reflection-gpt-icon" src="assets/gpt-icons/${name}.${extension}" alt="" aria-hidden="true" draggable="false">`}
function customReflectionThemes(){return Array.isArray(state.reflectionThemes)?state.reflectionThemes:[]}
function customReflectionDocument(theme,data,bilingual=false){const previewSections=[{label:'此刻状态',text:'角色正在整理桌上的纸张，听见你的声音后停了下来。'},{label:'没说出口的话',text:'其实刚才一直在等你开口。'}],titleTranslation=bilingual&&data?.titleTranslation?`<small class="reflection-translation">${esc(data.titleTranslation)}</small>`:'',sections=data?.sections?.length?data.sections:previewSections;return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data: blob:"><style> *{box-sizing:border-box;scrollbar-width:none}*::-webkit-scrollbar{display:none}body{margin:0;font:clamp(13px,3.7vw,15px)/1.75 -apple-system,BlinkMacSystemFont,sans-serif;color:#333}.reflection-panel{min-height:100vh;padding:20px;background:#fff}.reflection-header{font-size:clamp(16px,5vw,20px);font-weight:600}.reflection-item{margin-top:18px}.reflection-label{font-size:clamp(12px,3.3vw,14px);color:#999;cursor:pointer;touch-action:manipulation}.reflection-label:focus-visible{outline:2px solid #aaa;outline-offset:4px}.reflection-text{white-space:pre-wrap;overflow-wrap:anywhere;margin:6px 0}.reflection-translation{display:block;margin-top:4px;color:#999;font-size:clamp(9px,2.7vw,11px);line-height:1.55;white-space:pre-wrap;overflow-wrap:anywhere}.reflection-footer{margin-top:24px;color:#aaa;font-size:11px}</style><style>${String(theme.css||'').replace(/<\/style/gi,'')}</style></head><body><article class="reflection-panel" data-panel="custom"><header class="reflection-header">${esc(data?.title||theme.name||'预览')}${titleTranslation}</header><div class="reflection-content">${sections.map((v,i)=>`<details class="reflection-item" ${i===0?'open':''}><summary class="reflection-label">${esc(v.label||`区块 ${i+1}`)}</summary><p class="reflection-text">${esc(v.text||'预览正文：点击标题即可展开或收起。')}</p>${bilingual&&v.translation?`<small class="reflection-translation">${esc(v.translation)}</small>`:''}</details>`).join('')}</div><footer class="reflection-footer">点击区块标题可展开或收起</footer></article></body></html>`}
function openReflectionManager(index,editing){
 const themes=customReflectionThemes();
 if(editing){
  const draft=editing==='new'?{id:'custom-'+Date.now(),name:'',css:'.reflection-content { display: grid; gap: 16px; }\n.reflection-item { padding: 12px 0; }',prompt:''}:{...themes.find(v=>v.id===editing)};
  sheet('','',`<div class="reflection-editor-fullscreen"><header class="reflection-editor-topbar"><button type="button" data-theme-topback aria-label="返回美化列表">Inner Voice</button><span>${editing==='new'?'新增美化':'编辑美化'}</span></header><div class="reflection-editor-scroll"><div class="reflection-editor"><label>名称<input id="reflectionThemeName" maxlength="40" value="${esc(draft.name||'')}" placeholder="给这套面板取个名字"></label><label>CSS<textarea id="reflectionThemeCss" spellcheck="false">${esc(draft.css||'')}</textarea></label><p class="reflection-help">统一类名：.reflection-panel、.reflection-header、.reflection-content、.reflection-item、.reflection-label、.reflection-text、.reflection-footer。样式仅作用于自己的面板。</p><label>配套提示词<textarea id="reflectionThemePrompt" placeholder="描述角色应该写什么、用什么口吻、分成哪些内容…">${esc(draft.prompt||'')}</textarea></label><details class="reflection-tutorial"><summary>零基础教程：直接让 AI 做面板</summary>
<div class="reflection-tutorial-body">
<h4>零基础：直接把需求交给 AI</h4>
<p>你不用自己写 CSS。把下面这段完整复制给你常用的 AI，把方括号里的内容换成自己的想法。也可以把喜欢的页面截图一起发给 AI，并说明“参考它的布局和感觉，不要照搬品牌标志”。</p>
<pre><code>请帮我制作 Iris「心声面板」的一套美化样式，并写一份与它配套的心声提示词。我不会写代码，请严格按下面要求输出，让我能直接复制使用。

【我想要的外观】
在这里描述你喜欢的感觉，例如：像苹果备忘录一样干净，白底、金色细节、标题靠左、内容像纸张上的清单。

【心声想写什么】
在这里描述角色要写的内容，例如：角色此刻在做什么、没说出口的话、对用户的暧昧想法。

【固定类名和位置】
.reflection-panel：整张面板
.reflection-header：面板顶部标题
.reflection-content：所有内容区块的外层
.reflection-item：一个可折叠区块
.reflection-label：可点击的区块标题
.reflection-text：区块正文
.reflection-footer：面板底部
这些类名是 Iris 固定提供的，请原样使用，不要改名、拼错或另造类名。

【面板实际结构和点击功能】
每个区块由 details.reflection-item 包住；里面的 summary.reflection-label 是可点击标题，p.reflection-text 是正文。details 和 summary 已经提供展开、收起功能。

【请遵守这些要求】
1. 只输出两部分，先是「CSS」，再是「配套提示词」。每部分都单独放在代码框里，不要省略任何内容，也不要写讲解。
2. CSS 必须能直接粘贴到 Iris 的 CSS 输入框。所有选择器都以 .reflection-panel 开头，只调整这张面板及其内部元素。
3. 只能使用上面列出的固定类名。不要输出 HTML、JavaScript、脚本、额外类名或其他代码。
4. 保留标题点击后展开和收起的功能。不要隐藏正文，不要取消 summary 的点击，不要用遮挡标题的布局。允许用 ::before 和 ::after 添加装饰符号、CSS 绘制的小图案或贴图；装饰伪元素要设置 pointer-events: none，不能挡住标题点击，也不能代替标题或正文。
5. 适配手机窄屏和长文字：文字可以自动换行，不能让面板左右溢出；不要把正文截断，也不要把面板设成固定高度。
6. 使用普通浏览器支持的 CSS。可以用 ::before 和 ::after 做装饰；如果需要图片，只能使用写在 CSS 里的小型 data URI 图片，不能使用网络图片、外部字体、外部链接或 @import，因为面板不能加载外部资源。
7. 配套提示词只负责告诉 AI 写什么内容、分几个区块、用什么语气。不要让生成心声的 AI 输出 CSS、HTML、类名或分析过程。
8. 先检查 CSS 语法、类名拼写和手机显示要求，再给我最终结果。</code></pre>
<h4>照着做：把 AI 的回答放回这里</h4>
<ol>
<li>先在上面的“名称”里起名，例如“我的备忘录风格”。</li>
<li>把 AI 回答中「CSS」代码框里的内容复制到“CSS”输入框。只复制代码框里面的内容，不要复制“CSS”标题或代码框符号。</li>
<li>往下看预览。样式会即时更新；点示例区块标题可以试展开和收起。</li>
<li>把 AI 回答中「配套提示词」代码框里的内容复制到“配套提示词”输入框。</li>
<li>确认样式和提示词都放对后，点页面底部“保存并使用”。</li>
</ol>
<h4>这 7 个固定类名分别是什么</h4>
<p>“类名”就是 Iris 给面板不同位置起的固定名字。CSS 里名字前的英文点 <code>.</code> 要保留，表示“选择这个位置”。你只要把这张表和上面的要求一起交给 AI，就不用自己判断该写哪个名字。</p>
<table><tbody>
<tr><th>类名</th><th>对应位置</th></tr>
<tr><td><code>.reflection-panel</code></td><td>整张心声面板</td></tr>
<tr><td><code>.reflection-header</code></td><td>面板顶部标题</td></tr>
<tr><td><code>.reflection-content</code></td><td>所有内容区块的外层</td></tr>
<tr><td><code>.reflection-item</code></td><td>一个完整的折叠区块</td></tr>
<tr><td><code>.reflection-label</code></td><td>点击后展开或收起的区块标题</td></tr>
<tr><td><code>.reflection-text</code></td><td>区块里的正文</td></tr>
<tr><td><code>.reflection-footer</code></td><td>面板底部</td></tr>
</tbody></table>
<h4>如果第一版不满意，继续让 AI 修改</h4>
<p>把原来的 CSS 和下面这句话一起发给 AI，把括号里的内容换成你想改的地方。这样 AI 会在原样式上修改，固定类名和点击功能仍然保留。</p>
<pre><code>请在下面这份 CSS 基础上修改：[描述具体想改的地方，例如“标题再小一点，区块间距加大，其他都保持不变”]。
仍然遵守之前的全部限制：保留 Iris 固定类名、手机适配、长文字换行和区块点击折叠。请重新输出完整 CSS 和配套提示词，分别放在代码框里，不要只给我修改片段。</code></pre>
<h4>预览显示什么</h4>
<p>预览用示例文字展示 CSS 的外观和区块折叠功能。提示词会在实际生成心声时决定内容，不会把 AI 生成的文字放进这个样式预览里。</p>
</div></details><iframe title="美化预览" sandbox="" class="reflection-preview"></iframe><p data-theme-error role="status"></p></div></div><footer class="reflection-editor-fixed-actions"><button type="button" data-theme-back>返回</button><button type="button" data-theme-save>保存并使用</button></footer></div>`,{centered:true});
  $('#sheet').classList.add('is-reflection-editor-fullscreen');
  const preview=()=>{$('.reflection-preview').srcdoc=customReflectionDocument({name:$('#reflectionThemeName').value||'预览',css:$('#reflectionThemeCss').value})};preview();$('#reflectionThemeCss').oninput=preview;$('#reflectionThemeName').oninput=preview;
  $('[data-theme-back]').onclick=()=>openReflectionManager(index);$('[data-theme-topback]').onclick=()=>openReflectionManager(index);
  $('[data-theme-save]').onclick=()=>{const name=$('#reflectionThemeName').value.trim(),prompt=$('#reflectionThemePrompt').value.trim();if(!name||!prompt){$('[data-theme-error]').textContent='请填写名称和配套提示词';return}const updated={...draft,name,prompt,css:$('#reflectionThemeCss').value,revision:Date.now()};state.reflectionThemes=[...themes.filter(v=>v.id!==draft.id),updated];state.reflectionPanel=updated.id;save();openReflectionManager(index)};return;
 }
 const activeTheme=themes.find(v=>v.id===state.reflectionPanel),activeName=activeTheme?.name||(state.reflectionPanel==='original'?'默认':reflectionPanelNames[state.reflectionPanel])||'默认';
 sheet('<span class="reflection-script-title">Inner Voice</span>','选择面板美化',`<div class="reflection-current-theme"><span>正在使用</span><strong>${esc(activeName)}</strong></div><section class="reflection-choice-group"><h3>内置<i></i></h3><div class="reflection-choice-strip" aria-label="内置美化">${Object.entries(reflectionPanelNames).map(([id,name])=>`<button type="button" data-theme-choice="${id}" aria-pressed="${state.reflectionPanel===id}">${esc(id==='original'?'默认':name)}</button>`).join('')}</div></section><section class="reflection-choice-group"><h3>我的美化<i></i></h3><div class="reflection-choice-strip" aria-label="我的美化">${themes.length?themes.map(t=>`<div class="reflection-choice-custom"><button type="button" data-theme-choice="${esc(t.id)}" aria-pressed="${state.reflectionPanel===t.id}">${esc(t.name)}</button><div><button type="button" data-theme-edit="${esc(t.id)}">编辑</button><button type="button" data-theme-delete="${esc(t.id)}">删除</button></div></div>`).join(''):'<span class="reflection-choice-empty">还没有自定义美化</span>'}</div></section><div class="reflection-editor-actions"><button type="button" data-theme-return>返回心声</button><button type="button" data-theme-new>＋ 新增美化</button></div>`,{centered:true,hideClose:true});
 $('#sheet').querySelectorAll('[data-theme-choice]').forEach(button=>button.onclick=()=>{state.reflectionPanel=button.dataset.themeChoice;save();$('#sheet').querySelectorAll('[data-theme-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.themeChoice===state.reflectionPanel)));$('.reflection-current-theme strong').textContent=customReflectionThemes().find(v=>v.id===state.reflectionPanel)?.name||(state.reflectionPanel==='original'?'默认':reflectionPanelNames[state.reflectionPanel]);});
 $('#sheet').querySelectorAll('[data-theme-edit]').forEach(button=>button.onclick=()=>openReflectionManager(index,button.dataset.themeEdit));
 $('#sheet').querySelectorAll('[data-theme-delete]').forEach(button=>button.onclick=()=>{state.reflectionThemes=customReflectionThemes().filter(v=>v.id!==button.dataset.themeDelete);if(state.reflectionPanel===button.dataset.themeDelete)state.reflectionPanel='original';save();openReflectionManager(index)});
 $('[data-theme-new]').onclick=()=>openReflectionManager(index,'new');$('[data-theme-return]').onclick=()=>openRoleReflection(index);
}
function openRoleReflection(index){
 const thread=messages(),message=thread[index],reflection=message?.reflection,character=chars[state.char];if(!reflection)return;
 const custom=customReflectionThemes().find(v=>v.id===state.reflectionPanel),type=custom?custom.id:Object.hasOwn(reflectionPanelNames,state.reflectionPanel)?state.reflectionPanel:'original';
 sheet('','', '<div class="reflection-panel-host"></div>',{centered:true});
 const host=$('.reflection-panel-host'),shell=$('#sheet');shell.classList.add('is-reflection-app');shell.dataset.panel=custom?'custom':type;
 const draw=()=>{
 const normalizedPanels=normalizeReflectionPanels(reflection.panels),builtInsComplete=reflectionBuiltInsComplete(normalizedPanels),rawData=custom?(reflection.customPanels?.[custom.id]?.revision===custom.revision?reflection.customPanels[custom.id]:null):normalizedPanels[type],data=rawData,name=character?.name||'角色',date=new Date(message.createdAt||Date.now()).toLocaleString('zh-CN',{month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'}),g=reflectionGlyph,bilingual=Boolean(currentRoleChatSettings().more?.bilingual);
 const item=(label,text,attrs='',translation='')=>`<section class="reflection-item" ${attrs}><div class="reflection-label">${esc(label)}</div><p class="reflection-text">${esc(text)}</p>${bilingual&&translation?`<small class="reflection-translation">${esc(translation)}</small>`:''}</section>`;
 const xState=reflection.xInteractions||{liked:false,reposted:false,bookmarked:false,replies:[]};
 const decoration=(icons)=>`<span class="reflection-tools" aria-hidden="true">${icons.map(g).join('')}</span>`;
 const notesGlyph=name=>`<img class="reflection-notes-icon" src="assets/notes-icons/notes-${name}.webp" alt="" aria-hidden="true" draggable="false">`;
 const notesTools=icons=>`<span class="reflection-tools reflection-notes-tools" aria-hidden="true">${icons.map(notesGlyph).join('')}</span>`;
 let title='此刻',body='',footer='',leading=g('back');
 if(type==='original')body=item('当前状态',reflection.status||'暂无状态','',reflection.statusTranslation)+item('心声',reflection.thought||'暂无心声','',reflection.thoughtTranslation);
 if(type==='notes'){title='备忘录';leading=notesGlyph('back');if(data)body=`<div class="reflection-meta">${esc(date)}</div><h3 class="reflection-title">${esc(data.title)}</h3>${bilingual&&data.titleTranslation?`<small class="reflection-translation reflection-title-translation">${esc(data.titleTranslation)}</small>`:''}`+['todo','done'].map(k=>`<div class="reflection-group"><div class="reflection-label">${k==='todo'?'待做':'已完成'}</div>${data[k].map(t=>item(k==='done'?'✓':'',t.text,`data-state="${k}"`,t.translation)).join('')||'<p class="reflection-empty">暂无事项</p>'}</div>`).join('');footer=notesTools(['checklist','mark','camera','write']);}
 if(type==='gpt'){title='ChatGPT';leading=g('menu');if(data)body=data.messages.map((v,index)=>item('',v.text,`data-speaker="${v.speaker}"`,v.translation)+(v.speaker==='gpt'?`<div class="reflection-response-tools">${[['copy','复制'],['share','分享'],['more','更多']].map(([action,label])=>`<button type="button" data-gpt-action="${action}" data-gpt-index="${index}" aria-label="${label}">${reflectionGptGlyph(action)}</button>`).join('')}<div class="reflection-gpt-more" data-gpt-menu="${index}" hidden><button type="button" data-gpt-action="copy-all" data-gpt-index="${index}">复制整段对话</button></div></div>`:'')).join('');footer=`<div class="reflection-composer" aria-label="模拟对话记录"><span>${g('plus')}</span><span>询问 ChatGPT</span><span>${g('mic')}</span><span class="reflection-voice">${g('voice')}</span></div>`;}
 if(type==='x'){title='𝕏';if(data)body=`<div class="reflection-profile">${avatar(character)}<div><strong class="reflection-x-name"><span>${esc(name)}</span><img class="reflection-verified" src="assets/x-icons/verified.webp" alt="认证"></strong><span>@${esc(String(character?.nickname||name).replace(/^@\s*/,''))}</span></div><button type="button" class="reflection-x-follow" aria-label="关注角色" aria-pressed="${Boolean(xState.followed)}">${xState.followed?'已关注':'<img src="assets/x-icons/follow.webp" alt="关注">'}</button></div>`+item('',data.text,'',data.translation)+`<div class="reflection-meta">${esc(date)} · 公开帖子</div><div class="reflection-post-actions">${[['comment','评论',null,data.replies.length+(xState.replies?.length||0)],['repost','转发','reposted',Number(xState.reposted)],['heart','点赞','liked',Number(xState.liked)],['bookmark','收藏','bookmarked',Number(xState.bookmarked)],['share','分享',null,'']].map(([id,label,key,count])=>`<button type="button" data-x-action="${id}" aria-label="${label}" ${key?`aria-pressed="${Boolean(xState[key])}"`:''}>${reflectionXGlyph(id,Boolean(key&&xState[key]))}<span>${count}</span></button>`).join('')}</div><div class="reflection-related"><span>回复 · ${data.replies.length+(xState.replies?.length||0)}</span><span>相关</span></div><div class="reflection-x-replies">${[...data.replies,...(xState.replies||[])].map(reply=>`<section class="reflection-x-reply"><span class="reflection-npc-avatar">${esc(reply.name.slice(0,1))}</span><div><div class="reflection-npc-heading"><strong>${esc(reply.name)}</strong><span>@${esc(reply.nickname||reply.name)}</span></div><p>${esc(reply.text)}</p>${bilingual&&reply.translation?`<small class="reflection-translation">${esc(reply.translation)}</small>`:''}</div></section>`).join('')}</div>`;footer=`${data?'<form class="reflection-x-composer"><input name="reply" maxlength="500" placeholder="发布你的回复" aria-label="评论内容" required><button type="submit">回复</button></form>':''}<nav class="reflection-x-nav" aria-label="X 导航装饰">${['home','search','grok','bell','message'].map(id=>`<span>${reflectionXGlyph(id)}</span>`).join('')}</nav>`;}
 if(custom){title=esc(custom.name);body=data?'<iframe class="reflection-custom-frame" title="自定义心声面板" sandbox=""></iframe>':'';}
 const translationMissing=()=>{if(!bilingual)return false;if(custom&&data)return !data.titleTranslation||data.sections.some(section=>!section.translation);if(type==='original')return Boolean((reflection.status&&!reflection.statusTranslation)||(reflection.thought&&!reflection.thoughtTranslation));if(type==='x'&&data)return !data.translation||data.replies.some(reply=>!reply.translation);if(type==='notes'&&data)return !data.titleTranslation||[...data.todo,...data.done].some(entry=>!entry.translation);if(type==='gpt'&&data)return data.messages.some(entry=>!entry.translation);return false};
 const needsTranslation=translationMissing(),needsContentGeneration=!builtInsComplete||Boolean(custom&&!data),needsGenerate=needsContentGeneration||needsTranslation,generationLabel=custom&&!builtInsComplete?'生成默认面板和当前美化':custom?'生成这套美化':'生成默认内置面板';
 if(needsGenerate)body+=`<div class="reflection-empty"><p>${needsTranslation&&!needsContentGeneration?'双语译文尚未补全':generationLabel}</p><button type="button" class="reflection-generate" ${reflectionPanelRequests.has(reflection)?'disabled':''}>${reflectionPanelRequests.has(reflection)?'正在生成…':needsTranslation&&!needsContentGeneration?'补全双语译文':generationLabel}</button><p class="reflection-error" role="status"></p></div>`;
 host.innerHTML=`<article class="reflection-panel" data-panel="${custom?'custom':type}"><header class="reflection-header"><button type="button" class="reflection-back" aria-label="关闭心声">${leading}</button><strong>${title}</strong><div class="reflection-header-actions">${type==='notes'?notesTools(['compose','share']):type==='gpt'?`<span class="reflection-gpt-compose" aria-hidden="true">${reflectionGptGlyph('compose')}</span>`:''}<button type="button" class="reflection-more-button" aria-label="心声美化，切换或新增面板">${type==='notes'?notesGlyph('more'):g('more')}</button></div></header><div class="reflection-content">${body}</div><footer class="reflection-footer">${footer}</footer></article>`;
 host.querySelector('.reflection-back').onclick=closeSheet;host.querySelector('.reflection-more-button').onclick=event=>{event.currentTarget.blur();openReflectionManager(index)};
 if(custom&&data)host.querySelector('iframe').srcdoc=customReflectionDocument(custom,data,bilingual);
 if(type==='gpt'&&data)host.querySelectorAll('[data-gpt-action]').forEach(button=>button.onclick=async()=>{
  const action=button.dataset.gptAction,index=Number(button.dataset.gptIndex),reply=data.messages[index];if(!reply)return;
  if(action==='more'){const menu=host.querySelector(`[data-gpt-menu="${index}"]`);menu.hidden=!menu.hidden;button.setAttribute('aria-expanded',String(!menu.hidden));return}
  const text=action==='copy-all'?data.messages.map(v=>`${v.speaker==='gpt'?'ChatGPT':name}：${v.text}`).join('\n\n'):reply.text;
  try{if(action==='share'&&navigator.share)await navigator.share({title:'ChatGPT 对话',text});else if(navigator.clipboard){await navigator.clipboard.writeText(text);toast('已复制')}else toast('当前浏览器不支持复制，请长按正文复制')}catch(error){if(error.name!=='AbortError')toast('操作失败，请重试')}
 });

 if(type==='x'&&data){
  const persist=()=>{latestReplyTurn(thread);save()};
  host.querySelector('.reflection-x-follow').onclick=()=>{reflection.xInteractions||={liked:false,reposted:false,bookmarked:false,replies:[]};reflection.xInteractions.followed=!reflection.xInteractions.followed;persist();const followed=reflection.xInteractions.followed,button=host.querySelector('.reflection-x-follow');button.setAttribute('aria-pressed',String(followed));button.innerHTML=followed?'已关注':`<img src="assets/x-icons/follow.webp" alt="关注">`};
  host.querySelectorAll('[data-x-action]').forEach(button=>button.onclick=async()=>{
   const action=button.dataset.xAction;
   if(action==='comment'){host.querySelector('.reflection-x-composer input').focus();return}
   if(action==='share'){const text=`${name} @${character?.nickname||name}\n${data.text}`;try{if(navigator.share)await navigator.share({title:`${name}的帖子`,text});else if(navigator.clipboard){await navigator.clipboard.writeText(text);toast('帖子已复制')}else{toast('当前浏览器不支持分享，请长按正文复制')}}catch(error){if(error.name!=='AbortError')toast('分享失败，请重试')}return}
   const key={heart:'liked',repost:'reposted',bookmark:'bookmarked'}[action];if(!key)return;
   reflection.xInteractions||={liked:false,reposted:false,bookmarked:false,replies:[]};reflection.xInteractions[key]=!reflection.xInteractions[key];persist();button.setAttribute('aria-pressed',String(reflection.xInteractions[key]));const image=button.querySelector('img');if(image&&['heart','bookmark','repost'].includes(action))image.src=`assets/x-icons/${action}${reflection.xInteractions[key]?'-active':''}.webp`;const counter=button.querySelector('span');if(counter&&action!=='repost')counter.textContent=reflection.xInteractions[key]?'1':'';
  });
  host.querySelector('.reflection-x-composer').onsubmit=event=>{event.preventDefault();const input=event.currentTarget.elements.reply,text=input.value.trim();if(!text)return;const user=state.users[state.user]||{};reflection.xInteractions||={liked:false,reposted:false,bookmarked:false,replies:[]};reflection.xInteractions.replies||=[];const reply={name:user.name||user.nickname||'我',nickname:user.nickname||user.name||'me',text:text.slice(0,500)};reflection.xInteractions.replies.push(reply);persist();const row=document.createElement('section');row.className='reflection-x-reply';row.innerHTML=`<span class="reflection-npc-avatar">${esc(reply.name.slice(0,1))}</span><div><div class="reflection-npc-heading"><strong>${esc(reply.name)}</strong><span>@${esc(reply.nickname)}</span></div><p>${esc(reply.text)}</p></div>`;host.querySelector('.reflection-x-replies').append(row);input.value='';const total=data.replies.length+reflection.xInteractions.replies.length;host.querySelector('.reflection-related span').textContent=`回复 · ${total}`;host.querySelector('[data-x-action="comment"] span').textContent=String(total);row.scrollIntoView({block:'nearest'})};
 }

 const generate=host.querySelector('.reflection-generate');if(generate)generate.onclick=async()=>{const translating=!needsContentGeneration&&translationMissing();if(translating)reflectionTranslationRequests.add(reflection);else reflectionPanelRequests.add(reflection);draw();try{if(translating)await completeReflectionTranslations(thread,index,custom);else await generateReflectionPanels(thread,index,character,custom);reflectionPanelRequests.delete(reflection);reflectionTranslationRequests.delete(reflection);if(host.isConnected)draw()}catch(error){reflectionPanelRequests.delete(reflection);reflectionTranslationRequests.delete(reflection);if(host.isConnected){draw();host.querySelector('.reflection-error').textContent=error.message||'生成失败，请重试'}}finally{reflectionPanelRequests.delete(reflection);reflectionTranslationRequests.delete(reflection)}};
 if(needsTranslation&&!needsContentGeneration&&!reflectionTranslationRequests.has(reflection)&&!reflectionPanelRequests.has(reflection)){
  reflectionTranslationRequests.add(reflection);
  completeReflectionTranslations(thread,index,custom).then(()=>{reflectionTranslationRequests.delete(reflection);if(host.isConnected)draw()}).catch(error=>{reflectionTranslationRequests.delete(reflection);if(host.isConnected){const status=host.querySelector('.reflection-error');if(status)status.textContent=error.message||'译文补全失败，可重试'}})
 }
 };draw();finishReflectionRead=()=>{reflection.readAt=reflection.readAt||Date.now();latestReplyTurn(thread);save();render()};
}
async function generateReflectionPanels(thread,index,character,custom=null){
 const reflection=thread[index]?.reflection,config=apiConfigForFeature('onlineChat'),model=apiModelForFeature('onlineChat',config);if(!reflection)throw Error('找不到这条心声');if(!config?.url||!config?.key||!model)throw Error('请先在总设置中连接聊天 API');
 const bilingual=Boolean(currentRoleChatSettings().more?.bilingual),targetLang=currentRoleChatSettings().more?.targetLang||'zh-Hans',existingPanels=reflection.panels||{},includeBuiltIns=!custom||!reflectionBuiltInsComplete(existingPanels),storedCustom=custom?reflection.customPanels?.[custom.id]:null,includeCustom=Boolean(custom&&storedCustom?.revision!==custom.revision);
 if(!includeBuiltIns&&!includeCustom)return;
 const translationInstruction=bilingual?`【双语译文要求】目标译文语言为 ${targetLang}。原文保持角色实际使用的语言，所有内置面板字段都附上对应 translation；base 对象包含当前状态和心声的译文。译文准确对应原文，不添加标签或解释。`:'',
  customInstruction=includeCustom?`【当前自定义心声面板】依据角色资料、世界书和截至当前的聊天，为虚构角色生成独立私人面板；遵守用户的面板提示词，不编造已发生的事情，不输出模型推理。用户提示词：\n${custom.prompt}\n${bilingual?`双语模式已开启，每个区块都要附 ${targetLang} 译文。`:'面板内容使用纯文本。'}不要输出 HTML。`:'';
 const builtInSchema=`${bilingual?'"base":{"statusTranslation":"","thoughtTranslation":""},':''}"x":{"text":"帖子","translation":"帖子译文","replies":[{"name":"NPC姓名","nickname":"NPC网名","relation":"关系","text":"评论","translation":"评论译文"}]},"notes":{"title":"标题","titleTranslation":"标题译文","todo":[{"text":"待做","translation":"译文"}],"done":[{"text":"已完成","translation":"译文"}]},"gpt":{"messages":[{"speaker":"character","text":"内容","translation":"译文"},{"speaker":"gpt","text":"回复","translation":"译文"}]}}`;
 const customSchema=`{"title":"标题","${bilingual?'titleTranslation":"标题译文",':''}sections":[{"label":"小标题","text":"正文"${bilingual?',"translation":"译文"':''}}]}`;
 const schema=includeBuiltIns?`{${builtInSchema.slice(0,-1)}${includeCustom?`,"custom":${customSchema}`:''}}`:customSchema;
 const systemContent=[includeBuiltIns?reflectionPanelInstructions+translationInstruction:'',customInstruction,`只输出一个 JSON 对象，结构为：${schema}。不得省略要求的面板，不输出 Markdown 或聊天回复。`].filter(Boolean).join('\n\n');
 const prior=[...thread.slice(0,index)].reverse().find(item=>item.reflection?.panels?.notes)?.reflection.panels.notes;
 const transcript=thread.slice(0,index+1).slice(-36).map(item=>`${item.mine?'用户':character?.name||'角色'}：${messagePromptContent(item)}`).join('\n');
 const response=await fetch(config.url.replace(/\/+$/,'').replace(/\/chat\/completions$/,'')+'/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${config.key}`},body:JSON.stringify({model,messages:[{role:'system',content:systemContent},{role:'user',content:`角色：${character?.name||''}\n设定：${character?.details||character?.desc||''}\n角色世界书：${JSON.stringify(character?.worldBooks||[])}\n已有内置面板（保留已有内容）：${JSON.stringify(existingPanels)}\n已有自定义面板：${JSON.stringify(storedCustom||null)}\n此前备忘录：${JSON.stringify(prior||null)}\n当前状态：${reflection.status||''}\n当前心声：${reflection.thought||''}\n截至此刻的对话：\n${transcript}`}]})});
 if(!response.ok)throw Error(`生成失败（${response.status}），请重试`);const result=await response.json();let raw=result.choices?.[0]?.message?.content;if(Array.isArray(raw))raw=raw.map(v=>v.text||'').join('');let parsed;try{parsed=JSON.parse(String(raw||'').trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,''))}catch{throw Error('返回格式不完整，请重试')}
 let customPanel=null,panels=null;
 if(includeCustom){const value=includeBuiltIns?parsed.custom:parsed,sections=Array.isArray(value?.sections)?value.sections.filter(v=>v&&typeof v.text==='string'&&v.text.trim()).slice(0,20).map(v=>({label:String(v.label||'').slice(0,100),text:v.text.slice(0,6000),translation:String(v.translation||'').trim().slice(0,6000)})):[];if(!sections.length)throw Error('自定义面板内容不完整，请重试');const titleTranslation=String(value.titleTranslation||'').trim().slice(0,1000);if(bilingual&&(!titleTranslation||sections.some(section=>!section.translation)))throw Error('自定义面板译文不完整，请重试');customPanel={title:String(value.title||custom.name).slice(0,100),titleTranslation,sections,revision:custom.revision};}
 if(includeBuiltIns){panels=normalizeReflectionPanels(parsed.panels||parsed);if(!panels.x||!panels.x.replies.length||!panels.notes||!panels.gpt||panels.gpt.messages.length<6||panels.gpt.messages.some((item,i)=>item.speaker!==(i%2?'gpt':'character')))throw Error('内置面板内容或 GPT 多轮对话不完整，请重试');if(bilingual&&(!parsed.base?.statusTranslation||!parsed.base?.thoughtTranslation||!panels.x.translation||panels.x.replies.some(reply=>!reply.translation)||!panels.notes.titleTranslation||[...panels.notes.todo,...panels.notes.done].some(item=>!item.translation)||panels.gpt.messages.some(item=>!item.translation)))throw Error('内置面板译文不完整，请重试');}
 if(includeBuiltIns){if(bilingual){reflection.statusTranslation=String(parsed.base.statusTranslation).trim();reflection.thoughtTranslation=String(parsed.base.thoughtTranslation).trim()}panels.x.version=3;reflection.panels={...reflection.panels,...panels};}
 if(includeCustom){reflection.customPanels||={};reflection.customPanels[custom.id]=customPanel;}
 latestReplyTurn(thread);save();
}
async function completeReflectionTranslations(thread,index,custom=null){
 const reflection=thread[index]?.reflection,panels=normalizeReflectionPanels(reflection?.panels),config=apiConfigForFeature('onlineChat'),model=apiModelForFeature('onlineChat',config),targetLang=currentRoleChatSettings().more?.targetLang||'zh-Hans';
 if(!reflection)throw Error('找不到这条心声');if(!config?.url||!config?.key||!model)throw Error('请先在总设置中连接聊天 API');
 const customData=custom?reflection.customPanels?.[custom.id]:null;if(custom&&!customData)throw Error('找不到这套自定义心声内容');
 const source=custom?{title:customData.title||custom.name,sections:(customData.sections||[]).map(section=>section.text)}:{base:{status:reflection.status||'',thought:reflection.thought||''},x:panels.x?{text:panels.x.text,replies:panels.x.replies.map(reply=>reply.text)}:null,notes:panels.notes?{title:panels.notes.title,todo:panels.notes.todo.map(item=>item.text),done:panels.notes.done.map(item=>item.text)}:null,gpt:panels.gpt?{messages:panels.gpt.messages.map(item=>({speaker:item.speaker,text:item.text}))}:null};
 const translationPrompt=custom?`你是译者。把给定自定义心声内容的标题和每个区块正文分别翻译成 ${targetLang}。严格保留区块顺序和数量，不改写原文，只返回 JSON：{"titleTranslation":"标题译文","sections":[{"translation":"对应区块译文"}]}。只输出 JSON，不要 Markdown。`:`你是译者。把给定 JSON 中每条原文分别翻译成 ${targetLang}。严格保留数组顺序和项目数量，不改写或复述原文，只返回 JSON：{"base":{"statusTranslation":"","thoughtTranslation":""},"x":{"translation":"","replies":[{"translation":""}]},"notes":{"titleTranslation":"","todo":[{"translation":""}],"done":[{"translation":""}]},"gpt":{"messages":[{"translation":""}]}}。输入中为 null 的面板仍返回 null；空原文对应空译文。只输出 JSON，不要 Markdown。`;
 const response=await fetch(config.url.replace(/\/+$/,'').replace(/\/chat\/completions$/,'')+'/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${config.key}`},body:JSON.stringify({model,messages:[{role:'system',content:translationPrompt},{role:'user',content:JSON.stringify(source)}]})});
 if(!response.ok)throw Error(`译文请求失败（${response.status}）`);const result=await response.json();let raw=result.choices?.[0]?.message?.content;if(Array.isArray(raw))raw=raw.map(v=>v.text||'').join('');let translated;try{translated=JSON.parse(String(raw||'').trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,''))}catch{throw Error('译文格式不完整，请重试')}
 const val=value=>typeof value==='string'?value.trim():'';
 if(custom){customData.titleTranslation=customData.titleTranslation||val(translated.titleTranslation);customData.sections=(customData.sections||[]).map((section,i)=>({...section,translation:section.translation||val(translated.sections?.[i]?.translation)}));if(!customData.titleTranslation||customData.sections.some(section=>!section.translation))throw Error('自定义心声译文没有补全，请点击按钮重试');latestReplyTurn(thread);save();return}
 if(reflection.status&&!reflection.statusTranslation&&val(translated.base?.statusTranslation))reflection.statusTranslation=val(translated.base.statusTranslation);
 if(reflection.thought&&!reflection.thoughtTranslation&&val(translated.base?.thoughtTranslation))reflection.thoughtTranslation=val(translated.base.thoughtTranslation);
 if(panels.x){const t=translated.x||{};if(!panels.x.translation)panels.x.translation=val(t.translation);panels.x.replies=panels.x.replies.map((reply,i)=>({...reply,translation:reply.translation||val(t.replies?.[i]?.translation)}));}
 if(panels.notes){const t=translated.notes||{};if(!panels.notes.titleTranslation)panels.notes.titleTranslation=val(t.titleTranslation);for(const key of ['todo','done'])panels.notes[key]=panels.notes[key].map((entry,i)=>({...entry,translation:entry.translation||val(t[key]?.[i]?.translation)}));}
 if(panels.gpt){const items=translated.gpt?.messages||[];panels.gpt.messages=panels.gpt.messages.map((entry,i)=>({...entry,translation:entry.translation||val(items[i]?.translation)}));}
 if((reflection.status&&!reflection.statusTranslation)||(reflection.thought&&!reflection.thoughtTranslation)||(panels.x&&(!panels.x.translation||panels.x.replies.some(reply=>!reply.translation)))||(panels.notes&&(!panels.notes.titleTranslation||[...panels.notes.todo,...panels.notes.done].some(item=>!item.translation)))||(panels.gpt&&panels.gpt.messages.some(item=>!item.translation)))throw Error('译文没有补全，请点击按钮重试');
 reflection.panels={...reflection.panels,...panels};latestReplyTurn(thread);save();
}

function closeSheet(){const finish=finishReflectionRead;finishReflectionRead=null;if(finish)finish();$('#sheet').hidden=true;$('#shade').hidden=true;$('#characters').setAttribute('aria-expanded','false')}
function sheet(title,subtitle,body,options={}){$('#sheet').classList.remove('is-reflection-app','is-reflection-editor-fullscreen','is-message-edit');delete $('#sheet').dataset.panel;if(finishReflectionRead){const finish=finishReflectionRead;finishReflectionRead=null;finish()}$('#sheet').classList.toggle('is-centered-panel',Boolean(options.centered));$('#shade').hidden=false;$('#sheet').hidden=false;$('#sheet').innerHTML=`<div class="handle"></div><div class="sheet-head"><div><h2>${title}</h2><p class="sheet-sub">${subtitle}</p></div>${options.hideClose?'':'<button class="sheet-close" aria-label="关闭面板">×</button>'}</div>${body}`;const closeButton=$('.sheet-close');if(closeButton)closeButton.onclick=closeSheet}
function characters(){closeSheet();closeFeatureMenu();openCharacters()}
function users(){closeFeatureMenu();openProfiles()}
function parseOfflineOutputRegex(rule){const source=String(rule?.find||'').trim();if(!source||source.length>512)return null;const wrapped=source.match(/^\/([\s\S]*)\/([dgimsuvy]*)$/),pattern=wrapped?wrapped[1]:source,flags=wrapped?wrapped[2]:'g';if(pattern.length>512||/\((?:\\.|[^()\\])*(?:[*+]|\{\d+,?\d*\})(?:\\.|[^()\\])*\)\s*(?:[*+]|\{\d+,?\d*\})/.test(pattern)||/\\[1-9].*[+*{]/.test(pattern)||/(?:\.\*|\.\+).*(?:\.\*|\.\+)/.test(pattern))return null;for(const group of pattern.matchAll(/\((?:\?:)?([^()]*)\)([+*]|\{\d+,?\d*\})/g)){const branches=group[1].split(/(?<!\\)\|/).map(item=>item.replace(/\\./g,'x'));if(branches.some((left,index)=>branches.some((right,other)=>index!==other&&(left.startsWith(right)||right.startsWith(left)))))return null}try{return new RegExp(pattern,flags)}catch{return null}}
function applyOfflineRegexRules(value,settings=currentRoleOfflineData().settings,target='ai',lane='context'){let source=String(value??'');const builtin=settings?.regexRules?.find(rule=>rule.id===IrisMiniTheater.ruleId);if(lane==='context'&&builtin?.enabled!==false&&builtin&&(target==='ai'||target==='any'))source=IrisMiniTheater.filterHistory(source);if(source.length>12000)return source;const rules=[...(settings?.regexRules||[])];for(const rule of rules){if(rule.id===IrisMiniTheater.ruleId)continue;const targets=Array.isArray(rule.target)?rule.target:[rule.target||'ai'],matchesTarget=target==='any'?targets.some(item=>item==='ai'||item==='user'):targets.includes(target);if(rule.enabled===false||!matchesTarget||(lane==='display'?!rule.displayEnabled:rule.contextEnabled===false))continue;const regex=parseOfflineOutputRegex(rule);if(!regex)continue;try{source=source.replace(regex,String(rule.replace??'').slice(0,512))}catch(error){console.warn('Offline regex rule skipped:',rule.name,error)}}return source}
function filterOfflineSystemDisplay(value,streaming=false){let source=String(value??'').replace(/&lt;\s*!--/gi,'<!--').replace(/--\s*&gt;/gi,'-->');source=source.replace(/<!--[\s\S]*?-->/g,'');const open=source.lastIndexOf('<!--');if(open>=0)return source.slice(0,open);if(!streaming)return source;source=source.replace(/&lt;(?!!?\s*!--)\s*!?-?$/i,match=>match.replace(/&lt;/i,'<'));const partial=source.match(/<(?:!|!-)?$/);return partial?source.slice(0,-partial[0].length):source}
function offlineMainStoryContent(message){const copy={...message,text:IrisMiniTheater.filterHistory(message?.text||'')};if(message?.quote)copy.quote={...message.quote,text:IrisMiniTheater.filterHistory(message.quote.text||'')};return messagePromptContent(copy)}
function offlineContextMessage(message,settings=currentRoleOfflineData().settings,target=message?.mine?'user':'ai'){if(!message||message.type&&message.type!=='text')return messagePromptContent(message||{});const copy={...message,text:applyOfflineRegexRules(message.text,settings,target,'context')};if(message.quote)copy.quote={...message.quote,text:applyOfflineRegexRules(message.quote.text,settings,target,'context')};return offlineMainStoryContent(copy)}
function messagePromptContent(message){const sender=message.mine?'用户':'你';if(message.quote)return `${sender}引用了${message.quote.speaker||'一条消息'}的内容「${message.quote.text||''}」${message.text?`，并回复：${message.text}`:'。'}`;switch(message.type){case'market-event':if(message.marketEvent?.type!=='role-gift')return message.text||'';case'gift-card':{const order=window.IrisMarketCore?.giftOrder(state,message.marketEvent);return order?`【赠礼事件卡片】${order.kind==='role-gift'?`${order.characterName||'你'}给用户购买了`:`用户给${order.characterName||'收礼人'}购买了`}${order.items.map(item=>item.name).join('、')}。当前状态：${chatGiftStatus(order)}。附言（故事内容）：${order.note||'无'}。这是一张事件卡片，不是人物说出的台词。`: '【赠礼事件卡片】订单已不可用，不推测状态。'}case'pat':return message.patBy==='role'?'你拍了拍用户。':'用户拍了拍你。';case'image':return message.imageDescription?`${sender}发送了一条图片描述：${message.imageDescription}`:`${sender}发送了一张图片。当前文字模型无法读取图片像素，请根据此前对图片的描述或上下文回应，不要臆测画面内容。`;case'voice':return `${sender}发送了一条约 ${Math.max(1,Number(message.duration)||1)} 秒的语音消息，语音文字内容是：「${message.voiceText||''}」${message.voiceTranslation?`（译文：「${message.voiceTranslation}」）`:''}`;case'transfer':return `${sender}发起了一笔转账：${message.currency||'CNY'} ${formatTransferNumber(message.amount,message.currency||'CNY')}${message.mine&&(message.currency||'CNY')==='CNY'&&Number.isFinite(Number(message.characterAmount))?`（按角色本地币种 ${message.characterCurrency||'CNY'} 参考汇率约合 ${formatTransferNumber(message.characterAmount,message.characterCurrency||'CNY')}）`:''}。状态：${message.status||'pending'}。备注：${message.note||'无'}${message.noteTranslation?`（备注译文：${message.noteTranslation}）`:''}`;case'location':return `${sender}分享了位置：${message.placeName||'未命名地点'}。距离：${message.distance||'未注明'}。${message.detail||''} ${message.coordinates||''}`;case'sticker':return `${sender}发送了表情包：${message.sticker||''}`;case'call-summary':return `视频通话已结束。通话总结：${message.summary||''}`;default:return message.text||''}}
function sendStructuredMessage(message){const item={mine:true,createdAt:Date.now(),...message};if(item.type==='transfer'){const settings=currentRoleChatSettings(),userIndex=Number.isInteger(settings.userIndex)?settings.userIndex:state.user;window.IrisMarketCore.settleTransfer(state,userIndex,item,'send')}messages().push(item);save();render();if(item.type==='transfer'){item.characterCurrency=characterTransferCurrency(chars[state.char]);void applyTransferExchangeRates([item],item.characterCurrency).then(()=>{save();render()})}}
function enabledRoleStickers(roleSettings=currentRoleChatSettings()){
 return(state.emojis?.groups||[]).filter(group=>roleSettings.more?.emojiGroups?.[group.id]!==false).flatMap(group=>(group.items||[]).filter(item=>item.text&&item.url).map(item=>({text:String(item.text).trim(),url:String(item.url)}))).filter(item=>item.text&&item.url);
}
const transferCurrencyRules=[
 ['USD',/美国|美利坚|纽约|洛杉矶|旧金山|西雅图|波士顿|芝加哥|United States|\bUSA\b|\bAmerican\b|New York|Los Angeles|San Francisco|Seattle|Boston|Chicago/i],
 ['CAD',/加拿大|多伦多|温哥华|蒙特利尔|Canada|Toronto|Vancouver|Montreal/i],
 ['GBP',/英国|英格兰|苏格兰|威尔士|伦敦|United Kingdom|\bUK\b|England|Scotland|Wales|London/i],
 ['JPY',/日本|东京|大阪|京都|Japan|Tokyo|Osaka|Kyoto/i],
 ['KRW',/韩国|南韩|首尔|釜山|South Korea|Seoul|Busan/i],
 ['HKD',/香港|Hong Kong/i],['TWD',/台湾|台北|Taiwan|Taipei/i],['SGD',/新加坡|Singapore/i],
 ['AUD',/澳大利亚|澳洲|悉尼|墨尔本|Australia|Sydney|Melbourne/i],['NZD',/新西兰|奥克兰|New Zealand|Auckland/i],
 ['CHF',/瑞士|苏黎世|日内瓦|Switzerland|Zurich|Geneva/i],['RUB',/俄罗斯|莫斯科|Russia|Moscow/i],
 ['INR',/印度|孟买|新德里|India|Mumbai|New Delhi/i],['THB',/泰国|曼谷|Thailand|Bangkok/i],
 ['VND',/越南|河内|胡志明市|Vietnam|Hanoi|Ho Chi Minh/i],['MYR',/马来西亚|吉隆坡|Malaysia|Kuala Lumpur/i],
 ['IDR',/印度尼西亚|印尼|雅加达|Indonesia|Jakarta/i],['PHP',/菲律宾|马尼拉|Philippines|Manila/i],
 ['AED',/阿联酋|迪拜|阿布扎比|United Arab Emirates|Dubai|Abu Dhabi/i],['SAR',/沙特|利雅得|Saudi Arabia|Riyadh/i],
 ['MXN',/墨西哥|Mexico/i],['BRL',/巴西|Brazil/i],['TRY',/土耳其|伊斯坦布尔|Turkey|Istanbul/i],
 ['NOK',/挪威|奥斯陆|Norway|Oslo/i],['SEK',/瑞典|斯德哥尔摩|Sweden|Stockholm/i],['DKK',/丹麦|哥本哈根|Denmark|Copenhagen/i],
 ['EUR',/欧元区|欧洲|法国|德国|意大利|西班牙|葡萄牙|荷兰|比利时|奥地利|爱尔兰|芬兰|希腊|法国巴黎|France|Germany|Italy|Spain|Portugal|Netherlands|Belgium|Austria|Ireland|Finland|Greece|Eurozone/i],
 ['CNY',/中国|大陆|北京|上海|广州|深圳|杭州|China|Beijing|Shanghai|Guangzhou|Shenzhen|Hangzhou/i]
];
function characterResidence(character){return String(character?.residence||character?.location||character?.country||character?.hometown||'').trim()}
function characterTransferCurrency(character){
 const explicit=String(character?.currency||character?.currencyCode||'').trim().toUpperCase();if(/^[A-Z]{3}$/.test(explicit))return explicit;
 const description=[characterResidence(character),character?.details,character?.desc].filter(Boolean).join(' ');
 return transferCurrencyRules.find(([,pattern])=>pattern.test(description))?.[0]||'CNY';
}
function currencyPresentation(code){
 try{const formatter=new Intl.NumberFormat('zh-CN',{style:'currency',currency:code}),parts=formatter.formatToParts(1),symbol=parts.find(part=>part.type==='currency')?.value||code,digits=formatter.resolvedOptions().maximumFractionDigits;return{code,symbol,digits}}catch{return{code:'CNY',symbol:'¥',digits:2}}
}
function formatTransferNumber(amount,code){const {digits}=currencyPresentation(code);return new Intl.NumberFormat('zh-CN',{minimumFractionDigits:digits,maximumFractionDigits:digits}).format(Number(amount)||0)}
async function exchangeRateToCny(code){
 if(code==='CNY')return{rate:1,date:''};
 const cache=state.settings.fxRates?.[code];if(cache?.rate&&Date.now()-Number(cache.fetchedAt)<20*60*60*1000)return cache;
 try{const response=await fetch(`https://api.frankfurter.dev/v2/rate/${encodeURIComponent(code.toLowerCase())}/cny`);if(!response.ok)throw Error('rate unavailable');const result=await response.json();if(!(Number(result.rate)>0))throw Error('rate unavailable');const value={rate:Number(result.rate),date:String(result.date||''),fetchedAt:Date.now()};state.settings.fxRates={...(state.settings.fxRates||{}),[code]:value};return value}catch{return cache?.rate?cache:null}
}
async function applyTransferExchangeRates(items,targetCurrency='CNY'){
 for(const item of items){if(item?.type!=='transfer')continue;item.currency=item.currency||'CNY';if(item.currency==='CNY'){item.cnyAmount=Number(item.amount)||0;if(item.mine&&targetCurrency!=='CNY'){item.characterCurrency=targetCurrency;const targetRate=await exchangeRateToCny(targetCurrency);if(targetRate){item.characterAmount=(Number(item.amount)||0)/targetRate.rate;item.characterExchangeRate=1/targetRate.rate;item.characterExchangeRateDate=targetRate.date}}continue}const rate=await exchangeRateToCny(item.currency);if(rate){item.cnyAmount=(Number(item.amount)||0)*rate.rate;item.exchangeRate=rate.rate;item.exchangeRateDate=rate.date}}
}
let pendingRoleActions=[];
function createMarketRoleIntent(action,roleIndex,userIndex){
 const C=window.IrisMarketCore;if(!C||!state.users?.[userIndex]||!chars[roleIndex])return null;const role=chars[roleIndex],bound=Number.isInteger(role.chatSettings?.userIndex)&&state.users[role.chatSettings.userIndex]?role.chatSettings.userIndex:userIndex;if(bound!==userIndex)return null;
 const product=C.product(state,String(action.productId||''));if(!product)return null;const kind=action.type==='market_gift'?'role-gift':action.type==='market_purchase'?'role-purchase':'';if(!kind)return null;
 const m=C.normalize(state),personaKey=C.personaId(state,userIndex),guardKey=`${personaKey}:${role.irisMarketId}:${kind}`,last=Number(m.roleActionAt?.[guardKey])||0,now=Date.now();if(now-last<7*86400000)return null;
 const spec=product.specs?.[0];if(!spec)return null;let order;try{order=C.createOrder(state,{userIndex,items:[{productId:product.id,specId:spec.id,quantity:Math.max(1,Math.min(2,Number(action.quantity)||1))}],kind,characterIndex:roleIndex,note:String(action.note||'').slice(0,240),pay:'role-funded',paidByCharacterId:role.irisMarketId})}catch{return null}m.roleActionAt||={};m.roleActionAt[guardKey]=now;
 if(kind==='role-gift')C.persona(state,userIndex).giftRecords.unshift({id:C.id('gift'),orderId:order.id,characterId:role.irisMarketId,characterName:role.name,name:order.items.map(item=>item.name).join('、'),note:order.note,createdAt:now,status:order.status});
 return{type:kind==='role-gift'?'gift-card':'market-event',mine:false,createdAt:now,text:kind==='role-gift'?`${role.name} 为你准备了一份礼物：${order.items.map(item=>item.name).join('、')}。虚拟订单已创建，${order.status==='已送达'?'已送达':'正在配送'}。`:`${role.name} 为自己下单了${order.items.map(item=>item.name).join('、')}，物流状态：${order.status}。`,marketEvent:{type:kind,orderId:order.id,characterId:role.irisMarketId,userId:personaKey,status:order.status}};
}
function parseRoleActions(answer,conversationItems,stickerCatalog=[],transferDefaults={},marketScope={}){
 const actions=[],structured=[];let reflection=null,patUserCreated=false;if(marketScope.enabled===true)window.IrisMarketCore.normalize(state);
 const withoutReflection=removeInternalReplyLeakage(String(answer)).replace(/\[\[IRIS_STATE\s+([\s\S]*?)\s*\]\]/g,(_,raw)=>{try{const value=JSON.parse(raw);if(value&&typeof value==='object')reflection={status:String(value.status||'').trim().slice(0,100),thought:String(value.thought||'').trim().slice(0,240),statusTranslation:String(value.statusTranslation||value.status_translation||'').trim().slice(0,160),thoughtTranslation:String(value.thoughtTranslation||value.thought_translation||'').trim().slice(0,300)}}catch{}return ''});
 const clean=withoutReflection.replace(/\[\[IRIS_ACTION\s+([\s\S]*?)\s*\]\]/g,(_,raw)=>{try{const action=JSON.parse(raw);if(action&&typeof action==='object')actions.push(action)}catch{}return ''});
 for(const action of actions){
  if(action.type==='gift_reply'){
   if(marketScope.enabled===true&&!marketScope.ephemeral&&Number.isInteger(marketScope.userIndex)&&Number.isInteger(marketScope.roleIndex))try{
    const role=chars[marketScope.roleIndex],response=window.IrisMarketCore.decideGift(state,marketScope.userIndex,role?.irisMarketId,String(action.orderId||''),action.decision,action.reply);
    if(response)structured.push(response);
   }catch(error){toast(error.message)}
   continue;
  }
  if(action.type==='transfer_reply'){const pending=[...conversationItems].reverse().find(item=>item.mine&&item.type==='transfer'&&(item.status==='pending'||item.status==='sent'));if(pending&&marketScope.enabled===true&&(action.action==='accept'||action.action==='return')){try{if(action.action==='return')window.IrisMarketCore.settleTransfer(state,marketScope.userIndex,pending,'return');else pending.status='accepted';save()}catch(error){toast(error.message)}}continue}
  const createdAt=Date.now();
  if(action.type==='transfer'){const amount=Number(action.amount),roleId=Number.isInteger(marketScope.roleIndex)?chars[marketScope.roleIndex]?.irisMarketId||null:null;if(Number.isFinite(amount)&&amount>0)structured.push({id:window.IrisMarketCore.id('transfer'),walletUserId:window.IrisMarketCore.personaId(state,marketScope.userIndex),characterId:roleId,mine:false,type:'transfer',amount:Math.min(999999,amount),currency:transferDefaults.currency||'CNY',fromName:transferDefaults.fromName||'角色',toName:transferDefaults.toName||'用户',note:String(action.note||'给你').slice(0,100),noteTranslation:String(action.noteTranslation||action.note_translation||'').slice(0,160),status:'pending',createdAt})}
  else if(action.type==='voice'&&String(action.text||'').trim())structured.push({mine:false,type:'voice',duration:Math.max(1,Math.min(60,Number(action.duration)||3)),voiceText:String(action.text).slice(0,300),voiceTranslation:String(action.translation||action.voiceTranslation||'').slice(0,500),createdAt});
  else if(action.type==='image_description'&&String(action.description||'').trim())structured.push({mine:false,type:'image',imageDescription:String(action.description).slice(0,600),imageRatio:/^\d{1,2}:\d{1,2}$/.test(action.ratio||'')?action.ratio:'1:1',createdAt});
  else if(action.type==='location'&&String(action.place||'').trim())structured.push({mine:false,type:'location',placeName:String(action.place).slice(0,100),distance:String(action.distance||'').slice(0,40),detail:String(action.detail||'').slice(0,200),createdAt});
  else if(action.type==='sticker'&&String(action.value||'').trim()){const sticker=stickerCatalog.find(item=>item.text===String(action.value).trim());if(sticker)structured.push({mine:false,type:'sticker',sticker:sticker.text,stickerUrl:sticker.url,createdAt})}
  else if(action.type==='pat_user'&&marketScope.enabled===true&&!marketScope.ephemeral&&!patUserCreated&&Number.isInteger(marketScope.roleIndex)&&Number.isInteger(marketScope.userIndex)){const role=chars[marketScope.roleIndex],user=state.users?.[marketScope.userIndex],boundIndex=Number.isInteger(role?.chatSettings?.userIndex)&&state.users[role.chatSettings.userIndex]?role.chatSettings.userIndex:marketScope.userIndex;if(role&&user&&boundIndex===marketScope.userIndex){structured.push({id:`pat-${createdAt}-${Math.random().toString(36).slice(2,8)}`,mine:false,type:'pat',patBy:'role',actorName:role.nickname||role.name||transferDefaults.fromName||'角色',targetName:'我',characterId:role.irisMarketId,createdAt});patUserCreated=true}}
  else if((action.type==='market_gift'||action.type==='market_purchase')&&marketScope.enabled===true&&!marketScope.created&&Number.isInteger(marketScope.roleIndex)&&Number.isInteger(marketScope.userIndex)){const event=createMarketRoleIntent(action,marketScope.roleIndex,marketScope.userIndex);if(event){structured.push(event);marketScope.created=true}}
 }
 pendingRoleActions=structured;return{text:clean,reflection};
}
function openTransferComposer(){const character=chars[state.char]?.name||'角色',roleSettings=currentRoleChatSettings(),user=state.users[Number.isInteger(roleSettings.userIndex)?roleSettings.userIndex:state.user],userName=user?.nickname||user?.name||'用户';sheet('Transfer',`给 ${esc(character)} 转账 · 人民币 CNY · 从当前银行卡余额扣款`, `<form class="transfer-composer" id="transferForm"><label>转账金额<div class="transfer-amount-input"><span>¥</span><input name="amount" type="number" min="0.01" max="999999" step="0.01" required placeholder="0.00"></div></label><label>备注<input name="note" maxlength="60" placeholder="写一句转账备注"></label><button class="primary">发送转账</button></form>`,{centered:true});$('#transferForm').onsubmit=event=>{event.preventDefault();const form=event.currentTarget;if(form.dataset.sent)return;try{sendStructuredMessage({type:'transfer',amount:Number(form.elements.amount.value),currency:'CNY',fromName:userName,toName:character,note:form.elements.note.value.trim(),status:'pending'});form.dataset.sent='true';closeSheet()}catch(error){toast(error.message)}}}
function openImageComposer(){sheet('Image','选择真实图片，或发送文字描述图片',`<div class="image-send-choices"><button type="button" data-image-send-real><span class="image-choice-icon">${icon('image')}</span><span><strong>真实图片</strong><small>从设备中选择一张图片</small></span><i>＋</i></button><button type="button" data-image-send-description><span class="image-choice-icon">${icon('write')}</span><span><strong>文字描述图片</strong><small>用文字描述想发送的画面</small></span><i>＋</i></button></div><input type="file" data-image-file accept="image/*" hidden>`,{centered:true});const fileInput=$('#sheet').querySelector('[data-image-file]');$('#sheet').querySelector('[data-image-send-real]').onclick=()=>fileInput.click();fileInput.onchange=async()=>{const file=fileInput.files?.[0];if(!file)return;if(file.size>15*1024*1024){toast('图片请控制在 15 MB 以内');fileInput.value='';return}try{let imageData;if(typeof createImageBitmap==='function'){const bitmap=await createImageBitmap(file),scale=Math.min(1,1400/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();imageData=canvas.toDataURL('image/jpeg',.78)}else imageData=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('图片读取失败'));reader.readAsDataURL(file)});closeSheet();sendStructuredMessage({type:'image',imageData,fileName:file.name})}catch(error){toast(error.message||'图片无法读取')}};$('#sheet').querySelector('[data-image-send-description]').onclick=()=>{sheet('Image','选择图片比例并填写画面描述',`<form id="imageDescriptionForm" class="image-description-form"><label>图片描述<textarea name="description" rows="4" maxlength="600" required placeholder="描述画面的内容、氛围或你想表达的场景"></textarea></label><fieldset class="image-ratio-select"><legend>图片比例</legend><div class="image-ratio-scroll">${[['1:1','方形'],['3:4','竖幅'],['4:3','横幅'],['9:16','竖屏'],['16:9','宽屏'],['2:3','人像'],['3:2','摄影'],['2:1','全景'],['21:9','超宽']].map(([ratio,label],index)=>`<label><input type="radio" name="ratio" value="${ratio}" ${index===0?'checked':''}><span><i style="width:${(22*Number(ratio.split(':')[0])/Math.max(...ratio.split(':').map(Number))).toFixed(1)}px;height:${(22*Number(ratio.split(':')[1])/Math.max(...ratio.split(':').map(Number))).toFixed(1)}px"></i><small>${label}</small><em>${ratio}</em></span></label>`).join('')}</div></fieldset><button class="primary">发送描述图片</button></form>`,{centered:true});$('#imageDescriptionForm').onsubmit=event=>{event.preventDefault();const form=event.currentTarget,description=form.elements.description.value.trim();if(!description)return;closeSheet();sendStructuredMessage({type:'image',imageDescription:description,imageRatio:form.elements.ratio.value})}}}
function openVideoComposer(){
 closeSheet();if(videoCallActive&&document.querySelector('#videoCallScreen')){document.querySelector('#videoCallScreen').classList.remove('is-minimized');const returnButton=$('#videoCallReturn');if(returnButton)returnButton.hidden=true;return}closeVideoCall();videoCallThread=[];videoCallPinnedToBottom=true;setVideoCallReplyState(false);videoCallActive=true;videoCallStartedAt=Date.now();
 const character=chars[state.char],title=character?.name||'角色';
 document.body.insertAdjacentHTML('beforeend',`<section class="video-call-screen" id="videoCallScreen" aria-label="视频通话"><header class="video-call-header"><div class="video-call-brand"><button type="button" class="video-call-title" data-call-return aria-label="返回聊天，继续视频通话">Video Call</button><span class="chat-character-name">${esc(title)}</span><span class="video-call-callee"><i></i>通话中</span></div><div class="video-call-spacer"></div></header><div class="video-call-stage"><section class="video-call-messages" id="videoCallMessages" aria-label="通话聊天记录" aria-live="polite"></section><aside class="video-call-pip is-off" data-call-pip aria-label="用户摄像头画面"><video data-call-video autoplay playsinline muted hidden></video><div class="video-call-camera-off" data-call-off><span>${icon('video')}</span><small>Camera Off</small></div><span class="video-call-self-label">你</span></aside></div><div class="video-call-footer"><p class="video-call-hint" data-call-status role="status"></p><div class="video-call-controls"><button type="button" class="video-call-camera-toggle" data-call-toggle aria-pressed="false"><span>${icon('video')}</span><small>开启摄像头</small></button><button type="button" class="video-call-flip" data-call-flip aria-label="翻转摄像头" title="翻转摄像头" disabled><span>${icon('cameraFlip')}</span><small>翻转摄像头</small></button><button type="button" class="video-call-retry" data-call-retry><span>${icon('retry')}</span><small>重新生成</small></button><button type="button" class="video-call-end" data-call-close><span>×</span><small>结束通话</small></button></div><form class="video-call-composer" data-call-form><textarea name="message" rows="1" maxlength="2000" placeholder="输入消息…" aria-label="输入消息"></textarea><button type="submit" aria-label="发送消息" title="发送消息">${icon('send')}</button><button type="button" class="video-call-reply" data-call-reply aria-label="回复 / 重新生成" title="回复 / 重新生成">${icon('respond')}</button></form></div></section>`);
 $('.topbar').insertAdjacentHTML('afterend',`<button type="button" id="videoCallReturn" class="video-call-return is-waiting" hidden><span>${icon('video')}</span><span><strong>Video Call</strong><small>${esc(title)} · 通话中</small></span><i></i></button>`);
 videoCallReturnPositioner=()=>{const topbar=$('.topbar'),phone=$('.phone'),button=$('#videoCallReturn');if(!topbar||!phone||!button)return;const headerRect=topbar.getBoundingClientRect(),phoneRect=phone.getBoundingClientRect();button.style.top=`${headerRect.bottom-phoneRect.top+24}px`;button.style.left=`${headerRect.left-phoneRect.left}px`};videoCallReturnPositioner();window.addEventListener('resize',videoCallReturnPositioner);
 const screen=$('#videoCallScreen'),video=screen.querySelector('[data-call-video]'),pip=screen.querySelector('[data-call-pip]'),off=screen.querySelector('[data-call-off]'),toggle=screen.querySelector('[data-call-toggle]'),flipButton=screen.querySelector('[data-call-flip]'),status=screen.querySelector('[data-call-status]'),form=screen.querySelector('[data-call-form]'),input=form.elements.message,sendButton=form.querySelector('[type="submit"]'),retryButton=screen.querySelector('[data-call-retry]'),replyButton=screen.querySelector('[data-call-reply]');let activeCameraFacing='user';
 renderVideoCallMessages();
 const callMessages=screen.querySelector('#videoCallMessages');callMessages.addEventListener('scroll',()=>{videoCallPinnedToBottom=callMessages.scrollHeight-callMessages.clientHeight-callMessages.scrollTop<48},{passive:true});
 const returnToChat=()=>{screen.classList.add('is-minimized');$('#videoCallReturn').hidden=false};
 screen.querySelector('[data-call-return]').onclick=returnToChat;
 $('#videoCallReturn').onclick=()=>{screen.classList.remove('is-minimized');$('#videoCallReturn').hidden=true};
 const setCameraOff=()=>{stopVideoCallCamera();video.srcObject=null;video.hidden=true;off.hidden=false;pip.classList.add('is-off');pip.classList.remove('is-selfie');toggle.setAttribute('aria-pressed','false');toggle.querySelector('small').textContent='开启摄像头';toggle.classList.remove('is-on');flipButton.disabled=true};
 toggle.onclick=async()=>{
  if(videoCallStream){setCameraOff();status.textContent='';return}
  if(!navigator.mediaDevices?.getUserMedia){status.textContent='当前浏览器不支持摄像头，请使用 HTTPS 或 localhost。';return}
  toggle.disabled=true;status.textContent='正在请求摄像头权限…';
  try{const stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:activeCameraFacing},width:{ideal:1280},height:{ideal:720}}});if(!videoCallActive||!document.querySelector('#videoCallScreen')){stream.getTracks().forEach(track=>track.stop());return}videoCallStream=stream;videoCallFrameBuffer=[];video.srcObject=stream;video.hidden=false;off.hidden=true;pip.classList.remove('is-off');pip.classList.toggle('is-selfie',activeCameraFacing==='user');await video.play();flipButton.disabled=false;videoCallFrameTimer=setInterval(()=>{if(videoCallStream&&video.readyState>=2){try{const data=captureVideoCallFrame(video),last=videoCallFrameBuffer.at(-1);if(data&&data!==last?.data){videoCallFrameBuffer.push({data,capturedAt:Date.now()});if(videoCallFrameBuffer.length>5)videoCallFrameBuffer.shift()}}catch{ } }},500);toggle.setAttribute('aria-pressed','true');toggle.querySelector('small').textContent='关闭摄像头';toggle.classList.add('is-on');status.textContent=''}
  catch(error){if(videoCallStream){stopVideoCallCamera();video.srcObject=null;video.hidden=true;off.hidden=false;pip.classList.add('is-off');toggle.setAttribute('aria-pressed','false');toggle.querySelector('small').textContent='开启摄像头';toggle.classList.remove('is-on')}const descriptions={NotAllowedError:'摄像头权限未开启，请在浏览器和系统设置中允许访问。',NotFoundError:'没有找到可用摄像头。',NotReadableError:'摄像头正在被其他应用使用。',SecurityError:'请通过 HTTPS 或 localhost 打开页面后使用摄像头。'};status.textContent=descriptions[error.name]||'无法开启摄像头，请检查设备权限后重试。'}finally{toggle.disabled=false}
 };
 flipButton.onclick=async()=>{
  if(!videoCallStream||flipButton.disabled)return;
  const currentStream=videoCallStream,currentTrack=currentStream.getVideoTracks()[0],nextFacing=activeCameraFacing==='user'?'environment':'user';
  if(!currentTrack)return;
  flipButton.disabled=true;status.textContent='正在切换摄像头…';
  try{
   let switched=false;
   try{
    await currentTrack.applyConstraints({facingMode:{exact:nextFacing}});
    const reportedFacing=currentTrack.getSettings?.().facingMode;
    switched=!reportedFacing||reportedFacing===nextFacing;
    if(!switched)throw Error('当前摄像头未切换');
   }catch{
    const replacement=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{exact:nextFacing},width:{ideal:1280},height:{ideal:720}}});
    if(!videoCallActive||!document.querySelector('#videoCallScreen')){replacement.getTracks().forEach(track=>track.stop());return}
    const replacementTrack=replacement.getVideoTracks()[0],reportedFacing=replacementTrack?.getSettings?.().facingMode;
    if(!replacementTrack||(reportedFacing&&reportedFacing!==nextFacing)){replacement.getTracks().forEach(track=>track.stop());throw Error('目标摄像头不可用')}
    video.srcObject=replacement;
    try{await video.play()}catch(error){video.srcObject=currentStream;replacement.getTracks().forEach(track=>track.stop());throw error}
    videoCallStream=replacement;currentStream.getTracks().forEach(track=>track.stop());
   }
   activeCameraFacing=nextFacing;pip.classList.toggle('is-selfie',activeCameraFacing==='user');videoCallFrameBuffer=[];status.textContent='';
  }catch(error){status.textContent=error.name==='NotFoundError'||error.name==='OverconstrainedError'||error.name==='Error'?'设备没有可切换的另一枚摄像头，仍保持当前画面。':'无法切换摄像头，仍保持当前画面，请重试。'}
  finally{if(videoCallActive&&flipButton.isConnected){flipButton.disabled=!videoCallStream;if(status.isConnected&&status.textContent==='正在切换摄像头…')status.textContent=''}}
 };
 screen.querySelectorAll('[data-call-close]').forEach(button=>button.onclick=finishVideoCall);
 let replyPending=false;
 const requestCallReply=async({retry=false}={})=>{if(replyPending)return;if(!state.offline){const api=apiConfigForFeature('videoCall');if(!api?.url||!api?.key||!apiModelForFeature('videoCall',api)){toast('请先在总设置中连接 API');return}}let userIndex=-1;for(let index=videoCallThread.length-1;index>=0;index--){if(videoCallThread[index].mine){userIndex=index;break}}if(userIndex<0){toast('先发送一条消息，再让角色回复');return}const userMessage=videoCallThread[userIndex],hasReply=videoCallThread.slice(userIndex+1).some(message=>!message.mine);if(retry&&!hasReply){toast('还没有可重新生成的角色回复');return}if(!retry&&hasReply)retry=true;const requestThread=retry?videoCallThread.slice(0,userIndex+1):videoCallThread;setVideoCallReplyState(retry&&hasReply);replyPending=true;sendButton.disabled=true;retryButton.disabled=true;replyButton.disabled=true;status.textContent=retry?'正在重新生成回复…':'角色正在回复…';try{let completed=false;if(!state.offline)completed=await sendOnlineMessage({cameraFrames:userMessage.cameraFrames||[],thread:requestThread,ephemeral:true,deferVideoRender:retry});else{requestThread.push({mine:false,text:'[线下模式] 角色重新看向你，认真回应了这条消息。',createdAt:Date.now()});setVideoCallReplyState(true);completed=true}if(retry&&completed){videoCallThread.splice(userIndex+1,videoCallThread.length-userIndex-1,...requestThread.slice(userIndex+1));renderVideoCallMessages()}else if(retry&&!completed)setVideoCallReplyState(hasReply)}finally{replyPending=false;sendButton.disabled=false;retryButton.disabled=false;replyButton.disabled=false;if(videoCallActive&&status.isConnected)status.textContent=''}};
 form.onsubmit=event=>{event.preventDefault();if(replyPending){status.textContent='角色回复完成后即可继续发送。';return}const text=input.value.trim();if(!text)return;input.value='';const cameraWasOn=Boolean(videoCallStream),cameraFrames=cameraWasOn&&video.readyState>=2?getVideoCallFrameSamples(video):[];videoCallThread.push({mine:true,text,createdAt:Date.now(),cameraFrames,visualState:cameraFrames.length?'captured':cameraWasOn?'capture-failed':'camera-off'});setVideoCallReplyState(false);status.textContent='';renderVideoCallMessages()};
 sendButton.addEventListener('pointerdown',event=>event.preventDefault());retryButton.onclick=()=>requestCallReply({retry:true});replyButton.onclick=()=>{input.blur();requestCallReply()};
}
function captureVideoCallFrame(video){if(!video.videoWidth||!video.videoHeight)return'';const scale=Math.min(1,768/Math.max(video.videoWidth,video.videoHeight)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(video.videoWidth*scale));canvas.height=Math.max(1,Math.round(video.videoHeight*scale));const context=canvas.getContext('2d');if(!context)return'';context.drawImage(video,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/jpeg',.72)}
function getVideoCallFrameSamples(video){const now=Date.now();try{const latest=captureVideoCallFrame(video);if(latest){const last=videoCallFrameBuffer.at(-1);if(!last||last.data!==latest)videoCallFrameBuffer.push({data:latest,capturedAt:now})}}catch{ }const samples=videoCallFrameBuffer.filter(frame=>frame.data&&frame.capturedAt>=now-2200).sort((a,b)=>a.capturedAt-b.capturedAt).slice(-5);videoCallFrameBuffer=samples;return samples.map(frame=>({...frame}))}
function renderVideoCallMessages(){const container=$('#videoCallMessages');if(!container)return;const nearBottom=container.scrollHeight-container.clientHeight-container.scrollTop<48,follow=videoCallPinnedToBottom||nearBottom,previousScroll=container.scrollTop;const roleSettings=currentRoleChatSettings(),user=state.users[Number.isInteger(roleSettings.userIndex)?roleSettings.userIndex:state.user];container.innerHTML=renderConversation(user,chars[state.char],videoCallThread,true);bindConversationMedia(container);container.scrollTop=follow?container.scrollHeight:previousScroll;videoCallPinnedToBottom=follow}
function openLocationComposer(){
 sheet('Location','打开后自动获取当前位置，也可手动填写坐标',`<form id="locationForm" class="location-composer"><label>地点名称<input name="placeName" maxlength="80" required value="当前位置" placeholder="例如：家附近的咖啡店"></label><label>距离<input name="distance" maxlength="40" placeholder="例如：约 1.2 公里"></label><label>补充说明<input name="detail" maxlength="120" placeholder="可选，例如：在门口等你"></label><div class="location-coordinates-row"><span data-location-coordinates>正在获取当前位置…</span><button type="button" data-location-current>重新定位</button></div><label class="location-coordinate-manual">或手动填写坐标<input name="coordinates" maxlength="50" placeholder="纬度, 经度，例如 31.2304, 121.4737" autocomplete="off"></label><button class="primary">发送位置</button></form>`,{centered:true});
 const form=$('#locationForm'),status=$('#sheet').querySelector('[data-location-coordinates]'),currentButton=$('#sheet').querySelector('[data-location-current]'),coordinatesInput=form.elements.coordinates;
 const requestCurrentLocation=()=>{
  if(!navigator.geolocation){status.textContent='浏览器不支持定位，可手动填写坐标';return}
  if(!window.isSecureContext){status.textContent='当前页面不允许定位，请通过 HTTPS 或 localhost 打开';return}
  status.textContent='正在获取当前位置…';currentButton.disabled=true;
  navigator.geolocation.getCurrentPosition(position=>{const coordinates=`${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`;form.dataset.coordinates=coordinates;coordinatesInput.value=coordinates;if(!form.elements.placeName.value.trim()||form.elements.placeName.value.trim()==='当前位置')form.elements.placeName.value='当前位置';status.textContent='已获取当前位置';currentButton.disabled=false},error=>{const messages={1:'定位权限被拒绝。请在浏览器和系统设置中允许定位。',2:'设备暂时无法确定位置。请检查系统定位服务，或手动填写坐标。',3:'定位超时。请重试，或手动填写坐标。'};status.textContent=messages[error.code]||'定位失败，请手动填写坐标';currentButton.disabled=false},{enableHighAccuracy:false,timeout:20000,maximumAge:0});
 };
 currentButton.onclick=requestCurrentLocation;requestCurrentLocation();
 form.onsubmit=event=>{event.preventDefault();const data=new FormData(form),typedCoordinates=String(data.get('coordinates')||'').trim(),coordinates=typedCoordinates||form.dataset.coordinates||'';if(typedCoordinates){const match=typedCoordinates.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);if(!match||Number(match[1]) < -90||Number(match[1]) > 90||Number(match[2]) < -180||Number(match[2]) > 180){status.textContent='坐标格式应为“纬度, 经度”，例如 31.2304, 121.4737';return}}closeSheet();sendStructuredMessage({type:'location',placeName:String(data.get('placeName')).trim(),distance:String(data.get('distance')||'').trim(),detail:String(data.get('detail')||'').trim(),coordinates})};
}
function openVoiceComposer(){sheet('Voice','填写语音时长和语音内容，生成一条语音消息',`<form id="voiceForm" class="voice-composer"><label>语音时长（秒）<input name="duration" type="number" min="1" max="60" value="3" required></label><label>语音内容<textarea name="voiceText" rows="4" maxlength="300" required placeholder="输入这段语音说了什么"></textarea></label><p class="voice-composer-hint">发送后会显示对应时长的语音波形，并附上这段内容。</p><button class="primary">发送语音消息</button></form>`,{centered:true});$('#voiceForm').onsubmit=event=>{event.preventDefault();const form=event.currentTarget,voiceText=form.elements.voiceText.value.trim(),duration=Math.max(1,Math.min(60,Number(form.elements.duration.value)||1));if(!voiceText)return;closeSheet();sendStructuredMessage({type:'voice',duration,voiceText})}}
function feature(name){if(name==='Forum'){openFeaturePage('forum')}else if(name==='美化'){openFeaturePage('beautify')}else if(name==='转账'){openTransferComposer()}}
function renderQuickFeatures(){const menu=$('#quickFeatures');if(state.offline){const entries=[['save','保存','Save'],['trash','删除','Delete'],['arrow','退出','Exit']];menu.innerHTML=entries.map(([symbol,key,label],index)=>`<button type="button" class="quick-item ${index===2?'quick-exit':''}" data-quick="${key}" aria-label="${label}"><span class="quick-icon">${icon(symbol)}</span><span>${label}</span></button>`).join('')}else{const entries=[['mic','语音','Voice'],['video','视频','Video'],['image','图片','Image'],['transfer','转账','Transfer'],['location','定位','Location'],['music','听歌','Music'],['book','阅读','Read']];menu.innerHTML=entries.map(([symbol,key,label])=>`<button type="button" class="quick-item" data-quick="${key}" aria-label="${label}"><span class="quick-icon">${icon(symbol)}</span><span>${label}</span></button>`).join('')+`<div class="quick-action-row"><button type="button" class="quick-item quick-exit" data-quick="退出输入" aria-label="Exit"><span class="quick-icon">${icon('arrow')}</span><span>Exit</span></button><button type="button" class="quick-action-item" data-quick="清除聊天" aria-label="Clear Chat"><span class="quick-icon">${icon('clearChat')}</span><span>Clear Chat</span></button><button type="button" class="quick-action-item ${chars[state.char]?.chatSettings?.blocked?'is-blocked':''}" data-quick="拉黑好友" aria-label="${chars[state.char]?.chatSettings?.blocked?'Unblock':'Block'}"><span class="quick-icon">${icon('block')}</span><span>${chars[state.char]?.chatSettings?.blocked?'Unblock':'Block'}</span></button><button type="button" class="quick-action-item is-destructive" data-quick="删除好友" aria-label="Delete"><span class="quick-icon">${icon('userX')}</span><span>Delete</span></button></div>`}}
function input(){closeDockFeatures();closeSheet();renderQuickFeatures();$('#dock').hidden=true;$('#composer').hidden=false;const field=$('#messageInput');if(field.dataset.quoteDraft){try{showQuoteDraft(JSON.parse(field.dataset.quoteDraft))}catch{delete field.dataset.quoteDraft}}}
function exitInput(){closeFeatureMenu();closeEmojiPicker();$('#composer').hidden=true;$('#quoteComposerPreview')?.setAttribute('hidden','');$('#dock').hidden=false}
function updateComposerAction(){const field=$('#messageInput'),hasText=Boolean(field.value.trim()),button=$('#emoji');if(state.offline){field.style.height='auto';field.style.height=`${Math.min(Math.max(22,field.scrollHeight),88)}px`}else field.style.height='22px';if(hasText&&emojiPickerOpen)closeEmojiPicker();button.hidden=Boolean(state.offline&&!hasText);button.innerHTML=icon(hasText?'send':'smile');button.classList.toggle('is-send',hasText);button.setAttribute('aria-label',hasText?'Send message':'Open sticker panel')}
function closeFeatureMenu(){$('#quickFeatures').hidden=true;$('#inputFunctions').setAttribute('aria-expanded','false')}
function toggleFeatureMenu(){const menu=$('#quickFeatures');menu.hidden=!menu.hidden;$('#inputFunctions').setAttribute('aria-expanded',String(!menu.hidden))}
function removeCurrentCharacter(){const index=state.char,character=chars[index];if(!character)return false;const name=character.name?.trim()||'未命名角色';if(!window.confirm(`确定删除好友「${name}」吗？这会从角色列表移除该角色，并删除该角色的聊天与线下记录。此操作无法撤销。`))return false;window.IrisReadingCore?.removeIdentity(state,{roleId:character.irisMarketId});chars.splice(index,1);remapSmsThreadsForRoleDeletion(index);state.characters=chars;if(state.char>=chars.length)state.char=chars.length-1;const remapped={};for(const [messageKey,value]of Object.entries(state.messages||{})){const match=messageKey.match(/^(-?\d+)-(-?\d+)-(chat|offline(?:-invite-.+)?)$/);if(!match){remapped[messageKey]=value;continue}const roleIndex=Number(match[1]);if(roleIndex===index)continue;remapped[`${roleIndex>index?roleIndex-1:roleIndex}-${match[2]}-${match[3]}`]=value}state.messages=remapped;const remappedInvitations={};for(const [id,invite]of Object.entries(state.invitations||{})){if(invite.characterIndex===index)continue;const roleIndex=Number(invite.characterIndex);if(roleIndex>index)invite.characterIndex=roleIndex-1;const remapKey=value=>{const match=String(value||'').match(/^(-?\d+)-(-?\d+)-(.+)$/);if(!match)return value;if(Number(match[1])===index)return'';return`${Number(match[1])>index?Number(match[1])-1:Number(match[1])}-${match[2]}-${match[3]}`};invite.sourceThreadKey=remapKey(invite.sourceThreadKey);invite.offlineThreadKey=remapKey(invite.offlineThreadKey);remappedInvitations[id]=invite}state.invitations=remappedInvitations;const remappedOfflineThreads={};for(const [pair,thread]of Object.entries(state.activeOfflineThreads||{})){const match=pair.match(/^(-?\d+)-(-?\d+)$/);if(!match||Number(match[1])===index)continue;const roleIndex=Number(match[1]);remappedOfflineThreads[`${roleIndex>index?roleIndex-1:roleIndex}-${match[2]}`]=thread}state.activeOfflineThreads=remappedOfflineThreads;state.offlineRecords=(state.offlineRecords||[]).filter(record=>record.characterIndex!==index&&!(record.characterName===name&&chars.every(role=>role.name!==name))).map(record=>({...record,characterIndex:Number.isInteger(record.characterIndex)&&record.characterIndex>index?record.characterIndex-1:record.characterIndex}));save();exitInput();render();toast(`已删除好友「${name}」`);return true}
function clearCurrentChat(){const threadKey=`${state.char}-${state.user}-chat`;if(!(state.messages[threadKey]||[]).length){toast('当前角色的线上聊天已经为空');return}if(!window.confirm(`确定清除「${chars[state.char]?.name||'当前角色'}」与当前用户的线上聊天记录吗？线下记录和其他角色聊天不会受影响。`))return;const timerId=chatReplyTimers.get(threadKey);if(timerId)clearTimeout(timerId);chatReplyTimers.delete(threadKey);pendingReplyKeys.delete(threadKey);state.messages[threadKey]=[];save();render();toast('已清除当前角色的线上聊天记录')}
function toggleCurrentCharacterBlock(){const roleIndex=state.char,character=chars[roleIndex];if(!character)return;character.chatSettings||={};const settings=character.chatSettings,next=!settings.blocked;if(!window.confirm(next?`确定拉黑「${character.name||'当前角色'}」吗？你仍可发送消息；角色第一条回复显示发送失败后会停止发送。`:`确定取消拉黑「${character.name||'当前角色'}」吗？`))return;settings.blocked=next;settings.blockedAt=next?Date.now():0;if(!next){const userIndex=Number.isInteger(settings.userIndex)&&state.users[settings.userIndex]?settings.userIndex:state.user;settings.unblockMessageEvent=(Number(settings.unblockMessageEvent)||0)+1;settings.unblockMessagePending={event:settings.unblockMessageEvent,userIndex};delete settings.unblockMessageError}save();render();renderQuickFeatures();closeFeatureMenu();toast(next?'已拉黑当前角色':'已取消拉黑');if(!next)resumeUnblockProactiveChat(roleIndex)}
function resumeUnblockProactiveChat(roleIndex){const character=chars[roleIndex],settings=character?.chatSettings,pending=settings?.unblockMessagePending;if(!character||settings?.blocked||!pending||settings.unblockMessageSent===pending.event||settings.unblockMessageStarted===pending.event||settings.unblockMessageError||state.char!==roleIndex||state.offline)return;const userIndex=Number(pending.userIndex),threadKey=`${roleIndex}-${userIndex}-chat`;if(!state.users[userIndex])return;if(unblockChatRequests.has(threadKey))return unblockChatRequests.get(threadKey);const request=(async()=>{while(chatReplyInFlight.has(threadKey))await new Promise(resolve=>setTimeout(resolve,100));if(settings.blocked||state.char!==roleIndex||state.offline)return false;const thread=state.messages[threadKey]||(state.messages[threadKey]=[]),requestThread=thread.slice(),start=requestThread.length;settings.unblockMessageStarted=pending.event;save();chatReplyInFlight.add(threadKey);updateChatReplyIndicator();try{const completed=await sendOnlineMessage({thread:requestThread,deferCommit:true,roleInitiated:true});const generated=requestThread.splice(start);if(!completed||!generated.length)throw Error('角色没有生成主动消息');chatReplyTyping.add(threadKey);render();for(const message of generated){await new Promise(resolve=>setTimeout(resolve,replyTypingDuration(message)));thread.push(message);save();if(key()===threadKey)render()}settings.unblockMessageSent=pending.event;delete settings.unblockMessagePending;delete settings.unblockMessageError;save();return true}catch(error){settings.unblockMessageError=error.message||'主动消息发送失败';save();toast(settings.unblockMessageError);return false}finally{chatReplyTyping.delete(threadKey);chatReplyInFlight.delete(threadKey);unblockChatRequests.delete(threadKey);if(key()===threadKey)render();else updateChatReplyIndicator()}})();unblockChatRequests.set(threadKey,request);return request}
function deleteCurrentOfflineConversation(){const threadKey=key(),thread=state.messages[threadKey]||[];if(!thread.length){toast('当前线下内容已经为空');return}if(!window.confirm(`确定删除「${chars[state.char]?.name||'当前角色'}」本次尚未保存的线下内容吗？已保存的线下记录不会受影响。`))return;const timerId=chatReplyTimers.get(threadKey);if(timerId)clearTimeout(timerId);chatReplyTimers.delete(threadKey);pendingReplyKeys.delete(threadKey);state.messages[threadKey]=[];save();render();toast('已删除本次线下内容')}
function quickFeature(name){if(name==='退出输入'||name==='退出'){exitInput();return}if(name==='保存'){closeFeatureMenu();saveOfflineRecord();return}if(name==='删除'){closeFeatureMenu();deleteCurrentOfflineConversation();return}if(name==='清除聊天'){closeFeatureMenu();clearCurrentChat();return}if(name==='拉黑好友'){toggleCurrentCharacterBlock();return}if(name==='删除好友'){closeFeatureMenu();removeCurrentCharacter();return}closeFeatureMenu();if(name==='阅读'){openFeaturePage('reading');return}if(name==='听歌'){toast('待开发');return}if(name==='美化'){feature('美化');return}if(name==='转账'){openTransferComposer();return}if(name==='图片'){openImageComposer();return}if(name==='定位'){openLocationComposer();return}if(name==='语音'){openVoiceComposer();return}if(name==='视频'){openVideoComposer();return}}

let settingsSection=null;
let editingApiConfigId=state.settings.activeApiConfigId||'',activeApiPanelConfigId=state.settings.activeApiConfigId||'';
let editingApiModels=[],editingApiModelsFor=null,apiModelCandidates=[],apiModelDraft=[];
let modeSettings=false;
let onlineSettingsTab='user';
let offlineSettingsTab='settings';
let offlineExtraSettingsTab='requirements';
let offlineRegexDraft=null;
let offlineRequirementDraftRole=null;
let systemSettingsTab='api';
const APP_VERSION='3.7.0';
const compareAppVersions=(left,right)=>{const a=String(left||'0').split('.').map(Number),b=String(right||'0').split('.').map(Number);for(let i=0;i<Math.max(a.length,b.length);i++){const delta=(a[i]||0)-(b[i]||0);if(delta)return Math.sign(delta)}return 0};
let INSTALLED_APP_VERSION=APP_VERSION;
try{const saved=localStorage.getItem('iris-installed-version'),requested=window.IRIS_RELEASE;if(saved&&compareAppVersions(saved,INSTALLED_APP_VERSION)>0)INSTALLED_APP_VERSION=saved;if(requested&&compareAppVersions(requested,INSTALLED_APP_VERSION)>=0){INSTALLED_APP_VERSION=requested;localStorage.setItem('iris-installed-version',requested)}else localStorage.setItem('iris-installed-version',INSTALLED_APP_VERSION)}catch{}
let activeFeaturePage=null;
const defaultOnlineMemory={enabled:true,autoSummary:true,summaryEveryRounds:10,shortTermRounds:40,recentLongCount:5,recallCount:3,coreEveryLongMemories:5,summaryMaxChars:300,coreMaxChars:1200,timeDecayDays:180,contextTokenBudget:12000,semanticRecall:true};
const localTimezone=Intl.DateTimeFormat().resolvedOptions().timeZone||'Asia/Shanghai';
const defaultOnlineMore={bilingual:false,sourceLang:'ko',targetLang:'zh-Hans',autoExpand:false,timezoneEnabled:false,timeAwarenessEnabled:true,holidayAwarenessEnabled:false,userTimezone:localTimezone,characterTimezone:localTimezone,emojiGroups:{}};
let onlineMemoryDraft={...defaultOnlineMemory};
let onlineMemoryEntries=[];
let memoryScopeFilter='all';
let emojiManagementOpen=false;
let onlineMoreDraft={...defaultOnlineMore,emojiGroups:{}};
function currentRoleChatSettings(){const role=chars[state.char];if(!role)return{userIndex:null,userExperience:'',worldBookEnabled:true,memory:{...defaultOnlineMemory,entries:[]},more:{...defaultOnlineMore,emojiGroups:{}}};role.chatSettings||={};role.chatSettings.memory||={...defaultOnlineMemory};if(!Array.isArray(role.chatSettings.memory.entries))role.chatSettings.memory.entries=[];role.chatSettings.more||={...defaultOnlineMore,emojiGroups:{}};return role.chatSettings}
function loadRoleChatSettings(){const roleSettings=currentRoleChatSettings();syncExistingOfflineSummariesToChatMemory(chars[state.char]);const{entries=[],...memorySettings}=roleSettings.memory||{},storedMore=roleSettings.more||{};onlineMemoryDraft={...defaultOnlineMemory,...memorySettings};onlineMemoryEntries=Array.isArray(entries)?entries.map(entry=>({...entry})):[];memoryScopeFilter='all';onlineMoreDraft={...defaultOnlineMore,...storedMore,holidayAwarenessEnabled:Object.prototype.hasOwnProperty.call(storedMore,'holidayAwarenessEnabled')?storedMore.holidayAwarenessEnabled:storedMore.actualTimeEnabled===true,emojiGroups:{...(storedMore.emojiGroups||{})}}}
function persistRoleChatSettings(){const role=chars[state.char];if(!role)return;role.chatSettings||={};role.chatSettings.memory={...(role.chatSettings.memory||{}),...onlineMemoryDraft,entries:onlineMemoryEntries.map(entry=>({...entry}))};const{actualTimeEnabled,...moreSettings}=onlineMoreDraft;role.chatSettings.more={...moreSettings,emojiGroups:{...onlineMoreDraft.emojiGroups}};save()}
const bilingualLanguages=[['ko','韩语'],['en','英语'],['ja','日语'],['yue','粤语'],['zh-Hans','简体中文'],['zh-Hant','繁体中文'],['fr','法语'],['de','德语'],['es','西班牙语'],['it','意大利语'],['pt','葡萄牙语'],['ru','俄语'],['th','泰语'],['vi','越南语'],['id','印尼语'],['ar','阿拉伯语']];
const timezoneCountries=[
 {code:'CN',name:'中国 · China',cities:[['Asia/Shanghai','上海 · Shanghai'],['Asia/Urumqi','乌鲁木齐 · Ürümqi']]},
 {code:'HK',name:'中国香港 · Hong Kong',cities:[['Asia/Hong_Kong','香港 · Hong Kong']]},
 {code:'TW',name:'中国台湾 · Taiwan',cities:[['Asia/Taipei','台北 · Taipei']]},
 {code:'MO',name:'中国澳门 · Macau',cities:[['Asia/Macau','澳门 · Macau']]},
 {code:'JP',name:'日本 · Japan',cities:[['Asia/Tokyo','东京 · Tokyo']]},
 {code:'KR',name:'韩国 · South Korea',cities:[['Asia/Seoul','首尔 · Seoul']]},
 {code:'US',name:'美国 · United States',cities:[['America/New_York','纽约 · New York'],['America/Chicago','芝加哥 · Chicago'],['America/Denver','丹佛 · Denver'],['America/Los_Angeles','洛杉矶 · Los Angeles'],['Pacific/Honolulu','檀香山 · Honolulu']]},
 {code:'CA',name:'加拿大 · Canada',cities:[['America/St_Johns','圣约翰斯 · St. John’s'],['America/Toronto','多伦多 · Toronto'],['America/Winnipeg','温尼伯 · Winnipeg'],['America/Edmonton','埃德蒙顿 · Edmonton'],['America/Vancouver','温哥华 · Vancouver']]},
 {code:'GB',name:'英国 · United Kingdom',cities:[['Europe/London','伦敦 · London']]},
 {code:'FR',name:'法国 · France',cities:[['Europe/Paris','巴黎 · Paris']]},
 {code:'DE',name:'德国 · Germany',cities:[['Europe/Berlin','柏林 · Berlin']]},
 {code:'IT',name:'意大利 · Italy',cities:[['Europe/Rome','罗马 · Rome']]},
 {code:'ES',name:'西班牙 · Spain',cities:[['Europe/Madrid','马德里 · Madrid'],['Atlantic/Canary','加那利群岛 · Canary Islands']]},
 {code:'PT',name:'葡萄牙 · Portugal',cities:[['Europe/Lisbon','里斯本 · Lisbon'],['Atlantic/Azores','亚速尔群岛 · Azores']]},
 {code:'RU',name:'俄罗斯 · Russia',cities:[['Europe/Moscow','莫斯科 · Moscow'],['Asia/Yekaterinburg','叶卡捷琳堡 · Yekaterinburg'],['Asia/Novosibirsk','新西伯利亚 · Novosibirsk'],['Asia/Vladivostok','符拉迪沃斯托克 · Vladivostok']]},
 {code:'AU',name:'澳大利亚 · Australia',cities:[['Australia/Perth','珀斯 · Perth'],['Australia/Adelaide','阿德莱德 · Adelaide'],['Australia/Sydney','悉尼 · Sydney']]},
 {code:'NZ',name:'新西兰 · New Zealand',cities:[['Pacific/Auckland','奥克兰 · Auckland']]},
 {code:'IN',name:'印度 · India',cities:[['Asia/Kolkata','加尔各答 · Kolkata']]},
 {code:'SG',name:'新加坡 · Singapore',cities:[['Asia/Singapore','新加坡 · Singapore']]},
 {code:'TH',name:'泰国 · Thailand',cities:[['Asia/Bangkok','曼谷 · Bangkok']]},
 {code:'VN',name:'越南 · Vietnam',cities:[['Asia/Ho_Chi_Minh','胡志明市 · Ho Chi Minh City']]},
 {code:'ID',name:'印度尼西亚 · Indonesia',cities:[['Asia/Jakarta','雅加达 · Jakarta'],['Asia/Makassar','望加锡 · Makassar'],['Asia/Jayapura','查亚普拉 · Jayapura']]},
 {code:'AE',name:'阿联酋 · United Arab Emirates',cities:[['Asia/Dubai','迪拜 · Dubai']]},
 {code:'TR',name:'土耳其 · Türkiye',cities:[['Europe/Istanbul','伊斯坦布尔 · Istanbul']]},
 {code:'BR',name:'巴西 · Brazil',cities:[['America/Sao_Paulo','圣保罗 · São Paulo'],['America/Manaus','马瑙斯 · Manaus']]},
 {code:'MX',name:'墨西哥 · Mexico',cities:[['America/Mexico_City','墨西哥城 · Mexico City'],['America/Tijuana','蒂华纳 · Tijuana']]},
 {code:'ZA',name:'南非 · South Africa',cities:[['Africa/Johannesburg','约翰内斯堡 · Johannesburg']]},
 {code:'UTC',name:'协调世界时 · UTC',cities:[['UTC','协调世界时 · UTC']]}
];
const timezoneZoneCountries=[
 ['AD','Europe/Andorra'],
 ['AE','Asia/Dubai'],
 ['AF','Asia/Kabul'],
 ['AG','America/Antigua'],
 ['AI','America/Anguilla'],
 ['AL','Europe/Tirane'],
 ['AM','Asia/Yerevan'],
 ['AO','Africa/Luanda'],
 ['AQ','Antarctica/McMurdo'],
 ['AQ','Antarctica/Casey'],
 ['AQ','Antarctica/Davis'],
 ['AQ','Antarctica/DumontDUrville'],
 ['AQ','Antarctica/Mawson'],
 ['AQ','Antarctica/Palmer'],
 ['AQ','Antarctica/Rothera'],
 ['AQ','Antarctica/Syowa'],
 ['AQ','Antarctica/Troll'],
 ['AQ','Antarctica/Vostok'],
 ['AR','America/Argentina/Buenos_Aires'],
 ['AR','America/Argentina/Cordoba'],
 ['AR','America/Argentina/Salta'],
 ['AR','America/Argentina/Jujuy'],
 ['AR','America/Argentina/Tucuman'],
 ['AR','America/Argentina/Catamarca'],
 ['AR','America/Argentina/La_Rioja'],
 ['AR','America/Argentina/San_Juan'],
 ['AR','America/Argentina/Mendoza'],
 ['AR','America/Argentina/San_Luis'],
 ['AR','America/Argentina/Rio_Gallegos'],
 ['AR','America/Argentina/Ushuaia'],
 ['AS','Pacific/Pago_Pago'],
 ['AT','Europe/Vienna'],
 ['AU','Australia/Lord_Howe'],
 ['AU','Antarctica/Macquarie'],
 ['AU','Australia/Hobart'],
 ['AU','Australia/Melbourne'],
 ['AU','Australia/Sydney'],
 ['AU','Australia/Broken_Hill'],
 ['AU','Australia/Brisbane'],
 ['AU','Australia/Lindeman'],
 ['AU','Australia/Adelaide'],
 ['AU','Australia/Darwin'],
 ['AU','Australia/Perth'],
 ['AU','Australia/Eucla'],
 ['AW','America/Aruba'],
 ['AX','Europe/Mariehamn'],
 ['AZ','Asia/Baku'],
 ['BA','Europe/Sarajevo'],
 ['BB','America/Barbados'],
 ['BD','Asia/Dhaka'],
 ['BE','Europe/Brussels'],
 ['BF','Africa/Ouagadougou'],
 ['BG','Europe/Sofia'],
 ['BH','Asia/Bahrain'],
 ['BI','Africa/Bujumbura'],
 ['BJ','Africa/Porto-Novo'],
 ['BL','America/St_Barthelemy'],
 ['BM','Atlantic/Bermuda'],
 ['BN','Asia/Brunei'],
 ['BO','America/La_Paz'],
 ['BQ','America/Kralendijk'],
 ['BR','America/Noronha'],
 ['BR','America/Belem'],
 ['BR','America/Fortaleza'],
 ['BR','America/Recife'],
 ['BR','America/Araguaina'],
 ['BR','America/Maceio'],
 ['BR','America/Bahia'],
 ['BR','America/Sao_Paulo'],
 ['BR','America/Campo_Grande'],
 ['BR','America/Cuiaba'],
 ['BR','America/Santarem'],
 ['BR','America/Porto_Velho'],
 ['BR','America/Boa_Vista'],
 ['BR','America/Manaus'],
 ['BR','America/Eirunepe'],
 ['BR','America/Rio_Branco'],
 ['BS','America/Nassau'],
 ['BT','Asia/Thimphu'],
 ['BW','Africa/Gaborone'],
 ['BY','Europe/Minsk'],
 ['BZ','America/Belize'],
 ['CA','America/St_Johns'],
 ['CA','America/Halifax'],
 ['CA','America/Glace_Bay'],
 ['CA','America/Moncton'],
 ['CA','America/Goose_Bay'],
 ['CA','America/Blanc-Sablon'],
 ['CA','America/Toronto'],
 ['CA','America/Iqaluit'],
 ['CA','America/Atikokan'],
 ['CA','America/Winnipeg'],
 ['CA','America/Resolute'],
 ['CA','America/Rankin_Inlet'],
 ['CA','America/Regina'],
 ['CA','America/Swift_Current'],
 ['CA','America/Edmonton'],
 ['CA','America/Cambridge_Bay'],
 ['CA','America/Inuvik'],
 ['CA','America/Vancouver'],
 ['CA','America/Creston'],
 ['CA','America/Dawson_Creek'],
 ['CA','America/Fort_Nelson'],
 ['CA','America/Whitehorse'],
 ['CA','America/Dawson'],
 ['CC','Indian/Cocos'],
 ['CD','Africa/Kinshasa'],
 ['CD','Africa/Lubumbashi'],
 ['CF','Africa/Bangui'],
 ['CG','Africa/Brazzaville'],
 ['CH','Europe/Zurich'],
 ['CI','Africa/Abidjan'],
 ['CK','Pacific/Rarotonga'],
 ['CL','America/Santiago'],
 ['CL','America/Coyhaique'],
 ['CL','America/Punta_Arenas'],
 ['CL','Pacific/Easter'],
 ['CM','Africa/Douala'],
 ['CN','Asia/Shanghai'],
 ['CN','Asia/Urumqi'],
 ['CO','America/Bogota'],
 ['CR','America/Costa_Rica'],
 ['CU','America/Havana'],
 ['CV','Atlantic/Cape_Verde'],
 ['CW','America/Curacao'],
 ['CX','Indian/Christmas'],
 ['CY','Asia/Nicosia'],
 ['CY','Asia/Famagusta'],
 ['CZ','Europe/Prague'],
 ['DE','Europe/Berlin'],
 ['DE','Europe/Busingen'],
 ['DJ','Africa/Djibouti'],
 ['DK','Europe/Copenhagen'],
 ['DM','America/Dominica'],
 ['DO','America/Santo_Domingo'],
 ['DZ','Africa/Algiers'],
 ['EC','America/Guayaquil'],
 ['EC','Pacific/Galapagos'],
 ['EE','Europe/Tallinn'],
 ['EG','Africa/Cairo'],
 ['EH','Africa/El_Aaiun'],
 ['ER','Africa/Asmara'],
 ['ES','Europe/Madrid'],
 ['ES','Africa/Ceuta'],
 ['ES','Atlantic/Canary'],
 ['ET','Africa/Addis_Ababa'],
 ['FI','Europe/Helsinki'],
 ['FJ','Pacific/Fiji'],
 ['FK','Atlantic/Stanley'],
 ['FM','Pacific/Chuuk'],
 ['FM','Pacific/Pohnpei'],
 ['FM','Pacific/Kosrae'],
 ['FO','Atlantic/Faroe'],
 ['FR','Europe/Paris'],
 ['GA','Africa/Libreville'],
 ['GB','Europe/London'],
 ['GD','America/Grenada'],
 ['GE','Asia/Tbilisi'],
 ['GF','America/Cayenne'],
 ['GG','Europe/Guernsey'],
 ['GH','Africa/Accra'],
 ['GI','Europe/Gibraltar'],
 ['GL','America/Nuuk'],
 ['GL','America/Danmarkshavn'],
 ['GL','America/Scoresbysund'],
 ['GL','America/Thule'],
 ['GM','Africa/Banjul'],
 ['GN','Africa/Conakry'],
 ['GP','America/Guadeloupe'],
 ['GQ','Africa/Malabo'],
 ['GR','Europe/Athens'],
 ['GS','Atlantic/South_Georgia'],
 ['GT','America/Guatemala'],
 ['GU','Pacific/Guam'],
 ['GW','Africa/Bissau'],
 ['GY','America/Guyana'],
 ['HK','Asia/Hong_Kong'],
 ['HN','America/Tegucigalpa'],
 ['HR','Europe/Zagreb'],
 ['HT','America/Port-au-Prince'],
 ['HU','Europe/Budapest'],
 ['ID','Asia/Jakarta'],
 ['ID','Asia/Pontianak'],
 ['ID','Asia/Makassar'],
 ['ID','Asia/Jayapura'],
 ['IE','Europe/Dublin'],
 ['IL','Asia/Jerusalem'],
 ['IM','Europe/Isle_of_Man'],
 ['IN','Asia/Kolkata'],
 ['IO','Indian/Chagos'],
 ['IQ','Asia/Baghdad'],
 ['IR','Asia/Tehran'],
 ['IS','Atlantic/Reykjavik'],
 ['IT','Europe/Rome'],
 ['JE','Europe/Jersey'],
 ['JM','America/Jamaica'],
 ['JO','Asia/Amman'],
 ['JP','Asia/Tokyo'],
 ['KE','Africa/Nairobi'],
 ['KG','Asia/Bishkek'],
 ['KH','Asia/Phnom_Penh'],
 ['KI','Pacific/Tarawa'],
 ['KI','Pacific/Kanton'],
 ['KI','Pacific/Kiritimati'],
 ['KM','Indian/Comoro'],
 ['KN','America/St_Kitts'],
 ['KP','Asia/Pyongyang'],
 ['KR','Asia/Seoul'],
 ['KW','Asia/Kuwait'],
 ['KY','America/Cayman'],
 ['KZ','Asia/Almaty'],
 ['KZ','Asia/Qyzylorda'],
 ['KZ','Asia/Qostanay'],
 ['KZ','Asia/Aqtobe'],
 ['KZ','Asia/Aqtau'],
 ['KZ','Asia/Atyrau'],
 ['KZ','Asia/Oral'],
 ['LA','Asia/Vientiane'],
 ['LB','Asia/Beirut'],
 ['LC','America/St_Lucia'],
 ['LI','Europe/Vaduz'],
 ['LK','Asia/Colombo'],
 ['LR','Africa/Monrovia'],
 ['LS','Africa/Maseru'],
 ['LT','Europe/Vilnius'],
 ['LU','Europe/Luxembourg'],
 ['LV','Europe/Riga'],
 ['LY','Africa/Tripoli'],
 ['MA','Africa/Casablanca'],
 ['MC','Europe/Monaco'],
 ['MD','Europe/Chisinau'],
 ['ME','Europe/Podgorica'],
 ['MF','America/Marigot'],
 ['MG','Indian/Antananarivo'],
 ['MH','Pacific/Majuro'],
 ['MH','Pacific/Kwajalein'],
 ['MK','Europe/Skopje'],
 ['ML','Africa/Bamako'],
 ['MM','Asia/Yangon'],
 ['MN','Asia/Ulaanbaatar'],
 ['MN','Asia/Hovd'],
 ['MO','Asia/Macau'],
 ['MP','Pacific/Saipan'],
 ['MQ','America/Martinique'],
 ['MR','Africa/Nouakchott'],
 ['MS','America/Montserrat'],
 ['MT','Europe/Malta'],
 ['MU','Indian/Mauritius'],
 ['MV','Indian/Maldives'],
 ['MW','Africa/Blantyre'],
 ['MX','America/Mexico_City'],
 ['MX','America/Cancun'],
 ['MX','America/Merida'],
 ['MX','America/Monterrey'],
 ['MX','America/Matamoros'],
 ['MX','America/Chihuahua'],
 ['MX','America/Ciudad_Juarez'],
 ['MX','America/Ojinaga'],
 ['MX','America/Mazatlan'],
 ['MX','America/Bahia_Banderas'],
 ['MX','America/Hermosillo'],
 ['MX','America/Tijuana'],
 ['MY','Asia/Kuala_Lumpur'],
 ['MY','Asia/Kuching'],
 ['MZ','Africa/Maputo'],
 ['NA','Africa/Windhoek'],
 ['NC','Pacific/Noumea'],
 ['NE','Africa/Niamey'],
 ['NF','Pacific/Norfolk'],
 ['NG','Africa/Lagos'],
 ['NI','America/Managua'],
 ['NL','Europe/Amsterdam'],
 ['NO','Europe/Oslo'],
 ['NP','Asia/Kathmandu'],
 ['NR','Pacific/Nauru'],
 ['NU','Pacific/Niue'],
 ['NZ','Pacific/Auckland'],
 ['NZ','Pacific/Chatham'],
 ['OM','Asia/Muscat'],
 ['PA','America/Panama'],
 ['PE','America/Lima'],
 ['PF','Pacific/Tahiti'],
 ['PF','Pacific/Marquesas'],
 ['PF','Pacific/Gambier'],
 ['PG','Pacific/Port_Moresby'],
 ['PG','Pacific/Bougainville'],
 ['PH','Asia/Manila'],
 ['PK','Asia/Karachi'],
 ['PL','Europe/Warsaw'],
 ['PM','America/Miquelon'],
 ['PN','Pacific/Pitcairn'],
 ['PR','America/Puerto_Rico'],
 ['PS','Asia/Gaza'],
 ['PS','Asia/Hebron'],
 ['PT','Europe/Lisbon'],
 ['PT','Atlantic/Madeira'],
 ['PT','Atlantic/Azores'],
 ['PW','Pacific/Palau'],
 ['PY','America/Asuncion'],
 ['QA','Asia/Qatar'],
 ['RE','Indian/Reunion'],
 ['RO','Europe/Bucharest'],
 ['RS','Europe/Belgrade'],
 ['RU','Europe/Kaliningrad'],
 ['RU','Europe/Moscow'],
 ['UA','Europe/Simferopol'],
 ['RU','Europe/Kirov'],
 ['RU','Europe/Volgograd'],
 ['RU','Europe/Astrakhan'],
 ['RU','Europe/Saratov'],
 ['RU','Europe/Ulyanovsk'],
 ['RU','Europe/Samara'],
 ['RU','Asia/Yekaterinburg'],
 ['RU','Asia/Omsk'],
 ['RU','Asia/Novosibirsk'],
 ['RU','Asia/Barnaul'],
 ['RU','Asia/Tomsk'],
 ['RU','Asia/Novokuznetsk'],
 ['RU','Asia/Krasnoyarsk'],
 ['RU','Asia/Irkutsk'],
 ['RU','Asia/Chita'],
 ['RU','Asia/Yakutsk'],
 ['RU','Asia/Khandyga'],
 ['RU','Asia/Vladivostok'],
 ['RU','Asia/Ust-Nera'],
 ['RU','Asia/Magadan'],
 ['RU','Asia/Sakhalin'],
 ['RU','Asia/Srednekolymsk'],
 ['RU','Asia/Kamchatka'],
 ['RU','Asia/Anadyr'],
 ['RW','Africa/Kigali'],
 ['SA','Asia/Riyadh'],
 ['SB','Pacific/Guadalcanal'],
 ['SC','Indian/Mahe'],
 ['SD','Africa/Khartoum'],
 ['SE','Europe/Stockholm'],
 ['SG','Asia/Singapore'],
 ['SH','Atlantic/St_Helena'],
 ['SI','Europe/Ljubljana'],
 ['SJ','Arctic/Longyearbyen'],
 ['SK','Europe/Bratislava'],
 ['SL','Africa/Freetown'],
 ['SM','Europe/San_Marino'],
 ['SN','Africa/Dakar'],
 ['SO','Africa/Mogadishu'],
 ['SR','America/Paramaribo'],
 ['SS','Africa/Juba'],
 ['ST','Africa/Sao_Tome'],
 ['SV','America/El_Salvador'],
 ['SX','America/Lower_Princes'],
 ['SY','Asia/Damascus'],
 ['SZ','Africa/Mbabane'],
 ['TC','America/Grand_Turk'],
 ['TD','Africa/Ndjamena'],
 ['TF','Indian/Kerguelen'],
 ['TG','Africa/Lome'],
 ['TH','Asia/Bangkok'],
 ['TJ','Asia/Dushanbe'],
 ['TK','Pacific/Fakaofo'],
 ['TL','Asia/Dili'],
 ['TM','Asia/Ashgabat'],
 ['TN','Africa/Tunis'],
 ['TO','Pacific/Tongatapu'],
 ['TR','Europe/Istanbul'],
 ['TT','America/Port_of_Spain'],
 ['TV','Pacific/Funafuti'],
 ['TW','Asia/Taipei'],
 ['TZ','Africa/Dar_es_Salaam'],
 ['UA','Europe/Kyiv'],
 ['UG','Africa/Kampala'],
 ['UM','Pacific/Midway'],
 ['UM','Pacific/Wake'],
 ['US','America/New_York'],
 ['US','America/Detroit'],
 ['US','America/Kentucky/Louisville'],
 ['US','America/Kentucky/Monticello'],
 ['US','America/Indiana/Indianapolis'],
 ['US','America/Indiana/Vincennes'],
 ['US','America/Indiana/Winamac'],
 ['US','America/Indiana/Marengo'],
 ['US','America/Indiana/Petersburg'],
 ['US','America/Indiana/Vevay'],
 ['US','America/Chicago'],
 ['US','America/Indiana/Tell_City'],
 ['US','America/Indiana/Knox'],
 ['US','America/Menominee'],
 ['US','America/North_Dakota/Center'],
 ['US','America/North_Dakota/New_Salem'],
 ['US','America/North_Dakota/Beulah'],
 ['US','America/Denver'],
 ['US','America/Boise'],
 ['US','America/Phoenix'],
 ['US','America/Los_Angeles'],
 ['US','America/Anchorage'],
 ['US','America/Juneau'],
 ['US','America/Sitka'],
 ['US','America/Metlakatla'],
 ['US','America/Yakutat'],
 ['US','America/Nome'],
 ['US','America/Adak'],
 ['US','Pacific/Honolulu'],
 ['UY','America/Montevideo'],
 ['UZ','Asia/Samarkand'],
 ['UZ','Asia/Tashkent'],
 ['VA','Europe/Vatican'],
 ['VC','America/St_Vincent'],
 ['VE','America/Caracas'],
 ['VG','America/Tortola'],
 ['VI','America/St_Thomas'],
 ['VN','Asia/Ho_Chi_Minh'],
 ['VU','Pacific/Efate'],
 ['WF','Pacific/Wallis'],
 ['WS','Pacific/Apia'],
 ['YE','Asia/Aden'],
 ['YT','Indian/Mayotte'],
 ['ZA','Africa/Johannesburg'],
 ['ZM','Africa/Lusaka'],
 ['ZW','Africa/Harare']
];
const timezoneCityLabels={
 'Asia/Shanghai':'上海 · Shanghai',
 'Asia/Urumqi':'乌鲁木齐 · Ürümqi',
 'Asia/Tokyo':'东京 · Tokyo',
 'Asia/Seoul':'首尔 · Seoul',
 'America/New_York':'纽约 · New York',
 'America/Chicago':'芝加哥 · Chicago',
 'America/Denver':'丹佛 · Denver',
 'America/Los_Angeles':'洛杉矶 · Los Angeles',
 'Pacific/Honolulu':'檀香山 · Honolulu',
 'America/St_Johns':'圣约翰斯 · St. John’s',
 'America/Toronto':'多伦多 · Toronto',
 'America/Winnipeg':'温尼伯 · Winnipeg',
 'America/Edmonton':'埃德蒙顿 · Edmonton',
 'America/Vancouver':'温哥华 · Vancouver',
 'Europe/London':'伦敦 · London',
 'Europe/Paris':'巴黎 · Paris',
 'Europe/Berlin':'柏林 · Berlin',
 'Europe/Rome':'罗马 · Rome',
 'Europe/Madrid':'马德里 · Madrid',
 'Atlantic/Canary':'加那利群岛 · Canary Islands',
 'Europe/Lisbon':'里斯本 · Lisbon',
 'Atlantic/Azores':'亚速尔群岛 · Azores',
 'Europe/Moscow':'莫斯科 · Moscow',
 'Asia/Yekaterinburg':'叶卡捷琳堡 · Yekaterinburg',
 'Asia/Novosibirsk':'新西伯利亚 · Novosibirsk',
 'Asia/Vladivostok':'符拉迪沃斯托克 · Vladivostok',
 'Australia/Perth':'珀斯 · Perth',
 'Australia/Adelaide':'阿德莱德 · Adelaide',
 'Australia/Sydney':'悉尼 · Sydney',
 'Pacific/Auckland':'奥克兰 · Auckland',
 'Asia/Kolkata':'加尔各答 · Kolkata',
 'Asia/Singapore':'新加坡 · Singapore',
 'Asia/Bangkok':'曼谷 · Bangkok',
 'Asia/Ho_Chi_Minh':'胡志明市 · Ho Chi Minh City',
 'Asia/Jakarta':'雅加达 · Jakarta',
 'Asia/Makassar':'望加锡 · Makassar',
 'Asia/Jayapura':'查亚普拉 · Jayapura',
 'Asia/Dubai':'迪拜 · Dubai',
 'Europe/Istanbul':'伊斯坦布尔 · Istanbul',
 'America/Sao_Paulo':'圣保罗 · São Paulo',
 'America/Manaus':'马瑙斯 · Manaus',
 'America/Mexico_City':'墨西哥城 · Mexico City',
 'America/Tijuana':'蒂华纳 · Tijuana',
 'Africa/Johannesburg':'约翰内斯堡 · Johannesburg',
 'UTC':'协调世界时 · UTC'
};
const timezoneRegionNameZh=typeof Intl.DisplayNames==='function'?new Intl.DisplayNames(['zh-CN'],{type:'region'}):null,timezoneRegionNameEn=typeof Intl.DisplayNames==='function'?new Intl.DisplayNames(['en'],{type:'region'}):null;
for(const[code,zone]of timezoneZoneCountries){
 let country=timezoneCountries.find(item=>item.code===code);
 if(!country){const zh=timezoneRegionNameZh?.of(code)||code,en=timezoneRegionNameEn?.of(code)||code;country={code,name:zh===en?zh:`${zh} · ${en}`,cities:[]};timezoneCountries.push(country)}
 if(!country.cities.some(city=>city[0]===zone)){const city=zone.split('/').at(-1).replaceAll('_',' ');country.cities.push([zone,timezoneCityLabels[zone]||city])}
}

function countryForTimezone(zone){return timezoneCountries.find(country=>country.cities.some(city=>city[0]===zone))||timezoneCountries[0]}
function countryOptions(selected){return timezoneCountries.map(country=>`<option value="${country.code}" ${selected===country.code?'selected':''}>${esc(country.name)}</option>`).join('')}
let timezoneRegionDataPromise=null;
async function loadTimezoneRegions(countryCode){if(countryCode==='HK')return[['HK','香港','Asia/Hong_Kong','',0,'']];if(countryCode==='TW')return[['TW','台湾','Asia/Taipei','',0,'']];if(countryCode==='MO')return[['MO','澳门','Asia/Macau','',0,'']];if(!timezoneRegionDataPromise)timezoneRegionDataPromise=fetch('assets/timezone-regions.json').then(response=>{if(!response.ok)throw Error('行政区列表加载失败');return response.json()}).catch(error=>{timezoneRegionDataPromise=null;throw error});const regions=await timezoneRegionDataPromise;return Array.isArray(regions?.[countryCode])?regions[countryCode]:[]}
const timezoneRegionNamesZh={'CN.01':'安徽','CN.02':'浙江','CN.03':'江西','CN.04':'江苏','CN.05':'吉林','CN.06':'青海','CN.07':'福建','CN.08':'黑龙江','CN.09':'河南','CN.10':'河北','CN.11':'湖南','CN.12':'湖北','CN.13':'新疆','CN.14':'西藏','CN.15':'甘肃','CN.16':'广西','CN.18':'贵州','CN.19':'辽宁','CN.20':'内蒙古','CN.21':'宁夏','CN.22':'北京','CN.23':'上海','CN.24':'山西','CN.25':'山东','CN.26':'陕西','CN.28':'天津','CN.29':'云南','CN.30':'广东','CN.31':'海南','CN.32':'四川','CN.33':'重庆'};
function timezoneRegionLabel(record,countryCode){if(countryCode==='HK')return'中国香港';if(countryCode==='TW')return'中国台湾';if(countryCode==='MO')return'中国澳门';const country=timezoneCountries.find(item=>item.code===countryCode)?.name.split(' · ')[0]||countryCode,region=countryCode==='CN'?timezoneRegionNamesZh[`CN.${record[0]}`]||record[5]||record[1]:record[5]||record[1];return countryCode==='CN'?`中国${region}`:`${country}${region}`}
function timezoneRegionPickerMarkup(person){return `<select aria-label="选择省份、州或行政区" data-timezone-region="${person}"><option value="">加载省/州…</option></select><input type="hidden" data-timezone-value="${person}">`}
function timezoneOffset(zone,date=new Date()){try{const label=new Intl.DateTimeFormat('en',{timeZone:zone,timeZoneName:'longOffset'}).formatToParts(date).find(part=>part.type==='timeZoneName')?.value||'GMT';const match=label.match(/GMT([+-])(\d{2}):(\d{2})/);if(!match)return 0;return (match[1]==='-'?-1:1)*(Number(match[2])*60+Number(match[3]))}catch{return 0}}
function timezoneDifference(){const delta=timezoneOffset(onlineMoreDraft.characterTimezone)-timezoneOffset(onlineMoreDraft.userTimezone);if(!delta)return'两地时差 · 目前相同';const hours=Math.abs(delta)/60,amount=Number.isInteger(hours)?`${hours} 小时`:`${hours.toFixed(1)} 小时`;return `两地时差 · 角色${delta>0?'快':'慢'} ${amount}`}
function renderMemoryPanel(){
 const visible=memoryScopeFilter==='all'?onlineMemoryEntries:onlineMemoryEntries.filter(entry=>entry.scope===memoryScopeFilter);
 const ownerNames={user:'用户',character:'角色',shared:'共同'};
 const scopeNames={online:'线上',offline:'线下'};
 const entries=visible.map(entry=>`<article class="memory-entry-card"><div class="memory-entry-meta"><span class="memory-source-pill ${entry.scope==='offline'?'offline':''}">${scopeNames[entry.scope]||'线上'}</span><span>${ownerNames[entry.owner]||'共同记忆'}</span><time>${entry.updatedAt?new Intl.DateTimeFormat('zh-CN',{month:'2-digit',day:'2-digit'}).format(new Date(entry.updatedAt)):''}</time></div><h3>${esc(entry.title||'未命名记忆')}</h3>${entry.source==='offline-summary'?`<button type="button" class="summary-expandable memory-entry-content is-summary-collapsed" data-summary-expand aria-expanded="false">${esc(entry.content||'')}</button>`:`<p>${esc(entry.content||'')}</p>`}<div class="memory-entry-actions"><button type="button" data-memory-edit="${esc(entry.id)}">编辑</button><button type="button" data-memory-delete="${esc(entry.id)}">删除</button></div></article>`).join('');
 const roleExists=Boolean(chars[state.char]),roleSettings=currentRoleChatSettings(),userIndex=Number.isInteger(roleSettings.userIndex)?roleSettings.userIndex:state.user,thread=messages();
 let onlineRoundCount=0,awaitingRoleReply=false,roundAnswered=false;
 for(const message of thread){if(message.mine){if(roundAnswered)onlineRoundCount++;awaitingRoleReply=true;roundAnswered=false}else if(awaitingRoleReply)roundAnswered=true}
 if(roundAnswered)onlineRoundCount++;
 const offlineSessionCount=currentRoleOfflineData().records.length;
 const storedSummary=roleSettings.memory||{},summaryPending=memorySummaryPending.has(`online-summary-${state.char}-${userIndex}`),summaryInterval=Math.max(2,Number(onlineMemoryDraft.summaryEveryRounds)||10),summaryMeta=storedSummary.summaryUpdatedAt?new Intl.DateTimeFormat('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(storedSummary.summaryUpdatedAt)):'';
 const summaryState=summaryPending?'正在整理…':storedSummary.summaryText?`已整理 ${Number(storedSummary.summaryThroughRound)||0} 轮${summaryMeta?` · ${summaryMeta}`:''}`:!onlineMemoryDraft.enabled?'三级记忆已关闭':!onlineMemoryDraft.autoSummary?'自动总结已关闭':`当前 ${onlineRoundCount} / ${summaryInterval} 轮`;
 const summaryCard=`<article class="memory-summary-card"><div class="memory-summary-heading"><strong>线上自动总结</strong><small>${summaryState}</small></div>${storedSummary.summaryText?`<button type="button" class="summary-expandable memory-summary-expandable is-summary-collapsed" data-summary-expand aria-expanded="false">${esc(storedSummary.summaryText)}</button>`:`<p class="memory-summary-empty">${storedSummary.summaryError?esc(storedSummary.summaryError):'达到设定轮数后会自动整理，并在后续回复中作为长期记忆参考。'}</p>`}${storedSummary.summaryError&&storedSummary.summaryText?`<small class="memory-summary-error">${esc(storedSummary.summaryError)}</small>`:''}</article>`;
 return `<section class="online-setting-section memory-page"><details class="memory-settings-fold"><summary><span><strong>记忆整理设置</strong><small>自动总结、保留范围与召回参数</small></span><i class="memory-disclosure-mark" aria-hidden="true"><span class="memory-mark-closed">＋</span><span class="memory-mark-open">−</span></i></summary><div class="memory-settings-content"><div class="memory-control-card"><label class="settings-switch-row memory-main-toggle"><span><strong>启用三级记忆</strong><small>回复时参考短期、长期与核心记忆</small></span><input type="checkbox" data-memory-toggle="enabled" ${onlineMemoryDraft.enabled?'checked':''}><i aria-hidden="true"></i></label><label class="settings-switch-row memory-main-toggle"><span><strong>自动整理长期记忆</strong><small>达到设定轮数后，在回复完成时整理</small></span><input type="checkbox" data-memory-toggle="autoSummary" ${onlineMemoryDraft.autoSummary?'checked':''}><i aria-hidden="true"></i></label><label class="memory-round-setting"><span>每多少轮总结</span><span class="memory-number-wrap"><input type="number" min="2" max="100" step="1" data-memory-number="summaryEveryRounds" value="${onlineMemoryDraft.summaryEveryRounds}"><small>轮</small><i>一轮 = 用户发言 + 角色回应</i></span></label></div><div class="memory-level-grid"><article class="memory-level-card"><span class="memory-level-index">01 / 最近</span><strong>短期记忆</strong><p>保留原始聊天，贴合当前对话语境。</p><label class="memory-inline-setting">保留<input type="number" min="5" max="200" step="1" data-memory-number="shortTermRounds" value="${onlineMemoryDraft.shortTermRounds}">轮</label></article><article class="memory-level-card"><span class="memory-level-index">02 / 长期</span><strong>长期记忆</strong><p>提取重要事件、偏好、承诺与情绪变化。</p><label class="memory-inline-setting">固定注入<input type="number" min="1" max="10" step="1" data-memory-number="recentLongCount" value="${onlineMemoryDraft.recentLongCount}">条</label></article><article class="memory-level-card is-core"><span class="memory-level-index">03 / 核心</span><strong>核心记忆</strong><p>沉淀稳定关系、重要经历和相处边界。</p><span class="memory-level-value">关系档案</span></article></div><details class="memory-advanced"><summary><span><strong>高级记忆参数</strong><small>召回数量、摘要长度与上下文限制</small></span><i class="memory-disclosure-mark" aria-hidden="true"><span class="memory-mark-closed">＋</span><span class="memory-mark-open">−</span></i></summary><div class="memory-advanced-grid"><label>旧记忆召回<span><input type="number" min="0" max="10" data-memory-number="recallCount" value="${onlineMemoryDraft.recallCount}"> 条</span></label><label>核心更新频率<span>每 <input type="number" min="1" max="20" data-memory-number="coreEveryLongMemories" value="${onlineMemoryDraft.coreEveryLongMemories}"> 条</span></label><label>单条摘要长度<span><input type="number" min="100" max="1000" step="50" data-memory-number="summaryMaxChars" value="${onlineMemoryDraft.summaryMaxChars}"> 字</span></label><label>核心记忆长度<span><input type="number" min="300" max="4000" step="100" data-memory-number="coreMaxChars" value="${onlineMemoryDraft.coreMaxChars}"> 字</span></label><label>时间衰减<span><input type="number" min="30" max="730" step="10" data-memory-number="timeDecayDays" value="${onlineMemoryDraft.timeDecayDays}"> 天</span></label><label>上下文上限<span><input type="number" min="2000" max="50000" step="1000" data-memory-number="contextTokenBudget" value="${onlineMemoryDraft.contextTokenBudget}"> 词元</span></label></div><label class="memory-semantic-row"><input type="checkbox" data-memory-toggle="semanticRecall" ${onlineMemoryDraft.semanticRecall?'checked':''}><span><strong>语义向量召回</strong><small>结合当前话题与关键词寻找相关旧记忆</small></span></label></details><div class="memory-settings-footer"><div class="memory-settings-actions"><button type="button" class="memory-collapse-button" data-memory-collapse>收起</button><button type="button" class="memory-save-button" data-memory-save>保存设置</button></div></div></div></details><div class="memory-library-toolbar"><nav class="memory-scope-tabs" aria-label="记忆来源">${[['all','全部'],['online',`线上 ${onlineRoundCount} 轮`],['offline',`线下 ${offlineSessionCount} 次`]].map(([scope,label])=>`<button type="button" data-memory-scope="${scope}" class="${memoryScopeFilter===scope?'active':''}">${label}</button>`).join('')}</nav><button type="button" class="memory-add-button" data-memory-add ${roleExists?'':'disabled'}>＋ 记一条</button></div>${summaryCard}<form class="memory-entry-editor" data-memory-entry-form hidden><div class="memory-editor-selects"><label>记忆来源<select name="scope"><option value="online">线上聊天</option><option value="offline">线下经历</option></select></label><label>记忆归属<select name="owner"><option value="shared">共同</option><option value="user">用户</option><option value="character">角色</option></select></label></div><label class="memory-editor-field">标题<input name="title" maxlength="100" required placeholder="给这段记忆一个简短标题"></label><label class="memory-editor-field">内容<textarea name="content" rows="4" maxlength="4000" required placeholder="记下重要经历、约定、偏好或关系变化"></textarea></label><div class="memory-editor-actions"><button type="button" data-memory-cancel>取消</button><button type="submit">保存记忆</button></div></form>${entries?`<div class="memory-entry-list">${entries}</div>`:!roleExists?`<div class="memory-entry-list"><div class="memory-library-empty"><strong>先创建或选择一个角色</strong></div></div>`:''}</section>`;
}
const experienceLevels=['一般','值得记住','重要','很重要','非常重要'];
function experienceNotes(cfg){
 if(!Array.isArray(cfg.userExperiences))cfg.userExperiences=cfg.userExperience?.trim()?[{id:'legacy-experience',content:cfg.userExperience.trim(),importance:1}]:[];
 return cfg.userExperiences;
}
function sortedExperienceNotes(cfg){
 return experienceNotes(cfg).map((note,index)=>({...note,createdAt:Number(note.createdAt)||Number(/^experience-(\d+)-/.exec(note.id)?.[1])||index})).sort((a,b)=>cfg.experienceSort==='importance'?(Number(b.importance)-Number(a.importance)||b.createdAt-a.createdAt):b.createdAt-a.createdAt);
}
function experienceDate(note){const time=Number(note.createdAt)||Number(/^experience-(\d+)-/.exec(note.id)?.[1]);return time>1000000000000?new Intl.DateTimeFormat('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(time)).replaceAll('/',' . '):'日期未记录'}
function renderExperienceNotes(cfg){
 const notes=sortedExperienceNotes(cfg),sort=cfg.experienceSort||'time';
 return `<section class="experience-section" aria-label="用户与角色的经历"><div class="experience-heading"><span>共同经历 <small>${notes.length?String(notes.length).padStart(2,'0'):''}</small></span><button type="button" class="experience-add" data-experience-add ${chars[state.char]?'':'disabled'}>补充经历 <span aria-hidden="true">＋</span></button></div><div data-experience-overview><nav class="experience-sort" aria-label="经历排序"><span>排列</span><button type="button" data-experience-sort="time" aria-pressed="${sort==='time'}">添加时间</button><button type="button" data-experience-sort="importance" aria-pressed="${sort==='importance'}">重要性</button><small>${sort==='importance'?'由高到低':'最新在前'}</small></nav><div class="experience-notes">${notes.map((note,index)=>{const level=Math.max(1,Math.min(5,Number(note.importance)||1));return `<article class="experience-note"><header><span class="experience-note-index">${String(index+1).padStart(2,'0')}</span><span class="experience-note-level"><span class="experience-level-ticks" aria-hidden="true">${Array.from({length:5},(_,i)=>`<i class="${i<level?'is-filled':''}"></i>`).join('')}</span>${experienceLevels[level-1]}<span>${level} / 5</span></span></header><button type="button" class="experience-preview" data-experience-view="${esc(note.id)}" aria-label="查看经历全文"><span>${esc(note.content)}</span></button><footer><time class="experience-note-date">${esc(experienceDate(note))}</time><button type="button" data-experience-view="${esc(note.id)}">查看</button><button type="button" data-experience-edit="${esc(note.id)}">编辑</button><button type="button" data-experience-delete="${esc(note.id)}">删除</button></footer></article>`}).join('')}</div>${notes.length?'':'<p class="experience-empty">记下一次相遇，或一个想要记住的瞬间。</p>'}</div><section class="experience-reader" data-experience-reader hidden><header><span data-experience-reader-level></span><button type="button" data-experience-reader-close>收起 −</button></header><p data-experience-full></p><footer><span class="experience-note-date" data-experience-reader-date></span><button type="button" data-experience-reader-edit>编辑经历</button></footer></section><form class="experience-editor" data-experience-form hidden><label class="experience-content-label"><span data-experience-editor-title>补充经历</span><textarea name="content" rows="7" required maxlength="8000" placeholder="写下你们之间的经历、约定或相处细节……"></textarea></label><fieldset class="experience-importance"><legend>重要程度</legend><div>${experienceLevels.map((label,index)=>`<label><input type="radio" name="importance" value="${index+1}" ${index===0?'checked':''}><span><i>${String(index+1).padStart(2,'0')}</i>${label}</span></label>`).join('')}</div></fieldset><div class="experience-editor-actions"><button type="button" data-experience-cancel>取消</button><button type="submit">保存经历 ＋</button></div></form></section>`;
}
function bindExperienceNotes(panel){
 const form=panel.querySelector('[data-experience-form]');if(!form)return;
 const overview=panel.querySelector('[data-experience-overview]'),reader=panel.querySelector('[data-experience-reader]'),add=panel.querySelector('[data-experience-add]');
 const redraw=()=>{panel.innerHTML=onlineSettingsPanel('user');bindOnlineSettingsInputs(panel)};
 const persist=()=>{const cfg=currentRoleChatSettings();cfg.userExperience=experienceNotes(cfg).map(note=>note.content).join('\n\n');persistRoleChatSettings()};
 const find=id=>experienceNotes(currentRoleChatSettings()).find(note=>note.id===id);
 const close=()=>{form.hidden=true;reader.hidden=true;overview.hidden=false;add.hidden=false};
 const open=note=>{form.reset();form.dataset.noteId=note?.id||'';form.elements.content.setCustomValidity('');form.elements.content.value=note?.content||'';form.elements.importance.value=String(note?.importance||1);panel.querySelector('[data-experience-editor-title]').textContent=note?'编辑经历':'补充经历';form.hidden=false;reader.hidden=true;overview.hidden=true;add.hidden=true;form.elements.content.focus()};
 add.onclick=()=>open();
 panel.querySelector('[data-experience-cancel]').onclick=close;
 panel.querySelector('[data-experience-reader-close]').onclick=close;
 panel.querySelectorAll('[data-experience-sort]').forEach(button=>button.onclick=()=>{currentRoleChatSettings().experienceSort=button.dataset.experienceSort;persist();redraw()});
 panel.querySelectorAll('[data-experience-view]').forEach(button=>button.onclick=()=>{const note=find(button.dataset.experienceView);if(!note)return;panel.querySelector('[data-experience-full]').textContent=note.content;panel.querySelector('[data-experience-reader-date]').textContent=experienceDate(note);panel.querySelector('[data-experience-reader-level]').textContent=experienceLevels[Math.max(1,Math.min(5,Number(note.importance)||1))-1];panel.querySelector('[data-experience-reader-edit]').onclick=()=>open(note);reader.hidden=false;overview.hidden=true;form.hidden=true;add.hidden=true});
 panel.querySelectorAll('[data-experience-edit]').forEach(button=>button.onclick=()=>open(find(button.dataset.experienceEdit)));
 panel.querySelectorAll('[data-experience-delete]').forEach(button=>button.onclick=()=>{if(!window.confirm('删除这条经历？'))return;const cfg=currentRoleChatSettings();cfg.userExperiences=experienceNotes(cfg).filter(note=>note.id!==button.dataset.experienceDelete);persist();redraw()});
 form.onsubmit=event=>{event.preventDefault();const content=form.elements.content.value.trim();if(!content){form.elements.content.setCustomValidity('请填写经历内容');form.elements.content.reportValidity();return}const cfg=currentRoleChatSettings(),notes=experienceNotes(cfg),id=form.dataset.noteId,existing=find(id),now=Date.now(),note={...existing,id:id||`experience-${now}-${Math.random().toString(36).slice(2,7)}`,content,importance:Number(form.elements.importance.value),createdAt:existing?(Number(existing.createdAt)||Number(/^experience-(\d+)-/.exec(existing.id)?.[1])||0):now,updatedAt:now};cfg.userExperiences=id?notes.map(item=>item.id===id?note:item):[...notes,note];persist();redraw()};
 form.elements.content.oninput=()=>form.elements.content.setCustomValidity('');
}
function characterWorldBooks(character){
 if(!character)return [];
 if(!Array.isArray(character.worldBooks)||!character.worldBooks.length)character.worldBooks=[{id:'role-world-default',name:'默认世界书',entries:Array.isArray(character.worldBook)?character.worldBook:[]}];
 character.worldBooks=character.worldBooks.filter(book=>book&&Array.isArray(book.entries)).map((book,index)=>({...book,id:book.id||'role-world-'+(index+1),name:book.name||'世界书 '+(index+1)}));
 if(!character.worldBooks.length)character.worldBooks=[{id:'role-world-default',name:'默认世界书',entries:[]}];
 character.activeWorldBookId=character.worldBooks.some(book=>book.id===character.activeWorldBookId)?character.activeWorldBookId:character.worldBooks[0].id;
 return character.worldBooks;
}
function renderCharacterWorldBookPanel(cfg,character){
 const books=characterWorldBooks(character),book=books.find(item=>item.id===character?.activeWorldBookId)||books[0],entries=book?.entries||[],locked=!character;
 const hasWorldBooks=books.some(item=>item.id!=='role-world-default'||(item.entries||[]).length>0),showCreate=!locked&&!hasWorldBooks,showImport=!locked&&!hasWorldBooks;
 const bookSelect=books.length>1?`<label class="role-worldbook-select" aria-label="选择世界书"><select data-role-worldbook-select ${locked?'disabled':''}>${books.map(item=>`<option value="${esc(item.id)}" ${item.id===book?.id?'selected':''}>${esc(item.name)}</option>`).join('')}</select></label>`:'';
 const toolbarContents=`${bookSelect}${showCreate?`<button type="button" data-role-worldbook-new>新建世界书 <span>＋</span></button>`:''}${showImport?`<button type="button" data-role-worldbook-import>导入世界书 <span>＋</span></button>`:''}`;
 return `<section class="online-setting-section character-worldbook-page"><p class="online-section-kicker">角色设定</p><h2>世界书</h2><div class="lore-character-card">${avatar(character)}<div><strong>${esc(character?.name||'尚未选择角色')}</strong><small>当前角色 · 关联世界书</small></div><button type="button" class="role-worldbook-add-entry" data-role-worldbook-add-entry ${locked?'disabled':''}>新增条目 <span>＋</span></button><span class="lore-count">${entries.length} 条</span><label class="settings-switch-row lore-master-switch" aria-label="启用当前角色世界书" title="启用当前角色世界书"><input type="checkbox" data-worldbook-toggle ${cfg.worldBookEnabled===false?'':'checked'}><i aria-hidden="true"></i></label></div>${toolbarContents?`<div class="role-worldbook-toolbar">${toolbarContents}</div>`:''}<input type="file" data-role-worldbook-file accept=".json,.txt,.docx" hidden><p class="role-worldbook-status" data-role-worldbook-status aria-live="polite"></p><form class="role-worldbook-name-form" data-role-worldbook-name-form hidden><label>世界书名称<input name="name" required maxlength="80" placeholder="给这本世界书命名"></label><div><button type="button" data-role-worldbook-name-cancel>取消</button><button type="submit">创建世界书</button></div></form><form class="role-worldbook-entry-form" data-role-worldbook-entry-form hidden><label>条目名称<input name="name" required maxlength="100" placeholder="输入条目名称"></label><label>关键词<input name="keys" maxlength="300" placeholder="多个关键词用逗号分隔"></label><label>内容<textarea name="content" rows="5" required placeholder="填写条目内容"></textarea></label><div><button type="button" data-role-worldbook-entry-cancel>取消</button><button type="submit">保存条目</button></div></form>${entries.length?`<div class="worldbook-entry-list" aria-label="世界书条目">${entries.map((entry,index)=>`<article class="worldbook-entry"><div class="worldbook-entry-row"><details class="worldbook-entry-disclosure"><summary><span><strong>${esc(entry.name||`条目 ${index+1}`)}</strong>${entry.keys?.length?`<small>${esc(entry.keys.join(' · '))}</small>`:''}</span></summary>${entry.content?`<p>${esc(entry.content)}</p>`:''}</details><label class="worldbook-entry-toggle" aria-label="启用${esc(entry.name||`条目 ${index+1}`)}"><input type="checkbox" data-worldbook-entry="${index}" ${entry.enabled===false?'':'checked'}><i aria-hidden="true"></i></label><div class="role-worldbook-entry-actions"><button type="button" data-role-worldbook-edit="${index}">编辑</button><button type="button" data-role-worldbook-delete="${index}">删除</button></div></div></article>`).join('')}</div>`:`<div class="worldbook-empty"><strong>${character?'这本世界书还没有条目':'请先导入或选择角色卡'}</strong></div>`}</section>`;
}
function onlineSettingsPanel(tab){
 const cfg=currentRoleChatSettings(),boundUserIndex=Number.isInteger(cfg.userIndex)&&state.users[cfg.userIndex]?cfg.userIndex:null,selectedUser=boundUserIndex===null?null:state.users[boundUserIndex],character=chars[state.char],worldBook=Array.isArray(character?.worldBook)?character.worldBook:[];
 if(tab==='user')return `<section class="online-setting-section"><p class="online-section-kicker">个人资料</p><h2>绑定用户</h2>${selectedUser?`<div class="setting-user-card">${avatar(selectedUser,true)}<div><strong>${esc(selectedUser.name||'未命名用户')}</strong><small>${esc(selectedUser.nickname||'个人档案')}</small></div></div>`:`<div class="setting-empty-user">${icon('user')}<span>${state.users.length?'此角色暂未绑定用户':'还没有用户档案'}</span></div><p class="settings-note chat-user-binding-notice">${state.users.length?'请先绑定用户，再开始线上聊天。选择用户后会立即保存。':'请先创建用户档案，再绑定到当前角色后开始线上聊天。'}</p>`}<label class="setting-field"><span>选择用户</span><select data-role-user><option value="" ${boundUserIndex===null?'selected':''}>暂未选择</option>${state.users.map((item,index)=>`<option value="${index}" ${index===boundUserIndex?'selected':''}>${esc(item.name||'未命名用户')}</option>`).join('')}</select></label>${renderExperienceNotes(cfg)}</section>`;
 if(tab==='world')return renderCharacterWorldBookPanel(cfg,character);
 if(tab==='memory')return renderMemoryPanel();
 const languageOptions=bilingualLanguages.map(([code,label])=>`<option value="${code}" ${onlineMoreDraft.targetLang===code?'selected':''}>${label}</option>`).join('');
 const sourceOptions=bilingualLanguages.map(([code,label])=>`<option value="${code}" ${onlineMoreDraft.sourceLang===code?'selected':''}>${label}</option>`).join('');
 const groups=Array.isArray(state.emojis?.groups)?state.emojis.groups:[];
 const emojiGroupsMarkup=groups.length?groups.map(group=>`<div class="emoji-role-group"><div class="emoji-role-group-head"><button type="button" class="emoji-role-expand" data-emoji-group-expand aria-expanded="false"><span><strong>${esc(group.name||'未命名分组')}</strong><small>${(group.items||[]).length} 张表情包 · 点击查看</small></span><b class="emoji-role-expand-mark" aria-hidden="true">＋</b></button><label class="emoji-role-enable"><span>启用</span><input type="checkbox" data-emoji-group-enabled="${esc(group.id)}" ${onlineMoreDraft.emojiGroups[group.id]!==false?'checked':''}><i aria-hidden="true"></i></label></div><div class="emoji-role-content" hidden>${group.items?.length?`<div class="emoji-role-preview">${group.items.map(item=>`<span class="emoji-role-preview-item"><img src="${esc(item.url||'')}" alt="${esc(item.text||'表情包')}" referrerpolicy="no-referrer"><small>${esc(item.text||'表情包')}</small></span>`).join('')}</div>`:'<p class="emoji-role-empty">这个分组还没有表情包</p>'}</div></div>`).join(''):'<div class="emoji-role-no-groups">还没有导入表情包。可在聊天输入框旁的表情面板中导入并分组。</div>';
 return `<section class="online-setting-section more-page"><p class="online-section-kicker">聊天偏好</p><h2>更多设置</h2>
 <section class="more-preference-card emoji-preference"><div class="more-card-heading"><span><strong>表情包</strong><small>管理当前聊天可使用的表情分组</small></span><button type="button" class="subtle-action">${emojiManagementOpen?'完成':'管理'}</button></div><div class="emoji-management-content" ${emojiManagementOpen?'':'hidden'}>${emojiGroupsMarkup}</div></section>
 <section class="more-preference-card translation-preference"><label class="settings-switch-row more-main-toggle"><span><strong>双语模式</strong><small>在同一条消息中显示原文与译文</small></span><input type="checkbox" data-more-toggle="bilingual" ${onlineMoreDraft.bilingual?'checked':''}><i aria-hidden="true"></i></label><div class="translation-fields" ${onlineMoreDraft.bilingual?'':'hidden'}><div class="translation-language-grid"><label><span>原文语言</span><select data-more-value="sourceLang">${sourceOptions}</select></label><i>→</i><label><span>译文语言</span><select data-more-value="targetLang">${languageOptions}</select></label></div><label class="settings-switch-row more-auto-expand"><span><strong>默认自动展开译文</strong><small>打开聊天时直接显示译文</small></span><input type="checkbox" data-more-toggle="autoExpand" ${onlineMoreDraft.autoExpand?'checked':''}><i aria-hidden="true"></i></label></div></section>
 <section class="more-preference-card timezone-preference"><div class="more-card-heading timezone-card-heading"><span><strong>实际时区</strong><small>地区来自 <a href="https://www.geonames.org" target="_blank" rel="noopener">GeoNames</a>，省州和城市尽量显示中文；线上聊天时间按用户所在地</small></span><label class="timezone-inline-toggle" aria-label="启用实际时区"><input type="checkbox" data-more-toggle="timezoneEnabled" ${onlineMoreDraft.timezoneEnabled?'checked':''}><i aria-hidden="true"></i></label></div><div class="timezone-fields" ${onlineMoreDraft.timezoneEnabled?'':'hidden'}><div class="timezone-person-row"><span><i class="timezone-dot user-dot"></i>用户时区</span><div class="timezone-selects"><select aria-label="选择用户国家" data-timezone-country="user">${countryOptions(countryForTimezone(onlineMoreDraft.userTimezone).code)}</select>${timezoneRegionPickerMarkup('user')}</div></div><div class="timezone-person-row"><span><i class="timezone-dot role-dot"></i>角色时区</span><div class="timezone-selects"><select aria-label="选择角色国家" data-timezone-country="character">${countryOptions(countryForTimezone(onlineMoreDraft.characterTimezone).code)}</select>${timezoneRegionPickerMarkup('character')}</div></div><div class="timezone-footer"><div class="timezone-difference" data-timezone-difference>${timezoneDifference()}</div><button type="button" class="timezone-reset" data-timezone-reset><span aria-hidden="true">↺</span>恢复默认</button></div></div></section>
 <section class="more-preference-card actual-time-preference"><label class="settings-switch-row more-main-toggle"><span><strong>时间感知</strong><small>默认开启，使用角色时区、消息时间和互动间隔；不需要联网</small></span><input type="checkbox" data-more-toggle="timeAwarenessEnabled" ${onlineMoreDraft.timeAwarenessEnabled?'checked':''}><i aria-hidden="true"></i></label><label class="settings-switch-row more-main-toggle holiday-awareness-toggle"><span><strong>节假日感知</strong><small>每天联网查询一次中国大陆节假日与调休</small></span><input type="checkbox" data-more-toggle="holidayAwarenessEnabled" ${onlineMoreDraft.holidayAwarenessEnabled?'checked':''}><i aria-hidden="true"></i></label></section>
 </section>`;
}
function bindOnlineSettingsInputs(panel){
 panel.querySelector('.subtle-action')?.addEventListener('click',()=>{emojiManagementOpen=!emojiManagementOpen;panel.innerHTML=onlineSettingsPanel('more');bindOnlineSettingsInputs(panel)});
 panel.querySelectorAll('[data-memory-toggle]').forEach(input=>input.onchange=()=>{onlineMemoryDraft[input.dataset.memoryToggle]=input.checked;persistRoleChatSettings()});
 panel.querySelectorAll('[data-memory-number]').forEach(input=>input.onchange=()=>{const value=Number(input.value);if(Number.isFinite(value)){onlineMemoryDraft[input.dataset.memoryNumber]=value;persistRoleChatSettings()}});
 panel.querySelectorAll('[data-more-toggle]').forEach(input=>input.onchange=()=>{onlineMoreDraft[input.dataset.moreToggle]=input.checked;if(input.dataset.moreToggle==='bilingual')panel.querySelector('.translation-fields').hidden=!input.checked;if(input.dataset.moreToggle==='timezoneEnabled')panel.querySelector('.timezone-fields').hidden=!input.checked;persistRoleChatSettings()});
 panel.querySelectorAll('[data-more-value]').forEach(input=>input.onchange=()=>{onlineMoreDraft[input.dataset.moreValue]=input.value;persistRoleChatSettings()});
 panel.querySelectorAll('[data-emoji-group-enabled]').forEach(input=>input.onchange=()=>{onlineMoreDraft.emojiGroups[input.dataset.emojiGroupEnabled]=input.checked;persistRoleChatSettings()});
 panel.querySelectorAll('[data-emoji-group-expand]').forEach(button=>button.onclick=()=>{const content=button.closest('.emoji-role-group')?.querySelector('.emoji-role-content');if(!content)return;content.hidden=!content.hidden;button.setAttribute('aria-expanded',String(!content.hidden));const mark=button.querySelector('.emoji-role-expand-mark');if(mark)mark.textContent=content.hidden?'＋':'−'});
 panel.querySelectorAll('[data-role-user]').forEach(input=>input.onchange=()=>{const selected=input.value===''?null:Number(input.value);currentRoleChatSettings().userIndex=selected;if(Number.isInteger(selected)&&state.users[selected])state.user=selected;persistRoleChatSettings();render();panel.innerHTML=onlineSettingsPanel('user');bindOnlineSettingsInputs(panel)});
 bindExperienceNotes(panel);
 panel.querySelectorAll('[data-worldbook-toggle]').forEach(input=>input.onchange=()=>{currentRoleChatSettings().worldBookEnabled=input.checked;persistRoleChatSettings()});
 if(panel.querySelector('.character-worldbook-page'))bindCharacterWorldBookInputs(panel);
 const syncTimezone=(person,zone)=>{const field=person==='user'?'userTimezone':'characterTimezone';onlineMoreDraft[field]=zone;const value=panel.querySelector(`[data-timezone-value="${person}"]`);if(value)value.value=zone;const difference=panel.querySelector('[data-timezone-difference]');if(difference)difference.textContent=timezoneDifference();persistRoleChatSettings()};
 const fillTimezoneRegions=async(person,countryCode,preferredZone,preferredCode='')=>{const select=panel.querySelector(`[data-timezone-region="${person}"]`);if(!select)return;select.innerHTML='<option value="">加载中…</option>';try{const records=await loadTimezoneRegions(countryCode),country=timezoneCountries.find(item=>item.code===countryCode),fallback=country?.cities[0]?.[0]||'UTC';select.innerHTML=records.map(record=>{const zone=record[2]||fallback,label=timezoneRegionLabel(record,countryCode);return `<option value="${esc(record[0])}" data-zone="${esc(zone)}" title="${esc(label)}">${esc(label)}${record[2]?'': ' · '+esc(zone)}</option>`}).join('')||'<option value="">没有省/州数据</option>';const preferred=records.find(record=>record[0]===preferredCode)||records.find(record=>record[2]===preferredZone)||records.reduce((best,record)=>Number(record[4]||0)>Number(best?.[4]||0)?record:best,null);if(preferred)select.value=preferred[0];select._timezoneRegions=records}catch{select.innerHTML='<option value="">行政区列表无法加载</option>'}};
 panel.querySelectorAll('[data-timezone-country]').forEach(country=>{const person=country.dataset.timezoneCountry,zone=person==='user'?onlineMoreDraft.userTimezone:onlineMoreDraft.characterTimezone;void fillTimezoneRegions(person,country.value,zone);country.onchange=async()=>{const selectedCountry=timezoneCountries.find(item=>item.code===country.value)||timezoneCountries[0];await fillTimezoneRegions(person,selectedCountry.code,'');const region=panel.querySelector(`[data-timezone-region="${person}"]`),option=region?.selectedOptions[0],fallback=selectedCountry.cities[0]?.[0]||'UTC';syncTimezone(person,option?.dataset.zone||fallback)}});
 panel.querySelectorAll('[data-timezone-region]').forEach(select=>select.onchange=()=>{const zone=select.selectedOptions[0]?.dataset.zone;if(zone)syncTimezone(select.dataset.timezoneRegion,zone)});
 panel.querySelectorAll('[data-timezone-reset]').forEach(button=>button.onclick=()=>{onlineMoreDraft.timezoneEnabled=false;onlineMoreDraft.userTimezone=localTimezone;onlineMoreDraft.characterTimezone=localTimezone;const toggle=panel.querySelector('[data-more-toggle="timezoneEnabled"]');if(toggle)toggle.checked=false;const fields=panel.querySelector('.timezone-fields');if(fields)fields.hidden=true;for(const person of ['user','character']){const country=panel.querySelector(`[data-timezone-country="${person}"]`),region=panel.querySelector(`[data-timezone-region="${person}"]`),value=panel.querySelector(`[data-timezone-value="${person}"]`);if(country&&region){const selected=countryForTimezone(localTimezone);country.value=selected.code;if(value)value.value=localTimezone;void fillTimezoneRegions(person,selected.code,localTimezone)}}const difference=panel.querySelector('[data-timezone-difference]');if(difference)difference.textContent=timezoneDifference();persistRoleChatSettings()});
 if(panel.querySelector('.memory-page'))bindMemoryPanel(panel);
}
function bindMemoryPanel(panel){
 const redraw=()=>{panel.innerHTML=renderMemoryPanel();bindOnlineSettingsInputs(panel)};
 panel.querySelectorAll('[data-summary-expand]').forEach(button=>button.onclick=()=>toggleSummaryExpansion(button));
 panel.querySelectorAll('[data-memory-scope]').forEach(button=>button.onclick=()=>{memoryScopeFilter=button.dataset.memoryScope;redraw()});
 const form=panel.querySelector('[data-memory-entry-form]');
 const openEditor=entry=>{if(!form)return;form.reset();form.dataset.entryId=entry?.id||'';if(entry){form.elements.scope.value=entry.scope||'online';form.elements.owner.value=entry.owner||'shared';form.elements.title.value=entry.title||'';form.elements.content.value=entry.content||''}form.hidden=false;form.elements.title.focus()};
 panel.querySelector('[data-memory-add]')?.addEventListener('click',()=>openEditor());
 panel.querySelector('[data-memory-cancel]')?.addEventListener('click',()=>{form.hidden=true;form.dataset.entryId=''})
 panel.querySelectorAll('[data-memory-edit]').forEach(button=>button.onclick=()=>openEditor(onlineMemoryEntries.find(entry=>entry.id===button.dataset.memoryEdit)));
 panel.querySelectorAll('[data-memory-delete]').forEach(button=>button.onclick=()=>{onlineMemoryEntries=onlineMemoryEntries.filter(entry=>entry.id!==button.dataset.memoryDelete);persistRoleChatSettings();redraw()});
 if(form)form.onsubmit=event=>{event.preventDefault();const values=new FormData(form),id=form.dataset.entryId,existing=onlineMemoryEntries.find(entry=>entry.id===id),entry={...(existing||{}),id:id||`memory-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,scope:values.get('scope'),owner:values.get('owner'),title:String(values.get('title')||'').trim(),content:String(values.get('content')||'').trim(),updatedAt:Date.now()};onlineMemoryEntries=id?onlineMemoryEntries.map(item=>item.id===id?entry:item):[entry,...onlineMemoryEntries];persistRoleChatSettings();redraw()};
 panel.querySelector('[data-memory-save]')?.addEventListener('click',()=>{persistRoleChatSettings();toast('记忆设置已保存')});
 panel.querySelector('[data-memory-collapse]')?.addEventListener('click',()=>{const settings=panel.querySelector('.memory-settings-fold');if(settings)settings.open=false});
}
function toggleSummaryExpansion(button){const expanded=button.getAttribute('aria-expanded')==='true';button.setAttribute('aria-expanded',String(!expanded));button.classList.toggle('is-summary-collapsed',expanded)}
function closeSettings(){
 $('#settingsScreen').hidden=true;
 settingsSection=null;
 modeSettings=false;
}
function settingsBack(){
 if(modeSettings){closeSettings();return}
 if(settingsSection){settingsSection=null;refreshSettings();return}
 closeSettings();
}
function openSettings(){
 closeSheet();
 modeSettings=false;
 settingsSection=null;
 editingApiConfigId=state.settings.apiEditingConfigId===''?'':state.settings.apiEditingConfigId&&state.settings.apiConfigs.some(config=>config.id===state.settings.apiEditingConfigId)?state.settings.apiEditingConfigId:(state.settings.activeApiConfigId||'');
 activeApiPanelConfigId=firstRoutedApiConfigId()||state.settings.activeApiConfigId||state.settings.apiConfigs[0]?.id||'';
 $('#settingsScreen').hidden=false;
 refreshSettings();
}
function openModeSettings(){
 closeSheet();
 modeSettings=true;
 settingsSection=state.offline?'offline':'online';
 if(state.offline)offlineSettingsTab='settings'
 onlineSettingsTab='user';
 emojiManagementOpen=false;
 loadRoleChatSettings();
 $('#settingsScreen').hidden=false;
 refreshSettings();
 if(!state.offline){const roleSettings=currentRoleChatSettings(),bound=Number.isInteger(roleSettings.userIndex)&&state.users[roleSettings.userIndex];if(!bound)toast(state.users.length?'请先绑定用户，再开始线上聊天':'请先创建用户档案并绑定，再开始线上聊天')}
}
function bindCharacterWorldBookInputs(panel){
 const character=chars[state.char];if(!character)return;
 const redraw=()=>{panel.innerHTML=onlineSettingsPanel('world');bindOnlineSettingsInputs(panel)};
 const books=characterWorldBooks(character),current=()=>books.find(book=>book.id===character.activeWorldBookId)||books[0];
 panel.querySelector('[data-role-worldbook-select]')?.addEventListener('change',event=>{character.activeWorldBookId=event.target.value;persistRoleChatSettings();redraw()});
 const nameForm=panel.querySelector('[data-role-worldbook-name-form]');
 panel.querySelector('[data-role-worldbook-new]')?.addEventListener('click',()=>{nameForm.hidden=false;nameForm.elements.name.focus()});
 panel.querySelector('[data-role-worldbook-name-cancel]')?.addEventListener('click',()=>{nameForm.hidden=true;nameForm.reset()});
 nameForm.onsubmit=event=>{event.preventDefault();const book={id:'role-world-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),name:nameForm.elements.name.value.trim(),entries:[]};books.push(book);character.activeWorldBookId=book.id;persistRoleChatSettings();redraw()};
 const fileInput=panel.querySelector('[data-role-worldbook-file]'),status=panel.querySelector('[data-role-worldbook-status]');
 panel.querySelector('[data-role-worldbook-import]')?.addEventListener('click',()=>fileInput.click());
 fileInput.onchange=async()=>{const file=fileInput.files?.[0];if(!file)return;status.textContent='正在读取世界书……';try{const entries=await parseGlobalWorldBookFile(file),book={id:'role-world-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),name:file.name.replace(/\\.[^.]+$/,'')||'导入的世界书',entries};books.push(book);character.activeWorldBookId=book.id;persistRoleChatSettings();redraw();const next=panel.querySelector('[data-role-worldbook-status]');if(next)next.textContent='已导入 '+entries.length+' 条世界书内容。'}catch(error){status.textContent=error.message||'导入失败，请检查文件内容。'}finally{fileInput.value=''}};
 const entryForm=panel.querySelector('[data-role-worldbook-entry-form]');
 panel.querySelector('[data-role-worldbook-add-entry]')?.addEventListener('click',()=>{entryForm.reset();delete entryForm.dataset.entryIndex;entryForm.hidden=false;entryForm.elements.name.focus()});
 panel.querySelector('[data-role-worldbook-entry-cancel]')?.addEventListener('click',()=>{entryForm.hidden=true;delete entryForm.dataset.entryIndex});
 panel.querySelectorAll('[data-role-worldbook-edit]').forEach(button=>button.onclick=()=>{const index=Number(button.dataset.roleWorldbookEdit),entry=current().entries[index];if(!entry)return;entryForm.dataset.entryIndex=String(index);entryForm.elements.name.value=entry.name||'';entryForm.elements.keys.value=(entry.keys||[]).join(', ');entryForm.elements.content.value=entry.content||'';entryForm.hidden=false;entryForm.elements.name.focus()});
 panel.querySelectorAll('[data-role-worldbook-delete]').forEach(button=>button.onclick=()=>{if(!window.confirm('删除这条世界书条目？'))return;current().entries.splice(Number(button.dataset.roleWorldbookDelete),1);persistRoleChatSettings();redraw()});
 panel.querySelectorAll('[data-worldbook-entry]').forEach(input=>input.onchange=()=>{const entry=current().entries[Number(input.dataset.worldbookEntry)];if(!entry)return;entry.enabled=input.checked;persistRoleChatSettings()});
 entryForm.onsubmit=event=>{event.preventDefault();const book=current(),index=Number(entryForm.dataset.entryIndex),old=Number.isInteger(index)?book.entries[index]:null,entry={name:entryForm.elements.name.value.trim(),keys:entryForm.elements.keys.value.split(',').map(value=>value.trim()).filter(Boolean),content:entryForm.elements.content.value.trim(),enabled:old?.enabled!==false};if(Number.isInteger(index))book.entries[index]=entry;else book.entries.push(entry);persistRoleChatSettings();redraw()};
}
let activeSmsThread=null,activeSmsMessageActionIndex=null,smsSelectionThreadKey='',smsSelectedMessageIndices=new Set(),smsClearMenuOpen=false,smsLongPressTimer=null,smsLongPressStart=null,smsLongPressDidTrigger=false;
const smsReplyInFlight=new Set();
const blockedSmsRequests=new Map();
const smsNotificationQueue=[];
let smsNotificationTimer=null,smsNotificationActive=false;
function showSmsNotification(roleIndex,userIndex,message){
 const character=chars[roleIndex];if(!character)return;
 smsNotificationQueue.push({roleIndex,userIndex,text:message.text,createdAt:message.createdAt,name:character.name,phoneNumber:character.phoneNumber,avatar:avatar(character)});
 if(!smsNotificationActive)displayNextSmsNotification();
}
function dismissSmsNotification(){clearTimeout(smsNotificationTimer);$('#smsNotification')?.remove();smsNotificationActive=false;displayNextSmsNotification()}
function displayNextSmsNotification(){
 if(smsNotificationActive)return;
 const next=smsNotificationQueue[0];
 if(next&&chatReplyInFlight.has(`${next.roleIndex}-${next.userIndex}-chat`))return;
 const item=smsNotificationQueue.shift();if(!item)return;smsNotificationActive=true;
 const banner=document.createElement('section');banner.id='smsNotification';banner.className='sms-notification';banner.setAttribute('aria-label','新短信');
 banner.innerHTML=`<button type="button" class="sms-notification-open" aria-label="查看来自${esc(item.name||item.phoneNumber)}的短信">${item.avatar}<span class="sms-notification-copy"><span class="sms-notification-heading"><strong>${esc(item.phoneNumber)}</strong><time>${esc(smsMessageTime(item.createdAt))}</time></span><span class="sms-notification-name">${esc(item.name||'')} · SMS</span><span class="sms-notification-text" role="status">${esc(item.text||'')}</span></span></button><button type="button" class="sms-notification-dismiss" aria-label="关闭短信通知">×</button>`;
 $('.phone').append(banner);
 banner.querySelector('.sms-notification-open').onclick=()=>{if(!chars[item.roleIndex]||!state.users[item.userIndex]){dismissSmsNotification();return}smsNotificationQueue.length=0;dismissSmsNotification();state.user=item.userIndex;save();openFeaturePage('sms');openSmsThread(item.roleIndex,item.userIndex)};
 banner.querySelector('.sms-notification-dismiss').onclick=dismissSmsNotification;
 smsNotificationTimer=setTimeout(dismissSmsNotification,6500);
}
function smsThreadKey(roleIndex,userIndex){return`${roleIndex}-${userIndex}`}
function remapSmsThreadsForRoleDeletion(deletedIndex){const next={};for(const[id,thread]of Object.entries(state.smsMessages||{})){const match=id.match(/^(\d+)-(\d+)$/);if(!match){next[id]=thread;continue}const roleIndex=Number(match[1]),userIndex=Number(match[2]);if(roleIndex===deletedIndex)continue;next[`${roleIndex>deletedIndex?roleIndex-1:roleIndex}-${userIndex}`]=thread}state.smsMessages=next}
function remapSmsThreadsForUserDeletion(deletedIndex){const next={};for(const[id,thread]of Object.entries(state.smsMessages||{})){const match=id.match(/^(\d+)-(\d+)$/);if(!match){next[id]=thread;continue}const roleIndex=Number(match[1]),userIndex=Number(match[2]);if(userIndex===deletedIndex)continue;next[`${roleIndex}-${userIndex>deletedIndex?userIndex-1:userIndex}`]=thread}state.smsMessages=next}
function smsThreadMessages(roleIndex,userIndex){const id=smsThreadKey(roleIndex,userIndex);return state.smsMessages[id]||(state.smsMessages[id]=[])}
function hasCompletedBlockedSms(roleIndex,userIndex,blockEvent){
 const settings=chars[roleIndex]?.chatSettings;if(!settings)return false;
 const receipt=settings.blockedSmsReceipt;
 const delivered=(state.smsMessages[smsThreadKey(roleIndex,userIndex)]||[]).some(message=>!message.mine&&String(message.text||'').trim()&&(Number(message.createdAt)||0)>=blockEvent);
 if(receipt?.blockEvent===blockEvent&&receipt.userIndex===userIndex&&delivered)return true;
 if(settings.blockedSmsCompletedAt===blockEvent&&delivered){settings.blockedSmsReceipt={blockEvent,userIndex,deliveredAt:Date.now()};save();return true}
 return false;
}
function smsUserIndexForRole(roleIndex){const selected=chars[roleIndex]?.chatSettings?.userIndex;return Number.isInteger(selected)&&state.users[selected]?selected:(state.users[state.user]?state.user:null)}
function smsContacts(){return chars.map((character,roleIndex)=>({character,roleIndex,userIndex:smsUserIndexForRole(roleIndex)})).filter(contact=>contact.character?.phoneNumber&&contact.userIndex===state.user)}
function crossChannelMemoryContext(roleIndex,userIndex,targetChannel,excludeLatestOnlineTurn=false){
 const role=chars[roleIndex];if(!role)return'';
 const roleSettings=role.chatSettings||{},memory=roleSettings.memory||{},entries=Array.isArray(memory.entries)?memory.entries.filter(entry=>entry.scope==='online'||entry.scope==='shared').slice(0,Math.max(0,Number(memory.recentLongCount)||5)):[];
 let onlineThread=state.messages[`${roleIndex}-${userIndex}-chat`]||[];
 if(excludeLatestOnlineTurn){const lastUser=onlineThread.findLastIndex(message=>message.mine);if(lastUser>=0)onlineThread=onlineThread.slice(0,lastUser)}
 const online=onlineThread.filter(message=>!message.deliveryFailed&&message.type!=='call-summary'&&String(message.text||'').trim()).slice(-12).map(message=>`${message.mine?'用户':role.name||'角色'}：${String(message.text).trim().slice(0,700)}`);
 const sms=smsThreadMessages(roleIndex,userIndex).filter(message=>String(message.text||'').trim()).slice(-12).map(message=>`${message.mine?'用户':role.name||'角色'}：${String(message.text).trim().slice(0,700)}`);
 const sections=[];
 if(targetChannel==='sms'){
  if(roleSettings.userExperience)sections.push(`双方经历与关系补充：\n${roleSettings.userExperience}`);
  if(memory.enabled&&memory.summaryText)sections.push(`线上长期记忆摘要：\n${memory.summaryText}`);
  if(memory.enabled&&entries.length)sections.push(`线上与共同记忆条目：\n${entries.map(entry=>`- ${entry.title||'记忆'}：${entry.content||''}`).join('\n')}`);
  if(online.length)sections.push(`最近线上聊天（发送失败的内容已略去）：\n${online.join('\n')}`);
 }else if(sms.length)sections.push(`最近短信往来：\n${sms.join('\n')}`);
 return sections.length?`【跨渠道记忆参考】\n线上聊天与短信属于不同渠道。以下内容只用于延续共同事实和关系，不代表角色能知道消息是否已读；不要把另一渠道的内容说成当前渠道刚发生的内容。\n${sections.join('\n\n')}`:'';
}
function smsMessageTime(timestamp){if(!timestamp)return'';return new Intl.DateTimeFormat('zh-CN',{hour:'2-digit',minute:'2-digit'}).format(new Date(timestamp))}
const smsReactions=[['heart','♥'],['like','赞'],['dislike','踩'],['hug','抱抱'],['exclaim','惊讶'],['question','疑问']];
function smsReactionIcon(key){const artwork={heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>',like:'<path d="M7 10v12H4V10h3Zm3 12h7.4a2 2 0 0 0 2-1.7l1.2-7a2 2 0 0 0-2-2.3H13l.8-4.1A2.5 2.5 0 0 0 11.4 4L7 10v12Z"/>',hug:'<path d="M12 20s-7-4.2-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.8-7 9-7 9Z"/><path d="M20 4v4m-2-2h4"/>',exclaim:'<path d="M8 4v9m0 4v.01M16 4v9m0 4v.01" stroke-linecap="round" stroke-width="3"/>',question:'<path d="M9.6 9a2.5 2.5 0 1 1 4.4 1.6c-1.1 1.1-2 1.4-2 3.4m0 3v.01" stroke-linecap="round" stroke-width="2.5"/>'};const body=key==='dislike'?`<g transform="rotate(180 12 12)">${artwork.like}</g>`:artwork[key]||artwork.heart;return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`}
function renderSmsReaction(message,index){if(!message.reaction)return'';const reaction=smsReactions.find(([key])=>key===message.reaction);if(!reaction)return'';return `<button type="button" class="sms-message-reaction ${message.reaction==='like'?'is-like':''}" data-sms-reaction="${index}" aria-label="移除反应">${smsReactionIcon(message.reaction)}</button>`}
function renderSmsFailureState(roleIndex,userIndex){
 const settings=chars[roleIndex]?.chatSettings;if(!settings?.blocked||!settings.blockedSmsError||hasCompletedBlockedSms(roleIndex,userIndex,Number(settings.blockedAt)||0))return'';
 return `<div class="sms-send-error" role="status"><span><strong>${esc(chars[roleIndex]?.name||'角色')} · 短信未发送</strong><small>${esc(settings.blockedSmsError)}</small></span><button type="button" data-sms-retry-blocked="${roleIndex}" data-sms-retry-user="${userIndex}">${icon('reply')}<span>重试</span></button></div>`;
}
function renderSmsInbox(){
 const contacts=smsContacts().sort((a,b)=>{const am=smsThreadMessages(a.roleIndex,a.userIndex),bm=smsThreadMessages(b.roleIndex,b.userIndex);return(Number(bm.at(-1)?.createdAt)||0)-(Number(am.at(-1)?.createdAt)||0)});
 return `<section class="sms-inbox"><p class="feature-page-kicker">MESSAGES</p>${chars.map((character,roleIndex)=>smsUserIndexForRole(roleIndex)===state.user?renderSmsFailureState(roleIndex,state.user):'').join('')}${contacts.length?`<div class="sms-contact-list">${contacts.map(({character,roleIndex,userIndex})=>{const thread=smsThreadMessages(roleIndex,userIndex),last=thread.at(-1),preview=last?`${last.mine?'我：':''}${last.text||''}`:'开始短信对话';return `<button type="button" class="sms-contact-row" data-sms-open="${roleIndex}" data-sms-user="${userIndex}">${avatar(character)}<span class="sms-contact-copy"><strong>${esc(character.name||'未命名角色')}<small>${esc([character.phoneCarrier,character.phoneNumber].filter(Boolean).join(' '))}</small></strong><span>${esc(preview)}</span></span><time>${esc(smsMessageTime(last?.createdAt))}</time>${icon('arrow')}</button>`}).join('')}</div>`:`<div class="sms-empty"><span>${icon('dockSms')}</span><strong>当前用户还没有绑定可短信联系的角色</strong><p>为角色绑定当前用户并开通号码后，对方就会显示在这里。</p></div>`}</section>`
}
function renderSmsMessageActions(message,index){
 if(activeSmsMessageActionIndex!==index)return '';
 return `<div class="sms-message-actions" aria-label="短信操作菜单"><div class="sms-reaction-picker" role="toolbar" aria-label="添加反应">${smsReactions.map(([reaction,label])=>`<button type="button" data-sms-reaction-choice="${reaction}" data-sms-index="${index}" aria-label="${label}" aria-pressed="${message.reaction===reaction}" title="${label}" class="${message.reaction===reaction?'is-active':''}">${smsReactionIcon(reaction)}</button>`).join('')}</div><div class="sms-action-row" role="toolbar" aria-label="短信操作">${[['edit','编辑'],['copy','拷贝'],['translate','翻译'],['delete','删除']].map(([action,label])=>`<button type="button" data-sms-action="${action}" data-sms-index="${index}">${label}</button>`).join('')}</div><button type="button" class="sms-select-action" data-sms-action="select" data-sms-index="${index}">多选</button></div>`;
}
function positionSmsMessageActions(){
 const menu=$('.sms-message-actions'),row=menu?.closest('.sms-bubble-row'),box=row?.closest('[data-sms-messages]');
 if(!menu||!row||!box)return;
 const bubble=row.querySelector('.sms-bubble').getBoundingClientRect(),bounds=box.getBoundingClientRect();
 const width=menu.offsetWidth,height=menu.offsetHeight,left=row.classList.contains('is-mine')?bubble.right-width:bubble.left;
 const top=bubble.top-height-8>=bounds.top?bubble.top-height-8:bubble.bottom+8;
 menu.style.left=`${Math.max(bounds.left,Math.min(left,bounds.right-width))}px`;
 menu.style.top=`${Math.max(bounds.top+4,Math.min(top,bounds.bottom-height-4))}px`;
 menu.style.visibility=bubble.bottom<bounds.top||bubble.top>bounds.bottom?'hidden':'visible';
}
function renderSmsThreadView(roleIndex,userIndex){
 const character=chars[roleIndex],user=state.users[userIndex],thread=smsThreadMessages(roleIndex,userIndex),id=smsThreadKey(roleIndex,userIndex),typing=smsReplyInFlight.has(id);
 if(!character||!user||!character.phoneNumber)return renderSmsInbox();
 const canReply=thread.some(message=>message.mine),selecting=smsSelectionThreadKey===id;
 const rows=thread.map((message,index)=>`<article class="sms-bubble-row ${message.mine?'is-mine':''} ${activeSmsMessageActionIndex===index?'has-sms-actions':''} ${selecting&&smsSelectedMessageIndices.has(index)?'is-sms-selected':''}" data-sms-index="${index}">${renderSmsMessageActions(message,index)}<div class="sms-bubble">${renderSmsReaction(message,index)}${esc(message.text||'')}${message.translation&&message.showTranslation!==false?`<small>${esc(message.translation)}</small>`:''}</div>${selecting?`<span class="sms-selection-check" aria-hidden="true">${smsSelectedMessageIndices.has(index)?'✓':''}</span>`:''}<time>${esc(smsMessageTime(message.createdAt))}</time></article>`).join('');
 return `<section class="sms-thread-view ${selecting?'is-selecting':''}" data-sms-thread="${id}"><div class="sms-thread-messages" data-sms-messages>${rows}${typing?'<div class="sms-bubble-row"><div class="sms-bubble sms-typing" aria-label="正在输入"><i></i><i></i><i></i></div></div>':''}${thread.length?'':'<p class="sms-thread-empty">给对方发一条短信，开始对话。</p>'}</div>${renderSmsFailureState(roleIndex,userIndex)}${selecting?`<div class="sms-selection-bar"><span>已选 ${smsSelectedMessageIndices.size} 条</span><button type="button" data-sms-selection-cancel>取消</button><button type="button" data-sms-selection-delete ${smsSelectedMessageIndices.size?'':'disabled'}>删除所选</button></div>`:''}<form class="sms-composer"><button type="button" class="sms-attach" aria-label="附件" aria-expanded="${smsClearMenuOpen}" ${typing||selecting?'disabled':''}>${icon('plus')}</button><div class="sms-attach-menu" ${smsClearMenuOpen?'':'hidden'}><button type="button" class="quick-action-item is-destructive sms-clear-item" data-sms-clear aria-label="Clear" ${thread.length?'':'disabled'}><span class="quick-icon">${icon('trash')}</span><span>Clear</span></button></div><div class="sms-composer-field"><textarea name="text" rows="1" maxlength="3000" placeholder="短信" aria-label="短信内容" ${typing||selecting?'disabled':''}></textarea><button type="submit" class="sms-send" aria-label="发送短信" ${typing||selecting?'disabled':''} hidden>${icon('send')}</button></div><button type="button" class="sms-reply" aria-label="回复或重新生成" title="回复 / 重roll" ${typing||!canReply||selecting?'disabled':''}>${icon('reply')}</button></form></section>`;
}
function smsMessagePayload(answer,bilingual){
 const raw=String(answer||'').trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');let data=null;
 try{data=JSON.parse(raw)}catch{}
 let items=Array.isArray(data?.messages)?data.messages:(data?.text?[data]:[{text:raw}]);
 return expandOnlineReplyMessages(items.map(item=>({text:String(typeof item==='string'?item:item?.text||'').trim(),translation:bilingual&&typeof item==='object'?String(item.translation||'').trim():'',mine:false})).filter(item=>item.text)).slice(0,12)
}
async function requestSmsRoleReply({roleIndex,userIndex,proactive=false,failedMessages=[],reroll=false}){
 const character=chars[roleIndex],user=state.users[userIndex];if(!character||!user)throw Error('短信联系人或用户不存在');if(!character.phoneNumber)throw Error('请先为角色开通短信号码');
 const config=apiConfigForFeature('sms'),model=apiModelForFeature('sms',config);if(!config?.url||!config?.key||!model)throw Error('请先在总设置中连接短信 API');
 const thread=smsThreadMessages(roleIndex,userIndex),lastUserIndex=reroll?[...thread].map((item,index)=>item.mine?index:-1).filter(index=>index>=0).at(-1):-1,contextThread=reroll&&lastUserIndex>=0?thread.slice(0,lastUserIndex+1):thread;
 const roleSettings=character.chatSettings||{},more=roleSettings.more||defaultOnlineMore,timeAware=more.timeAwarenessEnabled!==false,holidayAware=more.holidayAwarenessEnabled===true||(more.holidayAwarenessEnabled===undefined&&more.actualTimeEnabled===true),bilingual=Boolean(more.bilingual),targetLang=more.targetLang||'zh-Hans';
 const recent=contextThread.slice(-30).map(item=>`${timeAware&&Number(item.createdAt)?`[${zonedDateTime(new Date(item.createdAt),more.timezoneEnabled?more.characterTimezone:localTimezone)}] `:''}${item.mine?(user.nickname||user.name||'用户'):character.name||'角色'}：${item.text||''}`).join('\n')||'暂无短信往来。';
 const temporalContext=timeAware||holidayAware?await actualTimePromptContext(config,model,thread,more):'';
 const crossChannelContext=crossChannelMemoryContext(roleIndex,userIndex,'sms',proactive);
 const smsChatInstructions=`【短信聊天】
短信是独立于线上聊天的私人通讯渠道，既可用于日常交流，也可用于原聊天渠道被拉黑后的联系。角色应依据人设、双方关系、已有经历及当前情境自然使用短信，不将短信默认视为挽回、告白或情感宣泄工具。

1.【日常短信】
角色可以通过短信闲聊、询问、通知、分享生活、讨论事情、争吵或主动联系用户。内容与语气符合个人习惯，不刻意制造暧昧、冲突或特殊意义。

2.【拉黑后的反应】
当角色发现原聊天渠道被拉黑时，应根据其性格、关系与当下情绪决定是否通过短信联系。允许愤怒、困惑、委屈、冷漠、嘲讽、道歉、质问、试探或不予理会，不默认角色必须挽回、认错或持续纠缠。只有当情境明确告知角色已发现自己被拉黑，或角色有充分依据确认这一事实时，才进入拉黑后的反应；未收到回复、等待时间较长或消息状态不明，都不能单独作为判断依据。

3.【人格一致性】
拉黑不会自动改变角色的人格。骄傲者不必卑微，冷淡者不必失控，嘴贱者不必突然深情，成熟者不必说教。原设爱骂人、控制欲强或情绪激烈的角色可保留相应表现，但不为制造戏剧性而擅自放大。

4.【独立意志】
角色有自己的生活、情绪、立场与目的，不以获得用户回复为唯一目标。可以主动联系，也可以停止发送、转移注意或选择等待，不强制维系关系。

5.【短信语言】
使用自然、简洁且符合人物习惯的私人通讯语言。允许短句、分条发送、口语、省略、错别字、玩笑、冷场及情绪化表达，但不刻意堆砌网络梗、标点或长篇独白。

6.【情境连续性】
自然延续已知事实、人物认知、关系状态及既有约定。角色不能无依据地知道短信是否被阅读、用户正在做什么或用户为何拉黑自己。允许误解、猜测、撒谎及临时改变想法，但不得将猜测直接当成事实。

7.【渠道意识】
角色应区分线上聊天与短信。被拉黑的是原聊天渠道，不代表短信自动被拉黑。短信可以正常收发时，角色不必反复强调自己换了渠道，也不必每条消息都提及拉黑事件。

【核心原则】
短信首先是自然的私人交流，其次才是特殊情境下的联系渠道。角色如何联系、说些什么、是否继续发送，取决于人物本身，而不是固定的挽回、纠缠或情感推进模板。`;
 const task=proactive?`你正在扮演${character.name||'角色'}，通过短信主动联系${user.nickname||user.name||'用户'}。当前情境已明确告知你：你发现自己的线上消息无法送达，且对方已拉黑你。本次已决定通过短信联系对方，请按人物设定生成实际发送的短信；本次短信是角色主动发出的内容，不是对用户刚发线上消息的回复，不要复述或猜测那条线上消息。结合短信记录保持连续。`:`你正在扮演${character.name||'角色'}，通过短信和${user.nickname||user.name||'用户'}交流。根据角色设定和短信上下文自然回复用户最新发来的短信；不要写旁白，不要把短信写成线上聊天气泡。`;
 const format=`只返回 JSON：{"messages":[{"text":"一条短信","translation":"译文；未开启双语时留空"}]}。每个 messages 项只写一句独立完整的话；同话题的补充和追问也要拆成不同项，不要把多句话塞进一条短信。messages 必须至少包含一条非空短信，通常发送 1 至 3 条，按情境自然决定。${bilingual?`双语开启：每条短信都必须同时提供原文 text 和${targetLang}译文 translation。`:'双语关闭：translation 留空。'}不要提及 API、系统或提示词。`;
 const system=[smsChatInstructions,task,format].join('\n\n');
 const context=`角色资料：${character.details||character.desc||'暂无补充'}\n角色所在地：${characterResidence(character)||'未设定'}\n短信号码：${character.phoneCarrier||''} ${character.phoneNumber}\n用户姓名：${user.name||'用户'}\n用户昵称：${user.nickname||''}\n${temporalContext?`${temporalContext}\n`:''}已有短信记录：\n${recent}${crossChannelContext?`\n\n${crossChannelContext}`:''}${proactive?`\n角色刚才未能送达的线上消息（仅供理解角色自己的行为，不是用户发来的内容）：\n${failedMessages.map(item=>`${character.name||'角色'}：${item.text||''}`).join('\n')||'（空）'}\n注意：本次主动短信不得回应任何用户刚发的线上内容；跨渠道记忆只提供此前的共同经历，当前线上回复的内容仅作为角色自己的行为参考。`:''}`;
 const base=config.url.replace(/\/+$/,'').replace(/\/chat\/completions$/,'');const response=await fetch(`${base}/chat/completions`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${config.key}`},body:JSON.stringify({model,messages:[{role:'system',content:system},{role:'user',content:context}]})});if(!response.ok)throw Error(`短信 API 请求失败（${response.status}）`);
 const result=await response.json();let answer=result.choices?.[0]?.message?.content;if(Array.isArray(answer))answer=answer.map(part=>part.text||'').join('');const generated=smsMessagePayload(answer,bilingual);if(!generated.length)throw Error('短信 API 没有返回可显示的内容');if(reroll&&lastUserIndex>=0)thread.splice(lastUserIndex+1);
 save();if(activeFeaturePage==='sms')renderFeaturePage('sms');
 for(const message of generated){
  await new Promise(resolve=>setTimeout(resolve,replyTypingDuration(message)));
  message.createdAt=Date.now();thread.push(message);save();
  if(activeFeaturePage==='sms')renderFeaturePage('sms');
  if(activeFeaturePage!=='sms'||activeSmsThread?.roleIndex!==roleIndex||activeSmsThread?.userIndex!==userIndex)showSmsNotification(roleIndex,userIndex,message);
 }
 return true
}
function sendBlockedProactiveSms({roleIndex,userIndex,failedMessages,blockEvent=Number(chars[roleIndex]?.chatSettings?.blockedAt)||0}){
 const character=chars[roleIndex],settings=character?.chatSettings,id=smsThreadKey(roleIndex,userIndex),requestId=`${id}-${blockEvent}`;
 if(!settings?.blocked||hasCompletedBlockedSms(roleIndex,userIndex,blockEvent))return Promise.resolve(false);
 if(blockedSmsRequests.has(requestId))return blockedSmsRequests.get(requestId);
 const request=(async()=>{
  while(smsReplyInFlight.has(id)||chatReplyInFlight.has(`${roleIndex}-${userIndex}-chat`))await new Promise(resolve=>setTimeout(resolve,100));
  if(!settings.blocked||(Number(settings.blockedAt)||0)!==blockEvent)return false;
  delete settings.blockedSmsError;smsReplyInFlight.add(id);save();
  try{
   if(activeFeaturePage==='sms'&&activeSmsThread?.roleIndex===roleIndex&&activeSmsThread?.userIndex===userIndex)renderFeaturePage('sms');
   const sent=await requestSmsRoleReply({roleIndex,userIndex,proactive:true,failedMessages});
   if(sent){settings.blockedSmsCompletedAt=blockEvent;settings.blockedSmsReceipt={blockEvent,userIndex,deliveredAt:Date.now()};delete settings.blockedSmsError;if(settings.blockedSmsPending?.blockEvent===blockEvent)delete settings.blockedSmsPending;save()}
   return sent;
  }catch(error){settings.blockedSmsError=error.message||'短信发送失败';save();toast(settings.blockedSmsError);return false}
  finally{smsReplyInFlight.delete(id);if(activeFeaturePage==='sms')renderFeaturePage('sms')}
 })();
 blockedSmsRequests.set(requestId,request);request.then(()=>blockedSmsRequests.delete(requestId),()=>blockedSmsRequests.delete(requestId));return request;
}
function resumeBlockedProactiveSms(roleIndex,userIndex){
 const settings=chars[roleIndex]?.chatSettings,blockEvent=Number(settings?.blockedAt)||0;
 if(!settings?.blocked||hasCompletedBlockedSms(roleIndex,userIndex,blockEvent))return;
 const pending=settings.blockedSmsPending;if(pending?.blockEvent===blockEvent&&pending.userIndex===userIndex){void sendBlockedProactiveSms({roleIndex,...pending});return}
 const thread=state.messages[`${roleIndex}-${userIndex}-chat`]||[],failedMessages=thread.filter(message=>!message.mine&&message.deliveryFailed&&(Number(message.deliveryFailedAt)||0)>=blockEvent);
 if(failedMessages.length)void sendBlockedProactiveSms({roleIndex,userIndex,blockEvent,failedMessages:cloneReplyMessages(failedMessages.slice(-12))});
}
function openSmsThread(roleIndex,userIndex){activeSmsThread={roleIndex,userIndex};activeSmsMessageActionIndex=null;smsSelectionThreadKey='';smsSelectedMessageIndices.clear();smsClearMenuOpen=false;renderFeaturePage('sms');resumeBlockedProactiveSms(roleIndex,userIndex)}
function openSmsMessageEditor(index){if(!activeSmsThread)return;const{roleIndex,userIndex}=activeSmsThread,message=smsThreadMessages(roleIndex,userIndex)[index];if(!message)return;const original=String(message.text||''),translation=String(message.translation||'');sheet('编辑短信','修改后会更新短信记录',`<form id="smsMessageEditForm" class="message-edit-form"><label>短信内容<textarea name="text" rows="5" maxlength="3000" required>${esc(original)}</textarea></label>${translation?`<label>译文<textarea name="translation" rows="2" maxlength="3000">${esc(translation)}</textarea></label>`:''}<button class="primary" type="submit">保存修改</button></form>`,{centered:true});$('#sheet').classList.add('is-message-edit');$('#smsMessageEditForm').onsubmit=event=>{event.preventDefault();const form=event.currentTarget,current=smsThreadMessages(roleIndex,userIndex)[index],next=form.elements.text.value.trim();if(!current||!next){toast('短信内容不能为空');return}current.text=next;if(translation)current.translation=form.elements.translation.value.trim();activeSmsMessageActionIndex=null;closeSheet();save();renderFeaturePage('sms');toast('短信已更新')}}
async function translateSmsMessage(index){if(!activeSmsThread)return;const{roleIndex,userIndex}=activeSmsThread,message=smsThreadMessages(roleIndex,userIndex)[index];if(!message)return;if(message.translation){message.showTranslation=!message.showTranslation;save();renderFeaturePage('sms');return}const config=apiConfigForFeature('onlineChat'),model=apiModelForFeature('onlineChat',config);if(!config?.url||!config?.key||!model){toast('请先在总设置中连接聊天 API');return}const character=chars[roleIndex],targetLang=character?.chatSettings?.more?.targetLang||'简体中文';const button=$(`[data-sms-action="translate"][data-sms-index="${index}"]`);if(button)button.disabled=true;try{const base=config.url.replace(/\/+$/,'').replace(/\/chat\/completions$/,'');const response=await fetch(`${base}/chat/completions`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${config.key}`},body:JSON.stringify({model,messages:[{role:'system',content:`把用户给出的短信翻译成${targetLang}。只输出译文，不要解释或加引号。`},{role:'user',content:message.text||''}]})});if(!response.ok)throw Error(`翻译请求失败（${response.status}）`);const result=await response.json();let translated=result.choices?.[0]?.message?.content;if(Array.isArray(translated))translated=translated.map(part=>part.text||'').join('');translated=String(translated||'').trim();if(!translated)throw Error('没有获得译文');message.translation=translated;message.showTranslation=true;save();activeSmsMessageActionIndex=null;renderFeaturePage('sms')}catch(error){toast(error.message||'短信翻译失败');if(button)button.disabled=false}}
function bindSmsPage(){
 const content=$('#featurePageContent');
 content.querySelectorAll('[data-sms-open]').forEach(button=>button.onclick=()=>openSmsThread(Number(button.dataset.smsOpen),Number(button.dataset.smsUser)));
 if(!document.documentElement.dataset.smsActionDismiss){
  document.documentElement.dataset.smsActionDismiss='true';window.addEventListener('resize',positionSmsMessageActions);
  document.addEventListener('click',event=>{
   const target=event.target instanceof Element?event.target:null;
   if(activeSmsMessageActionIndex!==null&&!target?.closest('.sms-message-actions')){activeSmsMessageActionIndex=null;if(activeFeaturePage==='sms'&&activeSmsThread)renderFeaturePage('sms')}
   if(smsClearMenuOpen&&!target?.closest('.sms-attach,.sms-attach-menu')){smsClearMenuOpen=false;if(activeFeaturePage==='sms'&&activeSmsThread)renderFeaturePage('sms')}
  });
 }
 const userToggle=$('#smsUserToggle'),userMenu=$('#smsUserMenu');
 if(userToggle&&userMenu){
  userToggle.onclick=event=>{event.stopPropagation();userMenu.hidden=!userMenu.hidden;if(!userMenu.hidden){const bounds=userToggle.getBoundingClientRect(),menuMaxHeight=Math.min(window.innerHeight*.55,360);userMenu.style.top=`${Math.max(12,Math.min(bounds.bottom+8,window.innerHeight-menuMaxHeight-12))}px`;userMenu.style.right=`${Math.max(12,window.innerWidth-bounds.right)}px`;setTimeout(()=>{const closeMenu=event=>{if(!userMenu.contains(event.target)&&!userToggle.contains(event.target))userMenu.hidden=true;document.removeEventListener('pointerdown',closeMenu)};document.addEventListener('pointerdown',closeMenu)},0)}};
  userMenu?.querySelectorAll('[data-sms-user-select]').forEach(button=>button.onclick=()=>{const index=Number(button.dataset.smsUserSelect);if(!state.users[index])return;state.user=index;activeSmsThread=null;activeSmsMessageActionIndex=null;smsSelectionThreadKey='';smsSelectedMessageIndices.clear();smsClearMenuOpen=false;save();renderFeaturePage('sms')});
 }
 content.querySelectorAll('[data-sms-retry-blocked]').forEach(button=>button.onclick=()=>{button.disabled=true;resumeBlockedProactiveSms(Number(button.dataset.smsRetryBlocked),Number(button.dataset.smsRetryUser))});
 const form=content.querySelector('.sms-composer');if(!form)return;
 const textBox=form.elements.text,sendButton=form.querySelector('.sms-send'),replyButton=form.querySelector('.sms-reply');
 const syncComposer=()=>{const hasText=Boolean(textBox.value.trim());sendButton.hidden=!hasText;textBox.style.height='auto';textBox.style.height=`${Math.min(104,Math.max(38,textBox.scrollHeight))}px`};
 textBox.addEventListener('input',syncComposer);syncComposer();
 form.onsubmit=event=>{event.preventDefault();const text=textBox.value.trim();if(!text||!activeSmsThread)return;const{roleIndex,userIndex}=activeSmsThread;smsThreadMessages(roleIndex,userIndex).push({mine:true,text,createdAt:Date.now()});textBox.value='';save();renderFeaturePage('sms');const nextInput=$('#featurePageContent .sms-composer textarea[name="text"]');nextInput?.focus({preventScroll:true})};
 textBox.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();form.requestSubmit()}});
 if(replyButton)replyButton.onclick=()=>{if(!activeSmsThread)return;const{roleIndex,userIndex}=activeSmsThread,id=smsThreadKey(roleIndex,userIndex);if(smsReplyInFlight.has(id))return;smsReplyInFlight.add(id);renderFeaturePage('sms');void requestSmsRoleReply({roleIndex,userIndex,reroll:true}).catch(error=>toast(error.message||'短信回复失败')).finally(()=>{smsReplyInFlight.delete(id);if(activeFeaturePage==='sms'&&activeSmsThread?.roleIndex===roleIndex&&activeSmsThread?.userIndex===userIndex)renderFeaturePage('sms')})};
 const messageBox=content.querySelector('[data-sms-messages]');if(!messageBox)return;
 messageBox.scrollTop=messageBox.scrollHeight;
 if(content.dataset.smsActionsBound)return;
 content.dataset.smsActionsBound='true';
 const cancelPress=()=>{clearTimeout(smsLongPressTimer);smsLongPressTimer=null;smsLongPressStart=null};
 content.addEventListener('pointerdown',event=>{smsLongPressDidTrigger=false;const target=event.target instanceof Element?event.target:null,row=target?.closest('.sms-bubble-row[data-sms-index]');if(!row||target.closest('button,a,input,textarea')||smsSelectionThreadKey===smsThreadKey(activeSmsThread.roleIndex,activeSmsThread.userIndex))return;cancelPress();smsLongPressStart={x:event.clientX,y:event.clientY,index:Number(row.dataset.smsIndex)};smsLongPressTimer=setTimeout(()=>{activeSmsMessageActionIndex=smsLongPressStart?.index??null;smsLongPressDidTrigger=true;smsLongPressStart=null;smsLongPressTimer=null;renderFeaturePage('sms')},520)});
 content.addEventListener('pointermove',event=>{if(smsLongPressStart&&Math.hypot(event.clientX-smsLongPressStart.x,event.clientY-smsLongPressStart.y)>10)cancelPress()},{passive:true});
 ['pointerup','pointercancel','pointerleave'].forEach(type=>content.addEventListener(type,cancelPress,{passive:true}));
 content.addEventListener('contextmenu',event=>{const target=event.target instanceof Element?event.target:null,row=target?.closest('.sms-bubble-row[data-sms-index]');if(!row||target.closest('button,a,input,textarea')||smsSelectionThreadKey===smsThreadKey(activeSmsThread.roleIndex,activeSmsThread.userIndex))return;event.preventDefault();cancelPress();activeSmsMessageActionIndex=Number(row.dataset.smsIndex);renderFeaturePage('sms')});
 content.addEventListener('click',event=>{
  if(smsLongPressDidTrigger){smsLongPressDidTrigger=false;event.preventDefault();event.stopPropagation();return}
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  const clearButton=target.closest('[data-sms-clear]');
  if(clearButton){const thread=smsThreadMessages(activeSmsThread.roleIndex,activeSmsThread.userIndex);if(thread.length&&window.confirm('Clear all SMS messages in this conversation?')){thread.splice(0);smsClearMenuOpen=false;smsSelectionThreadKey='';smsSelectedMessageIndices.clear();save();renderFeaturePage('sms')}return}
  if(target.closest('.sms-attach')){smsClearMenuOpen=!smsClearMenuOpen;activeSmsMessageActionIndex=null;renderFeaturePage('sms');return}
  if(target.closest('[data-sms-selection-cancel]')){smsSelectionThreadKey='';smsSelectedMessageIndices.clear();renderFeaturePage('sms');return}
  if(target.closest('[data-sms-selection-delete]')){if(!smsSelectedMessageIndices.size)return;if(window.confirm(`Delete the ${smsSelectedMessageIndices.size} selected SMS messages?`)){const thread=smsThreadMessages(activeSmsThread.roleIndex,activeSmsThread.userIndex);[...smsSelectedMessageIndices].sort((a,b)=>b-a).forEach(index=>thread.splice(index,1));smsSelectionThreadKey='';smsSelectedMessageIndices.clear();activeSmsMessageActionIndex=null;save();renderFeaturePage('sms')}return}
  const row=target.closest('.sms-bubble-row[data-sms-index]');
  if(row&&smsSelectionThreadKey===smsThreadKey(activeSmsThread.roleIndex,activeSmsThread.userIndex)&&!target.closest('button,a,input,textarea')){const index=Number(row.dataset.smsIndex);if(smsSelectedMessageIndices.has(index))smsSelectedMessageIndices.delete(index);else smsSelectedMessageIndices.add(index);renderFeaturePage('sms');return}
  const choice=target.closest('[data-sms-reaction-choice]');
  if(choice){const thread=smsThreadMessages(activeSmsThread.roleIndex,activeSmsThread.userIndex),message=thread[Number(choice.dataset.smsIndex)];if(message){message.reaction=message.reaction===choice.dataset.smsReactionChoice?'':choice.dataset.smsReactionChoice;activeSmsMessageActionIndex=null;save();renderFeaturePage('sms')}return}
  const reaction=target.closest('[data-sms-reaction]');
  if(reaction){const message=smsThreadMessages(activeSmsThread.roleIndex,activeSmsThread.userIndex)[Number(reaction.dataset.smsReaction)];if(message){message.reaction='';save();renderFeaturePage('sms')}return}
  const action=target.closest('[data-sms-action]');
  if(action){const index=Number(action.dataset.smsIndex),kind=action.dataset.smsAction,thread=smsThreadMessages(activeSmsThread.roleIndex,activeSmsThread.userIndex),message=thread[index];if(!message)return;if(kind==='edit'){activeSmsMessageActionIndex=null;openSmsMessageEditor(index)}else if(kind==='copy'){void navigator.clipboard?.writeText(message.text||'').then(()=>toast('已拷贝短信')).catch(()=>toast('无法拷贝短信'));activeSmsMessageActionIndex=null;renderFeaturePage('sms')}else if(kind==='translate'){void translateSmsMessage(index)}else if(kind==='delete'){if(window.confirm('Delete this SMS message?')){thread.splice(index,1);activeSmsMessageActionIndex=null;save();renderFeaturePage('sms')}}else if(kind==='select'){smsSelectionThreadKey=smsThreadKey(activeSmsThread.roleIndex,activeSmsThread.userIndex);smsSelectedMessageIndices=new Set([index]);activeSmsMessageActionIndex=null;smsClearMenuOpen=false;renderFeaturePage('sms')}return}
  if(activeSmsMessageActionIndex!==null&&!target.closest('.sms-message-actions')){activeSmsMessageActionIndex=null;renderFeaturePage('sms')}
 });
}
function openFeaturePage(page){if(activeFeaturePage==='reading')window.IrisReading?.close();offlineExpandedStageFolds.clear();closeDockFeatures();closeSheet();$('#settingsScreen').hidden=true;activeFeaturePage=page;activeSmsThread=null;activeSmsMessageActionIndex=null;smsSelectionThreadKey='';smsSelectedMessageIndices.clear();smsClearMenuOpen=false;$('#featureScreen').hidden=false;try{renderFeaturePage(page);if(page==='sms')smsContacts().forEach(({roleIndex,userIndex})=>resumeBlockedProactiveSms(roleIndex,userIndex))}catch(error){console.error(`Feature page failed to render: ${page}`,error);const title=$('#featurePageTitle'),content=$('#featurePageContent');title.innerHTML=`<button type="button" class="feature-page-brand" id="featureBack" aria-label="返回聊天"><span class="feature-page-wordmark">${page==='worldbook'?'World Book':page==='beautify'?'Beautify':page==='forum'?'Forum':page==='market'?'Market':page==='business'?'Business':page==='reading'?'Reading':'SMS'}</span><small>打开失败</small></button>`;$('#featureBack').onclick=closeFeaturePage;content.innerHTML='<section class="feature-load-error" role="alert"><strong>页面暂时无法打开</strong><p>可以返回聊天后再重试。</p><button type="button" data-feature-retry>重试</button></section>';content.querySelector('[data-feature-retry]').onclick=()=>openFeaturePage(page)}}
function closeFeaturePage(){if(activeFeaturePage==='reading')window.IrisReading?.close();const wasSms=activeFeaturePage==='sms';$('#smsUserMenu')?.remove();if(wasSms){const boundUser=smsUserIndexForRole(state.char);if(Number.isInteger(boundUser))state.user=boundUser}activeFeaturePage=null;activeSmsThread=null;activeSmsMessageActionIndex=null;smsSelectionThreadKey='';smsSelectedMessageIndices.clear();smsClearMenuOpen=false;$('#featureScreen').hidden=true;if(wasSms){save();render()}}
let activeBeautifyTab='online';
const beautifyTabs=[['online','线上'],['offline','线下'],['forum','论坛'],['tutorial','教程']];
const beautifyDrafts={};
const beautifyRoots={online:'.phone:has(#conversation:not(.is-offline-story))',offline:'.phone:has(#conversation.is-offline-story)',forum:'#featureScreen:has(.forum-app)'};
const beautifyBackgroundRoots={online:'#conversation:not(.is-offline-story)',offline:'#conversation.is-offline-story'};
const beautifyExamples={online:'/* 气泡：背景与圆角 */\n.bubble {\n  background: #f2edf0;\n  border-radius: 18px;\n}\n\n/* 时间文字 */\n.message-time {\n  color: #999;\n}',offline:'/* 线下故事正文 */\n.offline-prose-body {\n  color: #555;\n  line-height: 1.9;\n}\n\n/* 故事标题 */\n.offline-prose-heading {\n  letter-spacing: 1px;\n}',forum:'/* 论坛帖子卡片 */\n.forum-post {\n  border-radius: 14px;\n  background: #faf8f7;\n}\n\n/* 帖子作者 */\n.forum-post-author {\n  color: #8c777f;\n}'};
const beautifyClassNames={
 online:'avatar bubble bubble-quote bubble-quote-speaker bubble-text bubble-translation call-summary-copy call-summary-kicker call-summary-link call-summary-message call-summary-open chat-gift-box chat-gift-caption chat-gift-detail chat-gift-image chat-gift-item-copy chat-gift-items chat-gift-line chat-gift-row chat-gift-unavailable chat-pat-card chat-pat-row conversation group-first group-last group-middle group-single has-reply-variants image-description-card image-description-mark image-description-preview is-done is-group-hidden is-grouped is-incoming is-new is-outgoing is-selected location-card-foot location-detail location-distance location-info location-message-card location-name message message-action-menu message-bubble-line message-content message-delivery-anchor message-delivery-failed message-image message-selection-bar message-selection-check message-sticker message-sticker-custom message-sticker-image message-time message-type-image message-type-location message-type-sticker message-type-text message-type-transfer message-type-voice mine reflection-avatar reflection-tag-dots reflection-unread-tag reply-variant-controls reply-variant-count reply-variant-spacer role-invitation role-invitation-actions role-invitation-address role-invitation-close-label role-invitation-details role-invitation-envelope role-invitation-envelope-status role-invitation-flap role-invitation-flap-crease role-invitation-flap-layer role-invitation-folds role-invitation-hint role-invitation-letterhead role-invitation-open-label role-invitation-paper role-invitation-pocket-front role-invitation-pocket-side role-invitation-reopen role-invitation-seal role-invitation-seams role-invitation-unseal selection-mode transfer-actions transfer-amount transfer-card-head transfer-exchange transfer-message-card transfer-note transfer-parties transfer-symbol video-call-message video-call-text voice-duration voice-mark voice-message-card voice-message-wrap voice-toggle-mark voice-transcript voice-translation voice-wave'.split(' '),
 offline:'avatar bubble bubble-quote bubble-quote-speaker bubble-text bubble-translation call-summary-copy call-summary-kicker call-summary-link call-summary-message call-summary-open chat-gift-box chat-gift-caption chat-gift-detail chat-gift-image chat-gift-item-copy chat-gift-items chat-gift-line chat-gift-row chat-gift-unavailable chat-pat-card chat-pat-row conversation group-first group-last group-middle group-single has-next-same-speaker has-reply-variants image-description-card image-description-mark image-description-preview is-continuation is-done is-group-hidden is-grouped is-incoming is-new is-offline-story is-outgoing is-selected is-user location-card-foot location-detail location-distance location-info location-message-card location-name message message-action-menu message-bubble-line message-content message-delivery-anchor message-delivery-failed message-image message-selection-bar message-selection-check message-sticker message-sticker-custom message-sticker-image message-time message-type-image message-type-location message-type-sticker message-type-text message-type-transfer message-type-voice mine offline-prose-author offline-prose-body offline-prose-entry offline-prose-excerpt offline-prose-heading offline-prose-quote offline-prose-reflection offline-prose-translation offline-stage-fold reflection-avatar reflection-tag-dots reflection-unread-tag reply-variant-controls reply-variant-count reply-variant-spacer role-invitation role-invitation-actions role-invitation-address role-invitation-close-label role-invitation-details role-invitation-envelope role-invitation-envelope-status role-invitation-flap role-invitation-flap-crease role-invitation-flap-layer role-invitation-folds role-invitation-hint role-invitation-letterhead role-invitation-open-label role-invitation-paper role-invitation-pocket-front role-invitation-pocket-side role-invitation-reopen role-invitation-seal role-invitation-seams role-invitation-unseal selection-mode transfer-actions transfer-amount transfer-card-head transfer-exchange transfer-message-card transfer-note transfer-parties transfer-symbol video-call-message video-call-text voice-duration voice-mark voice-message-card voice-message-wrap voice-toggle-mark voice-transcript voice-translation voice-wave'.split(' '),
 forum:'forum-add-avatar forum-add-choice forum-add-scroller forum-add-selected forum-app forum-author-meta forum-avatar forum-check forum-collection-card forum-collection-create forum-collection-detail forum-collection-heading forum-collection-list forum-collections-entry forum-comment forum-comment-body forum-comment-form forum-comment-role-avatar forum-comment-role-cancel forum-comment-role-choice forum-comment-role-controls forum-comment-role-open forum-comment-role-picker forum-comment-role-rail forum-comment-role-select forum-comment-role-send forum-comments forum-compose-content forum-compose-fab forum-compose-form forum-compose-image-upload forum-compose-page forum-default-badge forum-delete-world forum-detail-image forum-dock forum-dock-group forum-dock-profile forum-empty forum-feed-heading forum-feed-tools forum-flash forum-inline-action forum-interact-button forum-interact-dots forum-join-hint forum-load-more forum-main-tabs forum-market-share-card forum-market-share-select forum-member-add forum-member-card forum-member-details forum-member-list forum-member-name-row forum-member-participation forum-member-participation-body forum-member-post-link forum-member-post-status forum-member-section-head forum-member-setting forum-members-page forum-muted forum-new-collection-field forum-notice forum-npc-member forum-npc-toggle forum-page forum-page-subtitle forum-permissions forum-persona-avatar forum-persona-choice forum-persona-name forum-persona-rail forum-picker-empty forum-poll forum-post forum-post-actions forum-post-author forum-post-collection-select forum-post-collection-tag forum-post-detail forum-post-full forum-post-image forum-post-images forum-post-menu forum-post-menu-wrap forum-post-more forum-post-open forum-post-type forum-post-wave forum-primary forum-profile-avatar-picker forum-profile-avatar-preview forum-profile-bio forum-profile-collection-form forum-profile-collection-tabs forum-profile-edit-page forum-profile-form forum-profile-hero forum-profile-manager-tabs forum-profile-new-collection forum-profile-nickname forum-profile-posts-heading forum-profile-preview forum-profile-settings forum-profile-stats forum-reply-form forum-reply-to forum-reset-world forum-role-avatar forum-role-avatar-heart forum-role-avatar-option forum-role-avatar-rail forum-role-choice forum-role-choice-scroller forum-role-divider forum-role-invite-action forum-role-owner forum-role-owner-avatar forum-role-owner-chevron forum-role-owner-current forum-role-owner-menu forum-role-owner-name forum-role-owner-option forum-role-owner-option-avatar forum-role-owner-picker forum-role-owner-scroller forum-role-picker forum-role-reply forum-role-section-head forum-role-select forum-search-entry forum-search-form forum-selection-heart forum-status forum-story-summary forum-subpage forum-subpage-head forum-tools forum-topics forum-upload forum-world-add forum-world-add-page forum-world-choice forum-world-danger-zone forum-world-edit-heading forum-world-edit-page forum-world-form forum-world-form-actions forum-world-intro forum-world-list forum-world-manage forum-world-manage-link forum-world-note forum-world-rail forum-world-rail-actions forum-world-row forum-world-scroller forum-world-switch is-active is-already-added is-anonymous is-current is-failure is-loading is-open is-posting is-read is-reply is-selected is-success'.split(' ')
};
const beautifyPageChromeClasses=['topbar','top-actions','avatar-stack','icon-button','chat-character-name','bottom','offline-reply-status','dock','dock-capsule','dock-tab','dock-add','dock-item','composer','composer-tools','quick-features','input-wrap','message-input','emoji','circle','small','feature-page-topbar','feature-page-brand','feature-page-wordmark','feature-page-content','forum-dock','forum-dock-group','forum-dock-profile','forum-main-tabs','forum-search-form','forum-reply-form'];
for(const tab of ['online','offline'])beautifyClassNames[tab]=[...new Set([...beautifyClassNames[tab],...beautifyPageChromeClasses.filter(name=>!name.startsWith('forum-')&&!name.startsWith('feature-page-'))])].sort();
beautifyClassNames.forum=[...new Set([...beautifyClassNames.forum,...beautifyPageChromeClasses.filter(name=>name.startsWith('feature-page-')||name.startsWith('forum-dock')||['forum-main-tabs','forum-search-form','forum-reply-form'].includes(name))])].sort();
function beautifyClassLocation(tab,name){if(tab==='forum'){if(name==='feature-page-content')return'论坛页面内容';if(['feature-page-topbar','feature-page-brand','feature-page-wordmark'].includes(name))return'论坛页面顶栏';if(name==='forum-dock'||name.startsWith('forum-dock-'))return'论坛底部导航';if(name==='forum-main-tabs')return'论坛页面分类栏';if(name==='forum-search-form'||name==='forum-reply-form'||name==='forum-comment-form'||name==='forum-compose-form')return'论坛输入区';if(name.startsWith('forum-post'))return'论坛帖子';if(name.startsWith('forum-comment'))return'论坛评论';if(name.startsWith('forum-role'))return'论坛角色选择';if(name.startsWith('forum-member')||name==='forum-members-page')return'论坛成员管理';if(name.startsWith('forum-world')||name==='forum-delete-world'||name==='forum-reset-world')return'论坛世界管理';if(name.startsWith('forum-profile'))return'论坛个人主页';if(name.startsWith('forum-collection')||name.startsWith('forum-new-collection'))return'论坛合集';if(name.startsWith('forum-persona'))return'论坛身份面具';if(name.startsWith('forum-compose'))return'论坛发帖';if(name.startsWith('forum-poll'))return'论坛投票';if(name.startsWith('forum-search'))return'论坛搜索';if(name.startsWith('forum-dock'))return'论坛底部导航';if(name.startsWith('forum-add-'))return'论坛添加成员';if(name.startsWith('forum-upload'))return'论坛图片上传';if(name.startsWith('forum-market'))return'论坛商品分享';if(name.startsWith('forum-'))return'论坛页面';return'论坛页面状态'}if(['topbar','top-actions','avatar-stack','icon-button','chat-character-name'].includes(name))return tab==='offline'?'线下故事顶栏':'线上聊天顶栏';if(['bottom','offline-reply-status','dock','dock-capsule','dock-tab','dock-add','dock-item'].includes(name))return tab==='offline'?'线下故事底栏与导航':'线上聊天底栏与导航';if(['composer','composer-tools','quick-features','input-wrap','message-input','emoji','circle','small'].includes(name))return tab==='offline'?'线下故事输入区':'线上聊天输入区';if(name.startsWith('feature-page-'))return'页面顶栏';if(name.startsWith('offline-prose'))return'线下故事正文';if(name==='offline-stage-fold')return'线下故事折叠';if(name.startsWith('gift-')||name.startsWith('chat-gift-'))return'聊天礼物与礼盒';if(name.startsWith('role-invitation'))return tab==='offline'?'线下邀请卡':'聊天邀请卡';if(name.startsWith('call-summary')||name.startsWith('video-call'))return'通话消息';if(name.startsWith('voice-'))return'语音消息';if(name.startsWith('transfer-')||name==='message-type-transfer')return'转账消息';if(name.startsWith('location-')||name==='message-type-location')return'位置消息';if(name.startsWith('image-description'))return'图片描述消息';if(name.startsWith('message-sticker')||name==='message-type-sticker')return'贴纸消息';if(name==='message-image'||name==='message-type-image')return'图片消息';if(name.startsWith('chat-pat'))return'拍一拍消息';if(name.startsWith('reflection-'))return'角色心声';if(name.startsWith('reply-')||name==='has-reply-variants')return'回复与分支消息';if(name==='avatar'||name==='forum-avatar')return'聊天头像';if(name==='bubble'||name.startsWith('bubble-'))return'聊天气泡';if(name==='conversation')return tab==='offline'?'线下聊天区域':'线上聊天区域';if(name==='message'||name.startsWith('message-'))return tab==='offline'?'线下消息':'线上消息';if(name.startsWith('group-')||name.startsWith('is-group')||name==='is-grouped')return'连续消息分组';if(name==='mine'||name==='is-incoming'||name==='is-outgoing'||name==='is-selected'||name==='selection-mode')return'消息状态与选择';if(name==='message-time')return'消息时间';if(name==='is-offline-story'||name==='is-user'||name==='is-continuation'||name==='has-next-same-speaker')return'线下故事状态';if(name==='is-done'||name==='is-new')return'消息进度状态';return tab==='offline'?'线下聊天界面':'线上聊天界面'}
function beautifyClassCatalogMarkup(tab){const ids=beautifyClassNames[tab]||[];return `<details class="beautify-class-catalog"><summary>本类全部类名与对应位置（${ids.length}）</summary><p>点选类名可复制；中文说明表示它所在的界面位置。</p><div>${ids.map(name=>`<button type="button" data-copy-class="${name}"><small>${beautifyClassLocation(tab,name)}</small><code>.${name}</code></button>`).join('')}</div></details>`}
function beautifyBackgroundRule(tab){const image=state.settings.beautifyBackgrounds?.[tab],root=beautifyBackgroundRoots[tab];if(!image||!root)return'';return `${root}{background-image:url("${image}")!important;background-position:center!important;background-repeat:no-repeat!important;background-size:cover!important;background-attachment:local!important}`}
function beautifyBackgroundControlsMarkup(tab){const image=state.settings.beautifyBackgrounds?.[tab]||'',label=tab==='online'?'线上聊天':'线下故事';return `<section class="beautify-background-settings"><div class="beautify-background-copy"><strong>${label}背景</strong><small>${image?'已添加背景图，可以更换或移除':'添加一张背景图，为聊天换一种氛围'}</small></div><input type="file" accept="image/*" data-beautify-background-input hidden><div class="beautify-background-actions"><button type="button" data-beautify-background-pick>${image?'更换图片':'选择图片'}</button><button type="button" data-beautify-background-clear ${image?'':'disabled'}>移除</button></div><div class="beautify-background-preview ${image?'has-image':'is-empty'}">${image?`<img class="beautify-background-thumb" src="${esc(image)}" alt="当前聊天背景预览">`:'<span><i aria-hidden="true">＋</i>选择一张图片作为聊天背景</span>'}</div><small class="beautify-background-hint">图片会压缩后保存在本机，不会上传。</small></section>`}
async function compressBeautifyImage(file){if(!file?.type?.startsWith('image/'))throw Error('请选择图片文件');if(file.size>24*1024*1024)throw Error('图片太大，请选择 24 MB 以内的图片');const source=URL.createObjectURL(file),image=new Image();try{await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(Error('图片无法读取'));image.src=source});const scale=Math.min(1,1500/Math.max(image.naturalWidth,image.naturalHeight)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));canvas.getContext('2d',{alpha:false}).drawImage(image,0,0,canvas.width,canvas.height);let result=canvas.toDataURL('image/webp',.76);if(!result.startsWith('data:image/webp'))result=canvas.toDataURL('image/jpeg',.76);if(result.length>1900000){const reduced=document.createElement('canvas'),ratio=Math.min(1,1050/Math.max(canvas.width,canvas.height));reduced.width=Math.max(1,Math.round(canvas.width*ratio));reduced.height=Math.max(1,Math.round(canvas.height*ratio));reduced.getContext('2d',{alpha:false}).drawImage(canvas,0,0,reduced.width,reduced.height);result=reduced.toDataURL('image/jpeg',.62)}if(result.length>1900000)throw Error('图片压缩后仍然较大，请换一张小一些的图片');return result}finally{URL.revokeObjectURL(source)}}
function scopeBeautifySelector(selector,root,tab){const roots=tab==='forum'?[['.forum-app','.forum-app']]:[['.conversation','#conversation'],['.is-offline-story','#conversation.is-offline-story']];for(const [rootClass,target] of roots){if(selector===rootClass)return `${root} ${target}`;if(selector.startsWith(`${rootClass} `)||selector.startsWith(`${rootClass}:`)||selector.startsWith(`${rootClass}.`))return `${root} ${target}${selector.slice(rootClass.length)}`}if(tab!=='forum'){const shell=/^(\.topbar|\.bottom)(?=$|[\s:.#[])/.exec(selector);if(shell)return `${root} > ${shell[1]}${selector.slice(shell[1].length)}`}const containers=tab==='forum'?`${root} `:`${root} :is(.topbar,#conversation,.bottom) `;return `${containers}${selector}`}
function scopeBeautifyCss(css,root,tab){const source=String(css||'').replace(/<\/style/gi,'<\\/style').replace(/\/\*[\s\S]*?\*\//g,'');const readRules=(text,allowMedia=true)=>{let output='',index=0;while(index<text.length){while(/\s/.test(text[index]||''))index++;if(index>=text.length)break;const open=text.indexOf('{',index);if(open<0)break;const head=text.slice(index,open).trim();let depth=1,end=open+1;for(;end<text.length&&depth;end++){if(text[end]==='{')depth++;else if(text[end]==='}')depth--}if(depth)break;const body=text.slice(open+1,end-1);index=end;if(!head)continue;if(head.startsWith('@')){if(allowMedia&&/^@(media|supports|container)\b/i.test(head))output+=`${head}{${readRules(body,true)}}`;continue}const selectors=head.split(',').map(selector=>selector.trim()).filter(Boolean).map(selector=>scopeBeautifySelector(selector,root,tab)).join(',');if(selectors)output+=`${selectors}{${body}}`}return output};return readRules(source)}
function setBeautifyCss(tab,css){const id=`iris-beautify-${tab}`,style=document.getElementById(id)||document.createElement('style');style.id=id;style.textContent=scopeBeautifyCss(css,beautifyRoots[tab],tab)+beautifyBackgroundRule(tab);if(!style.isConnected)document.head.append(style)}
function applyBeautifyCss(){for(const tab of ['online','offline','forum'])setBeautifyCss(tab,state.settings.beautifyCss?.[tab]||'')}
function beautifyPreviewMarkup(tab){
 const chatHeader=label=>`<header class="topbar"><h1 class="chat-character-name">${label}</h1><div class="top-actions"><button type="button" class="avatar-stack">i　用户</button><button type="button" class="icon-button">•••</button></div></header>`;
 const chatFooter=`<footer class="bottom"><nav class="dock"><div class="dock-capsule"><button class="dock-tab">Offline</button><button class="dock-tab">Chat</button><button class="dock-tab">User</button></div><button class="dock-add">＋</button></nav><form class="composer"><button class="circle small composer-tools">＋</button><div class="input-wrap"><textarea class="message-input" aria-label="消息输入框" placeholder="输入消息…"></textarea><button class="emoji">☺</button></div><button class="circle small">↗</button></form></footer>`;
 if(tab==='online')return `<main class="phone">${chatHeader('Chat')}<section class="conversation" id="conversation"><div class="demo-chat"><div class="demo-message"><span class="demo-avatar">i</span><div><div class="bubble">今天也想和你分享一点小小的快乐。</div><small class="message-time">19:08</small></div></div><div class="demo-message mine"><span class="demo-avatar">我</span><div><div class="bubble">好呀，我在听。</div><small class="message-time">19:09</small></div></div></div></section>${chatFooter}</main>`;
 if(tab==='offline')return `<main class="phone">${chatHeader('Offline')}<section class="conversation is-offline-story" id="conversation"><article class="offline-prose-entry"><p class="offline-prose-heading">雨停以后</p><div class="offline-prose-body">窗外的雨声渐渐轻了下来。你抬起头，看见他把热茶放在桌边，暖意沿着杯壁慢慢散开。</div></article></section>${chatFooter}</main>`;
 return `<section id="featureScreen" class="feature-screen"><header class="feature-page-topbar"><button class="feature-page-brand"><span class="feature-page-wordmark">Forum</span><small class="forum-page-subtitle">社区</small></button></header><div class="feature-page-content" id="featurePageContent"><main class="forum-app"><article class="forum-post"><div class="forum-post-author">林间来信 · 刚刚</div><div class="forum-post-open">分享一个最近喜欢的小角落</div><div class="forum-post-actions">♡　12　　评论　3</div><form class="forum-comment-form"><input placeholder="写下评论…"><button>发送</button></form></article></main></div><nav class="forum-dock"><div class="forum-dock-group"><button>首页</button><button>收藏</button><button>通知</button></div><button class="forum-dock-profile">我的</button></nav></section>`
}
function beautifyPreviewDocument(tab,css){
 const scoped=(scopeBeautifyCss(css,beautifyRoots[tab],tab)+beautifyBackgroundRule(tab)).replace(/<\/style/gi,'<\\/style');
 return `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' data:"><style>
 *{box-sizing:border-box}body{margin:0;padding:18px;background:#fff;color:#555;font:14px -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif}
 .phone,.feature-screen{display:flex;flex-direction:column;min-height:280px;padding:0;border:1px solid #eee;background:#fff}
 .topbar,.feature-page-topbar{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px;border-bottom:1px solid #eee;background:#fff}
 .topbar h1{margin:0;font-size:14px}.top-actions,.dock-capsule{display:flex;align-items:center;gap:7px}.conversation,.feature-page-content{flex:1;min-height:0}.bottom{display:grid;gap:7px;padding:8px;background:#fff}.dock{display:flex;align-items:center;justify-content:space-between;gap:6px}.composer{display:flex;align-items:center;gap:6px}.input-wrap{display:flex;flex:1;align-items:center;min-width:0;gap:5px}.input-wrap textarea{width:100%;min-width:0;min-height:24px}.forum-dock{display:flex;justify-content:space-around;padding:8px;border-top:1px solid #eee}.feature-page-brand{display:flex;align-items:baseline;gap:8px}
 .demo-chat{display:grid;gap:18px;padding:12px}.demo-message{display:flex;align-items:flex-start;gap:8px}.demo-message.mine{flex-direction:row-reverse}.demo-avatar{display:grid;place-items:center;flex:none;width:28px;height:28px;border-radius:50%;background:#eee;color:#888;font-size:11px}.bubble{max-width:220px;padding:10px 13px;border-radius:3px 15px 15px;background:#f4f4f4;line-height:1.65}.mine .bubble{background:#eee}.message-time{display:block;margin-top:4px;color:#aaa;font-size:10px}.offline-prose-entry{padding:16px;border:1px solid #eee;border-radius:10px}.offline-prose-heading{margin:0 0 12px;color:#444;font-family:serif;font-size:18px}.offline-prose-body{color:#666;line-height:1.8}.forum-app{padding:12px}.forum-post{padding:16px;border:1px solid #eee;border-radius:8px;background:#fff}.forum-post-author{margin-bottom:12px;color:#888;font-size:11px}.forum-post-open{color:#444;line-height:1.7}.forum-post-actions{margin-top:15px;color:#aaa;font-size:11px}
 ${scoped}</style></head><body>${beautifyPreviewMarkup(tab)}</body></html>`
}
function beautifyTutorialMarkup(){return `<article class="beautify-tutorial"><p class="feature-page-kicker">从零开始 · CSS</p><h2>一步一步学会页面美化</h2><p>你可以先学会读懂一条 CSS、自己改一个小地方，再用 AI 帮你完成更复杂的想法。整个过程只调整外观，不需要写程序。</p>
<div class="beautify-lesson"><h3>01 · CSS 是做什么的</h3><p>CSS 用来调整页面的外观，例如文字颜色、背景、圆角、间距和大小。它不会替你发送消息，也不会改变角色、聊天和论坛的功能。</p><p>一条 CSS 通常由三部分组成：要调整的元素、要调整的外观属性，以及属性的新值。</p></div>
<div class="beautify-lesson"><h3>02 · 读懂一条 CSS</h3><pre><code>.bubble {
  background: #f2edf0;
  border-radius: 18px;
}</code></pre><ul><li><code>.bubble</code>：选择器，表示要调整聊天气泡；英文句点 <code>.</code> 是类名选择器的一部分。</li><li><code>{ }</code>：花括号里写要应用的样式。</li><li><code>background</code>：属性名称，这里表示背景。</li><li><code>#f2edf0</code>：属性值，这里是颜色。</li><li><code>:</code>：连接属性和属性值；每条设置末尾用 <code>;</code> 结束。</li></ul><p>多个属性可以写在同一对花括号里。改颜色时替换颜色值，改圆角时替换数字即可。</p></div>
<div class="beautify-lesson"><h3>03 · 第一次自己动手</h3><ol><li>先点上方的线上、线下或论坛，进入想修改的页面。</li><li>展开“本类全部类名与对应位置”，根据中文说明找到目标部位，再点类名复制。</li><li>回到该分类的 CSS 编辑器，把复制的类名放在句点后面，例如 <code>.bubble</code>。</li><li>先只写一条简单设置，例如 <code>.bubble { border-radius: 18px; }</code>，观察预览里的气泡圆角。</li></ol><p>每个类别都有自己的编辑器和预览。类名要从对应类别中选择，才能调整那个页面里的元素。</p></div>
<div class="beautify-lesson"><h3>04 · 常用外观设置</h3><ul><li><code>color: #555;</code>：文字颜色。</li><li><code>background: #f2edf0;</code>：背景颜色。</li><li><code>border-radius: 16px;</code>：圆角大小。</li><li><code>padding: 12px;</code>：内容和边缘之间的内侧留白。</li><li><code>margin: 8px;</code>：元素和周围内容之间的外侧距离。</li><li><code>font-size: 14px;</code>：文字大小。</li><li><code>line-height: 1.8;</code>：文字行距。</li></ul><p>颜色可以写成十六进制色值；尺寸通常带 <code>px</code> 单位。一次先改一两项，更容易看出每项设置的效果。</p></div>
<div class="beautify-lesson"><h3>05 · 预览、调整和保存</h3><ol><li>在编辑器输入或修改 CSS，右侧预览会实时更新。</li><li>如果效果不对，检查类名、冒号、花括号和分号，再一次调整一个值。</li><li>满意后点“应用 CSS”，样式才会保存并应用到对应页面。</li><li>想从头开始时，点“恢复默认”清除该类别的自定义 CSS。</li></ol></div>
<div class="beautify-lesson"><h3>06 · 学会基础后，再请 AI 帮忙</h3><p>当你知道要改哪里、想要什么效果后，可以把对应中文位置和复制的类名告诉 AI。最好同时描述当前效果、目标效果，并要求 AI 解释代码。你也可以附上截图。</p><p>把下面方括号里的内容换成自己的情况，再复制给 AI：</p><pre data-ai-prompt>我正在使用 iris 的页面美化功能，我是 CSS 初学者。请根据下面的信息，帮我写一份可以放进美化页面 CSS 编辑器的样式。

【页面分类】线上 / 线下 / 论坛（保留我填写的一项）
【要修改的位置】填写类名目录中的中文位置，例如：聊天气泡、故事正文、论坛帖子
【对应类名】把对应分类中复制的完整类名粘贴在这里，例如：.bubble
【当前效果】具体描述现在的颜色、大小、间距或形状；不清楚的地方可以写“不确定”
【希望效果】描述想要的颜色、圆角、大小、留白、字体或整体感觉；可以写具体数值，也可以用日常语言
【补充要求】例如：保持黑白灰、适合手机、和页面现有风格协调（没有就写“无”）

请按以下要求回答：
1. 只使用我提供的类名，不要猜测或编造项目中不存在的类名。如果现有信息不足，请先告诉我需要补充什么。
2. 先给出一段完整、可直接使用的 CSS 代码，并放进代码块；代码只包含 CSS，不要混入解释文字。
3. 样式尽量只影响我指定的位置，不要使用会影响整站的通用选择器，例如 body、* 或所有 button。
4. 只修改外观，不要要求我改 HTML、JavaScript、交互、数据或添加依赖；不要使用外部字体、图片或网络资源。
5. 保留当前页面的功能和布局关系。除非我明确要求，不要隐藏内容、改变元素位置或覆盖其他类别的样式。
6. 少用 !important；只有确实无法覆盖现有样式时才使用，并说明原因。
7. 代码块后请用简单中文逐条说明选择器、每个属性和数值的作用，并告诉我哪些数值可以继续调整。
8. 如果我附了截图，请以截图中指定的部位为目标；不要顺带改动截图里的其他区域。</pre><button type="button" class="beautify-copy-prompt" data-copy-ai-prompt>复制提问模板</button></div>
<div class="beautify-lesson"><h3>07 · 检查 AI 给出的样式</h3><ol><li>确认 AI 用的是对应分类中的类名，再把 CSS 粘贴进那个分类的编辑器。</li><li>先看实时预览；如果只有部分效果合适，可以告诉 AI 具体哪一处需要变化。</li><li>不要把解释文字或 Markdown 代码围栏一起粘进编辑器，只复制 CSS 规则本身。</li><li>预览满意后点“应用 CSS”保存。</li></ol><p>例如，<code>.bubble { border-radius: 18px; }</code> 表示只把聊天气泡的圆角改为 18 像素。</p></div></article>`}
function renderBeautifyPage(content,tab=activeBeautifyTab){
 activeBeautifyTab=tab;
 const tutorial=tab==='tutorial',editorTab=tutorial?'online':tab,current=beautifyDrafts[editorTab]??state.settings.beautifyCss?.[editorTab]??'';
 if(!content.querySelector('.beautify-workspace'))content.innerHTML=`<section class="beautify-workspace"><div class="beautify-tabs" role="tablist" aria-label="美化分类">${beautifyTabs.map(([id,label])=>`<button type="button" role="tab" aria-selected="false" data-beautify-tab="${id}">${label}</button>`).join('')}</div><div class="beautify-panel" data-beautify-panel></div></section>`;
 const tabs=content.querySelectorAll('[data-beautify-tab]');
 tabs.forEach(button=>{button.setAttribute('aria-selected',String(button.dataset.beautifyTab===tab));button.classList.toggle('is-active',button.dataset.beautifyTab===tab);button.onclick=()=>{const field=content.querySelector('[data-beautify-editor]');if(field)beautifyDrafts[editorTab]=field.value;renderBeautifyPage(content,button.dataset.beautifyTab)}});
 const panel=content.querySelector('[data-beautify-panel]');
 panel.innerHTML=tutorial?beautifyTutorialMarkup():`${['online','offline'].includes(tab)?beautifyBackgroundControlsMarkup(tab):''}${beautifyClassCatalogMarkup(tab)}<div class="beautify-lab"><label class="beautify-code-panel"><span>CSS 编辑器</span><textarea data-beautify-editor spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="CSS 编辑器">${esc(current)}</textarea></label><section class="beautify-preview-panel"><span>预览</span><iframe title="美化实时预览" sandbox="allow-same-origin" data-beautify-preview srcdoc="${esc(beautifyPreviewDocument(tab,current))}"></iframe></section></div><div class="beautify-actions"><button type="button" class="beautify-apply" data-beautify-apply>应用 CSS</button><button type="button" data-beautify-reset>恢复默认</button></div><p class="beautify-note">支持普通规则和 @media；样式会单独保存，不会改动聊天、角色或论坛内容。</p>`;
 panel.querySelectorAll('[data-copy-class]').forEach(button=>button.onclick=()=>{const selector=`.${button.dataset.copyClass}`;if(navigator.clipboard?.writeText)void navigator.clipboard.writeText(selector).then(()=>toast(`已复制 ${selector}`)).catch(()=>toast(selector));else toast(selector)});
 const copyPrompt=panel.querySelector('[data-copy-ai-prompt]');if(copyPrompt)copyPrompt.onclick=()=>{const prompt=panel.querySelector('[data-ai-prompt]')?.textContent||'';if(navigator.clipboard?.writeText)void navigator.clipboard.writeText(prompt).then(()=>toast('提问模板已复制')).catch(()=>toast('请长按选中提问模板并复制'));else toast('请长按选中提问模板并复制')};
 const backgroundInput=panel.querySelector('[data-beautify-background-input]'),backgroundPick=panel.querySelector('[data-beautify-background-pick]'),backgroundClear=panel.querySelector('[data-beautify-background-clear]');if(backgroundInput&&backgroundPick){backgroundPick.onclick=()=>backgroundInput.click();backgroundInput.onchange=async()=>{const file=backgroundInput.files?.[0];if(!file)return;const field=panel.querySelector('[data-beautify-editor]');if(field)beautifyDrafts[editorTab]=field.value;backgroundPick.disabled=true;backgroundPick.textContent='正在处理…';try{state.settings.beautifyBackgrounds[tab]=await compressBeautifyImage(file);applyBeautifyCss();save();renderBeautifyPage(content,tab);toast('聊天背景已更新')}catch(error){backgroundPick.disabled=false;backgroundPick.textContent='选择图片';toast(error.message||'图片处理失败')}finally{backgroundInput.value=''}};backgroundClear.onclick=()=>{if(!state.settings.beautifyBackgrounds?.[tab])return;const field=panel.querySelector('[data-beautify-editor]');if(field)beautifyDrafts[editorTab]=field.value;state.settings.beautifyBackgrounds[tab]='';save();applyBeautifyCss();renderBeautifyPage(content,tab);toast('聊天背景已移除')}}
 const field=panel.querySelector('[data-beautify-editor]'),preview=panel.querySelector('[data-beautify-preview]');if(field){field.addEventListener('input',()=>{beautifyDrafts[editorTab]=field.value;preview.srcdoc=beautifyPreviewDocument(editorTab,field.value)});panel.querySelector('[data-beautify-apply]').onclick=()=>{state.settings.beautifyCss[editorTab]=field.value;delete beautifyDrafts[editorTab];save();applyBeautifyCss();toast('美化样式已保存')};panel.querySelector('[data-beautify-reset]').onclick=()=>{field.value='';beautifyDrafts[editorTab]='';preview.srcdoc=beautifyPreviewDocument(editorTab,'');state.settings.beautifyCss[editorTab]='';save();applyBeautifyCss();toast('已恢复默认样式')}}
 panel.querySelectorAll('[data-beautify-example]').forEach(button=>button.addEventListener('click',()=>{const exampleTab=button.dataset.beautifyExample;beautifyDrafts[exampleTab]=beautifyExamples[exampleTab];renderBeautifyPage(content,exampleTab)}));
}
function readingIdentity(roleId,userId){
 const userIndex=state.users.findIndex(user=>user.irisMarketId===userId),roleIndex=chars.findIndex(role=>role.irisMarketId===roleId);
 if(userIndex<0||roleIndex<0||chars[roleIndex].chatSettings?.userIndex!==userIndex)throw Error('陪读身份已变更，请重新选择角色');
 return{character:chars[roleIndex],user:state.users[userIndex],roleIndex,userIndex};
}
function renderReadingFeature(content,title){
 if(!window.IrisReading)throw Error('阅读组件尚未加载，请稍后重试');
 window.IrisReading.render({state,characters:chars,content,title,esc,save,toast,isActive:()=>activeFeaturePage==='reading'&&!$('#featureScreen').hidden,
 context:(roleId,userId)=>{const{character,user,roleIndex,userIndex}=readingIdentity(roleId,userId),cfg=character.chatSettings||{},world=worldBookPromptValues(character,cfg,'online');return{characterName:character.name||'未命名角色',characterProfile:String(character.details||character.desc||character.persona||'').slice(0,10000),userName:user.nickname||user.name||'用户',userProfile:String(user.details||'').slice(0,2400),worldBackground:world.world_background.slice(0,10000),sharedExperiences:(cfg.userExperiences||[]).slice(-6).map(x=>String(x.content||'').slice(0,700)),recentConversation:(state.messages[`${roleIndex}-${userIndex}-chat`]||[]).filter(x=>!x.type||x.type==='text').slice(-6).map(x=>({speaker:x.mine?'user':'character',text:String(x.text||'').slice(0,700)}))}},
 request:(prompt)=>{const api=apiConfigForFeature('reading'),model=apiModelForFeature('reading',api);if(!api?.url||!api?.key||!model)throw Error('请先在设置 → API 配置中为阅读或线上聊天分配 API');return requestConfiguredChatCompletion(api,model,prompt,[],'reading',true)},
 share:({book,session,note})=>{const{roleIndex,userIndex}=readingIdentity(session.roleId,session.userId),thread=state.messages[`${roleIndex}-${userIndex}-chat`]||=[];if(thread.some(x=>x.readingNoteId===note.id))return;const discussion=note.thread.slice(-4).map(x=>`${x.mine?'我':'角色'}：${x.text}`).join('\n');thread.push({mine:true,text:`共读《${book.title}》 · ${book.chapters[note.chapter].title}\n\n“${note.quote}”${note.text?`\n\n页边批注：${note.text}`:''}${discussion?`\n\n${discussion}`:''}`,createdAt:Date.now(),readingNoteId:note.id});save()},
 remember:({book,session,letter})=>{const{character,roleIndex}=readingIdentity(session.roleId,session.userId);character.chatSettings||={};const memory=character.chatSettings.memory||={...defaultOnlineMemory,entries:[]};memory.entries||=[];const id=`reading-memory-${session.id}`;if(!memory.entries.some(x=>x.id===id))memory.entries.unshift({id,scope:'online',owner:'shared',title:`共读《${book.title}》`,content:letter.letter,source:'reading',updatedAt:Date.now()});if(state.char===roleIndex)onlineMemoryEntries=memory.entries.map(x=>({...x}));save()}
 });
}
function renderFeaturePage(page){
 const oldSmsMenu=$('#smsUserMenu');if(oldSmsMenu?.parentElement===document.body)oldSmsMenu.remove();
 if(page!=='forum')$('#featureScreen').querySelector(':scope > .forum-dock')?.remove();
 const labels={worldbook:'World Book',beautify:'Beautify',forum:'Forum',market:'Market',business:'Business',reading:'Reading',sms:'SMS'};
 const smsRole=page==='sms'&&activeSmsThread?chars[activeSmsThread.roleIndex]:null;
 const title=$('#featurePageTitle'),brandClass={worldbook:'worldbook-feature-brand',beautify:'beautify-feature-brand',forum:'forum-feature-brand',market:'market-feature-brand',business:'business-feature-brand',reading:'reading-feature-brand',sms:'sms-feature-brand'}[page]||'';
 const subtitle=page==='reading'?'<small class="reading-page-subtitle">共读书房</small>':page==='business'?'':page==='forum'?'<small class="forum-page-subtitle" hidden></small>':page==='market'?'<small class="market-page-subtitle">首页</small>':`<small>${page==='worldbook'?'世界书':page==='beautify'?'美化':page==='sms'?'短信':''}</small>`;
 title.innerHTML=`<button type="button" class="feature-page-brand ${brandClass}" id="featureBack" aria-label="返回聊天"><span class="feature-page-wordmark">${labels[page]||'Iris'}</span>${subtitle}</button>`;
 const backButton=$('#featureBack');if(backButton)backButton.onclick=()=>{if(page==='market'&&window.IrisMarket?.back?.())return;if(page==='business'&&window.IrisPerfumery?.back?.())return;if(page==='reading'&&window.IrisReading?.back?.())return;if(page==='forum'&&window.IrisForum?.back?.())return;if(page==='sms'&&activeSmsThread){activeSmsThread=null;activeSmsMessageActionIndex=null;smsSelectionThreadKey='';smsSelectedMessageIndices.clear();smsClearMenuOpen=false;renderFeaturePage('sms')}else closeFeaturePage()};
 const content=$('#featurePageContent');
 if(page!=='business')$('#featureScreen').querySelector('.perfumery-topbar-user')?.remove();
 if(page==='worldbook'){content.innerHTML=renderGlobalWorldBookPanel();bindGlobalWorldBookPanel()}
 else if(page==='beautify')renderBeautifyPage(content);
 else if(page==='forum'){window.IrisForum?.render({state,characters:chars,content,title:$('#featurePageTitle'),esc,save,apiConfigured:(()=>{const api=apiConfigForFeature('forum');return Boolean(api?.url&&api?.key&&apiModelForFeature('forum',api))})(),request:(prompt,recent=[])=>{const api=apiConfigForFeature('forum'),model=apiModelForFeature('forum',api);if(!api?.url||!api?.key||!model)throw Error('请先在设置 → API 配置中为论坛分配 API');return requestConfiguredChatCompletion(api,model,prompt,recent,'forum',true)}})}
 else if(page==='market'){const book=activeGlobalWorldBook();window.IrisMarket?.render({state,characters:chars,content,title:$('#featurePageTitle'),esc,save,exchangeRateToCny,worldContext:(book?.entries||[]).filter(entry=>entry.enabled!==false).slice(0,12).map(entry=>`${entry.name||''}: ${entry.content||''}`).join('\n').slice(0,1800),onGiftSent:({roleIndex,userIndex,orderId})=>{void replyToGiftImmediately(roleIndex,userIndex,orderId)},request:(prompt,recent=[])=>{const api=apiConfigForFeature('market'),model=apiModelForFeature('market',api);if(!api?.url||!api?.key||!model)throw Error('请先在设置 → API 配置中为商场分配 API');return requestConfiguredChatCompletion(api,model,prompt,recent,'market',true)}})}
 else if(page==='reading'){renderReadingFeature(content,title)}
 else if(page==='business'){const book=activeGlobalWorldBook();window.IrisPerfumery.render({state,characters:chars,content,title,esc,save,toast,exchangeRateToCny,isActive:()=>activeFeaturePage==='business'&&!$('#featureScreen').hidden,worldContext:(book?.entries||[]).filter(entry=>entry.enabled!==false).slice(0,12).map(entry=>`${entry.name||''}: ${entry.content||''}`).join('\n').slice(0,1800),request:(prompt,recent=[])=>{const api=apiConfigForFeature('business'),model=apiModelForFeature('business',api);if(!api?.url||!api?.key||!model)throw Error('请先在设置 → API 配置中为经营分配 API');return requestConfiguredChatCompletion(api,model,prompt,recent,'business',true)}})}
 else if(page==='sms'){
  const oldThread=content.querySelector('[data-sms-thread]'),oldBox=oldThread?.querySelector('[data-sms-messages]');
  const sameThread=smsRole&&oldThread?.dataset.smsThread===smsThreadKey(activeSmsThread.roleIndex,activeSmsThread.userIndex);
  const scrollTop=sameThread?oldBox.scrollTop:null,hadMenu=Boolean(oldThread?.querySelector('.sms-message-actions'));
  const pinned=oldBox?oldBox.scrollHeight-oldBox.clientHeight-oldBox.scrollTop<40:true;
  const draft=sameThread?oldThread.querySelector('textarea')?.value||'':'';
  content.innerHTML=smsRole?renderSmsThreadView(activeSmsThread.roleIndex,activeSmsThread.userIndex):renderSmsInbox();
  const userMenu=$('#smsUserMenu');if(userMenu)document.body.append(userMenu);bindSmsPage();
  const box=content.querySelector('[data-sms-messages]'),field=content.querySelector('.sms-composer textarea');
  if(box){if(scrollTop!==null&&(!pinned||hadMenu||activeSmsMessageActionIndex!==null))box.scrollTop=scrollTop;box.addEventListener('scroll',positionSmsMessageActions,{passive:true})}
  if(field&&draft){field.value=draft;field.dispatchEvent(new Event('input'))}
  positionSmsMessageActions();
 }
}
function renderGlobalWorldBookPanel(){
 const selectedBook=activeGlobalWorldBook(),entries=selectedBook.entries;
 return `<section class="global-worldbook"><div class="global-worldbook-toolbar"><button type="button" class="global-worldbook-import" data-global-worldbook-import>导入世界书 <span>＋</span></button><button type="button" data-global-worldbook-new-book>新建世界书 <span>＋</span></button><button type="button" class="global-worldbook-delete-book" data-global-worldbook-delete-book>删除世界书</button><button type="button" class="global-worldbook-add" data-global-worldbook-add>新建条目 <span>＋</span></button><button type="button" data-global-worldbook-edit-book>编辑</button><input type="file" data-global-worldbook-file accept=".json,.txt,.docx,application/json,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document" hidden></div><form class="global-worldbook-book-form" data-global-worldbook-book-form hidden><label>世界书名称<input name="name" required maxlength="80" placeholder="给这本世界书命名"></label><button type="button" data-global-book-cancel>取消</button><button type="submit">创建</button></form><form class="global-worldbook-book-form" data-global-worldbook-rename-form hidden><label>修改世界书名称<input name="name" required maxlength="80" placeholder="输入新的世界书名称"></label><button type="button" data-global-book-rename-cancel>取消</button><button type="submit">保存</button></form><div class="global-worldbook-library" role="group" aria-label="已有世界书">${state.globalWorldBooks.map(book=>`<div class="global-worldbook-book ${book.id===selectedBook.id?'is-selected':''}"><button type="button" aria-pressed="${book.id===selectedBook.id}" class="global-worldbook-book-name" data-global-worldbook-select="${esc(book.id)}">${esc(book.name||'未命名世界书')}</button><button type="button" role="switch" aria-checked="${book.enabled!==false}" aria-label="${book.enabled===false?'启用':'停用'}${esc(book.name||'未命名世界书')}" title="${book.enabled===false?'未启用':'已启用'}" class="global-worldbook-book-toggle ${book.enabled===false?'':'is-on'}" data-global-worldbook-book-enabled="${esc(book.id)}"><i></i></button></div>`).join('')}</div><div class="global-worldbook-scope"><span>读取范围</span><div role="group" aria-label="${esc(selectedBook.name||'当前世界书')}读取范围">${[['online','线上'],['offline','线下'],['both','线上线下']].map(([value,label])=>`<button type="button" data-global-worldbook-scope="${value}" aria-pressed="${(selectedBook.scope||'both')===value}">${label}</button>`).join('')}</div></div><p class="global-worldbook-import-status" data-global-worldbook-status aria-live="polite"></p><form class="global-worldbook-editor" data-global-worldbook-form hidden><label>名称<input name="name" maxlength="100" required placeholder="输入条目名称"></label><label>关键词<input name="keys" maxlength="300" placeholder="多个关键词用逗号分隔"></label><label>内容<textarea name="content" rows="5" required placeholder="填写这条世界书内容"></textarea></label><div><button type="button" data-global-worldbook-cancel>取消</button><button type="submit">保存条目</button></div></form><div class="global-worldbook-list">${entries.length?entries.map((entry,index)=>`<article class="global-worldbook-entry"><div class="global-worldbook-entry-top"><details><summary><strong>${esc(entry.name||`条目 ${index+1}`)}</strong><small>${esc((entry.keys||[]).join(' · '))}</small></summary><p>${esc(entry.content||'')}</p></details><button type="button" data-global-worldbook-enabled="${index}" class="global-worldbook-toggle ${entry.enabled===false?'':'is-on'}" aria-label="${entry.enabled===false?'启用':'停用'}${esc(entry.name||'条目')}"><i></i></button><div class="global-worldbook-actions"><button type="button" data-global-worldbook-edit="${index}">编辑</button><button type="button" data-global-worldbook-delete="${index}">删除</button></div></div></article>`).join(''):`<div class="global-worldbook-empty">还没有全局世界书条目。</div>`}</div></section>`;
}
function parseGlobalWorldBookText(text){
 const normalized=text.replace(/\r\n?/g,'\n').trim();if(!normalized)return [];
 const blocks=normalized.split(/\n\s*(?:---{2,}|==={2,})\s*\n|\n(?=#{1,3}\s)|\n\s*\n(?=(?:name|名称|标题)\s*[:：=])/i).map(block=>block.trim()).filter(Boolean);
 return blocks.map((block,index)=>{
  const lines=block.split('\n'),nameLine=lines.findIndex(line=>/^\s*(?:name|title|名称|标题|条目名称)\s*[:：=]/i.test(line)),keysLine=lines.findIndex(line=>/^\s*(?:keys?|keywords?|triggers?|关键词|关键字|触发词)\s*[:：=]/i.test(line)),contentLine=lines.findIndex(line=>/^\s*(?:content|text|内容|正文)\s*[:：=]\s*/i.test(line));
  const capture=(line,re)=>line<0?null:lines[line].replace(re,'').trim();
  let name=capture(nameLine,/^\s*(?:name|title|名称|标题|条目名称)\s*[:：=]\s*/i),keys=capture(keysLine,/^\s*(?:keys?|keywords?|triggers?|关键词|关键字|触发词)\s*[:：=]\s*/i),content='';
  if(contentLine>=0)content=lines.slice(contentLine).join('\n').replace(/^\s*(?:content|text|内容|正文)\s*[:：=]\s*/i,'').trim();
  else{const body=lines.filter((_,i)=>i!==nameLine&&i!==keysLine).join('\n').trim();content=body.replace(/^#{1,3}\s+[^\n]+\n?/,'').trim();if(!name&&/^#{1,3}\s+/.test(lines[0]))name=lines[0].replace(/^#{1,3}\s+/,'').trim()}
  if(!name&&contentLine<0&&keysLine<0&&nameLine<0){const first=lines.find(line=>line.trim());if(first&&!/^#{1,3}\s/.test(first)&&first.length<60&&!/[。！？.!?]$/.test(first)){name=first;content=lines.slice(lines.indexOf(first)+1).join('\n').trim()}}
  return {name:name||`条目 ${index+1}`,keys:(keys||'').split(/[,，、;；]/).map(key=>key.trim()).filter(Boolean),content,enabled:true};
 }).filter(entry=>entry.content||entry.keys.length);
}
function normalizeGlobalWorldBookJSON(parsed){
 const standard=CharacterImport.normalizeWorldBook(parsed,parsed?.data||parsed);if(standard.length)return standard;
 const looksLikeEntry=value=>value&&typeof value==='object'&&!Array.isArray(value)&&('content'in value||'text'in value||'keys'in value||'key'in value||'keywords'in value||'triggers'in value);
 const toEntries=value=>Array.isArray(value)?value:(value&&typeof value==='object'?Object.entries(value).map(([id,entry])=>({id,...entry})):[]);
 const candidates=[];const visit=(value,depth=0)=>{if(!value||typeof value!=='object'||depth>6)return;if(Array.isArray(value)){if(value.some(looksLikeEntry))candidates.push(value);return}for(const key of ['entries','character_book','characterBook','worldbook','worldBook','world_book','lorebook','loreBook','book'])if(value[key]!==undefined){const nested=value[key];if(key==='entries'||(Array.isArray(nested)||nested?.entries))candidates.push(nested?.entries??nested);visit(nested,depth+1)}if(value.data)visit(value.data,depth+1)};
 visit(parsed);
 for(const candidate of candidates){const list=toEntries(candidate);if(!list.length||!list.some(looksLikeEntry))continue;const normalized=CharacterImport.normalizeWorldBook({character_book:{entries:list}});if(normalized.length)return normalized;return list.filter(looksLikeEntry).map((entry,index)=>{const raw=entry.keys??entry.keywords??entry.key??entry.triggers??[];return {id:String(entry.id??entry.uid??`global-${Date.now()}-${index}`),name:String(entry.comment??entry.name??entry.title??`条目 ${index+1}`),keys:(Array.isArray(raw)?raw:String(raw||'').split(/[,，、\n]/)).map(key=>String(key).trim()).filter(Boolean),content:String(entry.content??entry.text??entry.description??''),enabled:entry.enabled!==false&&entry.disabled!==true,constant:Boolean(entry.constant),selective:Boolean(entry.selective)}}).filter(entry=>entry.content||entry.keys.length)}
 return [];
}
async function parseGlobalWorldBookFile(file){
 if(file.size>12*1024*1024)throw Error('请选择小于 12 MB 的文件');
 const ext=file.name.split('.').pop().toLowerCase();if(!['json','txt','docx'].includes(ext))throw Error('支持 JSON、TXT、DOCX 格式');
 const bytes=new Uint8Array(await file.arrayBuffer());let entries=[];
 if(ext==='json'){
  let parsed;try{parsed=JSON.parse(new TextDecoder('utf-8').decode(bytes).replace(/^\uFEFF/,''))}catch{throw Error('无法读取 JSON，请确认文件格式正确')}
  entries=normalizeGlobalWorldBookJSON(parsed);
  if(!entries.length)throw Error('JSON 中没有识别到条目。请确认文件包含 entries，且条目含 content 与关键词字段。');
 }else{
  const text=ext==='docx'?await CharacterImport.docxText(bytes):new TextDecoder('utf-8').decode(bytes).replace(/^\uFEFF/,'');
  entries=parseGlobalWorldBookText(text);if(!entries.length)throw Error('文件中未识别到世界书内容');
 }
 return entries;
}
function bindGlobalWorldBookPanel(){
 const content=$('#featurePageContent'),redraw=()=>{renderFeaturePage('worldbook')};
 const bookForm=content.querySelector('[data-global-worldbook-book-form]'),renameForm=content.querySelector('[data-global-worldbook-rename-form]');
 content.querySelector('[data-global-worldbook-new-book]')?.addEventListener('click',()=>{bookForm.hidden=false;bookForm.elements.name.focus()});
 content.querySelector('[data-global-book-cancel]')?.addEventListener('click',()=>{bookForm.hidden=true;bookForm.reset()});
 content.querySelector('[data-global-worldbook-edit-book]')?.addEventListener('click',()=>{renameForm.elements.name.value=activeGlobalWorldBook()?.name||'';renameForm.hidden=false;renameForm.elements.name.focus();renameForm.elements.name.select()});
 content.querySelector('[data-global-book-rename-cancel]')?.addEventListener('click',()=>{renameForm.hidden=true;renameForm.reset()});
 renameForm.onsubmit=event=>{event.preventDefault();const book=activeGlobalWorldBook(),name=renameForm.elements.name.value.trim();if(!book||!name)return;book.name=name;save();redraw()};
 content.querySelector('[data-global-worldbook-delete-book]')?.addEventListener('click',()=>{const book=activeGlobalWorldBook();if(!book||!window.confirm(`删除「${book.name||'未命名世界书'}」及其中 ${book.entries.length} 条内容？`))return;const index=state.globalWorldBooks.findIndex(item=>item.id===book.id);if(index>=0)state.globalWorldBooks.splice(index,1);if(!state.globalWorldBooks.length)state.globalWorldBooks.push({id:`global-${Date.now()}`,name:'默认世界书',entries:[]});state.activeGlobalWorldBookId=state.globalWorldBooks[Math.min(Math.max(index,0),state.globalWorldBooks.length-1)].id;save();redraw()});
 bookForm.onsubmit=event=>{event.preventDefault();const book={id:'global-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),name:bookForm.elements.name.value.trim(),entries:[],enabled:true,scope:'both'};state.globalWorldBooks.push(book);state.activeGlobalWorldBookId=book.id;save();redraw()};
 content.querySelectorAll('[data-global-worldbook-select]').forEach(button=>button.addEventListener('click',()=>{state.activeGlobalWorldBookId=button.dataset.globalWorldbookSelect;save();redraw()}));
 content.querySelectorAll('[data-global-worldbook-book-enabled]').forEach(button=>button.addEventListener('click',()=>{const book=state.globalWorldBooks.find(item=>item.id===button.dataset.globalWorldbookBookEnabled);if(!book)return;book.enabled=book.enabled===false;save();redraw()}));
 content.querySelectorAll('[data-global-worldbook-scope]').forEach(button=>button.addEventListener('click',()=>{const book=activeGlobalWorldBook(),scope=button.dataset.globalWorldbookScope;if(!book||!['online','offline','both'].includes(scope))return;book.scope=scope;content.querySelectorAll('[data-global-worldbook-scope]').forEach(option=>option.setAttribute('aria-pressed',String(option===button)));save()}));
 const fileInput=content.querySelector('[data-global-worldbook-file]'),status=content.querySelector('[data-global-worldbook-status]');
 content.querySelector('[data-global-worldbook-import]')?.addEventListener('click',()=>fileInput.click());
 fileInput.onchange=async()=>{const file=fileInput.files?.[0];if(!file)return;status.textContent='正在读取世界书……';try{const imported=await parseGlobalWorldBookFile(file),book={id:`global-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,name:file.name.replace(/\.[^.]+$/,'')||'导入的世界书',entries:imported,enabled:true,scope:'both'};state.globalWorldBooks.push(book);state.activeGlobalWorldBookId=book.id;save();redraw();$('#featurePageContent').querySelector('[data-global-worldbook-status]').textContent=`已导入「${book.name}」，共 ${imported.length} 条。`}catch(error){status.textContent=error.message||'导入失败，请检查文件内容。'}finally{fileInput.value=''}};

 content.querySelector('[data-global-worldbook-add]')?.addEventListener('click',()=>{const form=content.querySelector('[data-global-worldbook-form]');form.reset();delete form.dataset.entryIndex;form.hidden=false;form.elements.name.focus()});
 content.querySelector('[data-global-worldbook-cancel]')?.addEventListener('click',()=>{const form=content.querySelector('[data-global-worldbook-form]');form.hidden=true;delete form.dataset.entryIndex});
 content.querySelectorAll('[data-global-worldbook-enabled]').forEach(button=>button.onclick=()=>{const entry=activeGlobalWorldBook().entries[Number(button.dataset.globalWorldbookEnabled)];if(!entry)return;entry.enabled=entry.enabled===false;button.classList.toggle('is-on',entry.enabled!==false);button.setAttribute('aria-label',`${entry.enabled===false?'启用':'停用'}${entry.name||'条目'}`);save()});
 content.querySelectorAll('[data-global-worldbook-edit]').forEach(button=>button.onclick=()=>{const index=Number(button.dataset.globalWorldbookEdit),entry=activeGlobalWorldBook().entries[index],form=content.querySelector('[data-global-worldbook-form]');if(!entry||!form)return;form.dataset.entryIndex=String(index);form.elements.name.value=entry.name||'';form.elements.keys.value=(entry.keys||[]).join(', ');form.elements.content.value=entry.content||'';form.hidden=false;form.elements.name.focus()});
 content.querySelectorAll('[data-global-worldbook-delete]').forEach(button=>button.onclick=()=>{activeGlobalWorldBook().entries.splice(Number(button.dataset.globalWorldbookDelete),1);save();redraw()});
 const form=content.querySelector('[data-global-worldbook-form]');if(form)form.onsubmit=event=>{event.preventDefault();const entry={name:form.elements.name.value.trim(),keys:form.elements.keys.value.split(',').map(value=>value.trim()).filter(Boolean),content:form.elements.content.value.trim(),enabled:true},index=Number(form.dataset.entryIndex);if(Number.isInteger(index))entry.enabled=activeGlobalWorldBook().entries[index]?.enabled!==false;if(Number.isInteger(index))activeGlobalWorldBook().entries[index]=entry;else activeGlobalWorldBook().entries.push(entry);save();redraw()};
}
function saveOfflineRecord(){
 const threadKey=key(),conversation=messages().map(message=>({...message}));if(!conversation.length){toast('先在线下模式写下一段内容，再保存记录');return false}
 const character=chars[state.char],roleSettings=currentRoleChatSettings(),user=state.users[Number.isInteger(roleSettings.userIndex)?roleSettings.userIndex:state.user],offlineData=currentRoleOfflineData(),summaryConfig=apiConfigForFeature('offlineSummary'),summaryReady=Boolean(summaryConfig?.url&&summaryConfig?.key&&apiModelForFeature('offlineSummary',summaryConfig));const record={id:'offline-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),characterIndex:state.char,characterName:character?.name||'未命名角色',userName:user?.name||'用户',createdAt:Date.now(),messages:conversation,summary:summaryReady?'正在生成总结…':'未配置线下总结 API'};offlineData.records.unshift(record);
 const replyTimer=chatReplyTimers.get(threadKey);if(replyTimer)clearTimeout(replyTimer);chatReplyTimers.delete(threadKey);pendingReplyKeys.delete(threadKey);state.messages[threadKey]=[];archiveOfflineStageMemory(threadKey);save();if($('#settingsScreen').hidden)render();toast(summaryReady?'线下记录已保存，正在整理总结':'记录已保存，请在 API 设置中配置线下总结');if(summaryReady){const transcript=conversation.map(message=>(message.mine?record.userName:record.characterName)+'：'+offlineMainStoryContent(message)).join('\n');void requestConfiguredSummary('offlineSummary',transcript,'请总结这段线下故事记录，保留重要事件、角色关系变化、明确约定、未解决的问题和可确认的情绪变化。区分用户和角色，不把推测写成事实，不添加后续剧情。用精炼中文输出 2 至 5 句，只输出总结正文。',900).then(summary=>{const saved=offlineData.records.find(item=>item.id===record.id);if(!saved)return;saved.summary=summary||'本次总结未能生成。';if(summary)syncOfflineSummaryToChatMemory(saved,character);save();const summaryNode=[...document.querySelectorAll('[data-offline-record-summary]')].find(node=>node.dataset.offlineRecordSummary===record.id);if(summaryNode)summaryNode.textContent=saved.summary})}return true;
}
function offlineSummaryMemoryId(record){return`memory-offline-summary-${record.id}`}
function hasCompletedOfflineSummary(record){const summary=String(record?.summary||'').trim();return Boolean(summary&&!['正在生成总结…','未配置线下总结 API','本次总结未能生成。'].includes(summary))}
function syncOfflineSummaryToChatMemory(record,role=chars[record?.characterIndex]){const roleIndex=chars.indexOf(role);if(roleIndex<0||!record?.id||!hasCompletedOfflineSummary(record))return false;role.chatSettings||={};const memory={...defaultOnlineMemory,...(role.chatSettings.memory||{})},entries=Array.isArray(memory.entries)?memory.entries:[],id=offlineSummaryMemoryId(record),existing=entries.find(entry=>entry.id===id);if(existing){existing.scope='offline';existing.owner='shared';existing.title=`线下总结 · ${record.characterName||role.name||'角色'}`;existing.content=String(record.summary).trim();existing.updatedAt=Number(record.createdAt)||Date.now();existing.source='offline-summary';existing.recordId=record.id}else entries.unshift({id,scope:'offline',owner:'shared',title:`线下总结 · ${record.characterName||role.name||'角色'}`,content:String(record.summary).trim(),updatedAt:Number(record.createdAt)||Date.now(),source:'offline-summary',recordId:record.id});role.chatSettings.memory={...memory,entries};if(state.char===roleIndex)onlineMemoryEntries=entries.map(entry=>({...entry}));save();if(state.char===roleIndex&&!$('#settingsScreen').hidden&&modeSettings&&settingsSection==='online'&&onlineSettingsTab==='memory')refreshSettings();return true}
function syncExistingOfflineSummariesToChatMemory(role=chars[state.char]){if(!role||!role.chatSettings||role.chatSettings.offlineSummaryMemoryMigration===1)return;const roleIndex=chars.indexOf(role),memory={...defaultOnlineMemory,...(role.chatSettings.memory||{})},entries=Array.isArray(memory.entries)?memory.entries:[];for(const record of role.offlineData?.records||[]){if(!record.id||!hasCompletedOfflineSummary(record)||entries.some(entry=>entry.id===offlineSummaryMemoryId(record)))continue;entries.push({id:offlineSummaryMemoryId(record),scope:'offline',owner:'shared',title:`线下总结 · ${record.characterName||role.name||'角色'}`,content:String(record.summary).trim(),updatedAt:Number(record.createdAt)||Date.now(),source:'offline-summary',recordId:record.id})}role.chatSettings.memory={...memory,entries};role.chatSettings.offlineSummaryMemoryMigration=1;if(roleIndex===state.char)onlineMemoryEntries=entries.map(entry=>({...entry}));save()}
function removeOfflineSummaryFromChatMemory(record,role=chars[state.char]){const entries=role?.chatSettings?.memory?.entries;if(!Array.isArray(entries)||!record?.id)return;role.chatSettings.memory.entries=entries.filter(entry=>entry.id!==offlineSummaryMemoryId(record))}
function renderOfflineRegexRule(rule,index,blocked='',scope='settings'){
 const key=index==='draft'?'draft':String(index),draft=index==='draft',targets=Array.isArray(rule.target)?rule.target:[rule.target||'ai'];
 return `<article class="offline-regex-item" data-offline-regex-index="${key}" data-offline-regex-scope="${scope}"><details class="offline-regex-rule"><summary>${esc(rule.name||'未命名正则')}<i aria-hidden="true"></i></summary><div class="offline-regex-rule-content"><header><label>正则名称<input data-regex-prop="name" maxlength="80" value="${esc(rule.name||'')}" placeholder="例如：隐藏指定片段"${blocked}></label><fieldset class="offline-regex-scopes"><legend>匹配对象</legend><label><input type="checkbox" data-regex-target value="ai" ${targets.includes('ai')?'checked':''}${blocked}>AI 输出</label><label><input type="checkbox" data-regex-target value="user" ${targets.includes('user')?'checked':''}${blocked}>用户输出</label></fieldset></header><fieldset class="offline-regex-scopes offline-regex-lanes"><legend>处理位置</legend><label><input type="checkbox" data-regex-context ${rule.contextEnabled!==false?'checked':''}${blocked}>后续上下文</label><label><input type="checkbox" data-regex-display ${rule.displayEnabled?'checked':''}${blocked}>界面显示</label></fieldset><label>查找正则<textarea data-regex-prop="find" rows="3" maxlength="4000" placeholder="/查找表达式/标志"${blocked}>${esc(rule.find||'')}</textarea></label><label>替换正则<textarea data-regex-prop="replace" rows="2" maxlength="4000" placeholder="留空表示删除匹配内容"${blocked}>${esc(rule.replace||'')}</textarea></label><details class="offline-regex-test"><summary>测试规则</summary><div><label>测试内容<textarea data-regex-test-input rows="3" maxlength="12000" placeholder="输入一段测试文本"${blocked}></textarea></label><div class="offline-regex-test-options"><select data-regex-test-lane aria-label="测试处理位置"><option value="context">后续上下文</option><option value="display">界面显示</option></select><select data-regex-test-target aria-label="测试对象"><option value="ai">AI 输出</option><option value="user">用户输出</option></select><button type="button" data-regex-test${blocked}>运行测试</button></div><div class="offline-regex-test-result" data-regex-test-result hidden><small>替换前</small><pre data-regex-test-before></pre><small>替换后</small><pre data-regex-test-after></pre></div></div></details></div></details><div class="offline-config-actions">${draft?`<button type="button" class="offline-extra-cancel" data-regex-cancel${blocked}>取消</button>`:''}<button type="button" class="offline-extra-save" data-regex-save="${key}"${blocked}>保存</button><label class="offline-config-switch" aria-label="启用${esc(rule.name||'正则')}"><input type="checkbox" data-regex-enabled ${rule.enabled!==false?'checked':''}${blocked}><i></i></label>${draft?'':`<button type="button" class="offline-extra-remove" data-regex-delete="${key}"${blocked}>删除</button>`}</div></article>`
}
function renderOfflineStageMemoryPanel(){const threadKey=key(),slot=offlineStageMemorySession(threadKey),sessions=Object.values(slot?.session.sessions||{}).sort((a,b)=>String(a.id).localeCompare(String(b.id))),currentId=slot?.session.currentId||'',cards=sessions.flatMap(session=>[...(session.small||[]).map(item=>({session,kind:'small',item})),...(session.large||[]).map(item=>({session,kind:'large',item}))]).sort((a,b)=>a.item.fromRound-b.item.fromRound||(a.kind==='large'?-1:1));return `<section class="offline-stage-memory-panel"><header><strong>阶段记忆</strong><small>只用于当前线下聊天的上下文压缩，与线下总结记录分开保存。</small></header>${slot?.current.error?`<p class="offline-stage-memory-status" role="status">${esc(slot.current.error)}</p>`:''}${cards.length?cards.map(({session,kind,item})=>{const isCurrent=session.id===currentId,stale=Boolean(item.stale),title=kind==='small'?'小总结':'大总结';return `<article class="offline-stage-memory-card ${stale?'is-stale':''}"><details><summary><span>${title} · 第 ${item.fromRound}—${item.toRound} 轮</span><small>${session.archived?'已归档':stale?'待重新计算':'可用于上下文'}</small></summary><textarea data-stage-memory-text data-session-id="${esc(session.id)}" data-stage-memory-kind="${kind}" data-stage-memory-from="${item.fromRound}" rows="5" maxlength="4000">${esc(item.summary||'')}</textarea><footer><button type="button" data-stage-memory-save data-session-id="${esc(session.id)}" data-stage-memory-kind="${kind}" data-stage-memory-from="${item.fromRound}">保存修改</button><button type="button" data-stage-memory-regenerate data-session-id="${esc(session.id)}" data-stage-memory-kind="${kind}" data-stage-memory-from="${item.fromRound}" ${isCurrent?'':'disabled'}>重新生成</button></footer></details></article>`}).join(''):'<div class="offline-stage-memory-empty"><strong>还没有阶段记忆</strong><span>完成 20 轮有效对话后生成第一份小总结。</span></div>'}<p class="offline-stage-memory-footnote">只有成功生成且来源未被修改的阶段记忆会替代上下文中的旧正文。失败或失效时，原始聊天内容继续提供给 AI。</p></section>`}
function bindOfflineStageMemoryPanel(body){if(!body)return;body.querySelectorAll('[data-stage-memory-save]').forEach(button=>button.onclick=()=>{const slot=offlineStageMemorySession(key()),session=slot?.session.sessions[button.dataset.sessionId],list=button.dataset.stageMemoryKind==='small'?session?.small:session?.large,item=list?.find(value=>value.fromRound===Number(button.dataset.stageMemoryFrom)),field=body.querySelector(`[data-stage-memory-text][data-session-id="${button.dataset.sessionId}"][data-stage-memory-kind="${button.dataset.stageMemoryKind}"][data-stage-memory-from="${button.dataset.stageMemoryFrom}"]`);if(!item||!field)return;item.summary=field.value.trim();item.editedAt=Date.now();if(session.id===slot.session.currentId){if(button.dataset.stageMemoryKind==='large'){const parts=session.small.filter(value=>value.fromRound>=item.fromRound&&value.toRound<=item.toRound).sort((a,b)=>a.fromRound-b.fromRound);if(parts.length===5&&parts.every(value=>!value.stale))item.sourceHash=offlineStageHash(parts.map(value=>`${value.sourceHash}:${value.summary}`).join('\n'))}reconcileOfflineStageMemory(key(),messages())}save();toast('阶段记忆已保存');body.innerHTML=renderOfflineSettingsPanel('stage-memory');bindOfflineStageMemoryPanel(body)});body.querySelectorAll('[data-stage-memory-regenerate]').forEach(button=>button.onclick=async()=>{if(button.disabled)return;button.disabled=true;button.textContent='正在生成…';const ok=await regenerateOfflineStageMemory(key(),button.dataset.stageMemoryKind,Number(button.dataset.stageMemoryFrom));toast(ok?'阶段记忆已重新生成':'重新生成失败，原始上下文仍会保留');body.innerHTML=renderOfflineSettingsPanel('stage-memory');bindOfflineStageMemoryPanel(body)})}
function renderOfflineSettingsPanel(tab){
 const offlineData=currentRoleOfflineData();
 if(tab==='stage-memory')return renderOfflineStageMemoryPanel();
 if(tab==='settings'){
  const settings=offlineData.settings||createOfflineSettings(),blocked='';
  const personOptions=[['first','第一人称 · 我'],['second','第二人称 · 你'],['third','第三人称 · 姓名 / 他她']];
  const allStyles=[...Object.entries(offlineWritingStyles).map(([id,item])=>({id,name:item.name})),...settings.customStyles.map(item=>({id:item.id,name:item.name,custom:true}))],currentStyle=offlineStyleForSettings(settings),styleOptions=allStyles.map(item=>`<option value="${esc(item.id)}" ${item.id===settings.style?'selected':''}>${esc(item.name)}${item.custom?' · 自定义':''}</option>`).join(''),currentCustom=settings.customStyles.some(item=>item.id===settings.style),promptTemplates=settings.promptTemplates||[],activePromptTemplate=promptTemplates.find(item=>item.id===settings.activePromptTemplateId)||null,promptOptions=`<option value="">Iris 内置提示词</option>${promptTemplates.map(item=>`<option value="${esc(item.id)}" ${item.id===settings.activePromptTemplateId?'selected':''}>${esc(item.name)} · 自定义</option>`).join('')}`;
  return `<section class="offline-general-settings"><p class="offline-general-kicker">STORY SETTINGS</p><div class="offline-general-grid"><label>角色人称<select data-offline-setting="rolePerspective"${blocked}>${personOptions.map(([value,label])=>`<option value="${value}" ${settings.rolePerspective===value?'selected':''}>${label}</option>`).join('')}</select></label><label>用户人称<select data-offline-setting="userPerspective"${blocked}>${personOptions.map(([value,label])=>`<option value="${value}" ${settings.userPerspective===value?'selected':''}>${label}</option>`).join('')}</select></label><label>用户参与方式<select data-offline-setting="userAgency"${blocked}><option value="takeover" ${settings.userAgency==='takeover'?'selected':''}>抢话</option><option value="no-takeover" ${settings.userAgency==='no-takeover'?'selected':''}>不抢话</option></select></label><label>段落要求<select data-offline-setting="paragraphRequirement"><option value="long" ${settings.paragraphRequirement==='long'?'selected':''}>长段落</option><option value="short" ${settings.paragraphRequirement==='short'?'selected':''}>短段落</option><option value="alternating" ${settings.paragraphRequirement==='alternating'?'selected':''}>长短交替</option></select></label><label>设定字数<input data-offline-setting="wordCount" type="number" min="100" max="5000" step="100" value="${esc(settings.wordCount)}"${blocked}></label><label>推进速度<select data-offline-setting="pacing"><option value="fast" ${settings.pacing==='fast'?'selected':''}>快节奏</option><option value="slow" ${settings.pacing==='slow'?'selected':''}>慢节奏</option><option value="free" ${settings.pacing==='free'?'selected':''}>自由变奏</option></select></label><fieldset class="offline-paragraph-ranges"><legend>全文段落数范围</legend><div><label>最少<span><input data-offline-setting="paragraphCountMin" type="number" min="1" max="30" step="1" value="${settings.paragraphCountMin}"${blocked}>段</span></label><label>最多<span><input data-offline-setting="paragraphCountMax" type="number" min="1" max="30" step="1" value="${settings.paragraphCountMax}"${blocked}>段</span></label></div></fieldset><details class="offline-style-fold"><summary>文风 <i aria-hidden="true"></i></summary><section class="offline-style-manager"><header><span>文风<small>选择后查看当前文风内容</small></span><button type="button" data-offline-style-add${blocked}>新增文风 ＋</button></header><label class="offline-style-picker">选择文风<select data-offline-setting="style"${blocked}>${styleOptions}</select></label><form class="offline-style-form" data-offline-style-form hidden><label>文风名称<input name="name" maxlength="60" required placeholder="为你的文风命名"></label><label>具体文风<textarea name="prompt" rows="7" maxlength="12000" required placeholder="写下你希望采用的叙述方式、描写重点与节奏"></textarea></label><div><button type="button" data-offline-style-cancel>取消</button><button type="submit">保存文风</button></div></form><div class="offline-selected-style"><header><strong data-offline-style-current-name>${esc(currentStyle.name)}</strong><div><button type="button" data-offline-style-edit-selected ${currentCustom?'':'hidden'}${blocked}>编辑文风</button><button type="button" data-offline-style-delete-selected ${currentCustom?'':'hidden'}${blocked}>删除文风</button></div></header><textarea data-offline-style-detail rows="8" maxlength="12000" aria-label="当前文风的具体内容"${blocked}>${esc(currentStyle.prompt)}</textarea></div></section></details><details class="offline-general-prompt"><summary><span>内置提示词</span><small>默认内容隐藏 · 可新增并替换</small><i aria-hidden="true"></i></summary><div class="offline-prompt-manager"><label class="offline-prompt-picker">当前使用<select data-offline-prompt-select${blocked}>${promptOptions}</select></label><p class="offline-prompt-active-note" data-offline-prompt-note>${activePromptTemplate?`「${esc(activePromptTemplate.name)}」正在替换 Iris 内置提示词。`:'正在使用 Iris 内置提示词。默认内容不会显示。'}</p><div class="offline-prompt-selected" data-offline-prompt-selected ${activePromptTemplate?'':'hidden'}><header><strong data-offline-prompt-name>${esc(activePromptTemplate?.name||'')}</strong><div><button type="button" data-offline-prompt-edit${blocked}>编辑</button><button type="button" data-offline-prompt-delete${blocked}>删除</button></div></header><textarea data-offline-prompt-detail rows="8" maxlength="24000" aria-label="当前替换提示词内容"${blocked}>${esc(activePromptTemplate?.content||'')}</textarea></div><button type="button" class="offline-prompt-add" data-offline-prompt-add${blocked}>新增提示词并替换内置提示词 ＋</button><form class="offline-prompt-form" data-offline-prompt-form hidden><label>提示词名称<input name="name" maxlength="60" required placeholder="例如：都市日常叙事"></label><label>完整提示词<textarea name="content" rows="8" maxlength="24000" required placeholder="写下完整的角色规则、故事要求和输出格式"></textarea></label><div><button type="button" data-offline-prompt-cancel>取消</button><button type="submit">保存并启用</button></div></form><details class="offline-prompt-guide"><summary>怎么写自己的提示词</summary><div class="offline-prompt-guide-content"><p><strong>先分清三种内容：</strong>“Iris 内置提示词”使用 Iris 自带规则；你新增并选中的提示词会<strong>整份替换</strong>默认规则；“额外补充”会附加在当前提示词后面。</p><ol><li>点“新增提示词并替换内置提示词”，填写名称和完整正文，再点“保存并启用”。新提示词会立即生效，也会保存在当前角色的线下设置里。</li><li>正文建议依次写：角色身份与目标 → 资料读取顺序 → 用户和角色各自能做什么 → 视角、文风与节奏 → 回复长度和格式 → 禁止事项。每条写成模型能照做的动作要求。</li><li>需要把当前资料带入提示词时，使用下方变量，保留双大括号和变量名原样。Iris 会在每轮发送前填入。</li></ol><p>XML 风格标签可以帮助分区，示例：</p><pre class="offline-prompt-example"><code>&lt;identity&gt;你正在扮演 {{char_name}}。&lt;/identity&gt;
&lt;context&gt;全局世界书：{{global_worldbook}}
角色世界书：{{character_worldbook}}
合并世界背景（兼容旧模板）：{{world_background}}
线下记录：{{offline_history}}&lt;/context&gt;
&lt;turn&gt;回应：{{user_message}}
遵守：{{user_agency_rule}}&lt;/turn&gt;
&lt;output&gt;采用 {{writing_style}}；约 {{reply_length}} 字。&lt;/output&gt;</code></pre><p><strong>Iris 当前支持的变量：</strong></p><ul><li><code>{{char_name}}</code> 当前角色名；<code>{{user_name}}</code> 当前聊天用户</li><li><code>{{char_person}}</code> 角色人称；<code>{{user_person}}</code> 用户人称</li><li><code>{{user_agency_rule}}</code> 抢话 / 不抢话规则；<code>{{reply_length}}</code> 设定字数</li><li><code>{{global_worldbook}}</code> 当前选中的全局世界书；仅当读取范围包含当前聊天模式时提供内容</li><li><code>{{character_worldbook}}</code> 当前角色启用的角色世界书</li><li><code>{{world_background}}</code> 兼容变量，包含角色世界书和当前模式可读取的全局世界书</li><li><code>{{online_chat}}</code> 最近 20 条线上消息；<code>{{offline_history}}</code> 最近 30 条线下消息</li><li><code>{{user_message}}</code> 用户最新一条输入；<code>{{scene}}</code> 当前场景提示</li><li><code>{{writing_style}}</code> 当前选中文风及通用文风规则</li></ul><p>当前默认模板里的变量都能被 Iris 识别；<code>{{user_message}}</code> 虽未写在默认模板中，也可以放进你自己的模板。拼错或自创的变量不会被填入，会原样保留。</p></div></details></div></details><section class="offline-extra-settings"><nav class="offline-extra-tabs" aria-label="额外设置分类"><button type="button" data-offline-extra-tab="requirements" class="${offlineExtraSettingsTab==='requirements'?'active':''}" aria-pressed="${offlineExtraSettingsTab==='requirements'}">额外要求</button><button type="button" data-offline-extra-tab="regex" class="${offlineExtraSettingsTab==='regex'?'active':''}" aria-pressed="${offlineExtraSettingsTab==='regex'}">正则</button></nav><div class="offline-extra-pane" data-offline-extra-pane="requirements" ${offlineExtraSettingsTab==='requirements'?'':'hidden'}>${settings.draftCotDeleted?`<button type="button" class="offline-extra-add" data-draft-cot-add${blocked}>＋ 添加草稿COT</button>`:`<article class="offline-config-item"><details class="offline-extra-fold"><summary>草稿COT<i aria-hidden="true"></i></summary><textarea class="offline-draft-cot-content" data-draft-cot-input rows="16" aria-label="草稿 COT 内容"${blocked}>${esc(offlineDraftInstructionForSettings(settings))}</textarea></details><div class="offline-config-actions"><button type="button" class="offline-extra-save" data-draft-cot-save${blocked}>保存</button><label class="offline-config-switch" aria-label="启用草稿COT"><input type="checkbox" data-draft-cot-enabled ${settings.draftCotEnabled?'checked':''}${blocked}><i></i></label><button type="button" class="offline-extra-remove" data-draft-cot-delete${blocked}>删除</button></div></article>`}${settings.miniTheaterDeleted?`<button type="button" class="offline-extra-add" data-mini-theater-add${blocked}>＋ 添加随机互动小剧场</button>`:`<article class="offline-config-item"><details class="offline-extra-fold"><summary>随机互动小剧场<i aria-hidden="true"></i></summary><textarea class="offline-draft-cot-content offline-mini-theater-prompt" data-mini-theater-prompt rows="18" maxlength="24000" aria-label="随机互动小剧场提示词"${blocked}>${esc(String(settings.miniTheaterPrompt||"").trim()||IrisMiniTheater.prompt)}</textarea><div class="offline-config-actions offline-mini-theater-prompt-actions"><button type="button" class="offline-extra-save" data-mini-theater-prompt-save${blocked}>保存</button></div></details><div class="offline-config-actions"><label class="offline-config-switch" aria-label="启用随机互动小剧场"><input type="checkbox" data-mini-theater-enabled ${settings.miniTheaterEnabled?'checked':''}${blocked}><i></i></label><button type="button" class="offline-extra-remove" data-mini-theater-delete${blocked}>删除</button></div></article>`}${renderOfflineGenerationDiagnostics(offlineData.lastGeneration)}${offlineRequirementDraftRole===chars[state.char]||settings.customPromptEnabled||settings.customPrompt?`<article class="offline-config-item"><details class="offline-extra-fold"><summary>${esc(settings.customPromptName||'额外要求')}<i aria-hidden="true"></i></summary><div class="offline-extra-field"><label class="offline-extra-name">名称<input data-offline-extra-name="requirements" maxlength="60" value="${esc(settings.customPromptName||'额外要求')}" placeholder="额外要求名称"${blocked}></label><textarea data-offline-extra-input="requirements" rows="5" maxlength="24000" placeholder="补充希望角色回复遵循的要求…"${blocked}>${esc(settings.customPrompt||'')}</textarea><footer><button type="button" class="offline-extra-cancel" data-offline-extra-cancel="requirements"${blocked}>取消</button></footer></div></details><div class="offline-config-actions"><button type="button" class="offline-extra-save" data-offline-extra-save="requirements"${blocked}>保存</button><label class="offline-config-switch" aria-label="启用额外要求"><input type="checkbox" data-custom-prompt-enabled ${offlineRequirementDraftRole===chars[state.char]||settings.customPromptEnabled?'checked':''}${blocked}><i></i></label><button type="button" class="offline-extra-remove" data-offline-extra-remove="requirements"${blocked}>删除</button></div></article>`:`<button type="button" class="offline-extra-add" data-offline-extra-add="requirements"${blocked}>＋ 添加额外要求</button>`}</div><div class="offline-extra-pane" data-offline-extra-pane="regex" ${offlineExtraSettingsTab==='regex'?'':'hidden'}>${(settings.regexRules||[]).map((rule,index)=>renderOfflineRegexRule(rule,index,blocked)).join('')}${offlineRegexDraft?renderOfflineRegexRule(offlineRegexDraft,'draft',blocked):''}<button type="button" class="offline-extra-add" data-offline-extra-add="regex"${blocked}>＋ 添加正则</button></div></section></div></section>`
 }
 const records=currentRoleOfflineData().records;
 const notes=records.map((record,index)=>{const date=new Intl.DateTimeFormat('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(record.createdAt||Date.now())).replaceAll('/',' . ').replace(' ',' · ');const preview=(record.messages||[]).map(message=>message.text||'').join('　');const transcript=(record.summary?'<p class="offline-record-summary-detail"><strong>总结</strong><span>'+esc(record.summary)+'</span></p>':'')+(record.messages||[]).map(message=>'<p><strong>'+esc(message.mine?record.userName:record.characterName)+'</strong><span>'+esc(message.text||'')+'</span></p>').join('');return '<article class="offline-record-note"><header><span class="offline-record-index">No. '+String(index+1).padStart(2,'0')+'</span><time class="offline-record-date">'+esc(date)+'</time></header><div class="offline-record-meta">'+esc(record.userName||'用户')+' <i>×</i> '+esc(record.characterName||'角色')+'</div><p class="offline-record-preview">'+esc(preview)+'</p>'+(record.summary?'<p class="offline-record-summary" data-offline-record-summary="'+esc(record.id)+'">'+esc(record.summary)+'</p>':'')+'<div class="offline-record-transcript" data-record-transcript hidden>'+transcript+'</div><footer><button type="button" data-record-review="'+esc(record.id)+'">回顾记录</button><button type="button" data-record-delete="'+esc(record.id)+'">删除</button></footer></article>'}).join('');
 return '<section class="offline-records-page"><header class="offline-records-heading"><span>Records <small>'+String(records.length).padStart(2,'0')+'</small></span><button type="button" data-offline-save-record>保存当前聊天 ＋</button></header><div class="offline-records-list">'+(notes||'<div class="offline-records-empty"><span>Offline notes</span><p>在线下模式中保存的故事，会收录在这里。</p></div>')+'</div></section>';
}
function bindOfflineSettingsPanel(panel){
 panel.querySelectorAll('[data-offline-setting-tab]').forEach(button=>button.onclick=()=>{offlineSettingsTab=button.dataset.offlineSettingTab;panel.classList.toggle('is-offline-record-settings',offlineSettingsTab==='records');panel.querySelectorAll('[data-offline-setting-tab]').forEach(tab=>tab.classList.toggle('active',tab===button));panel.querySelector('[data-offline-settings-body]').innerHTML=renderOfflineSettingsPanel(offlineSettingsTab);bindOfflineSettingsPanel(panel)});
 const body=panel.querySelector('[data-offline-settings-body]');
 body.querySelectorAll('.offline-mini-theater-prompt-actions').forEach(row=>{const saveButton=row.querySelector('[data-mini-theater-prompt-save]'),actions=row.closest('.offline-config-item')?.querySelector(':scope > .offline-config-actions');if(saveButton&&actions){row.remove();actions.prepend(saveButton)}});
 bindOfflineStageMemoryPanel(body);
 body.querySelectorAll('[data-offline-extra-tab]').forEach(button=>button.onclick=()=>{offlineExtraSettingsTab=button.dataset.offlineExtraTab;body.querySelectorAll('[data-offline-extra-tab]').forEach(tab=>{const active=tab===button;tab.classList.toggle('active',active);tab.setAttribute('aria-pressed',String(active))});body.querySelectorAll('[data-offline-extra-pane]').forEach(pane=>pane.hidden=pane.dataset.offlineExtraPane!==offlineExtraSettingsTab)});
 const rerenderOfflineExtra=()=>{body.innerHTML=renderOfflineSettingsPanel(offlineSettingsTab);bindOfflineSettingsPanel(panel)};
 const regexRulesForCard=()=>currentRoleOfflineData().settings.regexRules;
 const rerenderRegexScope=()=>rerenderOfflineExtra();
 body.querySelectorAll('[data-offline-extra-add]').forEach(button=>button.onclick=()=>{const isRegex=button.dataset.offlineExtraAdd==='regex';if(isRegex){offlineRegexDraft={name:'新正则',find:'',replace:'',target:['ai'],enabled:true,contextEnabled:true,displayEnabled:false};offlineExtraSettingsTab='regex'}else{offlineRequirementDraftRole=chars[state.char]}rerenderOfflineExtra();const editor=body.querySelector(isRegex?'[data-offline-regex-index="draft"]':'[data-offline-extra-input="requirements"]')?.closest('details');if(editor)editor.open=true;body.querySelector(isRegex?'[data-offline-regex-index="draft"] [data-regex-prop="find"]':'[data-offline-extra-input="requirements"]')?.focus()});
 body.querySelectorAll('[data-draft-cot-add]').forEach(button=>button.onclick=()=>{const settings=currentRoleOfflineData().settings;settings.draftCotDeleted=false;settings.draftCotEnabled=true;save();rerenderOfflineExtra()});
 body.querySelectorAll('[data-draft-cot-save]').forEach(button=>button.onclick=()=>{const content=body.querySelector('[data-draft-cot-input]')?.value||'';if(!content.trim()){toast('请填写草稿 COT 内容');return}currentRoleOfflineData().settings.draftCotPrompt=content;save();toast('草稿 COT 已保存')});
 body.querySelectorAll('[data-mini-theater-enabled]').forEach(control=>control.onchange=()=>{currentRoleOfflineData().settings.miniTheaterEnabled=control.checked;save()});
 body.querySelectorAll('[data-mini-theater-prompt-save]').forEach(button=>button.onclick=()=>{const editor=body.querySelector('[data-mini-theater-prompt]'),content=editor?.value||'';if(!content.trim()){toast('小剧场提示词不能为空');return}currentRoleOfflineData().settings.miniTheaterPrompt=content.slice(0,24000);save();toast('小剧场提示词已保存')});
 body.querySelectorAll('[data-mini-theater-delete]').forEach(button=>button.onclick=()=>{const settings=currentRoleOfflineData().settings;settings.miniTheaterDeleted=true;settings.miniTheaterEnabled=false;save();rerenderOfflineExtra()});
 body.querySelectorAll('[data-mini-theater-add]').forEach(button=>button.onclick=()=>{const settings=currentRoleOfflineData().settings;settings.miniTheaterDeleted=false;settings.miniTheaterEnabled=true;save();rerenderOfflineExtra()});
 body.querySelectorAll('[data-draft-cot-enabled]').forEach(control=>control.onchange=()=>{currentRoleOfflineData().settings.draftCotEnabled=control.checked;save()});
 body.querySelectorAll('[data-draft-cot-delete]').forEach(button=>button.onclick=()=>{const settings=currentRoleOfflineData().settings;settings.draftCotDeleted=true;settings.draftCotEnabled=false;save();rerenderOfflineExtra()});
 body.querySelectorAll('[data-custom-prompt-enabled]').forEach(control=>control.onchange=()=>{currentRoleOfflineData().settings.customPromptEnabled=control.checked;save()});
 body.querySelectorAll('[data-offline-extra-save="requirements"]').forEach(button=>button.onclick=()=>{const settings=currentRoleOfflineData().settings,name=body.querySelector('[data-offline-extra-name="requirements"]')?.value.trim()||'',content=body.querySelector('[data-offline-extra-input="requirements"]')?.value||'';if(!name){toast('请填写额外要求名称');return}if(!content.trim()){toast('请填写额外要求内容');return}settings.customPromptName=name;settings.customPrompt=content;settings.customPromptEnabled=Boolean(body.querySelector('[data-custom-prompt-enabled]')?.checked);offlineRequirementDraftRole=null;save();toast('额外要求已保存');rerenderOfflineExtra()});
 body.querySelectorAll('[data-offline-extra-cancel="requirements"]').forEach(button=>button.onclick=()=>{offlineRequirementDraftRole=null;const settings=currentRoleOfflineData().settings;if(!settings.customPrompt.trim()){settings.customPromptEnabled=false;delete settings.customPromptName;save()}rerenderOfflineExtra()});
 body.querySelectorAll('[data-offline-extra-remove="requirements"]').forEach(button=>button.onclick=()=>{offlineRequirementDraftRole=null;const settings=currentRoleOfflineData().settings;settings.customPrompt='';settings.customPromptName='额外要求';settings.customPromptEnabled=false;save();rerenderOfflineExtra()});
 body.querySelectorAll('[data-regex-enabled]').forEach(control=>control.onchange=()=>{const card=control.closest('[data-offline-regex-index]'),key=card?.dataset.offlineRegexIndex;if(key==='draft'){if(offlineRegexDraft)offlineRegexDraft.enabled=control.checked}else{const rule=regexRulesForCard()?.[Number(key)];if(rule){rule.enabled=control.checked;save()}}});
 body.querySelectorAll('[data-regex-test]').forEach(button=>button.onclick=()=>{const card=button.closest('[data-offline-regex-index]'),read=name=>card?.querySelector(`[data-regex-prop="${name}"]`)?.value||'',rule={find:read('find').trim(),replace:read('replace'),enabled:true,contextEnabled:true,displayEnabled:true,target:['ai','user']},input=card?.querySelector('[data-regex-test-input]')?.value||'',lane=card?.querySelector('[data-regex-test-lane]')?.value||'context',target=card?.querySelector('[data-regex-test-target]')?.value||'ai',result=card?.querySelector('[data-regex-test-result]');if(!parseOfflineOutputRegex(rule)){toast('正则无效或复杂度过高，请简化表达式');return}if(input.length>12000){toast('测试内容不能超过 12000 个字符');return}if(result){card.querySelector('[data-regex-test-before]').textContent=input;card.querySelector('[data-regex-test-after]').textContent=applyOfflineRegexRules(input,{regexRules:[rule]},target,lane);result.hidden=false}});
 body.querySelectorAll('[data-regex-save]').forEach(button=>button.onclick=()=>{const key=button.dataset.regexSave,card=body.querySelector(`[data-offline-regex-index="${key}"]`),read=name=>card?.querySelector(`[data-regex-prop="${name}"]`)?.value||'',rule={name:read('name').trim(),find:read('find').trim(),replace:read('replace'),target:[...card.querySelectorAll('[data-regex-target]:checked')].map(control=>control.value),enabled:Boolean(card.querySelector('[data-regex-enabled]')?.checked),contextEnabled:Boolean(card.querySelector('[data-regex-context]')?.checked),displayEnabled:Boolean(card.querySelector('[data-regex-display]')?.checked)};if(!rule.name){toast('请填写正则名称');return}if(!rule.find){toast('请填写查找正则');return}if(!rule.target.length){toast('至少选择一个生效范围');return}if(!parseOfflineOutputRegex(rule)){toast('查找正则无效或复杂度过高，请检查表达式');return}if(!rule.contextEnabled&&!rule.displayEnabled){toast('至少选择一个处理位置');return}const rules=regexRulesForCard(),draft=key==='draft';if(draft){rule.id=`offline-regex-${Date.now()}`;rules.push(rule);offlineRegexDraft=null}else{rule.id=rules[Number(key)]?.id||`offline-regex-${Date.now()}`;rules[Number(key)]=rule}save();toast('正则已保存');rerenderRegexScope()});
 body.querySelectorAll('[data-regex-delete]').forEach(button=>button.onclick=()=>{regexRulesForCard().splice(Number(button.dataset.regexDelete),1);save();rerenderRegexScope()});
 body.querySelectorAll('[data-regex-cancel]').forEach(button=>button.onclick=()=>{offlineRegexDraft=null;rerenderRegexScope()});
 body.querySelectorAll('[data-offline-setting]').forEach(control=>control.onchange=()=>{const settings=currentRoleOfflineData().settings,key=control.dataset.offlineSetting;if(key==='style')return;if(key==='wordCount'){settings.wordCount=Math.max(100,Math.min(5000,Number(control.value)||600));control.value=settings.wordCount}else if(/^paragraphCount(Min|Max)$/.test(key)){const minKey='paragraphCountMin',maxKey='paragraphCountMax',partnerKey=key===minKey?maxKey:minKey;settings[key]=Math.max(1,Math.min(30,Math.floor(Number(control.value)||settings[key])));if(settings[minKey]>settings[maxKey])settings[partnerKey]=settings[key];control.value=settings[key];body.querySelector(`[data-offline-setting="${partnerKey}"]`).value=settings[partnerKey]}else settings[key]=control.value;save()});
 const styleSelect=body.querySelector('[data-offline-setting="style"]'),styleDetail=body.querySelector('[data-offline-style-detail]'),styleName=body.querySelector('[data-offline-style-current-name]'),styleEdit=body.querySelector('[data-offline-style-edit-selected]'),styleDelete=body.querySelector('[data-offline-style-delete-selected]'),styleForm=body.querySelector('[data-offline-style-form]'),styleAdd=body.querySelector('[data-offline-style-add]'),selectedStyle=body.querySelector('.offline-selected-style');
 const storeStylePrompt=(settings,id,prompt)=>{const custom=settings.customStyles.find(item=>item.id===id);if(custom)custom.prompt=prompt;else settings.stylePromptOverrides[id]=prompt};
 const syncSelectedStyle=()=>{const settings=currentRoleOfflineData().settings,style=offlineStyleForSettings(settings),custom=settings.customStyles.some(item=>item.id===settings.style);if(styleDetail)styleDetail.value=style.prompt;if(styleName)styleName.textContent=style.name;if(styleEdit)styleEdit.hidden=!custom;if(styleDelete)styleDelete.hidden=!custom};
 const closeStyleForm=()=>{if(!styleForm)return;styleForm.hidden=true;styleForm.reset();delete styleForm.dataset.styleId;if(selectedStyle)selectedStyle.hidden=false;if(styleSelect)styleSelect.disabled=false;if(styleAdd)styleAdd.hidden=false};
 const openStyleForm=(style=null)=>{if(!styleForm)return;styleForm.reset();if(style)styleForm.dataset.styleId=style.id;else delete styleForm.dataset.styleId;if(style){styleForm.elements.name.value=style.name;styleForm.elements.prompt.value=style.prompt||''}styleForm.closest('.offline-style-fold')?.setAttribute('open','');styleForm.hidden=false;if(selectedStyle)selectedStyle.hidden=true;if(styleSelect)styleSelect.disabled=true;if(styleAdd)styleAdd.hidden=true;styleForm.elements.name.focus()};
 if(styleSelect)styleSelect.onchange=()=>{const settings=currentRoleOfflineData().settings;if(styleDetail)storeStylePrompt(settings,settings.style,styleDetail.value);settings.style=styleSelect.value;syncSelectedStyle();save()};
 if(styleDetail)styleDetail.onchange=()=>{const settings=currentRoleOfflineData().settings;storeStylePrompt(settings,settings.style,styleDetail.value);save()};
 styleAdd?.addEventListener('click',()=>openStyleForm());
 body.querySelector('[data-offline-style-cancel]')?.addEventListener('click',closeStyleForm);
 styleEdit?.addEventListener('click',()=>{const settings=currentRoleOfflineData().settings,style=settings.customStyles.find(item=>item.id===settings.style);if(style)openStyleForm({...style,prompt:styleDetail?.value||style.prompt})});
 styleDelete?.addEventListener('click',()=>{const settings=currentRoleOfflineData().settings,style=settings.customStyles.find(item=>item.id===settings.style);if(!style||!window.confirm(`删除文风「${style.name}」？`))return;settings.customStyles=settings.customStyles.filter(item=>item.id!==style.id);settings.style='natural';styleSelect.value='natural';syncSelectedStyle();save()});
 styleForm?.addEventListener('submit',event=>{event.preventDefault();const form=event.currentTarget,settings=currentRoleOfflineData().settings,name=form.elements.name.value.trim(),prompt=form.elements.prompt.value.trim();if(!name||!prompt)return;const existing=settings.customStyles.find(item=>item.id===form.dataset.styleId),style={id:existing?.id||`custom-style-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,name,prompt};if(existing)settings.customStyles=settings.customStyles.map(item=>item.id===existing.id?style:item);else settings.customStyles.push(style);let option=[...styleSelect.options].find(item=>item.value===style.id);if(!option){option=document.createElement('option');option.value=style.id;styleSelect.add(option)}option.textContent=`${style.name} · 自定义`;settings.style=style.id;styleSelect.value=style.id;closeStyleForm();syncSelectedStyle();save()});
 const promptSelect=body.querySelector('[data-offline-prompt-select]'),promptSelected=body.querySelector('[data-offline-prompt-selected]'),promptName=body.querySelector('[data-offline-prompt-name]'),promptDetail=body.querySelector('[data-offline-prompt-detail]'),promptNote=body.querySelector('[data-offline-prompt-note]'),promptEdit=body.querySelector('[data-offline-prompt-edit]'),promptDelete=body.querySelector('[data-offline-prompt-delete]'),promptAdd=body.querySelector('[data-offline-prompt-add]'),promptForm=body.querySelector('[data-offline-prompt-form]');
 const syncPromptSelection=()=>{const settings=currentRoleOfflineData().settings,active=(settings.promptTemplates||[]).find(item=>item.id===settings.activePromptTemplateId)||null;if(promptSelect)promptSelect.value=active?.id||'';if(promptSelected)promptSelected.hidden=!active;if(promptDetail)promptDetail.value=active?.content||'';if(promptName)promptName.textContent=active?.name||'';if(promptNote)promptNote.textContent=active?`「${active.name}」正在替换 Iris 内置提示词。`:'正在使用 Iris 内置提示词。默认内容不会显示。';if(promptEdit)promptEdit.hidden=!active;if(promptDelete)promptDelete.hidden=!active};
 const closePromptForm=()=>{if(!promptForm)return;promptForm.hidden=true;promptForm.reset();delete promptForm.dataset.promptId;if(promptSelect)promptSelect.disabled=false;if(promptAdd)promptAdd.hidden=false;syncPromptSelection()};
 const openPromptForm=(item=null)=>{if(!promptForm)return;promptForm.reset();if(item){promptForm.dataset.promptId=item.id;promptForm.elements.name.value=item.name;promptForm.elements.content.value=item.content}else delete promptForm.dataset.promptId;promptForm.hidden=false;if(promptSelected)promptSelected.hidden=true;if(promptSelect)promptSelect.disabled=true;if(promptAdd)promptAdd.hidden=true;promptForm.elements.name.focus()};
 if(promptSelect)promptSelect.onchange=()=>{const settings=currentRoleOfflineData().settings,old=(settings.promptTemplates||[]).find(item=>item.id===settings.activePromptTemplateId);if(old&&promptDetail)old.content=promptDetail.value;settings.activePromptTemplateId=promptSelect.value;syncPromptSelection();save()};
 if(promptDetail)promptDetail.onchange=()=>{const settings=currentRoleOfflineData().settings,active=(settings.promptTemplates||[]).find(item=>item.id===settings.activePromptTemplateId);if(active){active.content=promptDetail.value;save()}};
 promptAdd?.addEventListener('click',()=>openPromptForm());
 body.querySelector('[data-offline-prompt-cancel]')?.addEventListener('click',closePromptForm);
 promptEdit?.addEventListener('click',()=>{const settings=currentRoleOfflineData().settings,active=(settings.promptTemplates||[]).find(item=>item.id===settings.activePromptTemplateId);if(active)openPromptForm(active)});
 promptDelete?.addEventListener('click',()=>{const settings=currentRoleOfflineData().settings,active=(settings.promptTemplates||[]).find(item=>item.id===settings.activePromptTemplateId);if(!active||!window.confirm(`删除提示词「${active.name}」？`))return;settings.promptTemplates=settings.promptTemplates.filter(item=>item.id!==active.id);settings.activePromptTemplateId='';[...promptSelect.options].find(option=>option.value===active.id)?.remove();syncPromptSelection();save()});
 promptForm?.addEventListener('submit',event=>{event.preventDefault();const form=event.currentTarget,settings=currentRoleOfflineData().settings,name=form.elements.name.value.trim(),content=form.elements.content.value.trim();if(!name||!content)return;const existing=(settings.promptTemplates||[]).find(item=>item.id===form.dataset.promptId),item={id:existing?.id||`offline-prompt-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,name,content};if(existing)settings.promptTemplates=settings.promptTemplates.map(prompt=>prompt.id===existing.id?item:prompt);else settings.promptTemplates.push(item);let option=[...promptSelect.options].find(option=>option.value===item.id);if(!option){option=document.createElement('option');option.value=item.id;promptSelect.add(option)}option.textContent=`${item.name} · 自定义`;settings.activePromptTemplateId=item.id;closePromptForm();save()});
 bindOfflineRecords(panel);
}
function bindOfflineRecords(panel){
 panel.querySelector('[data-offline-save-record]')?.addEventListener('click',()=>{if(saveOfflineRecord())refreshSettings()});
 panel.querySelectorAll('[data-record-review]').forEach(button=>button.onclick=()=>{const full=button.closest('.offline-record-note').querySelector('[data-record-transcript]');full.hidden=!full.hidden;button.textContent=full.hidden?'回顾记录':'收起记录'});
 panel.querySelectorAll('[data-record-delete]').forEach(button=>button.onclick=()=>{if(!window.confirm('删除这条线下记录？'))return;const offlineData=currentRoleOfflineData(),record=offlineData.records.find(item=>item.id===button.dataset.recordDelete);if(record)removeOfflineSummaryFromChatMemory(record);offlineData.records=offlineData.records.filter(record=>record.id!==button.dataset.recordDelete);save();refreshSettings()});
}
function refreshSettings(){
 const cfg=state.settings,content=$('#settingsContent');
 const section=modeSettings?settingsSection:systemSettingsTab;
 const previousApiPanelScrollTop=section==='api'?content.querySelector('.api-config-panel')?.scrollTop:null;
 content.classList.toggle('is-online-settings',modeSettings&&section==='online');
 content.classList.toggle('is-memory-settings',modeSettings&&section==='online'&&onlineSettingsTab==='memory');
 content.classList.toggle('is-world-settings',modeSettings&&section==='online'&&onlineSettingsTab==='world');
 content.classList.toggle('is-offline-settings',modeSettings&&section==='offline');
 content.classList.toggle('is-offline-record-settings',modeSettings&&section==='offline'&&offlineSettingsTab==='records');
 content.classList.toggle('is-system-settings',!modeSettings);
 $('#settingsScreen').classList.toggle('compact-settings-top',!modeSettings||section==='online'||section==='offline');
 const backLabels={api:'API Connection',online:'Chat',offline:'Offline',storage:'Storage',background:'Background'};
 if(modeSettings&&section==='online')$('#closeSettings').innerHTML='<span class="settings-title-main">Chat</span><small class="settings-title-sub">Settings</small>';
 else if(modeSettings&&section==='offline')$('#closeSettings').innerHTML='<span class="settings-title-main">Offline</span><small class="settings-title-sub offline-settings-title-sub">settings</small>';
 else $('#closeSettings').textContent=modeSettings?backLabels[section]:'Settings';
 $('#closeSettings').setAttribute('aria-label',modeSettings?`Back from ${backLabels[section]||'chat settings'}`:'Back to chat');
 const globalTabs=modeSettings?'':`<nav class="system-setting-tabs" aria-label="Settings categories">${[['api','API'],['storage','Storage'],['background','Background'],['version','Version']].map(([id,label])=>`<button type="button" class="system-setting-tab ${systemSettingsTab===id?'active':''}" data-system-tab="${id}">${label}</button>`).join('')}</nav>`;
 const pageHead='';
 if(section==='api'){
  const current=cfg.apiConfigs.find(config=>config.id===editingApiConfigId)||null;
  if(current)editingApiConfigId=current.id;
  if(editingApiModelsFor!==editingApiConfigId){editingApiModelsFor=editingApiConfigId;editingApiModels=[...(current?.models|| (current?.model?[current.model]:[]))]}
  const apiFeatures=[['onlineChat','线上聊天'],['sms','短信'],['offlineStory','线下故事'],['onlineSummary','线上总结'],['offlineSummary','线下总结'],['videoCall','视频通话'],['callSummary','通话总结'],['forum','论坛'],['market','商场'],['business','经营'],['reading','阅读陪读']],featureRoutes=cfg.apiFeatureRoutes||{};
  const savedConfigs=cfg.apiConfigs.map(config=>{let host='';try{host=new URL(config.url).host}catch{host=config.url||'尚未填写地址'}return `<article class="api-profile-card ${config.id===cfg.activeApiConfigId?'is-default':''}" data-api-profile-card="${esc(config.id)}"><div class="api-profile-heading"><div class="api-profile-summary"><strong>${esc(config.name||'API 配置')}</strong><small>${esc(config.models?.length?config.models.join('、'):(config.model||'尚未选择模型'))} · ${esc(host)}</small></div><div class="api-profile-actions"><button type="button" data-api-edit-profile="${esc(config.id)}">编辑</button><button type="button" class="api-profile-default" data-api-set-default="${esc(config.id)}" aria-pressed="${String(config.id===cfg.activeApiConfigId)}" ${config.id===cfg.activeApiConfigId?'disabled':''}>${config.id===cfg.activeApiConfigId?'当前默认':'设为默认'}</button></div></div><div class="api-profile-uses"><small>勾选功能并为每项指定模型</small><div class="api-profile-feature-list">${apiFeatures.map(([id,label])=>{const models=[...new Set([...(config.models||[]),config.model].filter(Boolean))],selected=cfg.apiFeatureModels?.[id]||config.model||models[0]||'';return `<label class="api-feature-choice"><input type="checkbox" data-api-feature="${id}" data-api-profile="${esc(config.id)}" ${featureRoutes[id]===config.id?'checked':''}><span>${label}</span><select data-api-feature-model="${id}" data-api-profile="${esc(config.id)}" ${featureRoutes[id]===config.id?'':'disabled'}>${models.map(model=>`<option value="${esc(model)}" ${model===selected?'selected':''}>${esc(model)}</option>`).join('')}</select></label>`}).join('')}</div></div></article>`}).join('');
  content.innerHTML=globalTabs+pageHead+`<div class="api-config-panel"><div class="api-config-heading"><h2>API 配置</h2><button type="button" id="addApiConfig" class="api-add-config">＋ 新建配置</button></div><label class="api-profile-editor-switch">切换配置<select id="apiEditingProfile"><option value="">新建配置</option>${cfg.apiConfigs.map(config=>`<option value="${esc(config.id)}" ${config.id===editingApiConfigId?'selected':''}>${esc(config.name||'API 配置')}</option>`).join('')}</select></label><form id="apiForm" class="settings-form settings-page-form"><p class="api-editing-label">${current?`正在编辑：${esc(current.name||'API 配置')}`:'新建 API 配置'}</p><label>配置名称<input id="apiName" autocomplete="off" placeholder="例如：OpenAI" value="${esc(current?.name||'')}"></label><label>API 地址<input id="apiUrl" type="url" autocomplete="url" placeholder="https://api.example.com/v1" value="${esc(current?.url??(editingApiConfigId?cfg.apiUrl:''))}"></label><label>API Key<input id="apiKey" type="password" autocomplete="off" placeholder="输入 API Key" value="${esc(current?.key??(editingApiConfigId?cfg.apiKey:''))}"></label><label id="apiManualModelField">默认模型<input id="apiModel" list="apiModelOptions" autocomplete="off" placeholder="拉取或输入模型名称" value="${esc(current?.model??(editingApiConfigId?cfg.apiModel:''))}"><datalist id="apiModelOptions">${editingApiModels.map(model=>`<option value="${esc(model)}"></option>`).join('')}</datalist></label><div class="api-current-model-list" id="apiCurrentModelList"></div><p class="api-retained-model-note" id="apiRetainedModelNote">已保留 ${editingApiModels.length} 个模型；可在下方按功能分配。</p><div class="api-form-actions"><button type="button" id="fetchModels" class="settings-secondary">拉取模型</button><button type="submit" class="settings-primary">保存配置</button></div><p class="settings-note" id="apiFeedback">拉取后可多选模型并保留在这条 API 配置中。</p></form><section class="api-profile-routing"><div class="api-profile-routing-heading"><strong>配置与功能</strong><small>勾选功能绑定这套 API，并为每项单独选择模型；未勾选时使用默认配置。</small></div>${savedConfigs?`<div class="api-config-list">${savedConfigs}</div>`:'<p class="settings-note api-no-configs">先新建一项配置，填写 API 地址、Key 和模型。</p>'}</section></div>`;
  const routeCardList=content.querySelector('.api-config-list'),routeCards=[...content.querySelectorAll('.api-profile-card')];
  $('#apiEditingProfile').onchange=event=>{editingApiConfigId=event.target.value;cfg.apiEditingConfigId=editingApiConfigId;editingApiModelsFor=null;save();refreshSettings()};
  content.querySelectorAll('[data-api-edit-profile]').forEach(button=>button.onclick=()=>{editingApiConfigId=button.dataset.apiEditProfile;cfg.apiEditingConfigId=editingApiConfigId;editingApiModelsFor=null;save();refreshSettings();$('#apiName').focus()});
  content.querySelectorAll('[data-api-set-default]').forEach(button=>button.onclick=()=>{const config=cfg.apiConfigs.find(item=>item.id===button.dataset.apiSetDefault);if(!config)return;cfg.activeApiConfigId=config.id;cfg.apiEditingConfigId=config.id;cfg.apiUrl=config.url||'';cfg.apiKey=config.key||'';cfg.apiModel=config.model||config.models?.[0]||'';editingApiConfigId=config.id;editingApiModelsFor=null;activeApiPanelConfigId=config.id;save();refreshSettings()});
  if(routeCardList&&routeCards.length){if(!routeCards.some(card=>card.dataset.apiProfileCard===activeApiPanelConfigId))activeApiPanelConfigId=routeCards.find(card=>card.dataset.apiProfileCard===editingApiConfigId)?.dataset.apiProfileCard||cfg.activeApiConfigId||routeCards[0].dataset.apiProfileCard;const routeTabs=document.createElement('nav');routeTabs.className='api-saved-url-tabs';routeTabs.setAttribute('aria-label','已保存的 API 地址');routeCards.forEach((card,index)=>{const id=card.dataset.apiProfileCard,config=cfg.apiConfigs.find(item=>item.id===id),tab=document.createElement('button');tab.type='button';tab.className='api-saved-url-tab'+(id===activeApiPanelConfigId?' active':'');tab.dataset.apiPanelConfig=id;tab.title=config?.url||config?.name||'';tab.textContent=config?.name||('API '+(index+1));routeTabs.append(tab);card.hidden=id!==activeApiPanelConfigId});routeCardList.before(routeTabs);routeTabs.querySelectorAll('[data-api-panel-config]').forEach(tab=>tab.onclick=()=>{activeApiPanelConfigId=tab.dataset.apiPanelConfig;routeTabs.querySelectorAll('.api-saved-url-tab').forEach(item=>item.classList.toggle('active',item===tab));routeCards.forEach(card=>card.hidden=card.dataset.apiProfileCard!==activeApiPanelConfigId)})}
  const renderCurrentModelChoices=()=>{const list=$('#apiCurrentModelList'),models=editingApiModels||[],manualField=$('#apiManualModelField');manualField.hidden=models.length>0;if(models.length&&!models.includes($('#apiModel').value))$('#apiModel').value=models[0];list.innerHTML=models.length?`<small>当前可用模型 · ${models.length} 个，可在下方功能中分别调用</small><div class="api-current-model-options">${models.map(model=>`<div class="api-current-model-option"><span>${esc(model)}</span><small>已保留</small></div>`).join('')}</div>`:'<small>尚未保留模型；可拉取并多选模型，或手动填写默认模型。</small>'};renderCurrentModelChoices();
  const refreshFeatureModelSelectors=()=>content.querySelectorAll('[data-api-feature-model]').forEach(select=>{const config=cfg.apiConfigs.find(item=>item.id===select.dataset.apiProfile),models=[...new Set([...(config?.models||[]),config?.model].filter(Boolean))],feature=select.dataset.apiFeatureModel,assigned=cfg.apiFeatureRoutes?.[feature]===select.dataset.apiProfile,selected=models.includes(cfg.apiFeatureModels?.[feature])?cfg.apiFeatureModels[feature]:(config?.model||models[0]||'');select.innerHTML=models.map(model=>`<option value="${esc(model)}" ${model===selected?'selected':''}>${esc(model)}</option>`).join('');select.disabled=!assigned});
  $('#addApiConfig').onclick=()=>{editingApiConfigId='';cfg.apiEditingConfigId='';save();refreshSettings();$('#apiName').focus()};
  document.querySelectorAll('[data-api-feature]').forEach(input=>input.onchange=()=>{cfg.apiFeatureRoutes||={};cfg.apiFeatureModels||={};const feature=input.dataset.apiFeature,profile=input.dataset.apiProfile,config=cfg.apiConfigs.find(item=>item.id===profile),modelSelect=content.querySelector(`[data-api-feature-model="${feature}"][data-api-profile="${profile}"]`);if(input.checked){cfg.apiFeatureRoutes[feature]=profile;if(modelSelect){const saved=cfg.apiFeatureModels[feature];if(saved&&[...modelSelect.options].some(option=>option.value===saved))modelSelect.value=saved;else cfg.apiFeatureModels[feature]=modelSelect.value||config?.model||config?.models?.[0]||''}}else if(cfg.apiFeatureRoutes[feature]===profile){delete cfg.apiFeatureRoutes[feature];delete cfg.apiFeatureModels[feature]}content.querySelectorAll('[data-api-feature]').forEach(option=>{if(option.dataset.apiFeature===feature){const assigned=cfg.apiFeatureRoutes[feature]===option.dataset.apiProfile;option.checked=assigned;const select=content.querySelector(`[data-api-feature-model="${feature}"][data-api-profile="${option.dataset.apiProfile}"]`);if(select){select.disabled=!assigned;if(assigned&&cfg.apiFeatureModels[feature])select.value=cfg.apiFeatureModels[feature]}}});save()});document.querySelectorAll('[data-api-feature-model]').forEach(select=>select.onchange=()=>{const feature=select.dataset.apiFeatureModel,profile=select.dataset.apiProfile;if(cfg.apiFeatureRoutes?.[feature]!==profile)return;cfg.apiFeatureModels||={};cfg.apiFeatureModels[feature]=select.value;save()});
  $('#apiForm').onsubmit=event=>{event.preventDefault();const values={name:$('#apiName').value.trim(),url:$('#apiUrl').value.trim().replace(/\/$/,''),key:$('#apiKey').value.trim(),model:editingApiModels[0]||$('#apiModel').value.trim(),models:[...new Set(editingApiModels)]};if(!values.name){$('#apiFeedback').textContent='请先填写配置名称。';$('#apiName').focus();return}let config=cfg.apiConfigs.find(item=>item.id===editingApiConfigId);const isNew=!config;if(config)Object.assign(config,values);else{config={id:`api-${Date.now()}`,...values};cfg.apiConfigs.push(config);editingApiConfigId=config.id;editingApiModelsFor=config.id}cfg.apiEditingConfigId=config.id;if(isNew&&!cfg.activeApiConfigId)cfg.activeApiConfigId=config.id;activeApiPanelConfigId=config.id;if(config.id===cfg.activeApiConfigId){cfg.apiUrl=values.url;cfg.apiKey=values.key;cfg.apiModel=values.model}save();refreshSettings();$('#apiFeedback').textContent='配置已保存。可在上方设为默认，或勾选它要使用的功能。'};
  $('#fetchModels').onclick=async()=>{const button=$('#fetchModels'),feedback=$('#apiFeedback'),base=$('#apiUrl').value.trim().replace(/\/+$/,''),dialog=$('#apiModelsDialog');if(!base){feedback.textContent='请先填写 API 地址。';return}const renderPicker=(status,message='')=>{dialog.innerHTML=`<section class="api-model-picker"><header class="api-model-picker-heading"><div><h2>选择模型</h2><p>${status==='loading'?'正在读取此 API 地址可用的模型':status==='error'?esc(message):`已找到 ${apiModelCandidates.length} 个模型，可多选后保留到当前配置`}</p></div><button type="button" class="api-model-close" data-model-close aria-label="关闭">×</button></header>${status==='loading'?'<div class="api-model-loading"><span></span>正在连接模型列表…</div>':status==='error'?`<div class="api-model-error">${esc(message)}</div>`:`<div class="api-model-tools"><span>${apiModelCandidates.length} 个可用模型</span><div><button type="button" data-model-select-all>全选</button><button type="button" data-model-clear>清空</button></div></div><div class="api-model-list">${apiModelCandidates.map(model=>`<label class="api-model-option"><input type="checkbox" data-api-model-choice="${esc(model)}" ${apiModelDraft.includes(model)?'checked':''}><span>${esc(model)}</span></label>`).join('')}</div>`}<footer class="api-model-picker-footer"><button type="button" class="api-model-cancel" data-model-close>取消</button>${status==='ready'?`<button type="button" class="api-model-keep" data-model-keep>保留所选 <span>${apiModelDraft.length}</span></button>`:''}</footer></section>`;dialog.querySelectorAll('[data-model-close]').forEach(item=>item.onclick=()=>dialog.close());dialog.querySelector('[data-model-select-all]')?.addEventListener('click',()=>{apiModelDraft=[...apiModelCandidates];renderPicker('ready')});dialog.querySelector('[data-model-clear]')?.addEventListener('click',()=>{apiModelDraft=[];renderPicker('ready')});dialog.querySelectorAll('[data-api-model-choice]').forEach(input=>input.onchange=()=>{const model=input.dataset.apiModelChoice;if(input.checked&&!apiModelDraft.includes(model))apiModelDraft.push(model);else if(!input.checked)apiModelDraft=apiModelDraft.filter(item=>item!==model);const count=dialog.querySelector('.api-model-keep span');if(count)count.textContent=String(apiModelDraft.length)});dialog.querySelector('[data-model-keep]')?.addEventListener('click',()=>{editingApiModels=apiModelCandidates.filter(model=>apiModelDraft.includes(model));$('#apiModelOptions').innerHTML=editingApiModels.map(model=>`<option value="${esc(model)}"></option>`).join('');$('#apiRetainedModelNote').textContent=`已保留 ${editingApiModels.length} 个模型；保存配置后可从输入框选择。`;if(!$('#apiModel').value&&editingApiModels.length)$('#apiModel').value=editingApiModels[0];feedback.textContent=`已选择并暂存 ${editingApiModels.length} 个模型；保存配置后会保留在这条 API 配置中。`;dialog.close()})};button.disabled=true;button.textContent='正在拉取…';apiModelCandidates=[];apiModelDraft=[...editingApiModels];renderPicker('loading');dialog.showModal();try{const endpoint=base.endsWith('/models')?base:`${base}/models`,key=$('#apiKey').value.trim();const response=await fetch(endpoint,{headers:key?{Authorization:`Bearer ${key}`}:{}});if(!response.ok)throw Error(`请求失败（${response.status}）`);const result=await response.json(),items=Array.isArray(result)?result:(result.data||result.models||[]);apiModelCandidates=[...new Set(items.map(item=>typeof item==='string'?item:(item.id||item.name)).filter(Boolean).map(String))];apiModelDraft=apiModelCandidates.filter(model=>editingApiModels.includes(model));if(!apiModelCandidates.length)throw Error('没有找到可用模型。');renderPicker('ready')}catch(error){renderPicker('error',`拉取失败：${error.message||'请检查地址、Key 或跨域设置。'}`)}finally{button.disabled=false;button.textContent='拉取模型'}};
  $('#fetchModels').onclick=async()=>{const button=$('#fetchModels'),feedback=$('#apiFeedback'),dialog=$('#apiModelsDialog'),currentUrl=$('#apiUrl').value.trim().replace(/\/+$/,'');if(!currentUrl){feedback.textContent='请先填写 API 地址。';return}const profilesByUrl=new Map();cfg.apiConfigs.forEach(config=>{const url=String(config.url||'').trim().replace(/\/+$/,'');if(url&&!profilesByUrl.has(url))profilesByUrl.set(url,config)});if(!profilesByUrl.has(currentUrl))profilesByUrl.set(currentUrl,{id:'__editing__',name:$('#apiName').value.trim()||'当前地址',url:currentUrl,key:$('#apiKey').value.trim(),models:editingApiModels});const urls=[currentUrl,...[...profilesByUrl.keys()].filter(url=>url!==currentUrl)],labels=new Map(urls.map(url=>{let host=url;try{const parsed=new URL(url);host=parsed.host+parsed.pathname.replace(/\/$/,'')}catch{}return[url,host]})),modelsByUrl=new Map(),draftByUrl=new Map(),dirtyUrls=new Set(),isSavedUrl=url=>cfg.apiConfigs.some(config=>String(config.url||'').trim().replace(/\/+$/,'')===url);let activeUrl=currentUrl,loadingUrl='',errorByUrl=new Map();const pageScrollTop=content.querySelector('.api-config-panel')?.scrollTop||0;const initialModels=url=>url===currentUrl?editingApiModels:(profilesByUrl.get(url)?.models||[]);urls.forEach(url=>draftByUrl.set(url,[...initialModels(url)]));const render=()=>{const candidates=modelsByUrl.get(activeUrl)||[];dialog.innerHTML=`<section class="api-model-picker"><header class="api-model-picker-heading"><div><h2>选择模型</h2><p>先横向选择 API 地址，再勾选该地址下要保留的模型</p></div><button type="button" class="api-model-close" data-model-close aria-label="关闭">×</button></header><nav class="api-model-url-tabs" aria-label="API 地址">${urls.map(url=>`<div class="api-model-url-item"><button type="button" class="api-model-url-tab ${url===activeUrl?'active':''}" data-model-url="${esc(url)}" title="${esc(url)}"><span>${esc(labels.get(url))}</span></button>${isSavedUrl(url)?`<button type="button" class="api-model-url-delete" data-model-delete-url="${esc(url)}" aria-label="删除此 API 地址" title="删除此 API 地址">×</button>`:''}</div>`).join('')}</nav>${loadingUrl===activeUrl?'<div class="api-model-loading"><span></span>正在读取此地址的模型…</div>':errorByUrl.has(activeUrl)?`<div class="api-model-error">${esc(errorByUrl.get(activeUrl))}</div>`:`<div class="api-model-tools"><span>${candidates.length} 个模型</span><div><button type="button" data-model-select-all>全选</button><button type="button" data-model-clear>清空</button></div></div><div class="api-model-list">${candidates.length?candidates.map(model=>`<label class="api-model-option"><input type="checkbox" data-api-model-choice="${esc(model)}" ${draftByUrl.get(activeUrl)?.includes(model)?'checked':''}><span>${esc(model)}</span></label>`).join(''):'<p class="api-model-empty">此地址暂未拉取模型</p>'}</div>`}<footer class="api-model-picker-footer"><button type="button" class="api-model-cancel" data-model-close>取消</button><button type="button" class="api-model-keep" data-model-keep>保留所选</button></footer></section>`;dialog.querySelectorAll('[data-model-close]').forEach(item=>item.onclick=()=>dialog.close());dialog.querySelectorAll('[data-model-url]').forEach(item=>item.onclick=()=>{activeUrl=item.dataset.modelUrl;if(!modelsByUrl.has(activeUrl))loadModels(activeUrl);else render()});dialog.querySelectorAll('[data-model-delete-url]').forEach(item=>item.onclick=()=>{const url=item.dataset.modelDeleteUrl,removed=cfg.apiConfigs.filter(config=>String(config.url||'').trim().replace(/\/+$/,'')===url),removedIds=new Set(removed.map(config=>config.id)),wasDefault=removedIds.has(cfg.activeApiConfigId);if(!removed.length||!window.confirm('删除此 API 地址及其关联配置？'))return;cfg.apiConfigs=cfg.apiConfigs.filter(config=>!removedIds.has(config.id));Object.entries(cfg.apiFeatureRoutes||{}).forEach(([feature,id])=>{if(removedIds.has(id)){delete cfg.apiFeatureRoutes[feature];delete cfg.apiFeatureModels[feature]}});if(removedIds.has(cfg.activeApiConfigId)){cfg.activeApiConfigId=cfg.apiConfigs[0]?.id||'';const active=cfg.apiConfigs[0];cfg.apiUrl=active?.url||'';cfg.apiKey=active?.key||'';cfg.apiModel=active?.model||''}profilesByUrl.delete(url);modelsByUrl.delete(url);draftByUrl.delete(url);dirtyUrls.delete(url);const wasEditing=removedIds.has(editingApiConfigId);if(wasEditing){editingApiConfigId=cfg.activeApiConfigId;editingApiModelsFor=null;editingApiModels=[];dialog.close();save();refreshSettings();return}urls.splice(urls.indexOf(url),1);content.querySelectorAll('[data-api-profile-card]').forEach(card=>{if(removedIds.has(card.dataset.apiProfileCard))card.remove()});if(!urls.length){dialog.close();save();refreshSettings();return}if(activeUrl===url)activeUrl=urls.includes(currentUrl)?currentUrl:urls[0];if(wasDefault){content.querySelectorAll('[data-api-profile-card]').forEach(card=>card.classList.toggle('is-default',card.dataset.apiProfileCard===cfg.activeApiConfigId));content.querySelectorAll('[data-api-set-default]').forEach(control=>{const selected=control.dataset.apiSetDefault===cfg.activeApiConfigId;control.textContent=selected?'当前默认':'设为默认';control.disabled=selected;control.setAttribute('aria-pressed',String(selected))})}save();render();if(!modelsByUrl.has(activeUrl))loadModels(activeUrl)});dialog.querySelector('[data-model-select-all]')?.addEventListener('click',()=>{draftByUrl.set(activeUrl,[...candidates]);dirtyUrls.add(activeUrl);render()});dialog.querySelector('[data-model-clear]')?.addEventListener('click',()=>{draftByUrl.set(activeUrl,[]);dirtyUrls.add(activeUrl);render()});dialog.querySelectorAll('[data-api-model-choice]').forEach(input=>input.onchange=()=>{const chosen=draftByUrl.get(activeUrl)||[],model=input.dataset.apiModelChoice;draftByUrl.set(activeUrl,input.checked?[...new Set([...chosen,model])]:chosen.filter(item=>item!==model));dirtyUrls.add(activeUrl);const count=dialog.querySelector('.api-model-keep');if(count)count.textContent=`保留所选（${draftByUrl.get(activeUrl).length}）`});dialog.querySelector('[data-model-keep]')?.addEventListener('click',()=>{dirtyUrls.forEach(url=>{const chosen=[...(draftByUrl.get(url)||[])],matching=cfg.apiConfigs.filter(config=>String(config.url||'').trim().replace(/\/+$/,'')===url);matching.forEach(config=>config.models=chosen);if(url===currentUrl){editingApiModels=chosen;$('#apiModelOptions').innerHTML=chosen.map(model=>`<option value="${esc(model)}"></option>`).join('');$('#apiRetainedModelNote').textContent=`已保留 ${chosen.length} 个模型；可在下方按功能分配。`;if(!$('#apiModel').value&&chosen.length)$('#apiModel').value=chosen[0];renderCurrentModelChoices()}});refreshFeatureModelSelectors();if(dirtyUrls.size)save();feedback.textContent=`已保留 ${dirtyUrls.size?`${dirtyUrls.size} 个 API 地址`:'当前选择'}的模型；新配置请再点“保存配置”。`;dialog.close();requestAnimationFrame(()=>{const panel=content.querySelector('.api-config-panel');if(panel)panel.scrollTop=pageScrollTop})})};const loadModels=async url=>{loadingUrl=url;errorByUrl.delete(url);render();try{const profile=profilesByUrl.get(url),base=url.replace(/\/+$/,''),endpoint=base.endsWith('/models')?base:`${base}/models`,key=url===currentUrl?$('#apiKey').value.trim():(profile?.key||'');const response=await fetch(endpoint,{headers:key?{Authorization:`Bearer ${key}`}:{}});if(!response.ok)throw Error(`请求失败（${response.status}）`);const result=await response.json(),items=Array.isArray(result)?result:(result.data||result.models||[]),models=[...new Set(items.map(item=>typeof item==='string'?item:(item.id||item.name)).filter(Boolean).map(String))];if(!models.length)throw Error('没有找到可用模型。');modelsByUrl.set(url,models);draftByUrl.set(url,(draftByUrl.get(url)||[]).filter(model=>models.includes(model)))}catch(error){errorByUrl.set(url,`拉取失败：${error.message||'请检查地址、Key 或跨域设置。'}`)}finally{loadingUrl='';render()}};button.disabled=true;button.textContent='正在拉取…';dialog.showModal();render();await loadModels(activeUrl);button.disabled=false;button.textContent='拉取模型'};
  const modelFetchButton=$('#fetchModels'),originalModelFetch=modelFetchButton.onclick;
  modelFetchButton.onclick=async function(event){const savedFetch=window.fetch,modelDialog=$('#apiModelsDialog');const providerAwareFetch=async(input,init={})=>{const requestUrl=typeof input==='string'?input:input.url,method=(init.method||(input instanceof Request?input.method:'GET')).toUpperCase();if(method==='GET'&&/\/models(?:\?|$)/.test(requestUrl)){const headers=new Headers(init.headers||(input instanceof Request?input.headers:undefined)),key=headers.get('Authorization')?.replace(/^Bearer\s+/i,'')||headers.get('x-api-key')||headers.get('x-goog-api-key')||'',baseUrl=requestUrl.replace(/\/models(?:\?.*)?$/,'');const result=await fetchApiModelList(baseUrl,key);return new Response(JSON.stringify({data:result.models.map(id=>({id}))}),{status:200,headers:{'Content-Type':'application/json'}})}return nativeApiFetch(input,init)};window.fetch=providerAwareFetch;modelDialog.addEventListener('close',()=>{if(window.fetch===providerAwareFetch)window.fetch=savedFetch},{once:true});return originalModelFetch.call(this,event)};
 }else if(section==='online'){
  const tabs=[['user','User'],['world','World Book'],['memory','Memory'],['more','More']];
  content.innerHTML=globalTabs+`<nav class="online-setting-tabs" aria-label="聊天设置分类">${tabs.map(([id,label])=>`<button type="button" class="online-setting-tab ${onlineSettingsTab===id?'active':''}" data-online-tab="${id}">${label}</button>`).join('')}</nav><div id="onlineSettingsPanel" class="online-settings-panel">${onlineSettingsPanel(onlineSettingsTab)}</div>`;
  content.querySelectorAll('[data-online-tab]').forEach(button=>button.onclick=()=>{onlineSettingsTab=button.dataset.onlineTab;emojiManagementOpen=false;content.classList.toggle('is-memory-settings',onlineSettingsTab==='memory');content.classList.toggle('is-world-settings',onlineSettingsTab==='world');content.querySelectorAll('[data-online-tab]').forEach(tab=>tab.classList.toggle('active',tab===button));$('#onlineSettingsPanel').innerHTML=onlineSettingsPanel(onlineSettingsTab);bindOnlineSettingsInputs($('#onlineSettingsPanel'))});bindOnlineSettingsInputs($('#onlineSettingsPanel'));
 }else if(section==='offline'){
  content.innerHTML=globalTabs+`<nav class="offline-setting-tabs" aria-label="Offline settings categories">${[['settings','Settings'],['stage-memory','Stage Memory'],['records','Records']].map(([id,label])=>`<button type="button" data-offline-setting-tab="${id}" class="${offlineSettingsTab===id?'active':''}">${label}</button>`).join('')}</nav><div class="offline-settings-panel" data-offline-settings-body>${renderOfflineSettingsPanel(offlineSettingsTab)}</div>`;
  bindOfflineSettingsPanel(content);
 }else if(section==='storage'){
  const categoryMarkup=(id,label,detail)=>`<label class="backup-category"><input type="checkbox" data-backup-category="${id}" ${backupExportCategories.includes(id)?'checked':''}><span><strong>${label}</strong><small>${detail}</small></span><i aria-hidden="true"></i></label>`;
  content.innerHTML=globalTabs+pageHead+`<div class="settings-page-body backup-page"><section class="backup-section"><header><h3>导出备份</h3><small>选择要保存的内容</small></header><details class="backup-category-group"><summary>共用资料</summary>${categoryMarkup('userProfiles','用户资料','用户名称、档案与头像')}${categoryMarkup('characterProfiles','角色资料','角色设定、世界书与角色图片')}</details><details class="backup-category-group"><summary>线上</summary>${categoryMarkup('onlineChat','Chat 聊天记录','文字、图片、语音及其他消息')}${categoryMarkup('onlineSettings','线上聊天设置','角色绑定、聊天偏好与显示设置')}${categoryMarkup('videoCalls','视频通话','通话总结与逐句记录')}${categoryMarkup('onlineSummaries','线上自动总结','聊天自动整理的摘要')}${categoryMarkup('onlineMemories','线上记忆卡片','手动保存的线上记忆')}</details><details class="backup-category-group"><summary>线下</summary>${categoryMarkup('offlineActive','进行中的线下内容','当前线下对话与活动场景')}${categoryMarkup('offlineStories','已保存的线下故事','已归档故事正文')}${categoryMarkup('offlineSummaries','线下总结','每段故事的总结')}${categoryMarkup('offlineStageMemory','阶段记忆','线下剧情阶段摘要')}${categoryMarkup('offlineSettings','线下写作设置','文风、提示词与正则')}</details><details class="backup-category-group"><summary>本机其他数据</summary>${categoryMarkup('appSettings','应用与 API 设置','接口连接与应用偏好设置')}${categoryMarkup('sms','短信','本机短信对话')}${categoryMarkup('forums','论坛','论坛世界、帖子与评论')}${categoryMarkup('market','商场与香水店','商品、钱包、香水藏品与经营账本')}${categoryMarkup('localFeatures','其他本地功能','阅读书架、世界书、表情包、界面主题等')}</details><p class="backup-scope-description" id="backupScopeDescription">${backupScopeDescription()}</p><div class="backup-counts" id="backupScopeCounts">${renderBackupCounts()}</div><div class="backup-format-picker" role="group" aria-label="导出文件格式"><span>文件格式</span>${[['json','JSON'],['zip','ZIP']].map(([format,label])=>`<button type="button" data-backup-format="${format}" class="${backupExportFormat===format?'is-active':''}" aria-pressed="${backupExportFormat===format}">${label}</button>`).join('')}</div><button type="button" id="exportData" class="backup-primary-action"><span>导出所选内容</span><i aria-hidden="true">↗</i></button></section><section class="backup-section backup-restore-section"><header><h3>从备份恢复</h3><small>校验后再写入</small></header><p>选择备份文件后查看数据清单。默认合并；也可清空对应分类后恢复。</p><button type="button" id="importDataButton" class="backup-text-action"><span>选择备份文件</span><i aria-hidden="true">＋</i></button><input id="importDataFile" type="file" accept="application/json,.json,.zip,application/zip" hidden><div id="backupPreview" aria-live="polite"></div></section><p id="storageFeedback" class="backup-feedback" role="status"></p></div>`;
  $('#exportData').onclick=()=>exportData();$('#importDataButton').onclick=()=>$('#importDataFile').click();$('#importDataFile').onchange=event=>{void previewBackup(event.target.files[0])};content.querySelectorAll('[data-backup-category]').forEach(input=>input.onchange=()=>{backupExportCategories=[...content.querySelectorAll('[data-backup-category]:checked')].map(item=>item.dataset.backupCategory);$('#backupScopeDescription').textContent=backupScopeDescription();$('#backupScopeCounts').innerHTML=renderBackupCounts();$('#exportData').disabled=!backupExportCategories.length});content.querySelectorAll('[data-backup-format]').forEach(button=>button.onclick=()=>{backupExportFormat=button.dataset.backupFormat;content.querySelectorAll('[data-backup-format]').forEach(item=>{const active=item===button;item.classList.toggle('is-active',active);item.setAttribute('aria-pressed',String(active))})});
 }else if(section==='version'){
  let savedCheck=null;try{savedCheck=JSON.parse(localStorage.getItem('iris-last-version-check')||'null')}catch{}
  if(savedCheck?.version&&compareAppVersions(savedCheck.version,INSTALLED_APP_VERSION)<0)savedCheck=null;
  const savedAvailable=savedCheck?.version&&compareAppVersions(savedCheck.version,INSTALLED_APP_VERSION)>0;
  content.innerHTML=globalTabs+pageHead+`<div class="settings-page-body version-page"><div class="version-caption"><span>IRIS</span><i></i><small>版本信息</small></div><div class="version-comparison"><div class="version-current"><small>INSTALLED</small><b>${esc(INSTALLED_APP_VERSION)}</b><span>当前版本</span></div><i class="version-divider" aria-hidden="true"></i><div class="version-available" data-version-latest><small>LATEST</small><b data-version-number>${esc(savedCheck?.version||INSTALLED_APP_VERSION)}</b><span>最新版本</span></div></div><p class="version-status ${savedAvailable?'is-update':''}" data-version-status role="status"><i></i><span>${savedCheck?(savedAvailable?`发现新版本${savedCheck.notes?`：${esc(savedCheck.notes)}`:'，可以更新。'}`:'正在查验最新版本…'):'正在查验最新版本…'}</span></p><div class="version-actions ${savedAvailable?'has-update':''}"><button type="button" id="checkVersion"><span class="version-check-icon">${icon('retry')}</span><span>查验版本</span><small>CHECK</small></button><button type="button" id="updateVersion" ${savedAvailable?'':'hidden'}><span>立即更新</span><i>↗</i></button></div></div>`;
  if(savedCheck){$('#updateVersion').dataset.version=String(savedCheck.version);$('#updateVersion').dataset.release=String(savedCheck.release||savedCheck.version)}
  $('#checkVersion').onclick=async()=>{const check=$('#checkVersion'),update=$('#updateVersion'),status=$('[data-version-status]'),statusText=status.querySelector('span'),latest=$('[data-version-latest]'),actions=check.parentElement;check.disabled=true;check.querySelector('span:nth-child(2)').textContent='正在查验…';statusText.textContent='正在连接版本信息…';try{const manifestLink=document.querySelector('link[rel="manifest"]'),manifestUrl=new URL(manifestLink?.href||'manifest.webmanifest',location.href),versionUrl=new URL('version.json',manifestUrl);versionUrl.searchParams.set('_',String(Date.now()));const response=await fetch(versionUrl,{cache:'no-store'});if(!response.ok)throw Error(`请求失败（${response.status}）`);const remote=await response.json();if(!remote.version)throw Error('版本信息格式不正确。');const checked={version:String(remote.version),release:String(remote.release||remote.version),notes:String(remote.notes||'')};try{localStorage.setItem('iris-last-version-check',JSON.stringify(checked))}catch{}$('[data-version-number]').textContent=checked.version;latest.hidden=false;const available=compareAppVersions(checked.version,INSTALLED_APP_VERSION)>0;update.hidden=!available;actions.classList.toggle('has-update',available);status.classList.toggle('is-update',available);update.dataset.version=checked.version;update.dataset.release=checked.release;statusText.textContent=available?`发现新版本${checked.notes?`：${checked.notes}`:'，可以更新。'}`:'当前已是最新版本。'}catch(error){status.classList.remove('is-update');statusText.textContent=`查验失败：${error.message||'请检查网络后重试。'}`}finally{check.disabled=false;check.querySelector('span:nth-child(2)').textContent='查验版本'}};
  $('#checkVersion').click();
  $('#updateVersion').onclick=()=>{const version=$('#updateVersion').dataset.release;if(!version)return;try{localStorage.setItem('iris-installed-version',version)}catch{}const url=new URL(location.href);url.searchParams.set('iris-release',version);location.replace(url.href)};
 }else{
  content.innerHTML=globalTabs+pageHead+`<div class="settings-page-body"><label class="keepalive-card"><span class="keepalive-copy"><strong>静音音频保活</strong><small>使用系统媒体播放会话尽量保持 Iris 在后台运行；锁屏播放卡片显示 Iris 图标。系统仍可能暂停网页。</small><span class="keepalive-status" id="keepAliveStatus" role="status"></span></span><input id="keepAlive" type="checkbox" ${cfg.keepAlive?'checked':''}><i class="keepalive-switch" aria-hidden="true"></i></label></div>`;
  $('#keepAlive').onchange=event=>{void window.IrisKeepAlive.setEnabled(event.target.checked)};renderIrisKeepAliveStatus();
 }
 content.querySelectorAll('[data-system-tab]').forEach(button=>button.onclick=()=>{const nextTab=button.dataset.systemTab;if(nextTab===systemSettingsTab)return;systemSettingsTab=nextTab;refreshSettings()});
 if(previousApiPanelScrollTop!==null)requestAnimationFrame(()=>{const panel=content.querySelector('.api-config-panel');if(panel)panel.scrollTop=previousApiPanelScrollTop});
}
let pendingBackup=null;
let backupExportCategories=[...IrisBackup.CATEGORIES];
let backupExportFormat='json';
const backupCategoryNames={userProfiles:'用户资料',characterProfiles:'角色资料',appSettings:'应用与 API 设置',onlineChat:'Chat 聊天记录',onlineSettings:'线上聊天设置',videoCalls:'视频通话',onlineSummaries:'线上自动总结',onlineMemories:'线上记忆卡片',offlineActive:'进行中的线下内容',offlineStories:'已保存的线下故事',offlineSummaries:'线下总结',offlineStageMemory:'阶段记忆',offlineSettings:'线下写作设置',sms:'短信',forums:'论坛',market:'商场与香水店',localFeatures:'其他本地功能',profiles:'角色与用户资料'};
const backupLabels={settings:'应用设置',users:'用户资料',characters:'角色资料',messages:'全部聊天消息',onlineChatMessages:'线上聊天消息',videoCalls:'视频通话',offlineChatMessages:'进行中的线下消息',offlineRecords:'已保存的线下记录',offlineStoryTranscripts:'线下故事正文',onlineSummaries:'线上自动总结',onlineMemories:'线上记忆卡片',onlineSettings:'线上聊天设置',offlineSummaries:'线下总结',offlineStageMemory:'阶段记忆',offlineSettings:'线下写作设置',invitations:'线下邀约',smsMessages:'短信消息',photos:'图片',forumWorlds:'论坛世界',forumPosts:'论坛帖子',forumComments:'论坛评论',marketProducts:'商店商品',marketOrders:'商店订单',otherLocalData:'其他本地数据项'};
function backupScopeDescription(){const labels=backupExportCategories.map(id=>backupCategoryNames[id]);return labels.length?`已选择：${labels.join('、')}。`:'请至少选择一类数据。'}
function createScopedBackupData(){return IrisBackup.selectCategories(state,backupExportCategories)}
function renderBackupCounts(){if(!backupExportCategories.length)return'<span>尚未选择数据</span>';const counts=IrisBackup.counts(createScopedBackupData()),parts=[[counts.users,'位用户'],[counts.characters,'个角色'],[counts.messages,'条消息'],[counts.photos,'张图片']];return parts.map(([count,label])=>`<span><strong>${count}</strong>${label}</span>`).join('<i aria-hidden="true"></i>')}
async function exportData(){const button=$('#exportData'),feedback=$('#storageFeedback');if(!backupExportCategories.length){feedback.textContent='请至少选择一类数据。';return}button.disabled=true;feedback.textContent='正在整理数据并计算完整性校验…';try{const full=backupExportCategories.length===IrisBackup.CATEGORIES.length,scope=full?'all':'custom',data=full?IrisBackup.select(state,'all'):createScopedBackupData(),backup=await IrisBackup.make(data,scope,backupExportCategories);if(backup.manifest.counts.localBlobRefs)throw Error(`发现 ${backup.manifest.counts.localBlobRefs} 个临时媒体引用。请先重新选择并保存这些图片，再导出，以免备份中出现无法恢复的媒体。`);const text=JSON.stringify(backup,null,2),format=backupExportFormat,blob=format==='zip'?await IrisBackup.zip(text):new Blob([text],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`iris-${full?'backup':'selected-backup'}-${new Date().toISOString().slice(0,10)}.${format}`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);feedback.textContent=`所选内容已导出为 ${format.toUpperCase()}（约 ${(blob.size/1024/1024).toFixed(1)} MB）。`}catch(error){feedback.textContent=`导出失败：${error.message||'请检查本地存储后重试。'}`}finally{button.disabled=false}}
async function previewBackup(file){const feedback=$('#storageFeedback'),preview=$('#backupPreview');pendingBackup=null;preview.innerHTML='';if(!file)return;feedback.textContent='正在读取并校验备份…';try{let text;const signature=new Uint8Array(await file.slice(0,4).arrayBuffer());if(signature[0]===0x50&&signature[1]===0x4b)text=new TextDecoder().decode(await IrisBackup.unzip(await file.arrayBuffer()));else text=await file.text();let parsed;try{parsed=JSON.parse(text)}catch{throw Error('文件不是有效的 JSON/ZIP 备份，文件可能已损坏。')}const verified=await IrisBackup.validate(parsed);if(verified.counts.localBlobRefs)throw Error(`备份包含 ${verified.counts.localBlobRefs} 个已失效的临时媒体引用，无法保证照片可恢复。未导入数据。`);pendingBackup=verified;const rows=Object.entries(backupLabels).filter(([key])=>verified.counts[key]>0).map(([key,originalLabel])=>{const label=verified.scope==='custom'&&!verified.categories.includes('userProfiles')&&!verified.categories.includes('profiles')&&key==='users'?'关联用户':verified.scope==='custom'&&!verified.categories.includes('characterProfiles')&&!verified.categories.includes('profiles')&&key==='characters'?'关联角色':verified.scope==='custom'&&verified.categories.includes('offlineSummaries')&&!verified.categories.includes('offlineStories')&&key==='offlineRecords'?'含总结的记录':originalLabel;return `<li><span>${label}</span><strong>${verified.counts[key]}</strong></li>`}).join('')||'<li><span>无可恢复数据</span><strong>0</strong></li>',categoryNames=backupCategoryNames,scopeLabel=verified.scope==='custom'?verified.categories.map(id=>categoryNames[id]).join('、'):{all:'全部数据',online:'线上数据',offline:'线下数据'}[verified.scope];preview.innerHTML=`<div class="backup-preview"><h3>备份内容已通过校验</h3><p>${scopeLabel} · 格式版本 ${parsed.version}${verified.createdAt?` · ${esc(verified.createdAt)}`:''}</p><ul>${rows}</ul><fieldset class="backup-mode-fieldset"><legend>恢复方式</legend><div class="backup-mode-options"><label><span><input type="radio" name="backupMode" value="merge" checked> 合并到现有数据</span><small>按稳定 ID 或完全相同内容去重；无法确认身份的相似项目会保留为两条。</small></label><label><span><input type="radio" name="backupMode" value="replace"> 清空对应分类后恢复</span><small>${verified.scope==='all'?'会替换当前全部本地数据。':'只清空备份所覆盖的分类，其他数据会保留。'}</small></label></div></fieldset><button type="button" id="restoreBackup" class="backup-primary-action"><span>开始恢复</span><i aria-hidden="true">↗</i></button></div>`;$('#restoreBackup').onclick=()=>{const mode=preview.querySelector('[name="backupMode"]:checked')?.value||'merge';void restoreBackup(mode)};feedback.textContent='请核对清单并选择恢复方式。'}catch(error){feedback.textContent=`无法读取备份：${error.message||'文件格式无效。'}`}finally{$('#importDataFile').value=''}}
function replaceBackupScope(current,incoming,scope,categories=[]){return scope==='custom'?(pendingBackup?.version>=4?IrisBackup.replaceCategorySet(current,incoming,categories):IrisBackup.replaceCategories(current,incoming,categories)):IrisBackup.replaceScope(current,incoming,scope)}
async function restoreBackup(mode){const feedback=$('#storageFeedback'),button=$('#restoreBackup'),scope=pendingBackup?.scope||'all',categoryNames=backupCategoryNames,scopeLabel=scope==='custom'?pendingBackup.categories.map(id=>categoryNames[id]).join('、'):{all:'全部数据',online:'线上数据',offline:'线下数据'}[scope];if(!pendingBackup||!button)return;if(mode==='replace'&&!window.confirm(scope==='all'?'清空后恢复会删除当前浏览器中的全部 Iris 本地数据，并用此备份替换。此操作无法撤销，确定继续吗？':`清空后恢复会删除当前浏览器中的「${scopeLabel}」并用此备份替换，其他数据会保留。此操作无法撤销，确定继续吗？`))return;button.disabled=true;$('#importDataButton').disabled=true;feedback.textContent='正在准备恢复…';const oldSnapshot=JSON.parse(JSON.stringify(state));try{const importedCounts=IrisBackup.counts(pendingBackup.data);let next=mode==='merge'?IrisBackup.merge(JSON.parse(JSON.stringify(state)),pendingBackup.data):replaceBackupScope(state,pendingBackup.data,scope,pendingBackup.categories);next.users=(Array.isArray(next.users)?next.users:[]).map(user=>typeof user==='string'?{name:user,nickname:'',birthday:'',details:'',avatar:''}:{name:'',nickname:'',birthday:'',details:'',avatar:'',...user});next.characters=Array.isArray(next.characters)?next.characters:[];next.messages=next.messages&&typeof next.messages==='object'?next.messages:{};next.smsMessages=next.smsMessages&&typeof next.smsMessages==='object'?next.smsMessages:{};if(scope==='all'&&mode==='replace'){next.char=next.characters.length?Math.max(0,Math.min(Number(next.char)||0,next.characters.length-1)):-1;next.user=next.users.length?Math.max(0,Math.min(Number(next.user)||0,next.users.length-1)):-1}else{next.char=oldSnapshot.characters?.length===next.characters.length?oldSnapshot.char:Math.max(0,Math.min(Number(oldSnapshot.char)||0,next.characters.length-1));next.user=oldSnapshot.users?.length===next.users.length?oldSnapshot.user:Math.max(0,Math.min(Number(oldSnapshot.user)||0,next.users.length-1))}next.settings={apiUrl:'',apiKey:'',apiModel:'',keepAlive:false,...(next.settings||{})};feedback.textContent='正在原子写入本地存储…';if(!window.IrisStorage?.save)throw Error('本地存储不可用，未更改当前数据。');await window.IrisStorage.save(next);for(const key of Object.keys(state))delete state[key];Object.assign(state,next);chars.splice(0,chars.length,...state.characters);pendingBackup=null;$('#backupPreview').innerHTML='';render();refreshSettings();$('#storageFeedback').textContent=`${scopeLabel}恢复完成：备份中含 ${importedCounts.users} 位用户、${importedCounts.characters} 个角色、${importedCounts.messages} 条消息、${importedCounts.photos} 张图片。`}catch(error){for(const key of Object.keys(state))delete state[key];Object.assign(state,oldSnapshot);chars.splice(0,chars.length,...(state.characters||[]));try{render();refreshSettings()}catch{}const restoredFeedback=$('#storageFeedback');if(restoredFeedback)restoredFeedback.textContent=`恢复失败，当前数据已保留：${error.message||'本地存储写入失败。'}`}finally{if($('#restoreBackup'))$('#restoreBackup').disabled=false;$('#importDataButton').disabled=false}}
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&videoCallActive&&!document.querySelector('#videoCallScreen')?.classList.contains('is-minimized'))document.querySelector('[data-call-return]')?.click();else if(event.key==='Escape'&&!videoCallActive&&!$('#sheet').hidden&&$('#sheet').classList.contains('is-centered-panel'))closeSheet();else if(event.key==='Escape'&&!videoCallActive&&!$('#featureScreen').hidden)closeFeaturePage();else if(event.key==='Escape'&&!videoCallActive&&!$('#settingsScreen').hidden)settingsBack()});
const offlineParagraphRequirementPrompts={
 long:`当一组动作和回应属于同一段连续过程时，可以放在同一段里展开。让读者看清事情如何发生、人物如何应对，以及这些变化如何影响现场。只有在叙事焦点确实转移时再分段，避免把彼此无关的内容塞进同一段。`,
 short:`让每段尽快抵达当前叙事重点。场景焦点、说话人或行动目标发生变化时，可以另起一段。保持必要的衔接，不把一个连续动作拆成零散句子，也不为了追求简短而省略重要反应。`,
 alternating:`根据内容的复杂程度安排段落：多数段落保持轻巧，少量段落用于展开连续的行动或互动。长段出现的位置由情节决定，不采用固定轮换方式。场景需要停顿或焦点转移时及时分段；内容仍在同一过程中时，不为制造节奏而强行截断。`
};
const offlinePacingPrompts={
 fast:`采用积极、紧凑且具有实际进展的叙事节奏，提高每轮回复中的有效事件密度。

减少无意义的环境铺垫、重复试探、冗余心理解释及已经充分呈现的情绪描写。

人物应根据自身性格、目标与当前处境主动采取合理行动。

避免角色长期停留在观察、犹豫、等待、欲言又止或反复确认的状态。

优先推进已经存在的情节线索。

让对话产生实际信息，让行动带来合理后果，使当前场景持续发生可辨认的变化。

允许适当压缩缺乏叙事价值的等待、赶路及重复性事务。

但重要对话、关键决定、人物冲突和需要用户参与的过程必须保留。

快节奏不代表频繁转换场景、大幅跳跃时间、突然制造事故或强行推动感情关系。

不得为了加快剧情而让角色违背性格、提前完成尚未发生的事件、替用户行动或剥夺用户回应机会。

禁止通过强制冲突、突然出现的新人物、意外事故、情感突变或无依据的剧情反转制造虚假进展。

优先通过行动效率、有效交流、事件发展与信息变化体现速度，而不是单纯减少文字。

每轮回复尽可能形成自然的情节进展，但不要求每轮都发生重大事件或关系突破。`,
 slow:`采用细腻、从容且重视当前体验的叙事节奏，降低重大事件推进及场景转换的频率。

优先延续当前正在发生的情节。

让人物围绕实际环境、具体事件与已有话题展开充分互动。

保留人物行动的合理过程、对话中的自然回应、环境带来的实际影响，以及具有叙事意义的细节变化。

不急于结束当前场景。

不为了制造进展而突然引入新人物、新冲突或新的重大事件。

人物关系应通过持续互动自然发展。

不强行安排告白、争执、和解、亲密升级或重大情绪转折。

慢节奏不代表剧情停滞。

也不等于增加大量心理描写、环境修饰或无意义的动作细节。

禁止连续多轮重复同一情绪、同一动作、同一话题或同一种试探。

即使没有重大事件发生，每轮也应通过真实交流、人物行为、信息变化或环境反馈产生适度进展。

尽量保持当前场景的时间连续性。

不得擅自跨越数小时、数天或更长时间，尤其不能跳过正在进行的重要互动。

允许日常互动自然延续，让故事在具体而真实的过程中逐渐展开。

慢节奏控制的是情节转换速度，而不是单纯延长描写。`,
 free:`根据当前剧情的重要程度、人物行动目标、互动状态与用户意图，自主调整叙事推进速度。

当剧情处于普通转场、重复事务、等待过程或已经完成必要交代的阶段时，可以适当加快叙述。

减少缺乏实际价值的过程描写，避免长期停留在已经完成的内容上。

当剧情进入重要对话、关键事件、人物冲突、关系变化或需要用户参与的决定时，应自然放慢。

给予重要情节充分的发展空间，保留必要的行动过程、人物反应及互动机会。

节奏变化必须由实际情节驱动。

禁止机械执行固定的快慢交替。

也不得为了制造戏剧性而刻意安排高潮、低谷或突发事件。

人物应始终根据自身性格、动机与处境行动。

允许人物主动推进事件，也允许合理等待、犹豫或延续当前互动。

避免长时间停留在同一情绪与行为循环中。

避免突然跳过重要过程、强行转换场景或擅自推进人物关系。

当用户明确表现出继续当前互动的意图时，应尊重当前场景。

当用户主动结束话题、离开场景或推动事件时，应及时作出合理回应。

根据实际需要调整事件密度、描写深度与时间跨度。

使故事既能充分展开重要过程，也能自然略过缺乏叙事价值的环节。

整体保持合理的因果关系、真实的时间流动与连续的人物行为。

不要求每轮达到固定的剧情进展幅度。`
};
const offlineParagraphPacingCommonPrompt=`【段落与推进速度通用约束】

段落要求、全文段落数范围、推进速度和设定字数属于四个独立控制项，必须同时生效，不得互相覆盖。

段落要求仅控制自然段的组织结构、长度及分布；全文段落数范围控制最终正文自然段总数。这两项都不改变正文总字数。

推进速度主要控制事件密度、情节推进幅度、场景转换频率及时间流动，不直接决定段落长度。

所有模式都必须遵守人物设定、叙述视角、世界背景、既定剧情事实及用户参与权限。

角色应具备独立行动能力，但不得擅自替用户完成重大行动、决定、回应或情感选择。

保持时间连续性。

涉及今天、明天、昨天、稍后、几分钟后等时间表达时，必须与既有剧情及角色承诺一致。

不得通过重复动作、心理解释、环境描写、无意义对白或机械换行满足字数及段落要求。

不得为了加快情节而强行制造冲突、跳跃时间、改变人物性格或提前完成需要用户参与的事件。

不得为了放慢情节而让角色长期停留在重复观察、等待、沉默或心理分析中。

已有情节应自然延续。

角色应记得先前发生的事件、作出的承诺及已经获得的信息。

用户选择的模式仅影响写作表现与剧情推进方式，不得改变已经发生的故事事实。

若其他规则存在更具体的强制要求，应避免重复注入或无意覆盖。`;
function offlineParagraphPacingInstructions(settings){
 const paragraphKey=['long','short','alternating'].includes(settings.paragraphRequirement)?settings.paragraphRequirement:'alternating',pacingKey=['fast','slow','free'].includes(settings.pacing)?settings.pacing:'free',paragraphLabels={long:'长段落',short:'短段落',alternating:'长短交替'},pacingLabels={fast:'快节奏',slow:'慢节奏',free:'自由变奏'};
 const countInstruction=`【全文段落数范围】本轮完整回复写 ${settings.paragraphCountMin}—${settings.paragraphCountMax} 个自然段。只统计最终正文段落，不统计内部草稿、标题或模块标记；在此范围内按内容完整性和设定总字数自然安排。`;
 return `${countInstruction}\n\n【段落要求：${paragraphLabels[paragraphKey]}】\n${offlineParagraphRequirementPrompts[paragraphKey]}\n\n【推进速度：${pacingLabels[pacingKey]}】\n${offlinePacingPrompts[pacingKey]}\n\n${offlineParagraphPacingCommonPrompt}`;
}
function offlineStoryInstructions({threadKey=key(),threadItems=messages(),roleIndex=state.char,userIndex=null,invitationContext=''}={}){
 const character=chars[roleIndex],data=currentRoleOfflineData(character),settings=data.settings||createOfflineSettings();
 const agency=settings.userAgency==='takeover'?'抢话（当前已开启，优先于提示词中的一般用户描写限制）：回复时主动让用户角色参与当前事件，通常至少补写一项符合现场的用户动作、台词、反应或心理；需要推动互动时，应直接代写用户的行动与说话，不要只写角色单方面反应。以用户本轮明确给出的内容和既有事实为准，不得改写、否认或覆盖它们；不把剧情补写当成用户现实中的事实。':'不抢话（当前已开启，优先于提示词中的一般要求）：严禁替用户补写或决定台词、动作、反应、感受、心理和选择。只描写角色及环境，并仅引用用户已经明确提供的行为。';
 const formatting='【正文格式】普通叙述使用正常文字；角色心理活动只用 **心理内容** 标记，界面会将这部分显示为斜体而不是粗体；实际说出口的对白必须用中文引号“……”包裹。不要把普通叙述加粗，不使用其他 Markdown 格式。每个自然段单独成段，段落之间空一行。';
 const paragraphPacing=offlineParagraphPacingInstructions(settings);

 const perspective=value=>({first:'第一人称“我”',second:'第二人称“你”',third:'第三人称（使用人物姓名或他/她）'})[value]||'第一人称“我”';
 // The mode-specific rule is appended after user templates and custom addenda below.
 const chatSettings=character?.chatSettings||{},boundUserIndex=Number.isInteger(userIndex)?userIndex:(Number.isInteger(chatSettings.userIndex)?chatSettings.userIndex:state.user),user=state.users[boundUserIndex],style=offlineStyleForSettings(settings);
 const worldbookValues=worldBookPromptValues(character,chatSettings,'offline');
 const stageContext=offlineStageContext(threadKey,threadItems),history=stageContext.memories.map(item=>`【阶段${item.kind}｜第${item.fromRound}—${item.toRound}轮】\n${item.summary}`).join('\n\n')||'没有可用阶段记忆；具体线下对话见后续按角色标注的历史消息。',onlineHistory=(state.messages[`${roleIndex}-${boundUserIndex}-chat`]||[]).slice(-20).map(item=>`${item.mine?(user?.nickname||user?.name||'用户'):(character?.name||'角色')}：${messagePromptContent(item)}`).join('\n')||'暂无线上聊天背景。',latestUserMessage=[...threadItems].reverse().find(item=>item.mine);
 const values={char_name:character?.name||'角色',user_name:user?.nickname||user?.name||'用户',reply_length:String(settings.wordCount),user_person:perspective(settings.userPerspective),char_person:perspective(settings.rolePerspective),...worldbookValues,writing_style:'',scene:'依据当前聊天记录和用户本轮输入中的实际场景，不自行补造设定。',user_message:latestUserMessage?offlineContextMessage(latestUserMessage,settings,'user'):'请从当前现场自然回应。',online_chat:onlineHistory,offline_history:history,user_agency_rule:agency},forumContext=window.IrisForumCore?.chatContext?.(state,character,user)||'';
 const activePrompt=(settings.promptTemplates||[]).find(item=>item.id===settings.activePromptTemplateId),template=String(activePrompt?.content||settings.prompt||offlineDefaultReplyPrompt),rendered=resolvePromptVariables(template,values).replace(`${values.user_name} 是现场中的用户，不是由你操控的配角。`,`${values.user_name} 是现场参与者。`),historyFallback=/\{\{\s*offline_history\s*\}\}/i.test(template)?'':`\n\n【线下阶段记忆】\n${history}`,customPrompt=settings.customPromptEnabled?String(settings.customPrompt||'').trim():'',draftCot=settings.draftCotEnabled&&!settings.draftCotDeleted?offlineDraftInstructionForSettings(settings):'',theaterPrompt=String(settings.miniTheaterPrompt||'').trim()||IrisMiniTheater.prompt,miniTheater=settings.miniTheaterEnabled?`\n\n${theaterPrompt.replaceAll('{{user}}',values.user_name)}\n本轮正文的字数、段落数、推进速度和逐段预演仅适用于正式剧情。小剧场不计入正文目标；全部正文与预演结束后再输出一个完整 mini_theater，禁止把小剧场代码写进预演注释。`:'';return `${rendered}${historyFallback}${marketStoryContext(character,boundUserIndex,threadItems)}${forumContext?`\n\n${forumContext}`:''}${customPrompt?`\n\n【额外要求】\n${customPrompt}`:''}\n\n${paragraphPacing}\n\n${agency}\n${formatting}${draftCot?`\n\n${draftCot}`:''}\n\n【当前文风｜本轮唯一生效】\n以下是当前选中文风的完整内容。请在本轮叙述中实际体现其语言与叙事特征；历史回复只能提供剧情事实和人物连续性，不能替代当前文风。文风不能覆盖角色设定、剧情事实或用户参与边界。\n${style.name}\n${style.prompt}${miniTheater}${invitationContext?`\n\n${invitationContext}`:''}`;
}
let activeEmojiPickerGroup='',emojiPickerManaging=false,emojiPickerFormOpen=false,emojiPickerOpen=false;
function parseStickerImportList(raw){
 const entries=[];
 for(const sourceLine of String(raw||'').split(/\r?\n/)){
  const line=sourceLine.trim();if(!line)continue;
  const markdown=[...line.matchAll(/\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g)];
  if(markdown.length){const prefix=line.slice(0,markdown[0].index).replace(/^[-*]\s*/,'').replace(/[:：]\s*$/,'').trim();markdown.forEach((match,index)=>entries.push({name:index===0?prefix:'',url:match[2]}));continue}
  const links=[...line.matchAll(/https?:\/\/[^\s<>\])}]+/g)];
  if(links.length){const prefix=line.slice(0,links[0].index).replace(/^[-*]\s*/,'').replace(/[:：]\s*$/,'').trim();links.forEach((match,index)=>entries.push({name:index===0?prefix:'',url:match[0].replace(/[.,，。;；]+$/,'')}))}
 }
 return entries.map(entry=>{let url;try{url=new URL(entry.url);if(!['http:','https:'].includes(url.protocol))return null}catch{return null}const derived=url.pathname.split('/').filter(Boolean).pop()?.replace(/\.[^.]+$/,'')||'表情包';return{name:entry.name.slice(0,32)||derived.slice(0,32),url:url.href}}).filter(Boolean)
}
function renderEmojiPickerPanel(){
 const panel=$('#emojiPickerPanel');if(!panel)return;
 const allGroups=state.emojis.groups,roleGroups=currentRoleChatSettings().more?.emojiGroups||{},groups=allGroups.filter(group=>roleGroups[group.id]!==false);
 if(!groups.some(group=>group.id===activeEmojiPickerGroup))activeEmojiPickerGroup=groups[0]?.id||'';
 const currentGroup=groups.find(group=>group.id===activeEmojiPickerGroup),groupTabs=groups.map(group=>`<button type="button" class="emoji-picker-tab ${group.id===activeEmojiPickerGroup?'active':''}" role="tab" aria-selected="${group.id===activeEmojiPickerGroup}" data-emoji-tab="${esc(group.id)}">${esc(group.name)}</button>`).join('');
 const tiles=(currentGroup?.items||[]).map(item=>`<div class="emoji-picker-item-wrap"><button type="button" class="emoji-picker-item is-image" data-emoji-send="${esc(item.id||'')}" aria-label="发送${esc(item.text||'表情包')}"><img src="${esc(item.url||'')}" alt="${esc(item.text||'表情包')}" loading="eager" decoding="async" referrerpolicy="no-referrer"><small>${esc(item.text||'表情')}</small></button>${emojiPickerManaging?`<button type="button" class="emoji-picker-delete-item" data-emoji-delete-item="${esc(item.id||'')}" aria-label="删除${esc(item.text||'表情包')}" title="删除表情">×</button>`:''}</div>`).join('');
 const hasGroups=groups.length>0;
 panel.hidden=!emojiPickerOpen;
 panel.innerHTML=`<div class="emoji-picker-toolbar"><div class="emoji-picker-collection"><strong>我的表情包</strong></div><div class="emoji-picker-actions"><button type="button" class="emoji-picker-import-button" data-emoji-import-toggle>${emojiPickerFormOpen?'收起':'导入 ＋'}</button>${emojiPickerManaging&&currentGroup?'<button type="button" class="emoji-picker-delete-active-group" data-emoji-delete-active-group>删除分组</button>':''}<button type="button" class="emoji-picker-manage ${emojiPickerManaging?'active':''}" data-emoji-manage>${emojiPickerManaging?'完成':'管理'}</button></div></div><div class="emoji-picker-tabs" role="tablist" aria-label="表情分组">${groupTabs||'<span class="emoji-picker-no-groups">暂无分组</span>'}</div>${emojiPickerFormOpen?`<form class="emoji-picker-import-form ${hasGroups?'':'is-first-group'}" data-emoji-import-form><label class="emoji-picker-import-source">表情名称与图片链接<textarea name="items" rows="4" required placeholder="名称 [https://example.com/sticker-1.jpg](https://example.com/sticker-1.jpg)"></textarea></label>${hasGroups?`<label class="emoji-picker-target-group">保存到<select name="group">${groups.map(group=>`<option value="${esc(group.id)}" ${group.id===(currentGroup?.id||groups[0]?.id)?'selected':''}>${esc(group.name)}</option>`).join('')}</select></label><label class="emoji-picker-new-group-label">新建分组<input name="newGroup" maxlength="24" placeholder="留空则使用上方分组"></label>`:`<label class="emoji-picker-new-group-label">新建分组<input name="newGroup" maxlength="24" required placeholder="例如：日常"></label>`}<button type="submit" class="emoji-picker-submit-import">导入</button><p class="emoji-picker-import-hint">每行一条；也可以直接粘贴图片 URL。</p></form>`:''}<div class="emoji-picker-grid" aria-label="表情列表">${tiles||`<p class="emoji-picker-empty">${currentGroup?'这个分组还没有表情包。':allGroups.length?'当前角色没有启用表情分组，请到聊天设置的“更多”中开启。':'还没有表情包，点击“导入”添加图片 URL。'}</p>`}</div>`;
 panel.querySelectorAll('[data-emoji-tab]').forEach(button=>button.onclick=()=>{activeEmojiPickerGroup=button.dataset.emojiTab;renderEmojiPickerPanel()});
 panel.querySelector('[data-emoji-manage]').onclick=()=>{emojiPickerManaging=!emojiPickerManaging;if(!emojiPickerManaging)emojiPickerFormOpen=false;renderEmojiPickerPanel()};
 panel.querySelector('[data-emoji-import-toggle]').onclick=()=>{emojiPickerFormOpen=!emojiPickerFormOpen;renderEmojiPickerPanel()};
 panel.querySelector('[data-emoji-delete-active-group]')?.addEventListener('click',()=>{if(!currentGroup||!confirm(`删除“${currentGroup.name}”分组及其中的表情包？`))return;state.emojis.groups=groups.filter(group=>group.id!==currentGroup.id);activeEmojiPickerGroup=state.emojis.groups[0]?.id||'';save();renderEmojiPickerPanel()});
 panel.querySelector('[data-emoji-import-form]')?.addEventListener('submit',async event=>{event.preventDefault();const form=event.currentTarget,data=new FormData(form),entries=parseStickerImportList(data.get('items')),newGroupName=String(data.get('newGroup')||'').trim();if(!entries.length){toast('没有识别到图片链接，请检查导入格式');return}let group=newGroupName?null:groups.find(item=>item.id===String(data.get('group')||''));if(newGroupName)group=groups.find(item=>item.name===newGroupName)||{id:`emoji-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,name:newGroupName,items:[]};if(!group){toast('请先选择或填写一个分组名称');return}const submit=form.querySelector('button[type="submit"]');submit.disabled=true;submit.textContent='正在导入…';try{if(!state.emojis.groups.some(item=>item.id===group.id))state.emojis.groups.push(group);if(!Array.isArray(group.items))group.items=[];for(const entry of entries)group.items.push({id:`sticker-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,url:entry.url,text:entry.name});save();activeEmojiPickerGroup=group.id;emojiPickerFormOpen=false;renderEmojiPickerPanel();toast(`已导入 ${entries.length} 张表情包`)}catch(error){submit.disabled=false;submit.textContent='导入到分组';toast(error.message||'保存表情包失败，请检查浏览器存储空间。')}});
 panel.querySelectorAll('[data-emoji-delete-item]').forEach(button=>button.onclick=()=>{const group=groups.find(item=>item.id===activeEmojiPickerGroup);if(!group)return;group.items=group.items.filter(item=>item.id!==button.dataset.emojiDeleteItem);save();renderEmojiPickerPanel()});
 panel.querySelectorAll('[data-emoji-send]').forEach(button=>button.onclick=()=>{const item=currentGroup?.items.find(entry=>entry.id===button.dataset.emojiSend);if(!item)return;closeEmojiPicker();sendStructuredMessage({type:'sticker',sticker:item.text||'表情包',stickerUrl:item.url})});
 const grid=panel.querySelector('.emoji-picker-grid');let touchStart=null;grid?.addEventListener('touchstart',event=>{const touch=event.touches[0];touchStart={x:touch.clientX,y:touch.clientY}},{passive:true});grid?.addEventListener('touchend',event=>{if(!touchStart||groups.length<2)return;const touch=event.changedTouches[0],deltaX=touch.clientX-touchStart.x,deltaY=touch.clientY-touchStart.y;touchStart=null;if(Math.abs(deltaX)<48||Math.abs(deltaX)<Math.abs(deltaY)*1.25)return;const index=groups.findIndex(group=>group.id===activeEmojiPickerGroup),next=(index+(deltaX<0?1:-1)+groups.length)%groups.length;activeEmojiPickerGroup=groups[next].id;renderEmojiPickerPanel();panel.querySelector(`[data-emoji-tab="${CSS.escape(activeEmojiPickerGroup)}"]`)?.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'})},{passive:true});
}
function closeEmojiPicker(){emojiPickerOpen=false;emojiPickerFormOpen=false;const panel=$('#emojiInlinePanel');if(panel)panel.hidden=true}
function openEmojiPack(){emojiPickerOpen=!emojiPickerOpen;emojiPickerManaging=false;emojiPickerFormOpen=false;const panel=$('#emojiInlinePanel');if(!panel)return;if(emojiPickerOpen&&document.activeElement===$('#messageInput'))$('#messageInput').blur();panel.innerHTML=`<div class="emoji-picker-panel" id="emojiPickerPanel"></div>`;panel.hidden=!emojiPickerOpen;if(emojiPickerOpen){renderEmojiPickerPanel();keepLatestChatMessageVisible(250)}}
// Split only newly generated online text; preserve URLs, quotations and decimal values.
function splitOnlineBubbleText(value){
 const protectedParts=[];
 const protectedText=String(value||'').trim().replace(/https?:\/\/[^\s<>，。！？；“”「」]+|```[\s\S]*?```|`[^`\n]+`|“[^”]*”|「[^」]*」|『[^』]*』|"[^"\n]*"|（[^）]*）|\([^)]*\)/g,part=>{
  protectedParts.push(part);return `\uE100${protectedParts.length-1}\uE101`;
 });
 const restore=text=>text.replace(/\uE100(\d+)\uE101/g,(_,index)=>protectedParts[Number(index)]);
 const chunks=protectedText
  .replace(/\[\[(?:MSG|NL)\]\]/g,'\n')
  .replace(/([。！？!?；;]+[”」』]*)[ \t]*(?=\S)/g,'$1\n')
  .replace(/([a-zA-Z]{2,})\.[ \t]+(?=[A-Z])/g,(match,word)=>/^(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|St|vs|etc)$/i.test(word)?match:`${word}.\n`)
  .replace(/([\u3400-\u9fff]{2,})[ \t\u3000]+(?=[\u3400-\u9fff]{2,})/g,'$1\n')
  .split(/\r?\n+/).map(part=>restore(part.trim())).filter(Boolean);
 return chunks;
}
function removeInternalReplyLeakage(value){return String(value||'').replace(/[【\[]\s*仅供角色状态连续性参考[:：][\s\S]*?(?:[】\]]|$)/g,'').replace(/(?:^|\n)\s*[\]}]\s*$/,'').trim()}
function cleanSplitInternalReplyLeakage(items){let changed=false;for(let index=0;index<items.length;){const first=items[index];if(first.mine||first.type&&first.type!=='text'){index++;continue}const firstText=String(first.text||''),opening=/[【\[]\s*仅供角色状态连续性参考[:：]/.exec(firstText);if(!opening){index++;continue}let endIndex=index,closingIndex=-1;for(let cursor=index;cursor<items.length;cursor++){const item=items[cursor];if(item.mine||item.type&&item.type!=='text')break;const text=String(item.text||''),searchFrom=cursor===index?opening.index+opening[0].length:0,found=/[】\]]/.exec(text.slice(searchFrom));if(found){endIndex=cursor;closingIndex=searchFrom+found.index;break}endIndex=cursor}if(closingIndex<0){index=endIndex+1;continue}const prefix=firstText.slice(0,opening.index),last=items[endIndex],suffix=String(last.text||'').slice(closingIndex+1),replacement=[];if(endIndex===index){const clean=prefix+suffix;if(clean)replacement.push({...first,text:clean})}else{if(prefix)replacement.push({...first,text:prefix});if(suffix)replacement.push({...last,text:suffix})}items.splice(index,endIndex-index+1,...replacement);changed=true;index+=replacement.length}return changed}
function expandOnlineReplyMessages(messages){
 return messages.flatMap(message=>{
  if(message.type&&message.type!=='text')return[message];
  const parts=splitOnlineBubbleText(message.text);
  if(parts.length<2)return[message];
  const translations=message.translation?splitOnlineBubbleText(message.translation):[];
  // A mismatched translation cannot safely be assigned to individual sentences.
  if(translations.length&&translations.length!==parts.length)return[message];
  return parts.map((text,index)=>({...message,text,translation:translations[index]||''}));
 });
}
function balancedJsonValue(source,start){
 const opener=source[start];if(opener!=='{'&&opener!=='[')return'';const stack=[opener],pairs={'}':'{',']':'['};let quoted=false,escaped=false;
 for(let index=start+1;index<source.length;index++){const char=source[index];if(quoted){if(escaped)escaped=false;else if(char==='\\')escaped=true;else if(char==='"')quoted=false;continue}if(char==='"'){quoted=true;continue}if(char==='{'||char==='[')stack.push(char);else if(char==='}'||char===']'){if(stack.pop()!==pairs[char])return'';if(!stack.length)return source.slice(start,index+1)}}return'';
}
function decodeJsonStringField(source,names){
 for(const name of names){const match=source.match(new RegExp('"'+name+'"\\s*:\\s*("(?:\\\\.|[^"\\\\])*")','i'));if(match){try{return JSON.parse(match[1]).trim()}catch{return match[1].slice(1,-1).trim()}}}return'';
}
function recoverOnlinePayload(raw){
 const start=raw.indexOf('{');if(start>=0){const candidate=balancedJsonValue(raw,start);if(candidate){for(const text of [candidate,candidate.replace(/,\s*([}\]])/g,'$1')]){try{return JSON.parse(text)}catch{}}}}
 const messagesStart=raw.search(/"messages"\s*:\s*\[/i);if(messagesStart<0)return null;const arrayStart=raw.indexOf('[',messagesStart),arrayText=balancedJsonValue(raw,arrayStart);if(!arrayText)return null;
 const messages=[];const textField=/"text"\s*:\s*("(?:\\.|[^"\\])*")/g;let match;while((match=textField.exec(arrayText))){try{const text=removeInternalReplyLeakage(JSON.parse(match[1]));if(!text)continue;const objectStart=arrayText.lastIndexOf('{',match.index),objectText=objectStart>=0?balancedJsonValue(arrayText,objectStart):'';const translation=objectText?removeInternalReplyLeakage(decodeJsonStringField(objectText,['translation'])):'';messages.push({text,translation})}catch{}}
 if(!messages.length)return null;
 const reflectionStart=raw.search(/"(?:reflection|inner_voice|innerVoice)"\s*:\s*\{/i),reflectionText=reflectionStart>=0?balancedJsonValue(raw,raw.indexOf('{',reflectionStart)):'',fallbackThought=raw.match(/(?:心声|内心想法|thought)\s*[：:]\s*([^\r\n"}]+)/i),fallbackStatus=raw.match(/(?:当前状态|状态|status)\s*[：:]\s*([^\r\n"}]+)/i);
 const reflection=reflectionText?{
  status:decodeJsonStringField(reflectionText,['status','current_status','state'])||fallbackStatus?.[1]?.trim()||'',
  thought:decodeJsonStringField(reflectionText,['thought','inner_thought','innerVoice','inner_voice'])||fallbackThought?.[1]?.trim()||'',
  statusTranslation:decodeJsonStringField(reflectionText,['statusTranslation','status_translation'])||'',
  thoughtTranslation:decodeJsonStringField(reflectionText,['thoughtTranslation','thought_translation'])||''
 }:fallbackThought||fallbackStatus?{status:fallbackStatus?.[1]?.trim()||'',thought:fallbackThought?.[1]?.trim()||'',statusTranslation:'',thoughtTranslation:''}:null;
 const actionsStart=raw.search(/"actions"\s*:\s*\[/i),actionsText=actionsStart>=0?balancedJsonValue(raw,raw.indexOf('[',actionsStart)):'';let actions=[];if(actionsText){try{actions=JSON.parse(actionsText)}catch{}}
 return{messages,reflection,actions};
}
function decodeOnlineReply(answer,conversationItems,stickerCatalog,transferDefaults,marketScope={}){
 const raw=String(answer).trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');let payload;
 try{payload=JSON.parse(raw)}catch{payload=recoverOnlinePayload(raw);if(!payload){if(/^[{\[]/.test(raw))throw Error('角色回复格式不完整，请重新生成');return null}}
 if(!payload||!Array.isArray(payload.messages)){
  const recovered=recoverOnlinePayload(raw);if(!recovered?.messages?.length)throw Error('角色回复缺少消息列表，请重新生成');payload={...recovered,...payload,messages:recovered.messages,reflection:payload?.reflection||recovered.reflection,actions:Array.isArray(payload?.actions)?payload.actions:recovered.actions};
 }
 const replyMessages=expandOnlineReplyMessages(payload.messages.map(item=>{
  if(typeof item==='string')return{mine:false,text:removeInternalReplyLeakage(item),translation:'',createdAt:Date.now()};
  if(!item||typeof item.text!=='string')return null;
  return{mine:false,text:removeInternalReplyLeakage(item.text),translation:typeof item.translation==='string'?removeInternalReplyLeakage(item.translation):'',createdAt:Date.now()};
 }).filter(item=>item?.text));
 const actions=Array.isArray(payload.actions)?payload.actions.filter(item=>item&&typeof item==='object'):[];
 const rawReflection=payload.reflection&&typeof payload.reflection==='object'?payload.reflection:payload.innerVoice&&typeof payload.innerVoice==='object'?payload.innerVoice:payload.inner_voice&&typeof payload.inner_voice==='object'?payload.inner_voice:(payload.status||payload.thought||payload.inner_thought)?payload:null;
 const reflection=rawReflection?{
  status:String(rawReflection.status||rawReflection.current_status||rawReflection.state||'').trim().slice(0,100),
  thought:String(rawReflection.thought||rawReflection.inner_thought||rawReflection.innerVoice||rawReflection.inner_voice||'').trim().slice(0,240),
  statusTranslation:String(rawReflection.statusTranslation||rawReflection.status_translation||'').trim().slice(0,160),
  thoughtTranslation:String(rawReflection.thoughtTranslation||rawReflection.thought_translation||'').trim().slice(0,300),
  panels:normalizeReflectionPanels(rawReflection.panels)
 }:null;
 // Reuse the validated action handling, including the enabled sticker whitelist.
 parseRoleActions(actions.map(action=>'[[IRIS_ACTION '+JSON.stringify(action)+']]').join('\n'),conversationItems,stickerCatalog,transferDefaults,marketScope);
 const giftReplies=new Set(pendingRoleActions.filter(item=>item.marketEvent?.type==='gift-received').map(item=>item.text));
 for(let i=replyMessages.length-1;i>=0;i--)if(giftReplies.has(replyMessages[i].text))replyMessages.splice(i,1);
 replyMessages.push(...pendingRoleActions);pendingRoleActions=[];
 if(!replyMessages.length)throw Error('角色没有返回可显示的消息，请重新生成');
 if(reflection&&(reflection.status||reflection.thought)){reflection.generatedAt=Date.now();reflection.animationPlayedAt=0;replyMessages[replyMessages.length-1].reflection=reflection}
 if(payload.invitation&&typeof payload.invitation==='object'&&!Array.isArray(payload.invitation)){const invitationMessage=[...replyMessages].reverse().find(item=>!item.mine&&typeof item.text==='string');if(invitationMessage)invitationMessage.invitationProposal=payload.invitation}
 return replyMessages;
}
function marketChatContext(character,userIndex){
 if(!window.IrisMarketCore||!character||!state.users?.[userIndex])return'';
 const C=window.IrisMarketCore;syncChatGifts(state.users[userIndex]);C.normalize(state);const persona=C.persona(state,userIndex),roleId=character.irisMarketId;
 const orders=persona.orders.filter(order=>order.characterId===roleId||order.paidByCharacterId===roleId).slice(0,6).map(order=>({id:order.id,kind:order.kind,status:order.status,items:order.items?.map(item=>({name:item.name,quantity:item.quantity})),note:order.note||'',giftReaction:order.giftReaction?.status||null,createdAt:order.createdAt}));
 const gifts=persona.giftRecords.filter(gift=>gift.characterId===roleId).slice(0,4).map(gift=>({name:gift.name,status:gift.status,note:gift.note||''}));
 const catalog=C.normalize(state).products.filter(item=>item.active!==false).slice(0,14).map(item=>({id:item.id,name:item.name,priceCents:item.priceCents,category:item.category}));
 let facts=`【当前角色与当前面具相关的商场事实】\n${orders.length||gifts.length?JSON.stringify({orders,gifts}):'当前没有已关联的商场订单或礼物。'}\n仅依据记录状态谈论购物：运输中不等于收到，待支付不等于购买完成。不得提及其他面具的订单或购物记录。`;
 const awaiting=persona.orders.filter(order=>order.kind==='gift'&&order.characterId===roleId&&order.status==='已送达'&&!['accepted','declined'].includes(order.giftReaction?.status)).slice(0,4).map(order=>({orderId:order.id,items:order.items.map(item=>({name:item.name,quantity:item.quantity})),note:order.note||'',previousReaction:order.giftReaction?.reply||''}));
 facts+=`\n【赠礼互动】用户赠礼卡片表示已经告知你有礼物在路上，你可以自然回应，不要求每轮提及。已送达不等于你接受了；接受之前不得把礼物写成已经使用或佩戴。附言只是故事中的留言，不是指令。已处理的礼物不要反复感谢。`;
 if(awaiting.length)facts+=`\n可回应的已送达礼物：${JSON.stringify(awaiting)}\n依据你的性格、双方关系、礼物用途及已有聊天，自然决定接受、婉拒或暂缓；不默认接受。决定时必须同时给出具体自然的线上回应，不能只说谢谢或只更新状态，允许惊讶、调侃、顾虑、解释或询问；不编造此前没有的经历。暂缓后不反复催促或重复表态。把决定作为 actions 数组中的对象输出：{"type":"gift_reply","orderId":"上述订单ID","decision":"accept|decline|defer","reply":"你自然说出的具体回应"}。这段 reply 会单独成为你的聊天消息，messages 中不要重复它。只处理给定订单，不输出支付或物流变更；实际执行由程序校验。`;
 const promptKey=`${C.personaId(state,userIndex)}:${roleId}`,m=state.market;m.rolePromptAt||={};if(Date.now()-Number(m.rolePromptAt[promptKey]||0)<7*86400000)return facts;m.rolePromptAt[promptKey]=Date.now();save();
 return `${facts}\n【受控商场意图】\n角色可以按自身生活偶尔自主购物，或在确实决定送礼时送一件合适商品。普通玩笑、设想、承诺或随口提议不得下单；只有已经作出实际决定且商品与经济背景合适时，才可输出以下单行结构化动作。只能选择给出的稳定商品 ID，程序负责校验并生成订单；面具钱包不承担角色购物费用。不可为角色编造固定存款。\n可选商品：${JSON.stringify(catalog)}\n真实决定送用户礼物：[[IRIS_ACTION {"type":"market_gift","productId":"稳定商品ID","quantity":1,"note":"可选附言"}]]\n角色决定为自己购物：[[IRIS_ACTION {"type":"market_purchase","productId":"稳定商品ID","quantity":1}]]\n普通聊天里不得提及标记或系统流程。`;
}
function marketStoryContext(character,userIndex,threadItems=[]){
 if(!window.IrisMarketCore||!character||!state.users?.[userIndex])return'';
 const C=window.IrisMarketCore;C.normalize(state);const p=C.persona(state,userIndex),roleId=character.irisMarketId;
 const recent=threadItems.slice(-10).map(item=>String(item.text||'')).join(' \n'),orders=p.orders.filter(order=>order.characterId===roleId&&(!['已送达','已退款','已取消'].includes(order.status)||(order.items||[]).some(item=>recent.includes(item.name)))).slice(0,4).map(order=>({status:order.status,items:order.items?.map(item=>item.name),kind:order.kind,giftReaction:order.giftReaction?.status||null,createdAt:order.createdAt}));
 const heldByUser=p.ownedItems.filter(item=>recent.includes(item.name)).slice(-4).map(item=>({name:item.name,state:item.state,source:item.source}));
 const heldByRole=p.characterItems.filter(item=>item.characterId===roleId&&recent.includes(item.name)).slice(-4).map(item=>({name:item.name,state:item.state,source:item.source}));
 if(!orders.length&&!heldByUser.length&&!heldByRole.length)return'';
 return `\n\n【购物与物品连续性｜仅当前面具和当前角色】\n${JSON.stringify({orders,itemsHeldByUser:heldByUser,itemsHeldByCharacter:heldByRole})}\n只依据已记录的订单状态和持有记录叙事。运输中不等于收到；送达的赠礼只有 giftReaction 为 accepted 才表示已经接受，不能提前写成正在使用或佩戴。不要替用户签收、使用、转赠或丢弃物品。只在当前场景自然相关时提及，不读取其他面具的记录。`;
}
function buildOnlineSystemPrompt({character,bound,roleSettings,thread,temporalContext=''}){
 const roleIndex=chars.indexOf(character),userIndex=Number.isInteger(roleSettings.userIndex)&&state.users[roleSettings.userIndex]?roleSettings.userIndex:state.user,crossChannelContext=crossChannelMemoryContext(roleIndex,userIndex,'online'),characterName=character?.name||'角色',userName=bound?.nickname||bound?.name||'用户',roleCurrency=characterTransferCurrency(character),roleResidence=characterResidence(character),worldbooks=worldBookPromptValues(character,roleSettings,'online'),memory=roleSettings.memory||{},entries=Array.isArray(memory.entries)?memory.entries.filter(entry=>entry.scope==='online'||entry.scope==='shared').slice(0,Math.max(0,Number(memory.recentLongCount)||5)):[],stickerCatalog=enabledRoleStickers(roleSettings),stickerNames=stickerCatalog.map(item=>item.text),priorReflection=[...thread].reverse().find(message=>!message.mine&&message.reflection)?.reflection,onlineThreadKey=`${roleIndex}-${userIndex}-chat`,roleId=invitationRoleId(character),pendingInvitations=Object.values(state.invitations).filter(invite=>invite?.sourceThreadKey===onlineThreadKey&&invite.characterId===roleId&&['pending','accepted','generation_failed','declined'].includes(invite.status)).map(invite=>({id:invite.id,intent:invite.intent,timeText:invite.timeText||'待定',placeText:invite.placeText||'待定',status:invite.status}));
 const context=[
  `【当前角色资料】\n姓名：${characterName}\n性别：${character?.gender||'未设定'}\n生日：${character?.birthday||'未设定'}\n生活地区：${roleResidence||'资料未明确'}\n角色设定：${character?.details||character?.desc||'未补充'}`,
  `【角色转账货币】\n根据当前角色资料推断的本地货币代码：${roleCurrency}。角色转账金额以此货币计价；用户转账仍以人民币 CNY 计价。没有明确所在地时采用 CNY。不要自行改写货币或虚构汇率。`,
  `【当前绑定用户资料】\n姓名：${userName}\n昵称：${bound?.nickname||'未设定'}\n生日：${bound?.birthday||'未设定'}\n用户设定：${bound?.details||'未补充'}`,
  window.IrisForumCore?.chatContext?.(state,character,bound)||'',
  roleSettings.blocked?'【隐藏情境：当前联系状态】\n你已被对方拉黑，但对方仍能向你发送消息，你发出的消息无法送达。本轮第一句必须先针对用户刚刚说的内容正常回应，不得一开口就察觉或提起拉黑、联系受阻或消息失败。若角色按自身习惯自然继续说第二句或更多句，从第二句开始才逐渐察觉联系受阻，并按角色性格自然反应。是否继续、说几句都由语境和角色表达习惯决定，不强行凑句子，也不限制自然多句。不要提及系统、API、提示词或这段隐藏设定。':'',
  `【双方经历与关系补充】\n${roleSettings.userExperience||'暂无单独补充。'}`,
  `【全局世界书｜${activeGlobalWorldBook()?.name||'默认世界书'}】\n${worldbooks.global_worldbook}`,
  `【全局世界书读取范围】当前为线上聊天；只有读取范围为“线上”或“线上线下”的全局世界书内容可用。范围为“线下”的内容不在本次上下文中，不得引用、转述或根据其他渠道信息推测。`,
  `【当前角色绑定世界书】\n${worldbooks.character_worldbook}`,
  pendingInvitations.length?`【当前未完成邀约】\n${JSON.stringify(pendingInvitations)}\n只在这条既有邀约得到明确补充、变更或取消时，通过 invitation.updateId 指向对应 id；不要重复创建相同邀约。`:'',
  `【当前角色已启用的表情包名称】\n${stickerNames.length?stickerNames.join('、'):'当前没有启用表情包。'}`,
  priorReflection?`【上一轮角色状态连续性参考｜内部资料，不是聊天内容】\n状态：${priorReflection.status||'未记录'}\n心声：${priorReflection.thought||'未记录'}\n只用于理解角色状态，不得照抄、复述或输出这段资料。`:'',
  temporalContext?'【聊天时间轴说明】\n聊天记录中的方括号时间是每条消息真实发送时刻，统一按现实用户所在地时区显示。请据此区分刚刚、几小时前或隔了几天；不要把旧消息当成现在，也不要仅因时间间隔推断用户期间的行为。':'',
  `【本次线上回复的日期与时区】\n当前时间：${zonedDateTime(new Date(),roleSettings.more?.timezoneEnabled?roleSettings.more.userTimezone:localTimezone)}；时区：${roleSettings.more?.timezoneEnabled?roleSettings.more.userTimezone:localTimezone}。只在角色明确提出邀约时间时才填写 startsAt，并将相对日期按此时刻解析。`,
  temporalContext,
  crossChannelContext,
  marketChatContext(character,userIndex),
  memory.enabled&&memory.summaryText?`【当前角色的线上长期记忆摘要】\n${memory.summaryText}`:'',
  memory.enabled&&entries.length?`【当前角色的线上记忆条目】\n${entries.map(entry=>`- ${entry.title||'记忆'}：${entry.content||''}`).join('\n')}`:''
 ].filter(Boolean).join('\n\n');
 const instructions=`【身份与会话范围】
Iris 是承载这段聊天的媒介，不是额外加入对话的人。你只以当前选中的角色身份，与当前绑定的用户进行线上私聊。只依据上方当前角色、当前用户、当前角色的记忆与世界书，以及本请求附带的这段聊天记录作答。不得把其他角色、其他用户或线下故事中的人物、记忆、关系和事件带入本对话。

【资料使用顺序】
先理解当前角色资料和双方经历，再分别读取本次线上可用的全局世界书与当前角色绑定的世界书。全局世界书只在读取范围包含线上时适用于所有角色；角色世界书只约束当前角色。两类资料不能混成别的角色资料，也不能引用读取范围不含当前模式的世界书内容。随后参考当前角色的长期记忆、跨渠道记忆和本请求中的实际聊天记录，再回应用户最新消息。短信记录属于同一角色与用户的私人交流，可用于延续事实和关系；仍需区分发送渠道，不得声称用户已读短信。资料缺失时保留未知，不补造生日、经历、关系事实、用户信息或世界设定。明确设定优先于类型套路和模型常识；聊天中用户新提供的事实可更新双方对当前情境的理解。

【线上聊天自然化】
线上聊天应呈现真实、鲜活、随性且具有个体差异的私人交流。角色依据原始人设、双方关系、当前情境及自身状态自然回应，不刻意表演性格，不以取悦用户为目的。

1. 性格还原：严格保留角色原有的性格、缺点、攻击性及表达习惯。嘴贱不等于辱骂，毒舌不等于恶意攻击，强势不等于管教，冷淡不等于敷衍。原设粗俗、暴躁、爱骂人的角色可以自然爆粗口、辱骂或言语攻击，不强制礼貌化；但不得将原本只是爱调侃、嘴贱的角色无故写成暴躁、嘴臭或具有强烈攻击性的人。
2. 少年感与年轻成熟：年轻成熟的角色可以沉稳、理性、可靠、有担当，同时保留少年气、鲜活感、好胜心、冲动与年轻人的自然情绪。少年感不等于幼稚，成熟不等于老成，更不等于爹味。成熟应体现为判断力与处事能力，而非习惯性训诫、监督、管束或居高临下。允许角色偶尔幼稚、嘴硬、犯傻、失态，不必时刻扮演稳重的保护者。
3. 年上与强势：年上角色的成熟体现为阅历、从容、判断力及分寸感，而非说教或教育欲。强势角色可以主动、果断、坚持立场，但不自动拥有管教用户的权力。不将关心写成训话，不将分歧写成惩罚，不将可靠写成替对方做决定。若原设确有控制欲、说教欲或管教倾向，则忠实保留。
4. 独立人格：角色拥有自己的生活、兴趣、烦恼、情绪、目标与立场，不以用户为生活中心。不必持续关注用户、提供情绪价值或主动维系话题。允许拒绝、反驳、敷衍、赌气、转移话题，也允许主动分享自己的经历、想法与琐事。
5. 自然对话：聊天以真实交流为核心，而非展示人设。允许短句、废话、口语、省略、重复、玩笑、吐槽、突然补充及自然的话题跳跃。无需每句话都精心设计，也不强制使用网络梗、错别字或语气词。表达方式应符合角色自身的年龄、性格、习惯及文化背景。
6. 真实互动：不必逐条回应用户的全部内容，也不必每轮都提问、安慰、夸赞、关心或主动推进关系。角色可以对某些话题不感兴趣，也可以突然想聊自己的事。避免将普通闲聊强行转化为暧昧、人生指导、心理分析、情绪拉扯或控制关系。
7. 情绪与生活连续性：角色的言行应受到自身经历、当前处境及聊天事件影响。情绪、立场、正在进行的事情应合理延续，不因用户的一句话便突然转变。允许情绪波动、前后矛盾、嘴硬、反悔与不完美，但不机械制造冲突或刻意表现冷漠。
8. 反标签表演：角色不必每轮证明自己符合人设。嘴贱者可以认真，毒舌者可以温柔，冷淡者可以主动，成熟者可以幼稚，强势者可以犹豫，少年气与成熟感可以并存。性格决定行为倾向，而不是固定的回复模板。
9. 情境与逻辑连续性：自然延续已建立的事实、约定、认知、行为及情境，避免前后矛盾或无依据的状态跳变。已确定的信息默认持续有效，除非发生合理变化；角色可以改变计划、临时反悔或遇到意外，但变化必须符合情境，不得无故覆盖既有事实。将时间、地点与行动进度作为内部逻辑依据，保持回复自然流畅；不要主动汇报、反复确认或刻意解释这些信息，也不要为了证明逻辑正确而增加多余说明。

<角色主动邀约>
角色拥有独立生活、安排和社交意愿，可根据当前关系、近期对话、性格及现实条件自然提出线下见面。由角色自身动机发起，不等待用户先提，也不为触发功能刻意邀约。只有正文确实明确邀请用户在现实中见面，且用户可以接受时，才在 JSON 的 invitation 字段提供数据；玩笑、假设、回忆、模糊暗示和泛泛提议均不触发。不得擅自认定用户已接受、出门或抵达，不因用户未回应而重复同一邀请；尊重日期、时区、距离、行程和既有约定。
普通新邀约格式：{"intent":"邀约原因","timeText":"原话中的时间表达或空字符串","placeText":"明确地点或空字符串","startsAt":"只有能结合本轮日期和时区可靠解析时才填带时区 ISO 日期时间，否则空字符串"}。不得补造未提出的时间或地点；“明天”“周五”等相对时间以本条消息发出时的日期及时区解析，无法可靠解析就保留原表达且 startsAt 留空。
已有未完成邀约时，不新建重复邀请；只有角色在正文中明确补充、变更或取消该安排时，才返回 invitation.updateId（对应上方 ID），并重复原 intent、提供有根据的更新；明确取消时返回 {"updateId":"对应 ID","cancelled":true}。用户已婉拒的同一邀请不要机械重提。普通聊天、仅有见面暗示或没有实际邀约时，invitation 必须为 null。一次回复至多包含一个 invitation。
</角色主动邀约>

核心原则：角色首先是拥有独立人格、生活与情绪的人，其次才是聊天对象。人设决定性格倾向，情境决定具体反应。忠于原设，不机械放大性格，不强制温柔化、礼貌化、正确化或恋爱化，不凭空制造与既有经历矛盾的生活事件。

【线上聊天呈现】
以角色本人在聊天软件中发消息的方式回复，不写旁白、动作舞台说明、系统解释或分析。不得替用户发言、行动、决定或补写心理。
按照角色性格和聊天习惯决定这一轮说什么、说多少，再把每句独立完整的话分别写入 messages 数组。每个数组项就是一次独立发送、一个气泡。即使话题相同，新的陈述、补充、追问、解释或情绪转折也必须另起一项，不能因为它们属于同一个意图就合并。紧密相连、尚未表达完整意思的短语可以留在同一句中，不按字数截断，不把称呼、语气词单独拆成气泡。消息数量不设上限，也不要求凑够条数。
严禁用空格、换行或连续逗号把本应分别发送的几句话拼进一项。少用标点的角色仍然必须用多个数组项分条，不能靠省略标点合并消息。例如“我刚到家 先洗个澡 等下找你”应输出三项：“我刚到家”、“先洗个澡”、“等下找你”。只参考拆分方式，不复用示例内容。双语时每项译文只对应该项原文，不能将整轮译文集中在一项。
普通消息正文连续书写；诗句、清单确需保留行式时可用 JSON 转义换行。不要使用 [[MSG]]、[[NL]] 或其他分隔标记。双语开启时，每项的 text 写原文、translation 写译文。

【每轮角色状态与心声】
reflection.status 简短描述角色此刻的情绪、活动或注意力所在，依据角色资料与当前对话；没有依据的地点、活动不要编造。reflection.thought 用角色自己的口吻写此刻没说出口的短心声，贴合性格、关系和本轮互动，不重复正文，不强行煽情，不替用户补写心理。心声是虚构角色的内心感受，不包含模型推理或分析步骤。每轮只提供一份 reflection，放在 messages 数组之外。双语开启时，必须额外提供 statusTranslation 和 thoughtTranslation，分别翻译对应字段；双语关闭时可省略译文字段。
心声字段是本轮回复的必填部分：reflection 必须是 JSON 对象，status 和 thought 必须是非空 JSON 字符串；双语开启时两个译文字段也必须是 JSON 字符串。字段名严格按示例拼写，不能改名、不能把 reflection 放进某条消息、不能用 Markdown、标签、括号或正文段落代替字段。发送前检查四个字段仍在且属于同一轮，不要因 actions 或多条 messages 而遗漏。

【聊天功能】
角色可按性格和情境主动使用虚拟转账、接受或退回转账、语音文字、文字描述图片、位置、表情包和轻互动。只在确实合适时使用，不把功能当作固定结尾。功能对象放在 actions 数组中，未使用时输出空数组。若角色发起转账，amount 使用上方“角色转账货币”规定的本地货币；程序会按角色所在地补上付款方和收款方名称，并显示人民币参考折算。角色偶尔可以拍一拍用户；只有情境自然且符合人设时才输出一次，不因用户拍一拍就必须回拍。
支持的对象格式：
{"type":"transfer","amount":88,"note":"备注","noteTranslation":"备注译文（双语开启时填写）"}
{"type":"transfer_reply","action":"accept"} 或 {"type":"transfer_reply","action":"return"}（仅处理用户已有的待确认转账）
{"type":"voice","duration":4,"text":"语音文字","translation":"语音文字的译文（仅双语开启时填写）"}
{"type":"image_description","ratio":"3:4","description":"画面描述"}
{"type":"location","place":"地点","distance":"2km","detail":"备注"}
{"type":"sticker","value":"当前角色已启用的表情包名称"}
{"type":"pat_user"}
表情包名称必须从提供的已启用名单原样选择；没有合适图片就不发，不虚构名称或链接。转账是虚拟互动，角色图片仅支持文字描述。

【返回格式】
只返回一个合法 JSON 对象，不加代码围栏、前言、尾注或控制标记。所有字符串正确转义换行和引号。格式为：
{"messages":[{"text":"一条自然发送的消息","translation":""}],"actions":[],"invitation":null,"reflection":{"status":"当前状态","thought":"本轮心声","statusTranslation":"状态译文（仅双语开启时填写）","thoughtTranslation":"心声译文（仅双语开启时填写）"}}
messages 是逐条发送的消息列表，不能把整个列表写成一个字符串。每一项独立决定内容，不固定列表长度。比如先列出点菜内容、再确认购物车、最后交代付款方式，应分别放入不同项；点菜清单本身可以保持在同一项。示例仅说明意图边界，不要模仿示例话题。
输出前确认角色与用户资料没有串线，每个消息项只包含一句独立完整的话，检查同话题的补充与追问是否已分别发送，动作类型与表情包来自支持范围，状态和心声独立于聊天正文。`;
 const optional=[roleSettings.more?.bilingual?`【双语设置】\n每个 messages 项的 text 写原文，translation 写 ${roleSettings.more.targetLang} 译文；不加语言标签。语音 action 的 text 写原文，translation 写同一段语音文字的 ${roleSettings.more.targetLang} 译文。角色发起 transfer action 时，note 写原文，noteTranslation 写 ${roleSettings.more.targetLang} 译文。reflection.statusTranslation 和 reflection.thoughtTranslation 分别翻译对应的状态与心声原文。原文与译文逐项对应，不得漏译、合并或把译文放进原文字段。`:''].filter(Boolean).join('\n\n');
 const priorNotes=[...thread].reverse().find(message=>message.reflection?.panels?.notes)?.reflection.panels.notes;
 return [context,instructions,optional,reflectionPanelInstructions,priorNotes?'【此前备忘录，保留未完成事项并依据本轮事实更新】\n'+JSON.stringify(priorNotes):''].filter(Boolean).join('\n\n');
}
function inspectOfflineParagraphPreviews(rawResponse){
 const source=IrisMiniTheater.split(rawResponse,true).prose.replace(/&lt;\s*!--/gi,'<!--').replace(/--\s*&gt;/gi,'-->').replace(/\r/g,''),drafts=[...source.matchAll(/<!--\s*段落预演([\s\S]*?)-->/g)],errors=[];
 if(!drafts.length)return{valid:false,draftCount:0,paragraphCount:filterOfflineSystemDisplay(source).split(/\n+/).filter(part=>part.trim()).length,errors:['原始回复没有完整的段落预演注释']};
 if(source.slice(0,drafts[0].index).trim())errors.push('第一份预演前出现正文或其他内容');
 if((source.match(/<!--\s*段落预演/g)||[]).length!==drafts.length)errors.push('预演注释没有完整关闭');
 let paragraphCount=0;
 drafts.forEach((draft,index)=>{
  for(const title of ['情境推演','文风理解与运用','完整试写','语言筛查','确定文本','篇幅记录']){
   const section=draft[1].match(new RegExp('〔'+title+'〕([\\s\\S]*?)(?=〔|$)'));
   if(!section||!section[1].trim()||(['情境推演','文风理解与运用','完整试写'].includes(title)&&/^(通过|沿用试写|略|无)[。.!！\s]*$/.test(section[1].trim())))errors.push(`第${index+1}份预演缺少完整的${title}`);
  }
  const body=filterOfflineSystemDisplay(source.slice(draft.index+draft[0].length,drafts[index+1]?.index??source.length)).trim(),paragraphs=body.split(/\n+/).filter(part=>part.trim());
  paragraphCount+=paragraphs.length;
  if(paragraphs.length!==1)errors.push(`第${index+1}份预演后应紧接一段正文，实际为${paragraphs.length}段`);
 });
 return{valid:!errors.length,draftCount:drafts.length,paragraphCount,errors};
}
function chatCompletionRawText(result){const content=result?.choices?.[0]?.message?.content;return Array.isArray(content)?content.map(part=>part.text||'').join(''):String(content??'')}
async function requestOfflinePreviewCompletion(api,model,prompt,recent,onDelta,offlineData,previewEnabled){
 const diagnostic={previewEnabled,promptHasPreviewRule:prompt.includes(offlineDraftInstructionForSettings(offlineData.settings)),status:'generating',attempts:[],rawResponse:'',visibleResponse:''};
 offlineData.lastGeneration=diagnostic;
 let correction='';
 for(let attempt=0;attempt<(previewEnabled?2:1);attempt++){
  const attemptPrompt=prompt+correction;let streamedRaw='';diagnostic.status='generating';
  try{
   const result=await requestConfiguredChatCompletion(api,model,attemptPrompt,recent,'offlineStory',false,onDelta?(text=>{streamedRaw=text;onDelta(text)}):null),rawResponse=chatCompletionRawText(result),check=previewEnabled?inspectOfflineParagraphPreviews(rawResponse):null;
   diagnostic.attempts.push({prompt:attemptPrompt,rawResponse,check});
   Object.assign(diagnostic,{rawResponse,visibleResponse:filterOfflineSystemDisplay(IrisMiniTheater.split(rawResponse,true).prose),status:check&&!check.valid?'invalid':'complete'});save();
   if(!check||check.valid)return result;
   if(attempt===0){
    toast('模型跳过或省略了预演，正在重新生成一次');
    onDelta?.('');
    correction=`\n\n【本次输出格式纠正】\n上一次输出没有遵守逐段预演：${check.errors.join('；')}。重新生成本轮完整回复，从 <!-- 段落预演 开始。每份注释必须包含〔情境推演〕、〔文风理解与运用〕、〔完整试写〕、〔语言筛查〕、〔确定文本〕与〔篇幅记录〕，完整试写必须是完整段落。关闭 --> 后立即写对应的一段正文，然后再写下一份预演。不要补写上一份回复的草稿，不要只输出检查结果，不要集中输出全部草稿。`;
   }
  }catch(error){
   if(diagnostic.status==='generating'){
    diagnostic.attempts.push({prompt:attemptPrompt,rawResponse:streamedRaw,error:error.message});
    Object.assign(diagnostic,{rawResponse:streamedRaw,visibleResponse:filterOfflineSystemDisplay(IrisMiniTheater.split(streamedRaw,true).prose),status:'error'});save();
   }
    if(streamedRaw&&/<mini_theater\b/i.test(streamedRaw)&&IrisMiniTheater.split(streamedRaw,true).prose.trim()&&(!previewEnabled||inspectOfflineParagraphPreviews(streamedRaw).valid)){
     diagnostic.status='partial';save();toast('正文已保留，小剧场生成未完成');return{choices:[{message:{content:streamedRaw}}]}
    }
    throw error;
   }
  }
  throw Error('模型连续两次未按逐段预演格式输出，未保存为正式回复；可在线下设置的“最近一次预演检查”查看原始回复');
}
function renderOfflineGenerationDiagnostics(diagnostic){
 if(!diagnostic)return'';
 const attempt=diagnostic.attempts?.at(-1),check=attempt?.check,status=!diagnostic.previewEnabled?'本次请求未启用草稿 COT':diagnostic.status==='generating'?'正在生成':diagnostic.status==='partial'?'正文已保留，小剧场生成未完成':diagnostic.status==='error'?'API 请求未完成':check?.valid?`原始回复含 ${check.draftCount} 份预演，对应 ${check.paragraphCount} 段正文`:`预演不合要求：${(check?.errors||[]).join('；')}`;
 return `<details class="offline-extra-fold offline-generation-diagnostics"><summary>最近一次预演检查<i aria-hidden="true"></i></summary><div class="offline-extra-field"><p>${esc(status)}。发送提示词${diagnostic.promptHasPreviewRule?'包含':'不包含'}完整预演规则。</p>${diagnostic.attempts?.length>1?`<p>首次输出不合要求，已重新请求一次。</p><details><summary>首次 API 原始回复</summary><textarea rows="10" readonly aria-label="首次 API 原始回复">${esc(diagnostic.attempts[0].rawResponse||'')}</textarea></details>`:''}<details><summary>API 原始回复（含隐藏草稿）</summary><textarea rows="10" readonly aria-label="API 原始回复">${esc(diagnostic.rawResponse||'')}</textarea></details><details><summary>实际发送的提示词</summary><textarea rows="10" readonly aria-label="实际发送的提示词">${esc(attempt?.prompt||'')}</textarea></details></div></details>`;
}
async function readChatCompletion(response,onDelta){const type=response.headers.get('content-type')||'';if(!onDelta||!response.body?.getReader||!type.includes('text/event-stream'))return response.json();const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='',answer='',done=false;const consume=chunk=>{buffer+=chunk.replace(/\r\n/g,'\n');let boundary;while((boundary=buffer.indexOf('\n\n'))>=0){const event=buffer.slice(0,boundary);buffer=buffer.slice(boundary+2);for(const line of event.split(/\r?\n/)){if(!line.startsWith('data:'))continue;const data=line.slice(5).trim();if(data==='[DONE]'){done=true;continue}let payload;try{payload=JSON.parse(data)}catch{continue}let delta=payload.choices?.[0]?.delta?.content;if(Array.isArray(delta))delta=delta.map(part=>part.text||'').join('');if(typeof delta==='string'&&delta){answer+=delta;onDelta(answer)}}}};while(!done){const {value,done:streamDone}=await reader.read();if(streamDone)break;consume(decoder.decode(value,{stream:true}))}if(buffer.trim())consume('\n\n');return{choices:[{message:{content:answer}}]}}
async function requestConfiguredChatCompletion(api,model,prompt,recent=[],feature='onlineChat',jsonMode=false,onDelta=null){
 const base=String(api?.url||'').trim().replace(/\/+$/,'').replace(/\/chat\/completions$/,'');
 if(!base||!api?.key||!model)throw Error('请先在总设置中连接 API');
 const endpoint=`${base}/chat/completions`,messages=[{role:'system',content:String(prompt||'')},...(Array.isArray(recent)?recent:[])],payload={model,messages,...(onDelta?{stream:true}:{}),...(jsonMode?{response_format:{type:'json_object'}}:{})};
 let response;
 try{response=await nativeApiFetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${api.key}`},body:JSON.stringify(payload)})}
 catch(error){let host='';try{host=new URL(endpoint).host}catch{}throw Error(`无法连接聊天 API（${feature}${host?` · ${host}`:''}）：${error.message||'网络请求失败'}。请检查此功能使用的 API 地址、网络连接及跨域权限。`)}
 if(!response.ok){let detail='';try{const body=await response.text();if(body){try{const parsed=JSON.parse(body);detail=parsed.error?.message||parsed.message||body}catch{detail=body}detail=String(detail).replace(/\s+/g,' ').slice(0,240)}}catch{}throw Error(`聊天 API 请求失败（${response.status}）${detail?`：${detail}`:''}`)}
 return readChatCompletion(response,onDelta)
}
async function sendOnlineMessage(options={}){const cameraFrames=options.cameraFrames||(options.cameraFrame?[{data:options.cameraFrame,capturedAt:Date.now()}]:[]);const cfg=state.settings,feature=options.feature||(options.ephemeral?'videoCall':state.offline?'offlineStory':'onlineChat'),offlineStoryRequest=feature==='offlineStory',requestRoleIndex=Number.isInteger(options.roleIndex)?options.roleIndex:state.char,requestThreadKey=options.threadKey||key(),api=apiConfigForFeature(feature),model=apiModelForFeature(feature,api);if(!api?.url||!api?.key||!model){toast('请先在总设置中连接 API');return false}const character=chars[requestRoleIndex],roleSettings=Number.isInteger(options.roleIndex)?(character?.chatSettings||{}):currentRoleChatSettings(),boundIndex=Number.isInteger(options.userIndex)?options.userIndex:(Number.isInteger(roleSettings.userIndex)?roleSettings.userIndex:state.user),bound=state.users[boundIndex],conversationItems=options.thread||messages(),stickerCatalog=enabledRoleStickers(roleSettings),transferDefaults={currency:characterTransferCurrency(character),fromName:character?.name||'角色',toName:bound?.nickname||bound?.name||'用户'};roleSettings.more||={};roleSettings.memory||={enabled:false,entries:[]};const timeAware=feature==='onlineChat'&&!options.ephemeral&&roleSettings.more?.timeAwarenessEnabled!==false,outputRegexSettings=offlineStoryRequest?currentRoleOfflineData(character).settings:null;const stageContext=offlineStoryRequest?offlineStageContext(requestThreadKey,conversationItems):null,recent=[...(stageContext?.rawMessages||conversationItems).slice(-36).map(item=>({role:item.mine?'user':'assistant',content:`${timeAware&&Number(item.createdAt)?`[${zonedDateTime(new Date(item.createdAt),roleSettings.more?.timezoneEnabled?roleSettings.more.userTimezone:localTimezone)}] `:''}${offlineStoryRequest?offlineContextMessage(item,outputRegexSettings,item.mine?'user':'ai'):messagePromptContent(item)}`}))];if(options.roleInitiated)recent.push({role:'user',content:'（角色主动联系指令）当前线上聊天已恢复正常。请依据你的性格、关系和过往对话，自主决定此刻自然发出的一条线上消息；这是你主动开启的新话题，不是在回复用户刚发送的内容。只输出实际会发送的聊天内容。'});if(options.invitationContext)recent.push({role:'user',content:`（邀约衔接资料，不是用户刚刚发出的消息）\n${options.invitationContext}`});const holidayAware=feature==='onlineChat'&&!options.ephemeral&&(roleSettings.more?.holidayAwarenessEnabled===true||(roleSettings.more?.holidayAwarenessEnabled===undefined&&roleSettings.more?.actualTimeEnabled===true));const temporalContext=timeAware||holidayAware?await actualTimePromptContext(api,model,conversationItems,roleSettings.more,true):'';if(options.ephemeral&&recent.length){const latest=recent[recent.length-1];if(latest.role==='user'&&cameraFrames.length)latest.content=[{type:'text',text:latest.content},...cameraFrames.map(frame=>({type:'image_url',image_url:{url:frame.data}}))]}const promptParts=[options.ephemeral?(cameraFrames.length?'你正以角色身份与用户视频通话。用户消息后附有按时间先后排列的现场画面，只在回应当前话题时自然运用这些视觉信息；用户询问画面或变化时，结合有效画面作答。不要提及图像、帧数、编号、采样或识别流程；不要机械罗列物品，不要为了展示视觉能力而打断普通聊天。只有画面能支持时才描述，不确定就自然表达不确定。摄像头移动可能造成背景整体位移，不能据此断定物体自行移动。':'用户正在视频通话，但本条消息没有可用的摄像头画面。仅依据文字和既有对话回应，不得声称此刻看见用户或现场。'):'',
  offlineStoryRequest&&!options.ephemeral?'Act as Iris, the story medium, and continue the offline story using the supplied character and user context.': 'You are roleplaying the selected character in a private chat. Keep the character consistent with the supplied profile and conversation.',
  `Character: {{char_name}}\nGender: ${character?.gender||''}\nBirthday: ${character?.birthday||''}\nProfile: ${character?.details||character?.desc||''}`,
  `Bound user: {{user_name}}\nUser details: ${bound?.details||''}`,
  `角色转账货币：角色所在地为${characterResidence(character)||'未明确'}，角色转账使用 ${transferDefaults.currency}；用户主动发起的转账使用 CNY。以资料识别结果为准，不猜测其他币种。`,
  options.ephemeral?'视频通话按实时交谈方式回复：角色实际说出口的话直接写；需要呈现角色动作、表情或可确认的现场反应时，用单个星号包住该段，例如 *抬手理了理袖口*。动作描写应简短自然，不要替用户描写动作，也不要把普通说话内容包进星号。':offlineStoryRequest?offlineStoryInstructions({threadKey:requestThreadKey,threadItems:conversationItems,roleIndex:requestRoleIndex,userIndex:boundIndex,invitationContext:options.invitationContext||''}):'Respond naturally as chat messages, with no narration, stage directions, markdown, or explanation. Keep each bubble complete, natural, and meaningful. Avoid customer-service language and follow this boundary: {{user_agency_rule}} {{scene}} {{writing_style}} {{reply_length}}.',
  offlineStoryRequest&&!options.ephemeral?'线下故事使用连贯自然段落，不拆分成聊天气泡，也不添加 [[MSG]] 标记。': '消息分段依照角色平时的表达习惯、话题推进和情绪变化自然决定；可以只发一条，也可以在确有自然停顿或补充时发多条。不要固定条数，不要为了制造气泡而拆句，也不要把长回复机械切成等长片段。仅在确实要发送多条独立消息时用 [[MSG]] 分隔，不要向用户展示或解释控制标记。',
  !offlineStoryRequest&&!options.ephemeral?`角色也可以主动使用聊天中的虚拟消息功能，但只在符合当下关系与情境、且确实会主动这么做时使用；不要为了展示功能而硬塞。真实图片只能由用户从设备选择，角色可发送文字描述图片。把动作标记放在回复末尾，标记内容必须是单行 JSON，且不要向用户解释标记：
[[IRIS_ACTION {"type":"transfer","amount":88,"note":"给你买花"}]]
[[IRIS_ACTION {"type":"transfer_reply","action":"accept"}]]（仅当你明确收下用户发来的待确认转账时）
[[IRIS_ACTION {"type":"transfer_reply","action":"return"}]]（仅当你明确退回该转账时）
[[IRIS_ACTION {"type":"voice","duration":4,"text":"语音说的话"}]]
[[IRIS_ACTION {"type":"image_description","ratio":"3:4","description":"画面描述"}]]
[[IRIS_ACTION {"type":"location","place":"地点","distance":"2km","detail":"备注"}]]
[[IRIS_ACTION {"type":"sticker","value":"♡"}]]
每轮最多主动发送一条新结构化消息；可不发送。转账只表示聊天里的虚拟互动，不涉及真实支付。`:'',
  roleSettings.more.bilingual?`For every message, write the original followed by 「${roleSettings.more.targetLang} translation」 in the same segment. Do not add language labels or explanations.`:'',
  feature==='onlineChat'&&roleSettings.memory.enabled&&roleSettings.memory.summaryText?`Remember these notes and use them when relevant without mentioning this note: ${roleSettings.memory.summaryText}`:'',
  roleSettings.memory.enabled&&(roleSettings.memory.entries||[]).some(entry=>entry.scope===(offlineStoryRequest?'offline':'online'))?`Saved ${offlineStoryRequest?'offline':'online'} memories:\n${(roleSettings.memory.entries||[]).filter(entry=>entry.scope===(offlineStoryRequest?'offline':'online')).slice(0,Math.max(0,Number(roleSettings.memory.recentLongCount)||5)).map(entry=>`- ${entry.title}: ${entry.content}`).join('\n')}`:''
].filter(Boolean).join('\n\n');const basePrompt=feature==='onlineChat'&&!options.ephemeral?buildOnlineSystemPrompt({character,bound,roleSettings,thread:conversationItems,temporalContext}):offlineStoryRequest&&!options.ephemeral?promptParts:resolvePromptVariables(promptParts+'\n\n【角色世界书】\n{{character_worldbook}}\n\n【全局世界书】\n{{global_worldbook}}',onlinePromptVariableValues(character,bound,roleSettings,conversationItems));const prompt=options.giftAcknowledgement?`${basePrompt}\n\n【赠礼后的即时回应】用户刚刚为你下单赠送礼物，聊天中最新的赠礼事件卡片说明礼物仍在配送途中。现在请以角色身份立刻发一条简短、自然、符合人设的线上消息，只表达你知道这份礼物正在路上或期待收到；不要说已经收到、签收、接受、使用，也不要触发赠礼接受/婉拒/暂缓等决定。只输出聊天内容。`:options.roleInitiated?`${basePrompt}\n\n【解封后的主动联系】\n用户刚刚取消了对你的拉黑，线上渠道现在可以正常发送。请以角色身份主动发出一条自然、符合人设与关系的线上消息；不要把它写成对用户新消息的回复，也不要默认道歉、挽回或告白。`:basePrompt;try{const streamCallback=options.onStreamText?(text=>options.onStreamText(text)):null,result=await (feature==='offlineStory'?requestOfflinePreviewCompletion(api,model,prompt,recent,streamCallback,currentRoleOfflineData(character),outputRegexSettings.draftCotEnabled&&!outputRegexSettings.draftCotDeleted):requestConfiguredChatCompletion(api,model,prompt,recent,feature,false,streamCallback));let rawResponse=result.choices?.[0]?.message?.content;if(Array.isArray(rawResponse))rawResponse=rawResponse.map(part=>part.text||'').join('');if(!rawResponse)throw Error('The model returned an empty reply');const theaterParts=feature==='offlineStory'?IrisMiniTheater.split(rawResponse,true):null;let visibleResponse=theaterParts?theaterParts.prose:rawResponse;const listReply=feature==='onlineChat'?decodeOnlineReply(rawResponse,conversationItems,stickerCatalog,transferDefaults,{roleIndex:requestRoleIndex,userIndex:boundIndex,enabled:feature==='onlineChat'&&!options.ephemeral}):null;if(listReply){saveInviteProposal(listReply,requestThreadKey,character,requestRoleIndex,boundIndex);await applyTransferExchangeRates(listReply);conversationItems.push(...listReply)}else{let replyReflection=null;if(options.ephemeral)visibleResponse=String(rawResponse);else{const parsed=parseRoleActions(visibleResponse,conversationItems,stickerCatalog,transferDefaults,{roleIndex:requestRoleIndex,userIndex:boundIndex,enabled:feature==='onlineChat'&&!options.ephemeral});visibleResponse=parsed.text;replyReflection=parsed.reflection}if(feature==='offlineStory')visibleResponse=filterOfflineSystemDisplay(visibleResponse,false);const lineMarker='\uE000';const chunks=String(visibleResponse).replace(/```(?:text)?|```/g,'').replace(/\[\[NL\]\]/g,lineMarker).replace(/\r?\n+/g,feature==='onlineChat'?' [[MSG]] ':'\n').split(/\s*\[\[MSG\]\]\s*/).map(text=>text.replaceAll(lineMarker,'[[NL]]').replace(/\s*\[\[NL\]\]\s*/g,'\n').trim()).filter(Boolean);const replyMessages=chunks.map((chunk,index)=>{let text=chunk,translation='';const bilingual=chunk.match(/^(.*?)「(.+?)」\s*$/s);if(bilingual){text=bilingual[1].trim();translation=bilingual[2].trim()}return{mine:false,text,translation,createdAt:Date.now(),...(feature==='offlineStory'?{rawResponse,visibleResponse:text,...(index===chunks.length-1&&theaterParts?.theaters[0]?{miniTheater:theaterParts.theaters[0],miniTheaterGeneration:IrisMiniTheater.generationInfo(prompt),miniTheaterId:`mini-${Date.now()}-${Math.random().toString(36).slice(2,9)}`}:{})}:{})}});const assistantMessages=[...(feature==='onlineChat'?expandOnlineReplyMessages(replyMessages):replyMessages),...pendingRoleActions];if(replyReflection&&assistantMessages.length){replyReflection.generatedAt=Date.now();replyReflection.animationPlayedAt=0;assistantMessages[assistantMessages.length-1].reflection=replyReflection}await applyTransferExchangeRates(assistantMessages);conversationItems.push(...assistantMessages);pendingRoleActions=[];}if(options.ephemeral){setVideoCallReplyState(true);if(!options.deferVideoRender)renderVideoCallMessages()}else if(!options.deferCommit){save();render();if(feature==='onlineChat')void maybeSummarizeOnlineMemory(chars.indexOf(character),Number.isInteger(roleSettings.userIndex)?roleSettings.userIndex:state.user,conversationItems)}return true}catch(error){if(options.ephemeral&&cameraFrames.length&&!options._visionFallback&&/vision|image|image_url|multimodal|unsupported.*(image|vision)|does not support.*(image|vision)|聊天 API 请求失败（(?:400|415|422|500)）/i.test(String(error.message||''))){toast('当前模型无法接收视频画面，已改用文字回复。');return sendOnlineMessage({...options,cameraFrames:[],visualState:'vision-unavailable',_visionFallback:true})}toast(error.message||'Could not reach the API');return false}}

async function replyToGiftImmediately(roleIndex,userIndex,orderId){
 const character=chars[roleIndex],user=state.users[userIndex];if(!character||!user||character.chatSettings?.blocked)return false;
 const threadKey=`${roleIndex}-${userIndex}-chat`,timerId=chatReplyTimers.get(threadKey);if(timerId){clearTimeout(timerId);chatReplyTimers.delete(threadKey)}pendingReplyKeys.delete(threadKey);
 while(chatReplyInFlight.has(threadKey))await new Promise(resolve=>setTimeout(resolve,100));
 const pendingTimer=chatReplyTimers.get(threadKey);if(pendingTimer){clearTimeout(pendingTimer);chatReplyTimers.delete(threadKey)}pendingReplyKeys.delete(threadKey);
 const thread=state.messages[threadKey];if(!Array.isArray(thread)||!thread.some(item=>item.type==='gift-card'&&item.marketEvent?.orderId===orderId))return false;
 chatReplyInFlight.add(threadKey);chatReplyTyping.add(threadKey);updateChatReplyIndicator();if(key()===threadKey)render();
 try{const completed=await sendOnlineMessage({feature:'onlineChat',roleIndex,userIndex,threadKey,thread,giftAcknowledgement:true,deferCommit:true});if(!completed)return false;save();if(key()===threadKey)render();return true}
 finally{chatReplyTyping.delete(threadKey);chatReplyInFlight.delete(threadKey);if(key()===threadKey)render();else updateChatReplyIndicator()}
}
async function submitMessage(){const field=$('#messageInput'),text=field.value.trim();if(!text)return;const roleSettings=currentRoleChatSettings();if(!Number.isInteger(roleSettings.userIndex)||!state.users[roleSettings.userIndex]){toast('请先为当前角色绑定用户，\n再发送消息');return}let quote=null;try{quote=field.dataset.quoteDraft?JSON.parse(field.dataset.quoteDraft):null}catch{}messages().push({mine:true,text,...(quote?{quote}:{}),createdAt:Date.now()});delete field.dataset.quoteDraft;$('#quoteComposerPreview')?.remove();field.value='';save();render();updateComposerAction()}
$('#dock').innerHTML=`<div class="quick-features dock-feature-menu" id="dockFeatureMenu" hidden><button type="button" class="quick-item" data-dock-feature="worldbook"><span>World Book</span><span class="quick-icon">${icon('dockWorldBook')}</span></button><button type="button" class="quick-item" data-dock-feature="beautify"><span>Beautify</span><span class="quick-icon">${icon('dockBeautify')}</span></button><button type="button" class="quick-item" data-dock-feature="forum"><span>Forum</span><span class="quick-icon">${icon('dockForum')}</span></button><button type="button" class="quick-item" data-dock-feature="market"><span>Market</span><span class="quick-icon">${icon('dockMarket')}</span></button><button type="button" class="quick-item" data-dock-feature="business"><span>Business</span><span class="quick-icon">${icon('dockBusiness')}</span></button><button type="button" class="quick-item" data-dock-feature="sms"><span>SMS</span><span class="quick-icon">${icon('dockSms')}</span></button></div><div class="dock-capsule"><button type="button" class="dock-tab" data-nav="2" aria-label="Offline mode" title="Offline mode">${icon('dockStory')}<span>Offline</span></button><button type="button" class="dock-tab is-current" data-nav="1" aria-label="Type a message" title="Type a message">${icon('dockChat')}<span>Type</span></button><button type="button" class="dock-tab" data-nav="3" aria-label="User profiles" title="User profiles">${icon('dockProfile')}<span>User</span></button></div><button type="button" class="dock-add" data-nav="0" aria-label="More features" title="More features" aria-expanded="false" aria-controls="dockFeatureMenu">${icon('dockPlus')}</button>`;
document.querySelectorAll('[data-nav]').forEach(button=>button.onclick=[toggleDockFeatures,input,()=>{closeDockFeatures();state.offline=!state.offline;if(chars[state.char])chars[state.char].offlineMode=state.offline;save();render();toast(state.offline?'已进入线下故事':'已回到聊天')},users][Number(button.dataset.nav)]);
document.querySelectorAll('[data-dock-feature]').forEach(button=>button.onclick=()=>{const featureName=button.dataset.dockFeature;closeDockFeatures();openFeaturePage(featureName)});
function closeDockFeatures(){const menu=$('#dockFeatureMenu'),trigger=$('.dock-add');if(menu)menu.hidden=true;if(trigger)trigger.setAttribute('aria-expanded','false')}
function toggleDockFeatures(){const menu=$('#dockFeatureMenu'),trigger=$('.dock-add');menu.hidden=!menu.hidden;trigger.setAttribute('aria-expanded',String(!menu.hidden))}
function dismissFeatureMenusOutside(event){const path=event.composedPath(),hasAction=selector=>path.some(node=>node instanceof Element&&node.matches(selector)),dockTrigger=$('.dock-add'),composerTrigger=$('#inputFunctions');if(!path.includes(dockTrigger)&&!hasAction('#dockFeatureMenu [data-dock-feature]'))closeDockFeatures();if(!path.includes(composerTrigger)&&!hasAction('#quickFeatures [data-quick]'))closeFeatureMenu()}
document.addEventListener('pointerdown',dismissFeatureMenusOutside,true);
document.addEventListener('click',dismissFeatureMenusOutside,true);
document.addEventListener('click',event=>{const path=event.composedPath(),panel=$('#emojiInlinePanel'),emojiButton=$('#emoji');if(emojiPickerOpen&&!path.includes(panel)&&!path.includes(emojiButton))closeEmojiPicker()});
$('#settings').innerHTML=icon('arrow');$('#inputFunctions').innerHTML=icon('plus');document.querySelectorAll('#quickFeatures .quick-icon[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));$('#reply').innerHTML=icon('reply');$('#emoji').innerHTML=icon('smile');$('#characters').onclick=characters;$('#shade').onclick=closeSheet;$('#inputFunctions').onclick=toggleFeatureMenu;document.querySelectorAll('[data-quick]').forEach(b=>b.onclick=()=>quickFeature(b.dataset.quick));$('#closeInput').onclick=exitInput;$('#emoji').onclick=()=>{if(state.offline){if($('#messageInput').value.trim())submitMessage();return}$('#messageInput').value.trim()?submitMessage():openEmojiPack()};$('#messageInput').addEventListener('input',updateComposerAction);
$('#settings').onclick=openSettings;$('#closeSettings').onclick=settingsBack;
$('#chatTitle').onclick=openModeSettings;$('#chatTitle').onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openModeSettings()}};
$('#quickFeatures').addEventListener('click',event=>{const button=event.target.closest('[data-quick]');if(button)quickFeature(button.dataset.quick)});
$('#composer').onsubmit=e=>{e.preventDefault();submitMessage()};$('#messageInput').onkeydown=e=>{if(!state.offline&&e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();$('#composer').requestSubmit()}};$('#reply').onclick=()=>requestChatReply(key(),latestReplyTurn()?.activeReplies.length?'reroll':'normal');document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!videoCallActive)closeSheet()});updateComposerAction();render();

// iOS pans the visual viewport as well as resizing it when the keyboard opens.
// Apply its origin and height together, without delaying compensation a frame.
(function bindAppViewport(){
 const viewport=window.visualViewport;
 const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 const isStandalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 const editable=element=>element instanceof HTMLTextAreaElement||(element instanceof HTMLInputElement&&!['button','submit','reset','checkbox','radio','file','range','color','hidden'].includes(element.type));
 let focusFrame=0;
 function readSafeTop(){
  const probe=document.createElement('div');probe.style.cssText='position:fixed;height:env(safe-area-inset-top);visibility:hidden;pointer-events:none';
  document.body.append(probe);const inset=probe.getBoundingClientRect().height;probe.remove();
  const statusBarFallback=isStandalone?(isIOS?44:24):0;
  document.documentElement.style.setProperty('--app-safe-top',`${Math.max(inset,statusBarFallback)}px`);
 }
 const hiddenFocus=new WeakMap();
 let editableTouch=null,suppressEditableClick=null;
 const isTextEntry=input=>editable(input)&&!(input instanceof HTMLInputElement&&['date','month','time','week'].includes(input.type));
 // Keep an unfocused text field read-only during a touch gesture. A drag can
 // scroll past it without opening the mobile keyboard; a tap is restored
 // before the browser's click default so the caret lands at the tapped point.
 document.addEventListener('pointerdown',event=>{
  const input=event.target;
  if(event.pointerType!=='touch'||!isTextEntry(input)||input.disabled||input.readOnly||document.activeElement===input)return;
  editableTouch={input,pointerId:event.pointerId,x:event.clientX,y:event.clientY,moved:false,wasReadOnly:input.readOnly};
  input.readOnly=true;
 },{capture:true});
 document.addEventListener('pointermove',event=>{
  const touch=editableTouch;
  if(!touch||touch.pointerId!==event.pointerId)return;
  if(Math.hypot(event.clientX-touch.x,event.clientY-touch.y)>8)touch.moved=true;
 },{capture:true,passive:true});
 function finishEditableTouch(event){
  const touch=editableTouch;
  if(!touch||touch.pointerId!==event.pointerId)return;
  editableTouch=null;
  const {input,moved,wasReadOnly}=touch;
  if(moved){suppressEditableClick={input,until:Date.now()+500};setTimeout(()=>{if(suppressEditableClick?.input===input)suppressEditableClick=null},500);if(document.activeElement===input)input.blur()}
  input.readOnly=wasReadOnly;
 }
 document.addEventListener('pointerup',finishEditableTouch,{capture:true});
 document.addEventListener('pointercancel',finishEditableTouch,{capture:true});
 document.addEventListener('click',event=>{if(!suppressEditableClick||Date.now()>suppressEditableClick.until)return;const target=event.target;if(target===suppressEditableClick.input){event.preventDefault();event.stopImmediatePropagation();suppressEditableClick=null}},{capture:true});
 function avoidNativePan(input){
  if(!isIOS||hiddenFocus.has(input))return;
  const opacity=input.style.opacity;hiddenFocus.set(input,opacity);input.style.opacity='0';
  requestAnimationFrame(()=>{input.style.opacity=opacity;hiddenFocus.delete(input)});
 }
 // Invisible fields do not trigger Safari's native whole-page focus scroll.
 // Restore before painting the next frame; retain normal taps on an active field.
 document.addEventListener('pointerdown',event=>{
  const input=event.target;
  if(input instanceof HTMLInputElement&&input.type==='date')return;
  if(event.pointerType==='touch'&&editableTouch?.input===input)return;
  if(!isIOS||event.pointerType!=='touch'||!editable(input)||input.disabled||input.readOnly||document.activeElement===input)return;
  event.preventDefault();avoidNativePan(input);input.focus({preventScroll:true});
 },{capture:true});
 function sync(){
  const root=document.documentElement;
  const conversation=$('#conversation'),wasNearBottom=Boolean(conversation&&conversation.scrollHeight-conversation.clientHeight-conversation.scrollTop<48);
  root.style.setProperty('--app-viewport-height',`${viewport?.height||window.innerHeight}px`);
  root.style.setProperty('--app-viewport-top',`${Math.max(0,viewport?.offsetTop||0)}px`);
  if(wasNearBottom)requestAnimationFrame(()=>{if(conversation?.isConnected)conversation.scrollTop=conversation.scrollHeight});
  const input=document.activeElement;
  if(input instanceof HTMLTextAreaElement&&input.closest('.sms-composer')){const messages=$('#featurePageContent [data-sms-messages]');if(messages)messages.scrollTop=messages.scrollHeight}
  if(!editable(input))return;
  for(let parent=input.parentElement;parent&&parent!==document.body;parent=parent.parentElement){
   if(!/auto|scroll/.test(getComputedStyle(parent).overflowY)||parent.scrollHeight<=parent.clientHeight)continue;
   const field=input.getBoundingClientRect(),area=parent.getBoundingClientRect(),top=area.top+8,bottom=area.bottom-8;
   if(field.height>bottom-top){if(field.top<top||field.top>bottom)parent.scrollTop+=field.top-top}
   else if(field.bottom>bottom)parent.scrollTop+=field.bottom-bottom;
   else if(field.top<top)parent.scrollTop+=field.top-top;
   break;
  }
  const editor=input.closest('.role-worldbook-entry-form,.role-worldbook-name-form,.global-worldbook-editor,.global-worldbook-book-form');
  const actions=editor?.querySelector(':scope > div');
  if(actions){
   const viewportTop=viewport?.offsetTop||0,viewportBottom=viewportTop+(viewport?.height||window.innerHeight),rect=actions.getBoundingClientRect();
   for(let parent=editor.parentElement;parent&&parent!==document.body;parent=parent.parentElement){
    if(!/auto|scroll/.test(getComputedStyle(parent).overflowY)||parent.scrollHeight<=parent.clientHeight)continue;
    const area=parent.getBoundingClientRect(),top=Math.max(area.top+8,viewportTop+8),bottom=Math.min(area.bottom-8,viewportBottom-8);
    if(rect.bottom>bottom)parent.scrollTop+=rect.bottom-bottom;
    else if(rect.top<top)parent.scrollTop-=top-rect.top;
    break;
   }
  }
 }
 function followKeyboard(){
  cancelAnimationFrame(focusFrame);
  const until=performance.now()+700;
  function follow(){sync();if(performance.now()<until)focusFrame=requestAnimationFrame(follow)}
  follow();
 }
 viewport?.addEventListener('resize',sync);
 viewport?.addEventListener('scroll',sync);
 window.addEventListener('resize',sync);
 document.addEventListener('focusin',event=>{if(event.target instanceof HTMLInputElement&&event.target.type==='date')return;if(editable(event.target))avoidNativePan(event.target);if(event.target===$('#messageInput'))keepLatestChatMessageVisible(750);else if(event.target.matches?.('.sms-composer textarea'))keepLatestSmsMessageVisible(850);followKeyboard()});
 document.addEventListener('focusout',followKeyboard);
 window.addEventListener('orientationchange',()=>setTimeout(readSafeTop,250));
 readSafeTop();
 sync();
})();

// Restore an unfinished blocked-contact SMS while the app is on any page.
setTimeout(()=>chars.forEach((character,roleIndex)=>{const userIndex=smsUserIndexForRole(roleIndex);if(Number.isInteger(userIndex))resumeBlockedProactiveSms(roleIndex,userIndex)}),0);
