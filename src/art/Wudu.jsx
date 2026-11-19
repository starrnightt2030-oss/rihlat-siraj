// رسومات الوضوء: لقطة قريبة لكل خطوة (الجزء اللي بيتغسل + المية + حدود الغسل) عشان الطفل يفهم بالظبط
import { PAL } from './Kid';
import { SKIN, SKIN_D, SKIN_L, Chain, Hand, Foot, Head, HeadFront, Drop, Stream, Tap, Mark, Label, Defs } from './Body';

const BG = { boy: '#E8F6FD', girl: '#FFF0F6' };
const Sleeve = ({ a, b, P, w = 16 }) => <Chain pts={[a, b]} ws={[w, w]} fill={P.robe} line={P.robeLine} />;
const Bust = ({ g, P }) => <path d="M40 220 C 44 176, 70 160, 100 158 C 130 160, 156 176, 160 220z" fill={P.robe} stroke={P.robeLine} strokeWidth="3" />;
const Side = ({ t, x = 100 }) => <Label x={x} y={24} t={t} c="#E07F1E" />;
const Count = ({ t }) => <Label x={160} y={200} t={t} c="#2E9BC9" />;
const Glow = ({ x, y, r = 18 }) => <circle cx={x} cy={y} r={r} fill="#FFE07A" opacity=".55" />;
const Swirl = ({ x, y }) => <path d={`M${x - 10} ${y} a10 6 0 1 0 20 0 a10 6 0 1 0 -20 0`} fill="none" stroke="#2E8FC0" strokeWidth="2" strokeDasharray="4 3" />;

// دراع أفقي من الصوابع للكوع (يمين أو شمال)
function ArmScene({ g, P, side }) {
  const f = side === 'r' ? 1 : -1; // اليمين: الصوابع ناحية الشمال في الصورة
  const X = (x) => 100 + (x - 100) * f;
  return (<g>
    <Tap x={X(64)} y={70} s={f} />
    <Stream x={X(50)} y1={72} y2={118} w={11} />
    <Sleeve a={[X(178), 128]} b={[X(156), 128]} P={P} w={17} />
    <Chain pts={[[X(156), 128], [X(56), 126]]} ws={[13, 11]} fill={SKIN} line={SKIN_L} />
    <Hand at={[X(46), 126]} ang={f > 0 ? 180 : 0} s={1.5} flip={f < 0} />
    <circle cx={X(150)} cy={128} r="7" fill={SKIN_D} stroke={SKIN_L} strokeWidth="2" />
    <Hand at={[X(102), 148]} ang={f > 0 ? -150 : -30} s={1.3} fill={SKIN_D} />
    {[60, 84, 110, 132].map((x, i) => <Drop key={i} x={X(x)} y={150 + (i % 2) * 10} s={0.8} />)}
    <Mark x1={X(150)} y1={96} x2={X(150)} y2={166} t="لحد الكوع" tx={X(150)} ty={170} />
    <Side t={side === 'r' ? 'الإيد اليمين' : 'الإيد الشمال'} />
  </g>);
}
function FootScene({ g, P, side }) {
  const f = side === 'r' ? 1 : -1, X = (x) => 100 + (x - 100) * f;
  return (<g>
    <path d={`M${X(20)} 150 H${X(180)} L${X(170)} 206 Q100 214 ${X(30)} 206z`} fill="#CFE9F7" stroke="#7FB6D6" strokeWidth="2.5" />
    <path d={`M${X(26)} 160 H${X(174)}`} stroke="#9FD8F2" strokeWidth="3" />
    <Sleeve a={[X(138), 40]} b={[X(132), 104]} P={P} w={20} />
    <Chain pts={[[X(132), 104], [X(128), 140]]} ws={[12, 12]} fill={SKIN} line={SKIN_L} />
    <g transform={`translate(${X(110)} 160) scale(${f * 2.6} 2.6)`}><Foot at={[0, 0]} dir={-1} /></g>
    <Hand at={[X(70), 132]} ang={f > 0 ? 100 : 80} s={1.3} fill={SKIN_D} />
    <Tap x={X(80)} y={46} s={f} />
    <Stream x={X(66)} y1={48} y2={128} w={10} />
    <Mark x1={X(104)} y1={116} x2={X(156)} y2={116} t="لحد الكعبين" tx={X(152)} ty={86} />
    <Side t={side === 'r' ? 'الرجل اليمين' : 'الرجل الشمال'} />
  </g>);
}

