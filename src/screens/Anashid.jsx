// تاب «أناشيدي»: قايمة الأناشيد بالأقسام، وكل أنشودة ليها مشغّل ومسرح متحرك.
// المسرح بيحلّل صوت الأنشودة وهي شغالة ويحرّك المشهد معاها (Stage.jsx)، من غير أي توقيت يدوي.
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Sky from '../components/Sky';
import { HomeBtn } from '../components/ui';
import Stage from '../components/Stage';
import { SONGS, CATS, BOARDS } from '../data/anashid';
import { ar } from '../lib/asset';
import { sfx } from '../lib/sound';
import { hush } from '../lib/voice';

const BASE = import.meta.env.BASE_URL;
const clock = (s) => { s = Math.max(0, Math.floor(s || 0)); return ar(Math.floor(s / 60)) + ':' + ar(String(s % 60).padStart(2, '0')); };
const Back = ({ onClick }) => (
  <button type="button" className="icon-btn" aria-label="رجوع" onClick={onClick}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22306A" strokeWidth="3" strokeLinecap="round"><path d="M9 5l7 7-7 7" /></svg></button>
);
const round = (bg, fg, extra) => ({ border: 0, borderRadius: 999, background: bg, color: fg, fontFamily: 'inherit', fontWeight: 800, cursor: 'pointer', display: 'grid', placeItems: 'center', ...extra });

