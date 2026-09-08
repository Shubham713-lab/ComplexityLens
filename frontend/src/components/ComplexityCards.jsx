import React from 'react';
import { Clock, Layers, Calculator, Flame } from 'lucide-react';
import MathView from './MathView';

export default function ComplexityCards({ analysis }) {
  if (!analysis) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-panel p-3.5 rounded-xl animate-pulse border border-slate-200 dark:border-slate-800 space-y-2 bg-white/80 dark:bg-slate-900/60">
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-20"></div>
            <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded w-28"></div>
          </div>
        ))}
      </div>
    );
  }

  const timeO = analysis.time_complexity_o || 'O(1)';
  const timeOmega = analysis.time_complexity_omega || 'Ω(1)';
  const timeTheta = analysis.time_complexity_theta || 'Θ(1)';
  const spaceO = analysis.space_complexity || 'O(1)';
  let formula = analysis.formula_str || 'T = 1';
  if (formula.startsWith('T(N) =')) {
    formula = formula.replace('T(N) =', 'T =');
  }
  const dominant = analysis.dominant_term || '1';

  const getBadgeGradient = (complexityStr) => {
    if (complexityStr.includes('O(1)')) return 'from-emerald-500/20 to-teal-500/20 text-emerald-800 dark:text-rose-400 border-emerald-500/30';
    if (complexityStr.includes('log N') && !complexityStr.includes('N log')) return 'from-cyan-500/20 to-sky-500/20 text-cyan-800 dark:text-cyan-400 border-cyan-500/30';
    if (complexityStr.includes('O(N)') && !complexityStr.includes('N²') && !complexityStr.includes('N³') && !complexityStr.includes('log')) return 'from-sky-500/20 to-blue-500/20 text-sky-800 dark:text-sky-400 border-sky-500/30';
    if (complexityStr.includes('N log N')) return 'from-amber-500/20 to-orange-500/20 text-amber-800 dark:text-amber-400 border-amber-500/30';
    if (complexityStr.includes('N²') || complexityStr.includes('N³') || complexityStr.includes('2^N')) return 'from-rose-500/20 to-pink-500/20 text-rose-800 dark:text-rose-400 border-rose-500/30';
    return 'from-purple-500/20 to-indigo-500/20 text-purple-800 dark:text-purple-400 border-purple-500/30';
  };

  const getGlowAnimationClass = (complexityStr) => {
    if (complexityStr.includes('N²') || complexityStr.includes('N³') || complexityStr.includes('2^N')) return 'animate-glow-red';
    if (complexityStr.includes('O(1)')) return 'animate-glow-emerald';
    return 'animate-glow-cyan';
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. Time Complexity Card */}
      <div className={`glass-panel p-3.5 rounded-2xl border bg-gradient-to-br ${getBadgeGradient(timeO)} ${getGlowAnimationClass(timeO)} shadow-lg relative overflow-hidden hover:scale-[1.02] transition-all duration-300`}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400/90">Time Complexity</span>
          <Clock className="w-4 h-4 text-rose-600 dark:text-rose-400/80 animate-pulse" />
        </div>
        <div className="mt-1.5 flex flex-col justify-between">
          <div className="text-2xl font-black font-mono tracking-tight text-rose-700 dark:text-rose-400 flex items-center">
            <MathView math={timeO} />
          </div>
          <div className="text-[10px] opacity-75 mt-0.5 font-mono truncate">
            <MathView math={timeOmega} /> • <MathView math={timeTheta} />
          </div>
        </div>
      </div>

      {/* 2. Auxiliary Space Complexity Card */}
      <div className="glass-panel p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-lg bg-white/80 dark:bg-[#0f1523]/90 relative overflow-hidden hover:scale-[1.02] transition-all duration-300">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400/90">Auxiliary Space</span>
          <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400/80" />
        </div>
        <div className="mt-1.5 flex flex-col justify-between">
          <div className="text-2xl font-black font-mono tracking-tight text-purple-700 dark:text-purple-400 flex items-center">
            <MathView math={spaceO} />
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
            Auxiliary footprint
          </div>
        </div>
      </div>

      {/* 3. Step Formula Card */}
      <div className="glass-panel p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-lg bg-white/80 dark:bg-[#0f1523]/90 relative overflow-hidden hover:scale-[1.02] transition-all duration-300">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-600 dark:text-cyan-400/90">Step Formula</span>
          <Calculator className="w-4 h-4 text-cyan-600 dark:text-cyan-400/80" />
        </div>
        <div className="mt-1.5 flex flex-col justify-between">
          <div className="text-xl font-extrabold font-mono text-cyan-700 dark:text-cyan-300 truncate" title={formula}>
            <MathView math={formula} />
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
            Operation sum equation
          </div>
        </div>
      </div>

      {/* 4. Dominant Factor Card */}
      <div className="glass-panel p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-lg bg-white/80 dark:bg-[#0f1523]/90 relative overflow-hidden hover:scale-[1.02] transition-all duration-300">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400/90">Dominant Factor</span>
          <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400/80 animate-bounce" />
        </div>
        <div className="mt-1.5 flex flex-col justify-between">
          <div className="text-2xl font-black font-mono tracking-tight text-amber-600 dark:text-amber-400 flex items-center">
            <MathView math={`O(${dominant})`} />
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
            Asymptotic term
          </div>
        </div>
      </div>
    </div>
  );
}
