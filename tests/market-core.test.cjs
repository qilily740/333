const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const context = { window: {}, Date, Math, Intl, Error, JSON, Number, String, Array, Object };
vm.runInNewContext(fs.readFileSync(require.resolve('../scripts/market-core.js'), 'utf8'), context);
const C = context.window.IrisMarketCore;
const state = { users: [{ name: '面具甲' }, { name: '面具乙' }], characters: [{ name: '周树生' }], char: 0, user: 0 };
C.normalize(state);
const initialBalance = C.persona(state, 0).wallet.balanceCents;

const product = C.product(state, 'p-digital-headphone');
assert.ok(product.specs.length>=3);
const specCounts=JSON.stringify(state.market.products.map(item=>[item.id,item.specs.length]));
C.normalize(state);
assert.equal(JSON.stringify(state.market.products.map(item=>[item.id,item.specs.length])),specCounts,'catalog upgrades must not duplicate specifications');
assert.equal(C.linePrice(C.product(state,'p-record-jazz'),'cd'),8800);
for (const productId of ['p-drink-milk-tea', 'p-home-lamp']) {
  const summary = C.shippingSummary(C.product(state, productId));
  assert.match(summary, /16:00 前下单当日发货/);
  assert.match(summary, /16:00 后下单次日发货/);
  assert.match(summary, /同省隔天送达，跨省约 2–3 天/);
}
assert.doesNotMatch(C.shippingSummary({category:'书籍',shipping:'虚拟世界配送'}),/虚拟/);
assert.match(C.shippingSummary({category:'书籍',shipping:'普通快递配送'}),/同省隔天送达，跨省约 2–3 天/);
assert.equal(product.priceCents, 49900);
assert.equal(C.yuan(C.cents('2680.25')), '2680.25');
const knit = C.product(state, 'p-coat-knit');
assert.equal(C.linePrice(knit, 'M'), 56800);
assert.equal(C.linePrice(knit, 'L'), 62800);
C.addCart(state, product.id, 'default', 2, 0);
assert.equal(C.cartTotal(state, 0), 99800);
assert.equal(C.cartTotal(state, 1), 0);

const persona0 = C.persona(state, 0);
persona0.addresses.push({ id: 'addr-1', name: '甲', label: '虚拟城市 / 家中', isDefault: true });
const order = C.createOrder(state, { userIndex: 0, kind: 'self', addressId: 'addr-1' });
assert.equal(order.status, '待发货');
assert.equal(order.totalCents, 99800);
assert.equal(persona0.wallet.balanceCents, initialBalance - order.totalCents);
assert.equal(persona0.ledger.filter(x => x.kind === 'purchase').length, 1);
assert.throws(() => C.payOrder(state, 0, order), /已支付/);

const persona1 = C.persona(state, 1);
assert.equal(persona1.orders.length, 0);
assert.equal(persona1.wallet.balanceCents, initialBalance);

const timeline = order.shippingEvents;
assert.equal(timeline.length, 4);
assert.ok(timeline.every((event, i) => i === 0 || event.at > timeline[i - 1].at));
assert.throws(() => C.transition(order, '已送达'), /不能将订单/);

// Exercise the cutoff and province rules using fixed local dates rather than the test run time.
for (const [hour, minute, dispatchDay] of [[15, 59, 15], [16, 0, 16], [20, 0, 16]]) {
  const now = new Date(2026, 9, 15, hour, minute).getTime();
  const shippingOrder = { id: 'same-province', kind: 'self', address: { label: '杭州市西湖区' },
    items: [{ productId: 'p-home-mug' }], shippingEvents: [] };
  C.schedule(state, shippingOrder, now);
  const events = shippingOrder.shippingEvents;
  assert.equal(events[1].at, new Date(2026, 9, dispatchDay, 16).getTime(), '16:00 is the dispatch cutoff');
  assert.equal(events[3].at, new Date(2026, 9, dispatchDay + 1, 16).getTime(), 'same-province shipments arrive the next day');
  assert.ok(events.every((event, i) => i === 0 || event.at > events[i - 1].at));
  const savedEvents = JSON.stringify(events);
  C.schedule(state, shippingOrder, now + 86400000);
  assert.equal(JSON.stringify(shippingOrder.shippingEvents), savedEvents, 'reopening must not reschedule an order');
}
const crossProvinceDays = new Set();
for (const orderId of ['cross-a', 'cross-b']) {
  const shippingOrder = { id: orderId, kind: 'self', address: { label: '北京市朝阳区' },
    items: [{ productId: 'p-home-mug' }], shippingEvents: [] };
  C.schedule(state, shippingOrder, new Date(2026, 9, 15, 10).getTime());
  crossProvinceDays.add((shippingOrder.shippingEvents[3].at - shippingOrder.shippingEvents[1].at) / 86400000);
}
assert.deepEqual(crossProvinceDays, new Set([2, 3]), 'cross-province deliveries use two or three days');

