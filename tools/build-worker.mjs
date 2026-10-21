import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
async function walk(dir) { const result=[]; for (const entry of await readdir(dir,{withFileTypes:true})) { const file=dir+'/'+entry.name; result.push(...(entry.isDirectory() ? await walk(file) : [file])); } return result; }
const paths=(await walk('dist')).filter(p=>!p.endsWith('/sw.js')).sort();
const hash=createHash('sha256'); for(const p of paths) hash.update(await readFile(p));
const version='gorilla-lab-shell-'+hash.digest('hex').slice(0,16);
const assets=paths.map(p=>'/'+p.slice(5));
const worker=`const CACHE=${JSON.stringify(version)}, ASSETS=${JSON.stringify(assets)};
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(names=>Promise.all(names.filter(n=>n.startsWith('gorilla-lab-shell-')&&n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const url=new URL(e.request.url);if(e.request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;
if(!ASSETS.includes(url.pathname))return;
e.respondWith(caches.open(CACHE).then(async c=>(await c.match(url.pathname))||fetch(e.request)));});
`;
await writeFile('dist/sw.js',worker); console.log('Service Worker:',version,assets.length,'compiled shell assets; API excluded');
