import { Router, Request, Response } from 'express'
import { getDb } from '../db'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { requireAuth } from '../middleware/auth'
import { auditLog } from '../utils/audit'

const router = Router()
router.use(requireAuth)
const uploadsBase = path.join(__dirname, '../../data/uploads/appareils')

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}
const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => { ensureDir(uploadsBase); cb(null, uploadsBase) },
  filename: (_req: any, file: any, cb: any) => { cb(null, `${Date.now()}-${file.originalname}`) }
})
const upload = multer({ storage })

function genUidInterne(): string {
  return Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16).toUpperCase()).join('')
}

async function genUidVisible(db: any): Promise<string> {
  const last = db.prepare("SELECT uid_visible FROM appareils ORDER BY id DESC LIMIT 1").get()
  let num = 1
  if (last) {
    const parts = last.uid_visible.split('-')
    num = parseInt(parts[1]) + 1
  }
  return `EL-${String(num).padStart(6, '0')}`
}

router.get('/', (req: Request, res: Response) => {
  const db = getDb()
  const search = req.query.search as string || ''
  const statut = req.query.statut as string || ''
  let query = 'SELECT a.*, c.nom || \' \' || COALESCE(c.prenom, \'\') as client_nom, c.telephone as client_telephone, c.adresse as client_adresse FROM appareils a LEFT JOIN clients c ON a.client_id = c.id'
  const params: any[] = []
  const conds: string[] = []
  if (statut) { conds.push('a.statut = ?'); params.push(statut) }
  if (search) {
    conds.push('(a.uid_visible LIKE ? OR a.uid_interne LIKE ? OR a.marque LIKE ? OR a.modele LIKE ? OR a.numero_serie LIKE ?)')
    const s = `%${search}%`; params.push(s, s, s, s, s)
  }
  if (conds.length) query += ' WHERE ' + conds.join(' AND ')
  query += ' ORDER BY a.cree_le DESC'
  const rows = db.prepare(query).all(...params)
  res.json({ data: rows })
})

router.get('/by-qr/:code', (req: Request, res: Response) => {
  const db = getDb()
  const app = db.prepare("SELECT a.*, c.nom || ' ' || COALESCE(c.prenom, '') as client_nom, c.telephone as client_telephone, c.adresse as client_adresse FROM appareils a LEFT JOIN clients c ON a.client_id = c.id WHERE a.uid_interne = ?").get(req.params.code) as any
  if (!app) return res.status(404).json({ error: 'Aucun appareil trouvé pour ce QR Code', data: null })
  const diagnostic = db.prepare('SELECT * FROM diagnostics WHERE appareil_id = ? ORDER BY cree_le DESC').all(app.id)
  res.json({ data: { ...app, diagnostic } })
})

router.get('/:id', (req: Request, res: Response) => {
  const db = getDb()
  const app = db.prepare("SELECT a.*, c.nom || ' ' || COALESCE(c.prenom, '') as client_nom, c.telephone as client_telephone, c.adresse as client_adresse FROM appareils a LEFT JOIN clients c ON a.client_id = c.id WHERE a.id = ?").get(req.params.id) as any
  if (!app) return res.status(404).json({ error: 'Appareil non trouvé' })
  const diagnostic = db.prepare('SELECT * FROM diagnostics WHERE appareil_id = ? ORDER BY cree_le DESC').all(app.id)
  res.json({ data: { ...app, diagnostic } })
})

