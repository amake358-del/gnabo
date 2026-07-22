import { useToastStore } from '../../stores/toastStore'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}

const colors = {
  success: 'bg-emerald-50 dark:bg-emerald-900/25 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200',
  error: 'bg-rose-50 dark:bg-rose-900/25 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200',
  info: 'bg-primary-50 dark:bg-primary-900/25 border-primary-200 dark:border-primary-800 text-primary-800 dark:text-primary-200',
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t, i) => {
        const Icon = icons[t.type]
        return (
          <div key={t.id}
            className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-lg animate-slide-down ${colors[t.type]}`}
            style={{ animationDelay: `${i * 0.05}s` }}>
            <Icon size={18} className="shrink-0 mt-0.5" />
            <span className="text-sm flex-1">{t.message}</span>
            <button type="button" onClick={() => removeToast(t.id)} className="shrink-0 opacity-50 hover:opacity-100 transition-opacity">
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
