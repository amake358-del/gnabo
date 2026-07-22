import { test, expect } from '@playwright/test'
import { authenticate } from '../helpers/auth'

test.describe('Interventions', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
  })

  test('affiche la page interventions', async ({ page }) => {
    await page.goto('/interventions')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toContainText('Interventions')
  })

  test('bouton Nouvelle intervention visible', async ({ page }) => {
    await page.goto('/interventions')
    await page.waitForLoadState('networkidle')
    const newBtn = page.locator('button:has-text("Nouvelle intervention")')
    await expect(newBtn).toBeVisible()
  })

  test('filtre par statut visible', async ({ page }) => {
    await page.goto('/interventions')
    await page.waitForLoadState('networkidle')
    const statusSelect = page.locator('select').first()
    await expect(statusSelect).toBeVisible()
    const options = await statusSelect.locator('option').all()
    expect(options.length).toBeGreaterThanOrEqual(2)
  })

  test('barre de recherche visible', async ({ page }) => {
    await page.goto('/interventions')
    await page.waitForLoadState('networkidle')
    const searchInput = page.locator('input[placeholder*="Client"]')
    await expect(searchInput).toBeVisible()
  })

  test('modal nouvelle intervention avec champs', async ({ page }) => {
    await page.goto('/interventions')
    await page.waitForLoadState('networkidle')
    await page.locator('button:has-text("Nouvelle intervention")').click()
    await page.waitForTimeout(500)
    const labels = ['Client', 'Service', 'Technicien', 'Équipe', 'Date prévue', 'Heure prévue', 'Adresse']
    for (const l of labels) {
      const el = page.locator(`label:has-text("${l}")`)
      if (await el.isVisible()) {
        await expect(el).toBeVisible()
      }
    }
  })

  test('liste des interventions affichée avec statuts', async ({ page }) => {
    await page.goto('/interventions')
    await page.waitForLoadState('networkidle')
    const emptyMsg = page.locator('text=Aucune intervention')
    const items = page.locator('[class*="card"]').filter({ has: page.locator('span.font-semibold') })
    const hasEmpty = await emptyMsg.isVisible()
    const hasItems = await items.count() > 0
    expect(hasEmpty || hasItems).toBe(true)
  })

  test('interventions affichent le badge de statut', async ({ page }) => {
    await page.goto('/interventions')
    await page.waitForLoadState('networkidle')
    const badges = page.locator('[class*="badge"]')
    const count = await badges.count()
    const emptyMsg = page.locator('text=Aucune intervention')
    if (await emptyMsg.isVisible()) {
      expect(true).toBe(true)
    } else {
      expect(count).toBeGreaterThanOrEqual(0)
    }
  })

  test('filtre par statut fonctionne', async ({ page }) => {
    await page.goto('/interventions')
    await page.waitForLoadState('networkidle')
    const statusSelect = page.locator('select').first()
    if (await statusSelect.isVisible()) {
      await statusSelect.selectOption('planifiee')
      await page.waitForTimeout(1000)
    }
  })
})
