import React, { useState } from 'react';
import { X, Briefcase, MapPin, DollarSign, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function JobApplyModal({
  job,
  onClose,
  onApplicationSuccess,
}) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    experienceYears: '',
    portfolioUrl: '',
    coverNote: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!job) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          jobTitle: job.title,
          ...formData,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onApplicationSuccess(data.data);
      } else {
        setError(data.message || 'Failed to submit application');
      }
    } catch (err) {
      setError('Network error while submitting application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400 font-mono">
              {job.department} • {job.location}
            </span>
            <h2 className="text-xl font-bold text-white mt-0.5">{job.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Left Details Panel */}
          <div className="p-6 md:col-span-2 space-y-4 bg-slate-950/40 text-xs">
            <div>
              <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-2">Role Overview</h4>
              <p className="text-slate-400 leading-relaxed">{job.description}</p>
            </div>

            <div className="space-y-2 py-3 border-y border-slate-800/80 text-slate-300">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>{job.salary}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Experience: {job.experience}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                <span>{job.type} ({job.openings} Openings)</span>
              </div>
            </div>

            {/* Requirements list */}
            {job.requirements && job.requirements.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-2">Key Requirements</h4>
                <ul className="space-y-1.5 text-slate-400">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Application Form */}
          <form onSubmit={handleSubmit} className="p-6 md:col-span-3 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
              Submit Candidate Profile
            </h3>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="e.g. Alex Sharma"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="alex@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Total Experience (Years) *</label>
                <input
                  type="number"
                  step="0.5"
                  name="experienceYears"
                  required
                  placeholder="e.g. 3.5"
                  value={formData.experienceYears}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">GitHub / Portfolio / LinkedIn URL</label>
              <input
                type="url"
                name="portfolioUrl"
                placeholder="https://github.com/your-username"
                value={formData.portfolioUrl}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Why are you a great fit? (Cover note)</label>
              <textarea
                name="coverNote"
                rows={3}
                placeholder="Share your technical background, major achievements, and why you're interested..."
                value={formData.coverNote}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Next: Select interview slot on HR calendar
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-md shadow-cyan-500/20 active:scale-95"
                >
                  <span>{loading ? 'Submitting...' : 'Apply & Book Interview'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
