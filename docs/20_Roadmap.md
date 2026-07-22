# Roadmap de Développement

## Ordre de développement

Chaque phase produit un livrable fonctionnel et testable.

### Phase 1 — Fondation (Semaine 1-2)

- [ ] Initialisation du projet (Vite + React + Express + TypeScript)
- [ ] Structure des dossiers
- [ ] Base de données SQLite + migrations
- [ ] Design System (variables CSS, composants de base)
- [ ] Authentification (connexion, session, déconnexion)
- [ ] Layout responsive (mobile, tablette, PC)
- [ ] Page d'accueil / tableau de bord vide

**Livrable :** App qui se lance, connexion fonctionnelle, layout responsive.

### Phase 2 — Module Électronique (Semaine 3-5)

- [ ] CRUD clients
- [ ] Réception d'appareil (création)
- [ ] QR Code + étiquette (génération, impression)
- [ ] Scanner QR
- [ ] Diagnostic
- [ ] Devis de réparation
- [ ] Facture
- [ ] Paiement (multi-modes)
- [ ] Reçu PDF
- [ ] Garantie
- [ ] Livraison + signature
- [ ] Photos appareil
- [ ] Galerie photos

**Livrable :** Workflow complet Électronique fonctionnel.

### Phase 3 — Modules Aluminium & Métallique (Semaine 6-7)

- [ ] Catalogue produits (paramétrable)
- [ ] Création de devis (avec lignes)
- [ ] Calcul automatique (m², kg, options)
- [ ] PDF devis
- [ ] Workflow devis → facture → paiement
- [ ] Modèles de devis
- [ ] Fiche de fabrication

**Livrable :** Devis et facturation pour Aluminium et Métallique.

### Phase 4 — Stocks (Semaine 8)

- [ ] Catégories de stock
- [ ] Articles
- [ ] Entrées / sorties
- [ ] Déduction automatique (réparation, fabrication)
- [ ] Seuils d'alerte
- [ ] Fournisseurs
- [ ] Inventaire

**Livrable :** Gestion des stocks opérationnelle.

### Phase 5 — Interventions & Planning (Semaine 9)

- [ ] Création d'intervention
- [ ] Calendrier / planning
- [ ] Photos avant/après
- [ ] Signature
- [ ] Bon d'intervention PDF

**Livrable :** Planning et suivi des interventions.

### Phase 6 — Caisse & Finances (Semaine 10)

- [ ] Module caisse (encaissements, dépenses, solde)
- [ ] Automatisation des encaissements depuis paiements
- [ ] Rapport de caisse PDF
- [ ] Statistiques de base
- [ ] Dashboard par service

**Livrable :** Gestion financière de base.

### Phase 7 — PWA & Offline (Semaine 11)

- [ ] Service Worker (cache assets)
- [ ] Manifeste
- [ ] Installation (beforeinstallprompt)
- [ ] Cache des données API
- [ ] Test offline

**Livrable :** PWA installable, fonctionnement offline partiel.

### Phase 8 — Tests & Polissage (Semaine 12)

- [ ] Tests Playwright (auth, clients, électronique, devis, stock)
- [ ] Tests responsive
- [ ] Audit Log complet
- [ ] Corbeille
- [ ] Sauvegarde / restauration
- [ ] Optimisation performance
- [ ] Relecture UI/UX

**Livrable :** Application stable, testée, prête pour production.

### Phase 9 — V2 (Futur)

- [ ] Multi-utilisateurs avancé (rôles granulaires)
- [ ] Synchronisation cloud
- [ ] Notifications SMS / WhatsApp
- [ ] Statistiques avancées (graphiques, prédictions)
- [ ] Rapports financiers complexes
- [ ] Synchronisation offline complète (file d'attente)

## Checklist avant chaque livraison

- [ ] Build sans erreur (`npm run build`)
- [ ] Lint passé (`npm run lint`)
- [ ] Tests Playwright passés (`npm run test:e2e`)
- [ ] Responsive testé (mobile, tablette, PC)
- [ ] Pas de fuite mémoire apparente
- [ ] Audit Log fonctionnel
- [ ] PDF généré correctement
- [ ] QR Code scannable
- [ ] PWA installable
- [ ] Données de seed fonctionnelles

## Conventions de code

- **TypeScript** strict mode
- **Noms de fichiers** : kebab-case (`.ts`, `.tsx`)
- **Composants React** : PascalCase
- **Hooks** : `use` prefix (camelCase)
- **Routes API** : RESTful (noms au pluriel)
- **BDD** : noms de tables en français, pluriel, snake_case
- **Commits** : [Conventional Commits](https://www.conventionalcommits.org/) (fr)
  - `feat:` nouvelle fonctionnalité
  - `fix:` correction de bug
  - `refactor:` refactorisation
  - `docs:` documentation
  - `test:` tests
  - `chore:` configuration, build
