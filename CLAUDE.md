@AGENTS.md

# DF-STM Partners Portal

Partners portal built with Next.js (App Router). Currently only the base scaffold exists.

## Stack

- Next.js 16 (App Router, Turbopack) + React 19
- TypeScript (strict)
- Tailwind CSS v4 (configured via `@import "tailwindcss"` in `src/app/globals.css`; no `tailwind.config` file)
- ESLint 9 flat config (`eslint.config.mjs`, `eslint-config-next`)
- npm as the package manager

## Commands

- `npm run dev` - start the dev server at http://localhost:3000
- `npm run build` - production build
- `npm run start` - serve the production build
- `npm run lint` - run ESLint

## Structure

- `src/app/` - routes, layouts and global styles (App Router)
- `public/` - static assets
- Import alias: `@/*` maps to `src/*`

## Conventions

- Next.js 16 has breaking changes from older versions. Check the bundled docs in `node_modules/next/dist/docs/` before using an API you're unsure about.
- Default to Server Components; add `"use client"` only when a component needs state, effects or browser APIs.
- Style with Tailwind utility classes.
- Never commit secrets; `.env*` files are gitignored.

## Git

- Work on the `Levi` branch; commits are authored by Levi271997.
- Do not add Claude as a co-author or contributor: no `Co-Authored-By` trailers and no "Generated with Claude Code" lines in commits or PRs.
