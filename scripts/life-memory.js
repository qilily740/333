/* Pure follow-up and embedding helpers. Network requests are only made on demand. */
(function(root){
'use strict';
const HOUR=3600000;
function hash(text){let value=2166136261;const input=String(text);for(let i=0;i<input.length;i++){value^=input.charCodeAt(i);value=Math.imul(value,16777619)}return(value>>>0).toString(36)}
function sourceId(message){return hash(JSON.stringify([Boolean(message.mine),message.createdAt||0,message.text||'']))}
function normalize(slot){slot.items=Array.isArray(slot.items)?slot.items:[];slot.ignored=Array.isArray(slot.ignored)?slot.ignored:[];slot.applied=Array.isArray(slot.applied)?slot.applied:[];slot.revision=Number(slot.revision)||0;return slot}
function reconcile(slot,thread){normalize(slot);const sources=new Set(thread.filter(x=>x.mine).map(sourceId));const before=slot.items.length;slot.items=slot.items.filter(x=>sources.has(x.sourceId));return before!==slot.items.length}
function due(slot,now=Date.now()){normalize(slot);if(slot.enabled===false||now-Number(slot.lastContactAt||0)<20*HOUR)return[];return slot.items.filter(x=>x.status==='pending'&&!x.askedAt&&Number(x.dueAt)<=now&&now-Number(x.createdAt)>=4*HOUR).sort((a,b)=>a.dueAt-b.dueAt)}
function forget(slot,id){normalize(slot);const item=slot.items.find(x=>x.id===id);if(item){slot.ignored=[...new Set([...slot.ignored,item.sourceId])];slot.items=slot.items.filter(x=>x!==item);slot.revision++}}
function apply(slot,mutation,thread,now=Date.now()){
 normalize(slot);if(!mutation||slot.enabled===false||mutation.revision!==slot.revision||slot.applied.includes(mutation.id))return false;
 const sources=new Map(thread.filter(x=>x.mine).map(x=>[sourceId(x),x]));
 for(const operation of (Array.isArray(mutation.changes)?mutation.changes:[]).slice(0,12)){
  if(!operation||typeof operation!=='object')continue;
  const source=sources.get(operation.sourceId);if(!source||!mutation.sources.includes(operation.sourceId))continue;
  const quote=String(operation.quote||'').trim();if(!quote||!String(source.text||'').includes(quote))continue;
  const item=slot.items.find(x=>x.id===operation.id);
  if(operation.action==='forget'){if(item){slot.ignored.push(item.sourceId);slot.items=slot.items.filter(x=>x!==item)}continue}
  if(operation.action==='complete'){if(item){item.status='completed';item.updatedAt=now}continue}
  if(operation.action!=='upsert'||slot.ignored.includes(operation.sourceId))continue;
  const title=String(operation.title||'').trim().slice(0,120);if(!title)continue;
  let at=typeof operation.dueAt==='string'&&/^\d{4}-\d\d-\d\dT/.test(operation.dueAt)?Date.parse(operation.dueAt):NaN;
  if(!Number.isFinite(at))at=now+48*HOUR;
  at=Math.max(at,now+HOUR);
  if(at>now+366*24*HOUR)continue;
  const existing=item||slot.items.find(x=>x.sourceId===operation.sourceId&&(x.title===title||x.quote===quote));
  if(existing){existing.title=title;existing.dueAt=at;existing.updatedAt=now;existing.status='pending';existing.askedAt=0}
  else if(slot.items.length<100)slot.items.push({id:'follow-'+now.toString(36)+'-'+hash(operation.sourceId+title),title,quote,sourceId:operation.sourceId,createdAt:now,updatedAt:now,dueAt:at,status:'pending',askedAt:0});
 }
 const asked=slot.items.find(x=>x.id===mutation.askedId);
 if(asked&&asked.status==='pending'){asked.status='asked';asked.askedAt=now;slot.lastContactAt=now}
 slot.applied.push(mutation.id);slot.applied=slot.applied.slice(-200);slot.ignored=[...new Set(slot.ignored)];slot.revision++;return true;
}
function endpoint(url,path){const base=String(url||'').trim().replace(/\/+$/,'').replace(/\/(?:chat\/completions|embeddings|models)$/,'');const parsed=new URL(base);if(!['https:','http:'].includes(parsed.protocol))throw Error('API 地址需使用 http 或 https');return base+'/'+path}
function vector(value){return Array.isArray(value)&&value.length>0&&value.length<=65536&&value.every(x=>typeof x==='number'&&Number.isFinite(x))&&value.some(x=>x!==0)}
function cosine(a,b){if(!vector(a)||!vector(b)||a.length!==b.length)return-1;let dot=0,aa=0,bb=0;for(let i=0;i<a.length;i++){dot+=a[i]*b[i];aa+=a[i]*a[i];bb+=b[i]*b[i]}return dot/Math.sqrt(aa*bb)}
async function embed(config,texts,fetcher=fetch){
 if(!config?.url||!config.model)throw Error('请先保存向量 API 地址和模型');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
 try{const response=await fetcher(endpoint(config.url,'embeddings'),{method:'POST',signal:controller.signal,headers:{'Content-Type':'application/json',...(config.key?{Authorization:'Bearer '+config.key}:{})},body:JSON.stringify({model:config.model,input:texts,encoding_format:'float'})});
 if(!response.ok)throw Error('向量请求失败（'+response.status+'）');
 const result=await response.json();if(!Array.isArray(result.data)||result.data.length!==texts.length)throw Error('向量 API 返回数量不完整');
 const vectors=Array(texts.length);for(const row of result.data){if(!Number.isInteger(row.index)||row.index<0||row.index>=texts.length||vectors[row.index]||!vector(row.embedding))throw Error('向量 API 返回格式错误');vectors[row.index]=row.embedding}
 if(vectors.filter(Boolean).length!==texts.length||vectors.some(x=>x.length!==vectors[0].length))throw Error('向量 API 返回维度不一致');return vectors;
 }catch(error){if(error.name==='AbortError')throw Error('向量 API 请求超时');throw error}finally{clearTimeout(timer)}
}
async function recall(config,cache,documents,query,count,fetcher=fetch){
 const signature=hash(JSON.stringify([config.url,config.model,config.key||'']));if(cache.signature!==signature){cache.signature=signature;cache.documents={}}
 cache.documents||={};const docs=documents.filter(x=>x.text).slice(-200),live=new Set(docs.map(x=>x.id));for(const id of Object.keys(cache.documents))if(!live.has(id))delete cache.documents[id];
 const missing=docs.filter(x=>cache.documents[x.id]?.text!==x.text||!vector(cache.documents[x.id]?.vector));
 for(let i=0;i<missing.length;i+=16){const batch=missing.slice(i,i+16),vectors=await embed(config,batch.map(x=>x.text),fetcher);batch.forEach((x,j)=>cache.documents[x.id]={text:x.text,vector:vectors[j]})}
 if(!docs.length||!count||!query)return[];
 const [queryVector]=await embed(config,[query],fetcher);
 const incompatible=docs.filter(x=>cache.documents[x.id].vector.length!==queryVector.length);if(incompatible.length){cache.documents={};throw Error('向量模型维度发生变化，请重试以重建记忆索引')}
 return docs.map(x=>({...x,score:cosine(cache.documents[x.id].vector,queryVector)})).filter(x=>x.score>=.25).sort((a,b)=>b.score-a.score).slice(0,count);
}
const api={hash,sourceId,normalize,reconcile,due,forget,apply,endpoint,vector,cosine,embed,recall};root.IrisLifeMemory=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
