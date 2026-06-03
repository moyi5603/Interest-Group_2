import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(dir, '..', 'site', 'preview');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 2 });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto('http://127.0.0.1:8080/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

// ---------- C端 (mobile) ----------
// default landing is mobile employee end; open the recurring activity from 活动 list
// Go through home -> find 周一晚共读 activity. Simpler: navigate via group? Use search of text.
// The mobile app shows home feed; click an activity card that is recurring.
// Try clicking the 滨江 8K 夜跑 recurring card text if present.
await page.waitForTimeout(500);
// Screenshot mobile home first
await page.screenshot({ path: path.join(out, '22-mobile-home.png') });

// Click first occurrence of a recurring activity title on screen
const recurTitle = page.getByText('滨江 8K 夜跑 · 江风配速团').first();
if (await recurTitle.count()) {
  await recurTitle.click();
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(out, '23-mobile-recurring-detail.png') });
  // open the signup sheet
  const btn = page.getByRole('button', { name: /立即报名|已报名 .* 场/ }).last();
  if (await btn.count()) {
    await btn.click();
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(out, '24-mobile-session-sheet.png') });
  }
}

const hasRecent = await page.getByText('最近场次').count();
console.log('mobile 最近场次 visible:', hasRecent > 0);
console.log('mobile detail errors so far:', errors.length);

// ---------- PC 管理端 ----------
await page.goto('http://127.0.0.1:8080/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.getByText('PC 管理端').click();
await page.waitForTimeout(900);
await page.getByRole('button', { name: /活动管理/ }).first().click();
await page.waitForTimeout(900);
await page.getByText('周一晚共读 · 固定围读局').click();
await page.waitForTimeout(900);
await page.screenshot({ path: path.join(out, '25-pc-recurring-detail.png'), fullPage: true });
const hasPanel = await page.getByText('共 4 场').count();
console.log('PC 报名情况 by-session:', hasPanel > 0);

console.log('ERRORS', errors.length, errors.join('|'));
await browser.close();
