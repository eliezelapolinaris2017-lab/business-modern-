# V81 — Edición completa de facturas pagadas

- Las facturas pagadas, parciales y pendientes pueden editarse completamente.
- Permite cambiar número, fechas, cliente, título, partidas, cantidades, precios, IVU, notas y términos.
- El subtotal, IVU, total, balance y estado se recalculan automáticamente.
- Los cobros ya registrados se conservan y siguen vinculados a la factura.
- Si el nuevo total es mayor que lo pagado, la factura pasa a Parcial.
- Si el total continúa cubierto por los pagos, permanece Pagada.
- Se corrigió el cálculo de pagos para aceptar tanto el objeto como el ID de factura.
- No se modificaron login, Firebase, portal, móvil ni otros módulos.
