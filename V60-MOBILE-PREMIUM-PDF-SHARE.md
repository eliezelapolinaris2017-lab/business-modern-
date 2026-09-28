# V60 Mobile Premium PDF Share

Corrige el flujo de compartir PDF en iPhone/iPad PWA sin degradar el documento.

## Cambios
- El botón Compartir vuelve a generar el PDF premium con el mismo diseño desktop.
- En iOS PWA no usa `navigator.share({ files })` para evitar congelamiento.
- En iPhone/iPad abre el PDF premium en visor nativo para compartir desde el menú del sistema.
- En navegador compatible usa Web Share con archivo PDF.
- Fallback: abre el PDF premium o lo descarga.
- Cache actualizado a v60.
