const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Data file paths
const EMPLOYEES_FILE = path.join(__dirname, 'data', 'employees.json');
const PROJECTS_FILE = path.join(__dirname, 'data', 'projects.json');
const LEAVES_FILE = path.join(__dirname, 'data', 'leaves.json');
const TASKS_FILE = path.join(__dirname, 'data', 'tasks.json');
const NOTIFICATIONS_FILE = path.join(__dirname, 'data', 'notifications.json');

// File I/O helpers
async function readData(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return [];
  }
}

async function writeData(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ==========================================
// 1. EMPLOYEES / WORKFORCE DIRECTORY
// ==========================================

// GET /api/employees (with department, search, allocation filter)
app.get('/api/employees', async (req, res) => {
  try {
    let employees = await readData(EMPLOYEES_FILE);
    const { department, allocation, search, skill } = req.query;

    if (department && department !== 'All') {
      employees = employees.filter(
        (e) => e.department.toLowerCase() === department.toLowerCase()
      );
    }

    if (allocation && allocation !== 'All') {
      employees = employees.filter(
        (e) => e.allocationStatus.toLowerCase() === allocation.toLowerCase()
      );
    }

    if (skill && skill.trim()) {
      const s = skill.toLowerCase().trim();
      employees = employees.filter((e) =>
        e.skills.some((sk) => sk.toLowerCase().includes(s))
      );
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      employees = employees.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.role.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.skills.some((sk) => sk.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, count: employees.length, data: employees });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch workforce data' });
  }
});

// GET /api/employees/:id
app.get('/api/employees/:id', async (req, res) => {
  try {
    const employees = await readData(EMPLOYEES_FILE);
    const employee = employees.find((e) => e.id === req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, data: employee });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve employee profile' });
  }
});

// POST /api/employees (HR Onboards a New Employee)
app.post('/api/employees', async (req, res) => {
  try {
    const { id, name, email, phone, department, role, salary, skills, workMode, defaultPassword, password } = req.body;
    if (!name || !email || !department || !role) {
      return res.status(400).json({ success: false, message: 'Missing required onboarding fields' });
    }

    const employees = await readData(EMPLOYEES_FILE);
    const employeeId = id?.trim() || `EMP-${Math.floor(1000 + Math.random() * 9000)}`;

    const newEmployee = {
      id: employeeId,
      name,
      email,
      phone: phone || '+91 98765 43210',
      department,
      role,
      type: 'Full-Time',
      status: 'Active',
      joiningDate: new Date().toISOString().split('T')[0],
      salary: salary || '₹14,50,000 / yr',
      skills: Array.isArray(skills)
        ? skills
        : (skills ? skills.split(',').map((s) => s.trim()) : ['General']),
      workMode: workMode || 'Hybrid (Bengaluru HQ)',
      allocationStatus: 'Available (Bench)',
      allocationPercent: 0,
      assignedProjectId: null,
      assignedProjectName: 'Unassigned (Available for new project)',
      leaveBalance: { paid: 18, sick: 8, casual: 5 },
      defaultPassword: defaultPassword || password || 'Welcome@2026',
      password: defaultPassword || password || 'Welcome@2026',
    };

    employees.unshift(newEmployee);
    await writeData(EMPLOYEES_FILE, employees);

    res.status(201).json({ success: true, data: newEmployee });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to onboard new employee' });
  }
});

// DELETE /api/employees/:id (Offboard/Delete)
app.delete('/api/employees/:id', async (req, res) => {
  try {
    let employees = await readData(EMPLOYEES_FILE);
    const exists = employees.some((e) => e.id === req.params.id);
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    employees = employees.filter((e) => e.id !== req.params.id);
    await writeData(EMPLOYEES_FILE, employees);

    res.json({ success: true, message: 'Employee offboarded successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to offboard employee' });
  }
});

// ==========================================
// 2. RESOURCE ALLOCATION & BENCH MANAGER
// ==========================================

