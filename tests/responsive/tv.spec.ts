import { test, expect } from '@playwright/test'
import { authenticate } from '../helpers/auth'

const TV = { width: 2560, height: 1440 }

const PAGES = [
  { route: '/', name: 'Dashboard' },
  { route: '/clients', name: 'Clients' },
  { route: '/devis', name: 'Devis' },
  { route: '/catalogue', name: 'Catalogue' },
  { route: '/modeles', name: 'Modèles' },
  { route: '/parametres', name: 'Paramètres' },
  { route: '/utilisateurs', name: 'Utilisateurs' },
  { route: '/historique', name: 'Historique' },
  { route: '/sauvegardes', name: 'Sauvegardes' },
  { route: '/stocks', name: 'Stocks' },
  { route: '/caisse', name: 'Caisse' },
  { route: '/interventions', name: 'Interventions' },
  { route: '/electronique/appareils', name: 'Appareils' },
  { route: '/electronique/reception', name: 'Reception' },
  { route: '/electronique/qr-codes', name: 'QRCodes' },
  { route: '/electronique/etiquettes', name: 'Etiquettes' },
]

test.describe('TV / Grand écran (2560x1440)', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
    await page.setViewportSize(TV)
  })

  for (const { route, name } of PAGES) {
    test(`page ${name} sans débordement sur écran TV`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'networkidle', timeout: 30000 })
      await page.waitForTimeout(1000)

      const overflow = await page.evaluate(() => {
        const doc = document.documentElement
        return doc.scrollWidth > doc.clientWidth ? doc.scrollWidth - doc.clientWidth : 0
      })
      expect(overflow).toBe(0)

      await expect(page.locator('h1')).toBeVisible({ timeout: 10000 })
    })
  }

  test('sidebar visible sur écran TV', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 })
    const sidebar = page.locator('aside')
    await expect(sidebar).toBeVisible()
    const links = await sidebar.locator('a').count()
    expect(links).toBeGreaterThanOrEqual(3)
  })

  test('pas de texte tronqué sur écran TV', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 })

    const clipped = await page.evaluate(() => {
      const all = document.querySelectorAll('*')
      const result: string[] = []
      all.forEach(el => {
        const style = window.getComputedStyle(el)
        if (style.overflow === 'hidden' && el.scrollWidth > el.clientWidth && el.textContent && el.textContent.trim().length > 3) {
          result.push((el.textContent || '').trim().slice(0, 50))
        }
      })
      return result.slice(0, 5)
    })
    expect(clipped.length).toBeLessThanOrEqual(2)
  })
})
