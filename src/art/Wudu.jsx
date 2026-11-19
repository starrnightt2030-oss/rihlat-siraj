// رسومات الوضوء (نسخة واقعية): طفل كامل واقف قدّام الحوض — راس ورقبة وكتاف وإيدين بصوابع حقيقية وكُم متني
// من غير ملامح وش (عيون/بُق) التزامًا بقواعد المحتوى. كل خطوة بتبيّن الجزء اللي بيتغسل + المية + حدّ الغسل.
import { PAL } from './Kid';
import { Mark, Label } from './Body';

const SK = { base: '#F3C6A2', mid: '#E9B48E', shade: '#D49873', line: '#A9694A', blush: '#F29C8C' };
const HAIR = { boy: '#3B2416', girl: '#4A2A18', hi: '#6E4630' };
const CLOTH = {
  boy: { c: '#FDFEFF', s: '#D7E2F0', line: '#8DA2C2', cuff: '#C9D8EC', sl: '#F1F5FB', trou: '#B9C7DA', trouS: '#93A6C0' },
  girl: { c: '#F8A9C6', s: '#E784AA', line: '#B9567F', cuff: '#FFD0E1', trou: '#C9A8F0', trouS: '#A584D8', hij: '#B9A2F2', hijS: '#9579DE', hijL: '#6F53BE' },
};
const r1 = (n) => Math.round(n * 10) / 10;
const rad = (d) => (d * Math.PI) / 180;

// كوع بحساب طولين (IK) — bend = +1 أو -1 لاتجاه الثنية
function elbow(S, W, U, F, bend) {
  let dx = W[0] - S[0], dy = W[1] - S[1], d = Math.hypot(dx, dy);
  d = Math.max(Math.abs(U - F) + 1, Math.min(U + F - 0.5, d));
  const a = Math.acos((U * U + d * d - F * F) / (2 * U * d)), base = Math.atan2(dy, dx) + bend * a;
  return [S[0] + Math.cos(base) * U, S[1] + Math.sin(base) * U];
}
// أنبوب بحدّ: مسار بخط عريض مرتين (حدّ غامق تحت + لون فوق)
const Tube = ({ pts, w, fill, line, cap = 'round' }) => {
  const d = 'M' + pts.map((p) => `${r1(p[0])} ${r1(p[1])}`).join(' L');
  return (<g><path d={d} fill="none" stroke={line} strokeWidth={w + 4} strokeLinecap={cap} strokeLinejoin="round" /><path d={d} fill="none" stroke={fill} strokeWidth={w} strokeLinecap={cap} strokeLinejoin="round" /></g>);
};

// إيد واقعية: كف + صوابع بأطوال مختلفة + إبهام. ang = اتجاه الصوابع (0 يمين، 90 تحت، -90 فوق)
// mode: open | flat (صوابع لازقة) | cup (كف مضموم فيه مية) | point (السبابة) | rest (مقفولة نص قفلة)
function Hand({ at, ang = -90, mode = 'open', flip = false, s = 1, tone = 0 }) {
  const f = flip ? -1 : 1, fill = tone ? SK.mid : SK.base;
  const spread = mode === 'open' ? 1 : 0.55;
  const L = { open: [10.5, 12, 11.4, 8.8], flat: [10.5, 12, 11.4, 8.8], cup: [6.5, 7.5, 7, 5.5], point: [12.5, 4.5, 4.2, 3.6], rest: [6, 6.6, 6.2, 5] }[mode];
  const xs = [-5.6, -1.9, 1.9, 5.6].map((x) => x * spread * f);
  const fingers = xs.map((x, i) => {
    const tilt = mode === 'open' ? (i - 1.5) * 5 * f : 0;
    const len = L[i], tip = [x + Math.sin(rad(tilt)) * len, -14 - Math.cos(rad(tilt)) * len];
    return { a: [x * 0.9, -12], b: tip, w: i === 3 ? 3.4 : 3.9 };
  });
  const thumbTip = mode === 'point' ? [-11 * f, -14] : mode === 'cup' ? [-9.5 * f, -12] : [-12.5 * f, -11];
  const shapes = (stroke) => (<g>
    {fingers.map((p, i) => <path key={i} d={`M${r1(p.a[0])} ${p.a[1]} L${r1(p.b[0])} ${r1(p.b[1])}`} stroke={stroke || fill} strokeWidth={p.w + (stroke ? 3.2 : 0)} strokeLinecap="round" />)}
    <path d={`M${-5 * f} -3 L${r1(thumbTip[0])} ${r1(thumbTip[1])}`} stroke={stroke || fill} strokeWidth={4.4 + (stroke ? 3.2 : 0)} strokeLinecap="round" />
    <path d="M-7.2 -1 C -8.4 -6, -8.2 -12, -6.5 -14.5 L 6.5 -14.5 C 8.2 -12, 8.4 -6, 7.2 -1 C 5 2.5, -5 2.5, -7.2 -1z" fill={stroke || fill} stroke={stroke || 'none'} strokeWidth={stroke ? 3.2 : 0} strokeLinejoin="round" />
  </g>);
  return (
    <g transform={`translate(${r1(at[0])} ${r1(at[1])}) rotate(${ang + 90}) scale(${s})`}>
      {shapes(SK.line)}{shapes(null)}
      <path d="M-4 -12.5 Q0 -10.5 4 -12.5" stroke={SK.shade} strokeWidth="1" fill="none" opacity=".8" />
      <path d={`M${-3 * f} -2 Q 0 -6 ${3 * f} -9`} stroke={SK.shade} strokeWidth="1.1" fill="none" opacity=".55" />
      {mode === 'cup' && <g><ellipse cx="0" cy="-12" rx="7.2" ry="3.4" fill="#6FCBF0" stroke="#2E8FC0" strokeWidth="1" /><ellipse cx="-2" cy="-12.8" rx="2.4" ry="1" fill="#fff" opacity=".8" /></g>}
    </g>
  );
}

