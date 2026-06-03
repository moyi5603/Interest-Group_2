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
await page.waitForTimeout(1500);

await page.getByText('全部', { exact: true }).first().click();
await page.waitForTimeout(600);
await page.screenshot({ path: path.join(out, '43-all-acts-search.png') });
const actSearch = await page.getByPlaceholder('搜索活动、小组、地点').count();

await page.getByPlaceholder('搜索活动、小组、地点').fill('夜跑');
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(out, '44-all-acts-filtered.png') });
const actCards = await page.locator('.rise').count();

await page.getByRole('button').first().click();
await page.waitForTimeout(400);
await page.getByText('全部', { exact: true }).nth(1).click();
await page.waitForTimeout(600);
await page.screenshot({ path: path.join(out, '45-all-groups-search.png') });
const groupSearch = await page.getByPlaceholder('搜索小组名称、分类、标签').count();

await page.getByPlaceholder('搜索小组名称、分类、标签').fill('徒步');
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(out, '46-all-groups-filtered.png') });
const groupCards = await page.locator('.rise').count();

console.log('act search:', actSearch, 'filtered cards:', actCards);
console.log('group search:', groupSearch, 'filtered cards:', groupCards);
console.log('ERRORS', errors.length, errors.join('|'));
await browser.close();
