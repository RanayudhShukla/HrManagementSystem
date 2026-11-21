import React, { useState } from 'react';
import { CalendarCheck, Check, X, Clock, AlertCircle, FileText, Plus, UserCheck, Trash2 } from 'lucide-react';

export default function LeaveManager({
  leaves = [],
  employees = [],
  onDataChanged,
  onUpdateLeaveStatus,
  onCreateLeave,
  onDeleteLeave,
}) {
  const [filter, setFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLeave, setNewLeave] = useState({
    employeeId: employees[0]?.id || 'EMP-1001',
    leaveType: 'Paid Time Off',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    daysCount: 2,
    reason: 'Approved annual vacation',
    status: 'Approved',
  });

  const filteredLeaves = leaves.filter((l) =>
    filter === 'All' ? true : l.status.toLowerCase() === filter.toLowerCase()
  );

  const handleUpdateStatus = async (id, status) => {
    if (onUpdateLeaveStatus) {
      onUpdateLeaveStatus(id, status);
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/leaves/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (data.success) {
        if (onDataChanged) onDataChanged();
      }
    } catch (err) {
      alert('Error updating leave status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateLeaveSubmit = (e) => {
    e.preventDefault();
    if (onCreateLeave) {
      onCreateLeave(newLeave);
      setShowAddModal(false);
      setNewLeave({
        employeeId: employees[0]?.id || 'EMP-1001',
        leaveType: 'Paid Time Off',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        daysCount: 2,
        reason: 'Approved annual vacation',
        status: 'Approved',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-amber-500" />
            Time-Off & Leave Management System
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review, approve, or reject employee requests and directly grant time-off across company departments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Grant Leave Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#452473] hover:bg-[#381a60] text-white font-bold text-xs transition shadow-xs active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Grant / Record Leave</span>
          </button>

          {/* Filter buttons */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  filter === status
                    ? 'bg-[#452473] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Leaves Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f8f9fc] text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Leave Type</th>
                <th className="py-3.5 px-4">Duration & Dates</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {filteredLeaves.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                  {/* Employee */}
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900 text-sm">{item.employeeName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{item.department} • {item.employeeId}</p>
                  </td>

                  {/* Leave Type */}
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700">
                      {item.leaveType}
                    </span>
                  </td>

                  {/* Duration */}
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-800">{item.daysCount} Day(s)</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {item.startDate} to {item.endDate}
                    </p>
                  </td>

                  {/* Reason */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="text-slate-600 truncate" title={item.reason}>
                      {item.reason}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                        item.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'Pending'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  {/* Action buttons */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {item.status === 'Pending' ? (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'Approved')}
                            disabled={actionLoading}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition shadow-xs active:scale-95"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(item.id, 'Rejected')}
                            disabled={actionLoading}
                            className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1 transition active:scale-95"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono italic">
                          Resolved
                        </span>
                      )}

                      {onDeleteLeave && (
                        <button
                          onClick={() => onDeleteLeave(item.id)}
                          title="Delete leave record"
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredLeaves.length === 0 && (
        <div className="py-12 text-center text-slate-400 space-y-1 text-xs">
          <p className="text-slate-600 font-semibold">No leave requests found for this filter.</p>
        </div>
      )}

      {/* MODAL: HR GRANT / RECORD LEAVE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#452473]" />
                Grant / Record Employee Leave
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLeaveSubmit} className="mt-4 space-y-3.5 text-xs">
              {/* Employee Selection */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Select Employee *</label>
                <select
                  value={newLeave.employeeId}
                  onChange={(e) => setNewLeave({ ...newLeave, employeeId: e.target.value })}
                  className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20 font-medium"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.id} • {emp.department} • {emp.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Leave Category */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Leave Category</label>
                <select
                  value={newLeave.leaveType}
                  onChange={(e) => setNewLeave({ ...newLeave, leaveType: e.target.value })}
                  className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
                >
                  <option value="Paid Time Off">Paid Annual Leave (Earned Leave)</option>
                  <option value="Sick Leave">Sick / Medical Leave</option>
                  <option value="Casual Leave">Casual Leave (Short Notice)</option>
                  <option value="Optional Holiday">Optional / Festive Holiday</option>
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newLeave.startDate}
                    onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                    className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={newLeave.endDate}
                    onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                    className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
                  />
                </div>
              </div>

              {/* Days count & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Number of Days</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    required
                    value={newLeave.daysCount}
                    onChange={(e) => setNewLeave({ ...newLeave, daysCount: parseInt(e.target.value, 10) || 1 })}
                    className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Approval Status</label>
                  <select
                    value={newLeave.status}
                    onChange={(e) => setNewLeave({ ...newLeave, status: e.target.value })}
                    className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20 font-bold"
                  >
                    <option value="Approved">Direct Approved</option>
                    <option value="Pending">Pending Review</option>
                  </select>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Reason / Notes</label>
                <textarea
                  rows="2"
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                  placeholder="e.g. Approved personal vacation or medical recovery"
                  className="w-full bg-[#f8f9fc] border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#452473]/20"
                />
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
                  className="px-5 py-2 rounded-xl bg-[#452473] hover:bg-[#381a60] text-white font-bold shadow-xs active:scale-95"
                >
                  Record Leave
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
