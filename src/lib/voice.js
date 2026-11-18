// صوت سراج: لو الجهاز فيه صوت عربي بيقرا الكلام، والكلام مكتوب دايمًا
import { useStore } from '../store';
let voice;
const pick = () => { const vs = window.speechSynthesis?.getVoices?.() || []; voice = vs.find((v) => /ar[-_]EG/i.test(v.lang)) || vs.find((v) => /^ar/i.test(v.lang)); };
if (typeof window !== 'undefined' && window.speechSynthesis) { pick(); window.speechSynthesis.onvoiceschanged = pick; }
export const canSpeak = () => !!(window.speechSynthesis && voice);
export function say(text) {
  if (!useStore.getState().settings.voice || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    if (!voice) pick();
    if (!voice) return;
    const u = new SpeechSynthesisUtterance(text.replace(/[«»]/g, '')); u.voice = voice; u.lang = voice.lang; u.rate = 0.92; u.pitch = 1.15;
    window.speechSynthesis.speak(u);
  } catch (e) {}
}
export const hush = () => { try { window.speechSynthesis?.cancel(); } catch (e) {} };
