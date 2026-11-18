import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sky from '../components/Sky';
import Siraj, { Sparks } from '../components/Siraj';
import Reward from '../components/Reward';
import { Btn, Bubble, IconBtn, Icon, I } from '../components/ui';
import { LESSONS, REGIONS } from '../data/content';
import { useStore } from '../store';
import { A, ar } from '../lib/asset';
import { sfx } from '../lib/sound';
import { say, hush } from '../lib/voice';

const CHEER = ['برافو!', 'شاطر جدًا!', 'نوّرت!', 'ممتاز!', 'كده تمام!'];

export default function Lesson({ arg, go, back }) {
  const L = LESSONS[arg] || LESSONS.wudu;
  const R = REGIONS.find((r) => r.id === L.region);
  const complete = useStore((s) => s.complete);
  const [phase, setPhase] = useState('intro');
  const [i, setI] = useState(0);
  const [taps, setTaps] = useState(0);
  const [q, setQ] = useState(0);
  const [miss, setMiss] = useState(0);
  const [pick, setPick] = useState(null);
  const [result, setResult] = useState(null);
  const total = L.steps.length + 1;
  const step = L.steps[i];
  const doneTaps = phase === 'step' && taps >= step.act.n;

  useEffect(() => () => hush(), []);
  useEffect(() => { if (phase === 'intro') say(L.intro); if (phase === 'step') say(step.say); if (phase === 'quiz') say(L.quiz[q].q); }, [phase, i, q]);

  const tap = () => {
    if (doneTaps) return;
    step.act.icon === 'drop' ? sfx.drop() : sfx.sparkle();
    const n = taps + 1; setTaps(n);
    if (n >= step.act.n) setTimeout(() => sfx.good(), 180);
  };
  const nextStep = () => {
    sfx.whoosh(); setTaps(0);
    if (i < L.steps.length - 1) setI(i + 1); else { setPhase('quiz'); setQ(0); }
  };
  const answer = (k) => {
    if (pick !== null && pick === L.quiz[q].c) return;
    setPick(k);
    if (k === L.quiz[q].c) {
      sfx.good();
      setTimeout(() => {
        setPick(null);
        if (q < L.quiz.length - 1) setQ(q + 1);
        else { const stars = Math.max(1, 3 - miss); setResult({ stars, ...complete(arg, stars, L.reward) }); setPhase('reward'); }
      }, 900);
    } else { sfx.soft(); setMiss(miss + 1); say('قريبة! فكّر تاني'); setTimeout(() => setPick(null), 900); }
  };
  const progress = phase === 'intro' ? 0 : phase === 'step' ? i + 1 : total;
  const cheer = useMemo(() => CHEER[Math.floor(Math.random() * CHEER.length)], [i, q]);

  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone={R?.sky === 'default' ? '' : R?.sky} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconBtn icon={I.close} label="اقفل الدرس" onClick={back} />
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))`, gap: 4 }} aria-label={`الخطوة ${progress} من ${total}`}>
          {Array.from({ length: total }).map((_, k) => <span key={k} style={{ height: 12, borderRadius: 6, background: k < progress ? (k === progress - 1 ? '#1EC8BE' : '#FFC233') : 'rgba(255,255,255,.85)', transition: 'background .3s' }} />)}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40 }} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, textAlign: 'center' }}>
            <span style={{ background: '#fff', borderRadius: 16, padding: '2px 14px', fontWeight: 800, color: R?.color }}>{R?.name}</span>
            <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15 }}>{L.title}</h1>
            <Bubble tail="b" style={{ fontSize: 21 }}>{L.intro}</Bubble>
            <Siraj pose="wave" size={210} onTap={() => say(L.intro)} />
            <Btn className="block pulse" sound="pop" onClick={() => setPhase('step')} style={{ minHeight: 66, fontSize: 24 }}><Icon d={I.play} /> يلا نبدأ</Btn>
          </motion.div>
        )}

        {phase === 'step' && (
          <motion.div key={'s' + i} initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ duration: 0.3 }} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#fff', background: R?.color, borderRadius: 12, padding: '0 10px' }}>{ar(i + 1)}</span>
              <h1 style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.15 }}>{step.t}</h1>
            </div>
            <div className="card" style={{ position: 'relative', padding: 6, borderColor: '#fff', borderWidth: 5 }}>
              <img src={A(step.img)} alt={step.t} style={{ display: 'block', width: '100%', aspectRatio: '1.25', objectFit: 'cover', borderRadius: 20, background: '#EAF6FF' }} />
              {doneTaps && <Sparks n={12} />}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <img src={A(doneTaps ? 'characters/siraj/face_laugh' : 'characters/siraj/face_happy')} alt="سراج" style={{ width: 62, height: 62, objectFit: 'contain', flexShrink: 0 }} />
              <Bubble tail="r" style={{ flex: 1 }}>{doneTaps ? `${cheer} ${step.act.n > 1 ? 'خلّصت ' + ar(step.act.n) + ' مرات.' : ''}` : step.say}</Bubble>
              <IconBtn icon={I.sound} label="اسمع تاني" sound="tap" onClick={() => say(step.say)} color="#0B9A92" />
            </div>
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
              {step.act.label ? (
                !doneTaps && <Btn tone="teal" className="block" sound="" onClick={tap} style={{ minHeight: 64 }}><Icon d={I[step.act.icon]} /> {step.act.label}</Btn>
              ) : (
                <>
                  <span style={{ fontWeight: 800, color: '#5D6CA0' }}>{doneTaps ? 'برافو!' : `دوس ${ar(step.act.n)} مرات زي ما بتعمل`}</span>
                  <div style={{ display: 'flex', gap: 14 }}>
                    {Array.from({ length: step.act.n }).map((_, k) => {
                      const on = k < taps;
                      return (
                        <motion.button key={k} type="button" onClick={tap} aria-label={`مرة ${k + 1}`} animate={on ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.35 }}
                          style={{ width: 70, height: 70, borderRadius: 35, cursor: 'pointer', border: on ? '4px solid #fff' : '3px dashed #9FB8E0', background: on ? (step.act.icon === 'drop' ? '#3FA9F5' : '#FFC233') : 'rgba(255,255,255,.8)', color: on ? '#fff' : '#9FB8E0', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: on ? '0 0 20px rgba(63,169,245,.6)' : 'none' }}>
                          <Icon d={I[step.act.icon]} size={34} color="currentColor" />
                        </motion.button>
                      );
                    })}
                  </div>
                </>
              )}
              <Btn className={'block' + (doneTaps ? ' pulse' : '')} disabled={!doneTaps} onClick={nextStep} sound="" style={{ minHeight: 64 }}>{i < L.steps.length - 1 ? 'الخطوة اللي بعدها' : 'يلا على الأسئلة'}</Btn>
            </div>
          </motion.div>
        )}

        {phase === 'quiz' && (
          <motion.div key={'q' + q} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
              <img src={A('characters/bashir/face_think')} alt="بشير" style={{ width: 90, height: 90, objectFit: 'contain' }} />
              <Bubble tail="r" style={{ flex: 1, marginBottom: 12 }}>بشير عنده سؤال {ar(q + 1)} من {ar(L.quiz.length)}</Bubble>
            </div>
            <div className="card" style={{ padding: '22px 16px', textAlign: 'center' }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.35 }}>{L.quiz[q].q}</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {L.quiz[q].a.map((t, k) => {
                const right = pick === k && k === L.quiz[q].c, wrong = pick === k && k !== L.quiz[q].c;
                return (
                  <motion.div key={k} animate={wrong ? { x: [0, -12, 12, -8, 8, 0] } : right ? { scale: [1, 1.06, 1] } : {}} transition={{ duration: 0.45 }}>
                    <Btn tone={right ? 'leaf' : wrong ? 'coral' : 'white'} className="block" sound="" onClick={() => answer(k)} style={{ minHeight: 72, fontSize: 23 }}>
                      {right && <Icon d={I.check} />}{t}
                    </Btn>
                  </motion.div>
                );
              })}
            </div>
            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center' }}>
              <Siraj pose={pick === null ? 'think' : pick === L.quiz[q].c ? 'party' : 'oops'} size={130} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === 'reward' && result && (
        <Reward result={result} region={R} onHome={() => go('island')} onRegion={() => go('region', R.id)} />
      )}
    </div>
  );
}
