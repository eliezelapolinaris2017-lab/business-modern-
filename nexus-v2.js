// Nexus Business V2 UX layer
(()=>{
  const ICONS={
    dashboard:'⌂',clients:'◎',directory:'⌖',contracts:'▤',services:'◆',quotes:'◇',
    followups:'↻',team:'♙',assets:'▣',payroll:'$',suppliers:'◫',supplierPayments:'→',
    purchases:'▥',billing:'▧',payments:'✓',cashflow:'∿',reports:'▦',plans:'☆',settings:'⚙'
  };
  const GROUPS=[
    ['Inicio',['dashboard']],
    ['Ventas',['clients','directory','quotes','contracts','followups']],
    ['Operación',['services','assets','team']],
    ['Finanzas',['billing','payments','cashflow','purchases','suppliers','supplierPayments','payroll']],
    ['Análisis',['reports']],
    ['Sistema',['plans','settings']]
  ];
  const MODULE_META={
    clients:{icon:'👥',eyebrow:'VENTAS',title:'Clientes',desc:'Personas, contactos, historial y próximos pasos.'},
    directory:{icon:'📍',eyebrow:'CLIENTES',title:'Directorio',desc:'Direcciones y rutas sin buscar en conversaciones.'},
    contracts:{icon:'📄',eyebrow:'VENTAS',title:'Contratos',desc:'Documentos vinculados a clientes y servicios.'},
    quotes:{icon:'🧾',eyebrow:'VENTAS',title:'Cotizaciones',desc:'Crea, aprueba y convierte cotizaciones sin repetir datos.'},
    followups:{icon:'↻',eyebrow:'VENTAS',title:'Seguimiento',desc:'Mantén pendientes, mantenimientos y oportunidades bajo control.'},
    services:{icon:'🛠',eyebrow:'OPERACIÓN',title:'Servicios',desc:'Trabajo programado, estado, equipo asignado y facturación.'},
    assets:{icon:'▣',eyebrow:'OPERACIÓN',title:'Activos',desc:'Equipos y activos relacionados a tus clientes.'},
    team:{icon:'♙',eyebrow:'OPERACIÓN',title:'Equipo',desc:'Personal, asignaciones y datos operacionales.'},
    billing:{icon:'💵',eyebrow:'FINANZAS',title:'Facturación',desc:'Facturas, balances pendientes y cobro inmediato.'},
    payments:{icon:'✓',eyebrow:'FINANZAS',title:'Cobros',desc:'Registra pagos y mantén los balances al día.'},
    cashflow:{icon:'∿',eyebrow:'FINANZAS',title:'Flujo de caja',desc:'Entradas y salidas del negocio en una vista simple.'},
    purchases:{icon:'▥',eyebrow:'FINANZAS',title:'Compras',desc:'Compras, vencimientos y cuentas por pagar.'},
    suppliers:{icon:'◫',eyebrow:'FINANZAS',title:'Suplidores',desc:'Contactos, crédito, compras y balances por suplidor.'},
    supplierPayments:{icon:'→',eyebrow:'FINANZAS',title:'Pagos a suplidores',desc:'Registra pagos y concilia obligaciones pendientes.'},
    payroll:{icon:'
    dashboard:'Inicio',clients:'Clientes',directory:'Directorio',contracts:'Contratos',
    services:'Servicios',quotes:'Cotizaciones',followups:'Seguimiento',team:'Equipo',
    assets:'Activos',payroll:'Nómina',suppliers:'Suplidores',supplierPayments:'Pagos a suplidores',
    purchases:'Compras',billing:'Facturación',payments:'Cobros',cashflow:'Flujo de caja',
    reports:'Reportes',plans:'Planes',settings:'Configuración'
  };

  function navButton(view){return document.querySelector('#sideNav [data-view="'+view+'"]')}
  function groupNav(){
    const nav=document.getElementById('sideNav'); if(!nav) return;
    const buttons=[...nav.querySelectorAll('[data-view]')];
    if(!buttons.length || nav.querySelector('.v2-nav-group')) return;
    nav.dataset.v2Grouped='1';
    buttons.forEach(b=>{b.dataset.modernIcon=ICONS[b.dataset.view]||'•'});
    GROUPS.forEach(([label,views])=>{
      const available=views.map(navButton).filter(Boolean); if(!available.length)return;
      const tag=document.createElement('div'); tag.className='v2-nav-group'; tag.textContent=label; nav.appendChild(tag);
      available.forEach(b=>nav.appendChild(b));
    });
  }

  function formForView(view){
    if(!view) return null;
    return view.querySelector('form.form-grid');
  }
  function setFormOpen(form,open){
    if(!form)return;
    form.classList.toggle('v2-form-open',open);
    const view=form.closest('.view');
    const btn=view?.querySelector('.v2-create-btn');
    if(btn){btn.dataset.open=open?'true':'false';btn.textContent=open?'Cerrar':'＋ Nuevo';}
    if(open) setTimeout(()=>form.scrollIntoView({behavior:'smooth',block:'start'}),30);
  }
  function setupModuleForms(){
    document.querySelectorAll('#appShell .view').forEach(view=>{
      const form=formForView(view);
      if(!form || view.id==='settings' || form.dataset.v2Ready==='1') return;
      form.dataset.v2Ready='1'; form.classList.add('v2-collapsible');
      const head=view.querySelector('.section-head');
      if(!head) return;
      const btn=document.createElement('button');
      btn.type='button';btn.className='v2-create-btn';btn.textContent='＋ Nuevo';btn.dataset.open='false';
      btn.onclick=()=>setFormOpen(form,!form.classList.contains('v2-form-open'));
      head.appendChild(btn);
    });
  }

  function setupModuleChrome(){
    Object.entries(MODULE_META).forEach(([id,meta])=>{
      const view=document.getElementById(id);
      if(!view || view.querySelector(':scope > .school-module-hero')) return;
      const card=view.querySelector(':scope > .card');
      if(!card) return;

      const hero=document.createElement('div');
      hero.className='school-module-hero';
      hero.innerHTML='<div class="school-module-icon">'+meta.icon+'</div><div class="school-module-copy"><small>'+meta.eyebrow+'</small><h2>'+meta.title+'</h2><p>'+meta.desc+'</p></div><div class="school-module-actions"></div>';
      view.insertBefore(hero,card);

      const actions=hero.querySelector('.school-module-actions');
      const form=formForView(view);
      if(form && id!=='settings'){
        const add=document.createElement('button');
        add.type='button';add.className='school-module-primary';
        add.textContent=id==='payments'?'＋ Registrar cobro':id==='payroll'?'＋ Registrar pago':'＋ Nuevo';
        add.onclick=()=>setFormOpen(form,true);
        actions.appendChild(add);
      }

      if(id==='clients'){
        const importer=view.querySelector('.contact-import-card');
        if(importer){
          importer.classList.add('v2-secondary-tool','v2-secondary-hidden');
          const btn=document.createElement('button');
          btn.type='button';btn.className='school-module-secondary';btn.textContent='Importar';
          btn.onclick=()=>{const hidden=importer.classList.toggle('v2-secondary-hidden');btn.textContent=hidden?'Importar':'Cerrar importación';if(!hidden)importer.scrollIntoView({behavior:'smooth',block:'start'});};
          actions.appendChild(btn);
        }
      }

      if(id==='billing'){
        const billBtn=document.getElementById('invoiceFromService');
        if(billBtn){
          const heroBtn=document.createElement('button');
          heroBtn.type='button';heroBtn.className='school-module-primary';heroBtn.textContent='＋ Facturar servicio';
          heroBtn.onclick=()=>billBtn.click();actions.appendChild(heroBtn);
          billBtn.closest('.toolbar')?.classList.add('v2-toolbar-hidden');
        }
      }

      card.classList.add('school-module-card');
      const oldHead=card.querySelector(':scope > .section-head');
      if(oldHead) oldHead.classList.add('school-inner-head');
    });
  }

  function setupSearch(){
    const input=document.getElementById('globalSearch');
    if(input){input.placeholder='Buscar en Nexus…';input.setAttribute('aria-label','Buscar en Nexus');}
  }

  function createCommand(){
    if(document.getElementById('v2Command'))return;
    const hint=document.createElement('button');hint.type='button';hint.className='v2-command-hint';
    hint.innerHTML='<span>Ir a módulo</span><kbd>⌘ K</kbd>';document.body.appendChild(hint);
    const wrap=document.createElement('div');wrap.id='v2Command';wrap.className='v2-command';
    wrap.innerHTML='<div class="v2-command-box"><input id="v2CommandInput" placeholder="¿A dónde quieres ir?"><div id="v2CommandResults" class="v2-command-results"></div></div>';
    document.body.appendChild(wrap);
    const input=wrap.querySelector('#v2CommandInput'),results=wrap.querySelector('#v2CommandResults');
    const close=()=>{wrap.classList.remove('open');input.value='';};
    const render=()=>{
      const q=input.value.toLowerCase().trim();
      const items=Object.entries(TITLES).filter(([k,v])=>navButton(k)&&(!q||v.toLowerCase().includes(q)));
      results.innerHTML=items.map(([k,v])=>'<button type="button" data-v2-go="'+k+'"><span>'+v+'</span><small>'+k+'</small></button>').join('');
      results.querySelectorAll('[data-v2-go]').forEach(b=>b.onclick=()=>{navButton(b.dataset.v2Go)?.click();close();});
    };
    const open=()=>{wrap.classList.add('open');render();setTimeout(()=>input.focus(),20)};
    hint.onclick=open; input.oninput=render; wrap.onclick=e=>{if(e.target===wrap)close()};
    document.addEventListener('keydown',e=>{
      if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();open();}
      if(e.key==='Escape')close();
    });
  }

  function setupFlowStrip(){
    const flow=[['clients','Cliente'],['quotes','Cotización'],['services','Servicio'],['billing','Factura'],['payments','Cobro']];
    flow.forEach(([viewId])=>{
      const view=document.getElementById(viewId); if(!view || view.querySelector('.v2-flow-strip')) return;
      const card=view.querySelector(':scope > .card'); if(!card) return;
      const strip=document.createElement('div');strip.className='v2-flow-strip';
      strip.innerHTML=flow.map(([id,label],idx)=>'<button type="button" data-flow-view="'+id+'" class="'+(id===viewId?'active':'')+'"><span>'+(idx+1)+'</span>'+label+'</button>').join('');
      card.prepend(strip);
      strip.querySelectorAll('[data-flow-view]').forEach(b=>b.onclick=()=>navButton(b.dataset.flowView)?.click());
    });
  }

  function syncActiveModule(){
    const active=document.querySelector('#appShell .view.active');
    document.body.dataset.activeModule=active?.id||'';
  }

  function openFormOnEdit(e){
    const edit=e.target.closest('[data-edit]');
    if(!edit)return;
    setTimeout(()=>{
      const view=document.querySelector('#appShell .view.active');
      const form=formForView(view); if(form)setFormOpen(form,true);
    },80);
  }

  function brandV2(){
    document.title='Nexus Business V2';
    const tagline=document.querySelector('.auth-tagline');
    if(tagline)tagline.textContent='Una operación más simple. Un negocio más claro.';
  }

  function run(){
    document.body.classList.add('v2-ready');
    brandV2();groupNav();setupModuleForms();setupModuleChrome();setupSearch();setupFlowStrip();createCommand();syncActiveModule();
  }

  const obs=new MutationObserver(()=>{groupNav();setupModuleForms();setupModuleChrome();setupFlowStrip();syncActiveModule();});
  obs.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  document.addEventListener('click',openFormOnEdit,true);
  document.addEventListener('DOMContentLoaded',run);window.addEventListener('load',run);run();
})();
,eyebrow:'FINANZAS',title:'Nómina',desc:'Pagos, retenciones y balances del equipo.'},
    reports:{icon:'▦',eyebrow:'ANÁLISIS',title:'Reportes',desc:'Encuentra y genera reportes sin navegar entre pantallas.'},
    plans:{icon:'☆',eyebrow:'SISTEMA',title:'Planes',desc:'Revisa tu plan y las funciones disponibles.'},
    settings:{icon:'⚙',eyebrow:'SISTEMA',title:'Configuración',desc:'Personaliza el negocio, documentos, calendario y preferencias.'}
  };

  const TITLES={
    dashboard:'Inicio',clients:'Clientes',directory:'Directorio',contracts:'Contratos',
    services:'Servicios',quotes:'Cotizaciones',followups:'Seguimiento',team:'Equipo',
    assets:'Activos',payroll:'Nómina',suppliers:'Suplidores',supplierPayments:'Pagos a suplidores',
    purchases:'Compras',billing:'Facturación',payments:'Cobros',cashflow:'Flujo de caja',
    reports:'Reportes',plans:'Planes',settings:'Configuración'
  };

  function navButton(view){return document.querySelector('#sideNav [data-view="'+view+'"]')}
  function groupNav(){
    const nav=document.getElementById('sideNav'); if(!nav) return;
    const buttons=[...nav.querySelectorAll('[data-view]')];
    if(!buttons.length || nav.querySelector('.v2-nav-group')) return;
    nav.dataset.v2Grouped='1';
    buttons.forEach(b=>{b.dataset.modernIcon=ICONS[b.dataset.view]||'•'});
    GROUPS.forEach(([label,views])=>{
      const available=views.map(navButton).filter(Boolean); if(!available.length)return;
      const tag=document.createElement('div'); tag.className='v2-nav-group'; tag.textContent=label; nav.appendChild(tag);
      available.forEach(b=>nav.appendChild(b));
    });
  }

  function formForView(view){
    if(!view) return null;
    return view.querySelector('form.form-grid');
  }
  function setFormOpen(form,open){
    if(!form)return;
    form.classList.toggle('v2-form-open',open);
    const view=form.closest('.view');
    const btn=view?.querySelector('.v2-create-btn');
    if(btn){btn.dataset.open=open?'true':'false';btn.textContent=open?'Cerrar':'＋ Nuevo';}
    if(open) setTimeout(()=>form.scrollIntoView({behavior:'smooth',block:'start'}),30);
  }
  function setupModuleForms(){
    document.querySelectorAll('#appShell .view').forEach(view=>{
      const form=formForView(view);
      if(!form || view.id==='settings' || form.dataset.v2Ready==='1') return;
      form.dataset.v2Ready='1'; form.classList.add('v2-collapsible');
      const head=view.querySelector('.section-head');
      if(!head) return;
      const btn=document.createElement('button');
      btn.type='button';btn.className='v2-create-btn';btn.textContent='＋ Nuevo';btn.dataset.open='false';
      btn.onclick=()=>setFormOpen(form,!form.classList.contains('v2-form-open'));
      head.appendChild(btn);
    });
  }

  function setupSearch(){
    const input=document.getElementById('globalSearch');
    if(input){input.placeholder='Buscar en Nexus…';input.setAttribute('aria-label','Buscar en Nexus');}
  }

  function createCommand(){
    if(document.getElementById('v2Command'))return;
    const hint=document.createElement('button');hint.type='button';hint.className='v2-command-hint';
    hint.innerHTML='<span>Ir a módulo</span><kbd>⌘ K</kbd>';document.body.appendChild(hint);
    const wrap=document.createElement('div');wrap.id='v2Command';wrap.className='v2-command';
    wrap.innerHTML='<div class="v2-command-box"><input id="v2CommandInput" placeholder="¿A dónde quieres ir?"><div id="v2CommandResults" class="v2-command-results"></div></div>';
    document.body.appendChild(wrap);
    const input=wrap.querySelector('#v2CommandInput'),results=wrap.querySelector('#v2CommandResults');
    const close=()=>{wrap.classList.remove('open');input.value='';};
    const render=()=>{
      const q=input.value.toLowerCase().trim();
      const items=Object.entries(TITLES).filter(([k,v])=>navButton(k)&&(!q||v.toLowerCase().includes(q)));
      results.innerHTML=items.map(([k,v])=>'<button type="button" data-v2-go="'+k+'"><span>'+v+'</span><small>'+k+'</small></button>').join('');
      results.querySelectorAll('[data-v2-go]').forEach(b=>b.onclick=()=>{navButton(b.dataset.v2Go)?.click();close();});
    };
    const open=()=>{wrap.classList.add('open');render();setTimeout(()=>input.focus(),20)};
    hint.onclick=open; input.oninput=render; wrap.onclick=e=>{if(e.target===wrap)close()};
    document.addEventListener('keydown',e=>{
      if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();open();}
      if(e.key==='Escape')close();
    });
  }

  function setupFlowStrip(){
    const flow=[['clients','Cliente'],['quotes','Cotización'],['services','Servicio'],['billing','Factura'],['payments','Cobro']];
    flow.forEach(([viewId])=>{
      const view=document.getElementById(viewId); if(!view || view.querySelector('.v2-flow-strip')) return;
      const card=view.querySelector(':scope > .card'); if(!card) return;
      const strip=document.createElement('div');strip.className='v2-flow-strip';
      strip.innerHTML=flow.map(([id,label],idx)=>'<button type="button" data-flow-view="'+id+'" class="'+(id===viewId?'active':'')+'"><span>'+(idx+1)+'</span>'+label+'</button>').join('');
      card.prepend(strip);
      strip.querySelectorAll('[data-flow-view]').forEach(b=>b.onclick=()=>navButton(b.dataset.flowView)?.click());
    });
  }

  function syncActiveModule(){
    const active=document.querySelector('#appShell .view.active');
    document.body.dataset.activeModule=active?.id||'';
  }

  function openFormOnEdit(e){
    const edit=e.target.closest('[data-edit]');
    if(!edit)return;
    setTimeout(()=>{
      const view=document.querySelector('#appShell .view.active');
      const form=formForView(view); if(form)setFormOpen(form,true);
    },80);
  }

  function brandV2(){
    document.title='Nexus Business V2';
    const tagline=document.querySelector('.auth-tagline');
    if(tagline)tagline.textContent='Una operación más simple. Un negocio más claro.';
  }

  function run(){
    document.body.classList.add('v2-ready');
    brandV2();groupNav();setupModuleForms();setupSearch();setupFlowStrip();createCommand();syncActiveModule();
  }

  const obs=new MutationObserver(()=>{groupNav();setupModuleForms();setupFlowStrip();syncActiveModule();});
  obs.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  document.addEventListener('click',openFormOnEdit,true);
  document.addEventListener('DOMContentLoaded',run);window.addEventListener('load',run);run();
})();
