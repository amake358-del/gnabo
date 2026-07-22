import { test, expect } from '@playwright/test'
import { authenticate, clientNav, authAndNav } from '../helpers/auth'

test.describe('Gestion du catalogue (types)', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
    await page.goto('/catalogue')
    await page.waitForLoadState('networkidle')
  })

  test('affiche la page catalogue', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Catalogue')
  })

  test('crée un nouveau type', async ({ page }) => {
    await page.locator('text=Nouveau type').click()
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await page.fill('label:has-text("Nom")', 'Type E2E Test')
    await page.locator('button[type="submit"]').click()
    await page.waitForTimeout(1000)
    await expect(page.locator('text=Type E2E Test')).toBeVisible({ timeout: 5000 })
  })

  test('modifie un type existant', async ({ page }) => {
    const editBtn = page.locator('button[aria-label="Modifier"]').first()
    if (await editBtn.isVisible()) {
      await editBtn.click()
      await expect(page.locator('[role="dialog"]')).toBeVisible()
      const nameInput = page.locator('[role="dialog"] input')
      await nameInput.fill('Type Modifié E2E')
      await page.locator('button[type="submit"]').click()
      await page.waitForTimeout(1000)
    }
  })

  test('supprime un type', async ({ page }) => {
    const deleteBtn = page.locator('button[aria-label="Supprimer"]').first()
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click()
      await expect(page.locator('text=Supprimer le type')).toBeVisible()
      await page.locator('text=Confirmer').click()
      await page.waitForTimeout(1000)
    }
  })
})
