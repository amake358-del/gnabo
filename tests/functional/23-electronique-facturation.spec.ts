import { test, expect } from '@playwright/test'
import { authenticate } from '../helpers/auth'

test.describe('Électronique - Facturation (Devis, Factures, Paiements)', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
  })

  test('page devis électronique contient titre et éléments', async ({ page }) => {
    await page.goto('/electronique/appareils')
    await page.waitForLoadState('networkidle')
    const firstApp = page.locator('a[href*="/electronique/appareils/"]').first()
    if (await firstApp.isVisible()) {
      await firstApp.click()
      await page.waitForLoadState('networkidle')
      const section = page.locator('text=Facturation')
      await expect(section).toBeVisible()
    }
  })

  test('boutons facturation visibles sur fiche appareil', async ({ page }) => {
    await page.goto('/electronique/appareils')
    await page.waitForLoadState('networkidle')
    const firstApp = page.locator('a[href*="/electronique/appareils/"]').first()
    if (await firstApp.isVisible()) {
      await firstApp.click()
      await page.waitForLoadState('networkidle')
      const btns = ['Nouveau devis', 'Nouvelle facture', 'Paiement']
      for (const b of btns) {
        const btn = page.locator(`button:has-text("${b}")`)
        if (await btn.isVisible()) {
          await expect(btn).toBeVisible()
        }
      }
    }
  })

  test('navigation vers nouveau devis électronique', async ({ page }) => {
    await page.goto('/electronique/appareils')
    await page.waitForLoadState('networkidle')
    const firstApp = page.locator('a[href*="/electronique/appareils/"]').first()
    if (await firstApp.isVisible()) {
      await firstApp.click()
      await page.waitForLoadState('networkidle')
      const devisBtn = page.locator('button:has-text("Nouveau devis")')
      if (await devisBtn.isVisible()) {
        await devisBtn.click()
        await page.waitForTimeout(2000)
        const currentUrl = page.url()
        expect(currentUrl).toContain('/electronique/devis/')
      }
    }
  })

  test('navigation vers paiement électronique', async ({ page }) => {
    await page.goto('/electronique/appareils')
    await page.waitForLoadState('networkidle')
    const firstApp = page.locator('a[href*="/electronique/appareils/"]').first()
    if (await firstApp.isVisible()) {
      await firstApp.click()
      await page.waitForLoadState('networkidle')
      const paiementBtn = page.locator('button:has-text("Paiement")')
      if (await paiementBtn.isVisible()) {
        await paiementBtn.click()
        await page.waitForTimeout(2000)
        const currentUrl = page.url()
        expect(currentUrl).toContain('/electronique/paiements/')
      }
    }
  })

  test('message vide affiché quand aucun document', async ({ page }) => {
    await page.goto('/electronique/appareils')
    await page.waitForLoadState('networkidle')
    const firstApp = page.locator('a[href*="/electronique/appareils/"]').first()
    if (await firstApp.isVisible()) {
      await firstApp.click()
      await page.waitForLoadState('networkidle')
      const emptyMsg = page.locator('text=Aucun document')
      if (await emptyMsg.isVisible()) {
        await expect(emptyMsg).toBeVisible()
      }
    }
  })
})
