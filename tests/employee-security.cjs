const {readFile}=require('node:fs/promises'),assert=require('node:assert/strict');
(async()=>{
 const code=await readFile(require('node:path').join(__dirname,'../employee-security.js'),'utf8');const security=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
 const id=security.randomToken(),secret=security.randomToken(),key=await security.employeeKey(id,secret,'123456');
 const envelope=await security.seal(key,{client:'Cliente',address:'Dirección privada'},'orders:'+id);
 assert.ok(!JSON.stringify(envelope).includes('Dirección privada'));assert.equal((await security.unseal(key,envelope,'orders:'+id)).client,'Cliente');
 await assert.rejects(security.unseal(await security.employeeKey(id,secret,'654321'),envelope,'orders:'+id));
 await assert.rejects(security.unseal(key,envelope,'response:other-order'));
 const service={id:'service-1',employeeDispatchKey:security.randomToken(),teamId:'t1',teamName:'Empleado',status:'Pendiente',items:[{price:75,qty:2}],amount:150};
 const event={version:1,eventId:security.randomToken(),serviceId:service.id,dispatchKey:service.employeeDispatchKey,action:'complete',date:'2026-10-06',report:'Lavado y prueba',materials:'Pastilla',receivedBy:'Cliente',photos:[]};
 const update=security.employeeEventUpdate(event,service);assert.equal(update.status,'Completado');assert.equal(update.completion.report,'Lavado y prueba');assert.ok(!('items' in update));assert.ok(!('amount' in update));assert.ok(!('invoiceId' in update));
 assert.throws(()=>security.employeeEventUpdate({...event,dispatchKey:security.randomToken()},service));
 assert.throws(()=>security.employeeEventUpdate({...event,report:''},service));
 assert.throws(()=>security.employeeEventUpdate({...event,photos:['data:text/html;base64,eA==']},service));
 assert.equal(security.employeeEventUpdate(event,{...service,status:'Facturado'}),null);assert.equal(security.employeeEventUpdate(event,{...service,status:'Completado'}),null);assert.equal(security.employeeEventUpdate(event,{...service,employeeLastEventId:event.eventId}),null);
 assert.equal(security.whatsappNumber('(787) 555-1234'),'17875551234');assert.throws(()=>security.whatsappNumber('123'));
 console.log('PASS: encryption, wrong PIN, cross-order replay, current assignment, closure validation, evidence limits, financial isolation and WhatsApp number.');
})().catch(e=>{console.error(e);process.exitCode=1;});
