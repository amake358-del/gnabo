import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

await page.fill('input[type="email"]', 'pdg@gnabo.com');
await page.fill('input[type="password"]', 'admin123');

await page.click('button[type="submit"]');
await page.waitForURL('**/', { timeout: 15000 });
await page.waitForTimeout(3000);

await page.screenshot({ path: '/tmp/dashboard-v2.png', fullPage: true });
console.log('Screenshot saved');

// Analyze the new layout
const cards = await page.locator('[class*="rounded-xl"]').all();
console.log(`Rounded card elements: ${cards.length}`);

const statValues = await page.locator('.text-2xl').all();
console.log(`Stat values: ${statValues.length}`);
for (const v of statValues) {
  console.log(`  ${await v.textContent()}`);
}

// Check sidebar
const sidebar = await page.locator('aside').first();
const sbVisible = await sidebar.isVisible();
console.log(`Sidebar visible: ${sbVisible}`);

// Check service card colors
const accentBars = await page.locator('.absolute.left-0.top-0.bottom-0.w-1').all();
console.log(`Service accent bars: ${accentBars.length}`);

await browser.close();
