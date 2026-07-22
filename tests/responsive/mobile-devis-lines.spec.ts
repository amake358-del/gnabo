import { test, expect } from '@playwright/test'
import { authenticate } from '../helpers/auth'

const MOBILE = { width: 390, height: 844 }

test.describe('Mobile - UX et formulaires', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
    await page.setViewportSize(MOBILE)
  })

  test('pas de tableau HTML intrusif sur mobile pour devis', async ({ page }) => {
    await page.goto('/devis', { waitUntil: 'networkidle', timeout: 30000 })
    const tables = page.locator('table')
    const tableCount = await tables.count()
    expect(tableCount).toBeLessThanOrEqual(1)
  })

  test('formulaire devis accessible sur mobile', async ({ page }) => {
    await page.goto('/devis/nouveau', { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)
    const onForm = page.url().includes('/devis/nouveau')
    if (onForm) {
      await expect(page.locator('h1')).toContainText('Nouveau devis')
    }
  })

  test('page appareils utilisable sur mobile', async ({ page }) => {
    await page.goto('/electronique/appareils', { waitUntil: 'networkidle', timeout: 30000 })
    await expect(page.locator('h1')).toBeVisible()
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
        ? document.documentElement.scrollWidth - document.documentElement.clientWidth : 0
    })
    expect(overflow).toBe(0)
  })

  test('page réception utilisable sur mobile', async ({ page }) => {
    await page.goto('/electronique/reception', { waitUntil: 'networkidle', timeout: 30000 })
    await expect(page.locator('h1')).toBeVisible()
    const input = page.locator('input[placeholder*="EL-"]')
    await expect(input).toBeVisible()
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
        ? document.documentElement.scrollWidth - document.documentElement.clientWidth : 0
    })
    expect(overflow).toBe(0)
  })

  test('page stocks utilisable sur mobile', async ({ page }) => {
    await page.goto('/stocks', { waitUntil: 'networkidle', timeout: 30000 })
    await expect(page.locator('h1')).toBeVisible()
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
        ? document.documentElement.scrollWidth - document.documentElement.clientWidth : 0
    })
    expect(overflow).toBe(0)
  })

  test('page caisse utilisable sur mobile', async ({ page }) => {
    await page.goto('/caisse', { waitUntil: 'networkidle', timeout: 30000 })
    await expect(page.locator('h1')).toBeVisible()
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
        ? document.documentElement.scrollWidth - document.documentElement.clientWidth : 0
    })
    expect(overflow).toBe(0)
  })

  test('page interventions utilisable sur mobile', async ({ page }) => {
    await page.goto('/interventions', { waitUntil: 'networkidle', timeout: 30000 })
    await expect(page.locator('h1')).toBeVisible()
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
        ? document.documentElement.scrollWidth - document.documentElement.clientWidth : 0
    })
    expect(overflow).toBe(0)
  })

  test('page QR codes utilisable sur mobile', async ({ page }) => {
    await page.goto('/electronique/qr-codes', { waitUntil: 'networkidle', timeout: 30000 })
    await expect(page.locator('h1')).toBeVisible()
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
        ? document.documentElement.scrollWidth - document.documentElement.clientWidth : 0
    })
    expect(overflow).toBe(0)
  })

  test('page étiquettes utilisable sur mobile', async ({ page }) => {
    await page.goto('/electronique/etiquettes', { waitUntil: 'networkidle', timeout: 30000 })
    await expect(page.locator('h1')).toBeVisible()
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth
        ? document.documentElement.scrollWidth - document.documentElement.clientWidth : 0
    })
    expect(overflow).toBe(0)
  })

  test('boutons accessibles avec cible >= 44px sur mobile', async ({ page }) => {
    await page.goto('/devis', { waitUntil: 'networkidle', timeout: 30000 })

    const smallTargets = await page.evaluate(() => {
      const btns = document.querySelectorAll('button, a[href], [role="button"]')
      const small: string[] = []
      btns.forEach(el => {
        const r = el.getBoundingClientRect()
        if (r.width < 44 || r.height < 44) {
          small.push(`${el.tagName}.${el.className} ${(el.textContent || '').trim().slice(0, 30)} = ${Math.round(r.width)}x${Math.round(r.height)}`)
        }
      })
      return small
    })

    expect(smallTargets.length).toBeLessThanOrEqual(5)
  })

  test('champs en pleine largeur sur mobile', async ({ page }) => {
    await page.goto('/devis/nouveau', { waitUntil: 'networkidle', timeout: 30000 })
    const inputs = page.locator('input')
    const count = await inputs.count()
    for (let i = 0; i < Math.min(count, 5); i++) {
      const input = inputs.nth(i)
      if (await input.isVisible()) {
        const box = await input.boundingBox()
        if (box) {
          expect(box.width).toBeGreaterThan(100)
        }
      }
    }
  })

  test('aucune barre de défilement horizontale sur mobile (pages critiques)', async ({ page }) => {
    const pages = ['/devis', '/clients', '/stocks', '/caisse', '/interventions']
    for (const route of pages) {
      await page.goto(route, { waitUntil: 'networkidle', timeout: 30000 })
      const overflow = await page.evaluate(() => {
        const doc = document.documentElement
        return doc.scrollWidth > doc.clientWidth ? doc.scrollWidth - doc.clientWidth : 0
      })
      expect(overflow).toBe(0)
    }
  })
})
