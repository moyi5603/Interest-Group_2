import fs from 'node:fs';

const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');
function section(type) {
  const re = new RegExp(`<script type="__bundler/${type}">([\\s\\S]*?)</script>`);
  const m = html.match(re);
  return m ? m[1].trim() : null;
}
const manifest = JSON.parse(section('manifest'));
let template = JSON.parse(section('template'));

// mime breakdown
const byMime = {};
for (const e of Object.values(manifest)) byMime[e.mime] = (byMime[e.mime]||0)+1;
console.log('MIME breakdown:', JSON.stringify(byMime, null, 2));

// show all <script ...> tags in template (attributes only, trimmed)
const scriptTags = [...template.matchAll(/<script\b[^>]*>/gi)].map(m=>m[0]);
console.log('\n--- SCRIPT TAGS ('+scriptTags.length+') ---');
scriptTags.forEach(s=>console.log(s.slice(0,200)));

// show <link> tags
const linkTags = [...template.matchAll(/<link\b[^>]*>/gi)].map(m=>m[0]);
console.log('\n--- LINK TAGS ('+linkTags.length+') ---');
linkTags.forEach(s=>console.log(s.slice(0,200)));

console.log('\n--- TEMPLATE TAIL (last 2500 chars) ---');
console.log(template.slice(-2500));
