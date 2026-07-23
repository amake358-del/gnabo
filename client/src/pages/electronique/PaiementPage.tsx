import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import { Button } from '../../components/ui/Button'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { DollarSign, ArrowLeft, CheckCircle, AlertTriangle, Download } from 'lucide-react'

export function PaiementPage() {
  const { appareilId } = useParams<{ appareilId: string }>()
  const navigate = useNavigate()
  const [appareil, setAppareil] = useState<any>(null)
  const [factures, setFactures] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [montant, setMontant] = useState('')
  const [type, setType] = useState('total')
  const [methode, setMethode] = useState('especes')
  const [reference, setReference] = useState('')
  const [factureId, setFactureId] = useState('')
  const [paiements, setPaiements] = useState<any[]>([])
  const [config, setConfig] = useState<any>({})

  useEffect(() => {
    if (!appareilId) return
    ;(async () => {
      try {
        const [a, f, p, c] = await Promise.all([
          supabase.from('appareils').select('*, clients(nom)').eq('id', appareilId).single(),
          supabase.from('factures').select('*').order('cree_le', { ascending: false }),
          supabase.from('paiements').select('*').eq('appareil_id', appareilId).order('cree_le', { ascending: false }),
          supabase.from('parametres').select('cle, valeur').then(({ data }) => {
            const cfg: Record<string, string> = {}
            if (data) for (const r of data) cfg[r.cle] = r.valeur
            return cfg
          }),
        ])
        if (a.data) setAppareil({ ...a.data, client_nom: a.data.clients?.nom })
        setFactures((f.data || []).filter((fact: any) => fact.appareil_id === appareilId))
        setPaiements(p.data || [])
        setConfig(c)
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    })()
  }, [appareilId])

  const handlePaiement = async () => {
    if (!appareilId || !montant || !appareil) { setError('Montant requis'); return }
    setSaving(true); setError(''); setSuccess('')
    try {
      const { error: paiementError } = await supabase.from('paiements').insert({
        type,
        mode: methode,
        montant: parseFloat(montant),
        reference: reference || null,
        client_id: appareil.client_id,
        appareil_id: appareilId,
        facture_id: factureId || null,
        date_paiement: new Date().toISOString(),
      })
      if (paiementError) throw paiementError
      setSuccess('Paiement enregistré')
      setMontant(''); setReference('')
      const { data: newPaiements } = await supabase.from('paiements').select('*').eq('appareil_id', appareilId).order('cree_le', { ascending: false })
      setPaiements(newPaiements || [])
      const { data: newFactures } = await supabase.from('factures').select('*').order('cree_le', { ascending: false })
      setFactures((newFactures || []).filter((fact: any) => fact.appareil_id === appareilId))
    } catch (err: any) { setError(err.message) } finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner /></div>
  if (!appareil) return <div className="text-center py-12 text-gray-400">Appareil non trouvé</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button onClick={() => navigate(`/electronique/appareils/${appareilId}`)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"><ArrowLeft size={16} /> Retour</Button>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center"><DollarSign size={20} className="text-emerald-500" /></div>
        <div><h1 className="text-xl font-bold">Paiement</h1><p className="text-sm text-gray-500">{appareil.client_nom} — {appareil.marque} {appareil.modele}</p></div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Montant (FG)</label>
            <input className="input" type="number" value={montant} onChange={e => setMontant(e.target.value)} min="0" placeholder="0" />
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input" value={type} onChange={e => setType(e.target.value)}>
              <option value="total">Total</option>
              <option value="partiel">Partiel</option>
              <option value="acompte">Acompte</option>
            </select>
          </div>
          <div>
            <label className="label">Méthode</label>
            <select className="input" value={methode} onChange={e => setMethode(e.target.value)}>
              <option value="especes">Espèces</option>
              <option value="carte">Carte bancaire</option>
              <option value="virement">Virement</option>
              <option value="mobile_money">Mobile Money</option>
            </select>
          </div>
          <div>
            <label className="label">Facture (optionnel)</label>
            <select className="input" value={factureId} onChange={e => setFactureId(e.target.value)}>
              <option value="">Sans facture</option>
              {factures.map((f: any) => (
                <option key={f.id} value={f.id}>{f.numero} — {(f.total_ttc - (f.total_paye || 0)).toLocaleString()} FG restant</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="label">Référence (optionnel)</label>
            <input className="input" value={reference} onChange={e => setReference(e.target.value)} placeholder="N° chèque, transaction..." />
          </div>
        </div>

        {error && <p className="text-sm text-red-500 flex items-center gap-1"><AlertTriangle size={14} /> {error}</p>}
        {success && <p className="text-sm text-green-500 flex items-center gap-1"><CheckCircle size={14} /> {success}</p>}

        <div className="flex gap-3">
          <Button onClick={handlePaiement} disabled={saving}><DollarSign size={16} /> Enregistrer le paiement</Button>
          <Button variant="ghost" onClick={() => navigate(`/electronique/appareils/${appareilId}`)}>Annuler</Button>
        </div>
      </div>

      {paiements.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6">
          <h3 className="font-semibold mb-3">Historique des paiements</h3>
          <div className="space-y-2">
            {paiements.map((p: any) => (
              <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl text-sm">
                <div>
                  <span className="font-medium">{new Date(p.created_at).toLocaleDateString('fr-FR')}</span>
                  <span className="ml-2 text-gray-500 capitalize">{p.type}</span>
                  <span className="ml-2 text-gray-500 capitalize">{p.mode}</span>
                  {p.facture_numero && <span className="ml-2 text-gray-400">({p.facture_numero})</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-600">{p.montant.toLocaleString()} FG</span>
                  <button type="button" onClick={() => {
                    import('../../pdf/generateElectroniquePdf').then(async mod => {
                      const blob = await mod.generateRecuPdf(p, config)
                      window.open(URL.createObjectURL(blob))
                    })
                   }} className="text-gray-400 hover:text-gray-600"><Download size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
