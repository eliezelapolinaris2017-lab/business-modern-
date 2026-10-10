import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore,doc,getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { firebaseConfig } from './firebase-config.js';
const db=getFirestore(initializeApp(firebaseConfig));
const $=id=>document.getElementById(id);
let data=null,active='overview';
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const money=v=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(v||0));
const chip=s=>`<span class="chip">${esc(s||'—')}</span>`;
function card(title,value,detail=''){return `<article class="metric"><small>${esc(title)}</small><strong>${esc(value)}</strong><span>${esc(detail)}</span></article>`}
function empty(msg){return `<div class="empty">${esc(msg)}</div>`}
function table(headers,rows){return `<div class="table-wrap"><table><thead><tr>${headers.map(x=>`<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`}
function actionButtons(type,id){return `<div class="portal-doc-actions"><button type="button" data-print-document="${type}:${esc(id)}">Imprimir / Guardar PDF</button></div>`}
function bindPdfButtons(){
  document.querySelectorAll('[data-print-document]').forEach(b=>b.onclick=()=>printPortalDocument(b.dataset.printDocument));
}
function printPortalDocument(key){
  const [type,id]=String(key||'').split(':');
  const row=(type==='invoice'?data.invoices:data.quotes)?.find(x=>String(x.id)===id);
  if(!row){alert('Documento no disponible.');return;}
  const original=data.sharedDocument&&data.printHtml;
  const html=original||documentHtml(type,row);
  const css=new URL(original?'./styles.css':'./portal.css',import.meta.url).href;
  const w=window.open('','_blank');
  if(!w){alert('Permita ventanas emergentes para imprimir el documento.');return;}
  w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(row.number||'Documento')}</title><link rel="stylesheet" href="${esc(css)}"><style>
    @page{size:letter;margin:.38in}
    html,body{margin:0!important;padding:0!important;background:white!important;display:block!important;color:#172033;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .doc-page,.portal-pdf{box-sizing:border-box!important;width:100%!important;max-width:740px!important;min-height:0!important;height:auto!important;margin:20px auto!important;padding:16px!important;box-shadow:none!important;transform:none!important;zoom:1!important}
    table{width:100%!important;table-layout:fixed!important}td,th{white-space:normal!important;overflow-wrap:anywhere!important;word-break:normal!important}
    .doc-foot,.clean-doc-footer{position:static!important;margin-top:24px!important}.pdf-business img{max-width:125px;max-height:60px;object-fit:contain}
    .print-controls{position:sticky;bottom:0;padding:16px;text-align:center;background:rgba(255,255,255,.96);border-top:1px solid #dbe3ef;box-shadow:0 -8px 30px #0f172a12}.print-controls button{padding:14px 24px;font-size:16px;border:0;border-radius:12px;background:#172d50;color:white;cursor:pointer}
    @media print{.print-controls{display:none!important}.doc-page,.portal-pdf{max-width:none!important;margin:0!important;padding:0!important}.pdf-head{display:flex!important}.pdf-meta{display:grid!important;grid-template-columns:1fr 180px!important}.pdf-totals{width:310px!important;margin-left:auto!important}.pdf-business{text-align:right!important}.pdf-business img{margin-left:auto!important}}
    </style></head><body>${html}<div class="print-controls"><button onclick="window.print()">Imprimir / Guardar PDF</button></div></body></html>`);
  w.document.close();
}

