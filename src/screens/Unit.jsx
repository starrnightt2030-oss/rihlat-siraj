import { motion } from 'framer-motion';
import Siraj from '../components/Siraj';
import { IconBtn, Icon, I, HomeBtn } from '../components/ui';
import { unitById, UNITS, isOpen } from '../data/units';
import { useStore } from '../store';
import { A, ar } from '../lib/asset';
import { sfx } from '../lib/sound';
import { say } from '../lib/voice';

export default function Unit({ arg, go, back }) {
  const u = unitById(arg) || UNITS[0];
  const done = useStore((s) => s.done);
  const n = u.cards.filter((c) => c.id in done).length;
  return (
    <div className="screen" style={{ padding: 0, background: '#FFF7E8' }}>
      <div style={{ position: 'relative', flexShrink: 0, minHeight: 250, padding: 'calc(var(--safe-top) + 14px) 16px 18px', background: `linear-gradient(180deg, ${u.color}, ${u.dark})`, borderRadius: '0 0 40px 40px', color: '#fff', overflow: 'hidden' }}>
        <svg aria-hidden="true" viewBox="0 0 390 260" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <circle cx="330" cy="40" r="120" fill="#fff" opacity=".12" /><circle cx="30" cy="250" r="90" fill="#fff" opacity=".1" />
        </svg>
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between' }}><IconBtn icon={I.back} label="رجوع" onClick={back} /><HomeBtn /></div>
        <div style={{ position: 'relative', marginTop: 8, marginLeft: 140 }}>
          <span style={{ display: 'inline-block', background: 'rgba(255,255,255,.28)', borderRadius: 14, padding: '1px 12px', fontSize: 14, fontWeight: 800 }}>الوحدة {ar(u.n)}</span>
          <h1 style={{ fontSize: 50, fontWeight: 800, lineHeight: 1.05, textShadow: `0 4px 0 ${u.dark}` }}>{u.title}</h1>
          <p style={{ fontSize: 17, fontWeight: 700, opacity: 0.95 }}>{u.sub}</p>
        </div>
        <div style={{ position: 'absolute', left: 6, bottom: 4 }}><Siraj pose="wave" size={140} onTap={() => say(u.sub)} /></div>
      </div>

      <div style={{ padding: '16px 16px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 22, fontWeight: 800 }}>كروت الوحدة</h2>
        <span style={{ fontWeight: 800, color: u.dark }}>{ar(n)} من {ar(u.cards.length)}</span>
      </div>

      <div style={{ padding: '6px 16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {u.cards.map((c, i) => {
          const isDone = c.id in done, can = isOpen(c.id, done), cur = can && !isDone;
          const stars = done[c.id] || 0;
          return (
            <motion.button key={c.id} type="button" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.06 }} whileTap={{ scale: 0.97 }}
              onClick={() => { if (!can) { sfx.soft(); return; } sfx.pop(); go(c.story ? 'stories' : 'card', c.id); }}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: cur ? 12 : 10, border: 0, borderRadius: 26, cursor: 'pointer', textAlign: 'right', fontFamily: 'inherit',
                color: cur ? '#fff' : can ? '#26336B' : '#8792AE', background: cur ? `linear-gradient(135deg, ${u.color}, ${u.dark})` : '#fff',
                boxShadow: cur ? `0 6px 0 ${u.dark}, 0 14px 24px ${u.color}55` : `0 5px 0 ${can ? u.soft : '#EEE7D8'}` }}>
              <span className="num" style={{ '--c': cur ? '#fff' : can ? u.color : '#C9CFDC', color: cur ? u.dark : '#fff' }}>{ar(i + 1)}</span>
              <img src={A(c.icon)} alt="" style={{ width: cur ? 74 : 64, height: cur ? 74 : 64, borderRadius: 18, objectFit: 'cover', border: cur ? '3px solid rgba(255,255,255,.8)' : 0, filter: can ? 'none' : 'grayscale(.9) opacity(.5)' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                {cur && <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.9 }}>دورك دلوقتي</div>}
                <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2 }}>{c.title}</div>
                {isDone && <div style={{ display: 'flex', gap: 1, marginTop: 2 }}>{[0, 1, 2].map((k) => <img key={k} src={A(k < stars ? 'rewards/star' : 'rewards/star_empty')} alt="" style={{ width: 20, opacity: k < stars ? 1 : 0.4 }} />)}</div>}
                {c.story && <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.8 }}>حكاية</div>}
              </div>
              {cur ? <span style={{ width: 50, height: 50, borderRadius: 25, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: u.dark }}><Icon d={I.play} size={22} /></span>
                : !can ? <Icon d={I.lock} color="#B3BACB" /> : <Icon d={I.check} color="#2FB383" />}
            </motion.button>
          );
        })}
        <div className="dash" style={{ '--c': '#F5C46B', display: 'flex', alignItems: 'center', gap: 10, background: '#FFF0D6', borderRadius: 22, padding: '8px 12px', marginTop: 4 }}>
          <img src={A('stickers/' + u.sticker)} alt="" style={{ width: 52, height: 52, objectFit: 'contain' }} />
          <div style={{ flex: 1, fontSize: 15, fontWeight: 700, lineHeight: 1.4 }}>خلّص كل الكروت وخد <span style={{ color: '#D9822A', fontWeight: 800 }}>ملصق الوحدة</span> لألبومك</div>
        </div>
      </div>
    </div>
  );
}
