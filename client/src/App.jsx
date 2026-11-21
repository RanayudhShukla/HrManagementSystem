import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardOverview from './components/DashboardOverview';
import ResourceManager from './components/ResourceManager';
import WorkforceDirectory from './components/WorkforceDirectory';
import ProjectManager from './components/ProjectManager';
import LeaveManager from './components/LeaveManager';
import EmployeePortal from './components/EmployeePortal';
import LoginPage from './components/LoginPage';
import FirebaseModal from './components/FirebaseModal';
import { Check, AlertCircle } from 'lucide-react';
import { SEED_EMPLOYEES, SEED_PROJECTS, SEED_LEAVES, SEED_TASKS, SEED_NOTIFICATIONS } from './data/seedData';
import { 
  syncEmployeeToFirestore, syncProjectToFirestore, 
  syncLeaveToFirestore, syncTaskToFirestore,
  deleteEmployeeFromFirestore, deleteProjectFromFirestore, deleteLeaveFromFirestore,
  getFirestoreEmployees, getFirestoreProjects, getFirestoreLeaves,
  subscribeToFirestoreEmployees, subscribeToFirestoreProjects, subscribeToFirestoreLeaves,
  seedFirestoreWithData 
} from './firebase/firestoreService';

// Cross-tab / cross-window BroadcastChannel for instant real-time zero-refresh synchronization
let broadcastChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('cooperate_hrms_live_sync');
  }
} catch (e) {
  console.warn('BroadcastChannel initialization notice:', e);
}

const broadcastSync = (payload) => {
  try {
    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'COOPERATE_HRMS_SYNC',
        timestamp: Date.now(),
        ...payload,
      });
    }
  } catch {}
};

function computeStats(emps, projs, lvs) {
  const safeEmps = Array.isArray(emps) ? emps : [];
  const safeProjs = Array.isArray(projs) ? projs : [];
  const safeLvs = Array.isArray(lvs) ? lvs : [];

  const totalHeadcount = safeEmps.length;
  const benchCount = safeEmps.filter((e) => (e.allocationStatus || 'Available (Bench)').toLowerCase().includes('bench') || (e.allocationPercent || 0) === 0).length;
  const partiallyAllocated = safeEmps.filter((e) => (e.allocationPercent || 0) > 0 && (e.allocationPercent || 0) < 100).length;
  const fullyAllocated = safeEmps.filter((e) => (e.allocationPercent || 0) >= 100).length;
  const benchPercentage = totalHeadcount > 0 ? Math.round((benchCount / totalHeadcount) * 100) : 0;
  const pendingLeavesCount = safeLvs.filter((l) => l.status === 'Pending').length;

  const departmentDistribution = {};
  safeEmps.forEach((e) => {
    const dept = e.department || 'General';
    departmentDistribution[dept] = (departmentDistribution[dept] || 0) + 1;
  });

  const skillCounts = {};
  safeEmps.forEach((e) => {
    const rawSkills = Array.isArray(e.skills)
      ? e.skills
      : typeof e.skills === 'string'
      ? e.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    rawSkills.forEach((sk) => {
      skillCounts[sk] = (skillCounts[sk] || 0) + 1;
    });
  });

  return {
    totalHeadcount,
    benchCount,
    partiallyAllocated,
    fullyAllocated,
    benchPercentage,
    totalProjects: safeProjs.length,
    pendingLeavesCount,
    departmentDistribution,
    topSkills: Object.entries(skillCounts)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
  };
}

