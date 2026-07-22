import { Router, Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { auditLog } from '../utils/audit'
import { requireAuth, requireRole } from '../middleware/auth'

const router = Router()
router.use(requireAuth)
router.use(requireRole('pdg'))

const backupsDir = path.join(__dirname, '../../data/backups')
if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true })

const upload = multer({ dest: path.join(__dirname, '../../data/tmp') })

router.get('/', (_req: Request, res: Response) => {
  const files = fs.readdirSync(backupsDir).filter(f => f.endsWith('.db')).map(f => {
    const stat = fs.statSync(path.join(backupsDir, f))
    return { filename: f, size: stat.size, created_at: stat.birthtime.toISOString() }
  }).sort((a, b) => b.created_at.localeCompare(a.created_at))
  res.json({ data: files })
})

router.post('/', (req: Request, res: Response) => {
  const date = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = path.join(backupsDir, `backup-${date}.db`)
  const dbPath = path.join(__dirname, '../../data/gnabo.db')
  if (!fs.existsSync(dbPath)) return res.status(400).json({ error: 'Base de données non trouvée' })
  fs.copyFileSync(dbPath, backupPath)
  const stat = fs.statSync(backupPath)
  auditLog({ utilisateur_id: req.session.userId, module: 'sauvegardes', action: 'creation', nouvelle_valeur: JSON.stringify({ filename: path.basename(backupPath) }), adresse_ip: req.ip })
  res.json({ data: { filename: path.basename(backupPath), size: stat.size, created_at: stat.birthtime.toISOString() }, message: 'Sauvegarde créée' })
})

router.post('/import', upload.single('file'), (req: Request, res: Response) => {
  const r = req as any
  if (!r.file) return res.status(400).json({ error: 'Fichier requis' })
  if (!r.file.originalname.endsWith('.db')) {
    fs.unlinkSync(r.file.path)
    return res.status(400).json({ error: 'Le fichier doit être une base SQLite (.db)' })
  }
  try {
    const dbPath = path.join(__dirname, '../../data/gnabo.db')
    const backupPath = path.join(backupsDir, `pre-import-${Date.now()}.db`)
    if (fs.existsSync(dbPath)) fs.copyFileSync(dbPath, backupPath)
    fs.copyFileSync(r.file.path, dbPath)
    fs.unlinkSync(r.file.path)
    auditLog({ utilisateur_id: req.session.userId, module: 'sauvegardes', action: 'import', nouvelle_valeur: JSON.stringify({ filename: r.file.originalname }), adresse_ip: req.ip })
    res.json({ message: 'Base de données importée avec succès' })
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erreur lors de l'import" })
  }
})

router.get('/export/:filename', (req: Request<{ filename: string }>, res: Response) => {
  const filePath = path.join(backupsDir, req.params.filename)
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Fichier non trouvé' })
  res.download(filePath)
})

router.delete('/:filename', (req: Request<{ filename: string }>, res: Response) => {
  const filePath = path.join(backupsDir, req.params.filename)
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Sauvegarde non trouvée' })
  fs.unlinkSync(filePath)
  auditLog({ utilisateur_id: req.session.userId, module: 'sauvegardes', action: 'suppression', nouvelle_valeur: JSON.stringify({ filename: req.params.filename }), adresse_ip: req.ip })
  res.json({ message: 'Sauvegarde supprimée' })
})

export { router as backupsRouter }
