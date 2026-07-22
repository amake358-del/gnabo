import { dbRun, dbGet, initDb } from './db/index';
import bcrypt from 'bcryptjs';

async function seed(): Promise<void> {
  await initDb();

  const existing = dbGet('SELECT COUNT(*) as c FROM clients') as Record<string, any> | undefined;
  if (existing && existing.c > 0) {
    console.log('Seed: data already exists, skipping.');
    return;
  }

  console.log('Seed: populating with test data for Kankan, Guinée...');

  const hash = bcrypt.hashSync('admin123', 10);
  dbRun("UPDATE utilisateurs SET nom='PDG' WHERE email='pdg@gnabo.com'");
  dbRun("UPDATE utilisateurs SET nom='Admin' WHERE email='admin@gnabo.com'");
  dbRun('INSERT OR IGNORE INTO utilisateurs (nom, email, mot_de_passe_hash, role) VALUES (?,?,?,?)', ['Fatoumata Sylla', 'secretaire@gnabo.com', hash, 'admin']);
  dbRun('INSERT OR IGNORE INTO utilisateurs (nom, email, mot_de_passe_hash, role) VALUES (?,?,?,?)', ['Moussa Kante', 'technicien@gnabo.com', hash, 'admin']);

  dbRun("INSERT OR REPLACE INTO parametres (cle, valeur) VALUES ('entreprise_nom', 'Gnabo Multi-Services Kankan')");
  dbRun("INSERT OR REPLACE INTO parametres (cle, valeur) VALUES ('entreprise_slogan', 'Votre partenaire multi-services de confiance')");
  dbRun("INSERT OR REPLACE INTO parametres (cle, valeur) VALUES ('entreprise_description', 'Aluminium, Métallique, Électronique')");
  dbRun("INSERT OR REPLACE INTO parametres (cle, valeur) VALUES ('devise', 'GNF')");
  dbRun("INSERT OR REPLACE INTO parametres (cle, valeur) VALUES ('format_date', 'DD/MM/YYYY')");
  dbRun("INSERT OR REPLACE INTO parametres (cle, valeur) VALUES ('couleur_principale', '#1e3a5f')");
  dbRun("INSERT OR REPLACE INTO parametres (cle, valeur) VALUES ('couleur_secondaire', '#2563eb')");
  dbRun("INSERT OR REPLACE INTO parametres (cle, valeur) VALUES ('entreprise_adresse', 'Km 7, Route de Kankan, Quartier Almamya')");
  dbRun("INSERT OR REPLACE INTO parametres (cle, valeur) VALUES ('entreprise_ville', 'Kankan')");
  dbRun("INSERT OR REPLACE INTO parametres (cle, valeur) VALUES ('entreprise_pays', 'Guinée')");
  dbRun("INSERT OR REPLACE INTO parametres (cle, valeur) VALUES ('entreprise_telephone', '+224 621 00 00 00')");
  dbRun("INSERT OR REPLACE INTO parametres (cle, valeur) VALUES ('entreprise_telephone2', '+224 622 00 00 00')");
  dbRun("INSERT OR REPLACE INTO parametres (cle, valeur) VALUES ('entreprise_email', 'contact@gnabomskankan.com')");
  dbRun("INSERT OR REPLACE INTO parametres (cle, valeur) VALUES ('entreprise_site_web', 'https://gnabomskankan.com')");
  dbRun("INSERT OR REPLACE INTO parametres (cle, valeur) VALUES ('entreprise_nif', 'NIF 2025-GNABO-KK-001')");
  dbRun("INSERT OR REPLACE INTO parametres (cle, valeur) VALUES ('entreprise_registre', 'RC KKN 2025 B 00123')");
  dbRun("INSERT OR REPLACE INTO parametres (cle, valeur) VALUES ('tva_default', '18')");
  dbRun("INSERT OR REPLACE INTO parametres (cle, valeur) VALUES ('signataire_nom', 'Mamadou Diallo')");
  dbRun("INSERT OR REPLACE INTO parametres (cle, valeur) VALUES ('signataire_fonction', 'Directeur Général')");
  dbRun("INSERT OR REPLACE INTO parametres (cle, valeur) VALUES ('conditions', 'Garantie : 90 jours sur les pièces installées. Les prix sont entendus TTC. La propriété des biens reste acquise au vendeur jusqu'au paiement intégral du prix. Toute commande annulée après confirmation entraîne une retenue de 30% à titre d'indemnité. En cas de litige, le tribunal de Kankan est seul compétent.')");
  dbRun("INSERT OR REPLACE INTO parametres (cle, valeur) VALUES ('pied_de_page', 'Gnabo Multi-Services Kankan - Aluminium • Métallique • Électronique')");

  const clients = [
    { nom: 'Diallo', prenom: 'Alpha Oumar', telephone: '+224 621 34 56 78', ville: 'Kankan', adresse: 'Quartier Liberté, Kankan' },
    { nom: 'Sylla', prenom: 'Mariam', telephone: '+224 622 45 67 89', ville: 'Kankan', adresse: 'Quartier Almamya, Kankan' },
    { nom: 'Camara', prenom: 'Mamady', telephone: '+224 623 56 78 90', ville: 'Kankan', adresse: 'Km 5, Route de Siguiri, Kankan' },
    { nom: 'Kante', prenom: 'Aminata', telephone: '+224 624 67 89 01', ville: 'Kankan', adresse: 'Quartier Bolibana, Kankan' },
    { nom: 'Doumbouya', prenom: 'Sékou', telephone: '+224 625 78 90 12', ville: 'Kankan', adresse: 'Quartier Koko, Kankan' },
    { nom: 'Keita', prenom: 'Fanta', telephone: '+224 626 89 01 23', ville: 'Kankan', adresse: 'Quartier Horizon, Kankan' },
    { nom: 'Sissoko', prenom: 'Drissa', telephone: '+224 627 90 12 34', ville: 'Kouroussa', adresse: 'Centre-ville, Kouroussa' },
    { nom: 'Traore', prenom: 'Bintou', telephone: '+224 628 01 23 45', ville: 'Kankan', adresse: 'Quartier Djedjedala, Kankan' },
    { nom: 'Kouyate', prenom: 'Souleymane', telephone: '+224 629 12 34 56', ville: 'Kankan', adresse: 'Quartier Carrière, Kankan' },
    { nom: 'Conde', prenom: 'Nene', telephone: '+224 630 23 45 67', ville: 'Siguiri', adresse: 'Quartier Or, Siguiri' },
    { nom: 'Sow', prenom: 'Abdoulaye', telephone: '+224 631 34 56 78', ville: 'Kankan', adresse: 'Quartier Soundata, Kankan' },
    { nom: 'Bah', prenom: 'Oumou', telephone: '+224 632 45 67 89', ville: 'Kankan', adresse: 'Marché Central, Kankan' },
    { nom: 'Diakite', prenom: 'Yamoussa', telephone: '+224 633 56 78 90', ville: 'Kankan', adresse: 'Quartier Liberté, Kankan' },
    { nom: 'Fofana', prenom: 'Moustapha', telephone: '+224 634 67 89 01', ville: 'Kankan', adresse: 'Belle-Vue, Kankan' },
    { nom: 'Cissé', prenom: 'Ramatoulaye', telephone: '+224 635 78 90 12', ville: 'Kankan', adresse: 'Quartier Escale, Kankan' },
  ];
  for (const c of clients) {
    dbRun('INSERT INTO clients (nom, prenom, telephone, adresse, ville) VALUES (?,?,?,?,?)',
      [c.nom, c.prenom, c.telephone, c.adresse, c.ville]);
  }

  dbRun("INSERT INTO catalog_types (name, description) VALUES ('Fenêtre aluminium', 'Fenêtres coulissantes et battantes')");
  dbRun("INSERT INTO catalog_types (name, description) VALUES ('Porte métallique', 'Portes blindées et tambour')");
  dbRun("INSERT INTO catalog_types (name, description) VALUES ('Gril/Protection', 'Grilles de fenêtres et portails')");
  dbRun("INSERT INTO catalog_types (name, description) VALUES ('Verre & Miroir', 'Vitrage, miroir sur mesure')");
  dbRun("INSERT INTO catalog_types (name, description) VALUES ('Réparation smartphone', 'Réparation téléphones et tablettes')");

  dbRun("INSERT INTO catalog_modeles (type_id, name, prix, description) VALUES (1,'Coulissant 2 vantaux',450000,'Fenêtre aluminium 120x100 cm')");
  dbRun("INSERT INTO catalog_modeles (type_id, name, prix, description) VALUES (1,'Coulissant 3 vantaux',650000,'Fenêtre aluminium 180x100 cm')");
  dbRun("INSERT INTO catalog_modeles (type_id, name, prix, description) VALUES (1,'Battant simple',350000,'Fenêtre aluminium ouvrante 60x80 cm')");
  dbRun("INSERT INTO catalog_modeles (type_id, name, prix, description) VALUES (2,'Porte blindée simple',1250000,'Porte métallique blindée 90x210 cm')");
  dbRun("INSERT INTO catalog_modeles (type_id, name, prix, description) VALUES (2,'Porte tambour',950000,'Porte métallique tambour 80x200 cm')");
  dbRun("INSERT INTO catalog_modeles (type_id, name, prix, description) VALUES (2,'Porte coupe-feu',1800000,'Porte métallique coupe-feu 90x210 cm')");
  dbRun("INSERT INTO catalog_modeles (type_id, name, prix, description) VALUES (3,'Grille fenêtre simple',250000,'Grille acier 120x100 cm')");
  dbRun("INSERT INTO catalog_modeles (type_id, name, prix, description) VALUES (3,'Grille fenêtre renforcée',350000,'Grille acier renforcé 120x100 cm')");
  dbRun("INSERT INTO catalog_modeles (type_id, name, prix, description) VALUES (3,'Portail coulissant',2500000,'Portail métallique coulissant 4m')");
  dbRun("INSERT INTO catalog_modeles (type_id, name, prix, description) VALUES (4,'Verre trempé 8mm',350000,'Verre trempé sécurité 100x100 cm')");
  dbRun("INSERT INTO catalog_modeles (type_id, name, prix, description) VALUES (4,'Miroir mural',250000,'Miroir sur mesure 80x120 cm')");
  dbRun("INSERT INTO catalog_modeles (type_id, name, prix, description) VALUES (4,'Double vitrage',550000,'Double vitrage 4-12-4 100x100 cm')");

  const appareils = [
    { client_id: 1, type: 'Smartphone', marque: 'Tecno', modele: 'Camon 20', panne: 'Écran cassé, ne s\'allume pas' },
    { client_id: 2, type: 'Smartphone', marque: 'Samsung', modele: 'Galaxy A14', panne: 'Batterie gonflée, charge lent' },
    { client_id: 3, type: 'Smartphone', marque: 'Infinix', modele: 'Hot 30', panne: 'Connecteur de charge défectueux' },
    { client_id: 4, type: 'Télévision', marque: 'Samsung', modele: 'UE43T5300', panne: 'Image saccadée, écran noir par moments' },
    { client_id: 5, type: 'Smartphone', marque: 'Itel', modele: 'P40', panne: 'Touche tactile ne répond plus' },
    { client_id: 6, type: 'Tablette', marque: 'Tecno', modele: 'PAD 10', panne: 'Ne charge plus, port USB endommagé' },
    { client_id: 7, type: 'Radio', marque: 'Sony', modele: 'ICF-306', panne: 'Pas de son, haut-parleur hs' },
    { client_id: 8, type: 'Smartphone', marque: 'Tecno', modele: 'Spark 10', panne: 'Microphone ne fonctionne pas' },
    { client_id: 9, type: 'Ordinateur', marque: 'HP', modele: 'Pavilion 15', panne: 'Surchauffe, ventilateur bruyant' },
    { client_id: 10, type: 'Smartphone', marque: 'Samsung', modele: 'Galaxy A04s', panne: 'Écran fissuré, dalle hs' },
    { client_id: 11, type: 'Smartphone', marque: 'Infinix', modele: 'Note 30', panne: 'Reboot aléatoire, carte mère probable' },
    { client_id: 12, type: 'Télévision', marque: 'LG', modele: '32LM6300', panne: 'Bloc alimentation hs, ne s\'allume pas' },
    { client_id: 13, type: 'Smartphone', marque: 'Itel', modele: 'A70', panne: 'Capteur photo avant flou' },
    { client_id: 14, type: 'Radio', marque: 'Panasonic', modele: 'RF-2400', panne: 'Bouton volume grippé, crachote' },
    { client_id: 15, type: 'Smartphone', marque: 'Tecno', modele: 'Camon 18', panne: 'IMEI null, plus de réseau' },
    { client_id: 2, type: 'Smartphone', marque: 'Samsung', modele: 'Galaxy M13', panne: 'Écran qui clignote, nappe défectueuse' },
    { client_id: 4, type: 'Smartphone', marque: 'Infinix', modele: 'Smart 8', panne: 'Bouton power bloqué' },
    { client_id: 6, type: 'Ordinateur', marque: 'Dell', modele: 'Latitude 3480', panne: 'Disque dur défaillant, lents' },
    { client_id: 8, type: 'Smartphone', marque: 'Tecno', modele: 'Pova 5', panne: 'Ne capte plus la 4G' },
    { client_id: 10, type: 'Tablette', marque: 'Samsung', modele: 'Galaxy Tab A7', panne: 'Écran cassé, vitre tactile hs' },
  ];
  const statuts = ['recu', 'diagnostic', 'attente_devis', 'devis_envoye', 'en_reparation'];
  for (let i = 0; i < appareils.length; i++) {
    const a = appareils[i];
    const uid = `GN-KK-${String(i + 1).padStart(5, '0')}`;
    const s = statuts[Math.min(i, statuts.length - 1)];
    dbRun(`INSERT INTO appareils (uid_interne, uid_visible, client_id, type, marque, modele, description_defaut, statut)
      VALUES (?,?,?,?,?,?,?,?)`, [uid, uid, a.client_id, a.type, a.marque, a.modele, a.panne, s]);
  }

  dbRun("INSERT INTO diagnostics (appareil_id, description, pieces_necessaires, cout_estime, duree_estimee, technicien) VALUES (1,'Écran et batterie à remplacer. Test de charge OK. Carte mère fonctionnelle.','Écran Tecno Camon 20, Batterie BL-49XT',180000,3,'Moussa Kante')");
  dbRun("INSERT INTO diagnostics (appareil_id, description, pieces_necessaires, cout_estime, duree_estimee, technicien) VALUES (2,'Batterie gonflée dangereuse. Connecteur de charge ok.','Batterie Samsung A14 EB-BA146ABY',95000,1,'Moussa Kante')");
  dbRun("INSERT INTO diagnostics (appareil_id, description, pieces_necessaires, cout_estime, duree_estimee, technicien) VALUES (3,'Port de charge micro-USB dessoudé. Piste arrachée.','Port micro-USB + câble nappe',45000,2,'Sekou Camara')");
  dbRun("INSERT INTO diagnostics (appareil_id, description, pieces_necessaires, cout_estime, duree_estimee, technicien) VALUES (5,'Digitiseur endommagé. LCD OK. Remplacement de la vitre tactile.','Vitre tactile Itel P40',65000,2,'Sekou Camara')");
  dbRun("INSERT INTO diagnostics (appareil_id, description, pieces_necessaires, cout_estime, duree_estimee, technicien) VALUES (4,'Condensateurs alimentation HS. Test carte confirmé. 3 capots gonflés.','Condensateur 47µF 450V x2',35000,2,'Moussa Kante')");
  dbRun("INSERT INTO diagnostics (appareil_id, description, pieces_necessaires, cout_estime, duree_estimee, technicien) VALUES (6,'Port USB détruit par traction. Remplacement nécessaire.','Port USB Type-C Tecno PAD',25000,1,'Moussa Kante')");

  dbRun("INSERT INTO devis (numero, client_id, service, appareil_id, statut, montant_ht, tva, montant_ttc, acompte, notes) VALUES ('DEV-2025-001',1,'electronique',1,'accepte',180000,18,212400,50000,'Remplacement écran + batterie Tecno Camon 20')");
  dbRun("INSERT INTO devis (numero, client_id, service, appareil_id, statut, montant_ht, tva, montant_ttc, acompte, notes) VALUES ('DEV-2025-002',2,'electronique',2,'accepte',95000,18,112100,30000,'Remplacement batterie Samsung A14')");
  dbRun("INSERT INTO devis (numero, client_id, service, appareil_id, statut, montant_ht, tva, montant_ttc, acompte, notes) VALUES ('DEV-2025-003',3,'electronique',3,'envoye',45000,18,53100,0,'Réparation port charge Infinix Hot 30')");
  dbRun("INSERT INTO devis (numero, client_id, service, appareil_id, statut, montant_ht, tva, montant_ttc, acompte, notes) VALUES ('DEV-2025-004',5,'electronique',5,'accepte',65000,18,76700,25000,'Remplacement vitre tactile Itel P40')");
  dbRun("INSERT INTO devis (numero, client_id, service, appareil_id, statut, montant_ht, tva, montant_ttc, acompte, notes) VALUES ('DEV-2025-005',4,'electronique',4,'brouillon',35000,18,41300,0,'Réparation alimentation TV Samsung')");
  dbRun("INSERT INTO devis (numero, client_id, service, appareil_id, statut, montant_ht, tva, montant_ttc, acompte, notes) VALUES ('DEV-2025-006',7,'aluminium',null,'envoye',650000,18,767000,200000,'Fenêtre coulissante 3 vantaux 180x100 cm')");
  dbRun("INSERT INTO devis (numero, client_id, service, appareil_id, statut, montant_ht, tva, montant_ttc, acompte, notes) VALUES ('DEV-2025-007',9,'metallique',null,'accepte',1250000,18,1475000,500000,'Porte blindée 90x210 cm avec serrure 3 points')");
  dbRun("INSERT INTO devis (numero, client_id, service, appareil_id, statut, montant_ht, tva, montant_ttc, acompte, notes) VALUES ('DEV-2025-008',11,'aluminium',null,'brouillon',350000,18,413000,0,'Fenêtre battante aluminium 60x80 cm')");
  dbRun("INSERT INTO devis (numero, client_id, service, appareil_id, statut, montant_ht, tva, montant_ttc, acompte, notes) VALUES ('DEV-2025-009',12,'electronique',12,'envoye',35000,18,41300,0,'Réparation bloc alimentation TV LG 32\"')");

  dbRun("INSERT INTO devis_lignes (devis_id, description, quantite, prix_unitaire_ht, tva, total_ht) VALUES (1,'Écran Tecno Camon 20',1,120000,18,120000)");
  dbRun("INSERT INTO devis_lignes (devis_id, description, quantite, prix_unitaire_ht, tva, total_ht) VALUES (1,'Batterie BL-49XT',1,35000,18,35000)");
  dbRun("INSERT INTO devis_lignes (devis_id, description, quantite, prix_unitaire_ht, tva, total_ht) VALUES (1,'Main-doeuvre réparation',1,25000,18,25000)");
  dbRun("INSERT INTO devis_lignes (devis_id, description, quantite, prix_unitaire_ht, tva, total_ht) VALUES (2,'Batterie Samsung A14',1,65000,18,65000)");
  dbRun("INSERT INTO devis_lignes (devis_id, description, quantite, prix_unitaire_ht, tva, total_ht) VALUES (2,'Main-doeuvre',1,30000,18,30000)");
  dbRun("INSERT INTO devis_lignes (devis_id, description, quantite, prix_unitaire_ht, tva, total_ht) VALUES (3,'Réparation port charge',1,30000,18,30000)");
  dbRun("INSERT INTO devis_lignes (devis_id, description, quantite, prix_unitaire_ht, tva, total_ht) VALUES (3,'Connecteur micro-USB',1,15000,18,15000)");
  dbRun("INSERT INTO devis_lignes (devis_id, description, quantite, prix_unitaire_ht, tva, total_ht) VALUES (4,'Vitre tactile Itel P40',1,40000,18,40000)");
  dbRun("INSERT INTO devis_lignes (devis_id, description, quantite, prix_unitaire_ht, tva, total_ht) VALUES (4,'Main-doeuvre',1,25000,18,25000)");
  dbRun("INSERT INTO devis_lignes (devis_id, description, quantite, prix_unitaire_ht, tva, total_ht) VALUES (5,'Condensateur 47µF 450V',2,5000,18,10000)");
  dbRun("INSERT INTO devis_lignes (devis_id, description, quantite, prix_unitaire_ht, tva, total_ht) VALUES (5,'Main-doeuvre électronique',1,25000,18,25000)");
  dbRun("INSERT INTO devis_lignes (devis_id, description, quantite, prix_unitaire_ht, tva, total_ht) VALUES (6,'Fenêtre aluminium coulissante 3 vantaux',1,550000,18,550000)");
  dbRun("INSERT INTO devis_lignes (devis_id, description, quantite, prix_unitaire_ht, tva, total_ht) VALUES (6,'Vitrage 5mm',3,25000,18,75000)");
  dbRun("INSERT INTO devis_lignes (devis_id, description, quantite, prix_unitaire_ht, tva, total_ht) VALUES (6,'Pose et installation',1,25000,18,25000)");

  dbRun("INSERT INTO factures (numero, devis_id, client_id, service, montant_ht, tva, montant_ttc, statut) VALUES ('FAC-2025-001',1,1,'electronique',180000,18,212400,'payee')");
  dbRun("INSERT INTO factures (numero, devis_id, client_id, service, montant_ht, tva, montant_ttc, statut) VALUES ('FAC-2025-002',2,2,'electronique',95000,18,112100,'payee')");
  dbRun("INSERT INTO factures (numero, devis_id, client_id, service, montant_ht, tva, montant_ttc, statut) VALUES ('FAC-2025-003',4,5,'electronique',65000,18,76700,'impayee')");
  dbRun("INSERT INTO factures (numero, devis_id, client_id, service, montant_ht, tva, montant_ttc, statut) VALUES ('FAC-2025-004',null,3,'aluminium',650000,18,767000,'impayee')");
  dbRun("INSERT INTO factures (numero, devis_id, client_id, service, montant_ht, tva, montant_ttc, statut) VALUES ('FAC-2025-005',null,9,'metallique',1250000,18,1475000,'payee')");

  dbRun("INSERT INTO paiements (facture_id, client_id, montant, mode) VALUES (1,1,162400,'mobile_money')");
  dbRun("INSERT INTO paiements (facture_id, client_id, montant, mode) VALUES (1,1,50000,'especes')");
  dbRun("INSERT INTO paiements (facture_id, client_id, montant, mode) VALUES (2,2,82100,'mobile_money')");
  dbRun("INSERT INTO paiements (facture_id, client_id, montant, mode) VALUES (2,2,30000,'especes')");
  dbRun("INSERT INTO paiements (facture_id, client_id, montant, mode) VALUES (5,9,975000,'virement')");
  dbRun("INSERT INTO paiements (facture_id, client_id, montant, mode) VALUES (5,9,500000,'cheque')");

  dbRun("INSERT INTO caisse (type, categorie, montant, description, mode_paiement, utilisateur_id) VALUES ('encaissement','prestation',212400,'Facture FAC-2025-001 Tecno Camon 20','mobile_money',3)");
  dbRun("INSERT INTO caisse (type, categorie, montant, description, mode_paiement, utilisateur_id) VALUES ('encaissement','prestation',112100,'Facture FAC-2025-002 Samsung A14','mobile_money',3)");
  dbRun("INSERT INTO caisse (type, categorie, montant, description, mode_paiement, utilisateur_id) VALUES ('encaissement','prestation',1475000,'Facture FAC-2025-005 Porte blindée','virement',3)");
  dbRun("INSERT INTO caisse (type, categorie, montant, description, mode_paiement, utilisateur_id) VALUES ('depense','fourniture',95000,'Achat batterie Samsung A14 + vitre Itel + connecteurs','especes',4)");
  dbRun("INSERT INTO caisse (type, categorie, montant, description, mode_paiement, utilisateur_id) VALUES ('depense','achat_stock',450000,'Aluminium profilé 6m x5','especes',2)");
  dbRun("INSERT INTO caisse (type, categorie, montant, description, mode_paiement, utilisateur_id) VALUES ('depense','loyer',800000,'Loyer local Almamya - Juillet 2025','virement',2)");
  dbRun("INSERT INTO caisse (type, categorie, montant, description, mode_paiement, utilisateur_id) VALUES ('encaissement','prestation',76700,'Facture FAC-2025-003 Itel P40','especes',3)");
  dbRun("INSERT INTO caisse (type, categorie, montant, description, mode_paiement, utilisateur_id) VALUES ('encaissement','acompte',200000,'Acompte devis DEV-2025-006 fenêtre coulissante','mobile_money',3)");

  dbRun("INSERT INTO categories_stock (nom, service) VALUES ('Écrans smartphone','electronique')");
  dbRun("INSERT INTO categories_stock (nom, service) VALUES ('Batteries','electronique')");
  dbRun("INSERT INTO categories_stock (nom, service) VALUES ('Connecteurs','electronique')");
  dbRun("INSERT INTO categories_stock (nom, service) VALUES ('Profilés aluminium','aluminium')");
  dbRun("INSERT INTO categories_stock (nom, service) VALUES ('Quincaillerie métallique','metallique')");
  dbRun("INSERT INTO categories_stock (nom, service) VALUES ('Vitres et verre','aluminium')");
  dbRun("INSERT INTO categories_stock (nom, service) VALUES ('Composants électroniques','electronique')");
  dbRun("INSERT INTO categories_stock (nom, service) VALUES ('Consommables','tous')");

  dbRun("INSERT INTO articles_stock (categorie_id, nom, reference, quantite, seuil_alerte, prix_unitaire) VALUES (1,'Écran Tecno Camon 20','SCR-TCN-C20',3,2,120000)");
  dbRun("INSERT INTO articles_stock (categorie_id, nom, reference, quantite, seuil_alerte, prix_unitaire) VALUES (1,'Écran Samsung A14','SCR-SAM-A14',5,3,95000)");
  dbRun("INSERT INTO articles_stock (categorie_id, nom, reference, quantite, seuil_alerte, prix_unitaire) VALUES (1,'Vitre tactile Itel P40','SCR-ITL-P40',4,2,40000)");
  dbRun("INSERT INTO articles_stock (categorie_id, nom, reference, quantite, seuil_alerte, prix_unitaire) VALUES (2,'Batterie Samsung A14','BAT-SAM-A14',6,3,65000)");
  dbRun("INSERT INTO articles_stock (categorie_id, nom, reference, quantite, seuil_alerte, prix_unitaire) VALUES (2,'Batterie Tecno Camon 20','BAT-TCN-C20',4,3,35000)");
  dbRun("INSERT INTO articles_stock (categorie_id, nom, reference, quantite, seuil_alerte, prix_unitaire) VALUES (3,'Port USB Type-C','CONN-TYPEC',15,5,5000)");
  dbRun("INSERT INTO articles_stock (categorie_id, nom, reference, quantite, seuil_alerte, prix_unitaire) VALUES (3,'Connecteur micro-USB','CONN-MUSB',20,5,3000)");
  dbRun("INSERT INTO articles_stock (categorie_id, nom, reference, quantite, seuil_alerte, prix_unitaire) VALUES (3,'Nappe écran Tecno','NAPPE-TCN',8,3,12000)");
  dbRun("INSERT INTO articles_stock (categorie_id, nom, reference, quantite, seuil_alerte, prix_unitaire) VALUES (4,'Profilé aluminium 6m','ALU-PRO-6',12,5,90000)");
  dbRun("INSERT INTO articles_stock (categorie_id, nom, reference, quantite, seuil_alerte, prix_unitaire) VALUES (4,'Profilé aluminium 4m','ALU-PRO-4',8,5,65000)");
  dbRun("INSERT INTO articles_stock (categorie_id, nom, reference, quantite, seuil_alerte, prix_unitaire) VALUES (5,'Serrures 3 points','SERR-3PT',10,3,55000)");
  dbRun("INSERT INTO articles_stock (categorie_id, nom, reference, quantite, seuil_alerte, prix_unitaire) VALUES (5,'Charnière renforcée','CHARN-REN',25,5,8500)");
  dbRun("INSERT INTO articles_stock (categorie_id, nom, reference, quantite, seuil_alerte, prix_unitaire) VALUES (5,'Poignée porte','POIGN-PT',15,3,25000)");
  dbRun("INSERT INTO articles_stock (categorie_id, nom, reference, quantite, seuil_alerte, prix_unitaire) VALUES (6,'Verre trempé 5mm 100x100cm','VTR-5-100',6,2,35000)");
  dbRun("INSERT INTO articles_stock (categorie_id, nom, reference, quantite, seuil_alerte, prix_unitaire) VALUES (6,'Double vitrage 100x100cm','VTR-DV-100',3,1,120000)");
  dbRun("INSERT INTO articles_stock (categorie_id, nom, reference, quantite, seuil_alerte, prix_unitaire) VALUES (7,'Condensateur 47µF 450V','CAP-47-450',30,5,2000)");
  dbRun("INSERT INTO articles_stock (categorie_id, nom, reference, quantite, seuil_alerte, prix_unitaire) VALUES (7,'Condensateur 100µF 25V','CAP-100-25',50,10,500)");
  dbRun("INSERT INTO articles_stock (categorie_id, nom, reference, quantite, seuil_alerte, prix_unitaire) VALUES (7,'Résistance 10kΩ','RES-10K',100,10,100)");
  dbRun("INSERT INTO articles_stock (categorie_id, nom, reference, quantite, seuil_alerte, prix_unitaire) VALUES (8,'Pâte thermique','CONS-THERM',10,3,15000)");
  dbRun("INSERT INTO articles_stock (categorie_id, nom, reference, quantite, seuil_alerte, prix_unitaire) VALUES (8,'Film plastique protection','CONS-FILM',5,2,25000)");
  dbRun("INSERT INTO articles_stock (categorie_id, nom, reference, quantite, seuil_alerte, prix_unitaire) VALUES (8,'Gants anti-statiques boîte','CONS-GANTS',3,1,35000)");
  dbRun("INSERT INTO articles_stock (categorie_id, nom, reference, quantite, seuil_alerte, prix_unitaire) VALUES (8,'Câble USB Type-C 1m','CONS-CBL-USBC',15,5,12000)");

  dbRun("INSERT INTO mouvements_stock (article_id, type, quantite, notes, utilisateur_id) VALUES (1,'entree',10,'Réapprovisionnement fournisseur Conakry',2)");
  dbRun("INSERT INTO mouvements_stock (article_id, type, quantite, notes, utilisateur_id) VALUES (2,'entree',8,'Réapprovisionnement',2)");
  dbRun("INSERT INTO mouvements_stock (article_id, type, quantite, notes, utilisateur_id) VALUES (4,'entree',10,'Stock initial Samsung batteries',2)");
  dbRun("INSERT INTO mouvements_stock (article_id, type, quantite, notes, utilisateur_id) VALUES (1,'sortie',1,'Installation Tecno Camon 20 - Appareil #1',4)");
  dbRun("INSERT INTO mouvements_stock (article_id, type, quantite, notes, utilisateur_id) VALUES (4,'sortie',1,'Installation batterie Samsung A14 - Appareil #2',4)");
  dbRun("INSERT INTO mouvements_stock (article_id, type, quantite, notes, utilisateur_id) VALUES (7,'sortie',1,'Réparation Infinix Hot 30 - Appareil #3',4)");
  dbRun("INSERT INTO mouvements_stock (article_id, type, quantite, notes, utilisateur_id) VALUES (16,'sortie',2,'Réparation TV Samsung UE43T5300',4)");
  dbRun("INSERT INTO mouvements_stock (article_id, type, quantite, notes, utilisateur_id) VALUES (9,'entree',20,'Stock profilé aluminium',2)");
  dbRun("INSERT INTO mouvements_stock (article_id, type, quantite, notes, utilisateur_id) VALUES (11,'entree',15,'Stock serrures 3 points',2)");

  dbRun("INSERT INTO interventions (devis_id, client_id, service, technicien, date_prevue, adresse_intervention, statut) VALUES (6,7,'aluminium','Equipe Almamya','2025-07-25','Quartier Koko, Kankan','planifiee')");
  dbRun("INSERT INTO interventions (devis_id, client_id, service, technicien, date_prevue, adresse_intervention, statut) VALUES (7,9,'metallique','Fabrication atelier','2025-07-28','Km 5, Route de Siguiri, Kankan','planifiee')");

  dbRun('INSERT INTO garanties (appareil_id, duree_jours, date_debut, date_fin, conditions) VALUES (?,90,?,?,?)', [1, '2025-07-01', '2025-09-29', 'Garantie pieces uniquement, main-doeuvre non couverte']);
  dbRun("INSERT INTO garanties (appareil_id, duree_jours, date_debut, date_fin, conditions) VALUES (2,90,'2025-07-05','2025-10-03','Garantie batterie 3 mois, défaut de fabrication')");

  dbRun("INSERT INTO notifications (type, title, message, link) VALUES ('info','Nouvel appareil reçu','Tecno Camon 20 - Alpha Diallo - Écran cassé','/electronique/appareils/1')");
  dbRun("INSERT INTO notifications (type, title, message, link) VALUES ('warning','Stock faible','Écran Tecno Camon 20 : plus que 3 en stock','/stocks')");
  dbRun("INSERT INTO notifications (type, title, message, link) VALUES ('info','Intervention planifiée','Fenêtre coulissante - Client Sékou Doumbouya - 25/07/2025','/interventions')");
  dbRun("INSERT INTO notifications (type, title, message, link) VALUES ('info','Paiement reçu','Paiement mobile money 162 400 FG - Facture FAC-2025-001','/electronique/appareils/1')");
  dbRun("INSERT INTO notifications (type, title, message, link) VALUES ('warning','Client en attente','Fanta Keita - Smartphone Infinix Smart 8 - Bouton power bloqué','/electronique/appareils/17')");

  console.log('Seed: Kankan test data inserted successfully.');
  console.log('  - 15 clients');
  console.log('  - 12 catalog modeles');
  console.log('  - 20 appareils');
  console.log('  - 6 diagnostics');
  console.log('  - 9 devis + lignes');
  console.log('  - 5 factures');
  console.log('  - 6 paiements');
  console.log('  - 8 écritures caisse');
  console.log('  - 8 catégories stock / 22 articles / 9 mouvements');
  console.log('  - 2 interventions');
  console.log('  - 5 notifications');
  console.log('  - Devise: GNF (Franc Guinéen)');
  console.log('  - PDG: Mamadou Diallo / admin: admin123');
}

seed().catch(console.error);
