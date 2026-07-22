import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { QrCode, Search, Download, Printer } from 'lucide-react'

export function QrCodesPage() {
  const navigate = useNavigate()
  const [appareils, setAppareils] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [qrData, setQrData] = useState<Record<string, string>>({})

  const fetchAppareils = async () => {
    setLoading(true)
    try {
      let query = supabase.from('appareils').select('id, uid_visible, marque, modele, cree_le')
      if (search) {
        query = query.or(`uid_visible.ilike.%${search}%,marque.ilike.%${search}%,modele.ilike.%${search}%`)
      }
      const { data, error } = await query.order('cree_le', { ascending: false })
      if (error) throw error
      setAppareils(data || [])
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  useEffect(() => { fetchAppareils() }, [])

  const handleGenerate = async (id: string) => {
    if (qrData[id]) { setQrData(prev => { const n = { ...prev }; delete n[id]; return n }); return }
    const app = appareils.find(a => a.id === id)
    if (!app) return
    const qr_data_url = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(app.uid_visible)}`
    setQrData(prev => ({ ...prev, [id]: qr_data_url }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">QR Codes</h1>
          <p className="text-gray-500 mt-1">Générez et imprimez les QR Codes des appareils</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/electronique/etiquettes')}><Download size={16} /> Étiquettes</Button>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <Input placeholder="Rechercher un appareil..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button variant="secondary" onClick={fetchAppareils}><Search size={16} /></Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : appareils.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <QrCode size={48} className="mx-auto mb-3 opacity-50" />
            <p>Aucun appareil trouvé</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {appareils.map(app => (
              <div key={app.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-mono font-medium">{app.uid_visible}</p>
                    <p className="text-sm text-gray-500">{app.marque} {app.modele}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleGenerate(app.id)}>
                      <QrCode size={16} /> {qrData[app.id] ? 'Masquer' : 'QR Code'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => window.open(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(app.uid_visible)}`, '_blank')}>
                      <Printer size={16} />
                    </Button>
                  </div>
                </div>
                {qrData[app.id] && (
                  <div className="flex justify-center py-2">
                    <img src={qrData[app.id]} alt={`QR ${app.uid_interne}`} className="w-32 h-32" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
