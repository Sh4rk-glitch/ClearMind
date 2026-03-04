import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

type NotificationType = 'info' | 'success' | 'error' | 'warning';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  persistent?: boolean;
}

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationType, persistent?: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((message: string, type: NotificationType = 'info', persistent: boolean = false) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, message, type, persistent }]);
    
    if (!persistent) {
      // Auto-remove after 5 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 5000);
    }
  }, []);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-md w-full pointer-events-none">
        <AnimatePresence mode="popLayout">
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md ${
                n.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-200' :
                n.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200' :
                n.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-200' :
                'bg-zinc-800/80 border-white/10 text-zinc-100'
              }`}
            >
              <div className="mt-0.5">
                {n.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
                {n.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {n.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-400" />}
                {n.type === 'info' && <Info className="w-5 h-5 text-indigo-400" />}
              </div>
              
              <div className="flex-1 flex flex-col gap-2">
                <div className="text-sm font-medium leading-relaxed">
                  {n.message}
                </div>
                <button
                  onClick={() => removeNotification(n.id)}
                  className="self-end px-3 py-1 text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  Okay
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
