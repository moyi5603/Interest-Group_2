import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const dir = path.dirname(fileURLToPath(import.meta.url));
const local = path.join(dir, '..', 'site', 'preview');
const live = path.join(dir, 'live-preview');

function diff(name) {
  const a = PNG.sync.read(fs.readFileSync(path.join(live, name)));
  const b = PNG.sync.read(fs.readFileSync(path.join(local, name)));
  const { width, height } = a;
  if (b.width !== width || b.height !== height) {
    console.log(name + ': SIZE MISMATCH live', width+'x'+height, 'local', b.width+'x'+b.height);
    return;
  }
  const out = new PNG({ width, height });
  const n = pixelmatch(a.data, b.data, out.data, width, height, { threshold: 0.1 });
  const total = width * height;
  fs.writeFileSync(path.join(dir, 'diff-' + name), PNG.sync.write(out));
  console.log(name + ': ' + n + ' / ' + total + ' px differ (' + (100*n/total).toFixed(4) + '%)');
}
diff('01-mobile.png');
diff('02-pc.png');
