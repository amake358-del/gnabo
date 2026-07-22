import { type Page } from '@playwright/test'

export async function authenticate(page: Page) {
  // 1) UI login -> Supabase session (React auth state)
  await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {})
  await page.waitForTimeout(2000)

  if (!page.url().includes('/login')) return

  const emailInput = page.locator('input[type="email"]')
  if (!(await emailInput.isVisible({ timeout: 5000 }).catch(() => false))) return

  await emailInput.fill('pdg@gnabo.com')
  await page.locator('input[type="password"]').fill('admin123')
  await page.locator('button[type="submit"]').click()
  await page.waitForTimeout(3000)

  if (page.url().includes('/login')) {
    await page.locator('input[type="email"]').fill('admin@gnabo.com')
    await page.locator('input[type="password"]').fill('admin123')
    await page.locator('button[type="submit"]').click()
    await page.waitForTimeout(3000)
  }

  // 2) Express API login via Vite proxy -> session cookie matches page origin
  try {
    await page.request.post('/api/v1/auth/login', {
      data: { email: 'pdg@gnabo.com', mot_de_passe: 'admin123' },
    })
  } catch {
    // fallback
  }
}

export async function clientNav(page: Page, route: string) {
  await page.evaluate((r) => {
    window.history.pushState({}, '', r)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }, route)
  await page.waitForTimeout(1500)
}

export async function authAndNav(page: Page, route: string) {
  await authenticate(page)
  await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {})
}
