# Audit Report

## Résumé
- Problèmes: 137
- Fichiers: 50

## Par sévérité
- 🟡: 95
- 🟢: 42

## Détails

| Sévérité | Fichier | Problème | Correction |
|----------|---------|----------|------------|
| 🟡 | pages/BackupsPage.tsx:76 | Champ sans label ni aria-label | Ajouter aria-label ou un label |
| 🟡 | pages/CataloguePage.tsx:66 | map() sans prop key | Ajouter key={item.id || i} |
| 🟡 | pages/DashboardPage.tsx:95 | map() sans prop key | Ajouter key={item.id || i} |
| 🟡 | pages/DashboardPage.tsx:101 | map() sans prop key | Ajouter key={item.id || i} |
| 🟡 | pages/DashboardPage.tsx:112 | map() sans prop key | Ajouter key={item.id || i} |
| 🟢 | pages/DashboardPage.tsx:103 | Style inline avec couleur | Utiliser une classe Tailwind |
| 🟢 | pages/DashboardPage.tsx:106 | Style inline avec couleur | Utiliser une classe Tailwind |
| 🟡 | pages/devis/DevisApercuStep.tsx:46 | map() sans prop key | Ajouter key={item.id || i} |
| 🟡 | pages/devis/DevisApercuStep.tsx:21 | Manipulation DOM directe | Utiliser useRef/useEffect |
| 🟡 | pages/devis/DevisClientStep.tsx:20 | map() sans prop key | Ajouter key={item.id || i} |
| 🟢 | pages/devis/DevisClientStep.tsx:21 | Bouton sans type explicite | Ajouter type="button" |
| 🟡 | pages/devis/DevisClientStep.tsx:17 | Champ sans label ni aria-label | Ajouter aria-label ou un label |
| 🟡 | pages/devis/DevisFormLayout.tsx:151 | map() sans prop key | Ajouter key={item.id || i} |
| 🟡 | pages/devis/DevisFormLayout.tsx:203 | map() sans prop key | Ajouter key={item.id || i} |
| 🟡 | pages/devis/DevisFormLayout.tsx:151 | map() sans prop key | Ajouter key={item.id || i} |
| 🟡 | pages/devis/DevisFormLayout.tsx:151 | map() sans prop key | Ajouter key={item.id || i} |
| 🟡 | pages/devis/DevisFormLayout.tsx:392 | map() sans prop key | Ajouter key={item.id || i} |
| 🟢 | pages/devis/DevisFormLayout.tsx:394 | Bouton sans type explicite | Ajouter type="button" |
| 🟡 | pages/devis/DevisFormLayout.tsx:312 | Manipulation DOM directe | Utiliser useRef/useEffect |
| 🟡 | pages/devis/DevisLignesStep.tsx:27 | map() sans prop key | Ajouter key={item.id || i} |
| 🟡 | pages/devis/DevisLignesStep.tsx:27 | map() sans prop key | Ajouter key={item.id || i} |
| 🟡 | pages/devis/DevisModeleStep.tsx:15 | map() sans prop key | Ajouter key={item.id || i} |
| 🟢 | pages/devis/DevisModeleStep.tsx:16 | Bouton sans type explicite | Ajouter type="button" |
| 🟡 | pages/devis/DevisTypeStep.tsx:11 | map() sans prop key | Ajouter key={item.id || i} |
| 🟢 | pages/devis/DevisTypeStep.tsx:12 | Bouton sans type explicite | Ajouter type="button" |
| 🟡 | pages/DevisFormPage.tsx:78 | map() sans prop key | Ajouter key={item.id || i} |
| 🟡 | pages/DevisFormPage.tsx:131 | map() sans prop key | Ajouter key={item.id || i} |
| 🟡 | pages/DevisFormPage.tsx:78 | map() sans prop key | Ajouter key={item.id || i} |
| 🟡 | pages/DevisFormPage.tsx:78 | map() sans prop key | Ajouter key={item.id || i} |
| 🟡 | pages/DevisFormPage.tsx:291 | map() sans prop key | Ajouter key={item.id || i} |
| 🟡 | pages/DevisFormPage.tsx:307 | map() sans prop key | Ajouter key={item.id || i} |
| 🟡 | pages/DevisFormPage.tsx:325 | map() sans prop key | Ajouter key={item.id || i} |
| 🟡 | pages/DevisFormPage.tsx:353 | map() sans prop key | Ajouter key={item.id || i} |
| 🟡 | pages/DevisFormPage.tsx:379 | map() sans prop key | Ajouter key={item.id || i} |
| 🟡 | pages/DevisFormPage.tsx:78 | map() sans prop key | Ajouter key={item.id || i} |
| 🟢 | pages/DevisFormPage.tsx:293 | Bouton sans type explicite | Ajouter type="button" |
| 🟢 | pages/DevisFormPage.tsx:308 | Bouton sans type explicite | Ajouter type="button" |
| 🟢 | pages/DevisFormPage.tsx:326 | Bouton sans type explicite | Ajouter type="button" |
| 🟢 | pages/DevisFormPage.tsx:354 | Bouton sans type explicite | Ajouter type="button" |
| 🟢 | pages/DevisFormPage.tsx:293 | Bouton sans type explicite | Ajouter type="button" |
| 🟢 | pages/DevisFormPage.tsx:293 | Bouton sans type explicite | Ajouter type="button" |
| 🟡 | pages/DevisFormPage.tsx:203 | Manipulation DOM directe | Utiliser useRef/useEffect |
| 🟡 | pages/DevisFormPage.tsx:350 | Champ sans label ni aria-label | Ajouter aria-label ou un label |
| 🟡 | pages/DevisFormPage.tsx:383 | Champ sans label ni aria-label | Ajouter aria-label ou un label |
| 🟡 | pages/DevisFormPage.tsx:383 | Champ sans label ni aria-label | Ajouter aria-label ou un label |
| 🟡 | pages/DevisFormPage.tsx:383 | Champ sans label ni aria-label | Ajouter aria-label ou un label |
| 🟡 | pages/DevisFormPage.tsx:383 | Champ sans label ni aria-label | Ajouter aria-label ou un label |
| 🟡 | pages/DevisFormPage.tsx:383 | Champ sans label ni aria-label | Ajouter aria-label ou un label |
| 🟡 | pages/DevisFormPage.tsx:383 | Champ sans label ni aria-label | Ajouter aria-label ou un label |
| 🟡 | pages/DevisFormPage.tsx:404 | Champ sans label ni aria-label | Ajouter aria-label ou un label |
| 🟡 | pages/DevisFormPage.tsx:404 | Champ sans label ni aria-label | Ajouter aria-label ou un label |
| 🟡 | pages/DevisFormPage.tsx:404 | Champ sans label ni aria-label | Ajouter aria-label ou un label |
| 🟡 | pages/DevisFormPage.tsx:404 | Champ sans label ni aria-label | Ajouter aria-label ou un label |
| 🟡 | pages/DevisFormPage.tsx:404 | Champ sans label ni aria-label | Ajouter aria-label ou un label |
| 🟡 | pages/DevisFormPage.tsx:404 | Champ sans label ni aria-label | Ajouter aria-label ou un label |
| 🟡 | pages/electronique/AppareilDetailPage.tsx:144 | map() sans prop key | Ajouter key={item.id || i} |
| 🟡 | pages/electronique/AppareilDetailPage.tsx:192 | map() sans prop key | Ajouter key={item.id || i} |
| 🟡 | pages/electronique/AppareilDetailPage.tsx:215 | map() sans prop key | Ajouter key={item.id || i} |
| 🟢 | pages/electronique/AppareilDetailPage.tsx:59 | Bouton sans type explicite | Ajouter type="button" |
| 🟡 | pages/electronique/AppareilListPage.tsx:70 | map() sans prop key | Ajouter key={item.id || i} |
| 🟢 | pages/electronique/AppareilListPage.tsx:73 | Bouton sans type explicite | Ajouter type="button" |
| 🟡 | pages/electronique/AppareilListPage.tsx:55 | Champ sans label ni aria-label | Ajouter aria-label ou un label |
| 🟡 | pages/electronique/DevisElectroniquePage.tsx:90 | map() sans prop key | Ajouter key={item.id || i} |
| 🟢 | pages/electronique/DevisElectroniquePage.tsx:78 | Bouton sans type explicite | Ajouter type="button" |
| 🟢 | pages/electronique/DevisElectroniquePage.tsx:78 | Bouton sans type explicite | Ajouter type="button" |
| 🟡 | pages/electronique/DevisElectroniquePage.tsx:93 | Champ sans label ni aria-label | Ajouter aria-label ou un label |
| 🟡 | pages/electronique/DevisElectroniquePage.tsx:93 | Champ sans label ni aria-label | Ajouter aria-label ou un label |
| 🟡 | pages/electronique/DevisElectroniquePage.tsx:93 | Champ sans label ni aria-label | Ajouter aria-label ou un label |
| 🟡 | pages/electronique/DevisElectroniquePage.tsx:113 | Champ sans label ni aria-label | Ajouter aria-label ou un label |
| 🟢 | pages/electronique/DiagnosticPage.tsx:84 | Bouton sans type explicite | Ajouter type="button" |
| 🟡 | pages/electronique/EtiquettesPage.tsx:35 | map() sans prop key | Ajouter key={item.id || i} |
| 🟡 | pages/electronique/EtiquettesPage.tsx:98 | map() sans prop key | Ajouter key={item.id || i} |
| 🟡 | pages/electronique/EtiquettesPage.tsx:51 | Manipulation DOM directe | Utiliser useRef/useEffect |
| 🟡 | pages/electronique/FactureElectroniquePage.tsx:91 | map() sans prop key | Ajouter key={item.id || i} |
| 🟢 | pages/electronique/FactureElectroniquePage.tsx:79 | Bouton sans type explicite | Ajouter type="button" |
| 🟢 | pages/electronique/FactureElectroniquePage.tsx:79 | Bouton sans type explicite | Ajouter type="button" |
| 🟡 | pages/electronique/FactureElectroniquePage.tsx:94 | Champ sans label ni aria-label | Ajouter aria-label ou un label |
| 🟡 | pages/electronique/FactureElectroniquePage.tsx:94 | Champ sans label ni aria-label | Ajouter aria-label ou un label |
| 🟡 | pages/electronique/FactureElectroniquePage.tsx:94 | Champ sans label ni aria-label | Ajouter aria-label ou un label |
| 🟡 | pages/electronique/FactureElectroniquePage.tsx:114 | Champ sans label ni aria-label | Ajouter aria-label ou un label |
| 🟡 | pages/electronique/PaiementPage.tsx:99 | map() sans prop key | Ajouter key={item.id || i} |
| 🟡 | pages/electronique/PaiementPage.tsx:123 | map() sans prop key | Ajouter key={item.id || i} |
| 🟢 | pages/electronique/PaiementPage.tsx:66 | Bouton sans type explicite | Ajouter type="button" |
| 🟢 | pages/electronique/PaiementPage.tsx:66 | Bouton sans type explicite | Ajouter type="button" |
| 🟡 | pages/electronique/QrCodesPage.tsx:62 | map() sans prop key | Ajouter key={item.id || i} |
| 🟢 | pages/electronique/ReceptionPage.tsx:140 | Bouton sans type explicite | Ajouter type="button" |
| 🟡 | pages/electronique/ReceptionPage.tsx:128 | Champ sans label ni aria-label | Ajouter aria-label ou un label |
| 🟡 | pages/electronique/ReparationPage.tsx:119 | map() sans prop key | Ajouter key={item.id || i} |
| 🟡 | pages/electronique/ReparationPage.tsx:166 | map() sans prop key | Ajouter key={item.id || i} |
| 🟢 | pages/electronique/ReparationPage.tsx:94 | Bouton sans type explicite | Ajouter type="button" |
| 🟢 | pages/electronique/ReparationPage.tsx:120 | Bouton sans type explicite | Ajouter type="button" |
| 🟡 | pages/EntrepriseSelectPage.tsx:48 | map() sans prop key | Ajouter key={item.id || i} |
| 🟢 | pages/EntrepriseSelectPage.tsx:56 | Style inline avec couleur | Utiliser une classe Tailwind |
| 🟡 | pages/ModelesPage.tsx:101 | map() sans prop key | Ajouter key={item.id || i} |
| 🟡 | pages/ModelesPage.tsx:101 | map() sans prop key | Ajouter key={item.id || i} |
| 🟡 | pages/ModelesPage.tsx:99 | Champ sans label ni aria-label | Ajouter aria-label ou un label |
| 🟡 | pages/ServiceSelectPage.tsx:61 | map() sans prop key | Ajouter key={item.id || i} |
| 🟢 | pages/ServiceSelectPage.tsx:71 | Style inline avec couleur | Utiliser une classe Tailwind |
| 🟡 | pages/SettingsPage.tsx:117 | Champ sans label ni aria-label | Ajouter aria-label ou un label |
| 🟡 | pages/SettingsPage.tsx:129 | Champ sans label ni aria-label | Ajouter aria-label ou un label |
| 🟡 | pages/SettingsPage.tsx:141 | Champ sans label ni aria-label | Ajouter aria-label ou un label |
| 🟢 | components/devis/DevisLineCard.tsx:52 | Bouton sans type explicite | Ajouter type="button" |
| 🟢 | components/devis/DevisLineCard.tsx:52 | Bouton sans type explicite | Ajouter type="button" |
| 🟢 | components/devis/DevisLineCard.tsx:52 | Bouton sans type explicite | Ajouter type="button" |
| 🟡 | components/devis/DevisLineCard.tsx:100 | Champ sans label ni aria-label | Ajouter aria-label ou un label |
| 🟡 | components/devis/DevisLineCard.tsx:100 | Champ sans label ni aria-label | Ajouter aria-label ou un label |
| 🟡 | components/devis/DevisLineCard.tsx:100 | Champ sans label ni aria-label | Ajouter aria-label ou un label |
| 🟡 | components/devis/DevisLineCard.tsx:100 | Champ sans label ni aria-label | Ajouter aria-label ou un label |
| 🟡 | components/devis/DevisLineCard.tsx:100 | Champ sans label ni aria-label | Ajouter aria-label ou un label |
| 🟡 | components/devis/DevisLineCard.tsx:100 | Champ sans label ni aria-label | Ajouter aria-label ou un label |
| 🟢 | components/entreprise/EntrepriseCard.tsx:16 | Style inline avec couleur | Utiliser une classe Tailwind |
| 🟡 | components/layout/Sidebar.tsx:69 | map() sans prop key | Ajouter key={item.id || i} |
| 🟡 | components/layout/Sidebar.tsx:78 | map() sans prop key | Ajouter key={item.id || i} |
| 🟢 | components/layout/Sidebar.tsx:63 | Bouton sans type explicite | Ajouter type="button" |
| 🟡 | components/Layout.tsx:23 | map() sans prop key | Ajouter key={item.id || i} |
| 🟢 | components/Layout.tsx:37 | Bouton sans type explicite | Ajouter type="button" |
| 🟢 | components/pwa/PwaInstallPrompt.tsx:31 | Bouton sans type explicite | Ajouter type="button" |
| 🟢 | components/ui/Modal.tsx:35 | Bouton sans type explicite | Ajouter type="button" |
| 🟡 | components/ui/Modal.tsx:14 | Manipulation DOM directe | Utiliser useRef/useEffect |
| 🟡 | components/ui/Table.tsx:28 | map() sans prop key | Ajouter key={item.id || i} |
| 🟡 | components/ui/Table.tsx:36 | map() sans prop key | Ajouter key={item.id || i} |
| 🟡 | components/ui/Table.tsx:28 | map() sans prop key | Ajouter key={item.id || i} |
| 🟡 | components/ui/Toast.tsx:23 | map() sans prop key | Ajouter key={item.id || i} |
| 🟢 | components/ui/Toast.tsx:31 | Bouton sans type explicite | Ajouter type="button" |
| 🟡 | pages/devis/DevisApercuStep.tsx:1 | Page sans titre h1 | Ajouter un h1 pour l'accessibilité |
| 🟡 | pages/devis/DevisClientStep.tsx:1 | Page sans titre h1 | Ajouter un h1 pour l'accessibilité |
| 🟡 | pages/devis/DevisLignesStep.tsx:1 | Page sans titre h1 | Ajouter un h1 pour l'accessibilité |
| 🟡 | pages/devis/DevisModeleStep.tsx:1 | Page sans titre h1 | Ajouter un h1 pour l'accessibilité |
| 🟡 | pages/devis/DevisTypeStep.tsx:1 | Page sans titre h1 | Ajouter un h1 pour l'accessibilité |
| 🟡 | pages/electronique/AppareilDetailPage.tsx:1 | Page sans titre h1 | Ajouter un h1 pour l'accessibilité |
| 🟢 | pages/BackupsPage.tsx:24 | console.error sans feedback utilisateur | Ajouter notification toast |
| 🟢 | pages/CataloguePage.tsx:25 | console.error sans feedback utilisateur | Ajouter notification toast |
| 🟢 | pages/DevisListPage.tsx:37 | console.error sans feedback utilisateur | Ajouter notification toast |
| 🟢 | pages/electronique/AppareilListPage.tsx:36 | console.error sans feedback utilisateur | Ajouter notification toast |
| 🟢 | pages/electronique/QrCodesPage.tsx:22 | console.error sans feedback utilisateur | Ajouter notification toast |
| 🟢 | pages/ModelesPage.tsx:48 | console.error sans feedback utilisateur | Ajouter notification toast |
| 🟢 | pages/UsersPage.tsx:28 | console.error sans feedback utilisateur | Ajouter notification toast |