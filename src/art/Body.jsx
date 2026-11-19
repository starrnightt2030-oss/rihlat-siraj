// أدوات رسم الجسم: أطراف مدبّبة، إيد بصوابع، رجل بصوابع — كله بحدّ غامق وظل خفيف عشان الشكل يبان واضح
export const SKIN = '#F2C7A5', SKIN_D = '#E2A985', SKIN_L = '#B07A5C', HAIR = '#4A2E1C';
const r2 = (n) => Math.round(n * 10) / 10;

// طرف مدبّب من a لـ b بعرض wa و wb (زي الدراع أو الرجل جوّه الكم)
export function Limb({ a, b, wa, wb, fill, line, sw = 2.6 }) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  const p = (pt, w, s) => `${r2(pt[0] + nx * w * s)} ${r2(pt[1] + ny * w * s)}`;
  const d = `M${p(a, wa, 1)} L${p(b, wb, 1)} A${wb} ${wb} 0 0 1 ${p(b, wb, -1)} L${p(a, wa, -1)} A${wa} ${wa} 0 0 1 ${p(a, wa, 1)}Z`;
  return <path d={d} fill={fill} stroke={line} strokeWidth={sw} strokeLinejoin="round" />;
}
// سلسلة أطراف (كتف ← كوع ← رسغ)
export const Chain = ({ pts, ws, fill, line }) => {
  const d = 'M' + pts.map((p) => p.join(' ')).join(' L'); const w = ws[0] * 2;
  return (<g><path d={d} fill="none" stroke={line} strokeWidth={w + 5} strokeLinecap="round" strokeLinejoin="round" /><path d={d} fill="none" stroke={fill} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" /></g>);
};

// إيد: كف + ٤ صوابع + إبهام. ang = اتجاه الصوابع بالدرجات، flip = إبهام في الناحية التانية
// mode: open (مفرودة) | flat (على الأرض) | point (السبابة مرفوعة) | cup (كفّ مضموم فيه مية)
export function Hand({ at, ang = 90, s = 1, flip = false, mode = 'open', fill = SKIN, line = SKIN_L }) {
  const f = flip ? -1 : 1;
  const fingers = mode === 'point'
    ? [<rect key="i" x={-2.6} y={-24} width={5.2} height={16} rx={2.6} />, <ellipse key="k" cx={0} cy={-6} rx={7.5} ry={5} />]
    : mode === 'cup'
      ? [<path key="c" d="M-9 -4 Q-10 -16 0 -17 Q10 -16 9 -4z" />]
      : [-6, -2, 2, 6].map((x, i) => <rect key={i} x={x - 2.2} y={-19 + (i === 0 || i === 3 ? 3 : 0)} width={4.4} height={13 - (i === 3 ? 2 : 0)} rx={2.2} />);
  return (
    <g transform={`translate(${at[0]} ${at[1]}) rotate(${ang - 90}) scale(${s})`} fill={fill} stroke={line} strokeWidth={2.2} strokeLinejoin="round">
      {fingers}
      {mode !== 'point' && <rect x={f > 0 ? -12.5 : 8} y={-9} width={4.5} height={10} rx={2.2} transform={`rotate(${f * -30} ${f > 0 ? -10 : 10} -2)`} />}
      <rect x={-8.5} y={-9} width={17} height={14} rx={5} />
      {mode === 'cup' && <ellipse cx={0} cy={-11} rx={6} ry={2.6} fill="#7FD3F0" stroke="none" />}
    </g>
  );
}

// رجل من الجنب: كعب + صوابع. dir=-1 الصوابع ناحية الشمال. toes=true واقف على صوابعه (السجود)
export function Foot({ at, dir = -1, s = 1, toes = false, fill = SKIN, line = SKIN_L }) {
  const [x, y] = at;
  if (toes) return (
    <g transform={`translate(${x} ${y}) scale(${dir * -s} ${s})`} fill={fill} stroke={line} strokeWidth={2.2} strokeLinejoin="round">
      <path d="M-4 -26 C 4 -26, 8 -18, 7 -8 L 9 0 L -6 0 L -9 -12 C -10 -20, -9 -26, -4 -26z" />
      {[-4, 0, 4].map((t) => <ellipse key={t} cx={t + 1} cy={1} rx={2.3} ry={1.8} />)}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${dir * -s} ${s})`} fill={fill} stroke={line} strokeWidth={2.2} strokeLinejoin="round">
      <path d="M-10 -11 C -11 -4, -10 0, -6 0 L 18 0 C 23 0, 24 -4, 20 -7 L 8 -10 C 4 -13, -6 -15, -10 -11z" />
      {[12, 16, 20].map((t) => <path key={t} d={`M${t} -1 v-3`} stroke={line} strokeWidth={1.4} />)}
    </g>
  );
}

// الراس من الجنب (من غير ملامح): ولد بطاقية وشعر ورا، بنت بخمار. dir=-1 باصص شمال
export function Head({ at, g, P, dir = -1, tilt = 0, r = 22, bare = false }) {
  const [x, y] = at;
  if (g === 'girl' && !bare) return (
    <g transform={`rotate(${tilt} ${x} ${y})`}>
      <path d={`M${x - r - 5} ${y + 2} C ${x - r - 6} ${y - r - 12}, ${x + r + 6} ${y - r - 12}, ${x + r + 5} ${y + 2} C ${x + r + 6} ${y + r * 0.7}, ${x + r + 9} ${y + r + 4}, ${x + r + 10} ${y + r + 12} L ${x - r - 10} ${y + r + 12} C ${x - r - 9} ${y + r + 4}, ${x - r - 6} ${y + r * 0.7}, ${x - r - 5} ${y + 2}z`} fill={P.cap} stroke={P.capLine} strokeWidth="2.8" strokeLinejoin="round" />
      <path d={`M${x + dir * r * 0.2 - r * 0.62} ${y - r * 0.55} C ${x + dir * r * 0.2 - r * 0.8} ${y + r * 0.5}, ${x + dir * r * 0.2 + r * 0.8} ${y + r * 0.5}, ${x + dir * r * 0.2 + r * 0.62} ${y - r * 0.55} C ${x + dir * r * 0.2 + r * 0.3} ${y - r * 0.85}, ${x + dir * r * 0.2 - r * 0.3} ${y - r * 0.85}, ${x + dir * r * 0.2 - r * 0.62} ${y - r * 0.55}z`} fill={SKIN} stroke={SKIN_L} strokeWidth="2.4" />
      <circle cx={x + dir * r * 0.5} cy={y + r * 0.12} r={r * 0.17} fill="#FF9EB0" opacity=".5" />
    </g>
  );
  const b = -dir; // ناحية القفا
  return (
    <g transform={`rotate(${tilt} ${x} ${y})`}>
      <circle cx={x} cy={y} r={r} fill={SKIN} stroke={SKIN_L} strokeWidth="2.4" />
      <path d={`M${x + b * r * 0.15} ${y - r * 0.95} C ${x + b * r * 0.9} ${y - r * 0.9}, ${x + b * r * 1.12} ${y - r * 0.1}, ${x + b * r * 0.8} ${y + r * 0.62} C ${x + b * r * 0.6} ${y + r * 0.2}, ${x + b * r * 0.35} ${y - r * 0.2}, ${x + b * r * 0.15} ${y - r * 0.95}z`} fill={HAIR} />
      <path d={`M${x + b * r * 0.3} ${y - r * 0.1} c ${b * r * 0.2} ${-r * 0.06}, ${b * r * 0.26} ${r * 0.34}, 0 ${r * 0.38}`} fill={SKIN_D} stroke={SKIN_L} strokeWidth="2" strokeLinecap="round" />
      {g === 'girl' ? (<g>
        <path d={`M${x - r * 1.02} ${y - r * 0.1} C ${x - r * 1.05} ${y - r * 1.2}, ${x + r * 1.05} ${y - r * 1.2}, ${x + r * 1.02} ${y - r * 0.1} C ${x + r * 0.5} ${y - r * 0.55}, ${x - r * 0.5} ${y - r * 0.55}, ${x - r * 1.02} ${y - r * 0.1}z`} fill={HAIR} />
        <path d={`M${x + b * r * 0.9} ${y - r * 0.5} C ${x + b * r * 1.6} ${y - r * 0.4}, ${x + b * r * 1.5} ${y + r * 0.9}, ${x + b * r * 1.2} ${y + r * 1.2} C ${x + b * r * 1.1} ${y + r * 0.6}, ${x + b * r} ${y}, ${x + b * r * 0.9} ${y - r * 0.5}z`} fill={HAIR} />
        <circle cx={x + b * r * 0.95} cy={y - r * 0.5} r={r * 0.14} fill="#FF7FAE" />
      </g>) : (<g>
      <path d={`M${x - r - 1} ${y - r * 0.32} C ${x - r} ${y - r * 1.45}, ${x + r} ${y - r * 1.45}, ${x + r + 1} ${y - r * 0.32}z`} fill={P.cap} stroke={P.robeLine} strokeWidth="2.4" strokeLinejoin="round" />
      <path d={`M${x - r * 0.97} ${y - r * 0.52} Q ${x} ${y - r * 0.74} ${x + r * 0.97} ${y - r * 0.52}`} stroke={P.capBand} strokeWidth="2.8" fill="none" /></g>)}
      <circle cx={x + dir * r * 0.5} cy={y + r * 0.3} r={r * 0.17} fill="#FF9EB0" opacity=".55" />
    </g>
  );
}

// الراس من قدّام (للوضوء): من غير ملامح، بس الحدود والودان واضحين
export function HeadFront({ at, g, P, r = 40, bare = false }) {
  const [x, y] = at;
  if (g === 'girl' && bare) return (
    <g>
      <path d={`M${x - r * 1.05} ${y + r * 1.3} C ${x - r * 1.25} ${y - r * 0.2}, ${x - r * 1.1} ${y - r * 1.25}, ${x} ${y - r * 1.15} C ${x + r * 1.1} ${y - r * 1.25}, ${x + r * 1.25} ${y - r * 0.2}, ${x + r * 1.05} ${y + r * 1.3}z`} fill={HAIR} />
      <ellipse cx={x} cy={y} rx={r * 0.86} ry={r} fill={SKIN} stroke={SKIN_L} strokeWidth="2.8" />
      <path d={`M${x - r * 0.86} ${y - r * 0.2} C ${x - r * 0.9} ${y - r * 1.12}, ${x + r * 0.9} ${y - r * 1.12}, ${x + r * 0.86} ${y - r * 0.2} C ${x + r * 0.3} ${y - r * 0.7}, ${x - r * 0.3} ${y - r * 0.7}, ${x - r * 0.86} ${y - r * 0.2}z`} fill={HAIR} />
      <circle cx={x - r * 0.45} cy={y + r * 0.32} r={r * 0.13} fill="#FF9EB0" opacity=".45" /><circle cx={x + r * 0.45} cy={y + r * 0.32} r={r * 0.13} fill="#FF9EB0" opacity=".45" />
    </g>
  );
  if (g === 'girl') return (
    <g>
      <path d={`M${x - r * 1.25} ${y + r * 0.1} C ${x - r * 1.3} ${y - r * 1.5}, ${x + r * 1.3} ${y - r * 1.5}, ${x + r * 1.25} ${y + r * 0.1} L ${x + r * 1.5} ${y + r * 1.6} L ${x - r * 1.5} ${y + r * 1.6}z`} fill={P.cap} stroke={P.capLine} strokeWidth="3" strokeLinejoin="round" />
      <ellipse cx={x} cy={y + r * 0.05} rx={r * 0.78} ry={r * 0.92} fill={SKIN} stroke={SKIN_L} strokeWidth="2.8" />
      <circle cx={x - r * 0.42} cy={y + r * 0.3} r={r * 0.13} fill="#FF9EB0" opacity=".45" /><circle cx={x + r * 0.42} cy={y + r * 0.3} r={r * 0.13} fill="#FF9EB0" opacity=".45" />
    </g>
  );
  return (
    <g>
      <ellipse cx={x - r * 0.95} cy={y + r * 0.1} rx={r * 0.17} ry={r * 0.26} fill={SKIN_D} stroke={SKIN_L} strokeWidth="2.4" />
      <ellipse cx={x + r * 0.95} cy={y + r * 0.1} rx={r * 0.17} ry={r * 0.26} fill={SKIN_D} stroke={SKIN_L} strokeWidth="2.4" />
      <ellipse cx={x} cy={y} rx={r * 0.9} ry={r} fill={SKIN} stroke={SKIN_L} strokeWidth="2.8" />
      <path d={`M${x - r * 0.9} ${y - r * 0.25} C ${x - r * 0.95} ${y - r * 1.15}, ${x + r * 0.95} ${y - r * 1.15}, ${x + r * 0.9} ${y - r * 0.25} C ${x + r * 0.5} ${y - r * 0.55}, ${x - r * 0.5} ${y - r * 0.55}, ${x - r * 0.9} ${y - r * 0.25}z`} fill={HAIR} />
      <circle cx={x - r * 0.45} cy={y + r * 0.32} r={r * 0.13} fill="#FF9EB0" opacity=".45" /><circle cx={x + r * 0.45} cy={y + r * 0.32} r={r * 0.13} fill="#FF9EB0" opacity=".45" />
    </g>
  );
}

// مية بتنزل
export const Drop = ({ x, y, s = 1 }) => <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 -9 C 5 -2, 7 2, 7 5 A7 7 0 0 1 -7 5 C -7 2, -5 -2, 0 -9z" fill="#5BC0EB" stroke="#2E8FC0" strokeWidth="1.4" />;
export const Stream = ({ x, y1, y2, w = 10 }) => (
  <g><path d={`M${x - w / 2} ${y1} C ${x - w / 2} ${(y1 + y2) / 2}, ${x - w / 3} ${y2 - 6}, ${x - w / 4} ${y2} L ${x + w / 4} ${y2} C ${x + w / 3} ${y2 - 6}, ${x + w / 2} ${(y1 + y2) / 2}, ${x + w / 2} ${y1}z`} fill="#8AD6F5" opacity=".9" /><path d={`M${x - 1} ${y1 + 4} V${y2 - 6}`} stroke="#fff" strokeWidth="1.6" opacity=".8" /></g>
);
export const Tap = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={20} y={-46} width={12} height={40} rx={4} fill="#C9D4E3" stroke="#7D8CA6" strokeWidth="2.4" />
    <path d="M26 -40 H -8 q-8 0 -8 8 v8" fill="none" stroke="#7D8CA6" strokeWidth="11" strokeLinecap="round" />
    <path d="M26 -40 H -8 q-8 0 -8 8 v8" fill="none" stroke="#DCE4EF" strokeWidth="6" strokeLinecap="round" />
    <rect x={14} y={-56} width={24} height={8} rx={4} fill="#7FB6D6" stroke="#4F87A8" strokeWidth="2" />
  </g>
);
// علامة "لحد هنا"
export const Mark = ({ x1, y1, x2, y2, t, c = '#E0563F', tx, ty }) => (
  <g><path d={`M${x1} ${y1} L${x2} ${y2}`} stroke={c} strokeWidth="3" strokeDasharray="6 5" strokeLinecap="round" />
    {t && <g><rect x={(tx ?? x2) - 34} y={(ty ?? y2) - 2} width={68} height={22} rx={11} fill={c} /><text x={tx ?? x2} y={(ty ?? y2) + 14} textAnchor="middle" fontFamily="'Baloo Bhaijaan 2'" fontSize="13" fontWeight="800" fill="#fff">{t}</text></g>}
  </g>
);
export const Arrow = ({ d, c = '#F5A623' }) => (<g><path d={d} fill="none" stroke={c} strokeWidth="4" strokeLinecap="round" markerEnd="url(#arr)" /></g>);
export const Defs = () => (<defs><marker id="arr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="#F5A623" /></marker></defs>);
export const Label = ({ x, y, t, c = '#2E9BC9' }) => (<g><rect x={x - t.length * 3.9 - 10} y={y - 15} width={t.length * 7.8 + 20} height={26} rx={13} fill={c} /><text x={x} y={y + 3} textAnchor="middle" fontFamily="'Baloo Bhaijaan 2'" fontSize="15" fontWeight="800" fill="#fff">{t}</text></g>);
