const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require.resolve('../scripts/app.js'), 'utf8');

function fixture() {
  const now = 10_000_000;
  const user = { name: '用户' };
  const role = { name: '角色', offlineMode: false, chatSettings: { userIndex: 0, more: { incomingVideoSound: false, incomingVideoConfigured: true, incomingVideoEnabled: true } } };
  const thread = [], timers = new Map(), opened = [], dialogs = [];
  let timerId = 0;
  const context = vm.createContext({
    Date: class extends Date { static now() { return now; } },
    state: { char: 0, offline: false, users: [user], messages: { '0-0-chat': thread } },
    chars: [role], videoCallActive: false, videoCallSession: null,
    activeIncomingVideo: null, incomingVideoRefreshTimer: null, pendingRoleActions: [],
    apiConfigForFeature: () => ({ url: 'https://api.invalid', key: 'test' }), apiModelForFeature: () => 'model',
    save() {}, render() {}, navigator: {}, window: { IrisMarketCore: { normalize() {} } },
    esc: value => String(value).replaceAll('<', '&lt;'), avatar: () => '<span class="avatar"></span>', icon: () => '<svg></svg>',
    removeInternalReplyLeakage: value => value, expandOnlineReplyMessages: items => items, normalizeReflectionPanels: () => ({}),
    setTimeout: (fn, ms) => { const id = ++timerId; timers.set(id, { fn, ms }); return id; },
    clearTimeout: id => timers.delete(id), setInterval() {}, clearInterval() {},
    openVideoComposer: incoming => opened.push(incoming),
    document: {
      hidden: false,
      querySelector: () => dialogs.find(dialog => dialog.open) || null,
      createElement: () => {
        const controls = {};
        return { controls, setAttribute() {}, querySelector: selector => controls[selector] ||= { focus() {} },
          addEventListener() {}, showModal() { this.open = true; }, close() { this.open = false; }, remove() { this.removed = true; } };
      },
      body: { append: dialog => dialogs.push(dialog) }
    }
  });
  vm.runInContext(source.slice(source.indexOf('function incomingVideoPolicy('), source.indexOf('const chatNodeMarkup=')), context);
  vm.runInContext(source.slice(source.indexOf('function hasOngoingSharedTravel('), source.indexOf('function isSharedTravelReply(')), context);
  vm.runInContext(source.slice(source.indexOf('function parseRoleActions('), source.indexOf('function openTransferComposer(')), context);
  vm.runInContext(source.slice(source.indexOf('function reflectionReplyTarget('), source.indexOf('async function generateOnlineReflection(')), context);
  const propose = (count = 1) => {
    const raw = Array(count).fill('[[IRIS_ACTION {"type":"video_call","reason":"想陪你说说话"}]]').join('\n');
    const parsed=context.parseRoleActions(raw, thread, [], {}, { enabled: true, roleIndex: 0, userIndex: 0 });
    thread.push(...parsed.actions);
    return thread.at(-1);
  };
  return { context, now, role, user, thread, timers, opened, dialogs, propose };
}

test('one reply can create only one incoming call, which rings for 30 seconds', () => {
  const f = fixture();
  const message = f.propose(2);
  assert.equal(f.thread.length, 1);
  assert.equal(message.callStatus, 'pending');
  f.context.syncIncomingVideoCalls();
  assert.equal(f.dialogs.length, 1);
  assert.match(f.dialogs[0].innerHTML, /接听/);
  assert.equal(f.timers.get(f.context.activeIncomingVideo.timeout).ms, 30000);
  f.context.syncIncomingVideoCalls();
  assert.equal(f.dialogs.length, 1, 'rendering again must not create a second ringing dialog');
});

test('real structured chat replies preserve normal messages and visible heartvoice while starting a call', () => {
  const f = fixture();
  const replies = f.context.decodeOnlineReply(JSON.stringify({
    messages: [{ text: '想和你说说话' }], actions: [{ type: 'video_call', reason: '想陪伴对方' }],
    reflection: { status: '想念', thought: '想听听她的声音' }, invitation: { intent: '见面' }
  }), f.thread, [], {}, { enabled: true, roleIndex: 0, userIndex: 0 });
  assert.equal(replies.length, 2);
  assert.equal(replies[0].text, '想和你说说话');
  assert.equal(replies[0].reflection.thought, '想听听她的声音');
  assert.equal(replies[0].invitationProposal, undefined, 'one reply must not open offline invitation and video dialogs together');
  assert.equal(replies[1].callStatus, 'pending');
  f.thread.push(...replies);
  f.context.syncIncomingVideoCalls();
  assert.equal(f.dialogs.length, 1);
});

