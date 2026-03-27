import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  Home as HomeIcon, 
  Wind, 
  Plus, 
  Mic, 
  Sparkles, 
  ChevronLeft,
  Trash2,
  LayoutGrid,
  BrainCircuit,
  Timer as TimerIcon,
  Zap,
  RefreshCw
} from 'lucide-react';
import { callAI } from './services/aiClient';
import { MoodLogger } from './components/MoodLogger';
import { ThoughtItem, AppState, UserInsights, PersonalizationData, PersonalizationEntry, TimerSession, MoodEntry } from './types';
import { organizeThoughts, calculateOverwhelmScore, OrganizationResult } from './services/ai';
import { generateUserInsights } from './services/insightService';
import { OverwhelmCircle } from './components/OverwhelmCircle';
import { ThoughtCard } from './components/ThoughtCard';
import { BreathingExercise } from './components/BreathingExercise';
import { GroundingExercise } from './components/GroundingExercise';
import { AffirmationCloud } from './components/AffirmationCloud';
import { ReviewScreen } from './components/ReviewScreen';
import { ChatAgent } from './components/ChatAgent';
import { SettingsView } from './components/SettingsView';
import { PersonalizationTrainer } from './components/PersonalizationTrainer';
import { AuthenticTimer } from './components/AuthenticTimer';
import { Tutorial } from './components/Tutorial';
import { cn } from './lib/utils';

import { useNotification } from './components/Notification';

type View = 'home' | 'brain-dump' | 'organized' | 'calm' | 'settings' | 'training' | 'timer';

const STORAGE_KEY = 'clearmind_v2_data_v3';

