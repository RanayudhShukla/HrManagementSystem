import React from 'react';
import { 
  ClipboardCheck, LayoutDashboard, Users, TrendingUp, Briefcase, 
  CalendarCheck, UserCheck, LogOut, CheckSquare, Calendar, IndianRupee 
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  pendingLeavesCount,
  currentUser,
  onLogout,
}) {
  const isHR = currentUser?.role === 'hr';

  const hrMenuItems = [
    { id: 'dashboard', label: 'HR Dashboard', icon: LayoutDashboard },
    { id: 'resources', label: 'Employees Availability', icon: TrendingUp },
    { id: 'directory', label: 'Employees Directory', icon: Users },
    { id: 'projects', label: 'Projects & Staffing', icon: Briefcase },
    { 
      id: 'leaves', 
      label: 'Leave Approvals', 
      icon: CalendarCheck,
      badge: pendingLeavesCount > 0 ? pendingLeavesCount : null,
    },
  ];

  const employeeMenuItems = [
    { id: 'tasks', label: 'Assigned Tasks & Work', icon: CheckSquare },
    { id: 'holidays', label: 'Indian Holidays 2026', icon: Calendar, badge: '17' },
    { id: 'leaves', label: 'Leave Requests', icon: CalendarCheck },
    { id: 'payroll', label: 'CTC & Compensation (INR)', icon: IndianRupee },
  ];

  return (
    <aside className="w-64 bg-[#452473] text-white flex flex-col shrink-0 min-h-screen border-r border-[#3a1b63] shadow-xl select-none">
      {/* Brand Header */}
      <div className="h-20 flex items-center gap-3 px-6 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-white text-[#452473] flex items-center justify-center font-bold shadow-md">
          <ClipboardCheck className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
            <span>Co-Operate</span>
            <span className="text-[#ff5c8a]">HRMS</span>
          </h1>
          <p className="text-[10px] text-purple-200/70 font-medium">Enterprise Resource Portal</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        {isHR ? (
          <>
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-purple-200/50 font-mono">
              HR Administration
            </div>

            {hrMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#ff5c8a] text-white shadow-lg shadow-pink-600/30'
                      : 'text-purple-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-purple-200'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </>
        ) : (
          /* Employee Workspace */
          <>
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-purple-200/50 font-mono">
              Employee Self-Service (ESS)
            </div>

            {employeeMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#ff5c8a] text-white shadow-lg shadow-pink-600/30'
                      : 'text-purple-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-purple-200'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </>
        )}
      </div>

      {/* Bottom Profile / Quick Info & Logout Button */}
      <div className="p-4 border-t border-white/10 bg-[#3d1e67]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full text-white font-bold flex items-center justify-center text-xs shadow-xs ${
              isHR ? 'bg-gradient-to-tr from-pink-500 to-purple-400' : 'bg-gradient-to-tr from-cyan-500 to-blue-600'
            }`}>
              {currentUser?.name ? currentUser.name.split(' ').map((n) => n[0]).join('') : 'DH'}
            </div>
            <div className="truncate max-w-[130px]">
              <p className="text-xs font-bold text-white truncate">{currentUser?.name || 'Dylan Hunter'}</p>
              <p className="text-[10px] text-purple-200/70 truncate">{currentUser?.title || (isHR ? 'HR Admin' : 'Employee')}</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-500/20 text-purple-200 hover:text-rose-300 transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
