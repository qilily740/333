(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.IrisMediaStorage=api})(typeof globalThis==='object'?globalThis:null,function(){
'use strict';
const FORMAT='iris-local-media',BUNDLE='iris-media-bundle',MIN_IMAGE=4096,IMAGE=/^data:image\/[a-z0-9.+-]+(?:;[^,]*)?,/i;
const cache=new Map();let cacheBytes=0;
async function identify(value){if(cache.has(value)){const item=cache.get(value);cache.delete(value);cache.set(value,item);return item}const bytes=new TextEncoder().encode(value),id=Array.from(new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256',bytes)),byte=>byte.toString(16).padStart(2,'0')).join(''),item={id,size:bytes.length};if(item.size<=8*1024*1024){cache.set(value,item);cacheBytes+=item.size;while(cacheBytes>8*1024*1024){const first=cache.keys().next().value;cacheBytes-=cache.get(first).size;cache.delete(first)}}return item}
const digest=async value=>(await identify(value)).id;
async function pack(value){
 if(!globalThis.crypto?.subtle)return{value,assets:new Map(),stats:null};const assets=new Map(),ids=new Map(),references=[],ancestors=new Set();let originalBytes=0,uniqueBytes=0;
 async function visit(item,path){
  if(path.length>100)throw Object.assign(Error('deep'),{cycle:true});
  if(typeof item==='string'&&item.length>=MIN_IMAGE&&IMAGE.test(item)){let info=ids.get(item);if(!info){info=await identify(item);ids.set(item,info);assets.set(info.id,item);uniqueBytes+=info.size}originalBytes+=info.size;references.push({path,id:info.id});return ''}
  if(!item||typeof item!=='object'||Object.prototype.toString.call(item)!=='[object Object]'&&!Array.isArray(item))return item;
  if(ancestors.has(item))throw Object.assign(Error('cyclic'),{cycle:true});ancestors.add(item);const output=Array.isArray(item)?new Array(item.length):{};
  for(const key of Object.keys(item)){const child=await visit(item[key],[...path,Array.isArray(item)&&String(Number(key))===key&&Number.isSafeInteger(Number(key))?Number(key):key]);Object.defineProperty(output,key,{value:child,writable:true,enumerable:true,configurable:true})}ancestors.delete(item);return output;
 }
 let data;try{data=await visit(value,[])}catch(error){if(error.cycle)return{value,assets:new Map(),stats:null};throw error}
 if(!references.length)return{value,assets:new Map(),stats:null};const stats={images:assets.size,references:references.length,reused:references.length-assets.size,savedBytes:Math.max(0,originalBytes-uniqueBytes)};
 return{value:{format:FORMAT,version:1,data,references,stats},assets,stats};
}
async function unpack(value,read){
 if(value?.format!==FORMAT)return value;if(value.version!==1||!Array.isArray(value.references)||!value.references.length||value.references.length>1000000)throw Error('图片引用资料格式无效，原数据未改动。');
 const pending=new Map(),seen=new Set();for(const reference of value.references){if(!reference||!/^[a-f0-9]{64}$/.test(reference.id)||!Array.isArray(reference.path)||reference.path.length>100||reference.path.some(key=>typeof key!=='string'&&(!Number.isSafeInteger(key)||key<0)))throw Error('图片引用路径无效。');const path=JSON.stringify(reference.path);if(seen.has(path))throw Error('图片引用重复。');seen.add(path);if(!pending.has(reference.id))pending.set(reference.id,(async()=>{const source=await read(reference.id);if(typeof source!=='string'||!IMAGE.test(source)||await digest(source)!==reference.id)throw Error('图片资料缺失或校验失败，原数据已保留，请勿清空浏览器数据。');return source})())}
 const resolved=new Map(await Promise.all([...pending].map(async([id,promise])=>[id,await promise])));let data=typeof structuredClone==='function'?structuredClone(value.data):JSON.parse(JSON.stringify(value.data));
 for(const reference of value.references){let parent=data;const path=reference.path;if(!path.length){data=resolved.get(reference.id);continue}for(const key of path.slice(0,-1)){if(!parent||typeof parent!=='object'||!Object.prototype.hasOwnProperty.call(parent,key))throw Error('图片引用无法还原。');parent=parent[key]}const key=path.at(-1);if(!parent||typeof parent!=='object'||!Object.prototype.hasOwnProperty.call(parent,key)||parent[key]!=='')throw Error('图片引用目标无效。');Object.defineProperty(parent,key,{value:resolved.get(reference.id),writable:true,enumerable:true,configurable:true})}
 return data;
}
async function bundle(value){const packed=await pack(value);return packed.assets.size?{format:BUNDLE,version:1,record:packed.value,images:[...packed.assets]}:value}
async function unbundle(value){if(value?.format!==BUNDLE)return value;if(value.version!==1||!Array.isArray(value.images)||value.images.length>100000||value.record?.format!==FORMAT)throw Error('图片备份资料格式无效。');const images=new Map();for(const entry of value.images){if(!Array.isArray(entry)||entry.length!==2||typeof entry[0]!=='string'||typeof entry[1]!=='string'||images.has(entry[0]))throw Error('图片备份清单无效。');images.set(...entry)}return unpack(value.record,id=>images.get(id))}
return{pack,unpack,bundle,unbundle,FORMAT,BUNDLE};
});
