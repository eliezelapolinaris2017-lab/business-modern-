// Payment destinations supplied by Oasis. An empty card URL never renders a button.
export const OASIS_PAYMENT_LINKS={
  ath:'https://pagos.athmovilapp.com/pagoPorCodigo.html?id=01261395-62c0-4907-8765-547d83428e01',
  card:''
};
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function safePaymentUrl(value,method){
  try{const url=new URL(value),hosts=method==='ath'?['pagos.athmovilapp.com']:['buy.stripe.com','checkout.stripe.com','invoice.stripe.com','payments.stripe.com'];return url.protocol==='https:'&&!url.username&&!url.password&&hosts.includes(url.hostname)?url.href:'';}catch{return '';}
}
export function portalPaymentActions(business,{balance,invoiceNumber='',status='',compact=false}={}){
  const amount=Number(balance);
  if(!Number.isFinite(amount)||amount<=0||/cancelad|anulad|void/i.test(status))return '';
  const configured=business?.portalPaymentLinks||(/oasis/i.test(business?.name||'')?OASIS_PAYMENT_LINKS:{});
  const ath=safePaymentUrl(configured.ath,'ath'),card=safePaymentUrl(configured.card,'card');
  if(!ath&&!card)return '';
  const money=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(amount);
  return `<section class="portal-payment-options${compact?' compact':''}" aria-label="Pagar ${invoiceNumber?'factura '+escapeHtml(invoiceNumber):'balance pendiente'}"><h4>${compact?'Pagar factura':'Paga tu balance pendiente'}</h4><p>${invoiceNumber?`Factura <b>${escapeHtml(invoiceNumber)}</b> · `:''}Saldo: <strong>${money}</strong></p><div class="portal-payment-buttons">${ath?`<a href="${escapeHtml(ath)}" target="_blank" rel="noopener noreferrer">Pagar con ATH Móvil</a>`:''}${card?`<a href="${escapeHtml(card)}" target="_blank" rel="noopener noreferrer">Pagar con tarjeta</a>`:''}</div><p class="payment-help">Ingresa ${money} en la página de pago${invoiceNumber?' e indica el número de factura si te lo solicita':''}. El balance se actualizará cuando Oasis confirme y registre el pago.</p></section>`;
}
