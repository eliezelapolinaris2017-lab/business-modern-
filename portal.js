import { portalPaymentActions } from './portal-payments.js?v=123';
import { mountClientAccount } from './portal-account.js?v=119-onboarding';
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore,doc,getDoc,onSnapshot,writeBatch,serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { firebaseConfig } from './firebase-config.js';
const firebaseApp=initializeApp(firebaseConfig,'mi-oasis-client');
const db=getFirestore(firebaseApp);
window.addEventListener('DOMContentLoaded',()=>mountClientAccount({app:firebaseApp,db,openPortal}));
const $=id=>document.getElementById(id);
let data=null,active='overview',accessToken='',stopPortal=null;
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const money=v=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(v||0));
const chip=s=>`<span class="chip">${esc(s||'—')}</span>`;
function card(title,value,detail=''){return `<article class="metric"><small>${esc(title)}</small><strong>${esc(value)}</strong><span>${esc(detail)}</span></article>`}
function empty(msg){return `<div class="empty">${esc(msg)}</div>`}
function table(headers,rows){return `<div class="table-wrap"><table><thead><tr>${headers.map(x=>`<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`}
function actionButtons(type,id){return `<div class="portal-doc-actions"><button type="button" data-print-document="${type}:${esc(id)}">Imprimir / Guardar PDF</button>${type==='quote'?decisionButton(id):''}</div>`}
function bindPdfButtons(){
  bindDecisionButtons();
  document.querySelectorAll('[data-print-document]').forEach(b=>b.onclick=()=>printPortalDocument(b.dataset.printDocument));
}
function printPortalDocument(key){
  const [type,id]=String(key||'').split(':');
  const row=({invoice:data.invoices,quote:data.quotes,contract:data.contracts,payment:data.payments}[type]||[]).find(x=>String(x.id)===id);
  if(!row){alert('Documento no disponible.');return;}
  const original=data.sharedDocument?.type===type&&String(data.sharedDocument.id)===id&&data.printHtml;
  const html=(original||documentHtml(type,row))+(type==='quote'?decisionReceipt(row.clientDecision):'');
  const css=new URL(original?'./styles.css':'./portal.css',import.meta.url).href;
  // Keep documents inside the installed app; Safari standalone has no browser Back button.
  document.querySelector('.portal-document-viewer')?.remove();
  const previousFocus=document.activeElement;
  const viewer=document.createElement('dialog');viewer.className='portal-document-viewer';
  viewer.setAttribute('aria-label','Documento '+(row.number||''));
  viewer.innerHTML=`<div class="document-viewer-toolbar"><button type="button" data-back-portal>← Volver a Mi Oasis</button><strong>${esc(row.number||'Documento')}</strong><button type="button" data-print-current disabled>Imprimir / Guardar PDF</button></div><iframe title="Vista del documento" sandbox="allow-same-origin allow-modals"></iframe><p class="document-viewer-status" role="status">Preparando documento…</p>`;
  document.body.append(viewer);
  const frame=viewer.querySelector('iframe'),back=viewer.querySelector('[data-back-portal]'),print=viewer.querySelector('[data-print-current]'),status=viewer.querySelector('[role=status]');
  const close=()=>{viewer.close();viewer.remove();previousFocus?.focus?.();};
  back.onclick=close;viewer.addEventListener('cancel',e=>{e.preventDefault();close();});
  viewer.showModal();back.focus();
  frame.onload=()=>{print.disabled=false;status.textContent='';};
  print.onclick=()=>{try{frame.contentWindow.focus();frame.contentWindow.print();}catch(_){status.textContent='No se pudo abrir la impresión. Puedes volver a Mi Oasis e intentar de nuevo.';}};
  frame.srcdoc=`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(row.number||'Documento')}</title><link rel="stylesheet" href="${esc(css)}"><style>
    @page{size:letter;margin:.38in}
    html,body{margin:0!important;padding:0!important;background:white!important;display:block!important;color:#172033;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .doc-page,.portal-pdf{box-sizing:border-box!important;width:100%!important;max-width:740px!important;min-height:0!important;height:auto!important;margin:20px auto!important;padding:16px!important;box-shadow:none!important;transform:none!important;zoom:1!important}
    table{width:100%!important;table-layout:fixed!important}td,th{white-space:normal!important;overflow-wrap:anywhere!important;word-break:normal!important}
    .doc-foot,.clean-doc-footer{position:static!important;margin-top:24px!important}.pdf-business img{max-width:125px;max-height:60px;object-fit:contain}
    .print-controls{position:sticky;bottom:0;padding:16px;text-align:center;background:rgba(255,255,255,.96);border-top:1px solid #dbe3ef;box-shadow:0 -8px 30px #0f172a12}.print-controls button{padding:14px 24px;font-size:16px;border:0;border-radius:12px;background:#172d50;color:white;cursor:pointer}
    @media print{.print-controls{display:none!important}.doc-page,.portal-pdf{max-width:none!important;margin:0!important;padding:0!important}.pdf-head{display:flex!important}.pdf-meta{display:grid!important;grid-template-columns:1fr 180px!important}.pdf-totals{width:310px!important;margin-left:auto!important}.pdf-business{text-align:right!important}.pdf-business img{margin-left:auto!important}}
    </style></head><body>${html}</body></html>`;
}

function render(){
  const d=data,b=d.business||{},c=d.client||{},s=d.summary||{};
  if(d.sharedDocument&&!d.client?.id){
    const {type,id}=d.sharedDocument;
    const row=(type==='invoice'?d.invoices:d.quotes)?.find(x=>x.id===id);
    if(!row) throw new Error('Documento no disponible.');
    document.body.classList.add('shared-portal');
    const label=type==='invoice'?'Factura':'Cotización';
    $('portalApp').innerHTML=`<header class="client-brand"><div class="client-brand-inner">${b.logo?`<img src="${esc(b.logo)}" alt="${esc(b.name||'Logo')}">`:''}<div><strong>${esc(b.name||'Portal del cliente')}</strong><span>Atención al cliente · Documentos</span></div><span class="client-badge">Portal del cliente</span></div></header><main class="client-document-shell"><section class="client-document-hero"><span class="client-eyebrow">SU DOCUMENTO ESTÁ LISTO</span><h1>Hola, ${esc(c.name||'bienvenido')}.</h1><p>Su ${label.toLowerCase()} está disponible. Ábrala para imprimirla o guardarla como PDF.</p><div class="client-document-details"><div><span>Documento</span><strong>${esc(row.number||label)}</strong></div><div><span>Total</span><strong>${money(row.total)}</strong></div><div><span>Estado</span><strong>${esc(row.status||'Emitida')}</strong></div></div></section><section class="client-preview-card"><div class="client-preview-title"><div><span class="client-eyebrow">VISTA PREVIA</span><h2>${label} ${esc(row.number||'')}</h2></div><span class="client-paper-label">PDF</span></div><button type="button" class="client-thumbnail-button" aria-label="Abrir ${label.toLowerCase()} ${esc(row.number||'')}"><span class="client-thumbnail-stage"><iframe title="Vista pequeña de ${label.toLowerCase()}" tabindex="-1" sandbox="allow-same-origin"></iframe></span><span class="client-thumbnail-caption">Abrir ${label.toLowerCase()} ↗</span></button><p class="client-preview-help">Al abrir el documento, podrá imprimirlo, guardarlo o volver a Mi Oasis con los botones de arriba.</p><button type="button" class="client-open-document">Abrir ${label.toLowerCase()}</button></section><footer class="client-document-footer">${esc(b.name||'')}<br>${esc([b.phone,b.email].filter(Boolean).join(' · '))}</footer></main>`;
    if(type==='quote'){const area=document.createElement('section');area.className='client-preview-card';area.innerHTML=decisionButton(id);document.querySelector('.client-preview-card').after(area);bindDecisionButtons();}
    const open=()=>printPortalDocument(type+':'+id);
    document.querySelector('.client-thumbnail-button').onclick=open;
    document.querySelector('.client-open-document').onclick=open;
    const frame=document.querySelector('.client-thumbnail-stage iframe');
    const stage=document.querySelector('.client-thumbnail-stage');
    const css=new URL(d.printHtml?'./styles.css':'./portal.css',import.meta.url).href;
    frame.srcdoc=`<!doctype html><html><head><link rel="stylesheet" href="${esc(css)}"><style>html,body{margin:0!important;padding:0!important;width:816px!important;background:white!important;display:block!important}.doc-page,.portal-pdf{box-sizing:border-box!important;width:816px!important;max-width:816px!important;margin:0!important;transform:none!important;zoom:1!important;box-shadow:none!important}td,th{white-space:normal!important;overflow-wrap:anywhere!important}img{max-width:100%}</style></head><body>${d.printHtml||documentHtml(type,row)}</body></html>`;
    const resize=()=>{
      const width=Math.min(stage.clientWidth,360),scale=width/816;
      const height=Math.max(1056,frame.contentDocument?.body?.scrollHeight||1056);
      frame.style.height=height+'px';frame.style.transform=`scale(${scale})`;
      stage.style.height=Math.ceil(height*scale)+'px';
      frame.style.left=((stage.clientWidth-width)/2)+'px';
    };
    frame.onload=resize;
    if(window.ResizeObserver)new ResizeObserver(resize).observe(stage);
    return;
  }
  document.body.classList.remove('shared-portal');
  $('businessName').textContent=b.name||'Portal del Cliente';$('businessSlogan').textContent=b.slogan||'';$('clientName').textContent=c.name||'Cliente';
  $('lastUpdate').textContent='Información actualizada: '+new Date(d.updatedAt).toLocaleString('es-PR');
  $('businessContact').innerHTML=[b.phone,b.email,b.address].filter(Boolean).map(esc).join('<br>');
  if(b.logo){$('businessLogo').src=b.logo;$('businessLogo').classList.remove('hidden');}
  $('bookBtn').classList.toggle('hidden',!b.calendarUrl);$('bookBtn').onclick=()=>window.open(b.calendarUrl,'_blank','noopener');
  let phone=String(b.whatsapp||b.phone||'').replace(/\D/g,'');if(phone.length===10)phone='1'+phone;
  $('requestBtn').classList.toggle('hidden',!/^\d{11,15}$/.test(phone));
  $('requestBtn').onclick=()=>window.open('https://wa.me/'+phone+'?text='+encodeURIComponent('Saludos, soy '+(c.name||'cliente')+'. Deseo coordinar un servicio o mantenimiento.'),'_blank','noopener');
  $('portalFooter').textContent=`${b.name||''} · Portal privado del cliente`;
  $('summaryCards').innerHTML=card('Servicios',s.services||0,'Historial registrado')+card('Equipos',s.assets||0,'Activos registrados')+card('Facturas',s.invoices||0,'Documentos emitidos')+card('Balance',money(s.balance||0),'Pendiente de pago');
  renderTab();
}
function closedStatus(status){return /^(completad[oa]|cancelad[oa]|terminad[oa])$/i.test(status||'');}
function portalToday(){return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Puerto_Rico',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
function portalAgenda(){
  const today=portalToday();
  const maintenance=(data.maintenance||[]).map(x=>({...x,kind:'maintenance',recommended:true}));
  const assets=(data.assets||[]).filter(a=>a.nextMaintenance&&!maintenance.some(m=>m.assetId===a.id&&m.dueDate===a.nextMaintenance)).map(a=>({id:'asset-'+a.id,kind:'maintenance',dueDate:a.nextMaintenance,title:'Mantenimiento recomendado',assetName:a.name,status:'Pendiente',recommended:true}));
  const appointments=(data.services||[]).filter(s=>!closedStatus(s.status)&&s.status!=='Facturado'&&!s.completedAt&&s.date).map(s=>({id:'service-'+s.id,kind:'appointment',dueDate:s.date,title:s.title,assetName:s.assetName,status:s.status,time:s.scheduledTime||'',location:s.location||'',recommended:false}));
  return [...maintenance,...assets,...appointments].map(x=>({...x,overdue:!!x.dueDate&&x.dueDate<today&&!closedStatus(x.status)})).sort((a,b)=>String(a.dueDate||'9999').localeCompare(String(b.dueDate||'9999')));
}
function agendaCard(x){return `<article class="agenda-card${x.overdue?' overdue':''}"><div><small>${x.kind==='appointment'?'Cita registrada':'Mantenimiento recomendado'}</small><h4>${esc(x.title)}</h4><p>${esc([x.assetName,x.location].filter(Boolean).join(' · '))}</p></div><div><b>${esc(x.dueDate||'Por coordinar')} ${esc(x.time||'')}</b><p>${chip(x.overdue?(x.recommended?'Pendiente de coordinar':'Fecha pasada · '+x.status):x.status)}</p></div></article>`;}
function renderTab(){
  document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x.dataset.tab===active));
  const box=$('tabContent');
  if(active==='overview'){
    const pending=(data.invoices||[]).filter(x=>x.balance>0&&x.status!=='Cancelada');
    const agenda=portalAgenda(),next=agenda.filter(x=>!closedStatus(x.status)).slice(0,3);
    const selected=new URLSearchParams(location.search).get('document')||'';
    const [kind,id]=selected.split(':');
    const highlighted=({invoice:data.invoices,quote:data.quotes}[kind]||[]).find(x=>String(x.id)===id);
    const recent=(data.services||[]).slice(0,3);
    box.innerHTML=`${highlighted?`<div class="portal-featured"><span>Documento recibido por WhatsApp</span><h3>${kind==='invoice'?'Factura':'Cotización'} ${esc(highlighted.number)}</h3><p>${money(highlighted.total)} · ${esc(highlighted.status)}</p>${actionButtons(kind,id)}</div>`:''}<h3>Resumen de su cuenta</h3>${portalPaymentActions(data.business,{balance:data.summary?.balance})}<div class="overview-grid"><div><h4>Próximas citas y mantenimientos</h4>${next.length?next.map(agendaCard).join(''):empty('No hay citas ni mantenimientos programados.')}<p><button type="button" data-open-tab="maintenance" class="secondary">Ver agenda completa</button></p></div><div><h4>Facturas pendientes</h4>${pending.length?pending.slice(0,5).map(x=>`<div class="line"><span>${esc(x.number)} · ${esc(x.dueDate||'Sin vencimiento')}</span><b>${money(x.balance)}</b></div>`).join(''):empty('No tiene facturas pendientes.')}<h4>Servicios recientes</h4>${recent.length?recent.map(x=>`<div class="line"><span>${esc(x.date)}<br><b>${esc(x.title)}</b></span>${chip(x.status)}</div>`).join(''):empty('No hay servicios registrados.')}</div></div>`;
    box.querySelectorAll('[data-open-tab]').forEach(b=>b.onclick=()=>{active=b.dataset.openTab;renderTab()});
    bindPdfButtons();
    return;
  }
  if(active==='maintenance'){
    const agenda=portalAgenda(),pending=agenda.filter(x=>!closedStatus(x.status)),past=agenda.filter(x=>closedStatus(x.status));
    box.innerHTML=`<h3>Citas y mantenimientos</h3><p class="agenda-help">Las fechas recomendadas requieren coordinación. Una cita agendada muestra su fecha y hora registradas.</p><h4>Pendientes y próximos</h4><div class="agenda-list">${pending.length?pending.map(agendaCard).join(''):empty('No hay fechas pendientes.')}</div><h4>Completados y cancelados</h4><div class="agenda-list">${past.length?past.reverse().map(agendaCard).join(''):empty('No hay registros anteriores.')}</div>`;return;
  }
  if(active==='payments'){
    const rows=(data.payments||[]).map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.invoiceNumber||'—')}</td><td>${esc(x.method||'—')}</td><td>${money(x.amount)}</td><td>${actionButtons('payment',x.id)}</td></tr>`);
    box.innerHTML=`<h3>Historial de pagos</h3>${rows.length?table(['Fecha','Factura','Método','Pagado','Comprobante'],rows):empty('No hay pagos registrados.')}`;bindPdfButtons();return;
  }
  if(active==='contracts'){
    const rows=(data.contracts||[]).map(x=>`<tr><td><b>${esc(x.number)}</b><br>${esc(x.title)}</td><td>${esc(x.date)}</td><td>${esc(x.startDate||'—')}</td><td>${esc(x.endDate||'—')}</td><td>${actionButtons('contract',x.id)}</td></tr>`);
    box.innerHTML=`<h3>Contratos</h3>${rows.length?table(['Contrato','Fecha','Inicio','Terminación','Documento'],rows):empty('No hay contratos registrados.')}`;bindPdfButtons();return;
  }
  if(active==='invoices'){
    const rows=(data.invoices||[]).map(x=>`<tr><td><b>${esc(x.number)}</b><br><small>${esc(x.serviceTitle)}</small></td><td>${esc(x.date)}</td><td>${esc(x.dueDate||'—')}</td><td>${money(x.total)}</td><td>${money(x.paid)}</td><td><b>${money(x.balance)}</b></td><td>${chip(x.status)}</td><td>${actionButtons('invoice',x.id)}${portalPaymentActions(data.business,{balance:x.balance,invoiceNumber:x.number,status:x.status,compact:true})}</td></tr>`);
    box.innerHTML=`<h3>Facturas</h3>${rows.length?table(['Factura','Fecha','Vence','Total','Pagado','Balance','Estado','PDF'],rows):empty('No hay facturas disponibles.')}`;
    bindPdfButtons(); return;
  }
  if(active==='quotes'){
    const rows=(data.quotes||[]).map(x=>`<tr><td><b>${esc(x.number)}</b><br><small>${esc(x.title)}</small></td><td>${esc(x.date)}</td><td>${esc(x.validUntil||'—')}</td><td>${money(x.total)}</td><td>${chip(x.status)}</td><td>${actionButtons('quote',x.id)}</td></tr>`);
    box.innerHTML=`<h3>Cotizaciones</h3>${rows.length?table(['Cotización','Fecha','Válida hasta','Total','Estado','PDF'],rows):empty('No hay cotizaciones disponibles.')}`;
    bindPdfButtons(); return;
  }
  if(active==='services'){
    const rows=(data.services||[]).map(x=>`<tr><td>${esc(x.date)}</td><td><b>${esc(x.title)}</b><br><small>${esc(x.assetName)}</small>${x.location?`<p>${esc(x.location)}</p>`:''}${x.report?`<details><summary>Trabajo realizado</summary><p>${esc(x.report)}</p></details>`:''}</td><td>${chip(x.status)}</td><td>${money(x.amount)}</td></tr>`);
    box.innerHTML=`<h3>Historial de servicios</h3>${rows.length?table(['Fecha','Servicio','Estado','Monto'],rows):empty('No hay servicios registrados.')}`;return;
  }
  const rows=(data.assets||[]).map(x=>`<tr><td><b>${esc(x.name)}</b><br><small>${esc([x.brand,x.model].filter(Boolean).join(' · '))}</small></td><td>${esc(x.serial||'—')}</td><td>${esc(x.location||'—')}</td><td>${chip(x.status)}</td><td>${esc(x.warrantyExpiration||'—')}</td><td>${esc(x.nextMaintenance||'—')}</td></tr>`);
  box.innerHTML=`<h3>Equipos registrados</h3>${rows.length?table(['Equipo','Serial','Ubicación','Estado','Garantía','Próximo mantenimiento'],rows):empty('No hay equipos registrados.')}`;
}
function documentHtml(type,docData){
  const b=data.business||{},c=data.client||{};
  if(type==='contract'||type==='payment'){
    const contract=type==='contract';
    return `<article class="portal-pdf"><div class="pdf-head"><h1>${contract?'CONTRATO':'COMPROBANTE DE PAGO'}</h1><div class="pdf-business"><b>${esc(b.name)}</b><span>${esc(b.phone)}</span></div></div><p>Cliente: <b>${esc(c.name)}</b></p><p>Fecha: ${esc(docData.date)}</p>${contract?`<h2>${esc(docData.number)} · ${esc(docData.title)}</h2><p class="contract-body" style="white-space:pre-wrap">${esc(docData.body||'Solicite al negocio el documento completo.')}</p>`:`<p>Factura: ${esc(docData.invoiceNumber)}</p><p>Método: ${esc(docData.method)}</p><h2>Pagado: ${money(docData.amount)}</h2>`}</article>`;
  }
  const isInv=type==='invoice';
  const label=isInv?'FACTURA':'COTIZACIÓN';
  const items=(docData.items||[]);
  const subtotal=Number(docData.subtotal ?? items.reduce((a,i)=>a+Number(i.qty||1)*Number(i.price||0),0));
  const tax=Number(docData.tax ?? Math.max(0,Number(docData.total||0)-subtotal));
  const rows=items.length?items.map(i=>`<tr><td>${esc(i.description||'Servicio')}</td><td>${Number(i.qty||1)}</td><td>${money(i.price)}</td><td>${money(Number(i.qty||1)*Number(i.price||0))}</td></tr>`).join(''):`<tr><td>${esc(docData.serviceTitle||docData.title||'Servicio')}</td><td>1</td><td>${money(subtotal||docData.total)}</td><td>${money(subtotal||docData.total)}</td></tr>`;
  return `<div id="portalPdfDocument" class="portal-pdf"><div class="pdf-head"><div><h1>${label}</h1><div class="pdf-number"># ${esc(docData.number||'')}</div></div><div class="pdf-business">${b.logo?`<img src="${esc(b.logo)}" alt="Logo">`:''}<b>${esc(b.name||'')}</b><span>${esc(b.address||'')}</span><span>${esc(b.phone||'')} ${b.email?'· '+esc(b.email):''}</span></div></div><div class="pdf-meta"><div><small>Cliente</small><b>${esc(c.name||'')}</b><span>${esc(c.address||c.city||'')}</span><span>${esc(c.phone||'')} ${c.email?'· '+esc(c.email):''}</span></div><div><small>Fecha</small><b>${esc(docData.date||'—')}</b><small>${isInv?'Vence':'Válida hasta'}</small><b>${esc((isInv?docData.dueDate:docData.validUntil)||'—')}</b><small>Estado</small><b>${esc(docData.status||'—')}</b></div></div><table class="pdf-table"><thead><tr><th>Descripción</th><th>Cant.</th><th>Precio</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table><div class="pdf-totals"><div><span>Subtotal</span><b>${money(subtotal)}</b></div><div><span>IVU / Impuesto</span><b>${money(tax)}</b></div><div class="grand"><span>Total</span><b>${money(docData.total)}</b></div>${isInv?`<div><span>Pagado</span><b>${money(docData.paid)}</b></div><div class="grand"><span>Balance</span><b>${money(docData.balance)}</b></div>`:''}</div>${docData.notes?`<section><h4>Notas</h4><p>${esc(docData.notes)}</p></section>`:''}${docData.terms?`<section><h4>Términos</h4><p>${esc(docData.terms)}</p></section>`:''}<footer>${esc(b.name||'')} · Documento disponible en el Portal del Cliente</footer></div>`;
}
async function loadQuoteResponses(portal,token){
  await Promise.all((portal.quotes||[]).map(async q=>{
    try{
      const response=await getDoc(doc(db,'clientPortals',token,'responses',q.id));
      if(response.exists()){q.clientDecision=response.data();q.status=q.clientDecision.status;}
      q.responseUnavailable=false;
    }catch(error){
      q.responseUnavailable=true;
      console.warn('Respuesta de cotización no disponible:',error.code||'unknown');
    }
  }));
  if(data===portal&&accessToken===token)render();
}
async function openPortal(token){
  if(stopPortal)stopPortal();
  data=null;accessToken=token;
  $('loginMsg').textContent='Abriendo tu información…';
  return new Promise((resolve,reject)=>{
    let settled=false,unsubscribe=()=>{};
    const finish=error=>{if(settled)return;settled=true;clearTimeout(timer);error?reject(error):resolve();};
    const fail=(message,error)=>{
      if(accessToken!==token)return finish(error);
      data=null;$('portalApp').classList.add('hidden');$('portalLogin').classList.remove('hidden');
      $('loginMsg').textContent=message;finish(error);
    };
    const timer=setTimeout(()=>{
      unsubscribe();
      fail('La conexión está tardando. Comprueba tu internet y vuelve a intentar.',Object.assign(new Error('La conexión está tardando. Vuelve a intentar.'),{code:'portal/timeout'}));
    },12000);
    unsubscribe=onSnapshot(doc(db,'clientPortals',token),snap=>{
      if(accessToken!==token)return;
      if(!snap.exists()||snap.data().enabled===false){
        fail('Este acceso ya no está disponible. Solicita una invitación nueva al negocio.',new Error('Invitación no disponible.'));return;
      }
      data=snap.data();
      (data.quotes||[]).forEach(q=>q.responseUnavailable=true);
      if(!data.sharedDocument||data.client?.id){try{localStorage.setItem('nexusPortalAccess',token);}catch(_){}}
      $('loginMsg').textContent='';
      $('portalLogin').classList.add('hidden');$('portalApp').classList.remove('hidden');
      render();finish();void loadQuoteResponses(data,token);
    },error=>{
      if(data&&error.code!=='permission-denied'){$('lastUpdate').textContent='No se pudo actualizar. Verifica tu conexión.';return;}
      fail('Entra con tu correo para abrir tu información. Si el problema continúa, contacta al negocio.',error);
    });
    stopPortal=()=>{unsubscribe();finish(Object.assign(new Error('Acceso reemplazado.'),{code:'portal/canceled'}));};
  });
}
$('accessForm').onsubmit=e=>{e.preventDefault();const token=$('accessCode').value.trim();if(token)void openPortal(token).catch(()=>{});};
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{active=b.dataset.tab;renderTab()});
$('exitBtn').onclick=async()=>{if(stopPortal)stopPortal();localStorage.removeItem('nexusPortalAccess');await window.portalSignOut?.();location.href='./'};
const params=new URLSearchParams(location.search);let remembered='';try{remembered=localStorage.getItem('nexusPortalAccess')||'';}catch(_){}const initial=params.get('access')||params.get('token')||remembered;if(initial){$('accessCode').value=initial;if(params.has('document'))void openPortal(initial).catch(()=>{});}


