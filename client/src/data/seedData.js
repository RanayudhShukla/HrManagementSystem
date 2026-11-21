export const SEED_EMPLOYEES = [
  {
    "id": "EMP-1001",
    "name": "Aarav Sharma",
    "email": "aarav.sharma@pulsehr.com",
    "phone": "+91 98765 43210",
    "department": "Engineering",
    "role": "Lead Frontend Architect",
    "type": "Full-Time",
    "status": "Active",
    "joiningDate": "2023-03-15",
    "salary": "₹18,50,000 / yr",
    "skills": [
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Next.js",
      "Performance"
    ],
    "workMode": "Hybrid (Bengaluru HQ)",
    "allocationStatus": "Fully Booked",
    "allocationPercent": 100,
    "assignedProjectId": "PROJ-201",
    "assignedProjectName": "BharatPay UPI & Banking Gateway",
    "leaveBalance": {
      "paid": 11,
      "sick": 6,
      "casual": 4
    }
  },
  {
    "id": "EMP-1002",
    "name": "Elena Rostova",
    "email": "elena.r@pulsehr.com",
    "phone": "+91 98112 33445",
    "department": "Design",
    "role": "Principal UI/UX Designer",
    "type": "Full-Time",
    "status": "Active",
    "joiningDate": "2023-07-01",
    "salary": "₹15,00,000 / yr",
    "skills": [
      "Figma",
      "Design Systems",
      "User Research",
      "Wireframing"
    ],
    "workMode": "Remote (Mumbai)",
    "allocationStatus": "Partially Available",
    "allocationPercent": 50,
    "assignedProjectId": "PROJ-202",
    "assignedProjectName": "Vortex Cloud Analytics Platform",
    "leaveBalance": {
      "paid": 16,
      "sick": 7,
      "casual": 5
    }
  },
  {
    "id": "EMP-1003",
    "name": "Marcus Vance",
    "email": "marcus.v@pulsehr.com",
    "phone": "+91 99223 88122",
    "department": "Engineering",
    "role": "Senior Backend Engineer",
    "type": "Full-Time",
    "status": "Active",
    "joiningDate": "2024-01-10",
    "salary": "₹16,80,000 / yr",
    "skills": [
      "Node.js",
      "Express",
      "PostgreSQL",
      "Docker",
      "Redis"
    ],
    "workMode": "In-Office (Hyderabad)",
    "allocationStatus": "Available (Bench)",
    "allocationPercent": 0,
    "assignedProjectId": null,
    "assignedProjectName": "Unassigned (Available for new project)",
    "leaveBalance": {
      "paid": 18,
      "sick": 8,
      "casual": 5
    }
  },
  {
    "id": "EMP-1004",
    "name": "Kavita Verma",
    "email": "kavita.v@pulsehr.com",
    "phone": "+91 91234 56789",
    "department": "HR & Operations",
    "role": "Senior Talent Acquisition Manager",
    "type": "Full-Time",
    "status": "Active",
    "joiningDate": "2022-11-20",
    "salary": "₹12,50,000 / yr",
    "skills": [
      "Workforce Planning",
      "ATS",
      "Onboarding",
      "Employee Relations"
    ],
    "workMode": "Hybrid (Bengaluru HQ)",
    "allocationStatus": "Fully Booked",
    "allocationPercent": 100,
    "assignedProjectId": "PROJ-203",
    "assignedProjectName": "Q4 India Tech Hiring Ramp",
    "leaveBalance": {
      "paid": 12,
      "sick": 5,
      "casual": 3
    }
  },
  {
    "id": "EMP-1005",
    "name": "David Chen",
    "email": "david.chen@pulsehr.com",
    "phone": "+91 97788 11223",
    "department": "Product",
    "role": "Senior Technical Product Manager",
    "type": "Full-Time",
    "status": "Active",
    "joiningDate": "2023-09-12",
    "salary": "₹22,00,000 / yr",
    "skills": [
      "Product Strategy",
      "Agile",
      "Roadmapping",
      "SQL",
      "Jira"
    ],
    "workMode": "Remote (Pune)",
    "allocationStatus": "Fully Booked",
    "allocationPercent": 100,
    "assignedProjectId": "PROJ-201",
    "assignedProjectName": "BharatPay UPI & Banking Gateway",
    "leaveBalance": {
      "paid": 15,
      "sick": 6,
      "casual": 4
    }
  },
  {
    "id": "EMP-1006",
    "name": "Sarah Miller",
    "email": "sarah.m@pulsehr.com",
    "phone": "+91 96655 44332",
    "department": "Engineering",
    "role": "Cloud DevOps Engineer",
    "type": "Full-Time",
    "status": "Active",
    "joiningDate": "2024-04-18",
    "salary": "₹17,00,000 / yr",
    "skills": [
      "AWS",
      "Kubernetes",
      "Terraform",
      "CI/CD",
      "Linux"
    ],
    "workMode": "Remote (Gurugram)",
    "allocationStatus": "Available (Bench)",
    "allocationPercent": 0,
    "assignedProjectId": null,
    "assignedProjectName": "Unassigned (Available for new project)",
    "leaveBalance": {
      "paid": 20,
      "sick": 8,
      "casual": 5
    }
  },
  {
    "id": "EMP-1007",
    "name": "Vikram Malhotra",
    "email": "vikram.m@pulsehr.com",
    "phone": "+91 99887 76655",
    "department": "Engineering",
    "role": "Full-Stack Software Engineer",
    "type": "Full-Time",
    "status": "Active",
    "joiningDate": "2024-02-01",
    "salary": "₹14,00,000 / yr",
    "skills": [
      "React",
      "Node.js",
      "MongoDB",
      "Express",
      "Git"
    ],
    "workMode": "Hybrid (Bengaluru HQ)",
    "allocationStatus": "Partially Available",
    "allocationPercent": 50,
    "assignedProjectId": "PROJ-202",
    "assignedProjectName": "Vortex Cloud Analytics Platform",
    "leaveBalance": {
      "paid": 17,
      "sick": 7,
      "casual": 5
    }
  }
];

