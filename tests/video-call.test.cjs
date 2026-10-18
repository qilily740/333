const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require.resolve('../scripts/app.js'), 'utf8');

function fixture({ offline = true, respond } = {}) {
  const user = { name: '原用户' }, otherUser = { name: '其他用户' };
  const character = { name: '原角色', details: '人物设定', chatSettings: { userIndex: 0, more: {}, memory: { enabled: false } } };
  const otherCharacter = { name: '其他角色', chatSettings: { userIndex: 1 } };
  const userMessage = { mine: true, text: '看一下我拿着什么', cameraFrames: [{ data: 'data:image/jpeg;base64,fixture', capturedAt: 123 }], visualState: 'captured' };
  const session = { character, user, offline, modeKey: offline ? 'offline-invite-example' : 'chat', startedAt: 100, thread: [userMessage], context: '通话前已经发生的故事背景' };
  const requests = [], notices = [], events = [];
  const context = {
    state: { offline, char: 1, user: 1, settings: {}, users: [user, otherUser], messages: {} },
    chars: [character, otherCharacter], videoCallActive: true, videoCallSession: session,
    pendingRoleActions: [{ type: 'transfer', text: '其他请求的待处理动作' }],
    apiConfigForFeature: feature => { assert.equal(feature, 'videoCall'); return { url: 'https://fixture.invalid', key: 'fixture' }; },
    apiModelForFeature: () => 'fixture-vision-model',
    key: () => '1-1-chat', enabledRoleStickers: () => [], characterTransferCurrency: () => 'CNY', characterResidence: () => '',
    messagePromptContent: message => message.text,
    onlinePromptVariableValues: role => ({ char_name: role.name }),
    worldBookPromptValues: (role, settings, scope) => ({ character_worldbook: `${scope}世界书`, global_worldbook: '' }),
    resolvePromptVariables: (prompt, vars) => prompt.replace(/\{\{(\w+)\}\}/g, (_, name) => vars[name] || ''),
    requestConfiguredChatCompletion: async (api, model, prompt, recent, feature) => {
      const request = { api, model, prompt, recent, feature }; requests.push(request);
      return respond ? respond(request, requests.length) : { choices: [{ message: { content: '*看向你手里的东西* 是一只杯子。' } }] };
    },
    renderVideoCallMessages: () => events.push('render'), setVideoCallReplyState: value => events.push(value),
    toast: value => notices.push(value),
    applyTransferExchangeRates: () => { throw Error('video calls must not apply unrelated wallet actions'); },
    save: () => { throw Error('temporary call replies must not save into the main chat'); }
  };
  vm.createContext(context);
  vm.runInContext(source.slice(source.indexOf('function videoCallIdentity('), source.indexOf('function openVideoComposer(')), context);
  vm.runInContext(source.slice(source.indexOf('async function sendOnlineMessage('), source.indexOf('async function replyToGiftImmediately(')), context);
  return { context, session, requests, notices, events, userMessage };
}

test('offline and online calls use the real video API, frozen identity and message-time images', async () => {
  for (const offline of [true, false]) {
    const f = fixture({ offline });
    assert.equal(await f.context.requestVideoCallResponse(f.session), true);
    assert.equal(f.requests.length, 1);
    const request = f.requests[0];
    assert.equal(request.feature, 'videoCall');
    assert.match(request.prompt, /原角色/);
    assert.doesNotMatch(request.prompt, /其他角色/);
    assert.match(request.prompt, /通话前已经发生的故事背景/);
    assert.match(request.prompt, offline ? /offline世界书/ : /online世界书/);
    assert.equal(request.recent[0].content[1].image_url.url, f.userMessage.cameraFrames[0].data);
    assert.match(f.session.thread[1].text, /杯子/);
    assert.equal(f.context.pendingRoleActions.length, 1);
    assert.deepEqual(Object.keys(f.context.state.messages), []);
  }
});

test('unsupported vision falls back to a real text request and labels the limitation', async () => {
  const f = fixture({ respond: async (request, count) => {
    if (count === 1) throw Error('model does not support image input');
    return { choices: [{ message: { content: '你可以告诉我手里拿的是什么。' } }] };
  } });
  assert.equal(await f.context.requestVideoCallResponse(f.session), true);
  assert.equal(f.requests.length, 2);
  assert.equal(typeof f.requests[1].recent[0].content, 'string');
  assert.match(f.requests[1].prompt, /本条消息按文字交流/);
  assert.equal(f.userMessage.visionUnavailable, true);
});

test('a failed regeneration retains the previous reply and allows retry', async () => {
  let fail = true;
  const f = fixture({ respond: async () => {
    if (fail) throw Error('聊天 API 请求失败（500）：service temporarily unavailable');
    return { choices: [{ message: { content: '新的真实回复' } }] };
  } });
  f.session.thread.push({ mine: false, text: '旧回复' });
  assert.equal(await f.context.requestVideoCallResponse(f.session, { retry: true }), false);
  assert.equal(f.session.thread[1].text, '旧回复');
  assert.equal(f.userMessage.replyState, 'failed');
  assert.equal(f.requests.length, 1, 'ordinary server errors must not be mistaken for unsupported vision');
  fail = false;
  assert.equal(await f.context.requestVideoCallResponse(f.session), true);
  assert.equal(f.session.thread.length, 2);
  assert.equal(f.session.thread[1].text, '新的真实回复');
});

