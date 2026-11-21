import React, { useState } from 'react';
import { 
  Building2, ShieldCheck, User, Lock, Mail, ArrowRight, 
  CheckCircle2, AlertCircle 
} from 'lucide-react';

export default function LoginPage({ onLogin, employees }) {
  const [role, setRole] = useState('hr'); // 'hr' | 'employee'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    if (role === 'hr') {
      // HR Admin verification
      if (
        cleanEmail === 'admin@cooperatehrms.com' ||
        cleanEmail === 'admin@cooperate.com' ||
        cleanEmail === 'admin@pulsehr.com' ||
        cleanEmail.includes('admin') ||
        cleanEmail.includes('hr')
      ) {
        onLogin({
          role: 'hr',
          name: 'Dylan Hunter',
          email: cleanEmail,
          title: 'HR Operations Lead',
        });
      } else {
        setError('Invalid HR Admin credentials. Please use admin@cooperatehrms.com or your corporate HR email.');
        setLoading(false);
      }
    } else {
      // Employee verification directly from employees database
      const matchedEmployee = employees.find(
        (emp) =>
          emp.email.toLowerCase() === cleanEmail ||
          emp.email.toLowerCase().split('@')[0] === cleanEmail.split('@')[0]
      );

      if (matchedEmployee) {
        onLogin({
          role: 'employee',
          employee: matchedEmployee,
          name: matchedEmployee.name,
          email: matchedEmployee.email,
          title: matchedEmployee.role,
        });
      } else {
        setError(`No active employee account found for "${email}". Check your work email and try again.`);
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

          {/* Feature Highlights List */}
          <div className="relative z-10 my-8 space-y-2.5 text-xs text-purple-100/90 border-y border-white/10 py-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#ff5c8a]" />
              <span>Real-time Bench & Project Staffing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#72c2ff]" />
              <span>Time-Off Approvals & Leave Balance Sync</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Role-Based Secure Credentials Verification</span>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="relative z-10 text-[11px] text-purple-200/60 font-mono">
            © 2026 Co-Operate HRMS Suite. All rights reserved.
          </div>
        </div>

        {/* RIGHT LOGIN FORM PANEL */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <div>
            {/* Role Switcher Tabs */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900">Sign In</h3>
                <p className="text-xs text-slate-500 mt-0.5">Enter your work credentials</p>
              </div>

              <div className="flex p-1 rounded-xl bg-[#f4f5fa] border border-slate-200 text-xs">
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
                  {role === 'hr' ? 'HR Corporate Email' : 'Work Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder={role === 'hr' ? 'admin@cooperatehrms.com' : 'e.g. aarav.sharma@cooperate.com'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
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
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
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
          </div>
        </div>
      </div>
    </div>
  );
}
