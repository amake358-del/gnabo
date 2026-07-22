# Migration Supabase + Render — Guide pas à pas

## Étape 1 : Créer un compte Supabase (gratuit)

1. Va sur https://supabase.com
2. Clique "Start your project" ou "Sign in with GitHub"
3. Connecte-toi avec ton compte GitHub
4. Une fois connecté, clique "New project"

### Configurer le projet Supabase

- **Name** : `gnabo-erp`
- **Database Password** : crée un mot de passe fort (note-le dans un fichier)
- **Region** : choisis `EU West` (le plus proche de Guinée disponible)
- **Pricing Plan** : Free

Clique **"Create new project"** (attends 2 min que la DB soit prête)

## Étape 2 : Récupérer les clés Supabase

Une fois le projet créé :

1. Va dans **Project Settings** > **API**
2. Note ces 2 valeurs dans un fichier `.env` :

```
VITE_SUPABASE_URL=https://xxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

3. Va dans **Project Settings** > **Database**
4. Note le **Connection string** (pour plus tard si besoin)

## Étape 3 : Créer les tables dans Supabase

Deux méthodes :

### Méthode A : SQL Editor (recommandé)

1. Dans Supabase, va dans **SQL Editor**
2. Crée une nouvelle requête
3. Copie-colle le fichier `docs/supabase-schema.sql` (créé automatiquement dans la prochaine étape)
4. Exécute

### Méthode B : Table Editor (manuel)

Va dans **Table Editor** > **Create table** et crée chaque table une par une.

Utilise le schéma SQL ci-dessous.

## Étape 4 : Installer Supabase dans le projet

```powershell
cd client
npm install @supabase/supabase-js
```

## Étape 5 : Configurer le client Supabase

Crée un fichier `client/src/services/supabase.ts` :

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Role = 'pdg' | 'admin'
```

Crée un fichier `.env` à la racine de `client/` :

```
VITE_SUPABASE_URL=votre_url_ici
VITE_SUPABASE_ANON_KEY=votre_cle_ici
```

**Important** : ajoute `.env` dans `.gitignore`

## Étape 6 : Configurer l'authentification Supabase

1. Dans Supabase, va dans **Authentication** > **Providers**
2. Active **Email** (désactive "Confirm email" pour du test, réactive-le en prod)
3. Va dans **Authentication** > **Settings** > **Site URL**
4. Mets `http://localhost:5173` (et plus tard ton URL Render)

## Étape 7 : Créer les utilisateurs (Admin/PDG)

Depuis la page Auth > Users de Supabase :
1. Clique **Invite user** ou **Add user**
2. Crée : `pdg@gnabo.com` / mot de passe `admin123` (ou autre)
3. Crée : `admin@gnabo.com` / mot de passe `admin123`

Les rôles (admin/pdg) seront stockés dans une colonne `role` de la table `profiles`.

## Étape 8 : Configurer le stockage (Storage)

1. Dans Supabase, va dans **Storage**
2. Crée un bucket `logos` (public)
3. Crée un bucket `pdf-devis` (privé, accessible par les utilisateurs connectés)
4. Crée un bucket `photos-appareils` (privé)

### Politiques de sécurité (RLS)

Pour le bucket `logos` :
```
CREATE POLICY "Logos accessibles à tous"
ON storage.objects FOR SELECT
USING (bucket_id = 'logos');

CREATE POLICY "ADMIN peut uploader"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'logos'
  AND auth.role() = 'authenticated'
);
```

## Étape 9 : Supprimer le backend (progressivement)

Le serveur Express devient inutile puisque Supabase remplace :
- SQLite → PostgreSQL Supabase
- Sessions → Auth Supabase
- Upload fichiers → Storage Supabase
- API routes → client Supabase direct

Après migration complète, tu peux :
1. Garder le dossier `server/` comme archive
2. Supprimer les scripts `dev:server` dans le `package.json` racine
3. Supprimer `concurrently` des dépendances

## Étape 10 : Adapter le frontend

### Remplacer les appels API

