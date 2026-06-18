# Levelpath — Project Context

## What this is
A personal learning + productivity web app built with React + Vite + Tailwind CSS + Supabase.
Builder: Veera Goutham. Personal side project.

## Tech stack
- Frontend: React + Vite, Tailwind CSS, React Router v7
- Auth + Database: Supabase (Postgres + RLS)
- Charts: Recharts (v3.8.1)
- Icons: Tabler Icons via CDN in index.html
- Hosting: Vercel (not deployed yet)
- Backend: Express + Railway (not built yet)
- Email: Resend (not built yet)

## Project structure
src/
├── pages/
│   ├── LoginPage.jsx          ✅ complete
│   ├── SignupPage.jsx          ✅ complete
│   ├── LearningPlanPage.jsx    ✅ complete
│   ├── TaskTrackerPage.jsx     ✅ complete
│   ├── DashboardPage.jsx       ✅ complete
│   └── AdminPage.jsx           ⏳ placeholder only
├── components/
│   ├── ui/                     empty, for future reusable components
│   ├── layout/
│   │   ├── Sidebar.jsx         ✅ complete — global nav sidebar
│   │   └── ProtectedRoute.jsx  ✅ complete
│   ├── learning/               empty, for future extraction
│   ├── tasks/                  empty, for future extraction
│   └── dashboard/               empty, for future extraction
├── hooks/                      empty, for future custom hooks
├── lib/
│   ├── supabase.js             ✅ complete — Supabase client
│   └── seedTopics.sql          ✅ already run, do not run again
├── context/
│   └── AuthContext.jsx         ✅ complete — useAuth() hook
└── pages/

## Database tables (Supabase) — all tables exist, RLS enabled
- profiles: id, full_name, role (user/admin), reminder_time, created_at
- topics: phase, title, is_mandatory, effort_hours, key_terms, learning_outcomes, video_url, practice_url, additional_resources, sort_order, created_at
- user_progress: id, user_id, topic_id, completed_at — unique(user_id, topic_id)
- tasks: id, user_id, name, notes, priority (high/medium/low), schedule_type (daily/goal), start_date, end_date, excluded_days (int[]), reminder_enabled, reminder_time, is_active, created_at
- task_logs: id, task_id, user_id, log_date, status (pending/yes/no/missed), marked_late, marked_at — unique(task_id, log_date)
- streaks: id, task_id, user_id, current_streak, longest_streak, last_completed_date, updated_at

## Key patterns — always follow these
- supabase client: import { supabase } from src/lib/supabase.js
- auth hook: import { useAuth } from src/context/AuthContext.jsx — gives { user, session, loading }
- sidebar: import Sidebar from src/components/layout/Sidebar.jsx — add to every protected page
- sidebar offset: add ml-[220px] to main content wrapper on every protected page
- Tailwind dynamic classes are PURGED — always write complete static class strings, never interpolate colors
- All Tailwind class names must be full static strings e.g. 'bg-blue-500' not 'bg-'+color+'-500'
- Data fetching pattern: use Promise.all for parallel fetches, always wrap in try/catch

## Feature completion status
✅ Auth — login, signup, email confirmation OFF for dev, protected routes
✅ Learning Plan — sidebar nav, 23 topics across 3 phases, topic detail card, mark complete, progress tracking
✅ Task Tracker — daily view (yes/no), manage view, create/edit tasks, streaks, day exclusions
✅ Dashboard — stat cards, learning plan progress bars, weekly chart (Recharts), streak list, phase breakdown
✅ Navigation — global sidebar with Dashboard/Learning Plan/Tasks links, user avatar, logout
⏳ Admin page — placeholder exists at /admin, needs to be built
❌ Backend (Express + Railway) — not started, needed for cron jobs
❌ Email reminders (Resend) — not started
❌ Vercel deployment — not started, do at end

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
