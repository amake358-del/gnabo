import { Router, Request, Response } from 'express'
import { getDb } from '../db'
import bcrypt from 'bcryptjs'
import { requireAuth, requireRole } from '../middleware/auth'

const router = Router()
router.use(requireAuth)

router.get('/', requireRole('pdg'), (_req: Request, res: Response) => {
  const db = getDb()
  const users = db.all('SELECT id, nom, email, role, actif, cree_le FROM utilisateurs ORDER BY cree_le DESC')
  res.json({ data: users })
})

router.post('/', requireRole('pdg'), (req: Request, res: Response) => {
  const db = getDb()
  const { nom, email, mot_de_passe, role } = req.body
  if (!nom || !email || !mot_de_passe) return res.status(400).json({ error: 'nom, email et mot_de_passe requis' })
  const existing = db.prepare('SELECT id FROM utilisateurs WHERE email = ?').get(email)
  if (existing) return res.status(400).json({ error: 'Email déjà utilisé' })
  const hash = bcrypt.hashSync(mot_de_passe, 10)
  const validRole = role === 'admin' ? 'admin' : 'pdg'
  const result = db.prepare('INSERT INTO utilisateurs (nom, email, mot_de_passe_hash, role) VALUES (?,?,?,?)').run(nom, email, hash, validRole)
  const user = db.prepare('SELECT id, nom, email, role, actif, cree_le FROM utilisateurs WHERE id = ?').get(result.lastInsertRowid)
  res.json({ data: user, message: 'Utilisateur créé' })
})

router.put('/:id', requireRole('pdg'), (req: Request, res: Response) => {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM utilisateurs WHERE id = ?').get(req.params.id) as any
  if (!existing) return res.status(404).json({ error: 'Utilisateur non trouvé' })
  const { nom, email, role, actif } = req.body
  db.prepare("UPDATE utilisateurs SET nom=COALESCE(?,nom), email=COALESCE(?,email), role=COALESCE(?,role), actif=COALESCE(?,actif), modifie_le=datetime('now') WHERE id=?").run(nom, email, role, actif, req.params.id)
  const user = db.prepare('SELECT id, nom, email, role, actif, cree_le FROM utilisateurs WHERE id = ?').get(req.params.id)
  res.json({ data: user, message: 'Utilisateur modifié' })
})

router.delete('/:id', requireRole('pdg'), (req: Request, res: Response) => {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM utilisateurs WHERE id = ?').get(req.params.id) as any
  if (!existing) return res.status(404).json({ error: 'Utilisateur non trouvé' })
  db.prepare('DELETE FROM utilisateurs WHERE id = ?').run(req.params.id)
  res.json({ message: 'Utilisateur supprimé' })
})

export { router as usersRouter }
