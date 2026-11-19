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

// على الموبايل: بنحمّل الـ APK جوّه التطبيق ونبيّن التقدّم، وبعدين نفتح شاشة التثبيت على طول
// لو أي حاجة فشلت بنفتح رابط التحميل في المتصفح كخطة بديلة
export async function downloadUpdate(v, onProgress) {
  const { Filesystem, Directory } = await import('@capacitor/filesystem');
  const name = `rihlat-siraj-${v}.apk`;
  const h = await Filesystem.addListener('progress', (p) => { if (p.contentLength > 0) onProgress?.(Math.min(1, p.bytes / p.contentLength)); });
  try {
    const r = await Filesystem.downloadFile({ url: apkUrl(v), path: name, directory: Directory.Cache, progress: true });
    onProgress?.(1);
    return r.path || (await Filesystem.getUri({ path: name, directory: Directory.Cache })).uri;
  } finally { h.remove(); }
}
export async function installUpdate(path) {
  const { FileOpener } = await import('@capacitor-community/file-opener');
  await FileOpener.open({ filePath: path, contentType: 'application/vnd.android.package-archive', openWithDefault: true });
}
export async function openInBrowser(v) {
  const { Browser } = await import('@capacitor/browser');
  await Browser.open({ url: apkUrl(v) });
}
