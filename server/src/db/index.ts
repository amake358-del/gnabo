import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB_DIR = path.join(__dirname, '..', '..', 'data');
const DB_PATH = path.join(DB_DIR, 'gnabo.db');

let db: any;

function saveDb(): void {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

class Statement {
  private stmt: any;
  private sql: string;
  constructor(sql: string) {
    this.sql = sql;
  }
  private getStmt(): any {
    if (this.stmt) this.stmt.free();
    this.stmt = db.prepare(this.sql);
    return this.stmt;
  }
  run(...params: any[]): { changes: number; lastInsertRowid: number } {
    const s = this.getStmt();
    if (params.length > 0) s.bind(params);
    s.step();
    s.free();
    this.stmt = null;
    saveDb();
    const lastId = db.exec('SELECT last_insert_rowid() as id');
    const ch = db.exec('SELECT changes() as c');
    return {
      changes: ch[0]?.values[0]?.[0] ?? 0,
      lastInsertRowid: lastId[0]?.values[0]?.[0] ?? 0,
    };
  }
  get(...params: any[]): any | undefined {
    const s = this.getStmt();
    if (params.length > 0) s.bind(params);
    const row = s.step() ? s.getAsObject() : undefined;
    s.free();
    this.stmt = null;
    return row;
  }
  all(...params: any[]): any[] {
    const s = this.getStmt();
    if (params.length > 0) s.bind(params);
    const rows: any[] = [];
    while (s.step()) rows.push(s.getAsObject());
    s.free();
    this.stmt = null;
    return rows;
  }
}

const dbApi = {
  prepare: (sql: string) => new Statement(sql),
  run: (sql: string, params: any[] = []) => new Statement(sql).run(...params),
  get: (sql: string, params: any[] = []) => new Statement(sql).get(...params),
  all: (sql: string, params: any[] = []) => new Statement(sql).all(...params),
  exec: (sql: string) => { db.run(sql); saveDb(); },
};

export function getDb() { return dbApi; }
export function dbAll(sql: string, params: any[] = []) { return dbApi.all(sql, params); }
export function dbGet(sql: string, params: any[] = []) { return dbApi.get(sql, params); }
export function dbRun(sql: string, params: any[] = []) { return dbApi.run(sql, params); }
export function dbExec(sql: string) { dbApi.exec(sql); }

export function initDb(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      if (db) { resolve(); return; }
      if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

      initSqlJs().then(SQL => {
        if (fs.existsSync(DB_PATH)) {
          const buffer = fs.readFileSync(DB_PATH);
          db = new SQL.Database(buffer);
        } else {
          db = new SQL.Database();
        }

        db.run('PRAGMA foreign_keys = ON');
        db.run('PRAGMA journal_mode = WAL');

        db.run(`
          CREATE TABLE IF NOT EXISTS utilisateurs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            mot_de_passe_hash TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('pdg', 'admin')),
            actif INTEGER DEFAULT 1,
            cree_le TEXT DEFAULT (datetime('now')),
            modifie_le TEXT DEFAULT (datetime('now'))
          );

          CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            utilisateur_id INTEGER NOT NULL REFERENCES utilisateurs(id),
            expire_le TEXT NOT NULL
          );

          CREATE TABLE IF NOT EXISTS clients (
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

          CREATE TABLE IF NOT EXISTS appareils (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uid_interne TEXT UNIQUE NOT NULL,
            uid_visible TEXT UNIQUE NOT NULL,
            client_id INTEGER NOT NULL REFERENCES clients(id),
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
            QR_code_genere INTEGER DEFAULT 0,
            etiquette_genere INTEGER DEFAULT 0,
            photos TEXT,
            cree_le TEXT DEFAULT (datetime('now')),
            modifie_le TEXT DEFAULT (datetime('now'))
          );

          CREATE TABLE IF NOT EXISTS diagnostics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            appareil_id INTEGER NOT NULL REFERENCES appareils(id),
            description TEXT NOT NULL,
            pieces_necessaires TEXT,
            cout_estime REAL,
            duree_estimee INTEGER,
            technicien TEXT,
            cree_le TEXT DEFAULT (datetime('now'))
          );

          CREATE TABLE IF NOT EXISTS devis (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            numero TEXT UNIQUE NOT NULL,
            client_id INTEGER NOT NULL REFERENCES clients(id),
            service TEXT NOT NULL CHECK(service IN ('aluminium', 'metallique', 'electronique')),
            appareil_id INTEGER REFERENCES appareils(id),
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

          CREATE TABLE IF NOT EXISTS devis_lignes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            devis_id INTEGER NOT NULL REFERENCES devis(id),
            description TEXT NOT NULL,
            quantite INTEGER NOT NULL DEFAULT 1,
            prix_unitaire_ht REAL NOT NULL,
            tva REAL NOT NULL DEFAULT 0,
            total_ht REAL NOT NULL,
            largeur REAL,
            hauteur REAL,
            surface REAL
          );

          CREATE TABLE IF NOT EXISTS factures (
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

          CREATE TABLE IF NOT EXISTS paiements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            facture_id INTEGER REFERENCES factures(id),
            client_id INTEGER NOT NULL REFERENCES clients(id),
            montant REAL NOT NULL,
            mode TEXT NOT NULL CHECK(mode IN ('especes', 'carte', 'cheque', 'virement', 'mobile_money')),
            reference TEXT,
            cree_le TEXT DEFAULT (datetime('now'))
          );

          CREATE TABLE IF NOT EXISTS garanties (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            appareil_id INTEGER NOT NULL REFERENCES appareils(id),
            duree_jours INTEGER NOT NULL,
            date_debut TEXT NOT NULL,
            date_fin TEXT NOT NULL,
            conditions TEXT,
            cree_le TEXT DEFAULT (datetime('now'))
          );

          CREATE TABLE IF NOT EXISTS caisse (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL CHECK(type IN ('encaissement', 'depense')),
            categorie TEXT NOT NULL,
            montant REAL NOT NULL,
            description TEXT,
            mode_paiement TEXT,
            utilisateur_id INTEGER REFERENCES utilisateurs(id),
            cree_le TEXT DEFAULT (datetime('now'))
          );

          CREATE TABLE IF NOT EXISTS categories_stock (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            service TEXT NOT NULL CHECK(service IN ('aluminium', 'metallique', 'electronique', 'tous'))
          );

          CREATE TABLE IF NOT EXISTS articles_stock (
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

          CREATE TABLE IF NOT EXISTS mouvements_stock (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            article_id INTEGER NOT NULL REFERENCES articles_stock(id),
            type TEXT NOT NULL CHECK(type IN ('entree', 'sortie')),
            quantite INTEGER NOT NULL,
            reference TEXT,
            notes TEXT,
            utilisateur_id INTEGER REFERENCES utilisateurs(id),
            cree_le TEXT DEFAULT (datetime('now'))
          );

          CREATE TABLE IF NOT EXISTS interventions (
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
            photos_avant TEXT,
            photos_apres TEXT,
            compte_rendu TEXT,
            signature_client TEXT,
            cree_le TEXT DEFAULT (datetime('now'))
          );

          CREATE TABLE IF NOT EXISTS audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            utilisateur_id INTEGER REFERENCES utilisateurs(id),
            module TEXT NOT NULL,
            action TEXT NOT NULL,
            ancienne_valeur TEXT,
            nouvelle_valeur TEXT,
            adresse_ip TEXT,
            cree_le TEXT DEFAULT (datetime('now'))
          );

          CREATE TABLE IF NOT EXISTS parametres (
            cle TEXT PRIMARY KEY,
            valeur TEXT NOT NULL,
            modifie_le TEXT DEFAULT (datetime('now'))
          );

          CREATE INDEX IF NOT EXISTS idx_appareils_client ON appareils(client_id);
          CREATE INDEX IF NOT EXISTS idx_appareils_statut ON appareils(statut);
          CREATE INDEX IF NOT EXISTS idx_devis_client ON devis(client_id);
          CREATE INDEX IF NOT EXISTS idx_devis_service ON devis(service);
          CREATE INDEX IF NOT EXISTS idx_factures_client ON factures(client_id);
          CREATE INDEX IF NOT EXISTS idx_paiements_facture ON paiements(facture_id);
          CREATE INDEX IF NOT EXISTS idx_caisse_date ON caisse(cree_le);
          CREATE INDEX IF NOT EXISTS idx_mouvements_article ON mouvements_stock(article_id);
          CREATE INDEX IF NOT EXISTS idx_interventions_date ON interventions(date_prevue);
          CREATE INDEX IF NOT EXISTS idx_audit_module ON audit_log(module);
          CREATE INDEX IF NOT EXISTS idx_audit_date ON audit_log(cree_le);

          CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL DEFAULT 'info',
            title TEXT NOT NULL,
            message TEXT DEFAULT '',
            link TEXT,
            read INTEGER DEFAULT 0,
            cree_le TEXT DEFAULT (datetime('now'))
          );

          CREATE TABLE IF NOT EXISTS catalog_types (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT DEFAULT '',
            cree_le TEXT DEFAULT (datetime('now'))
          );

          CREATE TABLE IF NOT EXISTS catalog_modeles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type_id INTEGER NOT NULL REFERENCES catalog_types(id),
            name TEXT NOT NULL,
            prix REAL DEFAULT 0,
            description TEXT DEFAULT '',
            status TEXT DEFAULT 'actif',
            cree_le TEXT DEFAULT (datetime('now')),
            modifie_le TEXT DEFAULT (datetime('now'))
          );
        `);

        saveDb();
        runMigrations();
        seedIfEmpty();
        resolve();
      }).catch(reject);
    } catch (err) {
      reject(err);
    }
  });
}

