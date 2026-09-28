import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { firebaseConfig } from "./firebase-config.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, collection, collectionGroup, query, where, getDocs, doc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_EMAILS = [
  "nexustoolspr@gmail.com"
];

function isAdmin(email){
  return ADMIN_EMAILS.includes(String(email || '').toLowerCase().trim());
}
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const money = n => new Intl.NumberFormat('es-PR',{style:'currency',currency:'USD'}).format(Number(n||0));
const todayIso = () => new Date().toISOString().slice(0,10);
const plusMonthIso = () => { const d = new Date(); d.setMonth(d.getMonth()+1); return d.toISOString().slice(0,10); };

const PLAN_NAMES = { free:'Gratis', pro:'Pro', business:'Business', enterprise:'Enterprise' };
let pendingRows = [];
let subscriberRows = [];

function parentUserId(ref){ return ref.parent.parent.id; }
function normalizePlanId(value){
  const v = String(value || 'free').toLowerCase().trim();
  const map = { gratis:'free', basico:'free', básico:'free', basic:'free', premium:'business' };
  return PLAN_NAMES[v] ? v : (map[v] || 'free');
}
function planName(plan){ return PLAN_NAMES[normalizePlanId(plan)] || 'Gratis'; }
function statusLabel(status){ return ({ active:'Activo', pending:'Pendiente', past_due:'Pago vencido', cancelled:'Cancelado', inactive:'Inactivo' }[status] || status || 'Activo'); }
function statusClass(status){ return status === 'active' ? 'ok' : status === 'past_due' ? 'warn' : status === 'cancelled' ? 'danger' : 'muted'; }

async function loadRequests(){
  $('adminStatus').textContent = 'Buscando solicitudes...';
  const found = new Map();
  try{
    const q = query(collectionGroup(db,'planRequests'), where('status','==','pending'));
    const snap = await getDocs(q);
    snap.docs.forEach(d => {
      const row = { id:d.id, ref:d.ref, userId:parentUserId(d.ref), source:'request', ...d.data() };
      found.set(`${row.userId}:${normalizePlanId(row.planId)}:request`, row);
    });
  }catch(err){
    console.warn('CollectionGroup planRequests no disponible; usando respaldo por perfil.', err);
  }
  try{
    const usersSnap = await getDocs(query(collection(db,'users'), where('pendingPlanStatus','==','pending')));
    usersSnap.docs.forEach(d => {
      const u = d.data();
      const row = {
        id:'__profile_pending__',
        userId:d.id,
        source:'profile',
        businessName:u.businessName || 'Cliente sin nombre',
        userEmail:u.email || u.ownerEmail || '',
        fromPlan:u.plan || 'free',
        fromPlanName:planName(u.plan || 'free'),
        planId:u.pendingPlan || 'free',
        planName:u.pendingPlanName || planName(u.pendingPlan || 'free'),
        status:'pending',
        paymentUrl:u.pendingPaymentUrl || ''
      };
      found.set(`${row.userId}:${normalizePlanId(row.planId)}:profile`, row);
    });
  }catch(err){
    console.warn('Respaldo por perfil no disponible.', err);
  }
  pendingRows = [...found.values()].filter(r => normalizePlanId(r.planId) !== normalizePlanId(r.fromPlan));
  renderRequests();
  renderKpis();
}

function renderRequests(){
  const rows = pendingRows;
  if(!rows.length){
    $('requestList').innerHTML = '<p class="muted">No hay solicitudes pendientes.</p>';
    $('adminStatus').textContent = 'Sin pendientes';
    return;
  }
  $('requestList').innerHTML = rows.map(r => `
    <div class="list-item plan-admin-card">
      <strong>${esc(r.businessName || 'Cliente sin nombre')}</strong>
      <span>${esc(r.userEmail || '')}</span>
      <span>Actual: ${esc(r.fromPlanName || planName(r.fromPlan))} → Solicitado: <b>${esc(r.planName || planName(r.planId))}</b></span>
      <span>UID: ${esc(r.userId)}</span>
      ${r.paymentUrl ? `<a href="${esc(r.paymentUrl)}" target="_blank" rel="noopener">Ver enlace de pago</a>` : ''}
      <div class="toolbar">
        <button class="primary" data-activate="${esc(r.id)}" data-user="${esc(r.userId)}" data-plan="${esc(r.planId)}" type="button">Activar plan</button>
        <button data-reject="${esc(r.id)}" data-user="${esc(r.userId)}" type="button">Marcar rechazado</button>
      </div>
    </div>
  `).join('');
  document.querySelectorAll('[data-activate]').forEach(btn => btn.onclick = () => activatePlan(btn.dataset.user, btn.dataset.activate, btn.dataset.plan));
  document.querySelectorAll('[data-reject]').forEach(btn => btn.onclick = () => rejectRequest(btn.dataset.user, btn.dataset.reject));
  $('adminStatus').textContent = `${rows.length} pendiente(s)`;
}

