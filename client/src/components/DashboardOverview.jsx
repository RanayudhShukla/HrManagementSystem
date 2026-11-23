import React from 'react';
import { 
  Users, Briefcase, CalendarCheck, Clock, CheckCircle2, 
  TrendingUp, FileText, CheckSquare, Coffee, AlertCircle, ArrowUpRight, Bell 
} from 'lucide-react';

export default function DashboardOverview({ stats, onNavigateToTab, notifications = [], employees = [] }) {
  if (!stats) return null;

  const hrNotifications = (Array.isArray(notifications) ? notifications : []).filter(
    (n) => n && (n.targetRole === 'hr' || n.targetRole === 'all')
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT & CENTER COLUMN (2 Cols) */}
      <div className="lg:col-span-2 space-y-6">
        {/* WIDGET 1: Employees Info Trend Card (Orange wave matching screenshot) */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Employees & Workforce Flow</h3>
              <p className="text-xs text-slate-400">Monthly staffing trajectory and resource utilization</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +12% Growth
            </span>
          </div>

          {/* SVG Smooth Wave Chart (Orange theme like the screenshot) */}
          <div className="relative h-44 w-full pt-2">
            <svg viewBox="0 0 700 160" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff7849" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#ff7849" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area fill */}
              <path
                d="M 0,110 C 100,105 150,80 230,85 C 310,90 350,50 420,55 C 500,60 550,95 620,90 C 660,88 700,92 700,92 L 700,160 L 0,160 Z"
                fill="url(#orangeGrad)"
              />

              {/* Stroke curve line */}
              <path
                d="M 0,110 C 100,105 150,80 230,85 C 310,90 350,50 420,55 C 500,60 550,95 620,90 C 660,88 700,92 700,92"
                fill="none"
                stroke="#ff7849"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Data points */}
              {[[0, 110], [140, 82], [280, 87], [420, 55], [560, 93], [700, 92]].map(([cx, cy], i) => (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r="5"
                  fill="#ffffff"
                  stroke="#ff7849"
                  strokeWidth="3"
                />
              ))}
            </svg>

            {/* Months labels */}
            <div className="flex justify-between text-[10px] sm:text-[11px] font-medium text-slate-400 mt-2 overflow-x-auto gap-2">
              <span>01 Jan</span>
              <span>31 Jan</span>
              <span>22 Feb</span>
              <span>15 Mar</span>
              <span>05 Apr</span>
              <span>26 Apr</span>
              <span>17 May</span>
              <span>08 Jun</span>
              <span>29 Jun</span>
            </div>
          </div>
        </div>

        {/* WIDGET 2 & 3: Employees Availability & Total Employees Donut Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sub-widget: Employees Availability (4 Boxes) */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Employees Availability</h3>

            <div className="grid grid-cols-2 gap-3.5">
              {/* Box 1: Attendance */}
              <div 
                onClick={() => onNavigateToTab('resources')}
                className="p-3.5 rounded-xl bg-[#f8f9fc] border border-slate-100 hover:border-slate-300 transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-slate-600 mb-2">
                  <CheckSquare className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-xs font-semibold text-slate-700">Attendance</p>
                <p className="text-lg font-black text-slate-900 mt-0.5">
                  {stats.fullyAllocated + stats.partiallyAllocated} Active
                </p>
              </div>

              {/* Box 2: Partial / Bench */}
              <div 
                onClick={() => onNavigateToTab('resources')}
                className="p-3.5 rounded-xl bg-[#f8f9fc] border border-slate-100 hover:border-slate-300 transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-slate-600 mb-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-xs font-semibold text-slate-700">Bench (Free)</p>
                <p className="text-lg font-black text-amber-600 mt-0.5">
                  {stats.benchCount} Avail
                </p>
              </div>

              {/* Box 3: Work Mode */}
              <div 
                onClick={() => onNavigateToTab('directory')}
                className="p-3.5 rounded-xl bg-[#f8f9fc] border border-slate-100 hover:border-slate-300 transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-slate-600 mb-2">
                  <Coffee className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-xs font-semibold text-slate-700">Hybrid / Remote</p>
                <p className="text-lg font-black text-slate-900 mt-0.5">
                  {stats.totalHeadcount} Staff
                </p>
              </div>

              {/* Box 4: Leave Apply */}
              <div 
                onClick={() => onNavigateToTab('leaves')}
                className="p-3.5 rounded-xl bg-[#f8f9fc] border border-slate-100 hover:border-slate-300 transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-slate-600 mb-2">
                  <FileText className="w-5 h-5 text-[#ff5c8a]" />
                </div>
                <p className="text-xs font-semibold text-slate-700">Leave Apply</p>
                <p className="text-lg font-black text-[#ff5c8a] mt-0.5">
                  {stats.pendingLeavesCount} Pending
                </p>
              </div>
            </div>
          </div>

          {/* Sub-widget: Total Employees Donut Chart (Pink & Blue) */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Total Employees</h3>
              <span className="text-xl font-extrabold text-slate-900 font-mono">
                {stats.totalHeadcount}
              </span>
            </div>

            {/* Circular Donut Graphic */}
            <div className="relative w-36 h-36 mx-auto my-3 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {/* Background Track */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#72c2ff"
                  strokeWidth="5"
                />
                {/* Pink Segment */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#ff5c8a"
                  strokeWidth="5.2"
                  strokeDasharray="60, 100"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs text-slate-400 font-medium">Headcount</span>
                <span className="text-lg font-black text-slate-800">{stats.totalHeadcount}</span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="flex items-center justify-center gap-6 text-xs font-semibold text-slate-500 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-3 h-3 rounded-full bg-[#ff5c8a]" /> Engineering (57%)
              </span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-3 h-3 rounded-full bg-[#72c2ff]" /> Design & Ops (43%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN (1 Col) - Deep Purple Highlight Card & Schedule List */}
      <div className="space-y-6">
        {/* DEEP PURPLE HERO CARD (Exact style from screenshot) */}
        <div className="p-6 rounded-2xl bg-[#452473] text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <p className="text-4xl font-black text-white tracking-tight">
              {stats.totalHeadcount * 150 + 24}
            </p>
            <p className="text-xs text-purple-200 mt-1 font-semibold">
              Total Applications & Candidate Records
            </p>
          </div>

          {/* Decorative faint background element */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/5 blur-xl pointer-events-none" />
        </div>

        {/* Quick KPI Metric Pills (Interviews & Hired) */}
        <div className="space-y-3">
          <div 
            onClick={() => onNavigateToTab('resources')}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:border-slate-300 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base font-black text-slate-800">
                  {stats.benchCount} Available
                </p>
                <p className="text-[11px] text-slate-400">Bench Capacity for Projects</p>
              </div>
            </div>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
              {stats.benchPercentage}% Free
            </span>
          </div>

          <div 
            onClick={() => onNavigateToTab('projects')}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:border-slate-300 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base font-black text-slate-800">
                  {stats.totalProjects} Active
                </p>
                <p className="text-[11px] text-slate-400">Client Staffed Deliverables</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
              Staffed
            </span>
          </div>
        </div>

        {/* UPCOMING SCHEDULE / RESOURCE ACTIVITY (As seen in bottom right of screenshot) */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Upcoming Resource Reviews</h3>

          <div className="space-y-3">
            {(Array.isArray(employees) && employees.length > 0 ? employees.filter(Boolean).slice(0, 4) : []).map((person, idx) => (
              <div key={person.id || idx} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-none">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full ${['bg-amber-400', 'bg-[#ff5c8a]', 'bg-[#72c2ff]', 'bg-[#452473]'][idx % 4]} text-white font-bold flex items-center justify-center text-[10px]`}>
                    {person.name ? person.name[0] : (person.id ? person.id[0] : 'E')}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{person.name || person.id || 'Staff Member'}</p>
                    <p className="text-[10px] text-slate-400">{person.role || person.department || 'Active Team Member'}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {idx === 0 ? '11:30 - 12:30' : idx === 1 ? '2:00 - 3:00' : idx === 2 ? '3:30 - 4:30' : '5:00 - 6:00'}
                </span>
              </div>
            ))}
            {(!employees || employees.length === 0) && (
              <div className="py-6 text-center text-xs text-slate-400">
                No active employee reviews. Onboard new employees in Directory.
              </div>
            )}
          </div>
        </div>

        {/* LIVE TEAM ACTIVITY & NOTIFICATIONS (Real-time connected stream) */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#ff5c8a]" />
              Live Team Activity & Alerts
            </h3>
            <span className="text-[10px] font-mono text-purple-700 bg-purple-50 font-bold px-2 py-0.5 rounded-full">
              Real-Time Feed
            </span>
          </div>

          <div className="space-y-2.5 max-h-64 overflow-y-auto">
            {hrNotifications.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No recent team activities recorded.</p>
            ) : (
              hrNotifications.slice(0, 5).map((n) => (
                <div key={n.id} className="p-3 rounded-xl bg-[#f8f9fc] border border-slate-100 flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">
                    {n.type === 'task_completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : n.type === 'leave_applied' ? (
                      <CalendarCheck className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Briefcase className="w-4 h-4 text-[#ff5c8a]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{n.title}</p>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">{n.timeAgo || 'Just now'}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{n.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
