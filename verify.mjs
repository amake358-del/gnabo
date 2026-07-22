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

// Check sidebar
const aside = await page.locator('aside').first();
const styles = await aside.evaluate(el => {
  const s = getComputedStyle(el);
  return {
    position: s.position,
    width: s.width,
    height: s.height,
    bgColor: s.backgroundColor,
    left: s.left,
    top: s.top,
  };
});
console.log('Sidebar:', JSON.stringify(styles));

// Check main content offset
const main = await page.locator('main').first();
const mainRect = await main.boundingBox();
console.log('Main rect:', JSON.stringify(mainRect));

// Check sidebar links have correct bg
const activeLink = await page.locator('aside a[class*="bg-white"]');
const activeCount = await activeLink.count();
console.log(`Active links with bg-white: ${activeCount}`);

if (activeCount > 0) {
  const linkStyles = await activeLink.first().evaluate(el => getComputedStyle(el).backgroundColor);
  console.log('Active link bg:', linkStyles);
}

// Take screenshot
await page.screenshot({ path: '/tmp/dashboard-v3.png', fullPage: true });
console.log('Screenshot saved');

await browser.close();
