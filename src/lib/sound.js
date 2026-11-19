// أصوات مولّدة (نقرات، فقاعات، مية، بريق) — من غير موسيقى ولا آلات
import { useStore } from '../store';
let ctx;
const ac = () => { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); return ctx; };
const on = () => useStore.getState().settings.sound;

function tone(f0, f1, dur, vol = 0.18, type = 'sine', delay = 0) {
  const c = ac(), t = c.currentTime + delay;
  const o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
}
function noise(dur, f0, f1, vol = 0.15, q = 1.2, delay = 0) {
  const c = ac(), t = c.currentTime + delay;
  const b = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const s = c.createBufferSource(); s.buffer = b;
  const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = q; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(c.destination); s.start(t); s.stop(t + dur);
}

export const sfx = {
  tap() { if (on()) tone(520, 880, 0.08, 0.14); },
  pop() { if (on()) { tone(300, 1200, 0.09, 0.2); } },
  back() { if (on()) tone(700, 380, 0.1, 0.12); },
  drop() { if (on()) { tone(1500, 420, 0.16, 0.22); noise(0.08, 3000, 1500, 0.05, 2, 0.04); } },
  splash() { if (on()) noise(0.35, 2500, 700, 0.18, 0.8); },
  whoosh() { if (on()) noise(0.4, 300, 2400, 0.16, 1.4); },
  flip() { if (on()) noise(0.07, 2200, 900, 0.16, 1.5); },
  // ظهور سراج: نَفَس هوا طالع + لمعة (مؤثر، مش موسيقى)
  reveal() { if (!on()) return; noise(0.9, 400, 5200, 0.07, 0.8); [0.5, 0.58, 0.66, 0.76, 0.86].forEach((d, i) => tone(2000 + i * 300, 2800 + i * 240, 0.16, 0.05, 'sine', d)); },
  sparkle() { if (!on()) return; [0, 0.06, 0.12, 0.2, 0.28].forEach((d, i) => tone(1800 + i * 260 + Math.random() * 200, 2600 + i * 200, 0.12, 0.06, 'sine', d)); },
  good() { if (!on()) return; tone(660, 990, 0.12, 0.14); tone(990, 1320, 0.16, 0.12, 'sine', 0.1); noise(0.25, 5000, 8000, 0.03, 3, 0.08); },
  soft() { if (on()) tone(330, 260, 0.18, 0.1, 'triangle'); },
  star(i = 0) { if (on()) { tone(900 + i * 220, 1700 + i * 220, 0.18, 0.12); noise(0.2, 6000, 9000, 0.03, 3); } },
};
export const unlockAudio = () => { try { ac(); } catch (e) {} };
