import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserInsights, PersonalizationData } from '../types';
import { ChevronLeft, Brain, Sparkles, TrendingUp, TrendingDown, Minus, RefreshCw, Moon, Sun, Trash2, ShieldCheck, UserCircle, Save } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

interface SettingsViewProps {
  insights?: UserInsights;
  personalization?: PersonalizationData;
  onBack: () => void;
  onRefreshInsights: () => void;
  onClearData: () => void;
  onStartTraining: () => void;
  isRefreshing: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  insights, 
  personalization,
  onBack, 
  onRefreshInsights, 
  onClearData,
  onStartTraining,
  isRefreshing
}) => {
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingDown className="w-5 h-5 text-emerald-500" />;
      case 'increasing': return <TrendingUp className="w-5 h-5 text-rose-500" />;
      default: return <Minus className="w-5 h-5 text-slate-400" />;
    }
  };

  const entriesCount = personalization?.entries?.length || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="space-y-8 pb-12"
    >
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold">MindAI Profile</h2>
      </div>

      {/* Insights Card */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">User Insights</h3>
          <button 
            onClick={onRefreshInsights}
            disabled={isRefreshing}
            className={cn(
              "p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full transition-all",
              isRefreshing && "animate-spin opacity-50"
            )}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {insights ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200 dark:shadow-none">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-lg">MindAI's Summary</h4>
                <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                  <ReactMarkdown>{insights.summary}</ReactMarkdown>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Dominant Focus</span>
                <p className="text-sm font-bold capitalize text-indigo-600 dark:text-indigo-400">
                  {insights.dominantCategory.replace('-', ' ')}
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Overwhelm Trend</span>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold capitalize">{insights.overwhelmTrend}</p>
                  {getTrendIcon(insights.overwhelmTrend)}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
              <span className="text-[10px] text-slate-400">
                Last updated: {new Date(insights.lastUpdated).toLocaleDateString()} {new Date(insights.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase">
                <ShieldCheck className="w-3 h-3" /> Analysis Complete
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="p-12 text-center bg-slate-50 dark:bg-slate-900 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-800">
            <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-4" />
            <p className="text-sm text-slate-400 font-medium">
              Add thoughts or answer personalization questions to generate your MindAI profile.
            </p>
            <button 
              onClick={onRefreshInsights}
              className="mt-4 text-xs font-bold text-indigo-500 uppercase tracking-widest"
            >
              Analyze Now
            </button>
          </div>
        )}
      </section>

      {/* Personalization Section */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">MindAI Personalization</h3>
        
        <button 
          onClick={onStartTraining}
          className="w-full p-6 bg-indigo-600 rounded-[32px] text-white shadow-xl shadow-indigo-500/20 flex items-center justify-between group active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-lg">Train MindAI</p>
              <p className="text-xs text-indigo-100">{entriesCount} insights collected</p>
            </div>
          </div>
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
            <ChevronLeft className="w-5 h-5 rotate-180" />
          </div>
        </button>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Answer personalized questions to help MindAI understand your goals, stress triggers, and values. The more you train it, the better it can support you.
          </p>
        </div>
      </section>

      {/* App Settings */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">App Settings</h3>
        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="relative">
            <button 
              onClick={() => setShowConfirmClear(true)}
              className="w-full p-4 flex items-center gap-3 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/20 rounded-xl flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-rose-500">Clear All Data</p>
                <p className="text-[10px] text-slate-400">Reset your MindAI experience</p>
              </div>
            </button>

            <AnimatePresence>
              {showConfirmClear && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute inset-0 bg-white dark:bg-slate-900 flex items-center justify-between px-4 z-10"
                >
                  <p className="text-xs font-bold text-rose-500">Are you absolutely sure?</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowConfirmClear(false)}
                      className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={onClearData}
                      className="px-3 py-1.5 bg-rose-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-rose-200 dark:shadow-none"
                    >
                      Confirm
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <div className="text-center pt-8">
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">ClearMind v2.0</p>
      </div>
    </motion.div>
  );
};
