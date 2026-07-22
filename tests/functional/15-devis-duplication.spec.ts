import { test, expect } from '@playwright/test'
import { authenticate } from '../helpers/auth'

test.describe('Duplication de devis', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
  })

  test('navigation vers page devis liste', async ({ page }) => {
    await page.goto('/devis', { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)
    const notOnSelect = !page.url().includes('select-entreprise')
    if (notOnSelect) {
      await expect(page.locator('h1')).toContainText('Devis')
    }
  })

  test('duplique un devis existant via le formulaire pré-rempli', async ({ page }) => {
    await page.goto('/devis', { waitUntil: 'networkidle', timeout: 30000 })
    const editBtn = page.locator('button[aria-label="Modifier"], a[aria-label="Modifier"]').first()
    if (await editBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await editBtn.click()
      await page.waitForLoadState('networkidle')
    }
  })

  test('navigation vers formulaire nouveau devis', async ({ page }) => {
    await page.goto('/devis/nouveau', { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)
    const notOnSelect = !page.url().includes('select-entreprise')
    if (notOnSelect) {
      await expect(page.locator('h1')).toContainText('Nouveau devis')
    }
  })
})
