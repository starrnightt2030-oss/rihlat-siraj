// شهادة: بترسم صورة (PNG) فيها اسم الطفل وإنجازه، والطفل يقدر يحفظها على الموبايل أو يبعتها.
// بتستخدم لشهادة حفظ كل سورة، ولشهادة الاختبار الشامل (lines فيها تفاصيل كل سورة).
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { A } from '../lib/asset';
import { sfx } from '../lib/sound';

const W = 1080, H = 1350;
const ARD = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
export const dateAr = (d = new Date()) => {
  const g = d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });
  let h = ''; try { h = d.toLocaleDateString('ar-SA-u-ca-islamic', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) {}
  return [g, h];
};
const img = (src) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });

// c: { title, name, gender, verb, main, sub, stars, lines: [[label, value, color]], footer }
async function draw(canvas, c) {
  try { await Promise.all(['800 60px "Baloo Bhaijaan 2"', '700 60px Amiri'].map((f) => document.fonts.load(f))); } catch (e) {}
  const g = canvas.getContext('2d'); canvas.width = W; canvas.height = H;
  const T = (t, x, y, font, color, align = 'center') => { g.font = font; g.fillStyle = color; g.textAlign = align; g.textBaseline = 'middle'; g.direction = 'rtl'; g.fillText(t, x, y); };
  // الخلفية: ورق كريمي بتدرّج ونقشة نجوم خفيفة
  const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#FFFDF4'); bg.addColorStop(1, '#FFF1D6'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.save(); g.globalAlpha = 0.07; g.fillStyle = '#B07A12';
  for (let y = 60; y < H; y += 90) for (let x = (y / 90) % 2 ? 60 : 105; x < W; x += 90) { g.beginPath(); for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4, r = i % 2 ? 7 : 16; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.fill(); }
  g.restore();
  // الإطار: دهبي مزدوج وزوايا مزخرفة
  const gold = g.createLinearGradient(0, 0, W, H); gold.addColorStop(0, '#C8961E'); gold.addColorStop(0.5, '#F5D27A'); gold.addColorStop(1, '#B07A12');
  g.strokeStyle = gold; g.lineWidth = 18; g.strokeRect(36, 36, W - 72, H - 72);
  g.lineWidth = 4; g.strokeRect(70, 70, W - 140, H - 140);
  g.strokeStyle = '#1F8A61'; g.lineWidth = 2; g.setLineDash([10, 8]); g.strokeRect(86, 86, W - 172, H - 172); g.setLineDash([]);
  for (const [x, y] of [[70, 70], [W - 70, 70], [70, H - 70], [W - 70, H - 70]]) {
    g.save(); g.translate(x, y); g.fillStyle = gold; g.beginPath(); for (let i = 0; i < 16; i++) { const a = (i * Math.PI) / 8, r = i % 2 ? 16 : 38; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.fill();
    g.fillStyle = '#1F8A61'; g.beginPath(); g.arc(0, 0, 10, 0, 7); g.fill(); g.restore();
  }
  // الشعار فوق
  const sj = await img(A('characters/siraj/point'));
  if (sj) { const s = 190 / sj.height; g.drawImage(sj, W / 2 - (sj.width * s) / 2, 120, sj.width * s, 190); }
  // شريط العنوان
  g.fillStyle = '#1F8A61'; g.beginPath(); g.roundRect(W / 2 - 300, 330, 600, 104, 52); g.fill();
  g.fillStyle = '#16704E'; for (const d of [-1, 1]) { g.beginPath(); g.moveTo(W / 2 + d * 300, 352); g.lineTo(W / 2 + d * 360, 382); g.lineTo(W / 2 + d * 300, 412); g.fill(); }
  T(c.title || 'شهادة تقدير', W / 2, 384, '800 58px "Baloo Bhaijaan 2", sans-serif', '#fff');
  T('تشهد رحلة سراج بأن البطل' + (c.gender === 'girl' ? 'ة' : ''), W / 2, 500, '700 40px "Baloo Bhaijaan 2", sans-serif', '#6D5A35');
  // الاسم كبير ومذهّب
  let fs = 112; g.font = `800 ${fs}px "Baloo Bhaijaan 2", sans-serif`; while (g.measureText(c.name).width > W - 260 && fs > 60) { fs -= 6; g.font = `800 ${fs}px "Baloo Bhaijaan 2", sans-serif`; }
  T(c.name, W / 2, 610, `800 ${fs}px "Baloo Bhaijaan 2", sans-serif`, '#B07A12');
  g.strokeStyle = '#E8C77A'; g.lineWidth = 3; g.beginPath(); g.moveTo(W / 2 - 280, 690); g.lineTo(W / 2 + 280, 690); g.stroke();
  T(c.verb || '', W / 2, 760, '700 42px "Baloo Bhaijaan 2", sans-serif', '#6D5A35');
  T(c.main || '', W / 2, 860, '700 96px Amiri, serif', '#1F8A61');
  if (c.sub) T(c.sub, W / 2, 955, '700 38px "Baloo Bhaijaan 2", sans-serif', '#7A6A55');
  let y = 1040;
  if (c.lines?.length) {
    const lines = c.lines.slice(0, 6), rowH = Math.min(52, 230 / lines.length);
    y = 1000;
    for (const [l, v, col] of lines) { T(l, W / 2 + 330, y, '700 32px "Baloo Bhaijaan 2", sans-serif', '#26336B', 'right'); T(v, W / 2 - 330, y, '800 32px "Baloo Bhaijaan 2", sans-serif', col || '#1F8A61', 'left'); y += rowH; }
    y += 10;
  }
  // النجوم
  const n = Math.max(0, Math.min(5, c.stars ?? 3));
  for (let i = 0; i < 5; i++) {
    const x = W / 2 + (i - 2) * 78, yy = Math.max(y + 10, 1100);
    g.save(); g.translate(x, yy); g.fillStyle = i < n ? '#FFC93C' : '#EADFC8'; g.strokeStyle = i < n ? '#D99A0B' : '#D8CBB0'; g.lineWidth = 3;
    g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, r = k % 2 ? 14 : 32; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); g.stroke(); g.restore();
  }
  const [dg, dh] = dateAr(); T('\u200F' + dg, W / 2, 1172, '700 28px "Baloo Bhaijaan 2", sans-serif', '#7A6A55'); if (dh) T('\u200F' + dh, W / 2, 1208, '700 26px "Baloo Bhaijaan 2", sans-serif', '#9A8A70');
  T(c.footer || 'بارك الله فيك وجعل القرآن ربيع قلبك', W / 2, 1246, '700 34px Amiri, serif', '#1F8A61');
  return canvas;
}

