# Servicios: centro de mando

Crear la hoja desde Servicios con cliente, empleado, equipo, fecha/hora, dirección, instrucciones y partidas. Guardar y usar **Hoja / Orden PDF** para descargar o imprimir la orden. El PDF usa la marca configurada y contiene alcance, contacto, acceso y espacio para el cierre; no incluye importes comerciales.

Compartir el PDF con el empleado por el canal habitual. **Iniciar** marca el trabajo en proceso y requiere empleado asignado. Cuando el empleado entregue su informe, administración usa **Cerrar servicio** para registrar fecha, trabajo realizado, materiales y persona que recibió el servicio. También puede despacharse al nuevo portal mediante WhatsApp al empleado; ver EMPLEADOS-PORTAL.md. El cierre manual desde administración continúa disponible.

**Facturar** se habilita en servicios completados. Conserva cliente, partidas, detalle técnico, informe de cierre y aplica el IVU configurado. Una transacción de Firestore crea la factura y marca el servicio facturado; un ID determinista evita facturas duplicadas por clics o dispositivos concurrentes. Los servicios antiguos con factura conservan el enlace existente. Duplicar un servicio reinicia su cierre y sus referencias financieras.

Validación: `node tests/service-workflow.cjs`, comprobación de sintaxis de app.js y comprobación de diferencias. También se verificó en DOM simulado el diálogo, el cierre, escape de contenido y generación real de PDF de varias páginas con jsPDF. No se realizaron operaciones en datos de clientes reales ni validación visual en un navegador autenticado.
