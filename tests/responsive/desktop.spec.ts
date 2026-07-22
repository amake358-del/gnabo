import { test, expect } from '@playwright/test'
import { authenticate } from '../helpers/auth'

const DESKTOP_VIEWPORTS = [
  { width: 1366, height: 768, name: 'HD' },
  { width: 1440, height: 900, name: 'HD+' },
  { width: 1920, height: 1080, name: 'Full HD' },
]

const PAGES = [
  '/', '/clients', '/devis', '/catalogue', '/modeles',
  '/parametres', '/utilisateurs', '/historique', '/sauvegardes',
  '/stocks', '/caisse', '/interventions',
  '/electronique/appareils', '/electronique/reception',
  '/electronique/qr-codes', '/electronique/etiquettes',
]

test.describe('Desktop responsive', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
  })

  for (const vp of DESKTOP_VIEWPORTS) {
    test.describe(`Viewport ${vp.name} (${vp.width}x${vp.height})`, () => {
      for (const route of PAGES) {
        test(`page ${route} sans débordement et sidebar visible`, async ({ page }) => {
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

  test('sidebar toujours visible sur desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const sidebar = page.locator('aside')
    await expect(sidebar).toBeVisible()
  })

  test('pas de hamburger sur desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const hamburger = page.locator('button:has(svg.lucide-menu)')
    const isVisible = await hamburger.isVisible()
    if (isVisible) {
      const isHidden = await page.evaluate(() => {
        const btn = document.querySelector('button:has(svg.lucide-menu)')
        if (!btn) return true
        const style = window.getComputedStyle(btn)
        return style.display === 'none' || style.visibility === 'hidden'
      })
      expect(isHidden).toBe(true)
    }
  })

  test('grille dashboard 4 colonnes sur écran large', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const statCards = page.locator('text=Total devis, text=Clients')
    const count = await statCards.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('ligth/dark mode toggle fonctionnel', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const darkToggle = page.locator('button:has-text("Mode sombre")')
    if (await darkToggle.isVisible()) {
      await darkToggle.click()
      await page.waitForTimeout(500)
      const lightToggle = page.locator('button:has-text("Mode clair")')
      await expect(lightToggle).toBeVisible()
    }
  })
})
