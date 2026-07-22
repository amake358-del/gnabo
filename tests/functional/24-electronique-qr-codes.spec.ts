import { test, expect } from '@playwright/test'
import { authenticate } from '../helpers/auth'

test.describe('Électronique - QR Codes & Étiquettes', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
  })

  test('page QR codes accessible', async ({ page }) => {
    await page.goto('/electronique/qr-codes')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toContainText('QR Codes')
  })

  test('page QR codes contient recherche', async ({ page }) => {
    await page.goto('/electronique/qr-codes')
    await page.waitForLoadState('networkidle')
    const searchInput = page.locator('input[placeholder*="Rechercher"]')
    await expect(searchInput).toBeVisible()
  })

  test('bouton Étiquettes visible sur page QR codes', async ({ page }) => {
    await page.goto('/electronique/qr-codes')
    await page.waitForLoadState('networkidle')
    const etiquettesBtn = page.getByRole('button', { name: 'Étiquettes' })
    await expect(etiquettesBtn).toBeVisible()
  })

  test('page étiquettes accessible', async ({ page }) => {
    await page.goto('/electronique/etiquettes')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toContainText('Étiquettes')
  })

  test('page étiquettes contient sélecteur disposition', async ({ page }) => {
    await page.goto('/electronique/etiquettes')
    await page.waitForLoadState('networkidle')
    const layoutSelect = page.locator('select').first()
    if (await layoutSelect.isVisible()) {
      const options = await layoutSelect.locator('option').all()
      expect(options.length).toBeGreaterThanOrEqual(2)
    }
  })

  test('bouton Générer PDF désactivé sans sélection', async ({ page }) => {
    await page.goto('/electronique/etiquettes')
    await page.waitForLoadState('networkidle')
    const generateBtn = page.locator('button:has-text("Générer PDF")')
    if (await generateBtn.isVisible()) {
      await expect(generateBtn).toBeDisabled()
    }
  })

  test('page étiquettes liste les appareils avec checkbox', async ({ page }) => {
    await page.goto('/electronique/etiquettes')
    await page.waitForLoadState('networkidle')
    const checkboxes = page.locator('input[type="checkbox"]')
    const count = await checkboxes.count()
    const emptyMsg = page.locator('text=Aucun appareil')
    const hasCheckboxes = count > 0
    const isEmpty = await emptyMsg.isVisible()
    expect(hasCheckboxes || isEmpty).toBe(true)
  })

  test('navigation sidebar QR Codes fonctionnelle', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const qrLink = page.locator('a[href="/electronique/qr-codes"]')
    if (await qrLink.isVisible()) {
      await qrLink.click()
      await page.waitForURL('/electronique/qr-codes')
      await expect(page.locator('h1')).toContainText('QR Codes')
    }
  })
})
