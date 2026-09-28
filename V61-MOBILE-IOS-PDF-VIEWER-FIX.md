# v61 Mobile iOS PDF Viewer Fix

Corrige el problema donde iOS PWA abría `about:blank` al intentar compartir o ver el PDF premium.

## Cambios

- Se elimina la navegación directa a `blob:` en iPhone/iPad PWA.
- El PDF premium se sigue generando con el mismo diseño de escritorio.
- Se abre un visor HTML seguro que contiene el PDF como data URL.
- Incluye botón Descargar dentro del visor.
- Si iOS no permite mostrar el PDF incrustado, el usuario puede descargarlo y compartirlo desde Archivos/Vista previa.
- Cache actualizado a `v61`.

## Nota técnica

Safari/iOS PWA bloquea o falla con `window.open(blobURL)`, mostrando `about:blank`. Esta versión evita ese flujo y usa un documento HTML intermedio.
