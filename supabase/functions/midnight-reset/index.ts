import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

function getYesterdayIST(): string {
  const now = new Date()
  const istTime = new Date(now.getTime() + IST_OFFSET_MS)
  istTime.setUTCDate(istTime.getUTCDate() - 1)
  return istTime.toISOString().split('T')[0]
}

Deno.serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const yesterday = getYesterdayIST()

    // Find all pending logs from yesterday
    const { data: pendingLogs, error: fetchError } = await supabase
      .from('task_logs')
      .select('id, task_id, user_id')
      .eq('log_date', yesterday)
      .eq('status', 'pending')

    if (fetchError) throw fetchError

    if (!pendingLogs || pendingLogs.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No pending logs to reset', count: 0 }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Mark all as missed and reset streaks
    let resetCount = 0
    for (const log of pendingLogs) {
      // Mark as missed
      await supabase
        .from('task_logs')
        .update({ status: 'missed' })
        .eq('id', log.id)

      // Reset streak to 0 and clear last_completed_date
      await supabase
        .from('streaks')
        .update({ current_streak: 0, last_completed_date: null, updated_at: new Date().toISOString() })
        .eq('task_id', log.task_id)

      resetCount++
    }

    console.log(`Midnight reset: ${resetCount} tasks marked as missed`)

    return new Response(
      JSON.stringify({ success: true, message: `${resetCount} tasks marked as missed`, count: resetCount }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Midnight reset error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
