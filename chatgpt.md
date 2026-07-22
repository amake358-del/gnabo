Tu es maintenant responsable de la qualité et des tests automatisés du projet.

Le projet est une application ERP PWA professionnelle développée pour :

GNABO MULTI-SERVICES

Services :

- Aluminium & Inox
- Métallique
- Électronique

Objectif :

Mettre en place une suite de tests Playwright complète permettant de vérifier :

- toutes les fonctionnalités métier ;
- tous les écrans ;
- le responsive design ;
- la PWA ;
- la compatibilité téléphone/tablette/PC ;
- la stabilité de l'application ;
- les régressions visuelles.

==================================================
ÉTAPE 1 : ANALYSE DU PROJET
==================================================

Avant de créer les tests :

Analyser complètement le projet :

- structure frontend ;
- structure backend ;
- routes ;
- composants ;
- pages ;
- API ;
- base de données ;
- fonctionnalités disponibles.

Identifier :

- toutes les pages accessibles ;
- tous les parcours utilisateurs ;
- tous les formulaires ;
- tous les boutons ;
- toutes les actions importantes.

Créer un plan de test complet avant d'écrire les scripts.

==================================================
ÉTAPE 2 : CONFIGURATION PLAYWRIGHT
==================================================

Configurer Playwright professionnellement.

Créer :

playwright.config.ts

Avec :

- Chromium
- Firefox
- WebKit

Configurer :

- screenshots automatiques en cas d'erreur ;
- vidéos en cas d'échec ;
- traces Playwright ;
- rapports HTML ;
- retries ;
- timeout adaptés.

Créer les scripts npm :

npm run test

npm run test:ui

npm run test:report

npm run test:mobile

npm run test:tablet

npm run test:desktop

npm run test:pwa

npm run test:visual

npm run test:all


==================================================
ÉTAPE 3 : TESTS FONCTIONNELS COMPLETS
==================================================

Tester tous les modules.

# AUTHENTIFICATION / UTILISATEURS

Tester :

- accès PDG ;
- accès Administrateur ;
- permissions ;
- restrictions.

Vérifier que :

Le PDG peut :

- voir tous les services ;
- voir les statistiques ;
- gérer les paramètres ;
- gérer les sauvegardes.

L'administrateur peut :

- gérer les opérations quotidiennes.

==================================================

# ENTREPRISE

Tester :

Configuration Gnabo Multi-Services :

- logo ;
- RCCM ;
- email ;
- téléphone ;
- adresse ;
- paramètres PDF.

Vérifier que les informations apparaissent correctement dans les documents.

==================================================

# SERVICES

Tester :

Sélection :

- Aluminium & Inox
- Métallique
- Électronique

Vérifier :

- changement de contexte ;
- chargement des données correctes ;
- séparation des données entre services.

==================================================

# MODULE DEVIS

Tester :

Création devis.

Parcours complet :

Client

↓

Service

↓

Produits

↓

Calcul

↓

Validation

↓

PDF


Tester :

- ajout ligne ;
- suppression ligne ;
- modification ;
- calcul surface ;
- calcul prix ;
- remise ;
- transport ;
- pose ;
- TVA ;
- total ;
- acompte ;
- reste à payer.


==================================================

# MODULE PDF

Tester :

Génération :

- devis ;
- facture ;
- reçu ;
- diagnostic ;
- documents.

Vérifier :

- logo présent ;
- informations entreprise ;
- tableau lisible ;
- pied de page ;
- signature ;
- QR Code.

==================================================

# MODULE ÉLECTRONIQUE

Tester :

Réception appareil.

Créer un dossier :

- client ;
- téléphone ;
- appareil ;
- marque ;
- modèle ;
- panne ;
- accessoires.

Tester :

Diagnostic.

Tester :

Réparation.

Tester :

Changement de statut :

Reçu

Diagnostic

Réparation

Réparé

Prêt

Livré

Non réparable


==================================================

# QR CODE

Tester :

Génération QR.

Scénario :

Créer 100 QR Codes.

Vérifier :

- numérotation correcte ;
- aucun doublon ;
- génération PDF ;
- impression.


Tester scanner QR :

QR disponible :

Créer dossier.


QR déjà utilisé :

Afficher erreur.


QR inexistant :

Afficher erreur.


==================================================
ÉTIQUETTES
==================================================

Tester :

- génération A4 ;
- plusieurs formats ;
- alignement ;
- téléchargement PDF.


Vérifier :

Aucune étiquette coupée.

==================================================
STOCK

Tester :

- ajout produit ;
- entrée stock ;
- sortie stock ;
- utilisation pièce réparation ;
- historique.


==================================================
CAISSE

Tester :

- paiement complet ;
- acompte ;
- crédit ;
- solde ;
- historique.


==================================================
ÉTAPE 4 : TEST RESPONSIVE
==================================================

Tester obligatoirement :

## Téléphones

iPhone SE

375x667

iPhone 14

390x844


Android :

360x800

412x915


## Tablettes

768x1024

820x1180

1024x1366


## Ordinateurs

1366x768

1440x900

1920x1080


==================================================

Pour chaque écran vérifier :

- aucun chevauchement ;
- aucun texte coupé ;
- aucun bouton inaccessible ;
- aucun champ dépassant ;
- aucune erreur CSS ;
- aucun scroll horizontal inutile.


==================================================
ÉTAPE 5 : TEST MOBILE FIRST
==================================================

Vérifier particulièrement :

Téléphone :

- navigation ;
- menus ;
- formulaires ;
- création devis ;
- cartes produits ;
- boutons.

Les tableaux de saisie doivent devenir des cartes.

==================================================
ÉTAPE 6 : TEST PWA
==================================================

Tester :

Manifest.

Service Worker.

Installation.

Mode offline.

Cache.

Chargement après installation.

Icônes.

Splash screen.


==================================================
ÉTAPE 7 : TEST VISUEL
==================================================

Mettre en place :

Playwright screenshot comparison.

Créer des captures de référence :

- Dashboard ;
- Clients ;
- Devis ;
- PDF ;
- Electronique ;
- QR ;
- Paramètres.


Détecter :

- déplacement ;
- changement taille ;
- problème CSS ;
- élément disparu.


==================================================
ÉTAPE 8 : ACCESSIBILITÉ
==================================================

Tester :

- contraste ;
- navigation clavier ;
- focus ;
- labels ;
- boutons accessibles.


==================================================
ÉTAPE 9 : RAPPORT FINAL
==================================================

À la fin générer :

TEST_REPORT.md

Contenant :

- tests réussis ;
- tests échoués ;
- erreurs trouvées ;
- captures ;
- vidéos ;
- corrections nécessaires.


==================================================
RÈGLE IMPORTANTE
==================================================

Ne corrige pas uniquement les tests.

Si un test révèle un problème UX/UI :

Corriger directement le code.

L'objectif est d'obtenir une application :

- professionnelle ;
- stable ;
- responsive ;
- utilisable sur téléphone ;
- tablette ;
- ordinateur ;
- prête pour une utilisation commerciale.


Commence par analyser le projet actuel puis crée la stratégie de tests avant d'exécuter les scénarios.