// POST /api/resources/allocate (Assign employee to project with %)
app.post('/api/resources/allocate', async (req, res) => {
  try {
    const { employeeId, projectId, allocationPercent } = req.body;
    if (!employeeId || !projectId) {
      return res.status(400).json({ success: false, message: 'employeeId and projectId are required' });
    }

    const employees = await readData(EMPLOYEES_FILE);
    const projects = await readData(PROJECTS_FILE);

    const emp = employees.find((e) => e.id === employeeId);
    const proj = projects.find((p) => p.id === projectId);

    if (!emp || !proj) {
      return res.status(404).json({ success: false, message: 'Employee or Project not found' });
    }

    // 1. Remove from previous project team if switching projects
    const prevProjectId = emp.assignedProjectId;
    if (prevProjectId && prevProjectId !== proj.id) {
      const prevProj = projects.find((p) => p.id === prevProjectId);
      if (prevProj && Array.isArray(prevProj.allocatedMembers)) {
        prevProj.allocatedMembers = prevProj.allocatedMembers.filter((id) => id !== emp.id);
      }
    }

    // 2. Update employee allocation
    const pct = parseInt(allocationPercent || 100, 10);
    emp.assignedProjectId = proj.id;
    emp.assignedProjectName = proj.name;
    emp.allocationPercent = pct;
    emp.allocationStatus = pct >= 100 ? 'Fully Booked' : pct > 0 ? 'Partially Available' : 'Available (Bench)';

    // 3. Add to new project team if not already present
    if (!Array.isArray(proj.allocatedMembers)) {
      proj.allocatedMembers = [];
    }
    if (!proj.allocatedMembers.includes(emp.id)) {
      proj.allocatedMembers.push(emp.id);
    }

    await writeData(EMPLOYEES_FILE, employees);
    await writeData(PROJECTS_FILE, projects);

    res.json({
      success: true,
      message: `${emp.name} allocated to ${proj.name} at ${pct}% capacity`,
      data: { employee: emp, project: proj },
    });
  } catch (err) {
    console.error('Error in allocate resource:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to allocate resource' });
  }
});

// POST /api/resources/deallocate (Release employee back to Bench)
app.post('/api/resources/deallocate', async (req, res) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'employeeId is required' });
    }

    const employees = await readData(EMPLOYEES_FILE);
    const projects = await readData(PROJECTS_FILE);

    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const prevProjectId = emp.assignedProjectId;
    emp.assignedProjectId = null;
    emp.assignedProjectName = 'Unassigned (Available for new project)';
    emp.allocationPercent = 0;
    emp.allocationStatus = 'Available (Bench)';

    // Remove from previous project team
    if (prevProjectId) {
      const proj = projects.find((p) => p.id === prevProjectId);
      if (proj) {
        proj.allocatedMembers = proj.allocatedMembers.filter((id) => id !== emp.id);
      }
    }

    await writeData(EMPLOYEES_FILE, employees);
    await writeData(PROJECTS_FILE, projects);

    res.json({
      success: true,
      message: `${emp.name} is now released and available on Bench`,
      data: emp,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to release resource' });
  }
});

// ==========================================
// 3. PROJECTS DIRECTORY
// ==========================================

// GET /api/projects
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await readData(PROJECTS_FILE);
    res.json({ success: true, count: projects.length, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch projects' });
  }
});

// POST /api/projects
app.post('/api/projects', async (req, res) => {
  try {
    const { id, name, client, lead, deadline, requiredSkills, priority, budget, allocatedMembers } = req.body;
    if (!name || !client) {
      return res.status(400).json({ success: false, message: 'Project name and client are required' });
    }

    const projects = await readData(PROJECTS_FILE);
    const employees = await readData(EMPLOYEES_FILE);

    const members = Array.isArray(allocatedMembers) ? allocatedMembers : [];
    const newProject = {
      id: id?.trim() || `PROJ-${Math.floor(200 + Math.random() * 800)}`,
      name,
      client,
      status: 'In Progress',
      lead: lead || 'Unassigned',
      startDate: new Date().toISOString().split('T')[0],
      deadline: deadline || '2026-12-31',
      requiredSkills: Array.isArray(requiredSkills)
        ? requiredSkills
        : (requiredSkills ? requiredSkills.split(',').map((s) => s.trim()) : ['React', 'Node.js']),
      allocatedMembers: members,
      budget: budget || '₹40,00,000',
      priority: priority || 'High',
    };

    // Update allocated employees in employees.json
    if (members.length > 0) {
      members.forEach((empId) => {
        const emp = employees.find((e) => e.id === empId);
        if (emp) {
          emp.assignedProjectId = newProject.id;
          emp.assignedProjectName = newProject.name;
          emp.allocationPercent = emp.allocationPercent > 0 ? emp.allocationPercent : 100;
          emp.allocationStatus = emp.allocationPercent >= 100 ? 'Fully Booked' : 'Partially Available';
        }
      });
      await writeData(EMPLOYEES_FILE, employees);
    }

    const existingIdx = projects.findIndex((p) => p.id === newProject.id);
    if (existingIdx >= 0) {
      projects[existingIdx] = newProject;
    } else {
      projects.unshift(newProject);
    }
    await writeData(PROJECTS_FILE, projects);

    res.status(201).json({ success: true, data: newProject });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create project' });
  }
});

