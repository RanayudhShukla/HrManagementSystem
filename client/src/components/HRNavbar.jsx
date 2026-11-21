import React from 'react';
import { Briefcase, Users, Calendar, ShieldCheck, UserCheck, Search, Sparkles } from 'lucide-react';

export default function HRNavbar({
  currentView,
  setCurrentView,
  searchQuery,
  setSearchQuery,
  onOpenTracker,
  onOpenAvailability,
}) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Brand */}
          <div
            onClick={() => setCurrentView('careers')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500 via-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-white">HIRE</span>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                  FLOW
                </span>
              </div>
              <p className="text-[11px] font-mono tracking-wider text-slate-400 uppercase">
                HR Recruitment & Scheduling
              </p>
            </div>
          </div>

          {/* Search bar in Careers View */}
          {currentView === 'careers' && (
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search jobs by title, department, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 text-xs text-slate-200 rounded-full pl-10 pr-4 py-2.5 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 placeholder:text-slate-500 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-slate-200"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Action Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Availability & Book Slot Button */}
            {currentView === 'careers' && (
              <button
                onClick={onOpenAvailability}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-cyan-300 hover:text-white bg-cyan-950/50 border border-cyan-800/60 rounded-xl hover:bg-cyan-900/50 transition"
              >
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>HR Availability</span>
              </button>
            )}

            {/* Candidate Application Tracker */}
            <button
              onClick={onOpenTracker}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition"
            >
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Track Application</span>
            </button>

            {/* Recruiter / HR Dashboard Toggle Switch */}
            <button
              onClick={() => setCurrentView(currentView === 'careers' ? 'hr' : 'careers')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                currentView === 'hr'
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25 shadow-md shadow-amber-500/20'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
              }`}
            >
              {currentView === 'hr' ? (
                <>
                  <Briefcase className="w-4 h-4 text-cyan-400" />
                  <span>Exit HR Portal</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>HR Recruiter Portal</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {currentView === 'careers' && (
          <div className="pb-3 md:hidden">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search job roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
