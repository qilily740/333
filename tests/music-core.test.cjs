const {test}=require('node:test');const assert=require('node:assert/strict');const C=require('../scripts/music-core.js');
const state=()=>({users:[{},{}],characters:[{},{}]});
test('local and linked libraries and listening histories stay isolated by user and role',()=>{const s=state(),u=C.identity(s.users[0]),v=C.identity(s.users[1]),r=C.identity(s.characters[0]),q=C.identity(s.characters[1]);const song=C.add(s,u,{title:'一首歌',kind:'local',mediaId:'blob'});C.add(s,v,{title:'另一首',kind:'url',url:'https://audio.invalid/other.mp3'});assert.equal(C.library(s,u).length,1);assert.throws(()=>C.track(s,v,song.id),/不属于/);const session=C.session(s,u,r),other=C.session(s,u,q);session.active=true;const run=C.begin(session,song);C.append(session,{mine:false,text:'一起听吧'});assert.equal(other.thread.length,0);assert.equal(run.messages[0].text,'一起听吧');C.end(session);assert.ok(run.endedAt);assert.equal(session.active,false);assert.equal(C.session(s,v,r).runs.length,0)});
test('direct links reject executable protocols, embedded credentials and malformed URLs',()=>{for(const link of ['javascript:alert(1)','data:audio/mp3;base64,AA','file:///music.mp3','https://a:b@example.com/a.mp3','bad'])assert.throws(()=>C.url(link));assert.equal(C.url('https://example.com/song.mp3?token=a'),'https://example.com/song.mp3?token=a')});
test('LRC handles offsets, repeated timestamps and timed lyric context without inventing lyrics',()=>{const raw='[ar:歌手]\n[offset:100]\n[00:01.50][00:03.050]一句\n[00:05]另一句';const rows=C.lyrics(raw);assert.deepEqual(rows.map(x=>x.at),[1.6,3.15,5.1]);assert.equal(rows[0].text,'一句');assert.equal(C.lyrics('普通文字歌词').length,0);assert.equal(C.lyricWindow({lyrics:'普通文字歌词'},0),'普通文字歌词');assert.deepEqual(C.lyrics('[00:99]无效'),[])});
test('playback order, previous and shuffle preserve identity and stop at list boundaries',()=>{const list=[{id:'a'},{id:'b'},{id:'c'}];assert.equal(C.next(list,'a','order').id,'b');assert.equal(C.next(list,'a','order',-1),null);assert.equal(C.next(list,'c','order'),null);assert.equal(C.next(list,'b','shuffle',1,()=>0).id,'a');assert.equal(C.next([{id:'a'}],'a','shuffle'),null)});
test('API invitation requires a real decision and a reply; missing or malformed data never becomes a canned acceptance',()=>{assert.throws(()=>C.parse('{"text":"好"}',true),/完整/);assert.throws(()=>C.parse('我愿意'),/格式/);assert.throws(()=>C.parse({accepted:true,text:''},true),/完整/);assert.equal(C.parse({accepted:false,text:'现在不方便'},true).accepted,false);assert.equal(C.parse({text:'再听一遍？',suggestion:{type:'repeat'}}).suggestion.type,'repeat')});
test('character prompts provide the correct pair and only supplied lyric context, never audio URLs or files',()=>{const s={thread:[{mine:true,text:'这一句让我想起你',trackId:'song'}]},t={id:'song',title:'歌名',artist:'歌手',url:'https://secret.invalid/song.mp3',lyrics:'[00:01]用户提供的一句',duration:200};const p=C.prompt('chat',{characterName:'当前角色'},t,10,s,[t]);assert.match(p,/当前角色/);assert.match(p,/用户提供的一句/);assert.match(p,/没有提供给你/);assert.doesNotMatch(p,/secret.invalid/);assert.match(p,/程序会让用户确认/)});
test('ID3v2 metadata reads actual title, artist, lyrics and embedded cover without an external parser',()=>{const chunks=[];function frame(key,payload){const size=Buffer.alloc(4);size.writeUInt32BE(payload.length);chunks.push(Buffer.concat([Buffer.from(key),size,Buffer.alloc(2),payload]))}frame('TIT2',Buffer.concat([Buffer.from([3]),Buffer.from('真实歌名')]));frame('TPE1',Buffer.concat([Buffer.from([3]),Buffer.from('真实歌手')]));frame('USLT',Buffer.concat([Buffer.from([3]),Buffer.from('eng'),Buffer.from([0]),Buffer.from('提供的歌词')]));frame('APIC',Buffer.concat([Buffer.from([3]),Buffer.from('image/png\0'),Buffer.from([3,0,1,2,3])]));const body=Buffer.concat(chunks),header=Buffer.from([73,68,51,3,0,0,(body.length>>21)&127,(body.length>>14)&127,(body.length>>7)&127,body.length&127]),input=Buffer.concat([header,body]);const parsed=C.metadata(input.buffer.slice(input.byteOffset,input.byteOffset+input.byteLength));assert.equal(parsed.title,'真实歌名');assert.equal(parsed.artist,'真实歌手');assert.equal(parsed.lyrics,'提供的歌词');assert.equal(parsed.picture.type,'image/png');assert.deepEqual([...parsed.picture.bytes],[1,2,3])});

