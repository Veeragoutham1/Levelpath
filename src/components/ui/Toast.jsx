function getToastIconClass(type) {
  if (type === 'error') return 'ti ti-circle-x text-xl text-red-500'
  if (type === 'info') return 'ti ti-info-circle text-xl text-blue-500'
  return 'ti ti-circle-check text-xl text-green-500'
}

function Toast({ toasts }) {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col-reverse gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="toast-enter bg-white rounded-lg shadow-lg border border-gray-200 px-5 py-3.5 flex items-center gap-2 min-w-[280px] max-w-[400px]"
        >
          <i className={getToastIconClass(toast.type)} />
          <span className="text-[15px] font-medium text-gray-700">{toast.message}</span>
        </div>
      ))}
    </div>
  )
}

export default Toast
