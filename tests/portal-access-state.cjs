const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../portal.js'),'utf8');
const fn=source.slice(source.indexOf('async function openPortal(token){'),source.indexOf("$('accessForm').onsubmit"));
const nodes={},node=id=>nodes[id]??={textContent:'',classList:{add(){},remove(){}}};
let timeout,callbacks,cleared=0,unsubscribed=0,rendered=0;
const ctx={Promise,Error,Object,console,db:{},doc:()=>'',onSnapshot:(_,next,error)=>{callbacks={next,error};return ()=>unsubscribed++;},setTimeout:cb=>{timeout=cb;return 1;},clearTimeout:()=>cleared++,$:node,localStorage:{setItem(){}},render:()=>rendered++,loadQuoteResponses:async()=>{}};
vm.createContext(ctx);vm.runInContext('let stopPortal=null,data=null,accessToken="";'+fn,ctx);
(async()=>{
 let result=vm.runInContext('openPortal("t1")',ctx);assert.match(node('loginMsg').textContent,/Abriendo/);timeout();await assert.rejects(result,/conexión/);assert.match(node('loginMsg').textContent,/vuelve a intentar/);assert.equal(unsubscribed,1);
 result=vm.runInContext('openPortal("t2")',ctx);callbacks.next({exists:()=>true,data:()=>({client:{id:'c1'},quotes:[]})});await result;assert.equal(node('loginMsg').textContent,'');assert.equal(rendered,1);
 callbacks.error({code:'permission-denied'});assert.match(node('loginMsg').textContent,/Entra con tu correo/);
 result=vm.runInContext('openPortal("t3")',ctx);callbacks.next({exists:()=>false});await assert.rejects(result,/Invitación/);assert.match(node('loginMsg').textContent,/invitación nueva/);
 assert.ok(cleared>=3);console.log('PASS: portal requests settle; timeout exposes retry; success clears status; permission loss clears access; invalid invitations fail explicitly.');
})().catch(e=>{console.error(e);process.exitCode=1;});
