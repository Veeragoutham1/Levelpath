function StatCard({ label, value, subtext, icon, iconColorClass }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">{label}</p>
        <span className={`w-9 h-9 rounded-full flex items-center justify-center ${iconColorClass}`}>
          <i className={`ti ${icon}`} />
        </span>
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 my-2">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{subtext}</p>
    </div>
  )
}

export default StatCard
