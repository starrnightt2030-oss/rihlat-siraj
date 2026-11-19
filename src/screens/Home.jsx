// الشاشة الرئيسية: كروت لكل المحتوى — «رحلتي» مسار مرتّب، والباقي الطفل يدخله بحرّية
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { syncReminders } from '../lib/remind';
import { today } from '../data/gifts';
import Sky from '../components/Sky';
import { StarsChip, LightChip, Icon, I } from '../components/ui';
import DIcon from '../art/Icons';
import Scene from '../art/Scenes';
import { BUDDY } from '../components/Siraj';
import { ALL_CARDS, nextCard, unitById } from '../data/units';
import { useStore } from '../store';
import { A, ar } from '../lib/asset';
import { sfx } from '../lib/sound';
import { hubSay, hush } from '../lib/voice';
import { HUB } from '../data/speech';

// الأقسام: كل قسم بيفتح مجموعة وحدات، أو شاشة خاصة
export const SECTIONS = [
  { id: 'salah', t: 'صلاتي ووضوئي', d: 'خطوة بخطوة بالصور', c: '#4A8FE0', bg: '#E6F0FF', art: { scene: 'salah' }, units: ['tahara', 'salah'] },
  { id: 'quran', t: 'قرآني', d: 'سور قصيرة وقرّاء', c: '#9B7BF2', bg: '#F1ECFF', art: { scene: 'books' }, units: ['quran'] },
  { id: 'stories', t: 'الحكايات', d: 'قصص الأنبياء والقرآن', c: '#3FA9F5', bg: '#E3F2FF', img: 'stickers/whale', go: ['stories'] },
  { id: 'anbiya25', t: 'الأنبياء الـ٢٥', d: 'كل نبي وحكايته ودرسه', c: '#1F7FC9', bg: '#E3F2FF', ic: 'star', emoji: '🕋', go: ['anbiya25'] },
  { id: 'sahaba', t: 'الصحابة الكرام', d: 'أصحاب النبي ﷺ', c: '#1F8A61', bg: '#E3F7EE', emoji: '🌟', go: ['sahaba'] },
  { id: 'adhkar', t: 'أذكاري', d: 'الصباح والمساء والنوم', c: '#2FB383', bg: '#E3F7EE', ic: 'tasbih', go: ['adhkar'] },
  { id: 'aqida', t: 'عقيدتي', d: 'ربي وأركان الإيمان', c: '#7B5CE0', bg: '#F1ECFF', art: { scene: 'allah' }, units: ['rabbi', 'khalq', 'iman', 'malaika', 'janna', 'asmaa'] },
  { id: 'islam', t: 'أركان الإسلام', d: 'خمس أعمدة لديني', c: '#1F8A61', bg: '#E3F7EE', art: { scene: 'hajj' }, units: ['arkan', 'ramadan'] },
  { id: 'akhlaq', t: 'أخلاقي وآدابي', d: 'أكون طيب مع الناس', c: '#FF7E6B', bg: '#FFEDE8', img: 'characters/sparks/amana', units: ['akhlaq', 'adab', 'adhkar'] },
  { id: 'games', t: 'الألعاب والمسابقات', d: 'تحدّي وألغاز وذاكرة', c: '#F5A623', bg: '#FFF3D6', ic: 'star', go: ['games'] },
];

