export const SEED_EMPLOYEES = [];

export const SEED_PROJECTS = [
  {
    id: "PROJ-247",
    name: "NextGen Cloud Payroll Platform",
    client: "NextGen Enterprise",
    status: "In Progress",
    lead: "Engineering Lead",
    startDate: "2026-11-21",
    deadline: "2026-12-31",
    requiredSkills: ["React", "Node.js", "Cloud"],
    allocatedMembers: [],
    budget: "₹40,00,000",
    priority: "High"
  },
  {
    id: "PROJ-201",
    name: "BharatPay UPI & Banking Gateway",
    client: "BharatPay Financial Technologies",
    status: "In Progress",
    lead: "Technical PM",
    startDate: "2024-05-01",
    deadline: "2026-12-30",
    requiredSkills: ["React", "TypeScript", "Node.js", "Security"],
    allocatedMembers: [],
    budget: "₹48,00,000",
    priority: "High"
  },
  {
    id: "PROJ-202",
    name: "Vortex Cloud Analytics Platform",
    client: "Tata Digital Analytics Ltd.",
    status: "In Progress",
    lead: "Design Lead",
    startDate: "2024-06-15",
    deadline: "2027-01-20",
    requiredSkills: ["UI/UX", "React", "Node.js", "PostgreSQL"],
    allocatedMembers: [],
    budget: "₹35,00,000",
    priority: "Medium"
  },
  {
    id: "PROJ-203",
    name: "Q4 Global Tech Hiring Ramp",
    client: "Internal HR Operations",
    status: "In Progress",
    lead: "HR Operations",
    startDate: "2024-09-01",
    deadline: "2026-12-31",
    requiredSkills: ["Talent Acquisition", "Onboarding", "Screening"],
    allocatedMembers: [],
    budget: "₹15,00,000",
    priority: "High"
  },
  {
    id: "PROJ-204",
    name: "AI Workflow Automation Engine",
    client: "Reliance Jio Healthcare Systems",
    status: "Planning",
    lead: "Tech Architect",
    startDate: "2026-12-01",
    deadline: "2027-04-15",
    requiredSkills: ["Python", "Docker", "DevOps", "Microservices"],
    allocatedMembers: [],
    budget: "₹55,00,000",
    priority: "Urgent"
  }
];

export const SEED_LEAVES = [];

export const SEED_TASKS = [];

export const SEED_NOTIFICATIONS = [
  {
    id: 'NOTIF-101',
    title: 'Co-Operate HRMS Suite Online',
    message: 'Welcome to Co-Operate HRMS enterprise resource portal. All modules initialized.',
    type: 'system',
    targetRole: 'all',
    timestamp: 'Just now',
    read: false,
    createdAt: new Date().toISOString()
  }
];
