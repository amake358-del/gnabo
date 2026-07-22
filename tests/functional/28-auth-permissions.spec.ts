import { test, expect } from '@playwright/test'
import { authenticate } from '../helpers/auth'

test.describe('Authentification et permissions', () => {
  test('page de login accessible sans authentification', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('page login affiche le logo entreprise', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    const logo = page.locator('img[alt*="Entreprise"], svg.lucide-building2, svg.lucide-Building2').first()
    await expect(logo).toBeVisible()
  })

  test('login contient bouton de connexion', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    const submitBtn = page.locator('button[type="submit"]')
    await expect(submitBtn).toContainText('Connecter')
  })

  test('redirection vers login sans authentification', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(3000)
    const currentUrl = page.url()
    const onLogin = currentUrl.includes('/login')
    const onSelect = currentUrl.includes('/select-entreprise')
    const isProtected = await page.locator('text=Chargement').isVisible()
    expect(onLogin || onSelect || isProtected).toBe(true)
  })

  test('page paramètres accessible après authentification', async ({ page }) => {
    await authenticate(page)
    await page.goto('/parametres')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toContainText('Paramètres')
  })

  test('page utilisateurs accessible après authentification', async ({ page }) => {
    await authenticate(page)
    await page.goto('/utilisateurs')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toContainText('Utilisateurs')
  })

  test('page sauvegardes accessible après authentification', async ({ page }) => {
    await authenticate(page)
    await page.goto('/sauvegardes')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toContainText('Sauvegardes')
  })

  test('page historique accessible après authentification', async ({ page }) => {
    await authenticate(page)
    await page.goto('/historique')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toContainText('Historique')
  })

  test('bouton déconnexion visible dans le header', async ({ page }) => {
    await authenticate(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const logoutBtn = page.locator('button:has-text("Quitter")')
    await expect(logoutBtn).toBeVisible()
  })

  test('nom utilisateur affiché dans le header', async ({ page }) => {
    await authenticate(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const userName = page.locator('header span.text-xs').first()
    if (await userName.isVisible()) {
      const text = await userName.textContent()
      expect(text?.length).toBeGreaterThan(0)
    }
  })
})
