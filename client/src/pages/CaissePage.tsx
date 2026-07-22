import { useState, useEffect } from 'react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { supabase } from '../services/supabase'
import { formatCurrency, formatDateTime } from '../utils/format'
import { DollarSign, TrendingUp, TrendingDown, Plus, X, Save, AlertTriangle, Trash2, Wallet } from 'lucide-react'
import type { CaisseEntry } from '../types'

const CATEGORIES = [
  'vente', 'acompte', 'salaire', 'loyer', 'fournisseur', 'transport', 'achat_stock', 'entretien', 'autre',
]

const CATEGORY_LABELS: Record<string, string> = {
  vente: 'Vente', acompte: 'Acompte', salaire: 'Salaire', loyer: 'Loyer',
  fournisseur: 'Fournisseur', transport: 'Transport', achat_stock: 'Achat stock', entretien: 'Entretien', autre: 'Autre',
}

export function CaissePage() {
  const [entries, setEntries] = useState<CaisseEntry[]>([])
  const [solde, setSolde] = useState(0)
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState('')
  const [debut, setDebut] = useState('')
  const [fin, setFin] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ type: 'encaissement', categorie: 'vente', montant: '', description: '', mode_paiement: 'especes' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      let query = supabase.from('caisse').select('*').order('cree_le', { ascending: false })
      if (debut) query = query.gte('cree_le', debut)
      if (fin) query = query.lte('cree_le', `${fin}T23:59:59`)
      if (type) query = query.eq('type', type)
      const { data } = await query
      const rows = (data ?? []) as CaisseEntry[]
      setEntries(rows)
      setSolde(rows.reduce((s, e) => s + (e.type === 'encaissement' ? e.montant : -e.montant), 0))
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleFilter = () => { load() }

  const todayTotalEncaissements = entries.filter(e => e.type === 'encaissement').reduce((s, e) => s + e.montant, 0)
  const todayTotalDepenses = entries.filter(e => e.type === 'depense').reduce((s, e) => s + e.montant, 0)

  const handleSubmit = async () => {
    if (!form.montant || parseFloat(form.montant) <= 0) { setError('Montant invalide'); return }
    setSaving(true); setError('')
    try {
      const { error: err } = await supabase.from('caisse').insert({
        type: form.type,
        categorie: form.categorie,
        montant: parseFloat(form.montant),
        description: form.description || null,
        mode_paiement: form.mode_paiement,
      })
      if (err) throw err
      setShowForm(false)
      setForm({ type: 'encaissement', categorie: 'vente', montant: '', description: '', mode_paiement: 'especes' })
      load()
    } catch (err: any) { setError(err.message) } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette entrée ?')) return
    try {
      const { error: err } = await supabase.from('caisse').delete().eq('id', id)
      if (err) throw err
      load()
    } catch (err: any) { alert(err.message) }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
            <Wallet size={22} className="text-emerald-500" />
          </div>
          <h1 className="text-xl font-bold">Caisse</h1>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus size={16} /> Nouvelle entrée</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center"><TrendingUp size={20} className="text-green-500" /></div>
            <div><p className="text-xs text-gray-400">Encaissements</p><p className="text-lg font-bold text-green-600">{formatCurrency(todayTotalEncaissements)}</p></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center"><TrendingDown size={20} className="text-red-500" /></div>
            <div><p className="text-xs text-gray-400">Dépenses</p><p className="text-lg font-bold text-red-600">{formatCurrency(todayTotalDepenses)}</p></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center"><DollarSign size={20} className="text-blue-500" /></div>
            <div><p className="text-xs text-gray-400">Solde</p><p className={`text-lg font-bold ${solde >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{formatCurrency(solde)}</p></div>
          </div>
        </Card>
      </div>

      <div className="flex gap-3 flex-wrap items-end">
        <div><label className="label text-xs">Du</label><input className="input" type="date" value={debut} onChange={e => setDebut(e.target.value)} /></div>
        <div><label className="label text-xs">Au</label><input className="input" type="date" value={fin} onChange={e => setFin(e.target.value)} /></div>
        <div><label className="label text-xs">Type</label><select className="input" value={type} onChange={e => setType(e.target.value)}><option value="">Tous</option><option value="encaissement">Encaissement</option><option value="depense">Dépense</option></select></div>
        <Button variant="ghost" onClick={handleFilter}>Filtrer</Button>
      </div>

      {showForm && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Nouvelle entrée</h3>
            <button type="button" onClick={() => setShowForm(false)}><X size={18} className="text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}>
                <option value="encaissement">Encaissement</option>
                <option value="depense">Dépense</option>
              </select>
            </div>
            <div>
              <label className="label">Catégorie</label>
              <select className="input" value={form.categorie} onChange={e => setForm(prev => ({ ...prev, categorie: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Montant</label>
              <input className="input" type="number" value={form.montant} onChange={e => setForm(prev => ({ ...prev, montant: e.target.value }))} min="0" placeholder="0" />
            </div>
            <div>
              <label className="label">Mode de paiement</label>
              <select className="input" value={form.mode_paiement} onChange={e => setForm(prev => ({ ...prev, mode_paiement: e.target.value }))}>
                <option value="especes">Espèces</option>
                <option value="carte">Carte bancaire</option>
                <option value="cheque">Chèque</option>
                <option value="virement">Virement</option>
                <option value="mobile_money">Mobile Money</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Description</label>
              <input className="input" value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Motif..." />
            </div>
          </div>
          {error && <p className="text-sm text-red-500 flex items-center gap-1 mt-3"><AlertTriangle size={14} /> {error}</p>}
          <div className="flex gap-3 mt-4">
            <Button onClick={handleSubmit} disabled={saving}><Save size={16} /> Enregistrer</Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>Annuler</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size={40} /></div>
      ) : entries.length === 0 ? (
        <Card><p className="text-center text-gray-400 py-10">Aucune entrée</p></Card>
      ) : (
        <div className="space-y-2">
          {entries.map(e => (
            <Card key={e.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Badge variant={e.type === 'encaissement' ? 'green' : 'red'}>{e.type === 'encaissement' ? '+' : '-'}</Badge>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{CATEGORY_LABELS[e.categorie] || e.categorie}</p>
                    {e.description && <p className="text-xs text-gray-400 truncate">{e.description}</p>}
                  </div>
                  <span className="text-xs text-gray-400">{e.mode_paiement}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className={`text-sm font-bold ${e.type === 'encaissement' ? 'text-green-600' : 'text-red-600'}`}>
                    {e.type === 'encaissement' ? '+' : '-'}{formatCurrency(e.montant)}
                  </span>
                  <span className="text-xs text-gray-400">{formatDateTime(e.cree_le)}</span>
                  <button type="button" onClick={() => handleDelete(e.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}