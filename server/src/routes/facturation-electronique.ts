import { Router, Request, Response } from 'express'
import { getDb } from '../db'
import { requireAuth } from '../middleware/auth'

const router = Router()
router.use(requireAuth)

function generateNumero(db: any, prefix: string): string {
  const year = new Date().getFullYear()
  const last = db.prepare(`SELECT numero FROM devis WHERE numero LIKE ? ORDER BY numero DESC LIMIT 1`).get(`${prefix}-EL-${year}-%`) as any
  let next = 1
  if (last) { const p = last.numero.split('-'); next = parseInt(p[3]) + 1 }
  return `${prefix}-EL-${year}-${String(next).padStart(6, '0')}`
}

// Devis electronique
router.get('/devis', (req: Request, res: Response) => {
  const db = getDb()
  const appareilId = req.query.appareil_id as string || ''
  const search = req.query.search as string || ''
  let query = "SELECT d.*, a.uid_visible, a.marque, a.modele FROM devis d LEFT JOIN appareils a ON d.appareil_id = a.id WHERE d.service = 'electronique'"
  const params: any[] = []
  if (appareilId) { query += ' AND d.appareil_id = ?'; params.push(appareilId) }
  if (search) { query += ' AND (d.numero LIKE ? OR a.uid_visible LIKE ?)'; params.push(`%${search}%`, `%${search}%`) }
  query += ' ORDER BY d.cree_le DESC'
  const rows = db.prepare(query).all(...params)
  res.json({ data: rows })
})

router.get('/devis/:id', (req: Request, res: Response) => {
  const db = getDb()
  const devis = db.prepare("SELECT d.*, a.uid_visible, a.marque, a.modele FROM devis d LEFT JOIN appareils a ON d.appareil_id = a.id WHERE d.id = ? AND d.service = 'electronique'").get(req.params.id) as any
  if (!devis) return res.status(404).json({ error: 'Devis non trouvé' })
  const lignes = db.prepare('SELECT * FROM devis_lignes WHERE devis_id = ?').all(req.params.id)
  res.json({ data: { ...devis, lignes } })
})

router.post('/devis', (req: Request, res: Response) => {
  const db = getDb()
  const { client_id, appareil_id, notes } = req.body
  if (!appareil_id || !client_id) return res.status(400).json({ error: 'appareil_id et client_id requis' })
  const numero = generateNumero(db, 'DEV')
  const result = db.prepare("INSERT INTO devis (numero, client_id, service, appareil_id, statut, notes) VALUES (?,?,'electronique',?,'brouillon',?)").run(numero, client_id, appareil_id, notes || '')
  const devis = db.prepare('SELECT * FROM devis WHERE id = ?').get(result.lastInsertRowid)
  res.json({ data: devis, message: 'Devis créé' })
})

router.put('/devis/:id', (req: Request, res: Response) => {
  const db = getDb()
  const existing = db.prepare("SELECT * FROM devis WHERE id = ? AND service = 'electronique'").get(req.params.id) as any
  if (!existing) return res.status(404).json({ error: 'Devis non trouvé' })
  const { statut, notes, montant_ht, tva, montant_ttc } = req.body
  db.prepare("UPDATE devis SET statut=COALESCE(?,statut), notes=COALESCE(?,notes), montant_ht=COALESCE(?,montant_ht), tva=COALESCE(?,tva), montant_ttc=COALESCE(?,montant_ttc), modifie_le=datetime('now') WHERE id=?").run(statut, notes, montant_ht, tva, montant_ttc, req.params.id)
  const devis = db.prepare('SELECT * FROM devis WHERE id = ?').get(req.params.id)
  res.json({ data: devis, message: 'Devis mis à jour' })
})

