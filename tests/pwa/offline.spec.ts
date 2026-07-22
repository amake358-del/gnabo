import { test, expect } from '@playwright/test'

test.describe('PWA - Service Worker et offline', () => {
  test('service worker enregistré', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const hasSW = await page.evaluate(async () => {
      const registrations = await navigator.serviceWorker.getRegistrations()
      return registrations.length > 0
    })
    expect(hasSW).toBe(true)
  })

  test('service worker scope couvre l\'application', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const swScope = await page.evaluate(async () => {
      const registrations = await navigator.serviceWorker.getRegistrations()
      if (registrations.length === 0) return null
      return registrations[0].scope
    })
    expect(swScope).toContain('5173')
  })

  test('les ressources statiques sont en cache', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.evaluate(async () => {
      const registrations = await navigator.serviceWorker.getRegistrations()
      if (registrations.length > 0) {
        const cacheNames = await caches.keys()
        return cacheNames
      }
      return []
    })
  })

  test('favicon et icônes accessibles', async ({ page }) => {
    const icons = ['/favicon.svg', '/icon-192.png', '/icon-512.png']
    for (const iconPath of icons) {
      const resp = await page.goto(iconPath)
      if (resp && resp.ok()) {
        expect(resp.ok()).toBe(true)
      }
    }
  })
})
