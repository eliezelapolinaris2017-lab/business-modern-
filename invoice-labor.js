export const laborCategories = Object.freeze({
  installation: 'Labor de instalación',
  maintenance: 'Labor de mantenimiento',
  electrical: 'Labor de electricidad',
  domestic: 'Labor de servicio doméstico',
  other: 'Otra labor'
});

export function laborOptions(selected, placeholder = 'Sin clasificar como labor') {
  return `<option value="">${placeholder}</option>` +
    Object.entries(laborCategories).map(([key, label]) =>
      `<option value="${key}"${selected === key ? ' selected' : ''}>${label}</option>`
    ).join('');
}

export function summarizeInvoiceLabor(invoices, month) {
  const categories = Object.fromEntries(Object.keys(laborCategories).map(key => [key, 0]));
  const rows = [];
  let total = 0;
  for (const invoice of invoices) {
    if (!String(invoice.date || '').startsWith(month + '-')) continue;
    if (['borrador', 'cancelada', 'anulada'].includes(String(invoice.status || '').trim().toLowerCase())) continue;
    let invoiceTotal = 0;
    for (const item of invoice.items || []) {
      if (!Object.hasOwn(categories, item.laborCategory)) continue;
      const gross = Number(item.qty ?? item.quantity ?? 1) * Number(item.price ?? item.unitPrice ?? 0);
      const net = Math.round((Math.max(0, gross - (Number(item.discount) || 0)) + Number.EPSILON) * 100);
      if (!Number.isFinite(net) || !net) continue;
      categories[item.laborCategory] += net;
      invoiceTotal += net;
    }
    if (!invoiceTotal) continue;
    rows.push({ invoice, cents: invoiceTotal });
    total += invoiceTotal;
  }
  rows.sort((a, b) => b.invoice.date.localeCompare(a.invoice.date));
  return { categories, rows, total };
}

export function renderInvoiceLabor(root, invoices, date, money, escape) {
  const month = root.querySelector('[data-labor-month]');
  const result = root.querySelector('[data-labor-result]');
  if (!month.value) month.value = date.slice(0, 7);
  const render = () => {
    const { categories, rows, total } = summarizeInvoiceLabor(invoices, month.value);
    result.innerHTML = `<h3>Mano de obra facturada · ${money(total / 100)}</h3>
      <dl>${Object.entries(laborCategories).map(([key, label]) =>
        `<div class="section-row"><dt>${label}</dt><dd><strong>${money(categories[key] / 100)}</strong></dd></div>`
      ).join('')}</dl>
      <h3>Facturas con mano de obra</h3>
      ${rows.length ? `<ul>${rows.map(({ invoice, cents }) =>
        `<li>${escape(invoice.date)} · ${escape(invoice.number || 'Factura')} · ${escape(invoice.clientName || 'Cliente')} · <strong>${money(cents / 100)}</strong></li>`
      ).join('')}</ul>` : '<p class="muted">Este mes no tiene partidas clasificadas de mano de obra.</p>'}`;
  };
  month.onchange = render;
  render();
}

export function classifyInvoiceLabor(items, escape, money) {
  const dialog = document.createElement('dialog');
  dialog.className = 'card';
  dialog.style.cssText = 'width:min(540px,calc(100% - 24px));max-height:85vh;overflow:auto';
  dialog.setAttribute('aria-labelledby', 'invoiceLaborDialogTitle');
  dialog.innerHTML = `<form method="dialog">
    <h2 id="invoiceLaborDialogTitle">Clasifica la mano de obra</h2>
    <p>Selecciona la categoría de cada partida de labor.</p>
    ${items.map(item => `<p><label>${escape(item.description || 'Partida')} · ${money(Number(item.qty ?? 1) * Number(item.price ?? 0))}
      <select>${laborOptions(item.laborCategory)}</select></label></p>`).join('')}
    <div class="toolbar"><button value="cancelar" type="submit">Cancelar</button><button value="facturar" type="submit">Crear factura</button></div>
  </form>`;
  document.body.append(dialog);
  return new Promise(resolve => {
    dialog.addEventListener('close', () => {
      const categories = [...dialog.querySelectorAll('select')].map(select => select.value);
      dialog.remove();
      resolve(dialog.returnValue === 'facturar' ? items.map((item, index) =>
        ({ ...item, laborCategory: categories[index] })) : null);
    }, { once: true });
    dialog.showModal();
  });
}
