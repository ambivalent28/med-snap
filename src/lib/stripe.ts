import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('Stripe publishable key is missing. Add VITE_STRIPE_PUBLISHABLE_KEY to your .env file.');
}

export const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

export async function createCheckoutSession(priceId: string, userId: string) {
  // This would typically call a backend API endpoint
  // For now, we'll create a placeholder that would need to be implemented
  // with a Supabase Edge Function or separate backend
  
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      priceId,
      userId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  const { sessionId } = await response.json();
  return sessionId;
}

// Price IDs - these should match your Stripe product/price IDs
export const PRICE_IDS = {
  monthly: import.meta.env.VITE_STRIPE_PRICE_ID_MONTHLY || 'price_monthly',
  yearly: import.meta.env.VITE_STRIPE_PRICE_ID_YEARLY || 'price_yearly',
};

