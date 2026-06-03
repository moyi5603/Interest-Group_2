import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(dir, '..', 'site', 'preview');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto('http://127.0.0.1:8080/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
await page.getByText('PC 管理端').click();
await page.waitForTimeout(900);

// open AI composer via sidebar 立即体验
await page.getByRole('button', { name: '立即体验' }).click();
await page.waitForTimeout(700);
// pick an example (dyehike) then generate
await page.getByText('每周三下班后组织一次滨江夜跑,8 公里,分配速组').click();
await page.waitForTimeout(300);
await page.getByRole('button', { name: /生成活动方案/ }).click();
await page.waitForTimeout(2200);
await page.screenshot({ path: path.join(out, '26-ai-result-editable.png'), fullPage: true });

const hasCover = await page.getByText('封面图').count();
const hasType = await page.getByText('活动类型').count();
const hasLoc = await page.getByText('地点', { exact: true }).count();
const hasCap = await page.getByText('人数上限').count();
const hasRepeat = await page.getByText('重复规则').count();
console.log('cover field   :', hasCover > 0);
console.log('type field    :', hasType > 0);
console.log('loc field     :', hasLoc > 0);
console.log('cap field     :', hasCap > 0);
console.log('recurring rule:', hasRepeat > 0);

// switch type to 系列 (series)
await page.getByRole('button', { name: /^系列$/ }).click();
await page.waitForTimeout(500);
const hasSessions = await page.getByText('场次安排').count();
console.log('series sessions after switch:', hasSessions > 0);
await page.screenshot({ path: path.join(out, '27-ai-result-series.png'), fullPage: true });

// switch back to 单次 and publish
await page.getByRole('button', { name: /^单次$/ }).click();
await page.waitForTimeout(400);
await page.getByRole('button', { name: /确认并发布活动/ }).click();
await page.waitForTimeout(900);
const published = await page.getByText('滨江 8K 夜跑 · 江风配速团').count();
console.log('published into list:', published > 0);

console.log('ERRORS', errors.length, errors.join('|'));
await browser.close();
