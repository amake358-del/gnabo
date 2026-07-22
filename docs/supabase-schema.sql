-- Schéma PostgreSQL pour Gnabo ERP (Supabase)

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLE PROFILES (liée à auth.users de Supabase)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('pdg', 'admin')) DEFAULT 'admin',
  telephone TEXT,
  avatar_url TEXT,
  cree_le TIMESTAMPTZ DEFAULT now(),
  modifie_le TIMESTAMPTZ DEFAULT now()
);

-- Trigger : crée automatiquement un profil quand un utilisateur s'inscrit
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nom, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nom', 'Utilisateur'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'admin')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 3. TABLE CLIENTS
CREATE TABLE clients (
  id BIGSERIAL PRIMARY KEY,
  nom TEXT NOT NULL,
  prenom TEXT,
  telephone TEXT,
  telephone2 TEXT,
  email TEXT,
  adresse TEXT,
  ville TEXT,
  code_postal TEXT,
  notes TEXT,
  entreprise_id UUID REFERENCES profiles(id),
  cree_le TIMESTAMPTZ DEFAULT now(),
  modifie_le TIMESTAMPTZ DEFAULT now()
);

-- 4. TABLE APPAREILS
CREATE TABLE appareils (
  id BIGSERIAL PRIMARY KEY,
  uid_interne TEXT UNIQUE NOT NULL,
  uid_visible TEXT UNIQUE NOT NULL,
  client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  marque TEXT NOT NULL,
  modele TEXT NOT NULL,
  numero_serie TEXT,
  code_imei TEXT,
  mot_de_passe TEXT,
  accessoires TEXT,
  description_defaut TEXT,
  etat_esthetique TEXT,
  statut TEXT DEFAULT 'recu' CHECK(statut IN (
    'recu', 'diagnostic', 'attente_devis', 'devis_envoye',
    'en_reparation', 'pret', 'livre', 'non_recupere'
  )),
  qr_code_genere BOOLEAN DEFAULT false,
  etiquette_genere BOOLEAN DEFAULT false,
  photos TEXT[],
  entreprise_id UUID REFERENCES profiles(id),
  cree_le TIMESTAMPTZ DEFAULT now(),
  modifie_le TIMESTAMPTZ DEFAULT now()
);

-- 5. TABLE DIAGNOSTICS
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

