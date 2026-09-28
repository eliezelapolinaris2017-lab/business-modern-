# Módulo de Suscripciones Manual

## Dónde está el módulo

El módulo de suscriptores está en:

admin.html

No está dentro del panel del cliente. El cliente solo solicita el cambio de plan desde la pantalla “Planes”.

## Flujo manual recomendado

1. Cliente entra a Planes.
2. Cliente solicita Básico, Pro, Premium o Enterprise.
3. Se crea una solicitud pendiente en Firestore:
   users/{uid}/planRequests/{requestId}
4. El administrador entra a admin.html.
5. Verifica el pago por ATH Móvil, PayPal, transferencia, efectivo o la plataforma que use.
6. Presiona “Activar plan”.
7. El sistema guarda:
   - plan
   - planStatus
   - planExpiresAt
   - lastPaymentMethod
   - lastPaymentAmount
   - lastPaymentDate

## Pantalla de suscriptores

En admin.html ahora puedes ver:

- Cliente
- Email
- Plan actual
- Estado
- Fecha de vencimiento
- Último pago
- Acciones

Acciones disponibles:

- Editar plan
- Marcar vencido
- Cancelar plan

## Importante sobre permisos Firebase

Para que admin.html pueda ver todos los usuarios, el email administrador debe tener email administrador nexustoolspr@gmail.com.

Esto se asigna desde Firebase Admin SDK o Cloud Functions. Si no lo configuras, Firebase bloqueará el acceso aunque puedas iniciar sesión.

## Recomendación operacional

Usa el modo manual mientras validas clientes reales. Luego puedes activar Stripe automático con webhook cuando el negocio esté listo para cobrar tarjeta sin intervención.