Avant (api.ts) :
```ts
const res = await fetch('/api/v1/clients', { credentials: 'include' })
```

Après (supabase directement) :
```ts
const { data, error } = await supabase.from('clients').select('*')
```

### Connexion utilisateur

Avant :
```ts
fetch('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
```

Après :
```ts
const { data, error } = await supabase.auth.signInWithPassword({ email, password })
```

### Déconnexion

```ts
await supabase.auth.signOut()
```

### Protéger les routes

```tsx
import { useEffect } from 'react'
import { supabase } from '../services/supabase'

useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (!session) navigate('/login')
  })
}, [])
```

## Étape 11 : Déployer sur Render (Static Site)

1. Va sur https://render.com
2. Connecte-toi avec GitHub
3. Clique **"New +"** > **"Static Site"**
4. Connecte ton dépôt GitHub

### Configurer le Static Site

- **Name** : `gnabo-erp`
- **Branch** : `main`
- **Build Command** : `cd client && npm install && npm run build`
- **Publish Directory** : `client/dist`

### Variables d'environnement

Dans Render, va dans **Environment Variables** et ajoute :

```
VITE_SUPABASE_URL=https://xxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

### SPA Routing (important !)

Render sert des fichiers statiques. Pour que le routing React fonctionne (pas de 404 en refresh), ajoute un fichier `client/public/_redirects` :

```
/* /index.html 200
```

Ou dans les settings Render : ajoute une rewrite rule.
Va dans **Redirects/Rewrites** > **Add Rule** :
- **Source** : `/*`
- **Destination** : `/index.html`
- **Action** : `Rewrite`

## Étape 12 : PWA et mode hors ligne

La PWA est déjà configurée (vite-plugin-pwa). Pour le offline :

### Installer Dexie.js (IndexedDB)

```powershell
cd client
npm install dexie
```

### Créer un cache local

```ts
// src/services/db-local.ts
import Dexie from 'dexie'

const localDb = new Dexie('gnabo-offline')
localDb.version(1).stores({
  devis: '++id, client_id, statut, synced',
  clients: '++id, nom',
  devis_brouillons: '++id, synced'
})

export default localDb
```

### Synchronisation

```ts
// À appeler quand la connexion revient
async function syncOfflineData() {
  const pending = await localDb.devis_brouillons.where('synced').equals(0).toArray()
  for (const item of pending) {
    const { data, error } = await supabase.from('devis').insert(item)
    if (!error) {
      await localDb.devis_brouillons.update(item.id, { synced: 1 })
    }
  }
}
```

## Étape 13 : (Optionnel) API Server minimal sur Render

Si tu veux garder un serveur pour des traitements lourds (génération PDF côté serveur, calculs) :

1. Crée un service **Web Service** sur Render
2. Connecte le dossier `server/`
3. **Build Command** : `cd server && npm install && npm run build`
4. **Start Command** : `cd server && npm start`

Mais l'idéal est de migrer vers Supabase uniquement.

---

## Résumé des actions immédiates

| Action | Où |
|--------|-----|
| Créer compte Supabase | https://supabase.com |
| Créer projet, récupérer clés | Project Settings > API |
| Installer @supabase/supabase-js | `cd client && npm install @supabase/supabase-js` |
| Créer client/src/services/supabase.ts | Code ci-dessus |
| Créer .env avec VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY | `client/.env` |
| Exécuter le schéma SQL | Supabase > SQL Editor |
| Configurer Auth (Email) | Supabase > Authentication > Providers |
| Créer buckets (logos, pdf-devis, photos-appareils) | Supabase > Storage |
| Créer comptes utilisateurs | Supabase > Authentication > Users |
| Déployer sur Render | https://render.com > New > Static Site |
| Ajouter _redirects pour SPA | `client/public/_redirects` |
| Tester en ligne | URL Render donnée par Render |

## Commandes fréquentes

```powershell
# Démarrer en dev
cd client && npm run dev

# Build
cd client && npm run build

# Déployer sur Render
git add .
git commit -m "migration Supabase + Render"
git push
# Render détecte le push et rebuild automatiquement
```
