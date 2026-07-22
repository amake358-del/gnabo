# Tests Playwright

## Objectif

Tests E2E automatisés couvrant les fonctionnalités critiques de l'ERP.

## Structure

```
playwright/
├── fixtures/           # Données de test (clients, appareils)
├── pages/              # Page Object Model
│   ├── login.page.ts
│   ├── clients.page.ts
│   ├── devis.page.ts
│   ├── electronique.page.ts
│   └── stock.page.ts
├── tests/
│   ├── auth.spec.ts
│   ├── clients.spec.ts
│   ├── devis.spec.ts
│   ├── electronique.spec.ts
│   ├── stock.spec.ts
│   └── responsive.spec.ts
├── global-setup.ts     # Seed BDD + auth
└── playwright.config.ts
```

## Tests fonctionnels

### Authentification
- Connexion PDG ✅
- Connexion Admin ✅
- Échec connexion (mauvais mot de passe) ✅
- Déconnexion ✅
- Blocage après 3 tentatives

### Clients
- Création ✅
- Modification ✅
- Recherche ✅
- Suppression (corbeille) ✅

### Module Électronique
- Réception d'un appareil ✅
- Génération QR Code ✅
- Diagnostic ✅
- Devis → Facture → Paiement → Reçu ✅
- Livraison avec signature ✅
- Garantie affichée ✅

### Devis (Aluminium & Métallique)
- Création de devis ✅
- Ajout lignes ✅
- Acceptation → Facture ✅
- Refus ✅

### Stock
- Entrée de stock ✅
- Sortie (par réparation) ✅
- Alerte seuil ✅

### Caisse
- Encaissement automatique après paiement ✅
- Dépense ✅
- Solde ✅

## Tests responsive

- Écran 415px (mobile)
- Écran 768px (tablette)
- Écran 1280px (PC)
- Vérification : navigation, boutons, tableaux

## Tests PWA

- Présence du manifeste
- Service worker enregistré
- Cache des assets

## Tests régression visuelle

- Capture d'écran des pages principales
- Comparaison avec les références
- Seuil de tolérance : 1%

## Configuration

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    timeout: 30000,
  },
});
```

## Exécution

```bash
npm run test:e2e           # Mode headless
npm run test:e2e:ui        # Mode UI Playwright
npm run test:e2e:debug     # Mode debug
```
