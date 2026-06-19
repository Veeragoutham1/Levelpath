# Levelpath Backend

Express.js server for scheduled jobs and email sending.

## Setup
1. Copy .env and fill in values
2. npm install
3. npm run dev

## Environment Variables
- SUPABASE_URL: your Supabase project URL
- SUPABASE_SERVICE_KEY: Supabase service role key (Settings > API > service_role)
- RESEND_API_KEY: from resend.com dashboard
- PORT: 3001

## Endpoints
- GET /health — check server is running
- POST /trigger/midnight-reset — manually run the midnight reset
- POST /trigger/evening-reminder — manually run email reminders

## Cron Schedule (IST timezone)
- 00:00 daily — mark pending yesterday tasks as missed, reset streaks
- 19:00 daily — send email reminders for pending tasks
