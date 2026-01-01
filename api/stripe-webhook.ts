import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Raw body is needed for Stripe signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const Stripe = (await import('stripe')).default;
    
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!stripeSecretKey || !webhookSecret) {
      console.error('Missing Stripe configuration');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const stripe = new Stripe(stripeSecretKey, { 
      apiVersion: '2023-10-16' as any 
    });
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get raw body for signature verification
    const rawBody = await getRawBody(req);
    const signature = req.headers['stripe-signature'] as string;

    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).json({ error: 'Invalid signature' });
    }

    console.log('Received Stripe event:', event.type);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id || session.metadata?.userId;
        
        if (userId) {
          console.log('Activating subscription for user:', userId);
          
          const { error } = await supabase
            .from('profiles')
            .upsert({
              user_id: userId,
              subscription_status: 'active',
              subscription_plan: 'pro',
              stripe_customer_id: session.customer as string,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'user_id',
            });

          if (error) {
            console.error('Error updating profile:', error);
          } else {
            console.log('Profile updated successfully');
          }
        }
        break;
      }

      case 'customer.subscription.deleted':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        // Find user by stripe_customer_id
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          const isActive = subscription.status === 'active' || subscription.status === 'trialing';
          
          await supabase
            .from('profiles')
            .update({
              subscription_status: isActive ? 'active' : 'inactive',
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', profile.user_id);
        }
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
}

