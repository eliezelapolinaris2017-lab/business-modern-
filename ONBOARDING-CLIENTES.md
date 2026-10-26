# Onboarding del portal de clientes

El alta muestra una pantalla por paso: cuenta, correo, teléfono y apertura del expediente. La invitación viaja con el enlace y se conserva durante el proceso; no se muestra un campo técnico de vinculación en el asistente. Las cuentas existentes inician sesión sin repetir el alta. Al volver del correo, el asistente consulta el estado verificado y continúa en el paso pendiente.

El acceso anterior por código queda en una sección secundaria plegada para cuentas sin sesión. Los enlaces con documento seleccionado conservan su apertura directa. La sesión de cliente permanece separada de la administración.

La verificación por SMS se solicita solamente al pulsar Recibir código, y mantiene la comprobación de seguridad de Firebase. Después de confirmar el código, el sistema vincula el expediente automáticamente usando las mismas reglas de identidad. Las reglas de Firebase no cambian en esta versión.

Si el envío del correo falla después de crear la cuenta, el asistente conserva la sesión y ofrece reenviar la verificación. Los errores de red permiten reintentar. Las consultas de recuperación tienen límite de espera y la apertura del expediente limpia su estado al terminar, con error recuperable si tarda más de 12 segundos.

## Validación

- node tests/client-portal.cjs
- node tests/portal-routing.cjs
- node tests/portal-access-state.cjs
- NODE_PATH=<directorio que contiene jsdom> node tests/portal-onboarding.cjs

La prueba de onboarding usa jsdom con servicios de Firebase simulados: no envía correos ni SMS ni crea cuentas reales. Verifica reanudación tras correo confirmado, pantallas separadas, confirmación SMS y vinculación, cuentas ya vinculadas, fallos de correo después del alta y recuperación de red. La prueba de acceso cubre tiempos de espera, finalización y pérdida de permisos. Se revisó el formulario real en navegador; la entrega de SMS se valida desde el dispositivo del cliente.
