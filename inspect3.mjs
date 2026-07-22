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

const aside = await page.locator('aside').first();
const styles = await aside.evaluate(el => {
  const s = getComputedStyle(el);
  return {
    position: s.position,
    width: s.width,
    height: s.height,
    background: s.background,
    backgroundColor: s.backgroundColor,
    display: s.display,
    flex: s.flex,
    top: s.top,
    left: s.left,
    transform: s.transform,
    zIndex: s.zIndex,
  };
});
console.log(JSON.stringify(styles, null, 2));

// Check what's overriding bg-primary-500
const bgRule = await aside.evaluate(el => {
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (rule.selectorText?.includes('bg-primary-500')) {
          return { selector: rule.selectorText, css: rule.cssText };
        }
      }
    } catch {}
  }
  return null;
});
console.log('bg-primary-500 rules:');
console.log(JSON.stringify(bgRule, null, 2));

await browser.close();
