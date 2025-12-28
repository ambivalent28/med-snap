import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePublishableKey) {
    console.warn('Stripe publishable key is missing.');
    return Promise.resolve(null);
  }
  
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  
  return stripePromise;
}

export const PRICE_IDS = {
  monthly: import.meta.env.VITE_STRIPE_PRICE_ID_MONTHLY || '',
  yearly: import.meta.env.VITE_STRIPE_PRICE_ID_YEARLY || '',
} as const;

export function isStripeConfigured(): boolean {
  return !!(stripePublishableKey && PRICE_IDS.monthly && PRICE_IDS.yearly);
}

export async function createCheckoutSession(priceId: string, userId: string): Promise<string> {
  const apiUrl = import.meta.env.VITE_API_URL || '/api';
  const response = await fetch(`${apiUrl}/create-checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId, userId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || 'Failed to create checkout session');
  }

  const { sessionId } = await response.json();
  return sessionId;
}

export async function redirectToCheckout(sessionId: string): Promise<void> {
  const stripe = await getStripe();
  
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const result = await (stripe as Stripe & { 
    redirectToCheckout: (opts: { sessionId: string }) => Promise<{ error?: { message: string } }> 
  }).redirectToCheckout({ sessionId });
  
  if (result.error) {
    throw new Error(result.error.message);
  }
}
