import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getTodayIST, getISTDayOfWeek, getYesterdayIST } from '../lib/dateUtils'
import { SIDEBAR_WIDTH } from '../lib/constants'
import Sidebar from '../components/layout/Sidebar'
import TopBar from '../components/layout/TopBar'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const DEFAULT_FORM = {
  name: '',
  notes: '',
  priority: 'medium',
  scheduleType: 'daily',
  startDate: '',
  endDate: '',
  excludedDays: [],
  reminderEnabled: false,
  reminderTime: '19:00',
}

function formatTodayLong() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

async function loadTaskTrackerData(userId, todayStr) {
  const { data: tasksData } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at')

  const activeTasks = tasksData ?? []

  const { data: logsData } = await supabase
    .from('task_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('log_date', todayStr)

  const existingLogs = logsData ?? []
  const tasksMissingLogs = activeTasks.filter(
    (task) => !existingLogs.some((log) => log.task_id === task.id)
  )

  let finalLogs = existingLogs
  if (tasksMissingLogs.length > 0) {
    const { error: insertError } = await supabase.from('task_logs').insert(
      tasksMissingLogs.map((task) => ({
        task_id: task.id,
        user_id: userId,
        log_date: todayStr,
        status: 'pending',
      }))
    )

    if (!insertError) {
      const { data: refreshedLogs } = await supabase
        .from('task_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('log_date', todayStr)

      finalLogs = refreshedLogs ?? []
    }
  }

  const { data: streaksData } = await supabase.from('streaks').select('*').eq('user_id', userId)

  return { tasks: activeTasks, todayLogs: finalLogs, streaks: streaksData ?? [] }
}

function getPriorityAccentClass(priority) {
  if (priority === 'high') return 'border-l-4 border-l-red-500'
  if (priority === 'medium') return 'border-l-4 border-l-yellow-400'
  return 'border-l-4 border-l-blue-400'
}

function PriorityBadge({ priority }) {
  const classes =
    priority === 'high'
      ? 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400'
      : priority === 'medium'
        ? 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
        : 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${classes}`}>
      {priority}
    </span>
  )
}

function TaskCard({ task, status, streak, onMark, isMarking }) {
  return (
    <div
      className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 mb-3 w-full flex items-start justify-between gap-4 ${getPriorityAccentClass(task.priority)}`}
    >
      <div className="min-w-0">
        <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{task.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            {task.schedule_type === 'goal' ? 'Goal-based' : 'Daily'}
          </span>
          {task.schedule_type === 'goal' && task.end_date && (
            <span className="text-xs text-gray-500 dark:text-gray-400">Ends {task.end_date}</span>
          )}
        </div>
        {task.notes && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{task.notes}</p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
          🔥 {streak} day streak
        </span>
        <button
          onClick={() => onMark('yes')}
          disabled={isMarking}
          className={
            status === 'yes'
              ? 'text-sm font-medium px-5 py-2 rounded-md border bg-green-500 text-white border-green-500 disabled:opacity-50'
              : 'text-sm font-medium px-5 py-2 rounded-md border bg-white dark:bg-gray-900 text-green-600 dark:text-green-400 border-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 disabled:opacity-50'
          }
        >
          Yes
        </button>
        <button
          onClick={() => onMark('no')}
          disabled={isMarking}
          className={
            status === 'no'
              ? 'text-sm font-medium px-5 py-2 rounded-md border bg-red-500 text-white border-red-500 disabled:opacity-50'
              : 'text-sm font-medium px-5 py-2 rounded-md border bg-white dark:bg-gray-900 text-red-600 dark:text-red-400 border-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50'
          }
        >
          No
        </button>
      </div>
    </div>
  )
}

function TaskForm({ form, setForm, editingTask, onToggleExcludedDay, onSubmit, onCancel }) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6 flex flex-col gap-4"
    >
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
        {editingTask ? 'Edit Task' : 'New Task'}
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Task name
        </label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notes
        </label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
          rows={2}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <select
            value={form.priority}
            onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Schedule type
          </label>
          <select
            value={form.scheduleType}
            onChange={(e) => setForm((prev) => ({ ...prev, scheduleType: e.target.value }))}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <option value="daily">Daily</option>
            <option value="goal">Goal-based</option>
          </select>
        </div>
      </div>

      {form.scheduleType === 'goal' && (
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start date
            </label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End date
            </label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Exclude days
        </label>
        <div className="flex gap-3">
          {DAY_LABELS.map((label, index) => (
            <label
              key={label}
              className="flex flex-col items-center gap-1 text-xs text-gray-600 dark:text-gray-400 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={form.excludedDays.includes(index)}
                onChange={() => onToggleExcludedDay(index)}
                className="h-4 w-4 accent-gray-900 dark:accent-gray-100"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="reminderEnabled"
          checked={form.reminderEnabled}
          onChange={(e) => setForm((prev) => ({ ...prev, reminderEnabled: e.target.checked }))}
          className="h-4 w-4 accent-gray-900 dark:accent-gray-100"
        />
        <label
          htmlFor="reminderEnabled"
          className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
        >
          Enable email reminder
        </label>
      </div>

      {form.reminderEnabled && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
          ⚠️ Email reminders are currently in beta. Notifications are only sent to the platform
          admin during this period.
        </p>
      )}

      {form.reminderEnabled && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Reminder time
          </label>
          <input
            type="time"
            value={form.reminderTime}
            onChange={(e) => setForm((prev) => ({ ...prev, reminderTime: e.target.value }))}
            className="w-full max-w-[200px] rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
      )}

      <div className="flex gap-3 mt-2">
        <button
          type="submit"
          className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function TaskTrackerPage() {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [view, setView] = useState('daily')
  const [tasks, setTasks] = useState([])
  const [todayLogs, setTodayLogs] = useState([])
  const [streaks, setStreaks] = useState([])
  const [loading, setLoading] = useState(true)
  const [markingTaskId, setMarkingTaskId] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [confirmDeleteTaskId, setConfirmDeleteTaskId] = useState(null)
  const [form, setForm] = useState(DEFAULT_FORM)

  const today = getTodayIST()
  const todayDow = getISTDayOfWeek()

  useEffect(() => {
    if (!user) return

    async function load() {
      const result = await loadTaskTrackerData(user.id, today)
      setTasks(result.tasks)
      setTodayLogs(result.todayLogs)
      setStreaks(result.streaks)
      setLoading(false)
    }

    load()
  }, [user, today])

  async function refreshTaskData() {
    const result = await loadTaskTrackerData(user.id, today)
    setTasks(result.tasks)
    setTodayLogs(result.todayLogs)
    setStreaks(result.streaks)
  }

  function getLogForTask(taskId) {
    return todayLogs.find((log) => log.task_id === taskId) ?? null
  }

  function getStreakForTask(taskId) {
    return streaks.find((s) => s.task_id === taskId) ?? null
  }

  function isExcludedDay(task) {
    return Array.isArray(task.excluded_days) && task.excluded_days.includes(todayDow)
  }

  async function updateStreakOnYes(taskId) {
    const existing = getStreakForTask(taskId)

    if (!existing) {
      const newStreak = {
        task_id: taskId,
        user_id: user.id,
        current_streak: 1,
        longest_streak: 1,
        last_completed_date: today,
      }
      const { data, error } = await supabase.from('streaks').insert(newStreak).select().single()
      if (error) return
      setStreaks((prev) => [...prev, data ?? newStreak])
      return
    }

    if (existing.last_completed_date === today) {
      // Already confirmed today — re-clicking Yes shouldn't change the streak.
      return
    }

    const wasYesterday = existing.last_completed_date === getYesterdayIST()
    const newCurrentStreak = wasYesterday ? existing.current_streak + 1 : 1
    const newLongestStreak = Math.max(existing.longest_streak, newCurrentStreak)

    const { error } = await supabase
      .from('streaks')
      .update({
        current_streak: newCurrentStreak,
        longest_streak: newLongestStreak,
        last_completed_date: today,
      })
      .eq('id', existing.id)

    if (error) return

    setStreaks((prev) =>
      prev.map((s) =>
        s.id === existing.id
          ? {
              ...s,
              current_streak: newCurrentStreak,
              longest_streak: newLongestStreak,
              last_completed_date: today,
            }
          : s
      )
    )
  }

  async function resetStreakToZero(taskId) {
    const existing = getStreakForTask(taskId)
    if (!existing) return

    const { error } = await supabase
      .from('streaks')
      .update({ current_streak: 0, last_completed_date: null })
      .eq('id', existing.id)

    if (error) return

    setStreaks((prev) =>
      prev.map((s) =>
        s.id === existing.id ? { ...s, current_streak: 0, last_completed_date: null } : s
      )
    )
  }

  async function handleMark(task, status) {
    const log = getLogForTask(task.id)
    if (!log) return

    if (log.status === status) {
      // Already in this state — re-clicking the same button is a no-op.
      if (status === 'yes') {
        showToast('Marked as done', 'success')
      } else {
        showToast('Marked as not done', 'info')
      }
      return
    }

    setMarkingTaskId(task.id)

    try {
      const { error } = await supabase
        .from('task_logs')
        .update({ status, marked_at: new Date().toISOString() })
        .eq('id', log.id)

      if (error) {
        showToast('Something went wrong, please try again', 'error')
        return
      }

      setTodayLogs((prev) =>
        prev.map((l) =>
          l.id === log.id ? { ...l, status, marked_at: new Date().toISOString() } : l
        )
      )

      if (status === 'yes') {
        await updateStreakOnYes(task.id)
        showToast('Marked as done', 'success')
      } else if (status === 'no') {
        await resetStreakToZero(task.id)
        showToast('Marked as not done', 'info')
      }
    } finally {
      setMarkingTaskId(null)
    }
  }

  function openCreateForm() {
    setEditingTask(null)
    setForm(DEFAULT_FORM)
    setShowCreateForm(true)
  }

  function openEditForm(task) {
    setEditingTask(task)
    setForm({
      name: task.name,
      notes: task.notes ?? '',
      priority: task.priority,
      scheduleType: task.schedule_type,
      startDate: task.start_date ?? '',
      endDate: task.end_date ?? '',
      excludedDays: task.excluded_days ?? [],
      reminderEnabled: task.reminder_enabled,
      reminderTime: task.reminder_time ?? '19:00',
    })
    setShowCreateForm(true)
  }

  function closeForm() {
    setShowCreateForm(false)
    setEditingTask(null)
    setForm(DEFAULT_FORM)
  }

  function toggleExcludedDay(dayIndex) {
    setForm((prev) => ({
      ...prev,
      excludedDays: prev.excludedDays.includes(dayIndex)
        ? prev.excludedDays.filter((d) => d !== dayIndex)
        : [...prev.excludedDays, dayIndex],
    }))
  }

  async function handleSaveTask(e) {
    e.preventDefault()

    const payload = {
      name: form.name,
      notes: form.notes || null,
      priority: form.priority,
      schedule_type: form.scheduleType,
      start_date: form.scheduleType === 'goal' ? form.startDate || null : null,
      end_date: form.scheduleType === 'goal' ? form.endDate || null : null,
      excluded_days: form.excludedDays,
      reminder_enabled: form.reminderEnabled,
      reminder_time: form.reminderEnabled ? form.reminderTime : null,
    }

    const { error } = editingTask
      ? await supabase.from('tasks').update(payload).eq('id', editingTask.id)
      : await supabase.from('tasks').insert({ ...payload, user_id: user.id, is_active: true })

    if (error) {
      showToast('Something went wrong, please try again', 'error')
      return
    }

    closeForm()
    await refreshTaskData()
    showToast(editingTask ? 'Task updated' : 'Task created', 'success')
  }

  async function handleDeleteTask(taskId) {
    const { error } = await supabase.from('tasks').update({ is_active: false }).eq('id', taskId)

    if (error) {
      showToast('Something went wrong, please try again', 'error')
      return
    }

    await supabase.from('streaks').delete().eq('task_id', taskId).eq('user_id', user.id)

    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    setStreaks((prev) => prev.filter((s) => s.task_id !== taskId))
    showToast('Task deleted', 'success')
  }

  if (loading) {
    return (
      <>
        <Sidebar />
        <div
          className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center"
          style={{ marginLeft: SIDEBAR_WIDTH }}
        >
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 dark:border-gray-700 border-t-gray-900 dark:border-t-gray-100" />
        </div>
      </>
    )
  }

  const visibleTasks = tasks.filter((t) => !isExcludedDay(t))
  const doneCount = visibleTasks.filter((t) => getLogForTask(t.id)?.status === 'yes').length
  const notDoneCount = visibleTasks.filter((t) => getLogForTask(t.id)?.status === 'no').length
  const pendingCount = visibleTasks.filter(
    (t) => (getLogForTask(t.id)?.status ?? 'pending') === 'pending'
  ).length
  const progressPct = visibleTasks.length ? (doneCount / visibleTasks.length) * 100 : 0

  return (
    <>
      <Sidebar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950" style={{ marginLeft: SIDEBAR_WIDTH }}>
        <TopBar title="Task Tracker" />

        <main className="px-8 py-6">
          <div className="flex items-center justify-center gap-2 mb-6">
            <button
              onClick={() => setView('daily')}
              className={
                view === 'daily'
                  ? 'text-sm font-medium px-4 py-2 rounded-md bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                  : 'text-sm font-medium px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }
            >
              Today's Tasks
            </button>
            <button
              onClick={() => setView('manage')}
              className={
                view === 'manage'
                  ? 'text-sm font-medium px-4 py-2 rounded-md bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                  : 'text-sm font-medium px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }
            >
              All Tasks
            </button>
          </div>

          {view === 'daily' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Today's Tasks
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{formatTodayLong()}</p>

                {tasks.length > 0 && (
                  <>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                      {doneCount} of {visibleTasks.length} tasks done today
                    </p>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full bg-gray-900 dark:bg-gray-100 rounded-full transition-all"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </>
                )}
              </div>

              {tasks.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-400 dark:text-gray-500 text-sm">
                    No tasks yet. Click 'All Tasks' to create your first task.
                  </p>
                </div>
              ) : visibleTasks.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-400 dark:text-gray-500 text-sm">
                    Nothing scheduled for today.
                  </p>
                </div>
              ) : (
                <div>
                  {visibleTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      status={getLogForTask(task.id)?.status ?? 'pending'}
                      streak={getStreakForTask(task.id)?.current_streak ?? 0}
                      onMark={(status) => handleMark(task, status)}
                      isMarking={markingTaskId === task.id}
                    />
                  ))}
                </div>
              )}

              {visibleTasks.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                    Daily Progress
                  </h2>
                  <div className="flex gap-3">
                    <span className="text-sm font-medium px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400">
                      {doneCount} completed
                    </span>
                    <span className="text-sm font-medium px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400">
                      {notDoneCount} not done
                    </span>
                    <span className="text-sm font-medium px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      {pendingCount} pending
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {view === 'manage' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">All Tasks</h1>
                <button
                  onClick={openCreateForm}
                  className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200"
                >
                  New Task
                </button>
              </div>

              {showCreateForm && (
                <TaskForm
                  form={form}
                  setForm={setForm}
                  editingTask={editingTask}
                  onToggleExcludedDay={toggleExcludedDay}
                  onSubmit={handleSaveTask}
                  onCancel={closeForm}
                />
              )}

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl divide-y divide-gray-100 dark:divide-gray-800">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between gap-4 px-4 py-3 ${getPriorityAccentClass(task.priority)}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {task.name}
                      </p>
                      <PriorityBadge priority={task.priority} />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {task.schedule_type === 'goal' ? 'Goal-based' : 'Daily'}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(task.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {confirmDeleteTaskId === task.id ? (
                        <>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Delete this task?
                          </span>
                          <button
                            onClick={() => {
                              handleDeleteTask(task.id)
                              setConfirmDeleteTaskId(null)
                            }}
                            className="bg-red-500 text-white text-xs font-medium px-3 py-1.5 rounded-md hover:bg-red-600"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDeleteTaskId(null)}
                            className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium px-3 py-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => openEditForm(task)}
                            className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 px-2 py-1"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setConfirmDeleteTaskId(task.id)}
                            className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-2 py-1"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <p className="text-sm text-gray-400 dark:text-gray-500 px-4 py-6 text-center">
                    No tasks yet.
                  </p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}

export default TaskTrackerPage
