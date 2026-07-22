# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: functional\02-navigation.spec.ts >> Navigation entre les pages >> charge la page Interventions (/interventions) sans erreur console
- Location: tests\functional\02-navigation.spec.ts:29:9

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 6

- Array []
+ Array [
+   "Error: Non authentifié
+     at request (http://localhost:5173/src/services/api.js?t=1784687659645:14:15)",
+   "Error: Non authentifié
+     at request (http://localhost:5173/src/services/api.js?t=1784687659645:14:15)",
+ ]
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - generic [ref=e6]:
      - generic [ref=e8]: G
      - generic [ref=e10]: Gnabo Multi-Services
    - navigation [ref=e11]:
      - link "Tableau de bord" [ref=e13] [cursor=pointer]:
        - /url: /
        - img [ref=e14]
        - generic [ref=e19]: Tableau de bord
      - generic [ref=e20]:
        - paragraph [ref=e21]: Gestion
        - link "Devis" [ref=e22] [cursor=pointer]:
          - /url: /devis
          - img [ref=e23]
          - generic [ref=e26]: Devis
        - link "Clients" [ref=e27] [cursor=pointer]:
          - /url: /clients
          - img [ref=e28]
          - generic [ref=e33]: Clients
        - link "Catalogue" [ref=e34] [cursor=pointer]:
          - /url: /catalogue
          - img [ref=e35]
          - generic [ref=e39]: Catalogue
        - link "Modèles" [ref=e40] [cursor=pointer]:
          - /url: /modeles
          - img [ref=e41]
          - generic [ref=e45]: Modèles
        - link "Appareils" [ref=e46] [cursor=pointer]:
          - /url: /electronique/appareils
          - img [ref=e47]
          - generic [ref=e49]: Appareils
        - link "Réception" [ref=e50] [cursor=pointer]:
          - /url: /electronique/reception
          - img [ref=e51]
          - generic [ref=e54]: Réception
        - link "QR Codes" [ref=e55] [cursor=pointer]:
          - /url: /electronique/qr-codes
          - img [ref=e56]
          - generic [ref=e62]: QR Codes
        - link "Étiquettes" [ref=e63] [cursor=pointer]:
          - /url: /electronique/etiquettes
          - img [ref=e64]
          - generic [ref=e68]: Étiquettes
        - link "Stock" [ref=e69] [cursor=pointer]:
          - /url: /stocks
          - img [ref=e70]
          - generic [ref=e80]: Stock
        - link "Interventions" [ref=e81] [cursor=pointer]:
          - /url: /interventions
          - img [ref=e83]
          - generic [ref=e87]: Interventions
        - link "Caisse" [ref=e88] [cursor=pointer]:
          - /url: /caisse
          - img [ref=e89]
          - generic [ref=e92]: Caisse
      - generic [ref=e93]:
        - paragraph [ref=e94]: Administration
        - link "Paramètres" [ref=e95] [cursor=pointer]:
          - /url: /parametres
          - img [ref=e96]
          - generic [ref=e99]: Paramètres
        - link "Utilisateurs" [ref=e100] [cursor=pointer]:
          - /url: /utilisateurs
          - img [ref=e101]
          - generic [ref=e103]: Utilisateurs
        - link "Historique" [ref=e104] [cursor=pointer]:
          - /url: /historique
          - img [ref=e105]
          - generic [ref=e108]: Historique
        - link "Sauvegardes" [ref=e109] [cursor=pointer]:
          - /url: /sauvegardes
          - img [ref=e110]
          - generic [ref=e114]: Sauvegardes
    - button "Mode sombre" [ref=e116] [cursor=pointer]:
      - img [ref=e117]
      - generic [ref=e119]: Mode sombre
  - generic [ref=e120]:
    - banner [ref=e121]:
      - generic [ref=e122]:
        - img [ref=e123]
        - generic [ref=e127]: Gnabo Multi-Services
        - generic [ref=e128]: /
        - generic [ref=e129]: Interventions
      - generic [ref=e130]:
        - generic [ref=e131]: Utilisateur
        - button "Quitter" [ref=e132] [cursor=pointer]:
          - img [ref=e133]
          - generic [ref=e136]: Quitter
    - main [ref=e137]:
      - generic [ref=e138]:
        - generic [ref=e139]:
          - generic [ref=e140]:
            - img [ref=e142]
            - heading "Interventions" [level=1] [ref=e145]
          - button "Nouvelle intervention" [ref=e146] [cursor=pointer]:
            - img [ref=e147]
            - text: Nouvelle intervention
        - generic [ref=e148]:
          - generic [ref=e149]:
            - img [ref=e150]
            - textbox "Client, technicien..." [ref=e153]
          - combobox [ref=e154]:
            - option "Tous les statuts" [selected]
            - option "Planifiée"
            - option "En cours"
            - option "Terminée"
            - option "Annulée"
          - button "Rechercher" [ref=e155] [cursor=pointer]
        - paragraph [ref=e157]: Aucune intervention trouvée
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | import { authenticate, clientNav } from '../helpers/auth'
  3  | 
  4  | const ROUTES = [
  5  |   { route: '/', title: 'Tableau de bord' },
  6  |   { route: '/clients', title: 'Clients' },
  7  |   { route: '/catalogue', title: 'Catalogue' },
  8  |   { route: '/modeles', title: 'Modèles' },
  9  |   { route: '/devis', title: 'Devis' },
  10 |   { route: '/electronique/appareils', title: 'Appareils' },
  11 |   { route: '/electronique/reception', title: 'Réception' },
  12 |   { route: '/electronique/qr-codes', title: 'QR Codes' },
  13 |   { route: '/electronique/etiquettes', title: 'Étiquettes' },
  14 |   { route: '/stocks', title: 'Stock' },
  15 |   { route: '/interventions', title: 'Interventions' },
  16 |   { route: '/caisse', title: 'Caisse' },
  17 |   { route: '/parametres', title: 'Paramètres' },
  18 |   { route: '/utilisateurs', title: 'Utilisateurs' },
  19 |   { route: '/historique', title: 'Historique' },
  20 |   { route: '/sauvegardes', title: 'Sauvegardes' },
  21 | ]
  22 | 
  23 | test.describe('Navigation entre les pages', () => {
  24 |   test.beforeEach(async ({ page }) => {
  25 |     await authenticate(page)
  26 |   })
  27 | 
  28 |   for (const { route, title } of ROUTES) {
  29 |     test(`charge la page ${title} (${route}) sans erreur console`, async ({ page }) => {
  30 |       const errors: string[] = []
  31 |       page.on('console', msg => {
  32 |         if (msg.type() === 'error') errors.push(msg.text())
  33 |       })
  34 | 
  35 |       if (route !== '/') {
  36 |         await clientNav(page, route)
  37 |       }
  38 | 
  39 |       await expect(page.locator('h1')).toBeVisible({ timeout: 10000 })
  40 | 
> 41 |       expect(errors.filter(e => !e.includes('favicon') && !e.includes('Failed to load resource'))).toEqual([])
     |                                                                                                    ^ Error: expect(received).toEqual(expected) // deep equality
  42 |     })
  43 |   }
  44 | 
  45 |   test('redirige vers select-entreprise sans localStorage', async ({ page }) => {
  46 |     await page.evaluate(() => localStorage.removeItem('entrepriseId'))
  47 |     await clientNav(page, '/devis')
  48 |     const url = page.url()
  49 |     if (url.includes('select-entreprise') || url.includes('select-entreprise')) {
  50 |       await expect(page).toHaveURL(/select-entreprise/)
  51 |     }
  52 |   })
  53 | })
  54 | 
```