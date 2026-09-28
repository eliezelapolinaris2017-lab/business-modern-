# V48B — Corrección de edición de Cotizaciones Pro

## Problema corregido

El módulo de Cotizaciones Pro permitía crear, visualizar y convertir cotizaciones, pero la edición no estaba conectada de forma práctica al formulario profesional de cotizaciones.

## Qué se corrigió

- Botón **Editar** directo en cada cotización.
- Edición desde el mismo formulario profesional de Cotizaciones Pro.
- Banner visual indicando qué cotización se está editando.
- Botón **Actualizar cotización**.
- Botón **Cancelar edición**.
- Edición de partidas de cotización sin tocar JSON manualmente.
- Recalculo automático de subtotal, IVU y total al editar.
- Estados correctos para cotizaciones:
  - Borrador
  - Enviada
  - Aprobada
  - Rechazada
  - Convertida
  - Vencida
- Conserva cliente, activo, equipo, notas, términos y partidas existentes.

## Flujo recomendado

1. Entrar a **Cotizaciones Pro**.
2. Presionar **Editar** en la cotización.
3. Modificar datos o partidas.
4. Presionar **Actualizar cotización**.
5. Si no desea guardar, presionar **Cancelar edición**.

Este ajuste mantiene intacto el flujo: Cotización → Servicio → Factura.
