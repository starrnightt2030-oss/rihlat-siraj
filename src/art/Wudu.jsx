// رسومات خطوات الوضوء: الطفل من قدّام عند الحوض، والمية بتنزل على الجزء اللي بنغسله
import { PAL } from './Kid';
const SKIN = '#F5CFB0', SKIN_L = '#C9977A', HAIR = '#5B3A24', WATER = '#5BC0EB';

const Cap = ({ pts, w, c, l }) => { const d = 'M' + pts.map((p) => p.join(' ')).join(' L'); return (<g><path d={d} fill="none" stroke={l} strokeWidth={w + 5} strokeLinecap="round" strokeLinejoin="round" /><path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" /></g>); };
const Hand = ({ at, r = 8 }) => <circle cx={at[0]} cy={at[1]} r={r} fill={SKIN} stroke={SKIN_L} strokeWidth="2.5" />;
const Drop = ({ x, y, s = 1 }) => <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 -9 C 5 -2, 7 2, 7 5 A7 7 0 0 1 -7 5 C -7 2, -5 -2, 0 -9z" fill={WATER} stroke="#2E9BC9" strokeWidth="1.5" />;
const Drops = ({ at, n = 3 }) => <g>{Array.from({ length: n }).map((_, i) => <Drop key={i} x={at[0] + (i - (n - 1) / 2) * 13} y={at[1] + (i % 2) * 8} s={0.9} />)}</g>;
const Glow = ({ at, r = 26 }) => <circle cx={at[0]} cy={at[1]} r={r} fill="#FFE07A" opacity=".55" />;

function Face({ g, tilt = 0 }) {
  const P = PAL[g];
  if (g === 'girl') return (<g transform={`rotate(${tilt} 100 70)`}>
    <path d="M66 74 C 64 30, 136 30, 134 74 L 142 112 L 58 112 Z" fill={P.cap} stroke={P.capBand} strokeWidth="3" strokeLinejoin="round" />
    <ellipse cx="100" cy="72" rx="23" ry="26" fill={SKIN} stroke={SKIN_L} strokeWidth="2.5" />
    <circle cx="86" cy="80" r="4" fill="#FF9EB0" opacity=".5" /><circle cx="114" cy="80" r="4" fill="#FF9EB0" opacity=".5" />
  </g>);
  return (<g transform={`rotate(${tilt} 100 70)`}>
    <circle cx="100" cy="70" r="28" fill={SKIN} stroke={SKIN_L} strokeWidth="2.5" />
    <path d="M71 64 C 70 34, 130 34, 129 64 Z" fill={P.cap} stroke={P.robeLine} strokeWidth="2.5" />
    <path d="M72 58 Q100 50 128 58" stroke={P.capBand} strokeWidth="3" fill="none" />
    <circle cx="86" cy="80" r="4" fill="#FF9EB0" opacity=".5" /><circle cx="114" cy="80" r="4" fill="#FF9EB0" opacity=".5" />
  </g>);
}
const Body = ({ g }) => { const P = PAL[g]; return <path d="M62 120 Q100 98 138 120 L148 206 L52 206 Z" fill={P.robe} stroke={P.robeLine} strokeWidth="3" strokeLinejoin="round" />; };
function Tap({ x = 168, y = 120 }) {
  return (<g>
    <rect x={x - 4} y={y - 40} width="10" height="44" rx="4" fill="#B9C6D8" stroke="#8796AE" strokeWidth="2" />
    <path d={`M${x + 1} ${y - 36} H${x - 26} q-6 0 -6 6 v6`} fill="none" stroke="#8796AE" strokeWidth="9" strokeLinecap="round" /><path d={`M${x + 1} ${y - 36} H${x - 26} q-6 0 -6 6 v6`} fill="none" stroke="#C9D4E3" strokeWidth="5" strokeLinecap="round" />
  </g>);
}
const Sink = () => <path d="M118 176 H190 Q186 206 154 206 Q122 206 118 176z" fill="#E7EEF8" stroke="#9AAAC2" strokeWidth="2.5" />;

// كل خطوة: إيدين فين، وفين المية
const STEPS = {
  niyya: (g, P) => (<g><Body g={g} /><Face g={g} /><Cap pts={[[78, 128], [86, 160], [100, 146]]} w={14} c={P.robe} l={P.robeLine} /><Hand at={[102, 145]} /><path d="M52 40 c-5-7 -14-2 -10 4 l10 9 10-9 c4-6 -5-11 -10-4z" fill="#FF7E9D" /></g>),
  hands: (g, P) => (<g><Sink /><Tap /><Body g={g} /><Face g={g} /><Cap pts={[[78, 128], [100, 166], [130, 156]]} w={14} c={P.robe} l={P.robeLine} /><Cap pts={[[122, 128], [130, 160], [140, 152]]} w={14} c={P.robe} l={P.robeLine} /><Hand at={[136, 154]} r={10} /><Drops at={[142, 112]} /><Glow at={[136, 154]} /></g>),
  mouth: (g, P) => (<g><Body g={g} /><Face g={g} /><Cap pts={[[122, 128], [126, 108], [106, 92]]} w={14} c={P.robe} l={P.robeLine} /><Hand at={[104, 90]} r={9} /><Drops at={[100, 108]} n={2} /><Glow at={[100, 88]} r={20} /></g>),
  nose: (g, P) => (<g><Body g={g} /><Face g={g} /><Cap pts={[[122, 128], [124, 100], [106, 82]]} w={14} c={P.robe} l={P.robeLine} /><Hand at={[104, 80]} r={9} /><Drops at={[96, 60]} n={2} /><Glow at={[100, 76]} r={18} /></g>),
  face: (g, P) => (<g><Body g={g} /><Face g={g} /><Cap pts={[[76, 128], [70, 100], [80, 80]]} w={14} c={P.robe} l={P.robeLine} /><Cap pts={[[124, 128], [130, 100], [120, 80]]} w={14} c={P.robe} l={P.robeLine} /><Hand at={[82, 76]} r={9} /><Hand at={[118, 76]} r={9} /><Drops at={[100, 108]} /><Glow at={[100, 72]} r={34} /></g>),
  arm_r: (g, P) => (<g><Body g={g} /><Face g={g} /><Cap pts={[[78, 128], [52, 150], [30, 140]]} w={14} c={SKIN} l={SKIN_L} /><Hand at={[28, 140]} /><Cap pts={[[122, 128], [100, 150], [62, 146]]} w={14} c={P.robe} l={P.robeLine} /><Hand at={[60, 146]} r={9} /><Drops at={[44, 126]} /><Glow at={[46, 146]} r={24} /><Side t="اليمين" x={40} /></g>),
  arm_l: (g, P) => (<g><Body g={g} /><Face g={g} /><Cap pts={[[122, 128], [148, 150], [170, 140]]} w={14} c={SKIN} l={SKIN_L} /><Hand at={[172, 140]} /><Cap pts={[[78, 128], [100, 150], [138, 146]]} w={14} c={P.robe} l={P.robeLine} /><Hand at={[140, 146]} r={9} /><Drops at={[156, 126]} /><Glow at={[154, 146]} r={24} /><Side t="الشمال" x={160} /></g>),
  head: (g, P) => (<g><Body g={g} /><Face g={g} /><Cap pts={[[76, 128], [62, 92], [82, 46]]} w={14} c={P.robe} l={P.robeLine} /><Cap pts={[[124, 128], [138, 92], [118, 46]]} w={14} c={P.robe} l={P.robeLine} /><Hand at={[86, 44]} r={9} /><Hand at={[114, 44]} r={9} /><path d="M86 30 Q100 18 114 30" fill="none" stroke={WATER} strokeWidth="4" strokeLinecap="round" markerEnd="" /><Glow at={[100, 44]} r={30} /></g>),
  ears: (g, P) => (<g><Body g={g} /><Face g={g} /><Cap pts={[[76, 128], [58, 104], [70, 74]]} w={14} c={P.robe} l={P.robeLine} /><Cap pts={[[124, 128], [142, 104], [130, 74]]} w={14} c={P.robe} l={P.robeLine} /><Hand at={[72, 72]} r={9} /><Hand at={[128, 72]} r={9} /><Glow at={[72, 72]} r={16} /><Glow at={[128, 72]} r={16} /></g>),
  feet_r: (g, P) => (<g><rect x="40" y="186" width="120" height="24" rx="12" fill="#CFE9F7" stroke="#7FB6D6" strokeWidth="2.5" /><Body g={g} /><Face g={g} /><Cap pts={[[78, 128], [70, 168], [82, 196]]} w={14} c={P.robe} l={P.robeLine} /><Hand at={[84, 198]} r={9} /><ellipse cx="78" cy="204" rx="18" ry="8" fill={SKIN} stroke={SKIN_L} strokeWidth="2.5" /><Drops at={[78, 178]} /><Glow at={[78, 202]} r={22} /><Side t="اليمين" x={40} /></g>),
  feet_l: (g, P) => (<g><rect x="40" y="186" width="120" height="24" rx="12" fill="#CFE9F7" stroke="#7FB6D6" strokeWidth="2.5" /><Body g={g} /><Face g={g} /><Cap pts={[[122, 128], [130, 168], [118, 196]]} w={14} c={P.robe} l={P.robeLine} /><Hand at={[116, 198]} r={9} /><ellipse cx="122" cy="204" rx="18" ry="8" fill={SKIN} stroke={SKIN_L} strokeWidth="2.5" /><Drops at={[122, 178]} /><Glow at={[122, 202]} r={22} /><Side t="الشمال" x={160} /></g>),
  done: (g, P) => (<g><Body g={g} /><Face g={g} /><Cap pts={[[78, 128], [70, 100], [74, 72]]} w={14} c={P.robe} l={P.robeLine} /><Hand at={[74, 68]} r={8} /><path d="M74 64 L74 50" stroke={SKIN_L} strokeWidth="7" strokeLinecap="round" /><path d="M74 64 L74 50" stroke={SKIN} strokeWidth="4" strokeLinecap="round" />{[[40, 50], [160, 60], [150, 30], [44, 100]].map(([x, y], i) => <path key={i} transform={`translate(${x} ${y})`} d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2z" fill="#FFC93C" />)}</g>),
};
const Side = ({ t, x }) => (<g><rect x={x - 30} y="8" width="60" height="26" rx="13" fill="#2E9BC9" /><text x={x} y="26" textAnchor="middle" fontFamily="'Baloo Bhaijaan 2'" fontSize="14" fontWeight="800" fill="#fff">{t}</text></g>);
export const WUDU_STEPS = ['niyya', 'hands', 'mouth', 'nose', 'face', 'arm_r', 'arm_l', 'head', 'ears', 'feet_r', 'feet_l', 'done'];

export default function Wudu({ step = 'hands', g = 'boy', size = 200 }) {
  const P = PAL[g] || PAL.boy;
  return (
    <svg viewBox="0 0 200 220" width={size} height={size * 1.1} role="img" aria-label={step} style={{ display: 'block', maxWidth: '100%' }}>
      <circle cx="100" cy="112" r="98" fill={g === 'girl' ? '#FFF0F6' : '#EAF7FD'} />
      {(STEPS[step] || STEPS.hands)(g, P)}
    </svg>
  );
}
