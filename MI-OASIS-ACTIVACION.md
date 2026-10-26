# Mi Oasis: activación de cuentas

Cambio para el portal existente de Nexus. Email/Password, Phone, dominio y regiones SMS y publicación de reglas confirmados por el usuario el 26 de octubre de 2026. Conserva el negocio y logo configurados en cada expediente; no impone Oasis a otros negocios de la suite.

## Procedimiento de activación y validación

1. En Firebase Authentication habilitar Email/Password y Phone. Configurar SMS, política de regiones para Puerto Rico/EE. UU., facturación y dominios autorizados del portal. Usar teléfonos de prueba durante la validación.
2. Publicar firestore.rules en el proyecto Firebase existente. No basta con guardar este archivo en GitHub.
3. Sincronizar los portales desde la administración para añadir identityPhone e identityEmail. El teléfono debe ser correcto y el email debe coincidir con el usado al registrarse, si ya figura en el cliente.
4. Validar en un entorno de prueba: alta, email verificado, SMS, coincidencia de identidad, rechazo de otro cliente, concurrencia al reclamar, inicio y cierre de sesión, recuperación de contraseña y revocación del portal. Probar reglas con Firebase Emulator antes de producción.
5. Publicar frontend después de activar proveedores y reglas. Probar dispositivos iPhone y Android.

## Comportamiento

La cuenta se vincula con una invitación privada, correo verificado y teléfono verificado mediante Firebase Authentication. No se buscan expedientes mediante consultas públicas por teléfono. Una transacción por lote vincula UID y expediente; ambos quedan asociados al identificador interno del cliente. Los datos de identidad se comparan también en reglas del servidor. La colección de portales deja de permitir listados.

Un expediente reclamado requiere autenticación del cliente vinculado o del dueño del negocio. Los enlaces antiguos siguen funcionando para expedientes que todavía no se han reclamado. Las respuestas de cotización respetan la misma protección.

La primera versión admite una cuenta y un expediente por UID; los múltiples equipos y ubicaciones del expediente se conservan. Varios expedientes separados, acceso familiar y cambio de teléfono requieren un flujo administrativo posterior. No borre cuentas vinculadas sin planificar su recuperación.

La configuración PWA conserva la marca genérica de Nexus hasta disponer del icono oficial de Oasis para esta aplicación. No se sustituye por un logo inventado. Las facturas conservan el motor existente: el original se usa cuando fue publicado; otros documentos se reconstruyen con los datos existentes. No se afirma que todos sean archivos PDF originales almacenados.

## Verificación realizada

Pruebas automatizadas de aislamiento de datos, historial, agenda, documentos y rutas; comprobación de sintaxis. Las pruebas de navegador y reglas requieren el entorno indicado arriba. Esta rama no activa SMS ni publica reglas de Firebase por sí sola.

Las sesiones de clientes usan una aplicación Firebase con nombre propio para no cambiar la sesión administrativa de Nexus. El botón Mi cuenta permite activar el registro desde un expediente abierto por enlace.
