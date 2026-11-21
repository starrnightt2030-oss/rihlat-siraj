// بعد البناء: قايمة بكل ملفات التطبيق وبصمة كل ملف (SHA-256)، عشان التطبيق يحمّل الملفات اللي اتغيّرت بس.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = 'dist', SKIP = new Set(['version.json', 'update-manifest.json']);
const files = [];
(function walk(d) { for (const n of readdirSync(d)) { const p = join(d, n); if (statSync(p).isDirectory()) walk(p); else files.push(p); } })(DIST);
const list = files.map((p) => relative(DIST, p).split('\\').join('/')).filter((f) => !SKIP.has(f) && !f.endsWith('.map')).sort()
  .map((f) => { const b = readFileSync(join(DIST, f)); return { f, h: createHash('sha256').update(b).digest('hex'), s: b.length }; });
const v = JSON.parse(readFileSync('release.json', 'utf8')).version;
writeFileSync(join(DIST, 'update-manifest.json'), JSON.stringify({ version: v, files: list }));
console.log(`update-manifest: ${list.length} files, ${(list.reduce((a, x) => a + x.s, 0) / 1048576).toFixed(1)} MB`);
