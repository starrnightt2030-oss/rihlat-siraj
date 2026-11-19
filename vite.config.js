import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const release = JSON.parse(readFileSync('./release.json', 'utf8'));
// version.json بيتنشر مع الموقع، والتطبيق بيقارن رقمه بيه عشان يعرف إن فيه تحديث
const versionFile = () => ({
  name: 'version-json',
  writeBundle(opts) { writeFileSync(join(opts.dir || 'dist', 'version.json'), JSON.stringify({ version: release.version, apk: process.env.APK_VERSION || release.version, size: Number(process.env.APK_SIZE || 0), notes: release.notes || [], date: new Date().toISOString() }, null, 2)); },
});
export default defineConfig({
  base: './',
  plugins: [react(), versionFile()],
  define: { __APP_VERSION__: JSON.stringify(release.version) },
  build: { target: 'es2019', assetsInlineLimit: 0 },
});
