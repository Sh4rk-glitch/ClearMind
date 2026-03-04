import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThoughtItem } from '../types';
import { ThoughtCard } from './ThoughtCard';
import { Check, X, Sparkles, AlertCircle } from 'lucide-react';

interface ReviewScreenProps {
  items: Partial<ThoughtItem>[];
  onConfirm: (finalItems: Partial<ThoughtItem>[]) => void;
  onCancel: () => void;
}

export const ReviewScreen: React.FC<ReviewScreenProps> = ({ items, onConfirm, onCancel }) => {
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set(items.map((_, i) => i)));

  const toggleItem = (index: number) => {
    const next = new Set(selectedItems);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelectedItems(next);
  };

  const handleConfirm = () => {
    const final = items.filter((_, i) => selectedItems.has(i));
    onConfirm(final);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/4359/4359295.png" 
              alt="Sparkles" 
              className="w-6 h-6 invert brightness-0" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h2 className="text-xl font-black">Review Results</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Select items to keep</p>
          </div>
        </div>
        <button onClick={onCancel} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
          <img 
            src="https://cdn-icons-png.flaticon.com/512/1828/1828778.png" 
            alt="Close" 
            className="w-6 h-6 opacity-40" 
            referrerPolicy="no-referrer"
          />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/564/564619.png" 
              alt="Alert" 
              className="w-12 h-12 opacity-20" 
              referrerPolicy="no-referrer"
            />
            <p className="text-slate-500">No items were extracted. Try being more descriptive.</p>
          </div>
        ) : (
          items.map((item, i) => (
            <div key={i} className="relative group">
              <div 
                onClick={() => toggleItem(i)}
                className={`absolute -left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer z-10 ${
                  selectedItems.has(i) 
                    ? "bg-indigo-600 border-indigo-600 text-white scale-110" 
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-transparent"
                }`}
              >
                <Check className="w-4 h-4" />
              </div>
              <div className={`transition-all pl-8 ${selectedItems.has(i) ? "opacity-100" : "opacity-40 grayscale scale-95"}`}>
                <ThoughtCard item={item as ThoughtItem} />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-6 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={handleConfirm}
          disabled={selectedItems.size === 0}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          Add {selectedItems.size} {selectedItems.size === 1 ? 'Item' : 'Items'} to My Mind
        </button>
      </div>
    </div>
  );
};
