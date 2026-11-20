// مقارنة اللي الطفل قاله بكلمات الآية: من غير تشكيل، ومع تساهل في الحروف المتشابهة والرسم العثماني
// عشان صوت الطفل والمحرّك مش هيطلعوا الكلام بالظبط زي المصحف
const DIAC = /[ؐ-ًؚ-ٟۖ-ۭـ]/g;
export const norm = (w) => w
  .replace(/ٰ/g, 'ا') // الألف الخنجرية: ٱلرَّحۡمَٰن ← الرحمان
  .replace(DIAC, '')
  .replace(/[ٱأإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').replace(/ء/g, '')
  .replace(/[^ء-ي]/g, '');

const lev = (a, b) => {
  const m = a.length, n = b.length; if (!m || !n) return m || n;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
};
const sim = (a, b) => 1 - lev(a, b) / Math.max(a.length, b.length);
// «ال» والواو والفاء في الأول ممكن المحرّك يلزقهم أو يفصلهم
const strip = (w) => w.replace(/^(و|ف)?(ال)?/, '');
const same = (a, b) => { const t = a.length <= 3 ? 0.66 : 0.6; return sim(a, b) >= t || (strip(a).length > 2 && sim(strip(a), strip(b)) >= 0.75); };

// كلمات الآية للعرض: علامات الوقف اللي لوحدها بتتلزق في الكلمة اللي قبلها
export const ayahWords = (ayah) => ayah.split(/\s+/).filter(Boolean).reduce((a, w) => { if (!norm(w) && a.length) a[a.length - 1] += ' ' + w; else a.push(w); return a; }, []);

// بترجع لكل كلمة في الآية: اتقالت ولا لأ، بالترتيب، مع شوية تسامح لو الطفل نط كلمة أو المحرّك زوّد كلمة
export function align(words, heard) {
  const T = words.map(norm), H = heard.split(/\s+/).map(norm).filter(Boolean);
  const hit = T.map(() => false);
  let j = 0;
  for (let i = 0; i < T.length; i++) {
    if (!T[i]) { hit[i] = true; continue; }
    for (let k = j; k < Math.min(H.length, j + 4); k++) {
      if (same(T[i], H[k]) || (k + 1 < H.length && same(T[i], H[k] + H[k + 1]))) { hit[i] = true; j = k + 1; break; }
    }
  }
  return hit;
}
export const score = (hit) => (hit.length ? hit.filter(Boolean).length / hit.length : 0);
