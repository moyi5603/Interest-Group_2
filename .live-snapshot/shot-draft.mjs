import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
const dir = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(dir, '..', 'site', 'preview');
const mk = (r,g,b) => { const p = new PNG({ width: 120, height: 70 });
  for (let y=0;y<70;y++) for (let x=0;x<120;x++){ const i=(y*120+x)<<2; p.data[i]=r;p.data[i+1]=g;p.data[i+2]=b;p.data[i+3]=255; } return PNG.sync.write(p); };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto('http://127.0.0.1:8080/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
await page.getByText('PC 管理端').click();
await page.waitForTimeout(900);
await page.getByRole('button', { name: /活动管理/ }).first().click();
await page.waitForTimeout(900);

// open + fill
await page.getByRole('button', { name: /新建活动/ }).click();
await page.waitForTimeout(600);
await page.getByPlaceholder('例如:滨江 8K 夜跑').fill('草稿活动·部门读书会');
await page.setInputFiles('input[type=file]', { name: 'c.png', mimeType: 'image/png', buffer: mk(90,150,210) });
const editor = page.locator('.richtext[contenteditable]');
await editor.click();
await page.keyboard.type('本期共读《被讨厌的勇气》，欢迎报名。');
await page.waitForTimeout(400);
const indicator = await page.getByText('内容已自动暂存').count();
await page.screenshot({ path: path.join(out, '11-draft-typing.png') });

// close WITHOUT publishing (backdrop click) by pressing the X close button
await page.getByRole('button', { name: '取消' }).click();
await page.waitForTimeout(500);

// reopen -> expect restore banner
await page.getByRole('button', { name: /新建活动/ }).click();
await page.waitForTimeout(600);
const bannerVisible = await page.getByText('发现未发布的活动草稿').count();
await page.screenshot({ path: path.join(out, '12-draft-restore-prompt.png') });

// click 恢复
await page.getByRole('button', { name: '恢复' }).click();
await page.waitForTimeout(500);
const titleVal = await page.getByPlaceholder('例如:滨江 8K 夜跑').inputValue();
const descHtml = await editor.innerHTML();
await page.screenshot({ path: path.join(out, '13-draft-restored.png') });

console.log('auto-save indicator shown while typing:', indicator > 0);
console.log('restore banner shown on reopen      :', bannerVisible > 0);
console.log('restored title :', JSON.stringify(titleVal));
console.log('restored desc  :', descHtml.replace(/data:image[^"]*/g,'data:image…').slice(0,120));
console.log('ERRORS', errors.length, errors.join('|'));
await browser.close();
