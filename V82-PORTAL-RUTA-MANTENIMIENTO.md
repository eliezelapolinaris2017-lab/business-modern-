# V82 — Portal con ruta limpia y mantenimiento automático

- Nueva ruta pública: `/portal/`.
- Se conserva `portal.html` por compatibilidad con enlaces anteriores.
- Corrige el nombre del campo de activos: `nextMaintenanceDate`.
- Publica los mantenimientos automáticos guardados en Seguimientos.
- El portal selecciona el próximo mantenimiento vigente entre Seguimientos y Activos.
- Los portales habilitados se sincronizan silenciosamente cuando cambian clientes, servicios, cotizaciones, seguimientos, facturas, pagos o activos.
