import { motion } from 'framer-motion';
import Sky from '../components/Sky';
import Siraj from '../components/Siraj';
import { Bubble, IconBtn, Icon, I, StarsChip, Btn } from '../components/ui';
import { REGIONS, LESSONS, ITEM } from '../data/content';
import { useStore } from '../store';
import { A, ar } from '../lib/asset';
import { sfx } from '../lib/sound';
import { say } from '../lib/voice';
import { regionProgress } from './Island';

export default function Region({ arg, go, back }) {
  const r = REGIONS.find((x) => x.id === arg) || REGIONS[1];
  const done = useStore((s) => s.done);
  const list = r.lessons.filter((l) => ITEM(l));
  const p = regionProgress(r, done);
  const story = false;
  const intro = list.length || story ? r.intro : r.intro;
  return (
    <div className="screen" style={{ gap: 12 }}>
      <Sky tone={r.sky === 'default' ? '' : r.sky} />
      <div style={{ position: 'relative', height: 230, margin: '-4px -4px 0', borderRadius: 32, overflow: 'hidden', border: '5px solid #fff', boxShadow: '0 10px 26px rgba(34,48,106,.18)', flexShrink: 0 }}>
        <img src={A(r.bg)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: p > 0 || !list.length ? 'none' : 'saturate(.75)' }} />
        <div style={{ position: 'absolute', top: 10, right: 10, left: 10, display: 'flex', justifyContent: 'space-between' }}>
          <IconBtn icon={I.back} label="رجوع للجزيرة" onClick={back} />
          <StarsChip />
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '30px 16px 12px', background: 'linear-gradient(180deg, transparent, rgba(255,255,255,.95) 55%)' }}>
          <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.1, color: '#22306A' }}>{r.name}</h1>
          {list.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
              <div className="progress" style={{ flex: 1 }}><i style={{ width: `${p * 100}%`, background: r.color }} /></div>
              <span style={{ fontWeight: 800, fontSize: 15 }}>{ar(list.filter((l) => l in done).length)} من {ar(list.length)}</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 4 }}>
        <Siraj pose={list.length || story ? 'wave' : 'think'} size={104} onTap={() => say(intro)} />
        <Bubble tail="r" style={{ flex: 1, marginBottom: 16 }}>{intro}</Bubble>
      </div>

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {list.map((id, i) => {
          const L = ITEM(id); const isS = !LESSONS[id]; const stars = done[id] || 0; const first = i === list.findIndex((x) => !(x in done));
          return (
            <motion.button key={id} type="button" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.08 }} whileTap={{ scale: 0.97 }}
              onClick={() => { sfx.pop(); go(isS ? 'stories' : 'lesson', id); }} className="card"
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, cursor: 'pointer', textAlign: 'right', marginInlineStart: i % 2 ? 26 : 0, marginInlineEnd: i % 2 ? 0 : 26, borderColor: first ? r.color : stars ? '#FFE08A' : '#fff', borderWidth: first ? 5 : 3 }}>
              <span style={{ position: 'relative', flexShrink: 0 }}>
                <img src={A(isS ? L.cover : L.steps[1]?.img || L.icon)} alt="" style={{ width: 82, height: 82, borderRadius: 20, objectFit: 'cover' }} />
                <span style={{ position: 'absolute', top: -8, right: -8, width: 30, height: 30, borderRadius: 15, background: r.color, color: '#fff', border: '3px solid #fff', fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ar(i + 1)}</span>
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 21, fontWeight: 800, lineHeight: 1.2 }}>{L.title}</div>
                <div style={{ display: 'flex', gap: 2, marginTop: 4 }} aria-label={`${stars} نجوم`}>
                  {[0, 1, 2].map((k) => <img key={k} src={A(k < stars ? 'rewards/star' : 'rewards/star_empty')} alt="" style={{ width: 26, height: 26, opacity: k < stars ? 1 : 0.5 }} />)}
                </div>
              </div>
              <span style={{ width: 50, height: 50, borderRadius: 25, background: first ? '#FFC233' : '#F1F4FA', boxShadow: first ? '0 5px 0 #E39400' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3A2400', flexShrink: 0 }}><Icon d={stars ? I.check : I.play} size={22} /></span>
            </motion.button>
          );
        })}
        {story && <Btn tone="teal" className="block" onClick={() => go('stories')}>افتح بحر الحكايات</Btn>}
        {!list.length && !story && (
          <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={A('characters/lantern/dim')} alt="" style={{ width: 60, height: 80, objectFit: 'contain' }} />
            <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.5 }}>سراج بيجهّز المنطقة دي… قريب هتنوّر إن شاء الله!</div>
          </div>
        )}
      </div>
    </div>
  );
}
