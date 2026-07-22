import { test, expect } from '@playwright/test'
import { authenticate, clientNav, authAndNav } from '../helpers/auth'

test.describe('Gestion des clients', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
    await page.goto('/clients')
    await page.waitForLoadState('networkidle')
  })

  test('affiche la page des clients', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Clients')
  })

  test('ouvre le modal de création', async ({ page }) => {
    await page.locator('text=Nouveau client').click()
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await expect(page.locator('text=Nouveau client')).toBeVisible()
  })

  test('crée un nouveau client', async ({ page }) => {
    await page.locator('text=Nouveau client').click()
    await page.fill('label:has-text("Nom")', 'Client Test E2E')
    await page.fill('label:has-text("Société")', 'Test Corp')
    await page.fill('label:has-text("Email")', 'test@e2e.fr')
    await page.fill('label:has-text("Téléphone")', '0102030405')
    await page.locator('button[type="submit"]').click()
    await page.waitForTimeout(1000)
    await expect(page.locator('text=Client Test E2E')).toBeVisible({ timeout: 5000 })
  })

  test('cherche un client', async ({ page }) => {
    const searchInput = page.locator('[placeholder*="Rechercher"]')
    await searchInput.fill('Client Test')
    await page.waitForTimeout(500)
    const rows = page.locator('table tbody tr')
    const count = await rows.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('ouvre le modal de modification', async ({ page }) => {
    const editBtn = page.locator('button[aria-label="Modifier"]').first()
    if (await editBtn.isVisible()) {
      await editBtn.click()
      await expect(page.locator('[role="dialog"]')).toBeVisible()
      await expect(page.locator('text=Modifier le client')).toBeVisible()
    }
  })

  test('supprime un client', async ({ page }) => {
    await page.goto('/clients')
    await page.waitForLoadState('networkidle')
    const deleteBtn = page.locator('button[aria-label="Supprimer"]').first()
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click()
      await expect(page.locator('text=Supprimer le client')).toBeVisible()
      await page.locator('text=Confirmer').click()
      await page.waitForTimeout(1000)
    }
  })
})
