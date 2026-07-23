import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { ClipboardList, ArrowLeft, Save, AlertTriangle, FileText, Send, Wrench } from 'lucide-react'

export function DiagnosticPage() {
  const { appareilId } = useParams<{ appareilId: string }>()
  const navigate = useNavigate()
  const [appareil, setAppareil] = useState<any | null>(null)
  const [diagnostic, setDiagnostic] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [config, setConfig] = useState<any>({ company_name: '', currency: 'GNF' })
  const [form, setForm] = useState({
    diagnostic: '', cause: '', tests: '', pieces_necessaires: '',
    main_oeuvre: '', temps_estime: '', observations: ''
  })

  useEffect(() => {
    if (!appareilId) return
    Promise.all([
      supabase.from('appareils').select('*, clients(nom, telephone, adresse)').eq('id', appareilId).single(),
      supabase.from('diagnostics').select('*').eq('appareil_id', appareilId).maybeSingle(),
      supabase.from('parametres').select('cle, valeur'),
    ]).then(([appRes, diagRes, cfgRes]) => {
      if (appRes.error) throw appRes.error
      if (cfgRes.error) throw cfgRes.error

      const cfg: Record<string, string> = {}
      if (cfgRes.data) {
        cfgRes.data.forEach((row: any) => { cfg[row.cle] = row.valeur })
      }
      setConfig({ company_name: cfg.company_name || '', currency: cfg.devise || 'GNF' })

      const appData = appRes.data
      if (appData) {
        const client = (appData as any).clients
        setAppareil({
          ...appData,
          client_nom: client?.nom || '',
          client_telephone: client?.telephone || '',
          client_adresse: client?.adresse || '',
        })
      } else {
        setAppareil(null)
      }

      if (diagRes.data && !diagRes.error) {
        setDiagnostic(diagRes.data)
        setForm({
          diagnostic: diagRes.data.diagnostic || '',
          cause: diagRes.data.cause || '',
          tests: diagRes.data.tests || '',
          pieces_necessaires: diagRes.data.pieces_necessaires || '',
          main_oeuvre: String(diagRes.data.main_oeuvre || ''),
          temps_estime: String(diagRes.data.temps_estime || ''),
          observations: diagRes.data.observations || '',
        })
      }
    }).catch(err => {
      console.error(err)
      setError(err.message || 'Erreur de chargement')
    }).finally(() => setLoading(false))
  }, [appareilId])

  const handleFieldChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!appareilId) return
    setSaving(true); setError(''); setSuccess('')
    try {
      if (diagnostic) {
        const { error: updateError } = await supabase.from('diagnostics').update({
          diagnostic: form.diagnostic, cause: form.cause, tests: form.tests,
          pieces_necessaires: form.pieces_necessaires,
          main_oeuvre: parseFloat(form.main_oeuvre) || 0,
          temps_estime: parseFloat(form.temps_estime) || 0,
          observations: form.observations,
        }).eq('id', diagnostic.id)
        if (updateError) throw updateError
      } else {
        const { error: createError } = await supabase.from('diagnostics').insert({
          appareil_id: appareilId, diagnostic: form.diagnostic, cause: form.cause,
          tests: form.tests, pieces_necessaires: form.pieces_necessaires,
          main_oeuvre: parseFloat(form.main_oeuvre) || 0,
          temps_estime: parseFloat(form.temps_estime) || 0,
          observations: form.observations,
        })
        if (createError) throw createError
        await supabase.from('appareils').update({ statut: 'diagnostic', modifie_le: new Date().toISOString() }).eq('id', appareilId)
      }
      const { data: refreshed } = await supabase.from('diagnostics').select('*').eq('appareil_id', appareilId).maybeSingle()
      if (refreshed) setDiagnostic(refreshed)
      setSuccess('Diagnostic enregistré')
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement')
    } finally { setSaving(false) }
  }

  const transitionStatut = async (statut: string) => {
    if (!appareilId) return
    setTransitioning(true); setError('')
    try {
      await supabase.from('appareils').update({ statut, modifie_le: new Date().toISOString() }).eq('id', appareilId)
      navigate(`/electronique/appareils/${appareilId}`)
    } catch (err: any) {
      setError(err.message || 'Erreur')
    } finally { setTransitioning(false) }
  }

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner /></div>
  if (!appareil) return <div className="text-center py-12 text-gray-400">Appareil non trouvé</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button onClick={() => navigate(`/electronique/appareils/${appareilId}`)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        <ArrowLeft size={16} /> Retour à la fiche
      </Button>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
          <ClipboardList size={20} className="text-orange-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Diagnostic</h1>
          <p className="text-sm text-gray-500">{appareil.client_nom} — {appareil.marque} {appareil.modele}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 space-y-4">
        <div>
          <label className="label">Diagnostic</label>
          <textarea className="input min-h-[80px]" value={form.diagnostic} onChange={e => handleFieldChange('diagnostic', e.target.value)} placeholder="Description du diagnostic..." />
        </div>
        <div>
          <label className="label">Cause probable</label>
          <textarea className="input min-h-[60px]" value={form.cause} onChange={e => handleFieldChange('cause', e.target.value)} placeholder="Cause du problème..." />
        </div>
        <div>
          <label className="label">Tests effectués</label>
          <textarea className="input min-h-[60px]" value={form.tests} onChange={e => handleFieldChange('tests', e.target.value)} placeholder="Tests réalisés..." />
        </div>
        <div>
          <label className="label">Pièces nécessaires</label>
          <textarea className="input min-h-[60px]" value={form.pieces_necessaires} onChange={e => handleFieldChange('pieces_necessaires', e.target.value)} placeholder="Liste des pièces à commander..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Main-d'œuvre (coût)" type="number" value={form.main_oeuvre} onChange={e => handleFieldChange('main_oeuvre', e.target.value)} placeholder="0" />
          <Input label="Temps estimé (heures)" type="number" value={form.temps_estime} onChange={e => handleFieldChange('temps_estime', e.target.value)} placeholder="0" />
        </div>
        <div>
          <label className="label">Observations</label>
          <textarea className="input min-h-[60px]" value={form.observations} onChange={e => handleFieldChange('observations', e.target.value)} placeholder="Notes supplémentaires..." />
        </div>

        {error && <p className="text-sm text-red-500 flex items-center gap-1"><AlertTriangle size={14} /> {error}</p>}
        {success && <p className="text-sm text-green-500">{success}</p>}

        <div className="flex gap-3 pt-2">
          <Button onClick={handleSubmit} disabled={saving}>
            <Save size={16} /> {diagnostic ? 'Mettre à jour' : 'Enregistrer le diagnostic'}
          </Button>
          <Button variant="ghost" onClick={() => navigate(`/electronique/appareils/${appareilId}`)}>Annuler</Button>
          {diagnostic && (
            <Button variant="secondary" onClick={async () => {
              const mod = await import('../../pdf/generateDiagnostic')
              const blob = await mod.generateDiagnosticPdf({
                appareil: appareil,
                client: { nom: appareil.client_nom, telephone: appareil.client_telephone, adresse: appareil.client_adresse },
                diagnostic: diagnostic,
                numero: `DIA-${appareil.uid_visible || appareil.id.slice(0, 8)}`,
                cout_estime: diagnostic.main_oeuvre || 0,
                currency: config.currency || 'EUR',
              }, config)
              window.open(URL.createObjectURL(blob))
            }}>
              <FileText size={16} /> PDF Diagnostic
            </Button>
          )}
        </div>
      </div>

      {diagnostic && !['validation_client', 'reparation_autorisee', 'attente_pieces', 'en_reparation', 'test', 'pret', 'livre', 'archive'].includes(appareil.statut) && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 space-y-3">
          <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">Prochaines étapes</h3>
          <div className="flex gap-3">
            <Button onClick={() => transitionStatut('validation_client')} disabled={transitioning}>
              <Send size={16} /> Soumettre au client
            </Button>
            <Button onClick={() => transitionStatut('reparation_autorisee')} disabled={transitioning}>
              <Wrench size={16} /> Passer en réparation
            </Button>
          </div>
          <p className="text-xs text-gray-400">Soumettre = attendre validation client. Passer en réparation = commencer directement.</p>
        </div>
      )}
    </div>
  )
}
