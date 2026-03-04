import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThoughtItem, PersonalizationData } from '../types';
import { callAI, AIMessage } from '../services/aiClient';
import { X, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatAgentProps {
  item: ThoughtItem;
  personalization?: PersonalizationData;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export const ChatAgent: React.FC<ChatAgentProps> = ({ item, personalization, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: `Hi! I'm your clarity assistant. How can I help you with: **"${item.text}"**?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const personalizationContext = personalization ? `
      User Personalization History:
      ${(personalization.entries || []).map(e => `Q: ${e.question}\nA: ${e.answer}`).join('\n')}
      ` : '';

      const systemInstruction = `You are a mental clarity assistant. The user is asking for help with a specific thought/task: "${item.text}". 
      Category: ${item.category}. 
      Controllable: ${item.controllable ? 'Yes' : 'No'}.
      Next step suggested: ${item.actionPlan?.nextStep || 'None'}.
      ${personalizationContext}
      
      Provide empathetic, actionable, and concise advice. Use Markdown formatting (bold, lists, headers) to make your response easy to read. Help them break it down further or reframe their worry. 
      If personalization info is available, use it to tailor your advice (e.g., if they prefer actionable steps, be very direct; if they have specific stress triggers, acknowledge them).`;

      const aiMessages: AIMessage[] = messages.map(m => ({
        role: m.role,
        content: m.text
      }));
      aiMessages.push({ role: 'user', content: userMsg });

      const responseText = await callAI({
        messages: aiMessages,
        systemInstruction
      });

      setMessages(prev => [...prev, { role: 'assistant', text: responseText || "I'm sorry, I couldn't process that." }]);
    } catch (error: any) {
      console.error("Chat Error:", error);
      const errorMsg = error.message || "I'm having trouble connecting right now.";
      setMessages(prev => [...prev, { role: 'assistant', text: `${errorMsg} Please check your server console for details.` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[110] bg-white dark:bg-slate-950 flex flex-col"
    >
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black">Clarity Agent</h2>
            <p className="text-xs text-slate-400 font-bold truncate max-w-[200px]">{item.text}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-6 h-6 opacity-40" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                msg.role === 'user' ? 'bg-indigo-100' : 'bg-slate-100 dark:bg-slate-800'
              }`}>
                {msg.role === 'user' ? (
                  <User className="w-4 h-4 text-indigo-600 opacity-60" />
                ) : (
                  <Bot className="w-4 h-4 text-slate-600 dark:text-slate-400 opacity-60" />
                )}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-800'
              }`}>
                <div className="markdown-body prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 items-center text-slate-400">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              </div>
              <span className="text-xs italic">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask for help or advice..."
            className="w-full py-4 pl-6 pr-14 bg-slate-50 dark:bg-slate-900 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-3 bg-indigo-600 text-white rounded-xl disabled:bg-slate-300 transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
