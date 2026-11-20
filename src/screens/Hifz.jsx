// وضع التحفيظ: يختار الطفل سورة من جزء عمّ (والفاتحة)، الشيخ يقرا كل آية والطفل يعيد وراه بعدد مرات يختاره،
// وبعدين «اختبر نفسك»: الآيات تستخبى والطفل يسمّع، و«حفظتها» بتتسجل لولي الأمر
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Sky from '../components/Sky';
import { Confetti } from '../components/Reward';
import Q30 from '../data/quran30.json';
import { reciterById, ayahUrl } from '../data/reciters';
import { useStore } from '../store';
import { ar } from '../lib/asset';
import { sfx } from '../lib/sound';
import { say, hush, hubSay } from '../lib/voice';

const BASE = import.meta.env.BASE_URL;
const SURAS = Object.keys(Q30).map(Number).sort((a, b) => (a === 1 ? -1 : b === 1 ? 1 : b - a)); // الفاتحة ثم الناس ← النبأ
export const HIFZ_INTRO = 'يلا نحفظ! اختار سورة، والشيخ هيقرا كل آية وانت تعيد وراه.';
export const HIFZ_TURN = 'دورك! قول الآية ورا الشيخ.';
export const HIFZ_DONE = 'ما شاء الله! حفظت السورة.';
const Back = ({ onClick }) => (
  <button type="button" className="icon-btn" aria-label="رجوع" onClick={onClick}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22306A" strokeWidth="3" strokeLinecap="round"><path d="M9 5l7 7-7 7" /></svg></button>
);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
function playOnce(url, run, my) {
  return new Promise((res) => {
    const a = new Audio(url); run.cur = a;
    a.onended = () => res(a.duration || 4); a.onerror = () => res(0);
    if (run.n !== my) return res(0);
    a.play().catch(() => res(0));
  });
}

