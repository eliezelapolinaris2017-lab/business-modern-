# V93 — Nexus Desktop PWA para iPad

- Añade un acceso instalable independiente llamado **Nexus Desktop**.
- Usa `manifest-desktop.webmanifest` con `start_url: ./index.html?desktop=1`.
- Añade iconos Desktop propios para distinguirlo de Nexus Mobile.
- En `?desktop=1`, el viewport se fuerza a ancho Desktop para conservar sidebar y distribución completa en iPad.
- La versión Mobile existente (`mobile.html` + `manifest.webmanifest`) permanece intacta.
- No cambia login, Firebase, datos ni lógica de módulos.

## Instalar en iPad
1. Abrir la URL principal de Nexus en Safari agregando `?desktop=1` al final.
2. Compartir → **Añadir a pantalla de inicio**.
3. El icono aparecerá como **Nexus Desktop** y abrirá sin la barra normal de Safari.
