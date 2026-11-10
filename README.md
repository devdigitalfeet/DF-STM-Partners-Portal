# DF-STM Partners Portal

A portal for prospective DF clients. Visitors pick one of two paths:

- **Subscribe to Marketing** (`/marketing`): a step-by-step wizard. The prospect picks services (Campaigning, SEO, Social Media), answers questions specific to each service, adds business and contact details, reviews and submits.
- **Become a Partner** (`/partners`): a chat with an AI partnerships assistant (Claude). It qualifies the prospect, answers general questions and submits a summarised application for Maia.

## Getting started

```bash
npm install
cp .env.example .env.local   # then add ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000.

## Configuration

| Variable | Required | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | For the partner chat | Claude API key |
| `LEADS_WEBHOOK_URL` | No | Every lead is POSTed here as JSON (e.g. Zapier → monday.com / email) |
| `MAIA_BOOKING_URL` | No | Booking link the assistant offers after an application |

## Where things live

- `src/config/marketing-services.ts`: every service and question in the marketing wizard. Edit this file to change the form.
- `src/lib/partner-agent.ts`: the partner assistant's system prompt, the application tool and the conversation loop.
- `src/lib/leads.ts`: lead storage. For now leads are written to `data/leads/*.json` (gitignored) and optionally forwarded to the webhook. Local files don't persist on serverless hosting, so set up the webhook or a database before going live.
