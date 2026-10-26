const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
const source=fs.readFileSync(require('node:path').join(__dirname,'../portal.js'),'utf8');
const dom=new JSDOM('<button id="origin">Factura</button><main id="retained">Mi historial</main>',{url:'https://example.test/portal/'});
dom.window.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};dom.window.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
const context={document:dom.window.document,window:dom.window,URL,URLSearchParams,Intl,Date,console,alert:msg=>{throw Error(msg)}};vm.createContext(context);
const functions=source.slice(source.indexOf('const $='),source.indexOf('async function openPortal(')).replaceAll('import.meta.url',"'https://example.test/portal.js'")+source.slice(source.indexOf('function decisionReceipt('));
vm.runInContext(functions,context);
context.fixture={business:{name:'Oasis'},client:{name:'Cliente'},invoices:[{id:'i',number:'FAC-1',total:1450}],quotes:[{id:'q',number:'COT-1',status:'Cancelada'}],contracts:[{id:'c',number:'CT-1',body:'Contrato original'}],payments:[{id:'p',amount:50}],sharedDocument:{type:'invoice',id:'i'},printHtml:'<article>FACTURA ORIGINAL</article>'};vm.runInContext('data=fixture;',context);
for(const key of ['invoice:i','quote:q','contract:c','payment:p']){
 const origin=dom.window.document.getElementById('origin');origin.focus();
 vm.runInContext(`printPortalDocument('${key}')`,context);
 const modal=dom.window.document.querySelector('dialog'),back=modal.querySelector('[data-back-portal]'),print=modal.querySelector('[data-print-current]'),frame=modal.querySelector('iframe');
 assert.match(back.textContent,/Volver a Mi Oasis/);assert.equal(dom.window.document.activeElement,back);assert.equal(print.disabled,true);
 if(key.startsWith('invoice'))assert.match(frame.srcdoc,/FACTURA ORIGINAL/);
 assert.equal(frame.sandbox?.contains?.('allow-scripts')||frame.getAttribute('sandbox').includes('allow-scripts'),false);
 let printed=0;frame.contentWindow.focus=()=>{};frame.contentWindow.print=()=>printed++;frame.onload();print.click();assert.equal(printed,1);
 back.click();assert.equal(dom.window.document.querySelector('dialog'),null);assert.equal(dom.window.document.activeElement,origin);assert.equal(dom.window.document.getElementById('retained').textContent,'Mi historial');
}
vm.runInContext("printPortalDocument('invoice:i')",context);const modal=dom.window.document.querySelector('dialog');modal.dispatchEvent(new dom.window.Event('cancel',{cancelable:true}));assert.equal(dom.window.document.querySelector('dialog'),null);
console.log('PASS: all document kinds have in-app return; print preserves viewer; original invoice retained; return/Escape preserve portal and restore focus; embedded scripts blocked.');
