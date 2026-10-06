import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import {initializeAuth,inMemoryPersistence,signInWithEmailAndPassword,signOut} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import {getFirestore,doc,getDoc,onSnapshot,serverTimestamp,runTransaction} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';
import {firebaseConfig} from '../firebase-config.js';
import {employeeEmail,employeePassword,employeeKey,seal,unseal,randomToken,validateEmployeeEvent} from '../employee-security.js';
const app=initializeApp(firebaseConfig,'employee-portal'),auth=initializeAuth(app,{persistence:inMemoryPersistence}),db=getFirestore(app);
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const url=new URL(location.href);
if(!url.searchParams.get('access')){try{const stored=JSON.parse(localStorage.getItem('nexusEmployeeAccess')||'null');if(stored?.id&&stored?.secret){url.searchParams.set('access',stored.id);url.hash=stored.secret;history.replaceState(null,'',url.href);}}catch{}}
const portalId=url.searchParams.get('access')||'',secret=url.hash.slice(1),focusOrder=url.searchParams.get('order');
let key,data,stop,tab='active',pending=new Map(),dialogOrder='',dialogAction='',photos=[],loadingPhotos=false,viewVersion=0,locked=true,photoVersion=0,submitting=false;
function localDate(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function message(id,text,error=false){$(id).textContent=text;$(id).classList.toggle('error',error);}
function safeUrl(value){try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:'';}catch{return '';}}
function photoHtml(list){return (list||[]).filter(p=>typeof p==='string'&&/^data:image\/jpeg;base64,/.test(p)&&p.length<=140000).map(p=>`<img src="${esc(p)}" alt="Evidencia del servicio">`).join('');}
function mergedOrders(){return (data?.orders||[]).map(order=>({...order,...(pending.get(order.id)||{})}));}
function render(){
  $('businessName').textContent=data.business?.name||'Mis órdenes de trabajo';$('employeeName').textContent=data.employeeName||'';
  const logo=data.business?.logo||'';if(logo.startsWith('data:image/')||safeUrl(logo)){ $('businessLogo').src=logo;$('businessLogo').hidden=false;}else $('businessLogo').hidden=true;
  const orders=mergedOrders(),closed=orders.filter(o=>['Completado','Facturado'].includes(o.status));
  $('summary').innerHTML=`<div><strong>${orders.length-closed.length}</strong><span>Por realizar</span></div><div><strong>${orders.filter(o=>o.status==='En proceso').length}</strong><span>En proceso</span></div><div><strong>${closed.length}</strong><span>Completadas</span></div>`;
  $('orders').innerHTML=orders.filter(o=>(tab==='closed')===['Completado','Facturado'].includes(o.status)).sort((a,b)=>a.id===focusOrder?-1:b.id===focusOrder?1:a.date.localeCompare(b.date)).map(o=>{
    const complete=['Completado','Facturado'].includes(o.status),address=[o.client.address,o.client.city].filter(Boolean).join(', '),gps=safeUrl(o.client.gpsUrl)||'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(address),phone=String(o.client.phone||'').replace(/[^+\d]/g,'');
    return `<article class="order" id="order-${esc(o.id)}"><div class="order-header"><div><span class="order-number">${esc(o.number)}</span><h2>${esc(o.title)}</h2></div><span class="status ${complete?'completed':''}">${esc(o.status)}</span></div><p class="meta">${esc(o.date)} ${esc(o.time)} · ${esc(o.priority)}</p><div class="location"><b>${esc(o.client.name)}</b><p>${esc(address||'Dirección por coordinar')}</p>${o.client.accessNotes?`<p>Acceso: ${esc(o.client.accessNotes)}</p>`:''}<div class="actions">${address||o.client.gpsUrl?`<a class="action" href="${esc(gps)}" target="_blank" rel="noopener">Cómo llegar</a>`:''}${phone?`<a class="action" href="tel:${esc(phone)}">Llamar al cliente</a>`:''}</div></div>${o.asset?`<p class="meta">${esc(o.asset)}</p>`:''}<p class="instructions">${esc(o.instructions||'Realiza el trabajo indicado y documenta el resultado.')}</p>${o.items.length?`<ul>${o.items.map(it=>`<li>${esc(it.qty)} × ${esc(it.description)}</li>`).join('')}</ul>`:''}${o.fields?.filter(Boolean).length?`<p class="instructions">${esc(o.fields.filter(Boolean).join('\n'))}</p>`:''}${o.issue?`<p class="issue">Problema reportado: ${esc(o.issue.report)}</p>`:''}${complete?`<p class="instructions"><b>Informe:</b> ${esc(o.completion?.report||'Servicio completado.')}</p><div class="photos">${photoHtml(o.completion?.photos)}</div>`:`<div class="actions">${o.status==='Pendiente'?`<button data-start="${esc(o.id)}">Iniciar trabajo</button>`:''}<button class="complete" data-complete="${esc(o.id)}">Completar servicio</button><button data-issue="${esc(o.id)}">Reportar problema</button></div>`}</article>`;
  }).join('')||'<div class="empty">No tienes órdenes en esta sección.</div>';
  document.querySelectorAll('[data-start]').forEach(b=>b.onclick=()=>start(b.dataset.start,b));
  document.querySelectorAll('[data-complete]').forEach(b=>b.onclick=()=>openUpdate(b.dataset.complete,'complete'));
  document.querySelectorAll('[data-issue]').forEach(b=>b.onclick=()=>openUpdate(b.dataset.issue,'issue'));
  document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('selected',b.dataset.tab===tab));
}
async function lock(text=''){
  locked=true;viewVersion++;photoVersion++;stop?.();stop=null;key=null;data=null;pending.clear();photos=[];$('pin').value='';$('orders').innerHTML='';$('summary').innerHTML='';$('photoPreview').innerHTML='';$('workspace').hidden=true;$('login').hidden=false;$('businessLogo').hidden=true;$('businessLogo').removeAttribute('src');$('businessName').textContent='Mis órdenes de trabajo';$('employeeName').textContent='Tu trabajo, organizado.';if($('workDialog').open)$('workDialog').close();message('loginMessage',text);await signOut(auth);
}
$('loginForm').onsubmit=async e=>{
  e.preventDefault();const btn=$('loginButton');btn.disabled=true;message('loginMessage','Verificando acceso…');
  try{
    const pin=$('pin').value;employeeEmail(portalId);const password=employeePassword(secret,pin);
    await signInWithEmailAndPassword(auth,employeeEmail(portalId),password);key=await employeeKey(portalId,secret,pin);$('pin').value='';
    const snapshot=await getDoc(doc(db,'clientPortals',portalId));if(!snapshot.exists()||snapshot.data().enabled!==true||snapshot.data().kind!=='employee-orders-v1')throw new Error('Este acceso está desactivado. Contacta a la oficina.');
    data=await unseal(key,snapshot.data().envelope,'orders:'+portalId);try{localStorage.setItem('nexusEmployeeAccess',JSON.stringify({id:portalId,secret}));}catch{}locked=false;viewVersion++;$('login').hidden=true;$('workspace').hidden=false;render();message('syncMessage','Tus órdenes están actualizadas.');
    stop=onSnapshot(doc(db,'clientPortals',portalId),async snap=>{
      const version=++viewVersion;
      if(!snap.exists()||!snap.data().enabled)return lock('La oficina desactivó este acceso.');
      try{const next=await unseal(key,snap.data().envelope,'orders:'+portalId);if(locked||version!==viewVersion)return;
        data=next;for(const [id,p] of pending){const fresh=data.orders.find(o=>o.id===id);if(!fresh||fresh.dispatchKey!==p.dispatchKey||fresh.status===p.status||fresh.status==='Facturado')pending.delete(id);}
        render();message('syncMessage','Órdenes actualizadas. Los cierres se sincronizan con la oficina.');
      }catch(err){message('syncMessage','No se pudo actualizar el portal. Bloquéalo y vuelve a entrar.',true);}
    },err=>message('syncMessage','Sin conexión con la oficina. Tus cambios requieren conexión.',true));
  }catch(err){await lock();message('loginMessage',err.code?.startsWith('auth/')?'No se pudo entrar. Verifica tu PIN y el enlace, o contacta a la oficina.':err.message,true);}finally{btn.disabled=false;}
};
async function send(order,action,details={}){
  if(!navigator.onLine)throw new Error('Necesitas conexión para enviar el reporte.');
  if(locked||!key||!auth.currentUser)throw new Error('Abre de nuevo tu acceso.');
  const sendKey=key,identity=auth.currentUser.uid;
  const portalSnap=await getDoc(doc(db,'clientPortals',portalId));
  if(!portalSnap.exists()||!portalSnap.data().enabled)throw new Error('El acceso fue desactivado.');
  const latest=await unseal(sendKey,portalSnap.data().envelope,'orders:'+portalId),fresh=latest.orders.find(o=>o.id===order.id&&o.dispatchKey===order.dispatchKey);
  if(!fresh)throw new Error('Esta orden ya no está asignada a tu acceso.');
  if(['Completado','Facturado'].includes(fresh.status))throw new Error('Esta orden ya está completada.');
  const event={version:1,eventId:randomToken(),serviceId:order.id,dispatchKey:order.dispatchKey,action,date:localDate(),report:details.report||'',materials:details.materials||'',receivedBy:details.receivedBy||'',photos:details.photos||[]};
  validateEmployeeEvent(event,{id:order.id,employeeDispatchKey:order.dispatchKey});
  const envelope=await seal(sendKey,event,'response:'+fresh.responseId);
  if(locked||auth.currentUser?.uid!==identity)throw new Error('El acceso fue bloqueado. Vuelve a entrar.');
  await runTransaction(db,async tx=>{
    const responseRef=doc(db,'clientPortals',fresh.responseId),previous=await tx.get(responseRef);
    if(previous.exists()){
      if(previous.data().ownerId!==identity)throw new Error('Este reporte no pertenece a tu acceso. Contacta a la oficina.');
      const previousEvent=await unseal(sendKey,previous.data().envelope,'response:'+fresh.responseId);
      if(previousEvent.action==='complete')throw new Error('Ya enviaste el cierre de esta orden. La oficina lo recibirá en Nexus.');
    }
    tx.set(responseRef,{kind:'employee-response-v1',ownerId:identity,envelope,updatedAt:serverTimestamp()});
  });
  if(locked||auth.currentUser?.uid!==identity)return;
  const local={dispatchKey:order.dispatchKey,status:action==='complete'?'Completado':'En proceso',...(action==='complete'?{completion:{...details,date:event.date}}:action==='issue'?{issue:{report:event.report,date:event.date}}:{})};
  pending.set(order.id,local);render();message('syncMessage',action==='complete'?'Cierre enviado. La oficina lo recibirá en Nexus.':'Actualización enviada a la oficina.');
}
async function start(id,btn){btn.disabled=true;try{const order=mergedOrders().find(o=>o.id===id);await send(order,'start');}catch(err){message('syncMessage',err.message,true);btn.disabled=false;}}
function openUpdate(id,action){
  if(submitting)return;photoVersion++;dialogOrder=id;dialogAction=action;photos=[];loadingPhotos=false;$('updateForm').reset();$('photoPreview').innerHTML='';$('dialogTitle').textContent=action==='complete'?'Completar servicio':'Reportar problema';$('dialogOrder').textContent=mergedOrders().find(o=>o.id===id)?.number||'';$('completionFields').hidden=action==='issue';$('report').previousElementSibling.textContent=action==='complete'?'Trabajo realizado / hallazgos':'Describe el problema y qué necesitas';$('submitUpdate').textContent=action==='complete'?'Enviar cierre':'Enviar reporte';message('updateMessage','');$('workDialog').showModal();
}
async function compressedPhoto(file){
  if(file.size>20000000)throw new Error('La foto supera 20 MB.');
  const image=new Image(),url=URL.createObjectURL(file);
  try{image.src=url;await image.decode();const ratio=Math.min(1,900/image.naturalWidth,900/image.naturalHeight);const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*ratio));canvas.height=Math.max(1,Math.round(image.naturalHeight*ratio));const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);let quality=.65,result=canvas.toDataURL('image/jpeg',quality);while(result.length>140000&&quality>.15){quality-=.1;result=canvas.toDataURL('image/jpeg',quality);}if(result.length>140000)throw new Error('La foto es demasiado grande. Usa otra imagen.');return result;}catch(err){throw new Error(err.message||'No se pudo leer la foto. Usa JPEG o toma otra foto.');}finally{URL.revokeObjectURL(url);}
}
$('photos').onchange=async e=>{
  const version=++photoVersion,files=[...e.target.files];if(files.length>3){e.target.value='';return message('updateMessage','Selecciona hasta 3 fotos.',true);}
  loadingPhotos=true;$('submitUpdate').disabled=true;message('updateMessage','Preparando evidencias…');
  try{const prepared=await Promise.all(files.map(compressedPhoto));if(version!==photoVersion)return;photos=prepared;$('photoPreview').innerHTML=photoHtml(photos);message('updateMessage','Evidencias listas.');}catch(err){if(version!==photoVersion)return;photos=[];e.target.value='';message('updateMessage',err.message,true);}finally{if(version===photoVersion){loadingPhotos=false;$('submitUpdate').disabled=false;}}
};
$('updateForm').onsubmit=async e=>{
  e.preventDefault();if(loadingPhotos)return;const report=$('report').value.trim();if(!report)return message('updateMessage','Describe lo realizado o el problema.',true);
  const order=mergedOrders().find(o=>o.id===dialogOrder);if(!order)return message('updateMessage','Esta orden ya no está disponible.',true);
  const btn=$('submitUpdate');submitting=true;btn.disabled=true;message('updateMessage','Enviando…');
  try{await send(order,dialogAction,{report,materials:dialogAction==='complete'?$('materials').value.trim():'',receivedBy:dialogAction==='complete'?$('receivedBy').value.trim():'',photos:dialogAction==='complete'?photos:[]});$('workDialog').close();if(dialogAction==='complete'){tab='closed';render();}}catch(err){message('updateMessage',err.message,true);}finally{submitting=false;btn.disabled=false;}
};
$('closeDialog').onclick=()=>{if(!submitting){photoVersion++;$('workDialog').close();}};$('workDialog').addEventListener('cancel',e=>{if(submitting)e.preventDefault();else photoVersion++;});$('logout').onclick=()=>lock();
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;render();});
window.addEventListener('offline',()=>message('syncMessage','Sin internet. Conecta para enviar actualizaciones.',true));
if(!portalId||!secret){message('loginMessage','Abre el enlace personal que te envió la oficina. Este portal no tiene acceso público.',true);$('loginButton').disabled=true;}
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{});

let installPrompt;window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;const button=$('installPortal');button.hidden=false;});
$('installPortal').onclick=async()=>{if(installPrompt){await installPrompt.prompt();installPrompt=null;$('installPortal').hidden=true;}};
