import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(dir, '..', 'site', 'preview');
const mk = (r,g,b) => { const p = new PNG({ width: 120, height: 70 });
  for (let y=0;y<70;y++) for (let x=0;x<120;x++){ const i=(y*120+x)<<2; p.data[i]=r; p.data[i+1]=g; p.data[i+2]=b; p.data[i+3]=255; } return PNG.sync.write(p); };

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
await page.waitForTimeout(700);

// fill cover (required) + title
await page.setInputFiles('input[type=file]', { name: 'cover.png', mimeType: 'image/png', buffer: mk(80,140,220) });
await page.getByPlaceholder('例如:滨江 8K 夜跑').fill('测试富文本活动');
await page.waitForTimeout(300);

// type into rich text editor
const editor = page.locator('.richtext[contenteditable]');
await editor.click();
await page.keyboard.type('集合时间 19:00，请提前到场。');
await page.keyboard.press('Enter');
// apply bold then type
await page.getByTitle('加粗').click();
await page.keyboard.type('注意：自带运动装备');
await page.getByTitle('加粗').click();
await page.keyboard.press('Enter');
await page.waitForTimeout(300);
// insert an inline image via the 图片 button -> file input (the 2nd file input in modal)
const fileInputs = page.locator('input[type=file]');
await fileInputs.nth(1).setInputFiles({ name: 'inline.png', mimeType: 'image/png', buffer: mk(240,120,60) });
await page.waitForTimeout(600);

const disabled = await page.getByRole('button', { name: '发布活动' }).isDisabled();
const html = await editor.innerHTML();
await page.screenshot({ path: path.join(out, '10-richtext.png') });
console.log('publish disabled:', disabled);
console.log('editor html snippet:', html.replace(/data:image[^"]*/g, 'data:image…').slice(0, 260));
console.log('ERRORS', errors.length, errors.join('|'));
await browser.close();
