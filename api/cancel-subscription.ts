import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

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
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!stripeSecretKey) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const { userId } = req.body || {};

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's stripe customer ID from profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile?.stripe_customer_id) {
      // No Stripe customer ID, just update the profile
      await supabase
        .from('profiles')
        .update({
          subscription_status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      return res.status(200).json({ message: 'Subscription cancelled' });
    }

    // Get active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'active',
    });

    // Cancel all active subscriptions (at period end)
    for (const subscription of subscriptions.data) {
      await stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: true,
      });
    }

    // Update profile
    await supabase
      .from('profiles')
      .update({
        subscription_status: 'cancelling',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    return res.status(200).json({ 
      message: 'Subscription will be cancelled at the end of the billing period' 
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to cancel subscription' 
    });
  }
}

