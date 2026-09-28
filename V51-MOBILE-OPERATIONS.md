# v51 Mobile Operations

Base: v50 Seguimiento + Reportes por Fechas.

## Incluye

- `mobile.html`: entrada móvil para iPhone/iPad.
- `mobile.js`: app móvil conectada a Firebase.
- `mobile.css`: UI 100% móvil con safe areas para iOS.
- `manifest.webmanifest`: instalación tipo PWA.
- `sw.js`: cache y auto actualización básica.

## Funciones móviles

- Dashboard de facturación solamente.
- Facturas recientes.
- Crear factura móvil con tipo de factura.
- Clientes usando la misma data del panel principal.
- Seguimientos con mantenimiento estándar cada 6 meses.
- Historial compartido de facturas, cobros, servicios y seguimientos.
- Sync en tiempo real con Firestore.

## Data compartida

Usa las mismas colecciones bajo `users/{uid}`:

- clients
- invoices
- payments
- services
- quotes
- followups
- assets

No se creó una base de datos paralela.
