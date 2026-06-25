# Levelpath

A personal Gen AI learning tracker and daily productivity platform.

**Live:** https://levelpath-theta.vercel.app

## What it does

Levelpath is a full-stack web app with two core features:

**Gen AI Learning Plan** — A structured 3-phase curriculum covering LLMs, Agentic Development, RAG, MCP, and Deployment. Track your progress through 23 topics, mark completions, and see phase-by-phase stats.

**Daily Task Tracker** — Build daily habits with Yes/No tracking, streak counters, priority levels, day exclusions, and email reminders. See weekly completion charts and never lose track of what matters.

**Custom Learning Paths** — Create your own learning paths with custom topics and resources, tracked separately from the structured curriculum.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite + Tailwind CSS v4 |
| Auth + Database | Supabase (Postgres + RLS) |
| Charts | Recharts |
| Routing | React Router v7 |
| Hosting | Vercel |
| Email | Resend |
| Scheduled Jobs | Supabase Edge Functions + pg_cron |

## Features

- 🔐 Email/password auth with protected routes
- 📚 23-topic Gen AI curriculum across 3 phases
- ✅ Daily task tracker with streak tracking
- 🔥 Per-task streak counters with automatic midnight reset
- 📊 Dashboard with learning progress and weekly task charts
- 🛤️ Custom learning paths with CRUD and progress tracking
- 🌙 Light / Dark / System theme toggle
- 📧 Email reminders via Resend (beta)
- 🔑 Admin panel with user progress overview
- ⚙️ Profile settings with reminder preferences

## Project Structure
src/

├── pages/          # All page components

├── components/

│   ├── layout/     # Sidebar, TopBar, ProtectedRoute

│   └── ui/         # StatCard, Toast, ThemeToggle

├── context/        # AuthContext, ThemeContext, ToastContext

├── hooks/          # Custom hooks

├── lib/            # supabase.js, dateUtils.js, constants.js

└── supabase/

└── functions/  # Edge Functions (midnight-reset, evening-reminder)

backend/            # Express.js server for local development/testing

## Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# Start development server
npm run dev
```

## Environment Variables
VITE_SUPABASE_URL=your_supabase_project_url

VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

## Built by

Veera Goutham — Data Engineer, building full-stack as a side project.
GitHub: [@Veeragoutham1](https://github.com/Veeragoutham1)