async function loadSubscribers(){
  const snap = await getDocs(collection(db,'users'));
  subscriberRows = snap.docs.map(d => ({ id:d.id, ...d.data() }));
  renderSubscribers();
  renderKpis();
}

function renderKpis(){
  const active = subscriberRows.filter(x => (x.planStatus || 'active') === 'active' && (x.plan || 'free') !== 'free').length;
  const free = subscriberRows.filter(x => (x.plan || 'free') === 'free').length;
  const pastDue = subscriberRows.filter(x => x.planStatus === 'past_due').length;
  $('adminKpis').innerHTML = [
    ['Pendientes', pendingRows.length],
    ['Suscriptores pagos', active],
    ['Gratis', free],
    ['Vencidos', pastDue]
  ].map(([a,b])=>`<div class="kpi"><span>${a}</span><strong>${b}</strong></div>`).join('');
}

function renderSubscribers(){
  const term = ($('subscriberSearch')?.value || '').toLowerCase().trim();
  const rows = subscriberRows.filter(r => !term || `${r.businessName||''} ${r.email||''} ${r.ownerEmail||''} ${r.plan||''}`.toLowerCase().includes(term));
  if(!rows.length){ $('subscriberRows').innerHTML = '<tr><td colspan="7" class="muted">No hay suscriptores para mostrar.</td></tr>'; return; }
  $('subscriberRows').innerHTML = rows.map(r => {
    const email = r.email || r.ownerEmail || r.userEmail || '';
    const lastPayment = r.lastPaymentAmount ? `${money(r.lastPaymentAmount)} · ${esc(r.lastPaymentMethod || '')}` : '—';
    return `<tr>
      <td><strong>${esc(r.businessName || 'Sin nombre')}</strong><br><small class="muted">${esc(r.id)}</small></td>
      <td>${esc(email)}</td>
      <td><b>${esc(planName(r.plan || 'free'))}</b></td>
      <td><span class="status-chip ${statusClass(r.planStatus || 'active')}">${esc(statusLabel(r.planStatus || 'active'))}</span></td>
      <td>${esc(r.planExpiresAt || '—')}</td>
      <td>${lastPayment}<br><small class="muted">${esc(r.lastPaymentDate || '')}</small></td>
      <td class="actions">
        <button class="primary" data-manual-plan="${esc(r.id)}" type="button">Editar plan</button>
        <button data-mark-due="${esc(r.id)}" type="button">Vencido</button>
        <button class="danger" data-cancel="${esc(r.id)}" type="button">Cancelar</button>
      </td>
    </tr>`;
  }).join('');
  document.querySelectorAll('[data-manual-plan]').forEach(btn => btn.onclick = () => manualEditPlan(btn.dataset.manualPlan));
  document.querySelectorAll('[data-mark-due]').forEach(btn => btn.onclick = () => markPastDue(btn.dataset.markDue));
  document.querySelectorAll('[data-cancel]').forEach(btn => btn.onclick = () => cancelPlan(btn.dataset.cancel));
}

async function closePendingRequests(userId, keepRequestId='', status='replaced') {
  const snap = await getDocs(query(collection(db,'users',userId,'planRequests'), where('status','==','pending')));
  await Promise.all(snap.docs.map(d => updateDoc(d.ref, {
    status: d.id === keepRequestId ? 'activated' : status,
    updatedAt: serverTimestamp()
  })));
}

async function activatePlan(userId, requestId, planId){
  planId = normalizePlanId(planId);
  const method = prompt('Método de pago confirmado:', 'ATH Móvil') || 'Manual';
  const amount = prompt('Cantidad pagada:', '49.99') || '';
  const expires = prompt('Fecha de vencimiento del plan YYYY-MM-DD:', plusMonthIso()) || plusMonthIso();
  if(!confirm(`¿Activar ${planName(planId)} hasta ${expires}?`)) return;
  await updateDoc(doc(db,'users',userId), {
    plan:planId,
    planStatus:'active',
    pendingPlan:'',
    pendingPlanName:'',
    pendingPaymentUrl:'',
    pendingPlanStatus:'approved',
    planExpiresAt:expires,
    lastPaymentMethod:method,
    lastPaymentAmount:Number(amount||0),
    lastPaymentDate:todayIso(),
    planUpdatedAt:serverTimestamp()
  });
  if(requestId !== '__profile_pending__'){
    await updateDoc(doc(db,'users',userId,'planRequests',requestId), { status:'activated', activatedAt:serverTimestamp(), updatedAt:serverTimestamp(), paymentMethod:method, paymentAmount:Number(amount||0), planExpiresAt:expires });
  }
  await closePendingRequests(userId, requestId, 'replaced');
  await Promise.all([loadRequests(), loadSubscribers()]);
}

