const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
const {portalPaymentActions:render,safePaymentUrl,OASIS_PAYMENT_LINKS}=await import('data:text/javascript;base64,'+Buffer.from(fs.readFileSync(require('node:path').join(__dirname,'../portal-payments.js'),'utf8')).toString('base64'));
const business={name:'Oasis Air Cleaner Services LLC'};
for(const balance of [0,-1,NaN,Infinity])assert.equal(render(business,{balance}),'');
assert.equal(render(business,{balance:100,status:'Cancelada'}),'');assert.equal(render({name:'Otro negocio'},{balance:100}),'');
const html=render(business,{balance:1450,invoiceNumber:'FAC-123',compact:true});assert.match(html,/\$1,450.00/);assert.match(html,/FAC-123/);assert.match(html,/Pagar con ATH Móvil/);assert.doesNotMatch(html,/Pagar con tarjeta/);assert.match(html,/target="_blank" rel="noopener noreferrer"/);assert.match(html,/cuando Oasis confirme y registre/);assert.ok(html.includes(OASIS_PAYMENT_LINKS.ath.replaceAll('&','&amp;')));assert.equal(new URL(OASIS_PAYMENT_LINKS.ath).searchParams.has('amount'),false);
assert.doesNotMatch(render(business,{balance:10,invoiceNumber:'<script>bad</script>'}),/<script>/);
for(const url of ['javascript:alert(1)','http://buy.stripe.com/x','https://evil.test/x','https://buy.stripe.com.evil.test/x','https://user:pass@buy.stripe.com/x'])assert.equal(safePaymentUrl(url,'card'),'');
const configured=render({portalPaymentLinks:{card:'https://buy.stripe.com/test_example'}},{balance:10});assert.match(configured,/Pagar con tarjeta/);assert.doesNotMatch(configured,/Pagar con ATH/);
console.log('PASS: pending balances only, canceled invoices hidden, exact ATH destination, no preset amount, missing card hidden, safe provider URLs, no cross-business default, escaped invoice and confirmation copy.');
})().catch(e=>{console.error(e);process.exitCode=1});
