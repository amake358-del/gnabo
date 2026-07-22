import { useState, useEffect } from 'react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { supabase } from '../services/supabase'
import { formatDate } from '../utils/format'
import { ClipboardList, Search, Plus, X, Save, AlertTriangle, CheckCircle, Eye, Calendar, Clock, Pencil } from 'lucide-react'

const STATUTS = ['planifiee', 'en_cours', 'terminee', 'annulee'] as const

const STATUT_LABELS: Record<string, string> = {
  planifiee: 'Planifiée',
  en_cours: 'En cours',
  terminee: 'Terminée',
  annulee: 'Annulée',
}

const STATUT_VARIANTS: Record<string, 'default' | 'blue' | 'green' | 'red' | 'yellow'> = {
  planifiee: 'blue',
  en_cours: 'yellow',
  terminee: 'green',
  annulee: 'red',
}

const STATUT_BTN: Record<string, string> = {
  planifiee: 'en_cours',
  en_cours: 'terminee',
}

interface Intervention {
  id: string
  devis_id?: number
  client_id: number
  client_nom?: string
  client_telephone?: string
  client_adresse?: string
  devis_numero?: string
  service: string
  technicien: string
  equipe: string
  date_prevue: string
  heure_prevue: string
  adresse_intervention: string
  statut: string
  compte_rendu: string
  cree_le: string
}

