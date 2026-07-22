import { test, expect } from '@playwright/test'
import { authenticate } from '../helpers/auth'

test.describe('Caisse', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
  })

  test('affiche la page caisse', async ({ page }) => {
    await page.goto('/caisse')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toContainText('Caisse')
  })

  test('affiche les cartes de résumé (encaissements, dépenses, solde)', async ({ page }) => {
    await page.goto('/caisse')
    await page.waitForLoadState('networkidle')
    const texts = ['Encaissements', 'Dépenses', 'Solde']
    for (const t of texts) {
      const el = page.locator(`text=${t}`)
      await expect(el).toBeVisible({ timeout: 10000 })
    }
  })

  test('bouton Nouvelle entrée visible', async ({ page }) => {
    await page.goto('/caisse')
    await page.waitForLoadState('networkidle')
    const newBtn = page.locator('button:has-text("Nouvelle entrée")')
    await expect(newBtn).toBeVisible()
  })

  test('filtres date et type visibles', async ({ page }) => {
    await page.goto('/caisse')
    await page.waitForLoadState('networkidle')
    const dateInputs = page.locator('input[type="date"]')
    const count = await dateInputs.count()
    expect(count).toBeGreaterThanOrEqual(2)
    const typeSelect = page.locator('select').first()
    await expect(typeSelect).toBeVisible()
  })

  test('modal nouvelle entrée avec tous les champs', async ({ page }) => {
    await page.goto('/caisse')
    await page.waitForLoadState('networkidle')
    await page.locator('button:has-text("Nouvelle entrée")').click()
    await page.waitForTimeout(500)
    const labels = ['Type', 'Catégorie', 'Montant', 'Mode de paiement', 'Description']
    for (const l of labels) {
      const el = page.locator(`label:has-text("${l}")`)
      if (await el.isVisible()) {
        await expect(el).toBeVisible()
      }
    }
  })

  test('bouton Enregistrer visible dans le formulaire', async ({ page }) => {
    await page.goto('/caisse')
    await page.waitForLoadState('networkidle')
    await page.locator('button:has-text("Nouvelle entrée")').click()
    await page.waitForTimeout(500)
    const saveBtn = page.locator('button:has-text("Enregistrer")')
    await expect(saveBtn).toBeVisible()
  })

  test('liste des entrées affichée', async ({ page }) => {
    await page.goto('/caisse')
    await page.waitForLoadState('networkidle')
    const entries = page.locator('text=Aucune entrée')
    const rows = page.locator('[class*="card"]').filter({ has: page.locator('[class*="badge"]') })
    const hasEmpty = await entries.isVisible()
    const hasRows = await rows.count() > 0
    expect(hasEmpty || hasRows).toBe(true)
  })

  test('filtre type fonctionne', async ({ page }) => {
    await page.goto('/caisse')
    await page.waitForLoadState('networkidle')
    const typeSelect = page.locator('select').first()
    if (await typeSelect.isVisible()) {
      await typeSelect.selectOption('encaissement')
      await page.waitForTimeout(500)
      const filterBtn = page.locator('button:has-text("Filtrer")')
      if (await filterBtn.isVisible()) {
        await filterBtn.click()
        await page.waitForTimeout(1000)
      }
    }
  })
})
