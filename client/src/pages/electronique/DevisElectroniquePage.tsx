import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import { Button } from '../../components/ui/Button'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { FileText, ArrowLeft, Save, Plus, Trash2, AlertTriangle } from 'lucide-react'

interface DevisLine {
  designation: string
  quantite: number
  prix_unitaire: number
  total: number
}

interface AppareilData {
  id: string
  client_id: number
  client_nom?: string
  marque: string
  modele: string
}

export function DevisElectroniquePage() {
  const { appareilId } = useParams<{ appareilId: string }>()
  const navigate = useNavigate()
  const [appareil, setAppareil] = useState<AppareilData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [lines, setLines] = useState<DevisLine[]>([{ designation: '', quantite: 1, prix_unitaire: 0, total: 0 }])
  const [notes, setNotes] = useState('')
  const [tva, setTva] = useState(0)
  const [devisId, _setDevisId] = useState<string | null>(null)

  useEffect(() => {
    if (!appareilId) return
    ;(async () => {
      const { data } = await supabase
        .from('appareils')
        .select('*, clients(nom)')
        .eq('id', appareilId)
        .single()
      if (data) {
        const { clients, ...rest } = data as any
        setAppareil({ ...rest, client_nom: clients?.nom } as AppareilData)
      }
    })().finally(() => setLoading(false))
  }, [appareilId])

  const calcLineTotal = (line: DevisLine) => line.quantite * line.prix_unitaire

  const updateLine = (idx: number, field: string, value: any) => {
    setLines(prev => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      next[idx].total = calcLineTotal(next[idx])
      return next
    })
  }

  const addLine = () => setLines(prev => [...prev, { designation: '', quantite: 1, prix_unitaire: 0, total: 0 }])
  const removeLine = (idx: number) => setLines(prev => prev.filter((_, i) => i !== idx))

  const totalHt = lines.reduce((s, l) => s + l.total, 0)
  const tvaAmount = totalHt * (tva / 100)
  const totalTtc = totalHt + tvaAmount

  const handleSubmit = async () => {
    if (!appareilId || !appareil) return
    setSaving(true); setError('')
    try {
      const payload = {
        client_id: appareil.client_id,
        appareil_id: appareilId,
        service: 'electronique',
        numero: 'DEV-E-' + Date.now().toString(36).toUpperCase(),
        lignes: JSON.stringify(lines.filter(l => l.designation)),
        montant_ht: totalHt,
        tva,
        montant_ttc: totalTtc,
        notes,
        statut: 'brouillon',
      }
      if (devisId) {
        await supabase.from('devis').update(payload).eq('id', devisId)
      } else {
        await supabase.from('devis').insert(payload)
      }
      navigate(`/electronique/appareils/${appareilId}`)
    } catch (err: any) { setError(err.message) } finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner /></div>
  if (!appareil) return <div className="text-center py-12 text-gray-400">Appareil non trouvé</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button onClick={() => navigate(`/electronique/appareils/${appareilId}`)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"><ArrowLeft size={16} /> Retour</Button>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center"><FileText size={20} className="text-blue-500" /></div>
        <div><h1 className="text-xl font-bold">Nouveau devis</h1><p className="text-sm text-gray-500">{appareil.client_nom} — {appareil.marque} {appareil.modele}</p></div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Lignes de devis</h3>
            <Button size="sm" onClick={addLine}><Plus size={14} /> Ajouter</Button>
          </div>
          {lines.map((line, idx) => (
            <div key={idx} className="flex gap-2 items-start p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
              <div className="flex-1">
                <input className="input text-sm" placeholder="Désignation" value={line.designation} onChange={e => updateLine(idx, 'designation', e.target.value)} />
              </div>
              <div className="w-20">
                <input className="input text-sm" type="number" placeholder="Qté" value={line.quantite} onChange={e => updateLine(idx, 'quantite', parseFloat(e.target.value) || 0)} min="1" />
              </div>
              <div className="w-28">
                <input className="input text-sm" type="number" placeholder="Prix unit." value={line.prix_unitaire} onChange={e => updateLine(idx, 'prix_unitaire', parseFloat(e.target.value) || 0)} min="0" />
              </div>
              <div className="w-24 text-right pt-2 text-sm font-medium">{line.total.toLocaleString()} FG</div>
              {lines.length > 1 && (
                <Button onClick={() => removeLine(idx)} className="pt-2 text-red-400 hover:text-red-600"><Trash2 size={16} /></Button>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700/50 pt-4 space-y-2">
          <div className="flex justify-between text-sm"><span className="text-gray-500">Total HT</span><span className="font-medium">{totalHt.toLocaleString()} FG</span></div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">TVA</span>
            <input className="input w-20 text-sm" type="number" value={tva} onChange={e => setTva(parseFloat(e.target.value) || 0)} min="0" max="100" />
            <span className="text-sm text-gray-400">%</span>
            <span className="ml-auto text-sm font-medium">{tvaAmount.toLocaleString()} FG</span>
          </div>
          <div className="flex justify-between text-base font-bold border-t border-gray-200 dark:border-gray-600 pt-2">
            <span>Total TTC</span><span>{totalTtc.toLocaleString()} FG</span>
          </div>
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea className="input min-h-[60px]" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Conditions particulières..." />
        </div>

        {error && <p className="text-sm text-red-500 flex items-center gap-1"><AlertTriangle size={14} /> {error}</p>}
        <div className="flex gap-3">
          <Button onClick={handleSubmit} disabled={saving}><Save size={16} /> Créer le devis</Button>
          <Button variant="ghost" onClick={() => navigate(`/electronique/appareils/${appareilId}`)}>Annuler</Button>
        </div>
      </div>
    </div>
  )
}
