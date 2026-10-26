const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const window={};vm.runInNewContext(fs.readFileSync(require.resolve('../scripts/travel-map.js'),'utf8'),{window});
test('shared itinerary orders days numerically and periods chronologically without changing saved place order',()=>{
 const places=[{id:'day2night',day:2,period:'夜间'},{id:'day1late',day:1,period:'傍晚'},{id:'day10',day:10,period:'上午'},{id:'day1morning',day:1,period:'上午'},{id:'day3',day:3,period:'午后'},{id:'day2morning',day:2,period:'上午'},{id:'day1unknown',day:1,period:'待商量'},{id:'day1afternoon',day:1,period:'午后'},{id:'undated',day:null,period:'上午'}];
 const before=JSON.stringify(places),result=window.IrisTravelMap.orderedPlaces(places);
 assert.deepEqual(Array.from(result,p=>p.id),['day1morning','day1afternoon','day1late','day1unknown','day2morning','day2night','day3','day10','undated']);assert.equal(JSON.stringify(places),before);
});
test('shared itinerary keeps the original order for places in the same day and period',()=>{
 const places=[{id:'first',day:2,period:'上午'},{id:'second',day:1,period:'夜间'},{id:'third',day:2,period:'上午'}];assert.deepEqual(Array.from(window.IrisTravelMap.orderedPlaces(places),p=>p.id),['second','first','third']);
});
test('confirmation explains location and schedule problems separately without treating a pending time as missing coordinates',()=>{
 const C=window.IrisTravelMap,located={name:'西湖',lat:30.2,lon:120.1,day:1,period:'待商量'};
 assert.deepEqual(Array.from(C.placeIssues(located,3)),['时段待确定']);assert.equal(C.readyPlace(located,3),false);assert.equal(C.readyPlace({...located,period:'上午'},3),true);
 assert.deepEqual(Array.from(C.placeIssues({...located,planned:true,day:5},3)),['尚未定位到真实地图位置','第5天超出本次3天行程','时段待确定']);
});
