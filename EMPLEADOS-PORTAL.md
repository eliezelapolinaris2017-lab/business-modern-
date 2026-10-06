# Portal de empleados

## Uso

1. En Técnicos/Equipo, registrar el número de teléfono del empleado. **Portal / PIN** crea su acceso y muestra el PIN de seis dígitos. Entregar el PIN personalmente; el enlace no contiene el PIN.
2. En Servicios, asignar el empleado y guardar el trabajo. **WhatsApp al empleado** prepara el enlace de la orden en el chat de su número; el usuario confirma el envío en WhatsApp.
3. El empleado abre el enlace, introduce el PIN y ve únicamente las órdenes despachadas a su acceso: cliente, teléfono, ubicación, ruta, equipo, instrucciones y alcance. No se exportan importes, nómina ni información personal del empleado.
4. Puede iniciar, reportar un problema o completar con informe, materiales, persona que recibió y hasta tres fotos JPEG comprimidas.
5. Mientras la cuenta administrativa esté abierta, Nexus recibe el reporte y actualiza el servicio original. Si la oficina está cerrada, el reporte queda guardado y se procesa al volver a abrir Nexus. No hay ejecución de backend independiente: la sincronización administrativa requiere la sesión de Nexus.
6. Al completar, se habilita Facturar y permanecen las protecciones del flujo anterior. Evidencias accesibles mediante **Ver evidencias**.
7. En Android puede instalarse como PWA; en iPhone, Compartir → Añadir a pantalla de inicio. El enlace se recuerda en el dispositivo, el PIN no. Se necesita conexión para acceder y enviar reportes.

## Arquitectura y acceso

Reutiliza Firebase Email/Password y las reglas existentes de `clientPortals`. Cada empleado tiene una cuenta aislada cuya contraseña combina un secreto aleatorio de 192 bits y su PIN. No se utiliza la cuenta del propietario ni se persiste la autenticación del empleado.

Los documentos compartidos contienen únicamente ciphertext AES-GCM. La clave se deriva del secreto del enlace más el PIN usando PBKDF2/SHA-256 con 210,000 iteraciones. El contexto autenticado separa la bandeja de órdenes de cada respuesta. El documento de órdenes pertenece al propietario y el documento de respuesta al empleado; ninguno puede escribir en el documento del otro. El vínculo por asignación impide aplicar un cierre antiguo a un servicio reasignado. El cierre transaccional del empleado impide sobrescribir una respuesta terminal desde otro dispositivo.

La sincronización verifica empleado activo, portal vigente, autor de la respuesta y asignación vigente. Solo copia estados operativos, informe y evidencias al servicio original. Las partidas e importes permanecen bajo control administrativo. El acceso puede desactivarse en Portal / PIN y el siguiente acceso genera credenciales nuevas.

No requiere relajar reglas de Firebase, publicar funciones ni añadir servicios externos. Las evidencias se conservan en el servicio y en la respuesta cifrada; no se copian al índice de órdenes para mantenerlo dentro del límite de Firestore. La bandeja incluye los trabajos activos y los 30 cierres más recientes.

## Validación

- `node tests/service-workflow.cjs`: bloqueo de facturación previa, duplicados, IVA/IVU y transferencia de partidas.
- `node tests/employee-security.cjs`: cifrado, PIN incorrecto, separación de contextos, asignación, validación de informes/evidencia y aislamiento financiero.
- Integración en DOM simulado: despacho, autenticación PIN aislada, inicio, problema, cierre y sincronización al servicio original.
- Prueba real con cuentas/documentos temporales en Firebase: autenticación, lectura de ciphertext y rechazo de escrituras cruzadas. Cuentas y documentos de prueba eliminados al finalizar.
- Sintaxis de JavaScript y `git diff --check`.

## Publicación anterior

El commit `b5ecfc95e6aaa6a6a64b1e3ce631f294d0b70909` compiló correctamente. El run 37508979852 quedó esperando en el job deploy del entorno github-pages. Las políticas públicas consultadas permiten la rama main; no hay temporizador ni revisores configurados en pending_deployments. No se atribuye el bloqueo al código. Posteriormente el propietario revirtió el PR #4 por la espera. El run original fue cancelado y la reversión 0d467a43 se publicó correctamente. El propietario confirmó que la reversión era solo por la espera, por lo que este cambio reincorpora el flujo de Servicios junto con el portal y comprueba una nueva publicación.
