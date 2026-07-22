# API REST

## Base URL

```
/api/v1/
```

## Authentification

Toutes les routes (sauf `/auth/login`) nécessitent un cookie de session valide.

### Auth

| Méthode | Route | Corps | Description |
|---|---|---|---|
| POST | /api/v1/auth/login | `{ email, mot_de_passe }` | Connexion |
| POST | /api/v1/auth/logout | — | Déconnexion |
| GET | /api/v1/auth/me | — | Infos utilisateur courant |

### Clients

| Méthode | Route | Description |
|---|---|---|
| GET | /api/v1/clients | Liste (filtres : nom, téléphone) |
| GET | /api/v1/clients/:id | Détail |
| POST | /api/v1/clients | Créer |
| PUT | /api/v1/clients/:id | Modifier |
| DELETE | /api/v1/clients/:id | Supprimer (corbeille) |

### Appareils (Électronique)

| Méthode | Route | Description |
|---|---|---|
| GET | /api/v1/appareils | Liste (filtres : statut, client) |
| GET | /api/v1/appareils/:id | Détail complet |
| GET | /api/v1/appareils/uid/:uid | Recherche par UID (scan QR) |
| POST | /api/v1/appareils | Créer (réception) + génération QR |
| PUT | /api/v1/appareils/:id | Modifier |
| PATCH | /api/v1/appareils/:id/statut | Changer statut |
| DELETE | /api/v1/appareils/:id | Supprimer (corbeille) |
| POST | /api/v1/appareils/:id/photos | Ajouter photo |
| GET | /api/v1/appareils/:id/photos | Liste photos |

### Diagnostics

| Méthode | Route | Description |
|---|---|---|
| GET | /api/v1/diagnostics/:appareil_id | Diagnostic d'un appareil |
| POST | /api/v1/diagnostics | Créer diagnostic |
| PUT | /api/v1/diagnostics/:id | Modifier |

### Devis

| Méthode | Route | Description |
|---|---|---|
| GET | /api/v1/devis | Liste (filtres : service, statut, client) |
| GET | /api/v1/devis/:id | Détail avec lignes |
| POST | /api/v1/devis | Créer (avec lignes) |
| PUT | /api/v1/devis/:id | Modifier |
| PATCH | /api/v1/devis/:id/statut | Changer statut |
| GET | /api/v1/devis/:id/pdf | Télécharger PDF |

### Factures

| Méthode | Route | Description |
|---|---|---|
| GET | /api/v1/factures | Liste |
| GET | /api/v1/factures/:id | Détail |
| POST | /api/v1/factures | Générer depuis devis |
| GET | /api/v1/factures/:id/pdf | Télécharger PDF |

### Paiements

| Méthode | Route | Description |
|---|---|---|
| GET | /api/v1/paiements | Liste (filtres : facture, client) |
| POST | /api/v1/paiements | Enregistrer paiement |
| GET | /api/v1/paiements/:id/reçu | Télécharger reçu PDF |

### Caisse

| Méthode | Route | Description |
|---|---|---|
| GET | /api/v1/caisse | Liste mouvements (filtres : date, type) |
| GET | /api/v1/caisse/solde | Solde actuel |
| POST | /api/v1/caisse/depense | Ajouter dépense (PDG) |
| GET | /api/v1/caisse/rapport | Rapport PDF (PDG) |

### Stock

| Méthode | Route | Description |
|---|---|---|
| GET | /api/v1/stock | Liste articles |
| GET | /api/v1/stock/alertes | Articles sous seuil |
| POST | /api/v1/stock/entree | Entrée de stock |
| POST | /api/v1/stock/sortie | Sortie de stock |
| PUT | /api/v1/stock/:id | Modifier article |
| POST | /api/v1/stock/categories | Créer catégorie |

### Interventions

| Méthode | Route | Description |
|---|---|---|
| GET | /api/v1/interventions | Liste (filtres : date, statut, service) |
| GET | /api/v1/interventions/planning | Vue planning |
| POST | /api/v1/interventions | Créer |
| PUT | /api/v1/interventions/:id | Modifier |
| PATCH | /api/v1/interventions/:id/statut | Changer statut |
| POST | /api/v1/interventions/:id/signature | Enregistrer signature |
| POST | /api/v1/interventions/:id/photos | Ajouter photos |

### QR Codes

| Méthode | Route | Description |
|---|---|---|
| GET | /api/v1/qrcodes/:appareil_id | Image QR Code |
| POST | /api/v1/qrcodes/imprimer | Générer PDF A4 d'impression |

### Audit Log

| Méthode | Route | Description |
|---|---|---|
| GET | /api/v1/audit | Liste (filtres : module, date, utilisateur) |

### Paramètres

| Méthode | Route | Description |
|---|---|---|
| GET | /api/v1/parametres | Tous les paramètres (PDG) |
| PUT | /api/v1/parametres/:cle | Modifier paramètre (PDG) |

### Sauvegarde

| Méthode | Route | Description |
|---|---|---|
| POST | /api/v1/backup | Créer sauvegarde (PDG) |
| GET | /api/v1/backup | Liste sauvegardes (PDG) |
| POST | /api/v1/backup/restore | Restaurer (PDG) |
