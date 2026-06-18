import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/layout/Sidebar'
import TopBar from '../components/layout/TopBar'

const PHASE_NAMES = {
  1: 'Phase 1 — AI Basics',
  2: 'Phase 2 — Agentic Dev',
  3: 'Phase 3 — RAG & Deployment',
}

function getTodayString() {
  return new Date().toISOString().split('T')[0]
}

function getPhaseColorClasses(phase) {
  if (phase === 1) return { bar: 'bg-blue-500', text: 'text-blue-700' }
  if (phase === 2) return { bar: 'bg-purple-500', text: 'text-purple-700' }
  return { bar: 'bg-orange-500', text: 'text-orange-700' }
}

function getPhaseRowBarClass(phase) {
  if (phase === 1) return 'bg-blue-500'
  if (phase === 2) return 'bg-purple-500'
  return 'bg-orange-500'
}

async function loadDashboardData(userId) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [topicsRes, progressRes, tasksRes, logsRes, streaksRes, profileRes] = await Promise.all([
    supabase.from('topics').select('*'),
    supabase.from('user_progress').select('topic_id').eq('user_id', userId),
    supabase.from('tasks').select('*').eq('user_id', userId).eq('is_active', true),
    supabase.from('task_logs').select('*').eq('user_id', userId).gte('log_date', sevenDaysAgo).order('log_date'),
    supabase.from('streaks').select('*').eq('user_id', userId),
    supabase.from('profiles').select('*').eq('id', userId).single(),
  ])

  return {
    topics: topicsRes.data ?? [],
    progress: progressRes.data ?? [],
    tasks: tasksRes.data ?? [],
    logs7d: logsRes.data ?? [],
    streaks: streaksRes.data ?? [],
    profile: profileRes.data ?? null,
  }
}

function StatCard({ label, value, subtext, icon, iconBgClass, iconTextClass }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
        <span className={`w-9 h-9 rounded-full flex items-center justify-center ${iconBgClass}`}>
          <i className={`ti ${icon} ${iconTextClass}`} />
        </span>
      </div>
      <p className="text-3xl font-bold text-gray-900 my-2">{value}</p>
      <p className="text-sm text-gray-500">{subtext}</p>
    </div>
  )
}

