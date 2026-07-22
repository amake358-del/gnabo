import { useEffect, useState, useRef } from 'react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { supabase } from '../services/supabase'
import { useEntrepriseStore } from '../stores/entrepriseStore'
import { toast } from '../utils/notify'
import { Upload, Save, Building2, Palette, DollarSign, Image, FileText, Stamp, Pen, MapPin } from 'lucide-react'
import type { CompanyConfig } from '../types'

const defaultConfig: CompanyConfig = {
  company_name: '', slogan: '', description: '',
  rccm: '', nif: '', address: '', city: '', country: '',
  phone: '', phone2: '', email: '', website: '',
  logo_url: '', favicon_url: '', signature_url: '', cachet_url: '',
  signatory_name: '', signatory_title: '',
  default_tva: 0, currency: 'GNF', date_format: 'DD/MM/YYYY',
  primary_color: '#1e3a5f', secondary_color: '#2563eb',
  conditions: '', footer_text: '',
}

const paramMap: Record<string, keyof CompanyConfig> = {
  entreprise_nom: 'company_name',
  slogan: 'slogan',
  description: 'description',
  rccm: 'rccm',
  nif: 'nif',
  adresse: 'address',
  ville: 'city',
  pays: 'country',
  telephone: 'phone',
  telephone2: 'phone2',
  email: 'email',
  site_web: 'website',
  logo_url: 'logo_url',
  favicon_url: 'favicon_url',
  signature_url: 'signature_url',
  cachet_url: 'cachet_url',
  signataire_nom: 'signatory_name',
  signataire_titre: 'signatory_title',
  devise: 'currency',
  date_format: 'date_format',
  primary_color: 'primary_color',
  secondary_color: 'secondary_color',
  conditions_devis: 'conditions',
  pied_page: 'footer_text',
  default_tva: 'default_tva',
}

const reverseMap: Partial<Record<keyof CompanyConfig, string>> = {}
for (const [k, v] of Object.entries(paramMap)) reverseMap[v] = k

async function loadConfig(): Promise<CompanyConfig> {
  const { data: rows } = await supabase.from('parametres').select('cle, valeur')
  const config = { ...defaultConfig }
  if (rows) {
    for (const row of rows) {
      const key = paramMap[row.cle]
      if (key) {
        (config as any)[key] = key === 'default_tva' ? (parseFloat(row.valeur) || 0) : row.valeur
      }
    }
  }
  return config
}

async function saveConfig(config: CompanyConfig) {
  const payload = Object.entries(config)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([key, value]) => ({
      cle: reverseMap[key as keyof CompanyConfig] || key,
      valeur: String(value),
    }))
  const { error } = await supabase.from('parametres').upsert(payload, { onConflict: 'cle' })
  if (error) throw error
}

