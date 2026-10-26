// One publication at a time per client, with changes coalesced while a write is in flight.
export function createPortalSyncScheduler({getState,getOwner,isReady,syncClient,onError=console.warn,delay=400,setTimer=setTimeout,clearTimer=clearTimeout}){
  let owner=getOwner(),generation=0,timer=null,running=false;
  const previous=new Map(),pending=new Set(),attempts=new Map();
  const enabled=()=>getState().clients?.filter(c=>c.portalEnabled&&c.portalToken)||[];
  const invoiceClient=id=>getState().invoices?.find(i=>i.id===id)?.clientId;
  function reset(){generation++;if(timer!==null)clearTimer(timer);timer=null;running=false;previous.clear();pending.clear();attempts.clear();owner=getOwner();}
  function schedule(wait=delay){if(timer!==null||running||!owner||!isReady()||!pending.size)return;timer=setTimer(()=>{timer=null;void drain();},wait);}
  function add(id){if(id)pending.add(id);}
  function markAll(){if(owner!==getOwner())reset();enabled().forEach(c=>add(c.id));schedule();}
  function observe(collection,rows){
    if(owner!==getOwner())reset();
    const old=previous.get(collection)||new Map(),next=new Map();
    const affect=(id,row)=>{if(!row)return;if(collection==='clients')add(id);else if(collection==='payments')add(invoiceClient(row.invoiceId));else add(row.clientId);};
    for(const row of rows){
      const entry={signature:JSON.stringify(row),clientId:row.clientId,invoiceId:row.invoiceId};next.set(row.id,entry);
      if(old.get(row.id)?.signature!==entry.signature){affect(row.id,old.get(row.id));affect(row.id,entry);attempts.delete(row.clientId||row.id);}
    }
    for(const [id,row] of old)if(!next.has(id))affect(id,row);
    previous.set(collection,next);schedule();
  }
  async function drain(){
    if(running||!isReady()||!owner)return;
    const epoch=generation,expectedOwner=owner;running=true;let retry=false;
    try{
      const allowed=new Set(enabled().map(c=>c.id));
      const ids=[...pending].filter(id=>allowed.has(id));pending.clear();
      // Different clients can publish together; the same client never overlaps itself.
      for(let start=0;start<ids.length;start+=4){
        if(epoch!==generation||getOwner()!==expectedOwner)return;
        await Promise.all(ids.slice(start,start+4).map(async id=>{
          try{await syncClient(id);if(epoch===generation)attempts.delete(id);}
          catch(error){if(epoch!==generation)return;onError(error,id);const count=(attempts.get(id)||0)+1;attempts.set(id,count);if(count<4){pending.add(id);retry=true;}}
        }));
      }
    }finally{if(epoch===generation){running=false;schedule(retry?2000:delay);}}
  }
  return {observe,markAll,reset,flush:schedule};
}
