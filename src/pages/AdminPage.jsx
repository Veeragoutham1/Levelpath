import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Sidebar from '../components/layout/Sidebar'

function getTodayString() {
  return new Date().toISOString().split('T')[0]
}

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
  if (phase === 1) return 'bg-blue-50 text-blue-700'
  if (phase === 2) return 'bg-purple-50 text-purple-700'
  return 'bg-orange-50 text-orange-700'
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

function RoleBadge({ role }) {
  return (
    <span
      className={
        role === 'admin'
          ? 'bg-gray-900 text-white text-xs px-2 py-1 rounded-full capitalize'
          : 'bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full capitalize'
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
        const result = await loadAdminData(getTodayString())
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
        <div className="ml-[220px] min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-400 text-sm">Loading admin panel...</p>
        </div>
      </>
    )
  }

  const today = getTodayString()

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
      <div className="ml-[220px] min-h-screen bg-gray-50 px-8 py-6">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <span className="bg-red-50 text-red-600 text-xs px-2 py-1 rounded-full border border-red-200">
              Admin Only
            </span>
          </div>
          <p className="text-gray-500 mt-1">Platform overview — visible to admins only</p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Users"
            value={totalUsers}
            subtext="registered accounts"
            icon="ti-users"
            iconBgClass="bg-blue-50"
            iconTextClass="text-blue-600"
          />
          <StatCard
            label="Active Tasks"
            value={totalActiveTasks}
            subtext="across all users"
            icon="ti-checkbox"
            iconBgClass="bg-green-50"
            iconTextClass="text-green-600"
          />
          <StatCard
            label="Topics Done Today"
            value={topicsDoneTodayCount}
            subtext="completions today"
            icon="ti-books"
            iconBgClass="bg-purple-50"
            iconTextClass="text-purple-600"
          />
          <StatCard
            label="Tasks Done Today"
            value={tasksDoneTodayCount}
            subtext="marked yes today"
            icon="ti-check"
            iconBgClass="bg-orange-50"
            iconTextClass="text-orange-500"
          />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <p className="text-base font-semibold text-gray-900 mb-4">User Progress</p>
          {userRows.length === 0 ? (
            <p className="text-sm text-gray-400">No users yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  <th className="text-left py-2 font-medium">User</th>
                  <th className="text-left py-2 font-medium">Role</th>
                  <th className="text-left py-2 font-medium">Topics Completed</th>
                  <th className="text-left py-2 font-medium">Progress</th>
                  <th className="text-left py-2 font-medium">Tasks Created</th>
                  <th className="text-left py-2 font-medium">Tasks Done Today</th>
                  <th className="text-left py-2 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {userRows.map((row, index) => {
                  const isLast = index === userRows.length - 1
                  return (
                    <tr
                      key={row.id}
                      className={
                        isLast ? 'hover:bg-gray-50' : 'border-b border-gray-50 hover:bg-gray-50'
                      }
                    >
                      <td className="py-3">
                        <p className="text-gray-900 font-medium">{row.full_name}</p>
                        <p className="text-xs text-gray-400">{row.email}</p>
                      </td>
                      <td className="py-3">
                        <RoleBadge role={row.role} />
                      </td>
                      <td className="py-3 text-gray-700">
                        {row.userProgressCount} / {topics.length}
                      </td>
                      <td className="py-3">
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${row.pct}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3 text-gray-700">{row.userTasksCount}</td>
                      <td className="py-3 text-gray-700">{row.userTasksDoneToday}</td>
                      <td className="py-3 text-gray-500">{formatJoinedDate(row.created_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <p className="text-base font-semibold text-gray-900 mb-4">
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
                      <span className="text-sm text-gray-700 truncate">{topic.title}</span>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
                      {topic.completedByCount} users
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getPhaseBarClass(topic.phase)}`}
                      style={{ width: `${topic.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <p className="text-base font-semibold text-gray-900 mb-4">Recent Activity</p>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-gray-400">No activity yet</p>
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
                          : 'flex items-start gap-3 py-2 border-b border-gray-50'
                      }
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0 mt-1.5" />
                      <p className="text-sm text-gray-700 flex-1">
                        <span className="font-medium text-gray-900">
                          {row.profiles?.full_name ?? 'Someone'}
                        </span>{' '}
                        completed{' '}
                        <span className="font-medium text-gray-900">
                          {row.topics?.title ?? 'a topic'}
                        </span>
                      </p>
                      <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
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
