# V79 — Portal del Cliente en tiempo real

## Sincronización automática

Los portales activos se actualizan automáticamente cuando cambia:

- Cliente
- Servicio
- Cotización
- Factura
- Pago
- Activo o equipo registrado
- Configuración del negocio o calendario

La sincronización funciona para altas, ediciones, eliminaciones y cambios de estado recibidos mediante Firebase desde cualquier dispositivo.

## Protección

- Solo se sincronizan clientes con portal previamente habilitado.
- La actualización automática no abre ventanas, no copia enlaces y no interrumpe al usuario.
- Se agrupan cambios cercanos para evitar escrituras repetidas.
- El botón Portal continúa disponible para abrir y copiar el enlace manualmente.
