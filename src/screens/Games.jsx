import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Sky from '../components/Sky';
import Siraj from '../components/Siraj';
import { Confetti } from '../components/Reward';
import { Btn, Bubble, IconBtn, I, LightChip, HomeBtn } from '../components/ui';
import { useStore } from '../store';
import DIcon from '../art/Icons';
import { A, ar } from '../lib/asset';
import { sfx } from '../lib/sound';
import { say, hubSay, hush, leave } from '../lib/voice';
import { HUB } from '../data/speech';
import { OrderGame, FillGame, MatchGame } from './LearnGames';
import { Duel, TrueFalse, Riddle, QuizChallenge } from './Arena';
import { Scramble, Million, WordSearch, AyahOrder } from './WordGames';
import Jigsaw from './play/Jigsaw';
import Pegs from './play/Pegs';
import { Shadows, Prophets } from './play/Connect';
import { SpotDiff, Hidden } from './play/Scenes';
import Maze from './play/Maze';
import { Odd, Count } from './play/Mini';

const FACES = ['moon', 'lantern', 'mosque', 'camel', 'dates', 'palm', 'siraj', 'bashir', 'jug', 'tasbih', 'rug', 'mushaf'];
// «ألعب وأتعلّم»: كارت كبير للبازل، وتحته شبكة الألعاب الجديدة
const pegArt = (t, cs, dir) => <span style={{ display: 'flex', gap: 4, direction: dir || 'inherit' }}>{[...t].map((ch, i) => <span key={i} style={{ fontSize: 30, fontWeight: 800, color: cs[i % cs.length], WebkitTextStroke: '1.5px #fff', paintOrder: 'stroke fill', textShadow: '0 3px 0 rgba(0,0,0,.18)' }}>{ch}</span>)}</span>;
const PLAY = [
  { id: 'pegs-letters', t: 'لوحة الحروف', d: 'كل حرف في مكانه', bg: 'linear-gradient(160deg,#F3D7A8,#D9A55F)', art: pegArt('أبت', ['#E5484D', '#2FB383', '#3A8FE0']) },
  { id: 'pegs-numbers', t: 'لوحة الأرقام', d: 'من ١ لـ ٢٠', bg: 'linear-gradient(160deg,#F3D7A8,#D9A55F)', art: pegArt('١٢٣', ['#7B5CE0', '#F5A623', '#E0609E'], 'ltr') },
  { id: 'pegs-shapes', t: 'لوحة الأشكال', d: 'للصغيرين', bg: 'linear-gradient(160deg,#F3D7A8,#D9A55F)', art: pegArt('●▲■', ['#3A8FE0', '#E5484D', '#2FB383']) },
  { id: 'shadows', t: 'الظل وصاحبه', d: 'وصّل كل ظل', bg: 'linear-gradient(160deg,#3B3F8C,#7B5CE0)', art: <span style={{ display: 'flex', gap: 6 }}><img src={A('stickers/camel')} alt="" style={{ height: 52, filter: 'brightness(0) invert(1) opacity(.35)' }} /><img src={A('stickers/camel')} alt="" style={{ height: 52 }} /></span> },
  { id: 'prophets', t: 'الأنبياء ومعجزاتهم', d: 'وصّل النبي بمعجزته', bg: 'linear-gradient(160deg,#1F8A61,#3CC48F)', art: <span style={{ display: 'flex', gap: 2 }}><img src={A('stickers/ark')} alt="" style={{ height: 50 }} /><img src={A('stickers/whale')} alt="" style={{ height: 44 }} /></span> },
  { id: 'diff', t: 'أوجد الاختلافات', d: '٣ لـ ٧ اختلافات', bg: 'linear-gradient(160deg,#E0609E,#FF9BC4)', art: <span style={{ display: 'flex', gap: 5 }}>{[0, 1].map((k) => <span key={k} style={{ position: 'relative', width: 46, height: 46, borderRadius: 10, overflow: 'hidden', border: '2px solid #fff' }}><img src={A('games/puzzles/garden')} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />{k ? <img src={A('rewards/star')} alt="" style={{ position: 'absolute', width: 18, top: 6, left: 6 }} /> : null}</span>)}</span> },
  { id: 'hidden', t: 'دوّر وانت تلاقي', d: 'حاجات مستخبية', bg: 'linear-gradient(160deg,#E07F1E,#FFC93C)', art: <span style={{ position: 'relative' }}><img src={A('games/puzzles/harbor')} alt="" style={{ width: 70, height: 50, objectFit: 'cover', borderRadius: 10, border: '2px solid #fff' }} /><span style={{ position: 'absolute', bottom: -8, left: -10, fontSize: 30 }}>🔍</span></span> },
  { id: 'maze', t: 'المتاهة', d: 'وصّل سراج للمسجد', bg: 'linear-gradient(160deg,#2C6BC4,#5FA8F0)', art: <svg width="64" height="54" viewBox="0 0 64 54"><path d="M4 4h56v46H4zM16 4v30M28 50V20M40 4v30M52 50V16M16 34h12M40 34h12" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" /><circle cx="10" cy="44" r="4.5" fill="#FFE38A" /></svg> },
  { id: 'odd', t: 'مين المختلف؟', d: 'لاقي الحاجة الغريبة', bg: 'linear-gradient(160deg,#7B5CE0,#B59BFF)', art: <span style={{ fontSize: 30, letterSpacing: 2 }}>🍎🍌<img src={A('stickers/camel')} alt="" style={{ height: 36, verticalAlign: 'middle' }} /></span> },
  { id: 'count', t: 'عدّ وطابق', d: 'لحد ٢٠', bg: 'linear-gradient(160deg,#1F8FA6,#4FC6DC)', art: <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{[0, 1, 2].map((k) => <img key={k} src={A('rewards/star')} alt="" style={{ height: 30 }} />)}<span style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>=٣</span></span> },
];
function PlayHub({ go }) {
  return (
    <>
      <h2 style={{ position: 'relative', fontSize: 22, fontWeight: 800 }}>ألعب وأتعلّم 🎨 <span style={{ fontSize: 13, background: '#FF7E6B', color: '#fff', borderRadius: 10, padding: '2px 8px', verticalAlign: 'middle' }}>جديد</span></h2>
      <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => { sfx.pop(); go('games', 'jigsaw'); }} className="card"
        style={{ position: 'relative', border: 0, padding: 0, cursor: 'pointer', fontFamily: 'inherit', overflow: 'hidden', minHeight: 132, display: 'flex', textAlign: 'right', background: '#26336B', boxShadow: '0 6px 0 #18214A' }}>
        <img src={A('games/puzzles/mosque')} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }} />
        <svg viewBox="0 0 100 60" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.5 }}><path d="M33 0V60M66 0V60M0 30H100" stroke="#fff" strokeWidth="0.6" strokeDasharray="2 1.5" fill="none" /></svg>
        <div style={{ position: 'relative', padding: 14, color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, background: 'linear-gradient(90deg, transparent, rgba(20,24,60,.75) 55%)', width: '100%' }}>
          <div style={{ fontSize: 26, fontWeight: 800 }}>🧩 البازل</div>
          <div style={{ fontSize: 14, fontWeight: 700, opacity: 0.95 }}>من ٤ لـ ٢٥ قطعة • واعمل بازل من صورتك 📸</div>
        </div>
      </motion.button>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 }}>
        {PLAY.map((g, k) => (
          <motion.button key={g.id} type="button" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: k * 0.04 }} whileTap={{ scale: 0.95 }} onClick={() => { sfx.pop(); go('games', g.id); }} className="card"
            style={{ border: 0, padding: 0, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'right', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <span style={{ height: 78, background: g.bg, display: 'grid', placeItems: 'center' }}>{g.art}</span>
            <span style={{ padding: '8px 10px' }}><span style={{ display: 'block', fontSize: 16, fontWeight: 800, color: '#26336B' }}>{g.t}</span><span style={{ fontSize: 12, fontWeight: 700, color: '#6D7896' }}>{g.d}</span></span>
          </motion.button>
        ))}
      </div>
    </>
  );
}

