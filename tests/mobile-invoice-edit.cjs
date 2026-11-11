const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const src=fs.readFileSync('mobile.js','utf8');
const inv={id:'old',number:'INV-7',clientId:'c',clientName:'Client',date:'2026-01-01',dueDate:'2026-01-15',total:100,createdAt:1,terms:'Original terms',sourceType:'desktop',status:'Parcial',taxPercent:0,notes:'Old'};
const nodes={};for(const id of ['mInvClient','mInvStatus','mInvNumber','mInvDate','mInvDue','mInvType','mInvNotes','mInvPaymentMethod','mSaveInvoice'])nodes[id]={value:''};
Object.assign(nodes.mInvClient,{value:'c'});Object.assign(nodes.mInvNumber,{value:'INV-7'});Object.assign(nodes.mInvStatus,{value:'Pendiente'});Object.assign(nodes.mInvNotes,{value:'Updated'});
const writes=[],adds=[],alerts=[];
const ctx={state:{invoices:[inv],payments:[{invoiceId:'old',amount:40}]},editingInvoiceId:'old',invoiceSaving:false,invoiceLines:[{description:'Repair',qty:1,price:120}],$:id=>nodes[id],clientBy:()=>({id:'c',name:'Client'}),ensureLines:()=>{},invoiceCalc:()=>({subtotal:120,discount:0,ivu:0,total:120}),invoicePaid:()=>40,taxRate:()=>0,lineNet:l=>l.price,serverTimestamp:()=>999,docRef:(col,id)=>col+'/'+id,colRef:c=>c,updateDoc:async(ref,payload)=>writes.push({ref,payload}),addDoc:async(...args)=>{adds.push(args);return {id:'NEW'};},alert:m=>alerts.push(m),resetMobileInvoiceEditor:()=>{},renderAll:()=>{},openInvoiceDoc:()=>{}};
vm.createContext(ctx);vm.runInContext(src.slice(src.indexOf('async function saveInvoice(forcedStatus){'),src.indexOf('async function createAutoFollowupFromInvoice')),ctx);
(async()=>{
await ctx.saveInvoice('Pendiente');assert.equal(writes.length,1);assert.equal(writes[0].ref,'invoices/old');assert.equal(adds.length,0,'Editing must never create invoices or duplicate payments');assert.equal(writes[0].payload.status,'Parcial');assert.equal(writes[0].payload.notes,'Updated');assert.equal(writes[0].payload.createdAt,undefined);assert.equal(writes[0].payload.terms,undefined);assert.equal(writes[0].payload.sourceType,undefined);assert.equal(ctx.state.invoices[0].terms,'Original terms');assert.equal(ctx.state.invoices[0].createdAt,1);assert.equal(ctx.invoiceSaving,false);
ctx.invoiceCalc=()=>({total:30});await ctx.saveInvoice('Pendiente');assert.equal(writes.length,1);assert.match(alerts.pop(),/menor/);
ctx.invoiceCalc=()=>({total:120});ctx.updateDoc=async()=>{throw Error('Offline');};await ctx.saveInvoice('Pendiente');assert.equal(ctx.invoiceSaving,false);assert.equal(nodes.mSaveInvoice.disabled,false);assert.match(alerts.pop(),/Offline/);
assert.match(src,/data-edit-invoice/);assert.match(src,/function editMobileInvoice/);assert.match(src,/mCancelInvoiceEdit/);
console.log('PASS mobile invoice editing: update same ID, no duplicate invoice/payment, preserve metadata, partial balance, reject below paid amount, recover failed save');
})();
