import React, { useState } from 'react';
import { CalendarCheck, Check, X, Clock, AlertCircle, FileText } from 'lucide-react';

export default function LeaveManager({
  leaves,
  onDataChanged,
}) {
  const [filter, setFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState(false);

  const filteredLeaves = leaves.filter((l) =>
    filter === 'All' ? true : l.status.toLowerCase() === filter.toLowerCase()
  );

  const handleUpdateStatus = async (id, status) => {
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
            Review, approve, or reject paid time-off and sick leave requests across company departments.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2">
          {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                filter === status
                  ? 'bg-[#452473] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
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
                    {item.status === 'Pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'Approved')}
                          disabled={actionLoading}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'Rejected')}
                          disabled={actionLoading}
                          className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-mono italic">
                        Resolved
                      </span>
                    )}
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
    </div>
  );
}
