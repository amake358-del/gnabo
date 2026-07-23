import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { ClipboardCheck, ArrowLeft, Save, AlertTriangle } from 'lucide-react'

const TEST_CATEGORIES = [
  { key: 'alimentation', label: 'Alimentation / Charge' },
  { key: 'ecran', label: 'Écran / Affichage' },
  { key: 'batterie', label: 'Batterie' },
  { key: 'haut_parleur', label: 'Haut-parleur' },
  { key: 'microphone', label: 'Microphone' },
  { key: 'vibreur', label: 'Vibreur' },
  { key: 'wifi', label: 'Wi-Fi' },
  { key: 'bluetooth', label: 'Bluetooth' },
  { key: 'gsm', label: 'GSM / Appels' },
  { key: 'chargeur', label: 'Port chargeur' },
  { key: 'tactile', label: 'Tactile' },
  { key: 'appareil_photo', label: 'Appareil photo' },
  { key: 'lecteur_carte', label: 'Lecteur carte SIM/SD' },
  { key: 'boutons', label: 'Boutons physiques' },
  { key: 'capteurs', label: 'Capteurs' },
]

interface TestItem {
  categorie: string
  resultat: 'ok' | 'ko' | 'non_test' | 'na'
  commentaire: string
}

export function ControleTechniquePage() {
  const { appareilId } = useParams<{ appareilId: string }>()
  const navigate = useNavigate()
  const [appareil, setAppareil] = useState<any>(null)
  const [tests, setTests] = useState<TestItem[]>([])
  const [commentaire, setCommentaire] = useState('')
  const [technicien, setTechnicien] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!appareilId) return
    Promise.all([
      fetch(`/api/v1/appareils/${appareilId}`).then(r => r.json()),
      fetch(`/api/v1/controles/appareil/${appareilId}`).then(r => r.json()),
    ]).then(([appRes, ctRes]) => {
      setAppareil(appRes.data)
      if (ctRes.data?.tests?.length > 0) {
        setTests(ctRes.data.tests)
        setCommentaire(ctRes.data.session?.commentaire || '')
        setTechnicien(ctRes.data.session?.technicien || '')
      } else {
        setTests(TEST_CATEGORIES.map(c => ({ categorie: c.key, resultat: 'non_test' as const, commentaire: '' })))
      }
    }).catch(err => setError(err.message)).finally(() => setLoading(false))
  }, [appareilId])

  const updateTest = (categorie: string, field: string, value: string) => {
    setTests(prev => prev.map(t => t.categorie === categorie ? { ...t, [field]: value } : t))
  }

  const handleSubmit = async () => {
    if (!appareilId) return
    setSaving(true); setError(''); setSuccess('')
    try {
      const res = await fetch(`/api/v1/controles/appareil/${appareilId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tests, commentaire, technicien }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Erreur')
      setSuccess('Contrôle technique enregistré')
    } catch (err: any) { setError(err.message) } finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner /></div>
  if (!appareil) return <div className="text-center py-12 text-gray-400">Appareil non trouvé</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button onClick={() => navigate(`/electronique/appareils/${appareilId}`)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"><ArrowLeft size={16} /> Retour</Button>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center"><ClipboardCheck size={20} className="text-green-500" /></div>
        <div><h1 className="text-xl font-bold">Contrôle technique</h1><p className="text-sm text-gray-500">{appareil.client_nom} — {appareil.marque} {appareil.modele}</p></div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input className="input" placeholder="Technicien" value={technicien} onChange={e => setTechnicien(e.target.value)} />
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {tests.map(test => {
            const cat = TEST_CATEGORIES.find(c => c.key === test.categorie)
            return (
              <div key={test.categorie} className="py-3 flex items-center gap-3">
                <span className="flex-1 text-sm font-medium">{cat?.label || test.categorie}</span>
                <div className="flex gap-1">
                  {(['ok', 'ko', 'na', 'non_test'] as const).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => updateTest(test.categorie, 'resultat', r)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        test.resultat === r
                          ? r === 'ok' ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700'
                            : r === 'ko' ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700'
                            : r === 'na' ? 'bg-gray-50 border-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                            : 'bg-gray-100 border-gray-300 text-gray-400 dark:bg-gray-600 dark:text-gray-500'
                          : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                      }`}
                    >
                      {r === 'ok' ? 'OK' : r === 'ko' ? 'KO' : r === 'na' ? 'N/A' : '—'}
                    </button>
                  ))}
                </div>
                {test.resultat === 'ko' && (
                  <input className="input w-32 text-xs" placeholder="Problème..." value={test.commentaire} onChange={e => updateTest(test.categorie, 'commentaire', e.target.value)} />
                )}
              </div>
            )
          })}
        </div>

        <div>
          <label className="label">Commentaire général</label>
          <textarea className="input min-h-[60px]" value={commentaire} onChange={e => setCommentaire(e.target.value)} placeholder="Observations..." />
        </div>

        {error && <p className="text-sm text-red-500 flex items-center gap-1"><AlertTriangle size={14} /> {error}</p>}
        {success && <p className="text-sm text-green-500">{success}</p>}

        <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-700/50">
          <Button onClick={handleSubmit} disabled={saving}><Save size={16} /> Enregistrer</Button>
          <Button variant="ghost" onClick={() => navigate(`/electronique/appareils/${appareilId}`)}>Annuler</Button>
        </div>
      </div>
    </div>
  )
}
