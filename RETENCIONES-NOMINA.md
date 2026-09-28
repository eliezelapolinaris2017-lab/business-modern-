# Corrección de Retenciones de Nómina

Versión: v40-retenciones-nomina

## Qué se corrigió

Las retenciones de empleados ahora quedan visibles y separadas en el sistema.

## Nómina

El formulario de nómina ahora calcula:

- Bruto
- Bonos / comisiones
- Retenciones
- Adelantos
- Otros descuentos
- Neto pagado

Fórmula:

```txt
Neto = Bruto + Bonos - Retenciones - Adelantos - Otros descuentos
```

## Flujo de caja

El flujo de caja registra solamente el neto pagado como gasto real.

Ejemplo:

```txt
Bruto: $500
Retenciones: $50
Neto pagado: $450
Caja: -$450
```

La retención queda documentada en la nómina y en la nota del flujo de caja, pero no se duplica como gasto adicional.

## Reporte de nómina

El reporte de nómina ahora incluye resumen de:

- Total bruto
- Total bonos / comisiones
- Total retenciones
- Total adelantos
- Total otros descuentos
- Total neto pagado

## Comprobante PDF

El comprobante de nómina ahora muestra:

- Retenciones
- Adelantos
- Otros descuentos
- Total descuentos
- Neto pagado

## Compatibilidad

Los registros viejos siguen funcionando. Si un registro viejo no tiene campo `retention`, se interpreta como `0`.
