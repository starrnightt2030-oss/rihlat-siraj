// فانوس رمضان: عدّاد لرمضان والعيد (بالتقويم الهجري أم القرى)، ومهام يومية صغيرة للطفل،
// وكل مهمة بتنوّر جزء من «فانوس الحسنات»، وأيام رمضان اللي نوّرت بتتسجّل
import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Sky from '../components/Sky';
import { Confetti } from '../components/Reward';
import { useStore } from '../store';
import { ar } from '../lib/asset';
import { sfx } from '../lib/sound';
import { say, hush, hubSay, leave } from '../lib/voice';
import { TASKS, RAMADAN_LINES } from '../data/ramadan.js';

const HF = (() => { try { return new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { day: 'numeric', month: 'numeric', year: 'numeric' }); } catch { return null; } })();
const hijri = (d) => { if (!HF) return null; const p = Object.fromEntries(HF.formatToParts(d).map((x) => [x.type, x.value])); return { d: +p.day, m: +p.month, y: parseInt(p.year, 10) }; };
const dayKey = (d) => d.toISOString().slice(0, 10);
// أقرب يوم (من النهارده) الشهر الهجري فيه m واليوم d
function nextHijri(m, d, from = new Date()) {
  let x = new Date(from); x.setHours(12, 0, 0, 0);
  for (let i = 0; i < 400; i++) { const h = hijri(x); if (h && h.m === m && h.d === d) return { date: new Date(x), days: i }; x = new Date(x.getTime() + 864e5); }
  return null;
}
function Lantern({ n, total }) {
  const f = n / total;
  return (
    <svg viewBox="0 0 120 170" width="150" height="212" aria-label={`الفانوس منوّر ${n} من ${total}`}>
      <defs>
        <radialGradient id="lglow" cx="50%" cy="55%" r="55%"><stop offset="0" stopColor="#FFF3B0" stopOpacity={0.3 + f * 0.7} /><stop offset="1" stopColor="#FFB84D" stopOpacity={0.15 + f * 0.5} /></radialGradient>
        <clipPath id="lbody"><path d="M30 52 L90 52 L100 120 Q60 136 20 120 Z" /></clipPath>
      </defs>
      <circle cx="60" cy="88" r={40 + f * 30} fill="#FFE07A" opacity={f * 0.35} />
      <path d="M60 4 v10" stroke="#B8862F" strokeWidth="4" strokeLinecap="round" /><circle cx="60" cy="6" r="5" fill="none" stroke="#B8862F" strokeWidth="3" />
      <path d="M38 30 Q60 10 82 30 L90 52 L30 52 Z" fill="#E8A53A" stroke="#9A6B1F" strokeWidth="3" />
      <path d="M30 52 L90 52 L100 120 Q60 136 20 120 Z" fill="#3B2F80" stroke="#9A6B1F" strokeWidth="3" />
      <g clipPath="url(#lbody)"><motion.rect x="0" width="120" fill="url(#lglow)" animate={{ y: 130 - f * 80, height: 20 + f * 80 }} transition={{ type: 'spring', stiffness: 60, damping: 14 }} /></g>
      {[44, 60, 76].map((x) => <path key={x} d={`M${x} 54 L${x + (x - 60) * 0.25} 124`} stroke="#9A6B1F" strokeWidth="2.5" />)}
      <path d="M20 120 Q60 136 100 120 L94 140 Q60 152 26 140 Z" fill="#E8A53A" stroke="#9A6B1F" strokeWidth="3" />
      <path d="M54 150 h12 l-6 14z" fill="#E8A53A" stroke="#9A6B1F" strokeWidth="2.5" />
    </svg>
  );
}

