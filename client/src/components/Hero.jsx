import React from 'react';
import { Terminal, Shield, Truck, Zap, Tag } from 'lucide-react';

export default function Hero({ onExploreClick }) {
  return (
    <div className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-900/50 via-slate-950 to-slate-950 pt-12 pb-16">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[650px] h-[300px] bg-gradient-to-tr from-cyan-600/15 via-blue-600/10 to-indigo-600/10 blur-3xl pointer-events-none rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Developer Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-xs font-mono mb-6">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>Curated for Engineers, Designers & Remote Teams</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
          Precision Ergonomics for{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
            Deep Work & High Flow
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
          Upgrade your workspace with studio-grade mechanical keyboards, glare-free optical lighting, and ergonomic seating engineered for peak productivity.
        </p>

        {/* Promo code pill */}
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/90 border border-slate-700 text-xs text-slate-300 font-mono shadow-inner">
          <Tag className="w-4 h-4 text-emerald-400" />
          <span>Use coupon <strong className="text-emerald-400 underline decoration-dotted">DEV10</strong> at checkout for 10% instant discount!</span>
        </div>

        {/* Value proposition badges */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-slate-800/60 text-left">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Free Express Delivery</p>
              <p className="text-[11px] text-slate-400">On all orders over $99</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">2-Year Warranty</p>
              <p className="text-[11px] text-slate-400">Hassle-free replacement</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Live Inventory</p>
              <p className="text-[11px] text-slate-400">Real-time stock sync</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-slate-800">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Built for Coders</p>
              <p className="text-[11px] text-slate-400">Clean REST API backend</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
