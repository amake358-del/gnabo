import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { supabase } from '../../services/supabase'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Camera, QrCode, Scan, AlertTriangle, FileText, X } from 'lucide-react'

export function ReceptionPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'scan' | 'form' | 'found'>('scan')
  const [scanCode, setScanCode] = useState('')
  const [scanError, setScanError] = useState('')
  const [scanLoading, setScanLoading] = useState(false)
  const [appareilId, setAppareilId] = useState<string | null>(null)
  const [existingAppareil, setExistingAppareil] = useState<any>(null)
  const [showScanner, setShowScanner] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannerId = 'qr-scanner'

  useEffect(() => {
    if (!showScanner) return
    const scanner = new Html5Qrcode(scannerId)
    scannerRef.current = scanner
    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        setScanCode(decodedText.toUpperCase())
        setShowScanner(false)
        setTimeout(() => handleScanCode(decodedText.toUpperCase()), 100)
      },
      () => {}
    ).catch(err => setCameraError('Erreur accès caméra: ' + (err.message || err)))
    return () => { scanner.stop().catch(() => {}); scannerRef.current = null }
  }, [showScanner])

  const [form, setForm] = useState({
    qr_code: '', client_nom: '', client_telephone: '', client_adresse: '',
    type_appareil: '', marque: '', modele: '', numero_serie: '', etat_esthetique: '',
    accessoires: '', panne_declaree: '', observations: '', couleur: ''
  })

  const handleScanCode = async (code: string) => {
    if (!code.trim()) return
    setScanLoading(true); setScanError('')
    try {
      const { data: existing } = await supabase.from('appareils').select('id, statut, marque, modele').eq('uid_visible', code.trim().toUpperCase()).maybeSingle()
      if (existing) {
        if (existing.statut === 'disponible' || existing.statut === 'attribue') {
          setAppareilId(existing.id)
          setExistingAppareil(existing)
          setForm(prev => ({
            ...prev, qr_code: code.trim().toUpperCase(),
            marque: existing.marque !== 'Pré-imprimée' ? existing.marque : '',
            modele: existing.modele !== 'Étiquette' ? existing.modele : '',
          }))
          setStep('form')
          return
        }
        setAppareilId(existing.id)
        setStep('found')
        return
      }
      setForm(prev => ({ ...prev, qr_code: code.trim().toUpperCase() }))
      setStep('form')
    } catch (err: any) {
      setScanError(err.message || 'Erreur de vérification')
    } finally { setScanLoading(false) }
  }

  const handleScan = () => {
    if (scanCode.trim()) handleScanCode(scanCode)
  }

  const handleFieldChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!form.client_nom) return
    try {
      let clientId: number | null = null
      const { data: existingClient } = await supabase.from('clients').select('id').eq('nom', form.client_nom).maybeSingle()
      if (existingClient) {
        clientId = existingClient.id
      } else {
        const { data: newClient, error: clientErr } = await supabase.from('clients').insert({
          nom: form.client_nom, telephone: form.client_telephone || null, adresse: form.client_adresse || null,
        }).select('id').single()
        if (clientErr) throw clientErr
        clientId = newClient.id
      }

      const payload = {
        client_id: clientId,
        type: form.type_appareil,
        marque: form.marque,
        modele: form.modele,
        numero_serie: form.numero_serie,
        etat_esthetique: form.etat_esthetique,
        accessoires: form.accessoires,
        couleur: form.couleur || null,
        description_defaut: form.panne_declaree || form.observations,
        date_reception: new Date().toISOString(),
        statut: 'recu',
      }

      if (existingAppareil && appareilId) {
        const { error } = await supabase.from('appareils').update(payload).eq('id', appareilId)
        if (error) throw error
        navigate(`/electronique/appareils/${appareilId}`)
      } else {
        const { data: newApp, error } = await supabase.from('appareils').insert({
          ...payload,
          uid_interne: 'INT-' + Date.now(),
          uid_visible: form.qr_code,
        }).select('id').single()
        if (error) throw error
        navigate(`/electronique/appareils/${newApp.id}`)
      }
    } catch (err: any) {
      setScanError(err.message || 'Erreur de création')
    }
  }

  if (step === 'found' && appareilId) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center">
          <QrCode size={48} className="mx-auto mb-3 text-primary-500" />
          <h2 className="text-xl font-bold">QR Code déjà attribué</h2>
          <p className="text-gray-500 mt-1">Cet appareil est déjà enregistré</p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => navigate(`/electronique/appareils/${appareilId}`)}>
            <FileText size={16} /> Voir la fiche
          </Button>
          <Button variant="secondary" onClick={() => { setStep('scan'); setScanCode(''); setAppareilId(null) }}>
            <Scan size={16} /> Scanner un autre
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Réception d'appareil</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Enregistrez un nouvel appareil</p>
      </div>

      {step === 'scan' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 space-y-4">
          <div className="text-center mb-2">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-3">
              <Scan size={28} className="text-primary-500" />
            </div>
            <h2 className="font-semibold">Scanner un QR Code</h2>
            <p className="text-sm text-gray-500 mt-1">Saisissez le code ou scannez l'étiquette</p>
          </div>
          <div className="flex gap-2">
            <input className="input flex-1 text-lg font-mono" placeholder="EL-000001" value={scanCode} onChange={e => setScanCode(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && handleScan()} autoFocus />
            <Button onClick={() => setShowScanner(true)} disabled={scanLoading}>
              <Camera size={16} />
            </Button>
          </div>
          {scanError && <p className="text-sm text-red-500 flex items-center gap-1"><AlertTriangle size={14} /> {scanError}</p>}

          {showScanner && (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden max-w-md w-full">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700/50">
                  <h3 className="font-semibold">Scannez le QR Code</h3>
                  <Button variant="ghost" onClick={() => setShowScanner(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <X size={20} />
                  </Button>
                </div>
                <div id={scannerId} className="w-full aspect-square" />
                {cameraError && <p className="text-sm text-red-500 p-4 text-center">{cameraError}</p>}
              </div>
            </div>
          )}
        </div>
      )}

      {step === 'form' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-700/50">
            <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
              <QrCode size={20} className="text-primary-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">QR Code</p>
              <p className="font-mono font-bold text-lg">{form.qr_code}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nom du client *" value={form.client_nom} onChange={e => handleFieldChange('client_nom', e.target.value)} placeholder="Nom complet" />
            <Input label="Téléphone" value={form.client_telephone} onChange={e => handleFieldChange('client_telephone', e.target.value)} placeholder="+224 XXX XXX XXX" />
          </div>
          <Input label="Adresse" value={form.client_adresse} onChange={e => handleFieldChange('client_adresse', e.target.value)} placeholder="Adresse complète" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Type d'appareil" value={form.type_appareil} onChange={e => handleFieldChange('type_appareil', e.target.value)} placeholder="Smartphone, PC, tablette..." />
            <Select label="État esthétique" value={form.etat_esthetique || ''} onChange={e => handleFieldChange('etat_esthetique', e.target.value)} options={[
              { value: 'Neuf', label: 'Neuf' }, { value: 'Bon', label: 'Bon' },
              { value: 'Moyen', label: 'Moyen' }, { value: 'Mauvais', label: 'Mauvais' },
            ]} placeholder="Sélectionner..." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Marque" value={form.marque} onChange={e => handleFieldChange('marque', e.target.value)} placeholder="Samsung, Sony..." />
            <Input label="Modèle" value={form.modele} onChange={e => handleFieldChange('modele', e.target.value)} placeholder="Modèle exact" />
          </div>
          <Input label="Couleur" value={form.couleur} onChange={e => handleFieldChange('couleur', e.target.value)} placeholder="Noir, Blanc, Bleu..." />

          <Input label="Numéro de série" value={form.numero_serie} onChange={e => handleFieldChange('numero_serie', e.target.value)} placeholder="SN-..." />

          <div>
            <label className="label">Accessoires déposés</label>
            <textarea className="input min-h-[60px]" value={form.accessoires} onChange={e => handleFieldChange('accessoires', e.target.value)} placeholder="Chargeur, télécommande, câble..." />
          </div>

          <div>
            <label className="label">Panne déclarée</label>
            <textarea className="input min-h-[80px]" value={form.panne_declaree} onChange={e => handleFieldChange('panne_declaree', e.target.value)} placeholder="Description du problème par le client..." />
          </div>

          <div>
            <label className="label">Observations</label>
            <textarea className="input min-h-[60px]" value={form.observations} onChange={e => handleFieldChange('observations', e.target.value)} placeholder="Notes supplémentaires..." />
          </div>

          {scanError && <p className="text-sm text-red-500 flex items-center gap-1"><AlertTriangle size={14} /> {scanError}</p>}

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSubmit} disabled={!form.client_nom}>
              Enregistrer l'appareil
            </Button>
            <Button variant="ghost" onClick={() => { setStep('scan'); setScanCode(''); setScanError('') }}>
              Annuler
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
