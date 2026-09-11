import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface AnimatedStatProps {
  value: number;
  display: string;
  label: string;
  change: string;
  positive: boolean;
  delay?: number;
}

export const AnimatedStat: React.FC<AnimatedStatProps> = ({
  display, label, change, positive, delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-1.5"
    >
      <span
        className="text-3xl font-bold tracking-tight text-white"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {display}
      </span>
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: 'rgba(238,240,245,0.45)' }}>{label}</span>
        <span
          className="text-[11px] font-medium font-mono"
          style={{ color: positive ? 'var(--color-accent-green)' : 'var(--color-accent-red)' }}
        >
          {change}
        </span>
      </div>
    </motion.div>
  );
};

// Counting number animation
interface CountingNumberProps {
  target: number;
  duration?: number;
  className?: string;
}

export const CountingNumber: React.FC<CountingNumberProps> = ({ target, duration = 2, className }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { duration: duration * 1000, bounce: 0.1 });
  const rounded = useTransform(spring, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    motionVal.set(target);
  }, [target, motionVal]);

  return (
    <motion.span ref={ref} className={className}>
      {rounded}
    </motion.span>
  );
};
