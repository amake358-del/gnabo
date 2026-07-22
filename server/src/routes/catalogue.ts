import { Router, Request, Response } from 'express'
import { getDb } from '../db'
import { requireAuth } from '../middleware/auth'

const router = Router()
router.use(requireAuth)

router.get('/types', (_req: Request, res: Response) => {
  const db = getDb()
  const rows = db.all('SELECT * FROM catalog_types ORDER BY name')
  res.json({ data: rows })
})

router.post('/types', (req: Request, res: Response) => {
  const db = getDb()
  const { name } = req.body
  if (!name) return res.status(400).json({ error: 'Le nom est requis' })
  const existing = db.prepare('SELECT id FROM catalog_types WHERE name = ?').get(name)
  if (existing) return res.status(400).json({ error: 'Ce type existe déjà' })
  const result = db.prepare('INSERT INTO catalog_types (name) VALUES (?)').run(name)
  const type = db.prepare('SELECT * FROM catalog_types WHERE id = ?').get(result.lastInsertRowid)
  res.json({ data: type, message: 'Type créé' })
})

router.put('/types/:id', (req: Request, res: Response) => {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM catalog_types WHERE id = ?').get(req.params.id) as any
  if (!existing) return res.status(404).json({ error: 'Type non trouvé' })
  const { name } = req.body
  if (!name) return res.status(400).json({ error: 'Le nom est requis' })
  const dup = db.prepare('SELECT id FROM catalog_types WHERE name = ? AND id != ?').get(name, req.params.id)
  if (dup) return res.status(400).json({ error: 'Ce nom existe déjà' })
  db.prepare('UPDATE catalog_types SET name = ? WHERE id = ?').run(name, req.params.id)
  const type = db.prepare('SELECT * FROM catalog_types WHERE id = ?').get(req.params.id)
  res.json({ data: type, message: 'Type modifié' })
})

router.delete('/types/:id', (req: Request, res: Response) => {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM catalog_types WHERE id = ?').get(req.params.id) as any
  if (!existing) return res.status(404).json({ error: 'Type non trouvé' })
  const modeleCount = db.prepare('SELECT COUNT(*) as count FROM catalog_modeles WHERE type_id = ?').get(req.params.id) as any
  if (modeleCount.count > 0) return res.status(400).json({ error: 'Supprimez d\'abord les modèles de ce type' })
  db.prepare('DELETE FROM catalog_types WHERE id = ?').run(req.params.id)
  res.json({ message: 'Type supprimé' })
})

router.get('/modeles', (req: Request, res: Response) => {
  const db = getDb()
  const typeId = req.query.type_id as string || ''
  const search = req.query.search as string || ''
  let query = 'SELECT m.*, t.name as type_name FROM catalog_modeles m JOIN catalog_types t ON m.type_id = t.id'
  const params: any[] = []
  const conditions: string[] = []
  if (typeId) { conditions.push('m.type_id = ?'); params.push(typeId) }
  if (search) { conditions.push('(m.name LIKE ? OR m.description LIKE ?)'); const s = `%${search}%`; params.push(s, s) }
  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ')
  query += ' ORDER BY t.name, m.name'
  const rows = db.prepare(query).all(...params)
  res.json({ data: rows })
})

router.get('/modeles/:id', (req: Request, res: Response) => {
  const db = getDb()
  const modele = db.prepare('SELECT m.*, t.name as type_name FROM catalog_modeles m JOIN catalog_types t ON m.type_id = t.id WHERE m.id = ?').get(req.params.id) as any
  if (!modele) return res.status(404).json({ error: 'Modèle non trouvé' })
  res.json({ data: modele })
})

router.post('/modeles', (req: Request, res: Response) => {
  const db = getDb()
  const { type_id, name, prix, description, status } = req.body
  if (!type_id || !name) return res.status(400).json({ error: 'type_id et name sont requis' })
  const typeExists = db.prepare('SELECT id FROM catalog_types WHERE id = ?').get(type_id)
  if (!typeExists) return res.status(400).json({ error: 'Type invalide' })
  const result = db.prepare('INSERT INTO catalog_modeles (type_id, name, prix, description, status) VALUES (?,?,?,?,?)').run(type_id, name, parseFloat(prix) || 0, description || '', status || 'actif')
  const modele = db.prepare('SELECT m.*, t.name as type_name FROM catalog_modeles m JOIN catalog_types t ON m.type_id = t.id WHERE m.id = ?').get(result.lastInsertRowid)
  res.json({ data: modele, message: 'Modèle créé' })
})

router.put('/modeles/:id', (req: Request, res: Response) => {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM catalog_modeles WHERE id = ?').get(req.params.id) as any
  if (!existing) return res.status(404).json({ error: 'Modèle non trouvé' })
  const { type_id, name, prix, description, status } = req.body
  db.prepare(`UPDATE catalog_modeles SET type_id=?, name=?, prix=?, description=?, status=?, modifie_le=datetime('now') WHERE id=?`)
    .run(type_id ?? existing.type_id, name ?? existing.name, prix ?? existing.prix, description ?? existing.description, status ?? existing.status, req.params.id)
  const modele = db.prepare('SELECT m.*, t.name as type_name FROM catalog_modeles m JOIN catalog_types t ON m.type_id = t.id WHERE m.id = ?').get(req.params.id)
  res.json({ data: modele, message: 'Modèle modifié' })
})

router.delete('/modeles/:id', (req: Request, res: Response) => {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM catalog_modeles WHERE id = ?').get(req.params.id) as any
  if (!existing) return res.status(404).json({ error: 'Modèle non trouvé' })
  const lineCount = db.prepare('SELECT COUNT(*) as count FROM devis_lignes WHERE description LIKE ?').get(`%${existing.name}%`) as any
  if (lineCount.count > 0) return res.status(400).json({ error: 'Ce modèle est utilisé dans des devis' })
  db.prepare('DELETE FROM catalog_modeles WHERE id = ?').run(req.params.id)
  res.json({ message: 'Modèle supprimé' })
})

export { router as catalogueRouter }
