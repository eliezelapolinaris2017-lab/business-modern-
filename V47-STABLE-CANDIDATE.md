# Nexus Business PR v47 Stable Candidate

## Cambios principales

- Añadido campo **Seguro Social** en Equipo / Empleados.
- El Seguro Social se guarda con formato administrativo (`123-45-6789`).
- En tablas, búsquedas y vistas públicas se muestra protegido: `***-**-1234`.
- Búsqueda global permite localizar empleados por los últimos 4 dígitos del Seguro Social.
- Se mantiene información existente de empleado: identificación personal, licencia de conducir y vehículo asignado.

## Política de datos sensibles

- Seguro Social, licencias e identificaciones no deben exponerse completos en tablas, reportes o vistas rápidas.
- El número completo solo debe editarse desde el formulario administrativo.
- En futuras vistas PDF o portales, se debe usar siempre formato enmascarado.

## Estado

Base preparada como Stable Candidate para QA general antes de añadir nuevas funciones grandes.
