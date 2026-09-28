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
function actionButtons(type,id){return `<div class="portal-doc-actions"><button type="button" data-view-pdf="${type}:${esc(id)}">Ver PDF</button><button type="button" class="secondary" data-download-pdf="${type}:${esc(id)}">Descargar PDF</button></div>`}
function bindPdfButtons(){
  document.querySelectorAll('[data-view-pdf]').forEach(b=>b.onclick=()=>openDocumentPdf(b.dataset.viewPdf,false));
  document.querySelectorAll('[data-download-pdf]').forEach(b=>b.onclick=()=>openDocumentPdf(b.dataset.downloadPdf,true));
}
function render(){
  const d=data,b=d.business||{},c=d.client||{},s=d.summary||{};
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
async function openDocumentPdf(key,download){
  const [type,id]=String(key||'').split(':');
  const list=type==='invoice'?(data.invoices||[]):(data.quotes||[]);
  const docData=list.find(x=>String(x.id)===String(id));
  if(!docData){alert('Documento no disponible. Actualice el portal desde el sistema administrativo.');return;}
  const html=documentHtml(type,docData);
  if(!download){
    const w=window.open('','_blank');
    if(!w){alert('El navegador bloqueó la ventana del PDF. Permita ventanas emergentes para este portal.');return;}
    w.document.write(`<html><head><title>${esc(docData.number||'Documento')}</title><link rel="stylesheet" href="portal.css?v=78"></head><body class="pdf-view">${html}<div class="pdf-toolbar"><button onclick="window.print()">Imprimir / Guardar PDF</button></div></body></html>`);w.document.close();return;
  }
  const holder=document.createElement('div');holder.className='pdf-render-host';holder.innerHTML=html;document.body.appendChild(holder);
  try{
    const node=holder.querySelector('#portalPdfDocument');
    const canvas=await window.html2canvas(node,{scale:2,useCORS:true,backgroundColor:'#ffffff'});
    const {jsPDF}=window.jspdf;const pdf=new jsPDF({unit:'pt',format:'letter',orientation:'portrait'});
    const width=pdf.internal.pageSize.getWidth()-48;const height=canvas.height*width/canvas.width;
    const img=canvas.toDataURL('image/png');
    if(height<=pdf.internal.pageSize.getHeight()-48) pdf.addImage(img,'PNG',24,24,width,height);
    else {let y=24,remaining=height;while(remaining>0){pdf.addImage(img,'PNG',24,y,width,height);remaining-=pdf.internal.pageSize.getHeight()-48;if(remaining>0){pdf.addPage();y=24-(height-remaining);}}}
    pdf.save(`${type==='invoice'?'Factura':'Cotizacion'}-${docData.number||'documento'}.pdf`);
  }catch(e){console.error(e);alert('No se pudo descargar el PDF. Use “Ver PDF” y luego Imprimir / Guardar PDF.');}
  finally{holder.remove();}
}
async function openPortal(token){$('loginMsg').textContent='Verificando acceso…';try{const snap=await getDoc(doc(db,'clientPortals',token));if(!snap.exists()||snap.data().enabled===false)throw new Error('Código inválido o portal desactivado.');data=snap.data();localStorage.setItem('nexusPortalAccess',token);$('portalLogin').classList.add('hidden');$('portalApp').classList.remove('hidden');render();}catch(e){$('loginMsg').textContent=e.message||'No se pudo abrir el portal.';}}
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