export function InterventionsPage() {
  const [items, setItems] = useState<Intervention[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Intervention | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [form, setForm] = useState({
    client_id: '',
    client_search: '',
    service: 'aluminium',
    technicien: '',
    equipe: '',
    date_prevue: '',
    heure_prevue: '',
    adresse_intervention: '',
  })
  const [clients, setClients] = useState<any[]>([])
  const [showClientList, setShowClientList] = useState(false)

  const load = async () => {
    setLoading(true)
    let q = supabase.from('interventions').select('*')
    if (filtreStatut) q = q.eq('statut', filtreStatut)
    if (search) q = q.or(`client_nom.ilike.%${search}%,technicien.ilike.%${search}%`)
    q.order('cree_le', { ascending: false })
    const { data } = await q
    setItems((data || []) as unknown as Intervention[])
    setLoading(false)
  }

  useEffect(() => { load() }, [filtreStatut])

  const handleSearch = () => { load() }

  const openNew = () => {
    setEditing(null)
    setForm({ client_id: '', client_search: '', service: 'aluminium', technicien: '', equipe: '', date_prevue: '', heure_prevue: '', adresse_intervention: '' })
    setShowForm(true)
    setError('')
  }

  const openEdit = (item: Intervention) => {
    setEditing(item)
    setForm({
      client_id: String(item.client_id),
      client_search: item.client_nom || '',
      service: item.service,
      technicien: item.technicien || '',
      equipe: item.equipe || '',
      date_prevue: item.date_prevue || '',
      heure_prevue: item.heure_prevue || '',
      adresse_intervention: item.adresse_intervention || '',
    })
    setShowForm(true)
    setError('')
  }

  const searchClients = async (q: string) => {
    setForm(prev => ({ ...prev, client_search: q, client_id: '' }))
    if (q.length < 1) { setClients([]); setShowClientList(false); return }
    const { data } = await supabase.from('clients').select('id, nom, prenom, telephone').ilike('nom', `%${q}%`).limit(10)
    setClients(data || [])
    setShowClientList(true)
  }

  const selectClient = (c: any) => {
    setForm(prev => ({ ...prev, client_id: String(c.id), client_search: `${c.nom || ''} ${c.prenom || ''}`.trim() }))
    setShowClientList(false)
  }

  const handleSubmit = async () => {
    if (!form.client_id) { setError('Sélectionnez un client'); return }
    setSaving(true); setError('')
    try {
      const payload = {
        client_id: parseInt(form.client_id),
        service: form.service,
        technicien: form.technicien,
        equipe: form.equipe,
        date_prevue: form.date_prevue,
        heure_prevue: form.heure_prevue,
        adresse_intervention: form.adresse_intervention,
      }
      if (editing) {
        const { error: e } = await supabase.from('interventions').update(payload).eq('id', editing.id)
        if (e) throw e
      } else {
        const { error: e } = await supabase.from('interventions').insert(payload)
        if (e) throw e
      }
      setShowForm(false)
      setEditing(null)
      load()
    } catch (err: any) { setError(err.message) } finally { setSaving(false) }
  }

  const handleStatut = async (id: string, statut: string) => {
    const { error: e } = await supabase.from('interventions').update({ statut }).eq('id', id)
    if (e) setError(e.message); else load()
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <ClipboardList size={22} className="text-blue-500" />
          </div>
          <h1 className="text-xl font-bold">Interventions</h1>
        </div>
        <Button onClick={openNew}><Plus size={16} /> Nouvelle intervention</Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Client, technicien..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
        </div>
        <select className="input w-auto" value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)}>
          <option value="">Tous les statuts</option>
          {STATUTS.map(s => <option key={s} value={s}>{STATUT_LABELS[s]}</option>)}
        </select>
        <Button variant="ghost" onClick={handleSearch}>Rechercher</Button>
      </div>

      {showForm && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{editing ? 'Modifier' : 'Nouvelle'} intervention</h3>
            <button type="button" onClick={() => setShowForm(false)}><X size={18} className="text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="label">Client *</label>
              <input className="input" placeholder="Rechercher un client..." value={form.client_search} onChange={e => searchClients(e.target.value)} />
              {showClientList && clients.length > 0 && (
                <div className="absolute z-10 top-full mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {clients.map((c: any) => (
                    <button key={c.id} type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50" onClick={() => selectClient(c)}>
                      {c.nom} {c.prenom || ''} {c.telephone && <span className="text-gray-400 ml-2">{c.telephone}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="label">Service</label>
              <select className="input" value={form.service} onChange={e => setForm(prev => ({ ...prev, service: e.target.value }))}>
                <option value="aluminium">Aluminium</option>
                <option value="metallique">Métallique</option>
                <option value="electronique">Électronique</option>
              </select>
            </div>
            <div>
              <label className="label">Technicien</label>
              <input className="input" value={form.technicien} onChange={e => setForm(prev => ({ ...prev, technicien: e.target.value }))} placeholder="Nom du technicien" />
            </div>
            <div>
              <label className="label">Équipe</label>
              <input className="input" value={form.equipe} onChange={e => setForm(prev => ({ ...prev, equipe: e.target.value }))} placeholder="Membres de l'équipe" />
            </div>
            <div>
              <label className="label">Date prévue</label>
              <input className="input" type="date" value={form.date_prevue} onChange={e => setForm(prev => ({ ...prev, date_prevue: e.target.value }))} />
            </div>
            <div>
              <label className="label">Heure prévue</label>
              <input className="input" type="time" value={form.heure_prevue} onChange={e => setForm(prev => ({ ...prev, heure_prevue: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <label className="label">Adresse d'intervention</label>
              <input className="input" value={form.adresse_intervention} onChange={e => setForm(prev => ({ ...prev, adresse_intervention: e.target.value }))} placeholder="Adresse complète" />
            </div>
          </div>
          {error && <p className="text-sm text-red-500 flex items-center gap-1 mt-3"><AlertTriangle size={14} /> {error}</p>}
          <div className="flex gap-3 mt-4">
            <Button onClick={handleSubmit} disabled={saving}><Save size={16} /> {editing ? 'Mettre à jour' : 'Créer'}</Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>Annuler</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size={40} /></div>
      ) : items.length === 0 ? (
        <Card><p className="text-center text-gray-400 py-10">Aucune intervention trouvée</p></Card>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <Card key={item.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold">{item.client_nom || `Client #${item.client_id}`}</span>
                    <Badge variant={STATUT_VARIANTS[item.statut] || 'default'} dot>{STATUT_LABELS[item.statut] || item.statut}</Badge>
                    <span className="text-xs text-gray-400 capitalize">{item.service}</span>
                  </div>
                  {item.technicien && <p className="text-sm text-gray-500">Technicien: {item.technicien}</p>}
                  {item.equipe && <p className="text-sm text-gray-500">Équipe: {item.equipe}</p>}
                  <div className="flex gap-4 text-xs text-gray-400 mt-2">
                    {item.date_prevue && <span className="flex items-center gap-1"><Calendar size={14} className="text-gray-400" /> {item.date_prevue}</span>}
                    {item.heure_prevue && <span className="flex items-center gap-1"><Clock size={14} className="text-gray-400" /> {item.heure_prevue}</span>}
                    {item.cree_le && <span>Créé le {formatDate(item.cree_le)}</span>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 ml-4">
                  {STATUT_BTN[item.statut] && (
                    <Button size="sm" onClick={() => handleStatut(item.id, STATUT_BTN[item.statut])}>
                      <CheckCircle size={14} /> {STATUT_LABELS[STATUT_BTN[item.statut]]}
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => setExpanded(expanded === item.id ? null : item.id)}>
                    <Eye size={14} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(item)}><Pencil size={14} /></Button>
                </div>
              </div>
              {expanded === item.id && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50 text-sm space-y-2">
                  {item.adresse_intervention && <p><span className="text-gray-400">Adresse:</span> {item.adresse_intervention}</p>}
                  {item.client_telephone && <p><span className="text-gray-400">Tél:</span> {item.client_telephone}</p>}
                  {item.devis_numero && <p><span className="text-gray-400">Devis:</span> {item.devis_numero}</p>}
                  {item.compte_rendu && <p><span className="text-gray-400">Compte rendu:</span> {item.compte_rendu}</p>}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
