import React from 'react';
import { Briefcase, Code2, Server, Calendar, CheckCircle2 } from 'lucide-react';

export default function HRFooter() {
  return (
    <footer className="mt-20 border-t border-slate-800 bg-slate-950/90 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">HIRE<span className="text-cyan-400">FLOW</span></span>
            </div>
            <p className="text-slate-400 max-w-sm leading-relaxed">
              Enterprise HR recruitment & candidate interview availability platform. Connecting engineering and product talent directly with recruiter schedules.
            </p>
            <div className="pt-2 flex items-center gap-3 text-slate-500 font-mono text-[11px]">
              <span className="flex items-center gap-1"><Code2 className="w-3.5 h-3.5 text-cyan-400" /> React 19</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Server className="w-3.5 h-3.5 text-indigo-400" /> Express REST API</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-emerald-400" /> Live HR Availability</span>
            </div>
          </div>

          {/* Quick Departments */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">Departments</h4>
            <ul className="space-y-2 text-slate-400">
              <li>Engineering & Architecture</li>
              <li>UI/UX & Product Design</li>
              <li>Product Management</li>
              <li>HR & Talent Acquisition</li>
              <li>Marketing & Growth</li>
            </ul>
          </div>

          {/* Capstone Metadata */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">Internship Capstone</h4>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <p className="font-semibold text-cyan-300">Web Dev Final Capstone</p>
              <p className="text-[11px] text-slate-400">HR Recruitment & Availability Scheduler</p>
              <div className="pt-1 text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Production Presentation Ready
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-slate-500 gap-4">
          <p>© 2026 HireFlow HR. Internship Capstone Project.</p>
          <p className="text-slate-500 font-mono text-[11px]">Built with HTML, CSS, JavaScript, React & Express</p>
        </div>
      </div>
    </footer>
  );
}
