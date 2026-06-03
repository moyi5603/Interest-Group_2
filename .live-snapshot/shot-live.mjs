import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(dir, 'live-preview');
fs.mkdirSync(out, { recursive: true });

const URL = process.env.TARGET || 'https://interestinggroup.netlify.app/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));

await page.goto(URL, { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForTimeout(5000);
await page.screenshot({ path: path.join(out, '01-mobile.png') });
try {
  await page.getByText('PC 管理端').click({ timeout: 8000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(out, '02-pc.png') });
} catch (e) { errors.push('SWITCH-PC failed: ' + e.message); }

console.log('--- ERRORS (' + errors.length + ') ---');
console.log(errors.join('\n'));
await browser.close();
