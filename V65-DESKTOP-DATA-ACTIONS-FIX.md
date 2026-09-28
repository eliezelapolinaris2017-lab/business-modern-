# V65 — Desktop Data & Actions Fix

Base: v64 Mobile Seguimiento Save Fix.

## Política aplicada
- No se eliminaron módulos ni funciones existentes.
- Se añadieron funciones nuevas sin borrar componentes previos.
- Las acciones destructivas requieren confirmación explícita.

## Nuevo: Configuración → Importar / Exportar
- Exportar backup JSON completo.
- Importar JSON con vista previa por colección.
- Mantiene soporte para colecciones principales:
  - clientes
  - servicios
  - cotizaciones
  - seguimientos
  - facturas
  - cobros
  - compras
  - nómina
  - flujo de caja

## Nuevo: Zona peligrosa
- Botón: Borrar toda la data de la app.
- Descarga backup antes de borrar.
- Requiere doble confirmación y escribir `BORRAR`.
- Borra datos de Firebase del usuario, no borra el código ni el hosting.

## Facturación Desktop
- Buscador por nombre de cliente.
- Buscador por número de factura.
- También busca por servicio, cotización, fecha y estado.
- Filtros rápidos:
  - Todas
  - Por cobrar
  - Vencidas
  - Pendientes
  - Parciales
  - Pagadas
  - Canceladas

## Dashboard accionable
- Los KPI ahora son botones.
- Balance por cobrar abre Facturación filtrada por facturas con balance.
- Facturado abre Facturación.
- Cobrado abre Cobros.
- Clientes abre Clientes.
- Cotizaciones abre Cotizaciones.
- Caja neta abre Flujo de caja.
- Financial Hub “Debes cobrar” abre Facturación filtrada en Por cobrar.

## PWA
- Cache actualizado a v65.
