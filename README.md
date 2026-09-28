# Nexus Business PR — v58 Mobile Share Buttons Fix

Plataforma SaaS empresarial para servicios, cotizaciones, facturación, cobros, reportes y seguimiento postventa.

## V50
- Base limpia v48D.
- Seguimiento de mantenimientos cada 6 meses.
- Seguimiento de cotizaciones e instalaciones.
- Report Center filtrado por fechas.



## v51 Mobile Operations

Se añadió una versión móvil independiente para iPhone y iPad:

- Abrir `mobile.html`.
- Usa la misma cuenta Firebase y la misma data de clientes, facturas, cobros, servicios, cotizaciones y seguimientos.
- Dashboard móvil enfocado en facturación.
- Área de Seguimientos con mantenimientos estándar cada 6 meses.
- Nueva factura móvil con tipo de factura: Servicio, Mantenimiento, Instalación, Diagnóstico, Cotización u Otro.
- Historial compartido por cliente.
- Sync en tiempo real con `onSnapshot`.
- Service worker `sw.js` y `manifest.webmanifest` para experiencia tipo app en iPhone/iPad.

Para instalar en iPhone/iPad: abrir `mobile.html` en Safari, compartir y seleccionar “Añadir a pantalla de inicio”.

## v53 Nexus Mobile PWA

Esta versión convierte `mobile.html` en una PWA más completa para iPhone y iPad.

- Instalación desde Safari con “Añadir a pantalla de inicio”.
- Misma data Firebase del panel principal.
- Dashboard móvil enfocado en facturación.
- KPIs por tipo de factura: Servicio, Mantenimiento, Instalación, Diagnóstico, Cotización y Otro.
- Área de Seguimientos con mantenimiento estándar cada 6 meses.
- Historial compartido de facturas, cobros, servicios y seguimientos.
- Sync en tiempo real con `onSnapshot`.
- Service worker v53 con cache controlado y auto actualización.
- Botón “Buscar actualización” en la pestaña Sync.


## v54 Mobile PDF Desktop Match
- La vista móvil ahora genera el documento de factura con el mismo HTML/CSS del PDF premium de escritorio.
- Ver documento, Vista previa e Imprimir/PDF usan el diseño corporativo idéntico: logo, estado, cliente, tabla, totales, pagado y balance.
- Service Worker actualizado a `v54` para forzar actualización en iPhone/iPad.


## v55 Mobile Light UI Fix
- Mobile cambia a tema blanco estilo desktop.
- Se corrige el bug visual de barras blancas en Líneas de factura.
- Se elimina conflicto CSS entre `.invoice-line` del editor móvil y el separador del PDF.
- Formularios optimizados para Safari en iPhone/iPad.
- PWA cache actualizado a v55.


## v56 Mobile Client Create
- Añadir cliente desde móvil.
- Cliente nuevo queda disponible para facturas, seguimientos e historial.
- PWA cache v56.


## v57 Mobile PDF Share Fix
- El botón Compartir en móvil ahora genera y adjunta el PDF real de la factura.
- Mantiene fallback: si iOS/Safari no permite adjuntar archivos, descarga el PDF y muestra aviso.
- Usa el mismo diseño de factura de escritorio.


## v58 Mobile Buttons + PDF Share Fix
- Corrige contraste de botones Ver documento, Compartir y Pagada en móvil blanco.
- Compartir ya no cae a texto: intenta adjuntar PDF real y, si iOS/Safari bloquea el share sheet, descarga el PDF.
- Actualiza cache PWA a v58.


## v59 Mobile iOS PWA Share Freeze Fix

Corrige congelamiento del botón Compartir en iPhone/iPad PWA y mejora contraste de botones.


## v60 Mobile Premium PDF Share
- Compartir mantiene el PDF premium igual al desktop.
- En iOS PWA se evita el congelamiento abriendo el PDF premium en visor nativo.
- Cache PWA actualizado a v60.


## v61 Mobile iOS PDF Viewer Fix
- Corrige about:blank en iOS PWA.
- Mantiene PDF premium igual al desktop.
- Usa visor HTML seguro con descarga integrada para iPhone/iPad.
- Cache PWA actualizado a v61.


## v62 Mobile PDF Final Fix
- Se elimina la generación PDF por HTML oculto/html2canvas/jsPDF.html en móvil.
- El PDF móvil ahora se dibuja directamente con jsPDF, evitando páginas blancas en iPhone/iPad PWA.
- Compartir usa un archivo PDF real con contenido corporativo, no captura de pantalla ni PDF plano sin formato.
- Cache PWA actualizado a v62.


## v63 Mobile PDF One Engine Fix

La versión móvil usa un solo motor PDF directo con jsPDF para vista previa, ver documento, compartir e imprimir/PDF. Se eliminó html2canvas para evitar PDF blanco en iOS PWA.


## v64 Mobile Seguimiento Save Fix
- Corrección de guardado de Seguimiento móvil.
- Seguimiento automático desde factura de mantenimiento/instalación.
- Cache PWA v64.


## v65 Desktop Data & Actions Fix

- Restaurado/añadido centro Importar / Exportar en Configuración.
- Añadida Zona peligrosa para borrar toda la data con backup y doble confirmación.
- Facturación Desktop ahora tiene buscador por cliente, número de factura, servicio, estado y fecha.
- Dashboard con KPI accionables que llevan directo al módulo y filtro correcto.
- No se eliminaron módulos ni funciones existentes.
- Cache PWA v65.


## V66 Module Search Center

- Buscador propio en clientes, cotizaciones, facturación, servicios, seguimientos y módulos operacionales.
- Filtros por fecha y estado donde aplica.
- No se eliminaron funciones existentes.