// ==========================================
// 4. LEAVE MANAGEMENT & ATTENDANCE
// ==========================================

// GET /api/leaves
app.get('/api/leaves', async (req, res) => {
  try {
    let leaves = await readData(LEAVES_FILE);
    const { status, employeeId } = req.query;

    if (status && status !== 'All') {
      leaves = leaves.filter((l) => l.status.toLowerCase() === status.toLowerCase());
    }

    if (employeeId) {
      leaves = leaves.filter((l) => l.employeeId === employeeId);
    }

    res.json({ success: true, count: leaves.length, data: leaves });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch leave requests' });
  }
});

// POST /api/leaves (Submit Leave Request)
app.post('/api/leaves', async (req, res) => {
  try {
    const { employeeId, leaveType, startDate, endDate, daysCount, reason } = req.body;
    if (!employeeId || !leaveType || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Missing required leave fields' });
    }

    const employees = await readData(EMPLOYEES_FILE);
    const leaves = await readData(LEAVES_FILE);

    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const newLeave = {
      id: `LEV-${Math.floor(400 + Math.random() * 600)}`,
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      leaveType,
      startDate,
      endDate,
      daysCount: parseInt(daysCount || 1, 10),
      reason: reason || 'Personal time off',
      status: 'Pending',
      appliedOn: new Date().toISOString(),
    };

    leaves.unshift(newLeave);
    await writeData(LEAVES_FILE, leaves);

    res.status(201).json({ success: true, data: newLeave });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to submit leave request' });
  }
});

// PATCH /api/leaves/:id/status (Approve or Reject Leave)
app.patch('/api/leaves/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Approved or Rejected' });
    }

    const leaves = await readData(LEAVES_FILE);
    const employees = await readData(EMPLOYEES_FILE);

    const leave = leaves.find((l) => l.id === req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    leave.status = status;

    // If approved, decrement employee leave balance
    if (status === 'Approved') {
      const emp = employees.find((e) => e.id === leave.employeeId);
      if (emp && emp.leaveBalance) {
        const key = leave.leaveType.toLowerCase().includes('sick')
          ? 'sick'
          : leave.leaveType.toLowerCase().includes('casual')
          ? 'casual'
          : 'paid';

        if (emp.leaveBalance[key] !== undefined) {
          emp.leaveBalance[key] = Math.max(0, emp.leaveBalance[key] - leave.daysCount);
        }
      }
      await writeData(EMPLOYEES_FILE, employees);
    }

    await writeData(LEAVES_FILE, leaves);

    res.json({ success: true, data: leave });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update leave status' });
  }
});

// ==========================================
// 4B. EMPLOYEE TASKS & DELIVERABLES ("KYA KAAM MILA HAI")
// ==========================================

// GET /api/tasks (filter by employeeId)
app.get('/api/tasks', async (req, res) => {
  try {
    let tasks = await readData(TASKS_FILE);
    const { employeeId, status } = req.query;

    if (employeeId) {
      tasks = tasks.filter((t) => t.employeeId === employeeId);
    }

    if (status && status !== 'All') {
      tasks = tasks.filter((t) => t.status.toLowerCase() === status.toLowerCase());
    }

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch assigned tasks' });
  }
});

