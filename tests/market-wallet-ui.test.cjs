const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const context = { window: {}, Date, Math, Intl, Error, JSON, Number, String, Array, Object, setTimeout, FormData: class { get(){return '羊毛礼物';} } };
vm.runInNewContext(fs.readFileSync(require.resolve('../scripts/market-core.js'), 'utf8'), context);
vm.runInNewContext(fs.readFileSync(require.resolve('../scripts/market.js'), 'utf8'), context);
const C = context.window.IrisMarketCore;
const state = {
  users: [{ name: '面具甲' }, { name: '面具乙' }],
  characters: [{ name: '同名角色', chatSettings: { userIndex: 0 } }, { name: '同名角色', chatSettings: { userIndex: 0 } }],
  char: 0,
  user: 0
};
C.normalize(state);
C.addCart(state, 'p-home-mug');
C.persona(state, 0).addresses.push({ id: 'addr', name: '玩家', label: '虚拟住处', isDefault: true });
let selectedRoleIndex = 0;
let saves = 0;
let apiCalls = 0;
let fxCalls = 0;
const prompts=[];
let apiFailure = false;
const searchResponse = () => JSON.stringify({products: [
  {name:'羊毛手作礼盒',category:'礼盒',shop:'手作礼物铺',brand:'手作礼物铺',price:128,description:'适合作为日常礼物。',colors:['暖白'],specName:'规格',spec:'标准礼盒',material:'羊毛与纸材',reviews:[{author:'买家甲',rating:4,text:'包装完整，手感柔软。'}]},
  {name:'羊毛钥匙挂件',category:'礼盒',shop:'手作礼物铺',brand:'手作礼物铺',price:38,description:'小巧的羊毛挂件。',colors:['浅灰'],specName:'规格',spec:'单只',material:'羊毛',reviews:[{author:'买家乙',rating:3,text:'尺寸比预期稍小。'}]}
]});
const subtitle = { textContent: '' };
const horizontalNodes={'.market-category-pills':{scrollLeft:0},'.market-categories':{scrollLeft:0},'.market-role-picker':{scrollLeft:0}};
const content = {
  scrollTop: 0,
  innerHTML: '',
  querySelector(selector) {
    if (selector === '#marketPayRole') return { value: selectedRoleIndex };
    if (horizontalNodes[selector]) return horizontalNodes[selector];
    return null;
  }
};
let markup='';
Object.defineProperty(content,'innerHTML',{get:()=>markup,set:value=>{markup=value;content.scrollTop=0;Object.values(horizontalNodes).forEach(node=>node.scrollLeft=0);}});
context.window.IrisMarket.render({
  state,
  characters: state.characters,
  content,
  title: { querySelector: selector => selector === '.market-page-subtitle' ? subtitle : null },
  esc: value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])),
  save: () => { saves += 1; },
  exchangeRateToCny: async code => {fxCalls+=1;assert.equal(code,'USD');return {rate:7.2,date:'2026-10-14'};},
  request: async prompt => { prompts.push(prompt);apiCalls += 1; if(apiFailure)throw Error('钱包 API 失败');if(prompt.includes('搜索需求：'))return searchResponse();if(prompt.includes('仅返回本次检查区间'))return JSON.stringify({transactions:[]}); return JSON.stringify({balance:8520,currency:'CNY',bankName:'虚拟城市银行',accountStyle:'numeric',transactions:[{kind:'expense',amount:22,description:'奶茶',daysAgo:0},{kind:'expense',amount:168,description:'工作用品',daysAgo:1},{kind:'income',amount:4000,description:'工作收入',daysAgo:5}]}); }
});
assert.match(content.innerHTML, /market-product-art/);
assert.match(content.innerHTML, /<svg viewBox="0 0 24 24" aria-hidden="true">/);
assert.doesNotMatch(content.innerHTML, /把喜欢的|寄进生活里|CURATED FOR YOU/);
assert.match(content.innerHTML, /class="market-nav"/);
assert.match(content.innerHTML, /class="market-nav-capsule"/);
assert.match(content.innerHTML, /class="market-dock-my/);
assert.equal(subtitle.textContent, '首页');

async function click(dataset) {
  const button = { dataset };
  content.onclick({ target: { closest: selector => selector === 'button' ? button : null } });
  await new Promise(resolve => setImmediate(resolve));
}

(async () => {
  await click({ mPage: 'category' });
  assert.match(content.innerHTML, /class="market-nav"/);
  assert.match(content.innerHTML, /class="market-nav-capsule"/);
  assert.equal(subtitle.textContent, '分类');
  content.scrollTop=240;horizontalNodes['.market-category-pills'].scrollLeft=90;
  await click({mCategory:'服装'});
  assert.equal(content.scrollTop,240,'category updates must preserve page scroll');
  assert.equal(horizontalNodes['.market-category-pills'].scrollLeft,90,'category updates must preserve horizontal scroll');
  assert.doesNotMatch(content.innerHTML,/>‹<\/button>/);
  await click({ mPage: 'orders' });
  assert.match(content.innerHTML, /class="market-dock-my/);
  assert.equal(subtitle.textContent, '订单');
  await click({ mPage: 'mine' });
  assert.match(content.innerHTML, /class="market-nav"/);
  assert.equal(subtitle.textContent, '我的');
  await click({mPage:'category'});
  assert.equal(content.scrollTop,240,'returning to a page must restore its position');
  await click({ mPage: 'cart' });
  await click({ mCheckout: '' });
  assert.match(content.innerHTML, /找角色代付/);
  assert.equal(subtitle.textContent, '确认订单');
  assert.match(content.innerHTML, /class="market-nav-capsule"/);
  assert.match(content.innerHTML, /aria-expanded="false"/);
  assert.match(content.innerHTML, /aria-hidden="true"/);
  assert.match(content.innerHTML, /余额未设定/);
  const p = C.persona(state, 0);
  const overdueOrder = { id: 'local-order', items: [], totalCents: 0, status: '待发货', shippingEvents: [{ status: '运输途中', at: Date.now() - 1000 }] };
  p.orders.push(overdueOrder);
  const savesBeforePeek = saves;
  content.scrollTop=400;horizontalNodes['.market-role-picker'].scrollLeft=64;
  await click({ mWalletToggle: '' });
  assert.match(content.innerHTML, /aria-expanded="true"/);
  assert.match(content.innerHTML, /market-role-wallet is-open/);
  assert.equal(content.scrollTop,400,'opening and loading a wallet must preserve scroll');
  assert.equal(horizontalNodes['.market-role-picker'].scrollLeft,64);
  assert.match(content.innerHTML,/experience-content-label/);
  assert.doesNotMatch(content.innerHTML,/>‹<\/button>/);
  assert.equal(overdueOrder.status, '待发货', 'opening the wallet must not advance logistics');
  assert.equal(saves, savesBeforePeek + 1, 'first generation must save once');
  assert.equal(C.roleWallet(state,state.characters[0].irisMarketId,0).balanceCents,852000);
  assert.equal(C.roleWallet(state,state.characters[0].irisMarketId,0).ledger.length,4);
  assert.equal(apiCalls,1);
  const generated=C.roleWallet(state,state.characters[0].irisMarketId,0);
  assert.equal(generated.ledger.reduce((sum,row)=>sum+row.amountCents,0),generated.balanceCents);
  assert.ok(generated.ledger.some(row=>row.amountCents<0));
  assert.match(content.innerHTML,/工作用品/);
  await click({ mWalletToggle: '' });
  assert.match(content.innerHTML, /aria-expanded="true"/,'refreshing an existing wallet must keep its details visible');
  assert.equal(apiCalls,2,'the wallet button refreshes an existing wallet instead of hiding it');
  selectedRoleIndex = 1;
  await click({mPickRole:'1'});
  assert.match(content.innerHTML, /同名角色的私人钱包/);
  assert.match(content.innerHTML, /aria-expanded="false"/);
  assert.equal(apiCalls, 2);
  assert.equal(C.roleWallet(state,state.characters[1].irisMarketId,0).balanceCents,null);
  assert.equal(C.roleWallet(state,state.characters[0].irisMarketId,1).balanceCents,null);
  await click({mPickRole:'0'});
  assert.match(content.innerHTML,/aria-expanded="true"/,'switching back must restore the first role wallet');
  assert.match(content.innerHTML,/¥8,520\.00/,'each role must keep its own saved wallet balance');
  assert.equal(apiCalls,2,'switching roles must not request wallet data');
  await click({mPickRole:'1'});
  apiFailure = true;
  await click({mWalletToggle:''});
  assert.equal(C.roleWallet(state,state.characters[1].irisMarketId,0).balanceCents,null);
  assert.equal(C.roleWallet(state,state.characters[1].irisMarketId,0).ledger.length,0);
  assert.equal(apiCalls,3);
  await click({mWalletToggle:''});
  apiFailure = false;
  await click({mWalletToggle:''});
  assert.equal(apiCalls,5);
  const wallet = C.roleWallet(state,state.characters[1].irisMarketId,0);
  const number = wallet.accountNumber;
  C.initializeRoleWallet(state,0,state.characters[1].irisMarketId,{balance:1,currency:'CNY',bankName:'另一个银行',accountStyle:'numeric'});
  assert.equal(wallet.balanceCents,852000);
  assert.equal(wallet.ledger.length,4);
  assert.equal(wallet.accountNumber,number);
  assert.equal(state.messages,undefined,'wallet API must not create chat messages');
  const restored=JSON.parse(JSON.stringify(state));
  assert.equal(C.roleWallet(restored,restored.characters[1].irisMarketId,0).accountNumber,number);
  await click({mWalletToggle:''});
  wallet.currency='USD';
  state.messages={'1-0-chat':[{text:'当前角色线上行动',mine:false}],'1-0-offline':[{text:'当前角色线下行动',mine:false}],'0-0-chat':[{text:'其他角色私人信息'}],'1-1-chat':[{text:'其他面具私人信息'}]};
  const savedMessages=JSON.stringify(state.messages);
  await click({mWalletToggle:''});
  assert.equal(fxCalls,1);
  assert.match(prompts.at(-1),/当前角色线上行动/);
  assert.match(prompts.at(-1),/当前角色线下行动/);
  assert.doesNotMatch(prompts.at(-1),/其他角色私人信息|其他面具私人信息/);
  assert.equal(JSON.stringify(state.messages),savedMessages);
  assert.equal(apiCalls,7,'each refresh requests one incremental wallet update');
  assert.match(content.innerHTML,/≈ ¥61,344.00 人民币/);
  assert.equal(wallet.balanceCents,852000,'currency reference must not change funds');
  assert.equal(context.window.IrisMarket.back(),true);
  assert.equal(subtitle.textContent,'购物车');
  assert.equal(context.window.IrisMarket.back(),false,'a root page exits the market');
  await click({mPage:'category'});
  assert.equal(content.scrollTop,240);
  await click({mProduct:'p-home-mug'});
  content.onchange({target:{name:'spec',value:'large',dataset:{}}});
  await click({mFavorite:'p-home-mug'});
  assert.match(content.innerHTML,/value="large" checked/,'favoriting must preserve the selected specification');
  assert.doesNotMatch(content.innerHTML,/<header class="market-subhead">/);
  assert.match(content.innerHTML,/>购买<\/button>/);
  assert.match(content.innerHTML,/16:00 前下单当日发货，16:00 后下单次日发货；同省隔天送达，跨省约 2–3 天/);
  assert.doesNotMatch(content.innerHTML,/虚拟世界配送/);
  assert.equal(context.window.IrisMarket.back(),true);
  assert.equal(content.scrollTop,240,'wordmark return must restore the preceding page');
  assert.equal(context.window.IrisMarket.back(),false,'category wordmark must exit even with route history');
  for(const page of ['home','cart','orders','mine']){await click({mPage:page});assert.equal(context.window.IrisMarket.back(),false);}
  context.window.IrisMarket.render({state,characters:state.characters,content,title:{querySelector:selector=>selector==='.market-page-subtitle'?subtitle:null},esc:value=>String(value),save:()=>{saves+=1},request:async prompt=>{apiCalls+=1;if(prompt.includes('搜索需求：'))return searchResponse();throw Error('unexpected API request')}});
  await click({mPage:'category'});
  assert.match(content.innerHTML, /^<main class="iris-market market-view-category"><div class="market-category-pills"/,'category tabs must be the first content directly under the market header');
  assert.doesNotMatch(content.innerHTML, /market-search|market-subhead/,'category view must not contain the home search or a second header row');
  content.scrollTop=240;
  await click({mPage:'home'});
  const searchCalls=apiCalls;
  await content.onsubmit({preventDefault(){},target:{matches:selector=>selector==='.market-search'}});
  assert.equal(apiCalls,searchCalls+1,'submitting home search must call the product API');
  assert.equal(state.market.aiCache['羊毛礼物']!==undefined,true);
  assert.match(content.innerHTML,/羊毛手作礼盒/);
  assert.match(content.innerHTML,/market-view-home/,'search must keep the user on the home page');
  assert.match(content.innerHTML,/market-search-results/,'the generated product must be shown in a home search results section');
  assert.doesNotMatch(content.innerHTML,/market-flash/,'search completion must not leave a floating status strip above the category row');
  assert.equal(content.scrollTop,0,'search results must open at the top rather than restoring the old category scroll');
  assert.match(content.innerHTML,/class="market-search"/,'the search field belongs on the home page');
  const css=fs.readFileSync(require.resolve('../style.css'),'utf8');
  assert.match(css,/feature-page-content:has\(\.market-view-category\)\{padding-top:0\}[\s\S]*?market-view-category \.market-category-pills\{position:sticky;top:0/,'the category strip must begin at the top edge and remain pinned while the list scrolls');
  await content.onsubmit({preventDefault(){},target:{matches:selector=>selector==='.market-search'}});
  assert.equal(apiCalls,searchCalls+1,'cached searches must reuse the generated product');
  const orderCard = { dataset: { mOrder: overdueOrder.id } };
  content.onclick({target:{closest:selector=>selector==='.market-order[data-m-order]'?orderCard:null}});
  assert.equal(subtitle.textContent,'订单详情','clicking an actual order card must open its detail page');
  await click({mPage:'category'});
  assert.equal(subtitle.textContent,'分类','navigation buttons must not be treated as order cards');
  console.log('market-wallet-ui: all assertions passed');
})().catch(error => { console.error(error); process.exitCode = 1; });
