const crypto=require('node:crypto');
function repository(){
 const files=new Map(),requests=[],assets=new Map(),releases=new Map(),repos=new Set(['owner/iris-data']);let privateRepo=true,failure='',race=false,nextRelease=1,nextAsset=1;
 const response=(status,value)=>({ok:status>=200&&status<300,status,json:async()=>value,arrayBuffer:async()=>Uint8Array.from(value).buffer});
 const fetch=async(url,options={})=>{
  const parsed=new URL(url),method=options.method||'GET',body=typeof options.body==='string'?JSON.parse(options.body):options.body;requests.push({url,method,body:body??null});
  if(!['https://api.github.com','https://uploads.github.com'].includes(parsed.origin))throw Error('unexpected host');
  if(options.headers.Authorization!=='Bearer fixture-token')return response(401,{message:'Bad credentials'});
  if(parsed.pathname==='/user')return response(200,{login:'owner'});
  if(parsed.pathname==='/user/repos'&&method==='POST'){const name='owner/'+body.name;if(repos.has(name))return response(422,{});repos.add(name);return response(201,{private:body.private,full_name:name,default_branch:'main',size:0})}
  const match=parsed.pathname.match(/^\/repos\/([^/]+\/[^/]+)(.*)$/);if(!match||!repos.has(match[1]))return response(404,{});const path=match[2];
  if(!path)return response(200,{private:privateRepo,default_branch:'main',size:files.size,permissions:{push:true}});
  if(path.startsWith('/branches/'))return response(files.size?200:404,{name:'main'});
  if(path==='/releases'){
   if(method==='POST'){if(!files.size)return response(422,{message:'Repository is empty'});const item={id:nextRelease++,...body};releases.set(item.id,item);return response(201,item)}
   const page=Number(parsed.searchParams.get('page')||1);return response(200,[...releases.values()].reverse().slice((page-1)*100,page*100));
  }
  const assetMatch=path.match(/^\/releases\/assets\/(\d+)$/);if(assetMatch){const id=Number(assetMatch[1]),item=assets.get(id);if(!item)return response(404,{});if(method==='DELETE'){assets.delete(id);return response(204,{})}if(options.headers.Accept==='application/octet-stream')return response(200,item.bytes);return response(200,item.meta)}
  const releaseMatch=path.match(/^\/releases\/(\d+)(\/assets)?$/);if(releaseMatch){const id=Number(releaseMatch[1]),release=releases.get(id);if(!release)return response(404,{});if(!releaseMatch[2]){if(method==='PATCH')Object.assign(release,body);return response(200,release)}
   if(method==='GET')return response(200,[...assets.values()].filter(item=>item.releaseId===id).map(item=>item.meta));
   const name=parsed.searchParams.get('name');if(failure&&(name||'').includes(failure))return response(500,{});if([...assets.values()].some(item=>item.releaseId===id&&item.meta.name===name))return response(422,{});const bytes=Buffer.from(body),meta={id:nextAsset++,name,size:bytes.length,state:'uploaded',digest:'sha256:'+crypto.createHash('sha256').update(bytes).digest('hex')};assets.set(meta.id,{releaseId:id,bytes,meta});return response(201,meta);
  }
  if(!path.startsWith('/contents/'))return response(404,{});
  const filePath=decodeURIComponent(path.slice('/contents/'.length));
  if(method==='GET'){const file=files.get(filePath);if(!file)return response(404,{});if(options.headers.Accept==='application/vnd.github.raw+json')return response(200,file.bytes);return response(200,{type:'file',encoding:file.bytes.length>1024*1024?'none':'base64',size:file.bytes.length,sha:file.sha,content:file.bytes.length>1024*1024?'':file.bytes.toString('base64')})}
  if(failure&&filePath.includes(failure))return response(500,{});
  const existing=files.get(filePath);if(race&&filePath==='iris-sync/latest.json')return response(409,{});
  if(existing&&body.sha!==existing.sha)return response(409,{});
  const bytes=Buffer.from(body.content,'base64'),sha=crypto.createHash('sha1').update(bytes).digest('hex');files.set(filePath,{bytes,sha});return response(existing?200:201,{content:{sha}});
 };
 return{files,requests,fetch,assets,releases,repos,setPrivate:value=>privateRepo=value,fail:value=>failure=value,race:value=>race=value};
}
module.exports={repository};
