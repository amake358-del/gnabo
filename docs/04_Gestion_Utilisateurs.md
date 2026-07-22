# Gestion des Utilisateurs

## Rôles

Deux rôles distincts avec des périmètres clairement séparés.

---

### 1. PDG (Propriétaire)

Accès complet et inconditionnel.

**Peut :**
- Voir tous les services et leurs tableaux de bord
- Voir les statistiques globales et par service
- Voir les finances, bénéfices, rapports
- Modifier les paramètres de l'entreprise
- Gérer les utilisateurs (créer, modifier, désactiver)
- Gérer les sauvegardes et restaurations
- Modifier les tarifs et le catalogue
- Voir tous les devis, réparations, paiements
- Exporter toutes les données (PDF, CSV)
- Supprimer définitivement (via corbeille)
- Configurer les services (couleur, icône, statuts, champs personnalisés)

**Ne peut pas :** (aucune restriction)

---

### 2. Administrateur

Gère uniquement l'exploitation quotidienne.

**Peut :**
- Créer et modifier des devis
- Gérer les clients
- Gérer les appareils (réception, diagnostic, réparation)
- Créer des factures
- Enregistrer les paiements
- Générer les QR Codes et étiquettes
- Imprimer les PDF
- Gérer le catalogue et les stocks
- Consulter les statistiques opérationnelles
- Planifier des interventions

**Ne peut pas :**
- Modifier les informations légales de l'entreprise
- Supprimer la base de données
- Restaurer une sauvegarde
- Gérer les comptes utilisateurs
- Modifier les paramètres globaux
- Modifier les permissions
- Voir les bénéfices nets
- Voir les rapports financiers détaillés

---

## Authentification

- Connexion par email + mot de passe
- Sessions gérées côté serveur (express-session)
- Durée de session : 24h, renouvelable
- Déconnexion après inactivité (configurable)
- 3 tentatives échouées → blocage 15 minutes

## Écran de connexion

- Logo Gnabo Multi-Services
- Champ email
- Champ mot de passe
- Bouton "Se connecter"
- Lien "Mot de passe oublié" (V2)

## Journal d'activité (Audit Log)

Chaque action est horodatée et signée :

| Champ | Description |
|---|---|
| Date/heure | Format ISO 8601 |
| Utilisateur | Nom + rôle |
| Module | devis, facture, stock, caisse, etc. |
| Action | création, modification, suppression, connexion |
| Ancienne valeur | JSON (null si création) |
| Nouvelle valeur | JSON (null si suppression) |
| Adresse IP | Collectée si disponible |

**Événements tracés :**
- Connexion / déconnexion
- Création / modification / suppression d'un client
- Création / modification / suppression d'un devis
- Changement de statut d'un appareil
- Paiement enregistré
- QR Code généré
- Étiquette imprimée
- Mouvement de stock
- Sauvegarde ou restauration
- Modification des paramètres