function migrateAppareilsStatut(): void {
  try { db.run("ALTER TABLE appareils ADD COLUMN signature_client TEXT DEFAULT ''"); } catch (_) {}
  try {
    db.run("UPDATE appareils SET statut = 'disponible' WHERE id = -1");
  } catch (_) {
    db.exec('PRAGMA ignore_check_constraints = ON');
    const data = db.prepare('SELECT * FROM appareils').all();
    const cols = ['id','uid_interne','uid_visible','client_id','type','marque','modele','numero_serie','code_imei','mot_de_passe','accessoires','description_defaut','etat_esthetique','statut','QR_code_genere','etiquette_genere','photos','cree_le','modifie_le','couleur','statut_detail','signature_client'];
    db.run('DROP TABLE IF EXISTS appareils_mig');
    db.run(`CREATE TABLE appareils_mig (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uid_interne TEXT UNIQUE NOT NULL,
      uid_visible TEXT UNIQUE NOT NULL,
      client_id INTEGER REFERENCES clients(id),
      type TEXT NOT NULL,
      marque TEXT NOT NULL,
      modele TEXT NOT NULL,
      numero_serie TEXT,
      code_imei TEXT,
      mot_de_passe TEXT,
      accessoires TEXT,
      description_defaut TEXT,
      etat_esthetique TEXT,
      couleur TEXT DEFAULT '',
      statut_detail TEXT DEFAULT '',
      signature_client TEXT DEFAULT '',
      statut TEXT DEFAULT 'disponible' CHECK(statut IN ('disponible','attribue','recu','diagnostic','validation_client','reparation_autorisee','attente_pieces','en_reparation','test','pret','livre','non_reparable','restitue','archive')),
      QR_code_genere INTEGER DEFAULT 0,
      etiquette_genere INTEGER DEFAULT 0,
      photos TEXT,
      cree_le TEXT DEFAULT (datetime('now')),
      modifie_le TEXT DEFAULT (datetime('now'))
    )`);
    for (const row of data) {
      const vals = cols.map(c => (row as any)[c] ?? null)
      const placeholders = cols.map(() => '?').join(',')
      db.prepare(`INSERT INTO appareils_mig (${cols.join(',')}) VALUES (${placeholders})`).run(...vals)
    }
    db.run('DROP TABLE appareils');
    db.run('ALTER TABLE appareils_mig RENAME TO appareils');
    db.run('CREATE INDEX IF NOT EXISTS idx_appareils_client ON appareils(client_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_appareils_statut ON appareils(statut)');
    db.exec('PRAGMA ignore_check_constraints = OFF');
  }
}

