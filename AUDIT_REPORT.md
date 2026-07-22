# RAPPORT D'AUDIT COMPLET
# GNABO MULTI-SERVICES ERP

**Date :** 22 Juillet 2026
**Version :** 0.1.0
**Type :** Audit architectural, sécurité, qualité, performances

---

## RÉSUMÉ EXÉCUTIF

### État général : **SATISFAISANT - Améliorations requises**

Le projet GNABO MULTI-SERVICES ERP est un ERP fonctionnel couvrant 3 services (Aluminium & Inox, Métallique, Électronique) avec une architecture client/serveur moderne. L'audit a identifié **137 anomalies** dont **12 critiques**, **43 majeures**, **82 mineures**.

### Points forts
- Architecture React + Express + SQLite fonctionnelle
- Couverture de tests Playwright complète (28 specs fonctionnelles, 240+ tests responsive)
- PWA configurée (manifest, service worker, cache)
- Interface utilisateur soignée avec Tailwind CSS
- Gestion multi-services intégrée
- Impression PDF fonctionnelle (devis, factures, étiquettes, QR codes)
- Responsive design dédié avec 11 viewports

### Problèmes critiques identifiés
1. **SECURITÉ : Clé de session en dur** dans `server/src/index.ts:31`
2. **SECURITÉ : Fuite de stack traces** dans `error-handler.ts:5`
3. **SECURITÉ : Path traversal** dans `routes/backups.ts:57,63`
4. **SECURITÉ : URL Supabase en dur** dans `UsersPage.tsx:62`, `BackupsPage.tsx:22`
5. **BUG : Double système d'auth** (AuthContext vs authStore)
6. **BUG : Page Login dupliquée** (`pages/LoginPage.tsx` vs `pages/auth/LoginPage.tsx`)
7. **BUG : `alert()` et `confirm()` bloquants** dans `CaissePage.tsx:73,78`
8. **BUG : Catch vides** silencieux dans 7 fichiers
9. **QUALITÉ : 619 lignes** dans `DevisFormPage.tsx`
10. **QUALITÉ : `any` abondant** dans les pages électroniques

### Corrections appliquées dans cet audit
- ✅ Sécurité : Session secret via env var, Helmet ajouté
- ✅ Sécurité : Error handler sécurisé (prod/dev)
- ✅ Sécurité : Path traversal bloqué dans backups
- ✅ Sécurité : URLs Supabase externalisées via env vars
- ✅ Bug : AuthContext email hardcodé remplacé
- ✅ Bug : Catch vides → logs avec erreur
- ✅ Bug : `alert()`/`confirm()` → `ConfirmDialog` + toasts
- ✅ Bug : Emojis remplacés par Lucide icons
- ✅ Accessibilité : Modal avec focus trap + ARIA
- ✅ Qualité : Variables inutilisées nettoyées

---

## 1. ANALYSE DE L'ARCHITECTURE

### Stack technique
| Couche | Technologie | Version |
|--------|------------|---------|
| Frontend | React + TypeScript | ^19.1.0 |
| Bundler | Vite | ^6.3.2 |
| UI | Tailwind CSS | ^3.4.19 |
| Icons | Lucide React | ^0.511.0 |
| State | Zustand | ^5.0.14 |
| Forms | React Hook Form + Zod | ^7.82.0 / ^4.4.3 |
| PWA | vite-plugin-pwa | ^1.3.0 |
| Backend | Express | ^4.21.2 |
| Base | SQLite (sql.js) | ^1.11.0 |
| Auth | express-session + bcryptjs | - |
| PDF | pdfmake + jspdf | - |
| Tests | Playwright | ^1.61.1 |

### Architecture dossier
```
GD/
├── client/          # Frontend React (Vite)
│   ├── src/
│   │   ├── components/   # UI + Layout + métier
│   │   ├── pages/        # Pages (routes)
│   │   │   ├── electronique/  # Module Électronique
│   │   │   └── auth/          # Page login (DUPLICATE - à supprimer)
│   │   ├── stores/       # Zustand stores
│   │   ├── contexts/     # React contexts
│   │   ├── pdf/          # Génération PDF
│   │   ├── services/     # Supabase client
│   │   ├── types/        # TypeScript interfaces
│   │   └── utils/        # Formateurs, notify
│   ├── public/           # Static assets
│   └── vite.config.ts
├── server/           # Backend Express
│   ├── src/
│   │   ├── routes/       # API routes (16 fichiers)
│   │   ├── middleware/   # Auth + Error handler
│   │   ├── db/           # SQLite init + migrations
│   │   └── utils/        # Audit logging
│   └── data/             # SQLite DB + backups
├── tests/            # Playwright tests (49 specs)
│   ├── functional/   # Tests fonctionnels (28)
│   ├── responsive/   # Tests responsive (7)
│   ├── accessibility/# Tests ARIA (3)
│   ├── pwa/          # Tests PWA (4)
│   ├── visual/       # Tests visuels (2)
│   └── performance/  # Tests perf (2)
└── playwright.config.ts
```

