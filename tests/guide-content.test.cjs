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
