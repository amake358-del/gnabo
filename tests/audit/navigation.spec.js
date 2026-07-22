const { test, expect } = require('@playwright/test')
const path = require('path')
const fs = require('fs')

const SCREENSHOT_DIR = path.resolve(__dirname, '../../screenshots')
const REPORT_PATH = path.resolve(__dirname, '../../AUDIT_REPORT.md')

const PAGES = [
  { route: '/', name: 'Dashboard' },
  { route: '/clients', name: 'Clients' },
  { route: '/devis', name: 'Devis - Liste' },
  { route: '/devis/nouveau', name: 'Devis - Nouveau' },
  { route: '/catalogue', name: 'Catalogue' },
  { route: '/modeles', name: 'Modèles' },
  { route: '/parametres', name: 'Paramètres' },
  { route: '/utilisateurs', name: 'Utilisateurs' },
  { route: '/historique', name: 'Historique' },
  { route: '/sauvegardes', name: 'Sauvegardes' },
]

const RESULTS = { navigation: [], console: [], network: [] }

function writeReport(section, content) {
  const header = `## ${section}\n\n`
  fs.appendFileSync(REPORT_PATH, header + content + '\n\n')
}

test.describe('Audit Navigation', () => {
  test.beforeAll(() => {
    if (fs.existsSync(REPORT_PATH)) fs.unlinkSync(REPORT_PATH)
    fs.writeFileSync(REPORT_PATH, `# AUDIT APPLICATION - GESTION DEVIS\n\n**Date:** ${new Date().toISOString()}\n\n---\n\n`)
  })

  PAGES.forEach(({ route, name }) => {
    test(`Navigation: ${name} (${route})`, async ({ page }) => {
      const errors = []
      const requests = []

      page.on('console', msg => {
        if (msg.type() === 'error') errors.push({ type: 'console', text: msg.text() })
      })
      page.on('requestfailed', req => {
        requests.push({ url: req.url(), reason: req.failure()?.errorText })
      })

      const start = Date.now()
      await page.goto(route, { waitUntil: 'networkidle', timeout: 30000 })
      const loadTime = Date.now() - start

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop', `${name.replace(/\s+/g, '_')}.png`), fullPage: true })

      RESULTS.navigation.push({ page: name, route, loadTime, status: 'ok' })
      errors.forEach(e => RESULTS.console.push({ page: name, ...e }))
      requests.forEach(r => RESULTS.network.push({ page: name, ...r }))

      expect(page.url()).toContain(route)
    })
  })

  test.afterAll(() => {
    writeReport('1. Résultats Navigation', RESULTS.navigation.map(p =>
      `- **${p.page}** (${p.route}) : ${p.loadTime}ms`
    ).join('\n'))

    if (RESULTS.console.length) {
      writeReport('2. Erreurs Console', RESULTS.console.map(e =>
        `- **${e.page}** : \`${e.text}\``
      ).join('\n'))
    }

    if (RESULTS.network.length) {
      writeReport('3. Erreurs Réseau', RESULTS.network.map(r =>
        `- **${r.page}** : \`${r.url}\` → ${r.reason}`
      ).join('\n'))
    }
  })
})
