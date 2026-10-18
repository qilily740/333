const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require.resolve('../scripts/app.js'), 'utf8');

function fixture(respond = async () => ({ decision: 'accept', reply: '这个小熊放在桌边正好。' })) {
  const state = { char: 0, user: 0, offline: false, users: [{ name: '甲' }, { name: '乙' }], characters: [
    { name: '林夏', details: '温柔但有自己的边界', chatSettings: { userIndex: 0 } },
    { name: '林夏', chatSettings: { userIndex: 1 } }
  ], messages: {} };
  const dialogs = [], requests = [], jobs = [], notices = [];
  const views = { '#settingsScreen': { hidden: true }, '#featureScreen': { hidden: true }, '#sheet': { hidden: true } };
  const context = vm.createContext({
    window: {}, state, chars: state.characters, videoCallActive: false,
    $: selector => views[selector], save() {}, render() {}, syncChatGifts() {},
    queueMicrotask: callback => jobs.push(callback), toast: message => notices.push(message),
    avatar: () => '<span class="avatar"></span>', esc: value => String(value).replaceAll('<', '&lt;'),
    removeInternalReplyLeakage: value => value, expandOnlineReplyMessages: items => items, normalizeReflectionPanels: () => ({}), pendingRoleActions: [],
    apiConfigForFeature: () => ({ url: 'https://test.invalid', key: 'test' }), apiModelForFeature: () => 'test',
    worldBookPromptValues: () => ({}), onlinePromptVariableValues: () => ({}), resolvePromptVariables: value => value,
    messagePromptContent: item => item.text || '', chatCompletionRawText: result => JSON.stringify(result),
    requestConfiguredChatCompletion: async (...args) => { requests.push(args); return respond(...args); },
    document: { hidden: false, querySelector: () => dialogs.find(dialog => dialog.open) || null,
      body: { append: dialog => dialogs.push(dialog) }, createElement: () => {
        const buttons = [{ focus() {} }, { focus() {} }];
        return { buttons, setAttribute() {}, addEventListener() {}, querySelectorAll: () => buttons, querySelector: () => buttons[1],
          showModal() { this.open = true; }, close() { this.open = false; }, remove() { this.removed = true; } };
      }
    }
  });
  vm.runInContext(fs.readFileSync(require.resolve('../scripts/market-core.js'), 'utf8'), context);
  const C = context.window.IrisMarketCore; C.normalize(state);
  const order = C.createOrder(state, { items: [{ productId: 'p-toy-bear', specId: 'default', quantity: 1 }], kind: 'gift', characterIndex: 0, requestId: 'gift-test' });
  C.advance(state, 0, order.shippingEvents.at(-1).at);
  vm.runInContext(source.slice(source.indexOf('let activeGiftReactionCard='), source.indexOf('function chatGiftOrder(')), context);
  vm.runInContext(source.slice(source.indexOf('function parseRoleActions('), source.indexOf('function openTransferComposer(')), context);
  vm.runInContext(source.slice(source.indexOf('function reflectionReplyTarget('), source.indexOf('async function generateOnlineReflection(')), context);
  return { context, C, state, order, dialogs, requests, jobs, views, notices };
}

test('delivered gifts generate an independent reaction card without appending a chat bubble', async () => {
  const f = fixture(), count = f.state.messages['0-0-chat'].length;
  await f.context.syncGiftReactionCards();
  assert.equal(f.requests.length, 1);
  assert.equal(f.requests[0][4], '收礼反应');
  assert.equal(f.order.giftReaction.status, 'accepted');
  assert.equal(f.C.persona(f.state, 0).characterItems.length, 1);
  assert.equal(f.state.messages['0-0-chat'].length, count);
  await f.context.syncGiftReactionCards();
  assert.equal(f.dialogs.length, 1);
  assert.match(f.dialogs[0].innerHTML, /林夏/);
  assert.match(f.dialogs[0].innerHTML, /收下了你的礼物/);
  assert.match(f.dialogs[0].innerHTML, /这个小熊放在桌边正好/);
  f.dialogs[0].buttons[1].onclick();
  await f.context.syncGiftReactionCards();
  assert.equal(f.dialogs.length, 1, 'acknowledged cards must not appear on later visits');
  assert.ok(f.order.giftReaction.cardSeenAt);
});