// دراع كامل: كم (متني فوق الكوع لو rolled) + ساعد + إيد
function pickElbow(S, W, U, F, bend) {
  if (bend !== 'auto' && bend !== undefined) return elbow(S, W, U, F, bend);
  const a = elbow(S, W, U, F, 1), b = elbow(S, W, U, F, -1), side = Math.sign(S[0] - HX) || 1;
  const sc = (e) => e[1] + 0.6 * (e[0] - HX) * side;
  return sc(a) >= sc(b) ? a : b;
}
function Arm({ S, W, E: E0, bend = 'auto', g, rolled = true, hand = {}, tone = 0, U = 52, F = 48 }) {
  const C = CLOTH[g], E = E0 || pickElbow(S, W, U, F, bend);
  const cuffAt = rolled ? [S[0] + (E[0] - S[0]) * 0.78, S[1] + (E[1] - S[1]) * 0.78] : [E[0] + (W[0] - E[0]) * 0.8, E[1] + (W[1] - E[1]) * 0.8];
  const fa = Math.atan2(W[1] - E[1], W[0] - E[0]) * 180 / Math.PI;
  const skin = tone ? SK.mid : SK.base;
  return (<g>
    {rolled ? (<>
      <Tube pts={[cuffAt, E, W]} w={11.5} fill={skin} line={SK.line} />
      <path d={`M${r1(E[0])} ${r1(E[1])} L${r1(W[0])} ${r1(W[1])}`} stroke="#fff" strokeWidth="2" opacity=".28" strokeLinecap="round" transform="translate(-2 -2)" />
      <Tube pts={[S, cuffAt]} w={20} fill={tone ? C.s : C.sl || C.c} line={C.line} />
      <Tube pts={[[cuffAt[0] - (E[0] - S[0]) * 0.07, cuffAt[1] - (E[1] - S[1]) * 0.07], cuffAt]} w={23} fill={C.cuff} line={C.line} cap="butt" />
    </>) : (<>
      <Tube pts={[cuffAt, W]} w={10.5} fill={skin} line={SK.line} />
      <Tube pts={[S, E, cuffAt]} w={19} fill={tone ? C.s : C.sl || C.c} line={C.line} />
    </>)}
    <Hand at={W} ang={hand.ang ?? fa} mode={hand.mode || 'open'} flip={hand.flip} tone={tone} s={hand.s || 1.38} />
  </g>);
}

// ===== الطفل من قدّام =====
const HX = 120, HY = 84;
function Torso({ g }) {
  const C = CLOTH[g];
  return (<g>
    <path d={`M${HX - 12} ${HY + 34} L${HX - 12} ${HY + 58} L${HX + 12} ${HY + 58} L${HX + 12} ${HY + 34}z`} fill={SK.mid} stroke={SK.line} strokeWidth="2.4" />
    <path d={`M${HX - 12} ${HY + 40} Q ${HX} ${HY + 50} ${HX + 12} ${HY + 40}`} fill={SK.shade} opacity=".6" />
    <path d={`M${HX - 60} 272 C ${HX - 62} ${HY + 92}, ${HX - 54} ${HY + 66}, ${HX - 26} ${HY + 60} L ${HX + 26} ${HY + 60} C ${HX + 54} ${HY + 66}, ${HX + 62} ${HY + 92}, ${HX + 60} 272z`} fill={`url(#cl${g})`} stroke={C.line} strokeWidth="2.6" strokeLinejoin="round" />
    {g === 'boy' ? (<g>
      <path d={`M${HX - 14} ${HY + 58} L${HX} ${HY + 80} L${HX + 14} ${HY + 58}`} fill={C.s} stroke={C.line} strokeWidth="2.2" strokeLinejoin="round" />
      <path d={`M${HX} ${HY + 80} V 272`} stroke={C.line} strokeWidth="1.6" opacity=".6" />
      {[96, 112].map((y) => <circle key={y} cx={HX + 0.5} cy={HY + y} r="2" fill={C.line} opacity=".7" />)}
    </g>) : <path d={`M${HX - 22} ${HY + 62} Q ${HX} ${HY + 74} ${HX + 22} ${HY + 62}`} fill="none" stroke={C.line} strokeWidth="1.8" opacity=".7" />}
    <path d={`M${HX - 40} ${HY + 100} q 6 30 2 70`} stroke={C.s} strokeWidth="3" fill="none" opacity=".8" />
    <path d={`M${HX + 40} ${HY + 100} q -6 30 -2 70`} stroke={C.s} strokeWidth="3" fill="none" opacity=".8" />
  </g>);
}

