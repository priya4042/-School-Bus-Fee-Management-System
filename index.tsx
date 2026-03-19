
import React from 'react';
import ReactDOM from 'react-dom/client';
import './src/index.css';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';

// Capture the PWA install prompt as early as possible (before React mounts)
// so the Topbar component can always retrieve it from window.__pwaInstallPrompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  (window as any).__pwaInstallPrompt = e;
  // Notify any already-mounted listeners
  window.dispatchEvent(new Event('pwainstallready'));
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Register service worker so the app is installable (PWA) on phone, tablet, laptop, PC
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((reg) => console.log('[SW] Registered, scope:', reg.scope))
      .catch((err) => console.warn('[SW] Registration failed:', err));
  });
}
