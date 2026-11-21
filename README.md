# 🏢 PulseHR — Enterprise Workforce & Resource Allocation Suite (with Role-Based Auth)

> **Web Development Final Internship Capstone Project**  
> Built with HTML, CSS, JavaScript, React 19, Tailwind CSS, Google Firebase Firestore, Node.js & Express REST API.

---

## 🌟 Overview
**PulseHR** is an enterprise-grade Human Resource Management System (HRMS) and **Resource Capacity Allocation Portal** designed for modern IT companies, software consultancies, and digital agencies. 

It features an **Authentication Gateway** supporting two distinct corporate roles:
1. **HR / Operations Administrator:** Full organizational control over workforce capacity, bench talent deployment, client project staffing, and employee leave approvals.
2. **Employee Self-Service (ESS):** Dedicated staff member portal displaying individual project allocation, live daily attendance clock in/out, and personal leave balances.

---

## 🔐 Authentication & Role-Based Access Control (RBAC)

| Account Role | Sample Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **HR Administrator** | `admin@pulsehr.com` | `admin123` | Complete company dashboard, resource allocation matrix, staff onboarding, project creation, and leave approval actions. |
| **Employee (Lead Dev)** | `aarav.sharma@pulsehr.com` | `emp123` | Personal ESS portal, assigned project overview, daily attendance shift clock-in, and leave application filing. |
| **Employee (UI Designer)** | `elena.r@pulsehr.com` | `emp123` | Personal leave balances, current project staffing, and request history. |

*Tip for Presentation:* The login screen has **1-Click Quick Demo Login buttons** (`Dylan Hunter - HR Admin` & `Aarav Sharma - Lead Dev`) for seamless evaluator demonstrations without manual password typing!

---

## 🚀 Key Functional Modules

### 1. Resource Capacity & Bench Manager (Core Feature)
- **Real-Time Allocation Statuses:**
  - 🟢 **Fully Booked (100% Allocation):** Staffed full-time on client deliverables.
  - 🟡 **Partially Available (50% Allocation):** Has capacity to take on additional tasks.
  - 🟣 **Available on Bench (0% Allocation):** Unassigned talent ready to be deployed immediately.
- **Skill-Based Talent Discovery:** Quick-filter employees by technical skills (*React, TypeScript, Node.js, Python, AWS, Docker, Figma*).
- **1-Click Project Staffing Modal:** Assign an employee to a project with 50% or 100% capacity in real-time.
- **Release to Bench:** 1-click deallocation to return a team member back to the available talent pool.

### 2. Executive HR Dashboard & Analytics
- **Matching Reference Design:** Left Deep Purple Sidebar (`#452473`), Coral-Pink active pills (`#ff5c8a`), and clean white cards.
- **Live Corporate KPIs:** Total Headcount, Bench Availability % (free capacity), Active Client Deliverables, and Pending Leave Approvals.
- **Visual Capacity Wave Chart:** Monthly staffing trajectory curve across Jan – Jun.
- **Employees Availability Widget:** 4 quick boxes (*Attendance, Bench, Hybrid/Remote, Leave Apply*).
- **Total Employees Donut Chart:** Pink & Blue circular donut.

### 3. Time-Off & Leave Management System
- Leave requests dashboard showing employee name, leave type (*Paid Annual Leave, Sick Leave, Casual Leave*), dates, and reason.
- **1-Click Approvals:** HR managers can **Approve** or **Reject** requests in real-time.
- **Automatic Balance Decrement:** When a leave request is approved, the system automatically subtracts the approved days from that employee's remaining leave balance!

### 4. Employee Self-Service (ESS) Portal
- When logged in as an Employee:
  - Personal profile and assigned client project.
  - Live **Attendance Clock-In / Clock-Out** toggle.
  - Visual Leave Balances (Paid, Sick, Casual).
  - Time-off application form and personal leave history status tracker.

---

## ⚡ Quick Start (How to Run)

```bash
npm run dev
```

- **Web App Login & Portal:** `http://localhost:5173/`
- **Backend REST API:** `http://localhost:5000/api/hrms/stats`
