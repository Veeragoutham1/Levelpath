import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { SIDEBAR_WIDTH } from '../lib/constants'
import Sidebar from '../components/layout/Sidebar'
import TopBar from '../components/layout/TopBar'

function formatMemberSince(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
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

function ProfileSettingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fullName, setFullName] = useState('')
  const [reminderTime, setReminderTime] = useState('19:00')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingReminder, setSavingReminder] = useState(false)

  useEffect(() => {
    if (!user) return

    async function loadProfile() {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data ?? null)
      setFullName(data?.full_name ?? '')
      setReminderTime(data?.reminder_time ?? '19:00')
      setLoading(false)
    }

    loadProfile()
  }, [user])

  async function handleSaveProfile(e) {
    e.preventDefault()
    setSavingProfile(true)

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id)

    setSavingProfile(false)

    if (error) {
      showToast('Something went wrong, please try again', 'error')
      return
    }

    setProfile((prev) => (prev ? { ...prev, full_name: fullName } : prev))
    showToast('Profile updated', 'success')
  }

  async function handleSaveReminder(e) {
    e.preventDefault()
    setSavingReminder(true)

    const { error } = await supabase
      .from('profiles')
      .update({ reminder_time: reminderTime })
      .eq('id', user.id)

    setSavingReminder(false)

    if (error) {
      showToast('Something went wrong, please try again', 'error')
      return
    }

    setProfile((prev) => (prev ? { ...prev, reminder_time: reminderTime } : prev))
    showToast('Reminder preferences saved', 'success')
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (loading) {
    return (
      <>
        <Sidebar />
        <div
          className="min-h-screen bg-gray-50 flex items-center justify-center"
          style={{ marginLeft: SIDEBAR_WIDTH }}
        >
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
        </div>
      </>
    )
  }

  const initial = user?.email ? user.email.charAt(0).toUpperCase() : '?'

  return (
    <>
      <Sidebar />
      <div className="min-h-screen bg-gray-50" style={{ marginLeft: SIDEBAR_WIDTH }}>
        <TopBar title="Profile Settings" />

        <main className="px-8 py-6">
          <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 p-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>

              <div className="flex flex-col items-center mb-6">
                <span className="h-16 w-16 rounded-full bg-gray-900 text-white text-2xl font-semibold flex items-center justify-center">
                  {initial}
                </span>
                <p className="text-xs text-gray-400 mt-2">Profile picture coming soon</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="text-sm font-medium text-gray-700 mb-1 block">
                    Full name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1 block">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={user?.email ?? ''}
                    readOnly
                    className="w-full border border-gray-200 rounded-lg py-2.5 px-3 text-sm bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
                >
                  {savingProfile ? 'Saving...' : 'Save changes'}
                </button>
              </form>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Reminder Preferences</h2>

              <form onSubmit={handleSaveReminder} className="space-y-4">
                <div>
                  <label
                    htmlFor="reminderTime"
                    className="text-sm font-medium text-gray-700 mb-1 block"
                  >
                    Default reminder time
                  </label>
                  <input
                    id="reminderTime"
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full max-w-[200px] border border-gray-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This is your default reminder time for new tasks. You can override it per task.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={savingReminder}
                  className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
                >
                  {savingReminder ? 'Saving...' : 'Save preferences'}
                </button>
              </form>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>
              <p className="text-sm text-gray-600 mb-2">
                Member since {formatMemberSince(profile?.created_at)}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Role:</span>
                <RoleBadge role={profile?.role ?? 'user'} />
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
              <p className="text-sm text-gray-500 mb-4">
                Signing out will end your current session.
              </p>
              <button
                onClick={handleSignOut}
                className="border border-red-300 text-red-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-50"
              >
                Sign out
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export default ProfileSettingsPage
