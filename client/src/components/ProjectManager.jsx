import React, { useState } from 'react';
import { Briefcase, Plus, Users, Calendar, DollarSign, X, CheckCircle2, UserPlus, Check } from 'lucide-react';

export default function ProjectManager({
  projects = [],
  employees = [],
  onDataChanged,
  onCreateProject,
  onAllocate,
  onDeallocate,
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [quickStaffingProjectId, setQuickStaffingProjectId] = useState(null);
  const [selectedStaffEmployeeId, setSelectedStaffEmployeeId] = useState('');
  const [selectedStaffPercent, setSelectedStaffPercent] = useState('100');

  const [newProj, setNewProj] = useState({
    name: '',
    client: '',
    lead: '',
    deadline: '2026-12-31',
    requiredSkills: 'React, Node.js, Cloud',
    priority: 'High',
    budget: '₹40,00,000',
    allocatedMembers: [],
  });
  const [loading, setLoading] = useState(false);

  const toggleMemberSelection = (empId) => {
    setNewProj((prev) => {
      const current = prev.allocatedMembers || [];
      const updated = current.includes(empId)
        ? current.filter((id) => id !== empId)
        : [...current, empId];
      return { ...prev, allocatedMembers: updated };
    });
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (onCreateProject) {
      onCreateProject(newProj);
      setShowAddModal(false);
      setNewProj({
        name: '',
        client: '',
        lead: '',
        deadline: '2026-12-31',
        requiredSkills: 'React, Node.js, Cloud',
        priority: 'High',
        budget: '₹40,00,000',
        allocatedMembers: [],
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProj),
      });

      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setNewProj({
          name: '',
          client: '',
          lead: '',
          deadline: '2026-12-31',
          requiredSkills: 'React, Node.js, Cloud',
          priority: 'High',
          budget: '₹40,00,000',
          allocatedMembers: [],
        });
        if (onDataChanged) onDataChanged();
      }
    } catch (err) {
      alert('Error creating project');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStaffSubmit = (e) => {
    e.preventDefault();
    const empId = selectedStaffEmployeeId || employees[0]?.id;
    if (!quickStaffingProjectId || !empId) return;
    if (onAllocate) {
      onAllocate(empId, quickStaffingProjectId, parseInt(selectedStaffPercent || '100', 10));
    }
    setQuickStaffingProjectId(null);
    setSelectedStaffEmployeeId('');
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#452473]" />
            Client Projects & Resource Staffing
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create client accounts, assign engineering squads, track project deadlines, and manage deliverables.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#452473] hover:bg-[#381a60] text-white font-bold text-xs transition shadow-xs active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Client Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {projects.map((proj) => {
          const staffedMembers = employees.filter((e) =>
            proj.allocatedMembers && proj.allocatedMembers.includes(e.id)
          );

          return (
            <div
              key={proj.id}
              className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono text-[#452473] font-bold">{proj.id}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                        proj.priority === 'Urgent'
                          ? 'bg-rose-100 text-rose-800'
                          : proj.priority === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {proj.priority} Priority
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{proj.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Client: <strong className="text-slate-800">{proj.client}</strong></p>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <div>
                    <span className="block text-[10px] uppercase text-slate-400 font-bold">Tech Lead</span>
                    <span className="font-semibold text-slate-800">{proj.lead}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase text-slate-400 font-bold">Target Deadline</span>
                    <span className="font-semibold text-slate-800">{proj.deadline}</span>
                  </div>
                </div>

                {/* Staffed Team */}
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                      Staffed Engineering Squad ({staffedMembers.length} Members):
                    </span>
                    <button
                      onClick={() => {
                        setQuickStaffingProjectId(proj.id);
                        setSelectedStaffEmployeeId(employees[0]?.id || '');
                      }}
                      className="text-[11px] font-bold text-[#452473] hover:text-[#ff5c8a] flex items-center gap-1 transition"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Staff Resource</span>
                    </button>
                  </div>

                  {staffedMembers.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {staffedMembers.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center gap-1.5 p-1.5 pr-2 rounded-lg bg-[#f8f9fc] border border-slate-200 text-xs group"
                        >
                          <div className="w-5 h-5 rounded-md bg-[#452473] text-white text-[10px] font-bold flex items-center justify-center">
                            {m.name[0]}
                          </div>
                          <span className="font-medium text-slate-800">{m.name}</span>
                          <span className="text-[10px] text-purple-700 font-mono font-bold">({m.allocationPercent}%)</span>
                          {onDeallocate && (
                            <button
                              onClick={() => onDeallocate(m.id)}
                              title="Release to Bench"
                              className="text-slate-300 hover:text-rose-600 transition ml-1"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-amber-600 italic">
                      ⚠️ No squad members staffed yet. Click "+ Staff Resource" above to assign team members.
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Budget: <strong className="text-emerald-600">{proj.budget}</strong></span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-mono">
                  {proj.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: CREATE PROJECT WITH DIRECT SQUAD ASSIGNMENT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#452473]" />
                Create New Client Project & Staff Squad
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NextGen Mobile Banking Suite"
                  value={newProj.name}
                  onChange={(e) => setNewProj({ ...newProj, name: e.target.value })}
                  className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Client Organization *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sovereign Wealth Corp"
                    value={newProj.client}
                    onChange={(e) => setNewProj({ ...newProj, client: e.target.value })}
                    className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Project / Tech Lead</label>
                  <input
                    type="text"
                    placeholder="e.g. David Chen"
                    value={newProj.lead}
                    onChange={(e) => setNewProj({ ...newProj, lead: e.target.value })}
                    className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Target Completion Deadline</label>
                  <input
                    type="date"
                    required
                    value={newProj.deadline}
                    onChange={(e) => setNewProj({ ...newProj, deadline: e.target.value })}
                    className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Priority</label>
                  <select
                    value={newProj.priority}
                    onChange={(e) => setNewProj({ ...newProj, priority: e.target.value })}
                    className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Estimated Budget (INR)</label>
                <input
                  type="text"
                  placeholder="₹45,00,000"
                  value={newProj.budget}
                  onChange={(e) => setNewProj({ ...newProj, budget: e.target.value })}
                  className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
                />
              </div>

              {/* DIRECT SQUAD STAFFING SELECTOR */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-slate-700 font-bold">
                    Assign Initial Engineering Squad (Direct Staffing)
                  </label>
                  <span className="text-[11px] font-mono font-bold text-[#ff5c8a]">
                    {newProj.allocatedMembers.length} Selected
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-2">
                  Select available employees to assign to this project immediately upon creation:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-1 bg-[#f8f9fc] rounded-xl border border-slate-200">
                  {employees.map((emp) => {
                    const isSelected = newProj.allocatedMembers.includes(emp.id);
                    return (
                      <div
                        key={emp.id}
                        onClick={() => toggleMemberSelection(emp.id)}
                        className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-purple-100 border-[#452473] text-[#452473] font-bold shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div className={`w-5 h-5 rounded-md text-[10px] flex items-center justify-center font-bold ${
                            isSelected ? 'bg-[#452473] text-white' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {emp.name[0]}
                          </div>
                          <div className="truncate">
                            <span className="block truncate">{emp.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">{emp.role}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                            emp.allocationStatus === 'Available (Bench)'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {emp.allocationPercent}%
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#452473] stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
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
                  className="px-5 py-2 rounded-xl bg-[#452473] hover:bg-[#381a60] text-white font-bold shadow-xs active:scale-95"
                >
                  {loading ? 'Creating...' : `Create Project (${newProj.allocatedMembers.length} Staffed)`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: QUICK STAFF RESOURCE TO EXISTING PROJECT */}
      {quickStaffingProjectId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#452473]" />
                Staff Resource to Project
              </h3>
              <button onClick={() => setQuickStaffingProjectId(null)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickStaffSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Select Employee to Assign *</label>
                <select
                  value={selectedStaffEmployeeId}
                  onChange={(e) => setSelectedStaffEmployeeId(e.target.value)}
                  className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20 font-medium"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role} • Currently: {emp.allocationPercent}% allocated)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Staffing Allocation Capacity</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStaffPercent('50')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      selectedStaffPercent === '50'
                        ? 'bg-[#452473] text-white border-[#452473]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    50% (Part-Time)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStaffPercent('100')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      selectedStaffPercent === '100'
                        ? 'bg-[#452473] text-white border-[#452473]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    100% (Full-Time)
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQuickStaffingProjectId(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#452473] hover:bg-[#381a60] text-white font-bold shadow-xs active:scale-95"
                >
                  Confirm Staffing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
