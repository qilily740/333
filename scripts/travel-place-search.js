(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.IrisTravelPlaceSearch=api})(typeof globalThis==='object'?globalThis:null,function(){
'use strict';
const cache=new Map(),ttl=30*60*1000;
function queriesFor(trip,places){return [...new Set([String(trip?.destination||'').trim(),...(places||[]).map(place=>[place.name,place.city].filter(Boolean).join(' ').trim())].filter(Boolean))].slice(0,24)}
async function lookup(query,fetcher){
 const key=query,old=cache.get(key);if(old&&Date.now()-old.at<ttl)return old.promise;
 const promise=(async()=>{for(const host of ['zh.wikipedia.org','zh.wikivoyage.org']){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
  try{const url=new URL('https://'+host+'/w/api.php');url.search=new URLSearchParams({action:'query',format:'json',formatversion:'2',origin:'*',generator:'search',gsrsearch:query,gsrnamespace:'0',gsrlimit:'2',prop:'extracts|info',exintro:'1',explaintext:'1',exchars:'1200',inprop:'url'}).toString();const response=await fetcher(url.href,{method:'GET',signal:controller.signal,credentials:'omit',referrerPolicy:'no-referrer'});if(!response.ok)continue;const data=await response.json();if(data.error)continue;const pages=(data.query?.pages||[]).flatMap(page=>{try{const url=new URL(page.fullurl);if(!/^https?:$/.test(url.protocol)||url.hostname!==host||typeof page.extract!=='string'||!page.extract.trim())return[];return[{query,title:String(page.title||query),url:url.href,text:page.extract.trim().slice(0,1200)}]}catch{return[]}});if(pages.length)return pages}catch{/* Try the other public source without involving the model API. */}finally{clearTimeout(timer)}
 }return[]})();cache.set(key,{at:Date.now(),promise});try{const results=await promise;if(!results.length)cache.delete(key);return results}catch(error){cache.delete(key);throw error}
}
async function search(trip,places,{fetcher=globalThis.fetch}={}){
 const queries=queriesFor(trip,places);if(!queries.length)throw Error('请先填写旅行目的地，再生成每日记录。');const results=new Array(queries.length);let next=0;
 await Promise.all(Array.from({length:Math.min(3,queries.length)},async()=>{while(next<queries.length){const index=next++;results[index]=await lookup(queries[index],fetcher)}}));
 const seen=new Set(),documents=results.flat().filter(document=>{if(seen.has(document.url))return false;seen.add(document.url);return true}).slice(0,32);
 if(!documents.length)throw Error('公开地点资料搜索暂时不可用或没有找到结果，请检查网络后重试；尚未调用经历模型，原记录已保留。');
 return{documents,sources:documents.map(({title,url})=>({title,url})),missingQueries:queries.filter((query,index)=>!results[index]?.length),searchedAt:Date.now()};
}
return{search,queriesFor,clear:()=>cache.clear()};
});