function migrateClientIdNullable(): void {
  try {
    db.run("INSERT INTO appareils (uid_interne, uid_visible, type, marque, modele, statut) VALUES ('_test_null_client', '_test_null_client', 'test', 'test', 'test', 'disponible')");
    db.run("DELETE FROM appareils WHERE uid_interne = '_test_null_client'");
  } catch (_) {
    const data = db.prepare('SELECT * FROM appareils').all();
    const cols = ['id','uid_interne','uid_visible','client_id','type','marque','modele','numero_serie','code_imei','mot_de_passe','accessoires','description_defaut','etat_esthetique','statut','QR_code_genere','etiquette_genere','photos','cree_le','modifie_le','couleur','statut_detail','signature_client'];
    db.run('DROP TABLE IF EXISTS appareils_mig2');
    db.run(`CREATE TABLE appareils_mig2 (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uid_interne TEXT UNIQUE NOT NULL,
      uid_visible TEXT UNIQUE NOT NULL,
      client_id INTEGER REFERENCES clients(id),
      type TEXT NOT NULL,
      marque TEXT NOT NULL,
      modele TEXT NOT NULL,
      numero_serie TEXT,
      code_imei TEXT,
      mot_de_passe TEXT,
      accessoires TEXT,
      description_defaut TEXT,
      etat_esthetique TEXT,
      couleur TEXT DEFAULT '',
      statut_detail TEXT DEFAULT '',
      signature_client TEXT DEFAULT '',
      statut TEXT DEFAULT 'disponible' CHECK(statut IN ('disponible','attribue','recu','diagnostic','validation_client','reparation_autorisee','attente_pieces','en_reparation','test','pret','livre','non_reparable','restitue','archive')),
      QR_code_genere INTEGER DEFAULT 0,
      etiquette_genere INTEGER DEFAULT 0,
      photos TEXT,
      cree_le TEXT DEFAULT (datetime('now')),
      modifie_le TEXT DEFAULT (datetime('now'))
    )`);
    for (const row of data) {
      const vals = cols.map(c => (row as any)[c] ?? null)
      const placeholders = cols.map(() => '?').join(',')
      db.prepare(`INSERT INTO appareils_mig2 (${cols.join(',')}) VALUES (${placeholders})`).run(...vals)
    }
    db.run('DROP TABLE appareils');
    db.run('ALTER TABLE appareils_mig2 RENAME TO appareils');
    db.run('CREATE INDEX IF NOT EXISTS idx_appareils_client ON appareils(client_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_appareils_statut ON appareils(statut)');
  }
}

