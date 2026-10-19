const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../scripts/app.js'),'utf8');
const context=vm.createContext({});
vm.runInContext(source.slice(source.indexOf('const beautifyClassNames='),source.indexOf('function beautifyCanvasBackgroundRule('))+';globalThis.catalog=beautifyClassNames',context);
function section(start,end){const offset=source.indexOf(start);assert.ok(offset>=0,start);return source.slice(offset,source.indexOf(end,offset));}
function staticClasses(text){const classes=new Set();for(const match of text.matchAll(/class="([^"\n]*)"/g)){const plain=match[1].replace(/\$\{.*?\}/g,' ');for(const name of plain.split(/\s+/))if(/^[a-z][a-z0-9-]*[a-z0-9]$/.test(name))classes.add(name);}return classes;}
test('shared message cards and bottom sticker panel classes are listed in both catalogs',()=>{
 const markup=section('function drawnLocationMap(', 'function syncChatGifts(')+section('function renderMessageContent(', 'const roleInvitationLetterOpen=')+section('function renderEmojiPickerPanel(', 'function closeEmojiPicker(');
 const classes=staticClasses(markup);
 for(const name of ['phone','settings-button','quote-composer-preview','is-send','is-expanded','is-current','is-unsealing','is-opening','is-closing','message-type-music-invite'])classes.add(name);
 for(const tab of ['online','offline'])for(const name of classes)assert.ok(context.catalog[tab].includes(name),`${tab}: ${name}`);
});
test('offline paragraph, streaming and mini theater shell classes are complete',()=>{
 const markup=section('function formatOfflineStoryBodyMarkup(', 'function renderOfflineStoryBody(')+section('function renderOfflineStreamingDraft(', 'function paintOfflineStreamingDraft(')+fs.readFileSync(path.join(__dirname,'../scripts/mini-theater.js'),'utf8');
 const classes=staticClasses(markup);for(const name of ['offline-mini-theater-frame','offline-mini-theater-status','offline-opening-controls'])classes.add(name);
 for(const name of classes)assert.ok(context.catalog.offline.includes(name),name);
});
test('catalog entries are unique, valid, described and exclude retired dock-item',()=>{
 for(const tab of ['online','offline']){
  const list=context.catalog[tab];assert.equal(new Set(list).size,list.length);assert.ok(!list.includes('dock-item'));
  for(const name of list){assert.match(name,/^[a-z][a-z0-9-]*[a-z0-9]$/);assert.ok(context.beautifyClassLocation(tab,name));}
 }
});
test('listed shell selector targets the page root rather than a nested phone',()=>{
 vm.runInContext(source.slice(source.indexOf('function scopeBeautifySelector('),source.indexOf('function setBeautifyCss(')),context);
 const root='.phone:has(#conversation.is-offline-story)';
 for(const selector of ['.phone','body .phone','html body .phone'])assert.equal(context.scopeBeautifySelector(selector,root,'offline'),root);
 assert.equal(context.scopeBeautifySelector('.phone .bottom',root,'offline'),root+' .bottom');
});
