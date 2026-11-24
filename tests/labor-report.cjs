const assert = require('node:assert/strict');

(async () => {
  const { summarizeInvoiceLabor } = await import('../invoice-labor.js');
  const { filterLaborRows, laborPeriods, renderInvoiceLabor } = await import('../labor-report.js');
  const invoices = [
    { id: 'a', number: 'FAC-12', date: '2026-11-04', clientName: 'García <Co>', status: 'Pendiente', items: [
      { description: 'Instalación', laborCategory: 'installation', qty: 2, price: 100, discount: 20 },
      { description: 'Mantenimiento', laborCategory: 'maintenance', qty: 1, price: 50 },
      { description: 'Materiales', qty: 1, price: 70 }
    ] },
    { id: 'b', number: 'FAC-13', date: '2026-11-08', clientName: 'Rivera', status: 'Pagada', items: [
      { description: 'Cambio de breaker', laborCategory: 'electrical', qty: 1, price: 120 }
    ] }
  ];
  const { rows, total } = summarizeInvoiceLabor(invoices, '2026-11');
  assert.equal(total, 35000);
  const [match] = filterLaborRows(rows, 'garcia fac-12', 'installation');
  assert.equal(match.cents, 18000);
  assert.deepEqual(match.lines.map(line => line.item.description), ['Instalación']);
  assert.equal(filterLaborRows(rows, 'rivera', 'installation').length, 0);
  assert.equal(filterLaborRows(rows, '', '').length, 2);

  const leapFebruary = laborPeriods('monthly', '2024')[1];
  assert.equal(leapFebruary.end, '2024-02-29');
  const firstWeek = laborPeriods('weekly', '2026')[0];
  assert.deepEqual([firstWeek.start, firstWeek.end], ['2025-12-29', '2026-01-04']);
  const boundaryInvoices = ['2025-12-28', '2025-12-29', '2026-01-04', '2026-01-05'].map(date => ({ ...invoices[0], date }));
  assert.equal(summarizeInvoiceLabor(boundaryInvoices, firstWeek).total, 46000);
  assert.equal(summarizeInvoiceLabor(boundaryInvoices, laborPeriods('annual', '2026')[0]).total, 46000);

  const parts = Object.fromEntries(['mode', 'year', 'period', 'period-wrap', 'summary', 'categories', 'search', 'category', 'results', 'count']
    .map(name => [name, { value: '', innerHTML: '', dataset: {}, options: [0], insertAdjacentHTML() {}, querySelectorAll: () => [], querySelector: () => ({}) }]));
  parts.mode.value = 'monthly';
  const root = { id: 'labor', querySelector: selector => parts[selector.slice(12, -1)] };
  const money = value => '$' + value.toFixed(2);
  const escape = value => String(value).replaceAll('<', '&lt;');
  let currentInvoice;
  renderInvoiceLabor(root, invoices, '2026-11-24', money, escape, invoice => invoice.status, id => { currentInvoice = id; });
  assert.match(parts.summary.innerHTML, /\$350\.00/);
  assert.match(parts.categories.innerHTML, /Labor de instalación/);
  assert.match(parts.results.innerHTML, /García &lt;Co>/);
  assert.doesNotMatch(parts.results.innerHTML, /Materiales/);
  parts.category.value = 'installation';
  parts.category.onchange();
  assert.match(parts.count.textContent, /1 de 2 facturas · \$180\.00/);
  assert.doesNotMatch(parts.results.innerHTML, /Rivera/);
  parts.results.onclick({ target: { closest: selector => selector === '[data-labor-open]' ? { dataset: { laborOpen: 'a' } } : null } });
  assert.equal(currentInvoice, 'a');
  assert.match(parts.period.innerHTML, /Noviembre/);
  parts.mode.value = 'weekly';
  parts.mode.onchange();
  assert.equal(parts.period.value, '2026-11-23');
  assert.equal(parts['period-wrap'].hidden, false);
  parts.mode.value = 'annual';
  parts.mode.onchange();
  assert.equal(parts['period-wrap'].hidden, true);
  assert.match(parts.summary.innerHTML, /\$350\.00/);
  parts.mode.value = 'monthly';
  parts.mode.onchange();
  parts.period.value = '2026-12-01';
  parts.period.onchange();
  assert.match(parts.summary.innerHTML, /\$0\.00/);
  assert.match(parts.results.innerHTML, /no tiene facturas/);
  console.log('PASS: summary, month, accent-insensitive search, category subtotals and invoice detail');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