async function uploadFile(file: File, field: string): Promise<string> {
  const ext = file.name.split('.').pop() || 'png'
  const path = `${field}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('logos').upload(path, file, { upsert: true, cacheControl: '3600' })
  if (error) throw new Error(`Upload échoué: ${error.message}`)
  const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(path)
  return publicUrl
}

export function SettingsPage() {
  const [config, setConfig] = useState<CompanyConfig>(defaultConfig)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const signatureRef = useRef<HTMLInputElement>(null)
  const cachetRef = useRef<HTMLInputElement>(null)
  const { load: reloadStore } = useEntrepriseStore()

  useEffect(() => {
    loadConfig()
      .then(setConfig)
      .catch(() => toast('Erreur chargement paramètres', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const update = <K extends keyof CompanyConfig>(key: K, val: CompanyConfig[K]) =>
    setConfig(prev => ({ ...prev, [key]: val }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveConfig(config)
      await reloadStore()
      toast('Paramètres enregistrés', 'success')
    } catch (err: any) { toast(err.message || 'Erreur', 'error') }
    finally { setSaving(false) }
  }

  const handleImageUpload = async (field: 'logo_url' | 'signature_url' | 'cachet_url', file: File) => {
    try {
      const maxSize = 2 * 1024 * 1024
      if (file.size > maxSize) {
        toast('Image trop volumineuse. Maximum 2 Mo.', 'error')
        return
      }
      const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
      if (!allowed.includes(file.type)) {
        toast('Format non supporté. Utilisez PNG, JPG, WebP ou GIF.', 'error')
        return
      }
      const url = await uploadFile(file, field)
      update(field, url)
      toast('Image téléchargée', 'success')
    } catch (err: any) { toast(err.message || "Erreur téléchargement. Vérifiez que le bucket 'logos' existe dans Supabase.", 'error') }
  }

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size={40} /></div>

  const grid = 'grid grid-cols-1 md:grid-cols-2 gap-4'

  return (
    <div className="space-y-8 max-w-4xl pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Configuration de l'entreprise</h1>
        <Button onClick={handleSave} loading={saving}><Save size={16} /> Enregistrer</Button>
      </div>

      <Card>
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Building2 size={16} /> Identité</h3>
        <div className="space-y-4">
          <Input label="Nom de l'entreprise" value={config.company_name} onChange={e => update('company_name', e.target.value)} />
          <Input label="Slogan" value={config.slogan} onChange={e => update('slogan', e.target.value)} />
          <div>
            <label className="label">Description</label>
            <textarea className="input min-h-[60px] resize-none" value={config.description} onChange={e => update('description', e.target.value)} />
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4 flex items-center gap-2"><MapPin size={16} /> Coordonnées</h3>
        <div className="space-y-4">
          <Input label="Adresse" value={config.address} onChange={e => update('address', e.target.value)} />
          <div className={grid}>
            <Input label="Ville" value={config.city} onChange={e => update('city', e.target.value)} />
            <Input label="Pays" value={config.country} onChange={e => update('country', e.target.value)} />
          </div>
          <div className={grid}>
            <Input label="Téléphone 1" value={config.phone} onChange={e => update('phone', e.target.value)} />
            <Input label="Téléphone 2" value={config.phone2} onChange={e => update('phone2', e.target.value)} />
          </div>
          <div className={grid}>
            <Input label="Email" type="email" value={config.email} onChange={e => update('email', e.target.value)} />
            <Input label="Site web" value={config.website} onChange={e => update('website', e.target.value)} />
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4 flex items-center gap-2"><FileText size={16} /> Registres</h3>
        <div className={grid}>
          <Input label="RCCM" value={config.rccm} onChange={e => update('rccm', e.target.value)} />
          <Input label="NIF" value={config.nif} onChange={e => update('nif', e.target.value)} />
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Image size={16} /> Images</h3>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            {config.logo_url ? <img src={config.logo_url} alt="Logo" className="w-28 h-28 object-contain rounded-xl border border-gray-200 dark:border-gray-700 bg-white" /> : <div className="w-28 h-28 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400"><Building2 size={32} /></div>}
            <div>
              <input ref={fileRef} type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload('logo_url', f) }} className="hidden" />
              <Button variant="secondary" onClick={() => fileRef.current?.click()}><Upload size={16} /> Logo officiel</Button>
              <p className="text-xs text-gray-500 mt-2">PNG ou JPG, max 2 Mo. Utilisé dans toute l'application.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            {config.signature_url ? <img src={config.signature_url} alt="Signature" className="h-16 object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-white" /> : <div className="w-32 h-16 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400"><Pen size={24} /></div>}
            <div>
              <input ref={signatureRef} type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload('signature_url', f) }} className="hidden" />
              <Button variant="secondary" onClick={() => signatureRef.current?.click()}><Pen size={16} /> Signature du responsable</Button>
              <p className="text-xs text-gray-500 mt-2">PNG fond transparent. Apparaît sur les documents PDF.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            {config.cachet_url ? <img src={config.cachet_url} alt="Cachet" className="h-20 object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-white" /> : <div className="w-32 h-20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400"><Stamp size={24} /></div>}
            <div>
              <input ref={cachetRef} type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload('cachet_url', f) }} className="hidden" />
              <Button variant="secondary" onClick={() => cachetRef.current?.click()}><Stamp size={16} /> Cachet de l'entreprise</Button>
              <p className="text-xs text-gray-500 mt-2">Cachet rond ou rectangulaire. Apparaît sur les documents PDF.</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Pen size={16} /> Signataire</h3>
        <div className={grid}>
          <Input label="Nom du signataire" value={config.signatory_name} onChange={e => update('signatory_name', e.target.value)} />
          <Input label="Fonction du signataire" value={config.signatory_title} onChange={e => update('signatory_title', e.target.value)} />
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4 flex items-center gap-2"><DollarSign size={16} /> Facturation</h3>
        <div className={grid}>
          <Input label="TVA par défaut (%)" type="number" step="0.1" value={String(config.default_tva)} onChange={e => update('default_tva', parseFloat(e.target.value) || 0)} />
          <Input label="Devise" value={config.currency} onChange={e => update('currency', e.target.value)} placeholder="GNF" />
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Palette size={16} /> Apparence</h3>
        <div className={grid}>
          <Input label="Couleur principale" type="color" value={config.primary_color} onChange={e => update('primary_color', e.target.value)} />
          <Input label="Couleur secondaire" type="color" value={config.secondary_color} onChange={e => update('secondary_color', e.target.value)} />
        </div>
        <div className="mt-4">
          <Input label="Format des dates" value={config.date_format} onChange={e => update('date_format', e.target.value)} placeholder="DD/MM/YYYY" />
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4 flex items-center gap-2"><FileText size={16} /> Documents</h3>
        <div className="space-y-4">
          <div>
            <label className="label">Pied de page</label>
            <textarea className="input min-h-[60px] resize-y" value={config.footer_text} onChange={e => update('footer_text', e.target.value)} placeholder="Texte affiché dans le pied de page des PDF..." />
          </div>
          <div>
            <label className="label">Conditions générales</label>
            <textarea className="input min-h-[200px] resize-y" value={config.conditions} onChange={e => update('conditions', e.target.value)} placeholder="Conditions générales de vente..." />
          </div>
        </div>
      </Card>
    </div>
  )
}