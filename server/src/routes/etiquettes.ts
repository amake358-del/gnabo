import { Router, Request, Response } from 'express'
import { dbRun, dbAll, dbGet } from '../db'
import { requireAuth } from '../middleware/auth'
import { auditLog } from '../utils/audit'

const router = Router()
router.use(requireAuth)

router.post('/batch', (req: Request, res: Response) => {
  try {
    const { prefix = 'EL', debut = 1, quantite = 10 } = req.body
    const count = Math.min(Math.max(1, parseInt(quantite) || 10), 500)
    const start = Math.max(1, parseInt(debut) || 1)
    const p = prefix.toUpperCase().replace(/[^A-Z0-9_-]/g, '')

    const generated: { uid: string; numero: string }[] = []

    for (let i = 0; i < count; i++) {
      const num = start + i
      const uid = `${p}-${String(num).padStart(6, '0')}`

      const existing = dbGet('SELECT id FROM appareils WHERE uid_visible = ?', [uid])
      if (existing) continue

      const now = new Date().toISOString()
      const interne = `${uid}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      dbRun(
        `INSERT INTO appareils (uid_interne, uid_visible, type, marque, modele, statut, cree_le, modifie_le)
         VALUES (?, ?, 'etiquette', 'Pre-imprimee', 'Etiquette', 'disponible', ?, ?)`,
        [interne, uid, now, now]
      )
      generated.push({ uid, numero: uid })
    }

    auditLog({
      utilisateur_id: req.session.userId,
      module: 'etiquettes',
      action: 'generation_lot',
      nouvelle_valeur: JSON.stringify({ prefix: p, debut: start, quantite: count, generes: generated.length }),
      adresse_ip: req.ip,
    })

    res.json({ data: { prefix: p, debut: start, quantite: count, generes: generated.length, uids: generated.map(g => g.uid) } })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/disponibles', (_req: Request, res: Response) => {
  try {
    const rows = dbAll("SELECT id, uid_visible, cree_le FROM appareils WHERE statut = 'disponible' ORDER BY uid_visible ASC")
    res.json({ data: rows })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export { router as etiquettesRouter }