const FACE = (x, y, k = 1) => `M${x - 31 * k} ${y - 6 * k} C ${x - 32 * k} ${y - 46 * k}, ${x + 32 * k} ${y - 46 * k}, ${x + 31 * k} ${y - 6 * k} C ${x + 31 * k} ${y + 20 * k}, ${x + 17 * k} ${y + 39 * k}, ${x} ${y + 40 * k} C ${x - 17 * k} ${y + 39 * k}, ${x - 31 * k} ${y + 20 * k}, ${x - 31 * k} ${y - 6 * k}z`;
const Ear = ({ x, y, s }) => (<g>
  <path d={`M${x} ${y - 11} C ${x + s * 9} ${y - 13}, ${x + s * 10} ${y + 8}, ${x + s * 1} ${y + 12}`} fill={SK.mid} stroke={SK.line} strokeWidth="2.3" />
  <path d={`M${x + s * 1.5} ${y - 6} C ${x + s * 6} ${y - 6}, ${x + s * 6} ${y + 4}, ${x + s * 1.5} ${y + 6}`} fill="none" stroke={SK.shade} strokeWidth="1.8" />
</g>);
// الوش من غير ملامح: بس ظل خفيف للمناخير والخدود
const FaceSkin = () => (<g>
  <path d={FACE(HX, HY)} fill={`url(#fc)`} stroke={SK.line} strokeWidth="2.6" />
  <ellipse cx={HX + 1} cy={HY + 10} rx="3.2" ry="2.2" fill={SK.shade} opacity=".28" />
  <path d={`M${HX + 1} ${HY - 4} Q ${HX + 3} ${HY + 4} ${HX + 2} ${HY + 9}`} stroke={SK.shade} strokeWidth="1.4" fill="none" opacity=".55" strokeLinecap="round" />
  <ellipse cx={HX - 17} cy={HY + 14} rx="7" ry="4.5" fill={SK.blush} opacity=".35" />
  <ellipse cx={HX + 17} cy={HY + 14} rx="7" ry="4.5" fill={SK.blush} opacity=".35" />
</g>);

function HeadFront({ g, bare = false }) {
  const H = HAIR[g];
  if (g === 'girl' && !bare) {
    const C = CLOTH.girl;
    return (<g>
      <path d={`M${HX - 44} ${HY + 4} C ${HX - 50} ${HY - 66}, ${HX + 50} ${HY - 66}, ${HX + 44} ${HY + 4} C ${HX + 44} ${HY + 34}, ${HX + 58} ${HY + 56}, ${HX + 70} ${HY + 74} C ${HX + 30} ${HY + 92}, ${HX - 30} ${HY + 92}, ${HX - 70} ${HY + 74} C ${HX - 58} ${HY + 56}, ${HX - 44} ${HY + 34}, ${HX - 44} ${HY + 4}z`} fill={`url(#hj)`} stroke={C.hijL} strokeWidth="2.6" strokeLinejoin="round" />
      <path d={`M${HX - 36} ${HY + 50} Q ${HX} ${HY + 72} ${HX + 36} ${HY + 50}`} fill="none" stroke={C.hijS} strokeWidth="2.4" />
      <path d={`M${HX - 50} ${HY + 64} Q ${HX - 40} ${HY + 50} ${HX - 38} ${HY + 30}`} fill="none" stroke={C.hijS} strokeWidth="2" />
      <path d={`M${HX + 50} ${HY + 64} Q ${HX + 40} ${HY + 50} ${HX + 38} ${HY + 30}`} fill="none" stroke={C.hijS} strokeWidth="2" />
      <path d={FACE(HX, HY + 2, 0.93)} fill={`url(#fc)`} stroke={SK.line} strokeWidth="2.4" />
      <path d={`M${HX - 29} ${HY - 10} C ${HX - 26} ${HY - 42}, ${HX + 26} ${HY - 42}, ${HX + 29} ${HY - 10}`} fill="none" stroke={C.hijL} strokeWidth="3.2" />
      <ellipse cx={HX + 1} cy={HY + 10} rx="3.2" ry="2.2" fill={SK.shade} opacity=".28" />
      <ellipse cx={HX - 16} cy={HY + 14} rx="6.5" ry="4.2" fill={SK.blush} opacity=".35" /><ellipse cx={HX + 16} cy={HY + 14} rx="6.5" ry="4.2" fill={SK.blush} opacity=".35" />
    </g>);
  }
  return (<g>
    <Ear x={HX - 30} y={HY + 2} s={-1} /><Ear x={HX + 30} y={HY + 2} s={1} />
    <FaceSkin />
    {g === 'girl' ? (<g>
      <path d={`M${HX - 34} ${HY - 4} C ${HX - 38} ${HY - 52}, ${HX + 38} ${HY - 52}, ${HX + 34} ${HY - 4} C ${HX + 30} ${HY - 22}, ${HX + 14} ${HY - 30}, ${HX + 2} ${HY - 28} C ${HX - 10} ${HY - 22}, ${HX - 26} ${HY - 20}, ${HX - 34} ${HY - 4}z`} fill={H} />
      <path d={`M${HX - 16} ${HY - 38} Q ${HX - 4} ${HY - 44} ${HX + 10} ${HY - 40}`} stroke={HAIR.hi} strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>) : (<g>
      <path d={`M${HX - 33} ${HY - 2} C ${HX - 37} ${HY - 50}, ${HX + 37} ${HY - 50}, ${HX + 33} ${HY - 2} L ${HX + 30} ${HY - 10} C ${HX + 26} ${HY - 24}, ${HX + 12} ${HY - 26}, ${HX - 2} ${HY - 24} C ${HX - 14} ${HY - 26}, ${HX - 26} ${HY - 22}, ${HX - 30} ${HY - 10}z`} fill={H} />
      <path d={`M${HX - 18} ${HY - 36} Q ${HX - 6} ${HY - 42} ${HX + 8} ${HY - 38}`} stroke={HAIR.hi} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d={`M${HX + 12} ${HY - 34} Q ${HX + 20} ${HY - 34} ${HX + 24} ${HY - 28}`} stroke={HAIR.hi} strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </g>)}
  </g>);
}

