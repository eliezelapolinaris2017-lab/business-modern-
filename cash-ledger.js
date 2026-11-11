// Amounts are aggregated in cents. Source records own linked movements.
const cents=value=>Number.isFinite(Number(value))?Math.round(Number(value)*100):0;
export function cashDate(value){
  if(!value)return '';
  if(typeof value==='string'){
    if(/^\d{4}-\d{2}-\d{2}$/.test(value))return value;
    const us=value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if(us)return `${us[3]}-${us[1].padStart(2,'0')}-${us[2].padStart(2,'0')}`;
  }
  const date=value?.toDate?.() || (value?.seconds?new Date(value.seconds*1000):new Date(value));
  if(!Number.isFinite(date.getTime()))return '';
  return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Puerto_Rico',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
}
export function buildCashLedger(data){
  const sources=[];
  const push=(module,row,type,concept,amount,date=row.date)=>sources.push({...row,id:`${module}:${row.id}`,sourceId:row.id,sourceModule:module,type,concept,amount:cents(amount)/100,date:cashDate(date),origin:module,derived:true});
  (data.payments||[]).forEach(p=>push('payments',p,'Ingreso',`Cobro ${p.invoiceNumber||''}`,p.amount));
  (data.supplierPayments||[]).forEach(p=>{const purchase=(data.purchases||[]).find(x=>x.id===p.purchaseId);push('supplierPayments',p,'Gasto',`Pago suplidor ${p.supplierName||''}${p.purchaseId?' · '+(purchase?.number||purchase?.concept||p.purchaseNumber||''):''}`,p.amount);});
  (data.payroll||[]).forEach(p=>push('payroll',p,'Gasto',`Nómina ${p.teamName||''}`,p.net!==undefined&&p.net!==''?p.net:Math.max(0,Number(p.gross||0)+Number(p.bonus||0)-Number(p.retention||0)-Number(p.deductions||0)-Number(p.advance||0))));
  (data.payrollRetentions||[]).filter(p=>(p.status==='Pagada'||(!p.status&&p.paidAt))).forEach(p=>push('payrollRetentions',p,'Gasto',`Pago retención ${p.type||''} · ${p.destination||''}`,p.amount,p.paidAt||p.date));
  const matched=new Set(), manual=[], issues=[];
  for(const raw of data.cashflow||[]){
    const row={...raw,date:cashDate(raw.date),origin:'cashflow'};
    if(raw.sourceModule&&raw.sourceId){
      const source=sources.find(s=>s.sourceModule===raw.sourceModule&&s.sourceId===raw.sourceId);
      if(source){matched.add(source.id);continue;}
      // A deleted source must not leave its old cash mirror in the balance.
      issues.push({...row,reason:'Movimiento vinculado sin registro de origen'});continue;
    }
    if(row.origin==='manual'||raw.origin==='manual'){manual.push({...row,origin:'cashflow'});continue;}
    const concept=String(row.concept||'').trim();
    const source=sources.find(s=>!matched.has(s.id)&&s.date===row.date&&s.type===row.type&&cents(s.amount)===cents(row.amount)&&
      (s.concept.trim()===concept || (s.sourceModule==='supplierPayments'&&concept===`Pago suplidor ${s.supplierName||''}`)));
    if(source){matched.add(source.id);continue;}
    if(/^(Cobro |Pago suplidor |Nómina |Pago retención )/.test(concept))issues.push({...row,reason:'Movimiento histórico sin coincidencia; incluido hasta revisar'});
    manual.push(row);
  }
  const rows=[...sources,...manual].sort((a,b)=>a.date.localeCompare(b.date)||String(a.id).localeCompare(String(b.id)));
  let running=0;
  for(const row of rows){row.signedCents=(row.type==='Gasto'?-1:1)*cents(row.amount);if(row.date)running+=row.signedCents;row.running=running/100;}
  for(const row of rows)if(!row.date)issues.push({...row,reason:'Sin fecha válida; excluido de los saldos'});
  return {rows,issues};
}
export function cashLedgerSummary(rows,from,to,asOf){
  const valid=rows.filter(r=>r.date);
  const total=list=>list.reduce((sum,r)=>sum+r.signedCents,0)/100;
  const period=valid.filter(r=>r.date>=from&&r.date<=to);
  const prior=total(valid.filter(r=>r.date<from));
  const income=total(period.filter(r=>r.type!=='Gasto'));
  const expenses=-total(period.filter(r=>r.type==='Gasto'));
  return {prior,income,expenses,net:Math.round((income-expenses)*100)/100,closing:total(valid.filter(r=>r.date<=to)),current:total(valid.filter(r=>r.date<=asOf)),period};
}
