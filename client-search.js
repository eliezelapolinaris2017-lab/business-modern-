export function normalizeClientSearch(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
export function searchClients(clients,query,limit=8){
  const q=normalizeClientSearch(query),tokens=q.split(/\s+/).filter(Boolean),digits=q.replace(/\D/g,'');
  return [...clients].filter(c=>{
    const text=normalizeClientSearch([c.name,c.phone,c.whatsapp,c.email,c.city].join(' '));
    return tokens.every(t=>text.includes(t))||(digits.length>=3&&String(c.phone||c.whatsapp||'').replace(/\D/g,'').includes(digits));
  }).sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'es')).slice(0,limit);
}
