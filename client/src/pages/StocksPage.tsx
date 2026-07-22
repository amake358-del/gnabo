import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Modal } from '../components/ui/Modal'
import { Badge } from '../components/ui/Badge'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { supabase } from '../services/supabase'
import { formatCurrency } from '../utils/format'
import { Search, AlertTriangle, ArrowUpDown, History } from 'lucide-react'

const SERVICES = [
  { value: '', label: 'Tous les services' },
  { value: 'aluminium', label: 'Aluminium & Inox' },
  { value: 'metallique', label: 'Métallique' },
  { value: 'electronique', label: 'Électronique' },
]

export function StocksPage() {
  const navigate = useNavigate()
  const [articles, setArticles] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [serviceFilter, setServiceFilter] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [alertOnly, setAlertOnly] = useState(false)
  const [moveModal, setMoveModal] = useState<{ open: boolean; article: any | null }>({ open: false, article: null })
  const [moveType, setMoveType] = useState<'entree' | 'sortie'>('entree')
  const [moveQty, setMoveQty] = useState(1)
  const [moveRef, setMoveRef] = useState('')
  const [moveNotes, setMoveNotes] = useState('')
  const [moveSaving, setMoveSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    ;(async () => {
      const [catRes, artRes] = await Promise.all([
        supabase.from('categories_stock').select('*').order('nom'),
        (() => {
          let q = supabase.from('articles_stock').select('*, categories_stock(nom, service)')
          if (search) q = q.or(`nom.ilike.%${search}%,reference.ilike.%${search}%`)
          if (catFilter) q = q.eq('categorie_id', catFilter)
          return q.order('nom')
        })(),
      ])
      setCategories(catRes.data || [])
      let arts = (artRes.data || []).map((a: any) => {
        const cat = Array.isArray(a.categories_stock) ? a.categories_stock[0] : a.categories_stock
        return { ...a, categorie_nom: cat?.nom, service: cat?.service }
      })
      if (alertOnly) arts = arts.filter((a: any) => a.quantite <= a.seuil_alerte)
      setArticles(arts)
    })().finally(() => setLoading(false))
  }, [search, catFilter, alertOnly])

  useEffect(() => { load() }, [load])

  const filteredByService = serviceFilter
    ? articles.filter(a => {
        const cat = categories.find(c => Number(c.id) === Number(a.categorie_id))
        return cat?.service === serviceFilter
      })
    : articles

  const handleMove = async () => {
    if (!moveModal.article || moveQty <= 0) return
    setMoveSaving(true)
    try {
      await supabase.from('mouvements_stock').insert({
        article_id: moveModal.article.id,
        type: moveType,
        quantite: moveQty,
        reference: moveRef || null,
        notes: moveNotes || null,
      })
      const { data: art } = await supabase.from('articles_stock').select('quantite').eq('id', moveModal.article.id).single()
      const newQty = moveType === 'entree' ? (art?.quantite || 0) + moveQty : (art?.quantite || 0) - moveQty
      await supabase.from('articles_stock').update({ quantite: newQty }).eq('id', moveModal.article.id)
      console.log('Mouvement enregistré')
      setMoveModal({ open: false, article: null })
      setMoveQty(1); setMoveRef(''); setMoveNotes('')
      load()
    } catch (err: any) { console.error(err.message || err) }
    finally { setMoveSaving(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Gestion de stock</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setAlertOnly(!alertOnly)} className={alertOnly ? 'ring-2 ring-amber-400' : ''}>
            <AlertTriangle size={16} /> Alertes
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input aria-label="Rechercher article" className="input pl-10" placeholder="Rechercher article ou référence..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select aria-label="Filtrer par service" options={SERVICES} value={serviceFilter} onChange={e => setServiceFilter(e.target.value)} className="w-full lg:w-48" />
          <Select aria-label="Filtrer par catégorie" options={[
            { value: '', label: 'Toutes catégories' },
            ...categories
              .filter(c => !serviceFilter || c.service === serviceFilter)
              .map(c => ({ value: String(c.id), label: c.nom })),
          ]} value={catFilter} onChange={e => setCatFilter(e.target.value)} className="w-full lg:w-48" />
        </div>

        {loading ? <div className="flex justify-center py-12"><LoadingSpinner /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-3 py-2 text-left">Article</th>
                  <th className="px-3 py-2 text-left">Catégorie</th>
                  <th className="px-3 py-2 text-left">Service</th>
                  <th className="px-3 py-2 text-right">Qté</th>
                  <th className="px-3 py-2 text-right">Seuil</th>
                  <th className="px-3 py-2 text-right">Prix unit.</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredByService.map(a => {
                  const cat = categories.find(c => Number(c.id) === Number(a.categorie_id))
                  const isLow = a.quantite <= a.seuil_alerte
                  return (
                    <tr key={a.id} className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${isLow ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}>
                      <td className="px-3 py-2.5">
                        <div className="font-medium">{a.nom}</div>
                        {a.reference && <div className="text-xs text-gray-400">{a.reference}</div>}
                      </td>
                      <td className="px-3 py-2.5 text-gray-500">{cat?.nom || '-'}</td>
                      <td className="px-3 py-2.5">
                        <ServiceBadge service={cat?.service || ''} />
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className={`font-bold ${isLow ? 'text-red-500' : 'text-green-600'}`}>{a.quantite}</span>
                      </td>
                      <td className="px-3 py-2.5 text-right text-gray-400">{a.seuil_alerte}</td>
                      <td className="px-3 py-2.5 text-right">{formatCurrency(a.prix_unitaire || 0)}</td>
                      <td className="px-3 py-2.5 text-right">
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="sm" onClick={() => setMoveModal({ open: true, article: a })}><ArrowUpDown size={14} /></Button>
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/stocks/${a.id}`)}><History size={14} /></Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filteredByService.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-400">Aucun article trouvé</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Movement modal */}
      <Modal open={moveModal.open} onClose={() => setMoveModal({ open: false, article: null })} title={`Mouvement: ${moveModal.article?.nom || ''}`} size="sm">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button variant={moveType === 'entree' ? 'primary' : 'secondary'} size="sm" onClick={() => setMoveType('entree')}>
              Entrée
            </Button>
            <Button variant={moveType === 'sortie' ? 'primary' : 'secondary'} size="sm" onClick={() => setMoveType('sortie')}>
              Sortie
            </Button>
          </div>
          <Input label="Quantité" type="number" min="1" value={String(moveQty)} onChange={e => setMoveQty(parseInt(e.target.value) || 1)} />
          <Input label="Référence (bon)" value={moveRef} onChange={e => setMoveRef(e.target.value)} placeholder="N° bon de livraison" />
          <Input label="Notes" value={moveNotes} onChange={e => setMoveNotes(e.target.value)} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setMoveModal({ open: false, article: null })}>Annuler</Button>
            <Button onClick={handleMove} loading={moveSaving}>Valider</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function ServiceBadge({ service }: { service: string }) {
  const cfg: Record<string, { label: string; color: string }> = {
    aluminium: { label: 'Aluminium', color: 'blue' },
    metallique: { label: 'Métallique', color: 'default' },
    electronique: { label: 'Électronique', color: 'yellow' },
    tous: { label: 'Tous', color: 'default' },
  }
  const c = cfg[service] || { label: service, color: 'default' as const }
  return <Badge variant={c.color as any}>{c.label}</Badge>
}
