# Transporte - Rutas y millaje

En la industria Transporte, el formulario de servicios incluye:

- Origen
- Destino
- Millas Google
- Tarifa por milla
- Cargo base
- Botón Abrir ruta

Uso:

1. Escribe origen y destino.
2. Pulsa Abrir ruta.
3. Google Maps abre la ruta.
4. Copia las millas que muestra Google Maps en Millas Google.
5. El sistema calcula: millas x tarifa + cargo base.
6. Guarda el servicio y factura normal.

La tarifa por milla y cargo base se configuran en Configuración cuando la industria activa es Transporte.

Nota: para leer millas automáticamente dentro del sistema hace falta integrar Google Maps Distance Matrix / Routes API con una API Key y facturación activa en Google Cloud. Esta versión deja el flujo seguro sin exponer llaves dentro del frontend.
