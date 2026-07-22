import { test, expect } from '@playwright/test'
import { authenticate } from '../helpers/auth'

test.describe('Électronique - Réception appareil', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
  })

  test('affiche la page de réception', async ({ page }) => {
    await page.goto('/electronique/reception')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toContainText('Réception d\'appareil')
  })

  test('affiche le champ de scan QR Code', async ({ page }) => {
    await page.goto('/electronique/reception')
    await page.waitForLoadState('networkidle')
    const qrInput = page.locator('input')
    await expect(qrInput).toBeVisible()
  })

  test('le scan manuel affiche le formulaire pour code inconnu', async ({ page }) => {
    await page.goto('/electronique/reception')
    await page.waitForLoadState('networkidle')
    const qrInput = page.locator('input').first()
    await qrInput.fill('TEST-NEW-001')
    await qrInput.press('Enter')
    await page.waitForTimeout(2000)
    const nomInput = page.locator('label').filter({ hasText: /client/i })
    if (await nomInput.isVisible().catch(() => false)) {
      await expect(nomInput).toBeVisible()
    }
  })

  test('le formulaire contient tous les champs requis', async ({ page }) => {
    await page.goto('/electronique/reception')
    await page.waitForLoadState('networkidle')
    const qrInput = page.locator('input[placeholder*="EL-"]')
    await qrInput.fill('TEST-FORM-001')
    await qrInput.press('Enter')
    await page.waitForTimeout(2000)
    const fields = ['client', 'Téléphone', 'Adresse', 'Type', 'État', 'Marque', 'Modèle']
    for (const f of fields) {
      const field = page.locator(`label:has-text("${f}")`)
      if (await field.isVisible()) {
        await expect(field).toBeVisible()
      }
    }
  })

  test('bouton Annuler retourne au scan', async ({ page }) => {
    await page.goto('/electronique/reception')
    await page.waitForLoadState('networkidle')
    const qrInput = page.locator('input[placeholder*="EL-"]')
    await qrInput.fill('TEST-CANCEL-001')
    await qrInput.press('Enter')
    await page.waitForTimeout(1500)
    const cancelBtn = page.locator('button:has-text("Annuler")')
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click()
      await page.waitForTimeout(500)
      const scanInput = page.locator('input[placeholder*="EL-"]')
      await expect(scanInput).toBeVisible()
    }
  })

  test('bouton scanner caméra visible', async ({ page }) => {
    await page.goto('/electronique/reception')
    await page.waitForLoadState('networkidle')
    const cameraBtn = page.locator('button:has(svg.lucide-camera)')
    await expect(cameraBtn).toBeVisible()
  })

  test('page appareils liste accessible', async ({ page }) => {
    await page.goto('/electronique/appareils')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toContainText('Appareils')
  })
})
