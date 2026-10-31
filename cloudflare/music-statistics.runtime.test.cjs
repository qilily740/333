const {test}=require('node:test'),fs=require('node:fs'),assert=require('node:assert/strict');
let Miniflare,convertV4MiniflareOptions;try{({Miniflare,convertV4MiniflareOptions}=require(process.env.MINIFLARE_MODULE||'miniflare'))}catch{}
const bundle=process.env.IRIS_STATS_BUNDLE;
// Local engine baseline only; production wrangler compatibility_date is unchanged.
test('Cloudflare local runtime uses independent SQLite, protects reports and deduplicates cache events',{skip:!Miniflare||!bundle},async()=>{
 let outboundCount=0;
 const mf=new Miniflare(convertV4MiniflareOptions({workers:[{name:'music-test',modules:true,outboundService:async request=>{outboundCount++;assert.equal(request.headers.get('x-iris-music-device'),null);const path=new URL(request.url).pathname;if(path.includes('player/url'))return Response.json({code:200,data:[{id:1,url:'https://audio.test/song.mp3',expi:1200}]});if(path.includes('song/detail'))return Response.json({code:200,songs:[{id:1,name:'本地测试歌曲',ar:[],al:{picUrl:'https://image.test/cover.jpg'}}]});if(path.includes('lyric'))return Response.json({code:200,lrc:{lyric:'测试歌词'}});return Response.json({code:200,result:{songs:[{id:1,name:'本地测试歌曲',artists:[]}]}})},script:fs.readFileSync(bundle,'utf8'),compatibilityDate:'2026-08-18',compatibilityFlags:['nodejs_compat'],durableObjects:{MUSIC_STATS:{className:'MusicStatistics',useSQLite:true}},kvNamespaces:['MUSIC_STORE'],bindings:{MUSIC_STATS_ENABLED:'true',MUSIC_STATS_HASH_KEY:'runtime-test-hash-key-'.repeat(3),MUSIC_STATS_ADMIN_TOKEN:'runtime-test-admin-key-'.repeat(3)}}]}));
 try{
  const headers={'x-iris-music-device':'11111111-1111-4111-8111-111111111111','x-iris-music-event':'33333333-3333-4333-8333-333333333333','x-iris-music-action':'playback'};
  const unauthorized=await mf.dispatchFetch('http://local/admin/music-statistics/report');assert.equal(unauthorized.status,401);
  const binding=await mf.getBindings(),kv=await mf.getKVNamespace('MUSIC_STORE');await kv.put('runtime-existing','unchanged');
  await Promise.all(Array.from({length:10},()=>mf.dispatchFetch('http://local/stats/activity',{method:'POST',headers})));
  const from=new Date(Date.now()+28800000).toISOString().slice(0,10),auth={authorization:'Bearer '+'runtime-test-admin-key-'.repeat(3)};
  // Query the same object after waitUntil jobs have reached the actor; no live upstream access.
  let report;
  for(let i=0;i<30;i++){const response=await mf.dispatchFetch('http://local/admin/music-statistics/report?from='+from+'&to='+from,{headers:auth});report=await response.json();if(report.unique_devices===1)break;await new Promise(r=>setTimeout(r,25))}
  assert.equal(report.unique_devices,1);assert.equal(report.days[0].calls,0);assert.equal(report.details[0].calls,1);assert.equal(await kv.get('runtime-existing'),'unchanged');
  const csv=await mf.dispatchFetch('http://local/admin/music-statistics/export.csv?from='+from+'&to='+from,{headers:auth});assert.match(await csv.text(),/区间去重/);
  const page=await mf.dispatchFetch('http://local/admin/music-statistics',{headers:{authorization:'Basic '+btoa('admin:'+'runtime-test-admin-key-'.repeat(3))}});assert.equal(page.status,200);assert.match(await page.text(),/使用设备数/);
  const music=await mf.dispatchFetch('http://local/search?q=local-test',{headers:{'x-iris-music-device':headers['x-iris-music-device']}});assert.equal(music.status,200);assert.equal((await music.json()).songs[0].name,'本地测试歌曲');
  for(let i=0;i<30;i++){const response=await mf.dispatchFetch('http://local/admin/music-statistics/report?from='+from+'&to='+from,{headers:auth});report=await response.json();if(report.days[0].calls===1)break;await new Promise(r=>setTimeout(r,25))}
  assert.equal(outboundCount,1);assert.equal(report.days[0].calls,1);assert.equal(report.days[0].upstream_calls,1);assert.equal(report.unique_devices,1);
  const capability=await mf.dispatchFetch('http://local/stats/capabilities');assert.equal((await capability.json()).enabled,true);
  const song=await(await mf.dispatchFetch('http://local/song?id=1',{headers:{'x-iris-music-device':headers['x-iris-music-device']}})).json();assert.equal(song.song.cover,'https://image.test/cover.jpg');assert.equal(song.song.playUrl,'https://audio.test/song.mp3');
  for(let i=0;i<30;i++){const response=await mf.dispatchFetch('http://local/admin/music-statistics/report?from='+from+'&to='+from,{headers:auth});report=await response.json();if(report.days[0].calls===2)break;await new Promise(r=>setTimeout(r,25))}
  assert.equal(report.days[0].calls,2);assert.equal(report.days[0].success,2);assert.equal(report.unique_devices,1);assert.equal(report.days[0].upstream_calls,4);
  console.log('本地 workerd + SQLite Durable Object 验证通过：并发重复事件、区间去重、CSV、管理员认证、原 KV 保留。');
 }finally{await mf.dispose()}
});