const returned = C.refund(state, 0, order.id);
assert.equal(returned.status, '已退款');
assert.equal(persona0.wallet.balanceCents, initialBalance);
assert.equal(persona0.ledger.filter(x => x.kind === 'refund').length, 1);
assert.throws(() => C.refund(state, 0, order.id), /不能申请退款/);

const role = state.characters[0];
persona0.roleWallets[role.irisMarketId] = { roleId: role.irisMarketId, currency: 'CNY', balanceCents: 100000, ledger: [] };
const roleGift = C.createOrder(state, {
  userIndex: 0,
  items: [{ productId: 'p-flower-rose', specId: 'default', quantity: 1 }],
  kind: 'role-gift',
  characterIndex: 0,
  pay: 'role-funded',
  paidByCharacterId: state.characters[0].irisMarketId
});
assert.equal(roleGift.status, '待发货');
assert.equal(persona0.wallet.balanceCents, initialBalance);
assert.equal(C.roleWallet(state, role.irisMarketId, 0).balanceCents, 87200);
assert.equal(C.roleWallet(state, role.irisMarketId, 0).ledger[0].amountCents, -12800);
C.advance(state, 0, roleGift.shippingEvents.at(-1).at + 1);
assert.equal(roleGift.status, '已送达');
assert.equal(persona0.ownedItems.at(-1).source, 'role-gift');

const rolePurchase = C.createOrder(state, {
  userIndex: 0,
  items: [{ productId: 'p-book-poetry', specId: 'default', quantity: 1 }],
  kind: 'role-purchase',
  characterIndex: 0,
  pay: 'role-funded',
  paidByCharacterId: state.characters[0].irisMarketId
});
C.advance(state, 0, rolePurchase.shippingEvents.at(-1).at + 1);
assert.equal(persona0.characterItems.at(-1).source, 'character-purchase');
assert.equal(C.roleWallet(state, role.irisMarketId, 0).balanceCents, 82000);
assert.equal(persona1.characterItems.length, 0);
assert.equal(persona0.ledger.filter(x => x.orderId === roleGift.id || x.orderId === rolePurchase.id).length, 0);
assert.equal(C.refund(state, 0, rolePurchase.id).status, '已退款');
assert.equal(C.roleWallet(state, role.irisMarketId, 0).balanceCents, 87200);
assert.equal(C.roleWallet(state, role.irisMarketId, 0).ledger[0].amountCents, 5200);

state.characters.push({ name: '未设定资金角色', irisMarketId: 'role-no-funds' });
assert.throws(() => C.createOrder(state, {
  userIndex: 0,
  items: [{ productId: 'p-home-mug', specId: 'default', quantity: 1 }],
  kind: 'role-purchase',
  characterIndex: 1,
  pay: 'role-funded',
  paidByCharacterId: 'role-no-funds'
}), /余额未设定/);

const first = C.saveGenerated(state, { name: '周年纪念手工礼盒', category: '礼盒', shop: '一封礼物', price: 368, description: '一份虚拟礼物。' }, '周年礼物');
const reused = C.saveGenerated(state, { name: '不应替换', category: '礼盒', price: 8 }, '周年礼物');
assert.equal(reused.id, first.id);
assert.equal(reused.name, '周年纪念手工礼盒');

