import React, { useState } from 'react';
import { 
  Building2, ShieldCheck, Mail, Lock, ArrowRight, 
  CheckCircle2, Sparkles, AlertCircle, Key, UserCheck 
} from 'lucide-react';

export default function LoginPage({ onLogin, employees = [] }) {
  const [role, setRole] = useState('hr'); // 'hr' | 'employee'
  const [email, setEmail] = useState('admin@cooperatehrms.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError('');
    if (newRole === 'hr') {
      setEmail('admin@cooperatehrms.com');
      setPassword('admin123');
    } else {
      const firstEmp = employees[0];
      setEmail(firstEmp ? firstEmp.email : 'aarav.sharma@cooperate.com');
      setPassword(firstEmp?.defaultPassword || 'Welcome@2026');
    }
  };

  const handleFillDemo = (demoEmail, demoPass, demoRole) => {
    setRole(demoRole);
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  const handleSubmit = (e) => {
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
          name: 'Dylan Hunter',
          email: cleanInput,
          title: 'HR Operations Lead',
        });
      } else {
        setError('Invalid HR Admin credentials. Please use admin@cooperatehrms.com or your corporate HR email.');
        setLoading(false);
      }
    } else {
      // Employee verification by either Work Email OR Employee ID
      const matchedEmployee = employees.find((emp) => {
        const empId = (emp.id || '').toLowerCase();
        const empMail = (emp.email || '').toLowerCase();
        const empUsername = empMail.split('@')[0];
        return cleanInput === empId || cleanInput === empMail || cleanInput === empUsername;
      });

      if (matchedEmployee) {
        const expected = matchedEmployee.defaultPassword || matchedEmployee.password || 'Welcome@2026';
        const firstName = matchedEmployee.name ? matchedEmployee.name.split(' ')[0].toLowerCase() : '';
        
        // Accept configured password, defaultPassword, or standard dev passwords
        const isValidPassword =
          cleanPass === expected ||
          cleanPass === 'Welcome@2026' ||
          cleanPass === 'admin123' ||
          cleanPass === 'password' ||
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
        setError(`No active employee found for "${email}". You can enter either your Corporate Email or Employee ID (e.g. EMP-1001).`);
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5fa] flex items-center justify-center p-4 selection:bg-[#ff5c8a] selection:text-white">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* LEFT BRAND PANEL (Deep Purple #452473) */}
        <div className="bg-[#452473] text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Decorative Background Glows */}
          <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-white/5 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-[#ff5c8a]/15 blur-3xl pointer-events-none" />

          {/* Top Logo */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white text-[#452473] flex items-center justify-center shadow-md font-bold">
                <Building2 className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>Co-Operate</span>
                  <span className="text-[#ff5c8a]">HRMS</span>
                </h1>
                <p className="text-[10px] text-purple-200/80 font-mono uppercase tracking-wider">
                  Enterprise Workforce Portal
                </p>
              </div>
            </div>

            <div className="mt-12 space-y-3">
              <h2 className="text-2xl font-black text-white leading-tight">
                Workforce Capacity & Resource Intelligence
              </h2>
              <p className="text-xs text-purple-200/80 leading-relaxed">
                Secure enterprise sign-in for corporate HR executives and internal staff members.
              </p>
            </div>
          </div>

          {/* Bottom Features checklist */}
          <div className="relative z-10 pt-8 border-t border-white/10 space-y-2.5 text-xs text-purple-200/90 font-medium">
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
        <div className="p-8 sm:p-12 flex flex-col justify-between bg-white">
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
                  {role === 'hr' ? 'HR Corporate Email' : 'Work Email Address or Employee ID'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder={
                      role === 'hr'
                        ? 'admin@cooperatehrms.com'
                        : 'e.g. EMP-1001 or aarav.sharma@cooperate.com'
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
                    placeholder="Enter login password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#452473]/20 font-mono"
                  />
                </div>
              </div>

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

            {/* Quick Demo Credentials Bar */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2 tracking-wider">
                1-Click Industrial Demo Accounts:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleFillDemo('admin@cooperatehrms.com', 'admin123', 'hr')}
                  className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-[#452473] font-bold text-[10px] border border-purple-200 transition"
                >
                  👑 HR Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('EMP-1001', 'Welcome@2026', 'employee')}
                  className="px-2.5 py-1 rounded-lg bg-pink-50 hover:bg-pink-100 text-[#ff5c8a] font-bold text-[10px] border border-pink-200 transition"
                >
                  💻 EMP-1001 (Aarav)
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('EMP-1002', 'Welcome@2026', 'employee')}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] border border-blue-200 transition"
                >
                  🎨 EMP-1002 (Elena)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
