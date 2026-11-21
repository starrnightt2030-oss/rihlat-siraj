// بصمة الجزء «الأندرويد» من التطبيق: لو اتغيّرت (إضافة جديدة أو تعديل في مجلد android) لازم APK كامل،
// ولو زي ما هي يبقى التحديث يتحمّل ملفات بس (الأكواد والصور والأصوات اللي اتغيّرت).
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SKIP = /(^|\/)(build|\.gradle|\.idea|\.cxx|assets|capacitor-cordova-android-plugins)(\/|$)|local\.properties$|capacitor\.config\.json$|cordova_plugins\.js$/;
function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const n of readdirSync(dir).sort()) {
    const p = join(dir, n); if (SKIP.test(p)) continue;
    statSync(p).isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}
export function nativeHash(root = '.') {
  const h = createHash('sha256');
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const deps = Object.entries({ ...pkg.dependencies }).filter(([k]) => /capacitor|capgo|cordova/.test(k)).sort();
  h.update(JSON.stringify(deps));
  const cfg = JSON.parse(readFileSync(join(root, 'capacitor.config.json'), 'utf8'));
  h.update(JSON.stringify({ appId: cfg.appId, android: cfg.android, plugins: cfg.plugins }));
  for (const f of walk(join(root, 'android'))) { h.update(f.replace(root, '')); h.update(readFileSync(f)); }
  return h.digest('hex').slice(0, 16);
}
