import { test, expect } from '@playwright/test'
import { authenticate } from '../helpers/auth'

const TABLET_VIEWPORTS = [
  { width: 768, height: 1024, name: 'iPad Mini' },
  { width: 820, height: 1180, name: 'iPad Air' },
  { width: 1024, height: 1366, name: 'iPad Pro' },
  { width: 1024, height: 768, name: 'iPad Landscape' },
]

const PAGES = [
  '/', '/clients', '/devis', '/catalogue', '/modeles',
  '/parametres', '/utilisateurs', '/historique', '/sauvegardes',
  '/stocks', '/caisse', '/interventions',
  '/electronique/appareils', '/electronique/reception',
  '/electronique/qr-codes', '/electronique/etiquettes',
]

test.describe('Tablet responsive', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
  })

  for (const vp of TABLET_VIEWPORTS) {
    test.describe(`Viewport ${vp.name} (${vp.width}x${vp.height})`, () => {
      for (const route of PAGES) {
        test(`page ${route} sans débordement`, async ({ page }) => {
          await page.setViewportSize({ width: vp.width, height: vp.height })
          await page.goto(route, { waitUntil: 'networkidle', timeout: 30000 })
          await page.waitForTimeout(500)

          const overflow = await page.evaluate(() => {
            const doc = document.documentElement
            return doc.scrollWidth > doc.clientWidth ? doc.scrollWidth - doc.clientWidth : 0
          })
          expect(overflow).toBe(0)

          await expect(page.locator('h1')).toBeVisible({ timeout: 10000 })
        })
      }
    })
  }

  test('layout adaptatif dashboard sur tablette', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const gridColumns = await page.evaluate(() => {
      const grids = document.querySelectorAll('[class*="grid"]')
      for (const g of grids) {
        const style = window.getComputedStyle(g)
        const cols = style.gridTemplateColumns.split(' ').length
        if (cols > 1) return cols
      }
      return 0
    })

    expect(gridColumns).toBeGreaterThanOrEqual(2)
  })

  test('header compact sur tablette', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const headerEntr = page.locator('header span').filter({ hasText: /Services|Aluminium|Électronique|Métallique/ })
    if (await headerEntr.isVisible()) {
    }
  })
})
