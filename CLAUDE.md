# Levelpath — Project Context

## What this is
A personal learning + productivity web app built with React + Vite + Tailwind CSS + Supabase.

## Tech stack
- Frontend: React + Vite, Tailwind CSS, React Router v7
- Auth + Database: Supabase (Postgres + RLS)
- Charts: Recharts
- Hosting: Vercel (frontend), Railway (backend - not built yet)
- Email: Resend (not built yet)

## Project structure
src/
├── pages/          # LoginPage, SignupPage, LearningPlanPage, TaskTrackerPage, DashboardPage, AdminPage
├── components/
│   ├── ui/         # Reusable small components
│   ├── layout/     # ProtectedRoute, Navbar
│   ├── learning/   # Learning plan components
│   ├── tasks/      # Task tracker components
│   └── dashboard/  # Dashboard/chart components
├── hooks/          # Custom React hooks
├── lib/            # supabase.js client, seedTopics.sql
├── context/        # AuthContext.jsx (useAuth hook)
└── pages/

## Database tables (Supabase)
- profiles: id, full_name, role (user/admin), reminder_time
- topics: phase, title, is_mandatory, effort_hours, key_terms, learning_outcomes, video_url, practice_url, additional_resources, sort_order
- user_progress: user_id, topic_id, completed_at
- tasks: user_id, name, notes, priority, schedule_type, start_date, end_date, excluded_days, reminder_enabled, reminder_time, is_active
- task_logs: task_id, user_id, log_date, status (pending/yes/no/missed), marked_late, marked_at
- streaks: task_id, user_id, current_streak, longest_streak, last_completed_date

## Current build status
- Auth: complete (login, signup, protected routes, AuthContext)
- Learning Plan page: complete (all 23 topics seeded, progress tracking, phase tabs)
- Task Tracker page: not started
- Dashboard page: not started
- Admin page: not started
- Navigation/sidebar: not started
- Backend (Express + Railway): not started
- Email reminders: not started

## Key decisions
- supabase client lives at src/lib/supabase.js
- useAuth() hook from src/context/AuthContext.jsx gives { user, session, loading }
- All Tailwind classes must be static strings — no dynamic interpolation
- Never hardcode content — all learning plan data comes from Supabase topics table
- Import supabase from src/lib/supabase.js in every file that needs it
