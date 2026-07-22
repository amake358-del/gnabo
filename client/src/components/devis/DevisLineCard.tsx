import { Trash2 } from 'lucide-react'
import { formatCurrency } from '../../utils/format'
import type { DevisLine } from '../../types'

interface Props {
  line: DevisLine
  index: number
  onUpdate: (idx: number, field: keyof DevisLine, value: any) => void
  onRemove: (idx: number) => void
}

export function DevisLineCard({ line, index, onUpdate, onRemove }: Props) {
  return (
    <div className="devis-line-card group relative p-4 lg:p-5 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-md hover:border-primary-200/50 dark:hover:border-primary-700/50 transition-all duration-200">
      {/* Mobile layout (< 640px) */}
      <div className="flex flex-col gap-3 sm:hidden">
        <input
          className="input text-sm font-medium"
          placeholder="Désignation"
          value={line.designation}
          onChange={e => onUpdate(index, 'designation', e.target.value)}
        />
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Qté</label>
            <input className="input text-sm text-center" type="number" step="any" placeholder="1" value={line.quantite || ''} onChange={e => onUpdate(index, 'quantite', parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">L (mm)</label>
            <input className="input text-sm text-center" type="number" step="any" placeholder="0" value={line.largeur || ''} onChange={e => onUpdate(index, 'largeur', parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">H (mm)</label>
            <input className="input text-sm text-center" type="number" step="any" placeholder="0" value={line.hauteur || ''} onChange={e => onUpdate(index, 'hauteur', parseFloat(e.target.value) || 0)} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Surface (m²)</label>
            <input className="input text-sm text-center" type="number" step="any" placeholder="0" value={line.surface || ''} onChange={e => onUpdate(index, 'surface', parseFloat(e.target.value) || 0)} />
          </div>
          <div className="flex-1">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Prix (FG/m²)</label>
            <input className="input text-sm text-center" type="number" step="0.000001" placeholder="0" value={line.prix_m2 || ''} onChange={e => onUpdate(index, 'prix_m2', parseFloat(e.target.value) || 0)} />
          </div>
        </div>
        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">Total</span>
            <span className="text-base font-bold text-primary-600 dark:text-primary-400">{formatCurrency(line.total)}</span>
          </div>
          <button type="button" onClick={() => onRemove(index)} className="px-3 py-2 text-xs font-medium text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors inline-flex items-center gap-1.5" aria-label="Supprimer la ligne">
            <Trash2 size={14} />
            Supprimer
          </button>
        </div>
      </div>

      {/* Tablet layout (640px - 1023px) */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:hidden gap-3">
        <div className="sm:col-span-2">
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Désignation</label>
          <input className="input text-sm" placeholder="Désignation" value={line.designation} onChange={e => onUpdate(index, 'designation', e.target.value)} />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Qté</label>
          <input className="input text-sm" type="number" step="any" value={line.quantite || ''} onChange={e => onUpdate(index, 'quantite', parseFloat(e.target.value) || 0)} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">L (mm)</label>
            <input className="input text-sm" type="number" step="any" value={line.largeur || ''} onChange={e => onUpdate(index, 'largeur', parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">H (mm)</label>
            <input className="input text-sm" type="number" step="any" value={line.hauteur || ''} onChange={e => onUpdate(index, 'hauteur', parseFloat(e.target.value) || 0)} />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Surface (m²)</label>
          <input className="input text-sm" type="number" step="any" placeholder="0" value={line.surface || ''} onChange={e => onUpdate(index, 'surface', parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Prix (FG/m²)</label>
          <input className="input text-sm" type="number" step="0.000001" value={line.prix_m2 || ''} onChange={e => onUpdate(index, 'prix_m2', parseFloat(e.target.value) || 0)} />
        </div>
        <div className="sm:col-span-2 flex items-center justify-between pt-1">
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">Total</span>
            <span className="text-lg font-bold text-primary-600 dark:text-primary-400">{formatCurrency(line.total)}</span>
          </div>
          <button type="button" onClick={() => onRemove(index)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" aria-label="Supprimer">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Desktop layout (>= 1024px) */}
      <div className="hidden lg:block">
        <div className="flex items-start gap-4 mb-3">
          <div className="flex-1">
            <input className="input text-sm" placeholder="Désignation de l'ouvrage ou du service" value={line.designation} onChange={e => onUpdate(index, 'designation', e.target.value)} />
          </div>
          <button type="button" onClick={() => onRemove(index)} className="shrink-0 px-4 py-2.5 text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors inline-flex items-center gap-2" aria-label="Supprimer">
            <Trash2 size={16} /> Supprimer
          </button>
        </div>
        <div className="flex gap-4 items-start">
          <input className="input text-sm w-[100px]" type="number" step="any" placeholder="Qté" value={line.quantite || ''} onChange={e => onUpdate(index, 'quantite', parseFloat(e.target.value) || 0)} />
          <input className="input text-sm w-[130px]" type="number" step="any" placeholder="L (mm)" value={line.largeur || ''} onChange={e => onUpdate(index, 'largeur', parseFloat(e.target.value) || 0)} />
          <input className="input text-sm w-[130px]" type="number" step="any" placeholder="H (mm)" value={line.hauteur || ''} onChange={e => onUpdate(index, 'hauteur', parseFloat(e.target.value) || 0)} />
          <input className="input text-sm w-[160px]" type="number" step="any" placeholder="Surface (m²)" value={line.surface || ''} onChange={e => onUpdate(index, 'surface', parseFloat(e.target.value) || 0)} />
          <input className="input text-sm w-[170px]" type="number" step="0.000001" placeholder="Prix (FG/m²)" value={line.prix_m2 || ''} onChange={e => onUpdate(index, 'prix_m2', parseFloat(e.target.value) || 0)} />
          <div className="flex items-center gap-3 ml-auto pt-1.5">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">Total</span>
            <span className="text-xl font-bold text-primary-600 dark:text-primary-400 whitespace-nowrap">{formatCurrency(line.total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
