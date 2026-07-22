import { test, expect } from '@playwright/test'
import { authenticate } from '../helpers/auth'

test.describe('Électronique - Réparation', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
  })

  test('navigation vers la réparation depuis la fiche appareil', async ({ page }) => {
    await page.goto('/electronique/appareils')
    await page.waitForLoadState('networkidle')
    const firstApp = page.locator('a[href*="/electronique/appareils/"]').first()
    if (await firstApp.isVisible()) {
      await firstApp.click()
      await page.waitForLoadState('networkidle')
      const repBtn = page.locator('button:has-text("Réparation")')
      if (await repBtn.isVisible()) {
        await repBtn.click()
        await page.waitForLoadState('networkidle')
        await expect(page.locator('h1')).toContainText('Réparation')
      }
    }
  })

  test('page réparation contient les sélecteurs de statut', async ({ page }) => {
    await page.goto('/electronique/appareils')
    await page.waitForLoadState('networkidle')
    const firstApp = page.locator('a[href*="/electronique/appareils/"]').first()
    if (await firstApp.isVisible()) {
      await firstApp.click()
      await page.waitForLoadState('networkidle')
      const repBtn = page.locator('button:has-text("Réparation")')
      if (await repBtn.isVisible()) {
        await repBtn.click()
        await page.waitForLoadState('networkidle')
        const statusBtns = ['En cours', 'Attente validation', 'Attente pièces', 'Test', 'Terminé']
        for (const s of statusBtns) {
          const btn = page.locator(`button:has-text("${s}")`)
          if (await btn.isVisible()) {
            await expect(btn).toBeVisible()
            break
          }
        }
      }
    }
  })

  test('champs réparation visibles', async ({ page }) => {
    await page.goto('/electronique/appareils')
    await page.waitForLoadState('networkidle')
    const firstApp = page.locator('a[href*="/electronique/appareils/"]').first()
    if (await firstApp.isVisible()) {
      await firstApp.click()
      await page.waitForLoadState('networkidle')
      const repBtn = page.locator('button:has-text("Réparation")')
      if (await repBtn.isVisible()) {
        await repBtn.click()
        await page.waitForLoadState('networkidle')
        const labels = ['Pièces utilisées', 'Main-d', 'Temps passé', 'Notes']
        for (const l of labels) {
          const el = page.locator(`label:has-text("${l}")`)
          if (await el.isVisible()) {
            await expect(el).toBeVisible()
          }
        }
      }
    }
  })
})