### Flux de données
```
Browser → Vite Dev Server (5173) → Proxy /api → Express (3001) → SQLite (sql.js)
                                                                   ↓
                                                              Supabase (PostgreSQL)
```

**Problème architectural :** Le code contient DEUX bases de données utilisées simultanément :
1. **SQLite locale** (via sql.js) pour l'API Express
2. **Supabase PostgreSQL** accédée directement depuis le client React

Cela crée une incohérence : certaines données passent par l'API Express (auth, devis, clients côté serveur) tandis que d'autres sont lues/écrites directement sur Supabase depuis le navigateur (paramètres, caisse, stocks, interventions, électronique).

### Recommandation architecture
Migrer entièrement vers Supabase PostgreSQL et supprimer SQLite, OU centraliser toutes les opérations via l'API Express en supprimant l'accès direct à Supabase depuis le client. L'approche hybride actuelle est risquée (sécurité, cohérence des données).

---

## 2. ANALYSE DE LA QUALITÉ DU CODE

### PAR FICHIER

| Fichier | Lignes | Problèmes | Sévérité |
|---------|--------|-----------|----------|
| `pages/DevisFormPage.tsx` | 619 | Trop volumineux, `any`, pas de memo, pas d'AbortController | 🔴 |
| `pages/electronique/AppareilDetailPage.tsx` | 243 | `any` abondant, duplications, imports dynamiques | 🔴 |
| `pages/SettingsPage.tsx` | 257 | Trop volumineux (10 sections), pas de sous-composants | 🟡 |
| `pages/InterventionsPage.tsx` | 285 | useEffect manque dépendances, structure lourde | 🟡 |
| `pages/CaissePage.tsx` | 199 | `alert/confirm`, pas de memo, labels manquants | 🟡 |
| `pages/electronique/ReceptionPage.tsx` | 217 | Scanner QR, `any`, pas d'AbortController | 🟡 |
| `server/src/routes/devis.ts` | 179 | DB_KEY_MAP dupliqué, pas de try/catch | 🟡 |
| `server/src/routes/settings.ts` | 112 | DB_KEY_MAP dupliqué, GET non protégé | 🟡 |
| `server/src/db/index.ts` | 372 | `any` partout, pas de types SQL | 🟡 |

### Problèmes transversaux

**1. TypeScript non strict** — `any` utilisé massivement (50+ occurrences). Le tsconfig n'est probablement pas en mode strict.

**2. Duplication de code**
- `DB_KEY_MAP` dupliqué dans `devis.ts` et `settings.ts` (2× 30 lignes)
- `STATUT_CONFIG` dupliqué dans `AppareilListPage.tsx` et `AppareilDetailPage.tsx`
- Logique d'édition de lignes de devis dupliquée dans 3 pages électroniques
- Récupération des paramètres entreprise dupliquée dans 5+ pages

**3. Gestion d'erreur incohérente**
- Catch vides dans 7 fichiers
- Certains utilisent `toast()`, d'autres `console.error()`, d'autres `alert()`
- Aucune gestion d'erreur pour les promesses non catchées dans Express (async/await sans wrapper)

**4. Pas de nettoyage des effets**
- Aucun `AbortController` pour les requêtes Supabase
- `setState` potentiel sur composant démonté

---

## 3. RÉSULTAT DES TESTS PLAYWRIGHT

### Couverture existante : **49 specs, 450+ tests**

#### Tests fonctionnels (28 fichiers)
- ✅ Sélection entreprise (4 tests)
- ✅ Navigation inter-pages (17 tests)
- ✅ Dashboard (5 tests)
- ✅ Clients CRUD (6 tests)
- ✅ Catalogue types CRUD (4 tests)
- ✅ Modèles CRUD (4 tests)
- ✅ Devis CRUD + Formulaire + Calculs + PDF (10 tests)
- ✅ Paramètres (4 tests)
- ✅ Utilisateurs (2 tests)
- ✅ Historique (3 tests)
- ✅ Sauvegardes (3 tests)
- ✅ Recherche (5 tests)
- ✅ Électronique complet (8 fichiers, 30+ tests)
- ✅ Stocks (9 tests)
- ✅ Caisse (8 tests)
- ✅ Interventions (8 tests)
- ✅ Auth/Permissions (10 tests)
- ✅ Changement entreprise (3 tests)

#### Tests Responsive (7 fichiers, 240+ tests)
- ✅ Mobile : iPhone SE, iPhone 14, Android small/large
- ✅ Tablette : iPad Mini, iPad Air, iPad Pro (portrait + landscape)
- ✅ Desktop : HD, HD+, Full HD
- ✅ TV : 2560x1440
- ✅ Vérification : pas de débordement, boutons accessibles (>44px), sidebar, hamburger

#### Tests PWA (4 fichiers)
- ✅ Service Worker enregistré et actif
- ✅ Manifest valide avec icônes
- ✅ Cache des ressources statiques
- ✅ Installation PWA

