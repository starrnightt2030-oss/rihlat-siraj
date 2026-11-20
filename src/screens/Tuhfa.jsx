// تحفة الأطفال: قائمة الأبواب، وكل باب: الأبيات بصوت سراج + الشرح بالعامية + الأمثلة من القرآن + لعبة «الحكم إيه؟» + «حفظت الأبيات»
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Sky from '../components/Sky';
import { Confetti } from '../components/Reward';
import { TUHFA, verseLine, TUHFA_INTRO, TUHFA_Q, tuhfaQuiz } from '../data/tuhfa';
import { useStore } from '../store';
import { ar } from '../lib/asset';
import { sfx } from '../lib/sound';
import { say, hush, hubSay } from '../lib/voice';
import { HomeBtn } from '../components/ui';
import SyncSong, { Fill } from '../components/SyncSong';
import { TUHFA_SONG } from '../data/tuhfaSong';
import { EX_AUDIO } from '../data/tuhfaEx';

// أمثلة القواعد بصوت الشيخ الحصري (مقصوصة من تلاوة الآية نفسها) عشان الطفل يسمع النطق الصح
const exUrl = (w) => EX_AUDIO[w] && `${import.meta.env.BASE_URL}audio/tuhfa-ex/${EX_AUDIO[w]}`;
let exEl = null;
const stopEx = () => { try { exEl?.pause(); } catch (e) {} exEl = null; };
const playEx = (w) => new Promise((res) => {
  stopEx(); const u = exUrl(w); if (!u) return res();
  const a = new Audio(u); exEl = a;
  a.onended = a.onerror = a.onpause = () => res();
  a.play().catch(() => res());
});

const Back = ({ onClick }) => (
  <button type="button" className="icon-btn" aria-label="رجوع" onClick={onClick}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22306A" strokeWidth="3" strokeLinecap="round"><path d="M9 5l7 7-7 7" /></svg></button>
);
const shuffle = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((x) => x[1]);
const firstVerse = (i) => TUHFA.slice(0, i).reduce((s, b) => s + b.v.length, 0);

function Game({ b }) {
  const [qs] = useState(() => shuffle(tuhfaQuiz(b)).slice(0, 5));
  const [i, setI] = useState(0), [bad, setBad] = useState(''), [win, setWin] = useState(false);
  const q = qs[i];
  // السؤال الأول بيتقال في آخر شرح الباب، والباقي أول ما ييجي دوره
  useEffect(() => { if (q && !win && i > 0) say(TUHFA_Q); }, [i]);
  if (!qs.length) return null;
  if (win) return <div className="card" style={{ position: 'relative', padding: 16, textAlign: 'center', fontSize: 20, fontWeight: 800, color: b.c }}><Confetti />🏆 برافو! جاوبت الخمسة صح</div>;
  const pick = (o) => { if (o !== q.a) { sfx.soft(); setBad(o); return; } sfx.star(); setBad(''); if (i + 1 >= qs.length) { setWin(true); say('برافو!'); } else setI(i + 1); };
  return (
    <div className="card" style={{ position: 'relative', padding: 14, display: 'flex', flexDirection: 'column', gap: 10, background: b.bg }}>
      <div style={{ fontSize: 17, fontWeight: 800, color: b.c }}>🎯 لعبة: الحكم إيه؟ ({ar(i + 1)} من {ar(qs.length)})</div>
      <div className="ayah" style={{ textAlign: 'center', fontSize: 34, color: '#26336B', background: '#fff', borderRadius: 16, padding: '4px 8px' }}>{q.w}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 8 }}>
        {q.opts.map((o) => <motion.button key={i + o} type="button" whileTap={{ scale: 0.94 }} animate={bad === o ? { x: [0, -7, 7, -4, 0] } : {}} onClick={() => pick(o)} style={{ borderRadius: 14, padding: '10px 6px', border: bad === o ? '3px solid #E5484D' : `3px solid ${b.c}33`, background: '#fff', fontFamily: 'inherit', fontSize: 15, fontWeight: 800, color: '#26336B', cursor: 'pointer' }}>{o}</motion.button>)}
      </div>
    </div>
  );
}

