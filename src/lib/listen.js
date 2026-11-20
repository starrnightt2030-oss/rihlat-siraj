// سمّعني: سماع صوت الطفل وتحويله لكلام مكتوب.
// على أندرويد: إضافة speech-recognition (محرّك جوجل في الموبايل). في المتصفح: Web Speech API لو موجودة.
// hear() بترجع الكلام اللي اتقال لحد ما الطفل يسكت، وبتبعت الكلام أول بأول لـ onText عشان يتكتب على الشاشة.
//
// ملحوظة مهمة عن أندرويد: محرّك جوجل بيقفل لوحده بعد ثانية أو اتنين لو مسمعش كلام، أو لو حصل خطأ،
// والإضافة في الحالة دي مابتبعتش أي حدث (الخطأ بيضيع). فبدل ما نستنى حدث ممكن مايجيش،
// بنسأل المحرّك كل شوية «انت لسه سامع؟»: لو قفل والطفل لسه ما قالش حاجة نشغّله تاني على طول،
// ولو قال كلام وسكت نخلّص.
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

const LANG = 'ar-SA'; // العربي الفصيح أقرب للتلاوة من العامية
const native = Capacitor.isNativePlatform();
// مهم: الإضافة بتتحمّل عادي فوق، وعمرها ما تترجع من دالة async أو Promise.
// إضافات Capacitor «بروكسي» بيرد على أي اسم دالة، فلما الـ Promise بيدوّر على then جوّاها بيبعت طلب لأندرويد
// مالوش رد، والكود بيفضل مستني للأبد (ده اللي كان موقّف المايك في الـ APK)
const plugin = () => SpeechRecognition;
const WebSR = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// سجل صغير لآخر اللي حصل مع المايك، بيظهر في «اختبار المايك» عشان نعرف المشكلة فين على أي موبايل
export const micLog = [];
const log = (m) => { micLog.push(new Date().toTimeString().slice(3, 8) + ' ' + m); if (micLog.length > 14) micLog.shift(); };
// طريقة السماع على أندرويد: 'bg' (في الخلفية والكلام بيظهر أول بأول) أو 'popup' (شباك جوجل للكلام).
// بنبدأ بالخلفية، ولو ماجابتش أي كلام خالص بنحوّل لشباك جوجل، والموبايل بيفتكر الطريقة اللي نفعت
const MODE_KEY = 'siraj-mic-mode';
const getMode = () => { try { return localStorage.getItem(MODE_KEY); } catch (e) { return null; } };
const setMode = (m) => { try { localStorage.setItem(MODE_KEY, m); } catch (e) {} log('الطريقة: ' + m); };
export const resetMicMode = () => { try { localStorage.removeItem(MODE_KEY); } catch (e) {} };

