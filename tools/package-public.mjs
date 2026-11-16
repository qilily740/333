/** Export only the current reviewed files; never copies Git history or local credentials. */
import {execFileSync} from 'node:child_process';
import {readFile,writeFile,mkdir,copyFile,stat,realpath,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),output=path.resolve(process.argv[2]||'/tmp/iris-github-test-release');
if(output===root||output.startsWith(root+path.sep))throw Error('发布副本必须放在项目之外');
try{if((await readdir(output)).length)throw Error('目标目录不为空，请选择新的发布目录')}catch(error){if(error.code!=='ENOENT')throw error}
const ignoredPart=part=>['.git','.wrangler','.iris-deploy','node_modules','.aws','.codex','.agents','.DS_Store'].includes(part)||/^(?:\.env|\.dev\.vars)(?:\.|$)/.test(part)&&!part.endsWith('.example')||/\.(?:log|pem|key)$/.test(part);
const raw=execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{cwd:root,encoding:'utf8'}),files=[...new Set(raw.split('\0').filter(Boolean))].filter(file=>file!=='CNAME'&&file!=='CONTRIBUTING.md'&&file!=='README.md'&&!file.startsWith('docs/public/')&&!file.split('/').some(ignoredPart));
const secrets=/(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|cf(?:oat|pat|ut)_[A-Za-z0-9_-]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)/;
let count=0,bytes=0;
for(const file of files){const from=path.join(root,file);let info;try{info=await stat(from)}catch(error){if(error.code==='ENOENT')continue;throw error}if(!info.isFile())continue;const actual=await realpath(from);if(!actual.startsWith(root+path.sep))throw Error('文件指向项目之外：'+file);if(info.size>=100*1024*1024)throw Error('文件超过 GitHub 单文件限制：'+file);const data=await readFile(from);if(!data.includes(0)&&secrets.test(data.toString('utf8')))throw Error('检测到疑似凭据，已停止发布：'+file);const to=path.join(output,file);await mkdir(path.dirname(to),{recursive:true});await copyFile(from,to);count++;bytes+=info.size}
let publicReadme=path.join(root,'docs/public/README.md');try{await stat(publicReadme)}catch{publicReadme=path.join(root,'README.md')}
try{await copyFile(publicReadme,path.join(output,'README.md'))}catch(error){if(error.code!=='ENOENT')throw error;await writeFile(path.join(output,'README.md'),'# Iris小手机\n\n详见 [部署说明](docs/部署说明.md)。前端使用 GitHub Pages，后端在小手机「全局设置 → 部署」中一键搭建。\n')}
await writeFile(path.join(output,'scripts/distribution.js'),"window.IRIS_DISTRIBUTION={selfDeploy:true,repository:'https://github.com/weishengrongqing-commits/Iris'};\n");
await writeFile(path.join(output,'.nojekyll'),'');
for(const name of ['manifest.webmanifest','manifest-custom.webmanifest']){const file=path.join(output,'config',name),manifest=JSON.parse(await readFile(file,'utf8'));for(const key of ['id','start_url','scope'])manifest[key]='../';await writeFile(file,JSON.stringify(manifest,null,2)+'\n')}
// Live account and namespace identifiers are not needed by the browser deployment flow.
for(const name of ['cloudflare/wrangler.jsonc','cloudflare/background/wrangler.jsonc']){const file=path.join(output,name),config=JSON.parse(await readFile(file,'utf8'));delete config.account_id;delete config.routes;for(const item of config.kv_namespaces||[])item.id='YOUR_KV_NAMESPACE_ID';await writeFile(file,JSON.stringify(config,null,2)+'\n')}
console.log(JSON.stringify({output,files:count,megabytes:Math.round(bytes/1024/1024*10)/10,includesGitHistory:false,includesCname:false}));
