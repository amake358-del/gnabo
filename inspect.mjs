import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

// Count login page elements
const loginInputs = await page.locator('input').count();
const loginButtons = await page.locator('button').count();
console.log(`Login page: ${loginInputs} inputs, ${loginButtons} buttons`);

await page.fill('input[type="email"]', 'pdg@gnabo.com');
await page.fill('input[type="password"]', 'admin123');
await page.click('button:has-text("Se connecter")');

await page.waitForURL('**/', { timeout: 15000 });
await page.waitForTimeout(3000);

// Analyze dashboard structure
const mainEl = await page.locator('main, .main-content, .dashboard').first();
const mainHtml = await mainEl.innerHTML();
const mainTag = await mainEl.evaluate(el => el.tagName + '.' + (el.className || ''));
console.log(`\nMain container: ${mainTag}`);

// Get all major sections
const sections = await page.locator('main > *, .main-content > *, .dashboard > *').all();
console.log(`\nTop-level sections (${sections.length}):`);
for (const s of sections) {
  const tag = await s.evaluate(el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className ? '.' + el.className.split(' ').slice(0, 2).join('.') : ''));
  const text = await s.innerText();
  console.log(`  ${tag} → "${text.slice(0, 80)}"`);
}

// Count interactive elements on dashboard
const cards = await page.locator('.card, [class*="card"], .stat-card, [class*="stat"]').all();
console.log(`\nCard elements: ${cards.length}`);
for (const c of cards) {
  const text = await c.innerText();
  console.log(`  "${text.slice(0, 60)}"`);
}

// Check sidebar state
const sidebarLinks = await page.locator('nav a, .sidebar a, [class*="sidebar"] a').all();
console.log(`\nSidebar links: ${sidebarLinks.length}`);

// Check header
const header = await page.locator('header').first();
if (await header.count() > 0) {
  const headerText = await header.innerText();
  console.log(`\nHeader: "${headerText.slice(0, 100)}"`);
}

// Check colors used
const bgColor = await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor);
const textColor = await page.locator('body').evaluate(el => getComputedStyle(el).color);
console.log(`\nBody bg: ${bgColor}, text: ${textColor}`);

// Get the sidebar bg
const sidebar = await page.locator('aside, .sidebar').first();
if (await sidebar.count() > 0) {
  const sbBg = await sidebar.evaluate(el => getComputedStyle(el).backgroundColor);
  console.log(`Sidebar bg: ${sbBg}`);
}

// Primary card colors
const firstCard = await page.locator('[class*="card"], [class*="Card"]').first();
if (await firstCard.count() > 0) {
  const cardBg = await firstCard.evaluate(el => getComputedStyle(el).backgroundColor);
  const cardBorder = await firstCard.evaluate(el => getComputedStyle(el).borderColor);
  console.log(`First card bg: ${cardBg}, border: ${cardBorder}`);
}

await browser.close();
