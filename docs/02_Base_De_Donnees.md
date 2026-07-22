# Base de Données

## Schéma général

```sql
-- =============================================
-- UTILISATEURS & AUTH
-- =============================================
CREATE TABLE utilisateurs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  mot_de_passe_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('pdg', 'admin')),
  actif INTEGER DEFAULT 1,
  cree_le TEXT DEFAULT (datetime('now')),
  modifie_le TEXT DEFAULT (datetime('now'))
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  utilisateur_id INTEGER NOT NULL REFERENCES utilisateurs(id),
  expire_le TEXT NOT NULL
);

-- =============================================
-- CLIENTS
-- =============================================
CREATE TABLE clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  prenom TEXT,
  telephone TEXT,
  telephone2 TEXT,
  email TEXT,
  adresse TEXT,
  ville TEXT,
  code_postal TEXT,
  notes TEXT,
  cree_le TEXT DEFAULT (datetime('now')),
  modifie_le TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- APPAREILS (Module Électronique)
-- =============================================
CREATE TABLE appareils (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uid_interne TEXT UNIQUE NOT NULL,   -- 8 caractères hex (ex: 8A7F2C91)
  uid_visible TEXT UNIQUE NOT NULL,   -- EL-000001
  client_id INTEGER NOT NULL REFERENCES clients(id),
  type TEXT NOT NULL,                 -- smartphone, tablette, pc, console, autre
  marque TEXT NOT NULL,
  modele TEXT NOT NULL,
  numero_serie TEXT,
  code_imei TEXT,
  mot_de_passe TEXT,
  accessoires TEXT,                   -- JSON : chargeur, écouteurs, coque...
  description_defaut TEXT,
  etat_esthetique TEXT,               -- Neuf, Bon, Moyen, Mauvais
  statut TEXT DEFAULT 'recu' CHECK(statut IN (
    'recu', 'diagnostic', 'attente_devis', 'devis_envoye',
    'en_reparation', 'pret', 'livre', 'non_recupere'
  )),
  QR_code_genere INTEGER DEFAULT 0,
  etiquette_genere INTEGER DEFAULT 0,
  cree_le TEXT DEFAULT (datetime('now')),
  modifie_le TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- DIAGNOSTICS
-- =============================================
CREATE TABLE diagnostics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  appareil_id INTEGER NOT NULL REFERENCES appareils(id),
  description TEXT NOT NULL,
  pieces_necessaires TEXT,            -- JSON
  cout_estime REAL,
  duree_estimee INTEGER,             -- minutes
  technicien TEXT,
  cree_le TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- DEVIS (multi-services)
-- =============================================
CREATE TABLE devis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero TEXT UNIQUE NOT NULL,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  service TEXT NOT NULL CHECK(service IN ('aluminium', 'metallique', 'electronique')),
  appareil_id INTEGER REFERENCES appareils(id),  -- NULL pour Alu/Métal
  statut TEXT DEFAULT 'brouillon' CHECK(statut IN (
    'brouillon', 'envoye', 'accepte', 'refuse', 'expire'
  )),
  montant_ht REAL NOT NULL DEFAULT 0,
  tva REAL NOT NULL DEFAULT 0,
  montant_ttc REAL NOT NULL DEFAULT 0,
  acompte REAL DEFAULT 0,
  notes TEXT,
  valable_jusque TEXT,
  cree_le TEXT DEFAULT (datetime('now')),
  modifie_le TEXT DEFAULT (datetime('now'))
);

CREATE TABLE devis_lignes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  devis_id INTEGER NOT NULL REFERENCES devis(id),
  description TEXT NOT NULL,
  quantite INTEGER NOT NULL DEFAULT 1,
  prix_unitaire_ht REAL NOT NULL,
  tva REAL NOT NULL DEFAULT 0,
  total_ht REAL NOT NULL
);

-- =============================================
-- FACTURES
-- =============================================
CREATE TABLE factures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero TEXT UNIQUE NOT NULL,
  devis_id INTEGER REFERENCES devis(id),
  client_id INTEGER NOT NULL REFERENCES clients(id),
  service TEXT NOT NULL,
  montant_ht REAL NOT NULL,
  tva REAL NOT NULL,
  montant_ttc REAL NOT NULL,
  statut TEXT DEFAULT 'impayee' CHECK(statut IN ('impayee', 'payee', 'avoir')),
  cree_le TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- PAIEMENTS
-- =============================================
CREATE TABLE paiements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  facture_id INTEGER REFERENCES factures(id),
  client_id INTEGER NOT NULL REFERENCES clients(id),
  montant REAL NOT NULL,
  mode TEXT NOT NULL CHECK(mode IN ('especes', 'carte', 'cheque', 'virement', 'mobile_money')),
  reference TEXT,
  cree_le TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- GARANTIE
-- =============================================
CREATE TABLE garanties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  appareil_id INTEGER NOT NULL REFERENCES appareils(id),
  duree_jours INTEGER NOT NULL,       -- 30, 90, 180
  date_debut TEXT NOT NULL,
  date_fin TEXT NOT NULL,
  conditions TEXT,
  cree_le TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- CAISSE
-- =============================================
CREATE TABLE caisse (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('encaissement', 'depense')),
  categorie TEXT NOT NULL,
  montant REAL NOT NULL,
  description TEXT,
  mode_paiement TEXT,
  utilisateur_id INTEGER REFERENCES utilisateurs(id),
  cree_le TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- STOCKS
-- =============================================
CREATE TABLE categories_stock (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  service TEXT NOT NULL CHECK(service IN ('aluminium', 'metallique', 'electronique', 'tous'))
);

CREATE TABLE articles_stock (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  categorie_id INTEGER NOT NULL REFERENCES categories_stock(id),
  nom TEXT NOT NULL,
  reference TEXT,
  quantite INTEGER NOT NULL DEFAULT 0,
  seuil_alerte INTEGER DEFAULT 5,
  prix_unitaire REAL,
  fournisseur TEXT,
  cree_le TEXT DEFAULT (datetime('now')),
  modifie_le TEXT DEFAULT (datetime('now'))
);

CREATE TABLE mouvements_stock (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  article_id INTEGER NOT NULL REFERENCES articles_stock(id),
  type TEXT NOT NULL CHECK(type IN ('entree', 'sortie')),
  quantite INTEGER NOT NULL,
  reference TEXT,                     -- numéro de devis/facture associé
  notes TEXT,
  utilisateur_id INTEGER REFERENCES utilisateurs(id),
  cree_le TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- INTERVENTIONS / PLANNING
-- =============================================
CREATE TABLE interventions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  devis_id INTEGER REFERENCES devis(id),
  client_id INTEGER NOT NULL REFERENCES clients(id),
  service TEXT NOT NULL,
  technicien TEXT,
  equipe TEXT,
  date_prevue TEXT,
  heure_prevue TEXT,
  adresse_intervention TEXT,
  statut TEXT DEFAULT 'planifiee' CHECK(statut IN (
    'planifiee', 'en_cours', 'terminee', 'annulee'
  )),
  photos_avant TEXT,                  -- JSON
  photos_apres TEXT,                  -- JSON
  compte_rendu TEXT,
  signature_client TEXT,              -- Base64 ou chemin
  cree_le TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- AUDIT LOG
-- =============================================
CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  utilisateur_id INTEGER REFERENCES utilisateurs(id),
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  ancienne_valeur TEXT,               -- JSON
  nouvelle_valeur TEXT,               -- JSON
  adresse_ip TEXT,
  cree_le TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- PARAMÈTRES
-- =============================================
CREATE TABLE parametres (
  cle TEXT PRIMARY KEY,
  valeur TEXT NOT NULL,
  modifie_le TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- INDEX
-- =============================================
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
```

## Relations

- **Client** → Appareils (1:N)
- **Client** → Devis (1:N)
- **Devis** → Lignes (1:N)
- **Devis** → Facture (1:1)
- **Facture** → Paiements (1:N)
- **Appareil** → Diagnostic (1:N)
- **Appareil** → Garantie (1:1)
- **Catégorie stock** → Articles (1:N)
- **Article stock** → Mouvements (1:N)
- **Utilisateur** → Audit Log (1:N)

## Audit Log

Chaque action critique enregistre :

- Date/heure précise
- Utilisateur (PDG ou Admin)
- Module concerné (devis, stock, caisse, etc.)
- Action (création, modification, suppression)
- Ancienne et nouvelle valeur (format JSON)
- Adresse IP (quand disponible)
