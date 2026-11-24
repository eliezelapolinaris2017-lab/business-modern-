import { laborCategories, summarizeInvoiceLabor } from './invoice-labor.js?v=3';

const monthFormat = new Intl.DateTimeFormat('es-PR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const dayFormat = new Intl.DateTimeFormat('es-PR', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const normalize = value => String(value ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const statusStyles = { Pagada: 'paid', Parcial: 'partial', Vencida: 'overdue' };

export function filterLaborRows(rows, search, category) {
  const terms = normalize(search).trim().split(/\s+/).filter(Boolean);
  return rows.flatMap(row => {
    const description = normalize([row.invoice.number, row.invoice.clientName].join(' '));
    if (!terms.every(term => description.includes(term))) return [];
    if (!category) return [row];
    const lines = row.lines.filter(({ item }) => item.laborCategory === category);
    return lines.length ? [{ ...row, lines, cents: lines.reduce((sum, line) => sum + line.cents, 0) }] : [];
  });
}

export function renderInvoiceLabor(root, invoices, date, money, escape, invoiceStatus, openInvoice) {
  const month = root.querySelector('[data-labor-month]');
  const summary = root.querySelector('[data-labor-summary]');
  const categories = root.querySelector('[data-labor-categories]');
  const search = root.querySelector('[data-labor-search]');
  const category = root.querySelector('[data-labor-category]');
  const results = root.querySelector('[data-labor-results]');
  const count = root.querySelector('[data-labor-count]');
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month.value)) month.value = date.slice(0, 7);
  if (category.options.length === 1) {
    category.insertAdjacentHTML('beforeend', Object.entries(laborCategories)
      .map(([key, label]) => `<option value="${key}">${label}</option>`).join(''));
  }
  const { rows, total, categories: totalsByCategory } = summarizeInvoiceLabor(invoices, month.value);
  const moneyFromCents = cents => money(cents / 100);
  const period = monthFormat.format(new Date(month.value + '-01T12:00:00Z'));
  const invoiceCount = rows.length;

  summary.innerHTML = `
    <div class="labor-metric labor-metric-primary"><span>Mano de obra facturada</span><strong>${moneyFromCents(total)}</strong><small>${escape(period)}</small></div>
    <div class="labor-metric"><span>Facturas con labor</span><strong>${invoiceCount}</strong><small>En el mes seleccionado</small></div>
    <div class="labor-metric"><span>Promedio de labor por factura</span><strong>${moneyFromCents(invoiceCount ? Math.round(total / invoiceCount) : 0)}</strong><small>Sobre facturas con labor</small></div>`;

  categories.innerHTML = Object.entries(laborCategories).map(([key, label]) => {
    const cents = totalsByCategory[key];
    const percent = total ? cents / total * 100 : 0;
    return `<button class="labor-category" type="button" data-labor-filter="${key}" aria-pressed="${category.value === key}">
      <span>${label}</span><strong>${moneyFromCents(cents)}</strong>
      <span class="labor-category-track" aria-hidden="true"><span style="width:${percent}%"></span></span>
      <small>${percent.toLocaleString('es-PR', { maximumFractionDigits: 1 })}% del total</small>
    </button>`;
  }).join('');

  function drawRows() {
    const filtered = filterLaborRows(rows, search.value, category.value);
    const filteredTotal = filtered.reduce((sum, row) => sum + row.cents, 0);
    const filterActive = search.value.trim() || category.value;
    count.textContent = `${filtered.length} de ${invoiceCount} facturas${filterActive ? ' · ' + moneyFromCents(filteredTotal) + ' en la selección' : ''}`;
    categories.querySelectorAll('[data-labor-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.laborFilter === category.value)));

    if (!filtered.length) {
      results.innerHTML = `<p class="labor-empty">${rows.length ? 'No hay facturas que coincidan con los filtros.' : 'Este mes no tiene facturas con partidas de labor clasificadas.'}</p>`;
      return;
    }

    results.innerHTML = `<div class="labor-table-wrap"><table class="labor-table" role="table" aria-label="Facturas con mano de obra">
      <thead role="rowgroup"><tr role="row"><th role="columnheader" scope="col">Fecha</th><th role="columnheader" scope="col">Factura</th><th role="columnheader" scope="col">Cliente</th><th role="columnheader" scope="col">Estado</th><th role="columnheader" scope="col" class="labor-amount">Labor facturada</th><th role="columnheader" scope="col"><span class="labor-sr-only">Acciones</span></th></tr></thead>
      <tbody role="rowgroup">${filtered.map(({ invoice, cents, lines }, index) => {
        const status = invoiceStatus(invoice);
        const statusTag = `<span class="labor-status ${statusStyles[status] || ''}">${escape(status)}</span>`;
        const date = new Date(invoice.date + 'T12:00:00Z');
        const day = Number.isNaN(date.getTime()) ? invoice.date : dayFormat.format(date);
        const detailId = `${root.id}-invoice-details-${index}`;
        return `<tr class="labor-invoice-row" role="row">
          <td role="cell">${escape(day)}</td><td role="cell"><strong class="labor-number">${escape(invoice.number || 'Factura')}</strong></td>
          <td role="cell">${escape(invoice.clientName || 'Cliente')}</td><td role="cell">${statusTag}</td>
          <td role="cell" class="labor-amount"><strong>${moneyFromCents(cents)}</strong></td>
          <td role="cell" class="labor-action"><button type="button" class="labor-detail-button" data-labor-detail aria-controls="${detailId}" aria-expanded="false">Detalle</button></td>
        </tr><tr id="${detailId}" class="labor-detail-row" role="row" hidden><td role="cell" colspan="6"><div class="labor-detail">
          <div class="labor-detail-head"><strong>Partidas de labor · ${escape(invoice.number || 'Factura')}</strong>
            ${invoice.id ? `<button type="button" class="labor-detail-button" data-labor-open="${escape(invoice.id)}">Ver factura</button>` : ''}</div>
          <ul>${lines.map(({ item, cents }) => `<li><div><strong>${escape(item.description || item.desc || laborCategories[item.laborCategory])}</strong>
            <small>${laborCategories[item.laborCategory]} · Cant. ${escape(item.qty ?? item.quantity ?? 1)}</small></div>
            <strong class="labor-amount">${moneyFromCents(cents)}</strong></li>`).join('')}</ul>
        </div></td></tr>`;
      }).join('')}</tbody></table></div>`;
  }

  // Preserve the active search and category controls when invoices synchronize.
  search.oninput = drawRows;
  category.onchange = drawRows;
  categories.onclick = event => {
    const button = event.target.closest('[data-labor-filter]');
    if (!button) return;
    category.value = category.value === button.dataset.laborFilter ? '' : button.dataset.laborFilter;
    drawRows();
  };
  results.onclick = event => {
    const detail = event.target.closest('[data-labor-detail]');
    if (detail) {
      const row = detail.closest('tr').nextElementSibling;
      row.hidden = !row.hidden;
      detail.setAttribute('aria-expanded', String(!row.hidden));
      detail.textContent = row.hidden ? 'Detalle' : 'Cerrar';
    }
    const button = event.target.closest('[data-labor-open]');
    if (button) openInvoice(button.dataset.laborOpen);
  };
  month.onchange = () => renderInvoiceLabor(root, invoices, date, money, escape, invoiceStatus, openInvoice);
  drawRows();
}
