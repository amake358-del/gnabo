# Interventions / Planning

## Description

Module transverse qui permet de planifier et suivre les interventions chez le client
(pose, installation, réparation sur site).

## Utilisation par service

| Service | Type d'intervention |
|---|---|
| Aluminium | Pose de portes, fenêtres, portails, vérandas |
| Métallique | Installation de portails, grilles, serrurerie |
| Électronique | Rare (dépannage sur site, limité) |

## Fonctionnalités

### 1. Création d'une intervention

- Liée à un devis accepté (optionnel)
- Client concerné
- Service concerné
- Technicien ou équipe assigné
- Date et heure prévues
- Adresse du chantier (peut différer de l'adresse du client)
- Notes / instructions

### 2. Suivi

| Statut | Description |
|---|---|
| Planifiée | Intervention créée, pas encore commencée |
| En cours | L'équipe est sur place |
| Terminée | Travaux finis, signée |
| Annulée | Reportée ou annulée |

### 3. Avant / Après

- Photos prises sur place (avant travaux, après travaux)
- Stockées dans la fiche intervention
- Protège contre les litiges

### 4. Signature électronique

- Client signe sur la tablette à la fin
- Signature enregistrée (canvas → PNG → Base64)
- Intégrée au bon d'intervention PDF

### 5. Documents

- Bon d'intervention PDF (généré au moment de l'impression)
- Compte-rendu détaillé
- Photos incluses dans le PDF (optionnel)

### 6. Vue planning

- Calendrier hebdomadaire / mensuel
- Interventions par jour
- Filtre par service, technicien, statut
- Drag & drop pour reporter une intervention
