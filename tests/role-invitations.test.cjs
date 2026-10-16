const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const invitations = require('../scripts/role-invitations.js');

test('requires a structured, explicit invitation intent and bounds untrusted fields', () => {
  assert.equal(invitations.normalizeProposal(null), null);
  assert.equal(invitations.normalizeProposal({ timeText: '明晚' }), null);
  const invite = invitations.normalizeProposal({
    intent: '一起去看展', timeText: '周六下午', placeText: '美术馆', startsAt: '2026-10-17T15:00:00+08:00',
    html: '<script>bad()</script>',
  });
  assert.deepEqual(invite, {
    intent: '一起去看展', timeText: '周六下午', placeText: '美术馆',
    startsAt: '2026-10-17T07:00:00.000Z', timePending: false, updateId: '', cancelled: false,
  });
  assert.equal(invitations.normalizeProposal({ intent: '约一下', startsAt: '明天晚上' }).startsAt, '');
  assert.equal(invitations.normalizeProposal({ updateId: 'invite-1', cancelled: true }).cancelled, true);
  assert.equal(invitations.normalizeProposal({ intent: 'x'.repeat(400) }).intent.length, 240);
});

test('invitation transitions permit retry after failure and prevent duplicate creation', () => {
  const invite = { status: 'pending' };
  assert.equal(invitations.transition(invite, 'accepted'), true);
  assert.equal(invitations.transition(invite, 'accepted'), false);
  assert.equal(invitations.transition(invite, 'generating'), true);
  assert.equal(invitations.transition(invite, 'generation_failed'), true);
  assert.equal(invitations.transition(invite, 'generating'), true);
  assert.equal(invitations.transition(invite, 'created'), true);
  assert.equal(invitations.transition(invite, 'generating'), false);
});

test('requires both confirmed time and place and recognizes expired absolute times', () => {
  assert.equal(invitations.isReady({ timeText: '周六', placeText: '' }), false);
  assert.equal(invitations.isReady({ timeText: '周六', placeText: '美术馆', timePending: true }), false);
  assert.equal(invitations.isReady({ timeText: '待定', placeText: '美术馆' }), false);
  assert.equal(invitations.isReady({ timeText: '明天晚上', placeText: '美术馆' }), false);
  assert.equal(invitations.isReady({ timeText: '2026年10月17日15:00', placeText: '美术馆', startsAt: '2026-10-17T15:00:00+08:00' }), true);
  assert.equal(invitations.isExpired({ startsAt: '2026-10-12T10:00:00+08:00' }, Date.parse('2026-10-13T00:00:00+08:00')), true);
  assert.equal(invitations.isExpired({ startsAt: '' }, Date.now()), false);
});

test('app wires structured online invitations to a separate offline request and persisted thread', () => {
  const app = fs.readFileSync(path.join(__dirname, '..', 'scripts/app.js'), 'utf8');
  const bootstrap = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'storage-bootstrap.js'), 'utf8');
  assert.match(bootstrap, /'scripts\/role-invitations\.js'.*'scripts\/app\.js'/s);
  assert.match(app, /payload\.invitation/);
  assert.match(app, /saveInviteProposal\(listReply,requestThreadKey/);
  assert.match(app, /sendOnlineMessage\(\{feature:'offlineStory'/);
  assert.match(app, /activeOfflineThreads\[pairKey\(invite\.characterIndex,userIndex\)\]/);
  assert.match(app, /data-invitation-action="accept"/);
  assert.match(app, /状态.*generation_failed|invite\.status='generation_failed'/);
});
