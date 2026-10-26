const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
const {createPortalSyncScheduler:create}=await import('data:text/javascript;base64,'+Buffer.from(fs.readFileSync(require('node:path').join(__dirname,'../portal-sync.js'),'utf8')).toString('base64'));
let owner='o',ready=false,called=[],jobs=[],inflight=null,fail=false;
const state={clients:[{id:'a',portalEnabled:true,portalToken:'A'},{id:'b',portalEnabled:true,portalToken:'B'}],invoices:[{id:'i1',clientId:'a',total:100}],payments:[]};
const s=create({getState:()=>state,getOwner:()=>owner,isReady:()=>ready,syncClient:async id=>{called.push(id);if(fail)throw Error('offline');if(inflight)await inflight;},onError(){},setTimer:(fn,wait)=>{const job={fn,wait};jobs.push(job);return job;},clearTimer:job=>jobs=jobs.filter(j=>j!==job)});
const tick=()=>new Promise(r=>setImmediate(r));const drain=async()=>{const j=jobs.shift();assert.ok(j,'scheduled update');j.fn();await tick();return j;};
s.observe('clients',state.clients);s.observe('invoices',state.invoices);assert.equal(jobs.length,0);ready=true;s.flush();assert.equal(jobs.length,1);await drain();assert.deepEqual(called.sort(),['a','b']);called=[];
state.invoices=[{id:'i1',clientId:'a',total:1450}];s.observe('invoices',state.invoices);const first=jobs[0];s.observe('invoices',state.invoices);assert.equal(jobs[0],first,'changes do not restart the timer');assert.equal(first.wait,400);await drain();assert.deepEqual(called,['a']);called=[];
state.payments=[{id:'p1',invoiceId:'i1',amount:50}];s.observe('payments',state.payments);await drain();assert.deepEqual(called,['a']);called=[];
let release;inflight=new Promise(r=>release=r);state.invoices[0].total=1500;s.observe('invoices',state.invoices);await drain();state.invoices[0].total=1600;s.observe('invoices',state.invoices);assert.equal(jobs.length,0);release();inflight=null;await tick();assert.equal(jobs.length,1);await drain();assert.deepEqual(called,['a','a']);called=[];
fail=true;state.invoices[0].total=1700;s.observe('invoices',state.invoices);await drain();assert.equal(jobs[0].wait,2000);fail=false;await drain();assert.deepEqual(called,['a','a']);called=[];
state.invoices=[];s.observe('invoices',state.invoices);await drain();assert.deepEqual(called,['a']);called=[];
s.markAll();owner='other';s.reset();assert.equal(jobs.length,0);s.flush();assert.equal(jobs.length,0);
console.log('PASS: initial loading gate, targeted invoice/payment updates, no timer starvation, serialized in-flight changes, transient retries, deletions and account isolation.');
})().catch(e=>{console.error(e);process.exitCode=1});
