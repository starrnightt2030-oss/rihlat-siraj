import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sky from '../components/Sky';
import StoryArt from '../art/StoryArt';
import { ReciterChip } from '../components/Reciter';
import Siraj from '../components/Siraj';
import Reward from '../components/Reward';
import { Btn, Bubble, IconBtn, Icon, I, StarsChip, HomeBtn } from '../components/ui';
import { STORIES, GROUPS } from '../data/stories';
import { cardById } from '../data/units';
import { useStore } from '../store';
import { A, ar } from '../lib/asset';
import { sfx } from '../lib/sound';
import { say, hush , hubSay, leave } from '../lib/voice';
import { HUB } from '../data/speech';

export default function Stories({ arg, go, back }) {
  if (arg && STORIES[arg]) return <Player id={arg} go={go} back={back} />;
  const done = useStore((s) => s.done);
  useEffect(() => { hubSay(HUB.stories); return () => leave(); }, []);
  return (
    <div className="screen with-nav" style={{ gap: 14 }}>
      <Sky />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800 }}>بحر الحكايات</h1><StarsChip />
      </div>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 4 }}>
        <Siraj pose="read" size={110} onTap={() => say('اختار حكاية وأنا أحكيهالك')} />
        <Bubble tail="r" style={{ flex: 1, marginBottom: 16 }}>اختار حكاية وأنا أحكيهالك!</Bubble>
      </div>
      {GROUPS.map((g) => (
        <div key={g.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h2 style={{ fontSize: 21, fontWeight: 800, color: g.c, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 8, height: 24, borderRadius: 4, background: g.c }} />{g.t}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 }}>
            {Object.entries(STORIES).filter(([, s]) => s.group === g.id).map(([id, s], i) => (
              <motion.button key={id} type="button" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.05 }} whileTap={{ scale: 0.96 }} onClick={() => { sfx.pop(); go('stories', id); }}
                className="card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', textAlign: 'right', border: `3px solid ${s.color}`, fontFamily: 'inherit', color: '#26336B', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', aspectRatio: '1.2', background: `linear-gradient(135deg, ${s.color}55, #fff)`, overflow: 'hidden' }}>
                  {s.coverArt ? <StoryArt id={s.coverArt} /> : <img src={A(s.cover)} alt="" style={{ width: '100%', height: '100%', objectFit: s.choice ? 'cover' : 'contain', padding: s.choice ? 0 : 8 }} />}
                  {id in done && <span style={{ position: 'absolute', top: 6, left: 6, padding: '0 8px', fontSize: 12 }} className="chip"><Icon d={I.check} size={14} color="#2D9C4A" /> سمعتها</span>}
                  {s.choice && <span style={{ position: 'absolute', top: 6, right: 6, background: '#FF7B6B', color: '#fff', borderRadius: 12, padding: '0 8px', fontSize: 12, fontWeight: 800 }}>اختار انت</span>}
                </div>
                <div style={{ padding: '6px 10px 8px' }}><div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.25 }}>{s.title}</div><div style={{ fontSize: 12, color: '#5D6CA0', fontWeight: 700 }}>{s.sub}</div></div>
              </motion.button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const ANIM = {
  bob: { animate: { y: [0, -8, 0], rotate: [-1, 1.5, -1] }, transition: { duration: 3, repeat: Infinity } },
  rock: { animate: { rotate: [-6, 6, -6], y: [0, -12, 0] }, transition: { duration: 1.6, repeat: Infinity } },
  swim: { animate: { x: [0, -14, 0], y: [0, 8, 0] }, transition: { duration: 4, repeat: Infinity } },
  rise: { animate: { y: [20, -30], opacity: [0, 1, 0] }, transition: { duration: 3, repeat: Infinity } },
  pop: { animate: { scale: [0.8, 1.1, 0.95] }, transition: { duration: 1.2, repeat: Infinity, repeatType: 'reverse' } },
  glow: { animate: { scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }, transition: { duration: 3, repeat: Infinity } },
};

function Player({ id, go, back }) {
  const S = STORIES[id];
  const complete = useStore((s) => s.complete);
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState('story');
  const [choice, setChoice] = useState(null);
  const [q, setQ] = useState(0), [miss, setMiss] = useState(0), [pick, setPick] = useState(null);
  const [result, setResult] = useState(null);
  const sc = S.scenes[i];
  const cu = cardById(id)?.unit; const region = cu ? { name: cu.title } : { name: 'بحر الحكايات' };
  const line = choice ? choice.res : sc.t;
  useEffect(() => { if (phase === 'story') say(choice ? choice.res : sc.t, !choice && sc.aud ? [].concat(sc.aud) : []); if (phase === 'moral') say(S.moral); if (phase === 'quiz') say(S.quiz[q].q); }, [i, phase, choice, q]);
  useEffect(() => () => leave(), []);

  const next = () => {
    sfx.whoosh();
    if (sc.choose && !(choice && choice.good)) return;
    if (i < S.scenes.length - 1) { setI(i + 1); setChoice(null); } else setPhase('moral');
  };
  const prev = () => { if (i > 0) { sfx.back(); setI(i - 1); setChoice(null); } };
  const answer = (k) => {
    setPick(k);
    if (k === S.quiz[q].c) {
      sfx.good();
      setTimeout(() => { setPick(null); if (q < S.quiz.length - 1) setQ(q + 1); else { const stars = Math.max(1, 3 - miss); setResult({ stars, ...complete(id, stars, S.reward) }); setPhase('reward'); } }, 900);
    } else { sfx.soft(); setMiss(miss + 1); setTimeout(() => setPick(null), 900); }
  };

  return (
    <div className="screen" style={{ gap: 12, background: phase === 'story' && sc.sky ? sc.sky : undefined }}>
      {!(phase === 'story' && sc.sky) && <Sky tone="lilac" />}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconBtn icon={I.close} label="اقفل الحكاية" onClick={back} />
        <div style={{ flex: 1, textAlign: 'center', fontWeight: 800, fontSize: 18, background: 'rgba(255,255,255,.85)', borderRadius: 18, padding: '4px 10px' }}>{S.title}</div>
        <span className="chip" style={{ paddingInline: 12 }}>{ar(Math.min(i + 1, S.scenes.length))} / {ar(S.scenes.length)}</span>
        <HomeBtn />
      </div>

      {phase === 'story' && (
        <>
          <AnimatePresence mode="wait">
            <motion.div key={i + (choice ? 'c' : '')} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
              className="card" style={{ position: 'relative', aspectRatio: '1.2', overflow: 'hidden', padding: 0, borderColor: '#fff', borderWidth: 5, flexShrink: 0 }}>
              {sc.art && !choice ? <StoryArt id={sc.art} /> : <motion.img src={A(choice ? choice.img : sc.bg)} alt="" animate={{ scale: [1, 1.06] }} transition={{ duration: 9, ease: 'linear' }}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: choice?.good ? 'contain' : 'cover', background: choice?.good ? 'radial-gradient(#FFF6CC,#FFE38A)' : undefined }} />}
              {!choice && !sc.art && (sc.el || []).map((e, k) => (
                <motion.img key={k} src={A(e.img)} alt="" {...ANIM[e.anim]} style={{ position: 'absolute', width: `${e.w}%`, left: `${e.x}%`, top: `${e.y}%`, filter: 'drop-shadow(0 8px 12px rgba(0,0,0,.25))' }} />
              ))}
              {sc.fx === 'storm' && !choice && !sc.art && <motion.div aria-hidden="true" animate={{ opacity: [0, 0, 0.8, 0, 0.5, 0] }} transition={{ duration: 4, repeat: Infinity }} style={{ position: 'absolute', inset: 0, background: '#fff' }} />}
            </motion.div>
          </AnimatePresence>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <img src={A('characters/siraj/face_happy')} alt="سراج" style={{ width: 58, height: 58, objectFit: 'contain', flexShrink: 0 }} />
            <Bubble tail="r" style={{ flex: 1, fontSize: 20 }}>
              {choice ? choice.res : sc.t}
              {sc.ayah && !choice && <div style={{ marginTop: 8, fontFamily: "'Amiri', serif", fontSize: sc.ayah.length > 90 ? 19 : 24, color: '#0B6E8A', textAlign: 'center', lineHeight: 1.8 }}>﴿{sc.ayah}﴾<div style={{ fontSize: 13, color: '#5D6CA0', fontFamily: 'inherit' }}>{sc.ref}</div>{sc.aud && <div style={{ marginTop: 6, fontFamily: "'Baloo Bhaijaan 2'" }}><ReciterChip codes={[].concat(sc.aud)} color="#0B6E8A" /></div>}</div>}
            </Bubble>
            <IconBtn icon={I.sound} label="اسمع تاني" sound="tap" onClick={() => say(line, !choice && sc.aud ? [].concat(sc.aud) : [])} color="#0B9A92" />
          </div>
          {sc.choose && !choice?.good && (
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sc.choose.map((c, k) => <Btn key={k} tone={['leaf', 'teal', 'coral'][k]} className="block" sound="pop" onClick={() => { setChoice(c); c.good ? sfx.good() : sfx.soft(); }} style={{ minHeight: 58, fontSize: 19 }}>{c.t}</Btn>)}
            </div>
          )}
          <div style={{ position: 'relative', marginTop: 'auto', display: 'flex', gap: 10 }}>
            <Btn tone="white" sound="" onClick={prev} disabled={i === 0} style={{ minWidth: 70 }} aria-label="المشهد اللي قبله"><Icon d={I.back} /></Btn>
            <Btn className="block" sound="" onClick={next} disabled={sc.choose && !choice?.good} style={{ flex: 1 }}>{i < S.scenes.length - 1 ? 'كمّل الحكاية' : 'خلصت الحكاية'}</Btn>
          </div>
        </>
      )}

      {phase === 'moral' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center' }}>
          <h2 style={{ fontSize: 30, fontWeight: 800 }}>اتعلمنا إيه؟</h2>
          <Bubble tail="b" style={{ fontSize: 22 }}>{S.moral}</Bubble>
          <Siraj pose="proud" size={190} />
          <Btn className="block pulse" sound="pop" onClick={() => setPhase('quiz')}>يلا نشوف فاكر إيه</Btn>
        </motion.div>
      )}

      {phase === 'quiz' && (
        <motion.div key={'q' + q} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card" style={{ padding: '22px 16px', textAlign: 'center' }}><h2 style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.35 }}>{S.quiz[q].q}</h2></div>
          {S.quiz[q].a.map((t, k) => {
            const right = pick === k && k === S.quiz[q].c, wrong = pick === k && !right;
            return <motion.div key={k} animate={wrong ? { x: [0, -12, 12, -8, 8, 0] } : {}}><Btn tone={right ? 'leaf' : wrong ? 'coral' : 'white'} className="block" sound="" onClick={() => answer(k)} style={{ minHeight: 70, fontSize: 22 }}>{t}</Btn></motion.div>;
          })}
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center' }}><Siraj pose={pick === null ? 'think' : pick === S.quiz[q].c ? 'party' : 'oops'} size={130} /></div>
        </motion.div>
      )}

      {phase === 'reward' && result && <Reward result={result} region={region} title="حكاية حلوة!" onHome={() => go('island')} onRegion={() => (cu ? go('unit', cu.id) : go('stories'))} />}
    </div>
  );
}
