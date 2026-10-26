const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const forum = require('../scripts/forum-core.js');

function controllerContent() {
  return { innerHTML: '', onclick: null, onchange: null, onsubmit: null, oninput: null,
    closest: () => null, querySelector: () => null, querySelectorAll: () => [] };
}

test('migrates stable independent persona and character forum identities', () => {
  const state = { users: [{ name: '面具 A' }, { name: '面具 B' }], forums: {} };
  const characters = [{ name: '同名角色' }, { name: '同名角色' }];
  const data = forum.ensure(state, characters);
  const personaIds = state.users.map(user => user.forumPersonaId);
  const characterIds = characters.map(character => character.forumCharacterId);
  forum.ensure(state, characters);
  assert.equal(new Set(personaIds).size, 2);
  assert.equal(new Set(characterIds).size, 2);
  assert.deepEqual(state.users.map(user => user.forumPersonaId), personaIds);
  assert.deepEqual(characters.map(character => character.forumCharacterId), characterIds);
  assert.equal(data.worlds.length, 0);
});

test('initializes one permanent default forum and adds the current persona without switching an existing world', () => {
  const state = { users: [{ name: '面具 A' }, { name: '面具 B' }], forums: {} };
  const data = forum.ensure(state, []);
  const first = forum.ensureDefaultWorld(data, state.users[0]);
  assert.equal(first.created, true);
  assert.equal(first.world.name, '默认论坛');
  assert.equal(first.world.isDefault, true);
  assert.equal(data.activeWorldId, first.world.id);
  assert.equal(first.world.npcs.length > 0, true);
  assert.equal(first.world.members.some(item => item.sourcePersonaId === state.users[0].forumPersonaId), true);
  const custom = forum.createWorld(data, { name: '校园论坛' });
  const again = forum.ensureDefaultWorld(data, state.users[1]);
  assert.equal(again.created, false);
  assert.equal(data.worlds.filter(item => item.isDefault).length, 1);
  assert.equal(data.activeWorldId, custom.id);
  assert.equal(again.world.members.some(item => item.sourcePersonaId === state.users[1].forumPersonaId), true);
});

test('shortens the built-in Atuan bio in existing forum saves', () => {
  const state = { users: [], forums: { worlds: [{ id: 'default', npcs: [{ id: 'atuan', name: '阿团不加冰', bio: '喜欢城市散步和甜饮，习惯分享路边小店，语气轻松，偶尔发一张随手拍。' }] }] } };
  forum.ensure(state, []);
  assert.equal(state.forums.worlds[0].npcs[0].bio, '爱散步和甜饮，常分享街边小店与随手拍。');
});

test('protects default forum from deletion and resets its content without removing members or NPC identity', () => {
  const user = { name: '面具 A' }, state = { users: [user], messages: { private: ['keep'] }, forums: {} };
  const data = forum.ensure(state, []), { world } = forum.ensureDefaultWorld(data, user);
  const memberIds = world.members.map(item => item.actorId), npcIds = world.npcs.map(item => item.id);
  const post = forum.createPost(world, { actorId: memberIds[0], content: '需要清除' });
  forum.addComment(world, { postId: post.id, actorId: memberIds[0], content: '也需要清除' });
  forum.notify(world, 'another-actor', { actorId: memberIds[0], kind: 'test', postId: post.id, text: '通知' });
  world.follows[memberIds[0]] = ['another-actor'];
  world.bookmarks[memberIds[0]] = [post.id];
  assert.equal(forum.deleteWorld(data, world.id), false);
  assert.equal(forum.resetWorld(data, world.id), true);
  assert.equal(forum.worldById(data, world.id), world);
  assert.equal(world.posts.length, 0);
  assert.equal(world.comments.length, 0);
  assert.equal(world.notifications.length, 0);
  assert.equal(world.events.length, 0);
  assert.deepEqual(world.follows, {});
  assert.deepEqual(world.bookmarks, {});
  assert.deepEqual(world.members.map(item => item.actorId), memberIds);
  assert.deepEqual(world.npcs.map(item => item.id), npcIds);
  assert.deepEqual(state.messages, { private: ['keep'] });
});

test('shares public posts by world while keeping persona reactions and follows separate', () => {
  const state = { users: [{ name: '面具 A' }, { name: '面具 B' }], forums: {} };
  const characters = [];
  const data = forum.ensure(state, characters);
  const world = forum.createWorld(data, { name: '都市论坛', persona: state.users[0] });
  const actorA = forum.actorForPersona(state.users[0]);
  const actorB = forum.actorForPersona(state.users[1]);
  forum.addPersona(world, state.users[1]);
  const post = forum.createPost(world, { actorId: actorA, authorName: '苏茜理', content: '周末去哪儿？' });
  forum.toggleLike(post, actorB);
  forum.toggleFollow(world, actorB, actorA);
  assert.equal(world.posts[0].content, '周末去哪儿？');
  assert.deepEqual(post.likes, [actorB]);
  assert.deepEqual(world.follows[actorB], [actorA]);
  assert.equal(world.bookmarks[actorA], undefined);
  assert.equal(forum.actorForPersona(state.users[0]), actorA);
});

