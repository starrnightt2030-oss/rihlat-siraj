// الانترو (هوك سينمائي ~٣ ثواني): ليل ونجوم ← شهاب نور بينزل ويخبط في النص ← فلاش وموجات نور والسما تنوّر فجر
// ← نجمة إسلامية دهبي بتترسم وتلف ← سراج يطلع من النور وبشير يطير من الجنب ومشمش ينط من تحت مع انفجار نجوم
// ← اسم «رحلة سراج» ينزل بلمعة دهبي ← ترحيب بصوت سراج وزرار البداية. اللمس في أي وقت بيقدّم للآخر.
import { useEffect, useRef, useState } from 'react';
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

const rnd = (n) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
const STARS = Array.from({ length: 56 }, (_, i) => ({ x: rnd(i) * 100, y: rnd(i + 99) * 70, s: 1.5 + (i % 3), d: (i % 7) * 0.35 }));
const BURST = Array.from({ length: 20 }, (_, i) => { const a = (i / 20) * Math.PI * 2; const r = 120 + (i % 4) * 34; return { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.8, s: 8 + (i % 3) * 5, c: ['#FFE07A', '#FFFFFF', '#FFB8D6', '#9FE3FF'][i % 4], d: (i % 5) * 0.03 }; });
const DUST = Array.from({ length: 18 }, (_, i) => ({ x: (i * 53) % 100, s: 3 + (i % 3) * 2, t: 6 + (i % 5), d: (i % 9) * 0.5 }));
// نجمة ثمانية (مربعين متداخلين) + دايرة زخرفة
const STAR8 = (() => { const p = (r, o) => Array.from({ length: 4 }, (_, k) => { const a = (k * 90 + o) * Math.PI / 180; return `${150 + Math.cos(a) * r} ${150 + Math.sin(a) * r}`; }); const sq = (o) => 'M' + p(118, o).join(' L') + 'Z'; return [sq(0), sq(45)]; })();
const sp = (stiffness = 220, damping = 14) => ({ type: 'spring', stiffness, damping });

