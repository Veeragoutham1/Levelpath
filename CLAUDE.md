# Levelpath — Project Context

## What this is
A personal learning + productivity web app built with React + Vite + Tailwind CSS + Supabase.
Builder: Veera Goutham. Personal side project.

## Tech stack
- Frontend: React + Vite, Tailwind CSS, React Router v7
- Auth + Database: Supabase (Postgres + RLS)
- Charts: Recharts (v3.8.1)
- Icons: Tabler Icons via CDN in index.html
- Hosting: Vercel (live at levelpath-theta.vercel.app)
- Backend: Express.js (built, runs locally, Railway deployment pending)
- Email: Resend (sandbox verified, domain verification needed for production)

## Project structure
src/
├── pages/
│   ├── LoginPage.jsx              ✅ complete
│   ├── SignupPage.jsx             ✅ complete
│   ├── LearningPlanPage.jsx       ✅ complete
│   ├── TaskTrackerPage.jsx        ✅ complete
│   ├── DashboardPage.jsx          ✅ complete
│   ├── AdminPage.jsx              ⏳ placeholder only
│   ├── ProfileSettingsPage.jsx    ✅ complete
│   └── CustomPathPage.jsx         ✅ complete
├── components/
│   ├── ui/
│   │   ├── StatCard.jsx        ✅ shared stat card component
│   │   ├── ThemeToggle.jsx     ✅ light/dark/system toggle
│   │   └── Toast.jsx           ✅ toast notification component
│   ├── layout/
│   │   ├── Sidebar.jsx         ✅ complete — global nav sidebar
│   │   ├── TopBar.jsx          ✅ complete — page header, user menu, theme toggle
│   │   └── ProtectedRoute.jsx  ✅ complete
│   ├── learning/               empty, for future extraction
│   ├── tasks/                  empty, for future extraction
│   └── dashboard/               empty, for future extraction
├── hooks/                      empty, for future custom hooks
├── lib/
│   ├── supabase.js             ✅ complete — Supabase client
│   ├── dateUtils.js            ✅ IST-safe date utilities
│   ├── constants.js            ✅ shared constants (PHASE_NAMES, SIDEBAR_WIDTH)
│   └── seedTopics.sql          ✅ already run, do not run again
└── context/
    ├── AuthContext.jsx         ✅ complete — useAuth() hook
    ├── ThemeContext.jsx        ✅ complete — light/dark/system theme
    └── ToastContext.jsx        ✅ complete — global toast notifications