function Bab({ b, i, back, next, go }) {
  const hifz = useStore((s) => s.tuhfa) || [], toggle = useStore((s) => s.tuhfaToggle);
  // الباب كله بيتقال ورا بعضه لوحده: الأبيات ← الشرح ← القواعد، والكارت اللي بيتقال بيتلوّن وبيظهر قدامك
  const items = [...b.v.map((v, k) => ({ id: 'v' + k, t: verseLine(v) })), ...b.sh.map((t, k) => ({ id: 's' + k, t })), ...b.rules.map((r, k) => ({ id: 'r' + k, t: r.n + '. ' + r.d })), ...(tuhfaQuiz(b).length ? [{ id: 'g', t: TUHFA_Q }] : [])];
  const [cur, setCur] = useState(null), [exOn, setExOn] = useState(null);
  const run = useRef(0), refs = useRef({});
  const n0 = firstVerse(i);
  const stop = () => { run.current++; hush(); stopEx(); setCur(null); setExOn(null); };
  const playFrom = async (from = 0) => {
    const my = ++run.current;
    for (let k = from; k < items.length; k++) {
      if (run.current !== my) return;
      setCur(items[k].id);
      refs.current[items[k].id]?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
      await say(items[k].t);
      if (run.current !== my) return;
      // بعد شرح القاعدة: الشيخ يقرا أمثلتها واحد واحد، والمثال اللي بيتقري بينوّر
      const rule = items[k].id[0] === 'r' && b.rules[+items[k].id.slice(1)];
      for (const w of (rule?.ex || []).filter(exUrl)) {
        await new Promise((r) => setTimeout(r, 300));
        if (run.current !== my) return;
        setExOn(items[k].id + w); await playEx(w); setExOn(null);
        if (run.current !== my) return;
      }
      await new Promise((r) => setTimeout(r, 350));
    }
    if (run.current === my) setCur(null);
  };
  const tap = (id) => { sfx.tap(); stopEx(); playFrom(items.findIndex((x) => x.id === id)); };
  // دوس على أي مثال: الشيخ يقراه لوحده
  const tapEx = async (e, id, w) => { e.stopPropagation(); if (!exUrl(w)) return; run.current++; hush(); setCur(null); setExOn(id + w); await playEx(w); setExOn((x) => (x === id + w ? null : x)); };
  const reg = (id) => (el) => { refs.current[id] = el; };
  useEffect(() => { const t = setTimeout(() => playFrom(0), 450); return () => { clearTimeout(t); run.current++; hush(); stopEx(); }; }, [b.id]);
  const ok = hifz.includes(b.id);
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone="warm" />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Back onClick={back} />
        <div style={{ flex: 1 }}><h1 style={{ fontSize: 23, fontWeight: 800, color: b.c }}>{b.t}</h1><div style={{ fontSize: 13, fontWeight: 700, color: '#6D7896' }}>الأبيات {ar(n0 + 1)}{b.v.length > 1 ? ` – ${ar(n0 + b.v.length)}` : ''} من تحفة الأطفال</div></div>
        <HomeBtn />
      </div>
      <div className="card" style={{ position: 'relative', padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 4, background: 'linear-gradient(180deg,#FFFDF5,#FFF6DD)' }}>
        <button type="button" onClick={() => { stop(); go('tuhfa', 'song/' + b.id); }} style={{ alignSelf: 'center', borderRadius: 16, border: `2px solid ${b.c}`, background: '#fff', color: b.c, padding: '6px 14px', fontFamily: 'inherit', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>🎵 اسمع الباب بالأنشودة</button>
        {cur ? <button type="button" onClick={stop} style={{ alignSelf: 'center', borderRadius: 16, border: 0, background: '#E5484D', color: '#fff', padding: '8px 18px', fontFamily: 'inherit', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>■ وقّف الصوت</button>
          : <button type="button" onClick={() => playFrom(0)} style={{ alignSelf: 'center', borderRadius: 16, border: 0, background: b.c, color: '#fff', padding: '8px 18px', fontFamily: 'inherit', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>▶ اسمع الباب كله</button>}
        {b.v.map((v, k) => (
          <motion.button key={k} ref={reg('v' + k)} type="button" onClick={() => tap('v' + k)} animate={{ background: cur === 'v' + k ? b.bg : 'rgba(255,255,255,0)' }}
            style={{ border: 0, borderRadius: 12, padding: '4px 6px', cursor: 'pointer', fontFamily: 'inherit', display: 'grid', gridTemplateColumns: '22px 1fr', alignItems: 'center', gap: 4, textAlign: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: b.c }}>{ar(n0 + k + 1)}</span>
            <span className="ayah" style={{ fontSize: 'clamp(16px, 4.8vw, 20px)', color: '#3A2A12', lineHeight: 1.75, display: 'flex', flexDirection: 'column' }}><span style={{ textAlign: 'right' }}>{v[0]}</span><span style={{ textAlign: 'left' }}>{v[1]}</span></span>
          </motion.button>
        ))}
      </div>
      {b.sh.map((t, k) => <button key={k} ref={reg('s' + k)} type="button" onClick={() => tap('s' + k)} className="card" style={{ position: 'relative', border: 0, outline: cur === 's' + k ? `3px solid ${b.c}` : 'none', textAlign: 'right', padding: 12, fontFamily: 'inherit', fontSize: 15, fontWeight: 700, lineHeight: 1.8, color: '#26336B', background: b.bg, cursor: 'pointer' }}>{cur === 's' + k ? '🔊' : '▶'} {t}</button>)}
      {b.rules.map((r, k) => (
        <motion.button key={k} ref={reg('r' + k)} type="button" onClick={() => tap('r' + k)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: k * 0.05 }} className="card"
          style={{ position: 'relative', border: 0, borderInlineStart: `6px solid ${b.c}`, outline: cur === 'r' + k ? `3px solid ${b.c}` : 'none', textAlign: 'right', padding: 12, fontFamily: 'inherit', background: cur === 'r' + k ? b.bg : '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6, color: '#26336B' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}><b style={{ fontSize: 18, color: b.c }}>{r.n}</b>{r.l && <span style={{ fontSize: 13, fontWeight: 800, background: b.bg, color: b.c, borderRadius: 10, padding: '2px 10px' }}>{r.l}</span>}</span>
          <span style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.7 }}>{r.d}</span>
          {r.ex.length > 0 && <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{r.ex.map((w) => { const on = exOn === 'r' + k + w; return <span key={w} role="button" tabIndex={0} aria-label={'اسمع الشيخ يقرا ' + w} onClick={(e) => tapEx(e, 'r' + k, w)} className="ayah" style={{ fontSize: 21, background: on ? '#FFD66B' : '#FFF6DD', outline: on ? `3px solid ${b.c}` : 'none', transform: on ? 'scale(1.08)' : 'none', transition: 'all .2s', borderRadius: 10, padding: '0 10px', color: '#3A2A12', cursor: 'pointer' }}>{exUrl(w) ? (on ? '🔊 ' : '▶ ') : ''}{w}</span>; })}</span>}
        </motion.button>
      ))}
      <div ref={reg('g')} onPointerDownCapture={() => { if (cur) { run.current++; setCur(null); } }}><Game b={b} /></div>
      <div onPointerDownCapture={() => { if (cur) { run.current++; setCur(null); } }} style={{ position: 'relative', display: 'flex', gap: 8 }}>
        <button type="button" onClick={() => { toggle(b.id); if (!ok) { sfx.star(); say('برافو!'); } }} style={{ flex: 1, borderRadius: 18, padding: 12, border: ok ? 0 : `3px solid ${b.c}`, background: ok ? b.c : '#fff', color: ok ? '#fff' : b.c, fontFamily: 'inherit', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>{ok ? '✓ حفظت الأبيات' : 'حفظت الأبيات'}</button>
        {next && <button type="button" onClick={next} style={{ flex: 1, borderRadius: 18, padding: 12, border: 0, background: b.c, color: '#fff', fontFamily: 'inherit', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>الباب الجاي ◀</button>}
      </div>
    </div>
  );
}

// الأنشودة كاملة بأصوات الأطفال، والأبيات بتظهر وتنوّر كلمة كلمة مع الغُنا
const SONG_INTRO = 'تحفة الأطفال أبيات شعرية منظومة من واحد وستين بيتًا، بيّن فيها الشيخ سليمان الجمزوري رحمه الله بعض أحكام التلاوة والتجويد بشكل مبسّط للأطفال. هيّا بنا نتعلّمها سويًّا';
const VERSES = TUHFA.flatMap((b) => b.v.map((v) => ({ v, b })));
const SONG_LINES = TUHFA_SONG.map((l) => ({ ...l, g: l.k === 'v' ? 'v' + l.n + (l.r ? 'r' : '') : l.k === 'title' ? 'T' + l.b : 'intro' }));
function TuhfaSong({ back, from }) {
  const startAt = from ? (SONG_LINES.find((l) => (l.k === 'title' && l.b === from) || (from === 't1' && l.k === 'v' && l.n === 1))?.s || 0) : 0;
  const stage = (l, frac) => {
    if (!l) return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}><div style={{ fontSize: 46 }}>📜</div><div style={{ fontSize: 22, fontWeight: 800, color: '#8C5A1F' }}>متن تحفة الأطفال</div><div style={{ fontSize: 14, fontWeight: 700, color: '#6D7896' }}>٦١ بيت بأصوات الأطفال • اسمع وردّد</div></div>;
    if (l.k === 'talk') return <Fill text={SONG_INTRO} frac={frac} on="#26336B" off="#B8BFD3" style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.9 }} />;
    if (l.k === 'title') { const b = TUHFA.find((x) => x.id === l.b);
      return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <motion.div animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 0.8 }} style={{ fontSize: 50 }}>{b.e}</motion.div>
        <div style={{ fontSize: 13, fontWeight: 800, color: b.c, background: b.bg, borderRadius: 12, padding: '2px 12px' }}>الباب {ar(TUHFA.indexOf(b) + 1)} من {ar(TUHFA.length)}</div>
        <div style={{ fontSize: 27, fontWeight: 800, color: b.c }}>{b.t}</div>
      </div>; }
    const { v, b } = VERSES[l.n - 1];
    const half = (h) => (l.h === h ? <Fill text={v[h]} frac={frac} on="#3A2A12" off="#C9B99A" /> : <span style={{ color: l.h > h ? '#3A2A12' : '#C9B99A' }}>{v[h]}</span>);
    return <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: '#fff', background: b.c, borderRadius: 12, padding: '2px 10px' }}>البيت {ar(l.n)} من ٦١</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: b.c, background: b.bg, borderRadius: 12, padding: '2px 10px' }}>{b.e} {b.t}</span>
        {l.r ? <span style={{ fontSize: 12, fontWeight: 800, color: '#B07A12', background: '#FFF3D6', borderRadius: 12, padding: '2px 10px' }}>🔁 تاني</span> : null}
      </div>
      <div className="ayah" style={{ fontSize: 'clamp(22px, 6.4vw, 30px)', lineHeight: 1.9, display: 'flex', flexDirection: 'column' }}>
        <span style={{ textAlign: 'right' }}>{half(0)}</span><span style={{ textAlign: 'left' }}>{half(1)}</span>
      </div>
    </div>;
  };
  const row = (l, on) => {
    if (l.k === 'talk') return <span style={{ fontSize: 14, fontWeight: 800, color: '#6D7896' }}>🎙 المقدمة</span>;
    if (l.k === 'title') { const b = TUHFA.find((x) => x.id === l.b); return <span style={{ display: 'block', fontSize: 16, fontWeight: 800, color: b.c, paddingTop: 6 }}>{b.e} {b.t}</span>; }
    const { v, b } = VERSES[l.n - 1];
    return <span style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: 4, alignItems: 'center' }}>
      <span style={{ fontSize: 12, fontWeight: 800, color: b.c }}>{l.r ? '🔁' : ar(l.n)}</span>
      <span className="ayah" style={{ fontSize: 17, lineHeight: 1.7, color: on ? '#3A2A12' : '#5B4A32', display: 'flex', flexDirection: 'column' }}><span style={{ textAlign: 'right' }}>{v[0]}</span><span style={{ textAlign: 'left' }}>{v[1]}</span></span>
    </span>;
  };
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone="warm" />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Back onClick={back} />
        <div style={{ flex: 1 }}><h1 style={{ fontSize: 23, fontWeight: 800, color: '#8C5A1F' }}>🎵 أنشودة تحفة الأطفال</h1><div style={{ fontSize: 13, fontWeight: 700, color: '#6D7896' }}>المتن كامل بأصوات الأطفال — ردّد معاهم</div></div>
        <HomeBtn />
      </div>
      <SyncSong src={`${import.meta.env.BASE_URL}audio/nasheed/tuhfa.mp3`} lines={SONG_LINES} c="#8C5A1F" bg="#FFF3D6" start={startAt} stage={stage} row={row} />
    </div>
  );
}