const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

export default function Games({ arg, go, back }) {
  const age = useStore((s) => s.profile?.age || '7-9');
  if (arg === 'duel') return <Duel age={age} back={back} />;
  if (arg === 'tf') return <TrueFalse back={back} />;
  if (arg === 'riddle') return <Riddle back={back} />;
  if (arg === 'quiz') return <QuizChallenge age={age} back={back} />;
  if (arg === 'memory') return <Memory age={age} back={back} />;
  if (arg === 'jigsaw' || arg?.startsWith('jigsaw/')) return <Jigsaw arg={arg} back={back} go={go} />;
  if (arg === 'odd') return <Odd back={back} />;
  if (arg === 'count') return <Count back={back} />;
  if (arg === 'maze') return <Maze back={back} />;
  if (arg === 'diff') return <SpotDiff back={back} />;
  if (arg === 'hidden') return <Hidden back={back} />;
  if (arg === 'shadows') return <Shadows back={back} />;
  if (arg === 'prophets') return <Prophets back={back} />;
  if (arg?.startsWith('pegs-')) return <Pegs key={arg} kind={arg.slice(5)} back={back} />;
  if (arg?.startsWith('puzzle-')) return <Jigsaw arg={'jigsaw/' + arg.slice(7)} back={back} go={go} />;
  if (arg === 'scramble') return <Scramble age={age} back={back} />;
  if (arg === 'million') return <Million age={age} back={back} />;
  if (arg === 'search') return <WordSearch age={age} back={back} />;
  if (arg === 'ayahorder') return <AyahOrder age={age} back={back} />;
  if (arg === 'order') return <OrderGame age={age} back={back} />;
  if (arg === 'fill') return <FillGame back={back} />;
  if (arg === 'match') return <MatchGame age={age} back={back} />;
  useEffect(() => { hubSay(HUB.games); return () => leave(); }, []);
  return (
    <div className="screen with-nav" style={{ gap: 14 }}>
      <Sky tone="lilac" />
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h1 style={{ fontSize: 32, fontWeight: 800 }}>الألعاب</h1><LightChip /></div>
      <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => { sfx.pop(); go('games', 'duel'); }} className="card"
        style={{ position: 'relative', border: 0, padding: 14, cursor: 'pointer', fontFamily: 'inherit', color: '#fff', textAlign: 'right', background: 'linear-gradient(120deg, #3A8FE0, #7B5CE0 55%, #FF7E6B)', boxShadow: '0 6px 0 #5A3DBF', display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden', flexShrink: 0, minHeight: 88 }}>
        <div style={{ display: 'flex' }}><img src={A('characters/bashir/face_happy')} alt="" style={{ width: 58, height: 58, objectFit: 'contain', background: '#fff', borderRadius: 29, border: '3px solid #3A8FE0' }} /><img src={A('characters/mishmish/face_happy')} alt="" style={{ width: 58, height: 58, objectFit: 'contain', background: '#fff', borderRadius: 29, border: '3px solid #FF7E6B', marginInlineStart: -14 }} /></div>
        <div style={{ flex: 1 }}><div style={{ fontSize: 24, fontWeight: 800 }}>تحدّي الأبطال ⚡</div><div style={{ fontSize: 14, fontWeight: 700, opacity: 0.95 }}>اتنين على نفس الموبايل… مين الأسرع؟</div></div>
      </motion.button>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 8, flexShrink: 0 }}>
        {[{ id: 'quiz', t: 'مسابقة الأبطال', ic: 'star', c: '#F5A623' }, { id: 'tf', t: 'صح ولا غلط؟', ic: 'shield', c: '#2FB383' }, { id: 'riddle', t: 'مين أنا؟', ic: 'wow', c: '#7B5CE0' }].map((g) => (
          <motion.button key={g.id} type="button" whileTap={{ scale: 0.95 }} onClick={() => { sfx.pop(); go('games', g.id); }} className="card"
            style={{ border: `3px solid ${g.c}`, padding: '10px 4px', cursor: 'pointer', fontFamily: 'inherit', color: '#26336B', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: g.c + '12' }}>
            <DIcon id={g.ic} size={50} /><span style={{ fontSize: 15, fontWeight: 800 }}>{g.t}</span>
          </motion.button>
        ))}
      </div>
      <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => { sfx.pop(); go('games', 'memory'); }} className="card"
        style={{ position: 'relative', padding: 12, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'right', borderColor: '#9D7CFF' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 44px)', gap: 4 }}>
          {['back', 'moon', 'siraj', 'back'].map((k, i) => <img key={i} src={A('games/memory/' + k)} alt="" style={{ width: 44, height: 50, objectFit: 'cover', borderRadius: 10 }} />)}
        </div>
        <div style={{ flex: 1 }}><div style={{ fontSize: 24, fontWeight: 800 }}>لعبة الذاكرة</div><div style={{ color: '#5D6CA0', fontWeight: 700 }}>اقلب الكروت ولاقي الأزواج</div></div>
      </motion.button>
      <PlayHub go={go} />
      <h2 style={{ position: 'relative', fontSize: 22, fontWeight: 800 }}>ألعاب الكلمات</h2>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 }}>
        {[{ id: 'million', t: 'سؤال المليون', d: '١٠ أسئلة بتصعب', e: '🏆', c: '#2B3D8C', bg: 'linear-gradient(135deg,#2B3D8C,#4A5FC0)' },
          { id: 'scramble', t: 'حروف مبعثرة', d: 'كوّن الكلمة', e: 'ح ر ف', c: '#7B5CE0', bg: 'linear-gradient(135deg,#7B5CE0,#B59BFF)' },
          { id: 'search', t: 'دوّر على الكلمة', d: 'كلمات مستخبية', e: '🔎', c: '#1F8A61', bg: 'linear-gradient(135deg,#1F8A61,#3CC48F)' },
          { id: 'ayahorder', t: 'رتّب الآية', d: 'من جزء عمّ', e: '📖', c: '#E07F1E', bg: 'linear-gradient(135deg,#E07F1E,#FFC93C)' }].map((g, k) => (
          <motion.button key={g.id} type="button" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: k * 0.06 }} whileTap={{ scale: 0.95 }} onClick={() => { sfx.pop(); go('games', g.id); }} className="card"
            style={{ border: 0, padding: 12, cursor: 'pointer', fontFamily: 'inherit', color: '#fff', textAlign: 'right', background: g.bg, boxShadow: `0 5px 0 ${g.c}66`, minHeight: 104, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <span style={{ fontSize: g.e.length > 3 ? 22 : 30, fontWeight: 800, letterSpacing: g.e.length > 3 ? 4 : 0 }}>{g.e}</span>
            <span><span style={{ display: 'block', fontSize: 19, fontWeight: 800 }}>{g.t}</span><span style={{ fontSize: 13, fontWeight: 700, opacity: 0.92 }}>{g.d}</span></span>
          </motion.button>
        ))}
      </div>
      <h2 style={{ position: 'relative', fontSize: 22, fontWeight: 800 }}>ألعاب نتعلّم بيها</h2>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[{ id: 'order', t: 'رتّب الوضوء', d: 'حط الخطوات بالترتيب', img: 'games/memory/jug', c: '#2FB383' }, { id: 'fill', t: 'كمّل الآية', d: 'اختار الكلمة الناقصة واسمع الشيخ', img: 'games/memory/mushaf', c: '#9B7BF2' }, { id: 'match', t: 'وصّل الذكر بوقته', d: 'كل ذكر وإمتى بنقوله', img: 'games/memory/tasbih', c: '#FF89B5' }].map((g) => (
          <motion.button key={g.id} type="button" whileTap={{ scale: 0.97 }} onClick={() => { sfx.pop(); go('games', g.id); }} className="card"
            style={{ border: 0, padding: 10, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'right', fontFamily: 'inherit', color: '#26336B', boxShadow: `0 5px 0 ${g.c}44, 0 10px 20px rgba(38,51,107,.08)` }}>
            <img src={A(g.img)} alt="" style={{ width: 62, height: 62, borderRadius: 18, objectFit: 'cover' }} />
            <div style={{ flex: 1 }}><div style={{ fontSize: 20, fontWeight: 800 }}>{g.t}</div><div style={{ fontSize: 14, fontWeight: 600, color: '#6D7896' }}>{g.d}</div></div>
            <span style={{ width: 44, height: 44, borderRadius: 22, background: g.c, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M16 5L7 12l9 7z" fill="#fff" /></svg></span>
          </motion.button>
        ))}
      </div>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 4, marginTop: 6 }}>
        <img src={A('characters/mishmish/play')} alt="مشمش" style={{ width: 120, objectFit: 'contain' }} />
        <Bubble tail="r" style={{ flex: 1, marginBottom: 14 }}>مشمش بيحب الألعاب! كل لعبة بتكسبها بتزوّد نور الجرة.</Bubble>
      </div>
    </div>
  );
}

