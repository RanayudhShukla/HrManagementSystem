import React from 'react';
import { MapPin, Briefcase, DollarSign, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function JobCard({ job, onApply, onViewDetails }) {
  return (
    <div className="group flex flex-col bg-slate-900/70 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 hover:shadow-xl hover:shadow-indigo-950/20 transition-all duration-300">
      {/* Top Badges */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
          {job.department}
        </span>
        <span className="text-[11px] text-slate-400 font-mono">
          Posted {job.postedDate}
        </span>
      </div>

      {/* Job Title */}
      <h3
        onClick={() => onViewDetails(job)}
        className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors cursor-pointer"
      >
        {job.title}
      </h3>

      {/* Description Snippet */}
      <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed flex-1">
        {job.description}
      </p>

      {/* Metadata Badges */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs text-slate-300">
        <div className="flex items-center gap-1.5 text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate">{job.location}</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400">
          <Briefcase className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>{job.type}</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400">
          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{job.experience}</span>
        </div>

        <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
          <DollarSign className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{job.salary}</span>
        </div>
      </div>

      {/* Key Requirements tags */}
      {job.requirements && job.requirements.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {job.requirements.slice(0, 2).map((req, idx) => (
            <span
              key={idx}
              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800/80 truncate max-w-[200px]"
            >
              • {req}
            </span>
          ))}
          {job.requirements.length > 2 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800/60 text-slate-400 font-mono">
              +{job.requirements.length - 2} more
            </span>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
        <button
          onClick={() => onViewDetails(job)}
          className="text-xs text-slate-400 hover:text-white font-medium transition"
        >
          View Details
        </button>

        <button
          onClick={() => onApply(job)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-md shadow-cyan-500/10 active:scale-95"
        >
          <span>Apply Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
