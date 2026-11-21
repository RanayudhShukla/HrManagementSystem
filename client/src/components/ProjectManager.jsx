import React, { useState } from 'react';
import { Briefcase, Plus, Users, Calendar, DollarSign, X, CheckCircle2 } from 'lucide-react';

export default function ProjectManager({
  projects,
  employees,
  onDataChanged,
  onCreateProject,
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProj, setNewProj] = useState({
    name: '',
    client: '',
    lead: '',
    deadline: '2026-12-31',
    requiredSkills: '',
    priority: 'High',
    budget: '₹40,00,000',
  });
  const [loading, setLoading] = useState(false);

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
        requiredSkills: '',
        priority: 'High',
        budget: '₹40,00,000',
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
          requiredSkills: '',
          priority: 'High',
          budget: '₹40,00,000',
        });
        if (onDataChanged) onDataChanged();
      }
    } catch (err) {
      alert('Error creating project');
    } finally {
      setLoading(false);
    }
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
            Active deliverables, client accounts, budget tracking, and assigned engineering squads.
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
                  <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">
                    Staffed Engineering Squad ({staffedMembers.length} Members):
                  </span>

                  {staffedMembers.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {staffedMembers.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center gap-2 p-1.5 pr-2.5 rounded-lg bg-[#f8f9fc] border border-slate-200 text-xs"
                        >
                          <div className="w-5 h-5 rounded-md bg-[#452473] text-white text-[10px] font-bold flex items-center justify-center">
                            {m.name[0]}
                          </div>
                          <span className="font-medium text-slate-800">{m.name}</span>
                          <span className="text-[10px] text-purple-700 font-mono font-bold">({m.allocationPercent}%)</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-amber-600 italic">
                      ⚠️ No squad members staffed yet. Go to Resource Allocation to assign bench talent.
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

      {/* MODAL: CREATE PROJECT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Create New Client Project</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="mt-4 space-y-3 text-xs">
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
                  {loading ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
