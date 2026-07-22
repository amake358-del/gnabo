-- Ajouter les colonnes manquantes pour les pages électronique
ALTER TABLE appareils ADD COLUMN IF NOT EXISTS panne_declaree TEXT;
ALTER TABLE appareils ADD COLUMN IF NOT EXISTS observations TEXT;
ALTER TABLE appareils ADD COLUMN IF NOT EXISTS date_reception TEXT;
ALTER TABLE appareils ALTER COLUMN type DROP NOT NULL;
ALTER TABLE appareils ALTER COLUMN marque DROP NOT NULL;
ALTER TABLE appareils ALTER COLUMN modele DROP NOT NULL;

-- Supprimer l'ancienne table diagnostics si elle existe avec l'ancien schéma
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

-- Table reparations
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

-- Ajouter colonnes aux tables existantes
ALTER TABLE devis ADD COLUMN IF NOT EXISTS lignes JSONB;
ALTER TABLE factures ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE factures ADD COLUMN IF NOT EXISTS lignes JSONB;
ALTER TABLE paiements ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'total' CHECK(type IN ('total', 'partiel', 'acompte'));
ALTER TABLE paiements ADD COLUMN IF NOT EXISTS appareil_id BIGINT REFERENCES appareils(id) ON DELETE SET NULL;

-- Index
CREATE INDEX IF NOT EXISTS idx_diagnostics_appareil ON diagnostics(appareil_id);
CREATE INDEX IF NOT EXISTS idx_reparations_appareil ON reparations(appareil_id);
CREATE INDEX IF NOT EXISTS idx_devis_electronique_appareil ON devis(appareil_id) WHERE service = 'electronique';
CREATE INDEX IF NOT EXISTS idx_paiements_appareil ON paiements(appareil_id);
