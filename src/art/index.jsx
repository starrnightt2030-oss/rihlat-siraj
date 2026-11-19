// نقطة واحدة لعرض أي رسمة في التطبيق: وضعية صلاة، خطوة وضوء، أو مشهد
import Kid from './Kid';
import Wudu from './Wudu';
import Scene from './Scenes';
export { POSE_NAMES } from './Kid';

// a = { kid: 'ruku' } | { wudu: 'face' } | { scene: 'zakat' }
export default function Art({ a, g = 'boy', size = 160, rug }) {
  if (!a) return null;
  if (a.kid) return <Kid pose={a.kid} g={g} size={size} rug={rug ?? true} />;
  if (a.wudu) return <Wudu step={a.wudu} g={g} size={size} />;
  if (a.scene) return <div style={{ width: size * 1.25, maxWidth: '100%' }}><Scene id={a.scene} g={g} /></div>;
  return null;
}
