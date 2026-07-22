# Caisse

## Description

Module financier central qui enregistre tous les mouvements d'argent.

## Principes

- Les paiements de factures alimentent automatiquement la caisse (encaissement)
- Les dépenses sont saisies manuellement
- Le solde est calculé en temps réel
- Seul le PDG voit les bénéfices et rapports financiers

## Types de mouvement

| Type | Origine |
|---|---|
| Encaissement | Paiement de facture, vente directe |
| Dépense | Achat fournisseur, loyer, électricité, consommables |
| Acompte reçu | Versé par le client avant le devis |
| Crédit | Vente à crédit |

## Affichage

### Encaissements du jour
- Cumul des paiements du jour
- Par mode de paiement

### Encaissements du mois
- Cumul mensuel
- Comparaison avec le mois précédent

### Dépenses
- Liste des sorties d'argent
- Catégorie : fournisseurs, loyer, électricité, consommables, autre

### Solde
- Solde actuel
- Évolution sur 30 jours (mini graphique)

### Historique
- Tous les mouvements chronologiques
- Filtres par type, date, montant

## Export

- PDF : relevé de caisse (jour / mois / période personnalisée)
- PDF : rapport d'encaissements
- Réservé au PDG

## Sécurité

- Toute entrée/sortie est tracée dans l'Audit Log
- Impossible de supprimer un mouvement (annulation par contre-passation)
- Seul le PDG peut enregistrer une dépense
- L'Admin peut voir la caisse mais pas la modifier
