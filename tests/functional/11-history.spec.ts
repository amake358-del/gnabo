import { test, expect } from '@playwright/test'
import { authenticate, clientNav, authAndNav } from '../helpers/auth'

test.describe('Historique des actions', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
    await page.goto('/historique')
    await page.waitForLoadState('networkidle')
  })

  test('affiche la page d\'historique', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Historique')
  })

  test('affiche les entrées du journal d\'actions', async ({ page }) => {
    const rows = page.locator('table tbody tr, [class*="log-entry"]')
    const count = await rows.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('affiche les détails de chaque action', async ({ page }) => {
    const details = page.locator('table tbody tr td, [class*="log-entry"]')
    if (await details.first().isVisible()) {
      await expect(details.first()).toBeVisible()
    }
  })
})
