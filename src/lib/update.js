// التحديث التلقائي: كل ما التطبيق يتفتح أو يرجع من الخلفية بنقارن رقم النسخة بآخر APK منشور على GitHub
import { Capacitor } from '@capacitor/core';

export const VERSION = __APP_VERSION__;
const NATIVE = Capacitor.isNativePlatform();
const REPO = 'starrnightt2030-oss/rihlat-siraj';
const SITE = 'https://starrnightt2030-oss.github.io/rihlat-siraj/';

export const cmp = (a, b) => {
  const x = String(a).split('.').map(Number), y = String(b).split('.').map(Number);
  for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0);
  return 0;
};

export async function checkForUpdate() {
  const res = await fetch((NATIVE ? SITE : './') + 'version.json?t=' + Date.now(), { cache: 'no-store' });
  if (!res.ok) throw new Error('version');
  const site = await res.json();
  let latest = site.version, notes = site.notes || [];
  if (NATIVE) {
    // على الموبايل بنعتمد على آخر APK اتنشر فعلًا، عشان منطلبش تحديث ملفه لسه بيتبني
    const r = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { cache: 'no-store', headers: { Accept: 'application/vnd.github+json' } });
    if (!r.ok) throw new Error('release');
    const j = await r.json();
    if (!(j.assets || []).some((a) => a.name === 'rihlat-siraj.apk')) throw new Error('no apk');
    const apk = String(j.tag_name || '').replace(/^v/, '');
    if (apk !== latest) notes = [];
    latest = apk;
  }
  return { current: VERSION, latest, notes, hasUpdate: cmp(latest, VERSION) > 0 };
}

export async function applyUpdate(v) {
  if (NATIVE) {
    const { Browser } = await import('@capacitor/browser');
    await Browser.open({ url: `https://github.com/${REPO}/releases/download/v${v}/rihlat-siraj.apk` });
    return;
  }
  location.reload();
}
