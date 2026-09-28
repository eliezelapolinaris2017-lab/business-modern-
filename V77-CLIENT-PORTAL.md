# V77 — Portal del Cliente

- Portal privado independiente en `portal.html`.
- Enlace secreto de 48 caracteres por cliente.
- Botón Portal en el módulo Clientes.
- Publicación sanitizada de facturas, cotizaciones, servicios y equipos del cliente seleccionado.
- Resumen de balance y acceso al calendario configurado.
- Diseño adaptable para escritorio y móvil.
- Reglas Firestore nuevas para lectura pública exclusivamente mediante token no predecible y escritura limitada al dueño del negocio.

## Implementación Firebase
Publica el archivo `firestore.rules` incluido para habilitar `clientPortals`.
