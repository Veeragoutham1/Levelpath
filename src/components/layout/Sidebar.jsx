import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { SIDEBAR_WIDTH } from '../../lib/constants'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: 'ti-layout-dashboard' },
  { to: '/learn', label: 'Learning Plan', icon: 'ti-books' },
  { to: '/custom-path', label: 'My Paths', icon: 'ti-route' },
  { to: '/tasks', label: 'Tasks', icon: 'ti-checkbox' },
]

function Sidebar() {
  const { user } = useAuth()
  const location = useLocation()
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

  return (
    <div
      className="fixed left-0 top-0 h-screen z-40 bg-white border-r border-gray-200 flex flex-col"
      style={{ width: SIDEBAR_WIDTH }}
    >
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

      <div className="border-t border-gray-200" />
    </div>
  )
}

export default Sidebar
