import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Smartphone, Phone, MapPin, Package, FileText, ArrowLeft, ClipboardList, Wrench, CreditCard, Download, DollarSign, Truck, CheckCircle, Archive, Box, Palette, PenTool } from 'lucide-react'
import { Modal } from '../../components/ui/Modal'
import { SignaturePad } from '../../components/ui/SignaturePad'

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

export function AppareilDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [app, setApp] = useState<any>(null)
  const [devisList, setDevisList] = useState<any[]>([])
  const [facturesList, setFacturesList] = useState<any[]>([])
  const [config, setConfig] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [usePiece, setUsePiece] = useState(false)
  const [articleId, setArticleId] = useState('')
  const [pieceQty, setPieceQty] = useState(1)
  const [articles, setArticles] = useState<any[]>([])
  const [actionMsg, setActionMsg] = useState('')
  const [showSignature, setShowSignature] = useState(false)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      const [appRes, devisRes, facturesRes, cfgRes] = await Promise.all([
        supabase.from('appareils').select('*, clients(nom, telephone, adresse)').eq('id', id).single(),
        supabase.from('devis').select('*').eq('appareil_id', id).eq('service', 'electronique').order('cree_le', { ascending: false }),
        supabase.from('factures').select('*, devis(numero)').eq('service', 'electronique').order('cree_le', { ascending: false }),
        supabase.from('parametres').select('cle, valeur').then(({ data }) => {
          const cfg: Record<string, string> = {}
          if (data) for (const r of data) cfg[r.cle] = r.valeur
          return cfg
        }),
      ])
      const a = appRes.data
      if (a) {
        const c = Array.isArray(a.clients) ? a.clients[0] : a.clients
        setApp({ ...a, id: String(a.id), client_nom: c?.nom || 'Anonyme', client_telephone: c?.telephone, client_adresse: c?.adresse, qr_code: a.uid_visible, type_appareil: a.type, date_reception: a.cree_le?.substring(0, 10), panne_declaree: a.description_defaut })
      }
      setDevisList(devisRes.data || [])
      setFacturesList(facturesRes.data || [])
      setConfig(cfgRes)
      setLoading(false)
    })()
  }, [id])

  if (loading) return <div className="flex justify-center py-12"><LoadingSpinner /></div>
  if (!app) return <div className="text-center py-12 text-gray-400">Appareil non trouvé</div>

  const cfg = STATUT_CONFIG[app.statut] || { label: app.statut, color: 'default' as const }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button onClick={() => navigate('/electronique/appareils')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        <ArrowLeft size={16} /> Retour à la liste
      </Button>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
              <Smartphone size={24} className="text-primary-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{app.client_nom || 'Anonyme'}</h2>
              <Badge variant={cfg.color as any}>{cfg.label}</Badge>
            </div>
          </div>
          {app.qr_code && (
            <div className="text-right">
              <p className="text-xs text-gray-400">QR Code</p>
              <p className="font-mono font-bold">{app.qr_code}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {app.client_telephone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone size={14} className="text-gray-400" />
              <span>{app.client_telephone}</span>
            </div>
          )}
          {app.client_adresse && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin size={14} className="text-gray-400" />
              <span className="truncate">{app.client_adresse}</span>
            </div>
          )}
          {app.type_appareil && (
            <div className="flex items-center gap-2 text-sm">
              <Smartphone size={14} className="text-gray-400" />
              <span>{app.type_appareil}</span>
            </div>
          )}
          {app.marque && (
            <div className="flex items-center gap-2 text-sm">
              <Package size={14} className="text-gray-400" />
              <span>{app.marque} {app.modele}</span>
            </div>
          )}
          {app.couleur && (
            <div className="flex items-center gap-2 text-sm">
              <Palette size={14} className="text-gray-400" />
              <span>{app.couleur}</span>
            </div>
          )}
          {app.numero_serie && (
            <div>
              <p className="text-xs text-gray-400">N° Série</p>
              <p className="text-sm font-mono">{app.numero_serie}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-400">Date réception</p>
            <p className="text-sm">{app.date_reception}</p>
          </div>
        </div>

        {app.accessoires && (
          <div>
            <p className="text-xs text-gray-400 font-medium mb-1">Accessoires déposés</p>
            <p className="text-sm">{app.accessoires}</p>
          </div>
        )}

        {app.panne_declaree && (
          <div>
            <p className="text-xs text-gray-400 font-medium mb-1">Panne déclarée</p>
            <p className="text-sm">{app.panne_declaree}</p>
          </div>
        )}

        {app.observations && (
          <div>
            <p className="text-xs text-gray-400 font-medium mb-1">Observations</p>
            <p className="text-sm">{app.observations}</p>
          </div>
        )}

        {app.photos && JSON.parse(app.photos).length > 0 && (
          <div>
            <p className="text-xs text-gray-400 font-medium mb-2">Photos ({JSON.parse(app.photos).length})</p>
            <div className="flex gap-2 overflow-x-auto">
              {JSON.parse(app.photos).map((url: string, i: number) => (
                <img key={i} src={url} alt="" className="w-20 h-20 object-cover rounded-lg" />
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
          <Button onClick={() => navigate(`/electronique/diagnostic/${app.id}`)}>
            <ClipboardList size={16} /> Diagnostic
          </Button>
          <Button onClick={() => navigate(`/electronique/reparation/${app.id}`)}>
            <Wrench size={16} /> Réparation
          </Button>
          {app.statut === 'test' && (
            <Button onClick={async () => {
              await supabase.from('appareils').update({ statut: 'pret', statut_detail: 'test_valide' }).eq('id', app.id)
              await supabase.from('reparations').update({ statut: 'termine' }).eq('appareil_id', app.id).is('statut', 'test')
              setApp((prev: any) => ({ ...prev, statut: 'pret', statut_detail: 'test_valide' })); setActionMsg('Test validé')
            }}>
              <CheckCircle size={16} /> Valider test
            </Button>
          )}
          {!['pret','livre','archive','non_reparable','restitue'].includes(app.statut) && (
            <Button onClick={() => { setUsePiece(true); supabase.from('articles_stock').select('id,nom,reference,quantite,prix_unitaire').then(({ data }) => setArticles(data || [])) }}>
              <Box size={16} /> Utiliser pièces
            </Button>
          )}
          {app.statut === 'pret' && (
            <Button onClick={() => setShowSignature(true)}>
              <PenTool size={16} /> Livrer avec signature
            </Button>
          )}
          {(app.statut === 'pret' || app.statut === 'livre') && (
            <Button onClick={async () => {
              const mod = await import('../../pdf/generateBonLivraison')
              const blob = await mod.generateBonLivraisonPdf({
                appareil: app,
                client: { nom: app.client_nom, telephone: app.client_telephone, adresse: app.client_adresse },
                accessoires_rendus: app.accessoires || '',
                date_livraison: new Date().toISOString(),
                numero: `BL-${app.uid_visible || app.id.slice(0, 8)}`,
                notes: '',
                signature: app.signature_client || undefined,
               }, (config || {}) as any)
              window.open(URL.createObjectURL(blob))
            }}>
              <Truck size={16} /> Bon de livraison
            </Button>
          )}
          {!['archive','non_reparable','restitue'].includes(app.statut) && (
            <Button variant="secondary" onClick={async () => {
              await supabase.from('appareils').update({ statut: 'archive' }).eq('id', app.id)
              setApp((prev: any) => ({ ...prev, statut: 'archive' })); setActionMsg('Appareil archivé')
            }}>
              <Archive size={16} /> Archiver
            </Button>
          )}
        </div>

        {actionMsg && <p className="text-sm text-green-500 text-center">{actionMsg}</p>}

        {usePiece && (
          <div className="border-t border-gray-100 dark:border-gray-700/50 pt-3 space-y-3">
            <p className="text-sm font-medium">Déduire du stock</p>
            <select className="input w-full" value={articleId} onChange={e => setArticleId(e.target.value)}>
              <option value="">Choisir un article...</option>
              {articles.map(a => (
                <option key={a.id} value={a.id}>{a.nom} ({a.reference || 'N/R'}) — Stock: {a.quantite}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <input className="input w-24" type="number" min={1} value={pieceQty} onChange={e => setPieceQty(parseInt(e.target.value) || 1)} />
              <Button onClick={async () => {
                if (!articleId) return
                await supabase.from('mouvements_stock').insert({
                  article_id: parseInt(articleId), type: 'sortie', quantite: pieceQty,
                  reference: `Appareil:${app.id}`, notes: `Utilisé pour ${app.marque} ${app.modele}`,
                  utilisateur_id: (await supabase.auth.getUser()).data.user?.id
                }).then(async () => {
                  const { data: art } = await supabase.from('articles_stock').select('quantite').eq('id', articleId).single()
                  if (art) await supabase.from('articles_stock').update({ quantite: art.quantite - pieceQty }).eq('id', articleId)
                })
                setUsePiece(false); setArticleId(''); setPieceQty(1); setActionMsg('Stock mis à jour')
              }}><Box size={14} /> Déduire</Button>
              <Button variant="ghost" onClick={() => setUsePiece(false)}>Annuler</Button>
            </div>
          </div>
        )}
      </div>

      <Modal open={showSignature} onClose={() => setShowSignature(false)} title="Signature du client">
        <p className="text-sm text-gray-500 mb-4">Le client doit signer ci-dessous pour confirmer la livraison.</p>
        <SignaturePad
          onConfirm={async (dataUrl) => {
            await supabase.from('appareils').update({
              statut: 'livre',
              signature_client: dataUrl,
              statut_detail: 'livre_avec_signature',
            }).eq('id', app.id)
            setApp((prev: any) => ({ ...prev, statut: 'livre', signature_client: dataUrl, statut_detail: 'livre_avec_signature' }))
            setShowSignature(false)
            setActionMsg('Livré avec signature')
          }}
          onCancel={() => setShowSignature(false)}
        />
      </Modal>

      {/* Billing section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2"><DollarSign size={16} className="text-green-500" /> Facturation</h3>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => navigate(`/electronique/devis/${app.id}`)}><FileText size={14} /> Nouveau devis</Button>
            <Button size="sm" onClick={() => navigate(`/electronique/factures/${app.id}`)}><FileText size={14} /> Nouvelle facture</Button>
            <Button size="sm" onClick={() => navigate(`/electronique/paiements/${app.id}`)}><CreditCard size={14} /> Paiement</Button>
          </div>
        </div>

        {devisList.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 font-medium mb-2">Devis ({devisList.length})</p>
            <div className="space-y-2">
              {devisList.map((d: any) => (
                <div key={d.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/30 rounded-xl text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-medium">{d.numero}</span>
                    <Badge variant={d.statut === 'envoye' ? 'blue' as const : d.statut === 'accepte' ? 'green' as const : d.statut === 'refuse' ? 'red' as const : 'default' as const}>{d.statut}</Badge>
                    <span className="text-gray-500">{d.total_ttc?.toLocaleString()} FG</span>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" onClick={() =>
                      navigate(`/electronique/devis/${app.id}?edit=${d.id}`)
                    }><FileText size={14} /></Button>
                    <Button size="sm" onClick={() => {
                      import('../../pdf/generateElectroniquePdf').then(async mod => {
                        const blob = await mod.generateDevisElectroniquePdf({ ...d, ...config }, (config || {}) as any)
                        window.open(URL.createObjectURL(blob))
                      })
                    }}><Download size={14} /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {facturesList.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 font-medium mb-2">Factures ({facturesList.length})</p>
            <div className="space-y-2">
              {facturesList.map((f: any) => (
                <div key={f.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/30 rounded-xl text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-medium">{f.numero}</span>
                    <Badge variant={f.statut === 'payee' ? 'green' as const : f.statut === 'annulee' ? 'red' as const : 'default' as const}>{f.statut}</Badge>
                    <span className="text-gray-500">{f.total_ttc?.toLocaleString()} FG</span>
                  </div>
                  <Button size="sm" onClick={async () => {
                    const blob = await (await import('../../pdf/generateElectroniquePdf')).generateFactureElectroniquePdf({ ...f, ...config }, config)
                    window.open(URL.createObjectURL(blob))
                  }}><Download size={14} /></Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {devisList.length === 0 && facturesList.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">Aucun document de facturation</p>
        )}
      </div>
    </div>
  )
}
