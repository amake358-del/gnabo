-- Migration Supabase pour workflow Électronique v2
-- À exécuter dans Supabase SQL Editor
-- ===================================================

-- 1. client_id nullable (etiquettes pre-imprimees sans client)
ALTER TABLE appareils ALTER COLUMN client_id DROP NOT NULL;

-- 2. Nouvelles colonnes appareils
ALTER TABLE appareils ADD COLUMN IF NOT EXISTS couleur TEXT DEFAULT '';
ALTER TABLE appareils ADD COLUMN IF NOT EXISTS statut_detail TEXT DEFAULT '';
ALTER TABLE appareils ADD COLUMN IF NOT EXISTS signature_client TEXT;
ALTER TABLE appareils ADD COLUMN IF NOT EXISTS code_imei TEXT DEFAULT '';
ALTER TABLE appareils ADD COLUMN IF NOT EXISTS mot_de_passe TEXT DEFAULT '';
ALTER TABLE appareils ADD COLUMN IF NOT EXISTS categorie TEXT DEFAULT '';
ALTER TABLE appareils ADD COLUMN IF NOT EXISTS priorite TEXT DEFAULT 'normale';
ALTER TABLE appareils ADD COLUMN IF NOT EXISTS date_estimee TEXT;
ALTER TABLE appareils ADD COLUMN IF NOT EXISTS technicien TEXT DEFAULT '';
ALTER TABLE appareils ADD COLUMN IF NOT EXISTS garantie_jours INTEGER DEFAULT 0;
ALTER TABLE appareils ADD COLUMN IF NOT EXISTS panne_declaree TEXT DEFAULT '';
ALTER TABLE appareils ADD COLUMN IF NOT EXISTS observations TEXT DEFAULT '';
ALTER TABLE appareils ADD COLUMN IF NOT EXISTS date_reception TEXT;

-- 3. Mise à jour CHECK constraint statut (13 statuts workflow)
ALTER TABLE appareils DROP CONSTRAINT IF EXISTS appareils_statut_check;
ALTER TABLE appareils ADD CONSTRAINT appareils_statut_check
  CHECK (statut IN ('disponible','attribue','recu','diagnostic','validation_client','reparation_autorisee','attente_pieces','en_reparation','test','pret','livre','non_reparable','restitue','archive'));

-- 4. Table tests_techniques (grille de controle)
CREATE TABLE IF NOT EXISTS tests_techniques (
  id BIGSERIAL PRIMARY KEY,
  appareil_id BIGINT NOT NULL REFERENCES appareils(id) ON DELETE CASCADE,
  categorie TEXT NOT NULL,
  resultat TEXT NOT NULL DEFAULT 'non_test' CHECK(resultat IN ('ok','ko','non_test','na')),
  commentaire TEXT DEFAULT '',
  cree_le TIMESTAMPTZ DEFAULT now(),
  modifie_le TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tests_techniques_appareil ON tests_techniques(appareil_id);

-- 5. Table controles_techniques (session de test)
CREATE TABLE IF NOT EXISTS controles_techniques (
  id BIGSERIAL PRIMARY KEY,
  appareil_id BIGINT NOT NULL REFERENCES appareils(id) ON DELETE CASCADE,
  resultat_global TEXT DEFAULT 'en_cours' CHECK(resultat_global IN ('en_cours','ok','ko')),
  commentaire TEXT DEFAULT '',
  tests JSONB DEFAULT '[]',
  technicien TEXT DEFAULT '',
  cree_le TIMESTAMPTZ DEFAULT now(),
  modifie_le TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_controles_appareil ON controles_techniques(appareil_id);

-- 6. Index supplémentaires pour performances
CREATE INDEX IF NOT EXISTS idx_appareils_uid_visible ON appareils(uid_visible);
CREATE INDEX IF NOT EXISTS idx_appareils_uid_interne ON appareils(uid_interne);
CREATE INDEX IF NOT EXISTS idx_appareils_telephone ON appareils(client_id);
CREATE INDEX IF NOT EXISTS idx_appareils_marque ON appareils(marque);
CREATE INDEX IF NOT EXISTS idx_appareils_type ON appareils(type);
CREATE INDEX IF NOT EXISTS idx_appareils_cree_le ON appareils(cree_le);
CREATE INDEX IF NOT EXISTS idx_devis_appareil ON devis(appareil_id);
CREATE INDEX IF NOT EXISTS idx_factures_appareil ON factures(appareil_id);
CREATE INDEX IF NOT EXISTS idx_paiements_appareil ON paiements(appareil_id);

-- 7. Mettre à jour les enregistrements existants
UPDATE appareils SET statut = 'recu' WHERE statut = 'recu';
UPDATE appareils SET statut = 'pret' WHERE statut = 'pret';
UPDATE appareils SET statut = 'livre' WHERE statut = 'livre';
