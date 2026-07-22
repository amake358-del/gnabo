import { Router, Request, Response } from 'express'
import { getDb } from '../db'
import { requireAuth } from '../middleware/auth'

const router = Router()
router.use(requireAuth)

router.get('/', (req: Request, res: Response) => {
  const db = getDb()
  const limit = parseInt(req.query.limit as string) || 100
  const rows = db.all('SELECT al.*, u.nom as utilisateur_nom FROM audit_log al LEFT JOIN utilisateurs u ON al.utilisateur_id = u.id ORDER BY al.cree_le DESC LIMIT ?', [limit])
  res.json({ data: rows })
})

router.post('/', (req: Request, res: Response) => {
  const db = getDb()
  const { module, action, ancienne_valeur, nouvelle_valeur } = req.body
  if (!module || !action) return res.status(400).json({ error: 'module et action requis' })
  db.prepare("INSERT INTO audit_log (utilisateur_id, module, action, ancienne_valeur, nouvelle_valeur, adresse_ip) VALUES (?,?,?,?,?,?)").run(
    req.session.userId || null, module, action, ancienne_valeur || null, nouvelle_valeur || null, req.ip || null
  )
  res.json({ message: 'Action enregistrée' })
})

export { router as actionLogRouter }
