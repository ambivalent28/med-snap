import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

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
    // Check for Stripe secret key
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is missing from environment variables');
      return res.status(500).json({ 
        error: 'Server configuration error: Stripe secret key not found. Please check Vercel environment variables.' 
      });
    }

    const { priceId, userId } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: 'Missing priceId in request body' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId in request body' });
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    });

    // Get origin from request headers
    const origin = req.headers.origin || req.headers.host 
      ? `https://${req.headers.host}` 
      : 'https://medsnap.app';

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

    return res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe checkout session error:', error);
    
    // Provide more detailed error information
    if (error instanceof Stripe.errors.StripeError) {
      return res.status(500).json({ 
        error: `Stripe error: ${error.message}` 
      });
    }
    
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to create checkout session' 
    });
  }
}
