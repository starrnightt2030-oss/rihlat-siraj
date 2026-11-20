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
import SyncSong, { Fill } from '../components/SyncSong';
import { HomeBtn } from '../components/ui';
import { ASMAA_SONGS } from '../data/asmaaSong';

const COLS = [['#1F8FA6', '#E3F6FA'], ['#7B5CE0', '#F1ECFF'], ['#2FB383', '#E3F7EE'], ['#E07F1E', '#FFF0DE'], ['#E0609E', '#FFEAF2'], ['#3A8FE0', '#E6F0FF']];

// أناشيد الأسماء: الاسم اللي بيتغنّى بيظهر كبير ومعاه معناه، والقايمة بتمشي معاه
function AsmaaSong({ song, back }) {
  const stage = (l, frac) => {
    if (!l || l.k === 'music') return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <motion.div animate={{ y: [0, -8, 0], rotate: [0, 6, -6, 0] }} transition={{ repeat: Infinity, duration: 1.6 }} style={{ fontSize: 46 }}>🎶</motion.div>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#136E80' }}>{song.t}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#6D7896' }}>اسمع وردّد الأسماء مع الأنشودة</div></div>;
    if (l.k === 'say') return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      {l.tag && <span style={{ fontSize: 13, fontWeight: 800, color: '#fff', background: '#2FB383', borderRadius: 12, padding: '2px 12px' }}>{l.tag}</span>}
      <Fill text={l.text} frac={frac} on="#136E80" off="#A9C9D0" style={{ fontSize: 'clamp(22px, 6.2vw, 28px)', fontWeight: 800, lineHeight: 1.7 }} /></div>;
    const a = ASMAA[l.n - 1], [c, bg] = COLS[a.k % COLS.length];
    return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 13, fontWeight: 800, color: c, background: bg, borderRadius: 12, padding: '2px 12px' }}>الاسم {ar(a.k)} من ٩٩</span>
      <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 14 }} className="ayah" style={{ fontSize: a.n.length > 9 ? 40 : 58, fontWeight: 700, color: c, lineHeight: 1.5 }}>{a.n}</motion.div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={{ fontSize: 17, fontWeight: 800, color: '#26336B', lineHeight: 1.6 }}>{a.m}</motion.div>
    </div>;
  };
  const row = (l, on) => {
    if (l.k === 'music') return <span style={{ fontSize: 14, fontWeight: 800, color: '#6D7896' }}>🎶 موسيقى</span>;
    if (l.k === 'say') return <span style={{ fontSize: 15, fontWeight: 800, color: '#136E80' }}>{l.tag ? '🎵 ' : ''}{l.text}</span>;
    const a = ASMAA[l.n - 1], [c] = COLS[a.k % COLS.length];
    return <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 30, fontSize: 12, fontWeight: 800, color: c, flexShrink: 0 }}>{ar(a.k)}</span>
      <span className="ayah" style={{ fontSize: 21, color: c, fontWeight: 700, minWidth: 92 }}>{a.n}</span>
      <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: on ? '#26336B' : '#6D7896', lineHeight: 1.5 }}>{a.m}</span>
    </span>;
  };
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone="mint" />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button type="button" className="icon-btn" aria-label="رجوع" onClick={back}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22306A" strokeWidth="3" strokeLinecap="round"><path d="M9 5l7 7-7 7" /></svg></button>
        <div style={{ flex: 1 }}><h1 style={{ fontSize: 22, fontWeight: 800, color: '#136E80' }}>🎵 {song.t}</h1><div style={{ fontSize: 13, fontWeight: 700, color: '#6D7896' }}>{song.d}</div></div>
        <HomeBtn />
      </div>
      <SyncSong src={`${import.meta.env.BASE_URL}audio/nasheed/${song.f}`} lines={song.lines} c="#136E80" bg="#E3F6FA" stage={stage} row={row} />
    </div>
  );
}

export default function Asmaa({ back, arg, go }) {
  const sg = ASMAA_SONGS.find((x) => x.id === arg);
  if (sg) return <AsmaaSong key={sg.id} song={sg} back={back} />;
  return <AsmaaGrid back={back} go={go} />;
}

function AsmaaGrid({ back, go }) {
  const seen = useStore((s) => s.asmaSeen) || [], see = useStore((s) => s.seeAsma);
  const [open, setOpen] = useState(null);
  useEffect(() => {
    hubSay(ASMAA_INTRO);
    return () => { hush(); };
  }, []);
  const show = (a) => { sfx.pop(); setOpen(a); see(a.k); say(asmaLine(a)); };
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
      <div className="card" style={{ position: 'relative', padding: 12, display: 'flex', flexDirection: 'column', gap: 10, background: 'linear-gradient(120deg,#136E80,#1F8FA6 60%,#2FB383)', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1 }}><div style={{ fontSize: 19, fontWeight: 800 }}>أناشيد أسماء الله الحسنى</div><div style={{ fontSize: 13, fontWeight: 700, opacity: 0.92 }}>اسمع وردّد، والأسماء بتظهر مع الغُنا</div></div>
          <div style={{ textAlign: 'center' }}><div style={{ fontSize: 22, fontWeight: 800 }}>{ar(seen.length)}</div><div style={{ fontSize: 11, fontWeight: 700 }}>من ٩٩</div></div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {ASMAA_SONGS.map((x) => <motion.button key={x.id} type="button" whileTap={{ scale: 0.95 }} onClick={() => { sfx.pop(); go('asmaa', x.id); }}
            style={{ flex: 1, border: 0, borderRadius: 16, padding: '10px 8px', background: '#fff', color: '#136E80', fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, textAlign: 'right' }}>
            <span style={{ width: 38, height: 38, borderRadius: 19, background: '#136E80', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 15, flexShrink: 0 }}>▶</span>
            <span><span style={{ display: 'block', fontSize: 15, fontWeight: 800 }}>{x.short}</span><span style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6D7896' }}>{x.sub}</span></span>
          </motion.button>)}
        </div>
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
