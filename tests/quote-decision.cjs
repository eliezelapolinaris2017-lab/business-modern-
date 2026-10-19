const {chromium}=require('playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:390,height:844}});
let source=fs.readFileSync('portal.js','utf8');
source=source.slice(source.indexOf('const $='),source.indexOf('async function openPortal('))+source.slice(source.indexOf('function decisionReceipt('));
await page.setContent('<div id="portalApp"></div>');
await page.addScriptTag({content:`const db={};const doc=(...x)=>x;const serverTimestamp=()=>123;let writes=[];const writeBatch=()=>({set:(...x)=>writes.push(['set',...x]),update:(...x)=>writes.push(['update',...x]),commit:async()=>{}});${source}\ndata={ownerId:'owner',quotes:[{id:'q1',number:'COT-1',total:650,status:'Enviada'}]};accessToken='private';render=()=>{};openDecision('q1');`});
await page.click('button[value=accept]');assert.equal(await page.locator('dialog').count(),1);
await page.fill('input[name=signer]','Cliente Prueba');await page.click('button[value=accept]');assert.match(await page.locator('[data-message]').innerText(),/Dibuje/);
const box=await page.locator('canvas').boundingBox();await page.mouse.move(box.x+20,box.y+30);await page.mouse.down();await page.mouse.move(box.x+100,box.y+60,{steps:12});await page.mouse.up();await page.check('input[name=consent]');await page.click('button[value=accept]');
await page.waitForFunction(()=>!document.querySelector('dialog'));
const result=await page.evaluate(()=>({writes,decision:data.quotes[0].clientDecision}));assert.equal(result.writes.length,2);assert.equal(result.decision.status,'Aprobada');assert.match(result.decision.signature,/^data:image\/png;base64,/);
await page.evaluate(()=>{data.quotes[0].clientDecision=null;openDecision('q1')});await page.fill('input[name=signer]','Cliente Prueba');await page.fill('textarea','No estoy de acuerdo');await page.click('button[value=reject]');await page.waitForFunction(()=>!document.querySelector('dialog'));assert.equal(await page.evaluate(()=>data.quotes[0].clientDecision.status),'Rechazada');
await browser.close();console.log('PASS: mobile signature, missing consent/signature validation, atomic acceptance, rejection without signature.');
})().catch(e=>{console.error(e);process.exit(1)});
