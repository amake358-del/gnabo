const { chromium } = require('@playwright/test')
const path = require('path')
const fs = require('fs')

const BASE_URL = 'http://localhost:5173'
const SCREENSHOT_DIR = path.resolve(__dirname, '../../screenshots')
const REPORT_PATH = path.resolve(__dirname, '../../AUDIT_REPORT.md')

const ALL_ISSUES = []
const ALL_PERF = []

function addIssue(page, type, priority, desc, cause, solution) {
  ALL_ISSUES.push({ page, type, priority, desc, cause, solution })
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function run() {
  console.log('=== AUDIT COMPLET GESTION DEVIS ===\n')
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
  const page = await context.newPage()

  const consoleErrors = []
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push({ text: msg.text(), loc: msg.location() })
  })

  const networkErrors = []
  page.on('requestfailed', req => {
    networkErrors.push({ url: req.url(), reason: req.failure()?.errorText || 'unknown' })
  })

  // ========== 1. PARCOURS DE TOUTES LES PAGES ==========
  console.log('1. Parcours des pages...')
  const pages = [
    { route: '/', name: 'Dashboard' },
    { route: '/clients', name: 'Clients' },
    { route: '/devis', name: 'Devis - Liste' },
    { route: '/devis/nouveau', name: 'Devis - Nouveau' },
    { route: '/catalogue', name: 'Catalogue' },
    { route: '/modeles', name: 'Modeles' },
    { route: '/parametres', name: 'Parametres' },
    { route: '/utilisateurs', name: 'Utilisateurs' },
    { route: '/historique', name: 'Historique' },
    { route: '/sauvegardes', name: 'Sauvegardes' },
  ]

  for (const { route, name } of pages) {
    const start = Date.now()
    try {
      await page.goto(BASE_URL + route, { waitUntil: 'networkidle', timeout: 30000 })
      const loadTime = Date.now() - start

      const overflow = await page.evaluate(() => {
        const d = document.documentElement; return d.scrollWidth > d.clientWidth ? d.scrollWidth - d.clientWidth : 0
      })

      ALL_PERF.push({ page: name, loadTime })
      console.log('  ' + name + ': ' + loadTime + 'ms' + (overflow ? ' (OVERFLOW: ' + overflow + 'px)' : ''))

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop', name.replace(/[^a-zA-Z0-9]/g, '_') + '.png'), fullPage: true })

      if (overflow > 5) {
        addIssue(name, 'Debordement horizontal', 'HAUTE', 'La page deborde de ' + overflow + 'px horizontalement', 'Element trop large ou manque de conteneur responsive', 'Verifier les largeurs fixes et ajouter overflow-x: hidden si necessaire')
      }

      // Check small buttons
      const smallBtns = await page.$$eval('button, a[href], [role="button"]', els =>
        els.filter(el => { const r = el.getBoundingClientRect(); return r.width < 32 || r.height < 32 })
          .map(el => el.textContent.trim().slice(0, 30) || el.tagName)
      )
      if (smallBtns.length > 3) {
        addIssue(name, 'Boutons trop petits', 'MOYENNE', smallBtns.length + ' elements interactifs < 32px', 'Design non adapte aux cibles tactiles', 'Augmenter taille minimum a 44x44px pour l\'accessibilite')
      }

    } catch (e) {
      console.log('  ERREUR ' + name + ': ' + e.message)
      addIssue(name, 'Page non accessible', 'CRITIQUE', 'Impossible de charger la page: ' + e.message, 'Probleme de rendu ou d\'API', 'Verifier les dependances et le routage')
    }
    await sleep(500)
  }

  // ========== 2. TEST RESPONSIVE ==========
  console.log('\n2. Tests responsives...')
  const viewports = [
    { w: 1366, h: 768, label: 'desktop_small' },
    { w: 1024, h: 768, label: 'tablet' },
    { w: 412, h: 915, label: 'mobile_large' },
    { w: 390, h: 844, label: 'mobile_small' },
  ]

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.w, height: vp.h })
    for (const { route, name } of pages.slice(0, 5)) {
      await page.goto(BASE_URL + route, { waitUntil: 'networkidle', timeout: 30000 })
      const overflow = await page.evaluate(() => {
        const d = document.documentElement; return d.scrollWidth > d.clientWidth ? d.scrollWidth - d.clientWidth : 0
      })
      if (overflow > 5) {
        addIssue(name + ' (' + vp.label + ')', 'Debordement responsive', 'HAUTE', 'Page deborde de ' + overflow + 'px en vue ' + vp.label + ' (' + vp.w + 'x' + vp.h + ')', 'Layout non adaptatif', 'Utiliser des unites relatives et des media queries')
      }
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, vp.label, name.replace(/[^a-zA-Z0-9]/g, '_') + '.png'), fullPage: true })
    }
  }

  // ========== 3. TEST MODULE DEVIS ==========
  console.log('\n3. Test module devis...')
  await page.setViewportSize({ width: 1920, height: 1080 })

  // Check devis list for existing data
  await page.goto(BASE_URL + '/devis', { waitUntil: 'networkidle' })
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'devis', 'devis_list.png'), fullPage: true })
  const hasDevis = await page.$$eval('table tbody tr', rows => rows.length > 0)

  // Test devis creation form
  await page.goto(BASE_URL + '/devis/nouveau', { waitUntil: 'networkidle' })
  await sleep(1000)

  // Check form elements
  const formInputs = await page.$$eval('input, select, textarea', els => els.length)
  console.log('  Champs dans le formulaire: ' + formInputs)
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'devis', 'devis_form_empty.png'), fullPage: true })

  // Try to fill form
  const clientSelect = await page.$('select, [data-client-select]')
  if (clientSelect) {
    const options = await page.$$eval('select option', opts => opts.map(o => ({ value: o.value, text: o.text })))
    console.log('  Options client: ' + options.length)
    if (options.length > 1) {
      await page.selectOption('select', options[1].value)
    }
  }

  // Check for "Ajouter ligne" button
  const addLineBtn = await page.$('text=Ajouter, text=ligne, text=article, button:has(svg)')
  if (addLineBtn) {
    console.log('  Bouton ajouter ligne trouve')
  }

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'devis', 'devis_form_filled.png'), fullPage: true })

  // ========== 4. CONSOLE & NETWORK ERRORS ==========
  console.log('\n4. Analyse des erreurs...')
  if (consoleErrors.length) {
    console.log('  Erreurs console: ' + consoleErrors.length)
    consoleErrors.slice(0, 10).forEach(e => console.log('    - ' + e.text.slice(0, 120)))
  } else {
    console.log('  Aucune erreur console detectee')
  }

  if (networkErrors.length) {
    console.log('  Erreurs reseau: ' + networkErrors.length)
    networkErrors.slice(0, 10).forEach(e => console.log('    - ' + e.url + ' -> ' + e.reason))
  } else {
    console.log('  Aucune erreur reseau detectee')
  }

  // ========== 5. BUILD REPORT ==========
  console.log('\n5. Generation du rapport...')
  let report = '# AUDIT APPLICATION GESTION DEVIS\n\n'
  report += '**Date:** ' + new Date().toLocaleString('fr-FR') + '\n\n'
  report += '---\n\n'

  // Summary
  const critIssues = ALL_ISSUES.filter(i => i.priority === 'CRITIQUE').length
  const highIssues = ALL_ISSUES.filter(i => i.priority === 'HAUTE').length
  const medIssues = ALL_ISSUES.filter(i => i.priority === 'MOYENNE').length
  const lowIssues = ALL_ISSUES.filter(i => i.priority === 'BASSE').length
  const avgLoad = ALL_PERF.length ? (ALL_PERF.reduce((s, p) => s + p.loadTime, 0) / ALL_PERF.length) : 0

  // UX Score (based on console errors, overflow, etc)
  const uxScore = Math.max(0, 100 - (consoleErrors.length * 5) - (ALL_ISSUES.filter(i => i.type.includes('Debordement')).length * 10))
  const perfScore = Math.max(0, avgLoad < 1000 ? 90 : avgLoad < 2000 ? 75 : avgLoad < 3000 ? 60 : 40)
  const designScore = Math.max(0, 100 - (medIssues * 5) - (highIssues * 10))
  const funcScore = Math.max(0, 100 - (critIssues * 20) - (highIssues * 10))

  report += '## Resume General\n\n'
  report += '| Metrique | Score |\n|----------|-------|\n'
  report += '| Score UX | ' + uxScore + '/100 |\n'
  report += '| Score Performance | ' + perfScore + '/100 |\n'
  report += '| Score Design | ' + designScore + '/100 |\n'
  report += '| Score Fonctionnel | ' + funcScore + '/100 |\n\n'

  report += '**Pages auditees:** ' + pages.length + '\n\n'
  report += '**Problemes trouves:** ' + ALL_ISSUES.length + ' (' + critIssues + ' critique, ' + highIssues + ' haute, ' + medIssues + ' moyenne, ' + lowIssues + ' basse)\n\n'
  report += '**Erreurs console:** ' + consoleErrors.length + '\n\n'
  report += '**Erreurs reseau:** ' + networkErrors.length + '\n\n'
  report += '**Temps chargement moyen:** ' + avgLoad.toFixed(0) + 'ms\n\n'
  report += '---\n\n'

  // Performance data
  report += '## Temps de Chargement par Page\n\n'
  report += '| Page | Temps (ms) |\n|------|-----------|\n'
  for (const p of ALL_PERF) {
    report += '| ' + p.page + ' | ' + p.loadTime + ' |\n'
  }
  report += '\n---\n\n'

  // Issues by priority
  if (ALL_ISSUES.length) {
    const priorityOrder = { CRITIQUE: 0, HAUTE: 1, MOYENNE: 2, BASSE: 3 }
    ALL_ISSUES.sort((a, b) => (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99))

    report += '## Problemes Detectes\n\n'
    for (const issue of ALL_ISSUES) {
      const badge = { CRITIQUE: '🔴 CRITIQUE', HAUTE: '🟠 HAUTE', MOYENNE: '🟡 MOYENNE', BASSE: '🟢 BASSE' }
      report += '### [' + badge[issue.priority] + '] ' + issue.page + ' - ' + issue.type + '\n\n'
      report += '- **Description:** ' + issue.desc + '\n'
      report += '- **Cause probable:** ' + issue.cause + '\n'
      report += '- **Solution recommandee:** ' + issue.solution + '\n\n'
    }
    report += '---\n\n'
  }

  // Console errors
  if (consoleErrors.length) {
    report += '## Erreurs Console\n\n```\n'
    consoleErrors.slice(0, 20).forEach(e => { report += e.text + '\n' })
    report += '```\n\n---\n\n'
  }

  // Network errors
  if (networkErrors.length) {
    report += '## Erreurs Reseau\n\n| URL | Raison |\n|-----|--------|\n'
    networkErrors.slice(0, 20).forEach(e => {
      report += '| ' + e.url.slice(0, 80) + ' | ' + e.reason + ' |\n'
    })
    report += '\n---\n\n'
  }

  // Screenshots
  report += '## Captures d\'ecran\n\n'
  report += 'Les captures d\'ecran sont disponibles dans le dossier `screenshots/`:\n\n'
  report += '- `desktop/` - Pages en 1920x1080\n'
  report += '- `tablet/` - Pages en 1024x768\n'
  report += '- `mobile_large/` - Pages en 412x915\n'
  report += '- `mobile_small/` - Pages en 390x844\n'
  report += '- `devis/` - Module devis\n\n'
  report += '---\n\n'

  // Correction plan
  report += '## Plan de Correction Priorise\n\n'
  report += '### Priorite CRITIQUE (a corriger immediatement)\n\n'
  for (const issue of ALL_ISSUES.filter(i => i.priority === 'CRITIQUE')) {
    report += '1. **' + issue.page + '** - ' + issue.type + ': ' + issue.solution + '\n'
  }
  report += '\n### Priorite HAUTE (a corriger rapidement)\n\n'
  for (const issue of ALL_ISSUES.filter(i => i.priority === 'HAUTE')) {
    report += '1. **' + issue.page + '** - ' + issue.type + ': ' + issue.solution + '\n'
  }
  report += '\n### Priorite MOYENNE (a planifier)\n\n'
  for (const issue of ALL_ISSUES.filter(i => i.priority === 'MOYENNE')) {
    report += '1. **' + issue.page + '** - ' + issue.type + ': ' + issue.solution + '\n'
  }
  report += '\n---\n\n'
  report += '*Rapport genere automatiquement par Playwright*\n'

  fs.writeFileSync(REPORT_PATH, report, 'utf-8')
  console.log('\nRapport genere: ' + REPORT_PATH)
  console.log('Captures: ' + SCREENSHOT_DIR)

  await browser.close()

  // Print summary
  console.log('\n=== RESUME ===')
  console.log('Problemes: ' + ALL_ISSUES.length + ' (' + critIssues + 'C/' + highIssues + 'H/' + medIssues + 'M/' + lowIssues + 'B)')
  console.log('Erreurs console: ' + consoleErrors.length)
  console.log('Erreurs reseau: ' + networkErrors.length)
  console.log('Temps moyen: ' + avgLoad.toFixed(0) + 'ms')
  console.log('Scores: UX=' + uxScore + ' Perf=' + perfScore + ' Design=' + designScore + ' Fonctionnel=' + funcScore)
}

run().catch(e => { console.error('AUDIT FAILED:', e); process.exit(1) })
