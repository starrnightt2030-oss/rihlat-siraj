// صوت سراج: ملفات mp3 متولّدة مسبقًا (Azure). لو الجملة مالهاش ملف، بنستخدم صوت الموبايل لو فيه عربي.
// التلاوة: آية آية بصوت القارئ اللي الطفل اختاره، ووضع المعلّم بيسيب وقت للطفل يردّد بعد كل آية.
import { useStore } from '../store';
import { lineHash } from './hash';
import { reciterById } from '../data/reciters';
import { nameLine } from '../data/names';

// دور الطفل في الترديد: الشاشة بتسمع هنا عشان تظهر «دورك»
const subs = new Set();
export const onTurn = (cb) => { subs.add(cb); return () => subs.delete(cb); };
const turn = (v) => subs.forEach((cb) => cb(v));
// الآية اللي بتتقري دلوقتي (عشان نلوّنها)
const asubs = new Set();
export const onAyah = (cb) => { asubs.add(cb); return () => asubs.delete(cb); };
const ayahNow = (c) => asubs.forEach((cb) => cb(c));

const BASE = import.meta.env.BASE_URL;
let man = null;
const ready = fetch(BASE + 'audio/voice/manifest.json').then((r) => (r.ok ? r.json() : null)).then((m) => { if (m) man = m.map || Object.fromEntries((m.files || []).map((h) => [h, `${h}-${m.tag}.mp3`])); }).catch(() => {}).finally(() => { man = man || {}; });

let el = null, queue = [], token = 0;
const player = () => { if (!el) { el = new Audio(); el.preload = 'auto'; } return el; };
let tvoice;
const pick = () => { const vs = window.speechSynthesis?.getVoices?.() || []; tvoice = vs.find((v) => /ar[-_]EG/i.test(v.lang)) || vs.find((v) => /^ar/i.test(v.lang)); };
if (typeof window !== 'undefined' && window.speechSynthesis) { pick(); window.speechSynthesis.onvoiceschanged = pick; }

// العنصر: رابط، أو { url, gap: true } يعني بعده وقت للترديد
let timer = 0;
// say() بترجع وعد بيخلص لما الكلام يخلص (أو يتقاطع)، عشان الشاشات تستنى الجملة تكمل
let finish = null;
const done = () => { const f = finish; finish = null; f?.(); };
function playList(urls, my) {
  if (my !== token || !urls.length) { if (my === token) { turn(null); ayahNow(null); done(); } return; }
  const it = typeof urls[0] === 'string' ? { url: urls[0] } : urls[0];
  ayahNow((it.url.match(/(\d{6})\.mp3$/) || [])[1] || null);
  const a = player(); a.src = it.url;
  // صوت سراج بيتبطّأ شوية (من غير ما نبرة الصوت تتغير)، والقرآن بسرعة الشيخ الطبيعية
  const rate = it.url.includes('/audio/voice/') ? (useStore.getState().settings.vrate || 0.85) : 1;
  try { a.preservesPitch = true; a.defaultPlaybackRate = rate; a.playbackRate = rate; } catch (e) { /* */ }
  a.onended = () => {
    if (my !== token) return;
    if (!it.gap) return playList(urls.slice(1), my);
    const ms = Math.min(25000, Math.max(2500, (a.duration || 3) * 1100 + 1200));
    turn({ ms, at: Date.now() });
    rest = () => { rest = null; clearTimeout(timer); if (my === token) { turn(null); playList(urls.slice(1), my); } };
    timer = setTimeout(rest, ms);
  };
  a.onerror = () => playList(urls.slice(1), my);
  // لو المتصفح منع الصوت قبل أول لمسة، بنشغّله أول ما الطفل يلمس الشاشة
  a.play().catch((e) => { if (e && e.name === 'NotAllowedError') window.addEventListener('pointerdown', () => { if (my === token) a.play().catch(() => {}); }, { once: true }); });
}
export function hush() { done(); ayahNow(null); token++; clearTimeout(timer); rest = null; turn(null); try { el?.pause(); } catch (e) {} try { window.speechSynthesis?.cancel(); } catch (e) {} }
// يتخطى وقت الترديد ويكمّل
let rest = null;
export function skipTurn() { rest?.(); }
const ayatOf = (codes, st) => {
  const dir = reciterById(st.reciter).dir, rep = st.teach ? Math.max(1, st.reps || 1) : 1;
  return codes.flatMap((c) => Array.from({ length: rep }, () => (st.teach ? { url: `${BASE}audio/${dir}/${c}.mp3`, gap: true } : `${BASE}audio/${dir}/${c}.mp3`)));
};

// say(كلام قبل، آيات، كلام بعد): مثلًا «ربنا قال…» ← الشيخ يقرا ← «يعني…»
// opts.name = 'first': سراج ينادي الطفل باسمه الأول (لو اسمه متسجّل)
export function say(text, after = [], post = '', opts = {}) {
  if (man === null) { const my0 = ++token; return ready.then(() => (token === my0 ? say(text, after, post, opts) : undefined)); }
  const st = useStore.getState().settings;
  hush(); const my = token;
  const p = new Promise((r) => { finish = r; });
  speak(text, after, st, my, post, opts);
  return p;
}
// كلمات التشجيع: سراج بيضيف اسم الطفل بعدها أحيانًا («برافو!» ← «يا تالين.»)
const PRAISE = new Set(['شاطر!', 'برافو!', 'شاطر! إجابة صح', 'برافو! إجابة صح', 'برافو! وصّلت كله صح', 'برافو! حفظته صح', 'برافو! الترتيب صح', 'برافو عليك!', 'ذاكرتك نوّرت! برافو', 'الصورة رجعت كاملة! شاطر']);
let praiseN = 0;
function nameUrl(n) {
  const nl = nameLine(n || useStore.getState().profile?.name), f = nl && man?.[lineHash(nl)];
  return f ? `${BASE}audio/voice/${f}` : null;
}
function speak(text, after, st, my, post, opts = {}) {
  const ph = post && st.voice && man?.[lineHash(post)];
  const ayat = [...(st.quran === false ? [] : ayatOf(after, st)), ...(ph ? [`${BASE}audio/voice/${ph}`] : [])];
  if (!st.voice || !text) { playList(ayat, my); return; }
  const h = lineHash(text);
  const nu = st.voice ? nameUrl(opts.n) : null;
  if (man?.[h]) {
    const main = `${BASE}audio/voice/${man[h]}`;
    if (nu && opts.name === 'first') { playList([nu, main, ...ayat], my); return; }
    if (nu && PRAISE.has(text) && praiseN++ % 2 === 0) { playList([main, nu, ...ayat], my); return; }
    playList([main, ...ayat], my); return;
  }
  try {
    if (!tvoice) pick();
    if (!tvoice || !window.speechSynthesis) { playList(ayat, my); return; }
    const u = new SpeechSynthesisUtterance(text.replace(/[«»﴿﴾]/g, '')); u.voice = tvoice; u.lang = tvoice.lang; u.rate = 0.85; u.pitch = 1.2;
    u.onend = () => playList(ayat, my); u.onerror = () => playList(ayat, my);
    window.speechSynthesis.speak(u);
  } catch (e) { playList(ayat, my); }
}
export const recite = (codes) => say('', codes);
// جملة ترحيب للشاشة: once = مرة واحدة بس في الجلسة
const heard = new Set();
export function hubSay(line, once = false, opts = {}) {
  if (!line || (once && heard.has(line))) return;
  heard.add(line); setTimeout(() => say(line, [], '', opts), 350);
}
