const { test } = require('@playwright/test')
const path = require('path')
const fs = require('fs')

const REPORT_PATH = path.resolve(__dirname, '../../AUDIT_REPORT.md')
const PERF_DATA = []

function report(section, content) {
  fs.appendFileSync(REPORT_PATH, '## ' + section + '\n\n' + content + '\n\n')
}

const PAGES = [
  { route: '/', name: 'Dashboard' },
  { route: '/clients', name: 'Clients' },
  { route: '/devis', name: 'DevisListe' },
  { route: '/devis/nouveau', name: 'DevisNouveau' },
  { route: '/catalogue', name: 'Catalogue' },
  { route: '/parametres', name: 'Parametres' },
  { route: '/utilisateurs', name: 'Utilisateurs' },
]

test.describe('Audit Performance', () => {
  for (const { route, name } of PAGES) {
    test('Perf: ' + name, async ({ page }) => {
      const resources = []
      page.on('response', res => {
        resources.push({ url: res.url(), status: res.status() })
      })

      const start = Date.now()
      await page.goto(route, { waitUntil: 'networkidle', timeout: 30000 })
      const totalLoad = Date.now() - start

      const pm = await page.evaluate(() => ({
        dcl: performance.getEntriesByType('navigation')[0]?.domContentLoadedEventEnd || 0,
        interactive: performance.getEntriesByType('navigation')[0]?.domInteractive || 0,
        nodes: document.querySelectorAll('*').length,
      }))

      PERF_DATA.push({
        page: name, route, totalLoad,
        dcl: pm.dcl, interactive: pm.interactive,
        nodes: pm.nodes, requests: resources.length,
        failed: resources.filter(r => r.status >= 400).length,
      })
    })
  }

  test.afterAll(() => {
    if (PERF_DATA.length) {
      const rows = PERF_DATA.map(d =>
        '| ' + d.page + ' | ' + d.totalLoad + 'ms | ' + d.dcl.toFixed(0) + 'ms | ' + d.requests + ' | ' + d.nodes + ' | ' + d.failed + ' |'
      ).join('\n')
      report('6. Performance', '| Page | Chargement | DOM Content | Requetes | Noeuds DOM | Erreurs |\n|------|-----------|-------------|----------|------------|---------|\n' + rows)
    }
  })
})
