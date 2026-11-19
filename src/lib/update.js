// التحديث التلقائي: أول ما التطبيق يتفتح أو يرجع من الخلفية بنقرا version.json من الموقع (طلب واحد سريع)
// الموقع مش بيتنشر غير بعد ما ملف الـ APK يجهز، فلو الرقم أكبر يبقى التحديث موجود فعلًا
import { Capacitor } from '@capacitor/core';

export const VERSION = __APP_VERSION__;
export const NATIVE = Capacitor.isNativePlatform();
const REPO = 'starrnightt2030-oss/rihlat-siraj';
const SITE = 'https://starrnightt2030-oss.github.io/rihlat-siraj/';
const apkUrl = (v) => `https://github.com/${REPO}/releases/download/v${v}/rihlat-siraj.apk`;

export const cmp = (a, b) => {
  const x = String(a).split('.').map(Number), y = String(b).split('.').map(Number);
  for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0);
  return 0;
};
const timed = (p, ms) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('timeout')), ms))]);

async function fromSite() {
  const res = await timed(fetch((NATIVE ? SITE : './') + 'version.json?t=' + Date.now(), { cache: 'no-store' }), 6000);
  if (!res.ok) throw new Error('version');
  const j = await res.json();
  return { latest: j.apk || j.version, notes: j.notes || [], size: j.size || 0 };
}
// احتياطي لو الموقع مش متاح: آخر APK منشور على GitHub
async function fromGithub() {
  const r = await timed(fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } }), 7000);
  if (!r.ok) throw new Error('release');
  const j = await r.json(); const a = (j.assets || []).find((x) => x.name === 'rihlat-siraj.apk');
  if (!a) throw new Error('no apk');
  return { latest: String(j.tag_name || '').replace(/^v/, ''), notes: [], size: a.size || 0 };
}

export async function checkForUpdate() {
  let r; try { r = await fromSite(); } catch (e) { if (!NATIVE) throw e; r = await fromGithub(); }
  return { current: VERSION, ...r, hasUpdate: cmp(r.latest, VERSION) > 0 };
}

// على الموبايل: بنحمّل الـ APK جوّه التطبيق (أداة التحميل الرسمية) ونبيّن التقدّم، وبعدين نفتح شاشة التثبيت
// قبل التثبيت بنتأكد إن الملف اتحمّل كامل (حجمه مطابق)، عشان «مشكلة في تحليل الحزمة» ما تحصلش أبدًا
let running = null;
export function downloadUpdate(v, expected = 0, onProgress) {
  if (running) return running; // ضغطتين على الزرار = تحميل واحد بس
  running = (async () => {
    const { Filesystem, Directory } = await import('@capacitor/filesystem');
    const { FileTransfer } = await import('@capacitor/file-transfer');
    const name = `rihlat-siraj-${v}.apk`;
    // نمسح أي ملف قديم أو ناقص من محاولة قبل كده
    for (const f of (await Filesystem.readdir({ path: '', directory: Directory.Cache }).catch(() => ({ files: [] }))).files || []) {
      const n = typeof f === 'string' ? f : f.name; if (/^rihlat-siraj.*\.apk$/.test(n)) await Filesystem.deleteFile({ path: n, directory: Directory.Cache }).catch(() => {});
    }
    const { uri } = await Filesystem.getUri({ path: name, directory: Directory.Cache });
    let best = 0;
    const h = await FileTransfer.addListener('progress', (p) => {
      if (p.type !== 'download') return;
      const total = expected || (p.lengthComputable ? p.contentLength : 0);
      if (total < 1e6) return; // ردود التحويل الصغيرة قبل الملف الحقيقي
      const f = Math.min(1, p.bytes / total);
      if (f > best) { best = f; onProgress?.(f, p.bytes, total); } // التقدّم بيزيد بس، عمره ما يرجع لورا
    });
    try {
      await FileTransfer.downloadFile({ url: apkUrl(v), path: uri, progress: true, connectTimeout: 20000, readTimeout: 60000 });
    } finally { h.remove(); }
    const st = await Filesystem.stat({ path: name, directory: Directory.Cache });
    if (st.size < 3e6 || (expected && Math.abs(st.size - expected) > 0)) { await Filesystem.deleteFile({ path: name, directory: Directory.Cache }).catch(() => {}); throw new Error('incomplete'); }
    onProgress?.(1, st.size, st.size);
    return st.uri || uri;
  })();
  running.finally(() => { running = null; });
  return running;
}
export async function installUpdate(path) {
  const { FileOpener } = await import('@capacitor-community/file-opener');
  await FileOpener.open({ filePath: path, contentType: 'application/vnd.android.package-archive', openWithDefault: true });
}
export async function openInBrowser(v) {
  const { Browser } = await import('@capacitor/browser');
  await Browser.open({ url: apkUrl(v) });
}
