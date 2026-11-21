import React from 'react';
import { Calendar, CheckCircle2, Clock, Video, Users, Sparkles } from 'lucide-react';

export default function HRHero({ onExploreJobs, onCheckAvailability }) {
  return (
    <div className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-900/60 via-slate-950 to-slate-950 pt-12 pb-16">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[320px] bg-gradient-to-tr from-indigo-600/15 via-cyan-600/10 to-blue-600/10 blur-3xl pointer-events-none rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top HR Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-700/60 text-indigo-300 text-xs font-mono mb-6">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Next-Gen Talent Acquisition & Automated Availability Scheduler</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Where Top Talent Meets{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-blue-400 bg-clip-text text-transparent">
            Instant Interview Availability
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
          Skip the endless email tag. Browse high-impact engineering, design, and product roles, submit your application, and book an interview slot directly on recruiter calendars.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onExploreJobs}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wide transition shadow-lg shadow-cyan-500/20 active:scale-95"
          >
            Explore Open Positions
          </button>

          <button
            onClick={onCheckAvailability}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs transition flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>View Recruiter Availability Slots</span>
          </button>
        </div>

        {/* 4 Feature Highlights */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto pt-8 border-t border-slate-800/80 text-left">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Live Availability</p>
              <p className="text-[11px] text-slate-400">Real-time HR slots</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">1-Click Meet Link</p>
              <p className="text-[11px] text-slate-400">Auto-generated links</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">48h SLA Response</p>
              <p className="text-[11px] text-slate-400">Fast-track feedback</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/40 border border-slate-800">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Recruitment Pipeline</p>
              <p className="text-[11px] text-slate-400">End-to-end ATS stages</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