router.post('/', async (req: Request, res: Response) => {
  const db = getDb()
  const { client_id, type, marque, modele, numero_serie, code_imei, mot_de_passe, accessoires, description_defaut, etat_esthetique } = req.body
  if (!client_id) return res.status(400).json({ error: 'Client requis' })
  let uid_interne = genUidInterne()
  while (db.prepare('SELECT id FROM appareils WHERE uid_interne = ?').get(uid_interne)) {
    uid_interne = genUidInterne()
  }
  const uid_visible = await genUidVisible(db)
  const result = db.prepare(`INSERT INTO appareils (uid_interne, uid_visible, client_id, type, marque, modele, numero_serie, code_imei, mot_de_passe, accessoires, description_defaut, etat_esthetique)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    uid_interne, uid_visible, client_id, type || '', marque || '', modele || '',
    numero_serie || '', code_imei || '', mot_de_passe || '', accessoires || '',
    description_defaut || '', etat_esthetique || ''
  )
  const app = db.prepare('SELECT * FROM appareils WHERE id = ?').get(result.lastInsertRowid)
  auditLog({ utilisateur_id: req.session.userId, module: 'appareils', action: 'reception', nouvelle_valeur: JSON.stringify(app), adresse_ip: req.ip })
  res.json({ data: app, message: 'Appareil enregistré' })
})

router.put('/:id', (req: Request, res: Response) => {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM appareils WHERE id = ?').get(req.params.id) as any
  if (!existing) return res.status(404).json({ error: 'Appareil non trouvé' })
  const fields = ['client_id','type','marque','modele','numero_serie','code_imei','mot_de_passe','accessoires','description_defaut','etat_esthetique','statut','couleur','statut_detail']
  const updates: string[] = ["modifie_le=datetime('now')"]
  const values: any[] = []
  for (const f of fields) {
    if (req.body[f] !== undefined) { updates.push(`${f}=?`); values.push(req.body[f]) }
  }
  if (updates.length > 1) { values.push(req.params.id); db.prepare(`UPDATE appareils SET ${updates.join(',')} WHERE id=?`).run(...values) }
  const app = db.prepare('SELECT * FROM appareils WHERE id = ?').get(req.params.id)
  auditLog({ utilisateur_id: req.session.userId, module: 'appareils', action: 'modification', ancienne_valeur: JSON.stringify(existing), nouvelle_valeur: JSON.stringify(app), adresse_ip: req.ip })
  res.json({ data: app, message: 'Appareil mis à jour' })
})

router.delete('/:id', (req: Request, res: Response) => {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM appareils WHERE id = ?').get(req.params.id) as any
  if (!existing) return res.status(404).json({ error: 'Appareil non trouvé' })
  db.prepare('DELETE FROM appareils WHERE id = ?').run(req.params.id)
  auditLog({ utilisateur_id: req.session.userId, module: 'appareils', action: 'suppression', ancienne_valeur: JSON.stringify(existing), adresse_ip: req.ip })
  res.json({ message: 'Appareil supprimé' })
})

router.post('/:id/photo', upload.single('photo'), (req: Request, res: Response) => {
  const r = req as any
  if (!r.file) return res.status(400).json({ error: 'Fichier requis' })
  const db = getDb()
  const existing = db.prepare('SELECT * FROM appareils WHERE id = ?').get(req.params.id) as any
  if (!existing) return res.status(404).json({ error: 'Appareil non trouvé' })
  const photoUrl = `/uploads/appareils/${r.file.filename}`
  const photos = existing.photos ? JSON.parse(existing.photos) : []
  photos.push(photoUrl)
  db.prepare("UPDATE appareils SET photos=?, modifie_le=datetime('now') WHERE id=?").run(JSON.stringify(photos), req.params.id)
  res.json({ data: { photo_url: photoUrl, photos }, message: 'Photo ajoutée' })
})

router.post('/:id/utiliser-pieces', (req: Request, res: Response) => {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM appareils WHERE id = ?').get(req.params.id) as any
  if (!existing) return res.status(404).json({ error: 'Appareil non trouvé' })
  const { article_id, quantite, notes } = req.body
  if (!article_id || !quantite) return res.status(400).json({ error: 'article_id et quantite requis' })
  const article = db.prepare('SELECT * FROM articles_stock WHERE id = ?').get(article_id) as any
  if (!article) return res.status(404).json({ error: 'Article non trouvé' })
  if (article.quantite < quantite) return res.status(400).json({ error: 'Stock insuffisant' })
  const newQty = article.quantite - quantite
  db.prepare('UPDATE articles_stock SET quantite = ?, modifie_le = datetime(\'now\') WHERE id = ?').run(newQty, article_id)
  db.prepare('INSERT INTO mouvements_stock (article_id, type, quantite, reference, notes, utilisateur_id) VALUES (?,?,?,?,?,?)').run(article_id, 'sortie', quantite, `Appareil:${req.params.id}`, notes || '', req.session.userId)
  auditLog({ utilisateur_id: req.session.userId, module: 'appareils', action: 'utilisation_pieces', nouvelle_valeur: JSON.stringify({ article_id, quantite, appareil_id: req.params.id, nouveau_stock: newQty }), adresse_ip: req.ip })
  res.json({ message: 'Pièce déduite du stock', nouveau_stock: newQty })
})

router.post('/:id/valider-test', (req: Request, res: Response) => {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM appareils WHERE id = ?').get(req.params.id) as any
  if (!existing) return res.status(404).json({ error: 'Appareil non trouvé' })
  db.prepare("UPDATE appareils SET statut='pret', statut_detail='test_valide', modifie_le=datetime('now') WHERE id=?").run(req.params.id)
  auditLog({ utilisateur_id: req.session.userId, module: 'appareils', action: 'test_valide', ancienne_valeur: JSON.stringify({ statut: existing.statut }), nouvelle_valeur: JSON.stringify({ statut: 'pret', statut_detail: 'test_valide' }), adresse_ip: req.ip })
  res.json({ message: 'Test validé, appareil prêt à livrer', statut: 'pret' })
})

router.post('/:id/archive', (req: Request, res: Response) => {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM appareils WHERE id = ?').get(req.params.id) as any
  if (!existing) return res.status(404).json({ error: 'Appareil non trouvé' })
  db.prepare("UPDATE appareils SET statut='archive', modifie_le=datetime('now') WHERE id=?").run(req.params.id)
  auditLog({ utilisateur_id: req.session.userId, module: 'appareils', action: 'archive', ancienne_valeur: JSON.stringify({ statut: existing.statut }), nouvelle_valeur: JSON.stringify({ statut: 'archive' }), adresse_ip: req.ip })
  res.json({ message: 'Appareil archivé' })
})

export { router as appareilsRouter }
