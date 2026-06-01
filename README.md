# CF AutoBooks

CF AutoBooks is a full-stack SaaS MVP for AI-assisted bookkeeping, built for Australian small businesses, tradies, bookkeepers and Carmichael Financials.

Users can upload invoices or receipts as PDF, JPG or PNG. The app stores the source file in Supabase Storage, extracts bookkeeping data with OpenAI, calculates GST fields where possible, assigns a confidence score, and sends the transaction to an editable review screen.

## Tech stack

- Next.js + TypeScript
- Tailwind CSS
- Next.js API routes
- Supabase Auth, Database and Storage
- OpenAI API for strict JSON extraction
- Vercel-ready project structure

## MVP features

- Landing, login/signup, dashboard, upload, review, transactions, clients, settings, pricing and admin screens
- Supabase authentication
- File upload validation for PDF, JPG and PNG
- 10 MB upload limit
- Supabase Storage persistence
- OpenAI extraction route that never exposes API keys to the frontend
- Supplier, ABN, invoice number, dates, subtotal, GST, total, line item, category and confidence extraction
- Status tracking: uploaded, extracted, needs review, approved and exported
- Editable transaction review form
- Placeholder MYOB and Xero integration UI
- Supabase SQL schema with Row Level Security policies

## Getting started

Install dependencies:

```bash
npm install
```

Copy the environment template:

```bash
cp .env.example .env.local
```

Fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

Run the app locally:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Supabase setup

1. Create a Supabase project.
2. Open the SQL editor.
3. Run `supabase/schema.sql`.
4. Confirm that the private `documents` storage bucket exists.
5. Add your Supabase URL, anon key and service role key to `.env.local`.

The schema creates:

- `profiles`
- `businesses`
- `clients`
- `documents`
- `transactions`
- `transaction_line_items`
- `extraction_logs`
- `categories`
- `integrations`

RLS policies scope business records, uploads, transactions, line items and integrations to the signed-in user. Admin users can be granted by setting `profiles.role = 'admin'`.

## Upload-to-review flow

1. Sign up or log in at `/login`.
2. Go to `/upload`.
3. Upload a PDF, JPG or PNG invoice/receipt.
4. The server route validates the file, stores it in Supabase Storage, creates a document record, extracts PDF text where available, calls OpenAI, and stores a transaction.
5. Confidence below 95% is marked `needs_review`; 95% and above is marked `extracted`.
6. The browser redirects to `/review/[id]` so the user can edit and approve the transaction.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
```

## Notes

- MYOB and Xero screens are placeholders only and show "Coming soon".
- Demo data is displayed on dashboard and list screens so the MVP looks polished before connecting a Supabase project.
- The real upload and review flow requires valid Supabase and OpenAI credentials.
