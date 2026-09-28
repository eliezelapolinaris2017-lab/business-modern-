import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, addDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const APP_VERSION = 'v64';
let deferredInstallPrompt = null;
let updateWaiting = null;
let currentFilter = 'all';
let currentDocId = null;
let invoiceLines = [];
let lastCreatedInvoiceId = null;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const $ = id => document.getElementById(id);
const money = n => Number(n || 0).toLocaleString('es-PR', { style: 'currency', currency: 'USD' });
const esc = v => String(v ?? '').replace(/[&<>"']/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[m]));
const today = () => new Date().toISOString().slice(0, 10);
const plusDays = n => { const d = new Date(); d.setDate(d.getDate() + Number(n || 0)); return d.toISOString().slice(0, 10); };
const plusMonths = (date, months = 6) => { const d = new Date((date || today()) + 'T12:00:00'); d.setMonth(d.getMonth() + Number(months || 6)); return d.toISOString().slice(0, 10); };

let unsub = [];
let state = { profile:null, clients:[], services:[], quotes:[], followups:[], invoices:[], payments:[], assets:[] };
const COLS = ['clients', 'services', 'quotes', 'followups', 'invoices', 'payments', 'assets'];
function uid(){ return auth.currentUser?.uid || ''; }
function colRef(c){ return collection(db, 'users', uid(), c); }
function docRef(c, id){ return doc(db, 'users', uid(), c, id); }
function clientBy(id){ return state.clients.find(c => c.id === id) || {}; }
function taxRate(){ return Number(state.profile?.tax || 11.5) / 100; }
function invoicePaid(inv){ return state.payments.filter(p => p.invoiceId === inv.id).reduce((a, p) => a + Number(p.amount || 0), 0); }
function invoicePaymentMethods(inv){ return [...new Set(state.payments.filter(p => p.invoiceId === inv.id).map(p => String(p.method || '').trim()).filter(Boolean))]; }
function invoicePaymentTerms(inv, fallback='Pago según acuerdo.'){ const methods=invoicePaymentMethods(inv); if(!methods.length) return fallback; return `${methods.length>1?'Métodos de pago':'Método de pago'}: ${methods.join(', ')}.`; }
function invoiceBalance(inv){ return Math.max(0, Number(inv.total || 0) - invoicePaid(inv)); }
function invoiceStatus(inv){ const bal = invoiceBalance(inv), paid = invoicePaid(inv); if(String(inv.status||'') === 'Cancelada') return 'Cancelada'; if(String(inv.status||'') === 'Borrador') return 'Borrador'; if(bal <= 0 || String(inv.status||'') === 'Pagada') return 'Pagada'; if(inv.dueDate && inv.dueDate < today()) return 'Vencida'; return paid > 0 ? 'Parcial' : 'Pendiente'; }
function statusBadge(status){ const s = String(status || 'Pendiente'); const cls = s === 'Pagada' || s === 'Completado' ? 'ok' : (s === 'Vencida' || s === 'Urgente' || s === 'Vencido' ? 'danger' : (s === 'Próximo' || s === 'Parcial' || s === 'Pendiente' ? 'warn' : '')); return `<span class="badge ${cls}">${esc(s)}</span>`; }
function sorted(arr, key='date'){ return [...(arr || [])].sort((a,b) => String(b[key] || '').localeCompare(String(a[key] || ''))); }
function phoneLink(c){ const raw = String(c.phone || c.whatsapp || '').replace(/\D/g, ''); if(!raw) return ''; const normalized = raw.length === 10 ? '1' + raw : raw.replace(/^1?/, '1'); return `https://wa.me/${normalized}`; }
function isStandalone(){ return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true; }
function isIOS(){ return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); }
function isIOSPWA(){ return isIOS() && isStandalone(); }
function sleep(ms){ return new Promise(resolve => setTimeout(resolve, ms)); }
function setSync(text){ const el = $('mobileSync'); if(el) el.textContent = text; }
function showMobileNotice(message, type='info'){
  let box = document.querySelector('.mobile-notice');
  if(!box){ box = document.createElement('div'); box.className = 'mobile-notice'; document.body.appendChild(box); }
  box.className = 'mobile-notice ' + type;
  box.textContent = message;
  clearTimeout(showMobileNotice._t);
  showMobileNotice._t = setTimeout(() => { box?.remove(); }, 4200);
}
function firebaseMessage(err){
  const code = String(err?.code || '');
  if(code.includes('permission-denied')) return 'Firebase bloqueó el guardado. Publica firestore.rules actualizado y vuelve a intentar.';
  if(code.includes('unavailable')) return 'Sin conexión estable. Revisa internet y sincroniza nuevamente.';
  return err?.message || 'No se pudo guardar.';
}

function newLine(description='', qty=1, price=0, discount=0, taxable=true){ return { id:'ln_' + Date.now() + '_' + Math.random().toString(16).slice(2), description, qty:Number(qty||1), price:Number(price||0), discount:Number(discount||0), taxable }; }
function ensureLines(){ if(!invoiceLines.length) invoiceLines = [newLine('Mantenimiento preventivo 6 meses', 1, 75)]; }
function lineNet(l){ return Math.max(0, (Number(l.qty||0) * Number(l.price||0)) - Number(l.discount||0)); }
function invoiceCalc(){ const subtotal = invoiceLines.reduce((a,l)=>a + Number(l.qty||0)*Number(l.price||0), 0); const discount = invoiceLines.reduce((a,l)=>a + Number(l.discount||0), 0); const taxableBase = invoiceLines.filter(l=>l.taxable !== false).reduce((a,l)=>a + lineNet(l), 0); const ivu = taxableBase * taxRate(); const total = Math.max(0, subtotal - discount + ivu); return { subtotal, discount, ivu, total }; }
function cleanPayload(obj){
  return Object.fromEntries(Object.entries(obj).filter(([,v]) => v !== undefined));
}

function setupPwaInstall(){
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstallPrompt = e; renderSyncDetails(); });
  window.addEventListener('online', () => { setSync('Online · sincronizando'); renderSyncDetails(); });
  window.addEventListener('offline', () => { setSync('Offline · datos en caché'); renderSyncDetails(); });
  if('serviceWorker' in navigator){
    navigator.serviceWorker.ready.then(reg => {
      updateWaiting = reg.waiting || null;
      if(updateWaiting) showUpdateToast();
      reg.addEventListener('updatefound', () => {
        const worker = reg.installing;
        if(!worker) return;
        worker.addEventListener('statechange', () => { if(worker.state === 'installed' && navigator.serviceWorker.controller){ updateWaiting = worker; showUpdateToast(); } });
      });
    }).catch(()=>{});
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if(refreshing) return; refreshing = true; location.reload(); });
  }
}
function showUpdateToast(){
  if(document.querySelector('.update-toast')) return;
  const box = document.createElement('div');
  box.className = 'update-toast';
  box.innerHTML = '<span>Nueva versión móvil disponible.</span><button type="button" id="applyUpdateBtn">Actualizar</button>';
  document.body.appendChild(box);
}
function applyWaitingUpdate(){ if(updateWaiting) updateWaiting.postMessage({ type:'SKIP_WAITING' }); else location.reload(); }

function switchTab(id){
  document.querySelectorAll('.mobile-view').forEach(v => v.classList.toggle('active', v.id === id));
  document.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === id));
  window.scrollTo({ top:0, behavior:'smooth' });
}

