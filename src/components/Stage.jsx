// مسرح الأنشودة: مشهد متحرك مرسوم على canvas بيتفاعل مع الأنشودة وهي شغالة.
// التطبيق بيحلّل الصوت لحظة بلحظة (Web Audio): البيس بيخلّي البطل ينطّ، والضربات بتطلّع نجوم وفقاعات،
// وكلمات الموضوع (رمضان، الحج، الأرقام…) بتطلع في فقاعات مع الإيقاع. من غير أي توقيت يدوي.
import { useEffect, useRef } from 'react';

// كل موضوع ليه سما ومشهد وبطل وجزيئات
export const THEMES = {
  arkan5: { sky: ['#0E2A5C', '#1F8A61', '#8FE3C0'], scene: 'mosque', hero: '🕌', parts: ['⭐', '✨', '🤍'], stars: true, moon: 'crescent' },
  ramadan: { sky: ['#1B0F3B', '#5B2A86', '#C2549A'], scene: 'lanterns', hero: '🌙', parts: ['⭐', '✨', '🌟'], stars: true },
  hajj: { sky: ['#FF9A5A', '#FFC56E', '#FFF1C9'], scene: 'kaaba', hero: '🕋', parts: ['🕊️', '🤍', '✨'], sun: true },
  nabi: { sky: ['#06213F', '#0F4C5C', '#2FB383'], scene: 'dome', hero: '💚', parts: ['✨', '🌟', '💚'], stars: true, moon: 'full' },
  jannah: { sky: ['#7FD6FF', '#B8F0D8', '#FFF6D6'], scene: 'garden', hero: '🌳', parts: ['🌸', '🦋', '🍃', '🌼'], sun: true },
  nums: { sky: ['#5AC8FA', '#A6E3FF', '#E8F8FF'], scene: 'balloons', hero: '🎈', parts: ['⭐', '🎉'], sun: true },
  huruf: { sky: ['#FFB86B', '#FFE29A', '#FFF8E1'], scene: 'letters', hero: '✏️', parts: ['⭐', '✨'], sun: true },
  suwar: { sky: ['#9AD8FF', '#D9F2C6', '#F5E9C8'], scene: 'meadow', hero: '📖', parts: ['🐝', '🐜', '🦋'], sun: true },
  animals: { sky: ['#74C7F7', '#BDE8FF', '#E9FFE3'], scene: 'farm', hero: '🦁', parts: ['🐄', '🐑', '🐓', '🐶', '🐱', '🦆', '🐘', '🐴'], sun: true },
  farkha: { sky: ['#8ED1FF', '#CDEEFF', '#FFF4D6'], scene: 'farm', hero: '🐔', parts: ['🐥', '🐥', '🥚', '🌾'], sun: true },
  morning: { sky: ['#FF7E6B', '#FFC371', '#FFF3C4'], scene: 'sunrise', hero: '☀️', parts: ['🐦', '🕊️', '✨'] },
  habits: { sky: ['#FFB3D1', '#FFD9E8', '#FFF5FA'], scene: 'room', hero: '👧', parts: ['⭐', '🫧', '🧸', '💖'] },
  family: { sky: ['#8EC5FF', '#CFE6FF', '#FFF3E0'], scene: 'house', hero: '🏠', parts: ['❤️', '🎈', '⭐'], sun: true },
  dooq: { sky: ['#2E3A6B', '#7A5BA8', '#F2A65A'], scene: 'forest', hero: '🚪', parts: ['🍃', '🍂', '✨'], peek: ['🦊', '🐺'] },
};

const rnd = (a, b) => a + Math.random() * (b - a);
const COLORS = ['#FF6B6B', '#FFB627', '#4ED7A3', '#3A8FE0', '#B07AF2', '#FF89B5'];

