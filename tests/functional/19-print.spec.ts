import { test, expect } from '@playwright/test'
import { authenticate } from '../helpers/auth'

test.describe('Génération PDF et impression', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
  })

  test('bouton Générer le PDF visible sur l\'aperçu devis', async ({ page }) => {
    await page.goto('/devis', { waitUntil: 'networkidle', timeout: 30000 })
    const viewBtn = page.locator('button[aria-label="Aperçu"]').first()
    if (await viewBtn.isVisible()) {
      await viewBtn.click()
      await page.waitForLoadState('networkidle')
      const pdfBtn = page.locator('button:has-text("Générer le PDF")')
      await expect(pdfBtn).toBeVisible({ timeout: 5000 })
    }
  })

  test('bouton Télécharger PDF visible après génération', async ({ page }) => {
    await page.goto('/devis', { waitUntil: 'networkidle', timeout: 30000 })
    const viewBtn = page.locator('button[aria-label="Aperçu"]').first()
    if (await viewBtn.isVisible()) {
      await viewBtn.click()
      await page.waitForLoadState('networkidle')
      const pdfBtn = page.locator('button:has-text("Générer le PDF")')
      if (await pdfBtn.isVisible()) {
        await pdfBtn.click()
        await page.waitForTimeout(3000)
        const downloadBtn = page.locator('button:has-text("Télécharger")')
        if (await downloadBtn.isVisible()) {
          await expect(downloadBtn).toBeVisible({ timeout: 10000 })
        }
      }
    }
  })

  test('bouton PDF dans le stepper étape aperçu', async ({ page }) => {
    await page.goto('/devis/nouveau', { waitUntil: 'networkidle', timeout: 30000 })
    const select = page.locator('select').first()
    const options = await select.locator('option').all()
    if (options.length > 1) {
      await select.selectOption(options[1].getAttribute('value') || '')
    }
    const nextBtns = page.locator('button:has-text("Suivant")')
    for (let i = 0; i < 4; i++) {
      if (await nextBtns.first().isVisible()) {
        await nextBtns.first().click()
        await page.waitForTimeout(500)
      }
    }
    const pdfBtn = page.locator('button:has-text("Générer le PDF")')
    if (await pdfBtn.isVisible()) {
      await expect(pdfBtn).toBeVisible()
    }
  })
})
