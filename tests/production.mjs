import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium,expect} from '@playwright/test';
const root=resolve('dist');
const server=createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');const relative=decodeURIComponent(url.pathname).replace(/^\/revamp\//,'');const file=resolve(root,relative||'index.html');if(!file.startsWith(root+'/'))throw new Error('Invalid path');const body=await readFile(file);const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json'};res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream'});res.end(body);}catch{res.writeHead(404);res.end('Not found');}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch();
try{const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});await page.goto(`http://127.0.0.1:${server.address().port}/revamp/`);await expect(page.locator('.demo-card .demo-title')).toHaveCount(9);await page.locator('#demo-comparison').getByRole('button',{name:'Overtaking',exact:true}).click();await expect(page.locator('#demo-comparison .interpretation')).toContainText('overtaking');await page.waitForTimeout(500);expect(errors).toEqual([]);console.log('Production smoke passed under /revamp/: all nine demos and relative JSON assets load.');}finally{await browser.close();server.close();}
