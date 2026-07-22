import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { supabase } from '../services/supabase'
import { formatCurrency, formatDecimal } from '../utils/format'
import { toast } from '../utils/notify'
import { generatePdf } from '../pdf/generatePdf'
import { Plus, Trash2, ArrowLeft, ArrowRight, Save, FileText, Search, Download } from 'lucide-react'
import type { DevisLine, Client, CatalogType, Modele } from '../types'
import { useForm } from 'react-hook-form'

interface DevisFormData {
  client_id: string
  type_id: string
  modele_id: string
  notes: string
  remise: number
  transport: number
  pose: number
  tva: number
  acompte: number
  statut: string
}

export function DevisFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isEdit = !!id
  const viewOnly = isEdit && searchParams.get('apercu') === '1'
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [types, setTypes] = useState<CatalogType[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [clientSearch, setClientSearch] = useState('')
  const [clientModalOpen, setClientModalOpen] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const [newClientCompany, setNewClientCompany] = useState('')
  const [lines, setLines] = useState<DevisLine[]>([])
  const [modelesList, setModelesList] = useState<Modele[]>([])
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [stats, setStats] = useState({ total_ht: 0, total_ttc: 0, acompte: 0, reste: 0, acomptePct: 30 })
  const [companyConfig, setCompanyConfig] = useState<any>(null)

  const { register, watch, setValue, reset, getValues } = useForm<DevisFormData>({
    defaultValues: { remise: 0, transport: 0, pose: 0, tva: 0, acompte: 0, statut: 'brouillon' }
  })

  const watchRemise = watch('remise')
  const watchTransport = watch('transport')
  const watchPose = watch('pose')
  const watchTva = watch('tva')
  const watchAcompte = watch('acompte')

  useEffect(() => {
    supabase.from('catalog_types').select('*').then(({ data }) => setTypes(data ?? []))
    supabase.from('catalog_modeles').select('*').then(({ data }) => setModelesList(data ?? []))
    supabase.from('clients').select('*').then(({ data }) => { setClients(data ?? []); setFilteredClients(data ?? []) })
    supabase.from('parametres').select('cle, valeur').then(({ data }) => {
      if (!data) return
      const cfg: any = {}
      for (const r of data) cfg[r.cle] = r.valeur
      setCompanyConfig(cfg)
      if (!isEdit && cfg.default_tva) setValue('tva', parseFloat(cfg.default_tva) || 0)
    })
  }, [])

  useEffect(() => {
    if (clientSearch) {
      const s = clientSearch.toLowerCase()
      setFilteredClients(clients.filter(c => c.nom?.toLowerCase().includes(s) || c.prenom?.toLowerCase().includes(s) || c.email?.toLowerCase().includes(s)))
    } else setFilteredClients(clients)
  }, [clientSearch, clients])

  useEffect(() => {
    if (isEdit) {
      supabase.from('devis').select('*, devis_lignes(*)').eq('id', id).single().then(({ data: d, error }) => {
        if (error || !d) { navigate('/devis'); return }
        reset({
          client_id: String(d.client_id),
          type_id: '',
          modele_id: '',
          notes: d.notes ?? '',
          remise: 0,
          transport: 0,
          pose: 0,
          tva: d.tva,
          acompte: d.acompte ?? 0,
          statut: d.statut,
        })
        if (d.devis_lignes) {
          const lignes = (d.devis_lignes as any[]).map((l: any, i: number) => ({
            designation: l.description,
            quantite: l.quantite,
            largeur: l.largeur ?? 0,
            hauteur: l.hauteur ?? 0,
            surface: l.surface ?? 0,
            prix_m2: l.prix_unitaire_ht,
            total: l.total_ht,
            sort_order: i,
          }))
          setLines(lignes)
        }
        setStep(3)
        setLoading(false)
      })
    }
  }, [id])

  const recalc = useCallback(() => {
    const total_ht = lines.reduce((s, l) => s + (l.total || 0), 0)
    const v = getValues()
    const remise = v.remise || 0
    const transport = v.transport || 0
    const pose = v.pose || 0
    const tva = v.tva || 20
    const after_remise = total_ht - remise
    const total_ttc = after_remise + transport + pose + (after_remise * tva / 100)
    const defaultPct = 30
    const acompte = (v.acompte && v.acompte > 0) ? v.acompte : Math.round(total_ttc * defaultPct / 100 * 100) / 100
    const acomptePct = total_ttc > 0 ? Math.round(acompte / total_ttc * 100) : defaultPct
    const reste = Math.round((total_ttc - acompte) * 100) / 100
    setStats({ total_ht: Math.round(total_ht * 100) / 100, total_ttc: Math.round(total_ttc * 100) / 100, acompte, reste, acomptePct })
  }, [lines, getValues])

  useEffect(() => { recalc() }, [lines, watchRemise, watchTransport, watchPose, watchTva, watchAcompte, recalc])

  const addLine = () => {
    const modele = modelesList.find(m => m.id === getValues().modele_id)
    const defaultPrix = modele?.prix || 0
    setLines([...lines, { designation: '', quantite: 1, largeur: 0, hauteur: 0, surface: 0, prix_m2: defaultPrix, total: 0, sort_order: lines.length }])
  }

  const updateLine = (idx: number, field: keyof DevisLine, value: any) => {
    const newLines = [...lines]
    const line = { ...newLines[idx], [field]: value }
    if (field === 'largeur' || field === 'hauteur') {
      const w = field === 'largeur' ? value : line.largeur
      const h = field === 'hauteur' ? value : line.hauteur
      line.surface = Math.round((parseFloat(w) || 0) * (parseFloat(h) || 0) / 10000 * 1000000) / 1000000
    }
    if (field === 'largeur' || field === 'hauteur' || field === 'surface' || field === 'quantite' || field === 'prix_m2') {
      const q = field === 'quantite' ? value : line.quantite
      const p = field === 'prix_m2' ? value : line.prix_m2
      const s = field === 'surface' ? value : line.surface
      line.total = Math.round((parseFloat(s) || 0) * (parseFloat(q) || 1) * (parseFloat(p) || 0) * 100) / 100
    }
    newLines[idx] = line
    setLines(newLines)
  }

  const removeLine = (idx: number) => setLines(lines.filter((_, i) => i !== idx))

  function generateNumero() {
    const now = new Date()
    const ts = now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0')
    return 'DEV-' + ts + '-' + String(Math.floor(Math.random() * 1000)).padStart(3, '0')
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const data = getValues()
      const payload: Record<string, any> = {
        client_id: parseInt(data.client_id),
        service: 'aluminium',
        statut: data.statut || 'brouillon',
        montant_ht: stats.total_ht,
        tva: data.tva || 0,
        montant_ttc: stats.total_ttc,
        acompte: data.acompte || 0,
        notes: data.notes || '',
      }

      let devisId: number | string | undefined = id
      if (isEdit && devisId) {
        await supabase.from('devis').update(payload).eq('id', devisId)
        await supabase.from('devis_lignes').delete().eq('devis_id', devisId)
      } else {
        payload.numero = generateNumero()
        const { data: newDevis, error } = await supabase.from('devis').insert(payload).select('id').single()
        if (error) throw error
        devisId = newDevis.id
      }

      if (lines.length > 0 && devisId) {
        const lignes = lines.map(l => ({
          devis_id: devisId,
          description: l.designation,
          quantite: l.quantite,
          prix_unitaire_ht: l.prix_m2 || 0,
          total_ht: l.total || 0,
          largeur: l.largeur || null,
          hauteur: l.hauteur || null,
          surface: l.surface || null,
        }))
        const { error: lErr } = await supabase.from('devis_lignes').insert(lignes)
        if (lErr) throw lErr
      }

      navigate('/devis')
    } catch (err: any) { toast(err.message, 'error') }
    finally { setSaving(false) }
  }

  const handleGeneratePdf = async () => {
    setGeneratingPdf(true)
    try {
      const devisData = {
        id: id || 'new',
        numero: 'DEV-2026-XXXXXX',
        client_id: getValues().client_id,
        type_id: getValues().type_id,
        modele_id: getValues().modele_id,
        statut: 'brouillon' as const,
        total_ht: stats.total_ht,
        remise: getValues().remise || 0,
        transport: getValues().transport || 0,
        pose: getValues().pose || 0,
        tva: getValues().tva || 20,
        total_ttc: stats.total_ttc,
        acompte: stats.acompte,
        reste: stats.reste,
        notes: getValues().notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        lines: lines.map((l, i) => ({ ...l, sort_order: i })),
        client: clients.find(c => String(c.id) === getValues().client_id),
      }
      const blob = await generatePdf(devisData, companyConfig || {})
      setPdfBlob(blob)
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (err: any) { toast(err.message, 'error') }
    finally { setGeneratingPdf(false) }
  }

  const handleCreateClient = async () => {
    if (!newClientName.trim()) return
    try {
      const { data, error } = await supabase.from('clients').insert({
        nom: newClientCompany || newClientName,
        prenom: newClientCompany ? newClientName : '',
      }).select().single()
      if (error) throw error
      setClients(prev => [data, ...prev])
      setValue('client_id', data.id)
      setClientModalOpen(false)
      setNewClientName('')
      setNewClientCompany('')
    } catch (err: any) { toast(err.message, 'error') }
  }

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size={40} /></div>

  if (viewOnly) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate('/devis')}><ArrowLeft size={16} /> Retour</Button>
          <h1 className="text-2xl font-bold">Aperçu du devis</h1>
        </div>
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Aperçu du devis</h2>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleGeneratePdf} loading={generatingPdf}>
                <FileText size={14} /> Générer le PDF
              </Button>
              {pdfBlob && (
                <Button size="sm" onClick={() => {
                  const url = URL.createObjectURL(pdfBlob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `devis-${Date.now()}.pdf`
                  a.click()
                }}>
                  <Download size={14} /> Télécharger
                </Button>
              )}
            </div>
          </div>
          {lines.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-3 py-2 text-left">Désignation</th>
                    <th className="px-3 py-2 text-right">Qté</th>
                    <th className="px-3 py-2 text-right">L (mm)</th>
                    <th className="px-3 py-2 text-right">H (mm)</th>
                    <th className="px-3 py-2 text-right">Surface</th>
                    <th className="px-3 py-2 text-right">Prix m²</th>
                    <th className="px-3 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l, i) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="px-3 py-2">{l.designation}</td>
                      <td className="px-3 py-2 text-right">{l.quantite}</td>
                      <td className="px-3 py-2 text-right">{l.largeur}</td>
                      <td className="px-3 py-2 text-right">{l.hauteur}</td>
                      <td className="px-3 py-2 text-right">{formatDecimal(l.surface, 6)} m²</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(l.prix_m2)}</td>
                      <td className="px-3 py-2 text-right font-medium">{formatCurrency(l.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Aucune ligne</p>
          )}
        </Card>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <Input label="Remise (FG)" type="number" step="0.01" disabled {...register('remise', { valueAsNumber: true })} />
            <Input label="Transport (FG)" type="number" step="0.01" disabled {...register('transport', { valueAsNumber: true })} />
            <Input label="Pose (FG)" type="number" step="0.01" disabled {...register('pose', { valueAsNumber: true })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Input label="TVA (%)" type="number" step="0.1" disabled {...register('tva', { valueAsNumber: true })} />
            <Input label="Acompte (FG)" type="number" step="0.01" disabled {...register('acompte', { valueAsNumber: true })} />
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
            <div className="flex justify-between text-sm"><span>Total HT</span><span className="font-medium">{formatCurrency(stats.total_ht)}</span></div>
            <div className="flex justify-between text-sm"><span>Total TTC</span><span className="font-bold text-lg text-primary-600">{formatCurrency(stats.total_ttc)}</span></div>
            <div className="flex justify-between text-sm"><span>Acompte ({stats.acomptePct}%)</span><span>{formatCurrency(stats.acompte)}</span></div>
            <div className="flex justify-between text-sm"><span>Reste à payer</span><span className="font-medium">{formatCurrency(stats.reste)}</span></div>
          </div>
          <div className="mt-4">
            <label className="label">Notes</label>
            <textarea className="input min-h-[80px] resize-none" disabled {...register('notes')} />
          </div>
        </Card>
        <div className="flex justify-between">
          <Button variant="secondary" onClick={() => navigate('/devis')}><ArrowLeft size={16} /> Retour à la liste</Button>
        </div>
      </div>
    )
  }

  const steps = [
    { label: 'Type', done: !!getValues().type_id },
    { label: 'Modèle', done: !!getValues().modele_id },
    { label: 'Client', done: !!getValues().client_id },
    { label: 'Lignes', done: lines.length > 0 },
    { label: 'Aperçu', done: false },
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => navigate('/devis')}><ArrowLeft size={16} /> Retour</Button>
        <h1 className="text-2xl font-bold">{isEdit ? 'Modifier devis' : 'Nouveau devis'}</h1>
      </div>

      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
              <button type="button" onClick={() => setStep(i)} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step === i ? 'bg-primary-600 text-white' : s.done ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                {s.done ? '✓' : i + 1}
              </button>
            <span className={`text-sm ${step === i ? 'font-medium' : 'text-gray-500'}`}>{s.label}</span>
            {i < steps.length - 1 && <div className="w-8 h-px bg-gray-300 dark:bg-gray-600" />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <Card>
          <h2 className="text-lg font-semibold mb-4">Choisir le type de devis</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {types.map(t => (
              <button type="button" key={t.id} onClick={() => { setValue('type_id', t.id); setStep(1) }}
                className={`p-4 rounded-xl border-2 text-center transition-all ${getValues().type_id === t.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'}`}>
                <p className="font-medium">{t.name}</p>
              </button>
            ))}
          </div>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <h2 className="text-lg font-semibold mb-4">Choisir le modèle</h2>
          {!getValues().type_id ? (
            <p className="text-gray-500 text-center py-4">Veuillez d'abord sélectionner un type.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {modelesList.filter(m => m.type_id === getValues().type_id && m.status === 'actif').map(m => (
                <button type="button" key={m.id} onClick={() => { setValue('modele_id', m.id); setStep(2) }}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${getValues().modele_id === m.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'}`}>
                  <p className="font-medium">{m.name}</p>
                  <p className="text-sm text-gray-500 mt-1">{m.prix.toFixed(2)} FG/m²</p>
                  {m.description && <p className="text-xs text-gray-400 mt-1">{m.description}</p>}
                </button>
              ))}
              {modelesList.filter(m => m.type_id === getValues().type_id && m.status === 'actif').length === 0 && (
                <p className="text-gray-500 col-span-full text-center py-4">Aucun modèle actif pour ce type.</p>
              )}
            </div>
          )}
        </Card>
      )}

      {step === 2 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Choisir ou créer un client</h2>
            <Button variant="secondary" size="sm" onClick={() => setClientModalOpen(true)}><Plus size={14} /> Nouveau client</Button>
          </div>
          <div className="relative mb-4">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-10" placeholder="Rechercher un client..." value={clientSearch} onChange={e => setClientSearch(e.target.value)} />
          </div>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {filteredClients.map(c => (
              <button type="button" key={c.id} onClick={() => { setValue('client_id', c.id); setStep(3) }}
                className={`w-full text-left p-3 rounded-lg border transition-all ${getValues().client_id === c.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                <p className="font-medium">{c.nom} {c.prenom || ''}</p>
                <p className="text-sm text-gray-500">{c.email} {c.telephone ? `| ${c.telephone}` : ''}</p>
              </button>
            ))}
            {filteredClients.length === 0 && <p className="text-center text-gray-500 py-4">Aucun client trouvé</p>}
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Lignes du devis</h2>
            <Button size="sm" onClick={addLine}><Plus size={14} /> Ajouter une ligne</Button>
          </div>
          {lines.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText size={48} className="mx-auto mb-2 opacity-50" />
              <p>Aucune ligne. Cliquez sur "Ajouter une ligne" pour commencer.</p>
            </div>
          ) : (
              <div className="space-y-3">
                {lines.map((line, i) => (
                  <div key={i} className="relative p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex flex-col gap-3 lg:hidden">
                      <input className="input text-sm" placeholder="Désignation" value={line.designation} onChange={e => updateLine(i, 'designation', e.target.value)} />
                      <div className="grid grid-cols-3 gap-2">
                        <input className="input text-sm" type="number" placeholder="Qté" value={line.quantite || ''} onChange={e => updateLine(i, 'quantite', parseFloat(e.target.value) || 0)} />
                        <input className="input text-sm" type="number" placeholder="L (mm)" value={line.largeur || ''} onChange={e => updateLine(i, 'largeur', parseFloat(e.target.value) || 0)} />
                        <input className="input text-sm" type="number" placeholder="H (mm)" value={line.hauteur || ''} onChange={e => updateLine(i, 'hauteur', parseFloat(e.target.value) || 0)} />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <input className="input text-sm" type="number" step="any" placeholder="m²" value={line.surface || ''} onChange={e => updateLine(i, 'surface', parseFloat(e.target.value) || 0)} />
                        <div className="col-span-2 flex items-center gap-2">
                          <span className="text-xs text-gray-500">Prix:</span>
                          <input className="input text-sm flex-1" type="number" step="0.000001" placeholder="FG/m²" value={line.prix_m2 || ''} onChange={e => updateLine(i, 'prix_m2', parseFloat(e.target.value) || 0)} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">Total: {formatCurrency(line.total)}</span>
                        <Button onClick={() => removeLine(i)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"><Trash2 size={16} /></Button>
                      </div>
                    </div>
                    <div className="hidden lg:flex items-start gap-2">
                      <div className="flex-1 grid grid-cols-12 gap-2">
                        <input className="input col-span-4 text-sm" placeholder="Désignation" value={line.designation} onChange={e => updateLine(i, 'designation', e.target.value)} />
                        <input className="input col-span-1 text-sm" type="number" placeholder="Qté" value={line.quantite || ''} onChange={e => updateLine(i, 'quantite', parseFloat(e.target.value) || 0)} />
                        <input className="input col-span-1 text-sm" type="number" placeholder="L (mm)" value={line.largeur || ''} onChange={e => updateLine(i, 'largeur', parseFloat(e.target.value) || 0)} />
                        <input className="input col-span-1 text-sm" type="number" placeholder="H (mm)" value={line.hauteur || ''} onChange={e => updateLine(i, 'hauteur', parseFloat(e.target.value) || 0)} />
                        <input className="input col-span-1 text-sm" type="number" step="any" placeholder="m²" value={line.surface || ''} onChange={e => updateLine(i, 'surface', parseFloat(e.target.value) || 0)} />
                        <input className="input col-span-1 text-sm" type="number" step="0.000001" placeholder="FG/m²" value={line.prix_m2 || ''} onChange={e => updateLine(i, 'prix_m2', parseFloat(e.target.value) || 0)} />
                        <div className="col-span-1 flex items-center text-sm font-medium">{formatCurrency(line.total)}</div>
                      </div>
                      <Button onClick={() => removeLine(i)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg mt-1 shrink-0"><Trash2 size={14} /></Button>
                    </div>
                  </div>
                ))}
              </div>
          )}
        </Card>
      )}

      {step === 4 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Aperçu du devis</h2>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleGeneratePdf} loading={generatingPdf}>
                <FileText size={14} /> Générer le PDF
              </Button>
              {pdfBlob && (
                <Button size="sm" onClick={() => {
                  const url = URL.createObjectURL(pdfBlob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `devis-${Date.now()}.pdf`
                  a.click()
                }}>
                  <Download size={14} /> Télécharger
                </Button>
              )}
            </div>
          </div>
          {lines.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-3 py-2 text-left">Désignation</th>
                    <th className="px-3 py-2 text-right">Qté</th>
                    <th className="px-3 py-2 text-right">L (mm)</th>
                    <th className="px-3 py-2 text-right">H (mm)</th>
                    <th className="px-3 py-2 text-right">Surface</th>
                    <th className="px-3 py-2 text-right">Prix m²</th>
                    <th className="px-3 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l, i) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="px-3 py-2">{l.designation}</td>
                      <td className="px-3 py-2 text-right">{l.quantite}</td>
                      <td className="px-3 py-2 text-right">{l.largeur}</td>
                      <td className="px-3 py-2 text-right">{l.hauteur}</td>
                      <td className="px-3 py-2 text-right">{formatDecimal(l.surface, 6)} m²</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(l.prix_m2)}</td>
                      <td className="px-3 py-2 text-right font-medium">{formatCurrency(l.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Aucune ligne</p>
          )}
        </Card>
      )}

      {(step >= 3) && (
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <Input label="Remise (FG)" type="number" step="0.01" {...register('remise', { valueAsNumber: true })} />
            <Input label="Transport (FG)" type="number" step="0.01" {...register('transport', { valueAsNumber: true })} />
            <Input label="Pose (FG)" type="number" step="0.01" {...register('pose', { valueAsNumber: true })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Input label="TVA (%)" type="number" step="0.1" {...register('tva', { valueAsNumber: true })} />
            <Input label="Acompte (FG)" type="number" step="0.01" {...register('acompte', { valueAsNumber: true })} />
            <Select label="Statut" options={[
              { value: 'brouillon', label: 'Brouillon' },
              { value: 'envoye', label: 'Envoyé' },
              { value: 'accepte', label: 'Accepté' },
              { value: 'refusé', label: 'Refusé' },
            ]} {...register('statut')} />
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
            <div className="flex justify-between text-sm"><span>Total HT</span><span className="font-medium">{formatCurrency(stats.total_ht)}</span></div>
            <div className="flex justify-between text-sm"><span>Total TTC</span><span className="font-bold text-lg text-primary-600">{formatCurrency(stats.total_ttc)}</span></div>
            <div className="flex justify-between text-sm"><span>Acompte ({stats.acomptePct}%)</span><span>{formatCurrency(stats.acompte)}</span></div>
            <div className="flex justify-between text-sm"><span>Reste à payer</span><span className="font-medium">{formatCurrency(stats.reste)}</span></div>
          </div>
          <div className="mt-4">
            <label className="label">Notes</label>
            <textarea className="input min-h-[80px] resize-none" {...register('notes')} />
          </div>
        </Card>
      )}

      <div className="flex justify-between">
        <div>
          {step > 0 && <Button variant="secondary" onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> Retour</Button>}
        </div>
        <div className="flex gap-3">
          {step < 4 && <Button onClick={() => setStep(step + 1)}>Suivant <ArrowRight size={16} /></Button>}
          {step >= 4 && <Button onClick={handleSave} loading={saving}><Save size={16} /> {isEdit ? 'Modifier' : 'Enregistrer'}</Button>}
        </div>
      </div>

      <Modal open={clientModalOpen} onClose={() => setClientModalOpen(false)} title="Nouveau client" size="sm">
        <div className="space-y-4">
          <Input label="Nom *" value={newClientName} onChange={e => setNewClientName(e.target.value)} placeholder="Nom du contact" />
          <Input label="Société" value={newClientCompany} onChange={e => setNewClientCompany(e.target.value)} placeholder="Nom de la société" />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setClientModalOpen(false)}>Annuler</Button>
            <Button onClick={handleCreateClient}>Créer</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}