import { test, expect } from '@playwright/test'

test.describe('PWA - Manifest', () => {
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
    const manifest = await response!.json()

    for (const icon of manifest.icons) {
      const iconResp = await page.goto(icon.src)
      expect(iconResp).not.toBeNull()
      expect(iconResp!.ok()).toBe(true)
      const contentType = iconResp!.headers()['content-type'] || ''
      expect(contentType).toContain('image')
    }
  })

  test('theme_color et background_color définis', async ({ page }) => {
    const response = await page.goto('/manifest.webmanifest')
    const manifest = await response!.json()
    expect(manifest.theme_color).toMatch(/^#[0-9a-fA-F]{6}$/)
    expect(manifest.background_color).toMatch(/^#[0-9a-fA-F]{6}$/)
  })
})
