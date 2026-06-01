"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";

interface RatingGaugeProps {
  /** 0–100 */
  rating: number;
  emoji: string;
}

const SIZE = 200;
const STROKE = 16;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

/** Big animated percentage inside a sweeping circular meter. */
export function RatingGauge({ rating, emoji }: RatingGaugeProps) {
  const reduce = useReducedMotion();
  const target = Math.max(0, Math.min(100, Math.round(rating)));

  const progress = useMotionValue(reduce ? target : 0);
  const [display, setDisplay] = useState(reduce ? target : 0);
  const dashOffset = useTransform(progress, (p) => CIRC * (1 - p / 100));
  const started = useRef(false);

  useEffect(() => {
    if (reduce || started.current) {
      setDisplay(target);
      progress.set(target);
      return;
    }
    started.current = true;
    const controls = animate(progress, target, {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [target, progress, reduce]);

  return (
    <div
      className="relative mx-auto"
      style={{ width: SIZE, height: SIZE }}
      role="img"
      aria-label={`Dad Bod Rating: ${target} percent`}
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffb020" />
            <stop offset="52%" stopColor="#ff5d8f" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke="var(--color-hairline)"
          strokeWidth={STROKE}
        />
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          style={{ strokeDashoffset: dashOffset }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl" aria-hidden="true">
          {emoji}
        </span>
        <span className="text-5xl font-black tabular-nums tracking-tight text-ink">
          {display}
          <span className="text-2xl font-bold text-ink-soft">%</span>
        </span>
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-ink-faint">
          Dad Bod
        </span>
      </div>
    </div>
  );
}
