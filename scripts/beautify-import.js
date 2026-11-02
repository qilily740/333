/* Local appearance readers. File contents never leave the device. */
(()=>{
'use strict';
const LIMIT=4*1024*1024,TEXT_LIMIT=300000;
function decode(bytes){if(bytes[0]===255&&bytes[1]===254)return new TextDecoder('utf-16le').decode(bytes).replace(/^\uFEFF/,'');if(bytes[0]===254&&bytes[1]===255)return new TextDecoder('utf-16be').decode(bytes).replace(/^\uFEFF/,'');try{return new TextDecoder('utf-8',{fatal:true}).decode(bytes).replace(/^\uFEFF/,'')}catch{return new TextDecoder('gb18030').decode(bytes)}}
function textPackage(text,name,scope='online'){
 let raw=String(text).replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n').trim();if(!raw)throw Error('文件中没有美化内容');
 const fences=Array.from(raw.matchAll(/```(?:css|json)?\s*\n([\s\S]*?)```/gi));if(fences.length)raw=fences.map(match=>match[1].trim()).join('\n');
 let value;try{value=JSON.parse(raw)}catch{}
 if(value&&typeof value==='object'&&!Array.isArray(value)){if(value.type&&!/^iris-(online|offline|forum)-beautify$/.test(value.type))throw Error('这不是 Iris 美化文件');if(value.version!==undefined&&value.version!==1)throw Error('不支持此美化文件版本');if(typeof value.css!=='string')throw Error('JSON 中需要包含 css 样式内容');return{...value,type:value.type||'iris-'+scope+'-beautify',version:1,name:value.name||name}}
 if(typeof value==='string')raw=value;
 if(raw.length>TEXT_LIMIT)throw Error('美化 CSS 过大，请控制在 300 KB 以内');
 if(/<\/?(?:script|html|iframe)\b/i.test(raw))throw Error('请导入美化 CSS 或美化 JSON，不支持网页脚本');
 raw=raw.replace(/^<style[^>]*>\s*/i,'').replace(/\s*<\/style>$/i,'');
 // Word documents may have a heading before the actual stylesheet.
 const lines=raw.split('\n'),first=lines.findIndex(line=>/^\s*(?:[.#:*\[]|@(?:import|media|supports|font-face|container)\b|(?:html|body|button|input|textarea|div|span)\b)/i.test(line)&&(/[{@]/.test(line)||/^[.#:\[]/.test(line)));
 if(first>0&&lines.slice(0,first).join('\n').replace(/\/\*[\s\S]*?\*\//g,'').trim())raw=lines.slice(first).join('\n').trim();
 let depth=0,quote='',comment=false,blocks=0;for(let i=0;i<raw.length;i++){const c=raw[i],next=raw[i+1];if(comment){if(c==='*'&&next==='/'){comment=false;i++}continue}if(quote){if(c==='\\'){i++;continue}if(c===quote)quote='';continue}if(c==='/'&&next==='*'){comment=true;i++;continue}if(c==='"'||c==="'"){quote=c;continue}if(c==='{'){depth++;blocks++}else if(c==='}'&&--depth<0)throw Error('CSS 花括号不匹配，请检查文件')}
 if(depth||quote||comment||!blocks)throw Error('未找到完整 CSS，请将样式正文或美化 JSON 放入文档后导入');
 return{type:'iris-'+scope+'-beautify',version:1,name,css:raw};
}
// Read Word 97–2003 piece tables, not printable strings from arbitrary binary data.
// Microsoft MS-CFB header and MS-DOC 2.4.1 Retrieving Text specifications.
function docText(bytes){
 const fail=message=>{throw Error(message||'DOC 文档结构损坏或不受支持')};
 if(bytes.length<512||![208,207,17,224,161,177,26,225].every((b,i)=>bytes[i]===b))fail('这不是 Word DOC 文档，请选择真实的 DOC、DOCX 或 TXT 文件');
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),u16=(at,v=view)=>v.getUint16(at,true),u32=(at,v=view)=>v.getUint32(at,true);
 if(u16(28)!==65534)fail();const sectorSize=2**u16(30),miniSize=2**u16(32);if(![512,4096].includes(sectorSize)||miniSize!==64)fail();
 const sectorCount=Math.floor(bytes.length/sectorSize)-1,END=0xfffffffe,FREE=0xffffffff;
 function sector(id){if(!Number.isInteger(id)||id<0||id>=sectorCount)fail();return bytes.subarray((id+1)*sectorSize,(id+2)*sectorSize)}
 const fatCount=u32(44);if(fatCount>sectorCount)fail();const fatIds=[];for(let i=0;i<109;i++){const id=u32(76+i*4);if(id!==FREE)fatIds.push(id)}
 let dif=u32(68);const difCount=u32(72),seenDif=new Set();if(difCount>sectorCount)fail();for(let i=0;i<difCount;i++){if(seenDif.has(dif))fail();seenDif.add(dif);const b=sector(dif),v=new DataView(b.buffer,b.byteOffset,b.byteLength);for(let j=0;j<sectorSize/4-1;j++){const id=u32(j*4,v);if(id!==FREE)fatIds.push(id)}dif=u32(sectorSize-4,v)}
 if(fatIds.length<fatCount)fail();const fat=[];for(const id of fatIds.slice(0,fatCount)){const b=sector(id),v=new DataView(b.buffer,b.byteOffset,b.byteLength);for(let i=0;i<sectorSize;i+=4)fat.push(u32(i,v))}
 function chain(start,table,read,size=sectorSize,max=LIMIT*2){const parts=[],seen=new Set();let id=start,total=0;while(id!==END&&id!==FREE){if(id>=table.length||seen.has(id)||(total+=size)>max)fail();seen.add(id);const b=read(id);if(b.length!==size)fail();parts.push(b);id=table[id]}const out=new Uint8Array(total);parts.forEach((b,i)=>out.set(b,i*size));return out}
 const directory=chain(u32(48),fat,sector),entries=[];
 for(let at=0;at+128<=directory.length;at+=128){const v=new DataView(directory.buffer,directory.byteOffset+at,128),len=u16(64,v),type=directory[at+66];if(!type)continue;if(len<2||len>64||len%2||u32(124,v))fail();entries.push({name:new TextDecoder('utf-16le').decode(directory.subarray(at,at+len-2)),type,start:u32(116,v),size:u32(120,v)})}
 const root=entries.find(e=>e.type===5);if(!root)fail();let miniFat,miniRoot;
 function stream(name){const entry=entries.find(e=>e.type===2&&e.name===name);if(!entry||entry.size>LIMIT*2)fail();if(!entry.size)return new Uint8Array();let out;if(entry.size<4096){if(!miniFat){const m=chain(u32(60),fat,sector),mv=new DataView(m.buffer);miniFat=[];for(let i=0;i<m.length;i+=4)miniFat.push(u32(i,mv));miniRoot=chain(root.start,fat,sector).subarray(0,root.size)}out=chain(entry.start,miniFat,id=>miniRoot.subarray(id*miniSize,(id+1)*miniSize),miniSize)}else out=chain(entry.start,fat,sector);if(out.length<entry.size)fail();return out.subarray(0,entry.size)}
 const word=stream('WordDocument'),wv=new DataView(word.buffer,word.byteOffset,word.byteLength);if(word.length<154||u16(0,wv)!==0xa5ec)fail();const flags=u16(10,wv);if(flags&0x8100)fail('请先在 Word 中解除文档密码，再导入美化');if(u16(2,wv)<0xc1)fail('此 DOC 格式较旧，请用 Word 另存为 DOCX 或 TXT 后导入');
 let at=32;const csw=u16(at,wv);at+=2+csw*2;if(at+2>word.length)fail();const cslw=u16(at,wv),lw=at+2;at=lw+cslw*4;if(at+2>word.length||cslw<4)fail();const pairs=u16(at,wv);at+=2;if(pairs<=33||at+34*8>word.length)fail();const offset=u32(at+33*8,wv),length=u32(at+33*8+4,wv),ccp=u32(lw+12,wv),table=stream(flags&512?'1Table':'0Table');if(length>LIMIT||offset+length>table.length||ccp>TEXT_LIMIT+10000)fail('DOC 正文过大或结构不完整');
 const clx=table.subarray(offset,offset+length),cv=new DataView(clx.buffer,clx.byteOffset,clx.byteLength);let c=0;while(c<clx.length&&clx[c]===1){if(c+3>clx.length)fail();c+=3+u16(c+1,cv)}if(c+5>clx.length||clx[c]!==2)fail();const plcLen=u32(c+1,cv),plc=c+5,n=(plcLen-4)/12;if(!Number.isInteger(n)||n<1||plc+plcLen>clx.length)fail();
 const result=[];let last=0;for(let i=0;i<n;i++){const from=u32(plc+i*4,cv),to=u32(plc+(i+1)*4,cv);if(from!==last||to<from)fail();last=to;if(from>=ccp)break;const chars=Math.min(to,ccp)-from,fc=u32(plc+(n+1)*4+i*8+2,cv),compressed=Boolean(fc&0x40000000),start=(fc&0x3fffffff)/(compressed?2:1),end=start+chars*(compressed?1:2);if(!Number.isInteger(start)||end>word.length)fail();result.push(new TextDecoder(compressed?'windows-1252':'utf-16le').decode(word.subarray(start,end)))}
 return result.join('').replace(/[\r\u0007\u000b]/g,'\n').replace(/[\u0000-\u0008\u000e-\u001f]/g,'');
}
function rtfText(text){
 const stack=[],out=[];let skip=false,uc=1,fallback=0;
 for(let i=0;i<text.length;){const ch=text[i++];if(ch==='{'){stack.push({skip,uc});continue}if(ch==='}'){const old=stack.pop();if(old)({skip,uc}=old);continue}if(ch!=='\\'){if(fallback){fallback--;continue}if(!skip&&ch!=='\r'&&ch!=='\n')out.push(ch);continue}const rest=text.slice(i);if(rest[0]==='*'){skip=true;i++;continue}if(/[{}\\]/.test(rest[0]||'')){if(!skip&&!fallback)out.push(rest[0]);else if(fallback)fallback--;i++;continue}const hex=/^'([a-f0-9]{2})/i.exec(rest);if(hex){if(!skip&&!fallback)out.push(new TextDecoder('windows-1252').decode(new Uint8Array([parseInt(hex[1],16)])));else if(fallback)fallback--;i+=3;continue}const match=/^([a-z]+)(-?\d+)? ?/i.exec(rest);if(!match){i++;continue}i+=match[0].length;const [,word,num]=match;if(['fonttbl','colortbl','stylesheet','info','pict','object','header','footer','fldinst'].includes(word)){skip=true;continue}if(word==='uc'){uc=Math.min(10,Math.max(0,Number(num)));continue}if(skip)continue;if(word==='u'){out.push(String.fromCharCode(Number(num)&65535));fallback=uc}else if(['par','line'].includes(word))out.push('\n');else if(word==='tab')out.push('\t')}
 return out.join('');
}
async function parse(file,options={}){
 if(!file||file.size>LIMIT)throw Error('请选择 4 MB 以内的美化文件');const ext=file.name.split('.').pop().toLowerCase();if(!['json','txt','css','doc','docx'].includes(ext))throw Error('支持 JSON、TXT、DOC、DOCX 和 CSS 文件');const bytes=new Uint8Array(await file.arrayBuffer()),name=file.name.replace(/\.[^.]+$/,'').slice(0,40)||'导入的美化';let text;
 if(ext==='docx'||(ext==='doc'&&bytes[0]===80&&bytes[1]===75)){if(!options.docx)throw Error('Word 文档读取器尚未就绪，请稍后重试');text=await options.docx(bytes)}
 else if(ext==='doc'){if(bytes[0]===208&&bytes[1]===207)text=docText(bytes);else{const raw=decode(bytes);if(/^\s*{\\rtf/i.test(raw))text=rtfText(raw);else if(/^\s*(?:<!doctype|<html|<\?xml)/i.test(raw)){const doc=new DOMParser().parseFromString(raw,'text/html');doc.querySelectorAll('script,style,iframe,object').forEach(n=>n.remove());doc.querySelectorAll('br').forEach(n=>n.replaceWith('\n'));doc.querySelectorAll('p,div').forEach(n=>n.append('\n'));text=doc.body.textContent}else throw Error('这不是可解析的 Word 文档，请另存为 DOCX 或 TXT 后重试')}}
 else text=decode(bytes);
 return textPackage(text,name,options.scope||'online');
}
const api={parse,textPackage,docText,rtfText,decode};if(typeof module!=='undefined')module.exports=api;if(typeof window!=='undefined')window.IrisBeautifyImport=api;
})();
