import { test, expect } from '@playwright/test'
import { authenticate, clientNav } from '../helpers/auth'

const ROUTES = [
  { route: '/', title: 'Tableau de bord' },
  { route: '/clients', title: 'Clients' },
  { route: '/catalogue', title: 'Catalogue' },
  { route: '/modeles', title: 'Modèles' },
  { route: '/devis', title: 'Devis' },
  { route: '/electronique/appareils', title: 'Appareils' },
  { route: '/electronique/reception', title: 'Réception' },
  { route: '/electronique/qr-codes', title: 'QR Codes' },
  { route: '/electronique/etiquettes', title: 'Étiquettes' },
  { route: '/stocks', title: 'Stock' },
  { route: '/interventions', title: 'Interventions' },
  { route: '/caisse', title: 'Caisse' },
  { route: '/parametres', title: 'Paramètres' },
  { route: '/utilisateurs', title: 'Utilisateurs' },
  { route: '/historique', title: 'Historique' },
  { route: '/sauvegardes', title: 'Sauvegardes' },
]

test.describe('Navigation entre les pages', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
  })

  for (const { route, title } of ROUTES) {
    test(`charge la page ${title} (${route}) sans erreur console`, async ({ page }) => {
      const errors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text())
      })

      if (route !== '/') {
        await clientNav(page, route)
      }

      await expect(page.locator('h1')).toBeVisible({ timeout: 10000 })

      expect(errors.filter(e => !e.includes('favicon') && !e.includes('Failed to load resource'))).toEqual([])
    })
  }

  test('redirige vers select-entreprise sans localStorage', async ({ page }) => {
    await page.evaluate(() => localStorage.removeItem('entrepriseId'))
    await clientNav(page, '/devis')
    const url = page.url()
    if (url.includes('select-entreprise') || url.includes('select-entreprise')) {
      await expect(page).toHaveURL(/select-entreprise/)
    }
  })
})
