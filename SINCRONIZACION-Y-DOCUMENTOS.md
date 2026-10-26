# Sincronización y navegación de documentos

Los cambios recibidos en Nexus se agrupan durante 400 ms sin reiniciar continuamente el temporizador. Se identifican los clientes afectados por cambios de facturas, pagos, equipos, servicios y documentos, incluyendo movimientos y eliminaciones. Se publican hasta cuatro clientes en paralelo, con una sola publicación por cliente dentro de cada sesión. Los cambios ocurridos durante una escritura quedan en cola para la siguiente publicación. Los fallos transitorios se reintentan hasta tres veces adicionales.

Las colecciones deben terminar su carga inicial antes de publicar. El cambio de cuenta cancela el trabajo pendiente. La actualización se programa antes de dibujar la interfaz para que un error de presentación no impida publicar. Tanto escritorio como móvil usan el mismo planificador. La propagación depende de la conexión y de que Nexus siga abierto; esta versión no añade un proceso de servidor.

Los documentos se abren en un visor dentro de la aplicación. El encabezado ofrece Volver a Mi Oasis e Imprimir / Guardar PDF. No se crea una ventana emergente. Volver conserva el portal y restaura el foco. El contenido se imprime desde su marco; los controles no forman parte de la factura. Los originales publicados siguen usando su HTML original. El marco bloquea scripts y navegación de nivel superior.

Validación: tests/portal-sync.cjs, tests/portal-document-viewer.cjs (requiere jsdom), tests/client-portal.cjs, tests/portal-routing.cjs y tests/portal-access-state.cjs. Las pruebas cubren cambios durante escrituras, pagos, errores temporales, aislamiento de cuenta, conservación de documentos y navegación de regreso. La impresión nativa en iPhone/iPad requiere prueba en el dispositivo.
