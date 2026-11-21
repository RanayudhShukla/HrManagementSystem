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
import { SEED_EMPLOYEES, SEED_PROJECTS, SEED_LEAVES, SEED_TASKS, SEED_NOTIFICATIONS } from './data/seedData';
import { 
  syncEmployeeToFirestore, syncProjectToFirestore, 
  syncLeaveToFirestore, syncTaskToFirestore,
  getFirestoreEmployees, getFirestoreProjects, getFirestoreLeaves 
} from './firebase/firestoreService';

function computeStats(emps, projs, lvs) {
  const totalHeadcount = emps.length;
  const benchCount = emps.filter((e) => e.allocationStatus === 'Available (Bench)').length;
  const partiallyAllocated = emps.filter((e) => e.allocationStatus === 'Partially Available').length;
  const fullyAllocated = emps.filter((e) => e.allocationStatus === 'Fully Booked').length;
  const benchPercentage = totalHeadcount > 0 ? Math.round((benchCount / totalHeadcount) * 100) : 0;
  const pendingLeavesCount = (lvs || []).filter((l) => l.status === 'Pending').length;

  const departmentDistribution = {};
  emps.forEach((e) => {
    departmentDistribution[e.department] = (departmentDistribution[e.department] || 0) + 1;
  });

  const skillCounts = {};
  emps.forEach((e) => {
    (e.skills || []).forEach((sk) => {
      skillCounts[sk] = (skillCounts[sk] || 0) + 1;
    });
  });

  return {
    totalHeadcount,
    benchCount,
    partiallyAllocated,
    fullyAllocated,
    benchPercentage,
    totalProjects: projs.length,
    pendingLeavesCount,
    departmentDistribution,
    topSkills: Object.entries(skillCounts)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
  };
}

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
  
  // Authoritative State with instant localStorage persistence
  const [employees, setEmployees] = useState(() => {
    try {
      const saved = localStorage.getItem('pulsehr_employees');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((e) => ({
          ...e,
          email: e.email ? e.email.replace('@pulsehr.com', '@cooperate.com') : e.email,
        }));
      }
      return SEED_EMPLOYEES;
    } catch {
      return SEED_EMPLOYEES;
    }
  });

  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('pulsehr_projects');
      return saved ? JSON.parse(saved) : SEED_PROJECTS;
    } catch {
      return SEED_PROJECTS;
    }
  });

  const [leaves, setLeaves] = useState(() => {
    try {
      const saved = localStorage.getItem('pulsehr_leaves');
      return saved ? JSON.parse(saved) : SEED_LEAVES;
    } catch {
      return SEED_LEAVES;
    }
  });

  const [stats, setStats] = useState(() => computeStats(
    employees.length ? employees : SEED_EMPLOYEES,
    projects.length ? projects : SEED_PROJECTS,
    leaves.length ? leaves : SEED_LEAVES
  ));
  
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState('');

  // Two-way Connected Notification System
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('cooperate_notifications');
      return saved ? JSON.parse(saved) : SEED_NOTIFICATIONS;
    } catch {
      return SEED_NOTIFICATIONS;
    }
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const addNotification = (notif) => {
    setNotifications((prev) => {
      const updated = [
        {
          id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
          createdAt: new Date().toISOString(),
          ...notif,
        },
        ...prev,
      ];
      localStorage.setItem('cooperate_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const handleMarkNotificationRead = (notifId) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === notifId ? { ...n, read: true } : n));
      localStorage.setItem('cooperate_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const handleMarkAllNotificationsRead = () => {
    const isHR = currentUser?.role === 'hr';
    const empId = currentUser?.employee?.id;

    setNotifications((prev) => {
      const updated = prev.map((n) => {
        const isTarget = isHR
          ? n.targetRole === 'hr' || n.targetRole === 'all'
          : n.targetRole === 'all' || n.targetEmployeeId === empId;
        return isTarget ? { ...n, read: true } : n;
      });
      localStorage.setItem('cooperate_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearNotifications = () => {
    const isHR = currentUser?.role === 'hr';
    const empId = currentUser?.employee?.id;

    setNotifications((prev) => {
      const updated = prev.filter((n) => {
        const isTarget = isHR
          ? n.targetRole === 'hr' || n.targetRole === 'all'
          : n.targetRole === 'all' || n.targetEmployeeId === empId;
        return !isTarget;
      });
      localStorage.setItem('cooperate_notifications', JSON.stringify(updated));
      return updated;
    });
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

  // 1. ALLOCATE RESOURCE HANDLER (Instant Reactive State + Notification)
  const handleAllocateEmployee = async (employeeId, projectId, pct) => {
    const proj = projects.find((p) => p.id === projectId);
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp || !proj) return;

    const updatedEmployees = employees.map((e) => {
      if (e.id === employeeId) {
        return {
          ...e,
          assignedProjectId: proj.id,
          assignedProjectName: proj.name,
          allocationPercent: pct,
          allocationStatus: pct >= 100 ? 'Fully Booked' : pct > 0 ? 'Partially Available' : 'Available (Bench)',
        };
      }
      return e;
    });

    const updatedProjects = projects.map((p) => {
      let members = Array.isArray(p.allocatedMembers) ? [...p.allocatedMembers] : [];
      if (p.id === projectId) {
        if (!members.includes(employeeId)) members.push(employeeId);
      } else {
        members = members.filter((id) => id !== employeeId);
      }
      return { ...p, allocatedMembers: members };
    });

    // Instant State Update
    setEmployees(updatedEmployees);
    setProjects(updatedProjects);
    localStorage.setItem('pulsehr_employees', JSON.stringify(updatedEmployees));
    localStorage.setItem('pulsehr_projects', JSON.stringify(updatedProjects));
    setStats(computeStats(updatedEmployees, updatedProjects, leaves));
    showToast(`${emp.name} allocated to ${proj.name} at ${pct}% capacity!`);

    // Notify the assigned employee immediately
    addNotification({
      title: 'Project Assignment Updated',
      message: `HR has assigned you to project "${proj.name}" at ${pct}% capacity.`,
      type: 'project_assigned',
      targetRole: 'employee',
      targetEmployeeId: employeeId,
    });

    // Cloud Firestore Sync (Background)
    const targetEmp = updatedEmployees.find((e) => e.id === employeeId);
    if (targetEmp) syncEmployeeToFirestore(targetEmp);
    const targetProj = updatedProjects.find((p) => p.id === projectId);
    if (targetProj) syncProjectToFirestore(targetProj);

    // REST API Sync (Background)
    try {
      await fetch('/api/resources/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, projectId, allocationPercent: pct }),
      });
    } catch {}
  };

  // 2. DEALLOCATE RESOURCE HANDLER (Instant Reactive State + Notification)
  const handleDeallocateEmployee = async (employeeId) => {
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return;

    const updatedEmployees = employees.map((e) => {
      if (e.id === employeeId) {
        return {
          ...e,
          assignedProjectId: null,
          assignedProjectName: 'Unassigned (Available for new project)',
          allocationPercent: 0,
          allocationStatus: 'Available (Bench)',
        };
      }
      return e;
    });

    const updatedProjects = projects.map((p) => {
      let members = Array.isArray(p.allocatedMembers) ? [...p.allocatedMembers] : [];
      members = members.filter((id) => id !== employeeId);
      return { ...p, allocatedMembers: members };
    });

    // Instant State Update
    setEmployees(updatedEmployees);
    setProjects(updatedProjects);
    localStorage.setItem('pulsehr_employees', JSON.stringify(updatedEmployees));
    localStorage.setItem('pulsehr_projects', JSON.stringify(updatedProjects));
    setStats(computeStats(updatedEmployees, updatedProjects, leaves));
    showToast(`${emp.name} released and returned to Bench.`);

    // Notify employee that they have returned to Bench
    addNotification({
      title: 'Resource Released to Bench',
      message: `HR released you from your project assignment. You are now available on Bench for new projects.`,
      type: 'project_assigned',
      targetRole: 'employee',
      targetEmployeeId: employeeId,
    });

    // Cloud Firestore Sync (Background)
    const targetEmp = updatedEmployees.find((e) => e.id === employeeId);
    if (targetEmp) syncEmployeeToFirestore(targetEmp);

    // REST API Sync (Background)
    try {
      await fetch('/api/resources/deallocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId }),
      });
    } catch {}
  };

  // 3. CREATE EMPLOYEE HANDLER (With Custom ID & Credentials Provisioning)
  const handleCreateEmployee = async (newEmp) => {
    const createdEmp = {
      id: newEmp.id?.trim() || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Active',
      type: 'Full-Time',
      joiningDate: new Date().toISOString().split('T')[0],
      allocationStatus: 'Available (Bench)',
      allocationPercent: 0,
      assignedProjectId: null,
      assignedProjectName: 'Unassigned (Available for new project)',
      leaveBalance: { paid: 18, sick: 8, casual: 5 },
      defaultPassword: newEmp.defaultPassword || newEmp.password || 'Welcome@2026',
      password: newEmp.defaultPassword || newEmp.password || 'Welcome@2026',
      ...newEmp,
      skills: Array.isArray(newEmp.skills)
        ? newEmp.skills
        : (newEmp.skills ? newEmp.skills.split(',').map((s) => s.trim()) : ['General']),
    };

    const updatedEmployees = [createdEmp, ...employees];
    setEmployees(updatedEmployees);
    localStorage.setItem('pulsehr_employees', JSON.stringify(updatedEmployees));
    setStats(computeStats(updatedEmployees, projects, leaves));
    showToast(`New employee ${createdEmp.name} (${createdEmp.id}) onboarded!`);

    addNotification({
      title: 'Employee Onboarded',
      message: `${createdEmp.name} was onboarded to ${createdEmp.department} with credentials ID: ${createdEmp.id}.`,
      type: 'system',
      targetRole: 'hr',
    });

    syncEmployeeToFirestore(createdEmp);
    try {
      await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createdEmp),
      });
    } catch {}
  };

  // 4. DELETE EMPLOYEE HANDLER
  const handleDeleteEmployee = async (employeeId) => {
    const updatedEmployees = employees.filter((e) => e.id !== employeeId);
    setEmployees(updatedEmployees);
    localStorage.setItem('pulsehr_employees', JSON.stringify(updatedEmployees));
    setStats(computeStats(updatedEmployees, projects, leaves));
    showToast('Employee offboarded from company directory.');

    try {
      await fetch(`/api/employees/${employeeId}`, { method: 'DELETE' });
    } catch {}
  };

  // 5. CREATE PROJECT HANDLER (Instant State + Notify Assigned Employees)
  const handleCreateProject = async (newProj) => {
    const createdProj = {
      id: `PROJ-${Math.floor(200 + Math.random() * 800)}`,
      status: 'In Progress',
      startDate: new Date().toISOString().split('T')[0],
      allocatedMembers: Array.isArray(newProj.allocatedMembers) ? newProj.allocatedMembers : [],
      ...newProj,
      requiredSkills: Array.isArray(newProj.requiredSkills)
        ? newProj.requiredSkills
        : (newProj.requiredSkills ? newProj.requiredSkills.split(',').map((s) => s.trim()) : ['React', 'Node.js']),
    };

    const updatedProjects = [createdProj, ...projects];
    setProjects(updatedProjects);
    localStorage.setItem('pulsehr_projects', JSON.stringify(updatedProjects));

    // Update assigned employees state so they immediately reflect the new project on both dashboards!
    const assignedIds = createdProj.allocatedMembers || [];
    let updatedEmployees = [...employees];
    if (assignedIds.length > 0) {
      updatedEmployees = employees.map((emp) => {
        if (assignedIds.includes(emp.id)) {
          return {
            ...emp,
            assignedProjectId: createdProj.id,
            assignedProjectName: createdProj.name,
            allocationPercent: emp.allocationPercent > 0 ? emp.allocationPercent : 100,
            allocationStatus: (emp.allocationPercent > 0 && emp.allocationPercent < 100) ? 'Partially Available' : 'Fully Booked',
          };
        }
        return emp;
      });
      setEmployees(updatedEmployees);
      localStorage.setItem('pulsehr_employees', JSON.stringify(updatedEmployees));

      // Notify each assigned employee!
      assignedIds.forEach((memId) => {
        addNotification({
          title: 'Assigned to New Project',
          message: `HR has assigned you to project "${createdProj.name}" (${createdProj.client || 'Client Account'}).`,
          type: 'project_assigned',
          targetRole: 'employee',
          targetEmployeeId: memId,
        });
      });
    }

    setStats(computeStats(updatedEmployees, updatedProjects, leaves));
    showToast(`Project "${createdProj.name}" created with ${assignedIds.length} team member(s)!`);

    syncProjectToFirestore(createdProj);
    try {
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createdProj),
      });
    } catch {}
  };

  // 6. UPDATE LEAVE STATUS HANDLER (Approve/Reject + Notify Employee)
  const handleUpdateLeaveStatus = async (leaveId, status) => {
    const targetLeave = leaves.find((l) => l.id === leaveId);
    const updatedLeaves = leaves.map((l) => (l.id === leaveId ? { ...l, status } : l));
    setLeaves(updatedLeaves);
    localStorage.setItem('pulsehr_leaves', JSON.stringify(updatedLeaves));

    // If approved, decrement employee leave balance
    if (status === 'Approved') {
      if (targetLeave) {
        const updatedEmployees = employees.map((emp) => {
          if (emp.id === targetLeave.employeeId && emp.leaveBalance) {
            const key = targetLeave.leaveType.toLowerCase().includes('sick')
              ? 'sick'
              : targetLeave.leaveType.toLowerCase().includes('casual')
              ? 'casual'
              : 'paid';
            const currentBal = emp.leaveBalance[key] || 0;
            return {
              ...emp,
              leaveBalance: {
                ...emp.leaveBalance,
                [key]: Math.max(0, currentBal - targetLeave.daysCount),
              },
            };
          }
          return emp;
        });
        setEmployees(updatedEmployees);
        localStorage.setItem('pulsehr_employees', JSON.stringify(updatedEmployees));
      }
    }

    setStats(computeStats(employees, projects, updatedLeaves));
    showToast(`Leave request marked as ${status}!`);

    // Notify employee of approval/rejection decision
    if (targetLeave) {
      addNotification({
        title: `Leave Request ${status}`,
        message: `HR has ${status.toLowerCase()} your request for ${targetLeave.leaveType} (${targetLeave.daysCount} days).`,
        type: status === 'Approved' ? 'leave_approved' : 'leave_rejected',
        targetRole: 'employee',
        targetEmployeeId: targetLeave.employeeId,
      });
    }

    const targetL = updatedLeaves.find((l) => l.id === leaveId);
    if (targetL) syncLeaveToFirestore(targetL);

    try {
      await fetch(`/api/leaves/${leaveId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch {}
  };

  // 7. HR GRANTS / RECORDS LEAVE DIRECTLY
  const handleCreateLeave = async (leaveData) => {
    const emp = employees.find((e) => e.id === leaveData.employeeId);
    const createdLeave = {
      id: `LEV-${Math.floor(400 + Math.random() * 600)}`,
      employeeId: leaveData.employeeId,
      employeeName: emp ? emp.name : 'Employee',
      department: emp ? emp.department : 'Engineering',
      leaveType: leaveData.leaveType || 'Paid Time Off',
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      daysCount: parseInt(leaveData.daysCount || 1, 10),
      reason: leaveData.reason || 'Granted by HR',
      status: leaveData.status || 'Approved',
      appliedOn: new Date().toISOString().split('T')[0],
    };

    const updatedLeaves = [createdLeave, ...leaves];
    setLeaves(updatedLeaves);
    localStorage.setItem('pulsehr_leaves', JSON.stringify(updatedLeaves));

    let updatedEmployees = [...employees];
    if (createdLeave.status === 'Approved' && emp && emp.leaveBalance) {
      const key = createdLeave.leaveType.toLowerCase().includes('sick')
        ? 'sick'
        : createdLeave.leaveType.toLowerCase().includes('casual')
        ? 'casual'
        : 'paid';
      const currentBal = emp.leaveBalance[key] || 0;
      updatedEmployees = employees.map((e) => {
        if (e.id === emp.id) {
          return {
            ...e,
            leaveBalance: {
              ...e.leaveBalance,
              [key]: Math.max(0, currentBal - createdLeave.daysCount),
            },
          };
        }
        return e;
      });
      setEmployees(updatedEmployees);
      localStorage.setItem('pulsehr_employees', JSON.stringify(updatedEmployees));
    }

    setStats(computeStats(updatedEmployees, projects, updatedLeaves));
    showToast(`Leave recorded for ${createdLeave.employeeName} (${createdLeave.status})!`);

    addNotification({
      title: createdLeave.status === 'Approved' ? 'Leave Granted by HR' : 'Leave Request Logged',
      message: `HR has recorded a ${createdLeave.leaveType} (${createdLeave.daysCount} days: ${createdLeave.startDate} to ${createdLeave.endDate}) with status: ${createdLeave.status}.`,
      type: createdLeave.status === 'Approved' ? 'leave_approved' : 'leave_applied',
      targetRole: 'employee',
      targetEmployeeId: createdLeave.employeeId,
    });

    syncLeaveToFirestore(createdLeave);

    try {
      await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createdLeave),
      });
    } catch {}
  };

  // 8. EMPLOYEE COMPLETES TASK -> NOTIFY HR
  const handleTaskCompleted = (task, employeeName) => {
    addNotification({
      title: 'Task Completed',
      message: `${employeeName} completed sprint task: "${task.title}" (${task.projectName || 'Project'}).`,
      type: 'task_completed',
      targetRole: 'hr',
    });
    showToast(`Task "${task.title}" marked Completed! HR has been notified.`);
  };

  // 9. EMPLOYEE APPLIES FOR LEAVE -> NOTIFY HR & UPDATE BOTH DASHBOARDS
  const handleLeaveApplied = (leaveData, employeeId, employeeName) => {
    const empId = employeeId || currentUser?.employee?.id;
    const emp = employees.find((e) => e.id === empId);
    const newLeaveEntry = {
      id: `LEV-${Math.floor(400 + Math.random() * 600)}`,
      employeeId: empId,
      employeeName: employeeName || emp?.name || 'Employee',
      department: emp?.department || 'Engineering',
      ...leaveData,
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0],
    };

    const updatedLeaves = [newLeaveEntry, ...leaves];
    setLeaves(updatedLeaves);
    localStorage.setItem('pulsehr_leaves', JSON.stringify(updatedLeaves));
    setStats(computeStats(employees, projects, updatedLeaves));

    addNotification({
      title: 'New Leave Request Filed',
      message: `${emp?.name || employeeName} applied for ${leaveData.leaveType} (${leaveData.daysCount} days: ${leaveData.startDate} to ${leaveData.endDate}).`,
      type: 'leave_applied',
      targetRole: 'hr',
    });

    syncLeaveToFirestore(newLeaveEntry);
    showToast('Leave request submitted! HR has been notified.');
  };

  // Background Cloud Sync & Multi-Tab Realtime Storage Listener
  useEffect(() => {
    // Cross-tab real-time event listener
    const handleStorageChange = (e) => {
      if (e.key === 'pulsehr_leaves' && e.newValue) {
        try { setLeaves(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === 'pulsehr_projects' && e.newValue) {
        try { setProjects(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === 'pulsehr_employees' && e.newValue) {
        try { setEmployees(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === 'cooperate_notifications' && e.newValue) {
        try { setNotifications(JSON.parse(e.newValue)); } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);

    const syncCloudData = async () => {
      try {
        const [cloudEmps, cloudProjs, cloudLeaves] = await Promise.all([
          getFirestoreEmployees().catch(() => null),
          getFirestoreProjects().catch(() => null),
          getFirestoreLeaves().catch(() => null),
        ]);

        if (cloudEmps && cloudEmps.length > 0) {
          setEmployees(cloudEmps);
          localStorage.setItem('pulsehr_employees', JSON.stringify(cloudEmps));
        }
        if (cloudProjs && cloudProjs.length > 0) {
          setProjects(cloudProjs);
          localStorage.setItem('pulsehr_projects', JSON.stringify(cloudProjs));
        }
        if (cloudLeaves && cloudLeaves.length > 0) {
          setLeaves(cloudLeaves);
          localStorage.setItem('pulsehr_leaves', JSON.stringify(cloudLeaves));
        }
      } catch (e) {
        console.warn('Initial cloud sync notice:', e);
      }
    };
    syncCloudData();

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Filter employees for search query
  const displayedEmployees = searchQuery.trim()
    ? employees.filter((e) => {
        const q = searchQuery.toLowerCase().trim();
        return (
          e.name.toLowerCase().includes(q) ||
          e.role.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q) ||
          (e.skills || []).some((sk) => sk.toLowerCase().includes(q))
        );
      })
    : employees;

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
          notifications={notifications}
          onMarkRead={handleMarkNotificationRead}
          onMarkAllRead={handleMarkAllNotificationsRead}
          onClearAll={handleClearNotifications}
        />

        {/* Main Content */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* VIEW 1: HR EXECUTIVE SUITE (Only rendered if HR Admin is logged in) */}
          {isHR ? (
            <div>
              {activeHRTab === 'dashboard' && (
                <DashboardOverview
                  stats={stats}
                  onNavigateToTab={(tab) => setActiveHRTab(tab)}
                  notifications={notifications}
                />
              )}

              {activeHRTab === 'resources' && (
                <ResourceManager
                  employees={displayedEmployees}
                  projects={projects}
                  onAllocate={handleAllocateEmployee}
                  onDeallocate={handleDeallocateEmployee}
                />
              )}

              {activeHRTab === 'directory' && (
                <WorkforceDirectory
                  employees={displayedEmployees}
                  onCreateEmployee={handleCreateEmployee}
                  onDeleteEmployee={handleDeleteEmployee}
                />
              )}

              {activeHRTab === 'projects' && (
                <ProjectManager
                  projects={projects}
                  employees={employees}
                  onCreateProject={handleCreateProject}
                  onAllocate={handleAllocateEmployee}
                  onDeallocate={handleDeallocateEmployee}
                />
              )}

              {activeHRTab === 'leaves' && (
                <LeaveManager
                  leaves={leaves}
                  employees={employees}
                  onUpdateLeaveStatus={handleUpdateLeaveStatus}
                  onCreateLeave={handleCreateLeave}
                />
              )}
            </div>
          ) : (
            /* VIEW 2: EMPLOYEE SELF-SERVICE (Only rendered if Employee is logged in) */
            <EmployeePortal
              employee={selectedEmployee || currentUser.employee}
              leaves={leaves}
              projects={projects}
              activeSubTab={employeeTab}
              onSubTabChange={setEmployeeTab}
              notifications={notifications}
              onTaskCompleted={handleTaskCompleted}
              onLeaveApplied={handleLeaveApplied}
              onLeaveSubmitted={() => {
                showToast('Leave request submitted! Awaiting manager approval.');
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
