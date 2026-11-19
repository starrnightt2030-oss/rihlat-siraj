import Kid, { POSE_NAMES } from '../art/Kid';
import Wudu, { WUDU_STEPS } from '../art/Wudu';
import Scene, { SCENES } from '../art/Scenes';
export default function ArtLab() {
  const which = location.hash.split('/')[2] || 'kid';
  const cell = (k, el) => <div key={k} style={{ textAlign: 'center', fontSize: 11 }}>{el}{k}</div>;
  let items;
  if (which === 'wudu') items = ['boy', 'girl'].flatMap((g) => WUDU_STEPS.map((s) => cell(g + s, <Wudu step={s} g={g} size={95} />)));
  else if (which === 'scene') items = Object.keys(SCENES).map((s) => cell(s, <Scene id={s} g="girl" />));
  else items = ['boy', 'girl'].flatMap((g) => Object.keys(POSE_NAMES).map((p) => cell(g + p, <Kid pose={p} g={g} size={90} />)));
  return (<div className="screen" style={{ display: 'grid', gridTemplateColumns: `repeat(${which === 'scene' ? 3 : 4}, 1fr)`, gap: 4, background: '#fff' }}>{items}</div>);
}
