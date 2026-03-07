import {StrictMode, Component, ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import { NotificationProvider } from './components/Notification';

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-slate-500 mb-6">The app encountered an unexpected error.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg"
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </ErrorBoundary>
  </StrictMode>,
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) return;
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content is available; please refresh.
              console.log('New content is available; please refresh.');
              // We could show a notification here, but auto-reload is often what users want for simple apps
              window.location.reload();
            }
          }
        };
      };
    }).catch(err => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}
