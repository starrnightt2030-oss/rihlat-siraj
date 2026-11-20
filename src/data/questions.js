// كل الأسئلة في مكان واحد (البنك القديم + الموسّع) من غير تكرار، مع أدوات الاختيار والمطابقة بالصوت
import { QB, CATS } from './quizbank.js';
import { QB2, CATS2 } from './quizbank2.js';

export const ALL_CATS = { ...CATS, ...CATS2 };
const seen = new Set();
export const ALLQ = [...QB, ...QB2].filter((q) => (seen.has(q.q) ? false : seen.add(q.q)));
const shuffle = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((x) => x[1]);

// المستويات: سهل ٥ أسئلة (من الأسهل)، متوسط ١٠، صعب ١٥ (أغلبها من الأصعب)
export const LEVELS = [
  { id: 1, t: 'سهل', n: 5, e: '🌱', c: '#2FB383' },
  { id: 2, t: 'متوسط', n: 10, e: '⭐', c: '#F5A623' },
  { id: 3, t: 'صعب', n: 15, e: '🏆', c: '#E5484D' },
];
export function pickQs(cat, level, n) {
  const pool = ALLQ.filter((q) => !cat || q.cat === cat);
  const want = (q) => (level === 1 ? q.l === 1 : level === 2 ? q.l <= 2 : q.l >= 2);
  const main = shuffle(pool.filter(want)), rest = shuffle(pool.filter((q) => !want(q)));
  return [...main, ...rest].slice(0, n).map((q) => ({ ...q, opts: shuffle(q.a.map((t, k) => ({ t, ok: k === 0 }))) }));
}

// ===== مطابقة الإجابة اللي الطفل قالها بالاختيارات =====
const norm = (s) => s.replace(/[ً-ْٰـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]).replace(/[^ء-ي٠-٩\s]/g, ' ').replace(/\s+/g, ' ').trim();
const NUMS = { '١': 'واحد', '٢': 'اتنين اثنين اثنان', '٣': 'تلاته ثلاثه ثلاث تلات', '٤': 'اربعه اربع', '٥': 'خمسه خمس', '٦': 'سته ست', '٧': 'سبعه سبع', '١٠': 'عشره عشر', '٢٥': 'خمسه وعشرين خمسه وعشرون', '٣٠': 'تلاتين ثلاثين ثلاثون', '٣٣': 'تلاته وتلاتين ثلاثه وثلاثين', '٤٠': 'اربعين اربعون', '٥٠': 'خمسين', '٦٣': 'تلاته وستين ثلاثه وستين', '٧٠': 'سبعين', '٩٩': 'تسعه وتسعين تسعه وتسعون', '١٠٠': 'ميه مئه مائه', '١١٤': 'ميه واربعتاشر مئه واربعه عشر ميه واربعه عشر' };
const lev = (a, b) => { const m = a.length, n = b.length; if (!m || !n) return m || n; let p = Array.from({ length: n + 1 }, (_, j) => j); for (let i = 1; i <= m; i++) { const c = [i]; for (let j = 1; j <= n; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); p = c; } return p[n]; };
const sim = (a, b) => 1 - lev(a, b) / Math.max(a.length, b.length);
const strip = (w) => w.replace(/^(و|ف|ب)?(ال)?/, '');
// نسبة كلمات الاختيار اللي اتقالت (مع تسامح في النطق)
function cover(opt, heard) {
  const H = heard.split(' ').filter(Boolean), O = opt.split(' ').filter((w) => w.length > 1);
  if (!O.length) return 0;
  return O.filter((w) => H.some((h) => sim(w, h) >= 0.7 || sim(strip(w), strip(h)) >= 0.75)).length / O.length;
}
// بترجع رقم الاختيار اللي الطفل قاله، أو -1 لو مش واضح
export function matchOption(opts, said) {
  const h = norm(said); if (!h) return -1;
  const sc = opts.map((o) => {
    const t = norm(o.t.replace(/ﷺ/g, ''));
    if (/^[٠-٩]+$/.test(t)) { const words = (NUMS[t] || '').split(' '); return h.split(' ').includes(t) || words.some((w) => w && h.includes(w)) ? 1 : 0; }
    return cover(t, h);
  });
  const best = Math.max(...sc), k = sc.indexOf(best), second = Math.max(...sc.filter((_, j) => j !== k));
  return best >= 0.6 && best - second >= 0.25 ? k : -1;
}

// جمل سراج في «اختبرني» (بتتولّد بصوته مع باقي الجمل)
export const EXAM_INTRO = 'اختبرني! اختار الفرع والمستوى، وأنا أسألك وانت تجاوب بصوتك.';
export const EXAM_AGAIN = 'مفهمتش… قول الإجابة تاني أو دوس عليها.';
export const EXAM_LINES = [EXAM_INTRO, EXAM_AGAIN];