test('rejecting records the decision without opening a call and prevents repeated offers after history deletion', () => {
  const f = fixture(), message = f.propose();
  f.context.syncIncomingVideoCalls();
  f.dialogs[0].controls['[data-incoming-decline]'].onclick();
  assert.equal(message.callStatus, 'declined');
  assert.equal(f.opened.length, 0);
  assert.equal(f.context.activeIncomingVideo, null);
  assert.equal(f.timers.size, 0);
  f.thread.length = 0;
  f.propose();
  assert.equal(f.thread.length, 0, 'clearing chat must not bypass the refusal cooldown');
});

test('accepting hands the frozen role, user and same record to the video screen', () => {
  const f = fixture(), message = f.propose();
  f.context.syncIncomingVideoCalls();
  f.dialogs[0].controls['[data-incoming-accept]'].onclick();
  assert.equal(message.callStatus, 'accepted');
  assert.equal(f.opened.length, 1);
  assert.equal(f.opened[0].message, message);
  assert.equal(f.opened[0].character, f.role);
  assert.equal(f.opened[0].user, f.user);
  assert.equal(f.timers.size, 0);
});

test('changed identity cannot accept another role or user call', () => {
  const f = fixture(), message = f.propose();
  f.context.syncIncomingVideoCalls();
  f.role.chatSettings.userIndex = 1;
  f.dialogs[0].controls['[data-incoming-accept]'].onclick();
  assert.equal(message.callStatus, 'missed');
  assert.equal(f.opened.length, 0);
});

test('timeout produces a missed record and stale reply versions cannot ring again', () => {
  const f = fixture(), message = f.propose();
  f.context.syncIncomingVideoCalls();
  f.timers.get(f.context.activeIncomingVideo.timeout).fn();
  assert.equal(message.callStatus, 'missed');
  f.thread.push({ ...message, callStatus: 'pending' });
  f.context.syncIncomingVideoCalls();
  assert.equal(f.thread.at(-1).callStatus, 'missed');
  assert.equal(f.dialogs.length, 1);
  assert.equal(f.opened.length, 0);
});

test('reloading an accepted call marks it interrupted instead of keeping the role busy forever', () => {
  const f = fixture(), message = f.propose();
  message.callStatus = 'accepted';
  f.context.syncIncomingVideoCalls();
  assert.equal(message.callStatus, 'ended');
  assert.match(message.summary, /中断/);
});

test('disabled, blocked, offline, wrong-role and unconfigured requests cannot trigger a call', () => {
  for (const change of [
    f => { f.role.chatSettings.more.incomingVideoEnabled = false; },
    f => { f.role.chatSettings.blocked = true; },
    f => { f.context.state.offline = true; },
    f => { f.context.state.char = 1; },
    f => { f.context.apiConfigForFeature = () => null; },
    f => { f.context.videoCallActive = true; }
  ]) {
    const f = fixture(); change(f); f.propose();
    assert.equal(f.thread.length, 0);
  }
});

test('frequency limits and refusal cooldown are checked at their real boundaries', () => {
  const f = fixture(), policy = f.context.incomingVideoPolicy;
  for (const [frequency, delay] of [['occasional', 3600000], ['normal', 900000], ['frequent', 300000]]) {
    const thread = [{ type: 'call-summary', createdAt: f.now - delay + 1 }];
    assert.equal(policy({ incomingVideoFrequency: frequency }, thread, f.now).allowed, false);
    assert.equal(policy({ incomingVideoFrequency: frequency }, thread, f.now + 1).allowed, true);
  }
  const refused = [{ type: 'call-summary', callStatus: 'declined', createdAt: 1, resolvedAt: f.now - 1800000 + 1 }];
  assert.equal(policy({ incomingVideoFrequency: 'frequent' }, refused, f.now).allowed, false);
  assert.equal(policy({ incomingVideoFrequency: 'frequent' }, refused, f.now + 1).allowed, true);
});

test('imported ringtones accept common audio formats and reject unsupported or oversized files', () => {
  const f = fixture(), validate = f.context.incomingVideoRingtoneError;
  for (const name of ['ring.mp3', 'ring.m4a', 'ring.aac', 'ring.wav', 'ring.ogg', 'ring.webm']) {
    assert.equal(validate({ name, type: '', size: 1024 }), '');
  }
  assert.equal(validate({ name: 'lossless.flac', type: 'audio/flac', size: 1024 }), '请选择 MP3、M4A、AAC、WAV、OGG 或 WebM 音频文件');
  assert.equal(validate({ name: 'image.png', type: 'image/png', size: 1024 }), '请选择 MP3、M4A、AAC、WAV、OGG 或 WebM 音频文件');
  assert.equal(validate({ name: 'ring.mp3', type: 'audio/mpeg', size: 4 * 1024 * 1024 + 1 }), '铃声文件需小于 4 MB');
});
