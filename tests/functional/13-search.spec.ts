import { test, expect } from '@playwright/test'
import { authenticate, clientNav, authAndNav } from '../helpers/auth'

test.describe('Recherche', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
  })

  test('recherche des clients', async ({ page }) => {
    await page.goto('/clients')
    await page.waitForLoadState('networkidle')
    const searchInput = page.locator('[placeholder*="Rechercher"]')
    await expect(searchInput).toBeVisible()
    await searchInput.fill('Dupont')
    await page.waitForTimeout(500)
  })

  test('recherche des devis', async ({ page }) => {
    await page.goto('/devis')
    await page.waitForLoadState('networkidle')
    const searchInput = page.locator('[placeholder*="Rechercher"]')
    await expect(searchInput).toBeVisible()
    await searchInput.fill('DEV')
    await page.waitForTimeout(500)
  })

  test('recherche des modèles', async ({ page }) => {
    await page.goto('/modeles')
    await page.waitForLoadState('networkidle')
    const searchInput = page.locator('[placeholder*="Rechercher"]')
    if (await searchInput.isVisible()) {
      await searchInput.fill('Aluminium')
      await page.waitForTimeout(500)
    }
  })

  test('filtre les devis par statut', async ({ page }) => {
    await page.goto('/devis')
    await page.waitForLoadState('networkidle')
    const filterSelect = page.locator('select[aria-label*="statut"], select:has(option[value="brouillon"])').first()
    if (await filterSelect.isVisible()) {
      await filterSelect.selectOption('brouillon')
      await page.waitForTimeout(500)
    }
  })

  test('filtre les modèles par type', async ({ page }) => {
    await page.goto('/modeles')
    await page.waitForLoadState('networkidle')
    const filterSelect = page.locator('select').first()
    const options = await filterSelect.locator('option').all()
    if (options.length > 1) {
      await filterSelect.selectOption(options[1].getAttribute('value') || '')
      await page.waitForTimeout(500)
    }
  })
})
