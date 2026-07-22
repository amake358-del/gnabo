import { Router, Request, Response } from 'express'
import { getDb } from '../db'
import { requireAuth } from '../middleware/auth'
import { auditLog } from '../utils/audit'

const router = Router()
router.use(requireAuth)

router.get('/', (req: Request, res: Response) => {
  const db = getDb()
  const debut = req.query.debut as string || ''
  const fin = req.query.fin as string || ''
  const type = req.query.type as string || ''
  let query = 'SELECT c.*, u.nom as utilisateur_nom FROM caisse c LEFT JOIN utilisateurs u ON c.utilisateur_id = u.id'
  const params: any[] = []
  const conds: string[] = []
  if (debut) { conds.push('c.cree_le >= ?'); params.push(debut) }
  if (fin) { conds.push('c.cree_le <= ?'); params.push(fin) }
  if (type) { conds.push('c.type = ?'); params.push(type) }
  if (conds.length) query += ' WHERE ' + conds.join(' AND ')
  query += ' ORDER BY c.cree_le DESC'
  const rows = db.prepare(query).all(...params)
  const solde = db.prepare("SELECT COALESCE(SUM(CASE WHEN type='encaissement' THEN montant ELSE -montant END),0) as solde FROM caisse").get() as any
  res.json({ data: rows, solde: solde?.solde || 0 })
})

router.get('/aujourdhui', (_req: Request, res: Response) => {
  const db = getDb()
  const today = new Date().toISOString().split('T')[0]
  const rows = db.prepare("SELECT c.*, u.nom as utilisateur_nom FROM caisse c LEFT JOIN utilisateurs u ON c.utilisateur_id = u.id WHERE date(c.cree_le) = date(?) ORDER BY c.cree_le DESC").all(today)
  const totalEncaissements = db.prepare("SELECT COALESCE(SUM(montant),0) as total FROM caisse WHERE date(cree_le) = date(?) AND type='encaissement'").get(today) as any
  const totalDepenses = db.prepare("SELECT COALESCE(SUM(montant),0) as total FROM caisse WHERE date(cree_le) = date(?) AND type='depense'").get(today) as any
  const solde = (totalEncaissements?.total || 0) - (totalDepenses?.total || 0)
  res.json({ data: rows, total: solde, solde, total_encaissements: totalEncaissements?.total || 0, total_depenses: totalDepenses?.total || 0 })
})

router.get('/:id', (req: Request, res: Response) => {
  const db = getDb()
  const row = db.prepare('SELECT c.*, u.nom as utilisateur_nom FROM caisse c LEFT JOIN utilisateurs u ON c.utilisateur_id = u.id WHERE c.id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Entrée non trouvée' })
  res.json({ data: row })
})

router.post('/', (req: Request, res: Response) => {
  const db = getDb()
  const { type, categorie, montant, description, mode_paiement } = req.body
  if (!type || !categorie || montant === undefined) return res.status(400).json({ error: 'type, categorie et montant requis' })
  if (!['encaissement', 'depense'].includes(type)) return res.status(400).json({ error: 'type invalide' })
  const result = db.prepare('INSERT INTO caisse (type, categorie, montant, description, mode_paiement, utilisateur_id) VALUES (?,?,?,?,?,?)').run(type, categorie, parseFloat(montant), description || '', mode_paiement || '', req.session.userId)
  const row = db.prepare('SELECT * FROM caisse WHERE id = ?').get(result.lastInsertRowid)
  auditLog({ utilisateur_id: req.session.userId, module: 'caisse', action: type, nouvelle_valeur: JSON.stringify(row), adresse_ip: req.ip })
  res.json({ data: row, message: type === 'encaissement' ? 'Encaissement enregistré' : 'Dépense enregistrée' })
})

router.delete('/:id', (req: Request, res: Response) => {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM caisse WHERE id = ?').get(req.params.id) as any
  if (!existing) return res.status(404).json({ error: 'Entrée non trouvée' })
  db.prepare('DELETE FROM caisse WHERE id = ?').run(req.params.id)
  auditLog({ utilisateur_id: req.session.userId, module: 'caisse', action: 'suppression', ancienne_valeur: JSON.stringify(existing), adresse_ip: req.ip })
  res.json({ message: 'Entrée supprimée' })
})

export { router as caisseRouter }
