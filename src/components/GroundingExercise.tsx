import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, Hand, Volume2, Wind, Utensils, Zap, Heart, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

type GroundingType = '54321' | 'bodyscan' | 'safeplace' | 'colorfinding';

const sensorySteps = [
  { id: 5, label: "Things you can see", icon: <Eye className="w-5 h-5" />, count: 5, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
  { id: 4, label: "Things you can touch", icon: <Hand className="w-5 h-5" />, count: 4, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  { id: 3, label: "Things you can hear", icon: <Volume2 className="w-5 h-5" />, count: 3, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
  { id: 2, label: "Things you can smell", icon: <Wind className="w-5 h-5" />, count: 2, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20" },
  { id: 1, label: "Thing you can taste", icon: <Utensils className="w-5 h-5" />, count: 1, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
];

export const GroundingExercise: React.FC = () => {
  const [activeType, setActiveType] = useState<GroundingType | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [tappedCount, setTappedCount] = useState(0);
  const [currentColorIdx, setCurrentColorIdx] = useState(0);

  const reset = () => {
    setActiveType(null);
    setCurrentStep(0);
    setTappedCount(0);
    setCurrentColorIdx(0);
  };

  const renderMenu = () => (
    <div className="grid grid-cols-1 gap-4 py-4">
      <button 
        onClick={() => setActiveType('54321')}
        className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:border-indigo-200 transition-all text-left group"
      >
        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center">
          <Zap className="w-6 h-6 text-indigo-500" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-slate-800 dark:text-white">5-4-3-2-1 Sensory</h4>
          <p className="text-xs text-slate-400">Connect with your immediate environment.</p>
        </div>
        <ArrowRight className="w-5 h-5 opacity-20 group-hover:opacity-100 transition-opacity" />
      </button>

      <button 
        onClick={() => setActiveType('colorfinding')}
        className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:border-emerald-200 transition-all text-left group"
      >
        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center">
          <Eye className="w-6 h-6 text-emerald-500" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-slate-800 dark:text-white">Color Finding</h4>
          <p className="text-xs text-slate-400">Spot colors around you to stay present.</p>
        </div>
        <ArrowRight className="w-5 h-5 opacity-20 group-hover:opacity-100 transition-opacity" />
      </button>

      <button 
        onClick={() => setActiveType('bodyscan')}
        className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:border-indigo-200 transition-all text-left group"
      >
        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center">
          <Heart className="w-6 h-6 text-rose-500" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-slate-800 dark:text-white">Body Scan</h4>
          <p className="text-xs text-slate-400">Release tension from head to toe.</p>
        </div>
        <ArrowRight className="w-5 h-5 opacity-20 group-hover:opacity-100 transition-opacity" />
      </button>

      <button 
        onClick={() => setActiveType('safeplace')}
        className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:border-indigo-200 transition-all text-left group"
      >
        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-blue-500" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-slate-800 dark:text-white">Safe Place Visualization</h4>
          <p className="text-xs text-slate-400">Create a mental sanctuary of peace.</p>
        </div>
        <ArrowRight className="w-5 h-5 opacity-20 group-hover:opacity-100 transition-opacity" />
      </button>
    </div>
  );

  const render54321 = () => {
    if (currentStep === -1) {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12 space-y-6"
        >
          <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="w-12 h-12 text-emerald-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">You are grounded.</h3>
            <p className="text-slate-500">Your mind is returning to the present moment.</p>
          </div>
          <button 
            onClick={reset}
            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            Finish
          </button>
        </motion.div>
      );
    }

    const step = sensorySteps[currentStep];

    return (
      <div className="space-y-8 py-4">
        <div className="flex items-center gap-4">
          <div className={cn("p-4 rounded-[24px] shadow-sm", step.bg, step.color)}>
            {step.icon}
          </div>
          <div className="flex-1">
            <h3 className="font-black text-2xl text-slate-800 dark:text-white">{step.label}</h3>
            <div className="flex gap-1 mt-1">
              {sensorySteps.map((_, i) => (
                <div key={i} className={cn("h-1 rounded-full transition-all", i <= currentStep ? "w-4 bg-indigo-500" : "w-1 bg-slate-200 dark:bg-slate-800")} />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 py-6">
          {Array.from({ length: step.count }).map((_, i) => (
            <motion.button
              key={`${currentStep}-${i}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => {
                if (tappedCount + 1 < step.count) {
                  setTappedCount(tappedCount + 1);
                } else {
                  if (currentStep < sensorySteps.length - 1) {
                    setCurrentStep(currentStep + 1);
                    setTappedCount(0);
                  } else {
                    setCurrentStep(-1);
                  }
                }
              }}
              disabled={i < tappedCount}
              className={cn(
                "w-20 h-20 rounded-[28px] flex items-center justify-center transition-all shadow-sm text-xl font-bold",
                i < tappedCount 
                  ? "bg-slate-50 dark:bg-slate-800 text-slate-300 scale-90" 
                  : "bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-indigo-300 active:scale-95"
              )}
            >
              {i < tappedCount ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <ShieldCheck className="w-8 h-8 text-emerald-500" />
                </motion.div>
              ) : i + 1}
            </motion.button>
          ))}
        </div>

        <p className="text-center text-slate-400 text-sm italic px-8">
          Identify and tap {step.count} {step.label.toLowerCase()} in your environment.
        </p>
      </div>
    );
  };

  const renderBodyScan = () => (
    <div className="py-8 space-y-8 text-center">
      <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <Heart className="w-12 h-12 text-rose-500 animate-pulse" />
      </div>
      <div className="space-y-4">
        <h3 className="text-2xl font-black">Body Scan</h3>
        <p className="text-slate-500 leading-relaxed">
          Close your eyes. Start at your toes and slowly move up to your head. 
          Notice any tension and imagine it melting away with each breath.
        </p>
      </div>
      <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl text-left space-y-3">
        {["Toes & Feet", "Calves & Knees", "Thighs & Hips", "Stomach & Chest", "Shoulders & Neck", "Face & Jaw"].map((part, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-[10px] font-bold text-emerald-600">{i+1}</div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{part}</span>
          </div>
        ))}
      </div>
      <button onClick={reset} className="text-slate-400 font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 mx-auto">
        <RefreshCw className="w-4 h-4 opacity-40" /> Back to Menu
      </button>
    </div>
  );

  const renderSafePlace = () => (
    <div className="py-8 space-y-8 text-center">
      <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShieldCheck className="w-12 h-12 text-blue-500" />
      </div>
      <div className="space-y-4">
        <h3 className="text-2xl font-black">Safe Place</h3>
        <p className="text-slate-500 leading-relaxed">
          Imagine a place where you feel completely safe and at peace. 
          What does it look like? What do you smell? What do you hear?
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl text-left border border-blue-100/50">
          <h5 className="text-xs font-bold text-blue-600 uppercase mb-1">Visual</h5>
          <p className="text-xs text-slate-500 italic">Soft light, calm water, or green trees.</p>
        </div>
        <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl text-left border border-emerald-100/50">
          <h5 className="text-xs font-bold text-emerald-600 uppercase mb-1">Sound</h5>
          <p className="text-xs text-slate-500 italic">Gentle wind, birds, or soft music.</p>
        </div>
      </div>
      <button onClick={reset} className="text-slate-400 font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 mx-auto">
        <RefreshCw className="w-4 h-4 opacity-40" /> Back to Menu
      </button>
    </div>
  );

  const COLORS = [
    { name: 'Red', hex: 'bg-rose-500' },
    { name: 'Blue', hex: 'bg-blue-500' },
    { name: 'Green', hex: 'bg-emerald-500' },
    { name: 'Yellow', hex: 'bg-amber-400' },
    { name: 'Purple', hex: 'bg-purple-500' },
    { name: 'Orange', hex: 'bg-orange-500' },
  ];

  const renderColorFinding = () => {
    const color = COLORS[currentColorIdx];
    return (
      <div className="py-8 space-y-8 text-center">
        <motion.div 
          key={currentColorIdx}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn("w-32 h-32 rounded-[40px] mx-auto shadow-xl", color.hex)}
        />
        <div className="space-y-2">
          <h3 className="text-3xl font-black">Find something {color.name}</h3>
          <p className="text-slate-500">Look around your room and spot an object that is {color.name.toLowerCase()}.</p>
        </div>
        <button 
          onClick={() => {
            if (currentColorIdx < COLORS.length - 1) {
              setCurrentColorIdx(currentColorIdx + 1);
            } else {
              reset();
            }
          }}
          className="px-8 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-bold shadow-lg flex items-center gap-2 mx-auto"
        >
          I found it 
          <ArrowRight className="w-4 h-4" />
        </button>
        <div className="flex justify-center gap-2">
          {COLORS.map((_, i) => (
            <div key={i} className={cn("h-1.5 rounded-full transition-all", i === currentColorIdx ? "w-8 bg-indigo-500" : "w-2 bg-slate-200 dark:bg-slate-800")} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence mode="wait">
      {!activeType && (
        <motion.div key="menu" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          {renderMenu()}
        </motion.div>
      )}
      {activeType === '54321' && (
        <motion.div key="54321" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          {render54321()}
        </motion.div>
      )}
      {activeType === 'colorfinding' && (
        <motion.div key="colorfinding" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          {renderColorFinding()}
        </motion.div>
      )}
      {activeType === 'bodyscan' && (
        <motion.div key="bodyscan" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          {renderBodyScan()}
        </motion.div>
      )}
      {activeType === 'safeplace' && (
        <motion.div key="safeplace" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          {renderSafePlace()}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