test('does not publish private persona or character details as a forum biography', () => {
  const state = { users: [{ name: '面具 A', details: '私人设定，不应自动公开。' }], forums: {} };
  const role = { name: '角色 A', details: '角色完整人设。' };
  const data = forum.ensure(state, [role]);
  const world = forum.createWorld(data, { name: '社区', persona: state.users[0] });
  const roleMember = forum.addCharacter(world, role, state.users[0]);
  assert.equal(world.profiles[forum.actorForPersona(state.users[0])].bio, '');
  assert.equal(world.profiles[roleMember.actorId].bio, '');
});

test('separates same character instances by source persona and keeps worlds isolated', () => {
  const state = { users: [{ name: '面具 A' }, { name: '面具 B' }], forums: {} };
  const role = { name: '陆时宴' };
  const data = forum.ensure(state, [role]);
  const one = forum.createWorld(data, { name: '世界一', persona: state.users[0] });
  const two = forum.createWorld(data, { name: '世界二', persona: state.users[1] });
  const first = forum.addCharacter(one, role, state.users[0], 'role-a-chat');
  const second = forum.addCharacter(one, role, state.users[1], 'role-b-chat');
  forum.addCharacter(two, role, state.users[1], 'role-b-chat');
  assert.notEqual(first.actorId, second.actorId);
  assert.equal(first.authorizedStorySummary, '');
  assert.equal(one.members.length, 3);
  assert.equal(two.members.length, 2);
  forum.createPost(one, { actorId: first.actorId, kind: 'character', authorName: '陆时宴', content: '公开帖子' });
  assert.equal(two.posts.length, 0);
  assert.notEqual(one.profiles[first.actorId].id, two.profiles[second.actorId].id);
});

test('enforces role posting and target-specific reply permissions', () => {
  const member = { actorId: 'character:role-a:persona-a', kind: 'character', participationMode: 'manual', permissions: { allowPosts: true, allowComments: true, allowReplyCharacters: false, allowReplyNpcs: true, allowReplyPersonas: true } };
  assert.equal(forum.canRolePost(member), true);
  assert.equal(forum.canRoleReply(member, 'persona:persona-b'), true);
  assert.equal(forum.canRoleReply(member, 'npc:npc-1'), true);
  assert.equal(forum.canRoleReply(member, 'character:role-b:persona-b'), false);
  assert.equal(forum.canRoleReply(member, member.actorId), false);
  member.permissions.allowPosts = false;
  member.permissions.allowComments = false;
  assert.equal(forum.canRolePost(member), false);
  assert.equal(forum.canRoleReply(member, 'persona:persona-b'), false);
  member.participationMode = 'off';
  assert.equal(forum.canRolePost(member), false);
  assert.equal(forum.canRoleReply(member, 'npc:npc-1'), false);
});

test('shares only same-world forum activity the bound role created or was notified about', () => {
  const users = [{ name: '面具 A' }, { name: '面具 B' }], character = { name: '陆时宴', chatSettings: { userIndex: 0 } };
  const state = { users, user: 0, forums: {} }, data = forum.ensure(state, [character]);
  const worldA = forum.createWorld(data, { name: '世界 A', persona: users[0] }), worldB = forum.createWorld(data, { name: '世界 B' });
  const roleA = forum.addCharacter(worldA, character, users[0]), roleB = forum.addCharacter(worldA, character, users[1]);
  roleA.permissions.allowChatContext = true;
  const own = forum.createPost(worldA, { actorId: roleA.actorId, kind: 'character', content: '我公开发过的话' });
  const otherRolePost = forum.createPost(worldA, { actorId: roleB.actorId, kind: 'character', content: '角色 B 的活动' });
  forum.createPost(worldB, { actorId: roleA.actorId, kind: 'character', content: '另一个世界的活动' });
  data.activeWorldId=worldB.id;
  assert.match(forum.chatContext(state, character, users[0]), /我公开发过的话/);
  assert.doesNotMatch(forum.chatContext(state, character, users[0]), /角色 B 的活动|另一个世界的活动/);
  forum.notify(worldA, roleA.actorId, { actorId: roleB.actorId, kind: 'mention', postId: otherRolePost.id, text: '被提及' });
  assert.match(forum.chatContext(state, character, users[0]), /我公开发过的话/);
  assert.match(forum.chatContext(state, character, users[0]), /角色 B 的活动/);
});

