import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Bell, Settings, LogOut, CheckCircle2, 
  Briefcase, CalendarCheck, AlertCircle, Check, Trash2, X, Cloud, Database, Menu 
} from 'lucide-react';

export default function Header({
  searchQuery,
  setSearchQuery,
  currentUser,
  onLogout,
  notifications = [],
  onMarkRead,
  onMarkAllRead,
  onClearAll,
  employees = [],
  onOpenFirebaseModal,
  firestoreConnected = false,
  onToggleMobileMenu,
}) {
  const isHR = currentUser?.role === 'hr';
  const employeeId = currentUser?.employee?.id;

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter notifications relevant to current session role
  const relevantNotifications = notifications.filter((n) => {
    if (isHR) {
      return n.targetRole === 'hr' || n.targetRole === 'all';
    } else {
      return n.targetRole === 'all' || n.targetEmployeeId === employeeId;
    }
  });

  const unreadCount = relevantNotifications.filter((n) => !n.read).length;

  const getNotifIcon = (type) => {
    switch (type) {
      case 'task_completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'project_assigned':
        return <Briefcase className="w-4 h-4 text-[#ff5c8a] shrink-0" />;
      case 'leave_applied':
      case 'leave_approved':
      case 'leave_rejected':
        return <CalendarCheck className="w-4 h-4 text-amber-500 shrink-0" />;
      default:
        return <Bell className="w-4 h-4 text-purple-500 shrink-0" />;
    }
  };

  return (
    <header className="h-16 sm:h-20 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 shadow-xs select-none">
      {/* Left: Mobile Menu Toggle & Search Bar */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 mr-2 sm:mr-4">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={onToggleMobileMenu}
          className="p-2 -ml-1 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 md:hidden transition shrink-0 active:scale-95"
          title="Open Navigation Menu"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Input Bar */}
        <div className="flex-1 max-w-xs sm:max-w-md min-w-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder={isHR ? "Search staff, skills, or projects..." : "Search company directory..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f4f5fa] border-none text-xs text-slate-700 rounded-xl pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-[#452473]/20 placeholder:text-slate-400 truncate"
            />
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Real-time Google Cloud Firestore Live Badge & Modal Trigger */}
        <button
          onClick={onOpenFirebaseModal}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-amber-50/80 hover:bg-amber-100/90 border border-amber-200/80 text-amber-900 text-xs font-semibold transition active:scale-95 shadow-xs shrink-0"
          title="Google Cloud Firestore (hrsystem-b0734) - Click to inspect live database"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <Cloud className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="hidden sm:inline font-mono text-[11px] font-bold">Firestore Sync</span>
        </button>

        {/* Team Avatars Group (Desktop only) */}
        <div className="hidden lg:flex items-center -space-x-2">
          {employees.slice(0, 4).map((emp, i) => (
            <div
              key={emp.id || emp.name}
              className={`w-7 h-7 rounded-full text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs ${
                i === 0 ? 'bg-[#ff5c8a]' : i === 1 ? 'bg-[#72c2ff]' : i === 2 ? 'bg-[#f59e0b]' : 'bg-[#452473]'
              }`}
              title={`${emp.name} (${emp.id || ''})`}
            >
              {(emp.name || 'E')[0]}
            </div>
          ))}
          {employees.length > 4 && (
            <div className="w-7 h-7 rounded-full bg-[#452473] text-white text-[11px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
              +{employees.length - 4}
            </div>
          )}
        </div>

        {/* Real-Time Notification Bell Popover */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition active:scale-95"
            title="Activity Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#ff5c8a] text-white text-[10px] font-black flex items-center justify-center shadow-xs animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Floating Dropdown Drawer */}
          {showNotifMenu && (
            <div className="absolute right-0 mt-3 w-72 sm:w-96 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95 z-50">
              {/* Dropdown Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {isHR ? 'HR Team Alerts' : 'My Work Updates'}
                  </h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-pink-100 text-[#ff5c8a] text-[10px] font-bold">
                      {unreadCount} New
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  {unreadCount > 0 && (
                    <button
                      onClick={() => onMarkAllRead && onMarkAllRead(isHR ? 'hr' : 'employee', employeeId)}
                      className="text-purple-700 hover:text-purple-900 font-semibold"
                    >
                      Mark all read
                    </button>
                  )}
                  {relevantNotifications.length > 0 && (
                    <button
                      onClick={() => onClearAll && onClearAll(isHR ? 'hr' : 'employee', employeeId)}
                      className="text-slate-400 hover:text-rose-600 transition p-1"
                      title="Clear notifications"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 py-1 space-y-1">
                {relevantNotifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
                    <p className="font-semibold text-slate-600">All caught up!</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">No new notifications at this time.</p>
                  </div>
                ) : (
                  relevantNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => onMarkRead && onMarkRead(notif.id)}
                      className={`p-3 rounded-xl transition cursor-pointer flex items-start gap-3 ${
                        notif.read ? 'bg-white hover:bg-slate-50 opacity-75' : 'bg-purple-50/50 hover:bg-purple-50/80 border border-purple-100/60'
                      }`}
                    >
                      <div className="mt-0.5 p-1.5 rounded-lg bg-white border border-slate-200/80 shadow-xs">
                        {getNotifIcon(notif.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-bold text-slate-800 truncate">{notif.title}</p>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">{notif.timeAgo || 'Just now'}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>

                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-[#ff5c8a] mt-1.5 shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Info & Sign Out */}
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-slate-200">
          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0 ${
            isHR ? 'bg-gradient-to-tr from-[#ff5c8a] to-[#452473]' : 'bg-gradient-to-tr from-cyan-500 to-blue-600'
          }`}>
            {currentUser?.name ? currentUser.name.split(' ').map((n) => n[0]).join('') : 'R'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser?.name || 'Ranayudh'}</p>
            <p className="text-[10px] text-purple-700 font-bold">{isHR ? 'HR Admin' : 'Employee'}</p>
          </div>

          <button
            onClick={onLogout}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
