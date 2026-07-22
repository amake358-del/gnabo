import { test, expect } from '@playwright/test'
import { authenticate } from '../helpers/auth'

const ALL_VIEWPORTS = [
  { width: 375, height: 667, name: 'iPhone_SE' },
  { width: 390, height: 844, name: 'iPhone_14' },
  { width: 360, height: 800, name: 'Android_Small' },
  { width: 412, height: 915, name: 'Android_Large' },
  { width: 768, height: 1024, name: 'Tablet_Portrait' },
  { width: 820, height: 1180, name: 'Tablet_Large' },
  { width: 1024, height: 768, name: 'Tablet_Landscape' },
  { width: 1024, height: 1366, name: 'Tablet_Pro' },
  { width: 1366, height: 768, name: 'Desktop_Small' },
  { width: 1440, height: 900, name: 'Desktop_Medium' },
  { width: 1920, height: 1080, name: 'Desktop_Large' },
]

const CRITICAL_PAGES = [
  '/', '/clients', '/devis', '/catalogue', '/modeles',
  '/parametres', '/utilisateurs', '/historique', '/sauvegardes',
  '/stocks', '/caisse', '/interventions',
  '/electronique/appareils', '/electronique/reception',
  '/electronique/qr-codes', '/electronique/etiquettes',
]

test.describe('Multi-viewport - toutes les pages', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
  })

  for (const route of CRITICAL_PAGES) {
    test.describe(`Route: ${route}`, () => {
      for (const vp of ALL_VIEWPORTS) {
        test(`viewport ${vp.name} (${vp.width}x${vp.height}) - pas de débordement`, async ({ page }) => {
          await page.setViewportSize({ width: vp.width, height: vp.height })
          await page.goto(route, { waitUntil: 'networkidle', timeout: 30000 })
          await page.waitForTimeout(1000)

          const metrics = await page.evaluate(() => ({
            overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
              ? document.documentElement.scrollWidth - document.documentElement.clientWidth : 0,
            h1: document.querySelector('h1')?.textContent || '',
            buttons: document.querySelectorAll('button').length,
            links: document.querySelectorAll('a').length,
            horizontalScroll: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          }))

          expect(metrics.overflow).toBe(0)
          expect(metrics.h1.length).toBeGreaterThan(0)
          expect(metrics.buttons + metrics.links).toBeGreaterThan(0)
        })
      }
    })
  }
})
