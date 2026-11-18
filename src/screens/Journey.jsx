import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sky from '../components/Sky';
import Siraj, { BUDDY } from '../components/Siraj';
import { Bubble, Icon, I } from '../components/ui';
import { UNITS, ALL_CARDS, isOpen, nextCard } from '../data/units';
import { useStore } from '../store';
import { A, ar } from '../lib/asset';
import { sfx } from '../lib/sound';
import { say } from '../lib/voice';

const ZIG = [0, 78, 0, -78];

export default function Journey({ go }) {
  const { profile, done, stars, light } = useStore();
  const cur = nextCard(done);
  const curRef = useRef(null);
  const [toast, setToast] = useState('');
  const buddy = BUDDY[profile?.buddy || 'siraj'];
  const hello = cur ? `يلا يا ${profile?.name}! «${cur.title}» مستنياك` : `ما شاء الله يا ${profile?.name}! خلّصت الرحلة كلها`;
  useEffect(() => { curRef.current?.scrollIntoView({ block: 'center' }); }, []);
  const open = (c) => {
    if (!isOpen(c.id, done)) { sfx.soft(); setToast('خلّص اللي قبلها الأول'); setTimeout(() => setToast(''), 1600); return; }
    sfx.pop(); go(c.story ? 'stories' : 'card', c.id);
  };
  const doneCount = ALL_CARDS.filter((c) => c.id in done).length;
  const hour = new Date().getHours();

  return (
    <div className="screen with-nav" style={{ padding: 0 }}>
      <Sky />
      <header style={{ position: 'sticky', top: 0, zIndex: 5, display: 'flex', alignItems: 'center', gap: 8, padding: 'calc(var(--safe-top) + 12px) 14px 10px', background: '#BDE8FF', boxShadow: '0 6px 14px rgba(38,51,107,.08)', borderRadius: '0 0 26px 26px' }}>
        <button type="button" onClick={() => go('parent')} aria-label="ركن ولي الأمر" style={{ width: 54, height: 54, flexShrink: 0, borderRadius: 27, border: 0, background: '#fff', padding: 0, overflow: 'hidden', boxShadow: '0 4px 12px rgba(38,51,107,.15)', cursor: 'pointer' }}>
          <img src={A(buddy.face)} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </button>
        <div style={{ flex: 1, minWidth: 0, lineHeight: 1.15 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#3A6FC4' }}>{hour < 12 ? 'صباح النور' : 'مساء النور'}</div>
          <div style={{ fontSize: 22, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>يا {profile?.name}</div>
        </div>
        <span className="chip"><img src={A('rewards/jar')} alt="" style={{ width: 22, height: 26, objectFit: 'contain' }} />{ar(light)}</span>
        <span className="chip"><img src={A('rewards/star')} alt="" style={{ width: 26, height: 26 }} />{ar(stars)}</span>
      </header>

      <div style={{ position: 'relative', padding: '14px 14px 0' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', boxShadow: '0 5px 0 #CFEFE1, 0 12px 24px rgba(38,51,107,.08)' }}>
          <img src={A('rewards/trophy')} alt="" style={{ width: 44, height: 46, objectFit: 'contain' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#2FB383' }}>رحلتي لحد دلوقتي</div>
            <div className="progress" style={{ marginTop: 4 }}><i style={{ width: `${(doneCount / ALL_CARDS.length) * 100}%`, background: 'linear-gradient(90deg, #4ED7A3, #2FB383)' }} /></div>
          </div>
          <span style={{ fontWeight: 800, color: '#1F8A61' }}>{ar(doneCount)}/{ar(ALL_CARDS.length)}</span>
        </div>
      </div>

      {UNITS.map((u) => {
        const unitOpen = isOpen(u.cards[0].id, done);
        const finished = u.cards.every((c) => c.id in done);
        return (
          <section key={u.id} style={{ position: 'relative', padding: '22px 14px 6px' }} aria-label={u.title}>
            <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => { sfx.tap(); go('unit', u.id); }}
              style={{ width: '100%', border: 0, cursor: 'pointer', textAlign: 'right', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 26, color: unitOpen ? '#fff' : '#8792AE', fontFamily: 'inherit',
                background: unitOpen ? `linear-gradient(135deg, ${u.color}, ${u.dark})` : '#EEF1F7', boxShadow: unitOpen ? `0 6px 0 ${u.dark}, 0 14px 24px ${u.color}55` : '0 5px 0 #D6DCE8' }}>
              <img src={A(u.icon)} alt="" style={{ width: 54, height: 54, borderRadius: 16, objectFit: 'cover', background: '#fff', filter: unitOpen ? 'none' : 'grayscale(1) opacity(.5)' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, opacity: 0.9 }}>الوحدة {ar(u.n)}</div>
                <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.1 }}>{u.title}</div>
                <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.9 }}>{u.sub}</div>
              </div>
              {finished ? <img src={A('stickers/' + u.sticker)} alt="" style={{ width: 46, height: 46, objectFit: 'contain' }} /> : !unitOpen && <Icon d={I.lock} color="#B3BACB" />}
            </motion.button>

            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, paddingTop: 18 }}>
              {u.cards.map((c, i) => {
                const isDone = c.id in done, isCur = cur?.id === c.id, locked = !isDone && !isCur;
                return (
                  <div key={c.id} ref={isCur ? curRef : null} style={{ position: 'relative', transform: `translateX(${ZIG[i % 4]}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={() => open(c)} aria-label={c.title + (locked ? ' — مقفول' : '')}
                      style={{ position: 'relative', width: isCur ? 92 : 78, height: isCur ? 92 : 78, borderRadius: '50%', border: '5px solid #fff', padding: 0, cursor: 'pointer',
                        background: isDone ? 'linear-gradient(180deg,#FFD25A,#FFB21C)' : isCur ? `linear-gradient(180deg, ${u.color}, ${u.dark})` : '#EEF1F7',
                        boxShadow: `0 6px 0 ${isDone ? '#E09A10' : isCur ? u.dark : '#D6DCE8'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isCur && <span className="ring" style={{ position: 'absolute', inset: -6, borderRadius: '50%', border: `5px solid ${u.color}` }} />}
                      <img src={A(c.icon)} alt="" style={{ width: isCur ? 60 : 50, height: isCur ? 60 : 50, borderRadius: 14, objectFit: 'cover', filter: locked ? 'grayscale(1) opacity(.45)' : 'none' }} />
                      {isDone && <span style={{ position: 'absolute', bottom: -6, left: -6, width: 28, height: 28, borderRadius: 14, background: '#2FB383', border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon d={I.check} size={14} color="#fff" w={4} /></span>}
                    </motion.button>
                    <span style={{ fontSize: 15, fontWeight: 800, color: locked ? '#8792AE' : '#26336B', background: '#fff', borderRadius: 12, padding: '0 10px', boxShadow: '0 2px 0 #F3E6CC' }}>{c.title}</span>
                    {isCur && (
                      <div style={{ position: 'absolute', top: 6, [ZIG[i % 4] > 0 ? 'right' : 'left']: 96, pointerEvents: 'auto' }}>
                        <Siraj pose="point" size={96} onTap={() => say(hello)} style={{ transform: ZIG[i % 4] > 0 ? 'none' : 'scaleX(-1)' }} />
                      </div>
                    )}
                  </div>
                );
              })}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: finished ? 1 : 0.75 }}>
                <img src={A('rewards/chest')} alt="" style={{ width: 70, height: 58, objectFit: 'contain', filter: finished ? 'none' : 'saturate(.5)' }} />
                <span style={{ fontSize: 13, fontWeight: 800, color: '#B07A2A' }}>{finished ? 'اتفتح الكنز!' : 'كنز الوحدة'}</span>
              </div>
            </div>
          </section>
        );
      })}
      <div style={{ height: 40 }} />

      <AnimatePresence>
        {toast && <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} role="status"
          style={{ position: 'fixed', bottom: 110, left: '50%', marginLeft: -110, width: 220, textAlign: 'center', background: '#26336B', color: '#fff', borderRadius: 18, padding: '8px 12px', fontWeight: 800, zIndex: 30 }}>{toast}</motion.div>}
      </AnimatePresence>
    </div>
  );
}
