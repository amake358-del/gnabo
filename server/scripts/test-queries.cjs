const Database = require('better-sqlite3');
const db = Database('data/devis.db');

// Test ca_par_service
try {
  const r = db.prepare(`SELECT e.name as service_name, e.slug,
    (SELECT COUNT(*) FROM devis d WHERE d.entreprise_id = e.id) as devis_count,
    (SELECT COALESCE(SUM(total_ttc),0) FROM devis WHERE entreprise_id = e.id AND statut = 'accepte') as ca_devis,
    (SELECT COALESCE(SUM(total_ttc),0) FROM factures_electronique f WHERE f.service_id = e.id AND statut = 'payee') as ca_factures,
    (SELECT COUNT(*) FROM appareils a WHERE a.service_id = e.id) as appareils_count
    FROM entreprises e ORDER BY e.service_order`).all();
  console.log('ca_par_service OK:', JSON.stringify(r));
} catch (e) { console.log('ca_par_service ERROR:', e.message); }

// Test activity query
try {
  const r = db.prepare(`SELECT 'devis' as type, d.id, d.numero as ref, d.statut, d.total_ttc, d.created_at, e.name as service_name
    FROM devis d JOIN entreprises e ON d.entreprise_id = e.id
    UNION ALL
    SELECT 'facture' as type, f.id, f.numero as ref, f.statut, f.total_ttc, f.created_at, e.name as service_name
    FROM factures_electronique f JOIN entreprises e ON f.service_id = e.id
    UNION ALL
    SELECT 'paiement' as type, p.id, p.id as ref, p.type as statut, p.montant as total_ttc, p.created_at, e.name as service_name
    FROM paiements_electronique p JOIN entreprises e ON p.service_id = e.id
    ORDER BY created_at DESC LIMIT 10`).all();
  console.log('activity OK:', r.length);
} catch (e) { console.log('activity ERROR:', e.message); }

db.close();
