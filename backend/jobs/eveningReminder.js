import { supabaseAdmin } from '../supabaseAdmin.js'

function getTodayString() {
  return new Date().toISOString().split('T')[0]
}

export async function runEveningReminder(resend) {
  const today = getTodayString()

  const { data: reminderTasks, error: tasksError } = await supabaseAdmin
    .from('tasks')
    .select('id, user_id, name, reminder_time')
    .eq('reminder_enabled', true)
    .eq('is_active', true)

  if (tasksError) {
    throw tasksError
  }

  const tasks = reminderTasks ?? []

  const tasksByUser = {}
  for (const task of tasks) {
    if (!tasksByUser[task.user_id]) {
      tasksByUser[task.user_id] = []
    }
    tasksByUser[task.user_id].push(task)
  }

  const { data: usersList, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
  if (usersError) {
    throw usersError
  }
  const authUsers = usersList?.users ?? []

  let emailsSent = 0

  for (const [userId, userTasks] of Object.entries(tasksByUser)) {
    const userTaskIds = userTasks.map((task) => task.id)

    const { data: logsData, error: logsError } = await supabaseAdmin
      .from('task_logs')
      .select('task_id, status')
      .eq('user_id', userId)
      .eq('log_date', today)
      .in('task_id', userTaskIds)

    if (logsError) {
      throw logsError
    }

    const logs = logsData ?? []
    const pendingTasks = userTasks.filter((task) => {
      const log = logs.find((l) => l.task_id === task.id)
      return (log?.status ?? 'pending') === 'pending'
    })

    if (pendingTasks.length === 0) {
      continue
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single()

    const authUser = authUsers.find((u) => u.id === userId)
    const email = authUser?.email

    if (!email) {
      continue
    }

    const taskListHtml = pendingTasks.map((task) => `<li>${task.name}</li>`).join('')

    try {
      const response = await resend.emails.send({
        from: 'Levelpath <onboarding@resend.dev>',
        to: email,
        subject: 'You have pending tasks today',
        html: `
          <p>Hi ${profile?.full_name ?? 'there'},</p>
          <p>You still have ${pendingTasks.length} task${pendingTasks.length === 1 ? '' : 's'} to complete today:</p>
          <ul>${taskListHtml}</ul>
          <p>— Levelpath</p>
        `,
      })

      console.log(`Resend response for ${email}:`, JSON.stringify(response))

      if (response.error) {
        console.error(`Resend returned an error for ${email}:`, response.error)
      } else {
        emailsSent += 1
      }
    } catch (err) {
      console.error(`resend.emails.send threw for ${email}:`, err)
    }
  }

  console.log(`Evening reminder: ${emailsSent} emails sent`)
}