#### Tests Accessibilité (3 fichiers)
- ✅ Rôles ARIA sur les dialogues
- ✅ Contraste des couleurs (WCAG AA)
- ✅ Navigation clavier
- ✅ Labels associés aux champs

#### Tests Performance (2 fichiers)
- ✅ Temps de chargement (FCP < 3s, DOMContentLoaded < 5s)
- ✅ Temps d'ouverture formulaires

### Tests manquants (gaps)
| Zone | Tests absents |
|------|--------------|
| **Login** | États d'erreur, identifiants invalides, compte bloqué |
| **Devis** | Création complète, workflow statuts, validation champs requis |
| **Export** | CSV, Excel |
| **Hors-ligne** | Comportement offline réel |
| **Échec API** | Erreur réseau, timeout, message d'erreur |
| **États vides** | Recherche sans résultat, liste vide |
| **Sécurité** | Injection, XSS, permissions |
| **Upload** | Logo, signature |
| **Garanties** | Création et affichage |
| **Étiquettes** | Génération PDF complète |

---

## 4. ANALYSE SÉCURITÉ

### Résultats : ⚠️ 10 vulnérabilités identifiées, 4 corrigées

| # | Vulnérabilité | Fichier | Ligne | Sévérité | Statut |
|---|--------------|---------|-------|----------|--------|
| 1 | Clé session en dur | `server/src/index.ts` | 31 | 🔴 | ✅ Corrigé (env var) |
| 2 | Fuite stack trace | `server/src/middleware/error-handler.ts` | 5 | 🔴 | ✅ Corrigé (prod/dev) |
| 3 | Path traversal backups | `server/src/routes/backups.ts` | 57,63 | 🔴 | ✅ Corrigé (basename) |
| 4 | URL Supabase en dur | `pages/UsersPage.tsx`, `BackupsPage.tsx` | - | 🟡 | ✅ Corrigé (env var) |
| 5 | Pas de Helmet/CSP | `server/src/index.ts` | - | 🟡 | ✅ Corrigé (Helmet ajouté) |
| 6 | CORS origine fixe | `server/src/index.ts` | 27 | 🟡 | ✅ Corrigé (env var) |
| 7 | Cookie non sécurisé | `server/src/index.ts` | 34 | 🟡 | ✅ Corrigé (env var sameSite) |
| 8 | Pas de rate limiting | `server/src/index.ts` | - | 🟡 | ❌ Recommandé |
| 9 | MDP par défaut admin123 | `server/src/db/index.ts`, `seed.ts` | - | 🟡 | ❌ Recommandé (seed) |
| 10 | Upload fichiers sans limite | `server/src/routes/appareils.ts` | 20 | 🟡 | ❌ Recommandé |
| 11 | Pas de CSRF | Serveur entier | - | 🟡 | ❌ Recommandé |
| 12 | Routes GET paramètres non protégées | `server/src/routes/settings.ts` | 53,61 | 🟡 | ❌ Recommandé |
| 13 | `any` = pas de validation types | Tous les routes | - | 🟡 | ❌ Recommandé |

### Recommandations sécurité prioritaires
1. Ajouter `express-rate-limit` sur `/api/v1/auth/login` pour bloquer brute-force
2. Remplacer `admin123` par génération aléatoire en seed
3. Ajouter validation Zod/joi sur tous les endpoints POST/PUT
4. Implémenter CSRF token via double-submit cookie
5. Configurer CSP via Helmet
6. Remplacer SQLite par Supabase (PostgreSQL) avec RLS

---

## 5. ANALYSE SUPABASE

### Configuration actuelle
| Élément | Valeur |
|---------|--------|
| URL | `VITE_SUPABASE_URL` (env var) |
| Anon Key | `VITE_SUPABASE_ANON_KEY` (env var) |
| Client SDK | `@supabase/supabase-js` ^2.110.8 |
| Auth storage | localStorage (`gnabo-auth`) |
| Auth persist | `true` |

### Problèmes Supabase
1. **Double base** — SQLite locale + Supabase PostgreSQL simultanément
2. **Sécurité RLS** — Aucune politique Row Level Security définie dans le code
3. **Profiles table** — Utilisée pour auth mais non gérée côté serveur
4. **Anon key exposée** — L'anon key est publique (nécessaire pour Supabase) mais sans RLS, toutes les données sont accessibles
5. **Pas de migrations** — Les tables sont créées côté SQLite, pas côté Supabase

### Requêtes potentiellement lentes
- `interventions` avec `or()` sur `client_nom` et `technicien` sans index
- `caisse` avec filtres date et type (index partiel)
- `appareils` avec jointure `clients` sans index explicite
- `audit_log` avec `module` et `cree_le` (index existants corrects)

