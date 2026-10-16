/* Local character-card readers. No file contents leave this browser. */
const CharacterImport = (() => {
  const utf8 = new TextDecoder('utf-8');
  function decodeText(bytes) {
    if(bytes[0]===255&&bytes[1]===254)return new TextDecoder('utf-16le').decode(bytes).replace(/^\uFEFF/,'');
    if(bytes[0]===254&&bytes[1]===255)return new TextDecoder('utf-16be').decode(bytes).replace(/^\uFEFF/,'');
    try{return new TextDecoder('utf-8',{fatal:true}).decode(bytes).replace(/^\uFEFF/,'')}catch{return new TextDecoder('gb18030').decode(bytes)}
  }
  const normalizeNewlines=value=>String(value||'').replace(/\r\n?/g,'\n').replace(/\u0000/g,'');
  async function inflate(bytes,format,limit=3*1024*1024) {
    const reader=new Blob([bytes]).stream().pipeThrough(new DecompressionStream(format)).getReader();
    const parts=[];let total=0;
    try{while(true){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>limit)throw Error('文件解压后的内容过大');parts.push(value)}}catch(e){await reader.cancel();throw e}
    const result=new Uint8Array(total);let at=0;for(const p of parts){result.set(p,at);at+=p.length}return result;
  }
  function normalizeDate(value) {
    const s=String(value||'').trim();
    let m=s.match(/(\d{4})[年\/.\-](\d{1,2})[月\/.\-](\d{1,2})日?/);
    if(m){const y=+m[1],mo=+m[2],d=+m[3];const date=new Date(Date.UTC(y,mo-1,d));if(date.getUTCFullYear()!==y||date.getUTCMonth()!==mo-1||date.getUTCDate()!==d)return s;return `${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`}
    m=s.match(/^\s*(\d{1,2})月\s*(\d{1,2})日?(?=$|[\s（(])/);if(m&&+m[1]>=1&&+m[1]<=12&&+m[2]>=1&&+m[2]<=new Date(Date.UTC(2000,+m[1],0)).getUTCDate())return `${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`;
    m=s.match(/^\s*(\d{1,2})[月\/.\-](\d{1,2})日?(?=$|[\s（(])/);if(m&&+m[1]>=1&&+m[1]<=12&&+m[2]>=1&&+m[2]<=new Date(Date.UTC(2000,+m[1],0)).getUTCDate())return `${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`;
    return s;
  }
  function ageFromText(value) {
    const text=normalizeNewlines(value),match=text.match(/(?:^|[\n|;；,，])\s*(?:年龄|岁数|周岁|age)\s*[:：=]?\s*(\d{1,3})\s*(?:周岁|岁|years?\s*old)?/i)||text.match(/(?:^|[^\d])(\d{1,3})\s*(?:周岁|岁|years?\s*old)(?=$|[^\p{L}\d])/iu);
    const age=Number(match?.[1]);return Number.isInteger(age)&&age>=0&&age<=120?age:null;
  }
  function birthdayWithAge(value,age,now=new Date()) {
    const date=normalizeDate(value);if(!/^\d{2}-\d{2}$/.test(date)||!Number.isInteger(age)||age<0||age>120)return date;
    const [,month,day]=date.match(/^(\d{2})-(\d{2})$/),currentYear=now.getFullYear(),beforeBirthday=Number(month)*100+Number(day)>((now.getMonth()+1)*100+now.getDate()),year=currentYear-age-(beforeBirthday?1:0);
    return `${year}-${date}`;
  }
  function normalizeGender(value) {
    const gender=String(value||'').trim();if(!gender)return'';
    if(/男|\bmale\b|\bman\b|\bboy\b|masculine|♂/i.test(gender))return'Male';
    if(/女|\bfemale\b|\bwoman\b|\bgirl\b|feminine|♀/i.test(gender))return'Female';
    if(/非二元|non[\s_-]?binary/i.test(gender))return'Non-binary';
    return gender;
  }
  const aliases={name:['name','charname','charactername','名字','姓名','角色名','名称'],nickname:['nickname','网名','昵称'],gender:['gender','sex','性别'],birthday:['birthday','birthdate','dateofbirth','dob','生日','出生日期']};
  function normalizeWorldBook(root,body=root) {
    const book=body?.character_book||root?.character_book||body?.worldBook||body?.worldbook||body?.lorebook||root?.worldBook||root?.worldbook||root?.lorebook;
    let entries=Array.isArray(book)?book:book?.entries;
    if(entries&& !Array.isArray(entries)&&typeof entries==='object')entries=Object.values(entries);
    if(!Array.isArray(entries))return [];
    return entries.filter(entry=>entry&&typeof entry==='object').map((entry,index)=>{
      const rawKeys=entry.keys??entry.keywords??entry.triggers??[];
      const keys=(Array.isArray(rawKeys)?rawKeys:String(rawKeys||'').split(/[,，\n]/)).map(key=>String(key).trim()).filter(Boolean);
      return {
        id:String(entry.id??entry.uid??`world-${index+1}`),
        name:String(entry.comment??entry.name??entry.title??`条目 ${index+1}`),
        keys,
        content:String(entry.content??entry.text??entry.description??''),
        enabled:entry.enabled!==false&&entry.disabled!==true,
        constant:Boolean(entry.constant),
        selective:Boolean(entry.selective)
      };
    }).filter(entry=>entry.content||entry.keys.length);
  }
  const normalizedKey=k=>k.toLowerCase().replace(/[\s_\-]/g,'');
  function findField(root,keys,depth=0) {
    if(!root||typeof root!=='object'||depth>8)return '';
    for(const [key,value] of Object.entries(root)){if(keys.includes(normalizedKey(key))&&(typeof value==='string'||typeof value==='number'))return String(value)}
    for(const value of Object.values(root)){const found=findField(value,keys,depth+1);if(found)return found}return '';
  }
  function fromText(text) {
    const source=normalizeNewlines(text).trim(),pick=(names)=>{const regex=new RegExp(`(?:^|[\\n|;；,，])\\s*(?:[-*#>]+\\s*)?(?:${names.join('|')})\\s*(?:[:：=]\\s*|\\s+)([^\\n|;；,，]+)`,'i');return(source.match(regex)||[])[1]?.trim()||''};
    const birthday=pick(['生日','出生日期','出生年月日','birthday','birthdate','birth_date','date of birth','date_of_birth','dob']),age=ageFromText(pick(['年龄','岁数','周岁','age']))??ageFromText(source);
    return {name:pick(['角色名','姓名','名字','名称','character name','char_name','name']),nickname:pick(['网名','昵称','nickname']),gender:normalizeGender(pick(['性别','gender','sex'])),birthday:birthdayWithAge(birthday,age),details:source};
  }
  function fromJSON(root) {
    if(Array.isArray(root)){if(root.length!==1)throw Error('请每次导入一张角色卡');root=root[0]}
    if(!root||typeof root!=='object')throw Error('JSON 中未找到角色资料');
    const body=root.data&&typeof root.data==='object'?root.data:root;
    const descriptions=['description','personality','scenario','first_mes','mes_example','creator_notes','details','具体信息','角色设定','描述'];
    const sections=descriptions.map(k=>typeof body[k]==='string'?body[k]:'').filter(Boolean);
    const details=normalizeNewlines(sections.join('\n\n')||JSON.stringify(body,null,2));
    const textFields=fromText(details);const result={details};
    for(const [key,keys] of Object.entries(aliases))result[key]=findField(body,keys)||textFields[key]||'';
    const age=ageFromText(findField(body,['age','年龄','岁数','周岁'])||'')??ageFromText(details);
    result.gender=normalizeGender(result.gender);result.birthday=birthdayWithAge(result.birthday||textFields.birthday,age);result.worldBook=normalizeWorldBook(root,body);return result;
  }
  function xmlText(xml) {
    if(typeof DOMParser!=='undefined'){
      const doc=new DOMParser().parseFromString(xml,'application/xml');if(doc.querySelector('parsererror'))throw Error('DOCX 文档内容损坏');
      const read=node=>{if(node.nodeType===3)return node.nodeValue||'';if(node.nodeType!==1)return '';if(node.localName==='t')return node.textContent||'';if(node.localName==='tab')return '\t';if(node.localName==='br'||node.localName==='cr')return '\n';return Array.from(node.childNodes).map(read).join('')};
      return normalizeNewlines(Array.from(doc.getElementsByTagNameNS('*','p')).map(read).join('\n'));
    }
    return normalizeNewlines(xml.replace(/<w:(?:br|cr)\b[^>]*\/?\s*>/g,'\n').replace(/<w:tab\b[^>]*\/?\s*>/g,'\t').replace(/<\/w:p>/g,'\n').replace(/<[^>]*>/g,'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&amp;/g,'&').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&#x([\da-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))));
  }
  async function docxText(bytes) {
    const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let end=-1;
    for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--)if(view.getUint32(i,true)===0x06054b50){end=i;break}
    if(end<0)throw Error('这不是有效的 DOCX 文件');
    let at=view.getUint32(end+16,true);const count=view.getUint16(end+10,true);
    for(let i=0;i<count;i++){
      if(at+46>bytes.length||view.getUint32(at,true)!==0x02014b50)throw Error('DOCX 文件结构不完整');
      const flags=view.getUint16(at+8,true),method=view.getUint16(at+10,true),size=view.getUint32(at+20,true),outSize=view.getUint32(at+24,true),nameLen=view.getUint16(at+28,true),extraLen=view.getUint16(at+30,true),commentLen=view.getUint16(at+32,true),local=view.getUint32(at+42,true);
      const name=utf8.decode(bytes.subarray(at+46,at+46+nameLen));
      if(name==='word/document.xml'){
        if(flags&1)throw Error('请导入未加密的 DOCX 文件');if(outSize>3*1024*1024)throw Error('DOCX 正文过大');
        if(local+30>bytes.length||view.getUint32(local,true)!==0x04034b50)throw Error('DOCX 正文无法读取');
        const start=local+30+view.getUint16(local+26,true)+view.getUint16(local+28,true);if(start+size>bytes.length)throw Error('DOCX 正文不完整');
        const data=bytes.subarray(start,start+size);const content=method===0?data:method===8?await inflate(data,'deflate-raw'):null;
        if(!content)throw Error('不支持此 DOCX 的压缩方式');return xmlText(utf8.decode(content));
      }
      at+=46+nameLen+extraLen+commentLen;
    }throw Error('DOCX 中没有正文');
  }
  function b64JSON(value) {const raw=atob(value.trim());const bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));return JSON.parse(utf8.decode(bytes))}
  async function pngData(bytes) {
    const sig=[137,80,78,71,13,10,26,10];if(!sig.every((v,i)=>bytes[i]===v))throw Error('PNG 文件无效');
    const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);const chunks=[];
    for(let at=8;at+12<=bytes.length;){const size=view.getUint32(at),type=utf8.decode(bytes.subarray(at+4,at+8));if(at+12+size>bytes.length)throw Error('PNG 文件不完整');
      if(['tEXt','zTXt','iTXt'].includes(type)){
        const data=bytes.subarray(at+8,at+8+size);const zero=data.indexOf(0);
        if(zero>=0){const key=utf8.decode(data.subarray(0,zero));let value='';
          if(type==='tEXt')value=utf8.decode(data.subarray(zero+1));
          if(type==='zTXt'&&data[zero+1]===0)value=utf8.decode(await inflate(data.subarray(zero+2),'deflate'));
          if(type==='iTXt'){let p=zero+3;const langEnd=data.indexOf(0,p);const translatedEnd=data.indexOf(0,langEnd+1);if(langEnd>=0&&translatedEnd>=0){const content=data.subarray(translatedEnd+1);value=utf8.decode(data[zero+1]===1?await inflate(content,'deflate'):content)}}
          if(value)chunks.push({key,value});
        }
      }
      at+=size+12;if(type==='IEND')break;
    }
    for(const chunk of chunks.sort((a,b)=>(b.key==='ccv3')-(a.key==='ccv3'))){if(/^(chara|ccv3|character|description|comment)$/i.test(chunk.key)){try{return fromJSON(JSON.parse(chunk.value))}catch{}try{return fromJSON(b64JSON(chunk.value))}catch{}}}
    return null;
  }
  async function portrait(file) {
    const url=URL.createObjectURL(file);try{const image=new Image();await new Promise((yes,no)=>{image.onload=yes;image.onerror=no;image.src=url});const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const edge=Math.min(image.naturalWidth,image.naturalHeight);canvas.getContext('2d').drawImage(image,(image.naturalWidth-edge)/2,(image.naturalHeight-edge)/2,edge,edge,0,0,256,256);return canvas.toDataURL('image/jpeg',.85)}finally{URL.revokeObjectURL(url)}
  }
  async function parse(file) {
    if(file.size>12*1024*1024)throw Error('请选择小于 12 MB 的角色文件');
    const ext=file.name.split('.').pop().toLowerCase();const bytes=new Uint8Array(await file.arrayBuffer());let result,note='';
    if(ext==='json'){try{result=fromJSON(JSON.parse(decodeText(bytes)))}catch(e){throw Error('JSON 导入失败：'+e.message)}}
    else if(ext==='txt')result=fromText(decodeText(bytes));
    else if(ext==='docx')result=fromText(await docxText(bytes));
    else if(ext==='png'){result=await pngData(bytes);if(!result){result={};note='图片未嵌入角色资料，已设为头像，请手动补充信息。'}result.avatar=await portrait(file)}
    else throw Error('支持 JSON、PNG、TXT、DOCX 格式');
    if((result.details||'').length>100000)throw Error('角色设定过长，请控制在 10 万字以内');
    return {character:{gender:'',birthday:'',details:'',avatar:'',color:'#ededed',initial:'',...result,gender:normalizeGender(result.gender),nickname:'',name:result.name||file.name.replace(/\.[^.]+$/,'')},note};
  }
  return {parse,fromText,fromJSON,normalizeDate,birthdayWithAge,ageFromText,normalizeWorldBook,docxText,pngData,portrait};
})();
if(typeof module!=='undefined')module.exports=CharacterImport;
