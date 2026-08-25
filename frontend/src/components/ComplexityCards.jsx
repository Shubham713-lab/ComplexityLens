import React from 'react';
import { Clock, Layers, Calculator, Flame } from 'lucide-react';

export default function ComplexityCards({ analysis }) {
  if (!analysis) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card p-3 rounded-xl animate-pulse border border-slate-800 space-y-2">
            <div className="h-3 bg-slate-800 rounded w-16"></div>
            <div className="h-6 bg-slate-800 rounded w-24"></div>
          </div>
        ))}
      </div>
    );
  }

  const timeO = analysis.time_complexity_o || 'O(1)';
  const timeOmega = analysis.time_complexity_omega || 'Ω(1)';
  const timeTheta = analysis.time_complexity_theta || 'Θ(1)';
  const spaceO = analysis.space_complexity || 'O(1)';
  const formula = analysis.formula_str || 'T(N) = 1';
  const dominant = analysis.dominant_term || '1';

  const getBadgeGradient = (complexityStr) => {
    if (complexityStr.includes('O(1)')) return 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30';
    if (complexityStr.includes('log N') && !complexityStr.includes('N log')) return 'from-cyan-500/20 to-sky-500/20 text-cyan-400 border-cyan-500/30';
    if (complexityStr.includes('O(N)') && !complexityStr.includes('N²') && !complexityStr.includes('N³') && !complexityStr.includes('log')) return 'from-sky-500/20 to-blue-500/20 text-sky-400 border-sky-500/30';
    if (complexityStr.includes('N log N')) return 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30';
    if (complexityStr.includes('N²') || complexityStr.includes('N³') || complexityStr.includes('2^N')) return 'from-rose-500/20 to-pink-500/20 text-rose-400 border-rose-500/30';
    return 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30';
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Time Complexity Card */}
      <div className={`glass-panel p-3.5 rounded-xl border bg-gradient-to-br ${getBadgeGradient(timeO)} shadow-md relative overflow-hidden`}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">Time Complexity</span>
          <Clock className="w-3.5 h-3.5 opacity-70" />
        </div>
        <div className="mt-1.5">
          <div className="text-2xl font-black font-mono tracking-tight">{timeO}</div>
          <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono opacity-80">
            <span>{timeOmega}</span>
            <span>•</span>
            <span>{timeTheta}</span>
          </div>
        </div>
      </div>

      {/* Auxiliary Space Complexity Card */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800 shadow-md bg-slate-900/60 relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] font-semibold uppercase tracking-wider">Auxiliary Space</span>
          <Layers className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="mt-1.5">
          <div className="text-2xl font-black font-mono tracking-tight text-purple-400">{spaceO}</div>
          <p className="mt-1 text-[10px] text-slate-400 truncate">
            {spaceO === 'O(1)' ? 'Constant memory' : 'Linear memory'}
          </p>
        </div>
      </div>

      {/* Operation Formula Card */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800 shadow-md bg-slate-900/60 relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] font-semibold uppercase tracking-wider">Step Formula</span>
          <Calculator className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="mt-1.5">
          <div className="text-base font-bold font-mono text-cyan-300 truncate" title={formula}>{formula}</div>
          <p className="mt-1 text-[10px] text-slate-400">SymPy simplified sum</p>
        </div>
      </div>

      {/* Dominant Term Card */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800 shadow-md bg-slate-900/60 relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] font-semibold uppercase tracking-wider">Dominant Factor</span>
          <Flame className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="mt-1.5">
          <div className="text-xl font-bold font-mono text-amber-400 tracking-tight">O({dominant})</div>
          <p className="mt-1 text-[10px] text-slate-400">Primary growth term</p>
        </div>
      </div>
    </div>
  );
}
