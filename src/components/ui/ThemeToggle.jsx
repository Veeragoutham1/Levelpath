import { useTheme } from '../../context/ThemeContext'

const OPTIONS = [
  { value: 'light', icon: 'ti-sun', label: 'Light' },
  { value: 'dark', icon: 'ti-moon', label: 'Dark' },
  { value: 'system', icon: 'ti-device-desktop', label: 'System' },
]

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-800 rounded-full p-1">
      {OPTIONS.map((option) => {
        const isActive = theme === option.value

        return (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            title={option.label}
            className={
              isActive
                ? 'h-8 w-8 rounded-full flex items-center justify-center bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'h-8 w-8 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }
          >
            <i className={`ti ${option.icon} text-sm`} />
          </button>
        )
      })}
    </div>
  )
}

export default ThemeToggle
