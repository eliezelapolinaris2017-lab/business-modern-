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
