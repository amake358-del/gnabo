import { Router, Request, Response } from 'express'
import { getDb } from '../db'
import { requireAuth } from '../middleware/auth'
import { auditLog } from '../utils/audit'

const router = Router()
router.use(requireAuth)

// Categories
router.get('/categories', (_req: Request, res: Response) => {
  const db = getDb()
  const rows = db.all('SELECT * FROM categories_stock ORDER BY service, nom')
  res.json({ data: rows })
})

router.post('/categories', (req: Request, res: Response) => {
  const db = getDb()
  const { nom, service } = req.body
  if (!nom) return res.status(400).json({ error: 'nom requis' })
  const result = db.prepare('INSERT INTO categories_stock (nom, service) VALUES (?,?)').run(nom, service || 'tous')
  const cat = db.prepare('SELECT * FROM categories_stock WHERE id = ?').get(result.lastInsertRowid)
  res.json({ data: cat, message: 'Catégorie créée' })
})

router.put('/categories/:id', (req: Request, res: Response) => {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM categories_stock WHERE id = ?').get(req.params.id) as any
  if (!existing) return res.status(404).json({ error: 'Catégorie non trouvée' })
  const { nom, service } = req.body
  db.prepare('UPDATE categories_stock SET nom=?, service=? WHERE id=?').run(nom || existing.nom, service || existing.service, req.params.id)
  const cat = db.prepare('SELECT * FROM categories_stock WHERE id = ?').get(req.params.id)
  res.json({ data: cat, message: 'Catégorie modifiée' })
})

router.delete('/categories/:id', (req: Request, res: Response) => {
  const db = getDb()
  const count = db.prepare('SELECT COUNT(*) as count FROM articles_stock WHERE categorie_id = ?').get(req.params.id) as any
  if (count.count > 0) return res.status(400).json({ error: 'Supprimez d\'abord les articles de cette catégorie' })
  db.prepare('DELETE FROM categories_stock WHERE id = ?').run(req.params.id)
  res.json({ message: 'Catégorie supprimée' })
})

// Articles
router.get('/articles', (req: Request, res: Response) => {
  const db = getDb()
  const search = req.query.search as string || ''
  const catId = req.query.categorie_id as string || ''
  const alert = req.query.alert === '1'
  let query = 'SELECT a.*, c.nom as categorie_nom FROM articles_stock a LEFT JOIN categories_stock c ON a.categorie_id = c.id'
  const params: any[] = []
  const conds: string[] = []
  if (search) { conds.push('(a.nom LIKE ? OR a.reference LIKE ?)'); const s = `%${search}%`; params.push(s, s) }
  if (catId) { conds.push('a.categorie_id = ?'); params.push(catId) }
  if (alert) { conds.push('a.quantite <= a.seuil_alerte') }
  if (conds.length) query += ' WHERE ' + conds.join(' AND ')
  query += ' ORDER BY c.nom, a.nom'
  const rows = db.prepare(query).all(...params)
  res.json({ data: rows })
})

router.get('/articles/:id', (req: Request, res: Response) => {
  const db = getDb()
  const article = db.prepare('SELECT a.*, c.nom as categorie_nom FROM articles_stock a LEFT JOIN categories_stock c ON a.categorie_id = c.id WHERE a.id = ?').get(req.params.id)
  if (!article) return res.status(404).json({ error: 'Article non trouvé' })
  const mouvements = db.prepare('SELECT * FROM mouvements_stock WHERE article_id = ? ORDER BY cree_le DESC').all(req.params.id)
  res.json({ data: { ...article, mouvements } })
})

router.post('/articles', (req: Request, res: Response) => {
  const db = getDb()
  const { categorie_id, nom, reference, prix_unitaire, fournisseur, seuil_alerte } = req.body
  if (!categorie_id || !nom) return res.status(400).json({ error: 'categorie_id et nom requis' })
  const result = db.prepare('INSERT INTO articles_stock (categorie_id, nom, reference, prix_unitaire, fournisseur, seuil_alerte) VALUES (?,?,?,?,?,?)').run(categorie_id, nom, reference || '', parseFloat(prix_unitaire) || 0, fournisseur || '', parseInt(seuil_alerte) || 5)
  const article = db.prepare('SELECT * FROM articles_stock WHERE id = ?').get(result.lastInsertRowid)
  auditLog({ utilisateur_id: req.session.userId, module: 'stocks', action: 'creation', nouvelle_valeur: JSON.stringify(article), adresse_ip: req.ip })
  res.json({ data: article, message: 'Article créé' })
})

