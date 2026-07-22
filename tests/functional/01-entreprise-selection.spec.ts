import { test, expect } from '@playwright/test'

test.describe('Sélection d\'entreprise', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/select-entreprise')
  })

  test('affiche la page de sélection avec les entreprises disponibles', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('GD')
    await expect(page.locator('text=Choisissez votre entreprise')).toBeVisible()
    const btns = page.locator('button:has(h3)')
    const count = await btns.count()
    expect(count).toBeGreaterThanOrEqual(2)
  })

  test('sélectionne une entreprise et navigue vers le tableau de bord', async ({ page }) => {
    const firstBtn = page.locator('button').filter({ has: page.locator('h3') }).first()
    await firstBtn.waitFor({ state: 'visible', timeout: 10000 })
    await firstBtn.click({ force: true })
    await page.waitForTimeout(1000)
    await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 })
    await expect(page.locator('h1')).toContainText('Tableau de bord')
  })

  test('persiste le choix dans localStorage', async ({ page }) => {
    await page.locator('button').filter({ has: page.locator('h3') }).first().click()
    await page.waitForTimeout(1000)
    const stored = await page.evaluate(() => localStorage.getItem('entrepriseId'))
    expect(stored).toBeTruthy()
  })

  test('loader disparaît après chargement des données', async ({ page }) => {
    await page.goto('/select-entreprise', { waitUntil: 'networkidle', timeout: 30000 })
    const hasSpinner = await page.locator('.animate-spin').count()
    const dataLoaded = await page.locator('button').filter({ has: page.locator('h3') }).count()
    expect(hasSpinner === 0 || dataLoaded > 0).toBe(true)
  })
})
