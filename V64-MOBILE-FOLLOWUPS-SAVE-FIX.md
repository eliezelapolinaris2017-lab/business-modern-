# V64 Mobile Seguimiento Save Fix

Corrección enfocada en el módulo móvil de Seguimiento.

## Corregido
- Guardado manual de seguimientos con validación real.
- Mensaje visible cuando Firebase bloquea el guardado por reglas no publicadas.
- Actualización inmediata de la lista después de guardar.
- Completar seguimiento con próximo mantenimiento automático cada 6 meses.
- Creación automática de seguimiento cuando una factura móvil es de Mantenimiento o Instalación.
- Cache PWA actualizado a v64.

## Importante
Publicar `firestore.rules` si Firebase muestra permiso denegado. La colección requerida es `followups`.
