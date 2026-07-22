import { test, expect } from '@playwright/test'
import { authenticate, clientNav, authAndNav } from '../helpers/auth'

test.describe('Gestion des modèles', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
    await page.goto('/modeles')
    await page.waitForLoadState('networkidle')
  })

  test('affiche la page des modèles', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Modèles')
  })

  test('crée un nouveau modèle', async ({ page }) => {
    await page.locator('text=Nouveau modèle').click()
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    const typeSelect = page.locator('select').first()
    const typeOptions = await typeSelect.locator('option').all()
    if (typeOptions.length > 1) {
      await typeSelect.selectOption(typeOptions[1].getAttribute('value') || '')
    }
    await page.fill('label:has-text("Nom")', 'Modèle E2E Test')
    await page.fill('label:has-text("Prix")', '299.99')
    await page.locator('button[type="submit"]').click()
    await page.waitForTimeout(1500)
  })

  test('filtre les modèles par type', async ({ page }) => {
    const filterSelect = page.locator('select').first()
    const options = await filterSelect.locator('option').all()
    if (options.length > 1) {
      await filterSelect.selectOption(options[1].getAttribute('value') || '')
      await page.waitForTimeout(500)
      const rows = page.locator('table tbody tr')
      await expect(rows.first()).toBeVisible({ timeout: 5000 })
    }
  })

  test('supprime un modèle', async ({ page }) => {
    const deleteBtn = page.locator('button[aria-label="Supprimer"]').first()
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click()
      await page.locator('text=Confirmer').click()
      await page.waitForTimeout(1000)
    }
  })
})
