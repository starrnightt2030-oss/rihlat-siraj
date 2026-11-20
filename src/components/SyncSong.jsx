// مشغّل الأناشيد بالكلام المتزامن (زي الكاريوكي): الكلام اللي بيتغنّى بيظهر كبير وكلماته بتنوّر واحدة واحدة مع الصوت،
// وتحته قايمة بكل المقاطع، دوس على أي مقطع يروح له، و«كرّر» بيعيد المقطع لحد ما الطفل يحفظه، و«بالراحة» بيبطّأ الصوت.
// lines: [{ s, e, g, text, ... }]  — s/e بالثواني، g = رقم المجموعة (البيت أو الاسم) اللي بتتعرض كسطر واحد في القايمة
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { hush } from '../lib/voice';
import { ar } from '../lib/asset';

const fmt = (t) => { t = Math.max(0, Math.floor(t)); return ar(Math.floor(t / 60)) + ':' + ar(String(t % 60).padStart(2, '0')); };

// الكلمات بتنوّر بالتدريج مع تقدّم الغُنا في السطر
export function Fill({ text, frac, on = '#1F8A61', off = '#9AA3BD', style }) {
  const w = text.split(/\s+/).filter(Boolean);
  const lit = frac <= 0 ? 0 : Math.min(w.length, Math.ceil(frac * w.length + 0.15));
  return (
    <span style={style}>
      {w.map((x, i) => (
        <motion.span key={i} animate={{ color: i < lit ? on : off, scale: i === lit - 1 && frac < 1 ? 1.08 : 1 }} transition={{ duration: 0.25 }} style={{ display: 'inline-block', marginInlineEnd: '0.28em' }}>{x}</motion.span>
      ))}
    </span>
  );
}

export default function SyncSong({ src, lines, c = '#1F8A61', bg = '#E3F7EE', start = 0, stage, row, autoplay = true }) {
  const au = useRef(null), raf = useRef(0), listRef = useRef(null), rowRefs = useRef({});
  const [t, setT] = useState(0), [dur, setDur] = useState(0), [playing, setPlaying] = useState(false), [loop, setLoop] = useState(false), [slow, setSlow] = useState(false), [err, setErr] = useState(false);
  const groups = useMemo(() => { const m = new Map(); lines.forEach((l, i) => { if (!m.has(l.g)) m.set(l.g, { g: l.g, first: i, last: i, s: l.s, e: l.e }); const x = m.get(l.g); x.last = i; x.e = l.e; }); return [...m.values()]; }, [lines]);
  let idx = -1; for (let i = 0; i < lines.length; i++) { if (lines[i].s <= t + 0.05) idx = i; else break; }
  const cur = idx >= 0 ? lines[idx] : null;
  const frac = cur ? Math.min(1, Math.max(0, (t - cur.s) / Math.max(0.5, cur.e - cur.s))) : 0;
  const grp = cur ? groups.find((x) => x.g === cur.g) : null;
  const loopRef = useRef(null); loopRef.current = loop && grp ? grp : null;

  useEffect(() => {
    const a = new Audio(src); a.preload = 'auto'; au.current = a;
    a.onloadedmetadata = () => setDur(a.duration || 0);
    a.onplay = () => setPlaying(true); a.onpause = () => setPlaying(false); a.onended = () => setPlaying(false); a.onerror = () => setErr(true);
    if (start) a.currentTime = start;
    const tick = () => {
      const L = loopRef.current;
      if (L && a.currentTime > L.e + 0.35) a.currentTime = Math.max(0, L.s - 0.15);
      setT(a.currentTime); raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    if (autoplay) { hush(); const p = setTimeout(() => a.play().catch(() => {}), 350); return () => { clearTimeout(p); cancelAnimationFrame(raf.current); a.pause(); a.src = ''; }; }
    return () => { cancelAnimationFrame(raf.current); a.pause(); a.src = ''; };
  }, [src]);
  useEffect(() => { if (au.current) { au.current.playbackRate = slow ? 0.8 : 1; au.current.preservesPitch = true; } }, [slow]);
  // القايمة بتنزل لوحدها على المقطع اللي بيتغنّى
  useEffect(() => {
    const el = grp && rowRefs.current[grp.g], box = listRef.current;
    if (el && box) box.scrollTo({ top: el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2, behavior: 'smooth' });
  }, [grp?.g]);

  const toggle = () => { const a = au.current; if (!a) return; if (a.paused) { hush(); a.play().catch(() => {}); } else a.pause(); };
  const seek = (s) => { const a = au.current; if (!a) return; a.currentTime = Math.max(0, s - 0.15); setT(a.currentTime); if (a.paused) { hush(); a.play().catch(() => {}); } };
  const pill = (on) => ({ border: 0, borderRadius: 14, padding: '8px 12px', fontFamily: 'inherit', fontSize: 14, fontWeight: 800, cursor: 'pointer', background: on ? c : '#fff', color: on ? '#fff' : c, boxShadow: '0 3px 0 rgba(34,48,106,.10)' });

  if (err) return <div className="card" style={{ position: 'relative', padding: 16, textAlign: 'center', fontWeight: 800, color: '#B4531A' }}>ملف الأنشودة مش موجود في النسخة دي من التطبيق.</div>;
  return (
    <>
      <div className="card" style={{ position: 'relative', padding: '16px 12px', minHeight: 190, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 8, background: `linear-gradient(180deg,#fff,${bg})`, overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          <motion.div key={cur ? cur.g : 'none'} initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.97 }} transition={{ duration: 0.35 }} style={{ width: '100%', textAlign: 'center' }}>
            {stage(cur, frac, idx, playing)}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="card" style={{ position: 'relative', padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={toggle} aria-label={playing ? 'إيقاف' : 'تشغيل'} style={{ width: 58, height: 58, borderRadius: 29, border: 0, background: c, color: '#fff', fontSize: 24, cursor: 'pointer', flexShrink: 0, boxShadow: `0 4px 0 ${c}55` }}>{playing ? '❚❚' : '▶'}</motion.button>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <input type="range" min={0} max={dur || 1} step={0.1} value={Math.min(t, dur || 1)} onChange={(e) => seek(+e.target.value + 0.15)} style={{ width: '100%', accentColor: c }} aria-label="مكان الأنشودة" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 800, color: '#6D7896' }}><span>{fmt(t)}</span><span>{fmt(dur)}</span></div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => setLoop(!loop)} style={pill(loop)}>🔁 {loop ? 'بيكرّر المقطع' : 'كرّر المقطع'}</button>
          <button type="button" onClick={() => setSlow(!slow)} style={pill(slow)}>🐢 {slow ? 'بالراحة' : 'أبطأ'}</button>
          <button type="button" onClick={() => grp && seek(grp.s)} style={pill(false)}>⟲ من أول المقطع</button>
        </div>
      </div>
      <div ref={listRef} className="card" style={{ position: 'relative', padding: 8, display: 'flex', flexDirection: 'column', gap: 4, background: '#FFFDF5', maxHeight: '44vh', minHeight: 160, overflowY: 'auto', flexShrink: 0 }}>
        {groups.map((G) => { const on = grp?.g === G.g;
          return (
            <motion.button key={G.g} ref={(el) => { rowRefs.current[G.g] = el; }} type="button" onClick={() => seek(G.s)} animate={{ background: on ? bg : 'rgba(255,255,255,0)' }}
              style={{ border: 0, outline: on ? `2px solid ${c}` : 'none', borderRadius: 12, padding: '6px 8px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right', color: '#26336B' }}>
              {row(lines[G.first], on, G)}
            </motion.button>
          ); })}
      </div>
    </>
  );
}