test('missing video API never produces a placeholder response', async () => {
  const f = fixture();
  f.context.apiConfigForFeature = () => null;
  assert.equal(await f.context.requestVideoCallResponse(f.session), false);
  assert.equal(f.session.thread.length, 1);
  assert.equal(f.requests.length, 0);
  assert.match(f.notices.at(-1), /视频通话接口/);
});

test('camera off supports normal replies without a missing-picture notice', async () => {
  const f = fixture();
  f.userMessage.cameraFrames = [];
  f.userMessage.visualState = 'camera-off';
  assert.equal(await f.context.requestVideoCallResponse(f.session), true);
  assert.equal(f.requests.length, 1);
  assert.equal(typeof f.requests[0].recent[0].content, 'string');
  assert.match(f.requests[0].prompt, /摄像头关闭也可以正常交谈/);
  assert.match(f.requests[0].prompt, /不要主动强调/);
});

test('late responses after hangup cannot enter a new call or trigger UI updates', async () => {
  let release;
  const f = fixture({ respond: () => new Promise(resolve => { release = resolve; }) });
  const pending = f.context.requestVideoCallResponse(f.session);
  const otherSession = { thread: [] };
  f.context.videoCallSession = otherSession;
  const eventCount = f.events.length;
  release({ choices: [{ message: { content: '迟到的回复' } }] });
  assert.equal(await pending, false);
  assert.equal(f.session.thread.length, 1);
  assert.equal(otherSession.thread.length, 0);
  assert.equal(f.events.length, eventCount);
});

test('ending a call saves the transcript under its original identity and mode', async () => {
  const f = fixture();
  let summaryContext;
  f.context.closeVideoCall = () => { f.context.videoCallActive = false; f.context.videoCallSession = null; };
  f.context.videoCallDuration = () => '00:03';
  f.context.save = () => {};
  f.context.createVideoCallSummary = async context => { summaryContext = context; return '已保存的回顾'; };
  vm.runInContext(source.slice(source.indexOf('async function finishVideoCall('), source.indexOf('let finishReflectionRead', source.indexOf('async function finishVideoCall('))), f.context);
  await f.context.finishVideoCall();
  assert.equal(summaryContext.characterName, '原角色');
  assert.equal(summaryContext.userName, '原用户');
  assert.equal(summaryContext.offline, true);
  assert.equal(f.context.state.messages['0-0-offline-invite-example'][0].summary, '已保存的回顾');
  assert.equal(f.context.state.messages['1-1-chat'], undefined);
});

test('the send button allows repeated messages without requesting a reply, including while a reply is pending', () => {
  const f = fixture();
  const form = {}, input = { value: '新消息' };
  let captures = 0, replies = 0;
  Object.assign(f.context, { form, input, session: f.session, replyPending: false, status: {}, video: { readyState: 2 }, videoCallStream: {},
    getVideoCallFrameSamples: () => { captures++; return [{ data: 'new-frame' }]; }, requestCallReply: () => { replies++; } });
  const start = source.indexOf(' form.onsubmit=event=>', source.indexOf('function openVideoComposer('));
  const end = source.indexOf('\n sendButton.addEventListener', start);
  vm.runInContext(source.slice(start, end), f.context);
  form.onsubmit({ preventDefault() {} });
  assert.equal(captures, 1);
  assert.equal(replies, 0);
  assert.equal(f.session.thread.at(-1).text, '新消息');
  assert.equal(f.session.thread.at(-1).cameraFrames[0].data, 'new-frame');
  assert.equal(input.value, '');
  f.context.replyPending = true;
  input.value = '还想再补充一句';
  form.onsubmit({ preventDefault() {} });
  assert.equal(captures, 2);
  assert.equal(replies, 0);
  assert.equal(f.session.thread.at(-1).text, '还想再补充一句');
});

test('requesting a reply includes all sent messages and preserves messages sent while the request is in flight', async () => {
  let release;
  const f = fixture({ respond: () => new Promise(resolve => { release = resolve; }) });
  f.session.thread.push({ mine: true, text: '补充第一句' });
  const pending = f.context.requestVideoCallResponse(f.session);
  assert.equal(f.requests[0].recent.length, 2);
  assert.equal(f.requests[0].recent[1].content, '补充第一句');
  const later = { mine: true, text: '请求期间继续说' };
  f.session.thread.push(later);
  release({ choices: [{ message: { content: '回应已经发送的前两句' } }] });
  assert.equal(await pending, true);
  assert.equal(f.session.thread.length, 4);
  assert.equal(f.session.thread[2].text, '回应已经发送的前两句');
  assert.equal(f.session.thread[3], later);
});