backend/
├── server.js          ✅ Express + node-cron, endpoints /health /trigger/*
├── supabaseAdmin.js    ✅ service role client (bypasses RLS)
└── jobs/
    ├── midnightReset.js     ✅ marks pending yesterday logs as missed, resets streaks
    └── eveningReminder.js   ✅ sends 7PM email reminders via Resend

## Database tables (Supabase) — all tables exist, RLS enabled
- profiles: id, full_name, role (user/admin), reminder_time, created_at
- topics: phase, title, is_mandatory, effort_hours, key_terms, learning_outcomes, video_url, practice_url, additional_resources, sort_order, created_at
- user_progress: id, user_id, topic_id, completed_at — unique(user_id, topic_id)
- tasks: id, user_id, name, notes, priority (high/medium/low), schedule_type (daily/goal), start_date, end_date, excluded_days (int[]), reminder_enabled, reminder_time, is_active, created_at
- task_logs: id, task_id, user_id, log_date, status (pending/yes/no/missed), marked_late, marked_at — unique(task_id, log_date)
- streaks: id, task_id, user_id, current_streak, longest_streak, last_completed_date, updated_at
- custom_topics: id, user_id, path_name, title, key_terms, learning_outcomes, resource_url, is_completed, sort_order, created_at

## Key patterns — always follow these
- supabase client: import { supabase } from src/lib/supabase.js
- auth hook: import { useAuth } from src/context/AuthContext.jsx — gives { user, session, loading }
- sidebar: import Sidebar from src/components/layout/Sidebar.jsx — add to every protected page
- sidebar offset: use style={{ marginLeft: SIDEBAR_WIDTH }} from src/lib/constants.js — do NOT use ml-[220px] hardcoded class
- Tailwind dynamic classes are PURGED — always write complete static class strings, never interpolate colors
- All Tailwind class names must be full static strings e.g. 'bg-blue-500' not 'bg-'+color+'-500'
- Data fetching pattern: use Promise.all for parallel fetches, always wrap in try/catch

## Feature completion status
✅ Auth — login, signup, protected routes, landing page
✅ Learning Plan — sidebar nav, 23 topics, topic detail card, mark complete, progress tracking
✅ Task Tracker — daily view (yes/no), manage view, create/edit tasks, streaks, day exclusions, email reminders
✅ Dashboard — stat cards, learning plan progress, weekly chart (Recharts), streak list, phase breakdown
✅ Navigation — global sidebar, TopBar with user dropdown and theme toggle
✅ Admin panel — user progress table, topic completion overview, recent activity
✅ Toast notifications — top-center, success/error/info, all actions covered
✅ Profile Settings — editable name, reminder time, account info, danger zone
✅ Custom Learning Paths — user-created paths, topic CRUD, progress tracking
✅ Dark mode — light/dark/system toggle, auto-detects OS preference, persists to localStorage
✅ Backend cron jobs — midnight reset (marks missed tasks), 7PM email reminders via Resend
✅ Code quality — IST-safe dates, idempotent streak logic, RLS admin policies, bundle splitting, shared constants
✅ Backend deployment — Supabase Edge Functions + pg_cron (deployed, runs 24/7 free)
⏳ Community feed (Twitter/X style) — Phase 2
✅ Vercel frontend deployment — live at levelpath-theta.vercel.app
❌ Custom domain / Resend domain verification — not planned

## Planned Phase 2 features (do not build yet)
- Community feed — Twitter/X style posts, users share links and notes, others can like
- AI features using Gemini 1.5 Flash API (call from backend only, never frontend):
  - Daily task suggester
  - Weekly review summary
  - Learning path recommender
  - Streak recovery motivation email

## Routes
- / → redirects to /dashboard if logged in, /login if not
- /login → LoginPage (public)
- /signup → SignupPage (public)
- /dashboard → DashboardPage (protected)
- /learn → LearningPlanPage (protected)
- /tasks → TaskTrackerPage (protected)
- /admin → AdminPage (protected + admin role only)
- /settings → ProfileSettingsPage (protected)
- /custom-path → CustomPathPage (protected)

## Topics data — already seeded, do not re-insert
23 topics across 3 phases already exist in the topics table.
Phase 1: 8 topics (6 mandatory, 2 optional) — AI Basics
Phase 2: 7 topics (6 mandatory, 1 optional) — Agentic Development
Phase 3: 8 topics (6 mandatory, 2 optional) — RAG, MCP, Deployment

## What NOT to do
- Never hardcode topic content in frontend — always fetch from Supabase
- Never put API keys in frontend code
- Never call Gemini/AI APIs from React — backend only
- Never install new npm packages without confirming first
- Never run seedTopics.sql again — data already exists
- Do not add position:fixed elements (breaks iframe layout in some contexts)

## Recent technical decisions
- Dark mode uses Tailwind v4 @custom-variant dark (&:where(.dark, .dark *)) — class-based, not media-query
- ThemeContext: 3-state (light/dark/system), persists to localStorage key 'levelpath-theme'
- Recharts charts use useTheme() hook for theme-aware colors since Tailwind classes can't reach SVG internals
- RLS admin policies use is_admin() security definer function to avoid recursive policy evaluation
- Date handling: all frontend and backend date operations use IST-safe UTC accessor methods via src/lib/dateUtils.js
- Bundle: DashboardPage lazy-loaded via React.lazy, splits Recharts into separate chunk (~337KB)

## Session end state (June 2026)
Everything is fully deployed and working:
- Frontend live at https://levelpath-theta.vercel.app (Vercel, auto-deploys on git push to main)
- Supabase Edge Functions deployed: midnight-reset and evening-reminder
- pg_cron schedules active: job 5 (30 18 * * * = midnight IST) and job 6 (30 13 * * * = 7PM IST)
- pg_cron calls Edge Functions via net.http_post() using service_role_key from Supabase Vault
- Resend API key set as Supabase Edge Function secret
- GitHub repo public: github.com/Veeragoutham1/Levelpath
- Express backend in backend/ folder is LOCAL ONLY — used for manual curl testing, not deployed
- Email reminders are sandbox mode — only send to veeragoutham04@gmail.com (Resend verified account)
- All audit bugs fixed: RLS recursion, UTC/IST mismatch, streak idempotency, silent error handling
- Dark mode complete across all pages (light/dark/system)
- Custom learning paths complete with tab layout
- Dashboard has plan selector dropdown for Gen AI plan + custom paths

## Next session starting point
If continuing development, pick up from Phase 2 features:
1. Community Feed (Twitter/X style posts + likes) — highest priority
2. Profile picture upload via Supabase Storage
3. AI features via Gemini 1.5 Flash (Edge Functions only, never frontend)

Local dev commands:
- Frontend: cd "A:\Ganit learning website\Levelpath" && npm run dev
- Backend (manual test only): cd "A:\Ganit learning website\Levelpath\backend" && node server.js
- Deploy Edge Functions: supabase functions deploy <name> --project-ref lgovmtlbyapgzywpwzku
- Deploy frontend: git push origin main (Vercel auto-deploys)
