import { LoadingSpinner } from './LoadingSpinner'

interface Column<T> {
  key: string
  label: string
  render?: (item: T) => React.ReactNode
  className?: string
  hideLabel?: boolean
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  onRowClick?: (item: T) => void
  emptyMessage?: string
}

export function Table<T extends Record<string, any>>({ columns, data, loading, onRowClick, emptyMessage = 'Aucune donnée' }: TableProps<T>) {
  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner /></div>
  if (!data.length) return <div className="text-center py-12 text-gray-400 text-sm">{emptyMessage}</div>

  return (
    <div className="overflow-x-auto rounded-xl border border-surface-200 dark:border-gray-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface-50 dark:bg-gray-800/50">
            {columns.map(col => (
              <th key={col.key} className={`px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${col.className || ''} ${col.hideLabel ? 'sr-only' : ''}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-100 dark:divide-gray-700/50">
          {data.map((item, i) => (
            <tr
              key={item.id || i}
              onClick={() => onRowClick?.(item)}
              className={`transition-colors duration-100 ${onRowClick ? 'cursor-pointer' : ''} ${i % 2 === 0 ? 'bg-white dark:bg-gray-800/20' : 'bg-surface-50/30 dark:bg-gray-800/10'} hover:bg-surface-50 dark:hover:bg-gray-700/30`}
            >
              {columns.map(col => (
                <td key={col.key} data-label={col.hideLabel ? '' : col.label} className={`px-4 py-3 text-gray-700 dark:text-gray-300 ${col.className || ''}`}>
                  {col.render ? col.render(item) : String(item[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
