import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any,
});

export const STRIPE_PRICES = {
  STARTER: process.env.STRIPE_STARTER_PRICE_ID!,
  PRO: process.env.STRIPE_PRO_PRICE_ID!,
};

export const createCheckoutSession = async (
  customerId: string,
  priceId: string,
  email: string
) => {
  return stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/pricing`,
    subscription_data: {
      trial_settings: {
        trial_period_days: 14,
      },
    },
  });
};

export const getOrCreateCustomer = async (email: string) => {
  const customers = await stripe.customers.list({ email, limit: 1 });
  if (customers.data.length > 0) {
    return customers.data[0];
  }
  return stripe.customers.create({ email });
};

export const cancelSubscription = async (subscriptionId: string) => {
  return stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
};

export const getStripeWebhook = () => stripe;