test('persists nested discussion and safely deletes only the selected forum world', () => {
  const persona = { name: '面具 A' }, role = { name: '角色 A' };
  const state = { users: [persona], characters: [role], messages: { '0-0-chat': [{ text: 'private' }] }, forums: {} };
  const data = forum.ensure(state, state.characters);
  const world = forum.createWorld(data, { name: '测试世界', persona });
  const post = forum.createPost(world, { actorId: forum.actorForPersona(persona), content: '讨论' });
  const first = forum.addComment(world, { postId: post.id, actorId: forum.actorForPersona(persona), content: '第一层' });
  const second = forum.addComment(world, { postId: post.id, actorId: forum.actorForPersona(persona), content: '第二层', parentId: first.id });
  assert.equal(second.parentId, first.id);
  const other = forum.createWorld(data, { name: '保留世界' });
  assert.equal(forum.deleteWorld(data, world.id), true);
  assert.equal(forum.worldById(data, world.id), null);
  assert.equal(forum.activeWorld(data).id, other.id);
  assert.deepEqual(state.users, [persona]);
  assert.deepEqual(state.characters, [role]);
  assert.equal(state.messages['0-0-chat'][0].text, 'private');
});

test('wires the forum entry to local state and its dedicated API route', () => {
  const bootstrap = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'storage-bootstrap.js'), 'utf8');
  const app = fs.readFileSync(path.join(__dirname, '..', 'scripts/app.js'), 'utf8');
  const moduleSource = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'forum.js'), 'utf8');
  const coreSource = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'forum-core.js'), 'utf8');
  assert.ok(bootstrap.indexOf("'scripts/forum-core.js'") < bootstrap.indexOf("'scripts/app.js'"));
  assert.ok(bootstrap.indexOf("'scripts/app.js'") < bootstrap.indexOf("'scripts/forum.js'"));
  assert.match(app, /window\.IrisForum\?\.render/);
  assert.match(app, /apiConfigForFeature\('forum'\).*requestConfiguredChatCompletion/);
  assert.match(app, /apiConfigForFeature\('market'\).*requestConfiguredChatCompletion/);
  assert.match(app, /\['forum','论坛'\].*\['market','商场'\]/);
  assert.match(app, /IrisForumCore\?\.chatContext\?\.\(state,character,bound\)/);
  assert.match(app, /forumContext=ifContext\?'':window\.IrisForumCore\?\.chatContext\?\.\(state,character,user\)/);
  assert.match(moduleSource, /allowStoryContext/);
  assert.match(moduleSource, /sourcePersonaId/);
  assert.match(moduleSource, /roleMember\.permissions\?\.allowStoryContext===true/);
  assert.match(moduleSource, /roleMember\.authorizedStorySummary/);
  assert.doesNotMatch(moduleSource, /runtime\.state\.messages\[sourceKey\]/);
  assert.match(moduleSource, /role-new-post/);
  assert.match(moduleSource, /forum-member-participation/);
  assert.match(moduleSource, /data-forum-frequency-row \$\{item\.participationMode==='autonomous'\?'':'hidden'\}/);
  assert.match(moduleSource, /forum-profile-avatar-picker/);
  assert.match(moduleSource, /type="radio" name="type"/);
  assert.ok(moduleSource.indexOf('<fieldset class="forum-post-type">') < moduleSource.indexOf('class="forum-compose-content"'), 'post type should appear above the content editor');
  assert.ok(moduleSource.indexOf('class="forum-compose-image-upload"') < moduleSource.indexOf('name="topics"'), 'image upload should appear before topics');
  assert.doesNotMatch(moduleSource, /AI 角色 · 来源面具/);
  assert.match(moduleSource, /Core\.canRoleReply\(item,targetActorId\)/);
  assert.match(moduleSource, /Core\.canRolePost\(candidate\)/);
  assert.match(coreSource, /worldId:world\.id/);
});

