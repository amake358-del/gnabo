# Architecture Technique

## Stack

| Couche | Technologie |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Express + TypeScript |
| Base de données | SQLite via better-sqlite3 |
| API | REST (JSON) |
| PWA | Service Worker + Manifest |
| Tests | Playwright |
| Conteneurisation | Docker (optionnel) |

## Structure des dossiers

```
/
├── client/                    # Frontend React
│   ├── public/
│   │   ├── manifest.json
│   │   ├── sw.js
│   │   └── icons/
│   ├── src/
│   │   ├── components/        # Composants réutilisables
│   │   ├── pages/             # Pages par module
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/          # Appels API
│   │   ├── utils/             # Fonctions utilitaires
│   │   ├── types/             # Types TypeScript
│   │   ├── styles/            # Thème, variables CSS
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   └── vite.config.ts
├── server/                    # Backend Express
│   ├── src/
│   │   ├── routes/            # Routes API
│   │   ├── controllers/       # Logique métier
│   │   ├── models/            # Modèles SQLite
│   │   ├── middleware/        # Auth, permissions, validation
│   │   ├── db/                # Migrations, seed
│   │   ├── utils/
│   │   ├── types/
│   │   └── index.ts
│   └── package.json
├── docs/                      # Cahier des charges
├── playwright/                # Tests E2E
└── docker-compose.yml
```

## Frontend

- **Routing** : react-router-dom v6
- **State management** : React Context + useReducer (pas de dépendance lourde)
- **UI** : composants maison, pas de librairie CSS (design system sur mesure)
- **PWA** : service worker avec stratégie Cache-First pour les assets, Network-First pour les données

## Backend

- **API REST** : Express, port 3001
- **Auth** : sessions HTTP (express-session) avec cookie sécurisé
- **BDD** : better-sqlite3 (synchrone, performant, zéro configuration)
- **Migrations** : fichiers SQL versionnés dans `server/src/db/migrations/`

## API REST

Toutes les routes préfixées par `/api/v1/`.

| Méthode | Route | Description |
|---|---|---|
| POST | /api/v1/auth/login | Connexion |
| POST | /api/v1/auth/logout | Déconnexion |
| GET | /api/v1/clients | Liste clients |
| POST | /api/v1/clients | Créer client |
| GET | /api/v1/clients/:id | Détail client |
| PUT | /api/v1/clients/:id | Modifier client |
| DELETE | /api/v1/clients/:id | Supprimer client |

→ Chaque module (aluminium, metallique, electronique, stock, caisse, etc.) suit le même pattern RESTful.

## PWA (Offline-first)

- Service Worker enregistré au load
- Cache des assets statiques (HTML, CSS, JS, icônes)
- Stratégie : **Cache-First** pour assets, **Network-First with fallback** pour données
- Synchronisation : les mutations non envoyées sont mises en file d'attente (IndexedDB) et rejouées au retour du réseau
- Manifeste : icônes 192x192, 512x512, thème, nom court

## Sécurité

- Sessions signées (secret en variable d'environnement)
- Middleware de vérification du rôle (PDG / Admin)
- Validation des entrées (zod ou schéma manuel)
- Audit log de toutes les actions critiques
- Protection CSRF (same-site cookies)
- Rate limiting sur /auth
