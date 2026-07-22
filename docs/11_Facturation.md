# Facturation

## Principe

Tout devis accepté génère une facture. Workflow :

```
Devis accepté → Facture → Paiement → Reçu
                                  → Garantie (Électronique)
```

## Création

- Automatique à partir du devis accepté
- Reprend l'intégralité des lignes du devis
- Numéro de facture unique (format : FA-YYYY-XXXX)
- Date d'émission = date du jour
- Date d'échéance (30 jours par défaut)
- Acompte déduit si déjà payé

## Types de facture

| Type | Usage |
|---|---|
| Facture standard | Devis accepté → facture |
| Avoir | Annulation totale ou partielle |
| Facture d'acompte | Acompte versé avant la fin des travaux |

## Contenu du PDF

- Logo et coordonnées de l'entreprise
- Numéro de facture, date d'émission, date d'échéance
- Coordonnées du client
- Tableau détaillé (réf, description, quantité, PU, TVA, total)
- Total HT, total TVA, total TTC
- Net à payer
- Mode de paiement acceptés
- IBAN / RIB (si virement)
- CGV

## Statuts

| Statut | Description |
|---|---|
| Impayée | En attente de paiement |
| Payée | Intégralement réglée |
| Avoir | Avoir émis (annulation) |

## Historique

Toute modification est tracée dans l'Audit Log.
