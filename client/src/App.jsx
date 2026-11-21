import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardOverview from './components/DashboardOverview';
import ResourceManager from './components/ResourceManager';
import WorkforceDirectory from './components/WorkforceDirectory';
import ProjectManager from './components/ProjectManager';
import LeaveManager from './components/LeaveManager';
import EmployeePortal from './components/EmployeePortal';
import LoginPage from './components/LoginPage';
import { Check, AlertCircle } from 'lucide-react';
import { SEED_EMPLOYEES, SEED_PROJECTS, SEED_LEAVES } from './data/seedData';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('pulsehr_auth');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeHRTab, setActiveHRTab] = useState('dashboard'); // 'dashboard' | 'resources' | 'directory' | 'projects' | 'leaves'
  const [employeeTab, setEmployeeTab] = useState('tasks'); // 'tasks' | 'holidays' | 'leaves' | 'payroll'
  
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState(null);
  
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('pulsehr_auth', JSON.stringify(user));

    if (user.role === 'hr') {
      showToast(`Welcome back, ${user.name}! Logged in as HR Administrator.`);
    } else {
      setSelectedEmployee(user.employee);
      showToast(`Welcome, ${user.name}! Logged in to your Employee Workspace.`);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedEmployee(null);
    localStorage.removeItem('pulsehr_auth');
    showToast('Signed out successfully.');
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError('');

    let empData = null;
    let projData = null;
    let leaveData = null;
    let statData = null;

    try {
      const searchParam = searchQuery.trim() ? `?search=${encodeURIComponent(searchQuery.trim())}` : '';
      const [empRes, projRes, leaveRes, statRes] = await Promise.all([
        fetch(`/api/employees${searchParam}`).catch(() => null),
        fetch('/api/projects').catch(() => null),
        fetch('/api/leaves').catch(() => null),
        fetch('/api/hrms/stats').catch(() => null),
      ]);

      if (empRes && empRes.ok) empData = await empRes.json();
      if (projRes && projRes.ok) projData = await projRes.json();
      if (leaveRes && leaveRes.ok) leaveData = await leaveRes.json();
      if (statRes && statRes.ok) statData = await statRes.json();
    } catch (err) {
      console.warn('API fetch warning:', err);
    }

    // 1. Employees data (API -> localStorage -> seedData)
    let currentEmployees = SEED_EMPLOYEES;
    if (empData && empData.success && Array.isArray(empData.data)) {
      currentEmployees = empData.data;
      localStorage.setItem('pulsehr_employees', JSON.stringify(currentEmployees));
    } else {
      const saved = localStorage.getItem('pulsehr_employees');
      if (saved) {
        try { currentEmployees = JSON.parse(saved); } catch {}
      }
    }
    setEmployees(currentEmployees);

    if (currentUser?.role === 'employee' && currentUser.employee) {
      const freshSelf = currentEmployees.find((e) => e.id === currentUser.employee.id);
      if (freshSelf) setSelectedEmployee(freshSelf);
    }

    // 2. Projects data
    let currentProjects = SEED_PROJECTS;
    if (projData && projData.success && Array.isArray(projData.data)) {
      currentProjects = projData.data;
      localStorage.setItem('pulsehr_projects', JSON.stringify(currentProjects));
    } else {
      const saved = localStorage.getItem('pulsehr_projects');
      if (saved) {
        try { currentProjects = JSON.parse(saved); } catch {}
      }
    }
    setProjects(currentProjects);

    // 3. Leaves data
    let currentLeaves = SEED_LEAVES;
    if (leaveData && leaveData.success && Array.isArray(leaveData.data)) {
      currentLeaves = leaveData.data;
      localStorage.setItem('pulsehr_leaves', JSON.stringify(currentLeaves));
    } else {
      const saved = localStorage.getItem('pulsehr_leaves');
      if (saved) {
        try { currentLeaves = JSON.parse(saved); } catch {}
      }
    }
    setLeaves(currentLeaves);

    // 4. Stats data
    if (statData && statData.success && statData.stats) {
      setStats(statData.stats);
    } else {
      const totalHeadcount = currentEmployees.length;
      const benchCount = currentEmployees.filter((e) => e.allocationStatus === 'Available (Bench)').length;
      const partiallyAllocated = currentEmployees.filter((e) => e.allocationStatus === 'Partially Available').length;
      const fullyAllocated = currentEmployees.filter((e) => e.allocationStatus === 'Fully Booked').length;
      const benchPercentage = totalHeadcount > 0 ? Math.round((benchCount / totalHeadcount) * 100) : 0;
      const pendingLeavesCount = currentLeaves.filter((l) => l.status === 'Pending').length;

      setStats({
        totalHeadcount,
        benchCount,
        partiallyAllocated,
        fullyAllocated,
        benchPercentage,
        totalProjects: currentProjects.length,
        pendingLeavesCount,
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, [searchQuery]);

  // If user is not logged in, render the clean login screen!
  if (!currentUser) {
    return (
      <LoginPage
        onLogin={handleLogin}
        employees={employees}
      />
    );
  }

  const isHR = currentUser.role === 'hr';

  return (
    <div className="flex min-h-screen bg-[#f4f5fa] text-slate-800 font-sans selection:bg-[#ff5c8a] selection:text-white">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#452473] text-white font-semibold text-xs shadow-2xl animate-in slide-in-from-bottom-5">
          <Check className="w-4 h-4 stroke-[3] text-[#ff5c8a]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Left Deep Purple Sidebar */}
      <Sidebar
        activeTab={isHR ? activeHRTab : employeeTab}
        setActiveTab={isHR ? setActiveHRTab : setEmployeeTab}
        pendingLeavesCount={stats?.pendingLeavesCount || 0}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top White Header Bar */}
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={fetchAllData}
                className="px-3 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 font-semibold"
              >
                Retry
              </button>
            </div>
          )}

          {/* VIEW 1: HR EXECUTIVE SUITE (Only rendered if HR Admin is logged in) */}
          {isHR ? (
            <div>
              {activeHRTab === 'dashboard' && (
                <DashboardOverview
                  stats={stats}
                  onNavigateToTab={(tab) => setActiveHRTab(tab)}
                />
              )}

              {activeHRTab === 'resources' && (
                <ResourceManager
                  employees={employees}
                  projects={projects}
                  onDataChanged={fetchAllData}
                />
              )}

              {activeHRTab === 'directory' && (
                <WorkforceDirectory
                  employees={employees}
                  onDataChanged={fetchAllData}
                />
              )}

              {activeHRTab === 'projects' && (
                <ProjectManager
                  projects={projects}
                  employees={employees}
                  onDataChanged={fetchAllData}
                />
              )}

              {activeHRTab === 'leaves' && (
                <LeaveManager
                  leaves={leaves}
                  onDataChanged={fetchAllData}
                />
              )}
            </div>
          ) : (
            /* VIEW 2: EMPLOYEE SELF-SERVICE (Only rendered if Employee is logged in) */
            <EmployeePortal
              employee={selectedEmployee || currentUser.employee}
              leaves={leaves}
              activeSubTab={employeeTab}
              onSubTabChange={setEmployeeTab}
              onLeaveSubmitted={() => {
                showToast('Leave request submitted! Awaiting manager approval.');
                fetchAllData();
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
