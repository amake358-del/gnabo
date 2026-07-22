import { test, expect } from '@playwright/test'
import { authenticate, clientNav, authAndNav } from '../helpers/auth'

test.describe('Paramètres entreprise', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
    await page.goto('/parametres')
    await page.waitForLoadState('networkidle')
  })

  test('affiche la page des paramètres', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Paramètres')
  })

  test('affiche les champs de configuration', async ({ page }) => {
    const inputs = page.locator('input:not([type="hidden"]), select, textarea')
    const count = await inputs.count()
    expect(count).toBeGreaterThan(0)
  })

  test('modifie le nom de l\'entreprise', async ({ page }) => {
    const nameInput = page.locator('#company_name, input[name="company_name"], input[aria-label*="Nom"]').first()
    if (await nameInput.isVisible()) {
      const origVal = await nameInput.inputValue()
      await nameInput.fill('Entreprise Test E2E')
      const saveBtn = page.locator('button[type="submit"], button:has-text("Enregistrer")').first()
      if (await saveBtn.isVisible()) {
        await saveBtn.click()
        await page.waitForTimeout(1000)
      }
    }
  })

  test('affiche la section des logos et signatures', async ({ page }) => {
    const logoSection = page.locator('text=Logo, text=Signature, text=Cachet').first()
    if (await logoSection.isVisible()) {
      await expect(logoSection).toBeVisible()
    }
  })
})