function render(){
  const d=data,b=d.business||{},c=d.client||{},s=d.summary||{};
  if(d.sharedDocument){
    const {type,id}=d.sharedDocument;
    const row=(type==='invoice'?d.invoices:d.quotes)?.find(x=>x.id===id);
    if(!row) throw new Error('Documento no disponible.');
    document.body.classList.add('shared-portal');
    const label=type==='invoice'?'Factura':'Cotización';
    $('portalApp').innerHTML=`<header class="client-brand"><div class="client-brand-inner">${b.logo?`<img src="${esc(b.logo)}" alt="${esc(b.name||'Logo')}">`:''}<div><strong>${esc(b.name||'Portal del cliente')}</strong><span>Atención al cliente · Documentos</span></div><span class="client-badge">Portal del cliente</span></div></header><main class="client-document-shell"><section class="client-document-hero"><span class="client-eyebrow">SU DOCUMENTO ESTÁ LISTO</span><h1>Hola, ${esc(c.name||'bienvenido')}.</h1><p>Su ${label.toLowerCase()} está disponible. Ábrala para imprimirla o guardarla como PDF.</p><div class="client-document-details"><div><span>Documento</span><strong>${esc(row.number||label)}</strong></div><div><span>Total</span><strong>${money(row.total)}</strong></div><div><span>Estado</span><strong>${esc(row.status||'Emitida')}</strong></div></div></section><section class="client-preview-card"><div class="client-preview-title"><div><span class="client-eyebrow">VISTA PREVIA</span><h2>${label} ${esc(row.number||'')}</h2></div><span class="client-paper-label">PDF</span></div><button type="button" class="client-thumbnail-button" aria-label="Abrir ${label.toLowerCase()} ${esc(row.number||'')}"><span class="client-thumbnail-stage"><iframe title="Vista pequeña de ${label.toLowerCase()}" tabindex="-1" sandbox="allow-same-origin"></iframe></span><span class="client-thumbnail-caption">Abrir ${label.toLowerCase()} ↗</span></button><p class="client-preview-help">Al abrir el documento, encontrará «Imprimir / Guardar PDF» en la parte inferior.</p><button type="button" class="client-open-document">Abrir ${label.toLowerCase()}</button></section><footer class="client-document-footer">${esc(b.name||'')}<br>${esc([b.phone,b.email].filter(Boolean).join(' · '))}</footer></main>`;
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
  $('businessName').textContent=b.name||'Portal del Cliente';$('businessSlogan').textContent=b.slogan||'';$('clientName').textContent=c.name||'Cliente';
  $('lastUpdate').textContent='Información actualizada: '+new Date(d.updatedAt).toLocaleString('es-PR');
  $('businessContact').innerHTML=[b.phone,b.email,b.address].filter(Boolean).map(esc).join('<br>');
  if(b.logo){$('businessLogo').src=b.logo;$('businessLogo').classList.remove('hidden');}
  $('bookBtn').classList.toggle('hidden',!b.calendarUrl);$('bookBtn').onclick=()=>window.open(b.calendarUrl,'_blank','noopener');
  $('portalFooter').textContent=`${b.name||''} · Portal privado del cliente`;
  $('summaryCards').innerHTML=card('Servicios',s.services||0,'Historial registrado')+card('Equipos',s.assets||0,'Activos registrados')+card('Facturas',s.invoices||0,'Documentos emitidos')+card('Balance',money(s.balance||0),'Pendiente de pago');
  renderTab();
}
function renderTab(){
  document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x.dataset.tab===active));
  const box=$('tabContent');
  if(active==='overview'){
    const pending=(data.invoices||[]).filter(x=>x.balance>0);
    const today=new Date().toISOString().slice(0,10);
    const scheduled=(data.maintenance||[]).filter(x=>x.dueDate&&x.dueDate>=today&&!['Completado','Cancelado'].includes(x.status)).sort((a,b)=>a.dueDate.localeCompare(b.dueDate));
    const assetDates=(data.assets||[]).filter(x=>x.nextMaintenance&&x.nextMaintenance>=today).map(x=>({dueDate:x.nextMaintenance,title:'Mantenimiento programado',assetName:x.name,status:'Programado'}));
    const next=[...scheduled,...assetDates].sort((a,b)=>a.dueDate.localeCompare(b.dueDate))[0];
    box.innerHTML=`<h3>Resumen de su cuenta</h3><div class="overview-grid"><div><h4>Facturas pendientes</h4>${pending.length?pending.slice(0,5).map(x=>`<div class="line"><span>${esc(x.number)} · ${esc(x.dueDate||'Sin vencimiento')}</span><b>${money(x.balance)}</b></div>`).join(''):empty('No tiene facturas pendientes.')}</div><div><h4>Próximo mantenimiento</h4>${next?`<div class="focus"><b>${esc(next.title||'Mantenimiento programado')}</b><span>${esc(next.assetName||'Equipo')} · ${esc(next.dueDate)}</span>${next.status?`<small>${esc(next.status)}</small>`:''}</div>`:empty('No hay mantenimiento programado.')}</div></div>`;
    return;
  }
  if(active==='invoices'){
    const rows=(data.invoices||[]).map(x=>`<tr><td><b>${esc(x.number)}</b><br><small>${esc(x.serviceTitle)}</small></td><td>${esc(x.date)}</td><td>${esc(x.dueDate||'—')}</td><td>${money(x.total)}</td><td>${money(x.paid)}</td><td><b>${money(x.balance)}</b></td><td>${chip(x.status)}</td><td>${actionButtons('invoice',x.id)}</td></tr>`);
    box.innerHTML=`<h3>Facturas</h3>${rows.length?table(['Factura','Fecha','Vence','Total','Pagado','Balance','Estado','PDF'],rows):empty('No hay facturas disponibles.')}`;
    bindPdfButtons(); return;
  }
  if(active==='quotes'){
    const rows=(data.quotes||[]).map(x=>`<tr><td><b>${esc(x.number)}</b><br><small>${esc(x.title)}</small></td><td>${esc(x.date)}</td><td>${esc(x.validUntil||'—')}</td><td>${money(x.total)}</td><td>${chip(x.status)}</td><td>${actionButtons('quote',x.id)}</td></tr>`);
    box.innerHTML=`<h3>Cotizaciones</h3>${rows.length?table(['Cotización','Fecha','Válida hasta','Total','Estado','PDF'],rows):empty('No hay cotizaciones disponibles.')}`;
    bindPdfButtons(); return;
  }
  if(active==='services'){
    const rows=(data.services||[]).map(x=>`<tr><td>${esc(x.date)}</td><td><b>${esc(x.title)}</b><br><small>${esc(x.assetName)}</small></td><td>${chip(x.status)}</td><td>${money(x.amount)}</td></tr>`);
    box.innerHTML=`<h3>Historial de servicios</h3>${rows.length?table(['Fecha','Servicio','Estado','Monto'],rows):empty('No hay servicios registrados.')}`;return;
  }
  const rows=(data.assets||[]).map(x=>`<tr><td><b>${esc(x.name)}</b><br><small>${esc([x.brand,x.model].filter(Boolean).join(' · '))}</small></td><td>${esc(x.serial||'—')}</td><td>${esc(x.location||'—')}</td><td>${chip(x.status)}</td><td>${esc(x.warrantyExpiration||'—')}</td><td>${esc(x.nextMaintenance||'—')}</td></tr>`);
  box.innerHTML=`<h3>Equipos registrados</h3>${rows.length?table(['Equipo','Serial','Ubicación','Estado','Garantía','Próximo mantenimiento'],rows):empty('No hay equipos registrados.')}`;
}
function documentHtml(type,docData){
  const b=data.business||{},c=data.client||{};
  const isInv=type==='invoice';
  const label=isInv?'FACTURA':'COTIZACIÓN';
  const items=(docData.items||[]);
  const subtotal=Number(docData.subtotal ?? items.reduce((a,i)=>a+Number(i.qty||1)*Number(i.price||0),0));
  const tax=Number(docData.tax ?? Math.max(0,Number(docData.total||0)-subtotal));
  const rows=items.length?items.map(i=>`<tr><td>${esc(i.description||'Servicio')}</td><td>${Number(i.qty||1)}</td><td>${money(i.price)}</td><td>${money(Number(i.qty||1)*Number(i.price||0))}</td></tr>`).join(''):`<tr><td>${esc(docData.serviceTitle||docData.title||'Servicio')}</td><td>1</td><td>${money(subtotal||docData.total)}</td><td>${money(subtotal||docData.total)}</td></tr>`;
  return `<div id="portalPdfDocument" class="portal-pdf"><div class="pdf-head"><div><h1>${label}</h1><div class="pdf-number"># ${esc(docData.number||'')}</div></div><div class="pdf-business">${b.logo?`<img src="${esc(b.logo)}" alt="Logo">`:''}<b>${esc(b.name||'')}</b><span>${esc(b.address||'')}</span><span>${esc(b.phone||'')} ${b.email?'· '+esc(b.email):''}</span></div></div><div class="pdf-meta"><div><small>Cliente</small><b>${esc(c.name||'')}</b><span>${esc(c.address||c.city||'')}</span><span>${esc(c.phone||'')} ${c.email?'· '+esc(c.email):''}</span></div><div><small>Fecha</small><b>${esc(docData.date||'—')}</b><small>${isInv?'Vence':'Válida hasta'}</small><b>${esc((isInv?docData.dueDate:docData.validUntil)||'—')}</b><small>Estado</small><b>${esc(docData.status||'—')}</b></div></div><table class="pdf-table"><thead><tr><th>Descripción</th><th>Cant.</th><th>Precio</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table><div class="pdf-totals"><div><span>Subtotal</span><b>${money(subtotal)}</b></div><div><span>IVU / Impuesto</span><b>${money(tax)}</b></div><div class="grand"><span>Total</span><b>${money(docData.total)}</b></div>${isInv?`<div><span>Pagado</span><b>${money(docData.paid)}</b></div><div class="grand"><span>Balance</span><b>${money(docData.balance)}</b></div>`:''}</div>${docData.notes?`<section><h4>Notas</h4><p>${esc(docData.notes)}</p></section>`:''}${docData.terms?`<section><h4>Términos</h4><p>${esc(docData.terms)}</p></section>`:''}<footer>${esc(b.name||'')} · Documento disponible en el Portal del Cliente</footer></div>`;
}
async function openPortal(token){$('loginMsg').textContent='Verificando acceso…';try{const snap=await getDoc(doc(db,'clientPortals',token));if(!snap.exists()||snap.data().enabled===false)throw new Error('Código inválido o portal desactivado.');data=snap.data();if(!data.sharedDocument)localStorage.setItem('nexusPortalAccess',token);$('portalLogin').classList.add('hidden');$('portalApp').classList.remove('hidden');render();}catch(e){$('loginMsg').textContent=e.message||'No se pudo abrir el portal.';}}
$('accessForm').onsubmit=e=>{e.preventDefault();const token=$('accessCode').value.trim();if(token)openPortal(token)};
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{active=b.dataset.tab;renderTab()});
$('exitBtn').onclick=()=>{localStorage.removeItem('nexusPortalAccess');location.href='./'};
const params=new URLSearchParams(location.search);const initial=params.get('access')||localStorage.getItem('nexusPortalAccess')||'';if(initial){$('accessCode').value=initial;openPortal(initial)}


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