router.put('/articles/:id', (req: Request, res: Response) => {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM articles_stock WHERE id = ?').get(req.params.id) as any
  if (!existing) return res.status(404).json({ error: 'Article non trouvé' })
  const { categorie_id, nom, reference, prix_unitaire, fournisseur, seuil_alerte } = req.body
  db.prepare('UPDATE articles_stock SET categorie_id=?, nom=?, reference=?, prix_unitaire=?, fournisseur=?, seuil_alerte=?, modifie_le=datetime(\'now\') WHERE id=?')
    .run(categorie_id ?? existing.categorie_id, nom ?? existing.nom, reference ?? existing.reference, prix_unitaire ?? existing.prix_unitaire, fournisseur ?? existing.fournisseur, seuil_alerte ?? existing.seuil_alerte, req.params.id)
  const article = db.prepare('SELECT * FROM articles_stock WHERE id = ?').get(req.params.id)
  auditLog({ utilisateur_id: req.session.userId, module: 'stocks', action: 'modification', ancienne_valeur: JSON.stringify(existing), nouvelle_valeur: JSON.stringify(article), adresse_ip: req.ip })
  res.json({ data: article, message: 'Article modifié' })
})

router.delete('/articles/:id', (req: Request, res: Response) => {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM articles_stock WHERE id = ?').get(req.params.id) as any
  if (!existing) return res.status(404).json({ error: 'Article non trouvé' })
  db.prepare('DELETE FROM mouvements_stock WHERE article_id = ?').run(req.params.id)
  db.prepare('DELETE FROM articles_stock WHERE id = ?').run(req.params.id)
  auditLog({ utilisateur_id: req.session.userId, module: 'stocks', action: 'suppression', ancienne_valeur: JSON.stringify(existing), adresse_ip: req.ip })
  res.json({ message: 'Article supprimé' })
})

// Mouvements
router.get('/mouvements', (req: Request, res: Response) => {
  const db = getDb()
  const articleId = req.query.article_id as string || ''
  let query = 'SELECT m.*, a.nom as article_nom FROM mouvements_stock m LEFT JOIN articles_stock a ON m.article_id = a.id'
  const params: any[] = []
  if (articleId) { query += ' WHERE m.article_id = ?'; params.push(articleId) }
  query += ' ORDER BY m.cree_le DESC'
  const rows = db.prepare(query).all(...params)
  res.json({ data: rows })
})

router.post('/mouvements', (req: Request, res: Response) => {
  const db = getDb()
  const { article_id, type, quantite, reference, notes } = req.body
  if (!article_id || !type || !quantite) return res.status(400).json({ error: 'article_id, type et quantite requis' })
  const article = db.prepare('SELECT * FROM articles_stock WHERE id = ?').get(article_id) as any
  if (!article) return res.status(404).json({ error: 'Article non trouvé' })
  const qty = parseInt(quantite)
  const newQty = type === 'entree' ? article.quantite + qty : article.quantite - qty
  if (type === 'sortie' && newQty < 0) return res.status(400).json({ error: 'Stock insuffisant' })
  db.prepare('UPDATE articles_stock SET quantite = ?, modifie_le = datetime(\'now\') WHERE id = ?').run(newQty, article_id)
  db.prepare('INSERT INTO mouvements_stock (article_id, type, quantite, reference, notes, utilisateur_id) VALUES (?,?,?,?,?,?)').run(article_id, type, qty, reference || '', notes || '', req.session.userId)
  auditLog({ utilisateur_id: req.session.userId, module: 'stocks', action: `mouvement_${type}`, nouvelle_valeur: JSON.stringify({ article_id, type, quantite: qty, nouveau_stock: newQty }), adresse_ip: req.ip })
  res.json({ message: 'Mouvement enregistré', nouveau_stock: newQty })
})

export { router as stocksRouter }
