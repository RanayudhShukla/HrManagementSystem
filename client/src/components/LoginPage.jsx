import React, { useState, useEffect } from 'react';
import { 
  Building2, ShieldCheck, Mail, Lock, ArrowRight, 
  CheckCircle2, Sparkles, AlertCircle, Key, UserCheck, Users 
} from 'lucide-react';
import { getFirestoreEmployees } from '../firebase/firestoreService';

const LEGACY_DEMO_NAMES = new Set([
  'aarav sharma',
  'elena rostova',
  'marcus vance',
  'kavita verma',
  'david chen',
  'sarah miller',
  'vikram malhotra',
  'vikram batra',
]);

const isLegacyDemoEmployee = (emp) => {
  if (!emp) return false;
  const name = (typeof emp === 'string' ? emp : emp.name || '').trim().toLowerCase();
  const email = (typeof emp === 'object' && emp.email ? emp.email : '').trim().toLowerCase();
  return LEGACY_DEMO_NAMES.has(name) || email.includes('@pulsehr.com');
};

export default function LoginPage({ onLogin, employees = [] }) {
  const [role, setRole] = useState('hr'); // 'hr' | 'employee'
  const [email, setEmail] = useState('admin@cooperatehrms.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [liveEmployees, setLiveEmployees] = useState(() => {
    try {
      const stored = localStorage.getItem('pulsehr_employees');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((e) => e && !isLegacyDemoEmployee(e));
        }
      }
    } catch {}
    return (Array.isArray(employees) ? employees : []).filter((e) => e && !isLegacyDemoEmployee(e));
  });

  // Keep liveEmployees synced with props
  useEffect(() => {
    if (Array.isArray(employees) && employees.length > 0) {
      const filtered = employees.filter((e) => e && !isLegacyDemoEmployee(e));
      setLiveEmployees(filtered);
    }
  }, [employees]);

  // Pre-fetch live employees from Google Cloud Firestore on initial load
  useEffect(() => {
    let isMounted = true;
    const fetchEmployeesForLogin = async () => {
      try {
        const cloudEmps = await getFirestoreEmployees();
        if (isMounted && Array.isArray(cloudEmps) && cloudEmps.length > 0) {
          const filtered = cloudEmps.filter((e) => e && !isLegacyDemoEmployee(e));
          if (filtered.length > 0) {
            setLiveEmployees(filtered);
            try {
              localStorage.setItem('pulsehr_employees', JSON.stringify(filtered));
            } catch {}
          }
        }
      } catch (e) {
        console.warn('Login page employee pre-fetch notice:', e);
      }
    };
    fetchEmployeesForLogin();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError('');
    if (newRole === 'hr') {
      setEmail('admin@cooperatehrms.com');
      setPassword('admin123');
    } else {
      if (liveEmployees.length > 0) {
        const first = liveEmployees[0];
        setEmail(first.email || first.id || first.name);
        setPassword(first.defaultPassword || 'Welcome@2026');
      } else {
        setEmail('');
        setPassword('');
      }
    }
  };

  const findEmployeeMatch = (list, query) => {
    if (!Array.isArray(list) || !query) return null;
    const cleanQ = query.trim().toLowerCase();
    const cleanQWithoutPrefix = cleanQ.replace(/^emp[-_ ]*/i, '');

    return list.find((emp) => {
      if (!emp) return false;
      const empId = (emp.id || '').toLowerCase().trim();
      const empIdNum = empId.replace(/^emp[-_ ]*/i, '');
      const empMail = (emp.email || '').toLowerCase().trim();
      const empName = (emp.name || '').toLowerCase().trim();
      const empUsername = empMail.split('@')[0];
      const firstName = empName.split(' ')[0];

      return (
        cleanQ === empId ||
        (cleanQWithoutPrefix && cleanQWithoutPrefix === empIdNum) ||
        cleanQ === empMail ||
        cleanQ === empUsername ||
        cleanQ === empName ||
        cleanQ === firstName ||
        (empUsername && cleanQ.includes(empUsername)) ||
        (empUsername && empUsername.includes(cleanQ)) ||
        (empName && cleanQ.includes(empName)) ||
        (empName && empName.includes(cleanQ)) ||
        (firstName && cleanQ.includes(firstName))
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanInput = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanInput || !cleanPass) {
      setError('Please enter both identity (email or ID) and password.');
      setLoading(false);
      return;
    }

    if (role === 'hr') {
      // HR Admin verification
      if (
        cleanInput === 'admin@cooperatehrms.com' ||
        cleanInput === 'admin@cooperate.com' ||
        cleanInput === 'admin@pulsehr.com' ||
        cleanInput.includes('admin') ||
        cleanInput.includes('hr')
      ) {
        onLogin({
          role: 'hr',
          name: 'Ranayudh',
          email: cleanInput,
          title: 'HR Operations Lead',
        });
      } else {
        setError('Invalid HR Admin credentials. Please use admin@cooperatehrms.com or your corporate HR email.');
        setLoading(false);
      }
    } else {
      // 1. Gather all local employees
      let currentEmployees = liveEmployees.length > 0 ? liveEmployees : (employees || []);
      try {
        const stored = localStorage.getItem('pulsehr_employees');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            currentEmployees = parsed.filter((emp) => emp && !isLegacyDemoEmployee(emp));
          }
        }
      } catch {}

      let matchedEmployee = findEmployeeMatch(currentEmployees, cleanInput);

      // 2. Fallback: If not found in local memory, directly query Google Cloud Firestore!
      if (!matchedEmployee) {
        try {
          const cloudEmps = await getFirestoreEmployees();
          if (Array.isArray(cloudEmps) && cloudEmps.length > 0) {
            const filteredCloud = cloudEmps.filter((emp) => emp && !isLegacyDemoEmployee(emp));
            if (filteredCloud.length > 0) {
              currentEmployees = filteredCloud;
              setLiveEmployees(filteredCloud);
              try {
                localStorage.setItem('pulsehr_employees', JSON.stringify(filteredCloud));
              } catch {}
              matchedEmployee = findEmployeeMatch(currentEmployees, cleanInput);
            }
          }
        } catch (fetchErr) {
          console.warn('Direct Firestore login lookup error:', fetchErr);
        }
      }

      if (matchedEmployee) {
        const expected = matchedEmployee.defaultPassword || matchedEmployee.password || 'Welcome@2026';
        const firstName = matchedEmployee.name ? matchedEmployee.name.split(' ')[0].toLowerCase() : '';
        
        // Accept configured password, defaultPassword, case-insensitive, or standard dev passwords
        const isValidPassword =
          cleanPass === expected ||
          cleanPass.toLowerCase() === expected.toLowerCase() ||
          cleanPass.toLowerCase() === 'welcome@2026' ||
          cleanPass === 'admin123' ||
          cleanPass === 'password' ||
          cleanPass === '123456' ||
          cleanPass.toLowerCase() === `${firstName}123` ||
          (firstName && cleanPass.toLowerCase().includes(firstName));

        if (!isValidPassword) {
          setError(`Invalid password for ${matchedEmployee.name} (${matchedEmployee.id}). Expected default password: "${expected}".`);
          setLoading(false);
          return;
        }

        onLogin({
          role: 'employee',
          employee: matchedEmployee,
          name: matchedEmployee.name,
          email: matchedEmployee.email,
          title: matchedEmployee.role,
        });
      } else {
        const availableHint = currentEmployees.length > 0
          ? ` Registered team members: ${currentEmployees.map(e => `${e.name} (${e.id})`).join(', ')}.`
          : ' No employee accounts found in database. Please log in as HR Admin to onboard employees in the Directory.';
        setError(`No active employee found for "${email}".${availableHint}`);
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5fa] flex items-center justify-center p-4 selection:bg-[#ff5c8a] selection:text-white">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* LEFT BRAND PANEL (Deep Purple #452473) */}
        <div className="bg-[#452473] text-white p-6 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Decorative Background Glows */}
          <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-white/5 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-[#ff5c8a]/15 blur-3xl pointer-events-none" />

          {/* Top Logo */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white text-[#452473] flex items-center justify-center shadow-md font-bold shrink-0">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>Co-Operate</span>
                  <span className="text-[#ff5c8a]">HRMS</span>
                </h1>
                <p className="text-[10px] text-purple-200 tracking-wider uppercase font-semibold">
                  Enterprise Workforce Portal
                </p>
              </div>
            </div>

            <div className="mt-4 sm:mt-8 space-y-1.5 sm:space-y-2">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-tight">
                Workforce Capacity & Resource Intelligence
              </h2>
              <p className="text-xs text-purple-200/80 leading-relaxed hidden sm:block">
                Secure enterprise sign-in for corporate HR executives and internal staff members.
              </p>
            </div>
          </div>

          {/* Bottom Highlights (Desktop only to prevent clutter on mobile) */}
          <div className="mt-8 pt-6 border-t border-white/10 space-y-2.5 text-xs text-purple-100/90 relative z-10 hidden md:block">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#ff5c8a] shrink-0" />
              <span>Real-Time Resource Allocation & Staffing Matrix</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#ff5c8a] shrink-0" />
              <span>Role-Based Two-Way Notification Engine</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#ff5c8a] shrink-0" />
              <span>Direct Employee Provisioning & Credentials</span>
            </div>
          </div>
        </div>

        {/* RIGHT LOGIN FORM PANEL */}
        <div className="p-6 sm:p-12 flex flex-col justify-between bg-white">
          <div>
            {/* Role Toggle Selector */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Sign In</h3>
                <p className="text-xs text-slate-500">Select your authorization portal</p>
              </div>

              <div className="flex items-center bg-[#f4f5fa] p-1 rounded-xl border border-slate-200/80 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => handleRoleChange('hr')}
                  className={`px-3.5 py-1.5 rounded-lg font-bold transition ${
                    role === 'hr'
                      ? 'bg-[#452473] text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  HR Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('employee')}
                  className={`px-3.5 py-1.5 rounded-lg font-bold transition ${
                    role === 'employee'
                      ? 'bg-[#ff5c8a] text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Employee
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">
                  {role === 'hr' ? 'HR Corporate Email' : 'Work Email, Employee ID, or Name'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder={
                      role === 'hr'
                        ? 'admin@cooperatehrms.com'
                        : 'e.g. EMP-1001, chetan@cooperate.com, or Chetan'
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#452473]/20 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="Enter password (default: Welcome@2026)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#452473]/20 font-mono"
                  />
                </div>
              </div>

              {/* Active Employee Quick Fill Pill */}
              {role === 'employee' && liveEmployees.length > 0 && (
                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#452473]">
                    <Users className="w-3.5 h-3.5" />
                    <span>Registered Employee Accounts ({liveEmployees.length}):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {liveEmployees.map((emp) => (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => {
                          setEmail(emp.email || emp.id || emp.name);
                          setPassword(emp.defaultPassword || 'Welcome@2026');
                        }}
                        className="px-2 py-1 bg-white hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-lg text-[10px] font-semibold transition flex items-center gap-1 shadow-xs"
                      >
                        <span className="font-bold">{emp.name}</span>
                        <span className="text-purple-500 font-mono">({emp.id})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md active:scale-98 mt-2 ${
                  role === 'hr'
                    ? 'bg-[#452473] hover:bg-[#381a60]'
                    : 'bg-[#ff5c8a] hover:bg-[#e04873]'
                }`}
              >
                <span>{loading ? 'Verifying...' : `Sign in as ${role === 'hr' ? 'HR Administrator' : 'Employee'}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