async function manualEditPlan(userId){
  const current = subscriberRows.find(x => x.id === userId) || {};
  const nextPlanRaw = prompt('Plan a asignar: free, pro, business, enterprise', normalizePlanId(current.plan || 'free'));
  if(!nextPlanRaw) return;
  const nextPlan = normalizePlanId(nextPlanRaw);
  const status = prompt('Estado: active, past_due, cancelled, inactive', current.planStatus || 'active') || 'active';
  const expires = prompt('Fecha de vencimiento YYYY-MM-DD:', current.planExpiresAt || plusMonthIso()) || '';
  const method = prompt('Método de pago:', current.lastPaymentMethod || 'Manual') || 'Manual';
  const amount = prompt('Último pago:', current.lastPaymentAmount || '0') || '0';
  await updateDoc(doc(db,'users',userId), {
    plan:nextPlan,
    planStatus:status,
    pendingPlan:'',
    pendingPlanName:'',
    pendingPaymentUrl:'',
    pendingPlanStatus:'admin_closed',
    planExpiresAt:expires,
    lastPaymentMethod:method,
    lastPaymentAmount:Number(amount||0),
    lastPaymentDate:todayIso(),
    planUpdatedAt:serverTimestamp()
  });
  await closePendingRequests(userId, '', 'admin_closed');
  await Promise.all([loadRequests(), loadSubscribers()]);
}

async function markPastDue(userId){
  if(!confirm('¿Marcar esta suscripción como pago vencido?')) return;
  await updateDoc(doc(db,'users',userId), { planStatus:'past_due', planUpdatedAt:serverTimestamp() });
  await loadSubscribers();
}

async function cancelPlan(userId){
  if(!confirm('¿Cancelar plan y devolverlo a Gratis?')) return;
  await updateDoc(doc(db,'users',userId), { plan:'free', planStatus:'cancelled', pendingPlan:'', pendingPlanName:'', pendingPaymentUrl:'', pendingPlanStatus:'none', planUpdatedAt:serverTimestamp() });
  await closePendingRequests(userId, '', 'cancelled');
  await Promise.all([loadRequests(), loadSubscribers()]);
}

async function rejectRequest(userId, requestId){
  if(!confirm('¿Rechazar esta solicitud?')) return;
  await updateDoc(doc(db,'users',userId), { pendingPlan:'', pendingPlanName:'', pendingPaymentUrl:'', pendingPlanStatus:'rejected', planUpdatedAt:serverTimestamp() });
  if(requestId !== '__profile_pending__'){
    await updateDoc(doc(db,'users',userId,'planRequests',requestId), { status:'rejected', updatedAt:serverTimestamp() });
  }
  await loadRequests();
}

$('adminForm').onsubmit = async e => {
  e.preventDefault();
  $('adminMsg').textContent = 'Validando...';
  try { await signInWithEmailAndPassword(auth, $('adminEmail').value, $('adminPassword').value); $('adminMsg').textContent = ''; }
  catch(err){ $('adminMsg').textContent = err.message; }
};
$('adminLogout').onclick = () => signOut(auth);
$('refreshRequests').onclick = () => Promise.all([loadRequests(), loadSubscribers()]);
$('refreshSubscribers').onclick = loadSubscribers;
$('subscriberSearch').oninput = renderSubscribers;

onAuthStateChanged(auth, async user => {
  if(!user){
    $('adminLogin').classList.remove('hidden');
    $('adminPanel').classList.add('hidden');
    return;
  }

  if(!isAdmin(user.email)){
    $('adminLogin').classList.remove('hidden');
    $('adminPanel').classList.add('hidden');
    $('adminMsg').textContent = 'Acceso denegado. Solo nexustoolspr@gmail.com puede entrar al panel administrativo.';
    alert('Acceso denegado. Este panel es solo para el administrador autorizado.');
    await signOut(auth);
    return;
  }

  $('adminLogin').classList.add('hidden');
  $('adminPanel').classList.remove('hidden');
  $('adminStatus').textContent = `Administrador: ${user.email}`;
  await Promise.all([loadRequests(), loadSubscribers()]);
});
