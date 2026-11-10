const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('ui-context.js','utf8').replace('export function','function');
const queue=[],events={},docEvents={};let view='billing';
const child={id:'list',scrollTop:240,scrollLeft:50};
const root={id:'billing',scrollTop:0,scrollLeft:0,querySelectorAll:()=>[child]};
const win={scrollX:0,scrollY:900,requestAnimationFrame:fn=>queue.push(fn),scrollTo({left,top}){this.scrollX=left;this.scrollY=top;},addEventListener:(type,fn)=>events[type]=fn};
const doc={hidden:false,getElementById:id=>id==='list'?child:root,addEventListener:(type,fn)=>docEvents[type]=fn};
const ctx={window:win,document:doc};vm.createContext(ctx);vm.runInContext(source,ctx);
const memory=ctx.createViewMemory({getView:()=>view,getRoot:()=>root,win,doc});
const flush=()=>{while(queue.length)queue.shift()();};
memory.save();memory.preserve(()=>{win.scrollY=0;child.scrollTop=0;child.scrollLeft=0;});flush();assert.equal(win.scrollY,900);assert.equal(child.scrollTop,240);assert.equal(child.scrollLeft,50);
view='reports';memory.recall();flush();assert.equal(win.scrollY,0);
view='billing';memory.recall();flush();assert.equal(win.scrollY,900);
events.blur();win.scrollY=0;events.focus();flush();assert.equal(win.scrollY,900);
const snapshot=memory.capture();view='followups';win.scrollY=333;memory.restore(snapshot);flush();assert.equal(win.scrollY,333,'A late completion must not navigate another module');
view='billing';memory.restore(snapshot);win.scrollY=150;docEvents.wheel();flush();assert.equal(win.scrollY,150,'User scrolling overrides scheduled restoration');
// Exercise the actual print action, including cancel and failed persistence.
const app=fs.readFileSync('app.js','utf8');
const start=app.indexOf("  $('printPreview').onclick=(event)=>");const end=app.indexOf("  $('backFromPreview').onclick",start);
(async()=>{
 for(const printed of [true,false])for(const fail of [false,true]){
  let handler,writes=0,returned=0,closed=0;
  const button={},w={document:{write(){},close(){}},addEventListener:(name,fn)=>handler=fn,close:()=>closed++};
  const state={previewHtml:'pdf',sharedPreviewHtml:'pdf',previewDocument:{type:'invoice',id:'i1'}};
  const c={state,previewOrigin:{view:'billing'},$:()=>button,open:()=>w,docPath:()=> 'invoices/i1',window:{focus(){}},confirm:()=>printed,alert(){},console:{error(){}},serverTimestamp:()=>1,updateDoc:async()=>{writes++;if(fail)throw Error('offline');},returnFromPreview:()=>returned++,setTimeout:fn=>fn()};
  vm.createContext(c);vm.runInContext(app.slice(start,end),c);button.onclick();handler();await new Promise(r=>setImmediate(r));
  assert.equal(writes,printed?1:0);assert.equal(returned,1);assert.equal(closed,1);
 }
 console.log('PASS: module positions, inner scroll, external return, navigation races, print yes/no and persistence failures');
})().catch(e=>{console.error(e);process.exitCode=1;});