test('declining keeps the real refund logic and displays the role response in the card', async () => {
  const f = fixture(async () => ({ decision: 'decline', reply: '心意我收到了，这份礼物就退回去吧。' }));
  const before = f.C.persona(f.state, 0).wallet.balanceCents;
  await f.context.syncGiftReactionCards();
  await f.context.syncGiftReactionCards();
  assert.equal(f.order.status, '已退款');
  assert.equal(f.C.persona(f.state, 0).wallet.balanceCents, before + f.order.totalCents);
  assert.match(f.dialogs[0].innerHTML, /婉拒了这份礼物/);
  assert.match(f.dialogs[0].innerHTML, /款项已退回/);
  assert.equal(f.C.persona(f.state, 0).characterItems.length, 0);
});

test('offline, settings, another persona and other role pages do not trigger the gift request', async () => {
  for (const change of [f => { f.state.offline = true; }, f => { f.views['#settingsScreen'].hidden = false; },
    f => { f.views['#featureScreen'].hidden = false; }, f => { f.state.char = 1; },
    f => { f.state.characters[0].chatSettings.userIndex = 1; }]) {
    const f = fixture(); change(f); await f.context.syncGiftReactionCards();
    assert.equal(f.requests.length, 0);
    assert.equal(f.dialogs.length, 0);
  }
});

test('a pending request is not duplicated and switching roles keeps the result queued for its owner', async () => {
  let release;
  const f = fixture(() => new Promise(resolve => { release = resolve; }));
  const pending = f.context.syncGiftReactionCards();
  await f.context.syncGiftReactionCards();
  assert.equal(f.requests.length, 1);
  f.state.char = 1;
  release({ decision: 'accept', reply: '收下了。' });
  await pending;
  assert.equal(f.dialogs.length, 0);
  assert.equal(f.order.giftReaction.cardSeenAt, 0);
  f.state.char = 0;
  await f.context.syncGiftReactionCards();
  assert.equal(f.dialogs.length, 1);
  assert.equal(f.requests.length, 1);
});

test('invalid model decisions do not change the gift or spend/refund money', async () => {
  const f = fixture(async () => ({ decision: 'perhaps', reply: '再说吧' }));
  const balance = f.C.persona(f.state, 0).wallet.balanceCents;
  await f.context.syncGiftReactionCards();
  assert.equal(f.order.giftReaction, undefined);
  assert.equal(f.C.persona(f.state, 0).wallet.balanceCents, balance);
  assert.equal(f.dialogs.length, 0);
  assert.equal(f.notices.length, 1);
});

test('legacy gift actions are routed to cards and duplicate trailing chat text is removed', async () => {
  for (const normal of [[], [{ text: '刚忙完，今天还好吗？' }]]) {
    const f = fixture();
    const replies = f.context.decodeOnlineReply(JSON.stringify({
      messages: [...normal, { text: '小熊我收下了。' }],
      actions: [{ type: 'gift_reply', orderId: f.order.id, decision: 'accept', reply: '小熊我收下了。' }],
      reflection: { status: '高兴', thought: '很合心意' }
    }), f.state.messages['0-0-chat'], [], {}, { enabled: true, roleIndex: 0, userIndex: 0 });
    assert.equal(replies.length, normal.length);
    assert.equal(f.order.giftReaction.presentation, 'card');
    assert.ok(replies.every(item => item.text !== '小熊我收下了。'));
    await f.context.syncGiftReactionCards();
    assert.equal(f.dialogs.length, 1);
    assert.equal(f.requests.length, 0, 'existing validated decisions must not be regenerated');
  }
});
