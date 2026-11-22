import React, { useState } from 'react';
import { 
  Users, Briefcase, Plus, RefreshCw, Filter, CheckCircle2, 
  AlertCircle, ArrowRight, UserCheck, X, Sparkles, UserMinus 
} from 'lucide-react';

export default function ResourceManager({
  employees,
  projects,
  onDataChanged,
  onAllocate,
  onDeallocate,
}) {
  const [allocationFilter, setAllocationFilter] = useState('All');
  const [skillFilter, setSkillFilter] = useState('');
  const [selectedEmpForAllocation, setSelectedEmpForAllocation] = useState(null);

  const [targetProjectId, setTargetProjectId] = useState('');
  const [allocationPercent, setAllocationPercent] = useState('100');
  const [allocatingLoading, setAllocatingLoading] = useState(false);
  const [error, setError] = useState('');

  const getEmpSkills = (emp) => {
    if (Array.isArray(emp?.skills)) return emp.skills;
    if (typeof emp?.skills === 'string') return emp.skills.split(',').map((s) => s.trim()).filter(Boolean);
    return [];
  };

  const allSkills = Array.from(
    new Set(employees.flatMap((e) => getEmpSkills(e)))
  ).slice(0, 8);

  const filteredEmployees = employees.filter((emp) => {
    const status = (emp.allocationStatus || 'Available (Bench)').toLowerCase();
    const matchesAllocation =
      allocationFilter === 'All' ||
      status === allocationFilter.toLowerCase();

    const empSkills = getEmpSkills(emp);
    const matchesSkill =
      !skillFilter ||
      empSkills.some((sk) => sk.toLowerCase().includes(skillFilter.toLowerCase()));

    return matchesAllocation && matchesSkill;
  });

  const handleLocalFallbackAllocation = (employeeId, projectId, pct) => {
    try {
      const proj = projects.find((p) => p.id === projectId);
      const savedEmps = localStorage.getItem('pulsehr_employees');
      let currentEmps = savedEmps ? JSON.parse(savedEmps) : [...employees];

      currentEmps = currentEmps.map((e) => {
        if (e.id === employeeId) {
          return {
            ...e,
            assignedProjectId: proj?.id || projectId,
            assignedProjectName: proj?.name || 'Assigned Project',
            allocationPercent: pct,
            allocationStatus: pct >= 100 ? 'Fully Booked' : pct > 0 ? 'Partially Available' : 'Available (Bench)',
          };
        }
        return e;
      });

      localStorage.setItem('pulsehr_employees', JSON.stringify(currentEmps));
      setSelectedEmpForAllocation(null);
      if (onDataChanged) onDataChanged();
    } catch (e) {
      console.error('Local allocation fallback error', e);
    }
  };

  const handleLocalFallbackDeallocate = (employeeId) => {
    try {
      const savedEmps = localStorage.getItem('pulsehr_employees');
      let currentEmps = savedEmps ? JSON.parse(savedEmps) : [...employees];

      currentEmps = currentEmps.map((e) => {
        if (e.id === employeeId) {
          return {
            ...e,
            assignedProjectId: null,
            assignedProjectName: 'Unassigned (Available for new project)',
            allocationPercent: 0,
            allocationStatus: 'Available (Bench)',
          };
        }
        return e;
      });

      localStorage.setItem('pulsehr_employees', JSON.stringify(currentEmps));
      if (onDataChanged) onDataChanged();
    } catch (e) {
      console.error('Local deallocation fallback error', e);
    }
  };

  const handleOpenAllocationModal = (emp) => {
    setSelectedEmpForAllocation(emp);
    setTargetProjectId(projects[0]?.id || '');
    setAllocationPercent(emp.allocationPercent > 0 ? emp.allocationPercent.toString() : '100');
    setError('');
  };

  const handleAllocateSubmit = async (e) => {
    e.preventDefault();
    const projId = targetProjectId || projects[0]?.id;
    if (!projId) {
      setError('Please select a project to assign');
      return;
    }

    const pct = parseInt(allocationPercent, 10);
    const empId = selectedEmpForAllocation.id;

    if (onAllocate) {
      onAllocate(empId, projId, pct);
      setSelectedEmpForAllocation(null);
      return;
    }

    setAllocatingLoading(true);
    setError('');

    try {
      const res = await fetch('/api/resources/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: empId,
          projectId: targetProjectId,
          allocationPercent: pct,
        }),
      });

      const data = await res.json().catch(() => null);
      if (data && data.success) {
        setSelectedEmpForAllocation(null);
        if (onDataChanged) onDataChanged();
      } else {
        handleLocalFallbackAllocation(empId, targetProjectId, pct);
      }
    } catch (err) {
      handleLocalFallbackAllocation(empId, targetProjectId, pct);
    } finally {
      setAllocatingLoading(false);
    }
  };

  const handleDeallocate = async (employeeId) => {
    if (!window.confirm('Release this employee from their current project and return to Bench?')) return;

    if (onDeallocate) {
      onDeallocate(employeeId);
      return;
    }

    try {
      const res = await fetch('/api/resources/deallocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId }),
      });

      const data = await res.json().catch(() => null);
      if (data && data.success) {
        if (onDataChanged) onDataChanged();
      } else {
        handleLocalFallbackDeallocate(employeeId);
      }
    } catch (err) {
      handleLocalFallbackDeallocate(employeeId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#452473]" />
            Employees Availability & Capacity Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track workforce availability, deploy bench talent to client projects, and manage staff bandwidth.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['All', 'Available (Bench)', 'Partially Available', 'Fully Booked'].map((status) => (
            <button
              key={status}
              onClick={() => setAllocationFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                allocationFilter === status
                  ? 'bg-[#452473] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Skill Quick-Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider shrink-0">
          Filter by Skill:
        </span>
        <button
          onClick={() => setSkillFilter('')}
          className={`px-2.5 py-1 rounded-lg text-xs font-mono transition ${
            !skillFilter ? 'bg-[#ff5c8a] text-white font-bold' : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          All Skills
        </button>
        {allSkills.map((sk) => (
          <button
            key={sk}
            onClick={() => setSkillFilter(sk === skillFilter ? '' : sk)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition whitespace-nowrap ${
              skillFilter === sk
                ? 'bg-[#ff5c8a] text-white font-bold'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            {sk}
          </button>
        ))}
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEmployees.map((emp) => {
          const isBench = emp.allocationStatus === 'Available (Bench)';
          const isPartial = emp.allocationStatus === 'Partially Available';

          return (
            <div
              key={emp.id}
              className={`flex flex-col justify-between rounded-2xl bg-white border p-5 transition-all duration-200 shadow-xs hover:shadow-md ${
                isBench
                  ? 'border-purple-200 hover:border-purple-400'
                  : isPartial
                  ? 'border-amber-200 hover:border-amber-400'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Status Pill & Work Mode */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase font-mono ${
                      isBench
                        ? 'bg-purple-100 text-purple-800'
                        : isPartial
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {emp.allocationStatus} ({emp.allocationPercent}%)
                  </span>

                  <span className="text-[11px] text-slate-400 font-mono">
                    {emp.workMode}
                  </span>
                </div>

                {/* Name & Title */}
                <h3 className="text-base font-bold text-slate-900">
                  {emp.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">{emp.role}</p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{emp.department} • {emp.id}</p>

                {/* Assigned Project Box */}
                <div className="mt-4 p-3 rounded-xl bg-[#f8f9fc] border border-slate-100 text-xs">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">
                    Assigned Client Deliverable:
                  </span>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Briefcase className="w-3.5 h-3.5 text-[#452473] shrink-0" />
                    <span className="truncate">{emp.assignedProjectName}</span>
                  </div>
                </div>

                {/* Skills Cloud */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {getEmpSkills(emp).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200 font-mono"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                {emp.assignedProjectId ? (
                  <button
                    onClick={() => handleDeallocate(emp.id)}
                    className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-600 transition"
                    title="Release to Bench"
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                    <span>Release to Bench</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-purple-700 font-mono font-semibold">
                    100% Free Capacity
                  </span>
                )}

                <button
                  onClick={() => handleOpenAllocationModal(emp)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#452473] hover:bg-[#381a60] text-white font-bold text-xs transition shadow-sm active:scale-95"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{emp.assignedProjectId ? 'Reassign' : 'Staff to Project'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="py-16 text-center text-slate-500 space-y-2">
          <p className="text-sm font-semibold text-slate-700">No employees matched this filter.</p>
          <p className="text-xs text-slate-400">Try changing allocation status or clearing the skill filter.</p>
        </div>
      )}

      {/* MODAL: ALLOCATE TO PROJECT */}
      {selectedEmpForAllocation && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800">Project Resource Staffing</h3>
                <p className="text-xs text-slate-500">
                  Assign <strong className="text-[#452473]">{selectedEmpForAllocation.name}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedEmpForAllocation(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAllocateSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Target Client Project</label>
                <select
                  value={targetProjectId}
                  onChange={(e) => setTargetProjectId(e.target.value)}
                  className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
                >
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.name} ({proj.client})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Allocation Capacity (%)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAllocationPercent('50')}
                    className={`py-2 rounded-xl border text-xs font-semibold ${
                      allocationPercent === '50'
                        ? 'bg-purple-50 border-[#452473] text-[#452473]'
                        : 'bg-[#f8f9fc] border-slate-200 text-slate-600'
                    }`}
                  >
                    50% (Part-Time)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAllocationPercent('100')}
                    className={`py-2 rounded-xl border text-xs font-semibold ${
                      allocationPercent === '100'
                        ? 'bg-purple-50 border-[#452473] text-[#452473]'
                        : 'bg-[#f8f9fc] border-slate-200 text-slate-600'
                    }`}
                  >
                    100% (Full-Time)
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedEmpForAllocation(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={allocatingLoading}
                  className="px-5 py-2 rounded-xl bg-[#452473] hover:bg-[#381a60] text-white font-bold"
                >
                  {allocatingLoading ? 'Deploying...' : 'Confirm Allocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