const STEPS = {
  niyya: (g, P) => (<g>
    <Bust g={g} P={P} /><HeadFront at={[100, 104]} g={g} P={P} r={40} />
    <Sleeve a={[70, 178]} b={[92, 196]} P={P} w={12} /><Hand at={[104, 190]} ang={180} s={1.3} />
    <path d="M40 60 c-6-10 -18-4 -13 6 l13 12 13-12 c5-10 -7-16 -13-6z" fill="#FF7E9D" />
    <g><rect x="118" y="36" width="74" height="34" rx="17" fill="#fff" stroke="#9DB2D3" strokeWidth="2.5" /><path d="M130 68 l-6 12 14 -10z" fill="#fff" stroke="#9DB2D3" strokeWidth="2.5" /><text x="155" y="59" textAnchor="middle" fontFamily="Amiri, serif" fontSize="17" fontWeight="700" fill="#1F7A55">بسم الله</text></g>
  </g>),
  hands: (g, P) => (<g>
    <Tap x={110} y={58} />
    <Stream x={94} y1={60} y2={118} w={12} />
    <Sleeve a={[14, 210]} b={[56, 168]} P={P} w={16} /><Sleeve a={[186, 210]} b={[144, 168]} P={P} w={16} />
    <Chain pts={[[56, 168], [78, 146]]} ws={[11, 11]} fill={SKIN} line={SKIN_L} /><Chain pts={[[144, 168], [120, 146]]} ws={[11, 11]} fill={SKIN_D} line={SKIN_L} />
    <Hand at={[86, 132]} ang={-60} s={2} />
    <Hand at={[110, 134]} ang={-120} s={2} fill={SKIN_D} flip />
    {[[70, 160], [130, 166], [100, 176]].map(([x, y], i) => <Drop key={i} x={x} y={y} s={0.9} />)}
    <path d="M150 112 a10 10 0 1 1 -4 -16" fill="none" stroke="#F5A623" strokeWidth="3.5" strokeLinecap="round" />
  </g>),
  mouth: (g, P) => (<g>
    <Bust g={g} P={P} /><HeadFront at={[100, 98]} g={g} P={P} r={48} />
    <Glow x={100} y={128} r={16} /><Swirl x={100} y={128} />
    <Sleeve a={[160, 220]} b={[140, 178]} P={P} w={13} /><Chain pts={[[140, 178], [124, 152]]} ws={[10, 10]} fill={SKIN} line={SKIN_L} />
    <Hand at={[116, 142]} ang={-120} s={1.4} mode="cup" />
    <Label x={44} y={130} t="الفم" c="#2E9BC9" /><path d="M64 130 H86" stroke="#2E9BC9" strokeWidth="2.5" strokeDasharray="4 3" />
  </g>),
  nose: (g, P) => (<g>
    <Bust g={g} P={P} /><HeadFront at={[100, 98]} g={g} P={P} r={48} />
    <Glow x={100} y={108} r={13} />
    <Sleeve a={[160, 220]} b={[140, 172]} P={P} w={13} /><Chain pts={[[140, 172], [122, 136]]} ws={[10, 10]} fill={SKIN} line={SKIN_L} />
    <Hand at={[112, 124]} ang={-115} s={1.3} mode="cup" />
    <path d="M96 104 q-6 -14 4 -24" fill="none" stroke="#2E8FC0" strokeWidth="2.5" strokeDasharray="3 3" />
    <Label x={44} y={108} t="الأنف" c="#2E9BC9" /><path d="M68 108 H88" stroke="#2E9BC9" strokeWidth="2.5" strokeDasharray="4 3" />
  </g>),
  face: (g, P) => (<g>
    <Bust g={g} P={P} /><HeadFront at={[100, 100]} g={g} P={P} r={48} />
    <ellipse cx="100" cy="104" rx="40" ry="44" fill="none" stroke="#E0563F" strokeWidth="3" strokeDasharray="7 5" />
    <Sleeve a={[22, 220]} b={[36, 170]} P={P} w={12} /><Chain pts={[[36, 170], [56, 126]]} ws={[10, 10]} fill={SKIN} line={SKIN_L} /><Hand at={[62, 116]} ang={-70} s={1.3} />
    <Sleeve a={[178, 220]} b={[164, 170]} P={P} w={12} /><Chain pts={[[164, 170], [144, 126]]} ws={[10, 10]} fill={SKIN_D} line={SKIN_L} /><Hand at={[138, 116]} ang={-110} s={1.3} fill={SKIN_D} flip />
    {[[86, 150], [116, 156]].map(([x, y], i) => <Drop key={i} x={x} y={y} s={0.8} />)}
    <Label x={100} y={40} t="من الشعر للدقن" c="#E0563F" />
  </g>),
  arm_r: (g, P) => <ArmScene g={g} P={P} side="r" />,
  arm_l: (g, P) => <ArmScene g={g} P={P} side="l" />,
  head: (g, P) => (<g>
    <Bust g={g} P={P} /><HeadFront at={[100, 112]} g={g} P={P} r={46} bare />
    <Sleeve a={[26, 220]} b={[40, 150]} P={P} w={12} /><Chain pts={[[40, 150], [62, 82]]} ws={[10, 10]} fill={SKIN} line={SKIN_L} /><Hand at={[78, 66]} ang={-30} s={1.3} />
    <Sleeve a={[174, 220]} b={[160, 150]} P={P} w={12} /><Chain pts={[[160, 150], [138, 82]]} ws={[10, 10]} fill={SKIN_D} line={SKIN_L} /><Hand at={[122, 66]} ang={-150} s={1.3} fill={SKIN_D} flip />
    <path d="M100 40 C 100 30, 100 24, 100 18" fill="none" stroke="#F5A623" strokeWidth="4" strokeLinecap="round" markerEnd="url(#arr)" />
    <Label x={100} y={208} t="من قدّام لورا وترجع" c="#E07F1E" />
  </g>),
  ears: (g, P) => (<g>
    <Head at={[100, 104]} g={g} P={P} r={62} dir={-1} bare />
    <Glow x={124} y={110} r={24} />
    <Sleeve a={[200, 210]} b={[176, 176]} P={P} w={12} /><Chain pts={[[176, 176], [150, 140]]} ws={[10, 10]} fill={SKIN} line={SKIN_L} />
    <Hand at={[134, 118]} ang={-130} s={1.3} mode="point" />
    <Label x={100} y={202} t="السبابة جوّه والإبهام ورا" c="#E07F1E" />
  </g>),
  feet_r: (g, P) => <FootScene g={g} P={P} side="r" />,
  feet_l: (g, P) => <FootScene g={g} P={P} side="l" />,
  done: (g, P) => (<g>
    <Bust g={g} P={P} /><HeadFront at={[100, 104]} g={g} P={P} r={40} />
    <Sleeve a={[150, 220]} b={[152, 178]} P={P} w={12} /><Chain pts={[[152, 178], [160, 132]]} ws={[10, 10]} fill={SKIN} line={SKIN_L} /><Hand at={[160, 120]} ang={-90} s={1.4} mode="point" />
    {[[146, 70], [178, 90], [30, 70], [40, 120]].map(([x, y], i) => <path key={i} transform={`translate(${x} ${y})`} d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2z" fill="#FFD25A" />)}
    <Label x={100} y={28} t="أشهد أن لا إله إلا الله" c="#2FB383" />
  </g>),
};
export const WUDU_STEPS = ['niyya', 'hands', 'mouth', 'nose', 'face', 'arm_r', 'arm_l', 'head', 'ears', 'feet_r', 'feet_l', 'done'];

export default function Wudu({ step = 'hands', g = 'boy', size = 200 }) {
  const P = PAL[g] || PAL.boy;
  return (
    <svg viewBox="0 0 200 220" width={size} height={size * 1.1} role="img" aria-label={step} style={{ display: 'block', maxWidth: '100%' }}>
      <Defs /><clipPath id={'wc' + step + g}><rect x="2" y="2" width="196" height="216" rx="26" /></clipPath>
      <rect x="2" y="2" width="196" height="216" rx="26" fill={BG[g] || BG.boy} />
      <g clipPath={`url(#wc${step}${g})`}>{(STEPS[step] || STEPS.hands)(g, P)}</g>
    </svg>
  );
}
