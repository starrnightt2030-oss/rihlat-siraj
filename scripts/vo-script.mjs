// يطلع سكريبت التسجيل لصوت سراج مرتّب حسب مكانه في التطبيق + ملف ترتيب نستخدمه في التقطيع
import { writeFileSync } from 'node:fs';
import { UNITS } from '../src/data/units.js';
import { STORIES } from '../src/data/stories.js';
import { SPARKS, STICKER_NAMES } from '../src/data/content.js';
import { GIFTS } from '../src/data/gifts.js';
import { stepLine, sceneLine, giftLine, allLines } from '../src/data/speech.js';

const seen = new Set(), sections = [];
const sec = (title, lines) => { const l = lines.filter((x) => x && !seen.has(x)); l.forEach((x) => seen.add(x)); if (l.length) sections.push({ title, lines: l }); };
sec('البداية والتعريف', ['بسم الله… يلا ننوّرها!', 'اسمك إيه يا بطل؟', 'انت ولد ولا بنت؟', 'عندك كام سنة؟', 'مين يحب يكون رفيقك في الرحلة؟']);
sec('شاشة رحلتي وهدية النهارده', ['يلا! الكارت اللي عليه الدور مستنيك', 'خلّص اللي قبلها الأول', 'ما شاء الله! خلّصت الرحلة كلها', 'هدية النهارده!']);
sec('ردود سراج في الأسئلة والمكافآت', ['شاطر!', 'شاطر! إجابة صح', 'قربت! فكّر تاني', 'برافو عليك!', 'الكنز اتفتح!']);
for (const u of UNITS) {
  const L = [u.sub];
  for (const c of u.cards) { if (c.story) continue; (c.steps || []).forEach((s) => L.push(stepLine(s))); if (c.quiz) L.push(c.quiz.q); }
  L.push('برافو! نوّرت ' + u.title);
  sec(`الوحدة ${String(u.n).replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d])}: ${u.title}`, L);
}
for (const s of Object.values(STORIES)) {
  const L = []; s.scenes.forEach((sc) => { L.push(sceneLine(sc)); (sc.choose || []).forEach((ch) => L.push(ch.res)); });
  L.push('اتعلمنا إيه؟', s.moral, ...s.quiz.map((q) => q.q), 'برافو! نوّرت ' + s.title);
  sec('حكاية: ' + s.title, L);
}
sec('الحكايات والألعاب', ['اختار حكاية وأنا أحكيهالك', 'رتّب الخطوات بالترتيب الصح', 'برافو! الترتيب صح', 'اختار الكلمة الناقصة', 'وصّل كل ذكر بوقته', 'ذاكرتك نوّرت! برافو', 'الصورة رجعت كاملة! شاطر']);
sec('كنوزي: الملصقات والشرارات', ['كل درس وحكاية بيزوّدوا نور الجرة', 'لسه مستخبي… كمّل رحلتك', ...Object.values(STICKER_NAMES), ...SPARKS.flatMap((sp) => ['شرارة ' + sp.name, 'شرارة ' + sp.name + ' مستنياك في الحكايات'])]);
sec('هدية كل يوم', GIFTS.map(giftLine));
sec('جمل تانية', allLines());

const ar = (n) => String(n).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
const read = (t) => t.replace(/ﷺ/g, '(صلى الله عليه وسلم)');
let n = 0, out = `سكريبت صوت «سراج» — تطبيق رحلة سراج
=========================================
عدد الجمل: ${ar(seen.size)} جملة في ${ar(sections.length)} قسم.

طريقة التسجيل (مهمة عشان أقدر أقطّع الصوت صح):
١) صوت مصري فرحان ولطيف، كأنك بتكلم طفل عنده ٦ سنين، وبراحة.
٢) متقولش الأرقام ولا أسماء الأقسام. اقرا الجملة بس.
٣) بعد كل جملة اسكت «ثانيتين» كاملين.
٤) بين كل قسم والتاني اسكت «٥ ثواني».
٥) لو غلطت في جملة: اسكت ٥ ثواني وابدأ الجملة من الأول، وأنا هاخد آخر نسخة.
٦) الأحاديث مكتوبة بالتشكيل، اقراها على مهلك وبتشكيلها.
٧) الآيات مش موجودة هنا لأن الشيخ هو اللي بيقراها في التطبيق.
٨) ممكن تسجّل كله في ملف واحد، أو كل قسم في ملف لوحده وتسمّيه برقم القسم (أسهل لو حصل غلط).
٩) سجّل في مكان هادي، والموبايل على بعد شبر من بُقّك.

`;
sections.forEach((s, i) => {
  out += `\n━━━━━━━━━━━━━━━━━━━━\nالقسم ${ar(i + 1)}: ${s.title}  (${ar(s.lines.length)} جملة)\n━━━━━━━━━━━━━━━━━━━━\n`;
  s.lines.forEach((l) => { n++; out += `\n${ar(n)}) ${read(l)}\n`; });
});
writeFileSync(process.argv[2] || '/tmp/vo.txt', out);
writeFileSync('scripts/vo-order.json', JSON.stringify(sections.map((s) => s.lines), null, 0));
console.log(seen.size, sections.length, sections.map((s) => s.lines.length).join(','));
