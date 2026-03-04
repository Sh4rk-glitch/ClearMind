import React from 'react';
import { motion } from 'motion/react';
import { ThoughtItem } from '../types';
import { AlertCircle, Clock, Zap, CheckCircle2, XCircle, ArrowRight, MessageSquare, Trash2, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface ThoughtCardProps {
  item: ThoughtItem;
  onToggleComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
  onChat?: (item: ThoughtItem) => void;
}

export const ThoughtCard: React.FC<ThoughtCardProps> = ({ item, onToggleComplete, onDelete, onChat }) => {
  const getCategoryIcon = () => {
    switch (item.category) {
      case 'urgent': return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case 'long-term': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'worry': return <Zap className="w-4 h-4 text-amber-500" />;
      case 'reminder': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'outside-control': return <XCircle className="w-4 h-4 text-slate-400" />;
      default: return null;
    }
  };

  const isTask = item.category === 'urgent' || item.category === 'long-term' || item.category === 'reminder';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border transition-all duration-300 group",
        item.isCompleted 
          ? "border-emerald-100 dark:border-emerald-900/30 opacity-60" 
          : "border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50"
      )}
    >
      <div className="flex gap-4">
        {isTask && onToggleComplete && (
          <button 
            onClick={() => onToggleComplete(item.id)}
            className={cn(
              "w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all mt-1",
              item.isCompleted 
                ? "bg-emerald-500 border-emerald-500 text-white" 
                : "border-slate-200 dark:border-slate-700 hover:border-indigo-500"
            )}
          >
            {item.isCompleted && <Check className="w-3 h-3" />}
          </button>
        )}

        <div className="flex-1 space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              {getCategoryIcon()}
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {item.category.replace('-', ' ')}
              </span>
            </div>
            <div className={cn(
              "flex items-center gap-1 transition-opacity",
              item.isCompleted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}>
              {onChat && (
                <button 
                  onClick={() => onChat(item)}
                  className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                </button>
              )}
              {onDelete && (
                <button 
                  onClick={() => onDelete(item.id)}
                  className={cn(
                    "p-1.5 rounded-lg transition-all",
                    item.isCompleted 
                      ? "text-rose-500 bg-rose-50 dark:bg-rose-900/20 shadow-sm animate-pulse" 
                      : "text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                  )}
                >
                  <Trash2 className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                </button>
              )}
            </div>
          </div>

          <p className={cn(
            "text-slate-700 dark:text-slate-200 font-medium leading-relaxed",
            item.isCompleted && "line-through text-slate-400"
          )}>
            {item.text}
          </p>

          {item.actionPlan && item.controllable && !item.isCompleted && (
            <div className="pt-2 border-t border-slate-50 dark:border-slate-800">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
                <ArrowRight className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase">Next Step</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {item.actionPlan.nextStep}
              </p>
              <div className="flex gap-3 mt-2">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 opacity-40" /> {item.actionPlan.timeEstimate}
                </span>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded",
                  item.actionPlan.difficulty === 'easy' ? "bg-emerald-50 text-emerald-600" :
                  item.actionPlan.difficulty === 'medium' ? "bg-amber-50 text-amber-600" :
                  "bg-rose-50 text-rose-600"
                )}>
                  {item.actionPlan.difficulty.toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
