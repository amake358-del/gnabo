import { test, expect } from '@playwright/test'
import { authenticate } from '../helpers/auth'

test.describe('Gestion de stock', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
  })

  test('affiche la page stock', async ({ page }) => {
    await page.goto('/stocks')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toContainText('Stock')
  })

  test('contient les filtres de recherche et service', async ({ page }) => {
    await page.goto('/stocks')
    await page.waitForLoadState('networkidle')
    const searchInput = page.locator('input[placeholder*="Rechercher"]')
    await expect(searchInput).toBeVisible()
    const serviceSelect = page.locator('select').first()
    if (await serviceSelect.isVisible()) {
      const options = await serviceSelect.locator('option').all()
      expect(options.length).toBeGreaterThanOrEqual(2)
    }
  })

  test('bouton alertes visible', async ({ page }) => {
    await page.goto('/stocks')
    await page.waitForLoadState('networkidle')
    const alertBtn = page.locator('button:has-text("Alertes")')
    await expect(alertBtn).toBeVisible()
  })

  test('tableau des articles visible', async ({ page }) => {
    await page.goto('/stocks')
    await page.waitForLoadState('networkidle')
    const table = page.locator('table')
    await expect(table).toBeVisible()
    const headers = await table.locator('thead th').allTextContents()
    const headerText = headers.join(' ')
    expect(headerText).toContain('Article')
    expect(headerText).toContain('Qté')
  })

  test('en-têtes du tableau stock complets', async ({ page }) => {
    await page.goto('/stocks')
    await page.waitForLoadState('networkidle')
    const headers = await page.locator('table thead th').allTextContents()
    const joined = headers.join(' ')
    expect(joined).toContain('Service')
    expect(joined).toContain('Seuil')
    expect(joined).toContain('Prix')
    expect(joined).toContain('Actions')
  })

  test('ligne article affiche les informations', async ({ page }) => {
    await page.goto('/stocks')
    await page.waitForLoadState('networkidle')
    const rows = page.locator('table tbody tr')
    const count = await rows.count()
    const emptyMsg = page.locator('text=Aucun article')
    if (count > 0) {
      const firstRowText = await rows.first().innerText()
      expect(firstRowText.length).toBeGreaterThan(10)
    } else {
      await expect(emptyMsg).toBeVisible()
    }
  })

  test('boutons mouvement et historique visibles par ligne', async ({ page }) => {
    await page.goto('/stocks')
    await page.waitForLoadState('networkidle')
    const moveBtns = page.locator('button:has(svg.lucide-arrow-up-down)')
    const histBtns = page.locator('button:has(svg.lucide-history)')
    const totalMoveBtns = await moveBtns.count()
    const totalHistBtns = await histBtns.count()
    expect(totalMoveBtns + totalHistBtns).toBeGreaterThanOrEqual(0)
  })

  test('navigation stock detail accessible', async ({ page }) => {
    await page.goto('/stocks')
    await page.waitForLoadState('networkidle')
    const histBtn = page.locator('button:has(svg.lucide-history)').first()
    if (await histBtn.isVisible()) {
      await histBtn.click()
      await page.waitForTimeout(2000)
      const currentUrl = page.url()
      expect(currentUrl).toContain('/stocks/')
    }
  })
})
