# V49 — Customer Success Center / Seguimiento

Incluye seguimiento profesional para:

- Mantenimientos preventivos cada 6 meses.
- Cotizaciones con seguimiento comercial automático.
- Instalaciones de aires con post-instalación y próximo mantenimiento.

## Flujo

1. Se completa un mantenimiento o instalación.
2. Nexus genera seguimiento automático a 180 días.
3. El Dashboard muestra mantenimientos próximos, vencidos y seguimientos abiertos.
4. El usuario puede enviar recordatorio por WhatsApp.
5. Al completar un mantenimiento, se crea el próximo ciclo de 6 meses.

## Colección Firebase

`users/{uid}/followups`

Campos principales: kind, clientId, clientName, assetId, assetName, dueDate, status, frequencyMonths, relatedServiceId, relatedQuoteId, notes.
