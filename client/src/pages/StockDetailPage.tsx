import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { supabase } from '../services/supabase'
import { formatCurrency, formatDate } from '../utils/format'
import { ArrowLeft, Package } from 'lucide-react'

export function StockDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState<any>(null)
  const [mouvements, setMouvements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      const [artRes, mouvRes] = await Promise.all([
        supabase.from('articles_stock').select('*, categories_stock(nom, service)').eq('id', id).single(),
        supabase.from('mouvements_stock').select('*').eq('article_id', id).order('cree_le', { ascending: false }),
      ])
      if (artRes.data) {
        const cat = Array.isArray(artRes.data.categories_stock) ? artRes.data.categories_stock[0] : artRes.data.categories_stock
        setArticle({ ...artRes.data, categorie_nom: cat?.nom })
      }
      setMouvements(mouvRes.data || [])
      setLoading(false)
    })().catch(() => { navigate('/stocks'); setLoading(false) })
  }, [id])

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size={40} /></div>
  if (!article) return null

  const isLow = article.quantite <= article.seuil_alerte

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate('/stocks')}><ArrowLeft size={16} /> Retour au stock</Button>

      <Card>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
            <Package size={28} className="text-primary-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold">{article.nom}</h1>
            {article.reference && <p className="text-sm text-gray-400">Réf: {article.reference}</p>}
            {article.categorie_nom && <p className="text-sm text-gray-500 mt-1">{article.categorie_nom}</p>}
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${isLow ? 'text-red-500' : 'text-green-600'}`}>{article.quantite}</div>
            <p className="text-xs text-gray-400">en stock</p>
            {isLow && <Badge variant="red">Stock bas</Badge>}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><div className="text-center"><p className="text-xs text-gray-400">Seuil alerte</p><p className="text-lg font-bold">{article.seuil_alerte}</p></div></Card>
        <Card><div className="text-center"><p className="text-xs text-gray-400">Prix unitaire</p><p className="text-lg font-bold">{formatCurrency(article.prix_unitaire || 0)}</p></div></Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Historique des mouvements</h3>
        {mouvements.length === 0 ? (
          <p className="text-gray-400 text-center py-4">Aucun mouvement</p>
        ) : (
          <div className="space-y-2">
            {mouvements.map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <Badge variant={m.type === 'entree' ? 'green' : 'red'}>
                    {m.type === 'entree' ? '+' : '-'}{m.quantite}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">{m.type === 'entree' ? 'Entrée' : 'Sortie'}</p>
                    {m.notes && <p className="text-xs text-gray-400">{m.notes}</p>}
                    {m.reference && <p className="text-xs text-gray-400">Réf: {m.reference}</p>}
                  </div>
                </div>
                <span className="text-xs text-gray-400">{formatDate(m.cree_le)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
