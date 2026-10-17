import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root=resolve('dist'), port=Number(process.env.LAB_PORT||4173);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png'};
const server=http.createServer(async(req,res)=>{
  const path=new URL(req.url,'http://localhost').pathname;
  if(path==='/api/players') {
    const proxy=http.request({hostname:'127.0.0.1',port:8090,path:req.url,method:req.method,headers:{...req.headers,host:'127.0.0.1:8090'}},up=>{res.writeHead(up.statusCode,up.headers);up.pipe(res);});
    proxy.on('error',()=>{if(!res.headersSent)res.writeHead(503,{'Content-Type':'application/problem+json','Cache-Control':'no-store'});res.end(JSON.stringify({status:503,code:'BACKEND_UNREACHABLE'}));});
    req.pipe(proxy);return;
  }
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
  let file;try{file=resolve(root,'.'+decodeURIComponent(path==='/'?'/lab.html':path));}catch{res.writeHead(400);res.end();return;}
  if(!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  try{const bytes=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:bytes);}catch{res.writeHead(404);res.end('Not found');}
});
server.listen(port,'127.0.0.1',()=>console.log('Laboratorio PWA http://127.0.0.1:'+port+'/lab.html; backend loopback :8090'));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
