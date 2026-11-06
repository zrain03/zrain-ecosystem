/*
 * Fail / File: tool-runtime/src/serve.mjs
 * Pembangun / Developer: Zrain
 * Dicipta / Created: Unverified (latest approved Zrain Tools v2.4.0 source)
 * Dikemas kini / Last updated: 2026-11-05
 * BM: Mengekalkan implementasi fungsi Tools terkini dengan sempadan keselamatan browser.
 * EN: Preserves the latest approved Tools implementation and browser security boundaries.
 */
import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {join,resolve,extname,sep} from 'node:path';
const root=resolve(import.meta.dirname,'../dist');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.webp':'image/webp','.json':'application/json'};
const server=http.createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname,full=resolve(join(root,decodeURIComponent(path)));if(!full.startsWith(root+sep)&&full!==root)throw Error('Invalid path');const target=(await stat(full)).isDirectory()?join(full,'index.html'):full;res.writeHead(200,{'Content-Type':types[extname(target)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});res.end(await readFile(target))}catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found')}});
const port=Number(process.env.PORT)||8080;
server.listen(port,'127.0.0.1',()=>console.log(`Open http://127.0.0.1:${port} in your browser. Press Ctrl+C to stop.`));
