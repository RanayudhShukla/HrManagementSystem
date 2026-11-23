import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Co-Operate HRMS Runtime Error Boundary caught:', error, errorInfo);
  }

  handleReset = () => {
    try {
      sessionStorage.clear();
      localStorage.removeItem('pulsehr_auth');
      localStorage.removeItem('pulsehr_leaves');
      localStorage.removeItem('pulsehr_projects');
      localStorage.removeItem('cooperate_notifications');
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('pulsehr_tasks_') || k.startsWith('pulsehr_') || k.startsWith('cooperate_'))) {
          localStorage.removeItem(k);
        }
      }
      const saved = localStorage.getItem('pulsehr_employees');
      if (saved) {
        const parsed = JSON.parse(saved);
        const legacyNames = ['aarav sharma', 'elena rostova', 'marcus vance', 'kavita verma', 'david chen', 'sarah miller', 'vikram malhotra', 'vikram batra'];
        const cleaned = (Array.isArray(parsed) ? parsed : [])
          .filter((e) => e && typeof e === 'object' && e.name && !legacyNames.includes((e.name || '').trim().toLowerCase()) && !(e.email || '').toLowerCase().includes('@pulsehr.com'))
          .map((e) => ({
            ...e,
            skills: Array.isArray(e.skills)
              ? e.skills
              : typeof e.skills === 'string'
              ? e.skills.split(',').map((s) => s.trim()).filter(Boolean)
              : ['General'],
          }));
        localStorage.setItem('pulsehr_employees', JSON.stringify(cleaned));
      }
    } catch {}
    window.location.reload();
  };

  handleHardReset = () => {
    try {
      sessionStorage.clear();
      localStorage.clear();
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f4f5fa] flex items-center justify-center p-6 text-slate-800 font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-2xl font-bold">
              ⚠️
            </div>
            <h2 className="text-xl font-bold text-slate-900">Session Resynchronization Required</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Co-Operate HRMS encountered an unexpected client state transition. Click below to safely reset active session cache and restore your dashboard.
            </p>
            <div className="space-y-2 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full py-3 rounded-xl bg-[#452473] hover:bg-[#381a60] text-white font-bold text-xs shadow-md transition active:scale-95"
              >
                Reset Session & Reload Application
              </button>
              <button
                onClick={this.handleHardReset}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition active:scale-95"
              >
                Clear All Local Cache & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
