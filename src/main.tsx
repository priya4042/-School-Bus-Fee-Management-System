import React, { StrictMode, Component } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Error Boundary Component
interface EBProps { children: React.ReactNode }
interface EBState { hasError: boolean }

class ErrorBoundary extends (Component as any) {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'sans-serif' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Something went wrong</h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>We've encountered an unexpected error.</p>
            <button onClick={() => window.location.reload()} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
