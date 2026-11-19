// اختيار القارئ + وضع المعلّم (الطفل يردّد بعد كل آية) + شارة «دورك»
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RECITERS, reciterById } from '../data/reciters';
import { useStore } from '../store';
import { onTurn, skipTurn, recite, hush } from '../lib/voice';
import { sfx } from '../lib/sound';
import { Btn } from './ui';

const Mic = ({ c = '#fff', s = 22 }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" fill={c} /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>);
const Face = ({ r, size = 46 }) => (
  <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" style={{ flexShrink: 0 }}>
    <circle cx="24" cy="24" r="23" fill={r.c + '22'} /><path d="M8 40 h32 l-3 -6 h-26z" fill={r.c} />
    <path d="M14 12 h20 v22 h-20z" fill="#fff" stroke={r.c} strokeWidth="2" rx="2" /><path d="M24 12 v22" stroke={r.c} strokeWidth="2" /><path d="M17 18 h4 M17 23 h4 M27 18 h4 M27 23 h4" stroke={r.c} strokeWidth="2" strokeLinecap="round" />
    <path d="M36 6 l2 3 3 1 -3 1 -2 3 -2 -3 -3 -1 3 -1z" fill="#FFD25A" />
  </svg>
);

// الزرار الصغير اللي بيظهر جنب الآيات والسور
export function ReciterChip({ codes, color = '#B03A64' }) {
  const st = useStore((s) => s.settings);
  const [open, setOpen] = useState(false);
  const r = reciterById(st.reciter);
  return (<>
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
      {codes && <button type="button" onClick={() => { sfx.tap(); recite(codes); }} style={chip(color, true)}>▶ اسمع من الشيخ</button>}
      <button type="button" onClick={() => { sfx.tap(); setOpen(true); }} style={chip(color)}>القارئ: {r.name.split(' ').slice(-1)[0]}{st.teach ? ' · المعلّم' : ''}</button>
    </div>
    <ReciterSheet open={open} onClose={() => setOpen(false)} codes={codes} />
  </>);
}
const chip = (c, solid) => ({ border: 0, borderRadius: 16, padding: '5px 12px', background: solid ? c : '#fff', color: solid ? '#fff' : c, fontFamily: 'inherit', fontWeight: 800, fontSize: 14, cursor: 'pointer', boxShadow: `0 3px 0 ${c}44` });

export function ReciterSheet({ open, onClose, codes }) {
  const st = useStore((s) => s.settings), set = useStore((s) => s.setSetting);
  const sample = codes?.length ? codes.slice(0, 1) : ['001002'];
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { hush(); onClose(); }}
          style={{ position: 'fixed', inset: 0, zIndex: 60, background: '#26336B99', display: 'flex', alignItems: 'flex-end' }}>
          <motion.div initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400 }} transition={{ type: 'spring', damping: 24, stiffness: 260 }} onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxHeight: '88vh', overflowY: 'auto', background: '#FFFDF7', borderRadius: '28px 28px 0 0', padding: '14px 14px calc(var(--safe-bottom) + 16px)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ width: 50, height: 6, borderRadius: 3, background: '#D8DEEA', alignSelf: 'center' }} />
            <div style={{ fontSize: 22, fontWeight: 800, textAlign: 'center' }}>اختار الشيخ اللي يقرالك</div>
            {RECITERS.map((r) => {
              const on = (st.reciter || 'alafasy') === r.id;
              return (
                <button key={r.id} type="button" onClick={() => { sfx.tap(); set('reciter', r.id); setTimeout(() => recite(sample), 50); }} aria-pressed={on}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 20, border: `3px solid ${on ? r.c : '#fff'}`, background: on ? r.c + '14' : '#fff', boxShadow: '0 3px 0 #EEE7D8', fontFamily: 'inherit', textAlign: 'right', cursor: 'pointer', color: '#26336B' }}>
                  <Face r={r} />
                  <div style={{ flex: 1 }}><div style={{ fontSize: 18, fontWeight: 800 }}>{r.name}</div><div style={{ fontSize: 13, fontWeight: 700, color: r.c }}>{r.note}</div></div>
                  <span style={{ width: 26, height: 26, borderRadius: 13, border: `3px solid ${r.c}`, background: on ? r.c : '#fff', boxShadow: on ? 'inset 0 0 0 4px #fff' : 'none' }} />
                </button>
              );
            })}
            <div className="card" style={{ padding: 12, background: st.teach ? '#E3F7EE' : '#fff', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <span style={{ width: 44, height: 44, borderRadius: 22, background: '#2FB383', display: 'grid', placeItems: 'center' }}><Mic /></span>
                <div style={{ flex: 1 }}><div style={{ fontSize: 18, fontWeight: 800 }}>وضع المعلّم</div><div style={{ fontSize: 13, fontWeight: 700, color: '#1F8A61' }}>الشيخ يقرا الآية، ويسيبلك وقت تردّدها وراه</div></div>
                <input type="checkbox" checked={!!st.teach} onChange={(e) => set('teach', e.target.checked)} style={{ width: 28, height: 28, accentColor: '#2FB383' }} />
              </label>
              {st.teach && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                  <span style={{ fontWeight: 800 }}>كل آية تتكرّر:</span>
                  {[1, 2, 3].map((n) => <button key={n} type="button" onClick={() => set('reps', n)} style={{ ...chip('#2FB383', (st.reps || 1) === n), minWidth: 54 }}>{n === 1 ? 'مرة' : n === 2 ? 'مرتين' : '٣ مرات'}</button>)}
                </div>
              )}
            </div>
            <Btn className="block" onClick={() => { hush(); onClose(); }} style={{ '--c': '#3A8FE0', '--d': '#2A6FBB', '--t': '#fff' }}>تمام</Btn>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// «دورك!» بتظهر فوق أي شاشة وقت الترديد
export function TurnBadge() {
  const [t, setT] = useState(null);
  useEffect(() => onTurn(setT), []);
  return (
    <AnimatePresence>
      {t && (
        <motion.button key={t.at} type="button" onClick={skipTurn} initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} aria-label="دورك تردّد — اضغط لو خلّصت"
          style={{ position: 'fixed', left: 16, right: 16, bottom: 'calc(var(--safe-bottom) + 100px)', zIndex: 55, border: 0, borderRadius: 24, padding: '10px 14px', background: '#2FB383', color: '#fff', fontFamily: 'inherit', boxShadow: '0 6px 0 #1F8A61, 0 12px 30px #0003', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', overflow: 'hidden' }}>
          <motion.span animate={{ scale: [1, 1.18, 1] }} transition={{ repeat: Infinity, duration: 0.9 }} style={{ width: 46, height: 46, borderRadius: 23, background: '#fff3', display: 'grid', placeItems: 'center' }}><Mic s={26} /></motion.span>
          <div style={{ flex: 1, textAlign: 'right' }}><div style={{ fontSize: 20, fontWeight: 800 }}>دورك! ردّد ورا الشيخ</div><div style={{ fontSize: 13, fontWeight: 700, opacity: 0.9 }}>خلّصت؟ دوس هنا نكمّل</div></div>
          <motion.i initial={{ width: '100%' }} animate={{ width: 0 }} transition={{ duration: t.ms / 1000, ease: 'linear' }} style={{ position: 'absolute', bottom: 0, right: 0, height: 5, background: '#fff' }} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
