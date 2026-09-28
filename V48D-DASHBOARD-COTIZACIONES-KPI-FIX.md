# V48D — Dashboard Cotizaciones KPI Fix

## Corrección aplicada

El Dashboard ahora lee correctamente la colección `quotes` y registra las cotizaciones en los KPI principales.

## KPIs añadidos / corregidos

- Cotizaciones totales.
- Cotizaciones del mes.
- Cotizaciones abiertas.
- Cotizaciones aprobadas.
- Potencial de cotizaciones.
- Conversión de cotizaciones.

## Mejoras adicionales

- El resumen diario ahora muestra cotizaciones abiertas.
- El Centro de Control muestra potencial de cotizaciones.
- Las alertas muestran cotizaciones abiertas, aprobadas sin facturar y vencidas.
- Se corrigió la prioridad del estado `Convertida` cuando una cotización ya fue pasada a factura o servicio.
- Se actualizó el cache busting de `index.html` a `v48d`.

## Resultado

Cuando se crea, edita, aprueba o convierte una cotización, el Dashboard actualiza los indicadores automáticamente desde Firebase/local state.
