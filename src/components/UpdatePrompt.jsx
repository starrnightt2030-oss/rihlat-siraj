import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import Siraj from './Siraj';
import { Btn } from './ui';
import { checkForUpdate, applyUpdate } from '../lib/update';
import { sfx } from '../lib/sound';
import { ar } from '../lib/asset';

const NATIVE = Capacitor.isNativePlatform();
const KEY = 'siraj-upd-later';
const nums = (v) => ar(v);

// بيطلع أول ما التطبيق يتفتح أو يرجع من الخلفية لو فيه نسخة أحدث
export default function UpdatePrompt() {
  const [info, setInfo] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let last = 0;
    const run = async () => {
      if (Date.now() - last < 60000 || !navigator.onLine) return; last = Date.now();
      try {
        const r = await checkForUpdate();
        if (!r.hasUpdate) return;
        // "بعدين" بتأجّل التنبيه ٦ ساعات بس، بعدها يظهر تاني
        let later = null; try { later = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
        if (later && later.v === r.latest && Date.now() - later.t < 6 * 3600e3) return;
        setInfo(r); sfx.sparkle();
      } catch (e) {}
    };
    const t = setTimeout(run, 1800);
    const vis = () => document.visibilityState === 'visible' && run();
    document.addEventListener('visibilitychange', vis);
    let sub; if (NATIVE) import('@capacitor/app').then(({ App }) => { sub = App.addListener('resume', run); });
    return () => { clearTimeout(t); document.removeEventListener('visibilitychange', vis); sub?.then?.((h) => h.remove()); };
  }, []);
  const later = () => { try { localStorage.setItem(KEY, JSON.stringify({ v: info.latest, t: Date.now() })); } catch (e) {} setInfo(null); };
  const go = async () => { setBusy(true); try { await applyUpdate(info.latest); } finally { setBusy(false); if (NATIVE) setInfo(null); } };
  return (
    <AnimatePresence>
      {info && (
        <motion.div key="upd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-label="تحديث جديد"
          style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(38,51,107,.45)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 14 }}>
          <motion.div initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }} transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            style={{ width: '100%', maxWidth: 520, background: '#FFF7E8', borderRadius: 32, padding: '18px 18px calc(var(--safe-bottom) + 18px)', display: 'flex', flexDirection: 'column', gap: 12, boxShadow: '0 -6px 30px rgba(38,51,107,.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Siraj pose="party" size={86} still />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 24, fontWeight: 800 }}>فيه تحديث جديد!</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#6D7896' }}>النسخة <bdi dir="ltr">{info.latest}</bdi> — عندك <bdi dir="ltr">{info.current}</bdi></div>
              </div>
            </div>
            {info.notes.length > 0 && (
              <div className="card" style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {info.notes.map((n, i) => <div key={i} style={{ display: 'flex', gap: 8, fontSize: 16, fontWeight: 700, lineHeight: 1.5 }}><span style={{ color: '#2FB383' }}>●</span>{n}</div>)}
              </div>
            )}
            {NATIVE && <div style={{ fontSize: 14, fontWeight: 600, color: '#6D7896', lineHeight: 1.7 }}>هيتحمّل ملف التحديث. افتحه من الإشعارات أو التنزيلات واضغط «تثبيت». تقدّم البطل ونجومه هيفضلوا زي ما هم.</div>}
            <Btn className="block" tone="leaf" sound="pop" onClick={go} disabled={busy}>{busy ? 'ثواني…' : 'حدّث دلوقتي'}</Btn>
            <button type="button" onClick={later} style={{ border: 0, background: 'transparent', fontFamily: 'inherit', fontSize: 16, fontWeight: 700, color: '#6D7896', cursor: 'pointer', padding: 6 }}>بعدين</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
