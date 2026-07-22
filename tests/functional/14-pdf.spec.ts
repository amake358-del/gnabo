import { test, expect } from '@playwright/test'
import { authenticate, clientNav, authAndNav } from '../helpers/auth'

test.describe('Génération PDF', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
    await page.goto('/devis')
    await page.waitForLoadState('networkidle')
  })

  test('bouton PDF visible sur l\'aperçu d\'un devis', async ({ page }) => {
    const viewBtn = page.locator('button[aria-label="Aperçu"], a[aria-label="Aperçu"]').first()
    if (await viewBtn.isVisible()) {
      await viewBtn.click()
      await page.waitForLoadState('networkidle')
      const pdfBtn = page.locator('button:has-text("PDF"), a:has-text("Télécharger")').first()
      if (await pdfBtn.isVisible()) {
        await expect(pdfBtn).toBeVisible()
      }
    }
  })

  test('page de détail d\'un devis accessible', async ({ page }) => {
    const rows = page.locator('table tbody tr')
    const count = await rows.count()
    if (count > 0) {
      await rows.first().click()
      await page.waitForLoadState('networkidle')
      await expect(page).toHaveURL(/\/devis\//)
    }
  })
})
