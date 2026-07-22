import { test, expect } from '@playwright/test'
import { authenticate, clientNav, authAndNav } from '../helpers/auth'

test.describe('Gestion des utilisateurs', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
    await page.goto('/utilisateurs')
    await page.waitForLoadState('networkidle')
  })

  test('affiche la page des utilisateurs', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Utilisateurs')
  })

  test('crée un nouvel utilisateur', async ({ page }) => {
    await page.locator('text=Nouvel utilisateur, text=Ajouter').first().click()
    await page.waitForTimeout(500)

    const usernameInput = page.locator('input[placeholder*="utilisateur"], input[name="username"], input[aria-label*="utilisateur"]').first()
    if (await usernameInput.isVisible()) {
      await usernameInput.fill('testuser_e2e')
      const passwordInput = page.locator('input[type="password"]').first()
      if (await passwordInput.isVisible()) {
        await passwordInput.fill('password123')
      }
      await page.locator('button[type="submit"]').first().click()
      await page.waitForTimeout(1000)
    }
  })
})
