const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),C=require('../scripts/music-core.js');
const styles=fs.readFileSync(require.resolve('../style.css'),'utf8');
test('record page scrolls in the page body, while expanded chat keeps its own message scroller',()=>{
 assert.match(styles, /\.music-page-body:has\(\.music-player-view\)\{display:flex;flex-direction:column;overflow:hidden/);
 assert.match(styles, /\.music-player-view\{display:flex;flex-direction:column;flex:1;min-height:0/);
 assert.match(styles, /\.music-chat-fullscreen\{display:flex;flex:1;flex-direction:column/);
 assert.match(styles, /\.music-chat-page-body \.music-messages\{[^}]*overflow-y:auto/);
 assert.match(styles, /\.music-chat-page-body>\.music-discussion\{[^}]*padding:12px 0 max\(10px,env\(safe-area-inset-bottom,0px\)\)/);
 assert.doesNotMatch(styles, /\.music-player-view:not\(\.is-chat-expanded\)\{overflow-y:auto/);
});
test('all songs scroll independently below the fixed music-library controls',()=>{
 assert.match(styles,/\.music-page-body:has\(\.music-library-page\.is-songs-view\)\{display:flex;flex-direction:column;overflow:hidden\}/);
 assert.match(styles,/\.music-library-page\.is-songs-view\{[^}]*width:100%/);
 assert.match(styles,/\.music-library-page\.is-songs-view \.music-track-list\{flex:1;min-height:0;overflow-y:auto/);
});
const attr=(tag,name)=>{const match=tag.match(new RegExp('(?:\\s|^)'+name+'(?:="([^"]*)")?(?=\\s|>|$)'));return match?match[1]||'':null};
class Node{
 constructor(tag='div'){this.tag=tag;this.events={};this.attrs={};this.dataset={};this.style={setProperty(name,value){this[name]=value}};this.classList={toggle(){}};this._html='';this.nodes=new Map();this.hidden=false;this.value='';this.scrollHeight=0;this.clientHeight=100;this.scrollTop=0;this.offsetTop=0;this.open=false}
 set innerHTML(value){this._html=value;this.nodes=new Map()}get innerHTML(){return this._html}
 addEventListener(type,fn){this.events[type]=fn}setAttribute(name,value){this.attrs[name]=value}getAttribute(name){return this.attrs[name]??null}hasAttribute(name){return name in this.attrs}removeAttribute(name){delete this.attrs[name]}append(node){this.children||=[];this.children.push(node);this._html+=node.serialize()}replaceChildren(...nodes){this.children=nodes;this._html=nodes.map(node=>{const body=node.querySelector('.music-chat-page-body'),bodyMarkup=body?.children?.map(child=>child.serialize()).join('')||'';return node.serialize().replace('<div class="music-chat-page-body"></div>',`<div class="music-chat-page-body">${bodyMarkup}</div>`)}).join('');this.nodes=new Map()}serialize(){const attrs={...this.attrs};if(this.className)attrs.class=this.className;if(this.hidden)attrs.hidden='';else delete attrs.hidden;return `<${this.tag}${Object.entries(attrs).map(([name,value])=>` ${name}="${value}"`).join('')}>${this._html}</${this.tag}>`}insertBefore(node){this.append(node)}remove(){this.removed=true}focus(){}showModal(){this.open=true}close(){this.open=false;this.events.close?.()}click(){return this.onclick?.({target:this,currentTarget:this})??this.events.click?.({target:this,currentTarget:this})}closest(){return this}
 querySelectorAll(selector){const tags=[...this._html.matchAll(/<(button|input|textarea|form|div|section|time|i|span|p)\b[^>]*>/g)];const found=[];for(const match of tags){const tag=match[0],wanted=selector.match(/^\[([^\]=]+)(?:="([^"]*)")?\]$/);let yes=wanted?attr(tag,wanted[1])!==null&&(!wanted[2]||attr(tag,wanted[1])===wanted[2]):selector.startsWith('.')?(attr(tag,'class')||'').split(' ').includes(selector.slice(1)):match[1]===selector;if(!yes)continue;let node=this.nodes.get(match.index);if(!node){node=new Node(match[1]);for(const item of tag.matchAll(/([\w-]+)(?:="([^"]*)")?/g)){node.attrs[item[1]]=item[2]||'';if(item[1].startsWith('data-'))node.dataset[item[1].slice(5).replace(/-([a-z])/g,(_,x)=>x.toUpperCase())]=item[2]||''}node.value=attr(tag,'value')||'';node.disabled=attr(tag,'disabled')!==null;const end=this._html.indexOf('</'+match[1]+'>',match.index);node._html=end>=0?this._html.slice(match.index+tag.length,end):'';if(match[1]==='textarea')node.value=node._html;if(match[1]==='form'){node.elements={};for(const child of node.querySelectorAll('input').concat(node.querySelectorAll('textarea'))){const name=child.getAttribute('name');if(name)node.elements[name]=child}}this.nodes.set(match.index,node)}found.push(node)}return found}
 querySelector(selector){return this.querySelectorAll(selector)[0]||null}
}
class AudioNode extends Node{
 constructor(){super('audio');this.currentTime=0;this.duration=180;this.paused=true;this.volume=1;this.playCount=0;this.error=null;this.readyState=4}
 set src(value){this.attrs.src=value;this.currentTime=0;this.ended=false;this.error=null}get src(){return this.attrs.src||''}
 load(){if(!this.src)return;queueMicrotask(()=>{if(this.src){this.onloadedmetadata?.();this.events.loadedmetadata?.()}})}
 async play(){if(!this.src)throw Error('no audio');this.paused=false;this.playCount++;this.events.play?.()}
 pause(){if(!this.paused){this.paused=true;this.events.pause?.()}}
}
const flush=async()=>{for(let i=0;i<12;i++)await new Promise(resolve=>setImmediate(resolve))};
function fixture(cloud,autoMount=true){const state={music:{tracks:[],sessions:[],preferences:{}}},content=new Node(),phone=new Node(),bottom=new Node(),body=new Node(),audio=[],notices=[],requests=[],playlistRequests=[],blobs=new Map();const lyricsQueries=[];let lyricReply=async()=>[];let selected={userId:'user-a',roleId:'role-a',userName:'用户甲',roleName:'角色甲'},active=true,reply=async()=>({text:'一起听吧',accepted:true}),saveCount=0;
 const first=C.add(state,'user-a',{title:'甲的歌',artist:'歌手',kind:'url',url:'https://audio.invalid/a.mp3',duration:180,lyrics:'[00:01]真实歌词'}),second=C.add(state,'user-a',{title:'第二首',kind:'url',url:'https://audio.invalid/b.mp3',duration:180});state.music.preferences['user-a']={mode:'order',volume:.7,trackId:first.id,positions:{}};
 const document={hidden:false,activeElement:null,body,createElement(tag){if(tag==='audio'){const node=new AudioNode();audio.push(node);return node}return new Node(tag)},querySelector(selector){return selector==='.phone'?phone:selector==='.bottom'?bottom:null},addEventListener(){}};
 const indexedDB={open(){const request={};queueMicrotask(()=>{request.result={objectStoreNames:{contains:()=>true},transaction(_name,mode){const tx={};tx.objectStore=()=>({get(id){const request={};queueMicrotask(()=>{request.result=blobs.get(id);request.onsuccess?.();tx.oncomplete?.()});return request},put(blob,id){const request={};queueMicrotask(()=>{blobs.set(id,blob);request.onsuccess?.();tx.oncomplete?.()});return request},delete(id){const request={};queueMicrotask(()=>{blobs.delete(id);request.onsuccess?.();tx.oncomplete?.()});return request}});return tx}};request.onsuccess?.()});return request}};
 const context=vm.createContext({window:{IrisMusicCore:C,IrisMusicCloud:cloud,addEventListener(){}},document,navigator:{},Audio:AudioNode,indexedDB,Blob,AbortController,fetch:async(url,options)=>{lyricsQueries.push(url);return{ok:true,json:async()=>lyricReply(url,options)}},FileReader:class{},URL:{createObjectURL:()=> 'blob:local-audio',revokeObjectURL(){}},setTimeout,clearTimeout,queueMicrotask,console});
 vm.runInContext(fs.readFileSync(require.resolve('../scripts/music.js'),'utf8'),context);
 const runtime={state,content,esc:x=>String(x).replaceAll('<','&lt;').replaceAll('"','&quot;'),save:()=>saveCount++,toast:x=>notices.push(x),identity:()=>({...selected}),valid:i=>i.userId===selected.userId&&i.roleId===selected.roleId,isActive:()=>active,isChatVisible:()=>!active,open:()=>active=true,context:i=>({characterName:i.roleName}),request:async prompt=>{requests.push(prompt);return reply(prompt)},requestRolePlaylist:async prompt=>{requests.push(prompt);playlistRequests.push(prompt);return reply(prompt)},remember(){}};
 if(autoMount)context.window.IrisMusic.render(runtime);return{state,content,phone,body,audio,notices,requests,playlistRequests,blobs,first,second,api:context.window.IrisMusic,runtime,select:i=>selected=i,setActive:v=>active=v,setReply:v=>reply=v,setLyrics:v=>lyricReply=v,lyricsQueries,saved:()=>saveCount};
}
test('real player handlers play locally without API calls and keep one audio element alive outside the page',async()=>{const f=fixture();await flush();assert.equal(f.audio.length,1);f.content.querySelector('[data-music-play]').click();await flush();assert.equal(f.audio[0].paused,false);assert.equal(f.requests.length,0);f.audio[0].currentTime=42;f.audio[0].events.timeupdate();f.setActive(false);f.api.close();f.api.sync();assert.equal(f.audio[0].paused,false);assert.equal(f.phone.children[0].hidden,false);assert.equal(f.state.music.preferences['user-a'].positions[f.first.id],42)});
test('a spurious media error without a media failure does not interrupt advancing playback',async()=>{const f=fixture();await flush();f.content.querySelector('[data-music-play]').click();await flush();assert.equal(f.audio[0].paused,false);f.audio[0].currentTime=2;f.audio[0].events.error();assert.equal(f.notices.length,0)});
test('a Netease media error refreshes its expiring playback URL even while the player reports playing',async()=>{const calls=[];const f=fixture({getToken:async()=>'',song:async(id)=>{calls.push(id);return{song:{id,name:'可更新的歌',playUrl:'https://audio.invalid/refreshed.mp3',playUrlExpiresAt:Date.now()+600000}}}});f.first.platform='netease';f.first.platformId='42';await flush();f.content.querySelector('[data-music-play]').click();await flush();f.audio[0].error={code:2};f.audio[0].events.error();await flush();assert.deepEqual(calls,['42']);assert.equal(f.first.url,'https://audio.invalid/refreshed.mp3');assert.equal(f.audio[0].src,'https://audio.invalid/refreshed.mp3');assert.equal(f.notices.length,0)});
test('natural completion stays reset after automatic track change and replay',async()=>{const f=fixture();await flush();const a=f.audio[0];a.currentTime=a.duration;a.ended=true;a.events.ended();await flush();assert.equal(f.state.music.preferences['user-a'].positions[f.first.id],0);f.content.querySelector('[data-music-prev]').click();await flush();assert.equal(a.src,f.first.url);assert.equal(a.currentTime,0)});
test('a saved position within two seconds of the end restarts instead of skipping the song',async()=>{const f=fixture(undefined,false);f.state.music.preferences['user-a'].positions[f.first.id]=179.8;f.api.render(f.runtime);await flush();assert.equal(f.audio[0].currentTime,0);assert.equal(f.state.music.preferences['user-a'].positions[f.first.id],0)});
test('duplicate metadata does not restore an old position over ongoing playback',async()=>{const f=fixture(undefined,false);f.state.music.preferences['user-a'].positions[f.first.id]=55;f.api.render(f.runtime);await flush();const a=f.audio[0];assert.equal(a.currentTime,55);a.currentTime=65;a.events.loadedmetadata();assert.equal(a.currentTime,65)});
test('a stale ended event cannot skip the newly loaded song',async()=>{const f=fixture();await flush();f.audio[0].ended=false;f.audio[0].events.ended();await flush();assert.equal(f.audio[0].src,f.first.url)});
test('a rejected old play request does not report failure while source recovery succeeds',async()=>{const f=fixture({getToken:async()=>'',song:async id=>({song:{id,name:'续播',playUrl:'https://audio.invalid/recovered.mp3'}})});f.first.platform='netease';f.first.platformId='42';await flush();const a=f.audio[0],play=a.play.bind(a);let failed=false;a.play=async()=>{if(failed)return play();failed=true;a.paused=false;a.error={code:2};a.events.error();throw Error('source failed')};f.content.querySelector('[data-music-play]').click();await flush();assert.equal(a.src,'https://audio.invalid/recovered.mp3');assert.equal(a.paused,false);assert.equal(f.notices.length,0)});
test('next-track play rejection before the media error renews Netease once without a false link warning',async()=>{let finish,calls=0;const f=fixture({getToken:async()=>'',song:()=>{calls++;return new Promise(resolve=>finish=resolve)}});f.second.platform='netease';f.second.platformId='43';await flush();const a=f.audio[0],play=a.play.bind(a);let failed=false;a.play=async()=>{if(failed)return play();failed=true;a.error={code:4};throw Error('source not ready')};f.content.querySelector('[data-music-next]').click();await flush();assert.equal(calls,1);assert.equal(f.notices.length,0);a.events.error();await flush();assert.equal(calls,1);assert.equal(f.notices.length,0);finish({song:{id:'43',name:'下一首',playUrl:'https://audio.invalid/next-renewed.mp3'}});await flush();assert.equal(a.src,'https://audio.invalid/next-renewed.mp3');assert.equal(a.paused,false);assert.equal(f.notices.length,0)});
test('failed Netease renewal reports the service error and stops rather than hiding it',async()=>{const f=fixture({getToken:async()=>'',song:async()=>{throw Error('网易云播放地址获取失败')}});f.second.platform='netease';f.second.platformId='43';await flush();const a=f.audio[0];a.play=async()=>{a.error={code:4};throw Error('source failed')};f.content.querySelector('[data-music-next]').click();await flush();assert.deepEqual(f.notices,['网易云播放地址获取失败']);assert.equal(a.paused,true)});
test('invitation and discussion use actual API responses, and song suggestions wait for user confirmation',async()=>{const f=fixture();await flush();f.content.querySelector('[data-music-invite]').click();await flush();const session=f.state.music.sessions[0];assert.equal(session.active,true);assert.equal(session.runs.length,1);assert.equal(session.thread[0].text,'一起听吧');f.setReply(async()=>({text:'想换第二首',suggestion:{type:'track',trackId:f.second.id}}));f.content.querySelector('[data-music-reply]').click();await flush();assert.equal(f.audio[0].src,f.first.url);assert.equal(f.requests.length,2);f.content.querySelector('[data-music-suggestion]').click();await flush();assert.equal(f.audio[0].src,f.second.url);assert.equal(session.runs.length,2)});
test('invalid API replies leave the session inactive, show only an error and can be retried',async()=>{const f=fixture();await flush();f.setReply(async()=>({text:'缺少接受决定'}));f.content.querySelector('[data-music-invite]').click();await flush();assert.equal(f.state.music.sessions[0].active,false);assert.equal(f.state.music.sessions[0].thread.length,0);assert.equal(f.notices.length,1);f.setReply(async()=>({text:'现在可以',accepted:true}));f.content.querySelector('[data-music-invite]').click();await flush();assert.equal(f.state.music.sessions[0].active,true)});
test('switching identities pauses audio and discards an outstanding invitation response',async()=>{const f=fixture();await flush();let resolve;f.setReply(()=>new Promise(r=>resolve=r));f.content.querySelector('[data-music-invite]').click();await flush();const session=f.state.music.sessions[0];await f.audio[0].play();f.select({userId:'user-b',roleId:'role-b',userName:'乙',roleName:'乙角色'});f.api.sync();resolve({text:'旧角色的话',accepted:true});await flush();assert.equal(f.audio[0].paused,true);assert.equal(f.audio[0].src,'');assert.equal(session.active,false);assert.equal(session.thread.length,0)});
test('local file imports persist real Blob bytes separately and can reload them after mounting again',async()=>{const f=fixture();await flush();f.content.querySelector('[data-music-tab="library"]').click();const file=new Blob([new Uint8Array([1,2,3,4])],{type:'audio/mpeg'});file.name='本地歌.mp3';file.lastModified=123;f.content.querySelector('[data-music-files]').events.change({target:{files:[file]}});await flush();const local=f.state.music.tracks.find(t=>t.kind==='local');assert.ok(local);assert.equal(local.title,'本地歌');assert.deepEqual([...new Uint8Array(await f.blobs.get(local.mediaId).arrayBuffer())],[1,2,3,4]);assert.equal(f.requests.length,0);const button=f.content.querySelectorAll('[data-music-select]').find(n=>n.dataset.musicSelect===local.id);button.click();await flush();assert.equal(f.audio[0].src,'blob:local-audio');assert.equal(f.audio[0].paused,false)});

test('audio links are validated before saving and song details persist imported lyrics',async()=>{const f=fixture();await flush();f.content.querySelector('[data-music-tab="library"]').click();f.content.querySelector('[data-music-link]').click();const dialog=f.body.children.at(-1),form=dialog.querySelector('form');form.elements.url.value='https://audio.invalid/new.mp3';form.elements.title.value='新歌';form.elements.artist.value='新歌手';await form.onsubmit({preventDefault(){},currentTarget:form});await flush();const t=f.state.music.tracks.find(x=>x.title==='新歌');assert.ok(t);assert.equal(t.artist,'新歌手');assert.equal(f.requests.length,0);f.content.querySelectorAll('[data-music-edit]').find(x=>x.dataset.musicEdit===t.id).click();const edit=f.body.children.at(-1),fields=edit.querySelector('form');fields.elements.lyrics.value='[00:03]导入的歌词';fields.elements.title.value='改过的歌名';fields.onsubmit({preventDefault(){}});assert.equal(t.lyrics,'[00:03]导入的歌词');assert.equal(t.title,'改过的歌名')});

test('switching songs restores each saved position and ending companionship can keep the music playing',async()=>{const f=fixture();await flush();await f.audio[0].play();f.audio[0].currentTime=55;f.audio[0].events.timeupdate();f.content.querySelector('[data-music-next]').click();await flush();f.content.querySelector('[data-music-prev]').click();await flush();assert.equal(f.audio[0].currentTime,55);f.content.querySelector('[data-music-invite]').click();await flush();f.content.querySelector('[data-music-invite]').click();const end=f.body.children.at(-1);end.querySelector('[data-music-end-keep]').click();assert.equal(f.state.music.sessions[0].active,false);assert.ok(f.state.music.sessions[0].runs[0].endedAt);assert.equal(f.audio[0].paused,false);assert.equal(f.requests.length,1)});

test('re-import repairs missing local audio without duplicating a restored library record',async()=>{const f=fixture();await flush();const file=new Blob(['saved audio bytes'],{type:'audio/mpeg'});file.name='恢复.mp3';file.lastModified=77;async function importAgain(){f.content.querySelector('[data-music-tab="library"]').click();f.content.querySelector('[data-music-files]').events.change({target:{files:[file]}});await flush()}await importAgain();const local=f.state.music.tracks.find(x=>x.kind==='local'),id=local.id;f.blobs.clear();await importAgain();assert.equal(f.state.music.tracks.filter(x=>x.kind==='local').length,1);assert.equal(f.state.music.tracks.find(x=>x.kind==='local').id,id);assert.equal(await f.blobs.get(local.mediaId).text(),'saved audio bytes')});

test('link imports automatically find and persist matching lyrics without requesting a chat model',async()=>{const f=fixture();await flush();f.setLyrics(async()=>[{id:22,trackName:'联网歌曲',artistName:'某歌手',duration:180,syncedLyrics:'[00:01]来自匹配歌曲的歌词'}]);f.content.querySelector('[data-music-tab="library"]').click();f.content.querySelector('[data-music-link]').click();const form=f.body.children.at(-1).querySelector('form');form.elements.url.value='https://audio.invalid/with-lyrics.mp3';form.elements.title.value='联网歌曲';form.elements.artist.value='某歌手';await form.onsubmit({preventDefault(){},currentTarget:form});await flush();const t=f.state.music.tracks.find(t=>t.title==='联网歌曲');assert.equal(t.lyrics,'[00:01]来自匹配歌曲的歌词');assert.equal(t.lyricsSource.name,'LRCLIB');assert.equal(f.lyricsQueries.length,1);assert.equal(f.requests.length,0);assert.match(f.content.innerHTML,/music-page-body/)});

test('a late online lyric result cannot overwrite manually saved lyrics',async()=>{const f=fixture();await flush();delete f.first.lyrics;f.api.render(f.runtime);let finish;f.setLyrics(()=>new Promise(resolve=>finish=resolve));f.content.querySelector('[data-music-record]').click();f.content.querySelector('[data-music-find-lyrics]').click();await flush();f.content.querySelector('[data-music-tab="library"]').click();f.content.querySelector('[data-music-edit]').click();const form=f.body.children.at(-1).querySelector('form');form.elements.lyrics.value='手动保留的歌词';form.onsubmit({preventDefault(){}});finish([{trackName:f.first.title,artistName:f.first.artist,duration:180,syncedLyrics:'[00:01]迟来的结果'}]);await flush();assert.equal(f.first.lyrics,'手动保留的歌词');assert.equal(f.notices.length,0)});

test('closing the mini player stops sound, closes companionship and stays closed until the player is reopened',async()=>{
 const f=fixture();await flush();await f.audio[0].play();f.audio[0].currentTime=37;f.content.querySelector('[data-music-invite]').click();await flush();f.setActive(false);f.api.close();f.api.sync();const mini=f.phone.children[0],close=mini.querySelector('[data-music-mini-close]');assert.ok(close);mini.onclick({target:close,stopPropagation(){}});assert.equal(f.audio[0].paused,true);assert.equal(f.audio[0].src,'');assert.equal(mini.hidden,true);assert.equal(f.state.music.sessions[0].active,false);f.api.sync();assert.equal(mini.hidden,true);assert.equal(f.state.music.preferences['user-a'].positions[f.first.id],37);f.setActive(true);f.api.render(f.runtime);await flush();assert.equal(f.audio[0].currentTime,37);assert.equal(f.audio[0].paused,true);
});

test('song details puts the editable form in a separate scroll body and preserves the header close action',async()=>{
 const f=fixture();await flush();f.content.querySelector('[data-music-tab="library"]').click();f.content.querySelector('[data-music-edit]').click();const dialog=f.body.children.at(-1);assert.match(dialog.innerHTML,/<\/header><div class="music-dialog-body">/);assert.ok(dialog.querySelector('[data-music-edit-form]'));dialog.querySelector('[data-music-dialog-close]').click();assert.equal(dialog.open,false);assert.equal(dialog.removed,true);
});

test('lyric search lets the user choose a cover version instead of silently rejecting candidates',async()=>{
 const f=fixture();await flush();delete f.first.lyrics;f.api.render(f.runtime);f.setLyrics(async()=>[{id:1,trackName:f.first.title,artistName:'翻唱歌手',duration:180,syncedLyrics:'[00:01]选定翻唱版本'}]);f.content.querySelector('[data-music-record]').click();f.content.querySelector('[data-music-find-lyrics]').click();await flush();const dialog=f.body.children.at(-1),results=dialog.querySelector('[data-music-lyrics-results]');assert.match(results.innerHTML,/翻唱歌手/);results.querySelector('[data-music-lyrics-choice]').click();assert.equal(f.first.lyrics,'[00:01]选定翻唱版本');assert.equal(f.first.artist,'翻唱歌手');assert.equal(dialog.open,false);
});

test('song search uses clickable suggestions, retries errors and caches resolved songs for replay',async()=>{
 const searches=[],songCalls=[];let broken=true;
 const cloud={getToken:async()=>'',search:async q=>{searches.push(q);if(broken)throw Error('搜索暂时失败');return{songs:[{id:'100',name:'雨爱',artist:'杨丞琳',album:'Rain'}]}},song:async id=>{songCalls.push(id);return{song:{id,name:'雨爱',artist:'杨丞琳',playUrl:'https://audio.invalid/rain.mp3',lyrics:'[00:01]歌词',duration:180}}}};
 const f=fixture(cloud);await flush();f.content.querySelector('[data-music-tab="search"]').click();
 assert.doesNotMatch(f.content.innerHTML,/Find your song|找一首此刻想听的歌/);f.content.querySelector('[data-song-suggestion="0"]').click();await flush();
 assert.equal(searches[0],'雨爱 杨丞琳');assert.match(f.content.innerHTML,/搜索暂时失败/);
 broken=false;f.content.querySelector('[data-song-retry]').click();await flush();assert.match(f.content.innerHTML,/杨丞琳/);
 f.content.querySelector('[data-search-play]').click();await flush();assert.equal(f.audio[0].src,'https://audio.invalid/rain.mp3');assert.match(f.content.innerHTML,/music-artwork/);
 f.content.querySelector('[data-music-tab="search"]').click();f.content.querySelector('[data-search-play]').click();await flush();
 assert.deepEqual(songCalls,['100']);assert.equal(f.requests.length,0);
});

test('search results create a playlist without playback requests, and playlist removal preserves songs',async()=>{
 let calls=0;const f=fixture({getToken:async()=>'',search:async()=>({songs:[{id:'100',name:'雨爱',artist:'杨丞琳',cover:'https://img.invalid/rain.jpg'}]}),song:async()=>{calls++;throw Error('unexpected')}});await flush();
 f.content.querySelector('[data-music-tab="search"]').click();f.content.querySelector('[data-song-suggestion]').click();await flush();f.content.querySelector('[data-search-add]').click();
 let dialog=f.body.children.at(-1);dialog.querySelector('[data-picker-create]').click();dialog=f.body.children.at(-1);let form=dialog.querySelector('form');form.elements.name.value='一起听';form.onsubmit({preventDefault(){}});
 const playlist=f.state.music.playlists[0];assert.equal(playlist.name,'一起听');assert.equal(playlist.entries[0].platformId,'100');assert.equal(calls,0);
 dialog=f.body.children.at(-1);dialog.querySelector('[data-music-dialog-close]').click();f.content.querySelector('[data-music-tab="library"]').click();f.content.querySelector('[data-library-pane="playlists"]').click();assert.match(f.content.innerHTML,/Iris 自建歌单/);f.content.querySelector('[data-local-playlist]').click();
 dialog=f.body.children.at(-1);dialog.querySelector('[data-local-remove]').click();assert.equal(playlist.entries.length,0);assert.equal(f.state.music.tracks.length,2);
});

test('late song searches cannot replace results after switching identities',async()=>{
 let finish;const f=fixture({getToken:async()=>'',search:()=>new Promise(resolve=>finish=resolve)});await flush();f.content.querySelector('[data-music-tab="search"]').click();f.content.querySelector('[data-song-suggestion]').click();await flush();
 f.select({userId:'user-b',roleId:'role-b',userName:'乙',roleName:'乙角色'});f.api.render(f.runtime);await flush();finish({songs:[{id:'old',name:'旧用户搜索'}]});await flush();f.content.querySelector('[data-music-tab="search"]').click();assert.doesNotMatch(f.content.innerHTML,/旧用户搜索|正在寻找歌曲/);
});

test('missing search artwork is hydrated by song ID, saved into playlists and reused for playback',async()=>{
 const calls=[];let finish;
 const f=fixture({getToken:async()=>'',search:async()=>({songs:[{id:'201',name:'有封面的歌',artist:'歌手',cover:''}]}),song:id=>{calls.push(id);return new Promise(resolve=>finish=resolve)}});await flush();
 f.content.querySelector('[data-music-tab="search"]').click();f.content.querySelector('[data-song-suggestion]').click();await flush();
 const p=C.createPlaylist(f.state,'user-a','收藏');C.addToPlaylist(f.state,'user-a',p.id,{id:'201',name:'有封面的歌'});
 finish({song:{id:'201',name:'有封面的歌',artist:'歌手',cover:'http://img.invalid/album.jpg',playUrl:'https://audio.invalid/201.mp3'}});await flush();
 const art=f.content.querySelector('[data-search-artwork="0"]');assert.match(art.innerHTML,/https:\/\/img.invalid\/album.jpg/);
 assert.equal(p.entries[0].cover,'https://img.invalid/album.jpg');assert.equal(f.state.music.netEaseByUser['user-a'].songs['201'].cover,'https://img.invalid/album.jpg');
 f.content.querySelector('[data-search-play]').click();await flush();assert.equal(f.audio[0].src,'https://audio.invalid/201.mp3');assert.deepEqual(calls,['201']);
});

test('search artwork metadata without a URL is refreshed on play instead of permanently blocking the song',async()=>{
 const calls=[];const f=fixture({getToken:async()=>'',search:async()=>({songs:[{id:'302',name:'测试歌曲',artist:'歌手'}]}),song:async(id,token,options)=>{calls.push(options?.metadataOnly);return{song:{id,name:'测试歌曲',artist:'歌手',cover:'https://img.invalid/a.jpg',...(options?.metadataOnly?{}:{playUrl:'https://audio.invalid/play302.mp3',playUrlExpiresAt:Date.now()+600000})}}}});await flush();
 f.content.querySelector('[data-music-tab="search"]').click();f.content.querySelector('[data-song-suggestion]').click();await flush();assert.equal(f.state.music.netEaseByUser['user-a'].songs['302'].playUrl,undefined);
 f.content.querySelector('[data-search-play]').click();await flush();assert.equal(f.audio[0].src,'https://audio.invalid/play302.mp3');assert.deepEqual(calls,[true,false]);assert.equal(f.notices.length,0);
});

test('role listening generation requires a click, calls the model once and stores only verified songs',async()=>{
 const f=fixture({getToken:async()=>'',search:async query=>({songs:query==='真实歌曲 歌手'? [{id:'401',name:'真实歌曲',artist:'歌手'}]:[]}),song:async id=>({song:{id,name:'真实歌曲',artist:'歌手',cover:'https://img.invalid/401.jpg'}})});await flush();f.content.querySelector('[data-music-tab="role"]').click();assert.equal(f.requests.length,0);
 f.setReply(async()=>({songs:[{title:'真实歌曲',artist:'歌手'},{title:'编造歌曲',artist:'不存在'}]}));f.content.querySelector('[data-role-generate]').click();await flush();
 assert.equal(f.requests.length,1);assert.equal(f.state.music.roleRecent.length,1);assert.equal(f.state.music.roleRecent[0].platformId,'401');assert.equal(f.state.music.roleRecent[0].source,'generated');assert.match(f.content.innerHTML,/真实歌曲/);assert.doesNotMatch(f.content.innerHTML,/编造歌曲/);assert.equal(f.notices.length,0);
});

test('a role generation result is discarded if the user switches to a different role',async()=>{
 let finish;const f=fixture({getToken:async()=>'',search:async()=>{throw Error('stale results must not be searched')}});await flush();f.setReply(()=>new Promise(resolve=>finish=resolve));f.content.querySelector('[data-music-tab="role"]').click();f.content.querySelector('[data-role-generate]').click();await flush();
 f.select({userId:'user-b',roleId:'role-b',userName:'乙',roleName:'新角色'});f.api.render(f.runtime);await flush();finish({songs:[{title:'旧歌曲',artist:'旧歌手'}]});await flush();assert.equal(f.state.music.roleRecent.length,0);assert.equal(f.notices.length,0);
});

test('opening lyrics and returning preserves playback and the unsent listening message',async()=>{
 const f=fixture();await flush();await f.audio[0].play();f.content.querySelector('[data-music-message]').value='这首歌想分享给你';
 assert.equal(f.content.querySelector('.music-lyrics'),null);assert.ok(f.content.querySelector('[data-music-invite]'));assert.equal(f.content.querySelector('[data-music-volume]'),null);
 f.content.querySelector('[data-music-record]').click();await flush();assert.ok(f.content.querySelector('.music-lyrics'));assert.equal(f.content.querySelector('[data-music-invite]'),null);assert.equal(f.audio[0].paused,false);assert.equal(f.audio.length,1);
 f.content.querySelector('[data-music-lyrics-back]').click();assert.ok(f.content.querySelector('[data-music-invite]'));assert.equal(f.content.querySelector('[data-music-message]').value,'这首歌想分享给你');assert.equal(f.audio[0].paused,false);
});

test('playback mode buttons and the queue work while the current track keeps playing',async()=>{
 const f=fixture();await flush();await f.audio[0].play();const mode=f.content.querySelector('[data-music-mode]');
 for(const value of ['shuffle','repeat-all','repeat-one','order']){mode.click();assert.equal(f.state.music.preferences['user-a'].mode,value);assert.equal(f.audio[0].paused,false)}
 f.content.querySelector('[data-music-queue]').click();let dialog=f.body.children.at(-1);assert.equal(f.audio[0].paused,false);assert.equal(dialog.querySelectorAll('[data-music-queue-track]').length,2);
 dialog.querySelectorAll('[data-music-queue-track]').find(b=>b.dataset.musicQueueTrack===f.second.id).click();await flush();assert.equal(f.audio[0].src,f.second.url);assert.equal(f.audio[0].paused,false);assert.equal(dialog.open,false);
});

test('the player shows only the current timed lyric and editing is confined to library menus',async()=>{
 const f=fixture();await flush();f.first.lyrics='[00:01]第一句歌词\n[00:05]第二句歌词';f.api.render(f.runtime);await flush();
 assert.equal(f.content.querySelector('[data-music-edit]'),null);f.audio[0].currentTime=2;f.audio[0].events.timeupdate();assert.equal(f.content.querySelector('[data-music-current-lyric]').textContent,'第一句歌词');
 f.audio[0].currentTime=6;f.audio[0].events.timeupdate();assert.equal(f.content.querySelector('[data-music-current-lyric]').textContent,'第二句歌词');
 f.content.querySelector('[data-music-record]').click();assert.equal(f.content.querySelector('[data-music-edit]'),null);f.content.querySelector('[data-music-tab="library"]').click();assert.ok(f.content.querySelector('[data-music-edit]'));
 f.content.querySelector('[data-music-tab="role"]').click();assert.match(f.content.innerHTML,/TA 的歌单|为 TA 选歌/);assert.doesNotMatch(f.content.innerHTML,/根据角色设定选歌|使用线上聊天 API|生成最近在听/);
});

test('music playlist generation uses its assigned API and model independently from online chat',async()=>{
 const app=fs.readFileSync(require.resolve('../scripts/app.js'),'utf8'),calls=[];let runtime;
 const chat={id:'chat',url:'https://chat.invalid',key:'chat-key',models:['chat-model'],model:'chat-model'},music={id:'music',url:'https://music-model.invalid',key:'music-key',models:['music-base','music-selected'],model:'music-base'};
 const state={users:[{}],settings:{apiConfigs:[chat,music],activeApiConfigId:'chat',apiFeatureRoutes:{onlineChat:'chat',music:'music'},apiFeatureModels:{onlineChat:'chat-model',music:'music-selected'}}};
 const identity={roleIndex:0,userIndex:0},ctx=vm.createContext({state,chars:[{}],window:{IrisMusic:{render:r=>runtime=r}},musicCurrentIdentity:()=>identity,musicIdentityValid:()=>true,messages:()=>[],render(){},esc:String,save(){},toast(){},avatar:()=>'',requestConfiguredChatCompletion:async(...args)=>calls.push(args)});
 vm.runInContext(app.slice(app.indexOf('function apiConfigForFeature('),app.indexOf('function hasDedicatedReflectionApi(')),ctx);
 vm.runInContext(app.slice(app.indexOf('function renderMusicFeature('),app.indexOf('function readingIdentity(')),ctx);
 ctx.renderMusicFeature({});await runtime.requestRolePlaylist('为角色选歌');await runtime.request('一起听聊天');
 assert.equal(calls[0][0].id,'music');assert.equal(calls[0][1],'music-selected');assert.equal(calls[1][0].id,'chat');assert.equal(calls[1][1],'chat-model');
});

test('listening messages send without a model call and reroll replaces the previous role reply atomically',async()=>{
 const f=fixture();await flush();f.content.querySelector('[data-music-invite]').click();await flush();const s=f.state.music.sessions[0];assert.equal(f.requests.length,1);
 const send=text=>{f.content.querySelector('[data-music-message]').value=text;f.content.querySelector('[data-music-chat]').events.submit({preventDefault(){}})};
 send('第一句话');send('再补充一句');assert.equal(f.requests.length,1);assert.equal(s.thread.filter(m=>m.mine).length,2);assert.match(f.content.querySelector('[data-music-reply]').innerHTML,/回复/);
 f.setReply(async()=>({text:'第一次角色回应'}));f.content.querySelector('[data-music-reply]').click();await flush();assert.equal(f.requests.length,2);assert.match(f.requests[1],/第一句话/);assert.match(f.requests[1],/再补充一句/);assert.match(f.content.querySelector('[data-music-reply]').innerHTML,/重 roll/);const count=s.thread.length;
 f.setReply(async()=>({text:'重新生成的回应'}));f.content.querySelector('[data-music-reply]').click();await flush();assert.equal(s.thread.length,count);assert.equal(s.thread.at(-1).text,'重新生成的回应');assert.doesNotMatch(f.requests[2],/第一次角色回应/);assert.equal(s.runs[0].messages.filter(m=>m.text==='第一次角色回应').length,0);
 f.setReply(async()=>{throw Error('接口暂时失败')});f.content.querySelector('[data-music-reply]').click();await flush();assert.equal(s.thread.length,count);assert.equal(s.thread.at(-1).text,'重新生成的回应');assert.equal(f.notices.at(-1),'接口暂时失败');
 send('接着说点别的');assert.match(f.content.querySelector('[data-music-reply]').innerHTML,/回复/);assert.doesNotMatch(f.content.querySelector('[data-music-reply]').innerHTML,/重 roll/);
});

test('record chat entry opens a separate full chat view and back preserves playback and draft',async()=>{
 const f=fixture(),headers=[];await flush();f.runtime.setHeader=value=>headers.push(value);
 await f.audio[0].play();const src=f.audio[0].src;
 assert.equal(f.content.querySelector('.music-discussion').hasAttribute('hidden'),true);
 assert.match(f.content.querySelector('[data-music-chat-open]').innerHTML,/和角色甲一起聊/);
 f.content.querySelector('[data-music-chat-open]').click();
 assert.match(f.content.innerHTML,/music-chat-fullscreen/);
 assert.equal(f.content.querySelector('.music-discussion').hasAttribute('hidden'),false);
 assert.equal(headers.at(-1).subtitle,'一起听聊天');
 assert.equal(headers.at(-1).backLabel,'返回正在听');
 f.content.querySelector('[data-music-message]').value='尚未发送的文字';
 assert.equal(f.api.back(),true);
 assert.equal(f.content.querySelector('.music-discussion').hasAttribute('hidden'),true);
 assert.equal(headers.at(-1).subtitle,'正在听');
 f.content.querySelector('[data-music-chat-open]').click();
 assert.equal(f.content.querySelector('[data-music-message]').value,'尚未发送的文字');
 assert.equal(f.audio[0].paused,false);assert.equal(f.audio[0].src,src);
 assert.equal(f.audio.length,1);assert.equal(f.requests.length,0);
});

test('record chat entry remains available before a role session is bound',async()=>{
 const f=fixture();await flush();f.select({userId:'user-a',roleId:'',userName:'用户甲',roleName:'角色甲'});f.api.render(f.runtime);await flush();
 const entry=f.content.querySelector('[data-music-chat-open]');assert.ok(entry);assert.equal(entry.disabled,false);
 entry.click();assert.match(f.content.innerHTML,/music-chat-fullscreen/);assert.ok(f.content.querySelector('[data-music-message]'));
});

test('music header tracks categories and lyrics, and its back action preserves audio',async()=>{
 const f=fixture(),headers=[];await flush();f.runtime.setHeader=value=>headers.push(value);f.api.render(f.runtime);await flush();assert.equal(headers.at(-1).subtitle,'正在听');await f.audio[0].play();
 f.content.querySelector('[data-music-record]').click();assert.equal(headers.at(-1).subtitle,'甲的歌 · 歌手');assert.equal(headers.at(-1).backLabel,'返回唱片');assert.doesNotMatch(f.content.innerHTML,/>‹ 返回唱片</);assert.equal(f.api.back(),true);assert.equal(headers.at(-1).subtitle,'正在听');assert.equal(f.audio[0].paused,false);
 f.content.querySelector('[data-music-tab="library"]').click();assert.equal(headers.at(-1).subtitle,'音乐库');f.content.querySelector('[data-library-pane="playlists"]').click();assert.equal(headers.at(-1).subtitle,'我的歌单');
 f.content.querySelector('[data-music-tab="search"]').click();assert.equal(headers.at(-1).subtitle,'找音乐');assert.equal(f.api.back(),true);assert.equal(headers.at(-1).subtitle,'正在听');assert.equal(f.api.back(),false);assert.equal(f.audio[0].paused,false);
});

test('a role invitation loads its album cover before Music has ever opened and accepting starts together listening',async()=>{
 const thread=[{id:'invite-first',type:'music-invite',musicInviteStatus:'resolving',musicTitle:'邀请歌曲',musicArtist:'歌手',_musicRoleIndex:0,_musicUserIndex:0}],tokens=[];
 const f=fixture({getToken:async()=> 'saved-session',resolve:async(title,artist,token)=>{tokens.push(token);return{song:{id:'601',name:title,artist,playUrl:'https://audio.invalid/invite.mp3'}}},song:async()=>({song:{id:'601',cover:'http://img.invalid/album601.jpg',album:'专辑'}})},false);
 assert.equal(f.api.ready(),false);f.setActive(false);f.runtime.chatMessages=()=>thread;f.runtime.identity=()=>({userId:'user-a',roleId:'role-a',userName:'用户甲',roleName:'角色甲',roleIndex:0,userIndex:0});f.runtime.valid=()=>true;f.api.configure(f.runtime);f.api.sync();await flush();
 assert.equal(f.audio.length,0);assert.equal(thread[0].musicInviteStatus,'pending');assert.equal(thread[0].musicSong.cover,'https://img.invalid/album601.jpg');assert.deepEqual(tokens,['saved-session']);
 assert.equal(f.api.acceptRoleInvite(thread[0].musicSong),true);await flush();assert.equal(f.audio[0].src,'https://audio.invalid/invite.mp3');assert.equal(f.audio[0].paused,false);assert.equal(f.state.music.sessions[0].active,true);assert.match(f.content.querySelector('[data-music-invite]').innerHTML,/结束一起听/);assert.equal(f.requests.length,0);
 assert.equal(f.api.acceptRoleInvite(thread[0].musicSong),true);await flush();assert.equal(f.state.music.sessions[0].runs.length,1);
});

test('existing invitation cards repair missing album art and open with the accepted state',async()=>{
 const thread=[{id:'saved-card',type:'music-invite',musicInviteStatus:'pending',musicSong:{id:'602',name:'歌曲',artist:'歌手',playUrl:'https://audio.invalid/a602.mp3'}}];
 const f=fixture({getToken:async()=>'',song:async()=>({song:{id:'602',cover:'https://img.invalid/602.jpg'}})});await flush();f.setActive(false);f.runtime.chatMessages=()=>thread;f.api.sync();await flush();assert.equal(thread[0].musicSong.cover,'https://img.invalid/602.jpg');
 const app=fs.readFileSync(require.resolve('../scripts/app.js'),'utf8');let opened=0;const context=vm.createContext({messages:()=>thread,window:{IrisMusic:{ready:()=>true,acceptRoleInvite:()=>{opened++;return true}}},save(){},render(){},toast(){}});
 vm.runInContext(app.slice(app.indexOf('function handleMusicInviteAction('),app.indexOf('function renderMessageContent(')),context);context.handleMusicInviteAction(0,'accept');assert.equal(opened,1);assert.equal(thread[0].musicInviteStatus,'accepted');context.handleMusicInviteAction(0,'open');assert.equal(opened,2);
});

test('synced playlists load their real songs, cache details and retain the collect action until saved',async()=>{
 let reads=0;const f=fixture({getToken:async()=> 'account-token',me:async()=>({user:{nickname:'用户'}}),playlist:async(id,token)=>{reads++;assert.equal(id,'77');assert.equal(token,'account-token');return{playlist:{id,name:'同步歌单',trackCount:2,detailsVersion:2,tracks:[{id:'701',name:'第一首',artist:'歌手甲',cover:'https://img.invalid/701.jpg'},{id:'702',name:'第二首',artist:'歌手乙'}]}}}});await flush();
 f.state.music.netEaseByUser['user-a'].playlists=[{id:'77',name:'同步歌单',trackCount:2}];f.content.querySelector('[data-music-tab="library"]').click();f.content.querySelector('[data-library-pane="playlists"]').click();f.content.querySelector('[data-net-playlist]').click();await flush();
 let dialog=f.body.children.at(-1),body=dialog.querySelector('.music-dialog-body');assert.match(dialog.className,/music-playlist-dialog/);assert.ok(dialog.querySelector('[data-music-dialog-close]'));assert.match(body.innerHTML,/第一首/);assert.match(body.innerHTML,/第二首/);assert.ok(body.querySelector('[data-net-save-playlist]'));assert.equal(f.state.music.netEaseByUser['user-a'].songs['701'].artist,'歌手甲');
 dialog.close();f.content.querySelector('[data-net-playlist]').click();await flush();dialog=f.body.children.at(-1);assert.ok(dialog.querySelector('[data-net-save-playlist]'));assert.equal(reads,1);assert.equal(f.notices.length,0);
});

test('a failed playlist read can retry and does not cache a false empty playlist',async()=>{
 let reads=0;const f=fixture({getToken:async()=>'',playlist:async()=>{if(++reads===1)throw Error('网易云暂不可用');return{playlist:{id:'77',name:'恢复的歌单',trackCount:1,detailsVersion:2,tracks:[{id:'701',name:'真实歌曲'}]}}}});await flush();f.content.querySelector('[data-music-tab="library"]').click();f.state.music.netEaseByUser['user-a'].playlists=[{id:'77',name:'歌单'}];f.content.querySelector('[data-library-pane="playlists"]').click();f.content.querySelector('[data-net-playlist]').click();await flush();
 const dialog=f.body.children.at(-1);let body=dialog.querySelector('.music-dialog-body');assert.match(body.innerHTML,/网易云暂不可用/);assert.equal(f.state.music.netEaseByUser['user-a'].playlistDetails['77'],undefined);body.querySelector('[data-playlist-retry]').click();await flush();assert.match(body.innerHTML,/真实歌曲/);assert.equal(reads,2);
});

test('playlist details arriving after an account switch are discarded',async()=>{
 let finish;const f=fixture({getToken:async()=>'',playlist:()=>new Promise(resolve=>finish=resolve)});await flush();f.content.querySelector('[data-music-tab="library"]').click();const previous=f.state.music.netEaseByUser['user-a'];previous.playlists=[{id:'77',name:'旧账号歌单'}];f.content.querySelector('[data-library-pane="playlists"]').click();f.content.querySelector('[data-net-playlist]').click();await flush();
 f.select({userId:'user-b',roleId:'role-b',userName:'乙',roleName:'新角色'});f.api.render(f.runtime);await flush();finish({playlist:{id:'77',detailsVersion:2,tracks:[{id:'701',name:'旧账号歌曲'}]}});await flush();assert.equal(previous.playlistDetails['77'],undefined);assert.equal(f.state.music.netEaseByUser['user-b'].songs['701'],undefined);
});

test('resynchronizing refreshes playlist songs instead of reopening stale cached details',async()=>{
 const f=fixture({getToken:async()=> 'token',me:async()=>({user:{nickname:'用户'}}),playlists:async()=>({playlists:[{id:'77',name:'更新的歌单',trackCount:1}]}),playlist:async()=>({playlist:{id:'77',name:'更新的歌单',trackCount:1,detailsVersion:2,tracks:[{id:'703',name:'新加入的歌'}]}})});await flush();const state=f.state.music.netEaseByUser['user-a'];state.playlists=[{id:'77',name:'歌单'}];state.playlistDetails['77']={id:'77',detailsVersion:2,tracks:[{id:'701',name:'旧歌曲'}]};
 f.content.querySelector('[data-music-tab="library"]').click();f.content.querySelector('[data-library-pane="playlists"]').click();f.content.querySelector('[data-net-sync]').click();await flush();assert.equal(state.playlistDetails['77'],undefined);f.content.querySelector('[data-net-playlist]').click();await flush();const body=f.body.children.at(-1).querySelector('.music-dialog-body');assert.match(body.innerHTML,/新加入的歌/);assert.doesNotMatch(body.innerHTML,/旧歌曲/);
});
test('music search history sits below suggestions, deduplicates recent queries and stays isolated by user',async()=>{
 const searches=[],f=fixture({getToken:async()=>'',search:async query=>{searches.push(query);return{songs:[]}}});await flush();f.content.querySelector('[data-music-tab="search"]').click();assert.match(f.content.innerHTML,/搜索历史/);assert.ok(f.content.innerHTML.indexOf('music-search-history')>f.content.innerHTML.indexOf('music-search-suggestions'));
 for(const index of [0,1,0]){f.content.querySelector('[data-song-suggestion="'+index+'"]').click();await flush()}
 assert.deepEqual([...f.state.music.preferences['user-a'].searchHistory],['雨爱 杨丞琳','晴天 周杰伦']);f.content.querySelector('[data-song-history="1"]').click();await flush();assert.equal(searches.at(-1),'晴天 周杰伦');assert.equal(f.state.music.preferences['user-a'].searchHistory[0],'晴天 周杰伦');
 f.select({userId:'user-b',roleId:'role-b',userName:'乙',roleName:'乙角色'});f.api.render(f.runtime);await flush();f.content.querySelector('[data-music-tab="search"]').click();assert.equal(f.content.querySelector('[data-song-history]'),null);
 f.select({userId:'user-a',roleId:'role-a',userName:'甲',roleName:'角色甲'});f.api.render(f.runtime);await flush();f.content.querySelector('[data-music-tab="search"]').click();assert.ok(f.content.querySelector('[data-song-history]'));f.content.querySelector('[data-song-history-clear]').click();assert.equal(f.state.music.preferences['user-a'].searchHistory.length,0);
});
test('cover repair refreshes metadata-only caches without artwork and never overwrites fresh search art with stale art',async()=>{
 let reads=0;const f=fixture({getToken:async()=>'',search:async()=>({songs:[{id:'801',name:'补全封面',cover:''},{id:'802',name:'新封面',cover:'http://img.invalid/new.jpg'}]}),song:async id=>{reads++;return{song:{id,name:'补全封面',cover:'https://img.invalid/repaired.jpg'}}}});await flush();f.content.querySelector('[data-music-tab="search"]').click();f.state.music.netEaseByUser['user-a']||={songs:{}};f.state.music.netEaseByUser['user-a'].songs['801']={id:'801',name:'只有名字'};f.state.music.netEaseByUser['user-a'].songs['802']={id:'802',cover:'https://img.invalid/old-broken.jpg',playUrl:'https://audio.invalid/keep.mp3'};
 f.content.querySelector('[data-music-tab="search"]').click();f.content.querySelector('[data-song-suggestion]').click();await flush();assert.equal(reads,1);assert.match(f.content.querySelector('[data-search-artwork="0"]').innerHTML,/repaired.jpg/);assert.match(f.content.querySelector('[data-search-artwork="1"]').innerHTML,/https:\/\/img.invalid\/new.jpg/);assert.doesNotMatch(f.content.querySelector('[data-search-artwork="1"]').innerHTML,/old-broken/);assert.equal(f.state.music.netEaseByUser['user-a'].songs['802'].playUrl,'https://audio.invalid/keep.mp3');
});
test('search artwork actually renders the negotiated cover relay URL instead of directly using the blocked CDN',async()=>{
 const f=fixture({getToken:async()=>'',coverUrl:value=>'https://music.test/cover?url='+encodeURIComponent(value),search:async()=>({songs:[{id:'901',name:'代理封面',cover:'https://p3.music.126.net/abcdefghij/12345678.jpg'}]})});await flush();f.content.querySelector('[data-music-tab="search"]').click();f.content.querySelector('[data-song-suggestion]').click();await flush();const image=f.content.querySelector('[data-search-artwork="0"]').innerHTML;assert.match(image,/src="https:\/\/music.test\/cover\?url=/);assert.match(image,/referrerpolicy="no-referrer"/);
});
