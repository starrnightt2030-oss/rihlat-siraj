// شاشة التحديث: بتظهر بسرعة أول ما التطبيق يتفتح لو فيه نسخة أحدث، والتحميل بيحصل جوّه التطبيق بشريط تقدّم
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Siraj from './Siraj';
import { Btn } from './ui';
import { checkForUpdate, downloadUpdate, installUpdate, openInBrowser, NATIVE } from '../lib/update';
import { sfx } from '../lib/sound';
import { ar } from '../lib/asset';

const SKIP = 'siraj-upd-skip'; // «بعدين» بتأجّل لحد الفتحة الجاية بس
const mb = (b) => (b ? ar((b / 1048576).toFixed(0)) + ' ميجا' : '');

export default function UpdatePrompt() {
  const [info, setInfo] = useState(null);
  const [st, setSt] = useState('ask'); // ask | down | ready | fail
  const [pct, setPct] = useState(0);
  const [file, setFile] = useState(null);
  useEffect(() => {
    let last = 0, alive = true;
    const run = async () => {
      if (Date.now() - last < 30000 || !navigator.onLine) return; last = Date.now();
      try {
        const r = await checkForUpdate();
        if (!alive || !r.hasUpdate) return;
        if (sessionStorage.getItem(SKIP) === r.latest) return;
        setInfo(r); setSt('ask'); sfx.sparkle?.();
      } catch (e) { /* مفيش نت أو الموقع مش متاح: نجرّب تاني لما التطبيق يرجع */ }
    };
    const t = setTimeout(run, 250);
    const vis = () => document.visibilityState === 'visible' && run();
    document.addEventListener('visibilitychange', vis);
    window.addEventListener('online', run);
    let sub; if (NATIVE) import('@capacitor/app').then(({ App }) => { sub = App.addListener('resume', run); });
    return () => { alive = false; clearTimeout(t); document.removeEventListener('visibilitychange', vis); window.removeEventListener('online', run); sub?.then?.((h) => h.remove()); };
  }, []);

  const later = () => { try { sessionStorage.setItem(SKIP, info.latest); } catch (e) { /* */ } setInfo(null); };
  const go = async () => {
    sfx.pop();
    if (!NATIVE) { location.reload(); return; }
    setSt('down'); setPct(0);
    try { const p = await downloadUpdate(info.latest, setPct); setFile(p); setSt('ready'); sfx.good?.(); await installUpdate(p); }
    catch (e) { setSt('fail'); }
  };
  const install = async () => { try { await installUpdate(file); } catch (e) { setSt('fail'); } };

  return (
    <AnimatePresence>
      {info && (
        <motion.div key="upd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-label="تحديث جديد"
          style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(38,51,107,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 }}>
          <motion.div initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 32, overflow: 'hidden', boxShadow: '0 20px 60px rgba(38,51,107,.35)' }}>
            <div style={{ position: 'relative', padding: '18px 16px 14px', background: 'linear-gradient(135deg, #FFC233, #FF9A3C)', color: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Siraj pose="party" size={84} still />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800, opacity: 0.95 }}>رحلة سراج</div>
                <div style={{ fontSize: 25, fontWeight: 800, lineHeight: 1.2 }}>تحديث جديد وصل! ✨</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }} dir="ltr">
                  <span style={{ background: '#ffffff40', borderRadius: 10, padding: '0 8px', fontWeight: 800, fontSize: 14 }}>{info.current}</span>
                  <span style={{ fontWeight: 800 }}>→</span>
                  <span style={{ background: '#fff', color: '#E07F1E', borderRadius: 10, padding: '0 8px', fontWeight: 800, fontSize: 14 }}>{info.latest}</span>
                </div>
              </div>
            </div>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {info.notes.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '32vh', overflowY: 'auto' }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#6D7896' }}>الجديد في النسخة دي:</div>
                  {info.notes.map((n, i) => (
                    <motion.div key={i} initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 + i * 0.07 }} style={{ display: 'flex', gap: 8, fontSize: 15, fontWeight: 700, lineHeight: 1.5 }}>
                      <span style={{ width: 22, height: 22, borderRadius: 11, background: '#E3F7EE', color: '#1F8A61', fontSize: 13, display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 2 }}>✓</span>{n}
                    </motion.div>
                  ))}
                </div>
              )}
              {st === 'down' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800, color: '#6D7896', marginBottom: 6 }}><span>بنحمّل التحديث…</span><bdi>{ar(Math.round(pct * 100))}٪</bdi></div>
                  <div className="progress" style={{ height: 14 }}><i style={{ width: `${Math.max(4, pct * 100)}%`, background: 'linear-gradient(90deg,#2FB383,#4ED7A3)', transition: 'width .2s' }} /></div>
                </div>
              )}
              {st === 'ready' && <div style={{ fontSize: 15, fontWeight: 700, color: '#1F8A61', lineHeight: 1.6 }}>التحديث جاهز! اضغط «تثبيت» في الشاشة اللي هتظهر. لو أول مرة، الموبايل هيطلب تسمح لـ«رحلة سراج» تثبّت التحديثات. نجوم البطل وتقدّمه هيفضلوا زي ما هم.</div>}
              {st === 'fail' && <div style={{ fontSize: 15, fontWeight: 700, color: '#B85A2E', lineHeight: 1.6 }}>التحميل ما كملش. ممكن نحمّله من المتصفح بدل كده.</div>}
              {st === 'ask' && <Btn className="block" tone="leaf" onClick={go} style={{ minHeight: 60, fontSize: 22 }}>{NATIVE ? 'حدّث دلوقتي' : 'حدّث دلوقتي'}{NATIVE && info.size ? <span style={{ fontSize: 14, opacity: 0.9 }}> · {mb(info.size)}</span> : null}</Btn>}
              {st === 'down' && <Btn className="block" tone="white" disabled style={{ minHeight: 56 }}>ثواني…</Btn>}
              {st === 'ready' && <Btn className="block" tone="leaf" onClick={install} style={{ minHeight: 60, fontSize: 22 }}>تثبيت التحديث</Btn>}
              {st === 'fail' && <Btn className="block" tone="leaf" onClick={() => openInBrowser(info.latest)} style={{ minHeight: 60 }}>حمّله من المتصفح</Btn>}
              {st !== 'down' && <button type="button" onClick={later} style={{ border: 0, background: 'transparent', fontFamily: 'inherit', fontSize: 16, fontWeight: 700, color: '#6D7896', cursor: 'pointer', padding: 4 }}>بعدين</button>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