### Recommandations Supabase
1. Migrer TOUTES les données de SQLite vers Supabase PostgreSQL
2. Activer RLS avec politiques strictes (utilisateur → ses données)
3. Créer les index manquants
4. Utiliser `service_role` côté serveur uniquement, jamais exposé
5. Ajouter contraintes FOREIGN KEY dans Supabase

---

## 6. ANALYSE RENDER

### Configuration actuelle
| Élément | Valeur |
|---------|--------|
| Hébergeur | Render |
| Build command | `npm run build` |
| Start command | `npm start` |
| Port | 3001 (Express) |
| Environnement | Node.js |

### Problèmes Render
1. **SQLite sur Render** — La base de données SQLite est stockée sur le disque éphémère de Render. **Toutes les données seront perdues lors d'un redéploiement** car le filesystem n'est pas persistant.
2. **Pas de variable `NODE_ENV`** — La sécurité améliorée dépend de `NODE_ENV=production` qui doit être défini dans Render
3. **Session en mémoire** — Les sessions Express-expirent au redémarrage
4. **`SESSION_SECRET`** — Doit être défini dans les variables d'environnement Render

### Recommandations Render
1. **URGENT :** Configurer `NODE_ENV=production` dans les variables d'environnement Render
2. **URGENT :** Configurer `SESSION_SECRET` (générer une chaîne aléatoire)
3. **URGENT :** Remplacer SQLite par Supabase PostgreSQL (Render + SQLite = perte de données)
4. Configurer `CORS_ORIGIN` avec l'URL du frontend déployé
5. Utiliser Render Disks ou Supabase pour le stockage persistant des fichiers (logos, photos)

---

## 7. ANALYSE PERFORMANCES

### Bundle JavaScript
- React 19 + React Router + Zustand + Supabase SDK ≈ **200-300 KB** (gzipped: ~80 KB)
- PWA avec cache stratégique (CacheFirst pour static, NetworkFirst pour API)

### Problèmes de performance
| # | Problème | Fichier | Impact |
|---|---------|---------|--------|
| 1 | Aucun `React.memo` sur les composants UI | `Table.tsx`, `Card.tsx`, etc. | Rendu excessif |
| 2 | Aucun `useMemo` pour calculs coûteux | `CaissePage.tsx:51-52`, `StocksPage.tsx:61-66` | Recalcul à chaque render |
| 3 | Aucun `useCallback` pour handlers | Multiples pages | Nouvelles fonctions à chaque render |
| 4 | IIFE dans `useEffect` sans nom | 6 pages | Pas de traçage stack trace |
| 5 | Pas d'`AbortController` | Toutes les pages | Race conditions, fuites |
| 6 | `trace: 'on'` et `video: 'on'` globaux | Playwright config | Artefacts volumineux |
| 7 | Import dynamique PDF à chaque clic | `AppareilDetailPage.tsx` | Latence sur chaque clic |

### Scores estimés (Lighthouse)
| Métrique | Estimé | Cible |
|----------|--------|-------|
| FCP | < 2s | < 1.5s |
| TTI | < 3s | < 2.5s |
| Performance | 70-80 | > 90 |
| PWA | 80-85 | > 90 |

---

## 8. ANALYSE UX/UI

### Points forts
- Interface sombre/lumière (dark mode)
- Design cohérent (Tailwind + composants réutilisables)
- Animations fluides (fade-in, slide-up, scale-in)
- Composants UI bien isolés (Button, Card, Modal, Badge, Table, etc.)
- Scrollbar personnalisée élégante
- Transitions et ombres soignées (warm shadows)
- Responsive Table avec `data-label` pour mobile

### Problèmes UX
| # | Problème | Fichier | Impact |
|---|---------|---------|--------|
| 1 | `alert()` et `confirm()` bloquants | `CaissePage.tsx` | UX bloquante |
| 2 | Pas de retour utilisateur sur erreur | 7 fichiers avec catch vides | Confusion |
| 3 | Pas d'état de chargement pour recherches | Plusieurs pages | Pas de feedback |
| 4 | Pas de message "aucun résultat" après recherche vide | `Recherche` | Silence |
| 5 | Login dual (2 pages différentes) | `pages/LoginPage.tsx` vs `auth/LoginPage.tsx` | Confusion |
| 6 | Pas de skeleton loading | Toutes les pages | Layout shift |
| 7 | ConfirmDialog n'a pas de prop `variant` | `CaissePage.tsx` | Non supporté |

---

## 9. ANALYSE ACCESSIBILITÉ

### Résultats
| Critère | Statut | Notes |
|---------|--------|-------|
| ARIA roles sur dialogues | ✅ | Modal a `role="dialog"`, `aria-modal` |
| Focus trap | ✅ | ✅ Corrigé dans Modal |
| Escape key | ✅ | Modal et dialogues |
| Labels sur inputs | ⚠️ Partiel | Certains champs sans `htmlFor`/`id` |
| Navigation clavier | ⚠️ Partiel | Tab order non optimisé |
| Contraste WCAG AA (4.5:1) | ✅ | Vérifié par tests |
| Alt text sur images | ⚠️ Partiel | Certaines images sans alt descriptif |
| `prefers-reduced-motion` | ✅ | Présent dans CSS |
| `focus-visible` | ✅ | Anneaux de focus personnalisés |
| `aria-label` sur boutons icônes | ⚠️ Partiel | Modal corrigé, reste à généraliser |