test('receiving an incoming call opening preserves user messages sent during generation', async () => {
  let release;
  const f = fixture({ respond: () => new Promise(resolve => { release = resolve; }) });
  f.context.document = { querySelectorAll: () => [] };
  f.session.thread.length = 0;
  const pending = f.context.requestIncomingVideoOpening(f.session);
  const message = { mine: true, text: '接通时先说一句' };
  f.session.thread.push(message);
  release({ choices: [{ message: { content: '角色先说的话' } }] });
  assert.equal(await pending, true);
  assert.equal(f.session.thread[0].text, '角色先说的话');
  assert.equal(f.session.thread[1], message);
});

test('role hangup saves the final words and caller identity without displaying a control marker', async () => {
  for (const content of ['我先去忙了，晚点聊。\n[[IRIS_CALL_END]]', '[[IRIS_CALL_END]]']) {
    const f = fixture({ respond: async () => ({ choices: [{ message: { content } }] }) });
    let stopped = false;
    f.context.closeVideoCall = () => { stopped = true; f.context.videoCallActive = false; f.context.videoCallSession = null; };
    f.context.videoCallDuration = () => '00:03';
    f.context.save = () => {};
    f.context.createVideoCallSummary = async () => '通话回顾';
    vm.runInContext(source.slice(source.indexOf('async function finishVideoCall('), source.indexOf('let finishReflectionRead', source.indexOf('async function finishVideoCall('))), f.context);
    assert.equal(await f.context.requestVideoCallResponse(f.session), true);
    assert.equal(stopped, true);
    const record = f.context.state.messages['0-0-offline-invite-example'][0];
    assert.equal(record.endedBy, 'role');
    assert.equal(record.callStatus, 'ended');
    assert.ok(record.thread.every(message => !message.text.includes('IRIS_CALL_END')));
    assert.equal(f.notices.length, 0);
  }
});

test('ordinary goodbye text and quoted control text do not accidentally hang up', () => {
  const f = fixture();
  assert.equal(f.context.parseVideoCallControl('我先挂了').endCall, false);
  assert.equal(f.context.parseVideoCallControl('这个 [[IRIS_CALL_END]] 是什么意思？').endCall, false);
});

test('an incoming call opens with a real video API reply and no fabricated user message in the transcript', async () => {
  const f = fixture({ offline: false });
  f.session.thread.length = 0;
  f.session.incomingMessage = { id: 'incoming-test' };
  const buttons = [{ disabled: false }, { disabled: false }];
  f.context.document = { querySelectorAll: () => buttons };
  assert.equal(await f.context.requestIncomingVideoOpening(f.session), true);
  assert.equal(f.requests.length, 1);
  assert.equal(f.requests[0].feature, 'videoCall');
  assert.match(f.requests[0].recent[0].content, /对方刚接听/);
  assert.equal(f.session.thread.length, 1);
  assert.equal(f.session.thread[0].mine, false);
  assert.equal(f.session.openingPending, false);
  assert.ok(buttons.every(button => !button.disabled));
});

test('late incoming opening replies after hangup are discarded and failed openings can be retried', async () => {
  let release;
  const f = fixture({ respond: () => new Promise(resolve => { release = resolve; }) });
  f.context.document = { querySelectorAll: () => [] };
  f.session.thread.length = 0;
  const pending = f.context.requestIncomingVideoOpening(f.session);
  f.context.videoCallActive = false;
  release({ choices: [{ message: { content: '迟到的开场白' } }] });
  assert.equal(await pending, false);
  assert.equal(f.session.thread.length, 0);
  const g = fixture({ respond: async (_, count) => {
    if (count === 1) throw Error('API 暂不可用');
    return { choices: [{ message: { content: '终于接通了' } }] };
  } });
  g.context.document = { querySelectorAll: () => [] };
  g.session.thread.length = 0;
  assert.equal(await g.context.requestIncomingVideoOpening(g.session), false);
  assert.equal(g.session.openingPending, false);
  assert.equal(await g.context.requestIncomingVideoOpening(g.session), true);
  assert.equal(g.session.thread[0].text, '终于接通了');
});

test('hanging up an incoming call updates its original event instead of adding a second record', async () => {
  const f = fixture({ offline: false });
  const record = { id: 'call-incoming-test', type: 'call-summary', callStatus: 'accepted' };
  f.session.incomingMessage = record;
  f.context.state.messages['0-0-chat'] = [record];
  f.context.closeVideoCall = () => { f.context.videoCallActive = false; f.context.videoCallSession = null; };
  f.context.videoCallDuration = () => '00:03';
  f.context.save = () => {};
  f.context.createVideoCallSummary = async () => '已保存的回顾';
  f.context.rememberIncomingVideoResult = () => {};
  f.context.addCallSummaryToMemory = () => {};
  vm.runInContext(source.slice(source.indexOf('async function finishVideoCall('), source.indexOf('let finishReflectionRead', source.indexOf('async function finishVideoCall('))), f.context);
  await f.context.finishVideoCall();
  assert.equal(f.context.state.messages['0-0-chat'].length, 1);
  assert.equal(f.context.state.messages['0-0-chat'][0], record);
  assert.equal(record.callStatus, 'ended');
  assert.equal(record.summary, '已保存的回顾');
});