function runMigrations(): void {
  try { db.run('ALTER TABLE utilisateurs ADD COLUMN tentatives_echouees INTEGER DEFAULT 0'); } catch (_) {}
  try { db.run('ALTER TABLE utilisateurs ADD COLUMN verrouille_jusque TEXT'); } catch (_) {}
  try { db.run("ALTER TABLE appareils ADD COLUMN couleur TEXT DEFAULT ''"); } catch (_) {}
  try { db.run("ALTER TABLE appareils ADD COLUMN statut_detail TEXT DEFAULT ''"); } catch (_) {}
  migrateAppareilsStatut();
  migrateClientIdNullable();
  saveDb();
}

function seedIfEmpty(): void {
  const result = db.exec('SELECT COUNT(*) as c FROM utilisateurs');
  if (result.length > 0 && result[0].values.length > 0 && result[0].values[0][0] === 0) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.run('INSERT INTO utilisateurs (nom, email, mot_de_passe_hash, role) VALUES (?, ?, ?, ?)', ['PDG', 'pdg@gnabo.com', hash, 'pdg']);
    db.run('INSERT INTO utilisateurs (nom, email, mot_de_passe_hash, role) VALUES (?, ?, ?, ?)', ['Admin', 'admin@gnabo.com', hash, 'admin']);
    db.run("INSERT INTO parametres (cle, valeur) VALUES ('entreprise_nom', 'Gnabo Multi-Services')");
    db.run("INSERT INTO parametres (cle, valeur) VALUES ('devise', 'GNF')");
    saveDb();
    console.log('Seed: utilisateurs created (pdg@gnabo.com / admin@gnabo.com, password: admin123)');
  }
}