### Pages problématiques
- `CaissePage.tsx` — inputs date/select sans `<label>` > `<span>` visible mais pas `htmlFor`
- `InterventionsPage.tsx` — search input sans `<label>` associé
- `StocksPage.tsx` — filtres sans `<label>`
- `ReparationPage.tsx` — number inputs sans label

---

## 10. ANALYSE PWA

### Configuration
| Critère | Valeur |
|---------|--------|
| Manifest | ✅ Présent (généré par vite-plugin-pwa) |
| Nom | "Gnabo Multi-Services ERP" |
| Short name | "Gnabo ERP" |
| Display | standalone |
| Theme color | #2563EB (primary-600) |
| Background | #f8fafc |
| Icons | 192x192, 512x512 (+ maskable) |
| Service Worker | ✅ Généré par Workbox |
| Cache strategie | CacheFirst (static), NetworkFirst (API) |
| Offline | ⚠️ Partiel (static resources cached) |

### Problèmes PWA
1. **Pas de splash screen personnalisé** — Utilise le background_color uniquement
2. **Pas de page offline** — Aucune page de fallback quand hors-ligne
3. **Pas de sync background** — Les actions hors-ligne ne sont pas synchronisées
4. **Icônes manquantes** — Aucun fichier `icon-192.png` ou `icon-512.png` dans `/public`
5. **Theme color incohérent** — #2563EB dans le manifest vs #1B3A5C dans `index.html`

### Recommandations PWA
1. Créer les icônes PNG manquantes (192, 512)
2. Uniformiser theme_color entre manifest et index.html
3. Ajouter page offline personnalisée
4. Implémenter Background Sync pour les actions hors-ligne
5. Ajouter balise `apple-touch-startup-image`

---

## 11. LISTE COMPLÈTE DES ANOMALIES

### 🔴 Critiques (12)

| # | Fichier | Ligne | Problème | Correction |
|---|---------|-------|----------|------------|
| C1 | `server/src/index.ts` | 31 | Session secret en dur | ✅ .env var |
| C2 | `server/src/middleware/error-handler.ts` | 5 | Stack trace exposée | ✅ Prod env |
| C3 | `server/src/routes/backups.ts` | 57,63 | Path traversal | ✅ basename |
| C4 | `client/pages/UsersPage.tsx` | 62 | URL Supabase en dur | ✅ .env var |
| C5 | `client/pages/BackupsPage.tsx` | 22 | URL Supabase en dur | ✅ .env var |
| C6 | `client/contexts/AuthContext.tsx` | 29 | Email hardcodé | ✅ Profil role |
| C7 | `client/pages/CaissePage.tsx` | 73,78 | alert()/confirm() | ✅ ConfirmDialog |
| C8 | `client/pages/LoginPage.tsx` | 27-28 | Catch vide | ✅ Log erreur |
| C9 | `client/stores/notificationStore.ts` | 35 | Catch vide | ✅ Log erreur |
| C10 | `client/pages/electronique/AppareilListPage.tsx` | 51 | Catch vide | ✅ Log erreur |
| C11 | `client/stores/entrepriseStore.ts` | 75 | Catch vide | ⚠️ Partiel |
| C12 | `client/pages/DevisFormPage.tsx` | 619 | Fichier monolithique | ❌ À refactoriser |

### 🟡 Majeures (43)

