import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Sky from '../components/Sky';
import Siraj from '../components/Siraj';
import { Confetti } from '../components/Reward';
import { Btn, Bubble, IconBtn, I, LightChip } from '../components/ui';
import { useStore } from '../store';
import { A, ar } from '../lib/asset';
import { sfx } from '../lib/sound';
import { say } from '../lib/voice';
import { OrderGame, FillGame, MatchGame } from './LearnGames';

const FACES = ['moon', 'lantern', 'mosque', 'camel', 'dates', 'palm', 'siraj', 'bashir', 'jug', 'tasbih', 'rug', 'mushaf'];
const PUZZLES = [{ id: 'harbor', t: 'الميناء' }, { id: 'mosque', t: 'المسجد' }, { id: 'garden', t: 'البستان' }];
const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

export default function Games({ arg, go, back }) {
  const age = useStore((s) => s.profile?.age || '7-9');
  if (arg === 'memory') return <Memory age={age} back={back} />;
  if (arg === 'order') return <OrderGame age={age} back={back} />;
  if (arg === 'fill') return <FillGame back={back} />;
  if (arg === 'match') return <MatchGame age={age} back={back} />;
  if (arg && arg.startsWith('puzzle-')) return <Puzzle id={arg.slice(7)} age={age} back={back} />;
  return (
    <div className="screen with-nav" style={{ gap: 14 }}>
      <Sky tone="lilac" />
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h1 style={{ fontSize: 32, fontWeight: 800 }}>الألعاب</h1><LightChip /></div>
      <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => { sfx.pop(); go('games', 'memory'); }} className="card"
        style={{ position: 'relative', padding: 12, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'right', borderColor: '#9D7CFF' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 44px)', gap: 4 }}>
          {['back', 'moon', 'siraj', 'back'].map((k, i) => <img key={i} src={A('games/memory/' + k)} alt="" style={{ width: 44, height: 50, objectFit: 'cover', borderRadius: 10 }} />)}
        </div>
        <div style={{ flex: 1 }}><div style={{ fontSize: 24, fontWeight: 800 }}>لعبة الذاكرة</div><div style={{ color: '#5D6CA0', fontWeight: 700 }}>اقلب الكروت ولاقي الأزواج</div></div>
      </motion.button>
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
      <h2 style={{ position: 'relative', fontSize: 22, fontWeight: 800 }}>البازل</h2>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
        {PUZZLES.map((p) => (
          <motion.button key={p.id} type="button" whileTap={{ scale: 0.95 }} onClick={() => { sfx.pop(); go('games', 'puzzle-' + p.id); }} className="card" style={{ padding: 4, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
            <img src={A('games/puzzles/' + p.id)} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 18 }} />
            <span style={{ fontWeight: 800, fontSize: 16 }}>{p.t}</span>
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

function Memory({ age, back }) {
  const win = useStore((s) => s.win);
  const pairs = age === '4-6' ? 3 : age === '7-9' ? 6 : 8;
  const cols = pairs === 3 ? 3 : 4;
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
  const again = () => { setOpen([]); setGot([]); setTries(0); setSeed(seed + 1); };
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone="lilac" />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconBtn icon={I.back} label="رجوع" onClick={back} />
        <h1 style={{ flex: 1, fontSize: 26, fontWeight: 800 }}>لعبة الذاكرة</h1>
        <span className="chip" style={{ paddingInline: 12 }}>{ar(got.length)} / {ar(pairs)}</span>
      </div>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: 8, perspective: 800 }}>
        {deck.map((f, i) => {
          const up = open.includes(i) || got.includes(f);
          return (
            <button key={seed + '-' + i} type="button" onClick={() => flip(i)} aria-label={up ? 'كارت مقلوب' : 'اقلب الكارت'} style={{ border: 0, padding: 0, background: 'transparent', aspectRatio: '0.86', cursor: 'pointer' }}>
              <motion.div animate={{ rotateY: up ? 180 : 0, scale: got.includes(f) ? [1, 1.08, 1] : 1 }} transition={{ duration: 0.4 }} style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d' }}>
                <img src={A('games/memory/back')} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: 16, backfaceVisibility: 'hidden', boxShadow: '0 4px 0 rgba(34,48,106,.15)' }} />
                <img src={A('games/memory/' + f)} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: 16, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', boxShadow: got.includes(f) ? '0 0 0 4px #4FCB6B' : '0 4px 0 rgba(34,48,106,.15)' }} />
              </motion.div>
            </button>
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
        </motion.div>
      )}
    </div>
  );
}

function Puzzle({ id, age, back }) {
  const win = useStore((s) => s.win);
  const n = age === '4-6' ? 2 : age === '7-9' ? 3 : 4;
  const [seed, setSeed] = useState(0);
  const start = useMemo(() => { let a; do { a = shuffle([...Array(n * n).keys()]); } while (a.every((v, i) => v === i)); return a; }, [seed, n]);
  const [tiles, setTiles] = useState(start);
  const [sel, setSel] = useState(null);
  useEffect(() => { setTiles(start); setSel(null); }, [start]);
  const solved = tiles.every((v, i) => v === i);
  useEffect(() => { if (solved) { sfx.good(); say('الصورة رجعت كاملة! شاطر'); win('puzzle'); } }, [solved]);
  const tap = (i) => {
    if (solved) return;
    if (sel === null) { sfx.tap(); setSel(i); return; }
    if (sel === i) { setSel(null); return; }
    const t = [...tiles]; [t[sel], t[i]] = [t[i], t[sel]]; setTiles(t); setSel(null);
    t[i] === i || t[sel] === sel ? sfx.sparkle() : sfx.flip();
  };
  const img = A('games/puzzles/' + id);
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone="mint" />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconBtn icon={I.back} label="رجوع" onClick={back} />
        <h1 style={{ flex: 1, fontSize: 26, fontWeight: 800 }}>رتّب الصورة</h1>
        <img src={img} alt="الصورة الأصلية" style={{ width: 56, height: 56, borderRadius: 14, border: '3px solid #fff', objectFit: 'cover' }} />
      </div>
      <Bubble style={{ position: 'relative' }}>{solved ? 'برافو! الصورة رجعت كاملة' : 'دوس على حتتين عشان تبدّلهم لحد ما الصورة ترجع'}</Bubble>
      <div className="card" style={{ position: 'relative', padding: 6, borderColor: '#fff', borderWidth: 5 }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, gap: solved ? 0 : 3, aspectRatio: '1', transition: 'gap .4s', direction: 'ltr' }}>
          {tiles.map((v, i) => (
            <motion.button key={v} layout type="button" onClick={() => tap(i)} aria-label={`قطعة ${i + 1}`} transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              style={{ border: sel === i ? '4px solid #FFC233' : 0, padding: 0, borderRadius: solved ? 0 : 10, cursor: 'pointer', backgroundImage: `url(${img})`, backgroundSize: `${n * 100}% ${n * 100}%`, backgroundPosition: `${(v % n) * (100 / (n - 1))}% ${Math.floor(v / n) * (100 / (n - 1))}%`, transform: sel === i ? 'scale(.94)' : 'none' }} />
          ))}
        </div>
        {solved && <Confetti n={30} />}
      </div>
      {solved && <Btn className="block" tone="teal" sound="pop" onClick={() => setSeed(seed + 1)}>العب تاني</Btn>}
    </div>
  );
}
