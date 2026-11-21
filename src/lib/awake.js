// الشاشة ماتطفيش: طول ما الطفل بيلمس التطبيق (آخر ٥ دقايق)، أو فيه صوت شغّال (سراج، الشيخ، الأناشيد) حتى لو ساب الموبايل.
// لما الاتنين يخلصوا، الموبايل يرجع لمعاد قفل الشاشة العادي عشان البطارية.
import { Capacitor } from '@capacitor/core';
import { KeepAwake } from '@capacitor-community/keep-awake';

const IDLE = 5 * 60 * 1000;
const native = Capacitor.isNativePlatform();
const media = new Set();
let lastTouch = Date.now(), on = false, lock = null;

// كل عنصر صوت بيشتغل بنسجّله، عشان نعرف لو فيه صوت شغّال دلوقتي
const op = HTMLMediaElement.prototype.play;
HTMLMediaElement.prototype.play = function (...a) { media.add(this); setTimeout(tick, 50); return op.apply(this, a); };
const playing = () => { for (const m of media) { if (!m.paused && !m.ended) return true; if (m.paused && !m.src) media.delete(m); } return !!window.speechSynthesis?.speaking; };

async function set(want) {
  if (want === on) return; on = want;
  try {
    if (native) { want ? await KeepAwake.keepAwake() : await KeepAwake.allowSleep(); return; }
    if (want && navigator.wakeLock) lock = await navigator.wakeLock.request('screen');
    else if (!want && lock) { await lock.release(); lock = null; }
  } catch (e) { on = !want; }
}
function tick() { set(document.visibilityState === 'visible' && (Date.now() - lastTouch < IDLE || playing())); }

export function startAwake() {
  const touch = () => { lastTouch = Date.now(); if (!on) tick(); };
  ['pointerdown', 'keydown', 'touchstart'].forEach((e) => addEventListener(e, touch, { passive: true }));
  // قفل الشاشة من الويب بيتلغي لوحده لما التطبيق يتخبّى، فبنطلبه تاني لما يرجع
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { on = false; lastTouch = Date.now(); } tick(); });
  setInterval(tick, 10000);
  tick();
}
