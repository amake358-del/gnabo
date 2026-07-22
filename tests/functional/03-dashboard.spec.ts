import { test, expect } from '@playwright/test'
import { authenticate, clientNav, authAndNav } from '../helpers/auth'

test.describe('Tableau de bord', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
  })

  test('affiche les cartes de statistiques', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Tableau de bord')
    const cards = page.locator('text=Total devis, text=Chiffre d\'affaires, text=Taux de conversion')
    await expect(cards.first()).toBeVisible({ timeout: 10000 })
  })

  test('affiche le graphique d\'évolution mensuelle', async ({ page }) => {
    await expect(page.locator('text=Évolution mensuelle')).toBeVisible({ timeout: 10000 })
    const chart = page.locator('.recharts-responsive-container')
    await expect(chart).toBeVisible()
  })

  test('affiche la section des derniers devis', async ({ page }) => {
    await expect(page.locator('text=Derniers devis')).toBeVisible({ timeout: 10000 })
  })

  test('affiche la répartition par statut', async ({ page }) => {
    await expect(page.locator('text=Par statut')).toBeVisible({ timeout: 10000 })
  })

  test('cliquer sur un devis récent navigue vers la page du devis', async ({ page }) => {
    await expect(page.locator('text=Derniers devis')).toBeVisible({ timeout: 10000 })
    const recentDevis = page.locator('text=Derniers devis + div [class*="cursor-pointer"]').first()
    if (await recentDevis.isVisible()) {
      await recentDevis.click()
      await expect(page).toHaveURL(/\/devis\//)
    }
  })
})
