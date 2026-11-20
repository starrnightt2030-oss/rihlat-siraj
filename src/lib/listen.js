// سمّعني: سماع صوت الطفل وتحويله لكلام مكتوب.
// على أندرويد: إضافة speech-recognition (محرّك جوجل في الموبايل). في المتصفح: Web Speech API لو موجودة.
// hear() بترجع الكلام اللي اتقال لحد ما الطفل يسكت، وبتبعت الكلام أول بأول لـ onText عشان يتكتب على الشاشة.
import { Capacitor } from '@capacitor/core';

const LANG = 'ar-SA'; // العربي الفصيح أقرب للتلاوة من العامية
const native = Capacitor.isNativePlatform();
let SR = null;
const plugin = async () => SR || (SR = (await import('@capacitor-community/speech-recognition')).SpeechRecognition);
const WebSR = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

// هل نقدر نسمع؟ بيطلب إذن المايك مرة واحدة. بيرجع 'ok' أو 'denied' أو 'none'
export async function micReady() {
  try {
    if (native) {
      const p = await plugin();
      const { available } = await p.available();
      if (!available) return 'none';
      let st = (await p.checkPermissions()).speechRecognition;
      if (st !== 'granted') st = (await p.requestPermissions()).speechRecognition;
      return st === 'granted' ? 'ok' : 'denied';
    }
    return WebSR ? 'ok' : 'none';
  } catch (e) { return 'none'; }
}

// يسمع مرة واحدة لحد ما الطفل يسكت (أو يعدّي maxMs). stop() بتقفل السماع فورًا.
export function hear({ onText, maxMs = 15000, waitMs = 7000 } = {}) {
  let text = '', ended = false, resolve, timers = [], cleanup = () => {};
  const promise = new Promise((r) => { resolve = r; });
  const finish = () => {
    if (ended) return; ended = true;
    timers.forEach(clearTimeout); cleanup(); resolve(text.trim());
  };
  const got = (t) => { if (ended || !t) return; text = t; onText?.(text); };
  timers.push(setTimeout(finish, maxMs));
  timers.push(setTimeout(() => { if (!text) finish(); }, waitMs)); // الطفل ما قالش حاجة

  if (native) {
    (async () => {
      const p = await plugin();
      await p.removeAllListeners().catch(() => {});
      const hs = [];
      hs.push(await p.addListener('partialResults', (d) => got(d?.matches?.[0])));
      // «stopped» بتيجي قبل النتيجة الأخيرة بشوية، فبنستنى ثانية قبل ما نقفل
      hs.push(await p.addListener('listeningState', (d) => { if (d?.status === 'stopped') timers.push(setTimeout(finish, 1000)); }));
      cleanup = () => { p.stop().catch(() => {}); hs.forEach((h) => h.remove?.()); };
      if (ended) return cleanup();
      p.start({ language: LANG, partialResults: true, popup: false, maxResults: 1 }).catch(() => timers.push(setTimeout(finish, 600)));
    })().catch(finish);
  } else if (WebSR) {
    const r = new WebSR();
    r.lang = LANG; r.interimResults = true; r.continuous = false; r.maxAlternatives = 1;
    r.onresult = (e) => got([...e.results].map((x) => x[0].transcript).join(' '));
    r.onend = () => timers.push(setTimeout(finish, 300));
    r.onerror = () => {};
    cleanup = () => { try { r.abort(); } catch (e) {} };
    try { r.start(); } catch (e) { finish(); }
  } else finish();

  return { promise, stop: finish };
}
