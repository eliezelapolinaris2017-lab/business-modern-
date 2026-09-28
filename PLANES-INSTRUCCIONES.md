# Nexus Business PR - Flujo de planes corregido

## Qué cambió

- El cliente ya no puede cambiar su plan desde Configuración.
- El botón de planes ahora crea una solicitud pendiente.
- Si el plan tiene enlace de pago en `payment-links.js`, se abre el enlace y se registra la solicitud.
- El dueño recibe un borrador de notificación por email usando `mailto:`.
- Se añadió `admin.html` para activar planes manualmente después de confirmar pago.
- Se añadió `stripe-webhook-firebase.js` como base para activación automática con Stripe.

## Archivos nuevos o cambiados

- `app.js`
- `styles.css`
- `payment-links.js`
- `firestore.rules`
- `admin.html`
- `admin.js`
- `stripe-webhook-firebase.js`
- `PLANES-INSTRUCCIONES.md`

## Configurar enlaces de pago

Edita `payment-links.js`:

```js
window.NEXUS_OWNER_EMAIL = "tu-email@dominio.com";
window.NEXUS_PAYMENT_LINKS = {
  pro: "TU_LINK_STRIPE_PRO",
  business: "TU_LINK_STRIPE_BUSINESS",
  enterprise: "TU_LINK_ENTERPRISE"
};
```

## Activación manual

1. El cliente entra a Planes.
2. Presiona `Solicitar / pagar`.
3. Se crea una solicitud pendiente.
4. Tú confirmas el pago en Stripe, ATH, PayPal o la plataforma que uses.
5. Abres `admin.html`.
6. Presionas `Activar plan`.

## Seguridad en Firebase

Publica las reglas nuevas de `firestore.rules`.

Importante: para usar `admin.html`, tu usuario debe tener correo exacto `nexustoolspr@gmail.com` en Firebase Authentication. Ya no depende de custom claims.

## Activación automática con Stripe

Usa `stripe-webhook-firebase.js` en Cloud Functions.

Cada Stripe Payment Link o Checkout Session debe enviar metadata:

```txt
uid = UID del usuario Firebase
plan = pro | business | enterprise
```

Eventos recomendados:

- `checkout.session.completed`
- `customer.subscription.updated`
- `invoice.payment_succeeded`
- `customer.subscription.deleted`

## Decisión ejecutiva recomendada

Mantén activo el modo manual ahora mismo. Cuando Stripe esté conectado con metadata y webhook, entonces activas el automático. Así evitas que un cliente se suba de plan sin pago real.
