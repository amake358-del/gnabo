import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

await page.fill('input[type="email"]', 'pdg@gnabo.com');
await page.fill('input[type="password"]', 'admin123');
await page.click('button[type="submit"]');

await page.waitForURL('**/', { timeout: 15000 });
await page.waitForTimeout(3000);

// Check sidebar background
const aside = await page.locator('aside').first();
const asideBg = await aside.evaluate(el => getComputedStyle(el).backgroundColor);
const asideHasBg = await aside.evaluate(el => el.classList.contains('bg-primary-500'));
console.log(`Aside visible: ${await aside.isVisible()}`);
console.log(`Aside bg: ${asideBg}`);
console.log(`Aside has bg-primary-500: ${asideHasBg}`);

// Check if it's off-screen
const asideRect = await aside.boundingBox();
console.log(`Aside rect: ${JSON.stringify(asideRect)}`);

// Check main content area
const main = await page.locator('main').first();
const mainRect = await main.boundingBox();
console.log(`Main rect: ${JSON.stringify(mainRect)}`);

// Check the entire page layout
const bodyBg = await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor);
console.log(`Body bg: ${bodyBg}`);

// Check stat card
const firstStatIcon = await page.locator('.w-10.h-10.rounded-xl').first();
if (await firstStatIcon.count() > 0) {
  const iconBg = await firstStatIcon.evaluate(el => getComputedStyle(el).backgroundColor);
  console.log(`First stat icon bg: ${iconBg}`);
}

await browser.close();
