// Nexus Business PR — Modern UI 2026
// Progressive enhancement only. No business/data logic is changed.
(()=>{
  const ICONS={
    dashboard:'⌂',clients:'◎',directory:'⌖',contracts:'▤',services:'◆',quotes:'◇',
    followups:'↻',team:'♙',assets:'▣',payroll:'$',suppliers:'◫',supplierPayments:'→',
    purchases:'▥',billing:'▧',payments:'✓',cashflow:'∿',reports:'▦',plans:'☆',settings:'⚙'
  };

  function decorateNav(){
    document.querySelectorAll('#sideNav [data-view]').forEach(btn=>{
      const view=btn.dataset.view||'';
      btn.dataset.modernIcon=ICONS[view]||'•';
    });
  }

  function improveSearch(){
    const input=document.getElementById('globalSearch');
    if(!input || input.dataset.modernized) return;
    input.dataset.modernized='1';
    input.placeholder='Buscar cliente, factura, servicio…';
    input.setAttribute('aria-label','Búsqueda global');
  }

  function labelModule(){
    const view=document.querySelector('#appShell .view.active');
    if(!view) return;
    document.body.dataset.activeModule=view.id||'';
  }

  function decorateForms(){
    document.querySelectorAll('#appShell form.form-grid').forEach(form=>{
      if(form.dataset.modernized) return;
      form.dataset.modernized='1';
      form.classList.add('modern-form-workspace');
    });
  }

  function run(){
    decorateNav();
    improveSearch();
    decorateForms();
    labelModule();
  }

  const obs=new MutationObserver(run);
  obs.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  document.addEventListener('DOMContentLoaded',run);
  window.addEventListener('load',run);
  run();
})();
