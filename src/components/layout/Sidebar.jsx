import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: 'ti-layout-dashboard' },
  { to: '/learn', label: 'Learning Plan', icon: 'ti-books' },
  { to: '/tasks', label: 'Tasks', icon: 'ti-checkbox' },
]

function Sidebar() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!user) return

    async function checkAdmin() {
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (data?.role === 'admin') {
        setIsAdmin(true)
      }
    }

    checkAdmin()
  }, [user])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const initial = user?.email ? user.email.charAt(0).toUpperCase() : '?'

  return (
    <div className="fixed left-0 top-0 h-screen w-[220px] z-40 bg-white border-r border-gray-200 flex flex-col">
      <div className="px-4 py-4">
        <p className="text-lg font-bold text-gray-900">Levelpath</p>
        <p className="text-xs text-gray-500 mt-0.5">by Veera</p>
      </div>

      <div className="border-b border-gray-200" />

      <nav className="flex-1 py-3 flex flex-col gap-1">
        {NAV_LINKS.map((link) => {
          const isActive = location.pathname === link.to

          return (
            <Link
              key={link.to}
              to={link.to}
              className={
                isActive
                  ? 'flex items-center gap-3 py-2 px-4 rounded-r-md w-full cursor-pointer bg-blue-50 text-blue-600 border-l-2 border-blue-600'
                  : 'flex items-center gap-3 py-2 px-4 rounded-r-md w-full cursor-pointer text-gray-600 border-l-2 border-transparent hover:bg-gray-50'
              }
            >
              <i className={`ti ${link.icon} text-lg`} />
              <span className="text-sm font-medium">{link.label}</span>
            </Link>
          )
        })}

        {isAdmin && (
          <>
            <div className="border-t border-gray-100 my-2" />
            <Link
              to="/admin"
              className={
                location.pathname === '/admin'
                  ? 'flex items-center gap-3 py-2 px-4 rounded-r-md w-full cursor-pointer bg-blue-50 text-blue-600 border-l-2 border-blue-600'
                  : 'flex items-center gap-3 py-2 px-4 rounded-r-md w-full cursor-pointer text-gray-600 border-l-2 border-transparent hover:bg-gray-50'
              }
            >
              <i className="ti ti-shield text-lg" />
              <span className="text-sm font-medium">Admin</span>
            </Link>
          </>
        )}
      </nav>

      <div className="px-4 py-4 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-2 min-w-0">
          <span className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-900 text-white text-sm font-semibold flex items-center justify-center">
            {initial}
          </span>
          <span className="text-xs text-gray-500 truncate">{user?.email}</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs font-medium text-red-600 hover:text-red-700"
        >
          Log out
        </button>
      </div>
    </div>
  )
}

export default Sidebar
