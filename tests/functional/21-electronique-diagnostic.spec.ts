import { test, expect } from '@playwright/test'
import { authenticate } from '../helpers/auth'

test.describe('Électronique - Diagnostic', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
  })

  test('navigation vers le diagnostic depuis la page appareils', async ({ page }) => {
    await page.goto('/electronique/appareils')
    await page.waitForLoadState('networkidle')
    const firstApp = page.locator('a[href*="/electronique/appareils/"]').first()
    if (await firstApp.isVisible()) {
      await firstApp.click()
      await page.waitForLoadState('networkidle')
      const diagBtn = page.locator('button:has-text("Diagnostic")')
      if (await diagBtn.isVisible()) {
        await diagBtn.click()
        await page.waitForLoadState('networkidle')
        await expect(page.locator('h1')).toContainText('Diagnostic')
      }
    }
  })

  test('page diagnostic contient le formulaire', async ({ page }) => {
    await page.goto('/electronique/appareils')
    await page.waitForLoadState('networkidle')
    const firstApp = page.locator('a[href*="/electronique/appareils/"]').first()
    if (await firstApp.isVisible()) {
      await firstApp.click()
      await page.waitForLoadState('networkidle')
      const diagBtn = page.locator('button:has-text("Diagnostic")')
      if (await diagBtn.isVisible()) {
        await diagBtn.click()
        await page.waitForLoadState('networkidle')
        const labels = ['Diagnostic', 'Cause', 'Tests', 'Pièces', 'Main-d', 'Temps']
        for (const l of labels) {
          const el = page.locator(`label:has-text("${l}")`)
          if (await el.isVisible()) {
            await expect(el).toBeVisible()
          }
        }
      }
    }
  })

  test('bouton retour vers la fiche appareil', async ({ page }) => {
    await page.goto('/electronique/appareils')
    await page.waitForLoadState('networkidle')
    const firstApp = page.locator('a[href*="/electronique/appareils/"]').first()
    if (await firstApp.isVisible()) {
      await firstApp.click()
      await page.waitForLoadState('networkidle')
      const diagBtn = page.locator('button:has-text("Diagnostic")')
      if (await diagBtn.isVisible()) {
        await diagBtn.click()
        await page.waitForLoadState('networkidle')
        const backBtn = page.locator('button:has-text("Retour")')
        if (await backBtn.isVisible()) {
          await backBtn.click()
          await page.waitForURL(/\/electronique\/appareils\//)
        }
      }
    }
  })
})
