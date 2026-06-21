import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../ui/ThemeToggle'

function TopBar({ title, subtitle }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!user) return

    async function loadProfile() {
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
      setFullName(data?.full_name ?? null)
    }

    loadProfile()
  }, [user])

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const initial = user?.email ? user.email.charAt(0).toUpperCase() : '?'

  return (
    <div className="w-full bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 py-3 px-8 flex items-center justify-between">
      <div>
        <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</p>
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-100 text-sm flex items-center justify-center">
              {initial}
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {fullName ?? 'Account'}
            </span>
            <i
              className={
                menuOpen
                  ? 'ti ti-chevron-up text-gray-400 dark:text-gray-500'
                  : 'ti ti-chevron-down text-gray-400 dark:text-gray-500'
              }
            />
          </button>

          {menuOpen && (
            <div className="absolute top-full right-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                  {fullName ?? 'Account'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user?.email}</p>
              </div>

              <button
                onClick={() => {
                  setMenuOpen(false)
                  navigate('/settings')
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-left"
              >
                <i className="ti ti-settings text-base" />
                Profile settings
              </button>

              <div className="border-t border-gray-100 dark:border-gray-700" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 cursor-pointer text-left"
              >
                <i className="ti ti-logout text-base" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TopBar
