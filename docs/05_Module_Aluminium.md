# Module Aluminium & Inox

## Description

Gère les devis, fabrications et poses pour l'activité Aluminium & Inox :
portes, fenêtres, portails, garde-corps, vérandas, rampes, escaliers.

## Fonctionnalités

### 1. Catalogue produits

- Catégories : Portes, Fenêtres, Portails, Garde-corps, Vérandas, Rampes, Escaliers, Divers
- Chaque produit a : nom, description, prix de base, unité (m², m, unité), photo
- Dimensions standard configurables

### 2. Devis

- Création rapide : sélection client → sélection produits → dimensions → options
- Calcul automatique :
  - Prix selon dimensions (prix au m² × surface)
  - Options (vitrage, quincaillerie, couleur)
  - TVA (taux configurable)
  - Remise éventuelle
- Génération du PDF devis
- Statuts : brouillon, envoyé, accepté, refusé, expiré

### 3. Modèles

- Sauvegarde de configurations récurrentes (ex : "Porte coulissante 2 vantaux 240×215")
- Réutilisation en un clic

### 4. Fabrication

- Quand un devis est accepté : génération d'une fiche de fabrication
- Liste des matériaux nécessaires (déduits du stock)
- Dimensions et instructions
- Statuts : à fabriquer, en cours, fabriqué

### 5. Interventions (pose)

- Planification de la pose
- Attribution à un technicien ou une équipe
- Adresse du chantier
- Photos avant/après
- Signature client à la fin
- Génération du bon d'intervention PDF

## PDF générés

- Devis (avec logo, coordonnées, récapitulatif détaillé)
- Bon de commande fournisseur
- Fiche de fabrication
- Bon d'intervention
- Facture
