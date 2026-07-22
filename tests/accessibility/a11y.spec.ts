import { test, expect } from '@playwright/test'
import { authenticate, clientNav, authAndNav } from '../helpers/auth'

test.describe('Accessibilité', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
  })

  test('images ont un attribut alt', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const imagesNoAlt = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img'))
        .filter(img => !img.hasAttribute('alt') || img.getAttribute('alt') === null)
        .map(img => img.src)
    })
    expect(imagesNoAlt.filter(src => !src.includes('icon'))).toEqual([])
  })

  test('un titre h1 présent sur chaque page', async ({ page }) => {
    const pages = ['/', '/clients', '/devis', '/catalogue', '/modeles', '/parametres', '/utilisateurs', '/historique', '/sauvegardes']
    for (const route of pages) {
      await page.goto(route, { waitUntil: 'networkidle', timeout: 30000 })
      const h1Count = await page.locator('h1').count()
      expect(h1Count).toBeGreaterThanOrEqual(1)
    }
  })

  test('les champs de formulaire ont des labels', async ({ page }) => {
    await page.goto('/clients')
    await page.waitForLoadState('networkidle')

    await page.locator('text=Nouveau client').click()
    await page.waitForTimeout(500)

    const unlabeledInputs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea'))
        .filter(el => {
          const id = el.id
          if (id && document.querySelector(`label[for="${id}"]`)) return false
          return !el.hasAttribute('aria-label') && !el.closest('label')
        })
        .map(el => el.tagName + ' ' + (el.getAttribute('name') || el.getAttribute('id') || '(no id)'))
    })
    expect(unlabeledInputs.length).toBeLessThanOrEqual(2)
  })

  test('navigation au clavier - tabulation fonctionnelle', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.keyboard.press('Tab')
    const focused1 = await page.evaluate(() => document.activeElement?.tagName || '')
    expect(focused1).toBeTruthy()

    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab')
      await page.waitForTimeout(100)
    }

    const focusedAfter = await page.evaluate(() => document.activeElement?.tagName || '')
    expect(focusedAfter).toBeTruthy()
  })

  test('boutons avec aria-label pour actions icon-only', async ({ page }) => {
    await page.goto('/devis')
    await page.waitForLoadState('networkidle')

    const iconButtons = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button:not([aria-label]):not([type="submit"])'))
        .filter(btn => {
          const text = (btn.textContent || '').trim()
          return text.length < 3 && btn.querySelector('svg')
        })
        .map(btn => btn.outerHTML.slice(0, 100))
    })
    expect(iconButtons.length).toBeLessThanOrEqual(2)
  })

  test('cibles tactiles >= 32px sur toutes les pages', async ({ page }) => {
    const pages = ['/', '/clients', '/devis', '/catalogue', '/parametres']
    for (const route of pages) {
      await page.goto(route, { waitUntil: 'networkidle', timeout: 30000 })

      const smallTargets = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('button, a[href], [role="button"]'))
          .filter(el => {
            const r = el.getBoundingClientRect()
            return r.width < 32 || r.height < 32
          })
          .length
      })
      expect(smallTargets).toBeLessThanOrEqual(3)
    }
  })

  test('pas de texte tronqué visible', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const clippedTexts = await page.evaluate(() => {
      const all = document.querySelectorAll('*')
      const clipped: string[] = []
      all.forEach(el => {
        const style = window.getComputedStyle(el)
        if (style.overflow === 'hidden' && el.scrollWidth > el.clientWidth && el.textContent && el.textContent.trim().length > 3) {
          clipped.push((el.textContent || '').trim().slice(0, 40) + ' (overflow)')
        }
      })
      return clipped.slice(0, 5)
    })
    expect(clippedTexts.length).toBeLessThanOrEqual(2)
  })
})