document.addEventListener('click', async e => {
  const tab = e.target.closest('[data-tab]'); if(tab){ switchTab(tab.dataset.tab); return; }
  const invClient = e.target.closest('[data-new-invoice-client]'); if(invClient){ startInvoiceForClient(invClient.dataset.newInvoiceClient); return; }
  if(e.target.closest('#mClearClient')){ $('mClientForm')?.reset(); return; }
  const f = e.target.closest('[data-follow-filter]'); if(f){ currentFilter = f.dataset.followFilter; document.querySelectorAll('[data-follow-filter]').forEach(b => b.classList.toggle('active', b === f)); renderFollowups(); return; }
  const complete = e.target.closest('[data-complete-follow]'); if(complete){ await completeFollowup(complete.dataset.completeFollow); return; }
  const del = e.target.closest('[data-delete-follow]'); if(del && confirm('¿Borrar seguimiento?')){ await deleteDoc(docRef('followups', del.dataset.deleteFollow)); return; }
  const shareInv = e.target.closest('[data-share-invoice]'); if(shareInv){ shareInvoice(shareInv.dataset.shareInvoice); return; }
  const pay = e.target.closest('[data-mark-paid]'); if(pay){ await markInvoicePaid(pay.dataset.markPaid); return; }
  const view = e.target.closest('[data-view-invoice]'); if(view){ openInvoiceDoc(view.dataset.viewInvoice); return; }
  const st = e.target.closest('[data-invoice-status]'); if(st){ setInvoiceStatus(st.dataset.invoiceStatus); return; }
  const add = e.target.closest('#mAddLine,#mAddLineTop'); if(add){ invoiceLines.push(newLine('',1,0)); renderInvoiceLines(); return; }
  const rm = e.target.closest('[data-remove-line]'); if(rm){ invoiceLines = invoiceLines.filter(l => l.id !== rm.dataset.removeLine); ensureLines(); renderInvoiceLines(); return; }
  const draft = e.target.closest('#mSaveDraft'); if(draft){ await saveInvoice('Borrador'); return; }
  const preview = e.target.closest('#mPreviewInvoice'); if(preview){ openInvoiceDoc(null, buildInvoicePreviewObject('Vista previa')); return; }
  const last = e.target.closest('#mViewLastDoc'); if(last){ if(lastCreatedInvoiceId) openInvoiceDoc(lastCreatedInvoiceId); else openInvoiceDoc(null, buildInvoicePreviewObject('Vista previa')); return; }
  if(e.target.id === 'mCloseDoc'){ closeDoc(); return; }
  if(e.target.id === 'mPrintDoc'){ window.print(); return; }
  if(e.target.id === 'mShareDoc'){ shareCurrentDoc(); return; }
  if(e.target.id === 'applyUpdateBtn'){ applyWaitingUpdate(); return; }
});

document.addEventListener('input', e => {
  const row = e.target.closest('[data-line-row]');
  if(row){ updateLineFromRow(row); renderSummary(); return; }
});

document.addEventListener('change', e => {
  const row = e.target.closest('[data-line-row]');
  if(row){ updateLineFromRow(row); renderSummary(); return; }
});

$('mobileAuthForm')?.addEventListener('submit', async e => {
  e.preventDefault(); $('mobileAuthMsg').textContent = 'Conectando…';
  try { await signInWithEmailAndPassword(auth, $('mobileEmail').value, $('mobilePassword').value); $('mobileAuthMsg').textContent = ''; }
  catch(err){ $('mobileAuthMsg').textContent = err.message || 'No se pudo entrar.'; }
});
$('mobileLogout')?.addEventListener('click', () => signOut(auth));
$('mForceReload')?.addEventListener('click', async () => {
  if('serviceWorker' in navigator){ const reg = await navigator.serviceWorker.getRegistration().catch(()=>null); await reg?.update?.().catch(()=>{}); if(reg?.waiting){ updateWaiting = reg.waiting; applyWaitingUpdate(); return; } }
  location.reload();
});
$('mClientSearch')?.addEventListener('input', renderClients);
$('mClientForm')?.addEventListener('submit', saveMobileClient);
$('mHistorySearch')?.addEventListener('input', renderHistory);
$('mRefreshInvoices')?.addEventListener('click', () => renderAll());
$('mInstallBtn')?.addEventListener('click', async () => {
  if(deferredInstallPrompt){ deferredInstallPrompt.prompt(); await deferredInstallPrompt.userChoice.catch(()=>{}); deferredInstallPrompt = null; renderSyncDetails(); return; }
  alert('En iPhone/iPad: abre Safari, toca Compartir y selecciona Añadir a pantalla de inicio.');
});
$('mInvoiceForm')?.addEventListener('submit', async e => { e.preventDefault(); await saveInvoice($('mInvStatus')?.value || 'Pendiente'); });
$('mFollowupForm')?.addEventListener('submit', saveMobileFollowup);

async function saveMobileFollowup(e){
  e.preventDefault();
  const form = e.currentTarget || e.target;
  const btn = form.querySelector('button[type="submit"]');
  const clientId = $('mFollowClient')?.value || '';
  const c = clientBy(clientId);
  if(!c.id){ showMobileNotice('Selecciona un cliente antes de guardar el seguimiento.', 'warn'); alert('Selecciona cliente.'); return; }
  const title = String($('mFollowTitle')?.value || '').trim();
  if(!title){ showMobileNotice('Escribe el asunto del seguimiento.', 'warn'); return; }
  const dueDate = $('mFollowDue')?.value || plusMonths(today(), 6);
  const intervalMonths = Math.max(0, Number($('mFollowInterval')?.value || 6));
  const payload = cleanPayload({
    clientId:c.id,
    clientName:c.name || '',
    clientPhone:c.phone || c.whatsapp || '',
    type:$('mFollowType')?.value || 'Mantenimiento',
    title,
    date:dueDate,
    dueDate,
    nextDate:dueDate,
    intervalMonths,
    status:'Programado',
    priority:$('mFollowPriority')?.value || 'Normal',
    channel:'WhatsApp',
    note:'',
    sourceType:'mobile',
    sourceId:'',
    createdByUid:uid(),
    createdAt:serverTimestamp(),
    updatedAt:serverTimestamp()
  });
  try{
    if(btn){ btn.disabled = true; btn.textContent = 'Guardando…'; }
    const ref = await addDoc(colRef('followups'), payload);
    state.followups = [{ id:ref.id, ...payload }, ...state.followups.filter(x => x.id !== ref.id)];
    form.reset();
    renderSelects();
    renderFollowups();
    renderDashboard();
    renderHistory();
    renderSyncDetails();
    setSync('Seguimiento guardado · sincronizando');
    showMobileNotice('Seguimiento guardado correctamente.', 'ok');
  }catch(err){
    console.error('Error guardando seguimiento móvil:', err);
    setSync('Error al guardar seguimiento');
    showMobileNotice(firebaseMessage(err), 'danger');
    alert(firebaseMessage(err));
  }finally{
    if(btn){ btn.disabled = false; btn.textContent = 'Guardar seguimiento'; }
  }
}


setupPwaInstall();
onAuthStateChanged(auth, async user => {
  unsub.forEach(fn => fn()); unsub = [];
  if(!user){ $('mobileAuth').classList.remove('hidden'); $('mobileApp').classList.add('hidden'); return; }
  $('mobileAuth').classList.add('hidden'); $('mobileApp').classList.remove('hidden');
  await loadProfile(); ensureLines(); renderInvoiceLines();
  COLS.forEach(c => unsub.push(onSnapshot(colRef(c), snap => { state[c] = snap.docs.map(d => ({ id:d.id, ...d.data() })); renderAll(); setSync('Sincronizado'); }, () => setSync('Error sync'))));
});

