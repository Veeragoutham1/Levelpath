import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { getTodayIST, getDaysAgoIST } from '../lib/dateUtils'
import { PHASE_NAMES, SIDEBAR_WIDTH } from '../lib/constants'
import Sidebar from '../components/layout/Sidebar'
import TopBar from '../components/layout/TopBar'
import StatCard from '../components/ui/StatCard'

function getPhaseColorClasses(phase) {
  if (phase === 1) return { bar: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-400' }
  if (phase === 2) return { bar: 'bg-purple-500', text: 'text-purple-700 dark:text-purple-400' }
  return { bar: 'bg-orange-500', text: 'text-orange-700 dark:text-orange-400' }
}

function getPhaseRowBarClass(phase) {
  if (phase === 1) return 'bg-blue-500'
  if (phase === 2) return 'bg-purple-500'
  return 'bg-orange-500'
}

async function loadDashboardData(userId) {
  const sevenDaysAgo = getDaysAgoIST(7)

  const [topicsRes, progressRes, tasksRes, logsRes, streaksRes, profileRes, customTopicsRes] =
    await Promise.all([
      supabase.from('topics').select('*'),
      supabase.from('user_progress').select('topic_id').eq('user_id', userId),
      supabase.from('tasks').select('*').eq('user_id', userId).eq('is_active', true),
      supabase
        .from('task_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('log_date', sevenDaysAgo)
        .order('log_date'),
      supabase.from('streaks').select('*').eq('user_id', userId),
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('custom_topics').select('*').eq('user_id', userId),
    ])

  return {
    topics: topicsRes.data ?? [],
    progress: progressRes.data ?? [],
    tasks: tasksRes.data ?? [],
    logs7d: logsRes.data ?? [],
    streaks: streaksRes.data ?? [],
    profile: profileRes.data ?? null,
    customTopics: customTopicsRes.data ?? [],
  }
}

function DashboardPage() {
  const { user } = useAuth()
  const { resolvedTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [topics, setTopics] = useState([])
  const [completedTopicIds, setCompletedTopicIds] = useState(new Set())
  const [tasks, setTasks] = useState([])
  const [logs7d, setLogs7d] = useState([])
  const [streaks, setStreaks] = useState([])
  const [customTopics, setCustomTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPlanView, setSelectedPlanView] = useState('genai')
  const [planMenuOpen, setPlanMenuOpen] = useState(false)
  const planMenuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (planMenuRef.current && !planMenuRef.current.contains(e.target)) {
        setPlanMenuOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

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
        setCustomTopics(result.customTopics)
      } catch {
        setTopics([])
        setCompletedTopicIds(new Set())
        setTasks([])
        setLogs7d([])
        setStreaks([])
        setCustomTopics([])
      }
      setLoading(false)
    }

    load()
  }, [user, location.key])

  if (loading) {
    return (
      <>
        <Sidebar />
        <div
          className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center"
          style={{ marginLeft: SIDEBAR_WIDTH }}
        >
          <p className="text-gray-400 dark:text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </>
    )
  }

  const isDark = resolvedTheme === 'dark'
  const today = getTodayIST()

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
    const dateStr = getDaysAgoIST(6 - i)
    const label = new Date(`${dateStr}T00:00:00Z`).toLocaleDateString('en-US', {
      weekday: 'short',
      timeZone: 'UTC',
    })
    return {
      label,
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

  const customPathGroups = {}
  for (const topic of customTopics) {
    if (!customPathGroups[topic.path_name]) {
      customPathGroups[topic.path_name] = []
    }
    customPathGroups[topic.path_name].push(topic)
  }
  const customPathNames = [...new Set(customTopics.map((t) => t.path_name))].sort()

  const selectedCustomPathTopics =
    selectedPlanView !== 'genai' ? customPathGroups[selectedPlanView] ?? [] : []
  const selectedCustomCompletedCount = selectedCustomPathTopics.filter(
    (t) => t.is_completed
  ).length
  const selectedCustomCompletionPct = selectedCustomPathTopics.length
    ? Math.round((selectedCustomCompletedCount / selectedCustomPathTopics.length) * 100)
    : 0

  return (
    <>
      <Sidebar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950" style={{ marginLeft: SIDEBAR_WIDTH }}>
        <TopBar title="Dashboard" />
        <div className="px-8 py-6">
          <div className="grid grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Topics Completed"
              value={
                selectedPlanView === 'genai'
                  ? `${completedCount} / ${totalTopics}`
                  : `${selectedCustomCompletedCount} / ${selectedCustomPathTopics.length}`
              }
              subtext={
                selectedPlanView === 'genai'
                  ? `${completionPct}% complete`
                  : `${selectedCustomCompletionPct}% complete`
              }
              icon="ti-books"
              iconColorClass="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
            />
            <StatCard
              label="Today's Tasks"
              value={`${todaysDoneCount} done / ${todaysLogs.length} total`}
              subtext={`${todaysPendingCount} pending`}
              icon="ti-check"
              iconColorClass="bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400"
            />
            <StatCard
              label="Best Streak"
              value={`${bestStreak.current_streak} days`}
              subtext={bestStreakTaskName ?? 'No streaks yet'}
              icon="ti-flame"
              iconColorClass="bg-orange-50 dark:bg-orange-500/10 text-orange-500 dark:text-orange-400"
            />
            <StatCard
              label="This Week"
              value={`${weekYesCount} tasks done`}
              subtext="in the last 7 days"
              icon="ti-chart-bar"
              iconColorClass="bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400"
            />
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div ref={planMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setPlanMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 border border-gray-900 dark:border-gray-400 rounded-lg px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {selectedPlanView === 'genai' ? 'Gen AI Learning Plan' : selectedPlanView}
                  <i className="ti ti-chevron-down text-base" />
                </button>

                {planMenuOpen && (
                  <div className="absolute left-0 top-full mt-1 min-w-[220px] bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md z-50 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlanView('genai')
                        setPlanMenuOpen(false)
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <i className="ti ti-books text-blue-500" />
                      <span className="flex-1">Gen AI Learning Plan</span>
                      {selectedPlanView === 'genai' && (
                        <i className="ti ti-check text-blue-500" />
                      )}
                    </button>

                    {customPathNames.map((pathName) => (
                      <button
                        key={pathName}
                        type="button"
                        onClick={() => {
                          setSelectedPlanView(pathName)
                          setPlanMenuOpen(false)
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <i className="ti ti-route text-gray-400" />
                        <span className="flex-1">{pathName}</span>
                        {selectedPlanView === pathName && (
                          <i className="ti ti-check text-blue-500" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-sm px-3 py-1 rounded-full">
                {selectedPlanView === 'genai'
                  ? `${completedCount} of ${totalTopics} complete`
                  : `${selectedCustomCompletedCount} of ${selectedCustomPathTopics.length} complete`}
              </span>
            </div>

            {selectedPlanView === 'genai' ? (
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
                          : 'flex items-center gap-4 py-3 border-b border-gray-50 dark:border-gray-800'
                      }
                    >
                      <span className="text-sm font-medium w-48 flex-shrink-0 text-gray-700 dark:text-gray-300">
                        {PHASE_NAMES[p.phase] ?? `Phase ${p.phase}`}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 w-20 flex-shrink-0">
                        {p.completed}/{p.total} topics
                      </span>
                      <div className="flex-1 bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getPhaseRowBarClass(p.phase)}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-10 text-right">
                        {pct}%
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div>
                {selectedCustomPathTopics.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
                    No topics in this path yet
                  </p>
                ) : (
                  selectedCustomPathTopics.map((topic, index) => {
                    const pct = topic.is_completed ? 100 : 0
                    const isLast = index === selectedCustomPathTopics.length - 1
                    return (
                      <div
                        key={topic.id}
                        className={
                          isLast
                            ? 'flex items-center gap-4 py-3'
                            : 'flex items-center gap-4 py-3 border-b border-gray-50 dark:border-gray-800'
                        }
                      >
                        <span className="text-sm font-medium w-48 flex-shrink-0 text-gray-700 dark:text-gray-300 truncate">
                          {topic.title}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 w-20 flex-shrink-0">
                          {topic.is_completed ? 1 : 0}/1 topics
                        </span>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-10 text-right">
                          {pct}%
                        </span>
                      </div>
                    )
                  })
                )}
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => navigate('/custom-path')}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View path →
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  This week
                </p>
                <span className="bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-sm px-3 py-1 rounded-full">
                  {weekCompletionRate}% completion
                </span>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={last7Days}>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: isDark ? '#9ca3af' : '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6' }}
                    contentStyle={{
                      borderRadius: 8,
                      border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
                      backgroundColor: isDark ? '#1f2937' : '#ffffff',
                      color: isDark ? '#f3f4f6' : '#111827',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" fill={isDark ? '#818cf8' : '#6366f1'} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                {weekYesCount} tasks completed this week
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Streaks
              </p>
              {streakList.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Complete tasks daily to build streaks 🔥
                </p>
              ) : (
                <div>
                  {streakList.map((s, index) => {
                    const barPct = Math.min(100, (s.current_streak / maxLongestStreak) * 100)
                    const isLast = index === streakList.length - 1
                    return (
                      <div
                        key={s.id}
                        className={isLast ? 'py-3' : 'py-3 border-b border-gray-50 dark:border-gray-800'}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {s.taskName}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            🔥{' '}
                            <span className="text-orange-500 dark:text-orange-400 font-medium">
                              {s.current_streak}
                            </span>{' '}
                            days
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
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

          {selectedPlanView === 'genai' && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 mb-6">
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Phase breakdown
              </p>
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
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {p.completed}/{p.total}
                        </span>
                      </div>
                      <p className={`text-4xl font-bold ${colors.text}`}>{pct}%</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">complete</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                        {p.mandatoryCompleted} mandatory · {p.optionalCompleted} optional
                      </p>
                      <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${colors.bar}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {lastCompletedTopics.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Recently completed</p>
                  <div className="flex flex-col gap-1.5">
                    {lastCompletedTopics.map((topic) => (
                      <div key={topic.id} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {topic.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default DashboardPage
