import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(dir, '..', 'site', 'preview');
import fs from 'node:fs';
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));

await page.goto('http://127.0.0.1:8080/', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(3500);

// mobile view (default)
await page.screenshot({ path: path.join(out, '01-mobile.png'), fullPage: false });

// switch to PC view: click the "PC 管理端" segment
try {
  await page.getByText('PC 管理端').click({ timeout: 5000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(out, '02-pc.png'), fullPage: false });
} catch (e) {
  errors.push('SWITCH-PC failed: ' + e.message);
}

const bodyText = (await page.locator('body').innerText()).slice(0, 400);
console.log('--- BODY TEXT SAMPLE ---');
console.log(bodyText);
console.log('--- ERRORS (' + errors.length + ') ---');
console.log(errors.join('\n'));
await browser.close();