export default function App() {
  const { showNotification } = useNotification();
  const [view, setView] = useState<View>('home');
  const [thoughts, setThoughts] = useState<ThoughtItem[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [overwhelmScore, setOverwhelmScore] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState<boolean | null>(null);
  const [userInsights, setUserInsights] = useState<UserInsights | undefined>();
  const [personalization, setPersonalization] = useState<PersonalizationData | undefined>();
  const [timerSessions, setTimerSessions] = useState<TimerSession[]>([]);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [isRefreshingInsights, setIsRefreshingInsights] = useState(false);
  const [quickTip, setQuickTip] = useState<string>("Your thoughts are like clouds passing in the sky. You are the sky, not the clouds.");
  
  // New states for review and chat
  const [reviewItems, setReviewItems] = useState<Partial<ThoughtItem>[] | null>(null);
  const [clarificationQuestion, setClarificationQuestion] = useState<string | null>(null);
  const [clarificationAnswer, setClarificationAnswer] = useState('');
  const [chatItem, setChatItem] = useState<ThoughtItem | null>(null);

  // Load data on mount
  useEffect(() => {
    const fetchNewTip = async () => {
      try {
        const text = await callAI({
          messages: [{ role: 'user', content: "Generate a short, calming, and insightful mental clarity tip or quote (max 15 words). Return only the text." }],
          systemInstruction: "You are a mindful assistant providing quick tips for mental clarity and peace."
        });
        if (text) {
          setQuickTip(text.trim().replace(/^"|"$/g, ''));
        }
      } catch (error) {
        console.error("Failed to fetch tip:", error);
      }
    };

    fetchNewTip();
    const interval = setInterval(fetchNewTip, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: AppState = JSON.parse(saved);
        // Auto-delete logic: remove items completed > 24 hours ago
        const now = Date.now();
        const dayInMs = 24 * 60 * 60 * 1000;
        const filteredThoughts = (parsed.thoughts || []).filter(t => {
          if (t.isCompleted && t.completedAt) {
            return (now - t.completedAt) < dayInMs;
          }
          return true;
        });
        
        setThoughts(filteredThoughts);
        setHasSeenTutorial(parsed.hasSeenTutorial ?? false);
        setUserInsights(parsed.userInsights);
        setPersonalization(parsed.personalization || { entries: [] });
        setTimerSessions(parsed.timerSessions || []);
        setMoodHistory(parsed.moodHistory || []);
      } catch (e) {
        console.error("Failed to load data", e);
        setHasSeenTutorial(false);
      }
    } else {
      setHasSeenTutorial(false);
      setPersonalization({ entries: [] });
    }
  }, []);

  // Save data & update score whenever thoughts or tutorial state changes
  useEffect(() => {
    if (hasSeenTutorial === null) return; // Don't save initial null state
    
    const state: AppState = {
      thoughts,
      overwhelmScore: calculateOverwhelmScore(thoughts),
      hasSeenTutorial,
      userInsights,
      personalization,
      timerSessions,
      moodHistory
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setOverwhelmScore(state.overwhelmScore);
  }, [thoughts, hasSeenTutorial, userInsights, personalization, timerSessions, moodHistory]);

  // Apply dark mode class
  // Auto-refresh insights when data changes significantly
  useEffect(() => {
    const entries = personalization?.entries || [];
    if (thoughts.length === 0 && entries.length === 0 && moodHistory.length === 0) return;
    
    // Debounce to avoid excessive calls
    const timer = setTimeout(async () => {
      try {
        const insights = await generateUserInsights(thoughts, entries, moodHistory);
        if (insights) {
          setUserInsights(insights);
        }
      } catch (error) {
        console.error("Auto-insight error:", error);
      }
    }, 5000); // 5 second debounce

    return () => clearTimeout(timer);
  }, [thoughts.length, personalization?.entries?.length, moodHistory.length]);

  const handleTutorialComplete = () => {
    setHasSeenTutorial(true);
  };

  const handleOrganize = async (context?: string) => {
    if (!input.trim()) return;
    setIsProcessing(true);
    try {
      const result: OrganizationResult = await organizeThoughts(input, context);
      if (result.clarificationQuestion && !context) {
        setClarificationQuestion(result.clarificationQuestion);
      } else {
        setReviewItems(result.items);
        setClarificationQuestion(null);
        setClarificationAnswer('');
      }
    } catch (error: any) {
      console.error(error);
      showNotification(error.message || "Failed to organize thoughts", "error", true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClarificationSubmit = () => {
    handleOrganize(clarificationAnswer);
  };

  const confirmReview = (finalItems: Partial<ThoughtItem>[]) => {
    const itemsWithIds: ThoughtItem[] = finalItems.map(item => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      isCompleted: false
    } as ThoughtItem));
    
    setThoughts(prev => [...itemsWithIds, ...prev]);
    setInput('');
    setReviewItems(null);
    setView('organized');
  };

  const toggleComplete = (id: string) => {
    setThoughts(prev => prev.map(t => {
      if (t.id === id) {
        const isCompleted = !t.isCompleted;
        return {
          ...t,
          isCompleted,
          completedAt: isCompleted ? Date.now() : undefined
        };
      }
      return t;
    }));
  };

  const deleteThought = (id: string) => {
    setThoughts(prev => prev.filter(t => t.id !== id));
  };

  const handleSavePersonalizationEntry = (entry: PersonalizationEntry) => {
    setPersonalization(prev => {
      const current = prev || { entries: [] };
      return {
        ...current,
        entries: [...(current.entries || []), entry]
      };
    });
  };

  const handleSaveTimerSession = (session: TimerSession) => {
    setTimerSessions(prev => [session, ...prev]);
    showNotification("Focus session recorded.", "success");
  };

  const handleSaveMood = (entry: MoodEntry) => {
    setMoodHistory(prev => [entry, ...prev]);
    showNotification("Mood logged successfully.", "success");
  };

  const handleClearMoodHistory = () => {
    setMoodHistory([]);
  };

  const handleClearTimerHistory = () => {
    setTimerSessions([]);
  };

  const clearAll = () => {
    if (confirm('Clear all thoughts?')) {
      setThoughts([]);
      setView('home');
    }
  };

  const handleRefreshInsights = async () => {
    const entries = personalization?.entries || [];
    if (thoughts.length === 0 && entries.length === 0 && moodHistory.length === 0) {
      showNotification("MindAI needs some data (thoughts, moods, or answers) to analyze your state.", "info", true);
      return;
    }
    setIsRefreshingInsights(true);
    try {
      const insights = await generateUserInsights(thoughts, entries, moodHistory);
      if (insights) {
        setUserInsights(insights);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsRefreshingInsights(false);
    }
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all app data? This cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  const renderHome = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="space-y-12"
    >
      {/* Brutalist Header Section */}
      <div className="relative pt-12 pb-8 border-b-2 border-slate-900 dark:border-white">
        <div className="absolute -top-4 -left-4 text-[120px] font-display opacity-[0.03] dark:opacity-[0.05] pointer-events-none select-none leading-none">
          {overwhelmScore}
        </div>
        <div className="flex flex-col items-start gap-2 relative z-10">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">Current Load Factor</span>
          <h2 className="text-7xl font-display uppercase leading-none tracking-tighter">
            {overwhelmScore}% <span className="text-indigo-600">Overwhelm</span>
          </h2>
          <p className="mt-4 text-slate-500 font-medium max-w-xs leading-relaxed">
            {overwhelmScore > 70 ? "You might be overwelhed, consider taking a break or using Calm Mode." :
             overwhelmScore > 30 ? "You're feeling a bit overwhelmed, but you can manage it." :
             "You're doing great! Keep up the good work."}
          </p>
        </div>
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-1 gap-4">
        {/* MindAI Overview Card */}
        {userInsights && (
          <motion.button 
            onClick={() => setView('settings')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-indigo-600 text-white rounded-[40px] text-left space-y-4 group active:scale-[0.98] transition-all shadow-xl shadow-indigo-500/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
            
            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-200" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-indigo-100 font-bold">MindAI Overview</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRefreshInsights();
                  }}
                  disabled={isRefreshingInsights}
                  className={cn(
                    "p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all",
                    isRefreshingInsights && "animate-spin"
                  )}
                >
                  <RefreshCw className="w-3 h-3 text-white" />
                </button>
                <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {userInsights.overwhelmTrend}
                </div>
              </div>
            </div>
            
            <div className="space-y-2 relative z-10">
              <h3 className="text-2xl font-display uppercase leading-tight">
                {userInsights.dominantCategory} <span className="text-indigo-200">Focus</span>
              </h3>
              <p className="text-sm text-indigo-50 leading-relaxed font-medium">
                {userInsights.summary}
              </p>
            </div>

            <div className="pt-4 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-indigo-200 relative z-10">
              <span>View detailed breakdown</span>
              <ChevronLeft className="w-3 h-3 rotate-180" />
            </div>
          </motion.button>
        )}

        {/* MindAI Training Card */}
        <motion.button 
          onClick={() => setView('training')}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-white rounded-[40px] text-left space-y-4 group active:scale-[0.98] transition-all relative overflow-hidden"
        >
          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-indigo-600" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">MindAI Personalization</span>
            </div>
            <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-indigo-600">
              {personalization?.entries?.length || 0} Insights
            </div>
          </div>
          
          <div className="space-y-2 relative z-10">
            <h3 className="text-2xl font-display uppercase leading-tight">
              Train <span className="text-indigo-600">Your MindAI</span>
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Teach MindAI about your stress triggers, goals, and values to get more precise support.
            </p>
          </div>

          <div className="pt-4 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-indigo-600 relative z-10">
            <span>Open Training Lab</span>
            <ChevronLeft className="w-3 h-3 rotate-180" />
          </div>
        </motion.button>

        <button 
          onClick={() => setView('brain-dump')}
          className="group relative flex items-center justify-between p-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[32px] overflow-hidden transition-all active:scale-[0.98]"
        >
          <div className="relative z-10 flex flex-col items-start text-left">
            <span className="font-mono text-[10px] uppercase tracking-widest opacity-60 mb-2">Primary Input</span>
            <h3 className="text-3xl font-display uppercase">Brain Dump</h3>
          </div>
          <div className="relative z-10 w-12 h-12 bg-white/10 dark:bg-black/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6" />
          </div>
          {/* Decorative Element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16" />
        </button>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setView('timer')}
            className="flex flex-col items-start p-6 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-white rounded-[32px] transition-all active:scale-95"
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center mb-4">
              <TimerIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-1">Analog</span>
            <span className="font-bold text-lg">Focus Timer</span>
          </button>

          <button 
            onClick={() => setView('calm')}
            className="flex flex-col items-start p-6 bg-white dark:bg-slate-900 border-2 border-slate-900 dark:border-white rounded-[32px] transition-all active:scale-95"
          >
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center mb-4">
              <Wind className="w-5 h-5 text-white" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-1">Recovery</span>
            <span className="font-bold text-lg">Calm Mode</span>
          </button>
        </div>
      </div>

      {thoughts.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-2">
            <h3 className="font-display text-2xl uppercase tracking-tight">Recent Buffer</h3>
            <button onClick={() => setView('organized')} className="font-mono text-[10px] uppercase tracking-widest text-indigo-500 font-bold">Access All</button>
          </div>
          <div className="space-y-3">
            {thoughts.slice(0, 3).map(item => (
              <ThoughtCard 
                key={item.id} 
                item={item} 
                onToggleComplete={toggleComplete}
                onDelete={deleteThought}
                onChat={setChatItem}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderBrainDump = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[60] bg-white dark:bg-slate-950 p-6 flex flex-col"
    >
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setView('home')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold">Brain Dump</h2>
      </div>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What's on your mind? Type everything out—tasks, worries, random ideas..."
          className="w-full flex-1 p-6 bg-slate-50 dark:bg-slate-900 rounded-[32px] border-none focus:ring-2 focus:ring-indigo-500 resize-none text-lg leading-relaxed text-slate-900 dark:text-slate-100 transition-all duration-300"
          autoFocus
        />
        <div className="absolute bottom-6 right-6 flex gap-3">
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={() => handleOrganize()}
          disabled={isProcessing || !input.trim()}
          className={cn(
            "w-full py-5 rounded-[24px] font-bold text-white shadow-xl transition-all flex items-center justify-center gap-2",
            isProcessing ? "bg-slate-400" : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]"
          )}
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Organizing...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Organize My Thoughts
            </>
          )}
        </button>
      </div>
    </motion.div>
  );

  const renderOrganized = () => {
    const controllable = thoughts.filter(t => t.controllable);
    const uncontrollable = thoughts.filter(t => !t.controllable);

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setView('home')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold">Your Clarity</h2>
          </div>
          <button onClick={clearAll} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <h3 className="font-bold text-slate-500 uppercase tracking-wider text-xs">Within Your Control</h3>
            </div>
            <div className="space-y-4">
              {controllable.length > 0 ? (
                controllable.map(item => (
                  <ThoughtCard 
                    key={item.id} 
                    item={item} 
                    onToggleComplete={toggleComplete}
                    onDelete={deleteThought}
                    onChat={setChatItem}
                  />
                ))
              ) : (
                <p className="text-slate-400 text-sm italic">Nothing here yet.</p>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-slate-400 rounded-full" />
              <h3 className="font-bold text-slate-500 uppercase tracking-wider text-xs">Outside Your Control</h3>
            </div>
            <div className="space-y-4">
              {uncontrollable.length > 0 ? (
                uncontrollable.map(item => (
                  <ThoughtCard 
                    key={item.id} 
                    item={item} 
                    onToggleComplete={toggleComplete}
                    onDelete={deleteThought}
                    onChat={setChatItem}
                  />
                ))
              ) : (
                <p className="text-slate-400 text-sm italic">Nothing here yet.</p>
              )}
            </div>
          </section>
        </div>
      </motion.div>
    );
  };

  const [calmTab, setCalmTab] = useState<'breathing' | 'grounding' | 'affirmations'>('breathing');

  const renderCalm = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="space-y-8 text-center relative"
    >
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/4 -left-1/4 w-full h-full bg-indigo-100/30 dark:bg-indigo-900/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{
            scale: [1, 1.5, 1],
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/4 -right-1/4 w-full h-full bg-emerald-100/30 dark:bg-emerald-900/10 rounded-full blur-3xl"
        />
      </div>

      <div className="flex items-center gap-4 text-left relative z-10">
        <button onClick={() => setView('home')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold">Calm Mode</h2>
      </div>

      {/* Tab Switcher */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl relative z-10">
        {(['breathing', 'grounding', 'affirmations'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setCalmTab(tab)}
            className={cn(
              "flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all",
              calmTab === tab 
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-[40px] shadow-xl border border-slate-100 dark:border-slate-800 relative z-10 min-h-[400px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {calmTab === 'breathing' && (
            <motion.div key="breathing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <BreathingExercise />
            </motion.div>
          )}
          {calmTab === 'grounding' && (
            <motion.div key="grounding" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <GroundingExercise />
            </motion.div>
          )}
          {calmTab === 'affirmations' && (
            <motion.div key="affirmations" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <AffirmationCloud />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 gap-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl text-left border border-slate-100 dark:border-slate-700"
        >
          <h4 className="font-bold text-indigo-600 dark:text-indigo-400 mb-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Quick Tip
          </h4>
          <p className="text-slate-600 dark:text-slate-400 text-sm italic">
            "{quickTip}"
          </p>
        </motion.div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-sans selection:bg-indigo-100">
      <AnimatePresence>
        {hasSeenTutorial === false && (
          <Tutorial onComplete={handleTutorialComplete} />
        )}
        {reviewItems && (
          <ReviewScreen 
            items={reviewItems} 
            onConfirm={confirmReview} 
            onCancel={() => setReviewItems(null)} 
          />
        )}
        {chatItem && (
          <ChatAgent 
            item={chatItem} 
            personalization={personalization}
            onClose={() => setChatItem(null)} 
          />
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 py-8 pb-32">
        <header className="flex justify-between items-center mb-12">
          <button 
            onClick={() => setView('home')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-12 h-12 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center shadow-2xl">
              <Zap className="w-7 h-7 text-white dark:text-slate-900" />
            </div>
            <div className="flex flex-col items-start -space-y-1">
              <h1 className="text-2xl font-display uppercase tracking-tighter text-slate-900 dark:text-white">ClearMindV2</h1>
              <span className="font-mono text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em]">Lets clear your mind.</span>
            </div>
          </button>
          
          <div className="flex items-center gap-3">
          </div>
        </header>

        <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-12">
          <main>
            <AnimatePresence mode="wait">
              {view === 'home' && renderHome()}
              {view === 'brain-dump' && renderBrainDump()}
              {view === 'organized' && renderOrganized()}
              {view === 'calm' && renderCalm()}
              {view === 'timer' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-4">
                    <button onClick={() => setView('home')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h2 className="text-2xl font-bold">Focus Engine</h2>
                  </div>
                  <AuthenticTimer 
                    sessions={timerSessions}
                    onSaveSession={handleSaveTimerSession}
                    onClearHistory={handleClearTimerHistory}
                  />
                </motion.div>
              )}
              {view === 'settings' && (
                <SettingsView 
                  insights={userInsights}
                  personalization={personalization}
                  onBack={() => setView('home')}
                  onRefreshInsights={handleRefreshInsights}
                  onClearData={handleClearData}
                  onStartTraining={() => setView('training')}
                  isRefreshing={isRefreshingInsights}
                />
              )}
            </AnimatePresence>
          </main>

          <AnimatePresence>
            {view === 'home' && (
              <motion.aside
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="hidden lg:block space-y-8"
              >
                <MoodLogger 
                  onSaveMood={handleSaveMood}
                  moodHistory={moodHistory}
                  onClearHistory={handleClearMoodHistory}
                />
                
                <div className="bg-slate-50 dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Quick Stats</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Total Thoughts</span>
                      <span className="font-mono font-bold">{thoughts.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Focus Sessions</span>
                      <span className="font-mono font-bold">{timerSessions.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Mood Logs</span>
                      <span className="font-mono font-bold">{moodHistory.length}</span>
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Mood Logger Trigger */}
        <AnimatePresence>
          {view === 'home' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="lg:hidden mt-12 space-y-8"
            >
              <MoodLogger 
                onSaveMood={handleSaveMood}
                moodHistory={moodHistory}
                onClearHistory={handleClearMoodHistory}
              />

              <div className="bg-slate-50 dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">System Stats</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-display text-indigo-600">{thoughts.length}</p>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400">Thoughts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-display text-indigo-600">{timerSessions.length}</p>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400">Focus</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-display text-indigo-600">{moodHistory.length}</p>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400">Moods</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {view === 'training' && (
            <PersonalizationTrainer
              thoughts={thoughts}
              personalization={personalization || { entries: [] }}
              onBack={() => setView('settings')}
              onSaveEntry={handleSavePersonalizationEntry}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {clarificationQuestion && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[60] flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-8 shadow-2xl space-y-6"
              >
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">MindAI needs clarity</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {clarificationQuestion}
                  </p>
                </div>
                <input 
                  type="text"
                  value={clarificationAnswer}
                  onChange={(e) => setClarificationAnswer(e.target.value)}
                  placeholder="Tell me more..."
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none text-sm focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button 
                    onClick={() => setClarificationQuestion(null)}
                    className="flex-1 py-3 text-sm font-bold text-slate-400"
                  >
                    Skip
                  </button>
                  <button 
                    onClick={handleClarificationSubmit}
                    disabled={!clarificationAnswer.trim() || isProcessing}
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-sm bg-slate-900/90 dark:bg-white/90 backdrop-blur-xl border border-white/10 dark:border-black/10 rounded-[32px] p-2 flex justify-around shadow-2xl z-50">
          <button 
            onClick={() => setView('home')}
            className={cn(
              "p-4 rounded-2xl transition-all active:scale-90", 
              view === 'home' 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/40" 
                : "text-slate-500 hover:text-slate-300 dark:hover:text-slate-700"
            )}
          >
            <HomeIcon className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setView(view === 'organized' ? 'home' : 'organized')}
            className={cn(
              "p-4 rounded-2xl transition-all active:scale-90", 
              view === 'organized' 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/40" 
                : "text-slate-500 hover:text-slate-300 dark:hover:text-slate-700"
            )}
          >
            <LayoutGrid className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setView(view === 'timer' ? 'home' : 'timer')}
            className={cn(
              "p-4 rounded-2xl transition-all active:scale-90", 
              view === 'timer' 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/40" 
                : "text-slate-500 hover:text-slate-300 dark:hover:text-slate-700"
            )}
          >
            <TimerIcon className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setView(view === 'calm' ? 'home' : 'calm')}
            className={cn(
              "p-4 rounded-2xl transition-all active:scale-90", 
              view === 'calm' 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/40" 
                : "text-slate-500 hover:text-slate-300 dark:hover:text-slate-700"
            )}
          >
            <Wind className="w-6 h-6" />
          </button>
        </nav>
      </div>
    </div>
  );
}
