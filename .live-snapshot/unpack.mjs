import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'site');
const assetsDir = path.join(outDir, 'assets');
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(assetsDir, { recursive: true });

const html = fs.readFileSync(path.join(root, '.live-snapshot', 'index.html'), 'utf8');
function section(type) {
  const re = new RegExp(`<script type="__bundler/${type}">([\\s\\S]*?)</script>`);
  const m = html.match(re);
  return m ? m[1].trim() : null;
}
const manifest = JSON.parse(section('manifest'));
let template = JSON.parse(section('template'));

const extMap = {
  'text/javascript': 'js',
  'application/javascript': 'js',
  'text/jsx': 'jsx',
  'text/babel': 'jsx',
  'font/woff2': 'woff2',
  'font/woff': 'woff',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/svg+xml': 'svg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

let written = 0;
for (const [uuid, entry] of Object.entries(manifest)) {
  let bytes = Buffer.from(entry.data, 'base64');
  if (entry.compressed) bytes = zlib.gunzipSync(bytes);
  const ext = extMap[entry.mime] || 'bin';
  const fname = `${uuid}.${ext}`;
  fs.writeFileSync(path.join(assetsDir, fname), bytes);
  // replace every reference to the uuid in the template with the local path
  template = template.split(uuid).join(`assets/${fname}`);
  written++;
}

// Strip SRI integrity + crossorigin (bytes are now local & identical; SRI would
// force CORS fetch semantics we don't need for same-origin assets).
template = template.replace(/\s+integrity="[^"]*"/gi, '').replace(/\s+crossorigin="[^"]*"/gi, '');

fs.writeFileSync(path.join(outDir, 'index.html'), template, 'utf8');

// sanity: any leftover bare uuids in template?
const leftover = template.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi) || [];
console.log('assets written:', written);
console.log('index.html bytes:', fs.statSync(path.join(outDir,'index.html')).size);
console.log('leftover uuid refs:', leftover.length, leftover.slice(0,5));
