import { test, expect } from '@playwright/test'
import { authenticate } from '../helpers/auth'

const MOBILE_VIEWPORTS = [
  { width: 375, height: 667, name: 'iPhone SE' },
  { width: 390, height: 844, name: 'iPhone 14' },
  { width: 360, height: 800, name: 'Android Small' },
  { width: 412, height: 915, name: 'Android Large' },
]

const PAGES = [
  '/', '/clients', '/devis', '/catalogue', '/modeles',
  '/parametres', '/utilisateurs', '/historique', '/sauvegardes',
  '/stocks', '/caisse', '/interventions',
  '/electronique/appareils', '/electronique/qr-codes', '/electronique/etiquettes',
]

test.describe('Mobile-first responsive', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
  })

  for (const vp of MOBILE_VIEWPORTS) {
    test.describe(`Viewport ${vp.name} (${vp.width}x${vp.height})`, () => {
      for (const route of PAGES) {
        test(`page ${route} sans débordement horizontal`, async ({ page }) => {
          await page.setViewportSize({ width: vp.width, height: vp.height })
          await page.goto(route, { waitUntil: 'networkidle', timeout: 30000 })
          await page.waitForTimeout(500)

          const overflow = await page.evaluate(() => {
            const doc = document.documentElement
            return doc.scrollWidth > doc.clientWidth ? doc.scrollWidth - doc.clientWidth : 0
          })
          expect(overflow).toBe(0)

          await expect(page.locator('h1')).toBeVisible({ timeout: 10000 })
        })
      }
    })
  }

  test('menu hamburger visible sur mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const hamburger = page.locator('button:has(svg.lucide-menu)')
    await expect(hamburger).toBeVisible()
  })

  test('sidebar masquée par défaut sur mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const sidebar = page.locator('aside')
    if (await sidebar.isVisible()) {
      const isHidden = await page.evaluate(() => {
        const s = document.querySelector('aside')
        if (!s) return true
        const style = window.getComputedStyle(s)
        return style.display === 'none' || style.transform?.includes('translateX(-100') || style.opacity === '0'
      })
      expect(isHidden).toBeTruthy()
    }
  })

  test('hamburger ouvre la sidebar sur mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const hamburger = page.locator('button:has(svg.lucide-menu)')
    if (await hamburger.isVisible()) {
      await hamburger.click()
      await page.waitForTimeout(500)
      const sidebarLinks = page.locator('aside a')
      const count = await sidebarLinks.count()
      expect(count).toBeGreaterThan(5)
    }
  })

  test('boutons tactiles assez grands (>= 44px) sur mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/devis')
    await page.waitForLoadState('networkidle')

    const smallButtons = await page.evaluate(() => {
      const btns = document.querySelectorAll('button, a[href], [role="button"]')
      const small: string[] = []
      btns.forEach(el => {
        const r = el.getBoundingClientRect()
        if (r.width < 44 || r.height < 44) {
          small.push(`${el.tagName} ${(el.textContent || '').trim().slice(0, 20)} = ${Math.round(r.width)}x${Math.round(r.height)}`)
        }
      })
      return small
    })
    expect(smallButtons.length).toBeLessThanOrEqual(5)
  })

  test('dialogues adaptés à la largeur mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/clients')
    await page.waitForLoadState('networkidle')

    const newBtn = page.locator('button:has-text("Nouveau client")')
    if (await newBtn.isVisible()) {
      await newBtn.click()
      await page.waitForTimeout(500)
      const dialog = page.locator('[role="dialog"]')
      if (await dialog.isVisible()) {
        const box = await dialog.boundingBox()
        if (box) {
          expect(box.width).toBeLessThanOrEqual(400)
        }
      }
    }
  })

  test('pas de scroll horizontal sur toutes les pages mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    for (const route of PAGES.slice(0, 5)) {
      await page.goto(route, { waitUntil: 'networkidle', timeout: 30000 })
      await page.waitForTimeout(500)
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth
          ? document.documentElement.scrollWidth - document.documentElement.clientWidth : 0
      })
      expect(overflow).toBe(0)
    }
  })
})