// الحمّام: حيطة سيراميك + رخامة + حوض + حنفية
function Room({ g }) {
  return (<g>
    <rect x="0" y="0" width="240" height="270" fill={g === 'girl' ? '#FFF3F8' : '#EEF7FD'} />
    {[0, 1, 2, 3, 4, 5].map((i) => <path key={'h' + i} d={`M0 ${i * 40 + 20} H240`} stroke={g === 'girl' ? '#F6DCE7' : '#D8EAF6'} strokeWidth="1.5" />)}
    {[0, 1, 2, 3, 4, 5, 6].map((i) => <path key={'v' + i} d={`M${i * 40 + 10} 0 V270`} stroke={g === 'girl' ? '#F6DCE7' : '#D8EAF6'} strokeWidth="1.5" />)}
  </g>);
}
const SINK_Y = 222;
function Sink() {
  return (<g>
    <rect x="-4" y={SINK_Y} width="248" height="60" fill="url(#mb)" stroke="#9AA9BE" strokeWidth="2.4" />
    <path d={`M44 ${SINK_Y + 6} H196 C 192 ${SINK_Y + 34}, 48 ${SINK_Y + 34}, 44 ${SINK_Y + 6}z`} fill="#E6EEF7" stroke="#9AA9BE" strokeWidth="2.2" />
    <ellipse cx="120" cy={SINK_Y + 14} rx="58" ry="7" fill="#C9D9EA" />
    <ellipse cx="120" cy={SINK_Y + 15} rx="30" ry="3.4" fill="#9FD5F2" opacity=".8" />
  </g>);
}
// حنفية ثابتة على الرخامة: x مكان البزبوز
const Faucet = ({ x = 120, y = 186 }) => (<g>
  <rect x={x + 22} y={y + 4} width="12" height={SINK_Y - y - 2} rx="3" fill="url(#mt)" stroke="#6F7F99" strokeWidth="2" />
  <path d={`M${x + 28} ${y + 8} H ${x + 6} q -7 0 -7 7 v 2`} fill="none" stroke="#6F7F99" strokeWidth="10" strokeLinecap="round" />
  <path d={`M${x + 28} ${y + 8} H ${x + 6} q -7 0 -7 7 v 2`} fill="none" stroke="#DDE5EF" strokeWidth="5.5" strokeLinecap="round" />
  <rect x={x + 20} y={y - 2} width="16" height="6" rx="3" fill="#7FB6D6" stroke="#4F87A8" strokeWidth="1.6" />
</g>);
const Water = ({ x, y1, y2, w = 8 }) => (<g>
  <path d={`M${x - w / 2} ${y1} C ${x - w / 2} ${(y1 + y2) / 2}, ${x - w / 3} ${y2 - 4}, ${x - w / 4} ${y2} L ${x + w / 4} ${y2} C ${x + w / 3} ${y2 - 4}, ${x + w / 2} ${(y1 + y2) / 2}, ${x + w / 2} ${y1}z`} fill="#8AD6F5" opacity=".88" />
  <path d={`M${x - 1} ${y1 + 3} V${y2 - 3}`} stroke="#fff" strokeWidth="1.4" opacity=".85" />
</g>);
const Drop = ({ x, y, s = 1 }) => <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 -7 C 4 -2, 5 1, 5 4 A5 5 0 0 1 -5 4 C -5 1, -4 -2, 0 -7z" fill="#6FCBF0" stroke="#2E8FC0" strokeWidth="1.2" />;
const Splash = ({ x, y }) => (<g>{[[-12, -4, 0.7], [11, -6, 0.8], [-4, 6, 0.6], [16, 6, 0.55]].map(([dx, dy, s], i) => <Drop key={i} x={x + dx} y={y + dy} s={s} />)}</g>);
const Glow = ({ x, y, r = 16 }) => <circle cx={x} cy={y} r={r} fill="#FFE07A" opacity=".5" />;
const Arc = ({ d }) => <path d={d} fill="none" stroke="#F5A623" strokeWidth="3.6" strokeLinecap="round" markerEnd="url(#warr)" />;