export const SEED_PROJECTS = [
  {
    "id": "PROJ-201",
    "name": "BharatPay UPI & Banking Gateway",
    "client": "BharatPay India Financial Technologies",
    "status": "In Progress",
    "lead": "David Chen",
    "startDate": "2024-05-01",
    "deadline": "2026-12-30",
    "requiredSkills": [
      "React",
      "TypeScript",
      "Node.js",
      "Security"
    ],
    "allocatedMembers": [
      "EMP-1001",
      "EMP-1005"
    ],
    "budget": "₹48,00,000",
    "priority": "High"
  },
  {
    "id": "PROJ-202",
    "name": "Vortex Cloud Analytics Platform",
    "client": "Tata Digital Analytics Ltd.",
    "status": "In Progress",
    "lead": "Elena Rostova",
    "startDate": "2024-06-15",
    "deadline": "2027-01-20",
    "requiredSkills": [
      "UI/UX",
      "React",
      "Node.js",
      "PostgreSQL"
    ],
    "allocatedMembers": [
      "EMP-1002",
      "EMP-1007"
    ],
    "budget": "₹35,00,000",
    "priority": "Medium"
  },
  {
    "id": "PROJ-203",
    "name": "Q4 India Tech Hiring Ramp",
    "client": "Internal HR Operations (India)",
    "status": "In Progress",
    "lead": "Kavita Verma",
    "startDate": "2024-09-01",
    "deadline": "2026-12-31",
    "requiredSkills": [
      "Talent Acquisition",
      "Onboarding",
      "Screening"
    ],
    "allocatedMembers": [
      "EMP-1004"
    ],
    "budget": "₹15,00,000",
    "priority": "High"
  },
  {
    "id": "PROJ-204",
    "name": "AI Workflow Automation Engine",
    "client": "Reliance Jio Healthcare Systems",
    "status": "Planning",
    "lead": "Marcus Vance",
    "startDate": "2026-12-01",
    "deadline": "2027-04-15",
    "requiredSkills": [
      "Python",
      "Docker",
      "DevOps",
      "Microservices"
    ],
    "allocatedMembers": [],
    "budget": "₹55,00,000",
    "priority": "Urgent"
  }
];

