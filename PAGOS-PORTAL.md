# Pagos desde Mi Oasis

El resumen muestra Pagar con ATH Móvil cuando el balance pendiente es positivo. Cada factura con saldo incluye la misma opción, con su importe y número visibles. Las facturas canceladas y balances en cero no muestran acciones de pago.

El destino ATH es el enlace aportado por el dueño de Oasis. Se abre sin añadir un monto al URL; el cliente escribe el importe en el proveedor. No se envían datos de tarjeta al portal ni se cambia el estado de la factura al pulsar el botón. Oasis confirma el ingreso y registra el pago en Nexus para que el balance publicado se actualice.

La configuración OASIS_PAYMENT_LINKS.card en portal-payments.js queda vacía hasta recibir un enlace Stripe de importe elegido por el cliente. No aparece un botón de tarjeta sin destino. La conexión Stripe disponible requería reautenticación, por lo que no se consultaron ni crearon enlaces desde la cuenta. No se crean cargos ni productos ni se cambian ajustes de Stripe.

Los enlaces configurados se validan para usar HTTPS y los dominios de los proveedores. El destino predeterminado de Oasis se limita a negocios con Oasis en su nombre; otros negocios necesitan configuración explícita. Una futura conciliación automática requiere un backend con notificaciones verificadas del proveedor y conciliación por factura; no puede basarse en regresar a la página o en pulsar un enlace.

Validación: tests/portal-payments.cjs, tests/client-portal.cjs, tests/portal-document-viewer.cjs y tests/portal-sync.cjs; revisión en navegador de una factura simulada sin efectuar pagos.
