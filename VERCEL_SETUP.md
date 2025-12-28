# Vercel Deployment Setup

## API Endpoint

The checkout serverless function is already created at `api/create-checkout-session.ts`.

## Install Required Packages

Run this command to install the server-side dependencies:

```bash
npm install
```

This will install:
- `stripe` - Stripe server SDK
- `@vercel/node` - Vercel serverless function types
- `@types/node` - Node.js types

## Environment Variables in Vercel

Add these to your Vercel project settings (Settings → Environment Variables):

**Required:**
- `STRIPE_SECRET_KEY` - Your Stripe secret key (starts with `sk_`)
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key
- `VITE_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key (starts with `pk_`)
- `VITE_STRIPE_PRICE_ID_MONTHLY` - Monthly subscription price ID (starts with `price_`)
- `VITE_STRIPE_PRICE_ID_YEARLY` - Yearly subscription price ID (starts with `price_`)

## Deployment Steps

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy

The `api/create-checkout-session.ts` file will automatically be deployed as a serverless function.

## Testing

After deployment, test the checkout flow:
1. Click "Upgrade" in the dashboard
2. Select a plan
3. Click "Continue to Checkout"
4. You should be redirected to Stripe Checkout

If you see errors, check:
- Environment variables are set correctly
- Stripe keys are from the same account (test/live)
- Price IDs match your Stripe products
