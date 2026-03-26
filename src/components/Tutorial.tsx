import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Sparkles, Wind, LayoutGrid, ArrowRight, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface TutorialProps {
  onComplete: () => void;
}

const slides = [
  {
    title: "Welcome to ClearMind",
    description: "Your mental-clarity assistant. Let's turn your messy thoughts into structured, actionable clarity.",
    icon: <Brain className="w-12 h-12 text-indigo-600" />,
    color: "bg-indigo-50 dark:bg-indigo-900/20"
  },
  {
    title: "The Brain Dump",
    description: "Type or speak everything on your mind. Don't worry about order or grammar—just get it out.",
    icon: <Sparkles className="w-12 h-12 text-amber-600" />,
    color: "bg-amber-50 dark:bg-amber-900/20"
  },
  {
    title: "AI Organization",
    description: "We'll automatically categorize your thoughts and separate what you can control from what you can't.",
    icon: <LayoutGrid className="w-12 h-12 text-blue-600" />,
    color: "bg-blue-50 dark:bg-blue-900/20"
  },
  {
    title: "MindAI Training",
    description: "Train your personal AI by answering questions. The more you share, the better it understands your stress triggers.",
    icon: <Brain className="w-12 h-12 text-purple-600" />,
    color: "bg-purple-50 dark:bg-purple-900/20"
  },
  {
    title: "Mood Tracking",
    description: "Log your mood to see how your emotional state correlates with your productivity and thoughts.",
    icon: <Sparkles className="w-12 h-12 text-rose-600" />,
    color: "bg-rose-50 dark:bg-rose-900/20"
  },
  {
    title: "Find Your Calm",
    description: "When things feel like too much, use Calm Mode for guided breathing and grounding exercises.",
    icon: <Wind className="w-12 h-12 text-emerald-600" />,
    color: "bg-emerald-50 dark:bg-emerald-900/20"
  }
];

export const Tutorial: React.FC<TutorialProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col font-sans">
      <div className="flex justify-end p-6">
        <button 
          onClick={onComplete}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 text-sm font-medium"
        >
          Skip 
          <X className="w-4 h-4 opacity-40" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 max-w-sm"
          >
            <div className={cn(
              "w-24 h-24 mx-auto rounded-[32px] flex items-center justify-center shadow-sm",
              slides[currentSlide].color
            )}>
              {slides[currentSlide].icon}
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {slides[currentSlide].title}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                {slides[currentSlide].description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-8 space-y-8">
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <div 
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === currentSlide ? "w-8 bg-indigo-600" : "w-2 bg-slate-200 dark:bg-slate-800"
              )}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
        >
          {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