// Character wallets are scoped to both the active persona and stable role instance ID.
persona0.roleWallets[role.irisMarketId] = { roleId: role.irisMarketId, currency: 'CNY', balanceCents: 50000, ledger: [] };
const roleWallet0 = C.roleWallet(state, role.irisMarketId, 0);
const roleWallet1 = C.roleWallet(state, role.irisMarketId, 1);
assert.equal(roleWallet0.balanceCents, 50000);
assert.equal(roleWallet1.balanceCents, null);
roleWallet0.ledger.push({ id: 'income-1', kind: 'income', amountCents: 1200, createdAt: 10, description: '收入记录' });
const roleOrder = C.createOrder(state, {
  userIndex: 0,
  items: [{ productId: 'p-home-mug', specId: 'default', quantity: 1 }],
  kind: 'role-pay',
  characterIndex: 0,
  pay: 'pending-role'
});
roleOrder.status = '待支付';
C.payRoleOrder(state, 0, roleOrder, role.irisMarketId);
assert.equal(roleWallet0.balanceCents, 42400);
assert.equal(roleWallet0.ledger[0].amountCents, -7600);
assert.equal(roleWallet0.ledger[1].amountCents, 1200);
assert.equal(roleWallet0.ledger.filter(row => row.orderId === roleOrder.id).length, 1);
assert.throws(() => C.payRoleOrder(state, 0, roleOrder, role.irisMarketId), /不能重复代付/);
C.refundRoleOrder(state, 0, roleOrder);
assert.equal(roleWallet0.balanceCents, 50000);
assert.equal(roleWallet0.ledger[0].amountCents, 7600);
assert.throws(() => C.refundRoleOrder(state, 0, roleOrder), /状态无效/);

