@AGENTS.md

# DF-STM Partners Portal

Portal for prospective DF (Digitalfeet) clients. Two paths from the home page:

- **Subscribe to Marketing** (`/marketing`): config-driven multi-step wizard (services → per-service questions → business → contact → review → submit to `POST /api/marketing`).
- **Become a Partner** (`/partners`): AI partnerships assistant on the Claude API that qualifies the prospect and submits an application for Maia via `POST /api/partner-chat`.

## Stack

- Next.js 16 (App Router, Turbopack) + React 19, TypeScript (strict)
- Tailwind CSS v4 (configured via `@import "tailwindcss"` in `src/app/globals.css`; no `tailwind.config` file)
- `@anthropic-ai/sdk` for the partner assistant, `zod` for request validation
- ESLint 9 flat config (`eslint.config.mjs`), npm

## Commands

- `npm run dev` - dev server at http://localhost:3000
- `npm run build` - production build (run before committing; it catches prerender errors)
- `npm run lint` - ESLint
- `npx tsc --noEmit` - typecheck

## Structure

- `src/config/marketing-services.ts` - single source of truth for the wizard's services and fields (`showIf` for conditional fields). Change questions here, not in components.
- `src/lib/form.ts` - shared validation used by both the wizard (client) and `/api/marketing` (server).
- `src/lib/partner-agent.ts` - system prompt, `submit_partner_application` tool and the tool loop.
- `src/lib/leads.ts` - saves leads to `data/leads/` (gitignored) and forwards to `LEADS_WEBHOOK_URL` if set.
- `src/components/marketing/`, `src/components/partners/` - client UI.
- Import alias: `@/*` maps to `src/*`.

## Conventions

- Next.js 16 has breaking changes from older versions. Check `node_modules/next/dist/docs/` before using an API you're unsure about. Example: `new Date()` in a prerendered server component fails the build.
- Default to Server Components; add `"use client"` only when needed. Server-only modules import `"server-only"`.
- Validate every API request body with zod and re-validate form answers on the server.
- Claude API: model `claude-opus-5-5`, adaptive thinking (default), `effort: "low"` for chat, server-side `fallbacks: "default"`. Pass the assistant's full `content` blocks back unchanged each turn (thinking blocks included); don't strip or edit history. `tool_choice` must stay `auto` (forced tool use returns 400 on this model).
- Never commit secrets; `.env*` is gitignored except `.env.example`.
- Refer to Maia without gendered pronouns.

## Open decisions (placeholders for now)

- No pricing shown in the marketing wizard; it collects a request only.
- "Campaigning" covers both paid ads and email.
- Partnership types offered (referral, white-label, agency/reseller, technology) are assumptions; confirm with Maia.
- Lead storage is local files + optional webhook; needs a real destination (monday.com / email / database) before launch.

## Git

- Work on the `Levi` branch; commits are authored by Levi271997.
- Do not add Claude as a co-author or contributor: no `Co-Authored-By` trailers and no "Generated with Claude Code" lines in commits or PRs.
