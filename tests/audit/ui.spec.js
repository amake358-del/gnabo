const { test, expect } = require('@playwright/test')
const path = require('path')
const fs = require('fs')

const SCREENSHOT_DIR = path.resolve(__dirname, '../../screenshots')
const REPORT_PATH = path.resolve(__dirname, '../../AUDIT_REPORT.md')

const UI_ISSUES = []

function report(section, content) {
  fs.appendFileSync(REPORT_PATH, `## ${section}\n\n${content}\n\n`)
}

test.describe('Audit UI/UX', () => {
  test('Vérifier éléments d\'interface sur toutes les pages', async ({ page }) => {
    const pages = [
      '/', '/clients', '/devis', '/devis/nouveau', '/catalogue',
      '/modeles', '/parametres', '/utilisateurs', '/historique', '/sauvegardes'
    ]

    for (const route of pages) {
      await page.goto(route, { waitUntil: 'networkidle', timeout: 30000 })

      // Vérifier les boutons trop petits (< 32px)
      const smallButtons = await page.$$eval('button, a[href], [role="button"]', els =>
        els.filter(el => {
          const r = el.getBoundingClientRect()
          return r.width < 32 || r.height < 32
        }).map(el => {
          const r = el.getBoundingClientRect()
          return {
            tag: el.tagName,
            text: (el.textContent || '').trim().slice(0, 40),
            size: `${Math.round(r.width)}x${Math.round(r.height)}`
          }
        })
      )
      if (smallButtons.length) {
        UI_ISSUES.push({ page: route, type: 'Petits boutons', details: smallButtons.slice(0, 5) })
      }

      // Vérifier les débordements horizontaux
      const overflow = await page.evaluate(() => {
        const doc = document.documentElement
        return doc.scrollWidth > doc.clientWidth ? doc.scrollWidth - doc.clientWidth : 0
      })
      if (overflow > 0) {
        UI_ISSUES.push({ page: route, type: 'Débordement horizontal', details: `${overflow}px` })
      }

      // Vérifier les textes tronqués (éléments avec overflow hidden)
      const clipped = await page.$$eval('*', els =>
        els.filter(el => {
          const style = window.getComputedStyle(el)
          return style.overflow === 'hidden' && el.scrollWidth > el.clientWidth
        }).slice(0, 3).map(el => ({
          tag: el.tagName,
          text: (el.textContent || '').trim().slice(0, 40),
          class: el.className?.slice(0, 40)
        }))
      )
      if (clipped.length) {
        UI_ISSUES.push({ page: route, type: 'Textes tronqués', details: clipped })
      }

      // Vérifier les champs sans label
      const inputsNoLabel = await page.$$eval('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea', els =>
        els.filter(el => {
          const id = el.id
          if (id && document.querySelector(`label[for="${id}"]`)) return false
          return !el.hasAttribute('aria-label') && !el.closest('label')
        }).map(el => ({
          tag: el.tagName,
          name: el.name || el.id || '(pas de nom)',
          placeholder: el.placeholder || '(pas de placeholder)'
        }))
      )
      if (inputsNoLabel.length) {
        UI_ISSUES.push({ page: route, type: 'Champs sans label', details: inputsNoLabel.slice(0, 5) })
      }

      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, 'desktop', `ui_${route.replace(/\//g, '_') || 'home'}.png`),
        fullPage: true
      })
    }
  })

  test('Analyser la cohérence des composants', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    // Vérifier les images sans alt
    const imagesNoAlt = await page.$$eval('img', imgs =>
      imgs.filter(img => !img.hasAttribute('alt')).map(img => img.src)
    )
    if (imagesNoAlt.length) {
      UI_ISSUES.push({ page: '/', type: 'Images sans attribut alt', details: imagesNoAlt.slice(0, 5) })
    }

    // Vérifier la hiérarchie des titres (h1 doit être présent)
    const h1Count = await page.$$eval('h1', els => els.length)
    if (h1Count === 0) {
      UI_ISSUES.push({ page: '/', type: 'Absence de h1', details: 'Aucun titre h1 sur la page d\'accueil' })
    }
  })

  test.afterAll(() => {
    if (UI_ISSUES.length) {
      report('4. Problèmes UI/UX', UI_ISSUES.map(i =>
        `### ${i.page} - ${i.type}\n\`\`\`json\n${JSON.stringify(i.details, null, 2)}\n\`\`\``
      ).join('\n\n'))
    } else {
      report('4. Problèmes UI/UX', 'Aucun problème détecté.')
    }
  })
})
