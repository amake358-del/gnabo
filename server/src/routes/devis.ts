import { Router, Request, Response } from 'express'
import { getDb } from '../db'
import { requireAuth } from '../middleware/auth'

const DB_KEY_MAP: Record<string, string> = {
  company_name: 'entreprise_nom',
  slogan: 'entreprise_slogan',
  description: 'entreprise_description',
  rccm: 'entreprise_registre',
  nif: 'entreprise_nif',
  address: 'entreprise_adresse',
  city: 'entreprise_ville',
  country: 'entreprise_pays',
  phone: 'entreprise_telephone',
  phone2: 'entreprise_telephone2',
  email: 'entreprise_email',
  website: 'entreprise_site_web',
  signatory_name: 'signataire_nom',
  signatory_title: 'signataire_fonction',
  default_tva: 'tva_default',
  currency: 'devise',
  date_format: 'format_date',
  primary_color: 'couleur_principale',
  secondary_color: 'couleur_secondaire',
  conditions: 'conditions',
  footer_text: 'pied_de_page',
  logo_url: 'logo',
  favicon_url: 'favicon',
  signature_url: 'signature',
  cachet_url: 'cachet',
}

const CLIENT_KEY_MAP: Record<string, string> = {}
for (const [client, db] of Object.entries(DB_KEY_MAP)) {
  CLIENT_KEY_MAP[db] = client
}

function mapSettingsToCompanyConfig(rows: { cle: string; valeur: string }[]): Record<string, any> {
  const config: Record<string, any> = {}
  for (const r of rows) {
    const key = CLIENT_KEY_MAP[r.cle] || r.cle
    config[key] = r.valeur
  }
  config.default_tva = parseFloat(config.default_tva) || 0
  return config
}

const router = Router()
router.use(requireAuth)

function generateNumero(db: any): string {
  const year = new Date().getFullYear()
  const last = db.prepare(`SELECT numero FROM devis WHERE numero LIKE ? ORDER BY numero DESC LIMIT 1`).get(`DEV-${year}-%`) as any
  let next = 1
  if (last) {
    const parts = last.numero.split('-')
    next = parseInt(parts[2]) + 1
  }
  return `DEV-${year}-${String(next).padStart(6, '0')}`
}

router.get('/', (req: Request, res: Response) => {
  const db = getDb()
  const search = req.query.search as string || ''
  const clientId = req.query.client_id as string || ''
  const statut = req.query.statut as string || ''
  let query = `SELECT d.*, c.nom || ' ' || COALESCE(c.prenom, '') as client_nom FROM devis d JOIN clients c ON d.client_id = c.id`
  const params: any[] = []
  const conditions: string[] = []
  if (search) {
    conditions.push('(d.numero LIKE ? OR c.nom LIKE ? OR c.prenom LIKE ? OR c.telephone LIKE ?)')
    const s = `%${search}%`
    params.push(s, s, s, s)
  }
  if (clientId) { conditions.push('d.client_id = ?'); params.push(clientId) }
  if (statut) { conditions.push('d.statut = ?'); params.push(statut) }
  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ')
  query += ' ORDER BY d.cree_le DESC'
  const rows = db.prepare(query).all(...params) as any[]
  res.json({ data: rows.map(r => ({ ...r, total_ht: r.montant_ht, total_ttc: r.montant_ttc })) })
})

router.get('/:id', (req: Request, res: Response) => {
  const db = getDb()
  const devis = db.prepare(`SELECT d.*, c.nom || ' ' || COALESCE(c.prenom, '') as client_nom, c.email as client_email, c.telephone as client_telephone, c.adresse as client_adresse FROM devis d JOIN clients c ON d.client_id = c.id WHERE d.id = ?`).get(req.params.id) as any
  if (!devis) return res.status(404).json({ error: 'Devis non trouvé' })
  const lignes = db.prepare('SELECT * FROM devis_lignes WHERE devis_id = ?').all(req.params.id)
  res.json({ data: { ...devis, lignes, total_ht: devis.montant_ht, total_ttc: devis.montant_ttc } })
})

