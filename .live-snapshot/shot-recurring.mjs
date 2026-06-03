import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(dir, '..', 'site', 'preview');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto('http://127.0.0.1:8080/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
await page.getByText('PC 管理端').click();
await page.waitForTimeout(900);

await page.getByRole('button', { name: /活动管理/ }).first().click();
await page.waitForTimeout(900);
await page.screenshot({ path: path.join(out, '20-recurring-list.png') });

// click the recurring activity row
await page.getByText('周一晚共读 · 固定围读局').click();
await page.waitForTimeout(900);
await page.screenshot({ path: path.join(out, '21-recurring-detail.png') });

const hasEvery = await page.getByText('每周一').count();
console.log('row 每周一 visible:', hasEvery > 0);
console.log('ERRORS', errors.length, errors.join('|'));
await browser.close();
