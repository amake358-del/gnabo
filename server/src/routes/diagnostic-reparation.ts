import { Router, Request, Response } from 'express'
import { getDb } from '../db'
import { requireAuth } from '../middleware/auth'

const router = Router()
router.use(requireAuth)

router.get('/appareil/:appareilId', (req: Request, res: Response) => {
  const db = getDb()
  const rows = db.prepare('SELECT * FROM diagnostics WHERE appareil_id = ? ORDER BY cree_le DESC LIMIT 1').get(req.params.appareilId)
  res.json({ data: rows || null })
})

router.post('/', (req: Request, res: Response) => {
  const db = getDb()
  const { appareil_id, description, pieces_necessaires, cout_estime, duree_estimee, technicien } = req.body
  if (!appareil_id) return res.status(400).json({ error: 'Appareil requis' })
  const app = db.prepare('SELECT id FROM appareils WHERE id = ?').get(appareil_id)
  if (!app) return res.status(404).json({ error: 'Appareil non trouvé' })
  const result = db.prepare(`INSERT INTO diagnostics (appareil_id, description, pieces_necessaires, cout_estime, duree_estimee, technicien)
    VALUES (?,?,?,?,?,?)`).run(
    appareil_id, description || '', pieces_necessaires || '', parseFloat(cout_estime) || 0,
    parseInt(duree_estimee) || 0, technicien || ''
  )
  db.prepare("UPDATE appareils SET statut='diagnostic', modifie_le=datetime('now') WHERE id=?").run(appareil_id)
  const diag = db.prepare('SELECT * FROM diagnostics WHERE id = ?').get(result.lastInsertRowid)
  res.json({ data: diag, message: 'Diagnostic enregistré' })
})

router.put('/:id', (req: Request, res: Response) => {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM diagnostics WHERE id = ?').get(req.params.id) as any
  if (!existing) return res.status(404).json({ error: 'Diagnostic non trouvé' })
  const fields = ['description','pieces_necessaires','cout_estime','duree_estimee','technicien']
  const updates: string[] = []
  const values: any[] = []
  for (const f of fields) {
    if (req.body[f] !== undefined) { updates.push(`${f}=?`); values.push(req.body[f]) }
  }
  if (updates.length > 0) { values.push(req.params.id); db.prepare(`UPDATE diagnostics SET ${updates.join(',')} WHERE id=?`).run(...values) }
  const diag = db.prepare('SELECT * FROM diagnostics WHERE id = ?').get(req.params.id)
  res.json({ data: diag, message: 'Diagnostic mis à jour' })
})

export { router as diagnosticRouter }
