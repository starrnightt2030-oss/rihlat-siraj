// التعارف: سراج وبشير ومشمش بيعرّفوا نفسهم ويدردشوا مع الطفل زي الشات
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sky from '../components/Sky';
import { BUDDY } from '../components/Siraj';
import { Btn, IconBtn, I } from '../components/ui';
import { useStore } from '../store';
import { A } from '../lib/asset';
import { sfx } from '../lib/sound';
import { say } from '../lib/voice';

const WHO = {
  siraj: { name: 'سراج', face: 'characters/siraj/face_happy', c: '#F5A623' },
  bashir: { name: 'بشير', face: 'characters/bashir/face_happy', c: '#7B5CE0' },
  mishmish: { name: 'مشمش', face: 'characters/mishmish/face_happy', c: '#E0609E' },
};
import { SCRIPT, AGES } from './onboard-script.js';
const textOf = (m, p) => (typeof m.t === 'function' ? m.t(p) : m.t);
const sayOf = (m, p) => (typeof m.say === 'function' ? m.say(p) : m.say || (typeof m.t === 'string' ? m.t : ''));
const ANS = { name: (p) => `اسمي ${p.name}`, age: (p) => AGES.find((a) => a.id === p.age)?.t, gender: (p) => (p.gender === 'girl' ? 'بنت' : 'ولد'), buddy: (p) => 'أختار ' + BUDDY[p.buddy].name };

