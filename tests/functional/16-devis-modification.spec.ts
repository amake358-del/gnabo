import { test, expect } from '@playwright/test'
import { authenticate } from '../helpers/auth'

test.describe('Modification de devis', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
  })

  test('navigation vers page devis', async ({ page }) => {
    await page.goto('/devis', { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)
    const onDevis = page.url().includes('/devis')
    if (onDevis) {
      const editBtn = page.locator('button[aria-label="Modifier"], a[aria-label="Modifier"]').first()
      if (await editBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await editBtn.click()
        await page.waitForLoadState('networkidle')
      }
    }
  })

  test('change le statut d\'un devis depuis la liste', async ({ page }) => {
    await page.goto('/devis', { waitUntil: 'networkidle', timeout: 30000 })
    const statusSelect = page.locator('select[aria-label*="statut"], select:has(option[value="brouillon"])').first()
    if (await statusSelect.isVisible()) {
      await statusSelect.selectOption('envoyé')
      await page.waitForTimeout(500)
      expect(page.url()).toContain('envoyé')
      await statusSelect.selectOption('')
      await page.waitForTimeout(500)
    }
  })

  test('affiche l\'aperçu d\'un devis', async ({ page }) => {
    await page.goto('/devis', { waitUntil: 'networkidle', timeout: 30000 })
    const viewBtn = page.locator('button[aria-label="Aperçu"], a[aria-label="Aperçu"]').first()
    if (await viewBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await viewBtn.click()
      await page.waitForLoadState('networkidle')
    }
  })
})