async function loadProfile(){
  const ref = doc(db, 'users', uid()); const snap = await getDoc(ref);
  state.profile = snap.exists() ? snap.data() : { businessName:'Nexus Business', tax:'11.5' };
  $('mobileBusiness').textContent = state.profile.businessName || 'Nexus Business';
}
function renderAll(){ renderSelects(); renderDashboard(); renderInvoices(); renderFollowups(); renderClients(); renderHistory(); renderSyncDetails(); renderSummary(); }
function renderSelects(){
  const opts = state.clients.map(c => `<option value="${esc(c.id)}">${esc(c.name || 'Cliente')}</option>`).join('');
  ['mInvClient', 'mFollowClient'].forEach(id => { const el = $(id); if(el){ const prev = el.value; el.innerHTML = `<option value="">Seleccionar cliente</option>${opts}`; if(prev) el.value = prev; } });
  if($('mInvDate') && !$('mInvDate').value) $('mInvDate').value = today();
  if($('mInvDue') && !$('mInvDue').value) $('mInvDue').value = plusDays(15);
  if($('mFollowDue') && !$('mFollowDue').value) $('mFollowDue').value = plusMonths(today(), 6);
}
async function saveMobileClient(e){
  e.preventDefault();
  const name = $('mClientName')?.value?.trim();
  if(!name) return alert('Escribe el nombre del cliente.');
  const tag = $('mClientTag')?.value || '';
  const payload = {
    name,
    phone: $('mClientPhone')?.value?.trim() || '',
    email: $('mClientEmail')?.value?.trim() || '',
    city: $('mClientCity')?.value?.trim() || '',
    address: $('mClientAddress')?.value?.trim() || '',
    tags: tag ? [tag] : [],
    notes: $('mClientNotes')?.value?.trim() || '',
    sourceType: 'mobile',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  const ref = await addDoc(colRef('clients'), payload);
  e.target.reset();
  setSync('Cliente guardado · sincronizando');
  switchTab('mInvoice');
  setTimeout(() => { const sel = $('mInvClient'); if(sel){ sel.value = ref.id; } }, 500);
}
function startInvoiceForClient(clientId){
  switchTab('mInvoice');
  const sel = $('mInvClient');
  if(sel) sel.value = clientId || '';
}
function setInvoiceStatus(status){
  $('mInvStatus').value = status;
  document.querySelectorAll('[data-invoice-status]').forEach(b => b.classList.toggle('active', b.dataset.invoiceStatus === status));
  renderSummary();
}
function renderInvoiceLines(){
  ensureLines();
  const box = $('mInvoiceLines'); if(!box) return;
  box.innerHTML = invoiceLines.map((l, idx) => `
    <div class="invoice-line" data-line-row="${esc(l.id)}">
      <div class="line-head"><span>Línea ${idx + 1}</span><button class="danger" data-remove-line="${esc(l.id)}" type="button">Borrar</button></div>
      <label>Descripción *<textarea data-line-field="description" rows="2" maxlength="220" placeholder="Ej. Mantenimiento preventivo 6 meses" required>${esc(l.description)}</textarea></label>
      <div class="three-col">
        <label>Cant.<input data-line-field="qty" type="number" min="1" step="1" value="${esc(l.qty)}" /></label>
        <label>Precio<input data-line-field="price" type="number" min="0" step="0.01" value="${esc(l.price)}" /></label>
        <label>Desc.<input data-line-field="discount" type="number" min="0" step="0.01" value="${esc(l.discount)}" /></label>
      </div>
      <div class="line-footer"><label class="tax-check"><input data-line-field="taxable" type="checkbox" ${l.taxable === false ? '' : 'checked'} /> Aplica IVU</label><b>${money(lineNet(l) + (l.taxable === false ? 0 : lineNet(l) * taxRate()))}</b></div>
    </div>`).join('');
  renderSummary();
}
function updateLineFromRow(row){
  const id = row.dataset.lineRow;
  const l = invoiceLines.find(x => x.id === id); if(!l) return;
  row.querySelectorAll('[data-line-field]').forEach(el => {
    const f = el.dataset.lineField;
    if(f === 'taxable') l[f] = el.checked;
    else if(['qty','price','discount'].includes(f)) l[f] = Number(el.value || 0);
    else l[f] = el.value;
  });
}
function renderSummary(){
  const c = invoiceCalc();
  if($('mInvSubtotal')) $('mInvSubtotal').textContent = money(c.subtotal);
  if($('mInvDiscountTotal')) $('mInvDiscountTotal').textContent = money(c.discount);
  if($('mInvTax')) $('mInvTax').textContent = money(c.ivu);
  if($('mInvTotal')) $('mInvTotal').textContent = money(c.total);
  const status = $('mInvStatus')?.value || 'Pendiente';
  if($('mInvStatusText')) $('mInvStatusText').textContent = status;
  if($('mInvBalanceText')) $('mInvBalanceText').textContent = `Balance: ${status === 'Pagada' ? money(0) : money(c.total)}`;
}
function renderDashboard(){
  const month = today().slice(0,7);
  const monthInvoices = state.invoices.filter(i => String(i.date || '').startsWith(month));
  const monthPayments = state.payments.filter(p => String(p.date || '').startsWith(month));
  const invoiced = monthInvoices.reduce((a,i) => a + Number(i.total || 0), 0);
  const paid = monthPayments.reduce((a,p) => a + Number(p.amount || 0), 0);
  const receivable = state.invoices.reduce((a,i) => a + invoiceBalance(i), 0);
  const overdue = state.invoices.filter(i => invoiceStatus(i) === 'Vencida').reduce((a,i) => a + invoiceBalance(i), 0);
  $('mMonthNet').textContent = money(paid);
  $('mBillingKpis').innerHTML = [['Facturado mes', invoiced], ['Cobrado mes', paid], ['Por cobrar', receivable], ['Vencido', overdue]].map(x => `<div class="metric"><small>${x[0]}</small><b>${money(x[1])}</b></div>`).join('');
  renderInvoiceTypeKpis(monthInvoices);
  const critical = followupRows().filter(f => followStatus(f) !== 'Completado').slice(0,4);
  $('mCriticalFollowups').innerHTML = critical.length ? critical.map(followCard).join('') : '<div class="empty">Sin seguimientos críticos.</div>';
}
function renderInvoiceTypeKpis(monthInvoices){
  const target = $('mTypeKpis'); if(!target) return;
  const grouped = {};
  (monthInvoices || []).forEach(inv => { const key = inv.invoiceType || inv.type || 'Servicio'; if(!grouped[key]) grouped[key] = { count:0, total:0 }; grouped[key].count++; grouped[key].total += Number(inv.total || 0); });
  const preferred = ['Servicio','Mantenimiento','Instalación','Diagnóstico','Cotización','Reparación','Otro'];
  const rows = preferred.filter(k => grouped[k]).concat(Object.keys(grouped).filter(k => !preferred.includes(k)));
  target.innerHTML = rows.length ? rows.map(k => `<div class="type-chip"><small>${esc(k)} · ${grouped[k].count}</small><b>${money(grouped[k].total)}</b></div>`).join('') : '<div class="empty">Sin facturas este mes.</div>';
}
function renderInvoices(){
  const rows = sorted(state.invoices, 'date').slice(0,30);
  $('mInvoiceList').innerHTML = rows.length ? rows.map(inv => {
    const c = clientBy(inv.clientId);
    return `<div class="row-card"><div class="top"><div><h4>${esc(inv.number || 'Factura')}</h4><p>${esc(inv.clientName || c.name || 'Cliente')} · ${esc(inv.serviceTitle || inv.invoiceType || 'Servicio')}</p></div>${statusBadge(invoiceStatus(inv))}</div><p>Total ${money(inv.total)} · Balance ${money(invoiceBalance(inv))}</p><div class="actions"><button data-view-invoice="${esc(inv.id)}" type="button">Ver documento</button><button data-share-invoice="${esc(inv.id)}" type="button">Compartir</button>${invoiceBalance(inv) > 0 ? `<button data-mark-paid="${esc(inv.id)}" type="button">Marcar pagada</button>` : ''}</div></div>`;
  }).join('') : '<div class="empty">No hay facturas.</div>';
}
function followStatus(f){ if(String(f.status || '') === 'Completado') return 'Completado'; const d = String(f.dueDate || ''); if(d && d < today()) return 'Vencida'; if(d && d <= plusDays(14)) return 'Próximo'; return f.status || 'Programado'; }
function followupRows(){ return [...state.followups].sort((a,b) => String(a.dueDate || '').localeCompare(String(b.dueDate || ''))); }
function mobileIsQuoteFollowup(f){
  const type=String(f?.type||'').toLowerCase();
  const source=String(f?.sourceType||'').toLowerCase();
  const title=String(f?.title||'').toLowerCase();
  return type.includes('cotiz') || source==='quote' || title.includes('cotiz');
}
function mobileFollowupMessage(f,c){
  const name=String(f.clientName||c.name||'').trim();
  if(mobileIsQuoteFollowup(f)){
    const quote=state.quotes.find(q=>q.id===f.sourceId) || {};
    const number=String(f.quoteNumber||quote.number||'').trim();
    const reference=number ? ` ${number}` : '';
    return `Hola${name?', '+name:''}. 👋

Le escribimos para dar seguimiento a la cotización${reference} que le enviamos. Deseamos confirmar si pudo revisarla y saber si tiene alguna pregunta, necesita algún ajuste o desea continuar con el servicio.

Quedamos atentos para ayudarle y coordinar los próximos pasos.

Gracias por considerar a Oasis Air Cleaner Services LLC.`;
  }
  return `Hola${name?', '+name:''}. 👋

Solo queríamos darle seguimiento desde nuestra última visita para asegurarnos de que su aire acondicionado continúe funcionando correctamente.

Si desea programar su próximo mantenimiento o necesita asistencia, estaremos encantados de ayudarle.

📅 Agende su cita cuando le sea más conveniente:
https://confirmafy.com/oasis-services-pr

Gracias por confiar en Oasis Air Cleaner Services LLC.`;
}
function followCard(f){ const c = clientBy(f.clientId); const phone = phoneLink(c); const text=mobileFollowupMessage(f,c); return `<div class="row-card"><div class="top"><div><h4>${esc(f.title || f.type || 'Seguimiento')}</h4><p>${esc(f.clientName || c.name || 'Cliente')} · ${esc(f.dueDate || 'Sin fecha')}</p></div>${statusBadge(followStatus(f))}</div><p>${esc(f.type || '')} · cada ${esc(f.intervalMonths || 6)} meses</p><div class="actions">${phone ? `<a href="${phone}?text=${encodeURIComponent(text)}" target="_blank" rel="noopener">WhatsApp</a>` : ''}<button data-complete-follow="${esc(f.id)}" type="button">Completar</button><button class="danger" data-delete-follow="${esc(f.id)}" type="button">Borrar</button></div></div>`; }

function renderFollowups(){
  let rows = followupRows();
  if(currentFilter === 'due') rows = rows.filter(f => followStatus(f) === 'Vencida');
  if(currentFilter === 'next') rows = rows.filter(f => followStatus(f) === 'Próximo');
  if(currentFilter === 'maint') rows = rows.filter(f => String(f.type || '').toLowerCase().includes('mant'));
  $('mFollowupList').innerHTML = rows.length ? rows.map(followCard).join('') : '<div class="empty">Sin seguimientos para este filtro.</div>';
}
function renderClients(){
  const q = String($('mClientSearch')?.value || '').toLowerCase();
  const rows = state.clients.filter(c => [c.name,c.phone,c.email,c.address].join(' ').toLowerCase().includes(q)).slice(0,60);
  $('mClientCount').textContent = `${state.clients.length} clientes`;
  $('mClientList').innerHTML = rows.length ? rows.map(c => { const invs = state.invoices.filter(i => i.clientId === c.id), fol = state.followups.filter(f => f.clientId === c.id); return `<div class="row-card"><div class="top"><div><h4>${esc(c.name || 'Cliente')}</h4><p>${esc(c.phone || '')} ${c.email ? '· ' + esc(c.email) : ''}</p></div><span class="badge">${invs.length} fac.</span></div><p>${esc(c.address || c.city || '')}</p><div class="actions"><button data-new-invoice-client="${esc(c.id)}" type="button">Facturar</button><button data-tab="mHistory" type="button">Historial</button>${phoneLink(c) ? `<a href="${phoneLink(c)}" target="_blank" rel="noopener">WhatsApp</a>` : ''}<span class="badge">${fol.length} seg.</span></div></div>`; }).join('') : '<div class="empty">Sin clientes.</div>';
}
function renderHistory(){
  const q = String($('mHistorySearch')?.value || '').toLowerCase();
  const items = [];
  state.invoices.forEach(i => items.push({ date:i.date, type:'Factura', title:i.number, client:i.clientName, detail:`${i.serviceTitle || i.invoiceType || 'Servicio'} · ${money(i.total)} · ${invoiceStatus(i)}` }));
  state.payments.forEach(p => items.push({ date:p.date, type:'Cobro', title:p.invoiceNumber, client:'', detail:`${p.method || 'Pago'} · ${money(p.amount)}` }));
  state.followups.forEach(f => items.push({ date:f.dueDate, type:'Seguimiento', title:f.title || f.type, client:f.clientName, detail:`${followStatus(f)} · ${f.type || ''}` }));
  state.services.forEach(s => items.push({ date:s.date, type:'Servicio', title:s.title || s.serviceType || 'Servicio', client:s.clientName, detail:`${s.status || ''} · ${money(s.amount)}` }));
  const rows = items.filter(x => [x.title,x.client,x.detail,x.type].join(' ').toLowerCase().includes(q)).sort((a,b) => String(b.date || '').localeCompare(String(a.date || ''))).slice(0,80);
  $('mHistoryList').innerHTML = rows.length ? rows.map(x => `<div class="timeline-item"><div><h4>${esc(x.date || '—')} · ${esc(x.type)}</h4><p><b>${esc(x.client || '')}</b> ${esc(x.title || '')}</p><p>${esc(x.detail || '')}</p></div></div>`).join('') : '<div class="empty">Sin historial.</div>';
}
function renderSyncDetails(){
  const installBox = $('mInstallBox');
  if(installBox) installBox.innerHTML = isStandalone() ? '<b>Instalada:</b> Nexus Mobile está corriendo como app PWA.' : '<b>Instalación iPhone/iPad:</b> abre en Safari → Compartir → Añadir a pantalla de inicio.';
  const online = navigator.onLine ? 'Online' : 'Offline';
  const standalone = isStandalone() ? 'App instalada' : 'Navegador';
  $('mSyncDetails').innerHTML = [['Versión', APP_VERSION], ['Estado', online], ['Modo', standalone], ['Clientes', state.clients.length], ['Facturas', state.invoices.length], ['Cobros', state.payments.length], ['Seguimientos', state.followups.length], ['Cotizaciones', state.quotes.length], ['Servicios', state.services.length]].map(x => `<div class="metric"><small>${x[0]}</small><b>${x[1]}</b></div>`).join('');
}
async function saveInvoice(forcedStatus){
  const c = clientBy($('mInvClient').value); if(!c.id) return alert('Selecciona cliente.');
  ensureLines();
  const validLines = invoiceLines.filter(l => String(l.description || '').trim() && Number(l.qty || 0) > 0);
  if(!validLines.length) return alert('Añade al menos una línea con descripción y cantidad.');
  const calc = invoiceCalc();
  const status = forcedStatus || $('mInvStatus').value || 'Pendiente';
  const number = $('mInvNumber').value || 'INV-M-' + String(Date.now()).slice(-7);
  const payload = { number, date:$('mInvDate').value, dueDate:$('mInvDue').value, clientId:c.id, clientName:c.name || '', invoiceType:$('mInvType').value, serviceTitle:validLines[0]?.description || $('mInvType').value, items:validLines.map(l => ({ description:l.description, qty:Number(l.qty||1), price:Number(l.price||0), discount:Number(l.discount||0), taxable:l.taxable !== false, total:lineNet(l) })), subtotal:calc.subtotal, discount:calc.discount, ivu:calc.ivu, tax:calc.ivu, taxPercent:Number(state.profile?.tax || 11.5), total:calc.total, status, notes:$('mInvNotes').value, terms:'Pago según acuerdo.', sourceType:'mobile-v62', paymentMethod:$('mInvPaymentMethod').value || '', updatedAt:serverTimestamp(), createdAt:serverTimestamp() };
  const ref = await addDoc(colRef('invoices'), payload);
  lastCreatedInvoiceId = ref.id;
  if(status === 'Pagada'){
    await addDoc(colRef('payments'), { invoiceId:ref.id, invoiceNumber:number, date:$('mInvDate').value || today(), method:$('mInvPaymentMethod').value || 'Móvil', amount:calc.total, note:'Pago registrado al crear factura móvil', createdAt:serverTimestamp() });
  }
  await createAutoFollowupFromInvoice(ref.id, payload).catch(err => console.warn('No se pudo crear seguimiento automático:', err));
  $('mInvoiceForm').reset(); invoiceLines = [newLine('Mantenimiento preventivo 6 meses', 1, 75)]; renderSelects(); renderInvoiceLines(); setInvoiceStatus('Pendiente'); openInvoiceDoc(null, { id:ref.id, ...payload });
}
async function createAutoFollowupFromInvoice(invoiceId, inv){
  const type = String(inv.invoiceType || inv.type || '').toLowerCase();
  const shouldCreate = type.includes('mant') || type.includes('instal');
  if(!shouldCreate || !inv.clientId) return;
  const dueDate = plusMonths(inv.date || today(), 6);
  const followType = type.includes('instal') ? 'Instalación' : 'Mantenimiento';
  await addDoc(colRef('followups'), cleanPayload({
    clientId:inv.clientId,
    clientName:inv.clientName || '',
    clientPhone:clientBy(inv.clientId).phone || clientBy(inv.clientId).whatsapp || '',
    type:followType,
    title:followType === 'Instalación' ? 'Seguimiento post-instalación / mantenimiento 6 meses' : 'Mantenimiento preventivo 6 meses',
    date:dueDate,
    dueDate,
    nextDate:dueDate,
    intervalMonths:6,
    status:'Programado',
    priority:'Normal',
    channel:'WhatsApp',
    note:'Creado automáticamente desde factura móvil.',
    sourceType:'invoice-mobile',
    sourceId:invoiceId,
    createdByUid:uid(),
    createdAt:serverTimestamp(),
    updatedAt:serverTimestamp()
  }));
}
async function completeFollowup(id){
  const f = state.followups.find(x => x.id === id); if(!f) return;
  try{
    await updateDoc(docRef('followups', id), { status:'Completado', completedAt:today(), updatedAt:serverTimestamp() });
    if(String(f.type || '').toLowerCase().includes('mant')){
      const dueDate = plusMonths(today(), Number(f.intervalMonths || 6));
      await addDoc(colRef('followups'), cleanPayload({ clientId:f.clientId || '', clientName:f.clientName || '', clientPhone:f.clientPhone || '', assetId:f.assetId || '', assetName:f.assetName || '', type:'Mantenimiento', title:f.title || 'Mantenimiento preventivo 6 meses', date:dueDate, dueDate, nextDate:dueDate, intervalMonths:Number(f.intervalMonths || 6), status:'Programado', priority:f.priority || 'Normal', channel:f.channel || 'WhatsApp', sourceType:'recurring-mobile', sourceId:id, createdByUid:uid(), createdAt:serverTimestamp(), updatedAt:serverTimestamp() }));
    }
    showMobileNotice('Seguimiento completado.', 'ok');
  }catch(err){
    console.error('Error completando seguimiento:', err);
    showMobileNotice(firebaseMessage(err), 'danger');
    alert(firebaseMessage(err));
  }
}
async function markInvoicePaid(id){ const inv = state.invoices.find(i => i.id === id); if(!inv) return; const bal = invoiceBalance(inv); if(bal <= 0) return; await addDoc(colRef('payments'), { invoiceId:inv.id, invoiceNumber:inv.number, date:today(), method:'Móvil', amount:bal, note:'Pago registrado desde Nexus Mobile', createdAt:serverTimestamp() }); await updateDoc(docRef('invoices', id), { status:'Pagada', paymentMethod:'Móvil', updatedAt:serverTimestamp() }); }
async function imageToDataUrl(src){
  if(!src) return '';
  try{
    if(String(src).startsWith('data:image')) return src;
    const res = await fetch(src, { cache:'force-cache' });
    if(!res.ok) throw new Error('Logo no disponible');
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error || new Error('No se pudo leer logo'));
      reader.readAsDataURL(blob);
    });
  }catch(err){
    return '';
  }
}
async function getPdfLogoDataUrl(){
  const p = state.profile || {};
  const candidates = [p.logoPdf, p.logoDashboard, p.logo, './assets/logo.png', 'assets/logo.png'];
  for(const src of candidates){
    const data = await imageToDataUrl(src);
    if(data) return data;
  }
  return '';
}
function fitText(docp, text, x, y, maxWidth, lineHeight=11, maxLines=3){
  const lines = docp.splitTextToSize(String(text || ''), maxWidth).slice(0, maxLines);
  lines.forEach((line, idx) => docp.text(line, x, y + (idx * lineHeight)));
  return y + Math.max(1, lines.length) * lineHeight;
}
function drawLabelBox(docp, x, y, w, h, label, value, opts={}){
  docp.setDrawColor(70,70,70); docp.setLineWidth(.8); docp.roundedRect(x, y, w, h, 4, 4);
  docp.setTextColor(20,20,20); docp.setFont('helvetica','bold'); docp.setFontSize(8);
  docp.text(String(label || '').toUpperCase(), x+8, y+12);
  docp.setFont('helvetica', opts.bold ? 'bold' : 'normal'); docp.setFontSize(opts.size || 9);
  if(opts.center){ docp.text(String(value || ''), x+w/2, y+h/2+5, { align:'center' }); }
  else { fitText(docp, value, x+8, y+28, w-16, 11, opts.lines || 3); }
}
function addPdfFooter(docp, pageNo=1){
  const p = state.profile || {};
  docp.setFont('helvetica','italic'); docp.setFontSize(10); docp.setTextColor(30,30,30);
  docp.text('¡Gracias por confiar en nosotros!', 297.5, 805, { align:'center' });
  docp.setFont('helvetica','bold'); docp.setFontSize(8);
  docp.text(String(p.businessName || 'Oasis Air Cleaner Services LLC'), 297.5, 820, { align:'center' });
  docp.setFont('helvetica','normal'); docp.text(String(pageNo), 540, 820, { align:'right' });
}
async function buildInvoicePdfFile(inv, filename){
  if(!window.jspdf?.jsPDF) throw new Error('Motor PDF no disponible.');
  const { jsPDF } = window.jspdf;
  const docp = new jsPDF({ unit:'pt', format:'a4', compress:true });
  const p = state.profile || {};
  const c = clientBy(inv.clientId);
  const totals = invoiceTotalsDoc(inv);
  const existing = inv.id ? state.invoices.find(i => i.id === inv.id) : null;
  const paid = existing ? invoicePaid(existing) : (String(inv.status || '') === 'Pagada' ? totals.total : Number(inv.paid || 0));
  const bal = existing ? invoiceBalance(existing) : Math.max(0, totals.total - paid);
  const status = existing ? invoiceStatus(existing) : (bal <= 0 || String(inv.status || '') === 'Pagada' ? 'Pagada' : (String(inv.status || '') || 'Pendiente'));
  const logo = await getPdfLogoDataUrl();
  const items = Array.isArray(inv.items) && inv.items.length ? inv.items : [{ description:inv.serviceTitle || inv.invoiceType || 'Servicio', qty:1, price:totals.subtotal, discount:0 }];

  const W = docp.internal.pageSize.getWidth();
  const H = docp.internal.pageSize.getHeight();
  const M = 54;
  const navy = [9, 42, 82];
  const blue = [17, 72, 132];
  const line = [212, 221, 232];
  const light = [245, 248, 252];
  let pageNo = 1;

  const txt = (text, x, y, opts={}) => {
    docp.setFont('helvetica', opts.bold ? 'bold' : (opts.italic ? 'italic' : 'normal'));
    docp.setFontSize(opts.size || 9);
    if(opts.color) docp.setTextColor(...opts.color); else docp.setTextColor(16,24,40);
    docp.text(String(text ?? ''), x, y, opts.align ? { align:opts.align, maxWidth:opts.maxWidth } : (opts.maxWidth ? { maxWidth:opts.maxWidth } : undefined));
  };
  const moneyText = n => money(n).replace(/\u00a0/g,' ');
  const box = (x,y,w,h, opts={}) => {
    docp.setDrawColor(...(opts.stroke || line));
    docp.setLineWidth(opts.lineWidth || .8);
    if(opts.fill){ docp.setFillColor(...opts.fill); docp.roundedRect(x,y,w,h,opts.r||4,opts.r||4,'FD'); }
    else docp.roundedRect(x,y,w,h,opts.r||4,opts.r||4,'S');
  };
  const wrap = (text, width) => docp.splitTextToSize(String(text || ''), width);
  const addFooter = () => {
    txt('¡Gracias por su preferencia!', W/2, H-82, { size:12, italic:true, color:blue, align:'center' });
    docp.setDrawColor(...line); docp.line(M, H-58, W-M, H-58);
    txt(String(p.businessName || 'Oasis Air Cleaner Services LLC').toUpperCase(), W/2-34, H-38, { size:7, bold:true, color:[100,116,139], align:'right' });
    txt('|', W/2, H-38, { size:7, color:[100,116,139], align:'center' });
    txt('Gracias por su preferencia', W/2+34, H-38, { size:7, color:[100,116,139] });
    txt(String(pageNo), W-M, H-38, { size:7, color:[100,116,139], align:'right' });
  };
  const newPage = () => { addFooter(); docp.addPage(); pageNo += 1; y = M; };

  // Header igual al documento corporativo de escritorio: logo/empresa izquierda, contacto derecha, título al centro.
  if(logo){
    try{ docp.addImage(logo, 'PNG', M, 42, 64, 48, undefined, 'FAST'); }catch(e){}
  }
  txt(String(p.businessName || 'Oasis Air Cleaner Services LLC').toUpperCase(), M + (logo ? 76 : 0), 56, { size:18, bold:true, color:navy, maxWidth:260 });
  if(p.email) txt(p.email, M + (logo ? 76 : 0), 82, { size:8, color:[71,85,105] });

  const contactX = W - M;
  const contactLines = [p.address || 'TRUJILLO ALTO, PR. 00976', p.phone || '787-664-3079', p.email || 'oasisairconditioner@icloud.com', p.web || p.website || ''].filter(Boolean);
  contactLines.forEach((l,i)=>txt(l, contactX, 52 + i*12, { size:8, bold:i===0, color:[71,85,105], align:'right' }));
  docp.setDrawColor(...line); docp.line(W-162, 45, W-162, 98);

  txt('FACTURA', W/2, 140, { size:22, bold:true, color:navy, align:'center' });
  txt(`No. de Factura: ${inv.number || 'Factura'}`, M, 128, { size:8.5, bold:true });
  txt(`Fecha: ${niceDate(inv.date || today())}`, M, 146, { size:8.5, bold:true });
  txt(`Vence: ${inv.dueDate ? niceDate(inv.dueDate) : '—'}`, M, 164, { size:8.5, bold:true });

  box(W-154, 116, 100, 54, { stroke:line, fill:[255,255,255] });
  docp.setFillColor(...navy); docp.roundedRect(W-154, 116, 100, 22, 4, 4, 'F');
  txt('ESTADO', W-104, 131, { size:7.5, bold:true, color:[255,255,255], align:'center' });
  txt(String(status).toUpperCase(), W-104, 157, { size:10, bold:true, color: status === 'Pagada' ? [22,101,52] : navy, align:'center' });

  docp.setDrawColor(...line); docp.line(M, 190, W-M, 190);

  // Cliente
  const cardY = 214;
  box(M, cardY, 235, 82, { stroke:line, fill:[255,255,255] });
  box(M+250, cardY, W-M-(M+250), 82, { stroke:line, fill:[255,255,255] });
  txt('CLIENTE', M+12, cardY+18, { size:7.5, bold:true, color:blue });
  const cName = inv.clientName || c.name || '';
  txt(cName, M+12, cardY+38, { size:9, bold:true, maxWidth:210 });
  txt('Teléfono:', M+262, cardY+20, { size:7.5, bold:true, color:blue });
  txt(c.phone || inv.clientPhone || '—', M+262, cardY+38, { size:8.5 });
  txt('Dirección:', M+262, cardY+56, { size:7.5, bold:true, color:blue });
  wrap(c.address || inv.address || c.city || '—', W-M-(M+274)).slice(0,2).forEach((l,i)=>txt(l, M+262, cardY+72+i*10, { size:8 }));

  // Tabla de partidas
  let y = 328;
  const tableX = M, tableW = W - M*2;
  const colDescW = 285, colQtyW = 68, colPriceW = 105, colTotalW = tableW - colDescW - colQtyW - colPriceW;
  const drawItemsHeader = () => {
    docp.setFillColor(...navy); docp.roundedRect(tableX, y, tableW, 26, 3, 3, 'F');
    txt('DESCRIPCIÓN', tableX+10, y+17, { size:7.5, bold:true, color:[255,255,255] });
    txt('CANT.', tableX+colDescW+colQtyW/2, y+17, { size:7.5, bold:true, color:[255,255,255], align:'center' });
    txt('PRECIO UNIT.', tableX+colDescW+colQtyW+colPriceW/2, y+17, { size:7.5, bold:true, color:[255,255,255], align:'center' });
    txt('TOTAL', tableX+tableW-10, y+17, { size:7.5, bold:true, color:[255,255,255], align:'right' });
    y += 26;
  };
  drawItemsHeader();
  items.forEach((it)=>{
    const desc = String(it.description || 'Servicio');
    const qty = Number(it.qty || 1);
    const price = Number(it.price || 0);
    const discount = Number(it.discount || 0);
    const total = Math.max(0, (qty * price) - discount);
    const lines = wrap(desc, colDescW-18);
    const rowH = Math.max(42, 18 + lines.length * 12);
    if(y + rowH > 628){ newPage(); drawItemsHeader(); }
    docp.setDrawColor(...line); docp.setFillColor(255,255,255); docp.rect(tableX, y, tableW, rowH, 'FD');
    docp.line(tableX+colDescW, y, tableX+colDescW, y+rowH);
    docp.line(tableX+colDescW+colQtyW, y, tableX+colDescW+colQtyW, y+rowH);
    docp.line(tableX+colDescW+colQtyW+colPriceW, y, tableX+colDescW+colQtyW+colPriceW, y+rowH);
    lines.slice(0,4).forEach((l,i)=>txt(l, tableX+10, y+19+i*12, { size:8.2, bold:i===0 }));
    txt(qty.toFixed(2), tableX+colDescW+colQtyW/2, y+22, { size:8, align:'center' });
    txt(moneyText(price), tableX+colDescW+colQtyW+colPriceW-10, y+22, { size:8, align:'right' });
    txt(moneyText(total), tableX+tableW-10, y+22, { size:8, bold:true, align:'right' });
    y += rowH;
  });

  // Bloques inferiores y totales
  y += 28;
  if(y > 610){ newPage(); }
  const lowerY = y;
  box(M, lowerY, 240, 76, { stroke:line, fill:[255,255,255] });
  txt('NOTAS', M+12, lowerY+18, { size:7.5, bold:true, color:blue });
  wrap(inv.notes || 'Gracias por su preferencia.', 216).slice(0,4).forEach((l,i)=>txt(l, M+12, lowerY+38+i*11, { size:8 }));

  box(M, lowerY+92, 240, 76, { stroke:line, fill:[255,255,255] });
  txt('CONDICIONES', M+12, lowerY+110, { size:7.5, bold:true, color:blue });
  wrap(invoicePaymentTerms(inv, inv.terms || inv.conditions || 'Pago según acuerdo.'), 216).slice(0,4).forEach((l,i)=>txt(l, M+12, lowerY+130+i*11, { size:8 }));

  const tx = W - M - 210;
  const tw = 210;
  const rh = 26;
  const totalRows = [
    ['SUBTOTAL', totals.subtotal, false, [255,255,255]],
    [`IVU (${totals.taxPercent}%)`, totals.ivu, false, [255,255,255]],
    ['TOTAL', totals.total, true, [239,246,255]],
    ['PAGADO', paid, false, [255,255,255]],
    ['BALANCE', bal, true, [219,245,226]]
  ];
  let ty = lowerY;
  totalRows.forEach(([label,val,bold,fill])=>{
    docp.setFillColor(...fill); docp.setDrawColor(...line); docp.rect(tx, ty, tw, rh, 'FD');
    docp.line(tx+118, ty, tx+118, ty+rh);
    txt(label, tx+108, ty+17, { size:8.5, bold:!!bold, align:'right', color:navy });
    txt(moneyText(val), tx+200, ty+17, { size:8.5, bold:!!bold, align:'right', color:navy });
    ty += rh;
  });

  addFooter();
  const blob = docp.output('blob');
  return new File([blob], filename || `Factura-${inv.number || 'Nexus'}.pdf`, { type:'application/pdf' });
}
async function shareInvoice(id){
  const inv = state.invoices.find(i => i.id === id);
  if(!inv) return;
  const filename = `Factura-${String(inv.number || id).replace(/[^a-z0-9_-]+/gi,'-')}.pdf`;
  const btn = document.querySelector(`[data-share-invoice="${CSS.escape(id)}"]`);
  const oldText = btn ? btn.textContent : '';
  try{
    if(btn){ btn.disabled = true; btn.textContent = 'Generando PDF…'; }
    await sleep(30);
    const file = await buildInvoicePdfFile(inv, filename);
    if(!file || file.size < 10000) throw new Error('PDF vacío o inválido.');
    if(navigator.share && navigator.canShare && navigator.canShare({ files:[file] })){
      if(btn) btn.textContent = 'Compartiendo…';
      await navigator.share({ title:`Factura ${inv.number || ''}`, text:'Factura adjunta en PDF.', files:[file] });
      return;
    }
    await openPdfFile(file, filename);
  }catch(err){
    console.error('PDF share failed', err);
    alert('No se pudo compartir directamente. Se abrirá/descargará el PDF para compartirlo desde Archivos.');
    try{
      const file = await buildInvoicePdfFile(inv, filename);
      downloadPdfFile(file, filename);
    }catch(e){ console.error(e); }
  }finally{
    if(btn){ btn.disabled = false; btn.textContent = oldText || 'Compartir'; }
  }
}
function downloadPdfFile(file, filename){
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || file.name || 'Factura.pdf';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 15000);
}
function fileToDataUrl(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('No se pudo leer el PDF.'));
    reader.readAsDataURL(file);
  });
}
async function openPdfFile(file, filename, targetWindow=null){
  // iOS PWA: blob URLs suelen abrir como about:blank.
  // Solución: crear un visor HTML real y embeber el PDF como data URL.
  if(isIOSPWA()){
    await openPdfInIOSViewer(file, filename, targetWindow);
    return;
  }
  const url = URL.createObjectURL(file);
  if(targetWindow && !targetWindow.closed){
    targetWindow.location.href = url;
  }else{
    const opened = window.open(url, '_blank');
    if(!opened) downloadPdfFile(file, filename);
  }
  setTimeout(()=>URL.revokeObjectURL(url), 120000);
}
async function openPdfInIOSViewer(file, filename, targetWindow=null){
  const safeName = filename || file.name || 'Factura.pdf';
  const dataUrl = await fileToDataUrl(file);
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${safeName}</title><style>body{margin:0;background:#f8fafc;color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif}.bar{position:sticky;top:0;z-index:5;background:rgba(255,255,255,.96);backdrop-filter:blur(16px);padding:14px 16px;border-bottom:1px solid #e2e8f0;display:flex;gap:10px;align-items:center;justify-content:space-between}.bar b{font-size:15px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.actions{display:flex;gap:8px}a,button{border:1px solid #bfdbfe;background:#fff;color:#1d4ed8;border-radius:12px;padding:10px 12px;font-weight:800;text-decoration:none;font-size:14px}.primary{background:#2563eb;color:white;border-color:#2563eb}.note{padding:10px 16px;color:#475569;font-size:13px}.viewer{height:calc(100vh - 112px);width:100%;border:0;background:#fff}object,iframe{width:100%;height:100%;border:0}.fallback{padding:24px;text-align:center}</style></head><body><div class="bar"><b>${safeName}</b><div class="actions"><a class="primary" href="${dataUrl}" download="${safeName}">Descargar</a><button onclick="window.print()">Imprimir</button></div></div><div class="note">Para compartir: toca Descargar y luego usa el botón de compartir de iPhone/iPad desde Archivos o Vista previa.</div><div class="viewer"><object data="${dataUrl}" type="application/pdf"><iframe src="${dataUrl}"></iframe><div class="fallback"><p>Tu iPhone no mostró el PDF incrustado.</p><p><a class="primary" href="${dataUrl}" download="${safeName}">Descargar PDF</a></p></div></object></div></body></html>`;
  let w = targetWindow && !targetWindow.closed ? targetWindow : null;
  if(!w) w = window.open('', '_blank');
  if(w && !w.closed){
    w.document.open();
    w.document.write(html);
    w.document.close();
  }else{
    downloadPdfFile(file, safeName);
  }
}
async function buildInvoicePdfFileFallback(inv, filename){
  if(!window.jspdf?.jsPDF) throw new Error('Motor PDF no disponible.');
  const { jsPDF } = window.jspdf;
  const docp = new jsPDF({ unit:'pt', format:'a4' });
  const p = state.profile || {};
  const c = clientBy(inv.clientId);
  const totals = invoiceTotalsDoc(inv);
  const status = invoiceStatus(inv);
  let y = 42;
  docp.setFont('helvetica','bold'); docp.setFontSize(18); docp.text(p.businessName || 'Nexus Business', 42, y);
  y += 24; docp.setFontSize(28); docp.text('FACTURA', 42, y);
  y += 26; docp.setFont('helvetica','normal'); docp.setFontSize(11);
  docp.text(`No.: ${inv.number || ''}`, 42, y); docp.text(`Estado: ${status}`, 360, y); y += 16;
  docp.text(`Fecha: ${niceDate(inv.date)}`, 42, y); docp.text(`Vence: ${niceDate(inv.dueDate)}`, 360, y); y += 24;
  docp.setFont('helvetica','bold'); docp.text('Cliente', 42, y); y += 15;
  docp.setFont('helvetica','normal'); docp.text(String(inv.clientName || c.name || ''), 42, y); y += 14;
  if(c.phone) { docp.text(`Tel: ${c.phone}`, 42, y); y += 14; }
  if(c.address || c.city) { docp.text(`Dirección: ${c.address || c.city}`, 42, y, { maxWidth:500 }); y += 24; }
  y += 8; docp.setFont('helvetica','bold');
  docp.text('Descripción', 42, y); docp.text('Cant.', 330, y); docp.text('Precio', 400, y); docp.text('Total', 500, y); y += 12;
  docp.line(42, y, 552, y); y += 18; docp.setFont('helvetica','normal');
  const items = Array.isArray(inv.items) && inv.items.length ? inv.items : [{description:inv.serviceTitle||inv.invoiceType||'Servicio', qty:1, price:totals.subtotal}];
  items.forEach(it=>{
    const desc = String(it.description || 'Servicio');
    docp.text(desc, 42, y, { maxWidth:260 });
    docp.text(String(it.qty || 1), 340, y, { align:'right' });
    docp.text(money(it.price || 0), 455, y, { align:'right' });
    docp.text(money(Number(it.qty || 1) * Number(it.price || 0)), 552, y, { align:'right' });
    y += Math.max(20, Math.ceil(desc.length/38)*14);
    if(y > 720){ docp.addPage(); y = 42; }
  });
  y += 12; docp.line(340, y, 552, y); y += 18;
  docp.text('Subtotal', 380, y); docp.text(money(totals.subtotal), 552, y, { align:'right' }); y += 16;
  docp.text(`IVU (${totals.taxPercent}%)`, 380, y); docp.text(money(totals.ivu), 552, y, { align:'right' }); y += 20;
  docp.setFont('helvetica','bold'); docp.setFontSize(14); docp.text('TOTAL', 380, y); docp.text(money(totals.total), 552, y, { align:'right' }); y += 22;
  docp.setFontSize(11); docp.text('Balance', 380, y); docp.text(money(invoiceBalance(inv)), 552, y, { align:'right' });
  const blob = docp.output('blob');
  return new File([blob], filename || `Factura-${inv.number || 'Nexus'}.pdf`, { type:'application/pdf' });
}
function invoiceShareText(inv){ return `${state.profile?.businessName || 'Nexus Business'}\nFactura: ${inv.number}\nCliente: ${inv.clientName}\nTotal: ${money(inv.total)}\nEstado: ${invoiceStatus(inv)}\nBalance: ${money(invoiceBalance(inv))}`; }
function buildInvoicePreviewObject(number='Vista previa'){
  const c = clientBy($('mInvClient')?.value); const calc = invoiceCalc();
  return { number, date:$('mInvDate')?.value || today(), dueDate:$('mInvDue')?.value || plusDays(15), clientName:c.name || 'Cliente', invoiceType:$('mInvType')?.value || 'Servicio', items:invoiceLines.map(l => ({ description:l.description, qty:l.qty, price:l.price, discount:l.discount, taxable:l.taxable, total:lineNet(l) })), subtotal:calc.subtotal, discount:calc.discount, ivu:calc.ivu, taxPercent:Number(state.profile?.tax || 11.5), total:calc.total, status:$('mInvStatus')?.value || 'Pendiente', notes:$('mInvNotes')?.value || '' };
}

function niceDate(v){
  if(!v) return '';
  const parts = String(v).split('-');
  if(parts.length === 3){
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString('es-PR', { year:'numeric', month:'long', day:'numeric' });
  }
  return String(v);
}
function invoiceTotalsDoc(inv){
  const itemsSubtotal = Array.isArray(inv.items) && inv.items.length ? inv.items.reduce((a,it)=>a + (Number(it.qty || 1) * Number(it.price || 0)), 0) : 0;
  const itemsDiscount = Array.isArray(inv.items) && inv.items.length ? inv.items.reduce((a,it)=>a + Number(it.discount || 0), 0) : 0;
  const subtotal = Number(inv.subtotal ?? (itemsSubtotal || Number(inv.total || 0)));
  const discount = Number(inv.discount ?? itemsDiscount ?? 0);
  const ivu = Number(inv.ivu ?? inv.tax ?? 0);
  const total = Number(inv.total ?? (subtotal - discount + ivu));
  return { subtotal, discount, ivu, total, taxPercent:Number(inv.taxPercent ?? state.profile?.tax ?? 0) };
}
function invoiceDocFooter(){
  const p = state.profile || {};
  return `</div><div class="invoice-thanks">¡Gracias por su preferencia!</div><div class="invoice-footer"><span>${esc(p.businessName || 'Empresa')}</span><span>Gracias por su preferencia</span></div></div>`;
}
function buildDesktopInvoiceDocument(inv){
  const p = state.profile || {};
  const c = clientBy(inv.clientId);
  const totals = invoiceTotalsDoc(inv);
  const existing = currentDocId ? state.invoices.find(i => i.id === currentDocId) : null;
  const paid = existing ? invoicePaid(existing) : (String(inv.status || '') === 'Pagada' ? totals.total : 0);
  const bal = existing ? invoiceBalance(existing) : Math.max(0, totals.total - paid);
  const status = existing ? invoiceStatus(existing) : (bal <= 0 || String(inv.status || '') === 'Pagada' ? 'Pagada' : (String(inv.status || '') || 'Pendiente'));
  const logo = p.logoPdf || p.logoDashboard;
  const itemList = Array.isArray(inv.items) && inv.items.length ? inv.items : [{ description:inv.serviceTitle || inv.invoiceType || 'Servicio', qty:1, price:totals.subtotal }];
  const rows = itemList.map(it => `<tr><td>${esc(it.description || 'Servicio')}</td><td>${esc(it.qty || 1)}</td><td>${money(it.price || 0)}</td><td>${money(Number(it.qty || 1) * Number(it.price || 0))}</td></tr>`).join('');
  const note = esc(inv.notes || 'Gracias por confiar en nuestros servicios.');
  const terms = esc(invoicePaymentTerms(inv, inv.terms || inv.conditions || 'Pago a través del método acordado.'));
  return `<div class="doc-page invoice-pro"><div class="doc-body"><div class="invoice-top"><div class="invoice-brand">${logo ? `<img class="invoice-logo" src="${logo}">` : ''}<div><h1>${esc(p.businessName || 'Empresa')}</h1>${p.email ? `<p>${esc(p.email)}</p>` : ''}</div></div><div class="invoice-contact"><p>${esc(p.address || '')}</p>${p.phone ? `<p>${esc(p.phone)}</p>` : ''}${p.email ? `<p>${esc(p.email)}</p>` : ''}${p.web ? `<p>${esc(p.web)}</p>` : ''}</div></div><div class="invoice-title-row"><div class="invoice-number"><p><b>No. de Factura:</b> ${esc(inv.number || 'Factura')}</p><p><b>Fecha:</b> ${esc(niceDate(inv.date))}</p><p><b>Vence:</b> ${esc(inv.dueDate ? niceDate(inv.dueDate) : '—')}</p></div><h2>FACTURA</h2><div class="status-card"><b>ESTADO</b><span>${esc(status).toUpperCase()}</span></div></div><div class="invoice-rule"></div><div class="invoice-client-grid"><div class="invoice-box"><b>CLIENTE</b><p>${esc(inv.clientName || c.name || '')}</p></div><div class="invoice-box"><p><b>Teléfono:</b> ${esc(c.phone || '—')}</p><p><b>Dirección:</b> ${esc(c.address || c.city || '—')}</p></div></div><table class="doc-table invoice-items"><tr><th>Descripción</th><th>Cant.</th><th>Precio Unit.</th><th>Total</th></tr>${rows}</table><div class="invoice-lower"><div><div class="invoice-box note-box"><b>NOTAS</b><p>${note}</p></div><div class="invoice-box note-box"><b>CONDICIONES</b><p>${terms}</p></div>${p.signature ? `<div class="invoice-sign"><img src="${p.signature}"><br>Firma autorizada</div>` : ''}</div><div class="invoice-totals"><div><b>SUBTOTAL</b><span>${money(totals.subtotal)}</span></div><div><b>IVU (${totals.taxPercent}%)</b><span>${money(totals.ivu)}</span></div><div class="total-row"><b>TOTAL</b><span>${money(totals.total)}</span></div><div><b>PAGADO</b><span>${money(paid)}</span></div><div class="balance-row"><b>BALANCE</b><span>${money(bal)}</span></div></div></div>` + invoiceDocFooter();
}
function openInvoiceDoc(id, supplied=null){
  const inv = supplied || state.invoices.find(i => i.id === id);
  if(!inv) return;
  currentDocId = inv.id || id || null;
  $('mDocPreview').innerHTML = buildDesktopInvoiceDocument(inv);
  $('mDocModal').classList.remove('hidden');
}
function closeDoc(){ $('mDocModal').classList.add('hidden'); }
async function shareCurrentDoc(){
  if(currentDocId) return shareInvoice(currentDocId);
  const preview = buildInvoicePreviewObject('Vista previa');
  const filename = 'Factura-Vista-Previa.pdf';
  try{
    const file = await buildInvoicePdfFile(preview, filename);
    if(!file || file.size < 10000) throw new Error('PDF vacío o inválido.');
    if(navigator.share && navigator.canShare && navigator.canShare({ files:[file] })){
      await navigator.share({ title:'Factura', text:'Factura adjunta en PDF.', files:[file] });
      return;
    }
    await openPdfFile(file, filename);
  }catch(err){
    console.error(err);
    alert('No se pudo preparar el PDF. Se intentará descargarlo.');
    try{ downloadPdfFile(await buildInvoicePdfFile(preview, filename), filename); }catch(e){ console.error(e); }
  }
}