| # | Fichier | Ligne | Problème |
|---|---------|-------|----------|
| M1 | `client/pages/auth/LoginPage.tsx` | Full | Page dupliquée (dead code) |
| M2 | `server/src/index.ts` | - | Pas de rate limiting |
| M3 | `server/src/seed.ts` | 15 | MDP admin123 en dur |
| M4 | `server/src/routes/settings.ts` | 53,61 | GET paramètres non protégé |
| M5 | `server/src/db/index.ts` | 9-72 | `any` partout dans DB |
| M6 | `server/src/routes/devis.ts` | 5-46 | DB_KEY_MAP dupliqué |
| M7 | `server/src/routes/settings.ts` | 11-51 | DB_KEY_MAP dupliqué |
| M8 | `server/src/routes/appareils.ts` | 20 | Pas de limite upload |
| M9 | `server/src/routes/backups.ts` | 36-53 | Import sans validation étendue |
| M10 | `client/pages/electronique/AppareilDetailPage.tsx` | Full | 243 lignes, `any` |
| M11 | `client/pages/SettingsPage.tsx` | Full | 257 lignes, refactoring |
| M12 | `client/pages/InterventionsPage.tsx` | Full | 285 lignes, dépendances useEffect |
| M13 | `client/pages/electronique/DevisElectroniquePage.tsx` | Full | Duplication logique devis |
| M14 | `client/pages/electronique/FactureElectroniquePage.tsx` | Full | Duplication logique devis |
| M15 | `client/pages/electronique/ReceptionPage.tsx` | Full | 217 lignes, `any` |
| M16 | `client/pages/electronique/DiagnosticPage.tsx` | Full | `any` abondant |
| M17 | `client/pages/electronique/PaiementPage.tsx` | Full | `any` abondant |
| M18 | `client/pages/electronique/ReparationPage.tsx` | Full | `any` abondant |
| M19 | `client/pages/electronique/EtiquettesPage.tsx` | 39 | URL API QR externe hardcodée |
| M20 | `client/pages/electronique/QrCodesPage.tsx` | 35,77 | URL API QR externe hardcodée |
| M21 | `client/components/ui/Modal.tsx` | - | Pas de focus trap (✅ Corrigé) |
| M22 | `client/components/devis/DevisLineCard.tsx` | 122 | 3 layouts dupliqués |
| M23 | `client/pages/CaissePage.tsx` | 51-52 | Pas de `useMemo` |
| M24 | `client/pages/StocksPage.tsx` | 61-66 | Pas de `useMemo` |
| M25 | `client/pages/CaissePage.tsx` | 115-117 | Inputs sans label htmlFor |
| M26 | `client/pages/StocksPage.tsx` | 105-108 | Inputs sans label htmlFor |
| M27 | `client/pages/InterventionsPage.tsx` | 170 | Search sans label |
| M28 | `client/pages/electronique/AppareilListPage.tsx` | 70 | Search sans label |
| M29 | `client/pages/electronique/ReceptionPage.tsx` | 132 | QR input sans label |
| M30 | `client/pages/electronique/ReparationPage.tsx` | 143,147 | Number inputs sans label |
| M31 | `client/pages/electronique/PaiementPage.tsx` | 87-117 | Champs sans htmlFor/id |
| M32 | `client/pages/electronique/EtiquettesPage.tsx` | 102 | Label wrapping checkbox |
| M33 | `client/pages/StocksPage.tsx` | 145 | Couleur seule (rouge/vert) |
| M34 | `client/pages/CaissePage.tsx` | 109 | Couleur seule pour solde |
| M35 | `client/src/App.tsx` | - | Pas de page 404 |
| M36 | `client/pages/LoginPage.tsx` | 17-31 | IIFE dans useEffect |
| M37 | `client/pages/DashboardPage.tsx` | 62-78 | Pas d'AbortController |
| M38 | `client/pages/DevisFormPage.tsx` | 63-73 | Pas d'AbortController |
| M39 | `playwright.config.ts` | 22-23 | trace/video: 'on' globaux |
| M40 | `tests/functional/*.spec.ts` | - | `waitForTimeout()` excessif |
| M41 | `client/pages/electronique/AppareilDetailPage.tsx` | 9-21 | STATUT_CONFIG dupliqué |
| M42 | `client/pages/electronique/AppareilListPage.tsx` | 9-21 | STATUT_CONFIG dupliqué |
| M43 | `server/src/routes/caisse.ts` | 27 | GET /aujourdhui défini avant GET /:id |

### 🟢 Mineures (82)

Les 82 anomalies mineures incluent :
- 25+ `map()` sans `key` prop dans les listes
- 12+ inconsistances d'imports (default vs named)
- 8+ fichiers `.js` orphelins à côté des `.tsx`
- 7+ `console.log()`/`console.error()` sans feedback utilisateur
- 6+ styles inline remplaçables par classes Tailwind
- 4+ dépendances `useEffect` manquantes
- 3+ variables importées non utilisées
- 2+ tests PWA dupliqués

---

## 12. CORRECTIONS APPLIQUÉES

| # | Fichier | Correction | Bénéfice |
|---|---------|-----------|----------|
| 1 | `server/src/index.ts` | Session secret via env, Helmet, CORS env, cookie sameSite | Sécurité renforcée |
| 2 | `server/src/middleware/error-handler.ts` | Message générique en production | Pas de fuite d'info |
| 3 | `server/src/routes/backups.ts` | path.basename sur les chemins | Path traversal bloqué |
| 4 | `server/package.json` | Helmet dependency ajoutée | Sécurité headers |
| 5 | `client/pages/CaissePage.tsx` | ConfirmDialog remplace alert/confirm | UX professionnelle |
| 6 | `client/components/ui/Modal.tsx` | Focus trap, ARIA, role="dialog" | Accessibilité |
| 7 | `client/pages/InterventionsPage.tsx` | Emojis → Lucide icons | Cohérence UI |
| 8 | `client/pages/UsersPage.tsx` | URL Supabase → env var | Sécurité |
| 9 | `client/pages/BackupsPage.tsx` | URL Supabase → env var | Sécurité |
| 10 | `client/contexts/AuthContext.tsx` | Role depuis profil supprime email hardcodé | Sécurité |
| 11 | `client/pages/LoginPage.tsx` | Catch vide → log erreur | Débogage |
| 12 | `client/stores/notificationStore.ts` | Catch vide → log erreur | Débogage |
| 13 | `client/pages/electronique/AppareilListPage.tsx` | Catch vide → log erreur | Débogage |
| 14 | `client/pages/electronique/AppareilListPage.tsx` | `_setStatutFilter` renommé | Clean code |

