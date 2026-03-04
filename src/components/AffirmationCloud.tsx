import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'motion/react';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const affirmations = [
  "I am doing my best, and that is enough.",
  "I have the power to create change.",
  "I am worthy of peace and relaxation.",
  "My feelings are valid, but they don't define me.",
  "I am in control of how I respond to stress.",
  "I choose to focus on what I can control.",
  "Every breath I take fills me with calm.",
  "I am resilient and can handle whatever comes my way.",
  "I give myself permission to slow down.",
  "I am safe in this moment.",
  "I am capable of handling anything that comes my way.",
  "I trust the process of life.",
  "I am surrounded by peace.",
  "I release all tension from my body.",
  "I am at peace with my past.",
  "I am excited for the future.",
  "I am grateful for this moment.",
  "I am strong, capable, and kind.",
  "I am worthy of love and respect.",
  "I am at home in my body.",
  "I am a beacon of light and positivity.",
  "I am free from the burden of worry.",
  "I am constantly growing and evolving.",
  "I am proud of how far I've come.",
  "I am deserving of happiness.",
  "I am calm, centered, and focused.",
  "I am enough, exactly as I am.",
  "I am open to new possibilities.",
  "I am a magnet for peace and joy.",
  "I am the architect of my own happiness."
];

export const AffirmationCloud: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setIndex((prev) => (prev + newDirection + affirmations.length) % affirmations.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      paginate(1);
    }, 8000);
    return () => clearInterval(interval);
  }, [paginate]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9
    })
  };

  return (
    <div className="relative h-64 flex flex-col items-center justify-center overflow-hidden group">
      {/* Animated Background Elements */}
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute w-72 h-72 border border-indigo-100 dark:border-indigo-900/20 rounded-full opacity-30 pointer-events-none"
      />
      
      <div className="relative w-full flex-1 flex items-center justify-center px-12">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.4 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) > 50;
              if (swipe) {
                paginate(offset.x > 0 ? -1 : 1);
              }
            }}
            className="text-center cursor-grab active:cursor-grabbing select-none"
          >
            <Quote className="w-10 h-10 mx-auto mb-6 text-indigo-500 opacity-20" />
            <h3 className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-100 leading-tight italic px-4">
              "{affirmations[index]}"
            </h3>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button 
          onClick={() => paginate(-1)}
          className="absolute left-2 p-2 text-slate-300 hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft className="w-6 h-6 opacity-40" />
        </button>
        <button 
          onClick={() => paginate(1)}
          className="absolute right-2 p-2 text-slate-300 hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100"
        >
          <ChevronRight className="w-6 h-6 opacity-40" />
        </button>
      </div>

      {/* Spaced out dots */}
      <div className="pb-6 flex gap-2 z-10">
        {affirmations.map((_, i) => {
          // Only show a subset of dots if there are many, or just keep them small
          const isVisible = Math.abs(i - index) < 5;
          if (!isVisible) return null;
          
          return (
            <motion.div 
              key={i}
              animate={{
                width: i === index ? 16 : 4,
                backgroundColor: i === index ? '#818cf8' : '#e2e8f0'
              }}
              className="h-1 rounded-full"
            />
          );
        })}
      </div>
    </div>
  );
};
