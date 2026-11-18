import { motion } from 'framer-motion';
export default function Logo({ size = 64 }) {
  return (
    <motion.h1 initial={{ scale: 0.6, opacity: 0, rotate: -4 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 12, delay: 0.15 }}
      style={{ fontSize: size, fontWeight: 800, lineHeight: 1.05, textAlign: 'center', color: '#FFC233', WebkitTextStroke: `${Math.round(size / 9)}px #fff`, paintOrder: 'stroke fill', textShadow: '0 6px 0 #E39400, 0 12px 26px rgba(34,48,106,.25)' }}>
      رحلة سراج
    </motion.h1>
  );
}
