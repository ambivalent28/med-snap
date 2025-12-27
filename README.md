# MedSnap

Desktop-first personal clinical reference vault. Upload PDFs and images, organize with categories/tags, and view inline (no downloads). Backend targets Supabase; frontend is Vite + React + TypeScript + Tailwind.

## Tech stack
- React + Vite + TypeScript
- Tailwind CSS
- Supabase (Auth, Postgres, Storage)
- `react-pdf`/`pdf.js` for inline PDFs

## Getting started
1) Install deps  
```
npm install
```
2) Env vars  
Copy `env.example` to `.env` and set:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
3) Run dev server  
```
npm run dev
```
4) Build  
```
npm run build && npm run preview
```

## Supabase setup
- Run the SQL in `supabase/schema.sql` in your project to create tables/policies.
- Create a Storage bucket named `guidelines` with public access for PDFs/images.
- Enable Email/Password and Google OAuth in Supabase Auth settings.

## App notes
- Desktop-first layout with category sidebar + grid of guideline cards.
- Inline viewing only (no download buttons). PDFs render via `react-pdf`; images inline.
- Upload flow: drag-and-drop, required title, optional tags/notes/source URL, and required “no patient info” checkbox.
- Long titles are truncated with ellipsis on cards; tags and dates visible.
- Search filters by title, tags, and notes; category filter is single-select.

## Next steps to wire Supabase
- Replace the placeholder upload logic in `src/App.tsx` with Supabase Storage uploads and DB inserts.
- Add auth flows (email/password + Google) using `@supabase/supabase-js` (session handling, protected routes).
- Swap `URL.createObjectURL` with the public URL returned from Storage for inline viewing.
- Add pagination or infinite scroll if the library grows large.

