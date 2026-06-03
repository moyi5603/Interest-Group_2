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

// App starts on mobile home. Scroll down to find 往期精彩回顾 strip
await page.evaluate(() => window.scrollTo(0, 3000));
await page.waitForTimeout(600);
await page.screenshot({ path: path.join(out, '37-mobile-ended-strip.png') });

// Try clicking "滨江 8K 夜跑 · 第 23 期" cover from the ended strip
// The strip renders covers via <img> or <Photo>, find and click the ended act
const endedTitle = page.getByText('滨江 8K 夜跑 · 第 23 期').first();
if (await endedTitle.count()) {
  await endedTitle.click();
} else {
  // fallback: click first card in ended strip area
  await page.evaluate(() => {
    const el = document.querySelector('[data-ended-strip] div');
    if (el) el.click();
  });
}
await page.waitForTimeout(1000);
await page.screenshot({ path: path.join(out, '38-ended-detail-collapsed.png') });

const expandBtn = page.getByText('查看活动详情').first();
const hasExpand = await expandBtn.count();
if (hasExpand) {
  await expandBtn.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(out, '39-ended-detail-expanded.png') });
}

console.log('expand btn found:', hasExpand > 0);
console.log('ERRORS', errors.length, errors.join('|'));
await browser.close();