// ظهر الكارت: زخرفة نجوم إسلامية خضرا ودهبي، وفي النص نجمة دهبي جواها «؟» عشان الطفل يفهم إنه يقلبه
const star8 = (cx, cy, R, r) => Array.from({ length: 16 }, (_, i) => { const a = (Math.PI / 8) * i - Math.PI / 2, d = i % 2 ? r : R; return `${(cx + d * Math.cos(a)).toFixed(1)},${(cy + d * Math.sin(a)).toFixed(1)}`; }).join(' ');
function CardBack() {
  return (
    <svg viewBox="0 0 100 116" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: 16, backfaceVisibility: 'hidden', boxShadow: '0 4px 0 rgba(20,60,50,.25)' }} aria-hidden="true">
      <defs>
        <linearGradient id="mbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#14A38B" /><stop offset="1" stopColor="#0B5E63" /></linearGradient>
        <linearGradient id="mgold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE38A" /><stop offset="1" stopColor="#F2A93B" /></linearGradient>
        <pattern id="mpat" width="25" height="25" patternUnits="userSpaceOnUse">
          <polygon points={star8(12.5, 12.5, 9, 4.6)} fill="none" stroke="#fff" strokeOpacity="0.16" strokeWidth="1.2" />
          <circle cx="0" cy="0" r="2" fill="#fff" fillOpacity="0.12" /><circle cx="25" cy="25" r="2" fill="#fff" fillOpacity="0.12" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="100" height="116" rx="14" fill="url(#mbg)" />
      <rect x="0" y="0" width="100" height="116" rx="14" fill="url(#mpat)" />
      <rect x="5" y="5" width="90" height="106" rx="11" fill="none" stroke="url(#mgold)" strokeWidth="2.5" />
      <rect x="9" y="9" width="82" height="98" rx="8" fill="none" stroke="#FFE38A" strokeOpacity="0.45" strokeWidth="1" strokeDasharray="2 3" />
      <polygon points={star8(50, 58, 30, 22)} fill="url(#mgold)" stroke="#fff" strokeWidth="1.5" />
      <circle cx="50" cy="58" r="17" fill="#0E7468" stroke="#FFE38A" strokeWidth="1.5" />
      <text x="50" y="68" textAnchor="middle" fontSize="27" fontWeight="800" fill="#FFE38A" style={{ fontFamily: 'inherit' }}>؟</text>
      {[[17, 18], [83, 18], [17, 98], [83, 98]].map(([x, y]) => <polygon key={x + '-' + y} points={star8(x, y, 5, 2.4)} fill="#FFE38A" />)}
    </svg>
  );
}