export default function Tuhfa({ arg, back, go, swap }) {
  const hifz = useStore((s) => s.tuhfa) || [];
  const i = TUHFA.findIndex((b) => b.id === arg);
  useEffect(() => { if (i < 0 && !(arg || '').startsWith('song')) hubSay(TUHFA_INTRO); return () => hush(); }, [i, arg]);
  if (arg && arg.startsWith('song')) return <TuhfaSong key={arg} back={back} from={arg.split('/')[1]} />;
  if (i >= 0) return <Bab key={arg} b={TUHFA[i]} i={i} back={back} go={go} next={TUHFA[i + 1] ? () => swap('tuhfa', TUHFA[i + 1].id) : null} />;
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone="warm" />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Back onClick={back} />
        <div style={{ flex: 1 }}><h1 style={{ fontSize: 25, fontWeight: 800, color: '#8C5A1F' }}>تحفة الأطفال</h1><div style={{ fontSize: 13, fontWeight: 700, color: '#6D7896' }}>منظومة التجويد للشيخ سليمان الجمزوري — ٦١ بيت</div></div>
        <div style={{ textAlign: 'center' }}><div style={{ fontSize: 22, fontWeight: 800, color: '#8C5A1F' }}>{ar(hifz.length)}</div><div style={{ fontSize: 11, fontWeight: 700 }}>من {ar(TUHFA.length)}</div></div>
      </div>
      <div className="progress" style={{ position: 'relative', height: 10 }}><i style={{ width: `${(hifz.length / TUHFA.length) * 100}%`, background: 'linear-gradient(90deg,#E07F1E,#F5A623)' }} /></div>
      <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => { sfx.pop(); go('tuhfa', 'song'); }} className="card"
        style={{ position: 'relative', border: 0, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, background: 'linear-gradient(120deg,#8C5A1F,#E07F1E 60%,#F5A623)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right' }}>
        <motion.span animate={{ scale: [1, 1.12, 1] }} transition={{ repeat: Infinity, duration: 1.6 }} style={{ width: 54, height: 54, borderRadius: 27, background: '#fff', color: '#8C5A1F', display: 'grid', placeItems: 'center', fontSize: 24, flexShrink: 0 }}>🎵</motion.span>
        <span style={{ flex: 1 }}><span style={{ display: 'block', fontSize: 18, fontWeight: 800 }}>الأنشودة كاملة</span><span style={{ display: 'block', fontSize: 13, fontWeight: 700, opacity: 0.95 }}>٦١ بيت بأصوات الأطفال، والكلام بيظهر مع الغُنا</span></span>
        <span style={{ fontSize: 22 }}>◀</span>
      </motion.button>
      {TUHFA.map((b, k) => { const ok = hifz.includes(b.id);
        return (
          <motion.button key={b.id} type="button" initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: k * 0.03 }} whileTap={{ scale: 0.97 }} onClick={() => { sfx.pop(); go('tuhfa', b.id); }} className="card"
            style={{ position: 'relative', border: ok ? `3px solid ${b.c}` : '3px solid transparent', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 12, background: '#fff', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right', color: '#26336B' }}>
            <span style={{ width: 50, height: 50, borderRadius: 16, background: b.bg, color: b.c, display: 'grid', placeItems: 'center', fontSize: 22, fontWeight: 800, flexShrink: 0 }}>{ok ? '✓' : ar(k + 1)}</span>
            <span style={{ flex: 1 }}><span style={{ display: 'block', fontSize: 17, fontWeight: 800 }}>{b.t}</span><span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6D7896' }}>{ar(b.v.length)} {b.v.length > 2 ? 'أبيات' : 'بيت'}{b.rules.length ? ` • ${ar(b.rules.length)} قواعد` : ''}</span></span>
            <span style={{ fontSize: 22, color: b.c }}>◀</span>
          </motion.button>
        ); })}
    </div>
  );
}
