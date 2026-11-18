import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Sky from '../components/Sky';
import Siraj, { BUDDY } from '../components/Siraj';
import { Btn, Bubble, StarsChip, LightChip, Icon, I } from '../components/ui';
import { REGIONS, SPOTS, LESSONS, ITEM } from '../data/content';
import { useStore } from '../store';
import { A } from '../lib/asset';
import { sfx } from '../lib/sound';
import { say } from '../lib/voice';

const ORDER = ['wudu', 'creation', 'yunus', 'prayer', 'amana', 'pillars'];
const H = 380, W = Math.round(H * 1.771);

export const regionProgress = (r, done) => { const l = r.lessons.filter((x) => ITEM(x)); return l.length ? l.filter((x) => x in done).length / l.length : 0; };

export default function Island({ go }) {
  const { profile, done } = useStore();
  const box = useRef(null);
  useEffect(() => { const el = box.current; if (el) el.scrollLeft = (W - el.clientWidth) / 2; }, []);
  const next = ORDER.find((id) => !(id in done));
  const nextL = next && ITEM(next);
  const nextR = nextL && REGIONS.find((r) => r.lessons.includes(next));
  const isStory = nextL && !LESSONS[next];
  const buddy = BUDDY[profile?.buddy || 'siraj'];
  const hello = nextL ? `يلا يا ${profile?.name}! النهارده هننوّر ${nextR.name}.` : `برافو يا ${profile?.name}! نوّرت كل اللي جاهز لحد دلوقتي.`;

  const lit = REGIONS.map((r) => ({ r, p: regionProgress(r, done) })).filter((x) => x.p > 0);
  const masks = lit.map(({ r, p }) => `radial-gradient(circle at ${r.x}% ${r.y}%, #000 0px, #000 ${70 + p * 90}px, transparent ${130 + p * 120}px)`);
  const maskCss = masks.length ? masks.join(', ') : 'linear-gradient(transparent, transparent)';

  return (
    <div className="screen with-nav" style={{ gap: 12, paddingInline: 0 }}>
      <Sky />
      <header style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px' }}>
        <button type="button" onClick={() => go('parent')} aria-label="ركن ولي الأمر" style={{ width: 58, height: 58, borderRadius: 29, border: '3px solid #fff', background: '#FFF4D6', padding: 0, overflow: 'hidden', boxShadow: '0 4px 0 rgba(34,48,106,.12)', cursor: 'pointer' }}>
          <img src={A(buddy.face)} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </button>
        <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#2B5BA8' }}>جزيرة النور</div>
          <div style={{ fontSize: 24, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>أهلًا يا {profile?.name}</div>
        </div>
        <LightChip /><StarsChip />
      </header>

      <div ref={box} style={{ position: 'relative', overflowX: 'auto', overflowY: 'hidden', direction: 'ltr', scrollbarWidth: 'none', flexShrink: 0 }}>
        <div style={{ position: 'relative', width: W, height: H, margin: '0 12px', borderRadius: 32, overflow: 'hidden', border: '5px solid #fff', boxShadow: '0 12px 30px rgba(34,48,106,.2)' }}>
          <img src={A('island/maps/day')} alt="خريطة جزيرة النور" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(.4) brightness(1.08) contrast(.9)' }} />
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'rgba(235,245,255,.35)' }} />
          <img src={A('island/maps/day')} alt="" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', WebkitMaskImage: maskCss, maskImage: maskCss, transition: 'all .8s' }} />
          {REGIONS.map((r) => <Pin key={r.id} r={r} p={regionProgress(r, done)} soon={!r.lessons.some((l) => ITEM(l))} current={nextR?.id === r.id} onClick={() => go('region', r.id)} />)}
          {SPOTS.map((s) => <Pin key={s.id} r={s} spot onClick={() => go(s.to)} />)}
        </div>
      </div>

      <div style={{ position: 'relative', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
          <Siraj pose={nextL ? 'point' : 'party'} size={112} onTap={() => say(hello)} />
          <Bubble tail="r" style={{ flex: 1, marginBottom: 18 }}>{hello}</Bubble>
        </div>
        {nextL && (
          <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => { sfx.pop(); go(isStory ? 'stories' : 'lesson', next); }} className="card"
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, cursor: 'pointer', textAlign: 'right', borderColor: nextR.color }}>
            <img src={A(isStory ? nextL.cover : nextL.steps[1]?.img || nextL.icon)} alt="" style={{ width: 76, height: 76, borderRadius: 18, objectFit: 'cover' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#5D6CA0' }}>{nextR.name}</div>
              <div style={{ fontSize: 21, fontWeight: 800 }}>{nextL.title}</div>
            </div>
            <span className="pulse" style={{ width: 56, height: 56, borderRadius: 28, background: '#FFC233', boxShadow: '0 5px 0 #E39400', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3A2400' }}><Icon d={I.play} size={26} /></span>
          </motion.button>
        )}
      </div>
    </div>
  );
}

function Pin({ r, p = 0, soon, current, spot, onClick }) {
  const lit = p > 0 || spot;
  return (
    <motion.button type="button" onClick={() => { sfx.pop(); onClick(); }} whileTap={{ scale: 0.9 }}
      style={{ position: 'absolute', left: `${r.x}%`, top: `${r.y}%`, transform: 'translate(-50%, -50%)', border: 0, background: 'transparent', padding: 0, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, direction: 'rtl' }}>
      <span className={current ? 'pulse' : ''} style={{ width: 46, height: 46, borderRadius: 23, background: soon ? '#C9D1E6' : r.color, border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: current ? `0 0 0 6px ${r.color}55, 0 0 24px ${r.color}` : '0 4px 0 rgba(34,48,106,.2)' }}>
        <Icon d={soon ? I.lock : p >= 1 ? I.check : I.star} size={22} color="#fff" />
      </span>
      <span style={{ background: '#fff', color: '#22306A', borderRadius: 14, padding: '1px 10px', fontSize: 15, fontWeight: 800, whiteSpace: 'nowrap', boxShadow: '0 3px 0 rgba(34,48,106,.12)', border: `2px solid ${lit ? r.color : '#E1E6F2'}` }}>{r.name}</span>
      {p > 0 && p < 1 && <span style={{ width: 54, height: 6, borderRadius: 3, background: '#fff', overflow: 'hidden' }}><i style={{ display: 'block', height: '100%', width: `${p * 100}%`, background: r.color }} /></span>}
    </motion.button>
  );
}