const unknownRole = { name: '同名角色', irisMarketId: 'role-unknown' };
state.characters.push(unknownRole);
assert.equal(C.roleWallet(state, unknownRole.irisMarketId, 0).balanceCents, null);
const unknownOrder = C.createOrder(state, {
  userIndex: 0,
  items: [{ productId: 'p-home-mug', specId: 'default', quantity: 1 }],
  kind: 'role-pay',
  characterIndex: 2,
  pay: 'pending-role'
});
unknownOrder.status = '待支付';
assert.throws(() => C.payRoleOrder(state, 0, unknownOrder, unknownRole.irisMarketId), /余额未设定/);
assert.equal(unknownOrder.status, '待支付');
assert.equal(C.roleWallet(state, unknownRole.irisMarketId, 0).ledger.length, 0);
const reloaded = JSON.parse(JSON.stringify(state));
C.normalize(reloaded);
assert.equal(C.roleWallet(reloaded, role.irisMarketId, 0).balanceCents, 50000);
assert.equal(C.roleWallet(reloaded, role.irisMarketId, 1).balanceCents, null);
// Generated history reconciles to the saved current balance and never creates debt.
const historyState={users:[{name:'账本面具'}],characters:[{name:'账本角色'}],user:0,char:0};
C.normalize(historyState);
const historyRoleId=historyState.characters[0].irisMarketId;
const metadata={currency:'CNY',bankName:'虚拟银行',accountStyle:'numeric'};
assert.throws(()=>C.initializeRoleWallet(historyState,0,historyRoleId,{...metadata,balance:20,transactions:[
  {kind:'expense',amount:100,description:'设备',daysAgo:2},
  {kind:'income',amount:100,description:'薪资',daysAgo:1}
]}),/负余额/);
assert.equal(C.roleWallet(historyState,historyRoleId,0).balanceCents,null);
assert.equal(C.roleWallet(historyState,historyRoleId,0).ledger.length,0);
const historyWallet=C.initializeRoleWallet(historyState,0,historyRoleId,{...metadata,balance:120,transactions:[
  {kind:'income',amount:100,description:'薪资',daysAgo:2},
  {kind:'expense',amount:30,description:'书籍',daysAgo:1}
]});
assert.equal(historyWallet.ledger.reduce((sum,row)=>sum+row.amountCents,0),12000);
assert.equal(historyWallet.ledger[0].amountCents,-3000);
assert.equal(historyWallet.ledger[1].amountCents,10000);
assert.ok(historyWallet.ledger[0].createdAt>historyWallet.ledger[1].createdAt);
assert.match(historyWallet.accountNumber,/^9900[0-9]{12}$/);
assert.match(historyWallet.accountExpiry,/^[0-9]{2}\/[0-9]{2}$/);
let checksum=0;for(let i=0;i<16;i++){let n=Number(historyWallet.accountNumber[i])*(i%2===0?2:1);checksum+=n>9?n-9:n;}
assert.equal(checksum%10,0);
const savedNumber=historyWallet.accountNumber;
C.initializeRoleWallet(historyState,0,historyRoleId,{...metadata,balance:9000,transactions:[]});
assert.equal(historyWallet.balanceCents,12000);
assert.equal(historyWallet.accountNumber,savedNumber);
assert.equal(historyWallet.ledger.length,3);
// Existing opening-only AI wallets may gain history without changing their balance or card.
const legacyRoleId='legacy-wallet';historyState.characters.push({name:'旧钱包角色',irisMarketId:legacyRoleId});
C.persona(historyState,0).roleWallets[legacyRoleId]={currency:'CNY',balanceCents:50000,generatedAt:1,accountNumber:'9900000000000000',ledger:[{kind:'opening',amountCents:50000}]};
const upgraded=C.initializeRoleWallet(historyState,0,legacyRoleId,{...metadata,balance:1,transactions:[{kind:'expense',amount:10,description:'早餐',daysAgo:1}]});
assert.equal(upgraded.balanceCents,50000);
assert.equal(upgraded.accountNumber,'9900000000000000');
assert.equal(upgraded.ledger.reduce((sum,row)=>sum+row.amountCents,0),50000);
const actualLedger=JSON.stringify(roleWallet0.ledger);
C.initializeRoleWallet(state,0,role.irisMarketId,{...metadata,balance:999999,transactions:[]});
assert.equal(JSON.stringify(roleWallet0.ledger),actualLedger,'saved purchases and refunds must not be regenerated');
// Incremental refresh appends to existing funds, protects prior records, and is idempotent.
const checkedAt=Date.now(),beforeHistory=historyWallet.ledger.map(row=>row.id);
C.updateRoleWallet(historyState,0,historyRoleId,{transactions:[{eventKey:'breakfast-1',kind:'expense',amount:10,description:'早餐',secondsAgo:0}]},{requestId:'refresh-1',since:checkedAt-1000,now:checkedAt});
assert.equal(historyWallet.balanceCents,11000);
assert.deepEqual(historyWallet.ledger.slice(1).map(row=>row.id),beforeHistory);
assert.equal(historyWallet.accountNumber,savedNumber);
C.updateRoleWallet(historyState,0,historyRoleId,{transactions:[{eventKey:'unexpected',kind:'income',amount:1000,description:'错误重复收入',secondsAgo:0}]},{requestId:'refresh-1',since:checkedAt-1000,now:checkedAt});
assert.equal(historyWallet.balanceCents,11000);
C.updateRoleWallet(historyState,0,historyRoleId,{transactions:[{eventKey:'breakfast-1',kind:'expense',amount:10,description:'早餐',secondsAgo:0}]},{requestId:'refresh-2',since:checkedAt,now:checkedAt});
assert.equal(historyWallet.ledger.length,4);
assert.throws(()=>C.updateRoleWallet(historyState,0,historyRoleId,{transactions:[{eventKey:'overdraw',kind:'expense',amount:200,description:'设备',secondsAgo:0}]},{requestId:'refresh-invalid',since:checkedAt,now:checkedAt}),/余额不足/);
assert.equal(historyWallet.balanceCents,11000);
assert.equal(historyWallet.ledger.length,4);
assert.throws(()=>C.updateRoleWallet(historyState,0,historyRoleId,{transactions:[{eventKey:'old',kind:'expense',amount:1,description:'过期重复',secondsAgo:60}]},{requestId:'refresh-old',since:checkedAt,now:checkedAt}),/时间或金额范围/);
C.updateRoleWallet(historyState,0,historyRoleId,{transactions:[]},{requestId:'refresh-empty',since:checkedAt,now:checkedAt});
assert.equal(historyWallet.balanceCents,11000);
console.log('market-core: all assertions passed');

assert.equal(C.currencyForRole({details:'国籍：中国。出生地：上海。常住地：伦敦。'}),'GBP');
assert.equal(C.currencyForRole({currency:'CNY',residence:'London',nationality:'中国'}),'GBP','current residence overrides a stale default currency');
assert.equal(C.currencyForRole({country:'美国',hometown:'上海',residence:'巴黎'}),'EUR');
assert.equal(C.currencyForRole({details:'以前居住在伦敦，目前住在东京。国籍：中国。'}),'JPY');
assert.equal(C.currencyForRole({details:'Chinese citizen currently living in London.'}),'GBP');
assert.equal(C.currencyForRole({country:'美国',hometown:'上海',details:'国籍：中国。出生地：北京。'},'GBP'),'GBP','nationality and birthplace cannot override an existing wallet');
const residenceState={char:0,user:0,users:[{name:'用户'}],characters:[{name:'常住地未知',details:'国籍：中国。出生地：上海。'}]};
C.normalize(residenceState);const residenceRole=residenceState.characters[0];C.persona(residenceState,0).roleWallets[residenceRole.irisMarketId]={roleId:residenceRole.irisMarketId,currency:'GBP',balanceCents:12345,ledger:[{id:'old',amountCents:12345,currency:'GBP'}]};
assert.equal(C.requireRoleWalletCurrency(residenceState,residenceRole.irisMarketId,0).currency,'GBP');
assert.equal(C.requireRoleWalletCurrency(residenceState,residenceRole.irisMarketId,0).balanceCents,12345);

