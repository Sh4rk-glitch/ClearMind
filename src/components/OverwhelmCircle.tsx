import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface OverwhelmCircleProps {
  score: number;
  className?: string;
}

export const OverwhelmCircle: React.FC<OverwhelmCircleProps> = ({ score, className }) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s < 30) return 'text-emerald-400';
    if (s < 70) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg className="w-48 h-48 transform -rotate-90">
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          className="text-slate-100 dark:text-slate-800"
        />
        <motion.circle
          cx="96"
          cy="96"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={cn("transition-colors duration-500", getColor(score))}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span 
          key={score}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-4xl font-bold text-slate-800 dark:text-white"
        >
          {score}
        </motion.span>
        <span className="text-xs uppercase tracking-widest text-slate-400 font-medium">Overwhelm</span>
      </div>
    </div>
  );
};