test('lyrics lookup selects a matching timed version and rejects covers, versions and ambiguous titles',()=>{
 const t={title:'同一首歌',artist:'原歌手',duration:180},rows=[{id:1,trackName:t.title,artistName:t.artist,duration:180,plainLyrics:'文字版'},{id:2,trackName:t.title,artistName:t.artist,duration:181,syncedLyrics:'[00:01]同步版'},{id:3,trackName:t.title,artistName:'翻唱者',duration:180,syncedLyrics:'[00:01]错误版本'}];
 assert.equal(C.matchLyrics(rows,t).recordId,2);assert.equal(C.matchLyrics(rows,{...t,duration:220}),null);assert.equal(C.matchLyrics(rows,{...t,title:'同一首歌 (Live)'}),null);assert.equal(C.matchLyrics(rows,{...t,artist:''}),null);assert.equal(C.matchLyrics([rows[0]],{...t,artist:''}).recordId,1);
 assert.equal(C.matchLyrics([{trackName:t.title,artistName:t.artist,duration:180,instrumental:true}],t).instrumental,true);
});

test('lyric search sends only song metadata to the public service and reports network failure without a model call',async()=>{
 let requested;const result=await C.findLyrics({title:'曲名 & 标题',artist:'歌手',duration:80,url:'https://secret.invalid/audio'}, {fetcher:async address=>{requested=new URL(address);return{ok:true,json:async()=>[{id:9,trackName:'曲名 & 标题',artistName:'歌手',duration:80,syncedLyrics:'[00:01]歌词'}]}}});
 assert.equal(requested.hostname,'lrclib.net');assert.equal(requested.searchParams.get('track_name'),'曲名 & 标题');assert.equal(requested.searchParams.get('artist_name'),'歌手');assert.equal(result.synced,true);assert.doesNotMatch(requested.href,/secret/);
 await assert.rejects(C.findLyrics({title:'歌名'},{fetcher:async()=>({ok:false,status:503})}),/503/);
});

test('503 retries once then falls back to the artist/title provider without inventing timed lyrics',async()=>{
 const calls=[];const result=await C.findLyrics({title:'歌名 / 甲',artist:'歌手 & 乙',duration:100},{retryDelay:0,fetcher:async address=>{calls.push(address);return address.includes('lrclib.net')?{ok:false,status:503}:{ok:true,json:async()=>({lyrics:'备用来源的纯文字歌词'})}}});
 assert.equal(calls.length,4);assert.equal(new URL(calls[3]).hostname,'api.lyrics.ovh');assert.ok(calls[3].includes(encodeURIComponent('歌手 & 乙')));assert.equal(result.source,'Lyrics.ovh');assert.equal(result.synced,false);assert.equal(result.lyrics,'备用来源的纯文字歌词');
});

