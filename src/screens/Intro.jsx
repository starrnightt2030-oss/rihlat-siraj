// الانترو: خلفية سما بأشعة نور بتلف وحبيبات نور طالعة، واللوجو بيظهر بحركة ناعمة ولمعة بتعدّي عليه،
// وبعدين سراج يرحّب بالطفل بصوته. أول مرة «يلا نتعرّف»، وبعد كده ترحيب باسم الطفل و«يلا نكمّل»
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Btn, Icon, I } from '../components/ui';
import { A } from '../lib/asset';
import { sfx, unlockAudio } from '../lib/sound';
import { say } from '../lib/voice';

export const WELCOME = {
  first: 'السلام عليكم! أهلًا بيك في رحلة سراج… يلا نتعرّف!',
  boy: 'أهلًا يا بطل! وحشتني… يلا نكمّل رحلتنا',
  girl: 'أهلًا يا بطلة! وحشتيني… يلا نكمّل رحلتنا',
};
const hello = () => { const h = new Date().getHours(); return h >= 4 && h < 12 ? 'صباح النور' : h < 17 ? 'نهارك سعيد' : 'مساء النور'; };
const DOTS = Array.from({ length: 22 }, (_, i) => ({ x: (i * 41) % 100, s: 4 + (i % 4) * 3, d: (i % 9) * 0.45, t: 5 + (i % 5), c: ['#FFE07A', '#FFFFFF', '#FFB8D6', '#BDE8FF'][i % 4] }));

export default function Intro({ onDone, profile }) {
  const back = !!profile;
  const [t, setT] = useState(0); // 0 الخلفية، 1 اللوجو، 2 الترحيب، 3 الزرار
  const line = !back ? WELCOME.first : profile.gender === 'girl' ? WELCOME.girl : WELCOME.boy;
  useEffect(() => {
    const ids = [
      setTimeout(() => { setT(1); sfx.reveal(); }, 250),
      setTimeout(() => setT(2), 1300),
      setTimeout(() => say(line), 1450),
      setTimeout(() => setT(3), 2100),
    ];
    return () => ids.forEach(clearTimeout);
  }, []);
  const go = () => { unlockAudio?.(); sfx.whoosh(); onDone(); };
  return (
    <div className="screen" style={{ alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 0 }} onPointerDown={() => unlockAudio?.()}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 80% at 50% 38%, #FFF4C9 0%, #BFE9FF 45%, #7CC4F2 100%)' }} />
      {/* أشعة نور بتلف ببطء ورا اللوجو */}
      <motion.div aria-hidden="true" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
        style={{ position: 'absolute', top: '42%', left: '50%', width: 900, height: 900, marginLeft: -450, marginTop: -450, background: 'repeating-conic-gradient(from 0deg, #ffffff38 0deg 8deg, transparent 8deg 22deg)', WebkitMaskImage: 'radial-gradient(circle, #000 18%, transparent 62%)', maskImage: 'radial-gradient(circle, #000 18%, transparent 62%)' }} />
      {/* حبيبات نور طالعة لفوق */}
      {DOTS.map((p, i) => (
        <motion.span key={i} aria-hidden="true" initial={{ y: '105vh', opacity: 0 }} animate={{ y: '-10vh', opacity: [0, 1, 1, 0] }} transition={{ duration: p.t, delay: p.d, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', left: p.x + '%', top: 0, width: p.s, height: p.s, borderRadius: p.s, background: p.c, boxShadow: `0 0 ${p.s * 2}px ${p.c}` }} />
      ))}
      {[0, 1].map((i) => (
        <motion.div key={i} aria-hidden="true" initial={{ x: i ? 420 : -260 }} animate={{ x: i ? -260 : 420 }} transition={{ duration: 34 + i * 10, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', top: 70 + i * 120, width: 140 - i * 30, height: 44 - i * 8, borderRadius: 30, background: '#fff', opacity: 0.75 }} />
      ))}

      <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '0 18px' }}>
        <div style={{ minHeight: 92, display: 'flex', alignItems: 'flex-end' }}>
          <AnimatePresence>
            {t >= 2 && (
              <motion.div initial={{ scale: 0.6, opacity: 0, y: 14 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }} className="bubble tail-b" style={{ fontSize: 20, textAlign: 'center', lineHeight: 1.5 }}>
                {back ? <>{hello()} يا <b style={{ color: '#E07F1E' }}>{profile.name}</b>! 👋<br />{profile.gender === 'girl' ? 'وحشتيني' : 'وحشتني'}… يلا نكمّل رحلتنا</> : <>السلام عليكم! 👋<br />أهلًا بيك في رحلة سراج</>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {t >= 1 && (
            <motion.div initial={{ scale: 0.4, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 120, damping: 11 }} style={{ position: 'relative', width: 'min(320px, 82vw)' }}>
              <motion.img src={A('marketing/logo_group')} alt="رحلة سراج" animate={{ y: [0, -7, 0] }} transition={{ repeat: Infinity, duration: 3.4, ease: 'easeInOut' }}
                style={{ width: '100%', display: 'block', filter: 'drop-shadow(0 14px 26px rgba(38,51,107,.35))' }} />
              {/* لمعة بتعدّي على اللوجو */}
              <motion.div aria-hidden="true" initial={{ x: '-120%' }} animate={{ x: '160%' }} transition={{ delay: 0.6, duration: 1.1, ease: 'easeInOut', repeat: Infinity, repeatDelay: 3.5 }}
                style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, transparent 35%, #ffffffb0 50%, transparent 65%)', WebkitMaskImage: `url(${A('marketing/logo_group')})`, maskImage: `url(${A('marketing/logo_group')})`, WebkitMaskSize: '100% 100%', maskSize: '100% 100%', pointerEvents: 'none' }} />
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {t >= 3 && (
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <span style={{ fontSize: 17, fontWeight: 800, color: '#2B5BA8', background: '#ffffffd0', padding: '3px 18px', borderRadius: 16 }}>مغامرة النور للأطفال</span>
              <Btn className="block pulse" onClick={go} sound="pop" style={{ marginTop: 8, fontSize: 25, minHeight: 66 }}><Icon d={I.play} size={24} /> {back ? 'يلا نكمّل' : 'يلا نتعرّف!'}</Btn>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div style={{ position: 'absolute', bottom: 'calc(var(--safe-bottom) + 10px)', fontSize: 12, fontWeight: 700, color: '#2B5BA8' }}>تصميم وتطوير Mohamed Eldawly</div>
    </div>
  );
}
