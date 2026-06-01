# CallBack AI

CallBack AI is a full-stack SaaS MVP for missed-call recovery.

**Positioning:** Miss a call. Don't lose the customer.

When a small business misses a call, CallBack AI sends an SMS to the caller, has a short AI conversation, collects lead/job details, classifies the enquiry, and sends the owner a clean summary.

## Tech stack

- Next.js + TypeScript
- Tailwind CSS
- Supabase Auth and Database
- Twilio phone/SMS webhooks
- OpenAI conversation handling
- Stripe-ready pricing UI, no payment processing yet
- Vercel-ready deployment

## MVP pages

- `/` landing page
- `/login` login/signup
- `/dashboard` missed-call recovery dashboard
- `/leads` leads inbox
- `/leads/[id]` lead detail
- `/conversations` AI SMS conversations
- `/settings/phone` phone and missed-call settings
- `/settings/ai` AI response settings
- `/settings/business` business profile
- `/contacts` contacts and blocked numbers
- `/pricing` pricing UI
- `/admin` platform/admin dashboard
- `/simulator` missed-call simulator

## Core flow

1. Business owner signs up.
2. Business configures profile, phone number and AI settings.
3. Twilio sends missed-call webhooks to `/api/twilio/missed-call`.
4. The system checks auto-reply rules, blocked numbers, saved contacts, business hours, duplicate replies and max AI message limits.
5. Eligible callers receive:

   ```text
   Hi, thanks for calling [Business Name]. Sorry we missed your call. What can we help with?
   ```

6. Caller replies by SMS.
7. Twilio sends inbound SMS webhooks to `/api/twilio/inbound-sms`.
8. OpenAI or mock AI classifies and continues the conversation.
9. AI collects name, phone, reason, job type, urgency, address/location and preferred callback time.
10. Once complete, or if emergency/personal/spam/wrong number is detected, the AI stops and creates an owner summary.

## Local setup

Install dependencies:

```bash
npm install
```

Copy env vars:

```bash
cp .env.example .env.local
```

Run locally:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Mock mode

The app works without Supabase, Twilio or OpenAI credentials.

- Missing Twilio env vars: SMS sends are logged as mock sends.
- Missing OpenAI env var: deterministic mock AI responses are used.
- Missing Supabase env vars: demo screens and simulator still run.

Use `/simulator` to test:

- Missed call from a fake number
- Caller SMS replies
- AI classification
- Emergency escalation
- Personal/spam/wrong-number stopping
- Lead creation and owner summary

## Environment variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_MESSAGING_SERVICE_SID=
TWILIO_PHONE_NUMBER=
NEXT_PUBLIC_APP_URL=
```

## Supabase setup

1. Create a Supabase project.
2. Open SQL editor.
3. Run `supabase/schema.sql`.
4. Add Supabase env vars to `.env.local`.

Tables:

- `profiles`
- `businesses`
- `business_settings`
- `phone_numbers`
- `missed_calls`
- `conversations`
- `messages`
- `leads`
- `contacts`
- `blocked_numbers`
- `ai_prompts`
- `notification_logs`
- `audit_logs`
- `subscriptions`

RLS policies scope records to the business owner or admin users.

## Twilio setup

1. Buy or configure a Twilio phone number.
2. Set SMS webhook:

   ```text
   POST https://your-domain.com/api/twilio/inbound-sms
   ```

3. Configure missed-call/voice fallback webhook:

   ```text
   POST https://your-domain.com/api/twilio/missed-call
   ```

4. Add:

   ```bash
   TWILIO_ACCOUNT_SID=
   TWILIO_AUTH_TOKEN=
   TWILIO_MESSAGING_SERVICE_SID=
   TWILIO_PHONE_NUMBER=
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   ```

Webhook signature validation is enabled when `TWILIO_AUTH_TOKEN` is present.

## OpenAI setup

Add:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

The AI returns strict JSON:

```json
{
  "reply_to_caller": "",
  "category": "new_lead | existing_customer | emergency | personal | spam | wrong_number | unknown",
  "lead_complete": false,
  "urgency": "low | medium | high | emergency",
  "extracted_details": {
    "name": "",
    "phone": "",
    "enquiry_type": "",
    "job_description": "",
    "address": "",
    "preferred_callback_time": ""
  },
  "summary_for_owner": "",
  "confidence_score": 0,
  "should_notify_owner_now": false,
  "should_stop_ai": false
}
```

## Security notes

- Service role key is server-only.
- Twilio signatures are validated when credentials are configured.
- Inbound simulator/Twilio paths rate-limit callers in mock mode.
- AI conversations stop at `max_ai_messages_per_conversation`.
- User input is sanitized before AI handling.
- Important actions are audit logged.

## Vercel deployment

1. Import the GitHub repo into Vercel.
2. Add all environment variables in Project Settings.
3. Set `NEXT_PUBLIC_APP_URL` to the Vercel production URL.
4. Run the Supabase schema.
5. Configure Twilio webhooks to the Vercel URLs.
6. Deploy.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
```
