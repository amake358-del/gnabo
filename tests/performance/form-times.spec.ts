import { test, expect } from '@playwright/test'
import { authenticate } from '../helpers/auth'

interface FormPerfResult {
  page: string
  action: string
  timeMs: number
}

const RESULTS: FormPerfResult[] = []

test.describe('Performance - Temps d\'ouverture formulaires', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
  })

  test('ouverture formulaire nouveau devis', async ({ page }) => {
    const start = Date.now()
    await page.goto('/devis/nouveau', { waitUntil: 'networkidle', timeout: 30000 })
    const elapsed = Date.now() - start

    RESULTS.push({ page: 'Devis', action: 'Nouveau devis', timeMs: elapsed })
    const onForm = page.url().includes('/devis/nouveau')
    if (onForm) {
      expect(elapsed).toBeLessThan(20000)
    }
  })

  test('ouverture modal nouveau client', async ({ page }) => {
    await page.goto('/clients', { waitUntil: 'networkidle', timeout: 30000 })
    const newBtn = page.locator('button:has-text("Nouveau client")')
    if (await newBtn.isVisible()) {
      const start = Date.now()
      await newBtn.click()
      await page.waitForTimeout(500)
      const elapsed = Date.now() - start
      RESULTS.push({ page: 'Clients', action: 'Modal nouveau client', timeMs: elapsed })
    }
  })

  test('ouverture modal nouveau type', async ({ page }) => {
    await page.goto('/catalogue', { waitUntil: 'networkidle', timeout: 30000 })
    const newBtn = page.locator('button:has-text("Nouveau type")')
    if (await newBtn.isVisible()) {
      const start = Date.now()
      await newBtn.click()
      await page.waitForTimeout(500)
      const elapsed = Date.now() - start
      RESULTS.push({ page: 'Catalogue', action: 'Modal nouveau type', timeMs: elapsed })
    }
  })

  test('ouverture modal nouveau modèle', async ({ page }) => {
    await page.goto('/modeles', { waitUntil: 'networkidle', timeout: 30000 })
    const newBtn = page.locator('button:has-text("Nouveau modèle")')
    if (await newBtn.isVisible()) {
      const start = Date.now()
      await newBtn.click()
      await page.waitForTimeout(500)
      const elapsed = Date.now() - start
      RESULTS.push({ page: 'Modèles', action: 'Modal nouveau modèle', timeMs: elapsed })
    }
  })

  test('génération PDF temps mesuré', async ({ page }) => {
    await page.goto('/devis', { waitUntil: 'networkidle', timeout: 30000 })
    const viewBtn = page.locator('button[aria-label="Aperçu"], a[aria-label="Aperçu"]').first()
    if (await viewBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await viewBtn.click()
      await page.waitForLoadState('networkidle')

      const pdfBtn = page.locator('button:has-text("Générer le PDF")')
      if (await pdfBtn.isVisible()) {
        const start = Date.now()
        await pdfBtn.click()
        await page.waitForTimeout(5000)
        const elapsed = Date.now() - start
        RESULTS.push({ page: 'PDF', action: 'Génération PDF', timeMs: elapsed })
      }
    }
  })

  test.afterAll(async () => {
    console.log(`
=== PERFORMANCE FORMULAIRE RAPPORT ===`)
    for (const r of RESULTS) {
      console.log(`${r.page} > ${r.action}: ${r.timeMs}ms`)
    }
    if (RESULTS.length > 0) {
      const avg = RESULTS.reduce((s, r) => s + r.timeMs, 0) / RESULTS.length
      console.log(`Moyenne: ${avg.toFixed(0)}ms`)
    }
  })
})

test.describe('Performance - Temps de navigation', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
  })

  const pages = [
    { route: '/', name: 'Dashboard' },
    { route: '/clients', name: 'Clients' },
    { route: '/devis', name: 'Devis' },
    { route: '/catalogue', name: 'Catalogue' },
    { route: '/modeles', name: 'Modèles' },
    { route: '/parametres', name: 'Paramètres' },
    { route: '/utilisateurs', name: 'Utilisateurs' },
    { route: '/historique', name: 'Historique' },
    { route: '/sauvegardes', name: 'Sauvegardes' },
  ]

  for (const { route, name } of pages) {
    test(`navigation vers ${name}`, async ({ page }) => {
      const start = Date.now()
      await page.goto(route, { waitUntil: 'networkidle', timeout: 30000 })
      const elapsed = Date.now() - start

      const onPage = route === '/' ? true : page.url().includes(route)
      if (onPage) {
        expect(elapsed).toBeLessThan(20000)
      }
    })
  }
})
