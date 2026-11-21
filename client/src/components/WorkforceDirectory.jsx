import React, { useState } from 'react';
import { 
  Users, Plus, Trash2, Mail, Phone, Calendar, DollarSign, 
  X, Lock, Key, Copy, Check, Eye, EyeOff, ShieldCheck, Search, Filter 
} from 'lucide-react';

export default function WorkforceDirectory({
  employees = [],
  onDataChanged,
  onCreateEmployee,
  onDeleteEmployee,
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper to generate next sequential employee ID
  const getNextEmployeeId = () => {
    const nums = employees
      .map((e) => parseInt((e.id || '').replace('EMP-', ''), 10))
      .filter((n) => !isNaN(n));
    const max = nums.length > 0 ? Math.max(...nums) : 1000;
    return `EMP-${max + 1}`;
  };

  const [newEmp, setNewEmp] = useState({
    id: getNextEmployeeId(),
    name: '',
    email: '',
    defaultPassword: 'Welcome@2026',
    phone: '+91 98765 43210',
    department: 'Engineering',
    role: '',
    salary: '₹14,50,000 / yr',
    skills: 'React, Node.js, TypeScript',
    workMode: 'Hybrid (Bengaluru HQ)',
  });

  // Open modal with fresh sequential ID
  const handleOpenAddModal = () => {
    setNewEmp({
      id: getNextEmployeeId(),
      name: '',
      email: '',
      defaultPassword: 'Welcome@2026',
      phone: '+91 98765 43210',
      department: 'Engineering',
      role: '',
      salary: '₹14,50,000 / yr',
      skills: 'React, Node.js, TypeScript',
      workMode: 'Hybrid (Bengaluru HQ)',
    });
    setShowAddModal(true);
  };

  // Auto-fill corporate email based on name
  const handleNameChange = (val) => {
    const autoEmail = val.trim()
      ? `${val.trim().toLowerCase().replace(/\s+/g, '.')}@cooperate.com`
      : '';
    setNewEmp((prev) => ({
      ...prev,
      name: val,
      email: prev.email && !prev.email.includes('@cooperate.com') ? prev.email : autoEmail,
    }));
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    if (onCreateEmployee) {
      onCreateEmployee(newEmp);
      setShowAddModal(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmp),
      });

      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        if (onDataChanged) onDataChanged();
      }
    } catch (err) {
      alert('Error creating employee');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (id, name) => {
    if (!window.confirm(`Offboard and permanently revoke portal access for ${name} (${id})?`)) return;

    if (onDeleteEmployee) {
      onDeleteEmployee(id);
      return;
    }

    try {
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      if (res.ok && onDataChanged) onDataChanged();
    } catch (err) {
      alert('Error offboarding employee');
    }
  };

  const copyCredentials = (emp) => {
    const text = `Co-Operate HRMS Portal Credentials\nEmployee Name: ${emp.name}\nEmployee ID: ${emp.id}\nWork Email: ${emp.email}\nDefault Password: ${emp.defaultPassword || emp.password || 'Welcome@2026'}\nPortal URL: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopiedId(emp.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesDept = departmentFilter === 'All' || emp.department === departmentFilter;
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || (
      emp.name.toLowerCase().includes(q) ||
      emp.id.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      emp.role.toLowerCase().includes(q) ||
      (emp.skills || []).some((sk) => sk.toLowerCase().includes(q))
    );
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#452473]" />
            Enterprise Workforce & Account Provisioning
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Onboard new personnel, provision corporate credentials & passwords, and manage active departmental staff.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#452473] hover:bg-[#381a60] text-white font-bold text-xs transition shadow-md active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Employee</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID (e.g. EMP-1001), role, or skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Department:
          </span>
          {['All', 'Engineering', 'Design', 'Product', 'HR & Operations'].map((dept) => (
            <button
              key={dept}
              onClick={() => setDepartmentFilter(dept)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                departmentFilter === dept
                  ? 'bg-[#452473] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8f9fc] text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Employee Details</th>
                <th className="py-3.5 px-4">Corporate Credentials</th>
                <th className="py-3.5 px-4">Role & Department</th>
                <th className="py-3.5 px-4">Work Mode</th>
                <th className="py-3.5 px-4">Annual CTC</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {filteredEmployees.map((emp) => {
                const pass = emp.defaultPassword || emp.password || 'Welcome@2026';
                const isCopied = copiedId === emp.id;

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition">
                    {/* Employee Profile */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ff5c8a] to-[#452473] text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                          {emp.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            <span>{emp.name}</span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active Account" />
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{emp.phone || '+91 98765 43210'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Corporate Credentials & Quick Copy */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-purple-100 text-purple-900">
                            {emp.id}
                          </span>
                          <span className="text-[11px] font-mono text-slate-600 truncate max-w-[170px]" title={emp.email}>
                            {emp.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 bg-[#f8f9fc] px-1.5 py-0.5 rounded border border-slate-200">
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span className="font-semibold text-slate-700">{pass}</span>
                          </span>
                          <button
                            onClick={() => copyCredentials(emp)}
                            className={`p-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition ${
                              isCopied
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                            }`}
                            title="Copy Login Credentials for Employee"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Department & Role */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{emp.role}</p>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-mono">
                        {emp.department}
                      </span>
                    </td>

                    {/* Work Mode */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-purple-700 font-medium text-xs">{emp.workMode}</span>
                    </td>

                    {/* Salary */}
                    <td className="py-3.5 px-4 font-bold text-emerald-600">
                      {emp.salary}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                        className="p-2 text-slate-400 hover:text-rose-600 transition rounded-lg hover:bg-rose-50"
                        title="Offboard Employee"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredEmployees.length === 0 && (
        <div className="py-16 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200/80 p-8">
          <UserPlus className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="font-bold text-slate-700 text-sm">No employees in directory yet</p>
          <p className="text-slate-400 mt-1 mb-4">Click "+ Onboard Employee" to provision credentials and add team members.</p>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-[#452473] hover:bg-[#381a60] text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            + Onboard First Employee
          </button>
        </div>
      )}

      {/* MODAL: ONBOARD NEW EMPLOYEE & PROVISION CREDENTIALS */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#452473] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Onboard Employee & Provision Credentials</h3>
                  <p className="text-[11px] text-slate-400">Generate official employee credentials for portal sign-in</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="mt-4 space-y-4 text-xs">
              {/* SECTION 1: CREDENTIALS & ACCOUNT PROVISIONING */}
              <div className="p-4 rounded-2xl bg-[#f8f9fc] border border-purple-200/80 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#452473] block flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[#ff5c8a]" />
                  Corporate Login & Identity Credentials
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Employee ID *</label>
                    <input
                      type="text"
                      required
                      placeholder="EMP-1008"
                      value={newEmp.id}
                      onChange={(e) => setNewEmp({ ...newEmp, id: e.target.value.toUpperCase() })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#452473]/30"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Unique official company ID</span>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Default Password *</label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        required
                        placeholder="Welcome@2026"
                        value={newEmp.defaultPassword}
                        onChange={(e) => setNewEmp({ ...newEmp, defaultPassword: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 pr-16 text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#452473]/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                      >
                        {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Default password for first sign-in</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pooja Verma"
                      value={newEmp.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#452473]/30"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Corporate Work Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="pooja.verma@cooperate.com"
                      value={newEmp.email}
                      onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value.toLowerCase() })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#452473]/30"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: DEPARTMENT & PROFESSIONAL DETAILS */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Department *</label>
                    <select
                      value={newEmp.department}
                      onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                      className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Design">Design</option>
                      <option value="Product">Product</option>
                      <option value="HR & Operations">HR & Operations</option>
                      <option value="Finance">Finance</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Role / Designation *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior Fullstack Engineer"
                      value={newEmp.role}
                      onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })}
                      className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Work Mode</label>
                    <select
                      value={newEmp.workMode}
                      onChange={(e) => setNewEmp({ ...newEmp, workMode: e.target.value })}
                      className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
                    >
                      <option value="Hybrid (Bengaluru HQ)">Hybrid (Bengaluru HQ)</option>
                      <option value="In-Office (Hyderabad)">In-Office (Hyderabad)</option>
                      <option value="Remote (Mumbai)">Remote (Mumbai)</option>
                      <option value="Remote (Pune)">Remote (Pune)</option>
                      <option value="Remote (Delhi NCR)">Remote (Delhi NCR)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Annual CTC (INR)</label>
                    <input
                      type="text"
                      placeholder="₹18,50,000 / yr"
                      value={newEmp.salary}
                      onChange={(e) => setNewEmp({ ...newEmp, salary: e.target.value })}
                      className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Mobile Contact</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={newEmp.phone}
                      onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
                      className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Core Technical Skills</label>
                  <input
                    type="text"
                    placeholder="React, Node.js, TypeScript, PostgreSQL"
                    value={newEmp.skills}
                    onChange={(e) => setNewEmp({ ...newEmp, skills: e.target.value })}
                    className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Account status will be set to <strong className="text-emerald-600">Active</strong> on Bench.
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 rounded-xl bg-[#452473] hover:bg-[#381a60] text-white font-bold shadow-md active:scale-95"
                  >
                    {loading ? 'Provisioning...' : 'Provision & Onboard'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
