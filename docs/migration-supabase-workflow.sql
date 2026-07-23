-- Migration Supabase pour workflow Électronique v2
-- À exécuter dans Supabase SQL Editor

-- 1. client_id nullable (etiquettes pre-imprimees sans client)
ALTER TABLE appareils ALTER COLUMN client_id DROP NOT NULL;

-- 2. Nouvelles colonnes appareils
ALTER TABLE appareils ADD COLUMN IF NOT EXISTS couleur TEXT DEFAULT '';
ALTER TABLE appareils ADD COLUMN IF NOT EXISTS statut_detail TEXT DEFAULT '';
ALTER TABLE appareils ADD COLUMN IF NOT EXISTS signature_client TEXT;

-- 2. Mise à jour CHECK constraint statut (13 statuts workflow)
ALTER TABLE appareils DROP CONSTRAINT IF EXISTS appareils_statut_check;
ALTER TABLE appareils ADD CONSTRAINT appareils_statut_check
  CHECK (statut IN ('disponible','attribue','recu','diagnostic','validation_client','reparation_autorisee','attente_pieces','en_reparation','test','pret','livre','non_reparable','restitue','archive'));

-- 3. Mettre à jour les enregistrements existants (recu -> recu, les autres restent)
UPDATE appareils SET statut = 'recu' WHERE statut = 'recu';
UPDATE appareils SET statut = 'pret' WHERE statut = 'pret';
UPDATE appareils SET statut = 'livre' WHERE statut = 'livre';