// PWA Portal del Cliente
let deferredInstallPrompt=null;
const installBtn=$('installAppBtn');
function isStandalone(){return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone===true;}
window.addEventListener('beforeinstallprompt',e=>{
  e.preventDefault(); deferredInstallPrompt=e;
  if(installBtn&&!isStandalone()) installBtn.classList.remove('hidden');
});
window.addEventListener('appinstalled',()=>{
  deferredInstallPrompt=null;
  if(installBtn) installBtn.classList.add('hidden');
});
if(installBtn){
  if(isStandalone()) installBtn.classList.add('hidden');
  installBtn.onclick=async()=>{
    if(deferredInstallPrompt){
      deferredInstallPrompt.prompt();
      try{await deferredInstallPrompt.userChoice;}catch(_){}
      deferredInstallPrompt=null; installBtn.classList.add('hidden');
      return;
    }
    const isiOS=/iphone|ipad|ipod/i.test(navigator.userAgent);
    alert(isiOS
      ? 'En iPhone/iPad: toca Compartir y luego “Añadir a pantalla de inicio”.'
      : 'Usa el menú del navegador y selecciona “Instalar app” o “Añadir a pantalla de inicio”.');
  };
}
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(e=>console.warn('PWA portal:',e)));
}

function decisionReceipt(d){
  if(!d)return '';
  return `<section style="break-inside:avoid;padding:20px;border-top:1px solid #ccc"><h3>${esc(d.status)}</h3><p>${esc(d.name)} · ${esc(d.at?.toDate?.().toLocaleString('es-PR')||'')}</p>${d.signature?`<img alt="Firma del cliente" src="${esc(d.signature)}" style="width:420px;max-width:100%">`:''}<p>${esc(d.reason||'')}</p></section>`;
}
function decisionButton(id){
  const q=data.quotes?.find(x=>String(x.id)===String(id));if(!q)return '';
  if(q.clientDecision)return decisionReceipt(q.clientDecision);
  const closedMessages={
    Aprobada:'Esta cotización ya fue aprobada.',
    Rechazada:'Esta cotización fue rechazada.',
    Convertida:'Esta cotización ya fue convertida a servicio o factura y no admite una nueva aceptación.',
    Vencida:'Esta cotización está vencida. Solicite una cotización actualizada para aceptar y firmar.',
    Cancelada:'Esta cotización fue cancelada.'
  };
  if(closedMessages[q.status])return '<p>'+closedMessages[q.status]+'</p>';
  if(q.validUntil&&q.validUntil<new Date().toLocaleDateString('en-CA',{timeZone:'America/Puerto_Rico'}))return '<p>Esta cotización está vencida. Solicite una cotización actualizada para aceptar y firmar.</p>';
  if(!data.quoteRevisions||!Object.prototype.hasOwnProperty.call(data.quoteRevisions,String(id))||!data.quoteExpires?.[id])return '<p>Este enlace permite consultar el documento, pero necesita actualizarse para firmar. Solicite al negocio que vuelva a enviar la cotización desde Nexus.</p>';
  if(q.responseUnavailable)return '<p>Puede consultar e imprimir su cotización. La firma y la respuesta en línea no están disponibles por el momento.</p>';
  return `<button type="button" data-respond-quote="${esc(id)}">Firmar / Responder cotización</button>`;
}
function bindDecisionButtons(){document.querySelectorAll('[data-respond-quote]').forEach(b=>b.onclick=()=>openDecision(b.dataset.respondQuote));}
function openDecision(id){
  const q=data.quotes.find(x=>String(x.id)===id);if(!q)return;
  const modal=document.createElement('dialog');modal.className='quote-decision';
  modal.innerHTML=`<form><h2>Responder cotización ${esc(q.number)}</h2><p>Total: <b>${money(q.total)}</b>. Revise el documento y sus términos antes de responder.</p><label>Nombre completo<input name="signer" required maxlength="120" autocomplete="name"></label><label>Firma con el dedo o el ratón<canvas width="900" height="280" aria-label="Área para dibujar su firma"></canvas></label><button type="button" data-clear>Borrar firma</button><label><input type="checkbox" name="consent"> He leído la cotización y sus términos. Al aceptar, autorizo registrar mi firma electrónica.</label><label>Motivo del rechazo (opcional)<textarea name="reason" maxlength="1000"></textarea></label><p role="status" data-message></p><div class="decision-actions"><button type="button" data-close>Cancelar</button><button type="submit" value="reject" formnovalidate>Rechazar cotización</button><button type="submit" value="accept">Aceptar cotización</button></div></form>`;
  document.body.append(modal);modal.showModal();
  const canvas=modal.querySelector('canvas'),ctx=canvas.getContext('2d');let drawing=false,marks=0,busy=false;
  ctx.lineWidth=3;ctx.lineCap='round';ctx.strokeStyle='#172033';
  const point=e=>{const r=canvas.getBoundingClientRect();return [(e.clientX-r.left)*canvas.width/r.width,(e.clientY-r.top)*canvas.height/r.height]};
  canvas.onpointerdown=e=>{drawing=true;canvas.setPointerCapture(e.pointerId);ctx.beginPath();ctx.moveTo(...point(e));};
  canvas.onpointermove=e=>{if(!drawing)return;ctx.lineTo(...point(e));ctx.stroke();marks++;};
  canvas.onpointerup=canvas.onpointercancel=()=>drawing=false;
  modal.querySelector('[data-clear]').onclick=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);marks=0;};
  const close=()=>{if(!busy){modal.close();modal.remove();}};modal.querySelector('[data-close]').onclick=close;
  modal.addEventListener('cancel',e=>{e.preventDefault();close();});
  modal.querySelector('form').onsubmit=async e=>{
    e.preventDefault();if(busy)return;const f=e.target,accept=e.submitter?.value==='accept',msg=modal.querySelector('[data-message]');
    const name=f.elements.signer.value.trim();if(!name){msg.textContent='Escriba su nombre completo.';return;}
    if(accept&&(!f.elements.consent.checked||marks<3)){msg.textContent='Dibuje su firma y confirme que acepta los términos.';return;}
    busy=true;modal.querySelectorAll('button').forEach(b=>b.disabled=true);msg.textContent='Guardando respuesta…';
    try{
      const response={status:accept?'Aprobada':'Rechazada',name,signature:accept?canvas.toDataURL('image/png'):'',reason:accept?'':f.elements.reason.value.trim(),at:serverTimestamp(),portalToken:accessToken};
      const batch=writeBatch(db);
      batch.set(doc(db,'clientPortals',accessToken,'responses',id),response);
      batch.update(doc(db,'users',data.ownerId,'quotes',id),{status:response.status,clientDecision:response,updatedAt:serverTimestamp()});
      await batch.commit();q.clientDecision={...response,at:{toDate:()=>new Date()}};q.status=response.status;
      busy=false;close();render();
    }catch(error){busy=false;modal.querySelectorAll('button').forEach(b=>b.disabled=false);msg.textContent=error.code==='permission-denied'?'Firebase no autorizó guardar la respuesta. Solicite al negocio que actualice y reenvíe la cotización; si continúa, debe revisar las reglas publicadas.':error.code==='unavailable'?'No hay conexión con Firebase. Compruebe internet y vuelva a intentar.':'No se pudo guardar la respuesta ('+(error.code||'error')+'). Mantenga esta ventana abierta y vuelva a intentar.';console.error(error);}
  };
}
