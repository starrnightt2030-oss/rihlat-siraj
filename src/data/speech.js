// كل جملة بيقولها سراج في التطبيق، من مكان واحد: التطبيق والسكريبت اللي بيولّد الصوت الاتنين بيقروا من هنا
// الآيات نفسها مش بتتقري بصوت آلي: بنشغّل تلاوة القارئ (مشاري العفاسي) للآيات الكاملة بس
import { UNITS } from './units.js';
import { STORIES } from './stories.js';
import { SPARKS, STICKER_NAMES } from './content.js';
import { GIFTS } from './gifts.js';
import { ADHKAR, dhikrLine } from './adhkar.js';
import { SCRIPT } from '../screens/onboard-script.js';
export const WELCOME_LINES = ['السلام عليكم! أهلًا بيك في رحلة سراج… يلا نتعرّف!', 'أهلًا يا بطل! وحشتني… يلا نكمّل رحلتنا', 'أهلًا يا بطلة! وحشتيني… يلا نكمّل رحلتنا'];
import { QB, TF, RIDDLES } from './quizbank.js';
import { HADITH, hadithLine, hadithMean } from './hadith.js';
import { ASMAA, asmaLine, ASMAA_INTRO } from './asmaa.js';
import { BEDTIME, BED_INTRO, BED_MORAL, BED_END } from './bedtime.js';
import { RAMADAN_LINES } from './ramadan.js';
import { qaidaLines } from './qaida.js';
import { PROPHETS, SAHABA } from './people.js';
import { BADGES } from './badges.js';
export const giftLine = (g) => 'هدية النهارده: ' + g.t + '. ' + g.sub;

export const stepLine = (s) => {
  if (s.k === 'say') return s.t;
  if (s.k === 'ayah') return 'ربنا قال في القرآن كلام جميل.';
  if (s.k === 'hadith') return 'النبي صلى الله عليه وسلم علّمنا نقول: ' + s.t + (s.mean ? '. يعني: ' + s.mean : '');
  if (s.k === 'tips') return 'أعمل إيه في حياتي؟ ' + s.items.join('. ');
  if (s.k === 'grid') return s.title + ': ' + s.items.map(([t, sub]) => t + '، ' + sub).join('. ');
  if (s.k === 'pose' || s.k === 'wudu' || s.k === 'scene') return (s.name ? s.name + (s.count ? '، ' + s.count : '') + '. ' : '') + s.t;
  if (s.k === 'rakat') return 'عدد ركعات كل صلاة: الفجر ركعتين، الظهر أربعة، العصر أربعة، المغرب تلاتة، العشاء أربعة. المجموع سبعتاشر ركعة.';
  if (s.k === 'pick' || s.k === 'match' || s.k === 'order' || s.k === 'fill') return s.q;
  if (s.k === 'surah') return 'يلا نسمع سورة ' + s.name + ' ونقرا ورا الشيخ.';
  return '';
};
// شرح الآية بيتقال بعد ما الشيخ يقراها
export const stepPost = (s) => (s.k === 'ayah' && s.mean ? 'يعني: ' + s.mean : '');
// جمل الشاشات الرئيسية (بتتقال أول ما الطفل يفتح الشاشة)
export const HUB = {
  home: { boy: 'أهلًا يا بطل! اختار هتتعلّم إيه النهارده.', girl: 'أهلًا يا بطلة! اختاري هتتعلّمي إيه النهارده.' },
  games: 'اختار لعبة، ونلعب ونتعلّم سوا!',
  album: 'دي كنوزك! كل ما تتعلّم أكتر، كنوزك بتزيد.',
  island: 'يلا! الكارت اللي عليه الدور مستنيك',
  stories: 'اختار حكاية وأنا أحكيهالك',
  sec: {
    salah: 'صلاتي ووضوئي. هنتعلّم الوضوء والصلاة خطوة بخطوة بالصور.',
    quran: 'قرآني. سور قصيرة نسمعها من الشيخ ونقرا وراه.',
    aqida: 'عقيدتي. نتعرّف على ربنا وعلى أركان الإيمان.',
    islam: 'أركان الإسلام. خمس أعمدة بيتبني عليها ديننا.',
    akhlaq: 'أخلاقي وآدابي. إزاي أكون طيب ومؤدب مع الناس.',
  },
};
export const sceneLine = (sc) => sc.t;

export const FIXED = [
  'بسم الله… يلا ننوّرها!', 'شاطر!', 'شاطر! إجابة صح', 'قربت! فكّر تاني', 'برافو عليك!',
  'اسمك إيه يا بطل؟', 'انت ولد ولا بنت؟', 'عندك كام سنة؟', 'مين يحب يكون رفيقك في الرحلة؟',
  'يلا! الكارت اللي عليه الدور مستنيك', 'ما شاء الله! خلّصت الرحلة كلها', 'خلّص اللي قبلها الأول',
  'اختار حكاية وأنا أحكيهالك', 'اتعلمنا إيه؟', 'هدية النهارده!', 'رتّب الخطوات بالترتيب الصح', 'اختار الكلمة الناقصة',
  'وصّل كل ذكر بوقته', 'برافو! إجابة صح', 'برافو! وصّلت كله صح', 'برافو! حفظته صح', 'اختار الصورة الأول', 'برافو! الترتيب صح', 'ذاكرتك نوّرت! برافو', 'الصورة رجعت كاملة! شاطر', 'الكنز اتفتح!',
];

