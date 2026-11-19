// صوت سراج: ملفات mp3 متولّدة مسبقًا (Azure). لو الجملة مالهاش ملف، بنستخدم صوت الموبايل لو فيه عربي.
// التلاوة: آيات مشاري العفاسي، آية آية.
import { useStore } from '../store';
import { lineHash } from './hash';

const BASE = import.meta.env.BASE_URL;
let man = null;
const ready = fetch(BASE + 'audio/voice/manifest.json').then((r) => (r.ok ? r.json() : null)).then((m) => { if (m) man = m.map || Object.fromEntries((m.files || []).map((h) => [h, `${h}-${m.tag}.mp3`])); }).catch(() => {}).finally(() => { man = man || {}; });

let el = null, queue = [], token = 0;
const player = () => { if (!el) { el = new Audio(); el.preload = 'auto'; } return el; };
let tvoice;
const pick = () => { const vs = window.speechSynthesis?.getVoices?.() || []; tvoice = vs.find((v) => /ar[-_]EG/i.test(v.lang)) || vs.find((v) => /^ar/i.test(v.lang)); };
if (typeof window !== 'undefined' && window.speechSynthesis) { pick(); window.speechSynthesis.onvoiceschanged = pick; }

function playList(urls, my) {
  if (my !== token || !urls.length) return;
  const a = player(); a.src = urls[0];
  a.onended = () => playList(urls.slice(1), my);
  a.onerror = () => playList(urls.slice(1), my);
  a.play().catch(() => {});
}
export function hush() { token++; try { el?.pause(); } catch (e) {} try { window.speechSynthesis?.cancel(); } catch (e) {} }

export function say(text, after = []) {
  if (man === null) { const my0 = ++token; ready.then(() => { if (token === my0) say(text, after); }); return; }
  const st = useStore.getState().settings;
  hush(); const my = token;
  const ayat = st.quran === false ? [] : after.map((c) => `${BASE}audio/quran/${c}.mp3`);
  if (!st.voice || !text) { playList(ayat, my); return; }
  const h = lineHash(text);
  if (man?.[h]) { playList([`${BASE}audio/voice/${man[h]}`, ...ayat], my); return; }
  try {
    if (!tvoice) pick();
    if (!tvoice || !window.speechSynthesis) { playList(ayat, my); return; }
    const u = new SpeechSynthesisUtterance(text.replace(/[«»﴿﴾]/g, '')); u.voice = tvoice; u.lang = tvoice.lang; u.rate = 0.92; u.pitch = 1.2;
    u.onend = () => playList(ayat, my);
    window.speechSynthesis.speak(u);
  } catch (e) { playList(ayat, my); }
}
export const recite = (codes) => say('', codes);
