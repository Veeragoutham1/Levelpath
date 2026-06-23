import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getTodayIST } from '../lib/dateUtils'
import { SIDEBAR_WIDTH } from '../lib/constants'
import Sidebar from '../components/layout/Sidebar'
import StatCard from '../components/ui/StatCard'

function formatJoinedDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTimeAgo(timestamp) {
  if (!timestamp) return ''
  const diffMs = Date.now() - new Date(timestamp).getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  if (diffMinutes < 1) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
}

function getPhaseBadgeClasses(phase) {
  if (phase === 1) return 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
  if (phase === 2) return 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400'
  return 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400'
}

function getPhaseBarClass(phase) {
  if (phase === 1) return 'bg-blue-500'
  if (phase === 2) return 'bg-purple-500'
  return 'bg-orange-500'
}

async function loadAdminData(today) {
  const [profilesRes, progressRes, tasksRes, logsRes, topicsRes, activityRes] = await Promise.all([
    supabase.from('profiles').select('*').order('created_at'),
    supabase.from('user_progress').select('*'),
    supabase.from('tasks').select('*').eq('is_active', true),
    supabase.from('task_logs').select('*').eq('log_date', today),
    supabase.from('topics').select('*'),
    supabase
      .from('user_progress')
      .select('*, profiles(full_name), topics(title)')
      .order('completed_at', { ascending: false })
      .limit(20),
  ])

  return {
    profiles: profilesRes.data ?? [],
    allProgress: progressRes.data ?? [],
    activeTasks: tasksRes.data ?? [],
    todayLogs: logsRes.data ?? [],
    topics: topicsRes.data ?? [],
    recentActivity: activityRes.data ?? [],
  }
}

function RoleBadge({ role }) {
  return (
    <span
      className={
        role === 'admin'
          ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded-full capitalize'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-full capitalize'
      }
    >
      {role}
    </span>
  )
}

