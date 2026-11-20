import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const blank = { profile: null, stars: 0, light: 0, done: {}, sparks: [], stickers: [], medals: [], games: {}, settings: { sound: true, voice: true, motion: true, quran: true, reciter: 'alafasy', teach: false, reps: 1, remind: true }, lastSeen: 0, days: [], gift: '', azkar: { d: '', ids: [], secs: [] }, tasbih: 0, zdays: [], seenBadges: [], seenProphets: [], hdone: [], asmaSeen: [], rdays: {}, qaida: [], tuhfa: [], hifz: [], hifzWeak: {}, hifzCerts: {} };

export const useStore = create(persist((set, get) => ({
  ...blank,
  setProfile: (profile) => set({ profile }),
  touch: () => set({ lastSeen: Date.now() }),
  visit: (d) => set((s) => (s.days.includes(d) ? {} : { days: [...s.days, d].slice(-60) })),
  takeGift: (d) => set((s) => ({ gift: d, light: s.light + 2 })),
  setSetting: (k, v) => set((s) => ({ settings: { ...s.settings, [k]: v } })),
  // يحفظ أفضل نتيجة للدرس ويضيف المكافآت مرة واحدة بس
  complete: (id, stars, reward = {}) => {
    const s = get();
    const prev = s.done[id] || 0;
    const first = !(id in s.done);
    const gain = Math.max(0, stars - prev);
    const out = { gain, first, sticker: null, spark: null, light: 0 };
    const patch = { done: { ...s.done, [id]: Math.max(prev, stars) }, stars: s.stars + gain };
    if (first) {
      out.light = reward.light || 5;
      patch.light = s.light + out.light;
      if (reward.sticker && !s.stickers.includes(reward.sticker)) { patch.stickers = [...s.stickers, reward.sticker]; out.sticker = reward.sticker; }
      if (reward.spark && !s.sparks.includes(reward.spark)) { patch.sparks = [...s.sparks, reward.spark]; out.spark = reward.spark; }
    }
    set(patch);
    return out;
  },
  win: (k, light = 2) => set((s) => ({ light: s.light + light, games: { ...s.games, [k]: (s.games[k] || 0) + 1 } })),
  gameScore: (k, v) => set((s) => ({ games: { ...s.games, [k]: Math.max(s.games[k] || 0, v) } })),
  // أذكار النهارده: بتتصفّر كل يوم
  dhikr: (d, id) => set((s) => { const z = s.azkar?.d === d ? s.azkar : { d, ids: [], secs: [] }; return z.ids.includes(id) ? {} : { azkar: { ...z, ids: [...z.ids, id] } }; }),
  finishSec: (d, sec, light = 3) => { const s = get(); const z = s.azkar?.d === d ? s.azkar : { d, ids: [], secs: [] }; if (z.secs.includes(sec)) return false; set({ azkar: { ...z, secs: [...z.secs, sec] }, light: s.light + light, zdays: (s.zdays || []).includes(d) ? s.zdays : [...(s.zdays || []), d].slice(-120) }); return true; },
  ramTask: (d, id) => set((s) => { const all = s.rdays || {}, l = all[d] || []; return { rdays: { ...all, [d]: l.includes(id) ? l.filter((x) => x !== id) : [...l, id] } }; }),
  hifzToggle: (n) => set((s) => { const l = s.hifz || []; return { hifz: l.includes(n) ? l.filter((x) => x !== n) : [...l, n] }; }),
  // آيات محتاجة مراجعة في كل سورة (رقم الآية من ٠): بتتشال أول ما الطفل يقولها صح
  markAyah: (n, k, bad) => set((s) => { const all = s.hifzWeak || {}, l = all[n] || []; const has = l.includes(k); if (bad === has) return {}; return { hifzWeak: { ...all, [n]: bad ? [...l, k] : l.filter((x) => x !== k) } }; }),
  // شهادات الحفظ: لكل سورة تاريخ أول مرة سمّعها كاملة
  certify: (n, info) => set((s) => ({ hifzCerts: { ...(s.hifzCerts || {}), [n]: { ...(s.hifzCerts || {})[n], ...info } } })),
  tuhfaToggle: (id) => set((s) => { const l = s.tuhfa || []; return { tuhfa: l.includes(id) ? l.filter((x) => x !== id) : [...l, id] }; }),
  qaidaDone: (id) => set((s) => { const l = s.qaida || []; return l.includes(id) ? {} : { qaida: [...l, id] }; }),
  seeAsma: (k) => set((s) => { const l = s.asmaSeen || []; return l.includes(k) ? {} : { asmaSeen: [...l, k] }; }),
  hadithDone: (id) => set((s) => { const l = s.hdone || []; return { hdone: l.includes(id) ? l.filter((x) => x !== id) : [...l, id] }; }),
  seeProphet: (id) => set((s) => { const l = s.seenProphets || []; return l.includes(id) ? {} : { seenProphets: [...l, id], games: { ...s.games, seen_anbiya_n: l.length + 1 } }; }),
  ackBadges: (ids) => set({ seenBadges: ids }),
  addTasbih: (n = 1) => set((s) => ({ tasbih: (s.tasbih || 0) + n })),
  reset: () => set({ ...blank }),
}), { name: 'siraj-v1', version: 1 }));
