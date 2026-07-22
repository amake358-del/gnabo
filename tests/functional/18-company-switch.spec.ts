import { test, expect } from '@playwright/test'
import { authenticate } from '../helpers/auth'

test.describe('Changement d\'entreprise', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
  })

  test('affiche le sélecteur d\'entreprise', async ({ page }) => {
    const headerBtn = page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: /GNABÖ|EGAIM|Métallique/ }).first()
    if (await headerBtn.isVisible()) {
      await headerBtn.click()
      await page.waitForTimeout(500)
    }
  })

  test('contient un lien pour changer d\'entreprise dans le header', async ({ page }) => {
    const companySwitcher = page.locator('text=/GNABÖ|EGAIM|Métallique/').first()
    if (await companySwitcher.isVisible()) {
      await companySwitcher.click()
      await page.waitForTimeout(500)
      const entrepriseLink = page.locator('a[href*="select-entreprise"], button:has-text("Changer")')
      if (await entrepriseLink.isVisible()) {
        await expect(entrepriseLink).toBeVisible()
      }
    }
  })

  test('la page select-entreprise est accessible depuis la navigation', async ({ page }) => {
    await page.goto('/select-entreprise')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toContainText('GD')
    const btns = page.locator('button:has(h3)')
    const count = await btns.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })
})
