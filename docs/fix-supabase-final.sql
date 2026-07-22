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

-- 4. Remplacer les politiques FOR ALL USING (entreprise_id = auth.uid()) 
--    sur les tables métier — le INSERT ne définit pas entreprise_id,
--    donc la condition entreprise_id = auth.uid() empêche de voir les nouvelles lignes.
--    On utilise auth.role() = 'authenticated' à la place.
DROP POLICY IF EXISTS "Les utilisateurs voient leurs données" ON clients;
DROP POLICY IF EXISTS "Clients insert" ON clients;
DROP POLICY IF EXISTS "Clients all" ON clients;
CREATE POLICY "Clients all" ON clients FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Les utilisateurs voient leurs appareils" ON appareils;
DROP POLICY IF EXISTS "Appareils insert" ON appareils;
DROP POLICY IF EXISTS "Appareils all" ON appareils;
CREATE POLICY "Appareils all" ON appareils FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Les utilisateurs voient leurs devis" ON devis;
DROP POLICY IF EXISTS "Devis insert" ON devis;
DROP POLICY IF EXISTS "Devis all" ON devis;
CREATE POLICY "Devis all" ON devis FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Factures insert" ON factures;
DROP POLICY IF EXISTS "Factures all" ON factures;
CREATE POLICY "Factures all" ON factures FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Interventions insert" ON interventions;
DROP POLICY IF EXISTS "Interventions all" ON interventions;
CREATE POLICY "Interventions all" ON interventions FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 5. Politiques pour catalog_types et catalog_modeles (utilisés par CataloguePage)
ALTER TABLE catalog_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Catalog types all" ON catalog_types;
CREATE POLICY "Catalog types all" ON catalog_types FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
ALTER TABLE catalog_modeles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Catalog modeles all" ON catalog_modeles;
CREATE POLICY "Catalog modeles all" ON catalog_modeles FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 6. Politiques pour toutes les autres tables (paiements, caisse, etc.)
ALTER TABLE paiements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Paiements all" ON paiements;
CREATE POLICY "Paiements all" ON paiements FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
ALTER TABLE caisse ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Caisse all" ON caisse;
CREATE POLICY "Caisse all" ON caisse FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
ALTER TABLE categories_stock ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Categories stock all" ON categories_stock;
CREATE POLICY "Categories stock all" ON categories_stock FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
ALTER TABLE articles_stock ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Articles stock all" ON articles_stock;
CREATE POLICY "Articles stock all" ON articles_stock FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
ALTER TABLE mouvements_stock ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Mouvements stock all" ON mouvements_stock;
CREATE POLICY "Mouvements stock all" ON mouvements_stock FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
ALTER TABLE garanties ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Garanties all" ON garanties;
CREATE POLICY "Garanties all" ON garanties FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Audit log all" ON audit_log;
CREATE POLICY "Audit log all" ON audit_log FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
ALTER TABLE devis_lignes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Devis lignes all" ON devis_lignes;
CREATE POLICY "Devis lignes all" ON devis_lignes FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- 7. Insérer les paramètres par défaut si la table est vide
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
