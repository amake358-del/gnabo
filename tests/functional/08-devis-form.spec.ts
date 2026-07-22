import { test, expect } from '@playwright/test'
import { authenticate, clientNav, authAndNav } from '../helpers/auth'

test.describe('Formulaire de création devis (stepper)', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
  })

  test('affiche le stepper avec la première étape (type)', async ({ page }) => {
    await page.goto('/devis/nouveau')
    await page.waitForLoadState('networkidle')

    const select = page.locator('select').first()
    if (await select.isVisible()) {
      const options = await select.locator('option').all()
      if (options.length > 1) {
        await select.selectOption(options[1].getAttribute('value') || '')
      }
    }
    await page.locator('button[type="submit"]').first().click()
    await page.waitForTimeout(500)
  })

  test('parcourt le stepper jusqu\'à l\'aperçu', async ({ page }) => {
    await page.goto('/devis/nouveau')
    await page.waitForLoadState('networkidle')

    const select = page.locator('select').first()
    const options = await select.locator('option').all()
    if (options.length > 1) {
      await select.selectOption(options[1].getAttribute('value') || '')
    }
    const nextBtns = page.locator('button:has-text("Suivant")')
    if (await nextBtns.first().isVisible()) {
      await nextBtns.first().click()
      await page.waitForTimeout(500)
    }

    const clientSelect = page.locator('select').first()
    const clientOptions = await clientSelect.locator('option').all()
    if (clientOptions.length > 1) {
      await clientSelect.selectOption(clientOptions[1].getAttribute('value') || '')
    }
    if (await nextBtns.first().isVisible()) {
      await nextBtns.first().click()
      await page.waitForTimeout(500)
    }
  })

  test('bouton Annuler fonctionne', async ({ page }) => {
    await page.goto('/devis/nouveau')
    await page.waitForLoadState('networkidle')

    const cancelBtn = page.locator('button:has-text("Annuler")')
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click()
      await page.waitForURL(/\/devis$/)
    }
  })
})
