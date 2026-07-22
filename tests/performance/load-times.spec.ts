import { test, expect } from '@playwright/test'
import { authenticate, clientNav, authAndNav } from '../helpers/auth'

interface PerfResult {
  page: string
  route: string
  totalLoad: number
  dcl: number
  interactive: number
  domNodes: number
  requests: number
  failedRequests: number
  jsErrors: number
}

const PERF_RESULTS: PerfResult[] = []

const PAGES = [
  { route: '/', name: 'Dashboard' },
  { route: '/clients', name: 'Clients' },
  { route: '/devis', name: 'DevisListe' },
  { route: '/catalogue', name: 'Catalogue' },
  { route: '/modeles', name: 'Modeles' },
  { route: '/parametres', name: 'Parametres' },
  { route: '/utilisateurs', name: 'Utilisateurs' },
  { route: '/historique', name: 'Historique' },
  { route: '/sauvegardes', name: 'Sauvegardes' },
]

test.describe('Performance - temps de chargement', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page)
  })

  for (const { route, name } of PAGES) {
    test(`Chargement: ${name}`, async ({ page }, testInfo) => {
      const resources: string[] = []
      const errors: string[] = []

      page.on('response', res => {
        resources.push(res.url())
      })
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text())
      })

      const start = Date.now()
      await page.goto(route, { waitUntil: 'networkidle', timeout: 45000 })
      const totalLoad = Date.now() - start

      const perfMetrics = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0] as any
        return {
          dcl: nav?.domContentLoadedEventEnd || 0,
          interactive: nav?.domInteractive || 0,
          domNodes: document.querySelectorAll('*').length,
        }
      })

      const failedRequests = resources.filter(r => {
        return r.startsWith('http') && !r.includes('localhost') && !r.includes('api')
      }).length

      PERF_RESULTS.push({
        page: name,
        route,
        totalLoad,
        dcl: perfMetrics.dcl,
        interactive: perfMetrics.interactive,
        domNodes: perfMetrics.domNodes,
        requests: resources.length,
        failedRequests,
        jsErrors: errors.length,
      })

      expect(totalLoad).toBeLessThan(15000)
      expect(errors.length).toBeLessThanOrEqual(3)
    })
  }

  test.afterAll(async () => {
    const avgLoad = PERF_RESULTS.reduce((s, r) => s + r.totalLoad, 0) / PERF_RESULTS.length
    const avgDCL = PERF_RESULTS.reduce((s, r) => s + r.dcl, 0) / PERF_RESULTS.length
    const maxLoad = Math.max(...PERF_RESULTS.map(r => r.totalLoad))
    const slowestPage = PERF_RESULTS.find(r => r.totalLoad === maxLoad)

    console.log(`
=== PERFORMANCE REPORT ===
Pages testées: ${PERF_RESULTS.length}
Chargement moyen: ${avgLoad.toFixed(0)}ms
DCL moyen: ${avgDCL.toFixed(0)}ms
Page la plus lente: ${slowestPage?.page} (${maxLoad}ms)
Noeuds DOM moyen: ${(PERF_RESULTS.reduce((s, r) => s + r.domNodes, 0) / PERF_RESULTS.length).toFixed(0)}
Requêtes moyennes: ${(PERF_RESULTS.reduce((s, r) => s + r.requests, 0) / PERF_RESULTS.length).toFixed(0)}
Erreurs JS totales: ${PERF_RESULTS.reduce((s, r) => s + r.jsErrors, 0)}
`)

    expect(avgLoad).toBeLessThan(8000)
    expect(maxLoad).toBeLessThan(15000)
  })
})

test.describe('Performance - métriques critiques', () => {
  test('First Contentful Paint < 3s', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const fcp = await page.evaluate(() => {
      return new Promise<number>(resolve => {
        new PerformanceObserver(list => {
          const entries = list.getEntries()
          if (entries.length > 0) resolve(entries[0].startTime)
          else resolve(0)
        }).observe({ type: 'paint', buffered: true })
        setTimeout(() => resolve(0), 5000)
      })
    })

    expect(fcp).toBeLessThan(3000)
  })

  test('DOMContentLoaded < 5s', async ({ page }) => {
    const start = Date.now()
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 })
    const dclTime = Date.now() - start

    expect(dclTime).toBeLessThan(5000)
  })
})
