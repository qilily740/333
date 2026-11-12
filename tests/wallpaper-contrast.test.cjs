const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const api=require('../scripts/wallpaper-contrast.js');
test('wallpaper colors choose readable ink and a restrained selected surface',()=>{
 assert.equal(api.palette([0,0,0,255]).ink,'#ffffff');assert.equal(api.palette([255,255,255,255]).ink,'#26313f');assert.equal(api.palette([0,0,0,0]).ink,'#26313f');assert.equal(api.palette([]).ink,'#26313f');
 assert.equal(api.palette([10,20,50,255])['active-ink'],'#ffffff');assert.notEqual(api.palette([10,20,50,255]).glass,api.palette([220,180,180,255]).glass);
});
test('sampling follows centered cover cropping and focuses on the visible bottom controls',()=>{
 assert.deepEqual(api.coverRegion(1000,1000,400,800),[250,720,500,280]);
 const [x,y,width,height]=api.coverRegion(400,1600,400,800);assert.equal(x,0);assert.equal(width,400);assert.equal(y,976);assert.ok(Math.abs(height-224)<.001);
});
function fixture(){const pending=[],values=new Map();let draws=0;const root={style:{setProperty:(k,v)=>values.set(k,v),removeProperty:k=>values.delete(k)},isConnected:true,clientWidth:400,clientHeight:800};const env={Image:class{set src(value){this.url=value;pending.push(this)}},setTimeout:()=>1,clearTimeout(){},document:{createElement:()=>({getContext:()=>({drawImage(bitmap){this.color=bitmap.color;draws++},getImageData(){return{data:this.color}}})})}};const context=vm.createContext(env);vm.runInContext(fs.readFileSync(require.resolve('../scripts/wallpaper-contrast.js'),'utf8'),context);const load=(index,color)=>{Object.assign(pending[index],{naturalWidth:1000,naturalHeight:1000,color});pending[index].onload()};return{api:context.IrisWallpaperContrast,root,pending,values,load,draws:()=>draws}}
test('a stale wallpaper cannot recolor a new chat, and disabling clears adaptive variables',async()=>{
 const f=fixture(),old=f.api.sync(f.root,'old'),latest=f.api.sync(f.root,'latest');f.load(1,[0,0,0,255]);await latest;assert.equal(f.values.get('--imessage-ink'),'#ffffff');f.load(0,[255,255,255,255]);await old;assert.equal(f.values.get('--imessage-ink'),'#ffffff');assert.equal(f.draws(),1);
 await f.api.sync(f.root,'latest');assert.equal(f.draws(),1);assert.equal(f.pending.length,2);
 await f.api.sync(f.root,'',false);assert.equal(f.values.size,0);
});
test('wallpaper read failure falls back safely and never interrupts settings',async()=>{
 const f=fixture(),work=f.api.sync(f.root,'blocked');f.pending[0].onerror();assert.equal(await work,false);assert.equal(f.values.get('--imessage-ink'),'#26313f');
 const next=f.api.sync(f.root,'dark');await f.api.sync(f.root,'',false);f.load(1,[0,0,0,255]);await next;assert.equal(f.values.size,0);
});
