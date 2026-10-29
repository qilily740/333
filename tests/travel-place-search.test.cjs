const {test}=require('node:test'),assert=require('node:assert/strict');
const S=require('../scripts/travel-place-search.js');
const page=(host,title='西湖')=>({ok:true,json:async()=>({query:{pages:[{title,extract:'公开地点资料与特色。',fullurl:'https://'+host+'/wiki/'+encodeURIComponent(title)}]}})});
test('public place search deduplicates and caches queries, bounds concurrency, and never sends model secrets',async()=>{
 S.clear();const calls=[];let active=0,peak=0;const fetcher=async(url,options)=>{calls.push({url,options});peak=Math.max(peak,++active);await new Promise(resolve=>setImmediate(resolve));active--;return page(new URL(url).hostname,new URL(url).searchParams.get('gsrsearch'))};
 const trip={destination:'杭州',secret:'never-send'},places=[{name:'西湖',city:'杭州'},{name:'灵隐寺',city:'杭州'},{name:'河坊街',city:'杭州'},{name:'西湖',city:'杭州'}];const result=await S.search(trip,places,{fetcher});assert.equal(calls.length,4);assert.ok(peak<=3);assert.equal(result.documents.length,4);assert.ok(result.sources.every(source=>source.url.startsWith('https://zh.wikipedia.org/')));
 for(const {url,options} of calls){assert.equal(new URL(url).searchParams.get('origin'),'*');assert.equal(new URL(url).searchParams.get('exchars'),'1200');assert.ok(!url.includes('never-send'));assert.equal(options.headers,undefined);assert.equal(options.credentials,'omit')}
 await S.search(trip,places,{fetcher});assert.equal(calls.length,4);
});
test('search tries an alternate public source and reports failure before calling any model',async()=>{
 S.clear();let calls=0;const result=await S.search({destination:'杭州'},[],{fetcher:async url=>{calls++;return new URL(url).hostname==='zh.wikipedia.org'?{ok:false}:page('zh.wikivoyage.org')}});assert.equal(calls,2);assert.match(result.sources[0].url,/wikivoyage/);
 S.clear();await assert.rejects(S.search({destination:'不存在地点'},[],{fetcher:async()=>{throw Error('offline')}}),/尚未调用经历模型/);
});
