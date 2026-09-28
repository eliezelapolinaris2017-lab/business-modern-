// Nexus Business — Servicios generales adicionales para cuentas HVAC.
// Se mantiene aislado de app.js para no afectar login, Firebase ni navegación.

const HVAC_EXTRA_SERVICES = [
  'Electricidad básica',
  'Plomería básica',
  'Handyman / reparaciones menores',
  'Albañilería básica',
  'Pintura',
  'Lavado a presión',
  'Limpieza de terrenos',
  'Remodelación menor',
  'Otro servicio'
];

function isHvacAccount(){
  const sideIndustry=(document.getElementById('sideIndustry')?.textContent||'').trim().toLowerCase();
  const authIndustry=document.getElementById('authIndustry')?.value||'';
  return sideIndustry==='hvac' || sideIndustry.includes('hvac') || String(authIndustry).toLowerCase()==='hvac';
}

function addGeneralServices(select){
  if(!select || !isHvacAccount()) return;
  const existing=new Set([...select.options].map(o=>String(o.value||o.textContent||'').trim().toLowerCase()));
  const missing=HVAC_EXTRA_SERVICES.filter(name=>!existing.has(name.toLowerCase()));
  if(!missing.length) return;

  let group=[...select.querySelectorAll('optgroup')].find(g=>g.label==='Servicios generales');
  if(!group){
    group=document.createElement('optgroup');
    group.label='Servicios generales';
    select.appendChild(group);
  }
  missing.forEach(name=>{
    const option=document.createElement('option');
    option.value=name;
    option.textContent=name;
    group.appendChild(option);
  });
}

function syncExtraServices(){
  addGeneralServices(document.getElementById('sServiceType'));
  addGeneralServices(document.getElementById('qServiceType'));
}

let syncTimer=null;
function scheduleSync(){
  clearTimeout(syncTimer);
  syncTimer=setTimeout(syncExtraServices,40);
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',syncExtraServices,{once:true});
else syncExtraServices();

new MutationObserver(scheduleSync).observe(document.documentElement,{subtree:true,childList:true,characterData:true});