router.post('/', (req: Request, res: Response) => {
  const db = getDb()
  const { client_id, service, appareil_id, notes, montant_ht, tva, montant_ttc, acompte, valable_jusque, lignes } = req.body
  if (!client_id) return res.status(400).json({ error: 'Le client est requis' })
  const validServices = ['aluminium', 'metallique', 'electronique']
  const numero = generateNumero(db)
  const result = db.prepare(`INSERT INTO devis (numero, client_id, service, appareil_id, statut, notes, montant_ht, tva, montant_ttc, acompte, valable_jusque)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(
    numero, client_id, validServices.includes(service) ? service : 'aluminium', appareil_id || null,
    'brouillon', notes || '', parseFloat(montant_ht) || 0, parseFloat(tva) || 0,
    parseFloat(montant_ttc) || 0, parseFloat(acompte) || 0, valable_jusque || null
  )
  const devisId = result.lastInsertRowid
  if (lignes && Array.isArray(lignes)) {
    const insertLigne = db.prepare('INSERT INTO devis_lignes (devis_id, description, quantite, prix_unitaire_ht, tva, total_ht, largeur, hauteur, surface) VALUES (?,?,?,?,?,?,?,?,?)')
    for (const ligne of lignes) {
      const surface = (parseFloat(ligne.largeur) || 0) * (parseFloat(ligne.hauteur) || 0) / 10000
      const qte = parseInt(ligne.quantite) || 1
      const pu = parseFloat(ligne.prix_unitaire_ht) || 0
      const totalHt = Math.round(surface * qte * pu * 100) / 100
      insertLigne.run(devisId, ligne.description || '', qte, pu, parseFloat(ligne.tva) || 0, totalHt, parseFloat(ligne.largeur) || 0, parseFloat(ligne.hauteur) || 0, Math.round(surface * 1000000) / 1000000)
    }
  }
  const devis = db.prepare('SELECT * FROM devis WHERE id = ?').get(devisId)
  res.json({ data: devis, message: 'Devis créé' })
})

router.put('/:id', (req: Request, res: Response) => {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM devis WHERE id = ?').get(req.params.id) as any
  if (!existing) return res.status(404).json({ error: 'Devis non trouvé' })
  const { client_id, service, appareil_id, notes, montant_ht, tva, montant_ttc, acompte, valable_jusque, statut, lignes } = req.body
  const validStatus = ['brouillon', 'envoye', 'accepte', 'refuse', 'expire']
  const newStatut = statut && validStatus.includes(statut) ? statut : existing.statut
  db.prepare(`UPDATE devis SET client_id=?, service=?, appareil_id=?, notes=?, statut=?, montant_ht=?, tva=?, montant_ttc=?, acompte=?, valable_jusque=?, modifie_le=datetime('now') WHERE id=?`).run(
    client_id ?? existing.client_id, service ?? existing.service, appareil_id ?? existing.appareil_id,
    notes ?? existing.notes, newStatut, montant_ht ?? existing.montant_ht, tva ?? existing.tva,
    montant_ttc ?? existing.montant_ttc, acompte ?? existing.acompte, valable_jusque ?? existing.valable_jusque,
    req.params.id
  )
  if (lignes && Array.isArray(lignes)) {
    db.prepare('DELETE FROM devis_lignes WHERE devis_id = ?').run(req.params.id)
    const insertLigne = db.prepare('INSERT INTO devis_lignes (devis_id, description, quantite, prix_unitaire_ht, tva, total_ht, largeur, hauteur, surface) VALUES (?,?,?,?,?,?,?,?,?)')
    for (const ligne of lignes) {
      const surface = (parseFloat(ligne.largeur) || 0) * (parseFloat(ligne.hauteur) || 0) / 10000
      const qte = parseInt(ligne.quantite) || 1
      const pu = parseFloat(ligne.prix_unitaire_ht) || 0
      const totalHt = Math.round(surface * qte * pu * 100) / 100
      insertLigne.run(Number(req.params.id), ligne.description || '', qte, pu, parseFloat(ligne.tva) || 0, totalHt, parseFloat(ligne.largeur) || 0, parseFloat(ligne.hauteur) || 0, Math.round(surface * 1000000) / 1000000)
    }
  }
  const devis = db.prepare('SELECT * FROM devis WHERE id = ?').get(req.params.id)
  res.json({ data: devis, message: 'Devis modifié' })
})

router.delete('/:id', (req: Request, res: Response) => {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM devis WHERE id = ?').get(req.params.id) as any
  if (!existing) return res.status(404).json({ error: 'Devis non trouvé' })
  db.prepare('DELETE FROM devis_lignes WHERE devis_id = ?').run(req.params.id)
  db.prepare('DELETE FROM devis WHERE id = ?').run(req.params.id)
  res.json({ message: 'Devis supprimé' })
})

router.put('/:id/statut', (req: Request, res: Response) => {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM devis WHERE id = ?').get(req.params.id) as any
  if (!existing) return res.status(404).json({ error: 'Devis non trouvé' })
  const { statut } = req.body
  const valid = ['brouillon', 'envoye', 'accepte', 'refuse', 'expire']
  if (!valid.includes(statut)) return res.status(400).json({ error: 'Statut invalide' })
  db.prepare("UPDATE devis SET statut=?, modifie_le=datetime('now') WHERE id=?").run(statut, req.params.id)
  const devis = db.prepare('SELECT * FROM devis WHERE id = ?').get(req.params.id)
  res.json({ data: devis, message: 'Statut mis à jour' })
})

router.get('/:id/pdf', (req: Request, res: Response) => {
  const db = getDb()
  const devis = db.prepare(`SELECT d.*, c.nom || ' ' || COALESCE(c.prenom, '') as client_nom, c.email as client_email, c.telephone as client_telephone, c.adresse as client_adresse FROM devis d JOIN clients c ON d.client_id = c.id WHERE d.id = ?`).get(req.params.id) as any
  const settings: Record<string, any> = {}
  const paramRows = db.all('SELECT cle, valeur FROM parametres')
  paramRows.forEach((r: any) => { settings[r.cle] = r.valeur })
  const company = mapSettingsToCompanyConfig(paramRows)
  if (!devis) return res.status(404).json({ error: 'Devis non trouvé' })
  const lignes = db.prepare('SELECT * FROM devis_lignes WHERE devis_id = ?').all(req.params.id)
  res.json({ data: { ...devis, lignes }, settings, company })
})

export { router as devisRouter }
