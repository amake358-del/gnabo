const { test } = require('@playwright/test')
const path = require('path')
const fs = require('fs')

const SCREENSHOT_DIR = path.resolve(__dirname, '../../screenshots')
const REPORT_PATH = path.resolve(__dirname, '../../AUDIT_REPORT.md')

const RESPONSIVE_ISSUES = []
const VIEWPORTS = {
  desktop: { width: 1920, height: 1080 },
  desktop_small: { width: 1366, height: 768 },
  tablet: { width: 1024, height: 768 },
  mobile_large: { width: 412, height: 915 },
  mobile_small: { width: 390, height: 844 },
}

const PAGES = [
  '/', '/clients', '/devis', '/devis/nouveau', '/catalogue',
  '/modeles', '/parametres', '/utilisateurs', '/historique', '/sauvegardes'
]

function report(section, content) {
  fs.appendFileSync(REPORT_PATH, `## ${section}\n\n${content}\n\n`)
}

test.describe('Audit Responsive', () => {
  for (const [device, viewport] of Object.entries(VIEWPORTS)) {
    test(`Test responsive: ${device} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      await page.setViewportSize(viewport)

      for (const route of PAGES) {
        await page.goto(route, { waitUntil: 'networkidle', timeout: 30000 })

        // Vérifier débordement horizontal
        const overflow = await page.evaluate(() => {
          const doc = document.documentElement
          return doc.scrollWidth > doc.clientWidth ? doc.scrollWidth - doc.clientWidth : 0
        })
        if (overflow > 0) {
          RESPONSIVE_ISSUES.push({
            page: route,
            device,
            type: 'Débordement horizontal',
            details: `${overflow}px de dépassement`
          })
        }

        // Vérifier si le menu est accessible
        if (viewport.width <= 768) {
          const menuBtn = await page.$('button:has(svg), [aria-label="Menu"], [aria-label="Ouvrir le menu"], .menu-toggle')
          if (!menuBtn) {
            RESPONSIVE_ISSUES.push({
              page: route,
              device,
              type: 'Menu mobile',
              details: 'Aucun bouton de menu mobile détecté'
            })
          }
        }

        const safeName = route.replace(/\//g, '_') || 'home'
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, device, `${safeName}.png`),
          fullPage: true
        })
      }
    })
  }

  test.afterAll(() => {
    if (RESPONSIVE_ISSUES.length) {
      report('5. Problèmes Responsive', RESPONSIVE_ISSUES.map(i =>
        `- **[${i.device}] ${i.page}** : ${i.type} → ${i.details}`
      ).join('\n'))
    } else {
      report('5. Problèmes Responsive', 'Aucun problème responsive détecté.')
    }
  })
})
