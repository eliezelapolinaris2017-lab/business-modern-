# V57 Mobile PDF Share Fix

Corrige el botón Compartir en Nexus Mobile.

## Cambios

- Genera PDF real desde la vista corporativa de factura.
- Usa Web Share API con `files` para compartir el PDF adjunto en iPhone/iPad cuando esté disponible.
- Fallback automático a descarga del PDF si el navegador no permite compartir archivos.
- Actualiza cache PWA a `v57`.

## Resultado

Al pulsar Compartir, ya no se envía solo texto: se comparte el documento PDF de factura.
