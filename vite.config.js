import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { nativeHash } from './scripts/native-hash.mjs';

const release = JSON.parse(readFileSync('./release.json', 'utf8'));
const NATIVE_HASH = nativeHash('.');
// ملاحظات كل نسخة لوحدها: التطبيق بيعرض بس ملاحظات النسخ اللي أحدث من اللي عنده
const history = (() => { const h = [...(release.history || [])]; if (!h.some((x) => x.v === release.version)) h.unshift({ v: release.version, notes: release.notes || [] }); return h.slice(0, 30); })();
// version.json بيتنشر مع الموقع، والتطبيق بيقارن رقمه بيه عشان يعرف إن فيه تحديث
const versionFile = () => ({
  name: 'version-json',
  writeBundle(opts) { writeFileSync(join(opts.dir || 'dist', 'version.json'), JSON.stringify({ version: release.version, apk: process.env.APK_VERSION || release.version, size: Number(process.env.APK_SIZE || 0), native: NATIVE_HASH, manifest: 'update-manifest.json', notes: release.notes || [], history, date: new Date().toISOString() }, null, 2)); },
});
export default defineConfig({
  base: './',
  plugins: [react(), versionFile()],
  define: { __APP_VERSION__: JSON.stringify(release.version), __NATIVE_HASH__: JSON.stringify(NATIVE_HASH) },
  build: { target: 'es2019', assetsInlineLimit: 0 },
});