-- 5b. TABLE REPARATIONS
CREATE TABLE reparations (
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

-- 6. TABLE DEVIS
CREATE TABLE devis (
  id BIGSERIAL PRIMARY KEY,
  numero TEXT UNIQUE NOT NULL,
  client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  service TEXT NOT NULL CHECK(service IN ('aluminium', 'metallique', 'electronique')),
  appareil_id BIGINT REFERENCES appareils(id) ON DELETE SET NULL,
  statut TEXT DEFAULT 'brouillon' CHECK(statut IN (
    'brouillon', 'envoye', 'accepte', 'refuse', 'expire'
  )),
  montant_ht REAL NOT NULL DEFAULT 0,
  tva REAL NOT NULL DEFAULT 0,
  montant_ttc REAL NOT NULL DEFAULT 0,
  acompte REAL DEFAULT 0,
  notes TEXT,
  lignes JSONB,
  valable_jusque TIMESTAMPTZ,
  entreprise_id UUID REFERENCES profiles(id),
  pdf_url TEXT,
  cree_le TIMESTAMPTZ DEFAULT now(),
  modifie_le TIMESTAMPTZ DEFAULT now()
);

-- 7. TABLE DEVIS_LIGNES
CREATE TABLE devis_lignes (
  id BIGSERIAL PRIMARY KEY,
  devis_id BIGINT NOT NULL REFERENCES devis(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantite INTEGER NOT NULL DEFAULT 1,
  prix_unitaire_ht REAL NOT NULL,
  tva REAL NOT NULL DEFAULT 0,
  total_ht REAL NOT NULL,
  largeur REAL,
  hauteur REAL,
  surface REAL
);

-- 8. TABLE FACTURES
CREATE TABLE factures (
  id BIGSERIAL PRIMARY KEY,
  numero TEXT UNIQUE NOT NULL,
  devis_id BIGINT REFERENCES devis(id) ON DELETE SET NULL,
  client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  service TEXT NOT NULL,
  montant_ht REAL NOT NULL,
  tva REAL NOT NULL,
  montant_ttc REAL NOT NULL,
  notes TEXT,
  lignes JSONB,
  statut TEXT DEFAULT 'impayee' CHECK(statut IN ('impayee', 'payee', 'avoir')),
  cree_le TIMESTAMPTZ DEFAULT now()
);

-- 9. TABLE PAIEMENTS
CREATE TABLE paiements (
  id BIGSERIAL PRIMARY KEY,
  facture_id BIGINT REFERENCES factures(id) ON DELETE SET NULL,
  client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  appareil_id BIGINT REFERENCES appareils(id) ON DELETE SET NULL,
  montant REAL NOT NULL,
  mode TEXT NOT NULL CHECK(mode IN ('especes', 'carte', 'cheque', 'virement', 'mobile_money')),
  type TEXT DEFAULT 'total' CHECK(type IN ('total', 'partiel', 'acompte')),
  reference TEXT,
  cree_le TIMESTAMPTZ DEFAULT now()
);

-- 10. TABLE GARANTIES
CREATE TABLE garanties (
  id BIGSERIAL PRIMARY KEY,
  appareil_id BIGINT NOT NULL REFERENCES appareils(id) ON DELETE CASCADE,
  duree_jours INTEGER NOT NULL,
  date_debut TIMESTAMPTZ NOT NULL,
  date_fin TIMESTAMPTZ NOT NULL,
  conditions TEXT,
  cree_le TIMESTAMPTZ DEFAULT now()
);

-- 11. TABLE CAISSE
CREATE TABLE caisse (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('encaissement', 'depense')),
  categorie TEXT NOT NULL,
  montant REAL NOT NULL,
  description TEXT,
  mode_paiement TEXT,
  utilisateur_id UUID REFERENCES profiles(id),
  cree_le TIMESTAMPTZ DEFAULT now()
);

-- 12. TABLE CATEGORIES_STOCK
CREATE TABLE categories_stock (
  id BIGSERIAL PRIMARY KEY,
  nom TEXT NOT NULL,
  service TEXT NOT NULL CHECK(service IN ('aluminium', 'metallique', 'electronique', 'tous'))
);

-- 13. TABLE ARTICLES_STOCK
CREATE TABLE articles_stock (
  id BIGSERIAL PRIMARY KEY,
  categorie_id BIGINT NOT NULL REFERENCES categories_stock(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  reference TEXT,
  quantite INTEGER NOT NULL DEFAULT 0,
  seuil_alerte INTEGER DEFAULT 5,
  prix_unitaire REAL,
  fournisseur TEXT,
  cree_le TIMESTAMPTZ DEFAULT now(),
  modifie_le TIMESTAMPTZ DEFAULT now()
);

-- 14. TABLE MOUVEMENTS_STOCK
CREATE TABLE mouvements_stock (
  id BIGSERIAL PRIMARY KEY,
  article_id BIGINT NOT NULL REFERENCES articles_stock(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK(type IN ('entree', 'sortie')),
  quantite INTEGER NOT NULL,
  reference TEXT,
  notes TEXT,
  utilisateur_id UUID REFERENCES profiles(id),
  cree_le TIMESTAMPTZ DEFAULT now()
);

-- 15. TABLE INTERVENTIONS
CREATE TABLE interventions (
  id BIGSERIAL PRIMARY KEY,
  devis_id BIGINT REFERENCES devis(id) ON DELETE SET NULL,
  client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  service TEXT NOT NULL,
  technicien TEXT,
  equipe TEXT,
  date_prevue TIMESTAMPTZ,
  heure_prevue TEXT,
  adresse_intervention TEXT,
  statut TEXT DEFAULT 'planifiee' CHECK(statut IN (
    'planifiee', 'en_cours', 'terminee', 'annulee'
  )),
  photos_avant TEXT[],
  photos_apres TEXT[],
  compte_rendu TEXT,
  signature_client TEXT,
  cree_le TIMESTAMPTZ DEFAULT now()
);

-- 16. TABLE AUDIT_LOG
CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  utilisateur_id UUID REFERENCES profiles(id),
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  ancienne_valeur JSONB,
  nouvelle_valeur JSONB,
  adresse_ip TEXT,
  cree_le TIMESTAMPTZ DEFAULT now()
);

-- 17. TABLE PARAMETRES (entreprise config)
CREATE TABLE parametres (
  id BIGSERIAL PRIMARY KEY,
  cle TEXT UNIQUE NOT NULL,
  valeur TEXT NOT NULL,
  entreprise_id UUID REFERENCES profiles(id),
  modifie_le TIMESTAMPTZ DEFAULT now()
);

-- 18. TABLE NOTIFICATIONS
CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT DEFAULT '',
  link TEXT,
  read BOOLEAN DEFAULT false,
  cree_le TIMESTAMPTZ DEFAULT now()
);

-- 19. TABLE CATALOG_TYPES
CREATE TABLE catalog_types (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  cree_le TIMESTAMPTZ DEFAULT now()
);

-- 20. TABLE CATALOG_MODELES
CREATE TABLE catalog_modeles (
  id BIGSERIAL PRIMARY KEY,
  type_id BIGINT NOT NULL REFERENCES catalog_types(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  prix REAL DEFAULT 0,
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'actif',
  cree_le TIMESTAMPTZ DEFAULT now(),
  modifie_le TIMESTAMPTZ DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_appareils_client ON appareils(client_id);
CREATE INDEX idx_appareils_statut ON appareils(statut);
CREATE INDEX idx_devis_client ON devis(client_id);
CREATE INDEX idx_devis_service ON devis(service);
CREATE INDEX idx_factures_client ON factures(client_id);
CREATE INDEX idx_paiements_facture ON paiements(facture_id);
CREATE INDEX idx_caisse_date ON caisse(cree_le);
CREATE INDEX idx_mouvements_article ON mouvements_stock(article_id);
CREATE INDEX idx_interventions_date ON interventions(date_prevue);
CREATE INDEX idx_audit_module ON audit_log(module);
CREATE INDEX idx_audit_date ON audit_log(cree_le);

-- ROW LEVEL SECURITY (RLS)
-- Chaque entreprise ne voit que ses propres données

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appareils ENABLE ROW LEVEL SECURITY;
ALTER TABLE devis ENABLE ROW LEVEL SECURITY;
ALTER TABLE factures ENABLE ROW LEVEL SECURITY;
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les utilisateurs voient leurs données"
  ON clients FOR ALL
  USING (entreprise_id = auth.uid());

CREATE POLICY "Les utilisateurs voient leurs appareils"
  ON appareils FOR ALL
  USING (entreprise_id = auth.uid());

CREATE POLICY "Les utilisateurs voient leurs devis"
  ON devis FOR ALL
  USING (entreprise_id = auth.uid());

-- SEED : utilisateurs par défaut
-- À faire via Supabase Auth UI (Authentication > Users > Add User)
-- Puis les profils sont créés automatiquement par le trigger

-- Insérer les paramètres par défaut
INSERT INTO parametres (cle, valeur) VALUES
  ('entreprise_nom', 'Gnabo Multi-Services'),
  ('devise', 'GNF'),
  ('adresse', ''),
  ('telephone', ''),
  ('email', ''),
  ('rccm', ''),
  ('conditions_devis', 'Paiement à la livraison. Garantie 30 jours.'),
  ('pied_page', 'Merci de votre confiance');