// هل نقدر نسمع؟ بيطلب إذن المايك مرة واحدة. بيرجع 'ok' أو 'denied' أو 'none'
// طلب واحد بس في نفس الوقت: لو اتطلب الإذن تاني والأول لسه مفتوح، أندرويد ممكن ميردّش خالص
let asking = null;
export function micReady() { return asking || (asking = askMic().finally(() => { asking = null; })); }
// كل خطوة ليها مهلة: لو الإضافة وقفت ومردّتش، مانفضلش مستنيين للأبد
const within = (p, ms, label) => Promise.race([p, sleep(ms).then(() => { throw new Error('مهلة: ' + label); })]);
// طريقة تانية لطلب إذن المايك: المتصفح اللي جوّه التطبيق بيطلب من أندرويد نفس الإذن (شباك «السماح بتسجيل الصوت؟»)
async function askViaWebView() {
  if (!navigator.mediaDevices?.getUserMedia) { log('المتصفح الداخلي مالوش طريقة للمايك'); return false; }
  try {
    const ms = await within(navigator.mediaDevices.getUserMedia({ audio: true }), 20000, 'إذن المتصفح');
    ms.getTracks().forEach((t) => t.stop()); log('المتصفح الداخلي: الإذن اتاخد'); return true;
  } catch (e) { log('المتصفح الداخلي: ' + (e?.name || '') + ' ' + (e?.message || e)); return false; }
}
async function askMic() {
  try {
    if (native) {
      log('بنجهّز المايك…');
      const p = plugin();
      let st = 'unknown';
      try { st = (await within(p.checkPermissions(), 4000, 'فحص الإذن')).speechRecognition; } catch (e) { log(e.message); }
      log('حالة الإذن: ' + st);
      if (st !== 'granted') {
        try { st = (await within(p.requestPermissions(), 8000, 'طلب الإذن')).speechRecognition; log('رد طلب الإذن: ' + st); } catch (e) { log(e.message); }
      }
      if (st !== 'granted' && await askViaWebView()) {
        try { st = (await within(p.checkPermissions(), 4000, 'فحص الإذن')).speechRecognition; } catch (e) { st = 'granted?'; }
        log('حالة الإذن بعد المتصفح: ' + st);
      }
      if (st !== 'granted' && st !== 'granted?') return 'denied';
      let available = true;
      try { available = (await within(p.available(), 4000, 'فحص خدمة الكلام')).available; } catch (e) { log(e.message); }
      log('خدمة الكلام: ' + (available ? 'موجودة' : 'مش موجودة'));
      return available ? 'ok' : 'none';
    }
    return WebSR ? 'ok' : 'none';
  } catch (e) { log('خطأ في الإذن: ' + (e?.message || e)); return 'none'; }
}

// يسمع لحد ما الطفل يقول كلام ويسكت (أو يعدّي maxMs، أو يعدّي waitMs من غير ما يقول حاجة). stop() بتقفل السماع فورًا.
// onFail بتتنادي لو المحرّك رفض يشتغل خالص (عشان الشاشة تقول للطفل/الأهل إن المايك مش شغال).
// المستمعين لأحداث أندرويد بيتسجّلوا مرة واحدة بس، والجلسة الشغالة دلوقتي (active) هي اللي بتاخد الكلام
let active = null, wired = null;
const wire = (p) => wired || (wired = (async () => {
  await p.removeAllListeners().catch(() => {});
  await p.addListener('partialResults', (d) => active?.got(d?.matches?.[0]));
  await p.addListener('listeningState', (d) => log('المحرّك: ' + (d?.status === 'started' ? 'بدأ يسمع كلام' : 'وقف')));
})());
// تجهيز المايك أول ما الشاشة تفتح، عشان أول سماع يبدأ من غير تأخير
export function warmMic() { if (native) wire(plugin()).catch(() => {}); }

