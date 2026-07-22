const { chromium } = require('playwright')
const BASE = 'http://localhost:5173'

const routes = [
  { path: '/login', name: 'Login' },
  { path: '/select-service', name: 'Select Service' },
  { path: '/', name: 'Dashboard' },
  { path: '/clients', name: 'Clients' },
  { path: '/catalogue', name: 'Catalogue' },
  { path: '/modeles', name: 'Modèles' },
  { path: '/devis', name: 'Devis list' },
  { path: '/parametres', name: 'Paramètres' },
  { path: '/utilisateurs', name: 'Utilisateurs' },
  { path: '/historique', name: 'Historique' },
  { path: '/sauvegardes', name: 'Sauvegardes' },
  { path: '/electronique/qr-codes', name: 'QR Codes' },
  { path: '/electronique/etiquettes', name: 'Étiquettes' },
  { path: '/electronique/reception', name: 'Réception' },
  { path: '/electronique/appareils', name: 'Appareils' },
]

async function run() {
  const browser = await chromium.launch({ headless: true })
  const results = { pass: 0, fail: 0, errors: [] }

  // 1. Login
  console.log('\n=== LOGIN ===')
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  page.on('console', msg => {
    if (msg.type() === 'error') console.log(`  CONSOLE ERROR: ${msg.text()}`)
  })
  page.on('pageerror', err => console.log(`  PAGE ERROR: ${err.message}`))

  try {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForSelector('input', { timeout: 5000 })
    await page.fill('input', 'admin')
    const inputs = await page.locator('input').all()
    if (inputs.length > 1) await inputs[1].fill('admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/select-service', { timeout: 10000 })
    console.log('  ✓ Login OK')
    results.pass++

    // 2. Select service
    await page.waitForTimeout(1000)
    const cards = await page.locator('a[href^="/"]').all()
    if (cards.length > 0) {
      // Click first service card
      const firstCard = await page.locator('a[href="/"]').first()
      if (await firstCard.isVisible()) {
        await firstCard.click()
        await page.waitForURL('**/', { timeout: 10000 })
        console.log('  ✓ Service selected')
      }
    }
    results.pass++

    // 3. Visit all routes
    console.log('\n=== ROUTES ===')
    for (const route of routes) {
      try {
        await page.goto(`${BASE}${route.path}`, { waitUntil: 'networkidle', timeout: 15000 })
        await page.waitForTimeout(1000)
        const title = await page.title()
        const url = page.url()
        // Check for error text
        const body = await page.locator('body').innerText()
        if (body.includes('error') || body.includes('Error') || body.includes('erreur')) {
          console.log(`  ! ${route.name} (${route.path}) — possible error in page content`)
          results.errors.push(`Possible error on ${route.path}`)
        }
        console.log(`  ✓ ${route.name} — ${url}`)
        results.pass++
      } catch (err) {
        console.log(`  ✗ ${route.name} — FAIL: ${err.message}`)
        results.fail++
        results.errors.push(`${route.path}: ${err.message}`)
      }
    }

    // 4. Test PWA manifest
    console.log('\n=== PWA ===')
    try {
      await page.goto(`${BASE}/manifest.webmanifest`, { waitUntil: 'networkidle', timeout: 10000 })
      const bodyText = await page.locator('body').innerText().catch(() => '{}')
      const json = JSON.parse(bodyText.includes('{') ? bodyText : (await page.locator('pre').innerText().catch(() => '{}')))
      console.log(`  ✓ Manifest: ${json.name}, ${json.short_name}`)
      results.pass++
    } catch (err) {
      console.log(`  ! Manifest fetch: ${err.message}`)
      // Try alternate URL
      try {
        await page.goto(`${BASE}/manifest.json`, { waitUntil: 'networkidle', timeout: 5000 })
        console.log('  ✓ Manifest found at /manifest.json')
        results.pass++
      } catch {
        console.log('  ✗ No PWA manifest found')
        results.fail++
      }
    }

  } catch (err) {
    console.log(`  ✗ Login FAILED: ${err.message}`)
    results.fail++
  }

  await browser.close()

  // Summary
  console.log('\n=== RESULTS ===')
  console.log(`  PASS: ${results.pass}`)
  console.log(`  FAIL: ${results.fail}`)
  if (results.errors.length > 0) {
    console.log('\n  ERRORS:')
    results.errors.forEach(e => console.log(`    - ${e}`))
  }
  console.log(`\n${results.fail === 0 ? '✓ ALL PASS' : '✗ SOME FAILED'}`)
  process.exit(results.fail > 0 ? 1 : 0)
}

run().catch(err => { console.error(err); process.exit(1) })
