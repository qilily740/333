const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');

// Minimal element tree so form and descendant selectors are exercised without a browser.
class Element {
  constructor(tag = 'button', attrs = {}, parent = null) {
    this.tag = tag;
    this.attrs = attrs;
    this.parentElement = parent;
    this.id = attrs.id || '';
    this.name = attrs.name || '';
    this.value = attrs.value || '';
    this.type = attrs.type || (tag === 'button' ? 'submit' : 'text');
    this.innerText = this.textContent = attrs.text || '';
    this.title = attrs.title || '';
    this.disabled = false;
    this.form = parent?.closest('form') || null;
  }
  getAttribute(name) { return this.hasAttribute(name) ? this.attrs[name] : null; }
  hasAttribute(name) { return Object.hasOwn(this.attrs, name); }
  getAttributeNames() { return Object.keys(this.attrs); }
  closest(selector) { return this.matches(selector) ? this : this.parentElement?.closest(selector) || null; }
  matches(selectors) {
    return selectors.split(',').some(raw => {
      const parts = raw.trim().split(/\s+(?![^\[]*\])/);
      const current = parts.pop();
      if (parts.length) {
        if (!this.matches(current)) return false;
        return Boolean(this.parentElement?.closest(parts.join(' ')));
      }
      let selector = current;
      let rejected = false;
      selector = selector.replace(/:not\(([^)]+)\)/g, (_, value) => {
        if (this.matches(value)) rejected = true;
        return '';
      });
      if (rejected) return false;
      for (const match of selector.matchAll(/\[([^=\]*]+)(\*?=)?(?:"([^"]*)")?\]/g)) {
        const actual = this.getAttribute(match[1]);
        if (actual === null || match[2] === '=' && actual !== match[3] || match[2] === '*=' && !actual.includes(match[3])) return false;
      }
      selector = selector.replace(/\[[^\]]+\]/g, '');
      const id = selector.match(/#([\w-]+)/);
      if (id && id[1] !== this.id) return false;
      for (const match of selector.matchAll(/\.([\w-]+)/g)) {
        if (!(this.attrs.class || '').split(' ').includes(match[1])) return false;
      }
      const tag = selector.match(/^[a-z]+/);
      return !tag || tag[0] === this.tag;
    });
  }
}
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(require.resolve('../scripts/guide-content.js'), 'utf8'), context);
const info = element => context.window.IrisGuideContent.get(element);
const control = (attribute, value = '') => new Element('button', { [attribute]: value });

test('repeated music actions share one tutorial key despite different songs and labels',()=>{
 const addA=new Element('button',{'data-track-playlist':'song-a','aria-label':'将第一首加入歌单'});
 const addB=new Element('button',{'data-track-playlist':'song-b','aria-label':'将第二首加入歌单'});
 const searchAdd=new Element('button',{'data-search-add':'3','aria-label':'将第三首加入歌单'});
 assert.equal(info(addA).key,info(addB).key);
 assert.equal(info(addA).key,info(searchAdd).key);
 assert.equal(info(control('data-local-choose','a')).key,info(control('data-local-choose','b')).key);
 assert.notEqual(info(addA).key,info(control('data-music-edit','a')).key);
});

test('fallback row actions deduplicate by function while distinct operations remain separate',()=>{
 const a=new Element('button',{'data-example-pick':'a',text:'选择甲'});
 const b=new Element('button',{'data-example-pick':'b',text:'选择乙'});
 assert.equal(info(a).key,info(b).key);
 assert.notEqual(info(control('data-example-action','edit')).key,info(control('data-example-action','delete')).key);
});

test('reading discussion distinguishes local thought saving from model requests', () => {
  const form = new Element('form', { 'data-r-form': 'discussion' });
  const local = info(new Element('button', { type: 'button', 'data-r-save-thought': 'note-1' }, form));
  const request = info(new Element('button', {}, form));
  assert.match(local.behavior, /只保存/);
  assert.match(local.api, /不调用/);
  assert.match(request.title, /讨论选段/);
  assert.match(request.api, /调用阅读模型/);
  assert.notEqual(local.key, request.key);
});

test('reading controls describe actual destinations and automatic layout saving', () => {
  const parent = new Element('section', { class: 'reading-preferences' });
  assert.match(info(new Element('input', { type: 'range', name: 'fontSize' }, parent)).behavior, /自动保存/);
  assert.match(info(control('data-r-share')).description, /直接.*写入/);
  assert.match(info(control('data-r-manage')).description, /一本书.*资料编辑/);
  assert.match(info(control('data-r-attach-open')).description, /附加为这本书的正文/);
  assert.match(info(control('data-r-delete')).description, /共读记录/);
});

test('searches submit directly and identify the actual network or model use', () => {
  for (const [className, pattern] of [['forum-search-form', /不调用模型/], ['market-search', /调用市场模型/]]) {
    const form = new Element('form', { class: className });
    const help = info(new Element('button', {}, form));
    assert.match(help.behavior, /直接搜索/);
    assert.match(help.api, pattern);
  }
  assert.match(info(control('data-r-online-retry')).api, /公共书目.*不调用/);
});

test('hidden requests are disclosed for invitations, summaries, translation and initial forum feed', () => {
  assert.match(info(control('data-invitation-action', 'decline')).api, /拒绝邀请.*自动请求/);
  assert.match(info(control('data-call-close')).api, /通话总结模型/);
  const save = info(control('data-quick', '保存'));
  assert.match(save.description, /立即保存.*清空/);
  assert.match(save.api, /线下总结/);
  assert.match(info(control('data-sms-action', 'translate')).api, /已有译文.*不再次请求/);
  assert.match(info(control('data-dock-feature', 'forum')).api, /自动调用论坛模型/);
});

