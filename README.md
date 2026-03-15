# Red Binder

> Personal knowledge management built around one question: **are you actually applying what you learn?**

Red Binder is a mobile-first PWA that closes the gap between capturing insights and acting on them. It combines a structured capture format, spaced review, daily/weekly rituals, and Claude-powered AI nudges into a single focused app.

---

## Features

| Area | What it does |
|------|-------------|
| **Entries** | Capture insights with title, quote, reflection, source, category, and an application plan (what / by when / success signal / smallest test) |
| **Status tracking** | Every entry moves through Not Applied → In Progress → Applied |
| **Browse & Search** | Filter by category and status; full-text search across title, quote, reflection, and source |
| **Library** | Your sources grouped by name — see how many entries came from each book, course, or podcast and how many you've applied |
| **Daily Ritual** | 2-step flow: review a random unapplied entry, write a specific commitment for today. Saves to Supabase, updates your day streak |
| **Weekly Ritual** | 4-step flow: celebrate wins, pick an insight to apply next week, check last week's commitment, write a gratitude reflection |
| **Day streak** | Computed from the `rituals` table — persists across devices |
| **AI Daily Nudge** | Claude-generated 2–3 sentence personalised prompt on your Dashboard each morning, based on your unapplied entries (cached per day) |
| **AI Entry Assist** | One tap in New Entry / Quick Capture to auto-suggest a category and write a concrete "I will…" application plan starter |
| **AI Deferral Scan** | Surfaces entries sitting at Not Applied for 14+ days with a Claude-generated accountability message |
| **Categories** | Colour-coded, emoji-tagged; 8 defaults seeded on signup; fully editable in Settings |
| **Quick Capture** | Bottom-sheet modal for fast capture from any screen |
| **PWA** | Installable on iOS and Android; Supabase responses cached 24 h via Workbox so it works offline after first load |

---

## Tech Stack

- **Frontend** — React 18, Vite, Tailwind CSS, Zustand, React Router 6
- **Backend** — Supabase (Postgres + Auth + Row Level Security + Edge Functions)
- **AI** — Anthropic Claude (`claude-haiku-4-5-20251001`) via three Supabase Edge Functions
- **PWA** — `vite-plugin-pwa` + Workbox

---

## Project Structure

```
red_binder/
├── src/
│   ├── components/
│   │   ├── ai/          AINudge display component
│   │   ├── categories/  CategoryManager (CRUD)
│   │   ├── entries/     EntryCard, QuickCapture
│   │   └── ui/          TopBar, BottomNav, Badge, Modal, Toast, Layout
│   ├── hooks/
│   │   ├── useEntries.js        CRUD + Supabase sync
│   │   ├── useCategories.js     CRUD + Supabase sync
│   │   ├── useRituals.js        Load rituals, streak, complete()
│   │   ├── useAINudge.js        Daily nudge with per-day sessionStorage cache
│   │   ├── useDeferralScan.js   Stale-entry detection + AI accountability nudge
│   │   ├── useAISettings.js     localStorage-persisted AI toggle settings
│   │   └── useAI.js             Generic Edge Function wrapper
│   ├── lib/
│   │   ├── supabase.js  Supabase client
│   │   ├── auth.jsx     useUser hook + AuthProvider
│   │   └── api.js       Edge Function callers
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Browse.jsx
│   │   ├── Search.jsx
│   │   ├── Library.jsx
│   │   ├── Rituals.jsx
│   │   ├── NewEntry.jsx
│   │   ├── EntryDetail.jsx
│   │   ├── Settings.jsx
│   │   └── AuthPage.jsx
│   └── store/           Zustand stores (entries, categories, rituals, ui)
├── supabase/
│   ├── migrations/
│   │   └── 20240101000000_initial_schema.sql
│   └── functions/
│       ├── ai-ritual-prompt/    Daily/weekly nudge generation
│       ├── ai-entry-assist/     Category + plan_starter suggestion
│       └── ai-deferral-scan/    Stale-entry accountability nudge
└── public/
    └── icons/           PWA icons (192×192, 512×512)
```

---

## Running Locally

### Prerequisites

