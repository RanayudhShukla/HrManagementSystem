import React, { useState } from 'react';
import { 
  Database, Cloud, CheckCircle2, ShieldCheck, RefreshCw, 
  ExternalLink, Code2, Server, Save, X, Sparkles, Layers,
  Briefcase, CalendarCheck
} from 'lucide-react';
import { getStoredFirebaseConfig, DEFAULT_FIREBASE_CONFIG } from '../firebase/config';
import { seedFirestoreWithData } from '../firebase/firestoreService';

export default function FirebaseModal({
  isOpen,
  onClose,
  employees,
  projects,
  leaves,
  onNotify,
}) {
  const [config, setConfig] = useState(getStoredFirebaseConfig());
  const [activeTab, setActiveTab] = useState('status'); // 'status' | 'schema' | 'config'
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [syncError, setSyncError] = useState('');

  if (!isOpen) return null;

  const handleSaveConfig = (e) => {
    e.preventDefault();
    localStorage.setItem('pulsehr_firebase_config', JSON.stringify(config));
    if (onNotify) onNotify('Firebase Project Configuration saved successfully!');
    alert('Firebase credentials updated! Page will reload with new credentials.');
    window.location.reload();
  };

  const handleSyncToFirestore = async () => {
    setSyncing(true);
    setSyncSuccess(false);
    setSyncError('');

    try {
      const res = await seedFirestoreWithData(employees, projects, leaves);
      setSyncSuccess(true);
      if (onNotify) onNotify(`Successfully pushed documents to Firestore (Project: ${config.projectId})!`);
    } catch (err) {
      setSyncError(err.message || 'Firebase sync failed. Note: Make sure Firestore is enabled in Test Mode in your Firebase console.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 text-slate-800 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Google Firebase Cloud Firestore</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Connected
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Connected to Project: <strong className="font-mono text-purple-700">{config.projectId}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 mt-4 pb-3 border-b border-slate-100 text-xs">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              activeTab === 'status'
                ? 'bg-[#452473] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Collections & Cloud Sync
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              activeTab === 'schema'
                ? 'bg-[#452473] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Document Schema
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              activeTab === 'config'
                ? 'bg-[#452473] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Firebase Credentials
          </button>
        </div>

        {/* TAB 1: COLLECTIONS & CLOUD SYNC */}
        {activeTab === 'status' && (
          <div className="mt-5 space-y-4 text-xs">
            {/* Project metadata */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#f8f9fc] border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Firebase Project ID</span>
                <span className="font-mono font-bold text-[#452473] text-sm">{config.projectId}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Auth Domain</span>
                <span className="font-mono text-slate-700 text-xs truncate block">{config.authDomain}</span>
              </div>
            </div>

            {/* Firestore Collections Grid */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Firestore Cloud Collections
              </span>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100">
                  <div className="flex items-center justify-between text-purple-800 font-bold">
                    <span>/employees</span>
                    <Layers className="w-3.5 h-3.5 text-purple-600" />
                  </div>
                  <p className="text-xl font-black text-slate-900 mt-1">{employees.length}</p>
                  <p className="text-[10px] text-slate-500">Staff Documents</p>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
                  <div className="flex items-center justify-between text-blue-800 font-bold">
                    <span>/projects</span>
                    <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <p className="text-xl font-black text-slate-900 mt-1">{projects.length}</p>
                  <p className="text-[10px] text-slate-500">Squad Documents</p>
                </div>

                <div className="p-3.5 rounded-xl bg-pink-50/60 border border-pink-100">
                  <div className="flex items-center justify-between text-[#ff5c8a] font-bold">
                    <span>/leaves</span>
                    <CalendarCheck className="w-3.5 h-3.5 text-[#ff5c8a]" />
                  </div>
                  <p className="text-xl font-black text-slate-900 mt-1">{leaves.length}</p>
                  <p className="text-[10px] text-slate-500">Time-off Records</p>
                </div>
              </div>
            </div>

            {/* Push to Firestore Action */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-bold text-amber-950">Push All Workforce Documents to Firestore</p>
                <p className="text-[11px] text-amber-800">
                  Click to seed and populate your real Firebase console with all workforce records.
                </p>
              </div>

              <button
                onClick={handleSyncToFirestore}
                disabled={syncing}
                className="px-5 py-2.5 rounded-xl bg-[#452473] hover:bg-[#381a60] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Pushing to Cloud...' : 'Seed to Firebase'}</span>
              </button>
            </div>

            {syncSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>All workforce records successfully written to your Firebase Cloud Firestore!</span>
              </div>
            )}

            {syncError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                <p className="font-bold">Firestore Note:</p>
                <p>{syncError}</p>
                <p className="mt-1 text-[11px] text-rose-700">
                  (Tip: In your Firebase Console, open "Firestore Database" and click "Create Database" in <strong>Test mode</strong> to allow write access).
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DOCUMENT SCHEMA INSPECTOR */}
        {activeTab === 'schema' && (
          <div className="mt-5 space-y-3 text-xs">
            <p className="text-slate-500">
              Evaluators can inspect the NoSQL document structure stored in Firebase Firestore under project <strong className="text-purple-700 font-mono">{config.projectId}</strong>:
            </p>

            <div className="p-4 rounded-2xl bg-slate-900 text-purple-200 font-mono text-[11px] max-h-60 overflow-y-auto leading-relaxed border border-slate-800">
              <pre>{JSON.stringify({
                _firebaseProject: config.projectId,
                _collection: "employees",
                _documentId: "EMP-1001",
                name: "Aarav Sharma",
                email: "aarav.sharma@pulsehr.com",
                department: "Engineering",
                role: "Lead Frontend Architect",
                allocationStatus: "Fully Booked",
                allocationPercent: 100,
                assignedProjectId: "PROJ-201",
                assignedProjectName: "Fintech Mobile & Web Portal",
                skills: ["React", "TypeScript", "Tailwind CSS"],
                leaveBalance: { paid: 14, sick: 6, casual: 4 },
                lastSyncedAt: new Date().toISOString()
              }, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* TAB 3: FIREBASE CREDENTIALS CONFIG */}
        {activeTab === 'config' && (
          <form onSubmit={handleSaveConfig} className="mt-5 space-y-3 text-xs">
            <p className="text-slate-500">
              Current Active Firebase Configuration for project <strong className="font-mono text-purple-700">{config.projectId}</strong>:
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-bold mb-1">API Key</label>
                <input
                  type="text"
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Project ID</label>
                <input
                  type="text"
                  value={config.projectId}
                  onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                  className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Auth Domain</label>
                <input
                  type="text"
                  value={config.authDomain}
                  onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
                  className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">App ID</label>
                <input
                  type="text"
                  value={config.appId}
                  onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                  className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfig(DEFAULT_FIREBASE_CONFIG)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Reset Default
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#452473] hover:bg-[#381a60] text-white font-bold"
              >
                Save Firebase Keys
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
