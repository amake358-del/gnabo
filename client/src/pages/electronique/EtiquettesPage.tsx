import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Download, Loader2 } from 'lucide-react'

const LAYOUT_OPTIONS = [
  { value: '10', label: '10 étiquettes (2×5)' },
  { value: '20', label: '20 étiquettes (5×4)' },
  { value: '24', label: '24 étiquettes (6×4)' },
  { value: '30', label: '30 étiquettes (5×6)' },
]

export function EtiquettesPage() {
  const [appareils, setAppareils] = useState<any[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [layout, setLayout] = useState('10')
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    ;(async () => {
      const { data, error } = await supabase.from('appareils').select('id, uid_visible, marque, modele, cree_le').order('cree_le', { ascending: false })
      if (error) console.error('Erreur chargement appareils:', error)
      setAppareils(data || [])
    })().finally(() => setLoading(false))
  }, [])

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleGeneratePdf = async () => {
    if (selected.length === 0) return
    setGenerating(true)
    try {
      const qrPromises = selected.map(async id => {
        const app = appareils.find(a => a.id === id)
        const qr_data_url = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(app!.uid_visible)}`
        return { app, qr_data_url }
      })
      const items = await Promise.all(qrPromises)
      const { default: jsPDF } = await import('jspdf')
      const doc = new jsPDF('p', 'mm', 'a4')
      const pp = parseInt(layout)
      const cols = pp >= 20 ? 3 : 2
      const rows = Math.ceil(pp / cols)
      const m = 10, w = (190 - (cols - 1) * 4) / cols, h = (277 - (rows - 1) * 4) / rows
      const loadImg = (url: string): Promise<string> => {
        return new Promise(resolve => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => { const c = document.createElement('canvas'); c.width = 100; c.height = 100; const ctx = c.getContext('2d')!; ctx.drawImage(img, 0, 0, 100, 100); resolve(c.toDataURL()) }
          img.onerror = () => resolve('')
          img.src = url
        })
      }
      const usedItems = items.slice(0, pp)
      for (let i = 0; i < usedItems.length; i++) {
        const { app, qr_data_url } = usedItems[i]
        const col = i % cols, row = Math.floor(i / cols)
        const x = m + col * (w + 4), y = m + row * (h + 4)
        doc.setFontSize(8)
        doc.text(app!.uid_visible, x + 2, y + 5)
        doc.setFontSize(6)
        doc.text(`${app!.marque} ${app!.modele}`.substring(0, 22), x + 2, y + 9)
        if (qr_data_url) {
          try {
            const dataUrl = await loadImg(qr_data_url)
            if (dataUrl) doc.addImage(dataUrl, 'PNG', x + w / 2 - 10, y + 12, 20, 20)
          } catch (e) { console.error('Erreur chargement QR:', e) }
        }
        doc.rect(x, y, w, h)
      }
      doc.save('etiquettes.pdf')
    } catch (err: any) { console.error('Erreur generation etiquettes:', err) } finally { setGenerating(false) }
  }

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner /></div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Étiquettes</h1>
        <p className="text-gray-500 mt-1">Sélectionnez des appareils pour générer leurs étiquettes QR</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Select label="Disposition" value={layout} onChange={e => setLayout(e.target.value)} options={LAYOUT_OPTIONS} />
          <Button onClick={handleGeneratePdf} disabled={selected.length === 0 || generating}>
            {generating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Générer PDF ({selected.length})
          </Button>
        </div>
        <p className="text-sm text-gray-400">{selected.length} appareil(s) sélectionné(s)</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 divide-y divide-gray-100 dark:divide-gray-700/50">
        {appareils.map(app => (
          <label key={app.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors">
            <input type="checkbox" checked={selected.includes(app.id)} onChange={() => toggleSelect(app.id)} className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500" />
            <div className="flex-1 min-w-0">
              <p className="font-mono font-medium dark:text-gray-100">{app.uid_visible}</p>
              <p className="text-sm text-gray-500 truncate">{app.marque} {app.modele}</p>
            </div>
            <span className="text-xs text-gray-400">{app.cree_le?.substring(0, 10)}</span>
          </label>
        ))}
        {appareils.length === 0 && <p className="text-center py-8 text-gray-400">Aucun appareil trouvé</p>}
      </div>
    </div>
  )
}
