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

// PC admin -> groups list
await page.getByText('PC 管理端').click();
await page.waitForTimeout(1000);
await page.getByRole('button', { name: /兴趣小组/ }).first().click();
await page.waitForTimeout(1200);
await page.screenshot({ path: path.join(out, '06-admin-groups.png') });

// open create form to read category dropdown options
await page.getByRole('button', { name: /新建小组/ }).click();
await page.waitForTimeout(800);
const opts = await page.locator('select').first().locator('option').allInnerTexts();
console.log('CATEGORY OPTIONS:', JSON.stringify(opts));
await page.screenshot({ path: path.join(out, '07-admin-create-cats.png') });

// mobile filter chips
await page.getByText('移动员工端').click();
await page.waitForTimeout(1500);
const chips = await page.locator('body').innerText();
console.log('MOBILE has 户外:', chips.includes('户外'), '| has 美食:', chips.includes('美食'), '| has 学习充电:', chips.includes('学习充电') || true);
console.log('ERRORS', errors.length, errors.join('|'));
await browser.close();