export function allLines() {
  const L = new Set(FIXED);
  for (const u of UNITS) {
    L.add('برافو! نوّرت ' + u.title); L.add(u.sub);
    for (const c of u.cards) {
      (c.steps || []).forEach((s) => { L.add(stepLine(s)); if (stepPost(s)) L.add(stepPost(s)); });
      (c.steps || []).forEach((s) => { if (s.ok) L.add(s.ok); });
      if (c.quiz) L.add(c.quiz.uth ? 'كمّل الآية دي!' : c.quiz.q);
    }
  }
  for (const s of Object.values(STORIES)) {
    L.add('برافو! نوّرت ' + s.title);
    s.scenes.forEach((sc) => { L.add(sceneLine(sc)); (sc.choose || []).forEach((ch) => L.add(ch.res)); });
    L.add(s.moral); s.quiz.forEach((q) => L.add(q.q));
  }
  [HUB.home.boy, HUB.home.girl, HUB.games, HUB.album, HUB.island, HUB.stories, ...Object.values(HUB.sec)].forEach((t) => L.add(t));
  ['رتّب الحروف وكوّن الكلمة!', 'دوّر على الكلمات المستخبية!', 'رتّب كلمات الآية!'].forEach((t) => L.add(t));
  QB.forEach((q) => L.add(q.q));
  BEDTIME.forEach((b) => { b.s.forEach((x) => L.add(x[1])); L.add(BED_MORAL(b)); }); [BED_INTRO, BED_END.boy, BED_END.girl].forEach((t) => L.add(t));
  Object.values(RAMADAN_LINES).forEach((t) => L.add(t));
  qaidaLines().forEach((t) => L.add(t));
  ASMAA.forEach((a) => L.add(asmaLine(a))); L.add(ASMAA_INTRO);
  HADITH.forEach((h) => { L.add(hadithLine(h)); L.add(hadithMean(h)); });
  L.add('دي أحاديث النبي صلى الله عليه وسلم. اختار حديث وأنا أقولهولك وأشرحهولك.');
  Object.values(STICKER_NAMES).forEach((n) => L.add(n));
  SPARKS.forEach((sp) => { L.add('شرارة ' + sp.name); L.add('شرارة ' + sp.name + ' مستنياك في الحكايات'); });
  GIFTS.forEach((g) => L.add(giftLine(g)));
  L.add('اختار أذكارك'); L.add('برافو! انت حافظ أذكارك');
  for (const sec of ADHKAR) {
    L.add('دلوقتي وقت ' + sec.title); L.add('ما شاء الله! خلّصت ' + sec.title);
    sec.items.forEach((d) => { L.add(dhikrLine(d)); if (sec.id === 'hisn') L.add(d.title + '… أقول إيه؟'); });
  }
  for (const m of SCRIPT) for (const pp of [{ age: '4-6', gender: 'boy' }, { age: '7-9', gender: 'girl' }, { age: '10-12' }]) { const v = typeof m.say === 'function' ? m.say(pp) : m.say || (typeof m.t === 'string' ? m.t : ''); if (v) L.add(v); }
  const pl = (p, kind) => (kind === 'anbiya' ? 'سيدنا ' + p.n.replace(' ﷺ', ' صلى الله عليه وسلم') + '. ' : p.n + '، ' + p.lq + '. ') + p.who + ' ' + p.story + ' الدرس: ' + p.lesson;
  const pq = (p, kind) => (kind === 'anbiya' ? 'مين النبي ده؟ ' : 'مين الصحابي ده؟ ') + p.who.split('،')[0].split('.')[0];
  PROPHETS.forEach((p) => { L.add(pl(p, 'anbiya')); L.add(pq(p, 'anbiya')); }); SAHABA.forEach((p) => { L.add(pl(p, 'sahaba')); L.add(pq(p, 'sahaba')); });
  L.add('ربنا ذكر في القرآن ٢٥ نبي بأسمائهم. اختار نبي وأنا أحكيلك عنه!'); L.add('الصحابة هم اللي آمنوا بالنبي ﷺ وعاشوا معاه. تعالى نتعرّف على أشهرهم!'); L.add('برافو! انت عارفهم كويس');
  BADGES.forEach((b) => { L.add('مبروك! خدت وسام ' + b.t); L.add(b.t + '. ' + b.d); });
  QB.forEach((q) => L.add(q.q)); TF.forEach(([t]) => L.add(t));
  RIDDLES.forEach((r) => r.h.forEach((h, k) => L.add(k ? h : 'مين أنا؟ ' + h)));
  L.add('تعادل! انتو الاتنين أبطال'); L.add('برافو للفريق الكسبان!'); L.add('برافو!');
  WELCOME_LINES.forEach((l) => L.add(l));
  L.add('لسه مستخبي… كمّل رحلتك'); L.add('كل درس وحكاية بيزوّدوا نور الجرة');
  return [...L].filter(Boolean);
}
