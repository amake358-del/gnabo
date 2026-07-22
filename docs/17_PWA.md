# PWA (Progressive Web Application)

## Objectif

Permettre une utilisation complète du logiciel **sans connexion Internet**,
notamment dans l'atelier ou sur le terrain.

## Manifeste

```json
{
  "name": "Gnabo Multi-Services ERP",
  "short_name": "Gnabo ERP",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F8F9FA",
  "theme_color": "#1B3A5C",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

## Service Worker

Fichier : `client/public/sw.js`

### Stratégies de cache

| Ressource | Stratégie |
|---|---|
| Assets statiques (JS, CSS, HTML, images) | Cache-First |
| Données API | Network-First, fallback cache |
| Mutations (POST, PUT, DELETE) | Network-Only (avec file d'attente offline à implémenter en V2) |

### Cache

- `static-v1` : assets build (JS, CSS, icônes)
- `pages-v1` : pages HTML
- `api-v1` : réponses API en cache

### Événements

- `install` : pré-cache des assets statiques
- `activate` : nettoyage des anciens caches
- `fetch` : interception des requêtes avec la stratégie appropriée

## Offline

En mode hors-ligne :
- Les données déjà chargées restent accessibles (cache API)
- Les pages déjà visitées sont disponibles
- Les actions de création/modification sont bloquées avec un message "Vous êtes hors ligne"
- V2 : file d'attente de mutations avec synchronisation automatique

## Installation

- Bouton "Installer" (beforeinstallprompt) proposé après la 2e visite
- L'utilisateur peut l'ajouter à l'écran d'accueil manuellement
- Fonctionne sur Android, iOS (limité), Windows, macOS

## Performances

- Score Lighthouse cible : ≥ 90 sur tous les métriques
- First Contentful Paint < 1.5s
- Taille du bundle JS < 200 KB (gzippé)
- Images optimisées (WebP, lazyload)
