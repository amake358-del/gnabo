import { Router, Request, Response } from 'express'
import { getDb } from '../db'
import { requireAuth } from '../middleware/auth'

const router = Router()
router.use(requireAuth)

const TEST_CATEGORIES = [
  'alimentation', 'ecran', 'batterie', 'haut_parleur', 'microphone',
  'vibreur', 'wifi', 'bluetooth', 'gsm', 'chargeur', 'tactile',
  'appareil_photo', 'lecteur_carte', 'boutons', 'capteurs',
]

router.get('/appareil/:appareilId', (req: Request, res: Response) => {
  const db = getDb()
  const tests = db.prepare('SELECT * FROM tests_techniques WHERE appareil_id = ? ORDER BY categorie').all(req.params.appareilId)
  const session = db.prepare('SELECT * FROM controles_techniques WHERE appareil_id = ? ORDER BY cree_le DESC LIMIT 1').get(req.params.appareilId) as any
  res.json({ data: { tests, session, categories: TEST_CATEGORIES } })
})

router.post('/appareil/:appareilId', (req: Request, res: Response) => {
  const db = getDb()
  const { tests, commentaire, technicien } = req.body
  if (!tests || !Array.isArray(tests)) return res.status(400).json({ error: 'tests requis' })
  const appareilId = req.params.appareilId

  const testCountOk = tests.filter((t: any) => t.resultat === 'ok').length
  const testCountKo = tests.filter((t: any) => t.resultat === 'ko').length
  const resultatGlobal = testCountKo > 0 ? 'ko' : testCountOk > 0 ? 'ok' : 'en_cours'

  db.prepare('DELETE FROM tests_techniques WHERE appareil_id = ?').run(appareilId)
  const insertStmt = db.prepare('INSERT INTO tests_techniques (appareil_id, categorie, resultat, commentaire) VALUES (?,?,?,?)')
  for (const t of tests) {
    insertStmt.run(appareilId, t.categorie, t.resultat, t.commentaire || '')
  }

  const existingSession = db.prepare('SELECT id FROM controles_techniques WHERE appareil_id = ? AND resultat_global = \'en_cours\'').get(appareilId)
  if (existingSession) {
    db.prepare("UPDATE controles_techniques SET tests=?, resultat_global=?, commentaire=?, technicien=?, modifie_le=datetime('now') WHERE id=?").run(
      JSON.stringify(tests), resultatGlobal, commentaire || '', technicien || '', existingSession.id
    )
  } else {
    db.prepare('INSERT INTO controles_techniques (appareil_id, resultat_global, commentaire, tests, technicien) VALUES (?,?,?,?,?)').run(
      appareilId, resultatGlobal, commentaire || '', JSON.stringify(tests), technicien || ''
    )
  }

  const session = db.prepare('SELECT * FROM controles_techniques WHERE appareil_id = ? ORDER BY cree_le DESC LIMIT 1').get(appareilId)
  res.json({ data: { session, tests }, message: 'Contrôle technique enregistré' })
})

export { router as controlesRouter }
