import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(dir, '..', 'site', 'preview');

const png = new PNG({ width: 160, height: 90 });
for (let y = 0; y < 90; y++) for (let x = 0; x < 160; x++) {
  const i = (y * 160 + x) << 2;
  png.data[i] = 200 - x; png.data[i+1] = 80 + y; png.data[i+2] = 150; png.data[i+3] = 255;
}
const buffer = PNG.sync.write(png);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto('http://127.0.0.1:8080/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
await page.getByText('PC 管理端').click();
await page.waitForTimeout(1000);
await page.getByRole('button', { name: /活动管理/ }).first().click();
await page.waitForTimeout(1000);
await page.getByRole('button', { name: /新建活动/ }).click();
await page.waitForTimeout(800);
await page.getByPlaceholder('例如:滨江 8K 夜跑').fill('测试活动');
await page.waitForTimeout(300);
const btn = page.getByRole('button', { name: '发布活动' });
const before = await btn.isDisabled();
await page.screenshot({ path: path.join(out, '08-act-cover-empty.png') });
await page.setInputFiles('input[type=file]', { name: 'c.png', mimeType: 'image/png', buffer });
await page.waitForTimeout(700);
const after = await btn.isDisabled();
await page.screenshot({ path: path.join(out, '09-act-cover-filled.png') });
console.log('disabled before upload:', before);
console.log('disabled after upload :', after);
console.log('ERRORS', errors.length, errors.join('|'));
await browser.close();
