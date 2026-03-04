import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind, Play, Pause, RotateCcw, ChevronDown } from 'lucide-react';
import { BreathingTechnique } from '../types';
import { cn } from '../lib/utils';

const TECHNIQUES: Record<BreathingTechnique, { name: string; inhale: number; hold: number; exhale: number; holdPost?: number; description: string }> = {
  'calm': { name: 'Calm (4-4)', inhale: 4, hold: 4, exhale: 4, description: 'Simple rhythmic breathing to settle the mind.' },
  'box': { name: 'Box Breathing', inhale: 4, hold: 4, exhale: 4, holdPost: 4, description: 'Used by Navy SEALs to stay calm under pressure.' },
  '4-7-8': { name: '4-7-8 Sleep', inhale: 4, hold: 7, exhale: 8, description: 'Natural tranquilizer for the nervous system.' },
  'focus': { name: 'Focus (Power)', inhale: 6, hold: 2, exhale: 4, description: 'Energizing breath to sharpen your attention.' }
};

export const BreathingExercise: React.FC = () => {
  const [technique, setTechnique] = useState<BreathingTechnique>('calm');
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'holdPost'>('inhale');
  const [timeLeft, setTimeLeft] = useState(TECHNIQUES[technique].inhale);
  const [showMenu, setShowMenu] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentTech = TECHNIQUES[technique];

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Switch phase
            if (phase === 'inhale') {
              setPhase('hold');
              return currentTech.hold;
            } else if (phase === 'hold') {
              setPhase('exhale');
              return currentTech.exhale;
            } else if (phase === 'exhale') {
              if (currentTech.holdPost) {
                setPhase('holdPost');
                return currentTech.holdPost;
              } else {
                setPhase('inhale');
                return currentTech.inhale;
              }
            } else {
              setPhase('inhale');
              return currentTech.inhale;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, phase, technique]);

  const toggleStart = () => setIsActive(!isActive);
  const reset = () => {
    setIsActive(false);
    setPhase('inhale');
    setTimeLeft(currentTech.inhale);
  };

  const handleSelectTech = (t: BreathingTechnique) => {
    setTechnique(t);
    setPhase('inhale');
    setTimeLeft(TECHNIQUES[t].inhale);
    setIsActive(false);
    setShowMenu(false);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-12 py-4">
      <div className="relative">
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-500 transition-colors"
        >
          {currentTech.name} 
          <img 
            src="https://cdn-icons-png.flaticon.com/512/271/271210.png" 
            alt="Down" 
            className={cn("w-3 h-3 transition-transform opacity-40", showMenu && "rotate-180")} 
            referrerPolicy="no-referrer"
          />
        </button>
        
        <AnimatePresence>
          {showMenu && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden"
            >
              {(Object.keys(TECHNIQUES) as BreathingTechnique[]).map((t) => (
                <button
                  key={t}
                  onClick={() => handleSelectTech(t)}
                  className={cn(
                    "w-full px-4 py-3 text-left text-xs font-bold uppercase tracking-wider transition-colors hover:bg-slate-50 dark:hover:bg-slate-800",
                    technique === t ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20" : "text-slate-500"
                  )}
                >
                  {TECHNIQUES[t].name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative flex items-center justify-center w-64 h-64">
        {/* Outer Rings */}
        <motion.div 
          animate={{ 
            scale: isActive ? (phase === 'inhale' ? 1.5 : phase === 'exhale' ? 1 : 1.5) : 1,
            opacity: isActive ? 0.3 : 0.1
          }}
          transition={{ duration: phase === 'inhale' ? currentTech.inhale : phase === 'exhale' ? currentTech.exhale : 0.5 }}
          className="absolute inset-0 border-2 border-indigo-500 rounded-full"
        />
        <motion.div 
          animate={{ 
            scale: isActive ? (phase === 'inhale' ? 1.3 : phase === 'exhale' ? 1 : 1.3) : 1,
            opacity: isActive ? 0.5 : 0.2
          }}
          transition={{ duration: phase === 'inhale' ? currentTech.inhale : phase === 'exhale' ? currentTech.exhale : 0.5 }}
          className="absolute inset-4 border-2 border-indigo-400 rounded-full"
        />

        {/* Main Orb */}
        <motion.div
          animate={{
            scale: isActive ? (phase === 'inhale' ? 1.2 : phase === 'exhale' ? 0.8 : 1.2) : 1,
            backgroundColor: phase === 'inhale' ? '#4f46e5' : phase === 'hold' || phase === 'holdPost' ? '#6366f1' : '#818cf8'
          }}
          transition={{ 
            duration: phase === 'inhale' ? currentTech.inhale : phase === 'exhale' ? currentTech.exhale : 0.5,
            ease: "easeInOut"
          }}
          className="w-32 h-32 rounded-full shadow-2xl shadow-indigo-500/50 flex flex-col items-center justify-center text-white z-10"
        >
          <span className="text-3xl font-black">{timeLeft}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
            {phase === 'holdPost' ? 'Hold' : phase}
          </span>
        </motion.div>
      </div>

      <div className="text-center space-y-2 max-w-xs">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white capitalize">
          {phase === 'inhale' ? 'Breathe In' : phase === 'hold' || phase === 'holdPost' ? 'Hold' : 'Breathe Out'}
        </h3>
        <p className="text-sm text-slate-500">
          {currentTech.description}
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={toggleStart}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg",
            isActive ? "bg-slate-100 dark:bg-slate-800 text-slate-600" : "bg-indigo-600 text-white"
          )}
        >
          {isActive ? (
            <img 
              src="https://cdn-icons-png.flaticon.com/512/64/64595.png" 
              alt="Pause" 
              className="w-6 h-6 opacity-60" 
              referrerPolicy="no-referrer"
            />
          ) : (
            <img 
              src="https://cdn-icons-png.flaticon.com/512/727/727245.png" 
              alt="Play" 
              className="w-6 h-6 invert brightness-0" 
              referrerPolicy="no-referrer"
            />
          )}
        </button>
        <button
          onClick={reset}
          className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center transition-all active:scale-90 hover:text-slate-600"
        >
          <img 
            src="https://cdn-icons-png.flaticon.com/512/563/563237.png" 
            alt="Reset" 
            className="w-6 h-6 opacity-40" 
            referrerPolicy="no-referrer"
          />
        </button>
      </div>
    </div>
  );
};
