# 🏢 Co-Operate HRMS — Enterprise Workforce & Resource Intelligence Platform

[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4.0-38B2AC.svg)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28.svg)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Enterprise HR Resource Management System (HRMS) & Workforce Allocation Suite**  
> Designed for modern IT consultancies, software engineering firms, and digital enterprises. Features a complete Role-Based Access Control (RBAC) architecture separating **Executive HR Administration** from **Employee Self-Service (ESS)** with native enterprise localization (₹ currency, corporate compliance, and the 2026 Official Gazetted Corporate Holidays Calendar).

---

## 🌟 Key Architectural Highlights

* 🛡️ **Role-Based Authentication (RBAC):** Strict credential-based authorization separating HR Administrators from Employee Self-Service.
* 📊 **Executive HR Intelligence Suite:** Live KPI telemetry, monthly workforce trajectory wave visualizer, bench capacity utilization %, and department distributions.
* ⚡ **Resource Capacity & Bench Allocation Engine:** Real-time staffing matrix tracking *Fully Booked (100%)*, *Partially Available (50%)*, and *Available on Bench (0%)* talent across client projects.
* 📋 **Employee Sprint Deliverables ("Kya Kaam Mila Hai"):** Dedicated employee task board with real-time status toggling (*In Progress* ⇄ *Completed*), priority tags, deadlines, and effort estimations.
* 🏛️ **Corporate Compensation & Global Tech Hubs:**
  * All compensation and budgets tracked in **Rupees (₹ Lakhs & Crores)**.
  * **2026 Official Corporate & Public Holidays** (17 approved days with category filters).
  * Global tech engineering hubs (*Bengaluru HQ, Hyderabad Tech Center, Mumbai, Pune, Gurugram*).
  * EPFO (12% matching), HRA, Standard Deduction & Form-16 compliant structure.
* 🌴 **Leave & Attendance Engine:** Automated leave balance decrementing upon approval, multi-category time-off filing (*Paid Annual, Medical, Casual, Optional*), and live IST shift clock in/out.
* 🚀 **Multi-Cloud Deployment Ready:** Pre-configured for seamless 1-click deployment on **Vercel**, **Render**, and **Firebase Hosting**.

---

## 🔐 Credentials & Role-Based Access

The platform utilizes direct email/password verification against the company directory:

| Role | Work Email | Password | Access & Permissions |
| :--- | :--- | :--- | :--- |
| **HR Administrator** | `admin@cooperatehrms.com` | `admin123` | Full administrative control: Workforce directory, bench allocation, project staffing, leave approval/rejection, and analytics. |
| **Lead Frontend Dev** | `aarav.sharma@cooperate.com` | `any password` | ESS Portal: Assigned sprint deliverables (UPI Gateway), leave balances, corporate holiday calendar, CTC breakdown. |
| **Principal UI Designer** | `elena.r@cooperate.com` | `any password` | ESS Portal: Vortex Cloud design deliverables, attendance tracking, leave requests history. |
| **Backend Engineer** | `marcus.v@cooperate.com` | `any password` | ESS Portal: Bench upskilling deliverables, personal attendance, leave application. |
| **Talent Acquisition Mgr**| `kavita.v@cooperate.com` | `any password` | ESS Portal: Technical hiring deliverables, leave records. |

---

## 🏗️ Technology Stack

* **Frontend:** React 19, Vite, Tailwind CSS v4, Lucide React Icons
* **Backend:** Node.js, Express.js RESTful API, Morgan Logger, CORS
* **Database & Cloud:** Google Firebase Firestore (`hrsystem-b0734`), JSON Persistence with resilient offline client caching fallback
* **Deployment Orchestration:** Vercel Serverless (`vercel.json`), Render Web Service (`render.yaml`), Firebase Hosting (`firebase.json`)

---

## 📡 REST API Reference

