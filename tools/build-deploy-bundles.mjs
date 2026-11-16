// Maintainer build step. End users deploy entirely from their browser.
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url),manifest={};
for(const [id,files] of Object.entries({music:['worker.js','music-statistics.js','statistics-page.js'],background:['background/worker.mjs','background/core.mjs','background/web-push.mjs']})){
 manifest[id]={main:id==='music'?'worker.js':'worker.mjs',files:[]};
 for(const file of files)manifest[id].files.push({name:file.split('/').at(-1),content:await readFile(new URL('cloudflare/'+file,root),'utf8')});
}
await writeFile(new URL('cloudflare/deploy/service-bundles.json',root),JSON.stringify(manifest));
console.log('已生成公开后端代码包；不包含任何私密配置。');
