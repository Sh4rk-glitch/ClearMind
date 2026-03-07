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
  BrainCircuit
} from 'lucide-react';
import { callAI } from './services/aiClient';
import { ThoughtItem, AppState, UserInsights, PersonalizationData, PersonalizationEntry } from './types';
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
import { Tutorial } from './components/Tutorial';
import { cn } from './lib/utils';

import { useNotification } from './components/Notification';

type View = 'home' | 'brain-dump' | 'organized' | 'calm' | 'settings' | 'training';

const STORAGE_KEY = 'clearmind_v2_data';

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
      personalization
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setOverwhelmScore(state.overwhelmScore);
  }, [thoughts, hasSeenTutorial, userInsights, personalization]);

  // Apply dark mode class
  // Auto-refresh insights when data changes significantly
  useEffect(() => {
    const entries = personalization?.entries || [];
    if (thoughts.length === 0 && entries.length === 0) return;
    
    // Debounce to avoid excessive calls
    const timer = setTimeout(async () => {
      try {
        const insights = await generateUserInsights(thoughts, entries);
        if (insights) {
          setUserInsights(insights);
        }
      } catch (error) {
        console.error("Auto-insight error:", error);
      }
    }, 5000); // 5 second debounce

    return () => clearTimeout(timer);
  }, [thoughts.length, personalization?.entries?.length]);

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

  const clearAll = () => {
    if (confirm('Clear all thoughts?')) {
      setThoughts([]);
      setView('home');
    }
  };

  const handleRefreshInsights = async () => {
    const entries = personalization?.entries || [];
    if (thoughts.length === 0 && entries.length === 0) {
      showNotification("Add some thoughts or answer personalization questions for MindAI to analyze your habits.", "info", true);
      return;
    }
    setIsRefreshingInsights(true);
    try {
      const insights = await generateUserInsights(thoughts, entries);
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
      className="space-y-8"
    >
      <div className="flex flex-col items-center pt-8">
        <OverwhelmCircle score={overwhelmScore} />
        <p className="mt-4 text-slate-500 text-sm text-center max-w-[200px]">
          {overwhelmScore > 70 ? "You're carrying a lot. Let's offload some of it." :
           overwhelmScore > 30 ? "A bit busy today. Want to organize?" :
           "Your mind seems clear. Great job!"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setView('brain-dump')}
          className="flex flex-col items-center justify-center p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-800 transition-all active:scale-95 hover:shadow-xl hover:shadow-indigo-500/10"
        >
          <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-indigo-200 dark:shadow-none">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-indigo-900 dark:text-indigo-100">Brain Dump</span>
        </button>

        <button 
          onClick={() => setView('calm')}
          className="flex flex-col items-center justify-center p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl border border-emerald-100 dark:border-emerald-800 transition-all active:scale-95 hover:shadow-xl hover:shadow-emerald-500/10"
        >
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-emerald-200 dark:shadow-none">
            <Wind className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-emerald-900 dark:text-emerald-100">Calm Mode</span>
        </button>
      </div>

      {thoughts.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Thoughts</h3>
            <button onClick={() => setView('organized')} className="text-indigo-500 text-sm font-medium">View All</button>
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

      <div className="max-w-md mx-auto px-6 py-8 pb-24">
        <header className="flex justify-between items-center mb-8">
          <button 
            onClick={() => setView('home')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">ClearMind</h1>
          </button>
          <button 
            onClick={() => setView(view === 'settings' ? 'home' : 'settings')}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all",
              view === 'settings' 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            )}
          >
             <Sparkles className={cn("w-5 h-5", view === 'settings' ? "text-white" : "text-slate-400")} />
          </button>
        </header>

        <main>
          <AnimatePresence mode="wait">
            {view === 'home' && renderHome()}
            {view === 'brain-dump' && renderBrainDump()}
            {view === 'organized' && renderOrganized()}
            {view === 'calm' && renderCalm()}
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
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-xs bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-full p-2 flex justify-around shadow-2xl z-50">
          <button 
            onClick={() => setView('home')}
            className={cn(
              "p-3 rounded-full transition-all active:scale-90", 
              view === 'home' 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            )}
          >
            <HomeIcon className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setView(view === 'organized' ? 'home' : 'organized')}
            className={cn(
              "p-3 rounded-full transition-all active:scale-90", 
              view === 'organized' 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            )}
          >
            <LayoutGrid className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setView(view === 'calm' ? 'home' : 'calm')}
            className={cn(
              "p-3 rounded-full transition-all active:scale-90", 
              view === 'calm' 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            )}
          >
            <Wind className="w-6 h-6" />
          </button>
        </nav>
      </div>
    </div>
  );
}
