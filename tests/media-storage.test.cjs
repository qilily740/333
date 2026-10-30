const {test}=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const M=require('../scripts/media-storage.js'),B=require('../scripts/backup-core.js');
const image=()=> 'data:image/png;base64,'+crypto.randomBytes(7000).toString('base64');
test('media storage removes repeated images from physical data without changing the source and restores every reference',async()=>{
 const src=image(),data={users:[{avatar:src}],messages:{one:[{image:src},{image:src}]},settings:{key:'unchanged'}};const packed=await M.pack(data);assert.equal(packed.assets.size,1);assert.equal(packed.stats.references,3);assert.equal(packed.stats.reused,2);assert.equal(data.users[0].avatar,src);assert.ok(!JSON.stringify(packed.value).includes(src));assert.deepEqual(await M.unpack(packed.value,id=>packed.assets.get(id)),data);assert.deepEqual(await M.unpack(packed.value,id=>packed.assets.get(id)),data);assert.equal(packed.value.data.users[0].avatar,'');
});
test('missing media, tampered images and unsafe reference paths fail without modifying the packed record',async()=>{
 const packed=await M.pack({avatar:image()}),before=JSON.stringify(packed.value);await assert.rejects(M.unpack(packed.value,()=>undefined),/缺失或校验失败/);await assert.rejects(M.unpack(packed.value,()=>image()),/校验失败/);assert.equal(JSON.stringify(packed.value),before);const invalid=structuredClone(packed.value);invalid.references[0].path=['__proto__','polluted'];await assert.rejects(M.unpack(invalid,id=>packed.assets.get(id)),/还原/);assert.equal({}.polluted,undefined);
});
test('image bundles shrink backups and remain compatible with validation after automatic ZIP expansion',async()=>{
 const src=image(),state={users:[{avatar:src}],characters:[{avatar:src}],messages:{one:[{image:src}]}},backup=await B.make(state),text=JSON.stringify(backup),bundle=await M.bundle(backup);assert.equal(bundle.images.length,1);assert.ok(JSON.stringify(bundle).length<text.length/2);const zip=await B.zip(text),bytes=new Uint8Array(await zip.arrayBuffer()),restored=JSON.parse(new TextDecoder().decode(await B.unzip(bytes)));assert.deepEqual((await B.validate(restored)).data,state);assert.deepEqual(backup.data,state);
});
