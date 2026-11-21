import React from 'react';
import { Building2, Users, User, ShieldCheck, Search, Clock, CheckCircle } from 'lucide-react';

export default function Navbar({
  currentView,
  setCurrentView,
  searchQuery,
  setSearchQuery,
  selectedEmployee,
  setSelectedEmployee,
  employees,
}) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo */}
          <div
            onClick={() => setCurrentView('hr')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-white">CO-OPERATE</span>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  HRMS
                </span>
              </div>
              <p className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                Workforce & Resource Allocation Portal
              </p>
            </div>
          </div>

          {/* Global Search Bar (HR mode) */}
          {currentView === 'hr' && (
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search employees, skills (e.g. React, AWS), or roles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700/80 text-xs text-slate-200 rounded-full pl-10 pr-4 py-2.5 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 placeholder:text-slate-500 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Perspective Switcher & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* If in Employee mode, show employee selector dropdown */}
            {currentView === 'employee' && employees && employees.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-400">Acting as:</span>
                <select
                  value={selectedEmployee?.id || ''}
                  onChange={(e) => {
                    const found = employees.find((emp) => emp.id === e.target.value);
                    if (found) setSelectedEmployee(found);
                  }}
                  className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id} className="bg-slate-900 text-white">
                      {emp.name} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* View Mode Toggle: HR Executive View vs Employee ESS */}
            <button
              onClick={() => setCurrentView(currentView === 'hr' ? 'employee' : 'hr')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                currentView === 'employee'
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-600/30 shadow-md shadow-indigo-600/20'
                  : 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 hover:bg-cyan-400 shadow-md shadow-cyan-500/20'
              }`}
            >
              {currentView === 'hr' ? (
                <>
                  <User className="w-4 h-4 text-slate-950" />
                  <span>Switch to Employee Portal</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>Switch to HR Executive Suite</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {currentView === 'hr' && (
          <div className="pb-3 md:hidden">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff, skills..."
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
