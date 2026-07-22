# PDF

## Génération

Bibliothèque : `pdfmake` ou `@react-pdf/renderer` (côté client) ou `pdfkit` (côté serveur).

## Modèles

Tous les PDF suivent la même charte graphique :
- Logo Gnabo Multi-Services (en-tête)
- Coordonnées complètes (en-tête)
- Design professionnel sobre
- Police Inter
- QR Code ou code-barres (si pertinent)

### 1. Devis

- En-tête : logo, coordonnées, numéro devis, date
- Client : nom, adresse, téléphone
- Tableau : description, quantité, PU, TVA, total
- Totaux : HT, TVA, TTC
- Acompte (si applicable)
- Conditions : validité, pénalités de retard
- CGV au verso (optionnel)
- Cachet + signature

### 2. Facture

- Même structure que le devis
- Numéro de facture, date d'émission, échéance
- Net à payer
- IBAN / RIB

### 3. Bon de livraison (Électronique)

- En-tête Gnabo
- Client
- Appareil (marque, modèle, IMEI, UID)
- Accessoires rendus
- Signature client
- Date de livraison

### 4. Diagnostic

- Client
- Appareil
- Problème constaté
- Pièces nécessaires
- Coût estimé
- Photo (optionnel)

### 5. Reçu

- Client
- Montant
- Mode de paiement
- Facture associée
- Solde restant (si partiel)

### 6. Bon d'intervention

- Client + adresse chantier
- Service
- Technicien
- Date/heure
- Description des travaux
- Photos avant/après (optionnel)
- Signature client

### 7. Étiquette (A4 prédécoupée)

- 10 étiquettes par feuille
- QR Code + UID visible + marque/modèle + date

### 8. Rapport de caisse

- Période
- Encaissements
- Dépenses
- Solde début / fin
- Détail des mouvements

## Mise en page

- Marges : 20mm
- En-tête sur toutes les pages
- Pied de page : numéro page, date génération
- Taille police : 10pt corps, 8pt secondaire
- Qualité impression : 300 DPI
