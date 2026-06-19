import express from 'express'
import cron from 'node-cron'
import dotenv from 'dotenv'
import { Resend } from 'resend'
import { runMidnightReset } from './jobs/midnightReset.js'
import { runEveningReminder } from './jobs/eveningReminder.js'

dotenv.config({ quiet: true })

const app = express()
const PORT = process.env.PORT || 3001
const resend = new Resend(process.env.RESEND_API_KEY)

app.use(express.json())

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Manual trigger endpoints (for testing)
app.post('/trigger/midnight-reset', async (req, res) => {
  try {
    await runMidnightReset()
    res.json({ success: true, message: 'Midnight reset completed' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

app.post('/trigger/evening-reminder', async (req, res) => {
  try {
    await runEveningReminder(resend)
    res.json({ success: true, message: 'Evening reminders sent' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// Cron jobs
// Midnight reset — runs every day at 00:00
cron.schedule('0 0 * * *', async () => {
  console.log('Running midnight reset...')
  try {
    await runMidnightReset()
  } catch (err) {
    console.error('Midnight reset failed:', err.message)
  }
}, { timezone: 'Asia/Kolkata' })

// Evening reminder — runs every day at 19:00
cron.schedule('0 19 * * *', async () => {
  console.log('Running evening reminders...')
  try {
    await runEveningReminder(resend)
  } catch (err) {
    console.error('Evening reminder failed:', err.message)
  }
}, { timezone: 'Asia/Kolkata' })

app.listen(PORT, () => {
  console.log('Levelpath backend running on port ' + PORT)
  console.log('Cron jobs scheduled: midnight reset + 7PM reminders (IST)')
})