// أكتاف: اليمين بتاع الطفل = شمال الصورة
const SR = [HX - 40, HY + 80], SL = [HX + 40, HY + 80];
const Kid = ({ g, bare, arms = [], front = [], fx = null }) => (<g>
  {g === 'girl' && bare && <path d={`M${HX - 36} ${HY - 18} C ${HX - 50} ${HY + 20}, ${HX - 48} ${HY + 70}, ${HX - 40} ${HY + 96} L ${HX + 40} ${HY + 96} C ${HX + 48} ${HY + 70}, ${HX + 50} ${HY + 20}, ${HX + 36} ${HY - 18}z`} fill={HAIR.girl} />}
  <Torso g={g} />
  <HeadFront g={g} bare={bare} />
  <Sink />
  {fx}
  {[...arms, ...front].map((a, i) => <Arm key={i} g={g} {...a} />)}
</g>);
const restR = { S: SR, E: [HX - 48, 194], W: [HX - 36, SINK_Y - 4], hand: { ang: 90, mode: 'rest' }, rolled: false };
const restL = { S: SL, E: [HX + 48, 194], W: [HX + 36, SINK_Y - 4], hand: { ang: 90, mode: 'rest', flip: true }, rolled: false };

const FRONT = {
  niyya: (g) => (<g>
    <Kid g={g} arms={[restR, restL]} fx={<Faucet x={150} />} />
    <path d="M36 46 c-6-10 -18-4 -13 6 l13 12 13-12 c5-10 -7-16 -13-6z" fill="#FF7E9D" />
    <g><rect x="160" y="24" width="74" height="34" rx="17" fill="#fff" stroke="#9DB2D3" strokeWidth="2.5" /><path d="M170 56 l-8 12 15 -9z" fill="#fff" stroke="#9DB2D3" strokeWidth="2.5" /><text x="197" y="47" textAnchor="middle" fontFamily="Amiri, serif" fontSize="17" fontWeight="700" fill="#1F7A55">بسم الله</text></g>
  </g>),
  hands: (g) => (<g>
    <Kid g={g} fx={<><Faucet x={120} y={150} /><Water x={119} y1={168} y2={196} /></>} front={[
      { S: SR, W: [HX - 12, 210], hand: { ang: -40, mode: 'flat' } },
      { S: SL, W: [HX + 12, 210], hand: { ang: -140, mode: 'flat', flip: true }, tone: 1 },
    ]} />
    <Splash x={120} y={206} />
    <Arc d="M76 186 a 18 12 0 1 0 6 -16" />
    <Label x={120} y={256} t="الكفين ٣ مرات" c="#2E9BC9" />
  </g>),
  mouth: (g) => (<g>
    <Kid g={g} fx={<Faucet x={170} />} arms={[restL]} front={[{ S: SR, E: [HX - 30, 204], W: [HX - 6, HY + 50], hand: { ang: -60, mode: 'cup' } }]} />
    <Glow x={HX} y={HY + 26} r={13} />
    <path d={`M${HX - 8} ${HY + 26} a8 5 0 1 0 16 0 a8 5 0 1 0 -16 0`} fill="none" stroke="#2E8FC0" strokeWidth="2" strokeDasharray="4 3" />
    <Label x={196} y={HY + 26} t="المضمضة" c="#2E9BC9" />
  </g>),
  nose: (g) => (<g>
    <Kid g={g} fx={<Faucet x={170} />} arms={[restL]} front={[{ S: SR, E: [HX - 28, 200], W: [HX - 4, HY + 40], hand: { ang: -70, mode: 'cup' } }]} />
    <Glow x={HX + 1} y={HY + 10} r={11} />
    <path d={`M${HX + 8} ${HY + 12} q 8 -10 2 -22`} fill="none" stroke="#2E8FC0" strokeWidth="2.4" strokeDasharray="3 3" />
    <Label x={196} y={HY + 10} t="الاستنشاق" c="#2E9BC9" />
  </g>),
  face: (g) => (<g>
    <Kid g={g} front={[
      { S: SR, E: [HX - 34, 196], W: [HX - 22, HY + 40], hand: { ang: -80, mode: 'flat' } },
      { S: SL, E: [HX + 34, 196], W: [HX + 22, HY + 40], hand: { ang: -100, mode: 'flat', flip: true }, tone: 1 },
    ]} />
    <path d={FACE(HX, HY, 1.08)} fill="none" stroke="#E0563F" strokeWidth="3" strokeDasharray="7 5" />
    {[[HX - 14, HY + 58], [HX + 12, HY + 62]].map(([x, y], i) => <Drop key={i} x={x} y={y} s={0.9} />)}
    <Label x={120} y={22} t="من منابت الشعر للدقن" c="#E0563F" />
    <Label x={120} y={250} t="ومن الودن للودن" c="#E0563F" />
  </g>),
  head: (g) => (<g>
    <Kid g={g} bare front={[
      { S: SR, W: [HX - 22, HY - 30], hand: { ang: -20, mode: 'flat' } },
      { S: SL, W: [HX + 22, HY - 30], hand: { ang: -160, mode: 'flat', flip: true }, tone: 1 },
    ]} />
    <path d={`M${HX + 52} ${HY - 34} C ${HX + 64} ${HY - 56}, ${HX + 30} ${HY - 70}, ${HX + 4} ${HY - 62}`} fill="none" stroke="#F5A623" strokeWidth="3.6" strokeLinecap="round" markerEnd="url(#warr)" />
    <Label x={120} y={250} t="من قدّام لورا وترجع" c="#E07F1E" />
  </g>),
  ears: (g) => (<g>
    <Kid g={g} bare front={[
      { S: SR, W: [HX - 36, HY + 32], hand: { ang: -80, mode: 'point' } },
      { S: SL, W: [HX + 36, HY + 32], hand: { ang: -100, mode: 'point', flip: true }, tone: 1 },
    ]} />
    <Glow x={HX - 32} y={HY + 2} r={11} /><Glow x={HX + 32} y={HY + 2} r={11} />
    <Label x={120} y={250} t="السبابة جوّه والإبهام ورا" c="#E07F1E" />
  </g>),
  done: (g) => (<g>
    <Kid g={g} arms={[restR]} front={[{ S: SL, W: [HX + 58, HY + 14], hand: { ang: -90, mode: 'point', flip: true } }]} />
    {[[200, 70], [210, 130], [30, 70], [40, 130]].map(([x, y], i) => <path key={i} transform={`translate(${x} ${y})`} d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2z" fill="#FFD25A" />)}
    <Label x={120} y={22} t="أشهد أن لا إله إلا الله" c="#2FB383" />
  </g>),
};

// غسل الدراع: الدراع ممدود فوق الحوض والإيد التانية ماشية عليه من الصوابع للكوع
function ArmFront({ g, side }) {
  const right = side === 'r';
  const wash = right
    ? { S: SR, E: [HX - 34, 206], W: [HX + 32, 198], hand: { ang: -8, mode: 'open' } }
    : { S: SL, E: [HX + 34, 206], W: [HX - 32, 198], hand: { ang: -172, mode: 'open', flip: true }, tone: 1 };
  const helper = right
    ? { S: SL, W: [HX + 8, 186], hand: { ang: 182, mode: 'flat', flip: true }, tone: 1 }
    : { S: SR, W: [HX - 8, 186], hand: { ang: -2, mode: 'flat' } };
  const E = wash.E;
  return (<g>
    <Kid g={g} fx={<><Faucet x={right ? 160 : 80} y={146} /><Water x={right ? 159 : 79} y1={164} y2={186} /></>} front={[wash, helper]} />
    <Splash x={right ? 160 : 80} y={210} />
    <Mark x1={E[0]} y1={E[1] - 22} x2={E[0]} y2={E[1] + 18} t="لحد الكوع" tx={E[0]} ty={E[1] + 20} />
    <Label x={120} y={22} t={right ? 'الإيد اليمين الأول' : 'وبعدين الإيد الشمال'} c="#E07F1E" />
  </g>);
}

// ===== غسل الرجلين: الطفل قاعد على كرسي صغير، مايل على رجله اللي فوق الطشت =====
function FootScene({ g, side }) {
  const C = CLOTH[g], f = side === 'l' ? 1 : -1; // l: باصص شمال الصورة فبيبان جنبه الشمال
  const X = (x) => r1(120 + (x - 120) * f);
  const P = (p) => [X(p[0]), p[1]];
  const wall = g === 'girl' ? '#FFF3F8' : '#EEF7FD', tile = g === 'girl' ? '#F6DCE7' : '#D8EAF6';
  const FootShape = ({ at, fill, s = 1 }) => (
    <g transform={`translate(${X(at[0])} ${at[1]}) scale(${f * s} ${s})`}>
      <path d="M9 -8 C 12 4, 8 10, -2 11 L -36 12 C -45 12, -45 3, -38 1 L -20 -5 C -12 -9, 0 -14, 9 -8z" fill={fill} stroke={SK.line} strokeWidth="2.4" strokeLinejoin="round" />
      {[-39, -34, -29, -24].map((x) => <path key={x} d={`M${x} 11.5 v-3.6`} stroke={SK.shade} strokeWidth="1.3" />)}
      <circle cx="4" cy="-2" r="2.8" fill={SK.shade} opacity=".75" />
    </g>);
  return (<g>
    <rect x="0" y="0" width="240" height="270" fill={wall} />
    {[0, 1, 2, 3, 4, 5].map((i) => <path key={'h' + i} d={`M0 ${i * 40 + 20} H240`} stroke={tile} strokeWidth="1.5" />)}
    {[0, 1, 2, 3, 4, 5, 6].map((i) => <path key={'v' + i} d={`M${i * 40 + 10} 0 V250`} stroke={tile} strokeWidth="1.5" />)}
    <rect x="-4" y="250" width="248" height="24" fill="#D3DDE9" stroke="#AEBBCD" strokeWidth="1.5" />
    {/* حنفية في الحيطة */}
    <g transform={`translate(${X(44)} 152) scale(${f} 1)`}>
      <rect x="-14" y="-12" width="12" height="24" rx="3" fill="url(#mt)" stroke="#6F7F99" strokeWidth="2" />
      <path d="M-4 0 H22 q6 0 6 6 v8" fill="none" stroke="#6F7F99" strokeWidth="9" strokeLinecap="round" />
      <path d="M-4 0 H22 q6 0 6 6 v8" fill="none" stroke="#DDE5EF" strokeWidth="5" strokeLinecap="round" />
      <rect x="-12" y="-20" width="8" height="8" rx="2" fill="#7FB6D6" stroke="#4F87A8" strokeWidth="1.5" />
    </g>
    {/* كرسي */}
    <rect x={Math.min(X(148), X(206))} y="186" width="58" height="10" rx="4" fill="#C98B55" stroke="#8C5A30" strokeWidth="2.2" />
    <path d={`M${X(154)} 196 L${X(150)} 250 M${X(200)} 196 L${X(204)} 250`} stroke="#8C5A30" strokeWidth="5" strokeLinecap="round" />
    {/* الرجل البعيدة على الأرض */}
    <Tube pts={[P([178, 182]), P([128, 186]), P([132, 214])]} w={21} fill={C.trouS} line={C.line} />
    <Tube pts={[P([132, 216]), P([134, 238])]} w={11} fill={SK.mid} line={SK.line} />
    <FootShape at={[138, 240]} fill={SK.mid} s={0.85} />
    {/* الجسم مايل لقدّام */}
    <path d={`M${X(120)} 136 C ${X(122)} 118, ${X(146)} 108, ${X(160)} 116 C ${X(180)} 128, ${X(196)} 158, ${X(194)} 190 L ${X(146)} 192 C ${X(140)} 172, ${X(122)} 156, ${X(120)} 136z`} fill={`url(#cl${g})`} stroke={C.line} strokeWidth="2.6" strokeLinejoin="round" />
    <path d={`M${X(150)} 130 C ${X(166)} 146, ${X(174)} 164, ${X(176)} 186`} stroke={C.s} strokeWidth="3" fill="none" />
    {/* الإيد البعيدة على الركبة */}
    <Arm g={g} S={P([146, 130])} W={P([122, 176])} bend={-f} hand={{ mode: 'rest', ang: f > 0 ? 150 : 30, flip: f < 0 }} tone={1} rolled={false} U={30} F={30} />
    {/* طشت */}
    <path d={`M${X(32)} 236 H${X(134)} L${X(124)} 258 H${X(42)}z`} fill="#BFD6EA" stroke="#7FA0C0" strokeWidth="2.4" />
    <ellipse cx={X(83)} cy="236" rx="51" ry="7" fill="#9FD5F2" stroke="#7FA0C0" strokeWidth="2" />
    {/* الرجل القريبة: البنطلون متني لنص الساق عشان الكعب يبان */}
    <Tube pts={[P([170, 184]), P([112, 176]), P([104, 200])]} w={23} fill={C.trou} line={C.line} />
    <Tube pts={[P([105.5, 194]), P([103, 204])]} w={26} fill={C.cuff} line={C.line} cap="butt" />
    <Tube pts={[P([103, 206]), P([96, 224])]} w={12.5} fill={SK.base} line={SK.line} />
    <FootShape at={[96, 226]} fill={SK.base} />
    <Water x={X(72)} y1={166} y2={220} w={7} />
    <Splash x={X(70)} y={226} />
    {/* الراس من الجنب ومايلة لتحت (من غير ملامح) */}
    <g transform={`translate(${X(110)} 100) scale(${f} 1) rotate(-18)`}>
      {g === 'girl' ? (<g>
        <path d="M-25 2 C -27 -36, 28 -38, 28 0 C 30 18, 34 30, 40 42 L -4 42 C -14 32, -23 18, -25 2z" fill="url(#hj)" stroke={CLOTH.girl.hijL} strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M-26 0 C -26 -15, -14 -21, -7 -19 C -9 -6, -10 8, -15 19 C -22 17, -27 10, -26 0z" fill={SK.base} stroke={SK.line} strokeWidth="2.2" />
        <path d="M-26 4 l-4 4 l4 2" fill={SK.base} stroke={SK.line} strokeWidth="2" strokeLinejoin="round" />
        <ellipse cx="-18" cy="10" rx="3.6" ry="2.6" fill={SK.blush} opacity=".45" />
      </g>) : (<g>
        <path d="M-24 0 C -24 -30, 26 -32, 26 0 C 26 20, 13 30, -2 30 C -15 30, -24 19, -24 0z" fill={SK.base} stroke={SK.line} strokeWidth="2.4" />
        <path d="M-24 3 l-5 5 l5 2" fill={SK.base} stroke={SK.line} strokeWidth="2" strokeLinejoin="round" />
        <path d="M-18 -18 C -8 -34, 24 -32, 27 -2 C 25 10, 21 16, 16 22 C 15 6, 9 -6, -2 -11 C -9 -13, -15 -14, -18 -18z" fill={HAIR.boy} />
        <path d="M6 2 C 13 0, 15 11, 7 14" fill={SK.mid} stroke={SK.line} strokeWidth="2" />
        <ellipse cx="-12" cy="12" rx="5" ry="3.4" fill={SK.blush} opacity=".45" />
      </g>)}
    </g>
    {/* الإيد القريبة بتغسل الرجل وبين الصوابع */}
    <Arm g={g} S={P([128, 132])} W={P([104, 208])} bend={f} hand={{ ang: f > 0 ? 150 : 30, mode: 'flat', flip: f < 0 }} U={46} F={44} />
    <Mark x1={X(98)} y1={204} x2={X(98)} y2={246} t="لحد الكعبين" tx={X(178)} ty={226} />
    <Label x={120} y={24} t={side === 'r' ? 'الرجل اليمين الأول' : 'وبعدين الرجل الشمال'} c="#E07F1E" />
  </g>);
}

const STEPS = {
  ...FRONT,
  arm_r: (g) => <ArmFront g={g} side="r" />,
  arm_l: (g) => <ArmFront g={g} side="l" />,
  feet_r: (g) => <FootScene g={g} side="r" />,
  feet_l: (g) => <FootScene g={g} side="l" />,
};
export const WUDU_STEPS = ['niyya', 'hands', 'mouth', 'nose', 'face', 'arm_r', 'arm_l', 'head', 'ears', 'feet_r', 'feet_l', 'done'];

const Defs = ({ g }) => {
  const C = CLOTH[g] || CLOTH.boy;
  return (<defs>
    <marker id="warr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="#F5A623" /></marker>
    <radialGradient id="fc" cx="45%" cy="38%" r="70%"><stop offset="0" stopColor="#F8D3B4" /><stop offset=".7" stopColor={SK.base} /><stop offset="1" stopColor={SK.mid} /></radialGradient>
    <linearGradient id={'cl' + g} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={C.s} /><stop offset=".35" stopColor={C.c} /><stop offset=".7" stopColor={C.c} /><stop offset="1" stopColor={C.s} /></linearGradient>
    <linearGradient id="hj" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#CDBBF7" /><stop offset=".6" stopColor={CLOTH.girl.hij} /><stop offset="1" stopColor={CLOTH.girl.hijS} /></linearGradient>
    <linearGradient id="mb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F7F9FC" /><stop offset="1" stopColor="#D5DEEA" /></linearGradient>
    <linearGradient id="mt" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#9AA8BD" /><stop offset=".5" stopColor="#EEF2F7" /><stop offset="1" stopColor="#9AA8BD" /></linearGradient>
  </defs>);
};

// صورة الطفل (للتعارف وغيره): نفس الطفل الواقعي من غير ملامح، بيسلّم بإيده
export function KidPortrait({ g = 'boy', size = 120, wave = true, bg = true }) {
  const gg = g === 'girl' ? 'girl' : 'boy', id = 'kp' + gg;
  return (
    <svg viewBox="28 18 184 196" width={size} height={size * 196 / 184} role="img" aria-label={gg === 'girl' ? 'بنت' : 'ولد'} style={{ display: 'block' }}>
      <Defs g={gg} />
      <clipPath id={id}><circle cx="120" cy="116" r="92" /></clipPath>
      {bg && <circle cx="120" cy="116" r="92" fill={gg === 'girl' ? '#FFE3EF' : '#DDF0FF'} />}
      <g clipPath={`url(#${id})`}>
        {bg && [0, 1, 2, 3, 4, 5].map((k) => <path key={k} d={`M120 116 L${120 + Math.cos(k * 1.05) * 140} ${116 + Math.sin(k * 1.05) * 140} L${120 + Math.cos(k * 1.05 + 0.3) * 140} ${116 + Math.sin(k * 1.05 + 0.3) * 140}z`} fill="#fff" opacity=".35" />)}
        <Torso g={gg} />
        <HeadFront g={gg} />
        {wave && <Arm g={gg} S={SL} E={[HX + 60, HY + 80]} W={[HX + 56, HY + 30]} hand={{ ang: -80, mode: 'open', flip: true }} rolled={false} />}
      </g>
      {bg && <circle cx="120" cy="116" r="91" fill="none" stroke="#fff" strokeWidth="5" />}
    </svg>
  );
}

export default function Wudu({ step = 'hands', g = 'boy', size = 200 }) {
  const gg = g === 'girl' ? 'girl' : 'boy';
  const front = !step.startsWith('feet');
  return (
    <svg viewBox="0 0 240 270" width={size} height={size * 1.125} role="img" aria-label={step} style={{ display: 'block', maxWidth: '100%' }}>
      <Defs g={gg} /><clipPath id={'wc' + step + gg}><rect x="2" y="2" width="236" height="266" rx="26" /></clipPath>
      <g clipPath={`url(#wc${step}${gg})`}>
        {front && <Room g={gg} />}
        {(STEPS[step] || STEPS.hands)(gg)}
      </g>
      <rect x="2" y="2" width="236" height="266" rx="26" fill="none" stroke={gg === 'girl' ? '#F3C6D8' : '#CFE3F2'} strokeWidth="2" />
    </svg>
  );
}
