import { Router, Request, Response } from 'express'
import { getDb } from '../db'
import { requireAuth } from '../middleware/auth'

const router = Router()
router.use(requireAuth)

router.get('/', (_req: Request, res: Response) => {
  const db = getDb()
  const devis_count = (db.prepare('SELECT COUNT(*) as count FROM devis').get() as any).count
  const total_ca = (db.prepare("SELECT COALESCE(SUM(montant_ttc),0) as total FROM devis WHERE statut = 'accepte'").get() as any).total
  const devis_par_mois = db.prepare(`
    SELECT strftime('%Y-%m', cree_le) as mois, COUNT(*) as count, COALESCE(SUM(montant_ttc),0) as total
    FROM devis WHERE cree_le >= date('now','-12 months')
    GROUP BY mois ORDER BY mois
  `).all()
  const devis_recents = db.prepare(`
    SELECT d.*, c.nom || ' ' || COALESCE(c.prenom, '') as client_nom FROM devis d
    JOIN clients c ON d.client_id = c.id ORDER BY d.cree_le DESC LIMIT 5
  `).all()
  const devis_par_statut = db.prepare('SELECT statut, COUNT(*) as count FROM devis GROUP BY statut').all()
  const appareils_count = (db.prepare('SELECT COUNT(*) as count FROM appareils').get() as any).count
  const appareils_par_statut = db.prepare('SELECT statut, COUNT(*) as count FROM appareils GROUP BY statut').all()
  const factures_count = (db.prepare('SELECT COUNT(*) as count FROM factures').get() as any).count
  const factures_total = (db.prepare("SELECT COALESCE(SUM(montant_ttc),0) as total FROM factures WHERE statut = 'payee'").get() as any).total
  const paiements_total = (db.prepare('SELECT COALESCE(SUM(montant),0) as total FROM paiements').get() as any).total
  const activite_recente = db.prepare(`
    SELECT * FROM (
      SELECT 'devis' as type, d.id, d.numero as ref, d.statut, d.montant_ttc, d.cree_le, d.service as service_name
      FROM devis d
      UNION ALL
      SELECT 'facture' as type, f.id, f.numero as ref, f.statut, f.montant_ttc, f.cree_le, f.service as service_name
      FROM factures f
      UNION ALL
      SELECT 'paiement' as type, p.id, p.id as ref, p.mode as statut, p.montant as montant_ttc, p.cree_le, '' as service_name
      FROM paiements p
    ) ORDER BY cree_le DESC LIMIT 10
  `).all()
  res.json({
    data: {
      devis_count, total_ca, devis_par_mois, devis_recents, devis_par_statut,
      appareils_count, appareils_par_statut,
      factures_count, factures_total, paiements_total, activite_recente,
    },
  })
})

export { router as dashboardRouter }
