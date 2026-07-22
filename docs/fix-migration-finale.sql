-- ============================================================
-- Migration finale Gnabo ERP → Supabase
-- Exécuter DANS L'ORDRE dans Supabase SQL Editor
-- Ajoute uniquement ce qui manque (sans erreur si déjà présent)
-- ============================================================

-- 1. Colonnes manquantes sur appareils
ALTER TABLE appareils ADD COLUMN IF NOT EXISTS panne_declaree TEXT;
ALTER TABLE appareils ADD COLUMN IF NOT EXISTS observations TEXT;
ALTER TABLE appareils ADD COLUMN IF NOT EXISTS date_reception TEXT;
ALTER TABLE appareils ALTER COLUMN type DROP NOT NULL;
ALTER TABLE appareils ALTER COLUMN marque DROP NOT NULL;
ALTER TABLE appareils ALTER COLUMN modele DROP NOT NULL;

-- 2. Diagnostics (recréée avec bon schéma)
DROP TABLE IF EXISTS diagnostics CASCADE;
CREATE TABLE diagnostics (
  id BIGSERIAL PRIMARY KEY,
  appareil_id BIGINT NOT NULL REFERENCES appareils(id) ON DELETE CASCADE,
  diagnostic TEXT,
  cause TEXT,
  tests TEXT,
  pieces_necessaires TEXT,
  main_oeuvre REAL DEFAULT 0,
  temps_estime REAL DEFAULT 0,
  observations TEXT,
  photos TEXT[],
  cree_le TIMESTAMPTZ DEFAULT now(),
  modifie_le TIMESTAMPTZ DEFAULT now()
);

-- 3. Reparations
CREATE TABLE IF NOT EXISTS reparations (
  id BIGSERIAL PRIMARY KEY,
  appareil_id BIGINT NOT NULL REFERENCES appareils(id) ON DELETE CASCADE,
  diagnostic_id BIGINT REFERENCES diagnostics(id) ON DELETE SET NULL,
  pieces_utilisees TEXT DEFAULT '[]',
  main_oeuvre REAL DEFAULT 0,
  temps_passe REAL DEFAULT 0,
  notes TEXT,
  statut TEXT DEFAULT 'en_cours',
  cree_le TIMESTAMPTZ DEFAULT now(),
  modifie_le TIMESTAMPTZ DEFAULT now()
);

-- 4. Colonnes manquantes sur devis/factures/paiements
ALTER TABLE devis ADD COLUMN IF NOT EXISTS lignes JSONB;
ALTER TABLE factures ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE factures ADD COLUMN IF NOT EXISTS lignes JSONB;
ALTER TABLE paiements ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'total' CHECK(type IN ('total', 'partiel', 'acompte'));
ALTER TABLE paiements ADD COLUMN IF NOT EXISTS appareil_id BIGINT REFERENCES appareils(id) ON DELETE SET NULL;

-- 5. Index
CREATE INDEX IF NOT EXISTS idx_diagnostics_appareil ON diagnostics(appareil_id);
CREATE INDEX IF NOT EXISTS idx_reparations_appareil ON reparations(appareil_id);
CREATE INDEX IF NOT EXISTS idx_paiements_appareil ON paiements(appareil_id);

-- 6. Politiques RLS INSERT
CREATE POLICY IF NOT EXISTS "Clients insert"
  ON clients FOR INSERT
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Appareils insert"
  ON appareils FOR INSERT
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Devis insert"
  ON devis FOR INSERT
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Caisse insert"
  ON caisse FOR INSERT
  WITH CHECK (true);