export default function Intro({ onDone, profile }) {
  const back = !!profile;
  const [t, setT] = useState(0); // 0 ليل، 1 شهاب، 2 خبطة ونور، 3 الأبطال، 4 الاسم، 5 الترحيب والزرار
  const line = !back ? WELCOME.first : profile.gender === 'girl' ? WELCOME.girl : WELCOME.boy;
  const ids = useRef([]), spoke = useRef(false);
  const k = back ? 0.75 : 1; // اللي راجع: نفس الانترو أسرع شوية
  const at = (ms, f) => ids.current.push(setTimeout(f, ms * k));
  const speak = () => { if (!spoke.current) { spoke.current = true; say(line); } };
  useEffect(() => {
    at(250, () => { setT(1); sfx.whoosh(); });
    at(1050, () => { setT(2); sfx.reveal(); });
    at(1450, () => { setT(3); sfx.pop(); setTimeout(() => sfx.sparkle(), 160); });
    at(2200, () => { setT(4); sfx.star?.(); });
    at(2900, () => { setT(5); speak(); });
    return () => ids.current.forEach(clearTimeout);
  }, []);
  const skip = () => { unlockAudio?.(); if (t < 5) { ids.current.forEach(clearTimeout); setT(5); speak(); } };
  const go = () => { unlockAudio?.(); sfx.whoosh(); onDone(); };
  const lit = t >= 2;

  return (
    <div className="screen" style={{ alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 0 }} onPointerDown={skip}>
      {/* السما: ليل ← فجر */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(#070E33, #17266A 60%, #2B3D8C)' }} />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: lit ? 1 : 0 }} transition={{ duration: 0.9 }} style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 75% at 50% 36%, #FFF6CF 0%, #FFD58A 22%, #9ED8FF 55%, #5BA9EC 100%)' }} />
      {/* نجوم بتلمع (بتختفي لما الدنيا تنوّر) */}
      <motion.div animate={{ opacity: lit ? 0 : 1 }} transition={{ duration: 0.8 }} style={{ position: 'absolute', inset: 0 }}>
        {STARS.map((s, i) => (
          <motion.span key={i} aria-hidden="true" animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 1.6 + (i % 4) * 0.4, delay: s.d, repeat: Infinity }}
            style={{ position: 'absolute', left: s.x + '%', top: s.y + '%', width: s.s, height: s.s, borderRadius: s.s, background: '#fff', boxShadow: `0 0 ${s.s * 3}px #fff` }} />
        ))}
      </motion.div>
      {/* أشعة نور بتلف */}
      {lit && <motion.div aria-hidden="true" initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1, rotate: 360 }} transition={{ opacity: { duration: 0.6 }, scale: { duration: 0.8 }, rotate: { repeat: Infinity, duration: 30, ease: 'linear' } }}
        style={{ position: 'absolute', top: '36%', left: '50%', width: 1000, height: 1000, marginLeft: -500, marginTop: -500, background: 'repeating-conic-gradient(from 0deg, #ffffff55 0deg 7deg, transparent 7deg 20deg)', WebkitMaskImage: 'radial-gradient(circle, #000 12%, transparent 58%)', maskImage: 'radial-gradient(circle, #000 12%, transparent 58%)' }} />}
      {/* حبيبات نور طالعة */}
      {lit && DUST.map((p, i) => (
        <motion.span key={i} aria-hidden="true" initial={{ y: '105vh', opacity: 0 }} animate={{ y: '-10vh', opacity: [0, 1, 1, 0] }} transition={{ duration: p.t, delay: p.d, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', left: p.x + '%', top: 0, width: p.s, height: p.s, borderRadius: p.s, background: '#FFF3B0', boxShadow: `0 0 ${p.s * 3}px #FFE07A` }} />
      ))}

      {/* الشهاب */}
      <AnimatePresence>
        {t === 1 && (
          <motion.div key="meteor" aria-hidden="true" initial={{ x: 190, y: -380, opacity: 0 }} animate={{ x: 0, y: -40, opacity: 1 }} exit={{ opacity: 0, scale: 2 }} transition={{ duration: 0.75 * k, ease: [0.55, 0, 0.9, 0.4] }}
            style={{ position: 'absolute', top: '36%', left: '50%', width: 0, height: 0 }}>
            <div style={{ position: 'absolute', width: 220, height: 10, left: 0, top: -5, transformOrigin: '0 50%', transform: 'rotate(-64deg)', borderRadius: 10, background: 'linear-gradient(90deg, #FFF6C0, #FFD25A88 40%, transparent)', filter: 'blur(1px)' }} />
            <div style={{ position: 'absolute', width: 34, height: 34, left: -17, top: -17, borderRadius: 17, background: 'radial-gradient(circle, #fff 30%, #FFE07A 60%, transparent 72%)', boxShadow: '0 0 40px 14px #FFE07A' }} />
          </motion.div>
        )}
      </AnimatePresence>
      {/* الخبطة: فلاش + موجات */}
      {t >= 2 && t < 5 && <motion.div aria-hidden="true" initial={{ opacity: 0.95 }} animate={{ opacity: 0 }} transition={{ duration: 0.7 }} style={{ position: 'absolute', inset: 0, background: '#FFFBEA', pointerEvents: 'none' }} />}
      {t >= 2 && [0, 1, 2].map((i) => (
        <motion.div key={'w' + i} aria-hidden="true" initial={{ scale: 0, opacity: 0.9 }} animate={{ scale: 5, opacity: 0 }} transition={{ duration: 1.1, delay: i * 0.14, ease: 'easeOut' }}
          style={{ position: 'absolute', top: 'calc(36% - 60px)', left: 'calc(50% - 60px)', width: 120, height: 120, borderRadius: 60, border: '6px solid #FFF2B8', pointerEvents: 'none' }} />
      ))}

      <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 18px' }}>
        {/* المسرح */}
        <div style={{ position: 'relative', width: 340, maxWidth: '100%', height: 330 }}>
          {/* النجمة الإسلامية بتترسم */}
          {lit && (
            <motion.svg viewBox="0 0 300 300" aria-hidden="true" initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1, rotate: 360 }} transition={{ scale: sp(90, 12), opacity: { duration: 0.3 }, rotate: { repeat: Infinity, duration: 60, ease: 'linear' } }}
              style={{ position: 'absolute', left: 20, top: 10, width: 300, height: 300 }}>
              <defs><linearGradient id="ig" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFF0A8" /><stop offset=".5" stopColor="#F5B92B" /><stop offset="1" stopColor="#FFE07A" /></linearGradient></defs>
              <circle cx="150" cy="150" r="128" fill="#ffffff30" />
              {STAR8.map((d, i) => <motion.path key={i} d={d} fill="none" stroke="url(#ig)" strokeWidth="7" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, delay: i * 0.12, ease: 'easeInOut' }} />)}
              <motion.circle cx="150" cy="150" r="140" fill="none" stroke="#FFF3C4" strokeWidth="3" strokeDasharray="4 10" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1 }} />
              <motion.circle cx="150" cy="150" r="72" fill="none" stroke="url(#ig)" strokeWidth="4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.2 }} />
            </motion.svg>
          )}
          {/* انفجار نجوم */}
          {t >= 3 && t < 5 && BURST.map((b, i) => (
            <motion.span key={'b' + i} aria-hidden="true" initial={{ x: 0, y: 0, scale: 0.2, opacity: 1 }} animate={{ x: b.x, y: b.y, scale: [0.2, 1.3, 0.6], opacity: [1, 1, 0] }} transition={{ duration: 1, delay: b.d, ease: 'easeOut' }}
              style={{ position: 'absolute', left: 170 - b.s / 2, top: 160 - b.s / 2, width: b.s, height: b.s, background: b.c, clipPath: 'polygon(50% 0,61% 39%,100% 50%,61% 61%,50% 100%,39% 61%,0 50%,39% 39%)', filter: `drop-shadow(0 0 6px ${b.c})` }} />
          ))}
          {/* الأبطال */}
          <AnimatePresence>
            {t >= 3 && (<>
              <motion.img key="bashir" src={A('characters/bashir/fly')} alt="بشير" initial={{ x: 260, y: -120, rotate: -25, opacity: 0 }} animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }} transition={{ ...sp(110, 13), delay: 0.12 }}
                style={{ position: 'absolute', right: -4, top: 6, width: 118, height: 118, objectFit: 'contain', filter: 'drop-shadow(0 8px 12px rgba(20,30,80,.3))' }} />
              <motion.img key="mish" src={A('characters/mishmish/jump')} alt="مشمش" initial={{ y: 260, scaleY: 0.6, opacity: 0 }} animate={{ y: 0, scaleY: 1, opacity: 1 }} transition={{ ...sp(160, 10), delay: 0.24 }}
                style={{ position: 'absolute', left: -2, bottom: 2, width: 126, height: 126, objectFit: 'contain', transformOrigin: '50% 100%', filter: 'drop-shadow(0 8px 12px rgba(20,30,80,.3))' }} />
              <motion.div key="siraj" initial={{ scale: 0, y: 40 }} animate={{ scale: 1, y: 0 }} transition={sp(200, 11)} style={{ position: 'absolute', left: 80, top: 50, width: 180, height: 200 }}>
                <motion.img src={A('characters/siraj/fly_big')} alt="سراج" animate={{ y: [0, -12, 0], rotate: [0, 2, 0, -2, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 0 22px #FFE07A) drop-shadow(0 10px 14px rgba(20,30,80,.25))' }} />
              </motion.div>
            </>)}
          </AnimatePresence>
        </div>

        {/* الاسم بلمعة دهبي */}
        <div style={{ minHeight: 96, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {t >= 4 && (<>
            <div style={{ display: 'flex', gap: 14, direction: 'rtl' }}>
              {['رحلة', 'سراج'].map((w, i) => (
                <motion.span key={w} initial={{ y: -70, scale: 2.2, opacity: 0, rotate: i ? 8 : -8 }} animate={{ y: 0, scale: 1, opacity: 1, rotate: 0 }} transition={{ ...sp(260, 13), delay: i * 0.14 }}
                  className="intro-title" style={{ fontSize: 54, fontWeight: 900, lineHeight: 1.15 }}>{w}</motion.span>
              ))}
            </div>
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              style={{ fontSize: 16, fontWeight: 800, color: '#2B4F96', background: '#ffffffd8', padding: '2px 16px', borderRadius: 14 }}>مغامرة النور للأطفال</motion.span>
          </>)}
        </div>

        {/* الترحيب والزرار */}
        <div style={{ minHeight: 150, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 6 }}>
          <AnimatePresence>
            {t >= 5 && (
              <motion.div key="hi" initial={{ scale: 0.6, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={sp(260, 16)} className="bubble" style={{ fontSize: 19, textAlign: 'center', lineHeight: 1.5 }}>
                {back ? <>{hello()} يا <b style={{ color: '#E07F1E' }}>{profile.name}</b>! 👋 {profile.gender === 'girl' ? 'وحشتيني' : 'وحشتني'}</> : <>السلام عليكم! 👋 أهلًا بيك في رحلة سراج</>}
              </motion.div>
            )}
            {t >= 5 && (
              <motion.div key="go" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={{ width: '100%' }} onPointerDown={(e) => e.stopPropagation()}>
                <Btn className="block pulse" onClick={go} sound="pop" style={{ fontSize: 25, minHeight: 66 }}><Icon d={I.play} size={24} /> {back ? 'يلا نكمّل' : 'يلا نتعرّف!'}</Btn>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {t < 5 && <div style={{ position: 'absolute', top: 'calc(var(--safe-top, 0px) + 14px)', left: 16, fontSize: 13, fontWeight: 800, color: lit ? '#2B4F96' : '#C9D4FF', opacity: 0.8 }}>المس للتخطي</div>}
      <div style={{ position: 'absolute', bottom: 'calc(var(--safe-bottom) + 10px)', fontSize: 12, fontWeight: 700, color: lit ? '#2B5BA8' : '#9FB0E8' }}>تصميم وتطوير Mohamed Eldawly</div>
    </div>
  );
}
