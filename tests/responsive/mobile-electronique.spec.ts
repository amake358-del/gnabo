import { test, expect } from '@playwright/test'
import { authenticate } from '../helpers/auth'

const MOBILE_VIEWPORTS = [
  { width: 375, height: 667, name: 'iPhone_SE' },
  { width: 390, height: 844, name: 'iPhone_14' },
  { width: 360, height: 800, name: 'Android_Small' },
  { width: 412, height: 915, name: 'Android_Large' },
]

test.describe('Mobile - Module Électronique', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
  })

  for (const vp of MOBILE_VIEWPORTS) {
    test.describe(`Viewport ${vp.name} (${vp.width}x${vp.height})`, () => {
      test('page appareils sans débordement', async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height })
        await page.goto('/electronique/appareils', { waitUntil: 'networkidle', timeout: 30000 })
        await page.waitForTimeout(500)

        const overflow = await page.evaluate(() => {
          const doc = document.documentElement
          return doc.scrollWidth > doc.clientWidth ? doc.scrollWidth - doc.clientWidth : 0
        })
        expect(overflow).toBe(0)
        await expect(page.locator('h1')).toBeVisible()
      })

      test('page réception sans débordement', async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height })
        await page.goto('/electronique/reception', { waitUntil: 'networkidle', timeout: 30000 })
        await page.waitForTimeout(500)

        const overflow = await page.evaluate(() => {
          const doc = document.documentElement
          return doc.scrollWidth > doc.clientWidth ? doc.scrollWidth - doc.clientWidth : 0
        })
        expect(overflow).toBe(0)
        await expect(page.locator('h1')).toBeVisible()
      })

      test('page QR codes sans débordement', async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height })
        await page.goto('/electronique/qr-codes', { waitUntil: 'networkidle', timeout: 30000 })
        await page.waitForTimeout(500)

        const overflow = await page.evaluate(() => {
          const doc = document.documentElement
          return doc.scrollWidth > doc.clientWidth ? doc.scrollWidth - doc.clientWidth : 0
        })
        expect(overflow).toBe(0)
        await expect(page.locator('h1')).toBeVisible()
      })

      test('page étiquettes sans débordement', async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height })
        await page.goto('/electronique/etiquettes', { waitUntil: 'networkidle', timeout: 30000 })
        await page.waitForTimeout(500)

        const overflow = await page.evaluate(() => {
          const doc = document.documentElement
          return doc.scrollWidth > doc.clientWidth ? doc.scrollWidth - doc.clientWidth : 0
        })
        expect(overflow).toBe(0)
        await expect(page.locator('h1')).toBeVisible()
      })
    })
  }
})