export default function Onboard({ go, back }) {
  const setProfile = useStore((s) => s.setProfile);
  const [p, setP] = useState({ name: '', gender: '', age: '', buddy: '' });
  const [log, setLog] = useState([]); // [{who, t} | {me, t}]
  const [i, setI] = useState(0);
  const [typing, setTyping] = useState(false);
  const [wait, setWait] = useState(null);
  const [draft, setDraft] = useState('');
  const box = useRef(null);
  const pRef = useRef(p); pRef.current = p;

  useEffect(() => {
    if (i >= SCRIPT.length) return;
    const m = SCRIPT[i];
    setTyping(true);
    const t1 = setTimeout(() => {
      setTyping(false);
      const pp = pRef.current;
      setLog((l) => [...l, { who: m.who, t: textOf(m, pp) }]);
      say(sayOf(m, pp)); sfx.pop();
      if (m.ask) setWait(m.ask);
      else if (m.end) setWait('end');
      else { const ms = Math.min(6500, 1300 + textOf(m, pp).length * 55); setTimeout(() => setI((x) => x + 1), ms); }
    }, i === 0 ? 700 : 900);
    return () => clearTimeout(t1);
  }, [i]);
  useEffect(() => { box.current?.scrollTo({ top: box.current.scrollHeight, behavior: 'smooth' }); }, [log, typing, wait]);

  const answer = (k, v) => {
    const np = { ...p, [k]: v }; setP(np); pRef.current = np;
    sfx.good(); setWait(null);
    setLog((l) => [...l, { me: true, t: ANS[k](np) }]);
    setTimeout(() => setI((x) => x + 1), 500);
  };
  const finish = () => { setProfile({ ...p, name: p.name.trim(), buddy: p.buddy || 'siraj' }); sfx.good(); go('home'); };
  const avatar = p.gender === 'girl' ? 'characters/children/girl' : p.gender === 'boy' ? 'characters/children/boy' : null;

  return (
    <div className="screen" style={{ gap: 10, paddingBottom: 'calc(var(--safe-bottom) + 12px)' }}>
      <Sky tone="mint" />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconBtn icon={I.close} label="رجوع" onClick={back} />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: -8 }}>
          {Object.values(WHO).map((w, k) => <img key={k} src={A(w.face)} alt={w.name} style={{ width: 46, height: 46, borderRadius: 23, background: '#fff', border: `3px solid ${w.c}`, objectFit: 'contain', marginInline: -4 }} />)}
        </div>
        <span style={{ width: 52 }} />
      </div>
      <div ref={box} style={{ position: 'relative', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 2px 10px' }}>
        {log.map((m, k) => m.me ? (
          <motion.div key={k} initial={{ scale: 0.7, opacity: 0, x: -20 }} animate={{ scale: 1, opacity: 1, x: 0 }} style={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'flex-end', gap: 6, flexDirection: 'row-reverse' }}>
            {avatar ? <img src={A(avatar)} alt="" style={{ width: 40, height: 40, borderRadius: 20, objectFit: 'cover', objectPosition: 'top', background: '#fff' }} /> : <span style={{ width: 40, height: 40, borderRadius: 20, background: '#3A8FE0', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800 }}>{p.name.slice(0, 1) || '؟'}</span>}
            <div style={{ background: '#3A8FE0', color: '#fff', borderRadius: '20px 20px 20px 6px', padding: '8px 14px', fontSize: 19, fontWeight: 800, maxWidth: 240 }}>{m.t}</div>
          </motion.div>
        ) : (
          <motion.div key={k} initial={{ scale: 0.7, opacity: 0, x: 20 }} animate={{ scale: 1, opacity: 1, x: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }} style={{ display: 'flex', alignItems: 'flex-end', gap: 6, maxWidth: '88%' }}>
            <img src={A(WHO[m.who].face)} alt="" style={{ width: 48, height: 48, borderRadius: 24, background: '#fff', border: `3px solid ${WHO[m.who].c}`, objectFit: 'contain', flexShrink: 0 }} />
            <div className="card" style={{ padding: '8px 14px', borderRadius: '20px 20px 6px 20px', fontSize: 18, fontWeight: 700, lineHeight: 1.55 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: WHO[m.who].c }}>{WHO[m.who].name}</div>{m.t}
            </div>
          </motion.div>
        ))}
        {typing && i < SCRIPT.length && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
            <img src={A(WHO[SCRIPT[i].who].face)} alt="" style={{ width: 48, height: 48, borderRadius: 24, background: '#fff', border: `3px solid ${WHO[SCRIPT[i].who].c}`, objectFit: 'contain' }} />
            <div className="card" style={{ padding: '14px 16px', display: 'flex', gap: 5 }}>{[0, 1, 2].map((d) => <motion.span key={d} animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.7, delay: d * 0.15 }} style={{ width: 9, height: 9, borderRadius: 5, background: '#9AA6BF' }} />)}</div>
          </div>
        )}
      </div>
      <AnimatePresence mode="wait">
        {wait && (
          <motion.div key={wait} initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} style={{ position: 'relative' }}>
            {wait === 'name' && (
              <form onSubmit={(e) => { e.preventDefault(); if (draft.trim()) answer('name', draft.trim()); }} className="card" style={{ padding: 8, display: 'flex', gap: 8 }}>
                <input autoFocus value={draft} maxLength={16} onChange={(e) => setDraft(e.target.value)} placeholder="اكتب اسمك هنا" aria-label="اسمك"
                  style={{ flex: 1, minWidth: 0, height: 58, borderRadius: 18, border: '3px solid #FFE08A', background: '#FFFBEF', fontSize: 24, fontWeight: 800, color: '#22306A', padding: '0 14px', outline: 'none', fontFamily: 'inherit' }} />
                <Btn type="submit" disabled={!draft.trim()} style={{ minHeight: 58, padding: '0 18px' }}>إرسال</Btn>
              </form>
            )}
            {wait === 'age' && <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{AGES.map((a) => <Btn key={a.id} tone={a.c} className="block" onClick={() => answer('age', a.id)} style={{ fontSize: 24, minHeight: 60 }}>{a.t}</Btn>)}</div>}
            {wait === 'gender' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 }}>
                {[{ id: 'boy', t: 'ولد', img: 'characters/children/boy', c: '#3FA9F5' }, { id: 'girl', t: 'بنت', img: 'characters/children/girl', c: '#FF8FC8' }].map((g) => (
                  <motion.button key={g.id} type="button" whileTap={{ scale: 0.95 }} onClick={() => answer('gender', g.id)} className="card"
                    style={{ padding: 8, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, border: `4px solid ${g.c}`, background: `linear-gradient(180deg, ${g.c}22, #fff 70%)`, fontFamily: 'inherit' }}>
                    <img src={A(g.img)} alt="" style={{ height: 130, objectFit: 'contain' }} /><span style={{ fontSize: 24, fontWeight: 800, color: '#26336B' }}>{g.t}</span>
                  </motion.button>
                ))}
              </div>
            )}
            {wait === 'buddy' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 8 }}>
                {Object.entries(BUDDY).map(([id, b]) => (
                  <motion.button key={id} type="button" whileTap={{ scale: 0.95 }} onClick={() => answer('buddy', id)} className="card" style={{ padding: '8px 4px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, fontFamily: 'inherit', border: `3px solid ${WHO[id].c}` }}>
                    <img src={A(b.face)} alt="" style={{ width: 76, height: 76, objectFit: 'contain' }} /><span style={{ fontSize: 19, fontWeight: 800, color: '#26336B' }}>{b.name}</span>
                  </motion.button>
                ))}
              </div>
            )}
            {wait === 'end' && <Btn className="block pulse" onClick={finish} sound="pop" style={{ minHeight: 66, fontSize: 25 }}>يلا نبدأ الرحلة!</Btn>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
