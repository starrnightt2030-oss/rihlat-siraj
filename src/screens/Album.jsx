import { motion } from 'framer-motion';
import Sky from '../components/Sky';
import { Bubble } from '../components/ui';
import { SPARKS, STICKERS, STICKER_NAMES } from '../data/content';
import { useStore } from '../store';
import { A, ar } from '../lib/asset';
import { sfx } from '../lib/sound';
import { say } from '../lib/voice';

export default function Album() {
  const { light, stars, sparks, stickers, done } = useStore();
  const medals = [{ n: 1, img: 'rewards/medal_bronze', t: 'أول درس' }, { n: 4, img: 'rewards/medal_silver', t: '٤ دروس' }, { n: 8, img: 'rewards/medal_gold', t: '٨ دروس' }];
  const count = Object.keys(done).length;
  return (
    <div className="screen with-nav" style={{ gap: 16 }}>
      <Sky tone="warm" />
      <h1 style={{ position: 'relative', fontSize: 32, fontWeight: 800 }}>كنوزي</h1>

      <div className="card" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14, padding: 14, background: 'radial-gradient(circle at 85% 40%, #FFF3B8, #fff 65%)' }}>
        <motion.img src={A('rewards/jar')} alt="جرة النور" className="glow" whileTap={{ scale: 0.9, rotate: -6 }} onClick={() => { sfx.sparkle(); say('كل درس وحكاية بيزوّدوا نور الجرة'); }} style={{ width: 96, height: 110, objectFit: 'contain', cursor: 'pointer' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#5D6CA0' }}>جرة النور</div>
          <div style={{ fontSize: 40, fontWeight: 800, color: '#E39400', lineHeight: 1.1 }}>{ar(light)} نور</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 800 }}><img src={A('rewards/star')} alt="" style={{ width: 26 }} />{ar(stars)} نجمة</div>
        </div>
      </div>

      <section style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><h2 style={{ fontSize: 23, fontWeight: 800 }}>شرارات الخير</h2><span style={{ fontWeight: 800, color: '#E39400' }}>{ar(sparks.length)} من {ar(SPARKS.length)}</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10 }}>
          {SPARKS.map((s) => {
            const has = sparks.includes(s.id);
            return (
              <motion.button key={s.id} type="button" whileTap={{ scale: 0.9 }} onClick={() => { has ? sfx.sparkle() : sfx.soft(); say(has ? `شرارة ${s.name}` : `شرارة ${s.name} مستنياك في الحكايات`); }}
                className="card" style={{ padding: 6, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, borderColor: has ? s.color : '#EEF1F8', background: has ? `${s.color}18` : '#F7F8FC' }}>
                <img src={A('characters/sparks/' + s.id)} alt="" style={{ width: 62, height: 70, objectFit: 'contain', filter: has ? 'none' : 'grayscale(1) opacity(.35)' }} />
                <span style={{ fontSize: 14, fontWeight: 800, color: has ? '#22306A' : '#9AA5C6' }}>{s.name}</span>
              </motion.button>
            );
          })}
        </div>
      </section>

      <section style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><h2 style={{ fontSize: 23, fontWeight: 800 }}>ألبوم الملصقات</h2><span style={{ fontWeight: 800, color: '#E39400' }}>{ar(stickers.length)} من {ar(STICKERS.length)}</span></div>
        <div className="card" style={{ padding: 10, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8, background: '#FFFBEF' }}>
          {STICKERS.map((k) => {
            const has = stickers.includes(k);
            return (
              <motion.button key={k} type="button" whileTap={{ scale: 0.9, rotate: 6 }} onClick={() => { has ? sfx.pop() : sfx.soft(); say(has ? STICKER_NAMES[k] : 'لسه مستخبي… كمّل رحلتك'); }} aria-label={has ? STICKER_NAMES[k] : 'ملصق مقفول'}
                style={{ aspectRatio: '1', border: has ? 0 : '3px dashed #E6D9B0', borderRadius: 18, background: has ? 'transparent' : '#fff', padding: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={A('stickers/' + k)} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: has ? 'drop-shadow(0 3px 4px rgba(0,0,0,.18))' : 'grayscale(1) brightness(1.6) opacity(.25)' }} />
              </motion.button>
            );
          })}
        </div>
      </section>

      <section style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h2 style={{ fontSize: 23, fontWeight: 800 }}>الميداليات</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
          {medals.map((m) => (
            <div key={m.img} className="card" style={{ padding: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img src={A(m.img)} alt="" style={{ width: 64, height: 72, objectFit: 'contain', filter: count >= m.n ? 'none' : 'grayscale(1) opacity(.3)' }} />
              <span style={{ fontSize: 14, fontWeight: 800, color: count >= m.n ? '#22306A' : '#9AA5C6' }}>{m.t}</span>
            </div>
          ))}
        </div>
      </section>
      {stickers.length === 0 && <Bubble style={{ position: 'relative' }}>كل درس وحكاية بيدّوك نجوم ونور وملصقات… يلا نجمعهم!</Bubble>}
    </div>
  );
}
