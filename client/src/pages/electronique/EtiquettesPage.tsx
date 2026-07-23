import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { Input } from '../../components/ui/Input'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Download, Loader2, Plus, Check } from 'lucide-react'
import QRCode from 'qrcode'

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
  const [message, setMessage] = useState('')

  const [showBatch, setShowBatch] = useState(false)
  const [prefix, setPrefix] = useState('EL')
  const [debut, setDebut] = useState('1')
  const [quantite, setQuantite] = useState('50')
  const [batchLoading, setBatchLoading] = useState(false)
  const [batchResult, setBatchResult] = useState<string[]>([])

  const fetchAppareils = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('appareils')
      .select('id, uid_visible, marque, modele, cree_le, statut')
      .in('statut', ['disponible', 'recu', 'diagnostic', 'attente_devis', 'devis_envoye', 'en_reparation', 'pret', 'livre'])
      .order('cree_le', { ascending: false })
    if (error) console.error('Erreur chargement:', error)
    setAppareils(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchAppareils() }, [])

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleGeneratePdf = async () => {
    if (selected.length === 0) return
    setGenerating(true)
    setMessage('')
    try {
      const qrPromises = selected.map(async id => {
        const app = appareils.find(a => a.id === id)
        const qr_data_url = await QRCode.toDataURL(app!.uid_visible, { width: 100, margin: 0 })
        return { app, qr_data_url }
      })
      const items = await Promise.all(qrPromises)
      const { default: jsPDF } = await import('jspdf')
      const doc = new jsPDF('p', 'mm', 'a4')
      const pp = parseInt(layout)
      const cols = pp >= 20 ? 3 : 2
      const rows = Math.ceil(pp / cols)
      const m = 10, w = (190 - (cols - 1) * 4) / cols, h = (277 - (rows - 1) * 4) / rows
      const usedItems = items.slice(0, pp)
      for (let i = 0; i < usedItems.length; i++) {
        const { app, qr_data_url } = usedItems[i]
        const col = i % cols, row = Math.floor(i / cols)
        const x = m + col * (w + 4), y = m + row * (h + 4)
        doc.setFontSize(8)
        doc.text(app!.uid_visible, x + 2, y + 5)
        doc.setFontSize(6)
        doc.text(`${app!.marque || ''} ${app!.modele || ''}`.substring(0, 22), x + 2, y + 9)
        if (qr_data_url) {
          try { doc.addImage(qr_data_url, 'PNG', x + w / 2 - 10, y + 12, 20, 20) } catch {}
        }
        doc.rect(x, y, w, h)
      }
      doc.save('etiquettes.pdf')
      setMessage('PDF généré avec succès')
    } catch (err: any) { console.error('Erreur:', err); setMessage('Erreur de génération') }
    finally { setGenerating(false) }
  }

  const handleBatchGenerate = async () => {
    setBatchLoading(true)
    setBatchResult([])
    try {
      const p = prefix.toUpperCase().replace(/[^A-Z0-9_-]/g, '') || 'EL'
      const start = Math.max(1, parseInt(debut || '1'))
      const count = Math.min(Math.max(1, parseInt(quantite || '10')), 500)
      const { data: firstClient } = await supabase.from('clients').select('id').limit(1).maybeSingle()
      if (!firstClient) { setMessage('Ajoutez d\'abord un client'); setBatchLoading(false); return }
      const ids: string[] = []
      const rows: any[] = []
      for (let i = 0; i < count; i++) {
        const uid = `${p}-${String(start + i).padStart(6, '0')}`
        const { data: existing } = await supabase.from('appareils').select('id').eq('uid_visible', uid).maybeSingle()
        if (existing) continue
        const interne = `${uid}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        rows.push({ uid_interne: interne, uid_visible: uid, type: 'etiquette', marque: 'Pré-imprimée', modele: 'Étiquette', statut: 'disponible', client_id: firstClient.id })
        ids.push(uid)
      }
      if (rows.length > 0) {
        const { error } = await supabase.from('appareils').insert(rows)
        if (!error) { setMessage(`${rows.length} étiquettes créées`); setBatchResult(ids); await fetchAppareils() }
        else setMessage('Erreur: ' + error.message)
      } else setMessage('Tous les UIDs existent déjà')
    } catch (err: any) { setMessage(err?.message || 'Erreur batch') }
    finally { setBatchLoading(false) }
  }

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner /></div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Étiquettes</h1>
          <p className="text-gray-500 mt-1">Générez des étiquettes QR par lot ou pour des appareils existants</p>
        </div>
        <Button variant="secondary" onClick={() => setShowBatch(!showBatch)}>
          <Plus size={16} /> {showBatch ? 'Fermer' : 'Nouveau lot'}
        </Button>
      </div>

      {message && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm">
          <Check size={16} /> {message}
        </div>
      )}

      {showBatch && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 space-y-4">
          <h3 className="font-semibold">Génération par lot</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Préfixe" value={prefix} onChange={e => setPrefix(e.target.value.toUpperCase())} placeholder="EL" />
            <Input label="Premier numéro" type="number" value={debut} onChange={e => setDebut(e.target.value)} min="1" />
            <Input label="Quantité" type="number" value={quantite} onChange={e => setQuantite(e.target.value)} min="1" max="500" />
          </div>
          <p className="text-xs text-gray-400">
            Génération ex : <strong>{prefix}-{String(parseInt(debut || '1')).padStart(6, '0')}</strong> à{' '}
            <strong>{prefix}-{String(parseInt(debut || '1') + parseInt(quantite || '10') - 1).padStart(6, '0')}</strong>
          </p>
          <Button onClick={handleBatchGenerate} disabled={batchLoading}>
            {batchLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Générer {quantite || '10'} étiquettes
          </Button>
          {batchResult.length > 0 && (
            <div className="text-xs text-gray-500 max-h-32 overflow-y-auto bg-gray-50 dark:bg-gray-900/30 rounded-xl p-3">
              <p className="font-medium mb-1">Étiquettes créées ({batchResult.length}) :</p>
              <div className="grid grid-cols-5 gap-1">{batchResult.map(u => <span key={u}>{u}</span>)}</div>
            </div>
          )}
        </div>
      )}

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
              <div className="flex items-center gap-2">
                <p className="font-mono font-medium dark:text-gray-100">{app.uid_visible}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  app.statut === 'disponible' ? 'bg-green-100 text-green-700' :
                  app.statut === 'recu' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-600'
                }`}>{app.statut}</span>
              </div>
              <p className="text-sm text-gray-500 truncate">{app.marque || 'Pré-imprimée'} {app.modele || ''}</p>
            </div>
            <span className="text-xs text-gray-400">{app.cree_le?.substring(0, 10)}</span>
          </label>
        ))}
        {appareils.length === 0 && <p className="text-center py-8 text-gray-400">Aucun appareil trouvé</p>}
      </div>
    </div>
  )
}