// Legacy demo identities permanently purged from the production database
const DEMO_EMPLOYEE_IDS = new Set(['EMP-1001', 'EMP-1002', 'EMP-1003', 'EMP-1004', 'EMP-1005', 'EMP-1006', 'EMP-1007', 'EMP-3201']);
const DEMO_NAMES = new Set(['Aarav Sharma', 'Elena Rostova', 'Marcus Vance', 'Kavita Verma', 'David Chen', 'Sarah Miller', 'Vikram Malhotra', 'Vikram Batra']);

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const session = sessionStorage.getItem('pulsehr_auth');
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed?.role === 'employee' && (DEMO_EMPLOYEE_IDS.has(parsed.employee?.id) || DEMO_NAMES.has(parsed.employee?.name))) {
          sessionStorage.removeItem('pulsehr_auth');
        } else {
          return parsed;
        }
      }
      const saved = localStorage.getItem('pulsehr_auth');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.role === 'employee' && (DEMO_EMPLOYEE_IDS.has(parsed.employee?.id) || DEMO_NAMES.has(parsed.employee?.name))) {
          localStorage.removeItem('pulsehr_auth');
          return null;
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [activeHRTab, setActiveHRTab] = useState('dashboard'); // 'dashboard' | 'resources' | 'directory' | 'projects' | 'leaves'
  const [employeeTab, setEmployeeTab] = useState('tasks'); // 'tasks' | 'holidays' | 'leaves' | 'payroll'
  
  // Authoritative State with instant localStorage persistence (Clean Corporate Slate)
  const [employees, setEmployees] = useState(() => {
    try {
      const saved = localStorage.getItem('pulsehr_employees');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Clean out legacy demo employees so only Admin-added employees exist
        const realEmployees = parsed
          .filter((e) => !DEMO_EMPLOYEE_IDS.has(e.id) && !DEMO_NAMES.has(e.name))
          .map((e) => ({
            ...e,
            allocationStatus: e.allocationStatus || 'Available (Bench)',
            allocationPercent: typeof e.allocationPercent === 'number' ? e.allocationPercent : 0,
            skills: Array.isArray(e.skills)
              ? e.skills
              : typeof e.skills === 'string'
              ? e.skills.split(',').map((s) => s.trim()).filter(Boolean)
              : ['General'],
            leaveBalance: e.leaveBalance || { paid: 18, sick: 8, casual: 5 },
          }));
        localStorage.setItem('pulsehr_employees', JSON.stringify(realEmployees));
        return realEmployees;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('pulsehr_projects');
      if (saved) {
        const parsed = JSON.parse(saved);
        const cleaned = parsed.map((p) => ({
          ...p,
          allocatedMembers: Array.isArray(p.allocatedMembers)
            ? p.allocatedMembers.filter((id) => !DEMO_EMPLOYEE_IDS.has(id))
            : [],
        }));
        localStorage.setItem('pulsehr_projects', JSON.stringify(cleaned));
        return cleaned;
      }
      return SEED_PROJECTS;
    } catch {
      return SEED_PROJECTS;
    }
  });

  const [leaves, setLeaves] = useState(() => {
    try {
      const saved = localStorage.getItem('pulsehr_leaves');
      if (saved) {
        const parsed = JSON.parse(saved);
        const cleaned = parsed.filter((l) => !DEMO_EMPLOYEE_IDS.has(l.employeeId));
        localStorage.setItem('pulsehr_leaves', JSON.stringify(cleaned));
        return cleaned;
      }
      return [];
    } catch {
      return [];
    }
  });

  const stats = useMemo(() => computeStats(employees, projects, leaves), [employees, projects, leaves]);
  const setStats = () => {}; // Reactive useMemo auto-recalculates stats on any state change
  
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState('');
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);
  const [firestoreConnected, setFirestoreConnected] = useState(false);

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
    const newNotifObj = {
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      createdAt: new Date().toISOString(),
      ...notif,
    };
    setNotifications((prev) => {
      const updated = [newNotifObj, ...prev];
      localStorage.setItem('cooperate_notifications', JSON.stringify(updated));
      broadcastSync({ notifications: updated });
      return updated;
    });

    try {
      fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotifObj),
      }).catch(() => {});
    } catch {}
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
    sessionStorage.setItem('pulsehr_auth', JSON.stringify(user));
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
    sessionStorage.removeItem('pulsehr_auth');
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
    broadcastSync({ employees: updatedEmployees, projects: updatedProjects });
    showToast(`${emp.name} allocated to ${proj.name} at ${pct}% capacity!`);

    // If the currently active session is this employee, update session cache immediately
    if (currentUser?.employee?.id === employeeId) {
      const updatedEmpObj = updatedEmployees.find((e) => e.id === employeeId);
      if (updatedEmpObj) {
        const updatedAuth = { ...currentUser, employee: updatedEmpObj };
        setCurrentUser(updatedAuth);
        setSelectedEmployee(updatedEmpObj);
        localStorage.setItem('pulsehr_auth', JSON.stringify(updatedAuth));
      }
    }

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
    broadcastSync({ employees: updatedEmployees, projects: updatedProjects });
    showToast(`${emp.name} released and returned to Bench.`);

    // If currently logged-in user is this employee, update active session
    if (currentUser?.employee?.id === employeeId) {
      const updatedEmpObj = updatedEmployees.find((e) => e.id === employeeId);
      if (updatedEmpObj) {
        const updatedAuth = { ...currentUser, employee: updatedEmpObj };
        setCurrentUser(updatedAuth);
        setSelectedEmployee(updatedEmpObj);
        localStorage.setItem('pulsehr_auth', JSON.stringify(updatedAuth));
      }
    }

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
    broadcastSync({ employees: updatedEmployees });
    showToast(`New employee ${createdEmp.name} (${createdEmp.id}) onboarded!`);

    addNotification({
      title: 'Employee Onboarded',
      message: `${createdEmp.name} was onboarded to ${createdEmp.department} with credentials ID: ${createdEmp.id}.`,
      type: 'system',
      targetRole: 'hr',
    });

    try {
      await syncEmployeeToFirestore(createdEmp);
    } catch {}
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
    broadcastSync({ employees: updatedEmployees });
    showToast('Employee offboarded from company directory.');

    deleteEmployeeFromFirestore(employeeId);
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

      // If active session is one of the assigned employees, update session cache
      if (assignedIds.includes(currentUser?.employee?.id)) {
        const updatedEmpObj = updatedEmployees.find((e) => e.id === currentUser?.employee?.id);
        if (updatedEmpObj) {
          const updatedAuth = { ...currentUser, employee: updatedEmpObj };
          setCurrentUser(updatedAuth);
          setSelectedEmployee(updatedEmpObj);
          localStorage.setItem('pulsehr_auth', JSON.stringify(updatedAuth));
        }
      }
    }

    broadcastSync({ employees: updatedEmployees, projects: updatedProjects });
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

  // 5b. DELETE PROJECT HANDLER (With Auto-Release of Squad & Firestore Sync)
  const handleDeleteProject = async (projectId) => {
    const projToDelete = projects.find((p) => p.id === projectId);
    const updatedProjects = projects.filter((p) => p.id !== projectId);
    
    // Automatically release any employees assigned to this project back to bench
    let affectedEmployeeIds = [];
    const updatedEmployees = employees.map((emp) => {
      if (emp.assignedProjectId === projectId) {
        affectedEmployeeIds.push(emp.id);
        return {
          ...emp,
          assignedProjectId: null,
          assignedProjectName: 'Unassigned (Available for new project)',
          allocationPercent: 0,
          allocationStatus: 'Available (Bench)',
        };
      }
      return emp;
    });

    setProjects(updatedProjects);
    setEmployees(updatedEmployees);
    localStorage.setItem('pulsehr_projects', JSON.stringify(updatedProjects));
    localStorage.setItem('pulsehr_employees', JSON.stringify(updatedEmployees));
    broadcastSync({ projects: updatedProjects, employees: updatedEmployees });

    showToast(`Project "${projToDelete?.name || projectId}" removed successfully.`);

    addNotification({
      title: 'Project Removed',
      message: `Project "${projToDelete?.name || projectId}" was deleted. Allocated resources returned to bench.`,
      type: 'system',
      targetRole: 'hr',
    });

    // Cloud Firestore Sync
    deleteProjectFromFirestore(projectId);
    for (const empId of affectedEmployeeIds) {
      const updatedEmp = updatedEmployees.find((e) => e.id === empId);
      if (updatedEmp) syncEmployeeToFirestore(updatedEmp);
    }

    try {
      await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
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

    broadcastSync({ employees: updatedEmployees, leaves: updatedLeaves });
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

    broadcastSync({ employees: updatedEmployees, leaves: updatedLeaves });
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
    broadcastSync({ leaves: updatedLeaves });

    addNotification({
      title: 'New Leave Request Filed',
      message: `${emp?.name || employeeName} applied for ${leaveData.leaveType} (${leaveData.daysCount} days: ${leaveData.startDate} to ${leaveData.endDate}).`,
      type: 'leave_applied',
      targetRole: 'hr',
    });

    syncLeaveToFirestore(newLeaveEntry);
    showToast('Leave request submitted! HR has been notified.');
  };

  // Layer 0: Google Cloud Firebase Firestore Live Two-Way Sync Engine
  useEffect(() => {
    let unsubEmps = () => {};
    let unsubProjs = () => {};
    let unsubLeaves = () => {};

    const initCloudFirestore = async () => {
      try {
        const [cloudEmps, cloudProjs, cloudLeaves] = await Promise.all([
          getFirestoreEmployees(),
          getFirestoreProjects(),
          getFirestoreLeaves(),
        ]);

        // If Firestore projects collection is empty, seed initial corporate projects
        if (Array.isArray(cloudProjs) && cloudProjs.length === 0) {
          await seedFirestoreWithData([], SEED_PROJECTS, []);
          setProjects(SEED_PROJECTS);
          localStorage.setItem('pulsehr_projects', JSON.stringify(SEED_PROJECTS));
        } else if (Array.isArray(cloudProjs) && cloudProjs.length > 0) {
          setProjects(cloudProjs);
          localStorage.setItem('pulsehr_projects', JSON.stringify(cloudProjs));
        }

        // If Firestore has employees, sync them to local state & storage
        if (Array.isArray(cloudEmps) && cloudEmps.length > 0) {
          const validEmps = cloudEmps
            .filter((e) => !DEMO_EMPLOYEE_IDS.has(e.id) && !DEMO_NAMES.has(e.name))
            .map((e) => ({
              ...e,
              allocationStatus: e.allocationStatus || 'Available (Bench)',
              allocationPercent: typeof e.allocationPercent === 'number' ? e.allocationPercent : 0,
              skills: Array.isArray(e.skills)
                ? e.skills
                : typeof e.skills === 'string'
                ? e.skills.split(',').map((s) => s.trim()).filter(Boolean)
                : ['General'],
              leaveBalance: e.leaveBalance || { paid: 18, sick: 8, casual: 5 },
            }));
          setEmployees(validEmps);
          localStorage.setItem('pulsehr_employees', JSON.stringify(validEmps));
        } else {
          // If Firestore is empty but we have local employees, push them up to Firestore
          const localEmps = localStorage.getItem('pulsehr_employees');
          if (localEmps) {
            try {
              const parsed = JSON.parse(localEmps);
              const valid = (Array.isArray(parsed) ? parsed : []).filter((e) => !DEMO_EMPLOYEE_IDS.has(e.id) && !DEMO_NAMES.has(e.name));
              for (const emp of valid) {
                await syncEmployeeToFirestore(emp);
              }
            } catch {}
          }
        }

        if (Array.isArray(cloudLeaves) && cloudLeaves.length > 0) {
          const validLeaves = cloudLeaves.filter((l) => !DEMO_EMPLOYEE_IDS.has(l.employeeId));
          setLeaves(validLeaves);
          localStorage.setItem('pulsehr_leaves', JSON.stringify(validLeaves));
        }

        setFirestoreConnected(true);

        // Realtime listener for employees in Firestore
        unsubEmps = subscribeToFirestoreEmployees((cloudEmps) => {
          if (Array.isArray(cloudEmps) && cloudEmps.length > 0) {
            const validEmps = cloudEmps
              .filter((e) => !DEMO_EMPLOYEE_IDS.has(e.id) && !DEMO_NAMES.has(e.name))
              .map((e) => ({
                ...e,
                allocationStatus: e.allocationStatus || 'Available (Bench)',
                allocationPercent: typeof e.allocationPercent === 'number' ? e.allocationPercent : 0,
                skills: Array.isArray(e.skills)
                  ? e.skills
                  : typeof e.skills === 'string'
                  ? e.skills.split(',').map((s) => s.trim()).filter(Boolean)
                  : ['General'],
                leaveBalance: e.leaveBalance || { paid: 18, sick: 8, casual: 5 },
              }));
            if (validEmps.length > 0) {
              setEmployees(validEmps);
              localStorage.setItem('pulsehr_employees', JSON.stringify(validEmps));
            }
          }
        });

        // Realtime listener for projects in Firestore
        unsubProjs = subscribeToFirestoreProjects((cloudProjs) => {
          if (Array.isArray(cloudProjs) && cloudProjs.length > 0) {
            setProjects(cloudProjs);
            localStorage.setItem('pulsehr_projects', JSON.stringify(cloudProjs));
          }
        });

        // Realtime listener for leaves in Firestore
        unsubLeaves = subscribeToFirestoreLeaves((cloudLeaves) => {
          if (Array.isArray(cloudLeaves)) {
            const validLeaves = cloudLeaves.filter((l) => !DEMO_EMPLOYEE_IDS.has(l.employeeId));
            setLeaves(validLeaves);
            localStorage.setItem('pulsehr_leaves', JSON.stringify(validLeaves));
          }
        });
      } catch (err) {
        console.warn('Firestore initialization notice:', err);
      }
    };

    initCloudFirestore();

    return () => {
      unsubEmps();
      unsubProjs();
      unsubLeaves();
    };
  }, []);

  // Dual-Layer Zero-Refresh Real-Time Sync Engine (Tabs & Windows)
  useEffect(() => {
    // Layer 1: Instant Cross-Tab/Window BroadcastChannel Listener
    const handleBroadcastMessage = (event) => {
      if (!event.data || event.data.type !== 'COOPERATE_HRMS_SYNC') return;
      const { employees: newEmps, projects: newProjs, leaves: newLeaves, notifications: newNotifs } = event.data;
      if (newEmps) setEmployees(newEmps);
      if (newProjs) setProjects(newProjs);
      if (newLeaves) setLeaves(newLeaves);
      if (newNotifs) setNotifications(newNotifs);
    };

    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', handleBroadcastMessage);
    }

    // Layer 2: Native Cross-Tab Storage Event Listener
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

    // Layer 3: Heartbeat Local Cache Sync (every 1.5s)
    // Synchronizes across active tabs without ever overwriting with old server files
    const localHeartbeat = setInterval(() => {
      try {
        const storedEmps = localStorage.getItem('pulsehr_employees');
        if (storedEmps) {
          const parsed = JSON.parse(storedEmps);
          setEmployees((prev) => (JSON.stringify(prev) !== storedEmps ? parsed : prev));
        }
        const storedProjs = localStorage.getItem('pulsehr_projects');
        if (storedProjs) {
          const parsed = JSON.parse(storedProjs);
          setProjects((prev) => (JSON.stringify(prev) !== storedProjs ? parsed : prev));
        }
        const storedLeaves = localStorage.getItem('pulsehr_leaves');
        if (storedLeaves) {
          const parsed = JSON.parse(storedLeaves);
          setLeaves((prev) => (JSON.stringify(prev) !== storedLeaves ? parsed : prev));
        }
        const storedNotifs = localStorage.getItem('cooperate_notifications');
        if (storedNotifs) {
          const parsed = JSON.parse(storedNotifs);
          setNotifications((prev) => (JSON.stringify(prev) !== storedNotifs ? parsed : prev));
        }
      } catch {}
    }, 1500);

    return () => {
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', handleBroadcastMessage);
      }
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(localHeartbeat);
    };
  }, []);

  // Filter employees for search query
  const displayedEmployees = searchQuery.trim()
    ? employees.filter((e) => {
        const q = searchQuery.toLowerCase().trim();
        const sks = Array.isArray(e.skills)
          ? e.skills
          : typeof e.skills === 'string'
          ? e.skills.split(',').map((s) => s.trim()).filter(Boolean)
          : [];
        return (
          (e.name || '').toLowerCase().includes(q) ||
          (e.role || '').toLowerCase().includes(q) ||
          (e.department || '').toLowerCase().includes(q) ||
          sks.some((sk) => sk.toLowerCase().includes(q))
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

  // Authoritative live employee object dynamically synced from live employees array
  const activeEmpId = currentUser?.employee?.id || selectedEmployee?.id;
  const liveEmployee = activeEmpId
    ? (employees.find((e) => e.id === activeEmpId) || selectedEmployee || currentUser?.employee)
    : (selectedEmployee || currentUser?.employee);

  // If user is logged in as an employee, but their employee record was purged or not found,
  // gracefully clear the stale session and redirect to LoginPage rather than crashing!
  if (!isHR && (!liveEmployee || !liveEmployee.id)) {
    try {
      sessionStorage.removeItem('pulsehr_auth');
      localStorage.removeItem('pulsehr_auth');
    } catch {}
    return <LoginPage onLogin={handleLogin} employees={employees} />;
  }

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
          employees={employees}
          onOpenFirebaseModal={() => setShowFirebaseModal(true)}
          firestoreConnected={firestoreConnected}
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
                  employees={employees}
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
                  onDeleteProject={handleDeleteProject}
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
              employee={liveEmployee}
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

      {/* Google Cloud Firebase Cloud Firestore Database Modal */}
      <FirebaseModal
        isOpen={showFirebaseModal}
        onClose={() => setShowFirebaseModal(false)}
        employees={employees}
        projects={projects}
        leaves={leaves}
        onNotify={showToast}
      />
    </div>
  );
}
