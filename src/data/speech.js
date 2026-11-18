// كل جملة بيقولها سراج في التطبيق، من مكان واحد: التطبيق والسكريبت اللي بيولّد الصوت الاتنين بيقروا من هنا
// الآيات نفسها مش بتتقري بصوت آلي: بنشغّل تلاوة القارئ (مشاري العفاسي) للآيات الكاملة بس
import { UNITS } from './units.js';
import { STORIES } from './stories.js';
import { SPARKS, STICKER_NAMES } from './content.js';
import { GIFTS } from './gifts.js';
export const giftLine = (g) => 'هدية النهارده: ' + g.t + '. ' + g.sub;

export const stepLine = (s) => {
  if (s.k === 'say') return s.t;
  if (s.k === 'ayah') return s.mean ? 'ربنا قال في القرآن كلام جميل، يعني: ' + s.mean : 'ربنا قال في القرآن كلام جميل.';
  if (s.k === 'hadith') return 'النبي صلى الله عليه وسلم علّمنا نقول: ' + s.t + (s.mean ? '. يعني: ' + s.mean : '');
  if (s.k === 'tips') return 'أعمل إيه في حياتي؟ ' + s.items.join('. ');
  if (s.k === 'grid') return s.title + ': ' + s.items.map(([t, sub]) => t + '، ' + sub).join('. ');
  if (s.k === 'surah') return 'يلا نسمع سورة ' + s.name + ' ونقرا ورا الشيخ.';
  return '';
};
export const sceneLine = (sc) => sc.t;

export const FIXED = [
  'بسم الله… يلا ننوّرها!', 'شاطر!', 'شاطر! إجابة صح', 'قربت! فكّر تاني', 'برافو عليك!',
  'اسمك إيه يا بطل؟', 'انت ولد ولا بنت؟', 'عندك كام سنة؟', 'مين يحب يكون رفيقك في الرحلة؟',
  'يلا! الكارت اللي عليه الدور مستنيك', 'ما شاء الله! خلّصت الرحلة كلها', 'خلّص اللي قبلها الأول',
  'اختار حكاية وأنا أحكيهالك', 'اتعلمنا إيه؟', 'هدية النهارده!', 'رتّب الخطوات بالترتيب الصح', 'اختار الكلمة الناقصة',
  'وصّل كل ذكر بوقته', 'برافو! الترتيب صح', 'ذاكرتك نوّرت! برافو', 'الصورة رجعت كاملة! شاطر', 'الكنز اتفتح!',
];

export function allLines() {
  const L = new Set(FIXED);
  for (const u of UNITS) {
    L.add('برافو! نوّرت ' + u.title); L.add(u.sub);
    for (const c of u.cards) {
      (c.steps || []).forEach((s) => L.add(stepLine(s)));
      if (c.quiz) L.add(c.quiz.q);
    }
  }
  for (const s of Object.values(STORIES)) {
    L.add('برافو! نوّرت ' + s.title);
    s.scenes.forEach((sc) => { L.add(sceneLine(sc)); (sc.choose || []).forEach((ch) => L.add(ch.res)); });
    L.add(s.moral); s.quiz.forEach((q) => L.add(q.q));
  }
  Object.values(STICKER_NAMES).forEach((n) => L.add(n));
  SPARKS.forEach((sp) => { L.add('شرارة ' + sp.name); L.add('شرارة ' + sp.name + ' مستنياك في الحكايات'); });
  GIFTS.forEach((g) => L.add(giftLine(g)));
  L.add('لسه مستخبي… كمّل رحلتك'); L.add('كل درس وحكاية بيزوّدوا نور الجرة');
  return [...L].filter(Boolean);
}
