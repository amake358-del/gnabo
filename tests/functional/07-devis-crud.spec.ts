import { test, expect } from '@playwright/test'
import { authenticate, clientNav, authAndNav } from '../helpers/auth'

test.describe('CRUD Devis', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
  })

  test('affiche la liste des devis', async ({ page }) => {
    await page.goto('/devis')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toContainText('Devis')
  })

  test('filtre les devis par statut', async ({ page }) => {
    await page.goto('/devis')
    await page.waitForLoadState('networkidle')
    const statusSelect = page.locator('select[aria-label*="statut"]').first()
    if (await statusSelect.isVisible()) {
      await statusSelect.selectOption('brouillon')
      await page.waitForTimeout(500)
      const currentUrl = page.url()
      expect(currentUrl).toContain('brouillon')
    }
  })

  test('cherche un devis', async ({ page }) => {
    await page.goto('/devis')
    await page.waitForLoadState('networkidle')
    const searchInput = page.locator('[placeholder*="Rechercher"]')
    if (await searchInput.isVisible()) {
      await searchInput.fill('DEV')
      await page.waitForTimeout(500)
    }
  })

  test('supprime un devis', async ({ page }) => {
    await page.goto('/devis')
    await page.waitForLoadState('networkidle')
    const deleteBtn = page.locator('button[aria-label="Supprimer"]').first()
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click()
      await expect(page.locator('text=Supprimer le devis')).toBeVisible()
      await page.locator('text=Confirmer').click()
      await page.waitForTimeout(1000)
    }
  })
})
