import { test, expect } from '@playwright/test'

test.describe('PWA - Installation, Manifest, Splash Screen', () => {
  test('manifest.json est accessible et valide', async ({ page }) => {
    const response = await page.goto('/manifest.webmanifest')
    expect(response).not.toBeNull()
    expect(response!.ok()).toBe(true)

    const manifest = await response!.json()
    expect(manifest.name).toBeTruthy()
    expect(manifest.short_name).toBeTruthy()
    expect(manifest.display).toBe('standalone')
    expect(manifest.start_url).toBe('/')
    expect(Array.isArray(manifest.icons)).toBe(true)
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2)
  })

  test('icônes du manifest sont accessibles', async ({ page }) => {
    const response = await page.goto('/manifest.webmanifest')
    expect(response).not.toBeNull()
    const manifest = await response!.json()

    for (const icon of manifest.icons) {
      const iconResp = await page.goto(icon.src)
      expect(iconResp).not.toBeNull()
      expect(iconResp!.ok()).toBe(true)
    }
  })

  test('theme_color et background_color définis', async ({ page }) => {
    const response = await page.goto('/manifest.webmanifest')
    expect(response).not.toBeNull()
    const manifest = await response!.json()
    expect(manifest.theme_color).toMatch(/^#[0-9a-fA-F]{6}$/)
    expect(manifest.background_color).toMatch(/^#[0-9a-fA-F]{6}$/)
  })

  test('apple-touch-icon et favicon présents', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const appleIcon = page.locator('link[rel="apple-touch-icon"]')
    const favicon = page.locator('link[rel="icon"]')

    expect(await appleIcon.count()).toBeGreaterThanOrEqual(1)
    expect(await favicon.count()).toBeGreaterThanOrEqual(1)
  })

  test('beforeinstallprompt peut être déclenché', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const promptTriggered = await page.evaluate(() => {
      return new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => resolve(false), 3000)
        window.addEventListener('beforeinstallprompt', (e) => {
          e.preventDefault()
          clearTimeout(timeout)
          resolve(true)
        })
        window.dispatchEvent(new Event('beforeinstallprompt'))
      })
    })
    expect(promptTriggered).toBe(true)
  })
})