export const SEED_LEAVES = [
  {
    "id": "LEV-401",
    "employeeId": "EMP-1001",
    "employeeName": "Aarav Sharma",
    "department": "Engineering",
    "leaveType": "Paid Time Off",
    "startDate": "2026-11-25",
    "endDate": "2026-11-27",
    "daysCount": 3,
    "reason": "Family function and travel to hometown.",
    "status": "Approved",
    "appliedOn": "2026-11-19T14:30:00.000Z"
  },
  {
    "id": "LEV-402",
    "employeeId": "EMP-1003",
    "employeeName": "Marcus Vance",
    "department": "Engineering",
    "leaveType": "Sick Leave",
    "startDate": "2026-11-21",
    "endDate": "2026-11-21",
    "daysCount": 1,
    "reason": "Dental appointment and recovery.",
    "status": "Pending",
    "appliedOn": "2026-11-20T09:15:00.000Z"
  },
  {
    "id": "LEV-403",
    "employeeId": "EMP-1002",
    "employeeName": "Elena Rostova",
    "department": "Design",
    "leaveType": "Casual Leave",
    "startDate": "2026-11-14",
    "endDate": "2026-11-15",
    "daysCount": 2,
    "reason": "Personal errands and medical checkup.",
    "status": "Approved",
    "appliedOn": "2026-11-10T11:00:00.000Z"
  }
];

