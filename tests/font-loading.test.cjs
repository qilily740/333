const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../scripts/app.js'),'utf8');
const context=vm.createContext({});
vm.runInContext(source.slice(source.indexOf('function scopeBeautifySelector('),source.indexOf('function setBeautifyCss(')),context);
const root='.phone:has(#conversation:not(.is-offline-story))';
test('document font variables and body font rules apply to the selected page root',()=>{
 for(const [tab,pageRoot] of [['online',root],['offline','.phone:has(#conversation.is-offline-story)'],['forum','#featureScreen:has(.forum-app)']]){
  const css=context.scopeBeautifyCss(':root{--mainFontFamily:"My Font"}html,body{font-family:var(--mainFontFamily)}',pageRoot,tab);
  assert.ok(css.includes(`${pageRoot}{--mainFontFamily:"My Font"}`));
  assert.ok(css.includes(`${pageRoot},${pageRoot}{font-family:var(--mainFontFamily)}`));
  assert.doesNotMatch(css,/\s(?:body|html|:root)(?=[\s{])/);
 }
});
test('document-prefixed component fonts still match real chat and toolbar elements',()=>{
 const css=context.scopeBeautifyCss('html:root > body .topbar h1{font-family:Heading}body #conversation .bubble{font-family:Body}body textarea{font-family:Body}',root,'online');
 assert.ok(css.includes(`${root} > .topbar h1{font-family:Heading}`));
 assert.ok(css.includes(`${root} #conversation .bubble{font-family:Body}`));
 assert.ok(css.includes(`${root} :is(.topbar,#conversation,.bottom) textarea{font-family:Body}`));
});
test('font selector lists preserve commas inside functions and attribute values',()=>{
 const css=context.scopeBeautifyCss('body :is(.bubble,.offline-prose-body),body [data-name="A,B"]{font-family:"My Font"}',root,'online');
 assert.ok(css.includes(`${root} :is(.topbar,#conversation,.bottom) :is(.bubble,.offline-prose-body),${root} :is(.topbar,#conversation,.bottom) [data-name="A,B"]{font-family:"My Font"}`));
});
test('nested font overrides retain media conditions and independent icon fonts',()=>{
 const css=context.scopeBeautifyCss('@supports(font-format(woff2)){@media(max-width:480px){body{font-family:Text}.fa{font-family:Icons}}}',root,'online');
 assert.ok(css.includes(`@supports(font-format(woff2)){@media(max-width:480px){${root}{font-family:Text}${root} :is(.topbar,#conversation,.bottom) .fa{font-family:Icons}}}`));
 assert.doesNotMatch(css,/\*\s*\{[^}]*font-family/);
});
test('font imports survive scoping and do not swallow the first component rule',()=>{
 const css=context.scopeBeautifyCss('@import url("https://fonts.invalid/style.css"); .bubble{font-family:"My Font"}',root,'online');
 assert.ok(css.startsWith('@import url("https://fonts.invalid/style.css");'));
 assert.ok(css.includes(`${root} :is(.topbar,#conversation,.bottom) .bubble{font-family:"My Font"}`));
});
test('font faces keep descriptors, data URLs and ranges rather than becoming scoped selectors',()=>{
 const face='@font-face{font-family:"My Font";src:url("data:font/woff2;base64,abc;def");font-weight:400;font-style:normal;unicode-range:U+4E00-9FFF;font-display:swap}';
 const css=context.scopeBeautifyCss(face+'.bubble{font-family:"My Font"}',root,'online');
 assert.ok(css.includes(face));assert.ok(css.includes('.bubble{font-family:"My Font"}'));
 assert.ok(!css.includes(root+' @font-face'));
});
test('multiple font imports stay before faces and media rules; component scoping remains intact',()=>{
 const css=context.scopeBeautifyCss('@import url("https://fonts.invalid/a.css");@font-face{font-family:X;src:url(x.woff2)}@import url("https://fonts.invalid/b.css") screen;@media(max-width:480px){.bubble{font-family:X}}',root,'online');
 assert.ok(css.indexOf('b.css')<css.indexOf('@font-face'));
 assert.ok(css.includes(`@media(max-width:480px){${root} :is(.topbar,#conversation,.bottom) .bubble{font-family:X}}`));
});
test('built-in fonts register before the boot font request and do not depend on font CDN stylesheets',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 assert.ok(html.indexOf('assets/fonts/fonts.css')<html.indexOf('document.fonts?.load'));
 assert.doesNotMatch(html,/fonts\.googleapis|fontsapi\.zeoseven|cdn\.jsdelivr/);
});
test('beautify preview allows fonts and puts custom imports at the beginning of a separate stylesheet',()=>{
 const preview=source.slice(source.indexOf('function beautifyPreviewDocument('),source.indexOf('function beautifyTutorialMarkup('));
 assert.ok(preview.includes("font-src 'self' https: data: blob:"));
 assert.ok(preview.includes('assets/fonts/fonts.css?v=2'));
 assert.ok(preview.includes('<style>${scoped}</style>'));
});
test('every self-hosted face has a real font file and a matching declared format',()=>{
 const base=path.join(__dirname,'../assets/fonts'),css=fs.readFileSync(path.join(base,'fonts.css'),'utf8');
 assert.doesNotMatch(css,/@import|https?:|src:\s*local\(/);
 let count=0;
 for(const m of css.matchAll(/url\("([^"]+)"\)\s*format\(['"]([^'"]+)['"]\)/g)){
  const data=fs.readFileSync(path.join(base,m[1]));
  assert.ok(data.length>100, m[1]);
  if(m[2]==='woff2')assert.equal(data.toString('ascii',0,4),'wOF2',m[1]);
  else assert.equal(m[2],'truetype');
  count++;
 }
 assert.ok(count>237,'all WenKai shards and other original weights must be present');
});
test('same family, weight and style have no conflicting Unicode coverage',()=>{
 const css=fs.readFileSync(path.join(__dirname,'../assets/fonts/fonts.css'),'utf8'),groups=new Map();
 for(const face of css.match(/@font-face\s*\{[^}]+\}/g)||[]){
  const family=face.match(/font-family:\s*["']([^"']+)/)[1],weight=face.match(/font-weight:\s*(\d+)/)[1],style=face.match(/font-style:\s*(\w+)/)[1],key=[family,weight,style].join('|');
  assert.match(face,/font-display:\s*swap/);
  const used=groups.get(key)||new Set();
  for(const range of face.matchAll(/U\+([0-9a-f]+)(?:-([0-9a-f]+))?/gi)){
   const a=parseInt(range[1],16),b=parseInt(range[2]||range[1],16);
   assert.ok(a<=b&&b<=0x10ffff);
   for(let cp=a;cp<=b;cp++){assert.ok(!used.has(cp),`${key}: duplicate U+${cp.toString(16)}`);used.add(cp)}
  }
  groups.set(key,used);
 }
 for(const weight of ['300','400','700'])assert.ok(groups.has('LXGW WenKai|'+weight+'|normal'));
 for(const char of '线上线下角色音乐阅读调香一二三ABCabc0123，。！？')assert.ok(groups.get('LXGW WenKai|400|normal').has(char.codePointAt(0)),char);
});
