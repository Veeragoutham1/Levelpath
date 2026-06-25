import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

function getTodayIST(): string {
  const now = new Date()
  const istTime = new Date(now.getTime() + IST_OFFSET_MS)
  return istTime.toISOString().split('T')[0]
}

Deno.serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const resendApiKey = Deno.env.get('RESEND_API_KEY')!
    const today = getTodayIST()

    // Get all tasks with reminders enabled
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, user_id, name')
      .eq('reminder_enabled', true)
      .eq('is_active', true)

    if (tasksError) throw tasksError
    if (!tasks || tasks.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No tasks with reminders', emailsSent: 0 }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Group tasks by user
    const tasksByUser: Record<string, { taskId: string; name: string }[]> = {}
    for (const task of tasks) {
      if (!tasksByUser[task.user_id]) tasksByUser[task.user_id] = []
      tasksByUser[task.user_id].push({ taskId: task.id, name: task.name })
    }

    let emailsSent = 0

    for (const [userId, userTasks] of Object.entries(tasksByUser)) {
      const taskIds = userTasks.map(t => t.taskId)

      // Check which tasks are still pending today
      const { data: logs } = await supabase
        .from('task_logs')
        .select('task_id, status')
        .eq('user_id', userId)
        .eq('log_date', today)
        .in('task_id', taskIds)

      const pendingTaskIds = new Set(
        (logs || []).filter(l => l.status === 'pending').map(l => l.task_id)
      )

      const pendingTasks = userTasks.filter(t => pendingTaskIds.has(t.taskId))
      if (pendingTasks.length === 0) continue

      // Get user profile and email
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single()

      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
      if (usersError) continue

      const authUser = users.find(u => u.id === userId)
      if (!authUser?.email) continue

      const taskListHtml = pendingTasks.map(t => `<li>${t.name}</li>`).join('')

      // Send email via Resend
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Levelpath <onboarding@resend.dev>',
          to: authUser.email,
          subject: 'You have pending tasks today',
          html: `<p>Hi ${profile?.full_name ?? 'there'},</p><p>You still have ${pendingTasks.length} task${pendingTasks.length === 1 ? '' : 's'} to complete today:</p><ul>${taskListHtml}</ul><p>— Levelpath</p>`,
        }),
      })

      const result = await response.json()
      if (result.error) {
        console.error(`Resend error for ${authUser.email}:`, result.error)
      } else {
        emailsSent++
        console.log(`Reminder sent to ${authUser.email}`)
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: `${emailsSent} reminder emails sent`, emailsSent }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Evening reminder error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
