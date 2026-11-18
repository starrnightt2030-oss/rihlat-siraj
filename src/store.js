import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const blank = { profile: null, stars: 0, light: 0, done: {}, sparks: [], stickers: [], medals: [], games: {}, settings: { sound: true, voice: true, motion: true }, lastSeen: 0 };

export const useStore = create(persist((set, get) => ({
  ...blank,
  setProfile: (profile) => set({ profile }),
  touch: () => set({ lastSeen: Date.now() }),
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
  reset: () => set({ ...blank }),
}), { name: 'siraj-v1', version: 1 }));