const incomeState={char:0,user:0,users:[{name:'本人'},{name:'其他面具'}],characters:[{name:'上班角色',occupation:'设计师',residence:'伦敦'}]};
C.normalize(incomeState);const incomeRole=incomeState.characters[0],incomeWallet=C.roleWallet(incomeState,incomeRole.irisMarketId,0,true);incomeWallet.balanceCents=100000;
const salary=[{key:'design-salary',description:'设计工作月薪',basis:'角色固定设计工作',currency:'GBP',amount:3000,payDay:25}];
C.setRoleIncomePlan(incomeState,0,incomeRole.irisMarketId,salary,new Date('2030-01-10T12:00:00').getTime());
assert.equal(incomeWallet.incomePlans[0].nextDue,'2030-01-25');
assert.equal(C.settleRoleIncomes(incomeState,new Date('2030-01-24T12:00:00').getTime()).length,0);
C.settleRoleIncomes(incomeState,new Date('2030-01-25T12:00:00').getTime());assert.equal(incomeWallet.balanceCents,400000);assert.equal(incomeWallet.ledger[0].kind,'personal-income');assert.equal(incomeWallet.ledger[0].currency,'GBP');
assert.equal(C.settleRoleIncomes(incomeState,new Date('2030-01-25T18:00:00').getTime()).length,0);
C.setRoleIncomePlan(incomeState,0,incomeRole.irisMarketId,salary,new Date('2030-01-25T18:00:00').getTime());assert.equal(incomeWallet.incomePlans[0].nextDue,'2030-02-25');
C.settleRoleIncomes(incomeState,new Date('2030-03-01T12:00:00').getTime());assert.equal(incomeWallet.balanceCents,700000);assert.equal(incomeWallet.ledger.length,2);
const planSnapshot=JSON.stringify(incomeWallet);assert.throws(()=>C.setRoleIncomePlan(incomeState,0,incomeRole.irisMarketId,[{...salary[0],amount:-1}],new Date('2030-03-01').getTime()),/无效/);assert.equal(JSON.stringify(incomeWallet),planSnapshot);
assert.equal(C.roleWallet(incomeState,incomeRole.irisMarketId,1).balanceCents,null,'other persona must not receive this salary');
incomeRole.occupation='已经离职';assert.equal(C.settleRoleIncomes(incomeState,new Date('2030-04-30').getTime()).length,0,'a changed job requires reviewing income rather than continuing old salary');

// Existing income schedules must survive unrelated profile edits, including old fingerprints.
{
 const s={char:0,user:0,users:[{name:'本人'}],characters:[{name:'设计师',occupation:'设计师',residence:'伦敦',details:'喜欢散步。'}]};C.normalize(s);const role=s.characters[0],wallet=C.roleWallet(s,role.irisMarketId,0,true);wallet.balanceCents=100000;
 C.setRoleIncomePlan(s,0,role.irisMarketId,[{key:'salary',description:'固定月薪',basis:'稳定设计工作',currency:'GBP',amount:3000,payDay:25}],new Date('2030-01-10T12:00').getTime());
 wallet.incomePlanProfile=JSON.stringify({details:role.details,job:'设计师',income:'',residence:'伦敦'});
 role.details+='喜欢阅读。身高一米八。';assert.equal(C.needsRoleIncomeReview(wallet,role),false);assert.equal(C.settleRoleIncomes(s,new Date('2030-01-25T12:00').getTime()).length,1);assert.equal(wallet.balanceCents,400000);
 role.occupation='已经离职';assert.equal(C.needsRoleIncomeReview(wallet,role),true);assert.equal(C.settleRoleIncomes(s,new Date('2030-02-25T12:00').getTime()).length,0);assert.equal(wallet.balanceCents,400000);
}
