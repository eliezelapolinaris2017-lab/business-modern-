# V49C — Botones Fix

Corrección ejecutiva para botones que dejaban de responder después de re-render de Firebase.

## Qué se corrigió

- Se añadió delegación global de eventos para botones dinámicos.
- Botones de tablas siguen funcionando aunque Firebase regenere el DOM.
- Botones de cotizaciones: preview, editar, convertir a factura y crear servicio.
- Botones de seguimiento: completar, editar y borrar.
- Botones de servicios: facturar, duplicar, editar y borrar.
- Botones de reportes y navegación reforzados.
- Cache actualizado a `v49c`.

## Resultado

El sistema ya no depende únicamente de listeners amarrados al primer render. Los botones quedan blindados contra refrescos de datos.
