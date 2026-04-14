'use client';

import { motion } from 'motion/react';

interface ProgressCircleProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  subLabel?: string;
}

export default function ProgressCircle({ 
  progress, 
  size = 96, 
  strokeWidth = 8, 
  label, 
  subLabel 
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex items-center justify-center relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
        {/* Track Circle */}
        <circle
          className="text-surface-container-highest"
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
        {/* Progress Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          r={radius}
          stroke="url(#progress-gradient)"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
        />
        <defs>
          <linearGradient id="progress-gradient" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#306b3c' }} />
            <stop offset="100%" style={{ stopColor: '#a4e4aa' }} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold font-headline">{label || `${progress}%`}</span>
        {subLabel && (
          <span className="text-[9px] text-on-surface-variant uppercase font-bold tracking-widest leading-none mt-1">
            {subLabel}
          </span>
        )}
      </div>
    </div>
  );
}