export default function Stage({ audio, theme, words = [], color = '#7B5CE0', bpm = 110, height = 300 }) {
  const cv = useRef(null);
  const th = THEMES[theme] || THEMES.nums;
  useEffect(() => {
    const canvas = cv.current, g = canvas.getContext('2d');
    let W = 0, H = 0, dpr = 1, raf, alive = true;
    const fit = () => { dpr = Math.min(2, window.devicePixelRatio || 1); W = canvas.clientWidth; H = canvas.clientHeight; canvas.width = W * dpr; canvas.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); };
    fit(); const ro = new ResizeObserver(fit); ro.observe(canvas);

    // تحليل الصوت: لو Web Audio مش متاحة، بنقلّد الإيقاع من سرعة الأنشودة
    let an = null, buf = null;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC && audio) {
        const ctx = audio.__ctx || (audio.__ctx = new AC());
        const src = audio.__src || (audio.__src = ctx.createMediaElementSource(audio));
        an = ctx.createAnalyser(); an.fftSize = 512; an.smoothingTimeConstant = 0.7;
        src.disconnect(); src.connect(an); an.connect(ctx.destination);
        buf = new Uint8Array(an.frequencyBinCount);
        const wake = () => ctx.state !== 'running' && ctx.resume().catch(() => {});
        audio.addEventListener('play', wake); wake();
      }
    } catch (e) { an = null; }

    const stars = Array.from({ length: 60 }, () => ({ x: Math.random(), y: Math.random() * 0.6, r: rnd(0.6, 1.8), p: Math.random() * 6 }));
    const parts = [], bubbles = [], rings = [];
    let bassAvg = 0.2, last = 0, beats = 0, hop = 0, sway = 0, wordAt = 0, wi = 0;
    const spin = { a: 0 };

    const energy = (t) => {
      if (an && !audio.paused) {
        an.getByteFrequencyData(buf);
        let b = 0, m = 0, h = 0;
        for (let i = 1; i < 8; i++) b += buf[i]; for (let i = 8; i < 48; i++) m += buf[i]; for (let i = 48; i < 160; i++) h += buf[i];
        return { bass: b / 7 / 255, mid: m / 40 / 255, high: h / 112 / 255, bars: buf };
      }
      if (audio && !audio.paused) { const ph = ((audio.currentTime * bpm) / 60) % 1; const v = Math.exp(-ph * 6) * 0.8 + 0.2; return { bass: v, mid: 0.4 + 0.2 * Math.sin(t * 3), high: 0.3, bars: null }; }
      return { bass: 0, mid: 0, high: 0, bars: null };
    };

    const emoji = (e, x, y, s, rot = 0, a = 1) => { g.save(); g.globalAlpha = a; g.translate(x, y); g.rotate(rot); g.font = `${s}px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(e, 0, 0); g.restore(); };
    // الهلال: بنرسمه على لوحة صغيرة لوحده ونقص منه دايرة، عشان السما وراه تفضل باينة
    const moonC = document.createElement('canvas');
    const crescent = (x, y, r, col) => {
      const d = Math.ceil(r * 2 + 4); moonC.width = moonC.height = d * 2; const m = moonC.getContext('2d'); m.setTransform(2, 0, 0, 2, 0, 0);
      m.clearRect(0, 0, d, d); m.fillStyle = col; m.beginPath(); m.arc(d / 2, d / 2, r, 0, 7); m.fill();
      m.globalCompositeOperation = 'destination-out'; m.beginPath(); m.arc(d / 2 + r * 0.45, d / 2 - r * 0.2, r * 0.85, 0, 7); m.fill(); m.globalCompositeOperation = 'source-over';
      g.drawImage(moonC, x - d / 2, y - d / 2, d, d);
    };
    const isGlyph = (e) => /^[\u0621-\u064A\u0660-\u0669\s]+$/.test(e);
    const hills = (y, amp, col, ph = 0) => { g.fillStyle = col; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 8) g.lineTo(x, y + Math.sin(x / W * Math.PI * 2 + ph) * amp); g.lineTo(W, H); g.fill(); };

    const scenes = {
      mosque(t, e) {
        hills(H * 0.86, 6, '#0B3B2E');
        const cx = W / 2, base = H * 0.86, s = Math.min(W, H) / 300;
        g.fillStyle = '#0D4A39';
        g.beginPath(); g.ellipse(cx, base - 70 * s, 52 * s, 52 * s, 0, Math.PI, 0); g.fill();
        g.fillRect(cx - 62 * s, base - 72 * s, 124 * s, 72 * s);
        for (const dx of [-90, 90]) { g.fillRect(cx + dx * s - 8 * s, base - 140 * s, 16 * s, 140 * s); g.beginPath(); g.moveTo(cx + dx * s - 11 * s, base - 140 * s); g.lineTo(cx + dx * s, base - 165 * s); g.lineTo(cx + dx * s + 11 * s, base - 140 * s); g.fill(); }
        // الأعمدة الخمسة بتنوّر مع الموسيقى
        for (let i = 0; i < 5; i++) { const lit = 0.25 + 0.75 * Math.max(0, Math.sin(t * 2 + i) * e.mid * 2); g.fillStyle = `rgba(255,214,107,${lit})`; g.fillRect(cx - 50 * s + i * 22 * s, base - 50 * s, 12 * s, 40 * s); }
        g.fillStyle = '#FFD66B'; g.beginPath(); g.arc(cx, base - 128 * s, 6 * s, 0, 7); g.fill();
      },
      lanterns(t, e) {
        hills(H * 0.9, 8, '#24104A', 1);
        for (let i = 0; i < 5; i++) {
          const x = W * (0.12 + i * 0.19), len = 40 + (i % 2) * 30, a = Math.sin(t * 1.6 + i) * 0.25 * (0.4 + e.bass);
          const lx = x + Math.sin(a) * len, ly = Math.cos(a) * len;
          g.strokeStyle = '#E8C77A'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, 0); g.lineTo(lx, ly); g.stroke();
          const glow = g.createRadialGradient(lx, ly + 18, 2, lx, ly + 18, 40 + e.bass * 30); glow.addColorStop(0, 'rgba(255,190,90,.55)'); glow.addColorStop(1, 'rgba(255,190,90,0)');
          g.fillStyle = glow; g.beginPath(); g.arc(lx, ly + 18, 70, 0, 7); g.fill();
          emoji('🏮', lx, ly + 18, 34, a);
        }
        const mg = g.createRadialGradient(W * 0.8, H * 0.32, 5, W * 0.8, H * 0.32, 60 + e.bass * 20); mg.addColorStop(0, 'rgba(255,233,168,.5)'); mg.addColorStop(1, 'rgba(255,233,168,0)'); g.fillStyle = mg; g.fillRect(0, 0, W, H);
        crescent(W * 0.8, H * 0.32, 28, '#FFE9A8');
      },
      kaaba(t, e) {
        g.fillStyle = '#C98A4B'; g.beginPath(); g.moveTo(0, H * 0.7); g.lineTo(W * 0.25, H * 0.5); g.lineTo(W * 0.45, H * 0.68); g.lineTo(W * 0.7, H * 0.48); g.lineTo(W, H * 0.66); g.lineTo(W, H); g.lineTo(0, H); g.fill();
        g.fillStyle = '#F3E6CF'; g.beginPath(); g.ellipse(W / 2, H * 0.84, W * 0.46, H * 0.14, 0, 0, 7); g.fill();
        spin.a += 0.006 + e.bass * 0.03;
        for (let i = 0; i < 36; i++) { const a = spin.a + i / 36 * Math.PI * 2, rx = W * 0.36, ry = H * 0.09; const x = W / 2 + Math.cos(a) * rx, y = H * 0.84 + Math.sin(a) * ry; g.fillStyle = Math.sin(a) > 0 ? '#FFFFFF' : '#EDE3D2'; g.beginPath(); g.arc(x, y - 6, 4 + (Math.sin(a) + 1), 0, 7); g.fill(); }
      },
      dome(t, e) {
        hills(H * 0.88, 5, '#062A30');
        const cx = W * 0.5, base = H * 0.88, s = Math.min(W, H) / 300;
        g.fillStyle = '#0A3A40'; g.fillRect(cx - 110 * s, base - 50 * s, 220 * s, 50 * s);
        g.fillStyle = '#1FAA6B'; g.beginPath(); g.ellipse(cx, base - 50 * s, 40 * s, 52 * s, 0, Math.PI, 0); g.fill();
        g.fillStyle = `rgba(80,255,170,${0.15 + e.mid * 0.6})`; g.beginPath(); g.ellipse(cx, base - 60 * s, 70 * s, 80 * s, 0, 0, 7); g.fill();
        for (const dx of [-120, 120]) { g.fillStyle = '#0A3A40'; g.fillRect(cx + dx * s - 6 * s, base - 120 * s, 12 * s, 120 * s); g.beginPath(); g.moveTo(cx + dx * s - 9 * s, base - 120 * s); g.lineTo(cx + dx * s, base - 140 * s); g.lineTo(cx + dx * s + 9 * s, base - 120 * s); g.fill(); }
        for (let i = 0; i < 9; i++) { g.fillStyle = `rgba(255,220,120,${0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i))})`; g.fillRect(cx - 100 * s + i * 23 * s, base - 30 * s, 8 * s, 14 * s); }
      },
      garden(t, e) {
        hills(H * 0.74, 14, '#9BE08A', 0.5); hills(H * 0.84, 10, '#5CC46A', 2);
        for (let i = 0; i < 4; i++) emoji(i % 2 ? '🌴' : '🌳', W * (0.1 + i * 0.27), H * 0.72 - (i % 2) * 6, 54, Math.sin(t * 1.5 + i) * 0.05 * (1 + e.bass * 2));
        for (let i = 0; i < 9; i++) emoji(['🌷', '🌼', '🌸'][i % 3], W * (0.05 + i * 0.11), H * 0.93, 20, 0, 1);
        g.strokeStyle = 'rgba(120,200,255,.8)'; g.lineWidth = 6; g.beginPath(); for (let x = 0; x <= W; x += 10) g.lineTo(x, H * 0.88 + Math.sin(x / 30 + t * 2) * 2); g.stroke();
      },
      balloons(t, e) {
        hills(H * 0.9, 6, '#7BD389');
        for (let i = 0; i < 10; i++) {
          const x = W * (0.1 + (i % 5) * 0.2) + (i > 4 ? W * 0.04 : -W * 0.02), y = H * (0.28 + (i > 4 ? 0.26 : 0)) + Math.sin(t * 1.5 + i) * 8 - e.bass * 10;
          g.strokeStyle = '#ffffffaa'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y + 22); g.lineTo(x + Math.sin(t + i) * 6, y + 60); g.stroke();
          g.fillStyle = COLORS[i % 6]; g.beginPath(); g.ellipse(x, y, 19, 23, 0, 0, 7); g.fill();
          g.fillStyle = '#fff'; g.font = 'bold 24px "Baloo Bhaijaan 2", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('١٢٣٤٥٦٧٨٩'[i] || '١٠', x, y + 3);
        }
      },
      letters(t, e) {
        g.fillStyle = '#2E7D5B'; g.fillRect(W * 0.08, H * 0.18, W * 0.84, H * 0.5); g.strokeStyle = '#B07A12'; g.lineWidth = 8; g.strokeRect(W * 0.08, H * 0.18, W * 0.84, H * 0.5);
        const L = 'أبتثجحخدذرزسشصضطظعغفقكلمنهوي';
        for (let i = 0; i < 7; i++) { const k = (Math.floor(t * bpm / 120) + i * 4) % L.length; g.fillStyle = i === 3 ? '#FFE29A' : '#ffffffcc'; g.font = `bold ${i === 3 ? 44 + e.bass * 20 : 26}px "Baloo Bhaijaan 2", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(L[k], W * (0.86 - i * 0.12), H * 0.43 + (i === 3 ? 0 : Math.sin(t * 2 + i) * 6)); }
        hills(H * 0.92, 4, '#E8B26A');
      },
      meadow(t, e) { hills(H * 0.78, 12, '#BFE59A', 1); hills(H * 0.88, 8, '#8CCB6A', 3); for (let i = 0; i < 6; i++) emoji('🌾', W * (0.05 + i * 0.18), H * 0.86, 26, Math.sin(t * 2 + i) * 0.1); },
      farm(t, e) {
        hills(H * 0.76, 10, '#A6E08C', 1); hills(H * 0.86, 8, '#76C66A', 2.5);
        const s = Math.min(W, H) / 300, bx = W * 0.8, by = H * 0.8;
        g.fillStyle = '#D64545'; g.fillRect(bx - 34 * s, by - 50 * s, 68 * s, 50 * s); g.beginPath(); g.moveTo(bx - 42 * s, by - 50 * s); g.lineTo(bx, by - 82 * s); g.lineTo(bx + 42 * s, by - 50 * s); g.fill();
        g.fillStyle = '#fff'; g.fillRect(bx - 12 * s, by - 30 * s, 24 * s, 30 * s);
        g.strokeStyle = '#B98A55'; g.lineWidth = 3; for (let x = 0; x < W * 0.6; x += 22) { g.beginPath(); g.moveTo(x, H * 0.82); g.lineTo(x, H * 0.9); g.stroke(); } g.beginPath(); g.moveTo(0, H * 0.85); g.lineTo(W * 0.6, H * 0.85); g.stroke();
      },
      sunrise(t, e) {
        const p = audio && audio.duration ? Math.min(1, audio.currentTime / Math.min(60, audio.duration)) : 0.5;
        const sy = H * (0.95 - 0.55 * p);
        const gl = g.createRadialGradient(W / 2, sy, 10, W / 2, sy, 160 + e.bass * 60); gl.addColorStop(0, 'rgba(255,240,180,.9)'); gl.addColorStop(1, 'rgba(255,240,180,0)'); g.fillStyle = gl; g.fillRect(0, 0, W, H);
        g.fillStyle = '#FFD45A'; g.beginPath(); g.arc(W / 2, sy, 38 + e.bass * 8, 0, 7); g.fill();
        hills(H * 0.8, 16, '#E38A5B', 0.3); hills(H * 0.9, 10, '#B4643F', 2);
      },
      room(t, e) {
        g.fillStyle = '#FFE3EE'; g.fillRect(0, H * 0.78, W, H * 0.22);
        g.fillStyle = '#fff'; g.fillRect(W * 0.08, H * 0.16, W * 0.26, H * 0.3); g.fillStyle = '#9AD8FF'; g.fillRect(W * 0.1, H * 0.18, W * 0.22, H * 0.26);
        emoji('🛏️', W * 0.8, H * 0.74, 60); emoji('🧸', W * 0.2, H * 0.78, 36, Math.sin(t * 3) * 0.1 * (1 + e.bass * 3)); emoji('📚', W * 0.62, H * 0.8, 30);
      },
      house(t, e) {
        hills(H * 0.84, 6, '#8FD17E');
        const s = Math.min(W, H) / 300, cx = W * 0.5, by = H * 0.84;
        g.fillStyle = '#FFF3D6'; g.fillRect(cx - 70 * s, by - 80 * s, 140 * s, 80 * s);
        g.fillStyle = '#E2553F'; g.beginPath(); g.moveTo(cx - 84 * s, by - 80 * s); g.lineTo(cx, by - 135 * s); g.lineTo(cx + 84 * s, by - 80 * s); g.fill();
        g.fillStyle = '#8C5A1F'; g.fillRect(cx - 14 * s, by - 44 * s, 28 * s, 44 * s);
        for (const dx of [-45, 45]) { g.fillStyle = `rgba(255,214,107,${0.5 + e.mid})`; g.fillRect(cx + dx * s - 14 * s, by - 66 * s, 28 * s, 24 * s); }
        emoji('🌳', W * 0.12, by - 30, 60); emoji('🌳', W * 0.9, by - 26, 50);
      },
      forest(t, e) {
        for (let i = 0; i < 8; i++) emoji('🌲', W * (i / 7), H * 0.7 + (i % 2) * 14, 60 + (i % 3) * 10);
        hills(H * 0.86, 6, '#3B2E5A');
        const s = Math.min(W, H) / 300, cx = W * 0.5, by = H * 0.86;
        g.fillStyle = '#A0522D'; g.fillRect(cx - 60 * s, by - 90 * s, 120 * s, 90 * s);
        g.fillStyle = '#5C2E12'; g.fillRect(cx - 20 * s, by - 60 * s, 40 * s, 60 * s);
        g.fillStyle = '#FFD66B'; g.beginPath(); g.arc(cx + 12 * s, by - 30 * s, 3 * s, 0, 7); g.fill();
        const k = Math.floor(t / 3) % 2, peek = Math.max(0, Math.sin(t * Math.PI / 3));
        emoji(THEMES.dooq.peek[k], k ? W * 0.12 + peek * 30 : W * 0.88 - peek * 30, by - 20, 40);
      },
    };

    const draw = (now) => {
      if (!alive) return;
      const t = now / 1000, e = energy(t);
      // كشف الضربة: البيس أعلى من متوسطه بفرق واضح
      bassAvg = bassAvg * 0.95 + e.bass * 0.05;
      const beat = e.bass > 0.25 && e.bass > bassAvg * 1.25 && t - last > 60 / bpm * 0.7;
      if (beat) {
        last = t; beats++; hop = 1;
        rings.push({ r: 30, a: 0.6 });
        for (let i = 0; i < 2 + Math.round(e.high * 4); i++) parts.push({ e: th.parts[Math.floor(Math.random() * th.parts.length)], x: rnd(0.1, 0.9) * W, y: H * rnd(0.6, 0.9), vx: rnd(-0.6, 0.6), vy: rnd(-2.4, -1.2), r: rnd(-0.5, 0.5), vr: rnd(-0.03, 0.03), s: rnd(18, 30), life: 1 });
        if (words.length && beats - wordAt >= 6 && !bubbles.length) { wordAt = beats; const [we, ww] = words[wi++ % words.length]; bubbles.push({ e: we, w: ww, x: rnd(0.25, 0.75) * W, y: H * 0.78, life: 1, c: COLORS[wi % 6] }); }
      }
      hop *= 0.88; sway += 0.02 + e.mid * 0.05;

      // السما
      const sk = g.createLinearGradient(0, 0, 0, H); sk.addColorStop(0, th.sky[0]); sk.addColorStop(0.6, th.sky[1]); sk.addColorStop(1, th.sky[2]); g.fillStyle = sk; g.fillRect(0, 0, W, H);
      if (th.stars) for (const s of stars) { g.fillStyle = `rgba(255,255,255,${0.35 + 0.65 * Math.abs(Math.sin(t * 1.3 + s.p)) * (0.5 + e.high)})`; g.beginPath(); g.arc(s.x * W, s.y * H, s.r, 0, 7); g.fill(); }
      if (th.moon === 'full') { const mg = g.createRadialGradient(W * 0.82, H * 0.2, 5, W * 0.82, H * 0.2, 70); mg.addColorStop(0, 'rgba(255,250,220,.9)'); mg.addColorStop(1, 'rgba(255,250,220,0)'); g.fillStyle = mg; g.fillRect(0, 0, W, H); g.fillStyle = '#FFF8DC'; g.beginPath(); g.arc(W * 0.82, H * 0.2, 24, 0, 7); g.fill(); }
      if (th.moon === 'crescent') crescent(W * 0.18, H * 0.2, 22, '#FFE9A8');
      if (th.sun) { const sg = g.createRadialGradient(W * 0.85, H * 0.16, 5, W * 0.85, H * 0.16, 60 + e.bass * 30); sg.addColorStop(0, 'rgba(255,236,150,1)'); sg.addColorStop(0.4, 'rgba(255,214,90,.7)'); sg.addColorStop(1, 'rgba(255,214,90,0)'); g.fillStyle = sg; g.fillRect(0, 0, W, H); g.save(); g.translate(W * 0.85, H * 0.16); g.rotate(t * 0.3); g.strokeStyle = 'rgba(255,214,90,.6)'; g.lineWidth = 3; for (let i = 0; i < 12; i++) { g.rotate(Math.PI / 6); g.beginPath(); g.moveTo(30, 0); g.lineTo(42 + e.bass * 12, 0); g.stroke(); } g.restore(); g.fillStyle = '#FFD64A'; g.beginPath(); g.arc(W * 0.85, H * 0.16, 24, 0, 7); g.fill(); }
      for (let i = 0; i < 3; i++) { const cx = ((t * (8 + i * 4) + i * W / 3) % (W + 160)) - 80, cy = H * (0.12 + i * 0.08); g.fillStyle = th.stars ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.75)'; for (const [dx, dy, r] of [[0, 0, 18], [20, -8, 22], [42, 0, 16]]) { g.beginPath(); g.arc(cx + dx, cy + dy, r, 0, 7); g.fill(); } }

      scenes[th.scene]?.(t, e);

      // دواير الضربة حوالين البطل
      const hx = W / 2, hy = th.scene === 'kaaba' ? H * 0.66 : H * 0.42;
      for (const r of rings) { r.r += 3; r.a *= 0.94; g.strokeStyle = `rgba(255,255,255,${r.a})`; g.lineWidth = 4; g.beginPath(); g.arc(hx, hy, r.r, 0, 7); g.stroke(); }
      while (rings.length && rings[0].a < 0.03) rings.shift();
      // البطل: بينطّ مع البيس ويتمايل مع اللحن
      const hs = Math.min(W, H) * (th.scene === 'kaaba' ? 0.32 : 0.24) * (1 + hop * 0.18);
      if (!['mosque', 'dome', 'house', 'forest', 'balloons', 'letters', 'lanterns', 'sunrise'].includes(th.scene) || th.scene === 'kaaba') emoji(th.hero, hx, hy - hop * 18, hs, Math.sin(sway) * 0.08);
      else { const glow = g.createRadialGradient(hx, H * 0.1, 2, hx, H * 0.1, 50 + hop * 30); glow.addColorStop(0, 'rgba(255,255,255,.5)'); glow.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = glow; g.fillRect(0, 0, W, H * 0.3); }

      // الجزيئات
      for (const p of parts) { p.x += p.vx; p.y += p.vy; p.vy += 0.012; p.r += p.vr; p.life -= 0.008; emoji(p.e, p.x, p.y, p.s, p.r, Math.max(0, p.life)); }
      while (parts.length && parts[0].life <= 0) parts.shift();
      if (parts.length > 60) parts.splice(0, parts.length - 60);
      // فقاعات الكلمات
      for (const b of bubbles) {
        b.y -= 0.9; b.life -= 0.0055; const a = Math.min(1, b.life * 3), wob = Math.sin(b.y / 18) * 6;
        const sc = 1 + Math.max(0, 0.25 - (1 - b.life)) * 2; // بتكبر وهي طالعة
        g.save(); g.globalAlpha = a; g.translate(b.x + wob, b.y); g.scale(sc, sc); g.font = 'bold 22px "Baloo Bhaijaan 2", sans-serif'; const tw = b.w ? g.measureText(b.w).width : 0, bw = 58 + tw + (b.w ? 22 : 0), bh = 56;
        g.shadowColor = 'rgba(0,0,0,.18)'; g.shadowBlur = 10; g.shadowOffsetY = 4; g.fillStyle = '#fff'; g.beginPath(); g.roundRect(-bw / 2, -bh / 2, bw, bh, 28); g.fill(); g.shadowColor = 'transparent';
        g.strokeStyle = b.c; g.lineWidth = 4; g.stroke();
        g.textBaseline = 'middle'; g.textAlign = 'center';
        if (isGlyph(b.e)) { g.fillStyle = b.c; g.font = 'bold 32px "Baloo Bhaijaan 2", sans-serif'; g.fillText(b.e, bw / 2 - 29, 2); } else { g.font = '32px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif'; g.fillText(b.e, bw / 2 - 29, 2); }
        if (b.w) { g.fillStyle = '#26336B'; g.font = 'bold 22px "Baloo Bhaijaan 2", sans-serif'; g.textAlign = 'right'; g.direction = 'rtl'; g.fillText(b.w, bw / 2 - 56, 2); }
        g.restore();
      }
      while (bubbles.length && bubbles[0].life <= 0) bubbles.shift();

      // إكوالايزر ملوّن تحت
      const n = 28, bw = W / n;
      for (let i = 0; i < n; i++) {
        const v = e.bars ? e.bars[2 + Math.floor(i * 4.5)] / 255 : (audio && !audio.paused ? 0.2 + 0.3 * Math.abs(Math.sin(t * 4 + i)) * e.bass : 0.04);
        const h = 4 + v * H * 0.16; g.fillStyle = COLORS[i % 6] + 'CC'; g.beginPath(); g.roundRect(i * bw + 2, H - h, bw - 4, h, 3); g.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { alive = false; cancelAnimationFrame(raf); ro.disconnect(); try { an?.disconnect(); } catch (e) {} };
  }, [audio, theme]);
  return <canvas ref={cv} style={{ display: 'block', width: '100%', height, borderRadius: 26, boxShadow: `0 8px 0 ${color}44, 0 18px 34px ${color}33` }} aria-label="مشهد الأنشودة" />;
}
