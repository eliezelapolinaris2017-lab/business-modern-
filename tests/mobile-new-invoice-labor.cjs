const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

(async () => {
  const { laborOptions, summarizeInvoiceLabor } = await import('../invoice-labor.js');
  const source = fs.readFileSync('mobile.js', 'utf8');
  const html = fs.readFileSync('mobile.html', 'utf8');
  const editor = html.slice(html.indexOf('<form id="mInvoiceForm"'), html.indexOf('id="mInvoiceList"'));
  assert.match(editor, /id="mAddLabor"/);
  assert.match(fs.readFileSync('index.html', 'utf8'), /id="newInvoice"[^>]*>Nueva factura/);
  assert.match(fs.readFileSync('app.js', 'utf8'), /location\.assign\('mobile\.html\?abrir=factura'\)/);

  const between = (start, end) => source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)));
  const date = '2026-11-24';
  const box = { lastElementChild: { querySelector: () => ({ focus() {} }) } };
  const fields = { mInvoiceLines: box, mInvClient: { value: 'client' }, mInvDate: { value: date } };
  const saved = [];
  const context = vm.createContext({
    $: id => fields[id] ?? { value: '' },
    invoiceSaving: false,
    editingInvoiceId: null,
    invoiceLines: [],
    laborOptions,
    esc: String,
    money: String,
    taxRate: () => 0.115,
    renderSummary() {},
    clientBy: () => ({ id: 'client', name: 'Cliente' }),
    uid: () => 'owner',
    db: {},
    state: { invoices: [] },
    serverTimestamp: () => 1,
    nextInvoiceNumber: async () => 'FAC-2026-0001',
    colRef: collection => collection,
    addDoc: async (collection, invoice) => {
      if (collection === 'invoices') saved.push(invoice);
      return { id: 'new-invoice' };
    },
    createAutoFollowupFromInvoice: async () => {},
    resetMobileInvoiceEditor() {},
    openInvoiceDoc() {},
    alert: assert.fail
  });
  vm.runInContext(
    between('function newLine(', 'function cleanPayload(') +
    between('function renderInvoiceLines(', 'function renderSummary(') +
    'function clickAddLabor(e){' + between("  if(e.target.closest('#mAddLabor'))", '  const add =') + '}' +
    'let lastCreatedInvoiceId;' +
    between('async function saveInvoice(', 'async function createAutoFollowupFromInvoice('),
    context
  );
  context.renderInvoiceLines();
  assert.match(box.innerHTML, /Tipo de labor/);
  assert.match(box.innerHTML, /Labor de instalación/);
  context.clickAddLabor({ target: { closest: () => true } });
  assert.match(box.innerHTML, /data-line-field="laborCategory" required/);
  assert.equal(context.invoiceLines.length, 1);
  const labor = context.invoiceLines[0];
  context.updateLineFromRow({
    dataset: { lineRow: labor.id },
    querySelectorAll: () => [
      { dataset: { lineField: 'laborCategory' }, value: 'electrical' },
      { dataset: { lineField: 'description' }, value: 'Instalación eléctrica' },
      { dataset: { lineField: 'price' }, value: '80' }
    ]
  });
  context.invoiceLines.push({ description: 'Materiales', qty: 1, price: 25, taxable: true });
  await context.saveInvoice('Pendiente');
  assert.equal(saved.length, 1);
  assert.equal(saved[0].items[0].laborCategory, 'electrical');
  assert.equal(saved[0].items[1].laborCategory, '');
  assert.equal(saved[0].subtotal, 105);
  assert.equal(summarizeInvoiceLabor(saved, '2026-11').total, 8000);
  console.log('PASS: new invoice picker, labor shortcut, persisted mixed items and labor report');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
