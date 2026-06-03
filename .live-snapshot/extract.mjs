import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';

const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');

function section(type) {
  const re = new RegExp(`<script type="__bundler/${type}">([\\s\\S]*?)</script>`);
  const m = html.match(re);
  return m ? m[1].trim() : null;
}

const manifestRaw = section('manifest');
const extRaw = section('ext_resources');
const templateRaw = section('template');

console.log('manifest length:', manifestRaw?.length);
console.log('ext length:', extRaw?.length);
console.log('template length:', templateRaw?.length);

const manifest = JSON.parse(manifestRaw);
const ext = extRaw ? JSON.parse(extRaw) : [];
let template = JSON.parse(templateRaw);

console.log('asset count:', Object.keys(manifest).length);
console.log('ext resources count:', ext.length);
console.log('--- template head (first 1500 chars) ---');
console.log(template.slice(0, 1500));
console.log('--- ext sample ---');
console.log(JSON.stringify(ext.slice(0, 5), null, 2));
console.log('--- manifest sample meta ---');
for (const [uuid, e] of Object.entries(manifest).slice(0, 5)) {
  console.log(uuid, '| mime:', e.mime, '| compressed:', e.compressed, '| b64len:', e.data.length);
}
