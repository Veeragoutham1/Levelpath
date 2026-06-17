import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function DashboardPage() {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <button
        onClick={handleLogout}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        Log out
      </button>
    </div>
  )
}

export default DashboardPage