test('an aborted retry does not query the fallback and both-provider failure stays an actionable error',async()=>{
 const controller=new AbortController();let calls=0;
 await assert.rejects(C.findLyrics({title:'歌名',artist:'歌手'},{signal:controller.signal,retryDelay:0,fetcher:async()=>{calls++;controller.abort();return{ok:false,status:503}}}),error=>error.name==='AbortError');assert.equal(calls,1);
 await assert.rejects(C.findLyrics({title:'歌名',artist:'歌手'},{retryDelay:0,fetcher:async()=>({ok:false,status:503})}),/暂时不可用.*503/);
});

test('cover-title annotations are normalized and the correct 234-second Rain Love version is selected',()=>{
 const rows=[{id:1,trackName:'雨爱',artistName:'不是花火呀',duration:283,syncedLyrics:'[00:01]另一版',plainLyrics:'另一版'},{id:2,trackName:'雨爱',artistName:'不是花火呀',duration:234,syncedLyrics:'[00:01]匹配版',plainLyrics:'匹配版'}];
 assert.equal(C.lyricTrackTitle('《雨爱》（翻唱版）'),'雨爱');assert.equal(C.matchLyrics(rows,{title:'《雨爱》（翻唱版）',artist:'不是花火呀',duration:234}).recordId,2);
 assert.equal(C.matchLyrics(rows,{title:'雨爱',artist:'不是花火呀',duration:239}).synced,false);
});

test('a healthy empty primary result still tries the alternate source',async()=>{
 const calls=[];const result=await C.findLyrics({title:'歌名',artist:'实际演唱者',duration:200},{retryDelay:0,fetcher:async address=>{calls.push(address);return address.includes('api.lyrics.ovh')?{ok:true,json:async()=>({lyrics:'备用文字'})}:address.includes('/api/get?')?{ok:false,status:404}:{ok:true,json:async()=>[]}}});assert.equal(result.source,'Lyrics.ovh');assert.ok(calls.some(address=>address.includes('api.lyrics.ovh')));
});

test('personal playlists isolate owners, deduplicate songs and retain imported track references',()=>{
 const state={},a=C.createPlaylist(state,'a','晚安'),b=C.createPlaylist(state,'b','私人');
 const local=C.add(state,'a',{title:'本地歌',kind:'local',mediaId:'audio-1'});
 C.addToPlaylist(state,'a',a.id,{trackId:local.id});
 C.addToPlaylist(state,'a',a.id,{trackId:local.id});
 C.addToPlaylist(state,'a',a.id,{id:'123',name:'搜索歌曲',artist:'歌手',cover:'https://img.invalid/a.jpg'});
 C.addToPlaylist(state,'a',a.id,{id:'123',name:'搜索歌曲'});
 assert.equal(a.entries.length,2);assert.equal(a.entries[0].trackId,local.id);
 assert.equal(a.entries[1].title,'搜索歌曲');assert.deepEqual(C.playlists(state,'b'),[b]);
 assert.throws(()=>C.addToPlaylist(state,'b',a.id,{id:'123',name:'越界'}));
 assert.throws(()=>C.addToPlaylist(state,'b',b.id,{trackId:local.id}));
 assert.throws(()=>C.createPlaylist(state,'a','  '));
 assert.equal(C.library(state,'a').length,1,'playlist changes must preserve audio library');
});

test('list loop wraps at each end while ordered playback still stops',()=>{
 const songs=[{id:'a'},{id:'b'},{id:'c'}];assert.equal(C.next(songs,'c','repeat-all').id,'a');assert.equal(C.next(songs,'a','repeat-all',-1).id,'c');assert.equal(C.next(songs,'c','order'),null);assert.equal(C.next([{id:'a'}],'a','repeat-all').id,'a');assert.equal(C.next([],'a','repeat-all'),null);
});
