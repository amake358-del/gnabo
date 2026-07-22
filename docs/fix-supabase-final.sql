-- ============================================================
-- Fix final Gnabo ERP Supabase
-- Exécuter DANS L'ORDRE dans Supabase SQL Editor
-- ============================================================

-- 1. Créer un profil manuellement pour les utilisateurs existants
--    (le trigger ne s'exécute que pour les NOUVEAUX users)
INSERT INTO public.profiles (id, nom, role)
SELECT id, COALESCE(raw_user_meta_data->>'nom', 'Administrateur'), COALESCE(raw_user_meta_data->>'role', 'admin')
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 2. Politiques RLS pour profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles select" ON profiles;
DROP POLICY IF EXISTS "Profiles update" ON profiles;
CREATE POLICY "Profiles select" ON profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Profiles update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 3. Politiques RLS pour parametres
--    Approche : accès complet aux utilisateurs authentifiés
ALTER TABLE parametres ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Parametres all" ON parametres;
CREATE POLICY "Parametres all" ON parametres FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 4. Politiques INSERT manquantes sur les tables métier
--    Les FOR ALL USING existantes couvrent SELECT/DELETE mais pas INSERT
DROP POLICY IF EXISTS "Clients insert" ON clients;
CREATE POLICY "Clients insert" ON clients FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Appareils insert" ON appareils;
CREATE POLICY "Appareils insert" ON appareils FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Devis insert" ON devis;
CREATE POLICY "Devis insert" ON devis FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Factures insert" ON factures;
CREATE POLICY "Factures insert" ON factures FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Interventions insert" ON interventions;
CREATE POLICY "Interventions insert" ON interventions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 5. Insérer les paramètres par défaut si la table est vide
INSERT INTO parametres (cle, valeur)
SELECT * FROM (VALUES
  ('entreprise_nom', 'Gnabo Multi-Services'),
  ('devise', 'GNF'),
  ('adresse', ''),
  ('telephone', ''),
  ('email', ''),
  ('rccm', ''),
  ('conditions_devis', 'Paiement à la livraison. Garantie 30 jours.'),
  ('pied_page', 'Merci de votre confiance')
) AS t(cle, valeur)
WHERE NOT EXISTS (SELECT 1 FROM parametres LIMIT 1);
