# QR Codes

## Principe

Chaque appareil du module Électronique reçoit un QR Code contenant son **UID interne** (8 caractères hexadécimaux).

Cet UID est :
- Unique et non réutilisable (même après suppression de l'appareil)
- Indépendant de la numérotation visible (EL-000001)
- Encodé directement dans le QR Code
- Utilisé pour toutes les opérations de scan

## Génération

- Automatique à la réception d'un appareil
- Bibliothèque : `qrcode` (côté serveur) ou `html5-qrcode` (côté client)
- Format : PNG, 300×300 px minimum
- Contient uniquement l'UID interne (texte brut)

## Impression

- Format A4
- Grille configurable (2×5, 3×6, 4×7)
- Chaque QR Code est accompagné de :
  - UID visible (EL-000001)
  - Marque / Modèle
  - Date de réception
- Prédécoupage : traits de coupe pour étiquettes autocollantes
- Bouton "Imprimer" dans l'interface

## Scanner

- Intégré dans l'interface PWA (via la caméra)
- Ouverture d'un scanner modal
- Scan → recherche immédiate de l'appareil
- Résultat : fiche appareil avec toutes les informations
- Actions rapides après scan :
  - Changer le statut
  - Enregistrer un paiement
  - Marquer comme livré

## Points de scan

| Lieu | Action |
|---|---|
| Réception | Génération et impression |
| Atelier | Recherche rapide, mise à jour statut |
| Comptoir | Paiement, livraison |
| Client | Historique complet |

## Sécurité

- Un QR Code ne peut pas être dupliqué (l'UID est unique)
- Si un QR Code est perdu, on peut en réimprimer un (même UID interne)
- Si un appareil est supprimé, son UID interne est marqué comme "supprimé" et ne peut pas être réattribué
