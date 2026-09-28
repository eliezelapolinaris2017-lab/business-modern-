# Retenciones con salida administrativa

Versión v43.

## Qué se corrigió

Las retenciones de nómina ya no se quedan como un descuento sin destino. Ahora cada retención puede indicar:

- Tipo de retención.
- Entidad o destino.
- Fecha límite.
- Estado: Pendiente, Pagada, Aplicada o Cancelada.
- Fecha de pago.
- Referencia.

## Flujo correcto

1. Se registra la nómina.
2. El empleado recibe el neto.
3. La retención queda registrada en el Centro de Retenciones.
4. Cuando se paga a la entidad correspondiente, se marca como pagada.
5. Nexus crea la salida en Flujo de Caja como pago de retención.

## Dónde verlo

- Nómina: tabla principal y Centro de Retenciones.
- Flujo de Caja: salida cuando se marca pagada.
- Reportes: nuevo reporte Retenciones.

## Nota contable

El flujo de caja de nómina mantiene el pago neto al empleado. Las retenciones se registran como obligación pendiente y solo salen de caja cuando se marcan como pagadas.
