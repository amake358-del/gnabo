import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import { Button } from '../../components/ui/Button'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Wrench, ArrowLeft, Save, AlertTriangle } from 'lucide-react'

const STATUT_FLOW = [
  { value: 'en_cours', label: 'En cours' },
  { value: 'attente_validation', label: 'Attente validation client' },
  { value: 'attente_pieces', label: 'Attente pièces' },
  { value: 'test', label: 'Test' },
  { value: 'termine', label: 'Terminé' },
]

export function ReparationPage() {
  const { appareilId } = useParams<{ appareilId: string }>()
  const navigate = useNavigate()
  const [appareil, setAppareil] = useState<any>(null)
  const [reparations, setReparations] = useState<any[]>([])
  const [diagnostic, setDiagnostic] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [activeRep, setActiveRep] = useState<any>(null)
  const [form, setForm] = useState({
    pieces_utilisees: '', main_oeuvre: '', temps_passe: '', notes: '', statut: 'en_cours'
  })

  useEffect(() => {
    if (!appareilId) return
    Promise.all([
      supabase.from('appareils').select('*, clients(nom, telephone, adresse)').eq('id', appareilId).single(),
      supabase.from('reparations').select('*').eq('appareil_id', appareilId).order('cree_le', { ascending: false }),
      supabase.from('diagnostics').select('*').eq('appareil_id', appareilId).maybeSingle(),
    ]).then(([appRes, repRes, diagRes]) => {
      if (appRes.error) throw appRes.error
      setAppareil(appRes.data)
      if (diagRes.error) throw diagRes.error
      setDiagnostic(diagRes.data)
      if (repRes.error) throw repRes.error
      const reps = repRes.data
      setReparations(reps)
      if (reps.length > 0) {
        const latest = reps[0]
        setActiveRep(latest)
        setForm({
          pieces_utilisees: latest.pieces_utilisees === '[]' ? '' : latest.pieces_utilisees,
          main_oeuvre: String(latest.main_oeuvre || ''),
          temps_passe: String(latest.temps_passe || ''),
          notes: latest.notes,
          statut: latest.statut,
        })
      }
    }).catch(console.error).finally(() => setLoading(false))
  }, [appareilId])

  const handleFieldChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!appareilId) return
    setSaving(true); setError('')
    try {
      if (activeRep) {
        const { error } = await supabase.from('reparations').update({
          pieces_utilisees: form.pieces_utilisees || '[]',
          main_oeuvre: parseFloat(form.main_oeuvre) || 0,
          temps_passe: parseFloat(form.temps_passe) || 0,
          notes: form.notes,
          statut: form.statut,
        }).eq('id', activeRep.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('reparations').insert({
          appareil_id: appareilId,
          diagnostic_id: diagnostic?.id || undefined,
          pieces_utilisees: form.pieces_utilisees || '[]',
          main_oeuvre: parseFloat(form.main_oeuvre) || 0,
          temps_passe: parseFloat(form.temps_passe) || 0,
          notes: form.notes,
          statut: form.statut,
        })
        if (error) throw error
      }

      const statutMap: Record<string, string> = {
        en_cours: 'en_reparation',
        attente_pieces: 'attente_pieces',
        test: 'test',
        termine: 'pret',
      }
      const appStatut = statutMap[form.statut]
      if (appStatut) {
        await supabase.from('appareils').update({ statut: appStatut, modifie_le: new Date().toISOString() }).eq('id', appareilId)
      }

      navigate(`/electronique/appareils/${appareilId}`)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner /></div>
  if (!appareil) return <div className="text-center py-12 text-gray-400">Appareil non trouvé</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button onClick={() => navigate(`/electronique/appareils/${appareilId}`)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        <ArrowLeft size={16} /> Retour à la fiche
      </Button>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
          <Wrench size={20} className="text-blue-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Réparation</h1>
          <p className="text-sm text-gray-500">{appareil.clients?.nom} — {appareil.marque} {appareil.modele}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 space-y-4">
        {diagnostic && (
          <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl text-sm">
            <p className="font-medium text-gray-500 mb-1">Diagnostic associé</p>
            <p>{diagnostic.diagnostic || 'Aucun diagnostic'} {diagnostic.pieces_necessaires && `— Pièces : ${diagnostic.pieces_necessaires}`}</p>
          </div>
        )}

        <div>
          <label className="label">Statut</label>
          <div className="flex flex-wrap gap-2">
            {STATUT_FLOW.map(s => (
              <Button key={s.value} onClick={() => handleFieldChange('statut', s.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                  form.statut === s.value
                    ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 text-primary-700 dark:text-primary-300'
                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-200'
                }`}
              >{s.label}</Button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Pièces utilisées</label>
          <textarea className="input min-h-[80px]" value={form.pieces_utilisees} onChange={e => handleFieldChange('pieces_utilisees', e.target.value)} placeholder="Liste des pièces remplacées..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Main-d'œuvre (coût)</label>
            <input className="input" type="number" value={form.main_oeuvre} onChange={e => handleFieldChange('main_oeuvre', e.target.value)} placeholder="0" />
          </div>
          <div>
            <label className="label">Temps passé (heures)</label>
            <input className="input" type="number" value={form.temps_passe} onChange={e => handleFieldChange('temps_passe', e.target.value)} placeholder="0" />
          </div>
        </div>

        <div>
          <label className="label">Notes de réparation</label>
          <textarea className="input min-h-[80px]" value={form.notes} onChange={e => handleFieldChange('notes', e.target.value)} placeholder="Détails de l'intervention..." />
        </div>

        {error && <p className="text-sm text-red-500 flex items-center gap-1"><AlertTriangle size={14} /> {error}</p>}

        <div className="flex gap-3 pt-2">
          <Button onClick={handleSubmit} disabled={saving}>
            <Save size={16} /> {activeRep ? 'Mettre à jour' : 'Démarrer la réparation'}
          </Button>
          <Button variant="ghost" onClick={() => navigate(`/electronique/appareils/${appareilId}`)}>Annuler</Button>
        </div>
      </div>

      {reparations.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-4">
          <h3 className="font-semibold text-sm mb-3">Historique des réparations</h3>
          <div className="space-y-2">
            {reparations.map(r => (
              <div key={r.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <span className="text-gray-500">{r.cree_le?.split(' ')[0]}</span>
                <span className="font-medium">{STATUT_FLOW.find(s => s.value === r.statut)?.label || r.statut}</span>
                {r.main_oeuvre > 0 && <span>{r.main_oeuvre} FG</span>}
                {r.temps_passe > 0 && <span>{r.temps_passe}h</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
