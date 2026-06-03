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

// 1) PC admin: AI publish (default -> game once, has cover), then check recent activities + signups thumbnails
await page.getByText('PC 管理端').click();
await page.waitForTimeout(900);
await page.getByRole('button', { name: /AI 策划活动/ }).click();
await page.waitForTimeout(600);
await page.locator('textarea').first().fill('午休来一局桌游');
await page.getByRole('button', { name: /生成活动方案/ }).click();
await page.waitForTimeout(2400);
await page.getByRole('button', { name: /确认并发布活动/ }).click();
await page.waitForTimeout(800);

// workbench recent activities
await page.getByRole('button', { name: /工作台/ }).first().click();
await page.waitForTimeout(900);
const svgCovers = await page.locator('img[src^="data:image/svg"]').count();
await page.screenshot({ path: path.join(out, '16-admin-cards.png') });

// 2) mobile featured/rec/list cards still render
await page.getByText('移动员工端').click();
await page.waitForTimeout(1500);
await page.screenshot({ path: path.join(out, '17-mobile-cards.png') });

console.log('admin svg cover thumbnails:', svgCovers);
console.log('ERRORS', errors.length, errors.join('|'));
await browser.close();
