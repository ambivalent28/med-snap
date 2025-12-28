# MedSnap

A personal clinical reference library for healthcare professionals. Upload PDFs, Word documents, and images, organize them by category, and access them from anywhere.

## Features

- **Upload** PDFs, Word docs (DOC/DOCX), and images
- **Organize** with custom categories
- **Search** by title or notes
- **View** documents directly in browser
- **Access** from any device

## Tech Stack

- React + Vite + TypeScript
- Tailwind CSS
- Supabase (Auth, Postgres, Storage)
- Stripe (Payments)
- PDF.js for inline PDF viewing
- Mammoth.js for Word document rendering

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file with:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_STRIPE_PRICE_ID_MONTHLY=your_monthly_price_id
VITE_STRIPE_PRICE_ID_YEARLY=your_yearly_price_id
```

### 3. Set up Supabase

1. Create a new Supabase project
2. Run the migrations in `supabase/migrations/` in order
3. Create a Storage bucket named `guidelines`
4. Enable Email/Password auth in Auth settings

See `SUPABASE_SETUP.md` for detailed instructions.

### 4. Run development server

```bash
npm run dev
```

### 5. Build for production

```bash
npm run build
```

## Pricing

- **Free**: 10 uploads, full access
- **Pro**: Unlimited uploads ($5/month or $25/year)

## License

Private. All rights reserved.