function AdminPage() {
  const [profiles, setProfiles] = useState([])
  const [allProgress, setAllProgress] = useState([])
  const [activeTasks, setActiveTasks] = useState([])
  const [todayLogs, setTodayLogs] = useState([])
  const [topics, setTopics] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const result = await loadAdminData(getTodayIST())
        setProfiles(result.profiles)
        setAllProgress(result.allProgress)
        setActiveTasks(result.activeTasks)
        setTodayLogs(result.todayLogs)
        setTopics(result.topics)
        setRecentActivity(result.recentActivity)
      } catch {
        setProfiles([])
        setAllProgress([])
        setActiveTasks([])
        setTodayLogs([])
        setTopics([])
        setRecentActivity([])
      }
      setLoading(false)
    }

    load()
  }, [])

  if (loading) {
    return (
      <>
        <Sidebar />
        <div
          className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center"
          style={{ marginLeft: SIDEBAR_WIDTH }}
        >
          <p className="text-gray-400 dark:text-gray-500 text-sm">Loading admin panel...</p>
        </div>
      </>
    )
  }

  const today = getTodayIST()

  const totalUsers = profiles.length
  const totalActiveTasks = activeTasks.length
  const topicsDoneTodayCount = allProgress.filter(
    (p) => p.completed_at && p.completed_at.slice(0, 10) === today
  ).length
  const tasksDoneTodayCount = todayLogs.filter((l) => l.status === 'yes').length

  const userRows = profiles.map((profile) => {
    const userProgressCount = allProgress.filter((p) => p.user_id === profile.id).length
    const userTasksCount = activeTasks.filter((t) => t.user_id === profile.id).length
    const userTasksDoneToday = todayLogs.filter(
      (l) => l.user_id === profile.id && l.status === 'yes'
    ).length
    const pct = topics.length ? (userProgressCount / topics.length) * 100 : 0
    return { ...profile, userProgressCount, userTasksCount, userTasksDoneToday, pct }
  })

  const topicStats = topics
    .map((topic) => {
      const completedByCount = allProgress.filter(
        (p) => String(p.topic_id) === String(topic.id)
      ).length
      const pct = totalUsers ? (completedByCount / totalUsers) * 100 : 0
      return { ...topic, completedByCount, pct }
    })
    .sort((a, b) => b.completedByCount - a.completedByCount)

  return (
    <>
      <Sidebar />
      <div
        className="min-h-screen bg-gray-50 dark:bg-gray-950 px-8 py-6"
        style={{ marginLeft: SIDEBAR_WIDTH }}
      >
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Panel</h1>
            <span className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs px-2 py-1 rounded-full border border-red-200 dark:border-red-500/30">
              Admin Only
            </span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Platform overview — visible to admins only
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Users"
            value={totalUsers}
            subtext="registered accounts"
            icon="ti-users"
            iconColorClass="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
          />
          <StatCard
            label="Active Tasks"
            value={totalActiveTasks}
            subtext="across all users"
            icon="ti-checkbox"
            iconColorClass="bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400"
          />
          <StatCard
            label="Topics Done Today"
            value={topicsDoneTodayCount}
            subtext="completions today"
            icon="ti-books"
            iconColorClass="bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400"
          />
          <StatCard
            label="Tasks Done Today"
            value={tasksDoneTodayCount}
            subtext="marked yes today"
            icon="ti-check"
            iconColorClass="bg-orange-50 dark:bg-orange-500/10 text-orange-500 dark:text-orange-400"
          />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 mb-6">
          <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
            User Progress
          </p>
          {userRows.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500">No users yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left py-2 font-medium">User</th>
                  <th className="text-left py-2 font-medium">Role</th>
                  <th className="text-left py-2 font-medium">Topics Completed</th>
                  <th className="text-left py-2 font-medium">Progress</th>
                  <th className="text-left py-2 font-medium">Tasks Created</th>
                  <th className="text-left py-2 font-medium">Tasks Done Today</th>
                  <th className="text-left py-2 font-medium">Member since</th>
                </tr>
              </thead>
              <tbody>
                {userRows.map((row, index) => {
                  const isLast = index === userRows.length - 1
                  return (
                    <tr
                      key={row.id}
                      className={
                        isLast
                          ? 'hover:bg-gray-50 dark:hover:bg-gray-800'
                          : 'border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }
                    >
                      <td className="py-3">
                        <p className="text-gray-900 dark:text-gray-100 font-medium">
                          {row.full_name}
                        </p>
                      </td>
                      <td className="py-3">
                        <RoleBadge role={row.role} />
                      </td>
                      <td className="py-3 text-gray-700 dark:text-gray-300">
                        {row.userProgressCount} / {topics.length}
                      </td>
                      <td className="py-3">
                        <div className="w-24 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${row.pct}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3 text-gray-700 dark:text-gray-300">
                        {row.userTasksCount}
                      </td>
                      <td className="py-3 text-gray-700 dark:text-gray-300">
                        {row.userTasksDoneToday}
                      </td>
                      <td className="py-3 text-gray-500 dark:text-gray-400">
                        {formatJoinedDate(row.created_at)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Topic Completion Across All Users
            </p>
            <div className="flex flex-col gap-3">
              {topicStats.map((topic) => (
                <div key={topic.id}>
                  <div className="flex items-center justify-between mb-1 gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${getPhaseBadgeClasses(topic.phase)}`}
                      >
                        Phase {topic.phase}
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {topic.title}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 whitespace-nowrap">
                      {topic.completedByCount} users
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getPhaseBarClass(topic.phase)}`}
                      style={{ width: `${topic.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Recent Activity
            </p>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500">No activity yet</p>
            ) : (
              <div>
                {recentActivity.map((row, index) => {
                  const isLast = index === recentActivity.length - 1
                  return (
                    <div
                      key={row.id}
                      className={
                        isLast
                          ? 'flex items-start gap-3 py-2'
                          : 'flex items-start gap-3 py-2 border-b border-gray-50 dark:border-gray-800'
                      }
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0 mt-1.5" />
                      <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {row.profiles?.full_name ?? 'Someone'}
                        </span>{' '}
                        completed{' '}
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {row.topics?.title ?? 'a topic'}
                        </span>
                      </p>
                      <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap flex-shrink-0">
                        {formatTimeAgo(row.completed_at)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default AdminPage
