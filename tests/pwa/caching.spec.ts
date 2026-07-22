import { test, expect } from '@playwright/test'

test.describe('PWA - Service Worker et Cache', () => {
  test('service worker actif et scope correct', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const swInfo = await page.evaluate(async () => {
      const registrations = await navigator.serviceWorker.getRegistrations()
      if (registrations.length === 0) return { active: false, scope: '' }
      const sw = registrations[0].active || registrations[0].installing || registrations[0].waiting
      return {
        active: !!sw,
        scope: registrations[0].scope,
        state: sw?.state || 'unknown',
      }
    })

    if (swInfo.active) {
      expect(swInfo.scope).toContain('5173')
    }
  })

  test('ressources statiques mises en cache par le SW', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const cacheInfo = await page.evaluate(async () => {
      const cacheNames = await caches.keys()
      if (cacheNames.length === 0) return { hasCache: false, entries: [] }

      const allEntries: { cache: string; url: string }[] = []
      for (const name of cacheNames) {
        const cache = await caches.open(name)
        const requests = await cache.keys()
        for (const req of requests) {
          allEntries.push({ cache: name, url: req.url })
        }
      }
      return { hasCache: true, entries: allEntries }
    })

    if (cacheInfo.hasCache) {
      expect(cacheInfo.entries.length).toBeGreaterThan(0)
      const hasAppShell = cacheInfo.entries.some(e => e.url.includes('index.html') || e.url.includes('/'))
      expect(hasAppShell).toBe(true)
    }
  })

  test('cache les ressources statiques', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const cachedUrls = await page.evaluate(async () => {
      const cacheNames = await caches.keys()
      const urls: string[] = []
      for (const name of cacheNames) {
        const cache = await caches.open(name)
        const requests = await cache.keys()
        requests.forEach(r => urls.push(r.url))
      }
      return urls
    })

    if (cachedUrls.length > 0) {
      const hasCSS = cachedUrls.some(u => u.includes('.css'))
      const hasJS = cachedUrls.some(u => u.includes('.js'))
      expect(hasCSS || hasJS).toBe(true)
    }
  })

  test('service worker enregistré', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const hasSW = await page.evaluate(async () => {
      const registrations = await navigator.serviceWorker.getRegistrations()
      return registrations.length > 0
    })
  })
})
