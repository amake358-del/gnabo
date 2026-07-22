import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'
import { authenticate } from '../helpers/auth'

const BASELINE_DIR = path.resolve(__dirname, 'baseline')

const PAGES = [
  { route: '/', name: 'dashboard' },
  { route: '/clients', name: 'clients' },
  { route: '/devis', name: 'devis-list' },
  { route: '/catalogue', name: 'catalogue' },
  { route: '/modeles', name: 'modeles' },
  { route: '/parametres', name: 'parametres' },
  { route: '/utilisateurs', name: 'utilisateurs' },
  { route: '/historique', name: 'historique' },
  { route: '/sauvegardes', name: 'sauvegardes' },
  { route: '/stocks', name: 'stocks' },
  { route: '/caisse', name: 'caisse' },
  { route: '/interventions', name: 'interventions' },
  { route: '/electronique/appareils', name: 'appareils' },
  { route: '/electronique/qr-codes', name: 'qr-codes' },
  { route: '/electronique/etiquettes', name: 'etiquettes' },
]

test.describe('Visual Regression - Comparaison', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
  })

  for (const { route, name } of PAGES) {
    test(`comparaison visuelle: ${name} desktop`, async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })
      await page.goto(route, { waitUntil: 'networkidle', timeout: 30000 })
      await page.waitForTimeout(500)

      await expect(page).toHaveScreenshot(`${name}-desktop.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.05,
        threshold: 0.2,
      })
    })

    test(`comparaison visuelle: ${name} mobile`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await page.goto(route, { waitUntil: 'networkidle', timeout: 30000 })
      await page.waitForTimeout(500)

      await expect(page).toHaveScreenshot(`${name}-mobile.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.05,
        threshold: 0.2,
      })
    })
  }

  test('génère les captures de référence si absentes', async ({ page }) => {
    if (!fs.existsSync(BASELINE_DIR)) {
      fs.mkdirSync(BASELINE_DIR, { recursive: true })
    }
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(500)

    const baselinePath = path.join(BASELINE_DIR, 'dashboard-baseline.png')
    if (!fs.existsSync(baselinePath)) {
      await page.screenshot({ path: baselinePath, fullPage: true })
    }
    expect(fs.existsSync(baselinePath)).toBe(true)
  })

  test('détection de décalage visuel sur le formulaire devis', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/devis/nouveau', { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(500)

    const elements = page.locator('input, select, textarea, button')
    const count = await elements.count()
    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < Math.min(count, 5); i++) {
      const el = elements.nth(i)
      const box = await el.boundingBox()
      if (box) {
        expect(box.x).toBeGreaterThanOrEqual(0)
        expect(box.y).toBeGreaterThanOrEqual(0)
        expect(box.width).toBeGreaterThan(0)
        expect(box.height).toBeGreaterThan(0)
      }
    }
  })
})
