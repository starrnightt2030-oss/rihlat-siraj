const Cloud = ({ s = 1, top, left, dur = 26, delay = 0, op = 0.9 }) => (
  <svg className="cloud" style={{ top, left, width: 150 * s, animation: `drift ${dur}s ease-in-out ${delay}s infinite alternate`, opacity: op }} viewBox="0 0 150 70" aria-hidden="true">
    <path d="M20 60c-12 0-18-8-16-16 2-9 11-13 20-11 3-12 14-20 28-18 9-12 30-14 40-1 13-5 30 2 31 17 12 1 20 9 18 19-1 6-6 10-13 10z" fill="#fff" />
  </svg>
);
export default function Sky({ tone = '' }) {
  return (
    <div className={'sky ' + tone}>
      <div className="sun" />
      <Cloud top={40} left="55%" s={1.1} />
      <Cloud top={130} left="-6%" s={0.8} dur={32} delay={-8} op={0.75} />
      <Cloud top={240} left="70%" s={0.6} dur={22} delay={-4} op={0.6} />
    </div>
  );
}
