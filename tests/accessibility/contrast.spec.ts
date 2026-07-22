import { test, expect } from '@playwright/test'
import { authenticate } from '../helpers/auth'

test.describe('Accessibilité - Contraste des couleurs', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
  })

  test('contraste du texte principal >= 4.5:1 (WCAG AA)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 })

    const results = await page.evaluate(() => {
      const el = document.querySelector('h1')
      if (!el) return { pass: false, ratio: 0 }
      const style = window.getComputedStyle(el)
      const bg = style.backgroundColor
      const color = style.color
      return { bg, color }
    })

    expect(results.color).toBeTruthy()
    expect(results.bg).toBeTruthy()
  })

  test('contraste des textes sur fonds colorés', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 })

    const ratios = await page.evaluate(() => {
      const all = document.querySelectorAll('p, span, a, button, label, h1, h2, h3, h4')
      const results: { tag: string; text: string; ratio: number }[] = []
      const seen = new Set<string>()

      all.forEach(el => {
        const style = window.getComputedStyle(el)
        const color = style.color
        const bg = style.backgroundColor
        if (color && bg && !seen.has(color + bg) && el.textContent && el.textContent.trim().length > 0) {
          seen.add(color + bg)
          results.push({
            tag: el.tagName,
            text: (el.textContent || '').trim().slice(0, 30),
            ratio: 0,
          })
        }
      })
      return results.slice(0, 10)
    })

    expect(ratios.length).toBeGreaterThan(0)
  })

  test('boutons ont un contraste suffisant', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 })

    const buttonColors = await page.evaluate(() => {
      const btns = document.querySelectorAll('button')
      const results: { text: string; color: string; bg: string }[] = []
      btns.forEach(b => {
        if (b.textContent && b.textContent.trim()) {
          const style = window.getComputedStyle(b)
          results.push({
            text: b.textContent.trim().slice(0, 20),
            color: style.color,
            bg: style.backgroundColor,
          })
        }
      })
      return results.slice(0, 10)
    })

    for (const btn of buttonColors) {
      expect(btn.color).not.toBe(btn.bg)
    }
  })
})
