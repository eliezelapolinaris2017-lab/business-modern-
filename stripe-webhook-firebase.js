/**
 * Firebase Cloud Function - Stripe webhook para activar planes automáticamente.
 * Requiere: firebase-functions, firebase-admin, stripe.
 * Variables recomendadas:
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET
 *
 * En cada Stripe Payment Link / Checkout Session añade metadata:
 *   uid: UID del usuario Firebase
 *   plan: pro | business | enterprise
 */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Stripe = require('stripe');

admin.initializeApp();
const db = admin.firestore();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || functions.config().stripe.secret);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || functions.config().stripe.webhook_secret;

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  let event;
  try {
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error('Stripe signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const uid = session.metadata && session.metadata.uid;
      const plan = session.metadata && session.metadata.plan;
      if (uid && plan) {
        await activatePlan(uid, plan, {
          stripeCustomerId: session.customer || '',
          stripeSubscriptionId: session.subscription || '',
          stripeSessionId: session.id,
          source: 'stripe_checkout'
        });
      }
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'invoice.payment_succeeded') {
      const object = event.data.object;
      const subscriptionId = object.subscription || object.id || '';
      const customerId = object.customer || '';
      const userSnap = await db.collection('users').where('stripeCustomerId','==',customerId).limit(1).get();
      if (!userSnap.empty) {
        const ref = userSnap.docs[0].ref;
        await ref.set({ planStatus:'active', stripeSubscriptionId:subscriptionId, planUpdatedAt:admin.firestore.FieldValue.serverTimestamp() }, { merge:true });
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const userSnap = await db.collection('users').where('stripeCustomerId','==',sub.customer).limit(1).get();
      if (!userSnap.empty) {
        await userSnap.docs[0].ref.set({ plan:'free', planStatus:'canceled', stripeSubscriptionId:'', planUpdatedAt:admin.firestore.FieldValue.serverTimestamp() }, { merge:true });
      }
    }

    res.json({ received:true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    res.status(500).send('Webhook processing failed');
  }
});

async function activatePlan(uid, plan, extra = {}) {
  const userRef = db.collection('users').doc(uid);
  await userRef.set({
    plan,
    planStatus:'active',
    pendingPlan:'',
    pendingPlanStatus:'approved',
    planUpdatedAt:admin.firestore.FieldValue.serverTimestamp(),
    ...extra
  }, { merge:true });

  const pending = await userRef.collection('planRequests').where('planId','==',plan).where('status','==','pending').get();
  const batch = db.batch();
  pending.docs.forEach(d => batch.update(d.ref, { status:'activated', activatedAt:admin.firestore.FieldValue.serverTimestamp(), updatedAt:admin.firestore.FieldValue.serverTimestamp(), source:extra.source || 'manual' }));
  await batch.commit();
}
