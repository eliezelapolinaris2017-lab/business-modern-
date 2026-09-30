// Nexus Business Modern — Clase Graduanda PR UX layer
(()=>{
  const ICONS={
    dashboard:'⌂',clients:'👥',directory:'⌖',contracts:'▤',quotes:'🧾',followups:'↻',
    services:'🛠',assets:'▣',team:'♙',billing:'$',payments:'✓',cashflow:'∿',
    purchases:'▥',suppliers:'◫',supplierPayments:'→',payroll:'$',reports:'▦',plans:'☆',settings:'⚙'
  };
  const META={
    clients:['👥','VENTAS','Clientes','Personas, contactos, historial y próximos pasos.'],
    directory:['📍','CLIENTES','Directorio','Direcciones y rutas de tus clientes.'],
    contracts:['📄','VENTAS','Contratos','Contratos relacionados a clientes y servicios.'],
    quotes:['🧾','VENTAS','Cotizaciones','Crea, aprueba y convierte cotizaciones.'],
    followups:['↻','VENTAS','Seguimiento','Pendientes, mantenimientos y oportunidades.'],
    services:['🛠','OPERACIÓN','Servicios','Trabajos, estados y facturación.'],
    assets:['▣','OPERACIÓN','Activos','Equipos y activos vinculados a clientes.'],
    team:['♙','OPERACIÓN','Equipo','Personal y asignaciones.'],
    billing:['💵','FINANZAS','Facturación','Facturas, balances y cobros.'],
    payments:['✓','FINANZAS','Cobros','Registra pagos y actualiza balances.'],
    cashflow:['∿','FINANZAS','Flujo de caja','Entradas y salidas del negocio.'],
    purchases:['▥','FINANZAS','Compras','Compras y cuentas por pagar.'],
    suppliers:['◫','FINANZAS','Suplidores','Crédito, compras y balances.'],
    supplierPayments:['→','FINANZAS','Pagos a suplidores','Pagos y conciliación.'],
    payroll:['$','FINANZAS','Nómina','Pagos y retenciones del equipo.'],
    reports:['▦','ANÁLISIS','Reportes','Reportes del negocio en un solo lugar.'],
    plans:['☆','SISTEMA','Planes','Plan activo y funciones disponibles.'],
    settings:['⚙','SISTEMA','Configuración','Personalización y preferencias.']
  };

  const formFor=view=>view?.querySelector('form.form-grid')||null;
  function setFormOpen(form,open){
    if(!form)return;
    form.classList.toggle('v2-form-open',open);
    if(open)setTimeout(()=>form.scrollIntoView({behavior:'smooth',block:'start'}),30);
  }
  function decorateNav(){
    document.querySelectorAll('#sideNav [data-view]').forEach(b=>{
      b.dataset.modernIcon=ICONS[b.dataset.view]||'•';
    });
    document.querySelectorAll('#sideNav .v2-nav-group').forEach(x=>x.remove());
  }
  function setupForms(){
    document.querySelectorAll('#appShell .view').forEach(view=>{
      const form=formFor(view);
      if(form && view.id!=='settings') form.classList.add('v2-collapsible');
    });
  }
  function setupModules(){
    Object.entries(META).forEach(([id,m])=>{
      const view=document.getElementById(id);
      const card=view?.querySelector(':scope > .card');
      if(!view||!card)return;

      let hero=view.querySelector(':scope > .school-module-hero');
      if(!hero){
        hero=document.createElement('div');
        hero.className='school-module-hero';
        hero.innerHTML='<div class="school-module-icon">'+m[0]+'</div><div class="school-module-copy"><small>'+m[1]+'</small><h2>'+m[2]+'</h2><p>'+m[3]+'</p></div><div class="school-module-actions"></div>';
        view.insertBefore(hero,card);
      }
      card.classList.add('school-module-card');
      view.dataset.theme = id;
      hero.dataset.theme = id;
      card.dataset.theme = id;

      const actions=hero.querySelector('.school-module-actions');
      if(!actions.dataset.ready){
        actions.dataset.ready='1';
        const oldHead=card.querySelector(':scope > .section-head');
        const limit=oldHead?.querySelector('.limit-chip');
        if(limit){limit.classList.add('school-module-limit');actions.appendChild(limit);}
        if(oldHead)oldHead.classList.add('school-inner-head');

        const form=formFor(view);
        if(form && id!=='settings'){
          const btn=document.createElement('button');
          btn.type='button';btn.className='school-module-primary';
          btn.textContent=id==='payments'?'＋ Registrar cobro':id==='payroll'?'＋ Registrar pago':'＋ Nuevo';
          btn.onclick=()=>setFormOpen(form,true);
          actions.appendChild(btn);
        }

        if(id==='clients'){
          const importer=view.querySelector('.contact-import-card');
          if(importer){
            importer.classList.add('v2-secondary-tool','v2-secondary-hidden');
            const btn=document.createElement('button');
            btn.type='button';btn.className='school-module-secondary';btn.textContent='Importar';
            btn.onclick=()=>{const hidden=importer.classList.toggle('v2-secondary-hidden');btn.textContent=hidden?'Importar':'Cerrar';};
            actions.appendChild(btn);
          }
        }

        if(id==='billing'){
          const source=document.getElementById('invoiceFromService');
          if(source){
            source.closest('.toolbar')?.classList.add('v2-toolbar-hidden');
            const btn=document.createElement('button');
            btn.type='button';btn.className='school-module-primary';btn.textContent='＋ Facturar servicio';
            btn.onclick=()=>source.click();actions.appendChild(btn);
          }
        }
      }
    });
  }
  function renameHomeLabel(){
    const b=document.querySelector('#sideNav [data-view="dashboard"]');
    if(!b)return;
    [...b.childNodes].forEach(n=>{if(n.nodeType===Node.TEXT_NODE && n.textContent.trim()) n.textContent='Inicio';});
  }

  function improveSearch(){
    const s=document.getElementById('globalSearch');
    if(s)s.placeholder='Buscar en Nexus…';
  }
  function openEditForm(e){
    if(!e.target.closest('[data-edit]'))return;
    setTimeout(()=>setFormOpen(formFor(document.querySelector('#appShell .view.active')),true),60);
  }
  function run(){
    document.body.classList.add('v2-ready');
    document.title='Nexus Business';
    decorateNav();renameHomeLabel();setupForms();setupModules();improveSearch();
  }
  const obs=new MutationObserver(()=>{decorateNav();renameHomeLabel();setupForms();setupModules();});
  obs.observe(document.documentElement,{subtree:true,childList:true});
  document.addEventListener('click',openEditForm,true);
  document.addEventListener('DOMContentLoaded',run);
  window.addEventListener('load',run);
  run();
})();
