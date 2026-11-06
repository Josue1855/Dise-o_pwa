import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root=resolve('dist'), port=Number(process.env.LAB_PORT||4173);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.ttf':'font/ttf','.svg':'image/svg+xml','.png':'image/png'};
const server=http.createServer(async(req,res)=>{
  const path=new URL(req.url,'http://localhost').pathname;
  const players=path==='/api/players';
  const technical=path.startsWith('/api/')||path.startsWith('/mobile/')||path==='/prepare'||path.startsWith('/prepare/');
  if(players||technical) {
    const backendPort=players?Number(process.env.PLAYERS_PORT||8090):Number(process.env.CONTROL_PORT||8080);
    const proxy=http.request({hostname:'127.0.0.1',port:backendPort,path:req.url,method:req.method,headers:{...req.headers,host:'127.0.0.1:'+backendPort}},up=>{res.writeHead(up.statusCode,up.headers);up.pipe(res);});
    proxy.on('error',()=>{if(!res.headersSent)res.writeHead(503,{'Content-Type':'application/problem+json','Cache-Control':'no-store'});res.end(JSON.stringify({status:503,code:'BACKEND_UNREACHABLE'}));});
    req.pipe(proxy);return;
  }
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
  // El worker reserva / para el control: el laboratorio usa su URL explícita.
  if(path==='/'&&!process.env.PWA_ENTRY){res.writeHead(302,{'Location':'/lab.html','Cache-Control':'no-store'});res.end();return;}
  let file;try{file=resolve(root,'.'+decodeURIComponent(path==='/'?(process.env.PWA_ENTRY||'/lab.html'):path));}catch{res.writeHead(400);res.end();return;}
  if(!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  try{const bytes=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:bytes);}catch{res.writeHead(404);res.end('Not found');}
});
server.listen(port,'127.0.0.1',()=>console.log('PWA http://127.0.0.1:'+server.address().port+(process.env.PWA_ENTRY||'/lab.html')+'; proxies loopback: jugadores :'+(process.env.PLAYERS_PORT||8090)+', control :'+(process.env.CONTROL_PORT||8080)));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
