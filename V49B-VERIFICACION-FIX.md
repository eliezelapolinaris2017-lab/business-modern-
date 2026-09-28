# V49B — Verificación y Fix de Seguimiento

Correcciones aplicadas:

- Se corrigió el manejo de IDs al cargar documentos desde Firestore.
- Se eliminó el riesgo de clonar un `id` viejo al completar seguimientos recurrentes.
- El próximo mantenimiento ahora calcula 6 meses reales, no solo 180 días aproximados.
- Se reforzó la edición de Seguimiento con campos propios.
- Cache actualizado a v49b.
- `node --check` validado para app.js y admin.js.
