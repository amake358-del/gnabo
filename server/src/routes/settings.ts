import { Router, Request, Response } from 'express'
import { getDb } from '../db'
import { auditLog } from '../utils/audit'
import { requireAuth, requireRoleAny } from '../middleware/auth'
import multer from 'multer'

const router = Router()

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

const DB_KEY_MAP: Record<string, string> = {
  company_name: 'entreprise_nom',
  slogan: 'entreprise_slogan',
  description: 'entreprise_description',
  rccm: 'entreprise_registre',
  nif: 'entreprise_nif',
  address: 'entreprise_adresse',
  city: 'entreprise_ville',
  country: 'entreprise_pays',
  phone: 'entreprise_telephone',
  phone2: 'entreprise_telephone2',
  email: 'entreprise_email',
  website: 'entreprise_site_web',
  signatory_name: 'signataire_nom',
  signatory_title: 'signataire_fonction',
  default_tva: 'tva_default',
  currency: 'devise',
  date_format: 'format_date',
  primary_color: 'couleur_principale',
  secondary_color: 'couleur_secondaire',
  conditions: 'conditions',
  footer_text: 'pied_de_page',
  logo_url: 'logo',
  favicon_url: 'favicon',
  signature_url: 'signature',
  cachet_url: 'cachet',
}

const CLIENT_KEY_MAP: Record<string, string> = {}
for (const [client, db] of Object.entries(DB_KEY_MAP)) {
  CLIENT_KEY_MAP[db] = client
}

function dbRowToCompanyConfig(rows: { cle: string; valeur: string }[]): Record<string, any> {
  const config: Record<string, any> = {}
  for (const r of rows) {
    const key = CLIENT_KEY_MAP[r.cle] || r.cle
    config[key] = r.valeur
  }
  return config
}

router.get('/', (_req: Request, res: Response) => {
  const db = getDb()
  const rows = db.all('SELECT cle, valeur FROM parametres')
  const raw: Record<string, string> = {}
  rows.forEach((r: any) => { raw[r.cle] = r.valeur })
  res.json({ data: raw })
})

router.get('/company', (_req: Request, res: Response) => {
  const db = getDb()
  const rows = db.all('SELECT cle, valeur FROM parametres')
  const config = dbRowToCompanyConfig(rows)
  res.json({ data: config })
})

router.use(requireAuth)
const adminOrPd = requireRoleAny('pdg', 'admin')

router.put('/company', adminOrPd, (req: Request, res: Response) => {
  const db = getDb()
  const body = req.body || {}
  for (const [clientKey, value] of Object.entries(body)) {
    if (value === undefined || value === null) continue
    const dbKey = DB_KEY_MAP[clientKey] || clientKey
    const old = db.prepare('SELECT valeur FROM parametres WHERE cle = ?').get(dbKey) as any
    db.prepare("INSERT INTO parametres (cle, valeur, modifie_le) VALUES (?,?,datetime('now')) ON CONFLICT(cle) DO UPDATE SET valeur=excluded.valeur, modifie_le=excluded.modifie_le").run(dbKey, String(value))
    auditLog({ utilisateur_id: req.session.userId, module: 'parametres', action: 'modification', ancienne_valeur: old?.valeur ?? null, nouvelle_valeur: String(value), adresse_ip: req.ip })
  }
  const rows = db.all('SELECT cle, valeur FROM parametres')
  const config = dbRowToCompanyConfig(rows)
  res.json({ message: 'Paramètres mis à jour', data: config })
})

router.put('/:key', adminOrPd, (req: Request, res: Response) => {
  const db = getDb()
  const old = db.prepare('SELECT valeur FROM parametres WHERE cle = ?').get(req.params.key) as any
  db.prepare("INSERT INTO parametres (cle, valeur, modifie_le) VALUES (?,?,datetime('now')) ON CONFLICT(cle) DO UPDATE SET valeur=excluded.valeur, modifie_le=excluded.modifie_le").run(req.params.key, req.body.value ?? '')
  auditLog({ utilisateur_id: req.session.userId, module: 'parametres', action: 'modification', ancienne_valeur: old?.valeur ?? null, nouvelle_valeur: req.body.value ?? '', adresse_ip: req.ip })
  res.json({ message: 'Paramètre mis à jour' })
})

function handleImageUpload(req: Request, res: Response, dbKey: string) {
  const db = getDb()
  const file = req.file
  if (!file) {
    res.status(400).json({ error: 'Aucun fichier fourni' })
    return
  }
  const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
  const old = db.prepare('SELECT valeur FROM parametres WHERE cle = ?').get(dbKey) as any
  db.prepare("INSERT INTO parametres (cle, valeur, modifie_le) VALUES (?,?,datetime('now')) ON CONFLICT(cle) DO UPDATE SET valeur=excluded.valeur, modifie_le=excluded.modifie_le").run(dbKey, base64)
  auditLog({ utilisateur_id: req.session.userId, module: 'parametres', action: 'upload_image', ancienne_valeur: old?.valeur ? 'image présente' : null, nouvelle_valeur: dbKey, adresse_ip: req.ip })
  res.json({ message: 'Image téléchargée', data: { url: base64 } })
}

router.post('/upload/logo', adminOrPd, upload.single('file'), (req: Request, res: Response) => handleImageUpload(req, res, 'logo'))
router.post('/upload/signature', adminOrPd, upload.single('file'), (req: Request, res: Response) => handleImageUpload(req, res, 'signature'))
router.post('/upload/cachet', adminOrPd, upload.single('file'), (req: Request, res: Response) => handleImageUpload(req, res, 'cachet'))

export { router as settingsRouter }
