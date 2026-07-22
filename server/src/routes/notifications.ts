import { Router, Request, Response } from 'express'
import { getDb } from '../db'
import { requireAuth } from '../middleware/auth'

const router = Router()
router.use(requireAuth)

router.get('/', (req: Request, res: Response) => {
  const db = getDb()
  const limit = parseInt(req.query.limit as string) || 20
  const unreadOnly = req.query.unread === '1'
  let query = 'SELECT * FROM notifications'
  const params: any[] = []
  if (unreadOnly) { query += ' WHERE read = 0' }
  query += ' ORDER BY cree_le DESC LIMIT ?'
  params.push(limit)
  const rows = db.prepare(query).all(...params)
  const unread = (db.prepare('SELECT COUNT(*) as count FROM notifications WHERE read = 0').get() as any).count
  res.json({ data: rows, unread })
})

router.post('/', (req: Request, res: Response) => {
  const db = getDb()
  const { type, title, message, link } = req.body
  const result = db.prepare('INSERT INTO notifications (type, title, message, link) VALUES (?,?,?,?)').run(
    type || 'info', title, message || '', link || null
  )
  const notif = db.prepare('SELECT * FROM notifications WHERE id = ?').get(result.lastInsertRowid)
  res.json({ data: notif, message: 'Notification créée' })
})

router.put('/:id/read', (req: Request, res: Response) => {
  const db = getDb()
  db.prepare("UPDATE notifications SET read = 1 WHERE id = ?").run(req.params.id)
  res.json({ message: 'Marquée comme lue' })
})

router.put('/read-all', (_req: Request, res: Response) => {
  const db = getDb()
  db.prepare("UPDATE notifications SET read = 1 WHERE read = 0").run()
  res.json({ message: 'Toutes marquées comme lues' })
})

router.delete('/:id', (req: Request, res: Response) => {
  const db = getDb()
  db.prepare('DELETE FROM notifications WHERE id = ?').run(req.params.id)
  res.json({ message: 'Notification supprimée' })
})

router.post('/generate', (_req: Request, res: Response) => {
  const db = getDb()
  const appareilsAttente = db.prepare(`
    SELECT id, uid_visible, client_id FROM appareils
    WHERE statut NOT IN ('livre', 'pret', 'repare')
    AND date(cree_le) <= date('now', '-7 days')
  `).all() as any[]
  let created = 0
  for (const a of appareilsAttente) {
    const existing = db.prepare("SELECT id FROM notifications WHERE type='alerte' AND link=? AND date(cree_le)=date('now')").get(`/appareils/${a.id}`)
    if (existing) continue
    const client = db.prepare('SELECT nom, prenom FROM clients WHERE id = ?').get(a.client_id) as any
    const clientName = client ? `${client.prenom || ''} ${client.nom || ''}`.trim() : 'Client'
    db.prepare('INSERT INTO notifications (type, title, message, link) VALUES (?,?,?,?)').run(
      'alerte', 'Appareil en attente',
      `${clientName} — ${a.uid_visible}`,
      `/appareils/${a.id}`
    )
    created++
  }
  res.json({ message: `${created} alertes générées` })
})

export { router as notificationsRouter }
