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
await page.waitForTimeout(900);

// global activities list
await page.getByRole('button', { name: /活动管理/ }).first().click();
await page.waitForTimeout(900);
// click first activity row
await page.locator('table tbody tr').first().click();
await page.waitForTimeout(900);
const hasDesc = await page.getByText('活动描述', { exact: true }).count();
const hasSignup = await page.getByText('报名情况').count();
const hasComments = await page.getByText('评论 & 互动').count();
await page.screenshot({ path: path.join(out, '18-act-detail.png') });

// open edit
await page.getByRole('button', { name: '编辑' }).click();
await page.waitForTimeout(700);
const editTitle = await page.getByText('编辑活动').count();
const saveBtn = await page.getByRole('button', { name: '保存修改' }).count();
await page.screenshot({ path: path.join(out, '19-act-edit.png') });
// modify title then save
const titleInput = page.getByPlaceholder('例如:滨江 8K 夜跑');
await titleInput.fill('（已编辑）测试活动标题');
await page.getByRole('button', { name: '保存修改' }).click();
await page.waitForTimeout(800);
const updatedShown = await page.getByText('（已编辑）测试活动标题').count();

console.log('detail desc section :', hasDesc > 0);
console.log('detail signup panel :', hasSignup > 0);
console.log('detail comments     :', hasComments > 0);
console.log('edit modal title    :', editTitle > 0);
console.log('save button shown   :', saveBtn > 0);
console.log('title updated on page:', updatedShown > 0);
console.log('ERRORS', errors.length, errors.join('|'));
await browser.close();