// POST /api/tasks (Assign new task to employee)
app.post('/api/tasks', async (req, res) => {
  try {
    const { employeeId, title, description, projectName, assignedBy, deadline, priority, estimatedHours, category } = req.body;
    if (!employeeId || !title) {
      return res.status(400).json({ success: false, message: 'employeeId and title are required' });
    }

    const tasks = await readData(TASKS_FILE);
    const newTask = {
      id: `TSK-${Math.floor(300 + Math.random() * 700)}`,
      employeeId,
      title,
      description: description || 'No extra notes provided.',
      projectName: projectName || 'General Deliverables',
      assignedBy: assignedBy || 'Lead Manager',
      deadline: deadline || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      priority: priority || 'Medium',
      status: 'In Progress',
      estimatedHours: estimatedHours || '8 hrs',
      category: category || 'General Task',
      createdAt: new Date().toISOString(),
    };

    tasks.unshift(newTask);
    await writeData(TASKS_FILE, tasks);

    res.status(201).json({ success: true, data: newTask });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create task' });
  }
});

// PATCH /api/tasks/:id/status (Toggle/update task status)
app.patch('/api/tasks/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const tasks = await readData(TASKS_FILE);
    const task = tasks.find((t) => t.id === req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.status = status;
    task.updatedAt = new Date().toISOString();
    await writeData(TASKS_FILE, tasks);

    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update task status' });
  }
});

// ==========================================
// 5. HRMS EXECUTIVE DASHBOARD STATS
// ==========================================
app.get('/api/hrms/stats', async (req, res) => {
  try {
    const employees = await readData(EMPLOYEES_FILE);
    const projects = await readData(PROJECTS_FILE);
    const leaves = await readData(LEAVES_FILE);

    const totalHeadcount = employees.length;
    const benchCount = employees.filter((e) => e.allocationStatus === 'Available (Bench)').length;
    const partiallyAllocated = employees.filter((e) => e.allocationStatus === 'Partially Available').length;
    const fullyAllocated = employees.filter((e) => e.allocationStatus === 'Fully Booked').length;

    const benchPercentage = totalHeadcount > 0 ? Math.round((benchCount / totalHeadcount) * 100) : 0;
    const pendingLeavesCount = leaves.filter((l) => l.status === 'Pending').length;

    // Department distribution
    const departmentDistribution = {};
    employees.forEach((e) => {
      departmentDistribution[e.department] = (departmentDistribution[e.department] || 0) + 1;
    });

    // Skill distribution count
    const skillCounts = {};
    employees.forEach((e) => {
      e.skills.forEach((sk) => {
        skillCounts[sk] = (skillCounts[sk] || 0) + 1;
      });
    });

    res.json({
      success: true,
      stats: {
        totalHeadcount,
        benchCount,
        partiallyAllocated,
        fullyAllocated,
        benchPercentage,
        totalProjects: projects.length,
        pendingLeavesCount,
        departmentDistribution,
        topSkills: Object.entries(skillCounts)
          .map(([skill, count]) => ({ skill, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to compute HR stats' });
  }
});

// ==========================================
// 5.5 NOTIFICATIONS ENGINE
// ==========================================
app.get('/api/notifications', async (req, res) => {
  try {
    const notifications = await readData(NOTIFICATIONS_FILE);
    res.json({ success: true, count: notifications.length, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve notifications' });
  }
});

app.post('/api/notifications', async (req, res) => {
  try {
    const notif = req.body;
    const notifications = await readData(NOTIFICATIONS_FILE);
    const newNotif = {
      id: notif.id || `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: notif.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      createdAt: notif.createdAt || new Date().toISOString(),
      ...notif,
    };
    notifications.unshift(newNotif);
    await writeData(NOTIFICATIONS_FILE, notifications.slice(0, 100));
    res.status(201).json({ success: true, data: newNotif });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save notification' });
  }
});

app.patch('/api/notifications/mark-read', async (req, res) => {
  try {
    const { id, all, role, employeeId } = req.body;
    let notifications = await readData(NOTIFICATIONS_FILE);
    if (id) {
      notifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    } else if (all) {
      notifications = notifications.map((n) => {
        const isTarget = role === 'hr'
          ? n.targetRole === 'hr' || n.targetRole === 'all'
          : n.targetRole === 'all' || n.targetEmployeeId === employeeId;
        return isTarget ? { ...n, read: true } : n;
      });
    }
    await writeData(NOTIFICATIONS_FILE, notifications);
    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update notifications' });
  }
});

// ==========================================
// 6. PRODUCTION STATIC CLIENT ASSETS SERVING
// ==========================================
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('Co-Operate HRMS API is running. Client build in progress or not found.');
    }
  });
});

if (require.main === module || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Co-Operate HRMS Enterprise Resource Manager running on http://localhost:${PORT}`);
  });
}

module.exports = app;
