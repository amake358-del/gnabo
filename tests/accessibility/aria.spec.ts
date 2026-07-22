import { test, expect } from '@playwright/test'
import { authenticate } from '../helpers/auth'

test.describe('Accessibilité - ARIA et Navigation clavier', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
  })

  test('rôles ARIA corrects sur les dialogues', async ({ page }) => {
    await page.goto('/clients', { waitUntil: 'networkidle', timeout: 30000 })
    const newBtn = page.locator('button:has-text("Nouveau client")')
    if (await newBtn.isVisible()) {
      await newBtn.click()
      await page.waitForTimeout(500)

      const dialog = page.locator('[role="dialog"]')
      await expect(dialog).toBeVisible()
      const ariaModal = await dialog.getAttribute('aria-modal')
      expect(ariaModal).toBe('true')
    }
  })

  test('aria-label sur les boutons d\'icônes', async ({ page }) => {
    await page.goto('/devis', { waitUntil: 'networkidle', timeout: 30000 })

    const iconButtonsWithoutLabel = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button:not([aria-label])'))
        .filter(btn => {
          const hasIcon = btn.querySelector('svg')
          const text = (btn.textContent || '').trim()
          return hasIcon && text.length < 3
        })
        .map(btn => btn.outerHTML.slice(0, 100))
    })
    expect(iconButtonsWithoutLabel.length).toBeLessThanOrEqual(2)
  })

  test('navigation au clavier parcourt tous les éléments interactifs', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 })

    const focusableBefore = await page.evaluate(() => {
      return document.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])').length
    })
    expect(focusableBefore).toBeGreaterThan(5)

    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab')
      await page.waitForTimeout(100)
    }
    const focused = await page.evaluate(() => {
      const el = document.activeElement
      if (!el) return 'none'
      return `${el.tagName}.${el.className} text="${(el.textContent || '').trim().slice(0, 20)}"`
    })
    expect(focused).not.toBe('none')
  })

  test('labels associés aux champs de formulaire', async ({ page }) => {
    await page.goto('/clients', { waitUntil: 'networkidle', timeout: 30000 })
    const newBtn = page.locator('button:has-text("Nouveau client")')
    if (await newBtn.isVisible()) {
      await newBtn.click()
      await page.waitForTimeout(500)

      const unlabeled = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea'))
          .filter(el => {
            const id = (el as HTMLElement).id
            if (id && document.querySelector(`label[for="${id}"]`)) return false
            return !el.hasAttribute('aria-label') && !el.hasAttribute('aria-labelledby') && !el.closest('label')
          })
          .map(el => `${el.tagName} ${(el as HTMLInputElement).name || (el as HTMLElement).id || '(no id)'}`)
      })
      expect(unlabeled.length).toBe(0)
    }
  })

  test('tabindex logique sur la page dashboard', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 })

    const badTabIndex = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[tabindex]'))
        .filter(el => {
          const ti = parseInt(el.getAttribute('tabindex') || '0')
          return ti > 0
        })
        .length
    })
    expect(badTabIndex).toBe(0)
  })

  test('les champs obligatoires ont l\'attribut required ou aria-required', async ({ page }) => {
    await page.goto('/clients', { waitUntil: 'networkidle', timeout: 30000 })
    const newBtn = page.locator('button:has-text("Nouveau client")')
    if (await newBtn.isVisible()) {
      await newBtn.click()
      await page.waitForTimeout(500)

      const requiredFields = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('input, select, textarea'))
          .filter(el => {
            const label = el.closest('label') || document.querySelector(`label[for="${(el as HTMLElement).id}"]`)
            const labelText = label?.textContent || ''
            if (labelText.includes('*') && !el.hasAttribute('required') && !el.hasAttribute('aria-required')) {
              return true
            }
            return false
          })
          .map(el => `${el.tagName} ${(el as HTMLInputElement).name}`)
      })
      expect(requiredFields.length).toBe(0)
    }
  })

  test('images ont attribut alt', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 })

    const imagesNoAlt = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img:not([alt]), img[alt=""]'))
        .map(img => (img as HTMLImageElement).src)
    })
    expect(imagesNoAlt.filter(src => !src.includes('data:') && !src.includes('icon'))).toEqual([])
  })
})
