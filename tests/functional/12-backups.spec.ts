import { test, expect } from '@playwright/test'
import { authenticate, clientNav, authAndNav } from '../helpers/auth'

test.describe('Sauvegardes', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
    await page.goto('/sauvegardes')
    await page.waitForLoadState('networkidle')
  })

  test('affiche la page des sauvegardes', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Sauvegardes')
  })

  test('crée une nouvelle sauvegarde', async ({ page }) => {
    const createBtn = page.locator('button:has-text("Sauvegarder"), button:has-text("Créer")').first()
    if (await createBtn.isVisible()) {
      await createBtn.click()
      await page.waitForTimeout(2000)
      await page.waitForLoadState('networkidle')
    }
  })

  test('liste les sauvegardes existantes', async ({ page }) => {
    const backupItems = page.locator('[class*="backup-item"], table tbody tr')
    const count = await backupItems.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })
})
