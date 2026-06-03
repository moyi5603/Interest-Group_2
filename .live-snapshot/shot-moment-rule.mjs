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

// a8 joined + ended -> should have post button
await page.getByText('云栖谷溪行 · 看日出系列 ①').first().click();
await page.waitForTimeout(800);
const a8Post = await page.getByRole('button', { name: '发布精彩瞬间' }).count();
await page.screenshot({ path: path.join(out, '41-a8-can-post.png') });
await page.getByRole('button').filter({ has: page.locator('[name="back"], svg') }).first().click().catch(() => page.goBack());
await page.waitForTimeout(500);

// a9 not joined + ended -> no post button
await page.getByText('五黑上分之夜 · 第 12 期').first().click();
await page.waitForTimeout(800);
const a9Post = await page.getByRole('button', { name: '发布精彩瞬间' }).count();
await page.screenshot({ path: path.join(out, '42-a9-no-post.png') });

console.log('a8 post btn:', a8Post);
console.log('a9 post btn:', a9Post);
console.log('ERRORS', errors.length, errors.join('|'));
await browser.close();