export const SEED_TASKS = [
  {
    "id": "TSK-301",
    "employeeId": "EMP-1001",
    "title": "Build UPI Dynamic QR & Payment Gateway Checkout Flow",
    "description": "Implement instant QR generation and webhook callback listeners with retry fallback for failed merchant transactions.",
    "projectName": "BharatPay UPI & Banking Gateway",
    "assignedBy": "David Chen (Lead PM)",
    "deadline": "2026-11-28",
    "priority": "High",
    "status": "In Progress",
    "estimatedHours": "18 hrs",
    "category": "Frontend Architecture"
  },
  {
    "id": "TSK-302",
    "employeeId": "EMP-1001",
    "title": "Optimize Core Web Vitals for Merchant Dashboard",
    "description": "Audit chunk splitting in Vite/React to achieve < 1.2s LCP on mobile 4G networks across Tier-2 Indian cities.",
    "projectName": "BharatPay UPI & Banking Gateway",
    "assignedBy": "David Chen (Lead PM)",
    "deadline": "2026-12-05",
    "priority": "Medium",
    "status": "Pending",
    "estimatedHours": "12 hrs",
    "category": "Performance Tuning"
  },
  {
    "id": "TSK-303",
    "employeeId": "EMP-1001",
    "title": "Conduct Code Review for Auth Token Refresh Interceptor",
    "description": "Review Vikram's PR on JWT token refresh rotation and multi-device session invalidation.",
    "projectName": "BharatPay UPI & Banking Gateway",
    "assignedBy": "Engineering VP",
    "deadline": "2026-11-22",
    "priority": "High",
    "status": "Completed",
    "estimatedHours": "4 hrs",
    "category": "Code Review"
  },
  {
    "id": "TSK-304",
    "employeeId": "EMP-1002",
    "title": "Design Tata Digital Executive Dashboard in Figma",
    "description": "Finalize dark/light mode token libraries, responsive data tables, and export design tokens for React developers.",
    "projectName": "Vortex Cloud Analytics Platform",
    "assignedBy": "Product VP",
    "deadline": "2026-11-26",
    "priority": "High",
    "status": "In Progress",
    "estimatedHours": "20 hrs",
    "category": "UI/UX Design"
  },
  {
    "id": "TSK-305",
    "employeeId": "EMP-1002",
    "title": "Usability Testing with 5 Client Stakeholders",
    "description": "Schedule 45-min Zoom sessions to observe user navigation friction on the newly launched metric filter drawer.",
    "projectName": "Vortex Cloud Analytics Platform",
    "assignedBy": "Product VP",
    "deadline": "2026-12-02",
    "priority": "Medium",
    "status": "Pending",
    "estimatedHours": "10 hrs",
    "category": "User Research"
  },
  {
    "id": "TSK-306",
    "employeeId": "EMP-1003",
    "title": "Bench Upskilling: Complete Docker & Kubernetes Certification",
    "description": "Complete internal cloud microservices training module and build sandbox demo deployment for upcoming Jio Healthcare project.",
    "projectName": "Internal Technical Excellence (Bench)",
    "assignedBy": "Tech Director",
    "deadline": "2026-11-30",
    "priority": "Medium",
    "status": "In Progress",
    "estimatedHours": "24 hrs",
    "category": "Skill Enhancement"
  },
  {
    "id": "TSK-307",
    "employeeId": "EMP-1004",
    "title": "Screen & Schedule 12 Senior React/Node Developer Interviews",
    "description": "Conduct initial round HR screenings, CTC expectation alignment (Indian market rates), and schedule L1 tech rounds with Vikram.",
    "projectName": "Q4 India Tech Hiring Ramp",
    "assignedBy": "HR Director",
    "deadline": "2026-11-25",
    "priority": "High",
    "status": "In Progress",
    "estimatedHours": "15 hrs",
    "category": "Talent Acquisition"
  },
  {
    "id": "TSK-308",
    "employeeId": "EMP-1004",
    "title": "Prepare Annual Performance Appraisal & Increment Cycle Guidelines",
    "description": "Draft FY2026-27 appraisal rubric, bell curve distribution guidelines, and manager training deck.",
    "projectName": "Internal HR Operations (India)",
    "assignedBy": "HR Director",
    "deadline": "2026-12-10",
    "priority": "Medium",
    "status": "Pending",
    "estimatedHours": "16 hrs",
    "category": "HR Policy"
  },
  {
    "id": "TSK-309",
    "employeeId": "EMP-1005",
    "title": "Review BharatPay Q4 Sprint Roadmap & Deliverable Timelines",
    "description": "Align sprint backlog with client requirements, lock milestone dates for staging sign-off, and track team burn-down velocity.",
    "projectName": "BharatPay UPI & Banking Gateway",
    "assignedBy": "Client Director",
    "deadline": "2026-11-24",
    "priority": "High",
    "status": "In Progress",
    "estimatedHours": "8 hrs",
    "category": "Sprint Management"
  },
  {
    "id": "TSK-310",
    "employeeId": "EMP-1006",
    "title": "Setup AWS Multi-AZ Terraform Infrastructure Boilerplate",
    "description": "Write reusable Terraform modules for ECS Fargate, ALB, and RDS Aurora PostgreSQL with encrypted secrets management.",
    "projectName": "Internal Technical Excellence (Bench)",
    "assignedBy": "Cloud Architect",
    "deadline": "2026-12-01",
    "priority": "Medium",
    "status": "In Progress",
    "estimatedHours": "20 hrs",
    "category": "DevOps / Cloud"
  },
  {
    "id": "TSK-311",
    "employeeId": "EMP-1007",
    "title": "Develop Real-time Event Streaming Ingestion API",
    "description": "Implement Node.js/PostgreSQL pipeline to consume 5,000 analytics events/sec with batch insert optimizations.",
    "projectName": "Vortex Cloud Analytics Platform",
    "assignedBy": "Elena Rostova (Lead)",
    "deadline": "2026-11-29",
    "priority": "High",
    "status": "In Progress",
    "estimatedHours": "16 hrs",
    "category": "Backend Engineering"
  }
];
