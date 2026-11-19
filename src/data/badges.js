// الأوسمة: بتتحسب من تقدّم الطفل، وكل وسام ليه هدف واضح
import { UNITS, ALL_CARDS } from './units.js';
import { STORIES } from './stories.js';
const unitDone = (id, done) => UNITS.find((u) => u.id === id).cards.every((c) => c.id in done);
export const streakOf = (days = []) => { let n = 0; const t = new Date(); for (;;) { const d = new Date(t.getFullYear(), t.getMonth(), t.getDate() - n); if (days.includes(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`)) n++; else break; if (n > 400) break; } return n; };
export const BADGES = [
  { id: 'first', t: 'أول خطوة', d: 'خلّص أول كارت', ic: '🌱', c: '#58C98A', p: (s) => [Math.min(1, Object.keys(s.done).length), 1] },
  { id: 'wudu', t: 'بطل الوضوء', d: 'خلّص وحدة الوضوء', ic: '💧', c: '#3BB8D0', p: (s) => [unitDone('tahara', s.done) ? 1 : 0, 1] },
  { id: 'salah', t: 'بطل الصلاة', d: 'خلّص وحدة الصلاة', ic: '🕌', c: '#4A8FE0', p: (s) => [unitDone('salah', s.done) ? 1 : 0, 1] },
  { id: 'quran', t: 'صاحب القرآن', d: 'خلّص وحدة قرآني', ic: '📖', c: '#9B7BF2', p: (s) => [unitDone('quran', s.done) ? 1 : 0, 1] },
  { id: 'cards20', t: 'المتعلّم النشيط', d: 'خلّص ٢٠ كارت', ic: '🎓', c: '#F5A623', p: (s) => [Math.min(20, Object.keys(s.done).filter((k) => ALL_CARDS.some((c) => c.id === k)).length), 20] },
  { id: 'stories5', t: 'حبيب الحكايات', d: 'اسمع ٥ حكايات', ic: '📚', c: '#3FA9F5', p: (s) => [Math.min(5, Object.keys(STORIES).filter((k) => k in s.done).length), 5] },
  { id: 'adhkar7', t: 'صديق الأذكار', d: 'خلّص أذكار ٧ أيام', ic: '📿', c: '#2FB383', p: (s) => [Math.min(7, (s.zdays || []).length), 7] },
  { id: 'tasbih', t: 'المسبّح', d: 'سبّح ١٠٠٠ مرة', ic: '✨', c: '#E0A030', p: (s) => [Math.min(1000, s.tasbih || 0), 1000] },
  { id: 'streak7', t: 'أسبوع منوّر', d: '٧ أيام ورا بعض', ic: '🔥', c: '#FF7E6B', p: (s) => [Math.min(7, streakOf(s.days)), 7] },
  { id: 'duel', t: 'بطل التحدّي', d: 'العب تحدّي الأبطال ٣ مرات', ic: '⚡', c: '#7B5CE0', p: (s) => [Math.min(3, s.games?.duel || 0), 3] },
  { id: 'anbiya', t: 'صاحب الأنبياء', d: 'اقرا عن ٢٥ نبي', ic: '🌟', c: '#1F7FC9', p: (s) => [Math.min(25, s.games?.seen_anbiya_n || 0), 25] },
  { id: 'quiz', t: 'العالِم الصغير', d: 'خلّص ٥ مسابقات', ic: '🏆', c: '#C97B23', p: (s) => [Math.min(5, (s.games?.quiz || 0) + (s.games?.tf || 0) + (s.games?.riddle || 0)), 5] },
];
export const earned = (s) => BADGES.filter((b) => { const [a, t] = b.p(s); return a >= t; }).map((b) => b.id);