// muted: يبدأ يسمع بدري (والشيخ لسه بيخلّص الآية) عشان المايك يبقى جاهز أول ما الطفل يتكلم.
// أي كلام بيتسمع قبل unmute() (صوت الشيخ نفسه) بيتشال، والمهلات بتبدأ تعدّ من unmute()
export function hear({ onText, onFail, maxMs = 15000, waitMs = 7000, muted = false } = {}) {
  let text = '', ended = false, resolve, timers = [], cleanup = () => {}, mute = muted, pre = [], openR;
  const promise = new Promise((r) => { resolve = r; });
  const opened = new Promise((r) => { openR = r; if (!muted) r(); });
  const finish = () => {
    if (ended) return; ended = true;
    timers.forEach(clearTimeout); cleanup(); openR(); resolve(text.trim());
  };
  const got = (t) => {
    if (ended || !t || !t.trim()) return;
    const w = t.trim().split(/\s+/);
    if (mute) { pre = w; return; }
    // نشيل كلام الشيخ اللي اتسمع قبل ما دور الطفل يبدأ (لو المحرّك لسه في نفس الجلسة)
    let k = 0; while (k < pre.length && k < w.length && w[k] === pre[k]) k++;
    const rest = w.slice(k).join(' ');
    if (!rest) return;
    text = rest; onText?.(text);
  };
  const arm = () => {
    timers.push(setTimeout(finish, maxMs));
    timers.push(setTimeout(() => { if (!text) finish(); }, waitMs)); // الطفل ما قالش حاجة
  };
  if (!muted) arm();
  const unmute = () => { if (!mute || ended) return; mute = false; arm(); openR(); };

  if (native) {
    (async () => {
      const p = plugin();
      if (ended) return;
      // شباك جوجل: بيسمع لحد ما الطفل يسكت وبيرجّع الكلام مرة واحدة
      const popup = async () => {
        timers.forEach(clearTimeout); timers = [setTimeout(finish, 45000)];
        log('فتح شباك جوجل');
        try {
          const r = await p.start({ language: LANG, popup: true, partialResults: false, maxResults: 1, prompt: 'اقرا الآية' });
          const t = r?.matches?.[0]; log('شباك جوجل رجّع: ' + (t ? '«' + t.slice(0, 30) + '»' : 'ولا حاجة'));
          if (t) { got(t); if (getMode() !== 'popup') setMode('popup'); }
        } catch (e) { log('شباك جوجل اتقفل: ' + (e?.message || e)); }
        finish();
      };
      if (getMode() === 'popup') { await opened; if (!ended) popup(); return; }
      // السماع بيبدأ على طول: المستمعين متسجّلين مرة واحدة من بدري (warmMic)، فمفيش خطوات مع أندرويد قبل start
      active = { got: (t) => { if (t && getMode() !== 'bg') setMode('bg'); got(t); } };
      const me = active, hs = [{ remove: () => { if (active === me) active = null; } }];
      if (!wired) await wire(p);
      let fails = 0, busy = false, closing = false, restarts = 0, switched = false;
      const begin = async () => {
        try {
          await p.start({ language: LANG, partialResults: true, popup: false, maxResults: 1 });
          fails = 0; if (!restarts) log('بدأ السماع في الخلفية');
        } catch (e) {
          log('رفض يبدأ: ' + (e?.message || e));
          if (++fails >= 3) { onFail?.(String(e?.message || e || 'error')); finish(); }
        }
      };
      const poll = setInterval(async () => {
        if (ended || busy || closing || switched) return;
        busy = true;
        try {
          const { listening } = await p.isListening().catch(() => ({ listening: false }));
          if (ended || listening) return;
          if (text && !mute) {
            // الطفل قال كلام وسكت: النتيجة الأخيرة بتيجي بعد ما المحرّك يقفل بشوية
            closing = true; timers.push(setTimeout(finish, 1200));
          } else if (!mute && ++restarts >= 4 && getMode() !== 'bg') {
            // السماع في الخلفية قفل كذا مرة من غير ولا كلمة: غالبًا مش شغال على الموبايل ده، نجرّب شباك جوجل
            switched = true; log('الخلفية مابتسمعش، هنجرّب شباك جوجل');
            clearInterval(poll); hs.forEach((h) => h.remove?.()); p.stop().catch(() => {}); // stop() في الإضافة مابترجعش، فمانستناهاش
            await sleep(300); await opened; if (!ended) popup();
          } else {
            await sleep(250); // المحرّك قفل من غير كلام (سكوت أو خطأ): نشغّله تاني
            if (!ended && !text) await begin();
          }
        } finally { busy = false; }
      }, 600);
      cleanup = () => { clearInterval(poll); if (!switched) p.stop().catch(() => {}); hs.forEach((h) => h.remove?.()); };
      await begin();
    })().catch((e) => { log('خطأ: ' + (e?.message || e)); onFail?.(String(e?.message || e)); finish(); });
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
      r.onend = () => { if (ended) return; if (text && !mute) timers.push(setTimeout(finish, 300)); else timers.push(setTimeout(() => { if (!ended) begin(); }, 250)); };
      try { r.start(); } catch (e) { onFail?.(String(e?.message || e)); finish(); }
    };
    cleanup = () => { try { r?.abort(); } catch (e) {} };
    begin();
  } else finish();

  return { promise, stop: finish, unmute };
}
