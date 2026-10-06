const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8');
const block=(a,b)=>source.slice(source.indexOf(a),source.indexOf(b,source.indexOf(a)));
const fixtures={services:[{id:'ABC123',clientId:'c1',clientName:'Cliente',title:'Mantenimiento',teamId:'t1',teamName:'Empleado',date:'2026-10-06',status:'Pendiente',amount:150,items:[{description:'Limpieza',qty:2,price:75}],fields:[]}],invoices:[]};
const records=new Map([['services/ABC123',{...fixtures.services[0]}]]),alerts=[];let writes=0,queue=Promise.resolve();
const ctx={state:fixtures,db:{},alert:m=>alerts.push(m),show:()=>{},previewInvoice:()=>{},canCreate:()=>true,docPath:(c,id)=>c+'/'+id,serverTimestamp:()=>123,today:()=> '2026-10-06',plusDays:()=> '2026-10-21',profile:()=>({tax:'11.5'}),industry:()=>({service:'Servicio',serviceFields:[]}),clientBy:()=>({phone:'7870000000',address:'Trujillo Alto'}),assetBy:()=>({}),runTransaction:(_,callback)=>{
  const pending=queue.then(()=>callback({get:async ref=>({exists:()=>records.has(ref),data:()=>records.get(ref)}),set:(ref,data)=>{writes++;records.set(ref,data);},update:(ref,data)=>records.set(ref,{...records.get(ref),...data})}));queue=pending.catch(()=>{});return pending;
}};
vm.createContext(ctx);
vm.runInContext(block('function serviceTitle(s){','function invoiceTotals(inv){')+block('async function createInvoice(serviceId){','function docHeader')+source.slice(source.indexOf('function serviceInvoice(s){'),source.indexOf('function serviceDialog('))+source.slice(source.indexOf('async function startServiceWork(id){')),ctx);
(async()=>{
  await ctx.createInvoice('ABC123');assert.equal(writes,0);assert.match(alerts.pop(),/Completa/);
  await ctx.startServiceWork('ABC123');assert.equal(records.get('services/ABC123').status,'En proceso');
  records.set('services/ABC123',{...fixtures.services[0],status:'Completado',completion:{report:'Lavado y prueba operacional'}});fixtures.services[0].status='Completado';
  await Promise.all([ctx.createInvoice('ABC123'),ctx.createInvoice('ABC123')]);
  assert.equal(writes,1,'Repeated invoicing must create one document');
  const invoice=records.get('invoices/service-ABC123');assert.equal(invoice.subtotal,150);assert.equal(invoice.ivu,17.25);assert.equal(invoice.total,167.25);assert.equal(invoice.notes,'Lavado y prueba operacional');assert.equal(invoice.items.length,1);assert.equal(records.get('services/ABC123').status,'Facturado');
  fixtures.services[0].id='LEGACY';fixtures.services[0].items=[];fixtures.services[0].amount=95;
  records.set('services/LEGACY',{...fixtures.services[0]});await ctx.createInvoice('LEGACY');assert.equal(records.get('invoices/service-LEGACY').items[0].price,95);
  const sections=ctx.workOrderSections(fixtures.services[0]);assert.ok(sections.some(([title,text])=>title==='CLIENTE Y UBICACIÓN'&&text.includes('Trujillo Alto')));assert.ok(!sections.some(([,text])=>text.includes('$')),'Employee order excludes financial values');
  const unassigned={...fixtures.services[0],id:'UNASSIGNED',teamId:'',status:'Pendiente'};records.set('services/UNASSIGNED',unassigned);await ctx.startServiceWork('UNASSIGNED');assert.equal(records.get('services/UNASSIGNED').status,'Pendiente');assert.match(alerts.pop(),/Asigna/);
  console.log('PASS: completion gate, start assignment, duplicate invoice prevention, tax and item transfer, legacy amount, work order details.');
})().catch(e=>{console.error(e);process.exitCode=1;});
