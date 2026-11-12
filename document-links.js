// Tokens remain the access credential; document references only select a document.
export async function documentReference(type,id){
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(type+':'+id));
  return Array.from(new Uint8Array(digest).slice(0,9),b=>b.toString(16).padStart(2,'0')).join('');
}
export function portalTokenFromLink(link){const u=new URL(link);return u.searchParams.get('access')||decodeURIComponent(u.hash.slice(1).split('/')[0]||'');}
export async function shortDocumentLink(portalLink,type,id,brandedBase){
  const url=brandedBase?new URL(brandedBase):new URL('../f/',portalLink);
  url.hash=encodeURIComponent(portalTokenFromLink(portalLink))+'/'+await documentReference(type,id);
  return url.href;
}
export function incomingPortalLink(location){
  const params=new URLSearchParams(location.search),parts=location.hash.slice(1).split('/');
  return {token:params.get('access')||params.get('token')||decodeURIComponent(parts[0]||''),document:params.get('document')||'',reference:parts[1]||''};
}
export async function resolveDocumentReference(data,reference){
  if(!reference)return '';
  const matches=[];
  for(const [type,rows] of [['invoice',data.invoices||[]],['quote',data.quotes||[]]]){
    for(const row of rows)if(await documentReference(type,row.id)===reference)matches.push(type+':'+row.id);
  }
  return matches.length===1?matches[0]:'';
}
