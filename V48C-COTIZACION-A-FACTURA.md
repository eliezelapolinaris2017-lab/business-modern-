# V48C — Cotización a Factura Directa

## Qué cambió

Se añadió el flujo directo para convertir una cotización profesional en factura sin tener que crear primero un servicio.

## Nuevo botón

En el módulo **Cotizaciones Pro**, cada cotización disponible ahora muestra:

- Preview
- Editar
- Convertir a factura
- Crear servicio
- Borrar

## Flujo directo

1. Crear cotización.
2. Revisar o editar partidas.
3. Usar **Convertir a factura**.
4. El sistema crea una factura en **Facturación** con:
   - Cliente
   - Partidas
   - Subtotal
   - IVU
   - Total
   - Balance pendiente
   - Vencimiento automático a 15 días
5. La cotización queda marcada como convertida y conectada a la factura.

## Control anti duplicado

Si una cotización ya tiene factura, el sistema no crea otra duplicada. Te lleva directo a Facturación.

## Decisión operativa

Este flujo es ideal cuando el cliente aprueba la cotización y se quiere facturar de inmediato.

El flujo anterior sigue disponible:

Cotización → Crear servicio → Facturar servicio
