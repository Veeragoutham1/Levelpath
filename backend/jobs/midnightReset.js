import { supabaseAdmin } from '../supabaseAdmin.js'

export async function runMidnightReset() {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const { data: pendingLogs, error } = await supabaseAdmin
    .from('task_logs')
    .select('id, task_id, user_id')
    .eq('log_date', yesterdayStr)
    .eq('status', 'pending')

  if (error) {
    throw error
  }

  const logs = pendingLogs ?? []

  for (const log of logs) {
    await supabaseAdmin.from('task_logs').update({ status: 'missed' }).eq('id', log.id)

    await supabaseAdmin
      .from('streaks')
      .update({ current_streak: 0, updated_at: new Date().toISOString() })
      .eq('task_id', log.task_id)
  }

  console.log(`Midnight reset: ${logs.length} tasks marked as missed`)
}
