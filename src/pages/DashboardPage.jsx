import Sidebar from '../components/layout/Sidebar'

function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-[220px] p-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </main>
    </div>
  )
}

export default DashboardPage