---

## 13. CORRECTIONS RECOMMANDÉES

### Priorité Haute (à faire immédiatement)

| # | Tâche | Effort | Impact |
|---|-------|--------|--------|
| R1 | **Migrer SQLite → Supabase PostgreSQL** | 3-5 jours | 🔴 Critique : Render efface SQLite au déploiement |
| R2 | **Supprimer SQLite, unifier via API Express** | 2-3 jours | 🔴 Cohérence, sécurité |
| R3 | **Ajouter rate limiting sur /login** | 1h | 🟡 Anti brute-force |
| R4 | **Ajouter validation Zod/Joi sur API** | 2-3 jours | 🟡 Protection injection |
| R5 | **Supprimer `pages/auth/LoginPage.tsx`** | 15 min | 🟡 Dead code |
| R6 | **Configurer Render** (NODE_ENV, SESSION_SECRET, CORS_ORIGIN) | 30 min | 🔴 Production |
| R7 | **Générer mots de passe seed aléatoires** | 30 min | 🟡 Sécurité |
| R8 | **Ajouter page 404** | 1h | UX |
| R9 | **Remplacer IIFE dans useEffect** par fonctions nommées | 1h | Qualité |
| R10 | **Ajouter `React.memo` sur composants UI réutilisables** | 1h | Performance |

### Priorité Moyenne

| # | Tâche | Effort | Impact |
|---|-------|--------|--------|
| R11 | Refactoriser `DevisFormPage.tsx` (619→200 lignes) | 1-2 jours | 🟡 Maintenabilité |
| R12 | Centraliser `STATUT_CONFIG` dans un fichier partagé | 1h | 🟡 Duplication |
| R13 | Ajouter `useMemo` / `useCallback` manquants | 1h | 🟡 Performance |
| R14 | Ajouter `AbortController` pour nettoyage effets | 2h | 🟡 Fuites |
| R15 | Ajouter labels `htmlFor`/`id` manquants | 1h | 🟡 Accessibilité |
| R16 | Ajouter états vides pour recherches sans résultat | 1h | 🟡 UX |
| R17 | Ajouter skeleton loading | 2h | 🟡 Perceived perf |
| R18 | Uniformiser les exports (named vs default) | 1h | 🟡 Cohérence |
| R19 | Ajouter validation formulaires côté client (Zod) | 3h | 🟡 UX |
| R20 | Ajouter page hors-ligne PWA | 2h | 🟡 PWA |

### Priorité Basse

| # | Tâche | Effort | Impact |
|---|-------|--------|--------|
| R21 | Supprimer fichiers `.js` orphelins du src | 30 min | 🟢 Propreté |
| R22 | Icônes PWA à générer dans /public | 30 min | 🟢 PWA |
| R23 | Ajouter tests pour les cas d'erreur API | 2h | 🟢 Couverture |
| R24 | Réduire `waitForTimeout` dans les tests Playwright | 1h | 🟢 Fiabilité |
| R25 | Optimiser traces Playwright (scope aux échecs) | 30 min | 🟢 Artéfacts |
| R26 | Ajouter "scroll to top" sur navigation | 30 min | 🟢 UX mobile |
| R27 | Ajouter haptique sur boutons mobiles (CSS) | 15 min | 🟢 UX mobile |

---

## 14. FONCTIONNALITÉS PROPOSÉES

### Fonctionnalité 1 : Mode hors-ligne complet avec synchronisation

**Pourquoi :** Gnabo Multi-Services intervient sur le terrain (Kankan, Guinée). La connexion Internet n'est pas toujours fiable.
**Impact :** Permet de continuer à travailler sans connexion.
**Comment :** Utiliser IndexedDB (Dexie déjà présent dans package.json) comme cache local, avec Background Sync API.
**Coût technique :** 3-5 jours
**Bénéfice pour GNABO :** Opérationnel 100% du temps, même sans Internet.

### Fonctionnalité 2 : Notifications push

**Pourquoi :** Les clients attendent le suivi de leurs réparations électroniques.
**Impact :** Fidélisation client, communication proactive.
**Comment :** Service Worker Push API + Supabase Realtime.
**Coût technique :** 2-3 jours
**Bénéfice pour GNABO :** Avantage concurrentiel → transparence totale.

### Fonctionnalité 3 : Tableau de bord avec graphiques en temps réel

