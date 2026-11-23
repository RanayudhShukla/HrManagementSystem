import React, { useState, useEffect } from 'react';
import { 
  User, CalendarCheck, Clock, Briefcase, Plus, CheckCircle2, 
  AlertCircle, Send, Shield, Zap, Sparkles, CheckSquare, 
  Square, Calendar, Banknote, MapPin, Building2, 
  Award, FileText, ChevronRight, Filter
} from 'lucide-react';
import { SEED_TASKS } from '../data/seedData';
import { 
  getFirestoreTasks, subscribeToFirestoreTasks, syncTaskToFirestore, deleteTaskFromFirestore 
} from '../firebase/firestoreService';

export default function EmployeePortal({
  employee,
  leaves = [],
  projects = [],
  onLeaveSubmitted,
  activeSubTab: controlledSubTab,
  onSubTabChange,
  notifications = [],
  onTaskCompleted,
  onLeaveApplied,
}) {
  const [clockedIn, setClockedIn] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [internalSubTab, setInternalSubTab] = useState('tasks'); // 'tasks' | 'holidays' | 'leaves' | 'payroll'
  
  const activeSubTab = controlledSubTab || internalSubTab;
  const setActiveSubTab = (tab) => {
    setInternalSubTab(tab);
    if (onSubTabChange) onSubTabChange(tab);
  };
  
  const [holidayFilter, setHolidayFilter] = useState('all'); // 'all' | 'national' | 'upcoming'
  
  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  // New task form state
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    projectName: employee?.assignedProjectName || 'General Deliverables',
    priority: 'Medium',
    deadline: '2026-12-05',
    estimatedHours: '8 hrs',
    category: 'Feature Development'
  });

  // Leave form state
  const [newLeave, setNewLeave] = useState({
    leaveType: 'Paid Time Off',
    startDate: '2026-12-01',
    endDate: '2026-12-02',
    daysCount: 2,
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Official Corporate Public & Gazetted Holidays 2026
  const corporateHolidays2026 = [
    { date: '2026-01-26', day: 'Monday', name: 'Republic Day (Gantantra Diwas)', type: 'National Holiday', mandatory: true },
    { date: '2026-02-15', day: 'Sunday', name: 'Maha Shivratri', type: 'Gazetted Holiday', mandatory: false },
    { date: '2026-03-03', day: 'Tuesday', name: 'Holi (Festival of Colours)', type: 'Gazetted Holiday', mandatory: true },
    { date: '2026-03-21', day: 'Saturday', name: 'Id-ul-Fitr (Ramzan Eid)', type: 'Gazetted Holiday', mandatory: true },
    { date: '2026-03-31', day: 'Tuesday', name: 'Mahavir Jayanti', type: 'Gazetted Holiday', mandatory: false },
    { date: '2026-04-03', day: 'Friday', name: 'Good Friday', type: 'Gazetted Holiday', mandatory: true },
    { date: '2026-05-01', day: 'Friday', name: 'Buddha Purnima / May Day', type: 'Gazetted Holiday', mandatory: false },
    { date: '2026-05-27', day: 'Wednesday', name: 'Id-ul-Zuha (Bakrid)', type: 'Gazetted Holiday', mandatory: true },
    { date: '2026-06-26', day: 'Friday', name: 'Muharram', type: 'Gazetted Holiday', mandatory: false },
    { date: '2026-08-15', day: 'Saturday', name: 'Independence Day (Swatantrata Diwas)', type: 'National Holiday', mandatory: true },
    { date: '2026-09-04', day: 'Friday', name: 'Janmashtami', type: 'Gazetted Holiday', mandatory: false },
    { date: '2026-09-24', day: 'Thursday', name: 'Milad-un-Nabi (Eid-e-Milad)', type: 'Gazetted Holiday', mandatory: false },
    { date: '2026-10-02', day: 'Friday', name: 'Mahatma Gandhi Jayanti', type: 'National Holiday', mandatory: true },
    { date: '2026-10-20', day: 'Tuesday', name: 'Dussehra (Vijayadashami)', type: 'Gazetted Holiday', mandatory: true },
    { date: '2026-11-08', day: 'Sunday', name: 'Diwali (Deepavali Laxmi Pujan)', type: 'National Festival', mandatory: true },
    { date: '2026-11-24', day: 'Tuesday', name: 'Guru Nanak Jayanti', type: 'Gazetted Holiday', mandatory: true },
    { date: '2026-12-25', day: 'Friday', name: 'Christmas Day', type: 'Gazetted Holiday', mandatory: true },
  ];

  // Fetch employee tasks from Firestore and server with offline fallback
  const fetchTasks = async () => {
    if (!employee?.id) return;
    setTasksLoading(true);

    let fetched = null;
    try {
      const cloudTasks = await getFirestoreTasks(employee.id);
      if (Array.isArray(cloudTasks) && cloudTasks.length > 0) {
        fetched = cloudTasks;
      }
    } catch {}

    if (!fetched) {
      try {
        const res = await fetch(`/api/tasks?employeeId=${employee.id}`).catch(() => null);
        if (res && res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            fetched = data.data;
          }
        }
      } catch {}
    }

    if (fetched) {
      setTasks(fetched);
      localStorage.setItem(`pulsehr_tasks_${employee.id}`, JSON.stringify(fetched));
    } else {
      const cached = localStorage.getItem(`pulsehr_tasks_${employee.id}`);
      if (cached) {
        try { setTasks(JSON.parse(cached)); } catch {}
      } else {
        const defaults = SEED_TASKS.filter((t) => t.employeeId === employee.id);
        setTasks(defaults);
      }
    }
    setTasksLoading(false);
  };

  useEffect(() => {
    fetchTasks();
    if (!employee?.id) return;

    // Real-time listener for tasks in Firestore
    const unsub = subscribeToFirestoreTasks(employee.id, (cloudTasks) => {
      if (Array.isArray(cloudTasks)) {
        setTasks(cloudTasks);
        localStorage.setItem(`pulsehr_tasks_${employee.id}`, JSON.stringify(cloudTasks));
        setTasksLoading(false);
      }
    });

    return () => unsub();
  }, [employee?.id]);

  if (!employee) {
    return (
      <div className="py-20 text-center text-slate-500 text-xs">
        No employee selected. Please login to your employee account.
      </div>
    );
  }

  const myLeaves = leaves.filter(
    (l) =>
      l &&
      (l.employeeId === employee?.id ||
        (employee?.name && l.employeeName?.toLowerCase() === employee.name.toLowerCase()))
  );

  // Toggle Task Status (In Progress <-> Completed)
  const handleToggleTaskStatus = async (task) => {
    const nextStatus = task.status === 'Completed' ? 'In Progress' : 'Completed';
    setUpdatingTaskId(task.id);

    const updatedTask = { ...task, status: nextStatus };

    // Optimistic UI update
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === task.id ? updatedTask : t));
      localStorage.setItem(`pulsehr_tasks_${employee.id}`, JSON.stringify(updated));
      return updated;
    });

    if (nextStatus === 'Completed' && onTaskCompleted) {
      onTaskCompleted(task, employee.name);
    }

    // Sync to Firestore Cloud Database
    syncTaskToFirestore(updatedTask);

    try {
      await fetch(`/api/tasks/${task.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      }).catch(() => null);
    } catch (err) {
      console.warn('Task status updated in local storage fallback', err);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // Add a new self-assigned or sprint task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    setLoading(true);

    const createdTask = {
      id: `TSK-${Math.floor(300 + Math.random() * 700)}`,
      employeeId: employee.id,
      ...newTask,
      assignedBy: `${employee.name} (Self-Assigned)`,
      status: 'In Progress',
      createdAt: new Date().toISOString()
    };

    setTasks((prev) => {
      const updated = [createdTask, ...prev];
      localStorage.setItem(`pulsehr_tasks_${employee.id}`, JSON.stringify(updated));
      return updated;
    });
    setShowAddTaskModal(false);
    setNewTask({
      title: '',
      description: '',
      projectName: employee.assignedProjectName || 'General Deliverables',
      priority: 'Medium',
      deadline: '2026-12-05',
      estimatedHours: '8 hrs',
      category: 'Feature Development'
    });

    // Sync to Firestore Cloud Database
    syncTaskToFirestore(createdTask);

    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createdTask),
      }).catch(() => null);
    } catch (err) {
      console.warn('Saved task locally in fallback');
    } finally {
      setLoading(false);
    }
  };

  // Apply Leave
  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const leaveSubmission = { ...newLeave };

    if (onLeaveApplied) {
      onLeaveApplied(leaveSubmission, employee.id, employee.name);
    }

    try {
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: employee.id,
          ...leaveSubmission,
        }),
      });

      const data = await res.json().catch(() => null);
      if (data && data.success) {
        setShowApplyModal(false);
        setNewLeave({
          leaveType: 'Paid Time Off',
          startDate: '2026-12-01',
          endDate: '2026-12-02',
          daysCount: 2,
          reason: '',
        });
        if (onLeaveSubmitted) onLeaveSubmitted();
      } else {
        setShowApplyModal(false);
        if (onLeaveSubmitted) onLeaveSubmitted();
      }
    } catch (err) {
      setShowApplyModal(false);
      if (onLeaveSubmitted) onLeaveSubmitted();
    } finally {
      setLoading(false);
    }
  };

  // Tasks statistics
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
  const pendingTasks = tasks.filter((t) => t.status === 'Pending').length;

  // Filtered Holidays
  const filteredHolidays = corporateHolidays2026.filter((h) => {
    if (holidayFilter === 'national') return h.type === 'National Holiday';
    if (holidayFilter === 'upcoming') {
      const holidayDate = new Date(h.date);
      const today = new Date('2026-11-20');
      return holidayDate >= today;
    }
    return true;
  });

  // Robust Project Matching: checks assignedProjectId, assignedProjectName, or membership in project allocatedMembers
  const assignedProject = projects.find(
    (p) =>
      (employee?.assignedProjectId && p.id === employee.assignedProjectId) ||
      (employee?.assignedProjectName && p.name === employee.assignedProjectName && !employee.assignedProjectName.toLowerCase().includes('unassigned')) ||
      (Array.isArray(p.allocatedMembers) && p.allocatedMembers.includes(employee?.id))
  );

  const activeProjectName = assignedProject
    ? assignedProject.name
    : (employee?.assignedProjectName && !employee.assignedProjectName.toLowerCase().includes('unassigned')
        ? employee.assignedProjectName
        : 'Unassigned (Available for new project)');

  const activeAllocationPercent = assignedProject
    ? (employee?.allocationPercent > 0 ? employee.allocationPercent : 100)
    : (employee?.allocationPercent || 0);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* TOP BANNER: EMPLOYEE PROFILE & WORKPLACE DETAILS */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#452473] text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-purple-950/20">
            {((employee?.name || 'Employee').trim() || 'Employee')
              .split(/\s+/)
              .map((n) => (n ? n[0] : ''))
              .filter(Boolean)
              .join('')
              .toUpperCase() || 'E'}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 text-[10px] font-mono font-bold tracking-wide">
                CO-OPERATE HRMS • ESS
              </span>
              <span className="text-xs text-slate-400 font-mono font-bold">{employee?.id || ''}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {employee?.workMode || 'Office'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">{employee?.name || 'Employee'}</h1>
            <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>{employee.role}</span>
              <span>•</span>
              <span className="font-semibold text-[#452473]">{employee.department}</span>
              <span>•</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                Annual CTC: {employee.salary}
              </span>
            </p>
          </div>
        </div>

        {/* Live Attendance Clock In / Out Toggle */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#f8f9fc] border border-slate-200/80">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Shift Status</span>
            <span className={`text-xs font-bold flex items-center gap-1.5 ${clockedIn ? 'text-emerald-600' : 'text-slate-500'}`}>
              <span className={`w-2 h-2 rounded-full ${clockedIn ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
              {clockedIn ? 'Clocked In (Active)' : 'Clocked Out'}
            </span>
          </div>

          <button
            onClick={() => setClockedIn(!clockedIn)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs active:scale-95 ${
              clockedIn
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold'
            }`}
          >
            {clockedIn ? 'Clock Out' : 'Clock In'}
          </button>
        </div>
      </div>

      {/* QUICK STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Project Capacity */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Current Assignment</span>
            <Briefcase className="w-4 h-4 text-[#452473]" />
          </div>
          <p className="text-base font-bold text-slate-900 mt-2 truncate" title={activeProjectName}>
            {activeProjectName}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
            <span>Staffed Capacity:</span>
            <strong className="text-[#ff5c8a] font-bold">{activeAllocationPercent}%</strong>
          </div>
        </div>

        {/* Pending & Active Tasks */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Assigned Deliverables</span>
            <CheckSquare className="w-4 h-4 text-[#ff5c8a]" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-slate-900">{tasks.length}</span>
            <span className="text-xs text-slate-500 font-semibold">Total Tasks</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            <strong className="text-emerald-600">{completedTasks}</strong> Done • <strong className="text-amber-600">{inProgressTasks}</strong> In Progress
          </p>
        </div>

        {/* Paid Leave Balance */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Paid Leave Balance</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-slate-900">{employee.leaveBalance?.paid ?? 18}</span>
            <span className="text-xs text-slate-500 font-semibold">Days Available</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Medical: {employee.leaveBalance?.sick ?? 8}d • Casual: {employee.leaveBalance?.casual ?? 5}d
          </p>
        </div>

        {/* Official Corporate Holidays */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Corporate Holiday Calendar</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-slate-900">17</span>
            <span className="text-xs text-slate-500 font-semibold">Public Holidays</span>
          </div>
          <p className="text-[11px] text-[#ff5c8a] font-semibold mt-1">
            Next: Guru Nanak Jayanti (24 Nov)
          </p>
        </div>
      </div>

      {/* RECENT HR UPDATES & PROJECT ALERTS */}
      {(() => {
        const myAlerts = (Array.isArray(notifications) ? notifications : []).filter(
          (n) => n && (n.targetRole === 'all' || n.targetEmployeeId === employee?.id)
        );
        if (myAlerts.length === 0) return null;
        return (
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-pink-100 text-[#ff5c8a]">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Recent HR Updates & Project Alerts</h3>
                  <p className="text-[11px] text-slate-400">Direct notifications, staffing announcements, and task updates</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-[#452473] font-mono text-[10px] font-bold">
                {myAlerts.filter((n) => n && !n.read).length} Unread
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-3">
              {myAlerts.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border text-xs transition ${
                    !item.read
                      ? 'bg-purple-50/40 border-purple-200 shadow-xs'
                      : 'bg-[#fcfdff] border-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-[#452473] flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#ff5c8a]" />
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.timestamp}</span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">{item.message}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* NAVIGATION SUB-TABS (Tasks, Holidays, Leaves, Payroll) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('tasks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'tasks'
              ? 'bg-[#452473] text-white shadow-xs'
              : 'text-slate-600 hover:bg-white hover:text-slate-900'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>My Assigned Tasks & Deliverables ({tasks.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('project')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'project'
              ? 'bg-[#452473] text-white shadow-xs'
              : 'text-slate-600 hover:bg-white hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>My Project & Squad</span>
        </button>

        <button
          onClick={() => setActiveSubTab('holidays')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'holidays'
              ? 'bg-[#452473] text-white shadow-xs'
              : 'text-slate-600 hover:bg-white hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Corporate Holidays 2026 (17 Days)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('leaves')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'leaves'
              ? 'bg-[#452473] text-white shadow-xs'
              : 'text-slate-600 hover:bg-white hover:text-slate-900'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Leave Requests & History ({myLeaves.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('payroll')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'payroll'
              ? 'bg-[#452473] text-white shadow-xs'
              : 'text-slate-600 hover:bg-white hover:text-slate-900'
          }`}
        >
          <Banknote className="w-4 h-4" />
          <span>CTC & Compensation Breakdown</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SUB-TAB 1: ASSIGNED WORK & TASKS ("KYA KAAM MILA HAI")   */}
      {/* ======================================================== */}
      {activeSubTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#ff5c8a]" />
                Sprint Deliverables & Assigned Work Items
              </h3>
              <p className="text-xs text-slate-500">
                Current sprint tasks assigned by leads & managers. Click checkbox to toggle completion.
              </p>
            </div>

            <button
              onClick={() => setShowAddTaskModal(true)}
              className="px-4 py-2 rounded-xl bg-[#452473] hover:bg-[#381a60] text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Work Item</span>
            </button>
          </div>

          {tasksLoading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Loading assigned sprint tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h4 className="font-bold text-slate-800 text-sm">All caught up!</h4>
              <p className="text-xs text-slate-500 mt-1">
                You have no active pending tasks for this sprint. Check back with your project manager.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => {
                const isCompleted = task.status === 'Completed';
                const isUpdating = updatingTaskId === task.id;

                return (
                  <div
                    key={task.id}
                    className={`p-5 rounded-2xl bg-white border transition-all duration-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isCompleted ? 'border-emerald-200 bg-emerald-50/20 opacity-80' : 'border-slate-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Checkbox status toggle */}
                      <button
                        onClick={() => handleToggleTaskStatus(task)}
                        disabled={isUpdating}
                        className={`mt-0.5 shrink-0 transition-transform active:scale-90 ${
                          isCompleted ? 'text-emerald-600' : 'text-slate-400 hover:text-[#452473]'
                        }`}
                        title="Click to toggle status"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 fill-emerald-100 text-emerald-600 stroke-[2.5]" />
                        ) : (
                          <Square className="w-5 h-5 hover:stroke-[2.5]" />
                        )}
                      </button>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            task.priority === 'High'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {task.priority} Priority
                          </span>

                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {task.category || 'Sprint Deliverable'}
                          </span>

                          <span className="text-[10px] text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded-full">
                            {task.projectName}
                          </span>
                        </div>

                        <h4 className={`text-sm font-bold text-slate-800 ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                          {task.title}
                        </h4>

                        <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                          {task.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                          <span>Assigned by: <strong className="text-slate-600">{task.assignedBy}</strong></span>
                          <span>•</span>
                          <span>Est. Effort: <strong className="text-slate-600">{task.estimatedHours || '8 hrs'}</strong></span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-mono text-slate-600">
                            <Clock className="w-3 h-3 text-slate-400" /> Due: {task.deadline}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status badge pill */}
                    <div className="shrink-0 flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                          task.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : task.status === 'In Progress'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isUpdating ? 'Updating...' : task.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB: MY PROJECT & SQUAD DETAILS                       */}
      {/* ======================================================== */}
      {activeSubTab === 'project' && (
        <div className="space-y-6">
          {assignedProject ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 text-[10px] font-mono font-bold">
                      {assignedProject.id}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-mono font-bold">
                      {assignedProject.priority} Priority
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                      {assignedProject.status}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900">{assignedProject.name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Client Organization: <strong className="text-slate-800 font-bold">{assignedProject.client}</strong>
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Your Assigned Capacity</span>
                  <span className="text-lg font-black text-[#ff5c8a]">{activeAllocationPercent}% (Staffed)</span>
                </div>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#f8f9fc] border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Project / Tech Lead</span>
                  <span className="text-sm font-bold text-slate-800 mt-1 block">{assignedProject.lead || 'Senior Architect'}</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#f8f9fc] border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Target Sign-off Deadline</span>
                  <span className="text-sm font-bold text-slate-800 mt-1 block font-mono">{assignedProject.deadline}</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#f8f9fc] border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Account Budget</span>
                  <span className="text-sm font-bold text-emerald-700 mt-1 block font-mono">{assignedProject.budget || '₹45,00,000'}</span>
                </div>
              </div>

              {/* Required Skills & Technology Stack */}
              <div>
                <h4 className="text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-2">
                  Required Technology Stack & Competencies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(assignedProject.requiredSkills)
                    ? assignedProject.requiredSkills
                    : ['React', 'Node.js', 'PostgreSQL', 'Cloud Infrastructure']
                  ).map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-purple-50 text-purple-800 text-xs font-semibold border border-purple-100"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Staffed Squad Members */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-3">
                  Engineering Squad Teammates ({assignedProject.allocatedMembers?.length || 1} Staffed)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {(Array.isArray(assignedProject.allocatedMembers) && assignedProject.allocatedMembers.length > 0
                    ? assignedProject.allocatedMembers
                    : [employee?.id || 'EMP-1001']
                  ).map((mem, memIdx) => {
                    const memId = typeof mem === 'object' && mem ? (mem.id || mem.name) : mem;
                    const memName = typeof mem === 'object' && mem ? (mem.name || mem.id) : mem;
                    const isMe = memId === employee?.id || memName === employee?.name;
                    return (
                      <div
                        key={memId || memIdx}
                        className={`p-3 rounded-2xl border text-xs flex items-center gap-3 transition ${
                          isMe
                            ? 'bg-purple-50/70 border-purple-200 ring-2 ring-purple-200/50'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-[#452473] text-white font-bold flex items-center justify-center text-xs shadow-xs">
                          {isMe ? (employee?.name ? employee.name[0].toUpperCase() : 'U') : (memName ? String(memName)[0].toUpperCase() : 'T')}
                        </div>
                        <div className="truncate">
                          <span className="font-bold text-slate-900 block truncate">
                            {isMe ? `${employee?.name || 'You'} (You)` : (memName || memId)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {isMe ? (employee?.role || 'Staff Member') : 'Allocated Teammate'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto font-bold shadow-xs">
                <Briefcase className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Currently on Bench (Available for New Project)</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                You are currently not staffed on an active client project. When HR allocates you to a project in the Resource Staffing matrix, all project milestones, client deliverables, and engineering squad teammates will immediately display here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 2: CORPORATE HOLIDAYS 2026 CALENDAR LIST         */}
      {/* ======================================================== */}
      {activeSubTab === 'holidays' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#452473]" />
                Official Corporate Holiday Calendar (2026)
              </h3>
              <p className="text-xs text-slate-500">
                17 Approved Gazetted & National public holidays across company tech offices (Bengaluru, Hyderabad, Mumbai, Pune, Gurugram).
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-[#f8f9fc] p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setHolidayFilter('all')}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  holidayFilter === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All (17)
              </button>
              <button
                onClick={() => setHolidayFilter('national')}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  holidayFilter === 'national' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                National Only
              </button>
              <button
                onClick={() => setHolidayFilter('upcoming')}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  holidayFilter === 'upcoming' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Upcoming
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHolidays.map((holiday, idx) => {
              const isNational = holiday.type === 'National Holiday';
              const isUpcoming = holiday.date === '2026-11-24'; // Guru Nanak Jayanti in current sprint

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl bg-white border transition shadow-xs flex flex-col justify-between ${
                    isUpcoming
                      ? 'border-[#ff5c8a] ring-2 ring-[#ff5c8a]/20'
                      : isNational
                      ? 'border-purple-200'
                      : 'border-slate-200/80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                        isNational
                          ? 'bg-purple-100 text-purple-800'
                          : holiday.type === 'National Festival'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {holiday.type}
                      </span>

                      {isUpcoming && (
                        <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-bold font-mono animate-pulse">
                          Next Holiday!
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-800">{holiday.name}</h4>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono font-semibold text-slate-700">{holiday.date}</span>
                    <span className="font-medium text-slate-400">{holiday.day}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 3: LEAVE REQUESTS & TIME-OFF HISTORY             */}
      {/* ======================================================== */}
      {activeSubTab === 'leaves' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-[#452473]" />
                My Leave Requests & Time-Off History
              </h3>
              <p className="text-xs text-slate-500">
                Track status of submitted annual, sick, and casual leave applications.
              </p>
            </div>

            <button
              onClick={() => setShowApplyModal(true)}
              className="px-4 py-2 rounded-xl bg-[#452473] hover:bg-[#381a60] text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Apply for Leave</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8f9fc] text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {myLeaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{l.leaveType}</td>
                    <td className="py-3.5 px-4">{l.daysCount} Day(s)</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{l.startDate} to {l.endDate}</td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">{l.reason}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                          l.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : l.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {myLeaves.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-xs">
                No previous leave applications filed yet. Click "Apply for Leave" above.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 4: CTC & SALARY BREAKDOWN (INR)                   */}
      {/* ======================================================== */}
      {activeSubTab === 'payroll' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Banknote className="w-4 h-4 text-emerald-600" />
                Employee Compensation & Corporate Tax Structure
              </h3>
              <p className="text-xs text-slate-500">
                EPFO, HRA, Standard Deduction & TDS compliant compensation structure.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Annual Cost to Company (CTC)</span>
              <span className="text-2xl font-black text-[#452473]">{employee.salary}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#f8f9fc] border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Monthly Gross</span>
              <p className="text-xl font-bold text-slate-800 mt-1">₹1,54,166 / mo</p>
              <p className="text-[11px] text-slate-400 mt-1">Includes Basic (50%) + HRA (20%)</p>
            </div>

            <div className="p-4 rounded-xl bg-[#f8f9fc] border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Provident Fund (EPF)</span>
              <p className="text-xl font-bold text-slate-800 mt-1">₹9,250 / mo</p>
              <p className="text-[11px] text-slate-400 mt-1">12% matched employer contribution</p>
            </div>

            <div className="p-4 rounded-xl bg-[#f8f9fc] border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Health Insurance Cover</span>
              <p className="text-xl font-bold text-slate-800 mt-1">₹5,00,000</p>
              <p className="text-[11px] text-slate-400 mt-1">Family Floater (Self + Spouse + Kids)</p>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 bg-purple-50/50 p-4 rounded-xl border border-purple-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#452473] shrink-0" />
            <span>
              Payroll processed as per Corporate Tax Guidelines. Payslips for the previous month are released on the 1st of every calendar month.
            </span>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: ADD NEW WORK ITEM / TASK                        */}
      {/* ======================================================== */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Add Sprint Deliverable / Task</h3>
              <button onClick={() => setShowAddTaskModal(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Integrate UPI Webhook Callbacks"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Deliverable Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief details about expected output or PR link..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Normal">Normal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newTask.deadline}
                    onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                    className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Estimated Effort</label>
                  <input
                    type="text"
                    placeholder="e.g. 12 hrs"
                    value={newTask.estimatedHours}
                    onChange={(e) => setNewTask({ ...newTask, estimatedHours: e.target.value })}
                    className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Frontend Architecture"
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                    className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-[#452473] hover:bg-[#381a60] text-white font-bold"
                >
                  {loading ? 'Adding...' : 'Add Deliverable'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: SUBMIT LEAVE REQUEST                            */}
      {/* ======================================================== */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Apply for Time-Off / Leave</h3>
              <button onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            {error && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleApplyLeave} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Leave Category</label>
                <select
                  value={newLeave.leaveType}
                  onChange={(e) => setNewLeave({ ...newLeave, leaveType: e.target.value })}
                  className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
                >
                  <option value="Paid Time Off">Paid Annual Leave (Earned Leave)</option>
                  <option value="Sick Leave">Sick / Medical Leave</option>
                  <option value="Casual Leave">Casual Leave (Short Notice)</option>
                  <option value="Optional Holiday">Optional / Festive Holiday</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newLeave.startDate}
                    onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                    className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={newLeave.endDate}
                    onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                    className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Number of Days</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="14"
                  value={newLeave.daysCount}
                  onChange={(e) => setNewLeave({ ...newLeave, daysCount: e.target.value })}
                  className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Reason for Leave *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Share a short note for manager/HR approval..."
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                  className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-[#452473] hover:bg-[#381a60] text-white font-bold"
                >
                  {loading ? 'Submitting...' : 'Submit Leave Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
