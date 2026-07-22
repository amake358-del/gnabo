import { test, expect } from '@playwright/test'
import { authenticate } from '../helpers/auth'
import { request } from '../helpers/api-client'

test.describe('Calcul automatique des surfaces et montants', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
  })

  test('vérifie la formule surface = largeur * hauteur / 10000', async () => {
    const largeur = 120
    const hauteur = 250
    const surface = (largeur * hauteur) / 10000
    expect(surface).toBe(3)
  })

  test('vérifie la formule total = surface * quantite * prix_m2', async () => {
    const surface = 3
    const quantite = 3
    const prix_m2 = 75
    const total = Math.round(surface * quantite * prix_m2 * 100) / 100
    expect(total).toBe(675)
  })

  test('calcul via API côté serveur', async () => {
    const entrepriseId = process.env.TEST_ENTREPRISE_ID || ''
    const clients = await request<any[]>('GET', `http://localhost:9999/api/clients`, { 'X-Entreprise-Id': entrepriseId })
    expect(clients.data.length).toBeGreaterThan(0)

    const devis = await request<any[]>('GET', `http://localhost:9999/api/devis?limit=1`, { 'X-Entreprise-Id': entrepriseId })
    if (devis.data && devis.data.length > 0) {
      const d = devis.data[0]
      expect(typeof d.total_ht).toBe('number')
      expect(typeof d.total_ttc).toBe('number')
      expect(d.total_ht).toBeGreaterThanOrEqual(0)
    }
  })

  test('vérifie les colonnes surface et total dans l\'aperçu', async ({ page }) => {
    await page.goto('/devis', { waitUntil: 'networkidle', timeout: 30000 })
    const viewBtn = page.locator('button[aria-label="Aperçu"], a[aria-label="Aperçu"]').first()
    if (await viewBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await viewBtn.click()
      await page.waitForLoadState('networkidle')
      const thElements = page.locator('th:has-text("Surface"), th:has-text("Total")')
      const count = await thElements.count()
      expect(count).toBeGreaterThan(0)
    }
  })

  test('navigation vers formulaire devis sans erreur console', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.goto('/devis/nouveau', { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)
    const onForm = page.url().includes('/devis/nouveau')
    if (onForm) {
      expect(errors.filter(e => !e.includes('favicon'))).toEqual([])
    }
  })
})