// Factures electronique
router.get('/factures', (req: Request, res: Response) => {
  const db = getDb()
  const search = req.query.search as string || ''
  let query = "SELECT f.*, a.uid_visible, a.marque, a.modele FROM factures f LEFT JOIN devis d ON f.devis_id = d.id LEFT JOIN appareils a ON d.appareil_id = a.id WHERE f.service = 'electronique'"
  const params: any[] = []
  if (search) { query += ' AND (f.numero LIKE ? OR a.uid_visible LIKE ?)'; params.push(`%${search}%`, `%${search}%`) }
  query += ' ORDER BY f.cree_le DESC'
  const rows = db.prepare(query).all(...params)
  res.json({ data: rows })
})

router.get('/factures/:id', (req: Request, res: Response) => {
  const db = getDb()
  const facture = db.prepare("SELECT f.*, a.uid_visible, a.marque, a.modele FROM factures f LEFT JOIN devis d ON f.devis_id = d.id LEFT JOIN appareils a ON d.appareil_id = a.id WHERE f.id = ? AND f.service = 'electronique'").get(req.params.id) as any
  if (!facture) return res.status(404).json({ error: 'Facture non trouvée' })
  const paiements = db.prepare('SELECT * FROM paiements WHERE facture_id = ? ORDER BY cree_le DESC').all(req.params.id)
  const totalPaye = paiements.reduce((s: number, p: any) => s + p.montant, 0)
  res.json({ data: { ...facture, paiements, total_paye: totalPaye, reste: facture.montant_ttc - totalPaye } })
})

router.post('/factures', (req: Request, res: Response) => {
  const db = getDb()
  const { client_id, appareil_id, devis_id, montant_ht, tva, montant_ttc } = req.body
  if (!client_id || !appareil_id) return res.status(400).json({ error: 'client_id et appareil_id requis' })
  const numero = generateNumero(db, 'FAC')
  const result = db.prepare("INSERT INTO factures (numero, devis_id, client_id, service, montant_ht, tva, montant_ttc) VALUES (?,?,?,'electronique',?,?,?)").run(numero, devis_id || null, client_id, montant_ht || 0, tva || 0, montant_ttc || 0)
  const facture = db.prepare('SELECT * FROM factures WHERE id = ?').get(result.lastInsertRowid)
  res.json({ data: facture, message: 'Facture créée' })
})

// Paiements
router.post('/paiements', (req: Request, res: Response) => {
  const db = getDb()
  const { facture_id, client_id, montant, mode, reference } = req.body
  if (!client_id || !montant) return res.status(400).json({ error: 'client_id et montant requis' })
  const validModes = ['especes', 'carte', 'cheque', 'virement', 'mobile_money']
  const result = db.prepare("INSERT INTO paiements (facture_id, client_id, montant, mode, reference) VALUES (?,?,?,?,?)").run(facture_id || null, client_id, parseFloat(montant), validModes.includes(mode) ? mode : 'especes', reference || '')
  if (facture_id) {
    const paiements = db.prepare('SELECT SUM(montant) as total FROM paiements WHERE facture_id = ?').get(facture_id) as any
    const facture = db.prepare('SELECT montant_ttc FROM factures WHERE id = ?').get(facture_id) as any
    if (paiements && facture) {
      const newStatut = paiements.total >= facture.montant_ttc ? 'payee' : 'impayee'
      db.prepare('UPDATE factures SET statut=? WHERE id=?').run(newStatut, facture_id)
    }
  }
  const paiement = db.prepare('SELECT * FROM paiements WHERE id = ?').get(result.lastInsertRowid)
  res.json({ data: paiement, message: 'Paiement enregistré' })
})

router.get('/paiements/appareil/:appareilId', (_req: Request, res: Response) => {
  const db = getDb()
  const rows = db.prepare(
    "SELECT p.*, f.numero as facture_numero FROM paiements p LEFT JOIN factures f ON p.facture_id = f.id LEFT JOIN devis d ON f.devis_id = d.id WHERE d.appareil_id = ? ORDER BY p.cree_le DESC"
  ).all(_req.params.appareilId)
  res.json({ data: rows })
})

export { router as facturationRouter }
