import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  const [role, setRole] = useState(null)
  const [roleFetched, setRoleFetched] = useState(false)

  useEffect(() => {
    if (!adminOnly || !user) return

    async function fetchRole() {
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      setRole(data?.role ?? null)
      setRoleFetched(true)
    }

    fetchRole()
  }, [adminOnly, user])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && !roleFetched) {
    return <div>Loading...</div>
  }

  if (adminOnly && role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
