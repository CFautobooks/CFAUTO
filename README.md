# RecoverFlow

RecoverFlow is a full-stack SaaS MVP for service businesses that want to recover missed revenue from unpaid invoices, unanswered quotes, stale leads, missed appointment requests and repeat-service opportunities.

The product imports opportunities from manual entry, CSV and planned integrations, drafts email/SMS follow-ups with AI, lets teams approve messages before sending, and tracks recovered revenue.

## Tech stack

- Next.js + TypeScript
- Tailwind CSS
- Next.js API routes
- Supabase Auth and Database with Row Level Security
- OpenAI for follow-up draft generation
- Vercel-ready project structure

## MVP features

- Landing, login/signup, dashboard, import, accounts, follow-up review, customers, sequences, settings, pricing and admin screens
- Manual import flow for invoices, quotes, leads, appointments and repeat-service opportunities
- AI follow-up draft generation with safe fallback copy when OpenAI is not configured
- Recovery scoring based on amount at risk, due date age and silence since last contact
- Review-and-schedule workflow for email, SMS and phone-task follow-ups
- Demo data so the app looks useful before Supabase is connected
- Supabase schema for profiles, businesses, customers, follow-up cases, sequences, messages, recovery events and integrations
- Integration catalog for Gmail, Outlook, QuickBooks, Stripe, Square, Calendly, HubSpot, Jobber, ServiceTitan and Twilio

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
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_MESSAGING_SERVICE_SID=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
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
4. Add your Supabase URL, anon key and service role key to `.env.local`.

The schema creates:

- `profiles`
- `businesses`
- `customers`
- `follow_up_sequences`
- `follow_up_cases`
- `follow_up_messages`
- `recovery_events`
- `integrations`

RLS policies scope business records, customers, cases, messages, recovery events and integrations to the signed-in user. Admin users can be granted by setting `profiles.role = 'admin'`.

## Recovery workflow

1. Sign up or log in at `/login`.
2. Go to `/import`.
3. Add an unpaid invoice, unanswered quote, stale lead, missed appointment or repeat-service opportunity.
4. RecoverFlow creates the customer and follow-up case, scores urgency, and drafts a first message.
5. Go to `/follow-ups/[id]` to edit the message, generate a new AI draft, schedule the next action or mark the case recovered.
6. Use `/settings` to see the integration catalog for inbox, payment, CRM, scheduling, field-service and SMS products.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
```

## Notes

- The product integration buttons are scaffolds for OAuth/webhook work; they are represented in the schema and UI but do not complete live handshakes yet.
- OpenAI is optional for local demos. If `OPENAI_API_KEY` is missing, the API returns a deterministic fallback draft.
- Outbound SMS/email sending is intentionally approval-first in this MVP; Twilio/Gmail/Outlook sending can be layered onto `follow_up_messages`.
