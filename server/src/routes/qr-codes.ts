import { Router, Request, Response } from 'express'
import { getDb } from '../db'
import QRCode from 'qrcode'
import { requireAuth } from '../middleware/auth'

const router = Router()
router.use(requireAuth)

router.get('/:appareilId', async (req: Request, res: Response) => {
  const db = getDb()
  const app = db.prepare('SELECT * FROM appareils WHERE id = ?').get(req.params.appareilId) as any
  if (!app) return res.status(404).json({ error: 'Appareil non trouvé' })
  try {
    const qrDataUrl = await QRCode.toDataURL(app.uid_interne, { width: 300, margin: 2 })
    res.json({ data: { qr_code: qrDataUrl, contenu: app.uid_interne, uid_visible: app.uid_visible } })
  } catch {
    res.status(500).json({ error: 'Erreur génération QR Code' })
  }
})

router.get('/:appareilId/image', async (req: Request, res: Response) => {
  const db = getDb()
  const app = db.prepare('SELECT * FROM appareils WHERE id = ?').get(req.params.appareilId) as any
  if (!app) return res.status(404).json({ error: 'Appareil non trouvé' })
  try {
    const qrBuffer = await QRCode.toBuffer(app.uid_interne, { width: 300, margin: 2, type: 'png' })
    res.setHeader('Content-Type', 'image/png')
    res.send(qrBuffer)
  } catch {
    res.status(500).json({ error: 'Erreur génération QR Code' })
  }
})

export { router as qrCodesRouter }
