import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThoughtItem, PersonalizationEntry, PersonalizationData } from '../types';
import { generateNextPersonalizationQuestion } from '../services/insightService';
import { useNotification } from './Notification';
import { ChevronLeft, Sparkles, Send, Loader2, CheckCircle2, Brain } from 'lucide-react';
import { cn } from '../lib/utils';

interface PersonalizationTrainerProps {
  thoughts: ThoughtItem[];
  personalization: PersonalizationData;
  onBack: () => void;
  onSaveEntry: (entry: PersonalizationEntry) => void;
}

export const PersonalizationTrainer: React.FC<PersonalizationTrainerProps> = ({
  thoughts,
  personalization,
  onBack,
  onSaveEntry
}) => {
  const { showNotification } = useNotification();
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const entries = personalization?.entries || [];

  const fetchNextQuestion = async () => {
    setIsLoading(true);
    try {
      const question = await generateNextPersonalizationQuestion(thoughts, entries);
      setCurrentQuestion(question);
    } catch (error: any) {
      console.error(error);
      showNotification(error.message || "Failed to generate question", "error", true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNextQuestion();
  }, []);

  const handleSubmit = async () => {
    if (!answer.trim() || !currentQuestion) return;

    setIsSaving(true);
    const newEntry: PersonalizationEntry = {
      question: currentQuestion,
      answer: answer.trim(),
      timestamp: Date.now()
    };

    onSaveEntry(newEntry);
    setAnswer('');
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      fetchNextQuestion();
    }, 1500);
    
    setIsSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[120] bg-slate-50 dark:bg-slate-950 flex flex-col"
    >
      {/* Header */}
      <div className="py-4 px-6 flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-bold">MindAI Training</h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-start max-w-lg mx-auto w-full space-y-8 py-10">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center mx-auto">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
              <p className="text-sm text-slate-400 font-medium animate-pulse">MindAI is reflecting on your thoughts...</p>
            </motion.div>
          ) : showSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center space-y-4"
            >
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <p className="text-sm text-emerald-600 font-bold uppercase tracking-widest">Learned!</p>
            </motion.div>
          ) : (
            <motion.div
              key="question"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full space-y-8"
            >
              <div className="space-y-4 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  Question {entries.length + 1}
                </div>
                <h3 className="text-lg sm:text-xl font-bold leading-tight text-slate-800 dark:text-slate-100 text-balance max-w-[90%] mx-auto">
                  {currentQuestion}
                </h3>
              </div>

              <div className="relative">
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Your answer..."
                  className="w-full min-h-[120px] p-5 bg-white dark:bg-slate-900 rounded-[32px] border-none shadow-xl shadow-indigo-500/5 focus:ring-2 focus:ring-indigo-500 text-base sm:text-lg resize-none"
                  autoFocus
                />
                <button
                  onClick={handleSubmit}
                  disabled={!answer.trim() || isSaving}
                  className={cn(
                    "absolute bottom-4 right-4 p-4 rounded-2xl transition-all shadow-lg",
                    answer.trim() ? "bg-indigo-600 text-white scale-100" : "bg-slate-100 text-slate-400 scale-90"
                  )}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>

              <div className="flex justify-center gap-2">
                {Array.from({ length: Math.min(5, entries.length + 1) }).map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "h-1 rounded-full transition-all duration-500",
                      i === Math.min(4, entries.length) ? "w-8 bg-indigo-500" : "w-2 bg-slate-200 dark:bg-slate-800"
                    )} 
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="py-4 px-6 text-center">
        <div className="flex items-center justify-center gap-2 text-slate-400 mb-2">
          <Brain className="w-4 h-4 opacity-40" />
          <span className="text-xs font-medium">MindAI learns with every answer</span>
        </div>
        <p className="text-[10px] text-slate-300 uppercase tracking-widest">
          {entries.length} insights collected
        </p>
      </div>
    </motion.div>
  );
};
