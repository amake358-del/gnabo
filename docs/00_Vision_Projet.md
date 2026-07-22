# Cahier des Charges — ERP Gnabo Multi-Services

## Tome 1 : Vision, Analyse et Spécifications Générales

---

### 1. Présentation de l'entreprise

**Gnabo Multi-Services** est une entreprise artisanale proposant trois métiers complémentaires :

| Service | Activité |
|---|---|
| Aluminium & Inox | Fabrication et pose de portes, fenêtres, portails, garde-corps, vérandas |
| Métallique | Serrurerie, ferronnerie, structures métalliques sur mesure |
| Électronique | Réparation de smartphones, tablettes, ordinateurs, consoles |

### 2. Vision du logiciel

ERP métier unifié couvrant **l'intégralité du cycle de vie** des prestations : du premier contact client jusqu'à la livraison, en passant par le devis, la fabrication, la réparation, la facturation et le suivi garantie.

### 3. Objectifs

- Remplacer le papier et les fichiers éparpillés par un système centralisé
- Permettre un accès depuis l'atelier (tablette), le bureau (PC) et le terrain (téléphone)
- Générer des documents professionnels (devis, factures, bons, étiquettes)
- Assurer la traçabilité complète de chaque intervention
- Gérer les stocks de pièces et matériaux en temps réel
- Fonctionner sans connexion Internet (PWA offline-first)

### 4. Périmètre

**Inclus dans la V1 :**

- Gestion des clients et appareils
- Module Aluminium & Inox (devis, catalogue)
- Module Métallique (devis, catalogue)
- Module Électronique (réception, diagnostic, réparation, facture, garantie)
- QR Codes et étiquettes
- Devis → Facture → Paiement → Reçu → Garantie
- Caisse (encaissements, dépenses, solde)
- Gestion des stocks
- Planning / Interventions
- PDF professionnels
- PWA (offline, installation)
- Authentification (PDG + Admin)
- Journal d'audit (Audit Log)

**Reporté en V2 :**

- Multi-utilisateurs avancé avec rôles granulaires
- Synchronisation cloud temps réel
- Notifications SMS / WhatsApp
- Statistiques prédictives
- Rapports financiers complexes

### 5. Contraintes

- **Mobile-first** : conçu pour la tablette en atelier
- **Offline-first** : PWA avec synchronisation différée
- **Stockage local** : SQLite (via better-sqlite3)
- ** Mono-poste ou réseau local** : déploiement progressif
- **Sécurité** : sessions, permissions par rôle, audit log

### 6. Architecture générale

```
┌──────────────────────────────────────────┐
│              PWA (React + Vite)           │
│  ┌─────────┐ ┌─────────┐ ┌────────────┐ │
│  │ Mobile  │ │Tablette │ │    PC      │ │
│  │  (415px)│ │ (768px) │ │ (1024px+)  │ │
│  └─────────┘ └─────────┘ └────────────┘ │
├──────────────────────────────────────────┤
│          API REST (Express)              │
├──────────────────────────────────────────┤
│          SQLite (better-sqlite3)         │
├──────────────────────────────────────────┤
│     Service Worker (cache offline)       │
└──────────────────────────────────────────┘
```

### 7. Utilisateurs

| Rôle | Périmètre |
|---|---|
| **PDG** | Accès complet : finances, paramètres, utilisateurs, sauvegardes, statistiques |
| **Administrateur** | Exploitation : devis, clients, réparations, paiements, stocks |

### 8. Glossaire

| Terme | Définition |
|---|---|
| ERP | Progiciel de gestion intégré |
| PWA | Progressive Web Application |
| QR Code | Code-barres 2D pour identification rapide |
| Audit Log | Journal chronologique de toutes les actions |
| Devis | Document préliminaire détaillant les prestations et le prix |
| BL | Bon de livraison |
| BT | Bon de travail / diagnostic |
