import { test, expect } from '@playwright/test'
import path from 'path'
import { authenticate } from '../helpers/auth'

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
  { route: '/electronique/reception', name: 'reception' },
  { route: '/electronique/qr-codes', name: 'qr-codes' },
  { route: '/electronique/etiquettes', name: 'etiquettes' },
]

test.describe('Captures d\'écran', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
  })

  for (const { route, name } of PAGES) {
    test(`capture: ${name} (1920x1080)`, async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })
      await page.goto(route, { waitUntil: 'networkidle', timeout: 30000 })
      await page.waitForTimeout(500)

      await expect(page).toHaveScreenshot(`${name}-desktop.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.05,
      })
    })

    test(`capture: ${name} (390x844)`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await page.goto(route, { waitUntil: 'networkidle', timeout: 30000 })
      await page.waitForTimeout(500)

      await expect(page).toHaveScreenshot(`${name}-mobile.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.05,
      })
    })
  }

  test('capture: sélection entreprise', async ({ page }) => {
    await page.goto('/select-entreprise')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('select-entreprise.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    })
  })

  test('capture: formulaire nouveau devis', async ({ page }) => {
    await page.goto('/devis/nouveau')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('devis-nouveau.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    })
  })
})
