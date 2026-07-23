import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Search, Plus, Smartphone, ChevronRight } from 'lucide-react'

const STATUT_CONFIG: Record<string, { label: string; color: string }> = {
  disponible: { label: 'Disponible', color: 'success' },
  attribue: { label: 'Attribué', color: 'info' },
  recu: { label: 'Réceptionné', color: 'info' },
  diagnostic: { label: 'Diagnostic', color: 'warning' },
  validation_client: { label: 'Attente validation', color: 'warning' },
  reparation_autorisee: { label: 'Réparation autorisée', color: 'success' },
  attente_pieces: { label: 'Attente pièces', color: 'warning' },
  en_reparation: { label: 'En réparation', color: 'warning' },
  test: { label: 'Test', color: 'info' },
  pret: { label: 'Prêt à livrer', color: 'success' },
  livre: { label: 'Livré', color: 'success' },
  non_reparable: { label: 'Non réparable', color: 'danger' },
  restitue: { label: 'Restitué sans réparation', color: 'default' as const },
  archive: { label: 'Archivé', color: 'default' as const },
}

export function AppareilListPage() {
  const navigate = useNavigate()
  const [appareils, setAppareils] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statutFilter] = useState('')

  const fetchList = async () => {
    setLoading(true)
    try {
      let q = supabase.from('appareils').select('*, clients(nom, telephone, adresse)')
      if (statutFilter) q = q.eq('statut', statutFilter)
      if (search) q = q.or(`uid_visible.ilike.%${search}%,marque.ilike.%${search}%,modele.ilike.%${search}%`)
      q.order('cree_le', { ascending: false })
      const { data } = await q
      setAppareils((data || []).map((a: any) => {
        const c = Array.isArray(a.clients) ? a.clients[0] : a.clients
        return {
          ...a, id: String(a.id),
          client_nom: c?.nom || 'Anonyme',
          client_telephone: c?.telephone,
          client_adresse: c?.adresse,
          qr_code: a.uid_visible,
          type_appareil: a.type,
          date_reception: a.cree_le?.substring(0, 10),
          panne_declaree: a.description_defaut,
        }
      }))
    } catch (err) { console.error('Erreur chargement appareils:', err) } finally { setLoading(false) }
  }

  useEffect(() => { fetchList() }, [statutFilter])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Appareils</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Recherchez et gérez les appareils</p>
        </div>
        <Button onClick={() => navigate('/electronique/reception')}>
          <Plus size={16} /> Nouveau
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <input className="input" placeholder="QR Code, client, téléphone, marque, appareil..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchList()} />
        </div>
        <Button variant="secondary" onClick={fetchList}><Search size={16} /></Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : appareils.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Smartphone size={48} className="mx-auto mb-3 opacity-50" />
            <p>Aucun appareil trouvé</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {appareils.map(app => {
              const cfg = STATUT_CONFIG[app.statut] || { label: app.statut, color: 'default' as const }
              return (
                <button key={app.id} onClick={() => navigate(`/electronique/appareils/${app.id}`)}
                  className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors text-left"
                  type="button"
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                    <Smartphone size={20} className="text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{app.client_nom || 'Anonyme'}</span>
                      {app.qr_code && <span className="text-xs font-mono text-gray-400 shrink-0">{app.qr_code}</span>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                      {app.client_telephone && <span>{app.client_telephone}</span>}
                      {app.marque && app.modele && <span>{app.marque} {app.modele}</span>}
                      {!app.marque && app.type_appareil && <span>{app.type_appareil}</span>}
                      <span>{app.date_reception}</span>
                    </div>
                  </div>
                  <Badge variant={cfg.color as any}>{cfg.label}</Badge>
                  <ChevronRight size={16} className="text-gray-300 shrink-0" />
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