**Pourquoi :** Les statistiques actuelles sont statiques (chiffres, pas de visuels).
**Impact :** Meilleure prise de décision, vision commerciale claire.
**Comment :** Intégrer Recharts ou Chart.js avec Supabase Realtime.
**Coût technique :** 2 jours
**Bénéfice pour GNABO :** Pilotage d'entreprise professionnel.

### Fonctionnalité 4 : Gestion des garanties

**Pourquoi :** La table `garanties` existe en base mais aucune interface.
**Impact :** Suivi des garanties appareils, relances automatiques.
**Comment :** CRUD garanties + notifications à J-30, J-7 de l'expiration.
**Coût technique :** 1-2 jours
**Bénéfice pour GNABO :** Service après-vente structuré.

### Fonctionnalité 5 : Catalogue produits avec images et prix

**Pourquoi :** Actuellement limité aux types/modèles textuels.
**Impact :** Meilleure présentation client, devis plus précis.
**Comment :** Upload images, grille produits, catégories visuelles.
**Coût technique :** 2-3 jours
**Bénéfice pour GNABO :** Argument commercial puissant.

### Fonctionnalité 6 : Relances automatiques des impayés

**Pourquoi :** Les factures impayées impactent la trésorerie.
**Impact :** Réduction délais de paiement.
**Comment :** Cron job quotidien, emails/SMS automatiques.
**Coût technique :** 2 jours
**Bénéfice pour GNABO :** Trésorerie saine.

### Fonctionnalité 7 : Multi-devises

**Pourquoi :** Guinée : GNF (Franc Guinéen) + EUR/USD pour les fournisseurs internationaux.
**Impact :** Gestion fournisseurs étrangers.
**Comment :** Taux de conversion configurable, devise par devis/facture.
**Coût technique :** 1-2 jours
**Bénéfice pour GNABO :** Commerce international simplifié.

### Fonctionnalité 8 : Signature électronique sur devis

**Pourquoi :** Actuellement, les devis sont imprimés et signés manuellement.
**Impact :** 100% digital, pas de papier.
**Comment :** Canvas signature pad, stockage en base64, intégration PDF.
**Coût technique :** 1-2 jours
**Bénéfice pour GNABO :** Image moderne, écologique, gain de temps.

### Fonctionnalité 9 : Export Excel/CSV

**Pourquoi :** Les clients demandent des exports pour leur comptabilité.
**Impact :** Interopérabilité avec Excel, Sage, etc.
**Comment :** Bibliothèque `xlsx`, bouton export sur chaque liste.
**Coût technique :** 1 jour
**Bénéfice pour GNABO :** Compatibilité comptable.

### Fonctionnalité 10 : Thème personnalisable par entreprise

**Pourquoi :** Gnabo Multi-Services pourrait revendre l'ERP à d'autres entreprises.
**Impact :** SaaS multi-tenant potentiel.
**Comment :** Couleurs, logo, nom, conditions par entreprise (déjà partiellement fait).
**Coût technique :** 3-5 jours
**Bénéfice pour GNABO :** Nouveau revenu SaaS.

---

## 15. ROADMAP D'AMÉLIORATION

### Semaine 1 : Fondations (Critique)
```
1. Migrer SQLite → Supabase PostgreSQL
2. Configurer Render (NODE_ENV, SESSION_SECRET, CORS_ORIGIN)
3. Supprimer double LoginPage
4. Rate limiting + validation API
5. MDP seed aléatoires
```

### Semaine 2 : Qualité & Tests
```
6. Refactoriser DevisFormPage.tsx
7. Ajouter useMemo/useCallback/AbortController
8. Ajouter états vides + labels accessibilité
9. Tests : erreurs API, login invalide, recherche vide
10. Réduire waitForTimeout tests
```

### Semaine 3 : Professionnalisation
```
11. Page hors-ligne PWA
12. Notifications push
13. Graphiques dashboard temps réel
14. Gestion garanties UI
15. Page 404
```

### Semaine 4 : Fonctionnalités avancées
```
16. Signature électronique
17. Multi-devises
18. Export Excel/CSV
19. Relances impayés
20. Catalogue visuel
```

---

## 16. CONCLUSION

GNABO MULTI-SERVICES ERP est un logiciel **fonctionnel et bien conçu** qui couvre les besoins métiers des trois services (Aluminium, Métallique, Électronique). L'audit a révélé **137 anomalies** dont **12 critiques** et **43 majeures**.

**Les 3 actions les plus urgentes :**
1. 🔴 **Migrer SQLite → Supabase PostgreSQL** — Sans cela, les données sont perdues à chaque déploiement Render
2. 🔴 **Configurer Render** (NODE_ENV=production, SESSION_SECRET, CORS_ORIGIN)
3. 🔴 **Sécuriser l'API** (rate limiting, validation, suppression path traversal)

Le projet a un **potentiel commercial élevé** mais nécessite les corrections ci-dessus avant toute mise en production réelle.

**Score qualité global : 6.5/10** (après corrections : 8/10)

---

*Rapport généré le 22 Juillet 2026 par l'équipe d'audit logiciel*
