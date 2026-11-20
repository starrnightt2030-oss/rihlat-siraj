// سمّعني: سماع صوت الطفل وتحويله لكلام مكتوب.
// على أندرويد: إضافة speech-recognition (محرّك جوجل في الموبايل). في المتصفح: Web Speech API لو موجودة.
// hear() بترجع الكلام اللي اتقال لحد ما الطفل يسكت، وبتبعت الكلام أول بأول لـ onText عشان يتكتب على الشاشة.
//
// ملحوظة مهمة عن أندرويد: محرّك جوجل بيقفل لوحده بعد ثانية أو اتنين لو مسمعش كلام، أو لو حصل خطأ،
// والإضافة في الحالة دي مابتبعتش أي حدث (الخطأ بيضيع). فبدل ما نستنى حدث ممكن مايجيش،
// بنسأل المحرّك كل شوية «انت لسه سامع؟»: لو قفل والطفل لسه ما قالش حاجة نشغّله تاني على طول،
// ولو قال كلام وسكت نخلّص.
import { Capacitor } from '@capacitor/core';

const LANG = 'ar-SA'; // العربي الفصيح أقرب للتلاوة من العامية
const native = Capacitor.isNativePlatform();
let SR = null;
const plugin = async () => SR || (SR = (await import('@capacitor-community/speech-recognition')).SpeechRecognition);
const WebSR = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// هل نقدر نسمع؟ بيطلب إذن المايك مرة واحدة. بيرجع 'ok' أو 'denied' أو 'none'
// طلب واحد بس في نفس الوقت: لو اتطلب الإذن تاني والأول لسه مفتوح، أندرويد ممكن ميردّش خالص
let asking = null;
export function micReady() { return asking || (asking = askMic().finally(() => { asking = null; })); }
async function askMic() {
  try {
    if (native) {
      const p = await plugin();
      let st = (await p.checkPermissions()).speechRecognition;
      if (st !== 'granted') st = (await p.requestPermissions()).speechRecognition;
      if (st !== 'granted') return 'denied';
      const { available } = await p.available();
      return available ? 'ok' : 'none';
    }
    return WebSR ? 'ok' : 'none';
  } catch (e) { return 'none'; }
}

// يسمع لحد ما الطفل يقول كلام ويسكت (أو يعدّي maxMs، أو يعدّي waitMs من غير ما يقول حاجة). stop() بتقفل السماع فورًا.
// onFail بتتنادي لو المحرّك رفض يشتغل خالص (عشان الشاشة تقول للطفل/الأهل إن المايك مش شغال).
export function hear({ onText, onFail, maxMs = 15000, waitMs = 7000 } = {}) {
  let text = '', ended = false, resolve, timers = [], cleanup = () => {};
  const promise = new Promise((r) => { resolve = r; });
  const finish = () => {
    if (ended) return; ended = true;
    timers.forEach(clearTimeout); cleanup(); resolve(text.trim());
  };
  const got = (t) => { if (ended || !t || !t.trim()) return; text = t; onText?.(text); };
  timers.push(setTimeout(finish, maxMs));
  timers.push(setTimeout(() => { if (!text) finish(); }, waitMs)); // الطفل ما قالش حاجة

  if (native) {
    (async () => {
      const p = await plugin();
      if (ended) return;
      await p.removeAllListeners().catch(() => {});
      const hs = [await p.addListener('partialResults', (d) => got(d?.matches?.[0]))];
      let fails = 0, busy = false, closing = false;
      const begin = async () => {
        try {
          await p.start({ language: LANG, partialResults: true, popup: false, maxResults: 1 });
          fails = 0;
        } catch (e) {
          if (++fails >= 3) { onFail?.(String(e?.message || e || 'error')); finish(); }
        }
      };
      const poll = setInterval(async () => {
        if (ended || busy || closing) return;
        busy = true;
        try {
          const { listening } = await p.isListening().catch(() => ({ listening: false }));
          if (ended || listening) return;
          if (text) {
            // الطفل قال كلام وسكت: النتيجة الأخيرة بتيجي بعد ما المحرّك يقفل بشوية
            closing = true; timers.push(setTimeout(finish, 1200));
          } else {
            await sleep(250); // المحرّك قفل من غير كلام (سكوت أو خطأ): نشغّله تاني
            if (!ended && !text) await begin();
          }
        } finally { busy = false; }
      }, 600);
      cleanup = () => { clearInterval(poll); p.stop().catch(() => {}); hs.forEach((h) => h.remove?.()); };
      await begin();
    })().catch((e) => { onFail?.(String(e?.message || e)); finish(); });
  } else if (WebSR) {
    let r = null, fails = 0;
    const begin = () => {
      r = new WebSR();
      r.lang = LANG; r.interimResults = true; r.continuous = false; r.maxAlternatives = 1;
      r.onresult = (e) => { fails = 0; got([...e.results].map((x) => x[0].transcript).join(' ')); };
      r.onerror = (e) => {
        if (e?.error === 'not-allowed' || e?.error === 'service-not-allowed' || ++fails >= 4) { onFail?.(e?.error || 'error'); finish(); }
      };
      // لو قفل من غير كلام نشغّله تاني، ولو الطفل قال وسكت نخلّص
      r.onend = () => { if (ended) return; if (text) timers.push(setTimeout(finish, 300)); else timers.push(setTimeout(() => { if (!ended) begin(); }, 250)); };
      try { r.start(); } catch (e) { onFail?.(String(e?.message || e)); finish(); }
    };
    cleanup = () => { try { r?.abort(); } catch (e) {} };
    begin();
  } else finish();

  return { promise, stop: finish };
}
