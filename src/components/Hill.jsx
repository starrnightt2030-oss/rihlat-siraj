export default function Hill({ color = '#8EE07A', sand = '#FFE7A6' }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 400 160" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: 170, pointerEvents: 'none' }}>
      <path d="M0 70 C 90 20, 160 40, 220 60 S 340 30, 400 50 V160 H0z" fill={color} />
      <path d="M0 110 C 100 80, 200 120, 400 95 V160 H0z" fill={sand} />
      <path d="M0 70 C 90 20, 160 40, 220 60 S 340 30, 400 50" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="4" />
    </svg>
  );
}
