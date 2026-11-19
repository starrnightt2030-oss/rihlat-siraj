// كل الآيات اللي التطبيق بيشغّلها بصوت القرّاء
import { UNITS } from '../src/data/units.js';
import { STORIES } from '../src/data/stories.js';
import { ADHKAR } from '../src/data/adhkar.js';
const S = new Set();
for (const u of UNITS) for (const c of u.cards) for (const s of c.steps || []) {
  if (s.aud) S.add(s.aud);
  if (s.k === 'surah') s.verses.forEach((_, k) => S.add(s.sura + String(k + 1).padStart(3, '0')));
}
for (const st of Object.values(STORIES)) for (const sc of st.scenes) if (sc.aud) [].concat(sc.aud).forEach((a) => S.add(a));
for (const sec of ADHKAR) for (const d of sec.items) (d.aud || []).forEach((a) => S.add(a));
console.log([...S].sort().join(' '));
