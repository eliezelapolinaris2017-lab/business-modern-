const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

(async () => {
  const { laborOptions, summarizeInvoiceLabor } = await import('../invoice-labor.js');
  const source = fs.readFileSync('app.js', 'utf8');
  const block = source.slice(source.indexOf('function invoiceEditorItemsHtml('), source.indexOf('async function editRecord('));
  const fields = {
    editTitle: {}, editSave: {}, editForm: { reportValidity: () => true },
    edit_invoice_clientId: { value: '' },
    edit_invoice_date: { value: '2026-11-24' },
    edit_invoice_dueDate: { value: '2026-12-09' },
    edit_invoice_taxPercent: { value: '11.5' },
    edit_invoice_serviceTitle: { value: '' },
    edit_invoice_notes: { value: '' },
    edit_invoice_terms: { value: '' },
    newInvoice: { focus() {} }
  };
  const makeRow = ({ description, qty, price, laborCategory }) => ({
    dataset: {},
    querySelector: selector => ({ value: { '.invoice-edit-desc': description, '.invoice-edit-qty': qty, '.invoice-edit-price': price, '.invoice-edit-labor': laborCategory }[selector] })
  });
  const rows = [
    makeRow({ description: 'Instalación', qty: 1, price: 100, laborCategory: 'installation' }),
    makeRow({ description: 'Materiales', qty: 1, price: 22.50, laborCategory: '' })
  ];
  const alerts = [];
  const actions = [];
  const client = { id: 'c1', name: 'Cliente' };
  const modal = { querySelector: () => ({}), classList: { remove() {} } };
  let finishSaving;
  const context = vm.createContext({
    $: id => fields[id],
    state: { clients: [client], invoices: [] },
    document: { querySelectorAll: selector => selector === '[data-invoice-edit-line]' ? rows : [] },
    today: () => fields.edit_invoice_date.value,
    plusDays: () => fields.edit_invoice_dueDate.value,
    invoiceTotals: () => ({ subtotal: 0, ivu: 0, total: 0, taxPercent: 11.5 }),
    profile: () => ({ tax: '11.5' }),
    canCreate: () => true, ensureEditModal: () => modal, laborOptions, esc: String, money: String,
    input: () => '', editSelectHtml: () => '',
    clientBy: id => id === client.id ? client : {},
    alert: message => alerts.push(message),
    closeEditModal: () => actions.push('close'),
    openBilling: () => actions.push('billing'),
    add: async (collection, invoice) => {
      actions.push({ collection, invoice });
      return new Promise(resolve => { finishSaving = () => resolve({ id: 'inv1' }); });
    }
  });
  vm.runInContext(block, context);
  context.editInvoiceRecord();
  assert.equal(fields.editTitle.textContent, 'Nueva factura');
  assert.match(fields.editForm.innerHTML, /Labor de instalación/);
  await fields.editSave.onclick();
  assert.deepEqual(alerts, ['Selecciona un cliente.']);
  fields.edit_invoice_clientId.value = client.id;
  const saving = fields.editSave.onclick();
  await fields.editSave.onclick();
  assert.equal(actions.length, 1, 'A second click must not create another invoice');
  assert.equal(fields.editSave.disabled, true);
  finishSaving();
  await saving;
  const [{ collection, invoice }] = actions;
  assert.equal(collection, 'invoices');
  assert.equal(invoice.items[0].laborCategory, 'installation');
  assert.equal(invoice.items[1].laborCategory, '');
  assert.equal(invoice.total, 136.59);
  assert.equal(invoice.status, 'Pendiente');
  assert.equal(summarizeInvoiceLabor([invoice], '2026-11').total, 10000);
  assert.deepEqual(actions.slice(1), ['close', 'billing']);
  assert.equal(fields.editSave.disabled, false);
  console.log('PASS: desktop creation, client validation, mixed invoice, duplicate click guard and labor report');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
