import { doc, runTransaction } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';
// Shared transactional counter across desktop and mobile. Existing numbers are preserved.
export async function nextInvoiceNumber(db,ownerId,invoices,date){
  const year=String(date||new Date().toISOString()).slice(0,4);
  if(!/^\d{4}$/.test(year))throw new Error('Fecha de factura inválida.');
  const ref=doc(db,'users',ownerId);
  return runTransaction(db,async tx=>{
    const snap=await tx.get(ref),sequences=snap.data()?.invoiceSequences||{};
    const prefix='FAC-'+year+'-';
    const existing=invoices.reduce((max,x)=>String(x.number||'').startsWith(prefix)?Math.max(max,Number(x.number.slice(prefix.length))||0):max,0);
    const next=Math.max(Number(sequences[year])||0,existing)+1;
    tx.set(ref,{invoiceSequences:{...sequences,[year]:next}},{merge:true});
    return prefix+String(next).padStart(4,'0');
  });
}
