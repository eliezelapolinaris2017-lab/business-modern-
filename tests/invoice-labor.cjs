const assert = require('node:assert/strict');

(async () => {
  const { summarizeInvoiceLabor, laborCategories, laborOptions } = await import('../invoice-labor.js');
  const items = [
    { laborCategory: 'installation', qty: 2, price: 125, discount: 10 },
    { laborCategory: 'maintenance', qty: 1, price: 75.15 },
    { laborCategory: 'electrical', qty: 1, price: 40.05 },
    { laborCategory: 'domestic', qty: 1, price: 50 },
    { laborCategory: 'other', qty: 1, price: 15 },
    { qty: 1, price: 500 },
    { qty: 1, price: 0, discount: 25, taxable: false },
    { laborCategory: 'invalid', qty: 1, price: 500 }
  ];
  const report = summarizeInvoiceLabor([
    { id: 'mixed', date: '2026-11-23', status: 'Pendiente', items, ivu: 95 },
    { date: '2026-11-22', status: 'Cancelada', items },
    { date: '2026-11-21', status: 'Borrador', items },
    { date: '2026-10-21', status: 'Pagada', items },
    { date: '2026-11-20', status: 'Pagada' }
  ], '2026-11');
  assert.equal(report.total, 42020);
  assert.deepEqual(report.categories, { installation: 24000, maintenance: 7515, electrical: 4005, domestic: 5000, other: 1500 });
  assert.deepEqual(report.rows.map(row => row.invoice.id), ['mixed']);
  assert.match(laborOptions('electrical'), /value="electrical" selected/);
  assert.equal(Object.keys(laborCategories).length, 5);
  console.log('PASS labor report: categories, invoice month, line discounts, cents, and exclusion of IVU, unclassified lines, drafts and cancellations');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
