import React, { useState, useEffect } from 'react';
import { 
  Users, Briefcase, Calendar, Award, Plus, Trash2, RefreshCw, 
  Clock, Video, ExternalLink, CheckCircle2, ChevronRight, X, AlertCircle 
} from 'lucide-react';

export default function HRDashboard({ onDataUpdated }) {
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'availability' | 'jobs'
  const [stats, setStats] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [slots, setSlots] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // New slot form state
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [newSlot, setNewSlot] = useState({
    date: '2026-11-24',
    timeSlot: '11:00 AM - 11:45 AM',
    interviewerName: 'Sarah Jenkins (Lead Tech Recruiter)',
    interviewerRole: 'Technical & HR Screening',
  });

  // New job form state
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-Time',
    experience: '2 - 4 Years',
    salary: '$70,000 - $90,000 / yr',
    description: '',
    requirements: '',
    openings: 1,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, candRes, slotRes, jobRes] = await Promise.all([
        fetch('/api/hr/stats'),
        fetch('/api/candidates'),
        fetch('/api/availability'),
        fetch('/api/jobs'),
      ]);

      const statsData = await statsRes.json();
      const candData = await candRes.json();
      const slotData = await slotRes.json();
      const jobData = await jobRes.json();

      if (statsData.success) setStats(statsData.stats);
      if (candData.success) setCandidates(candData.data);
      if (slotData.success) setSlots(slotData.data);
      if (jobData.success) setJobs(jobData.data);
    } catch (err) {
      console.error('Failed to load HR data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update candidate status
  const handleUpdateStatus = async (candidateId, newStatus) => {
    try {
      const res = await fetch(`/api/candidates/${candidateId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchData();
        if (onDataUpdated) onDataUpdated();
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  // Add availability slot
  const handleAddSlot = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSlot),
      });
      if (res.ok) {
        setShowAddSlotModal(false);
        fetchData();
      }
    } catch (err) {
      alert('Error creating slot');
    }
  };

  // Delete availability slot
  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Delete this availability slot?')) return;
    try {
      const res = await fetch(`/api/availability/${slotId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      alert('Error deleting slot');
    }
  };

  // Add new job opening
  const handleAddJob = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob),
      });
      if (res.ok) {
        setShowAddJobModal(false);
        setNewJob({
          title: '',
          department: 'Engineering',
          location: 'Remote',
          type: 'Full-Time',
          experience: '2 - 4 Years',
          salary: '$70,000 - $90,000 / yr',
          description: '',
          requirements: '',
          openings: 1,
        });
        fetchData();
        if (onDataUpdated) onDataUpdated();
      }
    } catch (err) {
      alert('Error creating job');
    }
  };

  // Delete job
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchData();
        if (onDataUpdated) onDataUpdated();
      }
    } catch (err) {
      alert('Error deleting job');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-mono font-semibold">
              HR TALENT ACQUISITION SUITE
            </span>
            <span className="text-xs text-slate-400">Live ATS & Availability Sync</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Recruiter Operations & Pipeline
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowAddSlotModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-md shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Availability Slot</span>
          </button>

          <button
            onClick={() => setShowAddJobModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Job</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Candidates */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Applicants</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">
            {stats ? stats.totalCandidates : 0} Candidates
          </p>
          <p className="text-[11px] text-indigo-300 mt-1">Active talent pool</p>
        </div>

        {/* Interviews Scheduled */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Interviews Booked</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-cyan-400 mt-2">
            {stats ? stats.interviewsScheduled : 0} Scheduled
          </p>
          <p className="text-[11px] text-cyan-300 mt-1">Synced to Google Meet</p>
        </div>

        {/* Active Job Openings */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Openings</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">
            {stats ? stats.totalJobs : 0} Roles
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Across multiple teams</p>
        </div>

        {/* Offers Extended */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Offers Extended</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">
            {stats ? stats.offersExtended : 0} Offers
          </p>
          <p className="text-[11px] text-emerald-300 mt-1">Final stage success</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'pipeline'
              ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Candidate Pipeline ({candidates.length})
        </button>

        <button
          onClick={() => setActiveTab('availability')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'availability'
              ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          HR Availability Slots ({slots.length})
        </button>

        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'jobs'
              ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Manage Job Postings ({jobs.length})
        </button>
      </div>

      {/* TAB 1: CANDIDATE PIPELINE */}
      {activeTab === 'pipeline' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Candidate & Applied Role</th>
                  <th className="py-3.5 px-4">Experience & Portfolio</th>
                  <th className="py-3.5 px-4">Scheduled Interview Slot</th>
                  <th className="py-3.5 px-4">Recruitment Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {candidates.map((cand) => (
                  <tr key={cand.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-white text-sm">{cand.fullName}</p>
                        <p className="text-[11px] text-cyan-400">{cand.jobTitle}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{cand.email} • {cand.phone}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-200">{cand.experienceYears} Years Exp</p>
                      {cand.portfolioUrl && (
                        <a
                          href={cand.portfolioUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <ExternalLink className="w-3 h-3" /> View Portfolio
                        </a>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {cand.scheduledInterview ? (
                        <div className="p-2 rounded-lg bg-indigo-950/40 border border-indigo-800/50">
                          <p className="text-[11px] font-semibold text-white">
                            {cand.scheduledInterview.date} ({cand.scheduledInterview.timeSlot})
                          </p>
                          <a
                            href={cand.scheduledInterview.meetLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <Video className="w-3 h-3" /> Join Room
                          </a>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">No interview booked yet</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={cand.status}
                        onChange={(e) => handleUpdateStatus(cand.id, e.target.value)}
                        className={`text-xs font-semibold rounded-lg px-2.5 py-1.5 border bg-slate-950 cursor-pointer focus:outline-none ${
                          cand.status === 'Offered'
                            ? 'text-emerald-400 border-emerald-800'
                            : cand.status === 'Interview Scheduled'
                            ? 'text-cyan-400 border-cyan-800'
                            : cand.status === 'Screening'
                            ? 'text-amber-400 border-amber-800'
                            : cand.status === 'Rejected'
                            ? 'text-rose-400 border-rose-800'
                            : 'text-slate-300 border-slate-700'
                        }`}
                      >
                        <option value="Applied">Applied</option>
                        <option value="Screening">Screening</option>
                        <option value="Interview Scheduled">Interview Scheduled</option>
                        <option value="Offered">Offered</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: HR AVAILABILITY SLOTS (CORE AVAILABILITY FEATURE) */}
      {activeTab === 'availability' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Interviewer Availability Calendar</h3>
              <p className="text-xs text-slate-400">
                Candidates select directly from these slots during application.
              </p>
            </div>
            <button
              onClick={() => setShowAddSlotModal(true)}
              className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Time Slot</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between ${
                  slot.isBooked
                    ? 'bg-indigo-950/30 border-indigo-800/60'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      {slot.date}
                    </span>

                    {slot.isBooked ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Booked
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Available
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {slot.timeSlot}
                  </p>

                  <p className="text-xs text-slate-300 mt-2">
                    Interviewer: <strong className="text-white">{slot.interviewerName}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Round: {slot.interviewerRole}
                  </p>

                  {/* Booked candidate info */}
                  {slot.isBooked && slot.bookedBy && (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] space-y-1">
                      <p className="text-slate-300">
                        Booked by: <strong className="text-cyan-400">{slot.bookedBy.candidateName}</strong>
                      </p>
                      <p className="text-slate-500 truncate">{slot.bookedBy.appliedRole}</p>
                      {slot.meetLink && (
                        <a
                          href={slot.meetLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:underline flex items-center gap-1 mt-1 font-mono"
                        >
                          <Video className="w-3 h-3" /> Launch Google Meet
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-end">
                  <button
                    onClick={() => handleDeleteSlot(slot.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 transition"
                    title="Remove slot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MANAGE JOB POSTINGS */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Active Career Listings</h3>
            <button
              onClick={() => setShowAddJobModal(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Job Opening</span>
            </button>
          </div>

          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{job.title}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-300 font-mono">
                      {job.department}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {job.location} • {job.experience} • {job.salary}
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteJob(job.id)}
                  className="p-2 text-slate-400 hover:text-rose-400 transition"
                  title="Delete job listing"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD AVAILABILITY SLOT */}
      {showAddSlotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Add Recruiter Interview Slot</h3>
              <button onClick={() => setShowAddSlotModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSlot} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={newSlot.date}
                  onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Time Slot Window</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10:00 AM - 10:45 AM"
                  value={newSlot.timeSlot}
                  onChange={(e) => setNewSlot({ ...newSlot, timeSlot: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Interviewer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins (Tech Recruiter)"
                  value={newSlot.interviewerName}
                  onChange={(e) => setNewSlot({ ...newSlot, interviewerName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Interview Round / Purpose</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Initial Technical Screening"
                  value={newSlot.interviewerRole}
                  onChange={(e) => setNewSlot({ ...newSlot, interviewerRole: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSlotModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                >
                  Save Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: POST NEW JOB */}
      {showAddJobModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Post New Job Opening</h3>
              <button onClick={() => setShowAddJobModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddJob} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Backend Go Engineer"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Department</label>
                  <select
                    value={newJob.department}
                    onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Product">Product</option>
                    <option value="HR & Operations">HR & Operations</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    placeholder="Remote / Hybrid"
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Salary Range</label>
                  <input
                    type="text"
                    required
                    placeholder="$80,000 - $100,000"
                    value={newJob.salary}
                    onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Experience</label>
                  <input
                    type="text"
                    required
                    placeholder="2 - 4 Years"
                    value={newJob.experience}
                    onChange={(e) => setNewJob({ ...newJob, experience: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Role Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Overview of core responsibilities..."
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Requirements (comma separated)</label>
                <input
                  type="text"
                  placeholder="React, Node.js, Docker, Microservices"
                  value={newJob.requirements}
                  onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddJobModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Publish Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
