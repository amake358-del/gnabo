import { type LucideIcon } from 'lucide-react'
import { Card } from './Card'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color?: string
  bg?: string
  trend?: { value: number; positive: boolean }
}

export function StatCard({ label, value, icon: Icon, color = 'text-primary-600', bg = 'bg-primary-50 dark:bg-primary-900/20', trend }: StatCardProps) {
  return (
    <Card hover className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
          <p className={`text-2xl font-bold mt-1.5 ${color}`}>{value}</p>
          {trend && (
            <p className={`text-xs font-medium mt-1 flex items-center gap-1 ${trend.positive ? 'text-emerald-600' : 'text-red-500'}`}>
              <span>{trend.positive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0 ml-3`}>
          <Icon size={20} className={color} />
        </div>
      </div>
    </Card>
  )
}