// مستوى اللعبة: عدد الأزواج والأعمدة
const MEM_LEVELS = [{ id: 'easy', t: 'سهل', pairs: 6, cols: 3 }, { id: 'mid', t: 'متوسط', pairs: 8, cols: 4 }, { id: 'hard', t: 'صعب', pairs: 12, cols: 4 }];
function Memory({ age, back }) {
  const win = useStore((s) => s.win);
  const [lv, setLv] = useState(age === '4-6' ? 'easy' : age === '7-9' ? 'mid' : 'hard');
  const L = MEM_LEVELS.find((x) => x.id === lv), pairs = L.pairs, cols = L.cols;
  const [seed, setSeed] = useState(0);
  const deck = useMemo(() => shuffle(shuffle(FACES).slice(0, pairs).flatMap((f) => [f, f])), [seed, pairs]);
  const [open, setOpen] = useState([]), [got, setGot] = useState([]), [tries, setTries] = useState(0);
  const t = useRef();
  useEffect(() => () => clearTimeout(t.current), []);
  const won = got.length === pairs;
  useEffect(() => { if (won) { sfx.good(); say('ذاكرتك نوّرت! برافو'); win('memory'); } }, [won]);
  const flip = (i) => {
    if (open.includes(i) || got.includes(deck[i]) || open.length === 2) return;
    sfx.flip();
    const o = [...open, i]; setOpen(o);
    if (o.length === 2) {
      setTries(tries + 1);
      if (deck[o[0]] === deck[o[1]]) { setTimeout(() => sfx.sparkle(), 200); setGot([...got, deck[i]]); setOpen([]); }
      else t.current = setTimeout(() => setOpen([]), 850);
    }
  };
  const again = () => { clearTimeout(t.current); setOpen([]); setGot([]); setTries(0); setSeed(seed + 1); };
  const pick = (id) => { if (id === lv) return; sfx.tap(); clearTimeout(t.current); setLv(id); setOpen([]); setGot([]); setTries(0); setSeed(seed + 1); };
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone="lilac" />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconBtn icon={I.back} label="رجوع" onClick={back} />
        <h1 style={{ flex: 1, fontSize: 26, fontWeight: 800 }}>لعبة الذاكرة</h1>
        <HomeBtn />
        <span className="chip" style={{ paddingInline: 12 }}>{ar(got.length)} / {ar(pairs)}</span>
      </div>
      <div style={{ position: 'relative', display: 'flex', gap: 8, justifyContent: 'center' }}>
        {MEM_LEVELS.map((x) => <button key={x.id} type="button" onClick={() => pick(x.id)} style={{ flex: 1, border: 0, borderRadius: 16, padding: '8px 6px', fontFamily: 'inherit', fontWeight: 800, fontSize: 15, cursor: 'pointer', background: lv === x.id ? '#0E7468' : '#fff', color: lv === x.id ? '#FFE38A' : '#0E7468', boxShadow: '0 3px 0 rgba(20,60,50,.15)' }}>{x.t}<span style={{ display: 'block', fontSize: 11, opacity: 0.85 }}>{ar(x.pairs * 2)} كارت</span></button>)}
      </div>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: pairs > 8 ? 6 : 8, perspective: 800 }}>
        {deck.map((f, i) => {
          const up = open.includes(i) || got.includes(f);
          return (
            <motion.button key={seed + '-' + i} type="button" onClick={() => flip(i)} aria-label={up ? 'كارت مقلوب' : 'اقلب الكارت'} initial={{ opacity: 0, y: 14, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.025 }} style={{ border: 0, padding: 0, background: 'transparent', aspectRatio: '0.86', cursor: 'pointer' }}>
              <motion.div animate={{ rotateY: up ? 180 : 0, scale: got.includes(f) ? [1, 1.08, 1] : 1 }} transition={{ duration: 0.4 }} style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d' }}>
                <CardBack />
                <img src={A('games/memory/' + f)} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: 16, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', boxShadow: got.includes(f) ? '0 0 0 4px #4FCB6B' : '0 4px 0 rgba(34,48,106,.15)' }} />
              </motion.div>
            </motion.button>
          );
        })}
      </div>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 800, color: '#5D6CA0' }}>محاولات: {ar(tries)}</div>
      {won && (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <Confetti n={30} />
          <Siraj pose="party" size={140} />
          <Bubble tail="b">برافو! لقيت كل الأزواج في {ar(tries)} محاولات — خدت نور للجزيرة</Bubble>
          <Btn className="block" tone="grape" onClick={again} sound="pop">العب تاني</Btn>
          {lv !== 'hard' && <Btn className="block" tone="teal" sound="pop" onClick={() => pick(lv === 'easy' ? 'mid' : 'hard')}>جرّب مستوى أصعب ◀</Btn>}
          <Btn className="block" tone="white" onClick={() => { location.hash = '#/island'; }}>ارجع لرحلتي</Btn>
        </motion.div>
      )}
    </div>
  );
}