function DashboardPage() {
  const { user } = useAuth()
  const [topics, setTopics] = useState([])
  const [completedTopicIds, setCompletedTopicIds] = useState(new Set())
  const [tasks, setTasks] = useState([])
  const [logs7d, setLogs7d] = useState([])
  const [streaks, setStreaks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    async function load() {
      try {
        const result = await loadDashboardData(user.id)
        setTopics(result.topics)
        setCompletedTopicIds(new Set(result.progress.map((row) => String(row.topic_id))))
        setTasks(result.tasks)
        setLogs7d(result.logs7d)
        setStreaks(result.streaks)
      } catch {
        setTopics([])
        setCompletedTopicIds(new Set())
        setTasks([])
        setLogs7d([])
        setStreaks([])
      }
      setLoading(false)
    }

    load()
  }, [user])

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="ml-[220px] min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </>
    )
  }

  const today = getTodayString()

  const totalTopics = topics.length
  const completedCount = completedTopicIds.size
  const completionPct = totalTopics ? Math.round((completedCount / totalTopics) * 100) : 0

  const todaysLogs = logs7d.filter((l) => l.log_date === today)
  const todaysDoneCount = todaysLogs.filter((l) => l.status === 'yes').length
  const todaysPendingCount = todaysLogs.filter((l) => l.status === 'pending').length

  const bestStreak = streaks.reduce(
    (max, s) => (s.current_streak > max.current_streak ? s : max),
    { current_streak: 0, task_id: null }
  )
  const bestStreakTaskName = tasks.find((t) => t.id === bestStreak.task_id)?.name ?? null

  const weekYesCount = logs7d.filter((l) => l.status === 'yes').length

  const phaseNumbers = [...new Set(topics.map((t) => t.phase))].sort((a, b) => a - b)
  const phaseStats = phaseNumbers.map((phase) => {
    const phaseTopics = topics.filter((t) => t.phase === phase)
    const completed = phaseTopics.filter((t) => completedTopicIds.has(String(t.id))).length
    const mandatoryCompleted = phaseTopics.filter(
      (t) => t.is_mandatory && completedTopicIds.has(String(t.id))
    ).length
    const optionalCompleted = phaseTopics.filter(
      (t) => !t.is_mandatory && completedTopicIds.has(String(t.id))
    ).length
    return {
      phase,
      total: phaseTopics.length,
      completed,
      mandatoryCompleted,
      optionalCompleted,
    }
  })

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    const dateStr = date.toISOString().split('T')[0]
    return {
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      count: logs7d.filter((l) => l.log_date === dateStr && l.status === 'yes').length,
    }
  })

  const weekCompletionRate = logs7d.length ? Math.round((weekYesCount / logs7d.length) * 100) : 0

  const streakList = streaks
    .map((s) => ({ ...s, taskName: tasks.find((t) => t.id === s.task_id)?.name }))
    .filter((s) => s.taskName)
    .sort((a, b) => b.current_streak - a.current_streak)

  const maxLongestStreak =
    streaks.reduce((max, s) => Math.max(max, s.longest_streak ?? 0), 0) || 30

  const lastCompletedTopics = [...completedTopicIds]
    .slice(-3)
    .reverse()
    .map((id) => topics.find((t) => String(t.id) === id))
    .filter(Boolean)

  return (
    <>
      <Sidebar />
      <div className="ml-[220px] min-h-screen bg-gray-50">
        <TopBar title="Dashboard" />
        <div className="px-8 py-6">
          <div className="grid grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Topics Completed"
              value={`${completedCount} / ${totalTopics}`}
              subtext={`${completionPct}% complete`}
              icon="ti-books"
              iconBgClass="bg-blue-50"
              iconTextClass="text-blue-600"
            />
            <StatCard
              label="Today's Tasks"
              value={`${todaysDoneCount} done / ${todaysLogs.length} total`}
              subtext={`${todaysPendingCount} pending`}
              icon="ti-check"
              iconBgClass="bg-green-50"
              iconTextClass="text-green-600"
            />
            <StatCard
              label="Best Streak"
              value={`${bestStreak.current_streak} days`}
              subtext={bestStreakTaskName ?? 'No streaks yet'}
              icon="ti-flame"
              iconBgClass="bg-orange-50"
              iconTextClass="text-orange-500"
            />
            <StatCard
              label="This Week"
              value={`${weekYesCount} tasks done`}
              subtext="in the last 7 days"
              icon="ti-chart-bar"
              iconBgClass="bg-purple-50"
              iconTextClass="text-purple-600"
            />
          </div>
  
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-base font-semibold text-gray-900">Learning Plan</p>
              <span className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full">
                {completedCount} of {totalTopics} complete
              </span>
            </div>
  
            <div>
              {phaseStats.map((p, index) => {
                const pct = p.total ? Math.round((p.completed / p.total) * 100) : 0
                const isLast = index === phaseStats.length - 1
                return (
                  <div
                    key={p.phase}
                    className={
                      isLast
                        ? 'flex items-center gap-4 py-3'
                        : 'flex items-center gap-4 py-3 border-b border-gray-50'
                    }
                  >
                    <span className="text-sm font-medium w-48 flex-shrink-0">
                      {PHASE_NAMES[p.phase] ?? `Phase ${p.phase}`}
                    </span>
                    <span className="text-xs text-gray-400 w-20 flex-shrink-0">
                      {p.completed}/{p.total} topics
                    </span>
                    <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getPhaseRowBarClass(p.phase)}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-10 text-right">{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>
  
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-base font-semibold text-gray-900">This week</p>
                <span className="bg-green-50 text-green-700 text-sm px-3 py-1 rounded-full">
                  {weekCompletionRate}% completion
                </span>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={last7Days}>
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-sm text-gray-500 mt-4">{weekYesCount} tasks completed this week</p>
            </div>
  
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <p className="text-base font-semibold text-gray-900 mb-4">Streaks</p>
              {streakList.length === 0 ? (
                <p className="text-sm text-gray-400">Complete tasks daily to build streaks 🔥</p>
              ) : (
                <div>
                  {streakList.map((s, index) => {
                    const barPct = Math.min(100, (s.current_streak / maxLongestStreak) * 100)
                    const isLast = index === streakList.length - 1
                    return (
                      <div key={s.id} className={isLast ? 'py-3' : 'py-3 border-b border-gray-50'}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium text-gray-900">{s.taskName}</span>
                          <span className="text-sm text-gray-500 whitespace-nowrap">
                            🔥 <span className="text-orange-500 font-medium">{s.current_streak}</span>{' '}
                            days
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-400 rounded-full"
                            style={{ width: `${barPct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
  
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
            <p className="text-base font-semibold text-gray-900 mb-4">Phase breakdown</p>
            <div className="grid grid-cols-3 gap-6">
              {phaseStats.map((p) => {
                const colors = getPhaseColorClasses(p.phase)
                const pct = p.total ? Math.round((p.completed / p.total) * 100) : 0
                return (
                  <div key={p.phase}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-sm font-semibold ${colors.text}`}>
                        {PHASE_NAMES[p.phase] ?? `Phase ${p.phase}`}
                      </span>
                      <span className="text-xs text-gray-400">
                        {p.completed}/{p.total}
                      </span>
                    </div>
                    <p className={`text-4xl font-bold ${colors.text}`}>{pct}%</p>
                    <p className="text-sm text-gray-500 mb-3">complete</p>
                    <p className="text-xs text-gray-400 mb-3">
                      {p.mandatoryCompleted} mandatory · {p.optionalCompleted} optional
                    </p>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${colors.bar}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
  
            {lastCompletedTopics.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-2">Recently completed</p>
                <div className="flex flex-col gap-1.5">
                  {lastCompletedTopics.map((topic) => (
                    <div key={topic.id} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{topic.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default DashboardPage
