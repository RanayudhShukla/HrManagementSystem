import React, { useState } from 'react';
import { Users, Plus, Trash2, Mail, Phone, Calendar, DollarSign, X } from 'lucide-react';

export default function WorkforceDirectory({
  employees,
  onDataChanged,
  onCreateEmployee,
  onDeleteEmployee,
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmp, setNewEmp] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Engineering',
    role: '',
    salary: '₹14,00,000 / yr',
    skills: '',
    workMode: 'Hybrid (Bengaluru HQ)',
  });
  const [loading, setLoading] = useState(false);

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    if (onCreateEmployee) {
      onCreateEmployee(newEmp);
      setShowAddModal(false);
      setNewEmp({
        name: '',
        email: '',
        phone: '',
        department: 'Engineering',
        role: '',
        salary: '₹14,00,000 / yr',
        skills: '',
        workMode: 'Hybrid (Bengaluru HQ)',
      });
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
        setNewEmp({
          name: '',
          email: '',
          phone: '',
          department: 'Engineering',
          role: '',
          salary: '₹14,00,000 / yr',
          skills: '',
          workMode: 'Hybrid (Bengaluru HQ)',
        });
        if (onDataChanged) onDataChanged();
      }
    } catch (err) {
      alert('Error creating employee');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (id, name) => {
    if (!window.confirm(`Offboard and remove ${name} from the company directory?`)) return;

    if (onDeleteEmployee) {
      onDeleteEmployee(id);
      return;
    }

    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        if (onDataChanged) onDataChanged();
      }
    } catch (err) {
      alert('Error offboarding employee');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#452473]" />
            Company Staff & Workforce Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage company personnel, departmental rosters, compensation, and onboarding.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#452473] hover:bg-[#381a60] text-white font-bold text-xs transition shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard New Employee</span>
        </button>
      </div>

      {/* Directory Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8f9fc] text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Department & Role</th>
                <th className="py-3.5 px-4">Work Mode</th>
                <th className="py-3.5 px-4">Joining Date</th>
                <th className="py-3.5 px-4">Salary</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/70 transition">
                  {/* Name and ID */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ff5c8a] to-[#452473] text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                        {emp.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{emp.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{emp.id} • {emp.email}</p>
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
                    <span className="font-mono text-purple-700 font-medium">{emp.workMode}</span>
                  </td>

                  {/* Joining Date */}
                  <td className="py-3.5 px-4 font-mono text-slate-500">
                    {emp.joiningDate}
                  </td>

                  {/* Salary */}
                  <td className="py-3.5 px-4 font-bold text-emerald-600">
                    {emp.salary}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition rounded-lg hover:bg-slate-100"
                      title="Offboard Employee"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ONBOARD NEW EMPLOYEE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Onboard New Team Member</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rachel Zane"
                  value={newEmp.name}
                  onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                  className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Company Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="rachel.z@pulsehr.com"
                    value={newEmp.email}
                    onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                    className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 555-442-9901"
                    value={newEmp.phone}
                    onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
                    className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Department</label>
                  <select
                    value={newEmp.department}
                    onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                    className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Product">Product</option>
                    <option value="HR & Operations">HR & Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Role / Designation</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cloud Engineer"
                    value={newEmp.role}
                    onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })}
                    className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Work Mode & Base</label>
                  <select
                    value={newEmp.workMode}
                    onChange={(e) => setNewEmp({ ...newEmp, workMode: e.target.value })}
                    className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
                  >
                    <option value="Hybrid (Bengaluru HQ)">Hybrid (Bengaluru HQ)</option>
                    <option value="In-Office (Hyderabad)">In-Office (Hyderabad)</option>
                    <option value="Remote (Mumbai)">Remote (Mumbai)</option>
                    <option value="Remote (Pune)">Remote (Pune)</option>
                    <option value="Remote (Gurugram)">Remote (Gurugram)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Annual CTC (INR)</label>
                  <input
                    type="text"
                    placeholder="₹16,50,000 / yr"
                    value={newEmp.salary}
                    onChange={(e) => setNewEmp({ ...newEmp, salary: e.target.value })}
                    className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Core Skills (comma separated)</label>
                <input
                  type="text"
                  placeholder="React, TypeScript, AWS, Python"
                  value={newEmp.skills}
                  onChange={(e) => setNewEmp({ ...newEmp, skills: e.target.value })}
                  className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-[#452473] hover:bg-[#381a60] text-white font-bold"
                >
                  {loading ? 'Adding...' : 'Complete Onboarding'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
