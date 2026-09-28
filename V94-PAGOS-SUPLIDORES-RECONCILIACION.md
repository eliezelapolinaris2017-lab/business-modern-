# V94 — Reconciliación Compras / Pagos a suplidores

- Los pagos generales se aplican automáticamente a las compras pendientes más antiguas del mismo suplidor.
- No se crean pagos duplicados ni movimientos adicionales de caja.
- Las aplicaciones se guardan dentro del pago general como `allocations`.
- `purchasePaid`, balance y estado de Compras reconocen pagos directos y aplicaciones de pagos generales.
- Botón “Reconciliar pagos generales existentes” para corregir registros anteriores.
- El selector de compra se filtra por el suplidor seleccionado.
