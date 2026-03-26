import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, History, Trash2, CheckCircle2, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNotification } from './Notification';
import { TimerSession } from '../types';

interface AuthenticTimerProps {
  onSaveSession: (session: TimerSession) => void;
  sessions: TimerSession[];
  onClearHistory: () => void;
}

export const AuthenticTimer: React.FC<AuthenticTimerProps> = ({ onSaveSession, sessions, onClearHistory }) => {
  const { showNotification } = useNotification();
  const [task, setTask] = useState('');
  const [focusDuration, setFocusDuration] = useState(25); // in minutes
  const [breakDuration, setBreakDuration] = useState(5); // in minutes
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [showHistory, setShowHistory] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (mode === 'focus' && task.trim()) {
        onSaveSession({
          id: Math.random().toString(36).substr(2, 9),
          task: task.trim(),
          duration: focusDuration * 60,
          timestamp: Date.now()
        });
      }
      setIsActive(false);
      // Reset for next
      if (mode === 'focus') {
        setMode('break');
        setTimeLeft(breakDuration * 60);
      } else {
        setMode('focus');
        setTimeLeft(focusDuration * 60);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, mode, task, onSaveSession, focusDuration, breakDuration]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentMaxTime = mode === 'focus' ? focusDuration * 60 : breakDuration * 60;
  const progress = timeLeft / currentMaxTime;

  const handleManualSave = () => {
    if (!task.trim()) {
      showNotification("Manual entry required: Please define your objective.", "error");
      return;
    }
    onSaveSession({
      id: Math.random().toString(36).substr(2, 9),
      task: task.trim(),
      duration: focusDuration * 60,
      timestamp: Date.now()
    });
    setTask('');
    setTimeLeft(focusDuration * 60);
    setMode('focus');
  };

  const adjustDuration = (type: 'focus' | 'break', delta: number) => {
    if (isActive) return;
    if (type === 'focus') {
      const next = Math.max(1, focusDuration + delta);
      setFocusDuration(next);
      if (mode === 'focus') setTimeLeft(next * 60);
    } else {
      const next = Math.max(1, breakDuration + delta);
      setBreakDuration(next);
      if (mode === 'break') setTimeLeft(next * 60);
    }
  };

  return (
    <div className="space-y-6">
      {/* Technical Dashboard Container */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
        <div className="relative z-10 space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isActive ? "bg-indigo-600 animate-pulse" : "bg-slate-300 dark:bg-slate-700"
              )} />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">
                {isActive ? 'Timer Running' : 'Ready'}
              </span>
            </div>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400"
            >
              <History className="w-5 h-5" />
            </button>
          </div>

          {/* Timer Display */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-64 h-64 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle 
                  cx="128" cy="128" r="120" 
                  fill="none" 
                  stroke="currentColor" 
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth="2" 
                />
                <motion.circle 
                  cx="128" cy="128" r="120" 
                  fill="none" 
                  stroke={mode === 'focus' ? '#4f46e5' : '#10b981'}
                  strokeWidth="4" 
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "753.98", strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: 753.98 * (1 - progress) }}
                  transition={{ duration: 1, ease: "linear" }}
                />
              </svg>
              
              <div className="text-center relative">
                <div className="text-6xl font-display uppercase tracking-tighter tabular-nums">
                  {formatTime(timeLeft)}
                </div>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest",
                    mode === 'focus' ? "bg-indigo-100 text-indigo-600" : "bg-emerald-100 text-emerald-600"
                  )}>
                    {mode}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Duration Adjusters */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">Focus Time</span>
              <div className="flex items-center justify-between">
                <span className="text-xl font-display">{focusDuration}m</span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => adjustDuration('focus', -5)}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-30"
                    disabled={isActive}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => adjustDuration('focus', 5)}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-30"
                    disabled={isActive}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">Break Time</span>
              <div className="flex items-center justify-between">
                <span className="text-xl font-display">{breakDuration}m</span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => adjustDuration('break', -1)}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-30"
                    disabled={isActive}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => adjustDuration('break', 1)}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-30"
                    disabled={isActive}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Task Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 px-1">
              Objective
            </label>
            <input 
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="What are you working on?"
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all font-sans text-sm"
              disabled={isActive}
            />
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            {timeLeft === 0 && mode === 'focus' ? (
              <button 
                onClick={handleManualSave}
                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                Record Session
              </button>
            ) : (
              <>
                <button 
                  onClick={() => setIsActive(!isActive)}
                  className={cn(
                    "flex-1 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                    isActive 
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" 
                      : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
                  )}
                >
                  {isActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  {isActive ? 'Pause' : 'Start'}
                </button>
                <button 
                  onClick={() => {
                    setIsActive(false);
                    setTimeLeft(mode === 'focus' ? focusDuration * 60 : breakDuration * 60);
                  }}
                  className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-2xl transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* History Drawer */}
      <AnimatePresence>
        {showHistory && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6"
          >
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Session Logs</h4>
              <button 
                onClick={onClearHistory}
                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {sessions.length > 0 ? (
                sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                    <div className="space-y-1">
                      <p className="text-sm font-bold">{session.task}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(session.timestamp).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] font-mono text-indigo-500 font-bold">
                          {Math.floor(session.duration / 60)}M
                        </span>
                      </div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-sm text-slate-400 italic">No sessions recorded.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