export default function Ramadan({ back, go }) {
  const today = useMemo(() => new Date(), []);
  const h = hijri(today), key = dayKey(today);
  const rdays = useStore((s) => s.rdays) || {}, setTask = useStore((s) => s.ramTask);
  const done = rdays[key] || [];
  const inRamadan = h?.m === 9, isEid = h?.m === 10 && h.d <= 3;
  const toR = !inRamadan ? nextHijri(9, 1) : null, toEid = nextHijri(10, 1);
  const lit = Object.values(rdays).filter((l) => l.length >= 4).length;
  useEffect(() => { hubSay(RAMADAN_LINES.intro); return () => leave(); }, []);
  const tap = (t) => {
    const on = !done.includes(t.id); setTask(key, t.id);
    if (on) { sfx.star(); if (done.length + 1 === TASKS.length) say(RAMADAN_LINES.full); } else sfx.tap();
  };
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone="warm" />
      {done.length === TASKS.length && <Confetti />}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button type="button" className="icon-btn" aria-label="رجوع" onClick={back}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22306A" strokeWidth="3" strokeLinecap="round"><path d="M9 5l7 7-7 7" /></svg></button>
        <h1 style={{ flex: 1, fontSize: 26, fontWeight: 800, color: '#B8437C' }}>فانوس رمضان</h1>
      </div>
      <div className="card" style={{ position: 'relative', padding: 14, textAlign: 'center', background: 'linear-gradient(135deg,#3B2F80,#6E4FD0)', color: '#fff' }}>
        {isEid ? <div style={{ fontSize: 26, fontWeight: 800 }}>🎉 عيد سعيد! كل سنة وانت طيب</div>
          : inRamadan ? (<><div style={{ fontSize: 15, fontWeight: 700, opacity: 0.9 }}>رمضان كريم 🌙</div><div style={{ fontSize: 30, fontWeight: 800 }}>اليوم {ar(h.d)} رمضان</div>{toEid && <div style={{ fontSize: 15, fontWeight: 700 }}>باقي {ar(toEid.days)} يوم على العيد</div>}</>)
          : toR ? (<><div style={{ fontSize: 15, fontWeight: 700, opacity: 0.9 }}>باقي على رمضان</div><div style={{ fontSize: 40, fontWeight: 800 }}>{ar(toR.days)} يوم</div><div style={{ fontSize: 14, fontWeight: 700, opacity: 0.9 }}>نستعد من دلوقتي ونتمرّن على المهام!</div></>)
          : <div style={{ fontSize: 20, fontWeight: 800 }}>أهلًا رمضان 🌙</div>}
      </div>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Lantern n={done.length} total={TASKS.length} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>فانوس الحسنات</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#6D7896' }}>نوّرت {ar(done.length)} من {ar(TASKS.length)} النهارده</div>
          <div style={{ marginTop: 8, fontSize: 14, fontWeight: 800, color: '#B8437C' }}>🏮 أيام نوّرت فيها الفانوس: {ar(lit)}</div>
        </div>
      </div>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {TASKS.map((t, k) => { const on = done.includes(t.id);
          return (
            <motion.button key={t.id} type="button" initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: k * 0.05 }} whileTap={{ scale: 0.97 }} onClick={() => tap(t)} className="card"
              style={{ border: on ? '3px solid #F5A623' : '3px solid transparent', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right', color: '#26336B', background: on ? '#FFF3D6' : '#fff' }}>
              <span style={{ fontSize: 30 }}>{t.e}</span>
              <span style={{ flex: 1, fontSize: 18, fontWeight: 800 }}>{t.t}</span>
              <span style={{ width: 34, height: 34, borderRadius: 17, display: 'grid', placeItems: 'center', background: on ? '#F5A623' : '#F1F3F8', color: '#fff', fontSize: 20, fontWeight: 800 }}>{on ? '✓' : ''}</span>
            </motion.button>
          ); })}
      </div>
      <button type="button" onClick={() => { sfx.pop(); go('unit', 'ramadan'); }} className="card" style={{ position: 'relative', border: 0, padding: 12, cursor: 'pointer', fontFamily: 'inherit', fontSize: 17, fontWeight: 800, color: '#B8437C', background: '#FFEAF2' }}>📚 دروس رمضان والعيد ◀</button>
    </div>
  );
}
