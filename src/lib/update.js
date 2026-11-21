// التحديث التلقائي: أول ما التطبيق يتفتح أو يرجع من الخلفية بنقرا version.json من الموقع (طلب واحد سريع)
// الموقع مش بيتنشر غير بعد ما ملف الـ APK يجهز، فلو الرقم أكبر يبقى التحديث موجود فعلًا
import { Capacitor } from '@capacitor/core';

export const VERSION = __APP_VERSION__;
export const NATIVE_HASH = __NATIVE_HASH__;
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
  return { latest: j.version, apk: j.apk || j.version, notes: j.notes || [], history: j.history || null, size: j.size || 0, native: j.native || null, manifest: j.manifest || null };
}
// احتياطي لو الموقع مش متاح: آخر APK منشور على GitHub
async function fromGithub() {
  const r = await timed(fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } }), 7000);
  if (!r.ok) throw new Error('release');
  const j = await r.json(); const a = (j.assets || []).find((x) => x.name === 'rihlat-siraj.apk');
  if (!a) throw new Error('no apk');
  return { latest: String(j.tag_name || '').replace(/^v/, ''), notes: [], size: a.size || 0 };
}

// الملاحظات: بس النسخ اللي أحدث من اللي عند الطفل (مش كل الملاحظات القديمة)
function newNotes(r) {
  if (!r.history) return r.notes || [];
  return r.history.filter((x) => cmp(x.v, VERSION) > 0 && cmp(x.v, r.latest) <= 0).flatMap((x) => x.notes || []);
}
// قايمة الملفات اللي عند الطفل دلوقتي: بعد تحديث سريع بنحفظها، وإلا اللي جوه التطبيق نفسه
const MKEY = 'siraj-files';
async function localManifest() {
  try { const m = JSON.parse(localStorage.getItem(MKEY) || 'null'); if (m && m.version === VERSION) return { files: m.files.map(([f, h]) => ({ f, h })) }; } catch (e) { /* */ }
  return fetch('./update-manifest.json').then((x) => x.json()).catch(() => ({ files: [] }));
}
// لو جزء الأندرويد زي ما هو: «تحديث سريع» بيحمّل الملفات اللي اتغيّرت بس. لو اتغيّر: APK كامل.
async function liveInfo(r) {
  if (!NATIVE || !r.native || r.native !== NATIVE_HASH || !r.manifest) return null;
  try {
    const [remote, local] = await Promise.all([
      timed(fetch(SITE + r.manifest + '?v=' + r.latest, { cache: 'no-store' }).then((x) => x.json()), 12000),
      localManifest(),
    ]);
    if (!remote?.files?.length) return null;
    const have = new Map(local.files.map((x) => [x.f, x.h]));
    const need = remote.files.filter((x) => have.get(x.f) !== x.h);
    return { files: remote.files, need: need.length, bytes: need.reduce((a, x) => a + x.s, 0) };
  } catch (e) { return null; }
}
export async function checkForUpdate() {
  let r; try { r = await fromSite(); } catch (e) { if (!NATIVE) throw e; r = await fromGithub(); }
  const hasUpdate = cmp(r.latest, VERSION) > 0;
  const live = hasUpdate ? await liveInfo(r) : null;
  // APK جديد بس لو التحديث محتاج تغيير في الأندرويد ونسخة الـ APK نفسها أحدث
  const needApk = hasUpdate && !live;
  return { current: VERSION, ...r, notes: newNotes(r), hasUpdate: hasUpdate && (live || cmp(r.apk || r.latest, VERSION) > 0), mode: live ? 'live' : 'apk', live, size: live ? live.bytes : r.size, latest: needApk ? (r.apk || r.latest) : r.latest };
}

// التحديث السريع: الإضافة بتقارن كل ملف بالموجود جوه التطبيق وبتحمّل الناقص بس، وبعدين التطبيق يفتح بالنسخة الجديدة
let liveRun = null, liveBundle = null;
export function downloadLive(info, onProgress) {
  if (liveRun) return liveRun;
  liveRun = (async () => {
    const { CapacitorUpdater } = await import('@capgo/capacitor-updater');
    const h = await CapacitorUpdater.addListener('download', (e) => { if (e?.percent != null) onProgress?.(Math.min(1, e.percent / 100)); });
    try {
      const manifest = info.live.files.map((x) => ({ file_name: x.f, file_hash: x.h, download_url: SITE + x.f.split('/').map(encodeURIComponent).join('/') + '?v=' + info.latest }));
      liveBundle = await CapacitorUpdater.download({ url: SITE + info.manifest, version: info.latest, manifest });
      onProgress?.(1);
      return liveBundle;
    } finally { h.remove(); }
  })();
  liveRun.finally(() => { liveRun = null; });
  return liveRun;
}
// بيفتح النسخة الجديدة (التطبيق بيعيد تحميل نفسه في ثانية)
export async function applyLive(bundle = liveBundle, info) {
  const { CapacitorUpdater } = await import('@capgo/capacitor-updater');
  try { if (info?.live) localStorage.setItem(MKEY, JSON.stringify({ version: info.latest, files: info.live.files.map((x) => [x.f, x.h]) })); } catch (e) { /* مساحة التخزين مليانة: مش مشكلة */ }
  await CapacitorUpdater.set({ id: bundle.id });
}
// لازم التطبيق يقول «أنا اشتغلت تمام» بعد كل فتحة، وإلا الإضافة ترجع للنسخة اللي قبلها (حماية لو تحديث باظ)
export async function appReady() {
  if (!NATIVE) return;
  try { const { CapacitorUpdater } = await import('@capgo/capacitor-updater'); await CapacitorUpdater.notifyAppReady(); } catch (e) { /* */ }
}

// لو التحديث محتاج APK: بنحمّل الـ APK جوّه التطبيق (أداة التحميل الرسمية) ونبيّن التقدّم، وبعدين نفتح شاشة التثبيت
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
