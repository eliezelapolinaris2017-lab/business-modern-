// Preserve working positions through DOM rebuilds and external applications.
export function createViewMemory({getView, getRoot, win=window, doc=document}){
  const views=new Map();
  let revision=0;
  function capture(){
    const root=getRoot(), elements=root?[root,...root.querySelectorAll('*')]:[];
    const scroll=elements.filter(el=>el.scrollTop||el.scrollLeft).map(el=>({id:el.id,index:elements.indexOf(el),x:el.scrollLeft,y:el.scrollTop}));
    return {view:getView(),x:win.scrollX,y:win.scrollY,scroll};
  }
  function restore(snapshot){
    const ticket=++revision;
    const apply=()=>{
      if(!snapshot||ticket!==revision||snapshot.view!==getView())return;
      const root=getRoot(),elements=root?[root,...root.querySelectorAll('*')]:[];
      for(const item of snapshot.scroll){const el=item.id?doc.getElementById(item.id):elements[item.index];if(el){el.scrollLeft=item.x;el.scrollTop=item.y;}}
      win.scrollTo({left:snapshot.x,top:snapshot.y,behavior:'instant'});
    };
    apply();win.requestAnimationFrame(apply);
  }
  function save(){const snapshot=capture();views.set(snapshot.view,snapshot);return snapshot;}
  function recall(){restore(views.get(getView())||{view:getView(),x:0,y:0,scroll:[]});}
  function preserve(callback){const snapshot=capture();try{return callback();}finally{restore(snapshot);}}
  for(const type of ['pointerdown','wheel','touchstart','keydown'])doc.addEventListener(type,()=>{revision++;},{passive:true,capture:true});
  let away=null;
  win.addEventListener('blur',()=>{away=capture();});
  win.addEventListener('focus',()=>{if(away){restore(away);away=null;}});
  doc.addEventListener('visibilitychange',()=>{if(doc.hidden)away=capture();else if(away){restore(away);away=null;}});
  return {capture,restore,save,recall,preserve};
}
