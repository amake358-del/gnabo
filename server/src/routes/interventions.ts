import { Router, Request, Response } from 'express'
import { getDb } from '../db'
import { requireAuth } from '../middleware/auth'
import { auditLog } from '../utils/audit'

const router = Router()
router.use(requireAuth)

router.get('/', (req: Request, res: Response) => {
  const db = getDb()
  const statut = req.query.statut as string || ''
  const search = req.query.search as string || ''
  let query = `SELECT i.*, cl.nom || ' ' || COALESCE(cl.prenom, '') as client_nom, cl.telephone as client_telephone, cl.adresse as client_adresse,
    d.numero as devis_numero FROM interventions i
    LEFT JOIN clients cl ON i.client_id = cl.id
    LEFT JOIN devis d ON i.devis_id = d.id`
  const params: any[] = []
  const conds: string[] = []
  if (statut) { conds.push('i.statut = ?'); params.push(statut) }
  if (search) { conds.push('(cl.nom LIKE ? OR i.technicien LIKE ?)'); const s = `%${search}%`; params.push(s, s) }
  if (conds.length) query += ' WHERE ' + conds.join(' AND ')
  query += ' ORDER BY i.date_prevue DESC'
  const rows = db.prepare(query).all(...params)
  res.json({ data: rows })
})

router.get('/:id', (req: Request, res: Response) => {
  const db = getDb()
  const row = db.prepare(`SELECT i.*, cl.nom || ' ' || COALESCE(cl.prenom, '') as client_nom, cl.telephone as client_telephone, cl.adresse as client_adresse,
    d.numero as devis_numero FROM interventions i
    LEFT JOIN clients cl ON i.client_id = cl.id
    LEFT JOIN devis d ON i.devis_id = d.id WHERE i.id = ?`).get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Intervention non trouvée' })
  res.json({ data: row })
})

router.post('/', (req: Request, res: Response) => {
  const db = getDb()
  const { devis_id, client_id, service, technicien, equipe, date_prevue, heure_prevue, adresse_intervention } = req.body
  if (!client_id || !service) return res.status(400).json({ error: 'client_id et service requis' })
  const result = db.prepare(`INSERT INTO interventions (devis_id, client_id, service, technicien, equipe, date_prevue, heure_prevue, adresse_intervention)
    VALUES (?,?,?,?,?,?,?,?)`).run(devis_id || null, client_id, service, technicien || '', equipe || '', date_prevue || '', heure_prevue || '', adresse_intervention || '')
  const intervention = db.prepare('SELECT * FROM interventions WHERE id = ?').get(result.lastInsertRowid)
  auditLog({ utilisateur_id: req.session.userId, module: 'interventions', action: 'creation', nouvelle_valeur: JSON.stringify(intervention), adresse_ip: req.ip })
  res.json({ data: intervention, message: 'Intervention planifiée' })
})

router.put('/:id', (req: Request, res: Response) => {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM interventions WHERE id = ?').get(req.params.id) as any
  if (!existing) return res.status(404).json({ error: 'Intervention non trouvée' })
  const fields = ['devis_id','client_id','service','technicien','equipe','date_prevue','heure_prevue','adresse_intervention','statut','photos_avant','photos_apres','compte_rendu','signature_client']
  const updates: string[] = []
  const values: any[] = []
  for (const f of fields) {
    if (req.body[f] !== undefined) { updates.push(`${f}=?`); values.push(req.body[f]) }
  }
  if (updates.length > 0) {
    values.push(req.params.id)
    db.prepare(`UPDATE interventions SET ${updates.join(',')} WHERE id=?`).run(...values)
  }
  const intervention = db.prepare('SELECT * FROM interventions WHERE id = ?').get(req.params.id)
  auditLog({ utilisateur_id: req.session.userId, module: 'interventions', action: 'modification', ancienne_valeur: JSON.stringify(existing), nouvelle_valeur: JSON.stringify(intervention), adresse_ip: req.ip })
  res.json({ data: intervention, message: 'Intervention mise à jour' })
})

router.delete('/:id', (req: Request, res: Response) => {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM interventions WHERE id = ?').get(req.params.id) as any
  if (!existing) return res.status(404).json({ error: 'Intervention non trouvée' })
  db.prepare('DELETE FROM interventions WHERE id = ?').run(req.params.id)
  auditLog({ utilisateur_id: req.session.userId, module: 'interventions', action: 'suppression', ancienne_valeur: JSON.stringify(existing), adresse_ip: req.ip })
  res.json({ message: 'Intervention supprimée' })
})

router.put('/:id/statut', (req: Request, res: Response) => {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM interventions WHERE id = ?').get(req.params.id) as any
  if (!existing) return res.status(404).json({ error: 'Intervention non trouvée' })
  const { statut } = req.body
  if (!['planifiee', 'en_cours', 'terminee', 'annulee'].includes(statut)) return res.status(400).json({ error: 'Statut invalide' })
  db.prepare('UPDATE interventions SET statut=? WHERE id=?').run(statut, req.params.id)
  auditLog({ utilisateur_id: req.session.userId, module: 'interventions', action: `statut_${statut}`, ancienne_valeur: JSON.stringify({ statut: existing.statut }), nouvelle_valeur: JSON.stringify({ statut }), adresse_ip: req.ip })
  res.json({ message: `Intervention ${statut}` })
})

export { router as interventionsRouter }
