import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(dir, '..', 'site', 'preview');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto('http://127.0.0.1:8080/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

// Click 云栖谷 in ended strip
const title = page.getByText('云栖谷溪行 · 看日出系列 ①').first();
await title.scrollIntoViewIfNeeded();
await title.click();
await page.waitForTimeout(1000);
await page.screenshot({ path: path.join(out, '40-a8-ended-collapsed.png') });

const momentCount = await page.getByText(/精彩瞬间/).count();
const momentCards = await page.locator('[class="richtext"]').count();
console.log('moment section:', momentCount);
console.log('ERRORS', errors.length, errors.join('|'));
await browser.close();
