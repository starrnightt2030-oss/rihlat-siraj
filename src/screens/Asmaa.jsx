// أسماء الله الحسنى الـ٩٩: شبكة الأسماء، كل اسم بيفتح معناه بصوت سراج، وعدّاد «عرفت كام اسم»، وكارت نشيد الأسماء
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sky from '../components/Sky';
import Siraj from '../components/Siraj';
import { Btn, Icon, I } from '../components/ui';
import { ASMAA, asmaLine, ASMAA_INTRO } from '../data/asmaa';
import { useStore } from '../store';
import { ar } from '../lib/asset';
import { sfx } from '../lib/sound';
import { say, hush, hubSay } from '../lib/voice';

const COLS = [['#1F8FA6', '#E3F6FA'], ['#7B5CE0', '#F1ECFF'], ['#2FB383', '#E3F7EE'], ['#E07F1E', '#FFF0DE'], ['#E0609E', '#FFEAF2'], ['#3A8FE0', '#E6F0FF']];
const NASHEED = `${import.meta.env.BASE_URL}audio/nasheed/asmaa.mp3`;

export default function Asmaa({ back }) {
  const seen = useStore((s) => s.asmaSeen) || [], see = useStore((s) => s.seeAsma);
  const [open, setOpen] = useState(null);
  const [has, setHas] = useState(false), [playing, setPlaying] = useState(false);
  const au = useRef(null);
  useEffect(() => {
    hubSay(ASMAA_INTRO);
    fetch(NASHEED, { method: 'HEAD' }).then((r) => setHas(r.ok && !(r.headers.get('content-type') || '').includes('html'))).catch(() => {});
    return () => { hush(); au.current?.pause(); };
  }, []);
  const show = (a) => { sfx.pop(); au.current?.pause(); setPlaying(false); setOpen(a); see(a.k); say(asmaLine(a)); };
  const toggle = () => {
    if (!au.current) { au.current = new Audio(NASHEED); au.current.onended = () => setPlaying(false); }
    if (playing) { au.current.pause(); setPlaying(false); } else { hush(); au.current.play().catch(() => {}); setPlaying(true); }
  };
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone="mint" />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button type="button" className="icon-btn" aria-label="رجوع" onClick={back}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22306A" strokeWidth="3" strokeLinecap="round"><path d="M9 5l7 7-7 7" /></svg></button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 25, fontWeight: 800, color: '#136E80' }}>أسماء الله الحسنى</h1>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6D7896' }}>«إن لله تسعة وتسعين اسمًا، من أحصاها دخل الجنة»</div>
        </div>
      </div>
      <div className="card" style={{ position: 'relative', padding: 12, display: 'flex', alignItems: 'center', gap: 12, background: 'linear-gradient(120deg,#136E80,#1F8FA6 60%,#2FB383)', color: '#fff' }}>
        <button type="button" onClick={has ? toggle : undefined} aria-label="نشيد الأسماء" style={{ width: 58, height: 58, borderRadius: 29, border: 0, background: '#fff', color: '#136E80', display: 'grid', placeItems: 'center', cursor: has ? 'pointer' : 'default', flexShrink: 0, opacity: has ? 1 : 0.6 }}>
          <Icon d={playing ? I.pause : I.play} size={26} color="#136E80" />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 19, fontWeight: 800 }}>نشيد أسماء الله الحسنى</div>
          <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.92 }}>{has ? (playing ? 'شغّال… ردّد معاه' : 'اسمع وردّد الأسماء') : 'قريبًا إن شاء الله'}</div>
        </div>
        <div style={{ textAlign: 'center' }}><div style={{ fontSize: 22, fontWeight: 800 }}>{ar(seen.length)}</div><div style={{ fontSize: 11, fontWeight: 700 }}>من ٩٩</div></div>
      </div>
      <div className="progress" style={{ position: 'relative', height: 10 }}><i style={{ width: `${(seen.length / 99) * 100}%`, background: 'linear-gradient(90deg,#1F8FA6,#2FB383)' }} /></div>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 8 }}>
        {ASMAA.map((a) => { const [c, bg] = COLS[a.k % COLS.length], ok = seen.includes(a.k);
          return (
            <motion.button key={a.k} type="button" whileTap={{ scale: 0.92 }} onClick={() => show(a)} className="card"
              style={{ position: 'relative', border: ok ? `3px solid ${c}` : '3px solid transparent', padding: '10px 4px 8px', background: bg, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minHeight: 84 }}>
              <span style={{ position: 'absolute', top: 4, right: 8, fontSize: 11, fontWeight: 800, color: c }}>{ar(a.k)}</span>
              {ok && <span style={{ position: 'absolute', top: 4, left: 8, fontSize: 12, color: c }}>✓</span>}
              <span className="ayah" style={{ fontSize: a.n.length > 9 ? 17 : 24, fontWeight: 700, color: c, lineHeight: 1.6, textAlign: 'center' }}>{a.n}</span>
            </motion.button>
          ); })}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div key="sheet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { hush(); setOpen(null); }}
            style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(20,30,70,.45)', display: 'flex', alignItems: 'flex-end' }}>
            <motion.div initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }} onClick={(e) => e.stopPropagation()}
              style={{ width: '100%', background: '#fff', borderRadius: '30px 30px 0 0', padding: '20px 18px calc(var(--safe-bottom) + 18px)', textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: COLS[open.k % COLS.length][0] }}>الاسم {ar(open.k)} من ٩٩</div>
              <div className="ayah" style={{ fontSize: 52, fontWeight: 700, color: COLS[open.k % COLS.length][0], lineHeight: 1.6 }}>{open.n}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, textAlign: 'right', margin: '6px 0 14px' }}>
                <Siraj pose="wave" size={70} />
                <div style={{ flex: 1, fontSize: 21, fontWeight: 800, color: '#26336B', lineHeight: 1.5 }}>{open.m}</div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Btn tone="white" onClick={() => say(asmaLine(open))}>🔊 اسمع</Btn>
                <Btn className="block" sound="pop" onClick={() => { const nx = ASMAA[open.k % 99]; show(nx); }}>الاسم اللي بعده ◀</Btn>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