function List({ go, back }) {
  useEffect(() => { hush(); }, []);
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone="warm" />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Back onClick={back} />
        <div style={{ flex: 1 }}><h1 style={{ fontSize: 25, fontWeight: 800, color: '#B8437C' }}>🎵 أناشيدي</h1><div style={{ fontSize: 13, fontWeight: 700, color: '#6D7896' }}>{ar(SONGS.length)} أنشودة • اسمع وغنّي واتعلّم</div></div>
        <HomeBtn />
      </div>
      {CATS.map((c) => (
        <div key={c.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#26336B' }}>{c.e} {c.t}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 }}>
            {SONGS.filter((s) => s.cat === c.id).map((s, k) => (
              <motion.button key={s.id} type="button" whileTap={{ scale: 0.94 }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(k, 8) * 0.04 }}
                onClick={() => { sfx.pop(); go('anashid', s.id); }} className="card"
                style={{ border: 0, padding: 10, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 70, height: 70, borderRadius: 35, display: 'grid', placeItems: 'center', fontSize: 38, background: `radial-gradient(circle at 35% 30%, #fff, ${s.bg} 55%, ${s.c}55)`, boxShadow: `0 4px 0 ${s.c}44` }}>{s.e}</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#26336B', lineHeight: 1.3 }}>{s.t}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: s.c }}>⏱ {clock(s.d)}</span>
              </motion.button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Player({ s, go, back }) {
  const cards = BOARDS[s.cards];
  const list = SONGS.filter((x) => x.cat === s.cat), at = list.findIndex((x) => x.id === s.id);
  const nextSong = list[at + 1] || list[0], prevSong = list[at - 1] || list[list.length - 1];
  const [el, setEl] = useState(null);
  const [t, setT] = useState(0), [dur, setDur] = useState(s.d), [on, setOn] = useState(false), [rep, setRep] = useState(false), [pop, setPop] = useState(null);
  const repRef = useRef(rep); repRef.current = rep;
  useEffect(() => {
    hush();
    const a = new Audio(`${BASE}audio/anashid/${s.id}.mp3`); setEl(a);
    a.onloadedmetadata = () => setDur(a.duration || s.d);
    a.onplay = () => setOn(true); a.onpause = () => setOn(false);
    a.onended = () => { setOn(false); if (repRef.current) { a.currentTime = 0; a.play().catch(() => {}); } };
    const iv = setInterval(() => setT(a.currentTime), 250);
    a.play().catch(() => {});
    return () => { clearInterval(iv); a.pause(); a.src = ''; };
  }, [s.id]);
  const toggle = () => { if (!el) return; sfx.tap(); if (el.paused) el.play().catch(() => {}); else el.pause(); };
  const seek = (v) => { if (!el) return; el.currentTime = Math.max(0, Math.min(dur - 0.2, v)); setT(el.currentTime); };
  const tapCard = (k) => { sfx.pop(); setPop(k); setTimeout(() => setPop((p) => (p === k ? null : p)), 700); };
  const pct = dur ? Math.min(100, (t / dur) * 100) : 0;

  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone="warm" />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Back onClick={back} />
        <div style={{ flex: 1, textAlign: 'center' }}><h1 style={{ fontSize: 22, fontWeight: 800, color: s.c, lineHeight: 1.25 }}>{s.e} {s.t}</h1></div>
        <HomeBtn />
      </div>

      <div style={{ position: 'relative' }}>
        {el && <Stage audio={el} theme={s.cards} words={cards} color={s.c} bpm={s.bpm} height="min(68vw, 360px)" />}
        {!on && <motion.button type="button" onClick={toggle} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} aria-label="شغّل"
          style={{ position: 'absolute', inset: 0, margin: 'auto', width: 88, height: 88, borderRadius: 44, border: '5px solid #fff', background: s.c + 'E6', color: '#fff', fontSize: 38, cursor: 'pointer', boxShadow: '0 10px 30px #0004' }}>▶</motion.button>}
      </div>

      <div className="card" style={{ position: 'relative', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10, background: '#fff' }}>
        <div style={{ position: 'relative', height: 26, direction: 'ltr', cursor: 'pointer' }} onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); seek(((e.clientX - r.left) / r.width) * dur); }}>
          <div style={{ position: 'absolute', top: 9, left: 0, right: 0, height: 8, borderRadius: 4, background: s.bg }} />
          <div style={{ position: 'absolute', top: 9, left: 0, width: pct + '%', height: 8, borderRadius: 4, background: `linear-gradient(90deg, ${s.c}, #FFB627)` }} />
          <motion.div animate={{ scale: on ? [1, 1.15, 1] : 1 }} transition={{ repeat: on ? Infinity : 0, duration: 60 / (s.bpm || 110) }}
            style={{ position: 'absolute', top: 1, left: `calc(${pct}% - 12px)`, width: 24, height: 24, borderRadius: 12, background: '#fff', border: `4px solid ${s.c}`, boxShadow: '0 2px 6px #0003' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 800, color: '#6D7896', direction: 'ltr', marginTop: -6 }}><span>{clock(t)}</span><span>{clock(dur)}</span></div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <button type="button" aria-label="كرّر الأنشودة" onClick={() => { sfx.tap(); setRep(!rep); }} style={round(rep ? s.c : s.bg, rep ? '#fff' : s.c, { width: 44, height: 44, fontSize: 18 })}>🔁</button>
          <button type="button" aria-label="الأنشودة اللي بعدها" onClick={() => go('anashid', nextSong.id)} style={round(s.bg, s.c, { width: 50, height: 50, fontSize: 18 })}>⏭</button>
          <motion.button type="button" whileTap={{ scale: 0.9 }} aria-label={on ? 'وقّف' : 'شغّل'} onClick={toggle} style={round(s.c, '#fff', { width: 74, height: 74, fontSize: 30, boxShadow: `0 6px 0 ${s.c}88` })}>{on ? '❚❚' : '▶'}</motion.button>
          <button type="button" aria-label="الأنشودة اللي قبلها" onClick={() => go('anashid', prevSong.id)} style={round(s.bg, s.c, { width: 50, height: 50, fontSize: 18 })}>⏮</button>
          <button type="button" aria-label="رجّع ١٠ ثواني" onClick={() => seek(t - 10)} style={round(s.bg, s.c, { width: 44, height: 44, fontSize: 13 })}>١٠↺</button>
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#26336B', marginBottom: 6 }}>✨ اتعلّم مع الأنشودة: {s.bt}</div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '4px 2px 8px', scrollbarWidth: 'none' }}>
          {cards.map(([e, w], k) => (
            <motion.button key={k} type="button" onClick={() => tapCard(k)} animate={pop === k ? { scale: [1, 1.25, 1], rotate: [0, -8, 8, 0] } : { scale: 1 }} transition={{ duration: 0.5 }}
              style={{ flex: '0 0 auto', minWidth: 74, border: 0, borderRadius: 20, padding: '10px 8px', cursor: 'pointer', fontFamily: 'inherit', background: `linear-gradient(160deg, #fff, ${s.bg})`, boxShadow: `0 4px 0 ${s.c}33`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <span style={{ fontSize: w ? 30 : 34, lineHeight: 1.15, fontWeight: 800, color: s.c }}>{e}</span>
              {w && <span style={{ fontSize: 13, fontWeight: 800, color: '#26336B', whiteSpace: 'nowrap' }}>{w}</span>}
            </motion.button>
          ))}
        </div>
      </div>
      <div style={{ position: 'relative', textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#A3AAC0' }}>الأنشودة من قناة {s.by}</div>
    </div>
  );
}

export default function Anashid({ arg, go, back }) {
  const s = SONGS.find((x) => x.id === arg);
  return s ? <Player key={s.id} s={s} go={go} back={back} /> : <List go={go} back={back} />;
}
