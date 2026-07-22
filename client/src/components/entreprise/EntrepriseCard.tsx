import type { EntrepriseBrief } from '../../types'

interface Props {
  ent: EntrepriseBrief
  onSelect: (e: EntrepriseBrief) => void
}

export function EntrepriseCard({ ent, onSelect }: Props) {
  return (
    <button
      onClick={() => onSelect(ent)}
      className="group relative w-full flex items-center gap-5 p-5 bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-700 transition-all duration-200 text-left"
    >
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm shrink-0"
        style={{ backgroundColor: ent.primary_color || '#2563EB' }}
      >
        {ent.logo_url ? (
          <img src={ent.logo_url} alt="" className="w-10 h-10 object-contain" />
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h8M8 10h8M8 14h5"/></svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-base">{ent.name}</h3>
        <p className="text-sm text-gray-400 dark:text-gray-500">@{ent.slug}</p>
      </div>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300 dark:text-gray-600 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all"><path d="M9 18l6-6-6-6"/></svg>
    </button>
  )
}
