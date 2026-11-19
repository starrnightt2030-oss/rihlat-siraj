// الأوسمة: احتفال لما الطفل ياخد وسام جديد + شبكة الأوسمة في «كنوزي»
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BADGES, earned } from '../data/badges';
import { useStore } from '../store';
import { Confetti } from './Reward';
import Siraj from './Siraj';
import { Btn } from './ui';
import { ar } from '../lib/asset';
import { sfx } from '../lib/sound';
import { say } from '../lib/voice';

const Medal = ({ b, on, size = 64 }) => (
  <div style={{ position: 'relative', width: size, height: size }}>
    <div style={{ width: size, height: size, borderRadius: size / 2, display: 'grid', placeItems: 'center', fontSize: size * 0.48, background: on ? `radial-gradient(circle at 35% 30%, #fff, ${b.c}66 55%, ${b.c})` : '#E5E9F0', border: `4px solid ${on ? '#FFD25A' : '#D3D9E4'}`, filter: on ? 'none' : 'grayscale(1)', opacity: on ? 1 : 0.55, boxShadow: on ? '0 4px 0 #E0A21A' : 'none' }}>{b.ic}</div>
  </div>
);

export function BadgeWatcher() {
  const st = useStore();
  const [show, setShow] = useState(null);
  useEffect(() => {
    if (!st.profile || /^#?\/?(splash)?$/.test(location.hash.replace('#/', '')) || location.hash.includes('onboard')) return;
    const got = earned(st), seen = st.seenBadges || [];
    const fresh = got.filter((id) => !seen.includes(id));
    if (fresh.length && !show) {
      const b = BADGES.find((x) => x.id === fresh[0]);
      setTimeout(() => { setShow(b); sfx.good(); say('مبروك! خدت وسام ' + b.t); }, 900);
    }
  }, [st.done, st.games, st.tasbih, st.zdays, st.days]);
  const close = () => { useStore.getState().ackBadges(earned(useStore.getState())); setShow(null); };
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-label="وسام جديد" style={{ position: 'fixed', inset: 0, zIndex: 85, background: '#26336Bcc', display: 'grid', placeItems: 'center', padding: 20 }} onClick={close}>
          <Confetti n={50} />
          <motion.div initial={{ scale: 0.5, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 14 }} className="card" style={{ padding: 22, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, maxWidth: 340 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#E07F1E' }}>مبروك! وسام جديد 🎉</div>
            <motion.div animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 2 }}><Medal b={show} on size={110} /></motion.div>
            <div style={{ fontSize: 26, fontWeight: 800 }}>{show.t}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#6D7896' }}>{show.d}</div>
            <Siraj pose="party" size={90} still />
            <Btn className="block" onClick={close}>الله أكبر! 🤍</Btn>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function BadgeGrid() {
  const st = useStore();
  const got = earned(st);
  return (
    <section style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><h2 style={{ fontSize: 23, fontWeight: 800 }}>أوسمتي</h2><span style={{ fontWeight: 800, color: '#E07F1E' }}><bdi>{ar(got.length)}</bdi> من <bdi>{ar(BADGES.length)}</bdi></span></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 8 }}>
        {BADGES.map((b) => {
          const [a, t] = b.p(st), on = a >= t;
          return (
            <motion.button key={b.id} type="button" whileTap={{ scale: 0.95 }} onClick={() => { sfx.tap(); say(b.t + '. ' + b.d); }} className="card" style={{ border: 0, padding: '10px 4px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', fontFamily: 'inherit', color: '#26336B', background: on ? '#FFFBEA' : '#fff' }}>
              <Medal b={b} on={on} size={56} />
              <span style={{ fontSize: 13, fontWeight: 800, lineHeight: 1.2, textAlign: 'center' }}>{b.t}</span>
              {on ? <span style={{ fontSize: 11, fontWeight: 800, color: '#2FB383' }}>✓ اتاخد</span>
                : <div style={{ width: '80%' }}><div className="progress" style={{ height: 6 }}><i style={{ width: `${(a / t) * 100}%`, background: b.c }} /></div><div style={{ fontSize: 10, fontWeight: 700, color: '#6D7896', textAlign: 'center' }}><bdi>{ar(a)}</bdi>/<bdi>{ar(t)}</bdi></div></div>}
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
