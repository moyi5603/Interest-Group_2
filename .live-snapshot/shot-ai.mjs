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
await page.waitForTimeout(1000);

// open AI composer from workbench button
await page.getByRole('button', { name: /AI 策划活动/ }).click();
await page.waitForTimeout(700);
// type a hike prompt -> series
await page.locator('textarea').first().fill('周末搞一次登山看日出，需要拼车，分两期');
await page.getByRole('button', { name: /生成活动方案/ }).click();
await page.waitForTimeout(2600);

const coverImg = await page.locator('img[alt="AI 海报"]').count();
const sessionHdr = await page.getByText(/场次安排 · 共/).count();
const richEditor = await page.locator('.richtext[contenteditable]').count();
await page.screenshot({ path: path.join(out, '14-ai-result.png') });

// publish
await page.getByRole('button', { name: /确认并发布活动/ }).click();
await page.waitForTimeout(800);

// go to activity management to confirm episodes created
await page.getByRole('button', { name: /活动管理/ }).first().click();
await page.waitForTimeout(900);
const bodyText = await page.locator('body').innerText();
await page.screenshot({ path: path.join(out, '15-ai-published-list.png') });

console.log('AI cover img shown   :', coverImg > 0);
console.log('session schedule shown:', sessionHdr > 0);
console.log('rich editor in result:', richEditor > 0);
console.log('list has 第 1 期      :', bodyText.includes('第 1 期'));
console.log('list has 第 2 期      :', bodyText.includes('第 2 期'));
console.log('ERRORS', errors.length, errors.join('|'));
await browser.close();
