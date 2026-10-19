const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const theaterContext=vm.createContext({window:{addEventListener(){}}});
vm.runInContext(fs.readFileSync(require.resolve('../scripts/mini-theater.js'),'utf8'),theaterContext);
const mini=theaterContext.window.IrisMiniTheater;
const app=fs.readFileSync(require.resolve('../scripts/app.js'),'utf8');
const context=vm.createContext({window:{IrisMiniTheater:mini},IrisMiniTheater:mini,offlineDefaultReplyPrompt:'正文',offlineWritingStyles:{natural:{}},offlineDraftCotInstruction:'草稿',offlineDraftOutputRegex:'',offlineDraftOutputRegexRuleId:'draft'});
vm.runInContext(app.slice(app.indexOf('const createOfflineSettings='),app.indexOf('for(const [index,role] of chars.entries()'))+';globalThis.createSettings=createOfflineSettings;',context);
test('new and legacy settings without a theater choice enable the extra requirement by default',()=>{
 assert.equal(context.createSettings().miniTheaterEnabled,true);
 assert.equal(context.normalizeOfflineSettings().miniTheaterEnabled,true);
 assert.equal(context.normalizeOfflineSettings({wordCount:800}).miniTheaterEnabled,true);
});
test('explicitly disabled or deleted theater choices remain disabled',()=>{
 assert.equal(context.normalizeOfflineSettings({miniTheaterEnabled:false}).miniTheaterEnabled,false);
 assert.equal(context.normalizeOfflineSettings({miniTheaterDeleted:true}).miniTheaterEnabled,false);
 assert.equal(context.normalizeOfflineSettings({miniTheaterDeleted:true,miniTheaterEnabled:true}).miniTheaterEnabled,false);
});
test('enabling the default preserves custom theater prompts and other requirements',()=>{
 const settings=context.normalizeOfflineSettings({miniTheaterPrompt:'自定义小剧场',customPrompt:'其他要求',wordCount:800});
 assert.equal(settings.miniTheaterEnabled,true);
 assert.equal(settings.miniTheaterPrompt,'自定义小剧场');
 assert.equal(settings.customPrompt,'其他要求');
 assert.equal(settings.wordCount,800);
});
