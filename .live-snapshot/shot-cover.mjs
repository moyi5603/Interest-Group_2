import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(dir, '..', 'site', 'preview');

// build a small test cover image (160x90, diagonal gradient)
const png = new PNG({ width: 160, height: 90 });
for (let y = 0; y < 90; y++) for (let x = 0; x < 160; x++) {
  const i = (y * 160 + x) << 2;
  png.data[i] = 60 + (x); png.data[i+1] = 120; png.data[i+2] = 200 - y; png.data[i+3] = 255;
}
const buffer = PNG.sync.write(png);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto('http://127.0.0.1:8080/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
await page.getByText('PC 管理端').click();
await page.waitForTimeout(1200);
await page.getByRole('button', { name: /兴趣小组/ }).first().click();
await page.waitForTimeout(1200);
await page.screenshot({ path: path.join(out, '04-groups-list.png') });
await page.getByRole('button', { name: /新建小组/ }).click();
await page.waitForTimeout(800);
// type a name so only cover gates the button
await page.getByPlaceholder('例如:城市夜跑团').fill('测试小组');
await page.waitForTimeout(300);
const btn = page.getByRole('button', { name: /创建小组/ });
const disabledBefore = await btn.isDisabled();
await page.screenshot({ path: path.join(out, '04-cover-empty.png') });

// upload cover
await page.setInputFiles('input[type=file]', { name: 'cover.png', mimeType: 'image/png', buffer });
await page.waitForTimeout(700);
const disabledAfter = await btn.isDisabled();
await page.screenshot({ path: path.join(out, '05-cover-filled.png') });

console.log('disabled before upload:', disabledBefore);
console.log('disabled after upload :', disabledAfter);
console.log('ERRORS', errors.length, errors.join('|'));
await browser.close();