### Workforce & Resource Endpoints
* `GET /api/employees` — Query workforce directory with `?department=`, `?allocation=`, `?search=`, and `?skill=` filters.
* `GET /api/employees/:id` — Retrieve detailed employee profile.
* `POST /api/employees` — Onboard new employee with standardized CTC and base office.
* `DELETE /api/employees/:id` — Offboard employee.
* `POST /api/resources/allocate` — Assign employee to project with 50% or 100% capacity.
* `POST /api/resources/deallocate` — Release employee back to Bench pool (0% allocation).

### Projects & Staffing Endpoints
* `GET /api/projects` — Fetch all client deliverables and staffed engineering squads.
* `POST /api/projects` — Create project with project budget (₹) and skill requirements.

### Sprint Tasks & Deliverables Endpoints
* `GET /api/tasks?employeeId=:id` — Fetch sprint deliverables assigned to an employee.
* `POST /api/tasks` — Assign new task with deadline and effort estimation.
* `PATCH /api/tasks/:id/status` — Toggle status (`In Progress` ⇄ `Completed`).

### Time-Off & Analytics Endpoints
* `GET /api/leaves` — Fetch leave requests history.
* `POST /api/leaves` — Submit leave application.
* `PATCH /api/leaves/:id/status` — Approve or Reject leave (automatically decrements employee leave balance).
* `GET /api/hrms/stats` — Executive dashboard KPIs and bench distribution metrics.

---

## 📁 Repository Structure

```
├── api/
│   └── index.js             # Vercel serverless entrypoint
├── client/                  # React 19 + Vite Frontend
│   ├── src/
│   │   ├── components/      # UI Modular Components
│   │   │   ├── Sidebar.jsx           # Deep Purple #452473 navigation
│   │   │   ├── Header.jsx            # Top profile & search bar
│   │   │   ├── DashboardOverview.jsx # Executive KPI & wave telemetry
│   │   │   ├── ResourceManager.jsx   # Bench & capacity staffing
│   │   │   ├── WorkforceDirectory.jsx# Employee CRUD & skill filters
│   │   │   ├── ProjectManager.jsx    # Client accounts & budget tracking
│   │   │   ├── LeaveManager.jsx      # Time-off approval system
│   │   │   ├── EmployeePortal.jsx    # ESS: Tasks, Holidays, CTC
│   │   │   └── LoginPage.jsx         # Direct RBAC authentication
│   │   ├── data/seedData.js # Resilient offline client seed
│   │   └── firebase/        # Firebase Firestore SDK integration
│   └── vite.config.js       # Vite proxy & build configuration
├── server/                  # Node.js + Express REST API
│   ├── data/                # Persistent JSON database
│   │   ├── employees.json   # Workforce data with INR salaries
│   │   ├── projects.json    # Client accounts with INR budgets
│   │   ├── leaves.json      # Time-off requests history
│   │   └── tasks.json       # Sprint deliverables database
│   └── server.js            # Express server & static asset handler
├── render.yaml              # Render cloud deployment config
├── vercel.json              # Vercel serverless deployment config
├── firebase.json            # Firebase Hosting configuration
└── package.json             # Root monorepo scripts
```

---

## 🚀 Local Development Setup

### Prerequisites
* Node.js v18+ installed
* npm v9+ installed

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/<YOUR_USERNAME>/co-operate-hrms.git
cd co-operate-hrms

# Install dependencies
npm install
npm install --prefix client
npm install --prefix server
```

### 2. Run Full-Stack Development Server
```bash
npm run dev
```
* **Frontend Portal:** `http://localhost:5173/`
* **Backend REST API:** `http://localhost:5000/api/hrms/stats`

### 3. Production Build & Local Serve
```bash
npm run build
npm start
```
Starts the unified production server on port 5000 serving both API and bundled React client.

---

## ☁️ Live Cloud Deployment

### Option A: Vercel (Instant 1-Click Serverless)
```bash
npx vercel
```

### Option B: Render (Full-Stack Container)
1. Push this repository to GitHub.
2. Link the repository on [Render](https://render.com).
3. Render automatically picks up `render.yaml` and deploys your full-stack app on a free live URL!

### Option C: Firebase Hosting
```bash
npx firebase-tools login
npx firebase-tools deploy
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
