import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

await page.fill('input[type="email"]', 'pdg@gnabo.com');
await page.fill('input[type="password"]', 'admin123');
await page.click('button:has-text("Se connecter")');

await page.waitForURL('**/', { timeout: 15000 });
await page.waitForTimeout(3000);

await page.screenshot({ path: '/tmp/dashboard.png', fullPage: true });
console.log('Screenshot saved to /tmp/dashboard.png');

await browser.close();
