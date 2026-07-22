# Devis

## Workflow général

```
Brouillon → Envoyé → Accepté → Facture
                ↘ Refusé → Archivé
                ↘ Expiré → Archivé
```

## Création

### Pour Aluminium & Métallique

1. Sélection / création du client
2. Choix du service (Aluminium ou Métallique)
3. Ajout de lignes au devis :
   - Description de l'ouvrage
   - Quantité
   - Prix unitaire HT
   - TVA
   - Dimensions (optionnel, pour calcul automatique)
4. Acompte (optionnel)
5. Validité (30 jours par défaut)
6. Notes internes (optionnel)

### Pour Électronique

1. Généré automatiquement à partir du diagnostic
2. Lignes pré-remplies (pièces + main-d'œuvre)
3. Montant pièces (issues du stock ou saisie manuelle)
4. Montant main-d'œuvre

## PDF

Le PDF devis contient :
- Logo de l'entreprise
- Coordonnées complètes (nom, adresse, téléphone, email, RCS/SIRET)
- Numéro de devis et date
- Coordonnées du client
- Tableau des prestations (description, quantité, PU, total)
- Total HT, TVA, Total TTC
- Acompte (si applicable)
- Conditions de paiement
- Date de validité
- Signature (PDG/Admin)

## Statuts

| Statut | Description |
|---|---|
| Brouillon | En cours de saisie, non finalisé |
| Envoyé | Transmis au client |
| Accepté | Client a donné son accord → Facture |
| Refusé | Client a refusé |
| Expiré | Délai de validité dépassé |

## Historique

Chaque modification est tracée dans l'Audit Log :
- Création, modification, changement de statut
- Anciennes et nouvelles valeurs
