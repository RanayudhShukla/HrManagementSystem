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
      const saved = localStorage.getItem('pulsehr_employees');
      if (saved) {
        const parsed = JSON.parse(saved);
        const cleaned = (Array.isArray(parsed) ? parsed : [])
          .filter((e) => !['EMP-1001', 'EMP-1002', 'EMP-1003', 'EMP-1004', 'EMP-1005', 'EMP-1006', 'EMP-1007', 'EMP-1008'].includes(e.id) && !['Aarav Sharma', 'Elena Rostova', 'Marcus Vance', 'Kavita Verma', 'David Chen', 'Sarah Miller', 'Vikram Malhotra', 'Vikram Batra'].includes(e.name))
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
            <button
              onClick={this.handleReset}
              className="w-full py-3 rounded-xl bg-[#452473] hover:bg-[#381a60] text-white font-bold text-xs shadow-md transition active:scale-95"
            >
              Reset Session & Reload Application
            </button>
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
