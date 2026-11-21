import React from 'react';
import { Search, Bell, Settings, LogOut, ShieldCheck } from 'lucide-react';

export default function Header({
  searchQuery,
  setSearchQuery,
  currentUser,
  onLogout,
}) {
  const isHR = currentUser?.role === 'hr';

  return (
    <header className="h-20 bg-white border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Search Input Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={isHR ? "Search staff, skills (React, AWS), or projects..." : "Search company directory..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f4f5fa] border-none text-xs text-slate-700 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#452473]/20 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Team Avatars Group */}
        <div className="hidden lg:flex items-center -space-x-2">
          {['Aarav', 'Elena', 'Marcus', 'Kavita'].map((name, i) => (
            <div
              key={name}
              className={`w-7 h-7 rounded-full text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs ${
                i === 0 ? 'bg-[#ff5c8a]' : i === 1 ? 'bg-[#72c2ff]' : i === 2 ? 'bg-[#f59e0b]' : 'bg-[#452473]'
              }`}
              title={name}
            >
              {name[0]}
            </div>
          ))}
          <div className="w-7 h-7 rounded-full bg-[#452473] text-white text-[11px] font-bold flex items-center justify-center border-2 border-white shadow-xs cursor-pointer">
            +
          </div>
        </div>

        {/* Notification Bell */}
        <button className="relative p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ff5c8a]" />
        </button>

        {/* User Profile Info & Sign Out */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className={`w-9 h-9 rounded-full text-white font-bold flex items-center justify-center text-xs shadow-sm ${
            isHR ? 'bg-gradient-to-tr from-[#ff5c8a] to-[#452473]' : 'bg-gradient-to-tr from-cyan-500 to-blue-600'
          }`}>
            {currentUser?.name ? currentUser.name.split(' ').map((n) => n[0]).join('') : 'DH'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser?.name || 'Dylan Hunter'}</p>
            <p className="text-[10px] text-purple-700 font-bold">{isHR ? 'HR Admin' : 'Employee'}</p>
          </div>

          <button
            onClick={onLogout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition ml-1"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
