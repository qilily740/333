const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(require.resolve('../scripts/app.js'), 'utf8');
const start = source.indexOf('function offlineRedactText(');
const end = source.indexOf('function applyOfflineRedactionToTree(');
const context = vm.createContext({});
vm.runInContext(source.slice(start, end), context);

test('redaction targets the selected names and leaves the source text unchanged', () => {
  const message = { text: '林间遇见小满，之后小满叫住林间。' };
  const character = { name: '林间', nickname: '阿林' };
  const user = { name: '小满', nickname: '满满' };

  assert.equal(context.offlineRedactText(message.text, { target: 'character', replacement: '██' }, character, user), '██遇见小满，之后小满叫住██。');
  assert.equal(context.offlineRedactText(message.text, { target: 'user', replacement: '【隐藏】' }, character, user), '林间遇见【隐藏】，之后【隐藏】叫住林间。');
  assert.equal(context.offlineRedactText(message.text, { target: 'both', replacement: '•••' }, character, user), '•••遇见•••，之后•••叫住•••。');
  assert.equal(message.text, '林间遇见小满，之后小满叫住林间。');
});

test('custom patterns are literal and names containing regex characters are safe', () => {
  const original = 'A.B 给用户发来消息，AAB 没有被打码。';
  const result = context.offlineRedactText(original, { target: 'character', replacement: '$&[隐藏]' }, { name: 'A.B' }, { name: '用户' });
  assert.equal(result, '$&[隐藏] 给用户发来消息，AAB 没有被打码。');
  assert.equal(original, 'A.B 给用户发来消息，AAB 没有被打码。');
});

test('offline quick actions place masking immediately above save', () => {
  const menu = { innerHTML: '' };
  const context = vm.createContext({
    state: { offline: true }, chars: [],
    applyFunctionButtonLanguage() {}, // Menu ordering is independent of the tested language formatter.

    $: selector => selector === '#quickFeatures' ? menu : null,
    icon: name => `<svg data-icon="${name}"></svg>`
  });
  const start = source.indexOf('function renderQuickFeatures(');
  const end = source.indexOf('function closeFeatureMenu(', start);
  vm.runInContext(source.slice(start, end), context);
  context.renderQuickFeatures();
  assert.ok(menu.innerHTML.indexOf('data-quick="打码"') < menu.innerHTML.indexOf('data-quick="保存"'));
});