const fileName = (c) => `شهادة-${c.name}-${(c.main || '').replace(/\s+/g, '-')}.png`.replace(/[\\/:*?"<>|]/g, '');

export default function Certificate({ c, onClose }) {
  const cv = useRef(null), [url, setUrl] = useState(null), [msg, setMsg] = useState('');
  useEffect(() => { draw(cv.current, c).then((x) => setUrl(x.toDataURL('image/png'))); sfx.star?.(); }, []);
  const b64 = () => url.split(',')[1];
  const share = async () => {
    sfx.tap?.();
    try {
      if (Capacitor.isNativePlatform()) {
        const { Filesystem, Directory } = await import('@capacitor/filesystem');
        const { Share } = await import('@capacitor/share');
        const w = await Filesystem.writeFile({ path: fileName(c), data: b64(), directory: Directory.Cache });
        await Share.share({ title: c.title, text: `${c.title}: ${c.name} — ${c.main}`, files: [w.uri] });
        return;
      }
      const blob = await (await fetch(url)).blob(), f = new File([blob], fileName(c), { type: 'image/png' });
      if (navigator.canShare?.({ files: [f] })) { await navigator.share({ files: [f], title: c.title }); return; }
      save();
    } catch (e) { if (!/cancel/i.test(String(e?.message || e))) setMsg('ماقدرناش نشاركها، جرّب «احفظ الشهادة»'); }
  };
  const save = async () => {
    sfx.tap?.();
    try {
      if (Capacitor.isNativePlatform()) {
        const { Filesystem, Directory } = await import('@capacitor/filesystem');
        await Filesystem.writeFile({ path: 'رحلة سراج/' + fileName(c), data: b64(), directory: Directory.Documents, recursive: true });
        setMsg('✓ اتحفظت في الموبايل: Documents ← رحلة سراج'); return;
      }
      const a = document.createElement('a'); a.href = url; a.download = fileName(c); a.click(); setMsg('✓ الشهادة اتنزّلت');
    } catch (e) { setMsg('ماقدرناش نحفظها هنا، استخدم «شارك» واختار تحفظها في الصور'); }
  };
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(20,24,48,.72)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 16 }}>
      <canvas ref={cv} style={{ display: 'none' }} />
      <motion.div initial={{ scale: 0.6, rotate: -6, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 14 }}
        style={{ width: 'min(100%, 420px)', aspectRatio: '1080 / 1350', borderRadius: 16, overflow: 'hidden', background: '#FFF8E6', boxShadow: '0 20px 60px #0008' }}>
        {url ? <img src={url} alt={c.title} style={{ width: '100%', height: '100%', display: 'block' }} /> : <div style={{ height: '100%', display: 'grid', placeItems: 'center', fontSize: 40 }}>📜</div>}
      </motion.div>
      {msg && <div style={{ color: '#fff', fontWeight: 800, fontSize: 14, textAlign: 'center' }}>{msg}</div>}
      <div style={{ display: 'flex', gap: 10, width: 'min(100%, 420px)' }}>
        <button type="button" disabled={!url} onClick={share} style={{ flex: 1, border: 0, borderRadius: 16, padding: 12, background: '#2FB383', color: '#fff', fontFamily: 'inherit', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>📤 شارك</button>
        <button type="button" disabled={!url} onClick={save} style={{ flex: 1, border: 0, borderRadius: 16, padding: 12, background: '#FFC93C', color: '#5A3B00', fontFamily: 'inherit', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>💾 احفظ</button>
        <button type="button" onClick={onClose} style={{ border: 0, borderRadius: 16, padding: '12px 16px', background: '#fff', color: '#26336B', fontFamily: 'inherit', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>✕</button>
      </div>
    </div>
  );
}