- Node.js 18+
- [Supabase CLI](https://supabase.com/docs/guides/cli) (`brew install supabase/tap/supabase`)
- An [Anthropic API key](https://console.anthropic.com/)

### 1. Clone and install

```bash
git clone <repo-url>
cd red_binder
npm install
```

### 2. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a new project, then grab your credentials from **Project Settings → API**:

- **Project URL** — looks like `https://xxxx.supabase.co`
- **anon / public key** — the `anon` key

### 3. Configure environment variables

```bash
cp .env.example .env.local    # or just create .env.local manually
```

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### 4. Run the database migration

In the Supabase dashboard go to **SQL Editor** and run the contents of:

```
supabase/migrations/20240101000000_initial_schema.sql
```

This creates all tables, RLS policies, indexes, and seeds default categories for new users automatically via a trigger.

Alternatively with the Supabase CLI (if you have it linked):

```bash
supabase db push
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Sign up with any email — Supabase will send a magic link or OTP depending on your Auth settings.

---

## Deploying the Edge Functions

The three AI features call Supabase Edge Functions (Deno). You need to deploy them and set your Anthropic key as a secret.

### 1. Link your project (first time only)

```bash
supabase login
supabase link --project-ref <your-project-ref>
```

Your project ref is the string after `https://` and before `.supabase.co` in your URL.

### 2. Set the Anthropic secret

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Deploy all three functions

```bash
supabase functions deploy ai-ritual-prompt
supabase functions deploy ai-entry-assist
supabase functions deploy ai-deferral-scan
```

Verify deployment in the Supabase dashboard under **Edge Functions**.

### 4. Test a function manually

```bash
supabase functions invoke ai-ritual-prompt \
  --body '{"type":"daily","entries":[]}'
```

---

## Deploying the Frontend

The frontend is a static build — deploy anywhere that serves static files.

### Netlify (recommended)

```bash
npm run build
# drag dist/ into Netlify, or:
npx netlify deploy --prod --dir=dist
```

Set environment variables in Netlify → Site Settings → Environment:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### Vercel

```bash
npm i -g vercel
vercel --prod
```

Add the same two env vars in the Vercel dashboard.

### Any static host (S3, Cloudflare Pages, GitHub Pages)

```bash
npm run build   # outputs to dist/
```

Upload `dist/` to your host. Make sure your host redirects all routes to `index.html` (SPA routing).

---

## Supabase Auth Setup

Red Binder uses Supabase email auth. To configure:

1. Dashboard → **Authentication → Providers → Email** — enable it
2. Dashboard → **Authentication → URL Configuration**:
   - **Site URL**: your production URL (e.g. `https://your-app.netlify.app`)
   - **Redirect URLs**: same URL + `http://localhost:5173` for local dev
3. Optionally disable email confirmation in **Auth → Settings → Enable email confirmations** for faster local testing

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Your Supabase anon/public key |

Edge Function secrets (set via `supabase secrets set`):

| Secret | Required | Description |
|--------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes (for AI features) | Anthropic API key — get one at [console.anthropic.com](https://console.anthropic.com) |

---

## AI Features & Cost

All Claude calls use `claude-haiku-4-5-20251001`, the fastest and most cost-efficient model. Typical usage:

| Feature | When it fires | Tokens (approx) |
|---------|--------------|-----------------|
| Daily Nudge | Once per day per user (cached) | ~300 in / ~200 out |
| Entry Assist | On demand (user taps button) | ~200 in / ~150 out |
| Deferral Scan | Once per day per user (cached), only if stale entries exist | ~250 in / ~120 out |

At current Haiku pricing this is well under $0.01 per user per day.

To disable AI features entirely: toggle them off in **Settings → AI Features**, or simply don't deploy the Edge Functions — the app degrades gracefully without them.

---

## Database Schema Overview

```
categories      user-defined knowledge categories (8 default)
entries         core knowledge atoms (title, quote, reflection, application JSONB, status)
rituals         completed daily/weekly ritual records (response_data JSONB)
books           source tracking (linked to entries via book_id)
tags            free-form tags (entry_tags join table)
entry_links     related-entry connections (entry_a_id ↔ entry_b_id)
```

All tables have Row Level Security — users can only access their own data. The `entries` table has a GIN full-text search index across title, quote, reflection, and source.

New users automatically get 8 default categories (Mindset, Leadership, Productivity, Relationships, Health, Finance, Creativity, Philosophy) via a Postgres trigger on `auth.users`.

---

## Available Scripts

```bash
npm run dev      # Start Vite dev server (http://localhost:5173)
npm run build    # Production build → dist/
npm run preview  # Preview the production build locally
npm run lint     # ESLint
```

---

## Roadmap / Ideas

- **Tags** — schema is ready, UI not yet built
- **Entry Links** — connect related insights; schema is ready
- **Books table** — link entries to a proper book record with cover art (schema ready, Library page currently uses free-text `source` field)
- **Spaced repetition** — surface entries for review based on a forgetting-curve schedule
- **Push notifications** — daily ritual reminder via Web Push
- **Export** — Markdown/JSON export of all entries
- **Weekly Ritual improvements** — show week's entries inline, goal tracking
