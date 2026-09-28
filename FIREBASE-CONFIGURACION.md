# Firebase Configuración — Nexus Business PR v48

## Archivo principal
La configuración visible de Firebase está en:

```txt
firebase-config.js
```

Ese archivo exporta:

```js
export const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

## Dónde se usa
Los módulos principales ahora importan la configuración desde un solo punto:

```js
import { firebaseConfig } from "./firebase-config.js";
```

Archivos conectados:

- `app.js`
- `admin.js`

## Reglas Firestore
El archivo de reglas está en:

```txt
firestore.rules
```

Incluye la colección nueva:

```txt
quotes
```

Colecciones permitidas en datos del usuario:

```txt
clients
services
quotes
team
assets
suppliers
supplierPayments
payroll
payrollRetentions
purchases
invoices
payments
cashflow
```

## Pasos para publicar

1. En Firebase Console activa Authentication con Email/Password.
2. Publica `firestore.rules` en Firestore Rules.
3. Sube todos los archivos a GitHub Pages o hosting.
4. Si cambias de proyecto Firebase, edita solamente `firebase-config.js`.
5. Para administración, el email autorizado sigue siendo `nexustoolspr@gmail.com` en `admin.js` y en `firestore.rules`.

## Nota ejecutiva
Antes la configuración estaba incrustada dentro de `app.js` y `admin.js`. Ahora queda separada, visible y fácil de mantener.
