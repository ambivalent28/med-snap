import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check for Stripe secret key first
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY is missing');
      return res.status(500).json({ 
        error: 'Stripe secret key not configured. Add STRIPE_SECRET_KEY to Vercel environment variables.' 
      });
    }

    // Dynamic import Stripe to avoid initialization errors
    const Stripe = (await import('stripe')).default;
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16', // Use stable API version
    });

    const { priceId, userId } = req.body || {};

    if (!priceId) {
      return res.status(400).json({ error: 'Missing priceId in request body' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId in request body' });
    }

    // Get origin from request headers
    const origin = req.headers.origin || 
      (req.headers.host ? `https://${req.headers.host}` : 'https://medsnap.vercel.app');

    console.log('Creating checkout session:', { priceId, userId, origin });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard`,
      client_reference_id: userId,
      metadata: {
        userId,
      },
    });

    console.log('Checkout session created:', session.id);
    return res.status(200).json({ sessionId: session.id });
  } catch (error: unknown) {
    console.error('Checkout session error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ error: errorMessage });
  }
}
