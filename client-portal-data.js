// Publicar solamente campos del cliente seleccionado; nunca copiar registros internos completos.
export function buildClientPortalPayload({state,client,ownerId,token,business,serialize={}}){
  if(!client?.id||!ownerId||!token)throw new Error('Cliente y acceso requeridos.');
  const own=key=>(state[key]||[]).filter(x=>x.clientId===client.id);
  const newest=rows=>rows.sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
  const invoices=own('invoices'),invoiceIds=new Set(invoices.map(x=>x.id));
  const payments=(state.payments||[]).filter(p=>invoiceIds.has(p.invoiceId));
  const paid=id=>payments.filter(p=>p.invoiceId===id).reduce((sum,p)=>sum+Number(p.amount||0),0);
  const items=row=>(row.items||[]).map(i=>({description:i.description||i.desc||'',qty:Number(i.qty??1),price:Number(i.price||0),discount:Number(i.discount||0),taxable:i.taxable!==false,total:Number(i.total??Number(i.qty??1)*Number(i.price||0))}));
  const invoice=serialize.invoice||(i=>({id:i.id,number:i.number||'',date:i.date||'',dueDate:i.dueDate||'',serviceTitle:i.serviceTitle||'',status:i.status||'Pendiente',total:Number(i.total||0),subtotal:Number(i.subtotal??i.total??0),tax:Number(i.tax??i.ivu??0),paid:paid(i.id),balance:i.status==='Cancelada'?0:Math.max(0,Number(i.total||0)-paid(i.id)),items:items(i),notes:i.notes||'',terms:i.terms||''}));
  const quote=serialize.quote||(q=>({id:q.id,number:q.number||'',date:q.date||'',validUntil:q.validUntil||'',title:q.title||'',status:q.status||'Borrador',total:Number(q.total||0),items:items(q),notes:q.notes||'',terms:q.terms||'',clientDecision:q.clientDecision||null}));
  const service=serialize.service||(s=>({id:s.id,date:s.date||'',title:s.title||s.items?.[0]?.description||'Servicio',status:s.status||'Pendiente',assetName:s.assetName||'',amount:Number(s.amount||0),scheduledTime:s.scheduledTime||'',location:s.workAddress||'',completedAt:s.completion?.date||'',report:s.completion?.report||''}));
  const asset=serialize.asset||(a=>({id:a.id,name:a.name||a.fields?.[0]||'Equipo',brand:a.brand||'',model:a.model||'',serial:a.serial||'',location:a.location||'',status:a.status||'',warrantyExpiration:a.warrantyExpirationDate||a.warrantyExpiration||a.expirationDate||'',nextMaintenance:a.nextMaintenanceDate||a.nextMaintenance||''}));
  const maintenance=serialize.maintenance||(f=>({id:f.id,dueDate:f.dueDate||'',title:f.title||f.type||'Mantenimiento',type:f.type||'',status:f.status||'Programado',assetId:f.assetId||'',assetName:f.assetName||(state.assets||[]).find(a=>a.id===f.assetId)?.name||''}));
  const mappedInvoices=newest(invoices.map(invoice));
  return {schemaVersion:117,ownerId,token,enabled:true,updatedAt:new Date().toISOString(),business,
    client:{id:client.id,name:client.name||'',email:client.email||'',phone:client.phone||'',city:client.city||'',address:client.address||''},
    quoteExpires:Object.fromEntries(own('quotes').map(q=>[q.id,serialize.quoteExpiry?serialize.quoteExpiry(q):q.validUntil?new Date(q.validUntil+'T23:59:59-04:00'):new Date('2100-01-01T00:00:00Z')])),
    quoteRevisions:Object.fromEntries(own('quotes').map(q=>[q.id,q.updatedAt||null])),
    invoices:mappedInvoices,quotes:newest(own('quotes').map(quote)),services:newest(own('services').map(service)),assets:own('assets').map(asset),
    maintenance:own('followups').filter(f=>/mantenimiento|grooming/i.test(f.type||'')).map(maintenance).sort((a,b)=>String(a.dueDate).localeCompare(String(b.dueDate))),
    payments:newest(payments.map(p=>({id:p.id,date:p.date||'',invoiceId:p.invoiceId,invoiceNumber:invoices.find(i=>i.id===p.invoiceId)?.number||'',method:p.method||'',amount:Number(p.amount||0)}))),
    contracts:newest(own('contracts').map(c=>({id:c.id,number:c.number||'',date:c.date||'',title:c.service||'Contrato de servicio',body:c.body||'',startDate:c.startDate||'',endDate:c.endDate||'',amount:String(c.amount||''),status:c.status||'Registrado'}))),
    summary:{services:own('services').length,assets:own('assets').length,invoices:invoices.length,paid:payments.reduce((sum,p)=>sum+Number(p.amount||0),0),balance:mappedInvoices.filter(i=>i.status!=='Cancelada').reduce((sum,i)=>sum+i.balance,0)}
  };
}
