import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sky from '../components/Sky';
import Siraj, { BUDDY } from '../components/Siraj';
import { Btn, Bubble, IconBtn, I } from '../components/ui';
import { useStore } from '../store';
import { A } from '../lib/asset';
import { sfx } from '../lib/sound';
import { say } from '../lib/voice';

const AGES = [{ id: '4-6', t: '٤ – ٦', c: 'coral' }, { id: '7-9', t: '٧ – ٩', c: 'teal' }, { id: '10-12', t: '١٠ – ١٢', c: 'grape' }];

export default function Onboard({ go, back }) {
  const setProfile = useStore((s) => s.setProfile);
  const [step, setStep] = useState(0);
  const [p, setP] = useState({ name: '', gender: '', age: '', buddy: 'siraj' });
  const set = (k, v) => { sfx.pop(); setP((o) => ({ ...o, [k]: v })); };
  const lines = ['اسمك إيه يا بطل؟', `أهلًا يا ${p.name || 'بطل'}! انت ولد ولا بنت؟`, 'عندك كام سنة؟', 'مين يحب يكون رفيقك في الرحلة؟'];
  const ok = [p.name.trim().length > 0, !!p.gender, !!p.age, !!p.buddy][step];
  const next = () => {
    if (step < 3) { const n = step + 1; setStep(n); say(lines[n]); return; }
    setProfile({ ...p, name: p.name.trim() }); sfx.good(); say('بسم الله… يلا ننوّرها!'); go('island');
  };
  const pose = ['wave', 'happy', 'think', 'jump'][step];

  return (
    <div className="screen" style={{ gap: 14 }}>
      <Sky tone="mint" />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconBtn icon={I.back} label="رجوع" onClick={() => (step ? setStep(step - 1) : back())} />
        <div style={{ flex: 1, display: 'flex', gap: 6 }} aria-hidden="true">
          {[0, 1, 2, 3].map((i) => <span key={i} style={{ flex: 1, height: 10, borderRadius: 5, background: i <= step ? '#FFC233' : 'rgba(255,255,255,.8)', transition: 'background .3s' }} />)}
        </div>
      </div>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 6, minHeight: 170 }}>
        <Siraj pose={pose} size={150} onTap={() => say(lines[step])} />
        <Bubble tail="r" style={{ flex: 1, fontSize: 22, marginBottom: 30 }}>{lines[step]}</Bubble>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }} transition={{ duration: 0.25 }} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {step === 0 && (
            <label className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8, fontWeight: 800, fontSize: 18 }}>اكتب اسمك
              <input autoFocus value={p.name} maxLength={16} onChange={(e) => setP({ ...p, name: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && ok && next()} placeholder="مثلًا: يوسف أو مريم"
                style={{ height: 64, borderRadius: 20, border: '3px solid #FFE08A', background: '#FFFBEF', fontSize: 26, fontWeight: 800, color: '#22306A', padding: '0 18px', outline: 'none' }} />
            </label>
          )}
          {step === 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
              {[{ id: 'boy', t: 'ولد', img: 'characters/children/boy', c: '#3FA9F5' }, { id: 'girl', t: 'بنت', img: 'characters/children/girl', c: '#FF8FC8' }].map((g) => (
                <button key={g.id} type="button" onClick={() => set('gender', g.id)} className="card" aria-pressed={p.gender === g.id}
                  style={{ height: 230, padding: 8, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 4, borderColor: p.gender === g.id ? g.c : '#FFE08A', borderWidth: p.gender === g.id ? 5 : 3, transform: p.gender === g.id ? 'scale(1.04)' : 'none', transition: 'transform .2s', background: `linear-gradient(180deg, ${g.c}22, #fff 60%)` }}>
                  <img src={A(g.img)} alt="" style={{ height: 170, objectFit: 'contain' }} />
                  <span style={{ fontSize: 24, fontWeight: 800 }}>{g.t}</span>
                </button>
              ))}
            </div>
          )}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {AGES.map((a) => (
                <Btn key={a.id} tone={p.age === a.id ? a.c : 'white'} className="block" onClick={() => set('age', a.id)} sound="" style={{ fontSize: 28, minHeight: 72 }}>{a.t} سنين</Btn>
              ))}
            </div>
          )}
          {step === 3 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
              {Object.entries(BUDDY).map(([id, b]) => (
                <button key={id} type="button" onClick={() => set('buddy', id)} className="card" aria-pressed={p.buddy === id}
                  style={{ padding: '10px 4px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, borderColor: p.buddy === id ? '#FFC233' : '#FFE08A', borderWidth: p.buddy === id ? 5 : 3, transform: p.buddy === id ? 'scale(1.05)' : 'none', transition: 'transform .2s' }}>
                  <img src={A(b.face)} alt="" style={{ width: 86, height: 86, objectFit: 'contain' }} />
                  <span style={{ fontSize: 20, fontWeight: 800 }}>{b.name}</span>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div style={{ position: 'relative', marginTop: 'auto' }}>
        <Btn className="block" disabled={!ok} onClick={next} sound="pop" style={{ minHeight: 66, fontSize: 24 }}>{step < 3 ? 'التالي' : 'يلا على الجزيرة!'}</Btn>
      </div>
    </div>
  );
}
