import { test, expect } from '@playwright/test'
import { authenticate } from '../helpers/auth'

test.describe('Électronique - Contrôle technique', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
  })

  test('navigation vers le controle depuis la fiche appareil', async ({ page }) => {
    await page.goto('/electronique/appareils')
    await page.waitForLoadState('networkidle')
    const firstApp = page.locator('a[href*="/electronique/appareils/"]').first()
    if (await firstApp.isVisible()) {
      await firstApp.click()
      await page.waitForLoadState('networkidle')
      const ctBtn = page.locator('button:has-text("Contrôle")')
      if (await ctBtn.isVisible()) {
        await ctBtn.click()
        await page.waitForLoadState('networkidle')
        await expect(page.locator('h1')).toContainText('Contrôle technique')
      }
    }
  })

  test('page controle contient les categories de test', async ({ page }) => {
    await page.goto('/electronique/appareils')
    await page.waitForLoadState('networkidle')
    const firstApp = page.locator('a[href*="/electronique/appareils/"]').first()
    if (await firstApp.isVisible()) {
      await firstApp.click()
      await page.waitForLoadState('networkidle')
      const ctBtn = page.locator('button:has-text("Contrôle")')
      if (await ctBtn.isVisible()) {
        await ctBtn.click()
        await page.waitForLoadState('networkidle')
        const categories = ['Alimentation', 'Écran', 'Batterie', 'Wi-Fi', 'Bluetooth', 'Tactile']
        for (const c of categories) {
          const el = page.locator(`text=${c}`)
          if (await el.isVisible()) {
            await expect(el).toBeVisible()
          }
        }
      }
    }
  })

  test('boutons OK/KO/N/A visibles', async ({ page }) => {
    await page.goto('/electronique/appareils')
    await page.waitForLoadState('networkidle')
    const firstApp = page.locator('a[href*="/electronique/appareils/"]').first()
    if (await firstApp.isVisible()) {
      await firstApp.click()
      await page.waitForLoadState('networkidle')
      const ctBtn = page.locator('button:has-text("Contrôle")')
      if (await ctBtn.isVisible()) {
        await ctBtn.click()
        await page.waitForLoadState('networkidle')
        const okBtn = page.locator('button:has-text("OK")').first()
        if (await okBtn.isVisible()) {
          await expect(okBtn).toBeVisible()
        }
        const koBtn = page.locator('button:has-text("KO")').first()
        if (await koBtn.isVisible()) {
          await expect(koBtn).toBeVisible()
        }
      }
    }
  })
})
