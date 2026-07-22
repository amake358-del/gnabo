# Module Métallique

## Description

Gère l'activité Métallique : serrurerie, ferronnerie, structures métalliques sur mesure,
portails, grilles, garde-corps, escaliers métalliques.

## Fonctionnalités

### 1. Catalogue produits

- Catégories : Portails, Grilles, Garde-corps, Escaliers métalliques, Serrurerie, Structures, Divers
- Chaque produit : nom, description, prix de base, unité, photo
- Types de métal : acier, fer forgé, inox, alu
- Finitions : brut, peint, galvanisé, thermolaqué

### 2. Devis

- Création : client → type d'ouvrage → dimensions → matériau → finition
- Calcul automatique :
  - Prix matière (prix au kg × poids estimé)
  - Main-d'œuvre (forfait ou horaire)
  - Options (traitement anti-corrosion, peinture spéciale)
  - TVA
  - Remise
- Les mêmes statuts que le module Aluminium

### 3. Fabrication

- Fiche de fabrication avec :
  - Plan/croquis (photo ou PDF importé)
  - Liste des fournitures (tubes, plaques, quincaillerie, peinture)
  - Dimensions précises
  - Instructions de soudure / assemblage
- Statuts : à fabriquer, en cours, fabriqué

### 4. Interventions

- Pose ou installation chez le client
- Mêmes fonctionnalités que le module Aluminium

## PDF générés

- Devis détaillé avec descriptif technique
- Fiche de fabrication
- Bon d'intervention / pose
- Facture

## Notes

- Une grande partie du code est mutualisée avec le module Aluminium (catalogue, devis, interventions)
- Les spécificités sont le type de métal, les finitions, et le mode de calcul (kg vs m²)
- Un seul composant React "ProduitService" paramétré par service
