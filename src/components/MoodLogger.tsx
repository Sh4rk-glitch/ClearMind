import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mood, MoodEntry } from '../types';
import { Smile, Frown, Meh, Zap, Battery, CloudRain, Send, History, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface MoodLoggerProps {
  onSaveMood: (entry: MoodEntry) => void;
  moodHistory: MoodEntry[];
  onClearHistory: () => void;
}

const moodConfig: Record<Mood, { icon: any; color: string; label: string }> = {
  calm: { icon: Meh, color: 'text-emerald-500 bg-emerald-50', label: 'Calm' },
  focused: { icon: Zap, color: 'text-indigo-500 bg-indigo-50', label: 'Focused' },
  anxious: { icon: CloudRain, color: 'text-amber-500 bg-amber-50', label: 'Anxious' },
  overwhelmed: { icon: Frown, color: 'text-rose-500 bg-rose-50', label: 'Overwhelmed' },
  energetic: { icon: Smile, color: 'text-yellow-500 bg-yellow-50', label: 'Energetic' },
  tired: { icon: Battery, color: 'text-slate-500 bg-slate-50', label: 'Tired' },
};

export const MoodLogger: React.FC<MoodLoggerProps> = ({ onSaveMood, moodHistory, onClearHistory }) => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [note, setNote] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const handleSubmit = () => {
    if (!selectedMood) return;
    onSaveMood({
      id: Math.random().toString(36).substr(2, 9),
      mood: selectedMood,
      note: note.trim() || undefined,
      timestamp: Date.now(),
    });
    setSelectedMood(null);
    setNote('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h3 className="text-xl font-display uppercase tracking-tight">Mood Logger</h3>
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">How are you feeling right now?</p>
          </div>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
          >
            <History className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {(Object.entries(moodConfig) as [Mood, typeof moodConfig['calm']][]).map(([mood, config]) => (
            <button
              key={mood}
              onClick={() => setSelectedMood(mood)}
              className={cn(
                "flex flex-col items-center justify-center p-4 rounded-2xl transition-all border-2",
                selectedMood === mood 
                  ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 scale-105" 
                  : "border-transparent bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <config.icon className={cn("w-6 h-6 mb-2", config.color.split(' ')[0])} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{config.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence>
          {selectedMood && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800"
            >
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a quick note (optional)..."
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none text-sm focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={2}
              />
              <button
                onClick={handleSubmit}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Log Mood
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6"
          >
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Mood History</h4>
              <button 
                onClick={onClearHistory}
                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {moodHistory.length > 0 ? (
                moodHistory.map((entry) => {
                  const config = moodConfig[entry.mood];
                  return (
                    <div key={entry.id} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                      <div className={cn("p-2 rounded-xl", config.color.split(' ')[1])}>
                        <config.icon className={cn("w-5 h-5", config.color.split(' ')[0])} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{config.label}</span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {entry.note && <p className="text-sm text-slate-600 dark:text-slate-300">{entry.note}</p>}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center py-8 text-sm text-slate-400 italic">No mood logs yet.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