test('draft settings, automatic settings and API metadata are not confused', () => {
  assert.match(info(control('data-model-keep')).description, /新建接口.*保存配置/);
  assert.match(info(control('data-model-delete-url')).description, /全部已保存接口配置/);
  assert.match(info(control('data-header-characters')).description, /切换聊天角色/);
  assert.match(info(control('data-offline-prompt-detail')).behavior, /自动记录/);
  assert.match(info(control('data-stage-memory-text')).behavior, /对应的“保存”/);
  assert.match(info(control('data-m-pick-role')).title, /代付角色/);
  assert.match(info(control('data-m-pay')).api, /不调用模型/);
  assert.match(info(control('data-theme-save')).description, /配套提示词/);
  const retry = info(new Element('button', { 'data-sms-retry-blocked': '0', 'data-sms-retry-user': '1' }));
  assert.match(retry.title, /重试短信回复/);
  assert.doesNotMatch(retry.title, /发送短信/);
  const apiForm = new Element('form', { id: 'apiForm' });
  const fetch = info(new Element('button', { id: 'fetchModels', type: 'button' }, apiForm));
  assert.doesNotMatch(fetch.behavior, /保存.*提交/);
});

test('floating guide covers the redaction button and every panel control', () => {
  assert.match(info(control('data-quick', '打码')).description, /角色、用户或双方姓名/);
  const panel = new Element('form', { 'data-offline-redaction-form': '' });
  assert.match(info(panel).description, /消息原文.*保持不变/);
  assert.match(info(new Element('input', { name: 'target', type: 'radio', value: 'both' }, panel)).description, /角色姓名.*用户姓名/);
  assert.match(info(new Element('select', { name: 'style' }, panel)).description, /自定义替换内容/);
  assert.match(info(new Element('input', { name: 'custom' }, panel)).description, /40 个字符/);
  assert.match(info(new Element('button', { 'data-redaction-clear': '' }, panel)).description, /重新显示原文/);
});

test('together listening describes local playback, direct-link validation and music-chat API routing',()=>{
 assert.match(info(control('data-quick','听歌')).description,/一起听|本地歌曲/);
 assert.doesNotMatch(info(control('data-quick','听歌')).description,/待开发/);
 assert.match(info(control('data-music-play')).description,/不调用模型/);
 assert.match(info(control('data-music-invite')).api,/音乐一起聊.*线上聊天配置/);
 assert.match(info(control('data-music-reply')).api,/音乐一起聊.*线上聊天配置/);
 assert.match(info(control('data-music-send')).api,/不请求模型/);
 assert.match(info(control('data-music-remember')).description,/不调用总结/);
 const form=new Element('form',{'data-music-edit-form':''});assert.match(info(new Element('input',{name:'lyrics'},form)).behavior,/保存/);
});

test('IF story tools and settings tabs have distinct explanations and tutorial keys',()=>{const tools=['dream','seal','clear','delete'].map(value=>info(control('data-if-story-tool',value)));assert.equal(new Set(tools.map(item=>item.key)).size,4);assert.match(tools[0].description,/线上或线下/);assert.match(tools[1].description,/封存/);assert.match(tools[2].description,/清空/);assert.match(tools[3].description,/删除/);const tabs=['general','style','world','extra'].map(value=>info(control('data-if-setting-tab',value)));assert.equal(new Set(tabs.map(item=>item.key)).size,4);assert.match(tabs[0].description,/抢话或不抢话/);assert.match(info(control('data-if-reply')).api,/经历 API/)});

test('feature identity switch tutorials describe the action without listing role or user names',()=>{
 for(const attr of ['data-timeline-role','data-r-role','data-r-role-option','data-r-user','data-r-user-option','data-p-mask-toggle','data-p-mask-option','data-m-toggle-masks','data-m-switch-user','data-sms-user-select']){
  const entry=info(new Element('button',{[attr]:'3','aria-label':'苏雨豪 苏茜理 长角色名字',text:'苏雨豪 苏茜理 长角色名字'}));assert.doesNotMatch(entry.title+entry.description,/苏雨豪|苏茜理|长角色名字/);assert.match(entry.title,/切换用户|切换角色/);
 }
});
test('experience controls have distinct task help and identify the Experiences API where used',()=>{
 const cases=[['data-growth-save','保存成长档案','照片'],['data-growth-api','API 填写成长档案','审核'],['data-earth-generate','生成单人旅行路线','单人'],['data-earth-generate-memories','生成旅行片段','记录'],['data-route-map','手动定位这段旅程','现实城市'],['data-timeline-confirm','确认这条事件','已确认'],['data-if-dream-summary','摘要梦境','最新内容']];
 for(const [attr,title,text] of cases){const entry=info(control(attr));assert.equal(entry.title,title);assert.ok(entry.description.includes(text));assert.doesNotMatch(entry.description,/以页面反馈为准|查看当前配置项目/)}
 assert.match(info(control('data-earth-generate')).api,/经历接口/);assert.match(info(control('data-earth-generate')).description,/不额外调用/);assert.notEqual(info(control('data-growth-save')).key,info(control('data-growth-api')).key);
});
