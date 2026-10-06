import {initializeApp,deleteApp} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import {initializeAuth,inMemoryPersistence,createUserWithEmailAndPassword,signOut} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import {getFirestore,doc,setDoc,onSnapshot,updateDoc,runTransaction,serverTimestamp} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';
import {firebaseConfig} from './firebase-config.js';
import {randomToken,employeeEmail,employeePassword,employeeKey,seal,unseal,employeeEventUpdate,whatsappNumber} from './employee-security.js';

export function createEmployeeCommand({db,uid,state,profile,clientBy,assetBy,serviceTitle,workOrderNumber,esc,dialog}){
  let timer,activeOwner='',generation=0,syncRunning=false,syncAgain=false;const watchers=new Map(),keys=new Map(),lastPayload=new Map(),processing=new Map(),provisioning=new Map();
  const ref=(id)=>doc(db,'clientPortals',id),teamRef=id=>doc(db,'users',uid(),'team',id),serviceRef=id=>doc(db,'users',uid(),'services',id);
  const enabled=t=>t.status!=='Inactivo'&&t.employeePortal?.enabled===true;
  const keyFor=async p=>{const id=p.id+':'+p.secret;if(!keys.has(id))keys.set(id,employeeKey(p.id,p.secret,p.pin));return keys.get(id);};
  function link(p,orderId=''){const u=new URL('employees/',location.href);u.searchParams.set('access',p.id);if(orderId)u.searchParams.set('order',orderId);u.hash=p.secret;return u.href;}
  async function provision(t){
    if(provisioning.has(t.id))return provisioning.get(t.id);
    const promise=doProvision(t);provisioning.set(t.id,promise);
    try{return await promise;}finally{provisioning.delete(t.id);}
  }
  async function doProvision(t){
    const owner=uid();
    if(enabled(t))return t.employeePortal;
    if(t.status==='Inactivo')throw new Error('Activa al empleado antes de crear su acceso.');
    const p={id:randomToken(),secret:randomToken(),pin:String(crypto.getRandomValues(new Uint32Array(1))[0]%1000000).padStart(6,'0'),enabled:true};
    const secondary=initializeApp(firebaseConfig,'employee-provision-'+p.id),employeeAuth=initializeAuth(secondary,{persistence:inMemoryPersistence});
    try{
      const credential=await createUserWithEmailAndPassword(employeeAuth,employeeEmail(p.id),employeePassword(p.secret,p.pin));p.authUid=credential.user.uid;
      if(uid()!==owner)throw new Error('La sesión administrativa cambió. Vuelve a entrar.');
      // Metadata and ciphertext are owned by the business. Employee writes are separate.
      const envelope=await seal(await keyFor(p),{business:business(),employeeName:t.name,orders:[]},'orders:'+p.id);
      if(uid()!==owner)throw new Error('La sesión administrativa cambió.');
      await setDoc(ref(p.id),{kind:'employee-orders-v1',ownerId:owner,enabled:true,envelope,updatedAt:serverTimestamp()});
      if(uid()!==owner)throw new Error('La sesión administrativa cambió.');
      await updateDoc(teamRef(t.id),{employeePortal:p});t.employeePortal=p;
      return p;
    }finally{await signOut(employeeAuth).catch(()=>{});await deleteApp(secondary).catch(()=>{});}
  }
  function business(){const p=profile();return {name:p.businessName||'Nexus',phone:p.phone||'',logo:p.logoPdf||p.logoDashboard||''};}
  function order(s){
    const c=clientBy(s.clientId)||{},a=assetBy(s.assetId)||{};
    return {id:s.id,dispatchKey:s.employeeDispatchKey,responseId:'employee-response-'+s.employeeDispatchKey,number:workOrderNumber(s),title:serviceTitle(s),date:s.date||'',time:s.scheduledTime||'',status:s.status||'Pendiente',priority:s.priority||'Normal',client:{name:s.clientName||'',phone:c.phone||'',address:s.workAddress||c.address||'',city:c.city||'',accessNotes:c.accessNotes||'',gpsUrl:c.gpsUrl||''},asset:[s.assetName,a.brand,a.model,a.serial?'Serial: '+a.serial:'',a.location].filter(Boolean).join(' · '),instructions:s.instructions||'',fields:s.fields||[],items:(s.items||[]).map(x=>({description:x.description||'',qty:x.qty??1})),completion:s.completion?{date:s.completion.date||'',report:s.completion.report||'',materials:s.completion.materials||'',receivedBy:s.completion.receivedBy||''}:null,issue:s.employeeIssue?{date:s.employeeIssue.date||'',report:s.employeeIssue.report||''}:null};
  }
  async function publish(t){
    const owner=uid(),p=t.employeePortal;if(!enabled(t)||!owner)return;
    const orders=state.services.filter(s=>s.teamId===t.id&&s.employeePortalId===p.id&&s.employeeDispatchKey).map(order).sort((a,b)=>b.date.localeCompare(a.date));
    // Evidence stays on the original service/response; the portal index stays compact.
    const visible=[...orders.filter(s=>!['Completado','Facturado'].includes(s.status)),...orders.filter(s=>['Completado','Facturado'].includes(s.status)).slice(0,30)];
    const payload={business:business(),employeeName:t.name,orders:visible};const serialized=JSON.stringify(payload);
    if(lastPayload.get(p.id)===serialized)return;
    if(serialized.length>650000)throw new Error('Reduce las evidencias o archiva órdenes antiguas antes de sincronizar.');
    const envelope=await seal(await keyFor(p),payload,'orders:'+p.id);
    if(uid()!==owner)throw new Error('La sesión administrativa cambió.');
    await setDoc(ref(p.id),{kind:'employee-orders-v1',ownerId:owner,enabled:true,envelope,updatedAt:serverTimestamp()});lastPayload.set(p.id,serialized);
  }
  async function dispatch(id){
    const s=state.services.find(x=>x.id===id),t=s&&state.team.find(x=>x.id===s.teamId);
    if(!s||!t)throw new Error('Asigna un empleado al servicio antes de compartirlo.');
    const phone=whatsappNumber(t.phone);const p=await provision(t);
    if(s.employeePortalId!==p.id||!s.employeeDispatchKey){
      const fields={employeePortalId:p.id,employeeDispatchKey:randomToken(),employeeLastEventId:'',dispatchedAt:serverTimestamp()};
      await updateDoc(serviceRef(s.id),fields);Object.assign(s,fields);
    }
    await publish(t);schedule();
    const message=`${profile().businessName||'Nexus'}\nOrden de trabajo ${workOrderNumber(s)}\nCliente: ${s.clientName}\nFecha: ${s.date||'Por coordinar'} ${s.scheduledTime||''}\n${serviceTitle(s)}\n\nAbre tu orden y utiliza tu PIN personal:\n${link(p,s.id)}\n\nAl terminar, pulsa Completar servicio y registra tu informe.`;
    return 'https://wa.me/'+phone+'?text='+encodeURIComponent(message);
  }
  async function receive(s,t,snap,ownerAtStart){
    const p=t.employeePortal;if(!snap.exists()||!enabled(t)||uid()!==ownerAtStart)return;
    const data=snap.data();if(data.ownerId!==p.authUid||data.kind!=='employee-response-v1')return;
    const event=await unseal(await keyFor(p),data.envelope,'response:'+snap.id);
    if(uid()!==ownerAtStart)return;
    let changed=false;
    await runTransaction(db,async tx=>{
      const sr=serviceRef(s.id),tr=teamRef(t.id),[ss,ts]=await Promise.all([tx.get(sr),tx.get(tr)]);
      if(!ss.exists()||!ts.exists())return;
      const fresh={id:s.id,...ss.data()},freshTeam=ts.data();
      if(!enabled(freshTeam)||freshTeam.employeePortal.id!==p.id||fresh.teamId!==t.id||fresh.employeePortalId!==p.id)return;
      const updates=employeeEventUpdate(event,fresh);if(!updates)return;
      tx.update(sr,{...updates,...(event.action==='complete'?{completedAt:serverTimestamp()}:event.action==='start'?{startedAt:serverTimestamp()}:{}),updatedAt:serverTimestamp()});changed=true;
    });
    if(changed)status('Reporte del empleado sincronizado.');
  }
  function status(text,error=false){const el=document.getElementById('employeeSyncStatus');if(el){el.textContent=text;el.classList.toggle('employee-error',error);}}
  async function sync(){
    if(syncRunning){syncAgain=true;return;}
    syncRunning=true;try{await doSync();}finally{syncRunning=false;if(syncAgain){syncAgain=false;schedule();}}
  }
  async function doSync(){
    const owner=uid();if(activeOwner&&owner!==activeOwner)reset();activeOwner=owner;if(!owner)return;
    const currentGeneration=generation;
    const expected=new Set();
    for(const t of state.team.filter(enabled)){
      const p=t.employeePortal;
      for(const s of state.services.filter(s=>s.teamId===t.id&&s.employeePortalId===p.id&&s.employeeDispatchKey&&!['Completado','Facturado'].includes(s.status))){
        const id='employee-response-'+s.employeeDispatchKey;expected.add(id);
        if(!watchers.has(id))watchers.set(id,onSnapshot(ref(id),snap=>{
          const chain=processing.get(id)||Promise.resolve();const task=chain.then(()=>receive(s,t,snap,owner)).catch(e=>status('No se pudo sincronizar el reporte: '+e.message,true));processing.set(id,task);
        },e=>status('No se pudo leer el cierre del empleado: '+e.message,true)));
      }
      if(currentGeneration!==generation)return;
      try{await publish(t);}catch(e){status('Portal pendiente de sincronizar: '+e.message,true);}
    }
    for(const [id,stop] of watchers)if(!expected.has(id)){stop();watchers.delete(id);processing.delete(id);}
  }
  function reset(){clearTimeout(timer);generation++;for(const stop of watchers.values())stop();watchers.clear();keys.clear();lastPayload.clear();processing.clear();provisioning.clear();activeOwner='';document.getElementById('serviceCommandDialog')?.remove();}
  function schedule(){clearTimeout(timer);timer=setTimeout(sync,300);}
  async function manage(id){
    const t=state.team.find(t=>t.id===id);if(!t)return;
    const p=await provision(t);await publish(t);
    const d=dialog('Acceso del empleado',`<p><b>${esc(t.name)}</b></p><p>PIN personal: <strong class="employee-pin">${esc(p.pin)}</strong></p><p class="muted">Entrega el PIN al empleado. El enlace abre únicamente sus órdenes; el PIN protege el contenido.</p><input class="employee-link" readonly value="${esc(link(p))}" aria-label="Enlace del portal"><div class="actions"><button type="button" data-copy-employee>Copiar enlace</button><button type="button" data-revoke-employee class="danger">Desactivar acceso</button></div><p data-access-message role="status"></p>`);
    d.querySelector('[data-copy-employee]').onclick=async()=>{try{await navigator.clipboard.writeText(link(p));d.querySelector('[data-access-message]').textContent='Enlace copiado.';}catch{d.querySelector('.employee-link').select();d.querySelector('[data-access-message]').textContent='Selecciona y copia el enlace.';}};
    d.querySelector('[data-revoke-employee]').onclick=async e=>{e.currentTarget.disabled=true;try{await updateDoc(ref(p.id),{enabled:false});await updateDoc(teamRef(t.id),{'employeePortal.enabled':false});t.employeePortal.enabled=false;schedule();d.close();}catch(err){e.currentTarget.disabled=false;d.querySelector('[data-access-message]').textContent=err.message;}};
  }
  return {dispatch,manage,schedule,reset};
}
