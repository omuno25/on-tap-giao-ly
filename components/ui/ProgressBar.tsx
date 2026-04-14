'use client';

import { motion } from 'motion/react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  className?: string;
}

export default function ProgressBar({ progress, className }: ProgressBarProps) {
  return (
    <div className={`w-full h-2.5 bg-surface-container-highest rounded-full overflow-hidden ${className}`}>
      <motion.div
        className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}
