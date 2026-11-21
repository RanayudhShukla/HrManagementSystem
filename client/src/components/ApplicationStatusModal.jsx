import React, { useState, useEffect } from 'react';
import { X, Search, CheckCircle, Clock, Video, UserCheck, Award, AlertCircle } from 'lucide-react';

export default function ApplicationStatusModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [matchedCandidate, setMatchedCandidate] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setQuery('aarav.sharma@example.com'); // helpful pre-fill for demo
      fetchCandidates('aarav.sharma@example.com');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const fetchCandidates = async (initialQuery) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/candidates');
      const data = await res.json();
      if (data.success) {
        setCandidates(data.data);
        const q = (initialQuery || query).trim().toLowerCase();
        const found = data.data.find(
          (c) => c.email.toLowerCase() === q || c.id.toLowerCase() === q
        );
        if (found) {
          setMatchedCandidate(found);
        } else if (initialQuery) {
          setMatchedCandidate(data.data[0] || null);
        }
      }
    } catch (err) {
      setError('Could not retrieve candidate records.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const q = query.trim().toLowerCase();
    const found = candidates.find(
      (c) => c.email.toLowerCase() === q || c.id.toLowerCase() === q
    );

    if (found) {
      setMatchedCandidate(found);
      setError('');
    } else {
      setMatchedCandidate(null);
      setError(`No application found for "${query}". Try searching "aarav.sharma@example.com" or ID "cand-001".`);
    }
  };

  const stages = [
    { label: 'Applied', key: 'Applied' },
    { label: 'Screening', key: 'Screening' },
    { label: 'Interview Scheduled', key: 'Interview Scheduled' },
    { label: 'Offer Decision', key: 'Offered' },
  ];

  const getStageIndex = (status) => {
    switch (status) {
      case 'Applied': return 0;
      case 'Screening': return 1;
      case 'Interview Scheduled': return 2;
      case 'Offered': return 3;
      case 'Rejected': return 1;
      default: return 0;
    }
  };

  const currentStageIndex = matchedCandidate ? getStageIndex(matchedCandidate.status) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <UserCheck className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">Track Candidate Application Status</h2>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Email (e.g. aarav.sharma@example.com) or Application ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition"
          >
            Track
          </button>
        </form>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {matchedCandidate && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block">Candidate Name</span>
                <span className="text-sm font-bold text-white">{matchedCandidate.fullName}</span>
                <span className="text-[11px] text-slate-400 block">{matchedCandidate.jobTitle}</span>
              </div>

              <div className="text-right">
                <span className="text-slate-400 block">Application ID</span>
                <span className="font-mono text-cyan-400 font-bold text-xs">{matchedCandidate.id}</span>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  matchedCandidate.status === 'Offered'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : matchedCandidate.status === 'Interview Scheduled'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-indigo-500/20 text-indigo-300'
                }`}>
                  {matchedCandidate.status}
                </span>
              </div>
            </div>

            {/* Stepper progress */}
            <div className="relative flex justify-between items-center px-4 pt-2">
              <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-0.5 bg-slate-800 z-0" />
              <div
                className="absolute top-1/2 left-8 -translate-y-1/2 h-0.5 bg-cyan-400 z-0 transition-all duration-500"
                style={{ width: `${(currentStageIndex / (stages.length - 1)) * 80}%` }}
              />

              {stages.map((stage, idx) => {
                const isPassed = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                return (
                  <div key={idx} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        isPassed
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      } ${isCurrent ? 'ring-4 ring-cyan-500/20' : ''}`}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className={`text-[10px] mt-2 font-medium text-center ${
                        isPassed ? 'text-cyan-300' : 'text-slate-500'
                      }`}
                    >
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Scheduled Interview Details Card */}
            {matchedCandidate.scheduledInterview && (
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-indigo-800/60 pb-2">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-cyan-400" /> Confirmed Interview Time
                  </span>
                  <span className="font-mono text-cyan-300">
                    {matchedCandidate.scheduledInterview.date} ({matchedCandidate.scheduledInterview.timeSlot})
                  </span>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>Panel Interviewer:</span>
                  <span className="font-medium text-white">{matchedCandidate.scheduledInterview.interviewer}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-400">Meeting Room:</span>
                  <a
                    href={matchedCandidate.scheduledInterview.meetLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-cyan-500 text-slate-950 font-bold text-[11px] hover:bg-cyan-400 transition"
                  >
                    <Video className="w-3.5 h-3.5" /> Join Google Meet
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
