# v62 Mobile PDF Final Fix

Corrección definitiva para PDF blanco en iPhone/iPad PWA.

## Qué cambió

- Se reemplazó el generador móvil basado en HTML oculto por un generador directo con jsPDF.
- El PDF ya no depende de `doc.html()`, `html2canvas`, `object`, `iframe` ni `blob` renderizado por Safari.
- El archivo compartido contiene contenido real dibujado en PDF: encabezado, logo, cliente, estado, tabla, totales, notas y términos.
- Se mantiene diseño corporativo similar al desktop sin congelar la PWA.
- `navigator.share({ files })` se usa solo con un PDF ya generado y validado.
- Si compartir falla, se descarga el PDF como fallback.

## Resultado esperado

- WhatsApp/Mail/Archivos reciben un PDF con contenido visible.
- No más páginas blancas.
- No más `about:blank` como flujo principal.
- Cache actualizado a `v62`.