function Surah({ s, back }) {
  const st = useStore((x) => x.settings), done = useStore((x) => x.hifz) || [], mark = useStore((x) => x.hifzToggle);
  const ayat = Q30[s].ayat;
  const [reps, setReps] = useState(3), [on, setOn] = useState(-1), [turn, setTurn] = useState(false), [hide, setHide] = useState(false), [party, setParty] = useState(false);
  const run = useRef({ n: 0, cur: null });
  const stop = () => { run.current.n++; try { run.current.cur?.pause(); } catch (e) {} setOn(-1); setTurn(false); };
  useEffect(() => () => { stop(); hush(); }, []);
  const r = reciterById(st.reciter);
  const code = (k) => String(s).padStart(3, '0') + String(k + 1).padStart(3, '0');
  const start = async (from = 0) => {
    stop(); hush(); const my = ++run.current.n;
    for (let k = from; k < ayat.length; k++) {
      for (let t = 0; t < reps; t++) {
        if (run.current.n !== my) return;
        setOn(k); setTurn(false);
        const d = await playOnce(ayahUrl(r, code(k), BASE), run.current, my);
        if (run.current.n !== my) return;
        setTurn(true); await wait(Math.max(2500, d * 1100)); // وقت الطفل يعيد
      }
    }
    if (run.current.n === my) { setOn(-1); setTurn(false); }
  };
  const ok = done.includes(s);
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone="mint" />
      {party && <Confetti />}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Back onClick={back} />
        <div style={{ flex: 1 }}><h1 style={{ fontSize: 24, fontWeight: 800, color: '#1F8A61' }}>سورة {Q30[s].name}</h1><div style={{ fontSize: 13, fontWeight: 700, color: '#6D7896' }}>{ar(ayat.length)} آيات • بصوت {r.name}</div></div>
      </div>
      <div className="card" style={{ position: 'relative', padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', fontWeight: 800 }}>
          <span>كرّر كل آية:</span>
          {[1, 3, 5].map((n) => <button key={n} type="button" onClick={() => setReps(n)} style={{ borderRadius: 12, padding: '6px 14px', border: 0, background: reps === n ? '#2FB383' : '#E3F7EE', color: reps === n ? '#fff' : '#1F8A61', fontFamily: 'inherit', fontWeight: 800, cursor: 'pointer' }}>{n === 1 ? 'مرة' : `${ar(n)} مرات`}</button>)}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {on < 0 ? <button type="button" onClick={() => start(0)} style={{ flex: 2, borderRadius: 16, padding: 12, border: 0, background: '#2FB383', color: '#fff', fontFamily: 'inherit', fontSize: 17, fontWeight: 800, cursor: 'pointer' }}>▶ ابدأ التحفيظ</button>
            : <button type="button" onClick={stop} style={{ flex: 2, borderRadius: 16, padding: 12, border: 0, background: '#E5484D', color: '#fff', fontFamily: 'inherit', fontSize: 17, fontWeight: 800, cursor: 'pointer' }}>■ وقّف</button>}
          <button type="button" onClick={() => { setHide(!hide); if (!hide) say('اختبر نفسك! قول الآيات من حفظك.'); }} style={{ flex: 1, borderRadius: 16, padding: 10, border: '3px solid #2FB383', background: hide ? '#E3F7EE' : '#fff', color: '#1F8A61', fontFamily: 'inherit', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>{hide ? '👁 اظهر الآيات' : '🙈 اختبر نفسك'}</button>
        </div>
      </div>
      {turn && <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card" style={{ position: 'relative', padding: 10, textAlign: 'center', fontSize: 18, fontWeight: 800, background: '#FFF3D6', color: '#B07A12' }}>🎤 دورك! قول الآية ورا الشيخ</motion.div>}
      <div className="card" style={{ position: 'relative', padding: 12, display: 'flex', flexDirection: 'column', gap: 6, background: '#FFFDF5' }}>
        {ayat.map((t, k) => (
          <motion.button key={k} type="button" onClick={() => start(k)} animate={{ background: on === k ? '#E3F7EE' : 'rgba(0,0,0,0)' }}
            style={{ border: 0, borderRadius: 12, padding: '4px 8px', cursor: 'pointer', textAlign: 'right', fontFamily: 'inherit' }}>
            <span className="hafs" dir="rtl" style={{ fontSize: 24, color: '#26336B', filter: hide && on !== k ? 'blur(7px)' : 'none', transition: 'filter .3s' }}>{t} <span style={{ color: '#2FB383', fontSize: 18 }}>﴿{ar(k + 1)}﴾</span></span>
          </motion.button>
        ))}
      </div>
      <button type="button" onClick={() => { mark(s); if (!ok) { setParty(true); sfx.star(); say(HIFZ_DONE); } }} style={{ position: 'relative', borderRadius: 18, padding: 14, border: ok ? 0 : '3px solid #2FB383', background: ok ? '#2FB383' : '#fff', color: ok ? '#fff' : '#1F8A61', fontFamily: 'inherit', fontSize: 17, fontWeight: 800, cursor: 'pointer' }}>{ok ? '✓ حفظتها' : '⭐ حفظت السورة'}</button>
    </div>
  );
}

export default function Hifz({ arg, back, go }) {
  const done = useStore((x) => x.hifz) || [];
  useEffect(() => { if (!arg) hubSay(HIFZ_INTRO, true); return () => hush(); }, [arg]);
  if (arg && Q30[arg]) return <Surah key={arg} s={+arg} back={() => go('hifz')} />;
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone="mint" />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Back onClick={back} />
        <div style={{ flex: 1 }}><h1 style={{ fontSize: 25, fontWeight: 800, color: '#1F8A61' }}>حفّظني</h1><div style={{ fontSize: 13, fontWeight: 700, color: '#6D7896' }}>الشيخ يقرا وانت تعيد وراه</div></div>
        <div style={{ textAlign: 'center' }}><div style={{ fontSize: 22, fontWeight: 800, color: '#1F8A61' }}>{ar(done.length)}</div><div style={{ fontSize: 11, fontWeight: 700 }}>من {ar(SURAS.length)}</div></div>
      </div>
      <div className="progress" style={{ position: 'relative', height: 10 }}><i style={{ width: `${(done.length / SURAS.length) * 100}%`, background: 'linear-gradient(90deg,#2FB383,#1F8A61)' }} /></div>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 8 }}>
        {SURAS.map((s) => { const ok = done.includes(s);
          return (
            <motion.button key={s} type="button" whileTap={{ scale: 0.93 }} onClick={() => { sfx.pop(); go('hifz', String(s)); }} className="card"
              style={{ border: ok ? '3px solid #2FB383' : '3px solid transparent', background: ok ? '#E3F7EE' : '#fff', padding: '8px 4px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, minHeight: 74 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#6D7896' }}>{ok ? '✓ ' : ''}{ar(s)}</span>
              <span className="hafs" style={{ fontSize: 20, color: '#1F8A61', lineHeight: 1.8 }}>{Q30[s].name}</span>
            </motion.button>
          ); })}
      </div>
    </div>
  );
}