export default function Home({ go }) {
  const done = useStore((s) => s.done), profile = useStore((s) => s.profile);
  const n = ALL_CARDS.filter((c) => c.id in done).length, next = nextCard(done);
  const pct = n / ALL_CARDS.length;
  const h = new Date().getHours();
  const hi = h >= 4 && h < 12 ? 'صباح النور' : h < 17 ? 'نهارك سعيد' : 'مساء النور';
  const visit = useStore((st) => st.visit);
  useEffect(() => { visit(today()); syncReminders(); hubSay(HUB.home[profile?.gender === 'girl' ? 'girl' : 'boy'], true); return () => hush(); }, []);
  const open = (s) => { sfx.pop(); if (s.go) go(...s.go); else go('sec', s.id); };
  return (
    <div className="screen with-nav" style={{ gap: 12 }}>
      <Sky />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src={A(BUDDY[profile?.buddy || 'siraj'].face)} alt="" style={{ width: 54, height: 54, borderRadius: 27, background: '#fff', objectFit: 'contain', boxShadow: '0 4px 0 #E8E0D0' }} />
        <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: '#5D6CA0' }}>{hi}</div><div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.1 }}>يا {profile?.name}</div></div>
        <LightChip /><StarsChip />
        <button type="button" onClick={() => { sfx.tap(); go('parent'); }} aria-label="ركن ولي الأمر" style={{ width: 46, height: 46, flexShrink: 0, borderRadius: 23, border: 0, cursor: 'pointer', background: '#fff', color: '#5D6CA0', display: 'grid', placeItems: 'center', boxShadow: '0 4px 0 #E8E0D0' }}><Icon d={I.gear} size={24} color="#5D6CA0" /></button>
      </div>

      <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => { sfx.pop(); go('island'); }} className="card"
        style={{ position: 'relative', border: 0, padding: 14, cursor: 'pointer', fontFamily: 'inherit', color: '#fff', textAlign: 'right', background: 'linear-gradient(135deg, #FFB627, #FF8A3C)', boxShadow: '0 7px 0 #D9822A, 0 16px 30px #FF8A3C55', display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden', flexShrink: 0 }}>
        <img src={A('characters/siraj/point')} alt="" style={{ width: 92, height: 100, objectFit: 'contain', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 26, fontWeight: 800 }}>رحلتي</div>
          <div style={{ fontSize: 14, fontWeight: 700, opacity: 0.95, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{next ? 'الجاي: ' + next.title : 'ما شاء الله! خلّصت الرحلة كلها'}</div>
          <div style={{ height: 12, borderRadius: 6, background: '#ffffff55', marginTop: 8, overflow: 'hidden' }}><motion.i initial={{ width: 0 }} animate={{ width: `${pct * 100}%` }} transition={{ duration: 0.8 }} style={{ display: 'block', height: '100%', borderRadius: 6, background: '#fff' }} /></div>
          <div style={{ fontSize: 12, fontWeight: 800, marginTop: 3 }}><bdi>{ar(n)}</bdi> من <bdi>{ar(ALL_CARDS.length)}</bdi> كارت</div>
        </div>
        <span style={{ width: 50, height: 50, borderRadius: 25, background: '#fff', color: '#E07F1E', display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: 22 }}>◀</span>
      </motion.button>

      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 }}>
        {SECTIONS.map((s, k) => (
          <motion.button key={s.id} type="button" initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 * k }} whileTap={{ scale: 0.95 }} onClick={() => open(s)} className="card"
            style={{ position: 'relative', border: `3px solid #fff`, padding: 0, cursor: 'pointer', fontFamily: 'inherit', color: '#26336B', textAlign: 'right', overflow: 'hidden', background: s.bg, boxShadow: `0 6px 0 ${s.c}44`, display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: 96, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
              {s.art ? <div style={{ width: 118, borderRadius: 16, overflow: 'hidden' }}><Scene id={s.art.scene} g={profile?.gender === 'girl' ? 'girl' : 'boy'} /></div> : s.img ? <img src={A(s.img)} alt="" style={{ height: 86, objectFit: 'contain' }} /> : s.emoji ? <div style={{ display: 'flex', gap: 2, fontSize: 34 }}>{(s.id === 'anbiya25' ? ['🚢', '🔥', '🌊', '🐋'] : ['⛰️', '⚖️', '📖', '🕌']).map((e, k) => <span key={k} style={{ width: 46, height: 46, borderRadius: 23, background: '#fff', display: 'grid', placeItems: 'center', fontSize: 24, marginInlineStart: k ? -10 : 0, boxShadow: '0 2px 0 #0001' }}>{e}</span>)}</div> : <DIcon id={s.ic} size={78} />}
            </div>
            <div style={{ padding: '6px 10px 10px', background: '#fff' }}>
              <div style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.2, color: s.c }}>{s.t}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#6D7896' }}>{s.d}</div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* ركن ولي الأمر: باين وواضح في آخر الصفحة */}
      <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => { sfx.tap(); go('parent'); }} className="card"
        style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12, border: '2px dashed #B9C6E4', padding: '12px 14px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right', background: '#F7F9FF', color: '#26336B' }}>
        <span style={{ width: 52, height: 52, borderRadius: 16, background: '#5D6CA0', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon d={I.lock} size={26} color="#fff" /></span>
        <span style={{ flex: 1 }}>
          <span style={{ display: 'block', fontSize: 18, fontWeight: 800 }}>ركن ولي الأمر</span>
          <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#6D7896' }}>الإعدادات والتقدّم والتذكير والقارئ وسرعة الصوت</span>
        </span>
        <span style={{ fontSize: 20, color: '#5D6CA0' }}>◀</span>
      </motion.button>
    </div>
  );
}

// شاشة القسم: وحدات القسم كروت مرقّمة
export function Section({ arg, go, back }) {
  const s = SECTIONS.find((x) => x.id === arg) || SECTIONS[0];
  const done = useStore((st) => st.done);
  useEffect(() => { hubSay(HUB.sec[s.id]); return () => hush(); }, [s.id]);
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button type="button" className="icon-btn" aria-label="رجوع" onClick={back}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22306A" strokeWidth="3" strokeLinecap="round"><path d="M9 5l7 7-7 7" /></svg></button>
        <h1 style={{ flex: 1, fontSize: 26, fontWeight: 800, color: s.c }}>{s.t}</h1>
      </div>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {s.units.map((id, k) => {
          const u = unitById(id); const n = u.cards.filter((c) => c.id in done).length;
          return (
            <motion.button key={id} type="button" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: k * 0.06 }} whileTap={{ scale: 0.97 }} onClick={() => { sfx.pop(); go('unit', id); }} className="card"
              style={{ border: 0, padding: 12, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right', color: '#26336B', background: u.soft, boxShadow: `0 5px 0 ${u.color}55` }}>
              <span className="num" style={{ '--c': u.color }}>{ar(k + 1)}</span>
              <img src={A(u.icon)} alt="" style={{ width: 62, height: 62, borderRadius: 18, objectFit: 'cover', background: '#fff' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{u.title}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: u.dark }}>{u.sub}</div>
                <div className="progress" style={{ height: 8, marginTop: 6 }}><i style={{ width: `${(n / u.cards.length) * 100}%`, background: u.color }} /></div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: u.dark }}><bdi>{ar(n)}</bdi>/<bdi>{ar(u.cards.length)}</bdi></span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
