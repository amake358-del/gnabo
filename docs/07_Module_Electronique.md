# Module Électronique

## Description

Le plus gros module. Gère la réparation de smartphones, tablettes, PC, consoles, etc.,
de la réception à la livraison, incluant le diagnostic, le devis, la facturation et la garantie.

## Workflow complet

```
Réception → Diagnostic → Devis → Validation client
  ↓
Réparation (si accepté)
  ↓
Facture → Paiement → Livraison → Garantie
```

---

### 1. Réception d'un appareil

- Recherche / création du client
- Saisie des informations appareil :
  - Type (smartphone, tablette, PC, console, autre)
  - Marque, modèle
  - Numéro de série, IMEI
  - Mot de passe (si communiqué)
  - Accessoires fournis (chargeur, écouteurs, coque, etc.)
- Diagnostic initial (défaut décrit par le client)
- État esthétique (Neuf, Bon, Moyen, Mauvais) — protection contre les litiges
- Photos de l'appareil (1-5 photos)
- Génération d'un QR Code et d'une étiquette
- Attribution d'un identifiant unique :
  - **UID interne** : 8 caractères hexadécimaux (ex: `8A7F2C91`) — utilisé dans le QR Code, ne change jamais
  - **UID visible** : format EL-XXXXXX (ex: `EL-000001`) — pour l'affichage, modifiable

### 2. QR Code

- Génération automatique à la réception
- Contient l'UID interne (hex)
- Impression sur étiquette autocollante
- Scan pour retrouver l'appareil (recherche rapide, changement de statut, livraison)
- Format A4 avec grille de plusieurs QR Codes

### 3. Diagnostic

- Description technique du problème (par le technicien)
- Liste des pièces nécessaires
- Coût estimé (pièces + main-d'œuvre)
- Durée estimée
- Photos internes (optionnel)
- Statut : en attente de validation client

### 4. Devis de réparation

- Généré automatiquement à partir du diagnostic
- Envoyé au client (PDF imprimé ou par email)
- Montant pièces + MO + TVA
- Acompte éventuel (optionnel)
- Expiration configurable (7 jours par défaut)
- Statuts : envoyé, accepté, refusé, expiré

### 5. Réparation

- Passage en "En réparation" dès que le client valide
- Suivi des pièces utilisées (déduction automatique du stock)
- Notes du technicien
- Changement de statut : "Prêt" une fois terminé
- Notification si l'appareil n'est pas récupéré sous 10 jours

### 6. Facture

- Générée à partir du devis accepté
- TVA appliquée
- Acompte déduit si payé
- Statut : impayée, payée, avoir

### 7. Paiement

- Modes : espèces, carte, chèque, virement, mobile money
- Paiement comptant ou échelonné
- Encaissement automatique dans la Caisse
- Génération du reçu PDF

### 8. Livraison

- Scan du QR Code pour charger l'appareil
- Vérification des accessoires rendus
- Signature électronique du client sur tablette
- Bon de livraison PDF
- Changement de statut : "Livré"

### 9. Garantie

- Appliquée automatiquement à la livraison
- Durées configurables : 30 jours, 90 jours, 6 mois
- Affichage "Sous garantie" / "Hors garantie" dans la fiche appareil
- Conditions générales imprimées sur le reçu

### 10. Appareils non récupérés

- Délai : 90 jours après mise à disposition
- Notification automatique à J+10, J+30, J+90
- Marquage "Non récupéré" — passage en créance

## Photos

Chaque appareil peut avoir une galerie de photos :
- À la réception (état initial)
- Pendant le diagnostic
- Après réparation
- Utile en cas de litige

## Identifiants

- L'UID interne (hex) est celui encodé dans le QR Code — il ne change jamais
- L'UID visible (EL-XXXXXX) peut être réattribué si besoin
- Avantage : si la numérotation visible change, les QR Codes existants restent valides
