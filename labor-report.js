import { laborCategories, summarizeInvoiceLabor } from './invoice-labor.js?v=4';

const monthFormat = new Intl.DateTimeFormat('es-PR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const monthName = new Intl.DateTimeFormat('es-PR', { month: 'long', timeZone: 'UTC' });
const weekFormat = new Intl.DateTimeFormat('es-PR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const puertoRicoDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Puerto_Rico', year: 'numeric', month: '2-digit', day: '2-digit' });
export function laborToday() {
  const parts = Object.fromEntries(puertoRicoDate.formatToParts(new Date()).map(part => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}
const dayFormat = new Intl.DateTimeFormat('es-PR', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const normalize = value => String(value ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const statusStyles = { Pagada: 'paid', Parcial: 'partial', Vencida: 'overdue' };


const isoDate = date => date.toISOString().slice(0, 10);
const utcDate = date => new Date(date + 'T12:00:00Z');
const capitalize = label => label.charAt(0).toUpperCase() + label.slice(1);

export function laborPeriods(mode, year) {
  const first = year + '-01-01';
  const last = year + '-12-31';
  if (mode === 'annual') return [{ start: first, end: last, label: String(year) }];
  if (mode === 'monthly') {
    return Array.from({ length: 12 }, (_, index) => {
      const startDate = utcDate(year + '-' + String(index + 1).padStart(2, '0') + '-01');
      const endDate = new Date(startDate);
      endDate.setUTCMonth(endDate.getUTCMonth() + 1, 0);
      return { start: isoDate(startDate), end: isoDate(endDate), label: capitalize(monthName.format(startDate)) };
    });
  }

  const periods = [];
  const monday = utcDate(first);
  monday.setUTCDate(monday.getUTCDate() - (monday.getUTCDay() + 6) % 7);
  while (isoDate(monday) <= last) {
    const sunday = new Date(monday);
    sunday.setUTCDate(sunday.getUTCDate() + 6);
    periods.push({ start: isoDate(monday), end: isoDate(sunday), label: weekFormat.formatRange(monday, sunday) });
    monday.setUTCDate(monday.getUTCDate() + 7);
  }
  return periods;
}

function setLaborOptions(select, options, value) {
  const markup = options.map(option => `<option value="${option.value}">${option.label}</option>`).join('');
  if (select.dataset.options !== markup) {
    select.innerHTML = markup;
    select.dataset.options = markup;
  }
  select.value = value;
}

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
  const mode = root.querySelector('[data-labor-mode]');
  const yearSelect = root.querySelector('[data-labor-year]');
  const periodSelect = root.querySelector('[data-labor-period]');
  const periodWrap = root.querySelector('[data-labor-period-wrap]');
  const summary = root.querySelector('[data-labor-summary]');
  const categories = root.querySelector('[data-labor-categories]');
  const search = root.querySelector('[data-labor-search]');
  const category = root.querySelector('[data-labor-category]');
  const results = root.querySelector('[data-labor-results]');
  const count = root.querySelector('[data-labor-count]');
  const currentYear = date.slice(0, 4);
  const years = [...new Set([currentYear, ...invoices.map(invoice => String(invoice.date || '').slice(0, 4))])]
    .filter(year => /^\d{4}$/.test(year) && year !== '0000').sort().reverse();
  const year = years.includes(yearSelect.value) ? yearSelect.value : currentYear;
  setLaborOptions(yearSelect, years.map(year => ({ value: year, label: year })), year);

  const periods = laborPeriods(mode.value, year);
  const previous = periodSelect.dataset.mode === mode.value ? periodSelect.value : '';
  const selected = periods.find(period => period.start === previous)
    || periods.find(period => period.start <= date && period.end >= date) || periods[0];
  periodWrap.hidden = mode.value === 'annual';
  if (!periodWrap.hidden) {
    periodSelect.dataset.mode = mode.value;
    periodWrap.querySelector('span').textContent = mode.value === 'weekly' ? 'Semana (lunes a domingo)' : 'Mes';
    setLaborOptions(periodSelect, periods.map(period => ({ value: period.start, label: period.label })), selected.start);
  }
  if (category.options.length === 1) {
    category.insertAdjacentHTML('beforeend', Object.entries(laborCategories)
      .map(([key, label]) => `<option value="${key}">${label}</option>`).join(''));
  }
  const { rows, total, categories: totalsByCategory } = summarizeInvoiceLabor(invoices, selected);
  const moneyFromCents = cents => money(cents / 100);
  const period = mode.value === 'monthly' ? monthFormat.format(utcDate(selected.start)) : selected.label;
  const invoiceCount = rows.length;

  summary.innerHTML = `
    <div class="labor-metric labor-metric-primary"><span>Mano de obra facturada</span><strong>${moneyFromCents(total)}</strong><small>${escape(period)}</small></div>
    <div class="labor-metric"><span>Facturas con labor</span><strong>${invoiceCount}</strong><small>En el período seleccionado</small></div>
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
      results.innerHTML = `<p class="labor-empty">${rows.length ? 'No hay facturas que coincidan con los filtros.' : 'Este período no tiene facturas con partidas de labor clasificadas.'}</p>`;
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
  const changePeriod = () => renderInvoiceLabor(root, invoices, date, money, escape, invoiceStatus, openInvoice);
  mode.onchange = yearSelect.onchange = periodSelect.onchange = changePeriod;
  drawRows();
}