test('runs forum controller handlers against a local non-browser DOM stub', async () => {
  const state = { users: [{ name: '面具 A', nickname: '苏茜理' }, { name: '面具 B', nickname: '林知夏' }], user: 0, messages: {}, forums: {} };
  const content = controllerContent();
  const window = { IrisForumCore: forum };
  const context = {
    window, document: { querySelector: () => null }, CSS: { escape: value => value },
    Date, Intl, Math, JSON, Set, Array, Object, String, Number, Boolean, RegExp, Promise,
    FormData: class { constructor(form) { this.form = form; } get(name) { return this.form.values?.[name] ?? null; } has(name) { return Boolean(this.form.values?.[name]); } }
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'scripts', 'forum.js'), 'utf8'), context);
  let saves = 0;
  window.IrisForum.render({ state, characters: [], content, esc: value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])), save: () => saves++, apiConfigured: false });
  const defaultWorld = forum.activeWorld(state.forums);
  assert.equal(defaultWorld.name, '默认论坛');
  assert.ok(defaultWorld.members.some(item => item.sourcePersonaId === state.users[0].forumPersonaId));
  const click = async dataset => { const target = { dataset, parentElement: null, closest: () => target }; return content.onclick({ target }); };
  await click({ forumPersona: state.users[1].forumPersonaId });
  assert.equal(forum.activeWorld(state.forums).id, defaultWorld.id);
  assert.ok(defaultWorld.members.some(item => item.sourcePersonaId === state.users[1].forumPersonaId));
  await click({ forumPersona: state.users[0].forumPersonaId });
  const submit = async (kind, values, extras = {}) => content.onsubmit({ preventDefault() {}, target: { dataset: { form: kind, ...extras }, values, elements: {}, matches: selector => selector.includes('form[data-form]') || selector.includes(`.${kind}`) } });
  await click({ forumPage: 'world-add' });
  await submit('world', { name: '现代都市', description: '城市日常', background: '现代城市' });
  const world = forum.activeWorld(state.forums);
  assert.equal(world.name, '现代都市');
  await click({ forumPage: 'compose' });
  await submit('post', { content: '周末想去看展', type: 'text', topics: '周末 展览' });
  const post = world.posts[0];
  assert.equal(post.content, '周末想去看展');
  await submit('forum-comment-form', { content: '我也想去' }, { postId: post.id });
  assert.equal(world.comments[0].content, '我也想去');
  assert.equal(post.commentsCount, 1);
  await click({ forumAction: 'like', postId: post.id });
  assert.deepEqual(post.likes, [forum.actorForPersona(state.users[0])]);
  assert.ok(saves >= 4);
});

test('keeps role reply requests bound to one character and commits only validated reply text', async () => {
  const users = [{ name: '面具 A', nickname: '苏茜理' }, { name: '面具 B', nickname: '林知夏' }];
  const character = { name: '陆时宴', details: '角色人设', chatSettings: { userIndex: 0 } };
  const otherCharacter = { name: '另一角色', details: '不应进入陆时宴的独立请求', chatSettings: { userIndex: 1 } };
  const state = { users, user: 0, messages: { '0-0-chat': [{ mine: true, text: '其他面具的私人秘密' }] }, forums: {} };
  const content = controllerContent();
  const window = { IrisForumCore: forum };
  let sentPrompt = '';
  const context = {
    window, document: { querySelector: () => null }, CSS: { escape: value => value },
    Date, Intl, Math, JSON, Set, Array, Object, String, Number, Boolean, RegExp, Promise,
    FormData: class { constructor(form) { this.form = form; } get(name) { return this.form.values?.[name] ?? null; } has(name) { return Boolean(this.form.values?.[name]); } }
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'scripts', 'forum.js'), 'utf8'), context);
  window.IrisForum.render({ state, characters: [character, otherCharacter], content, esc: value => String(value), save() {}, apiConfigured: false, request: async prompt => { sentPrompt = prompt; return { choices: [{ message: { content: JSON.stringify({ content: '我也正想问这个。' }) } }] }; } });
  const click = async (dataset, parentElement) => { const target = { dataset, parentElement, closest: () => target }; return content.onclick({ target }); };
  const submit = async (kind, values, extras = {}) => content.onsubmit({ preventDefault() {}, target: { dataset: { form: kind, ...extras }, values, elements: {}, matches: selector => selector.includes('form[data-form]') || selector.includes(`.${kind}`) } });
  await click({ forumPage: 'world-add' });
  await submit('world', { name: '都市论坛' });
  await click({ forumPage: 'members' });
  await click({ memberRoleToggle: JSON.stringify([character.forumCharacterId, users[0].forumPersonaId]) });
  await click({ forumAction: 'add-selected-roles' });
  await click({ forumPage: 'compose' });
  await submit('post', { content: '最近有什么值得看的展览？', type: 'text', topics: '' });
  const post = forum.activeWorld(state.forums).posts[0];
  await click({ forumOpenPost: post.id });
  const role = forum.activeWorld(state.forums).members.find(item => item.kind === 'character');
  await click({ forumAction: 'ask-role-post', postId: post.id }, { querySelector: () => ({ value: role.actorId }) });
  assert.equal(forum.activeWorld(state.forums).comments[0].actorId, role.actorId);
  assert.equal(forum.activeWorld(state.forums).comments[0].content, '我也正想问这个。');
  assert.match(sentPrompt, /当前发言角色：陆时宴/);
  assert.doesNotMatch(sentPrompt, /其他面具的私人秘密/);
  assert.doesNotMatch(sentPrompt, /不应进入陆时宴的独立请求/);
});
