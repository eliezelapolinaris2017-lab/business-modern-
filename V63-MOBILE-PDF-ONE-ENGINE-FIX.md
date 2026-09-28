# V63 — Mobile PDF One Engine Fix

Corrección definitiva del flujo PDF móvil.

## Qué cambió

- Se eliminó la dependencia de capturar HTML oculto para generar el PDF móvil.
- El PDF de Ver documento, Compartir e Imprimir/PDF ahora sale desde un solo motor `jsPDF`.
- El diseño del PDF móvil se alineó al formato corporativo premium del escritorio:
  - Logo y datos de empresa.
  - Número de factura, fecha y vencimiento.
  - Estado de factura.
  - Cliente, teléfono y dirección.
  - Tabla de partidas.
  - Notas, condiciones, totales, pagado y balance.
- Se eliminó `html2canvas` de `mobile.html` para evitar PDF blanco en iOS/PWA.
- Cache PWA actualizado a `v63`.

## Resultado

Un solo PDF para:

- Vista previa.
- Ver documento.
- Compartir.
- Imprimir/PDF.

Esto evita que la app muestre un diseño y comparta otro.
