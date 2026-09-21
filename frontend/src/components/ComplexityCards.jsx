import React from 'react';
import { Clock, Layers, Calculator, Flame, Cpu, CheckCircle2, Sparkles, AlertTriangle } from 'lucide-react';
import MathView from './MathView';

export default function ComplexityCards({ analysis }) {
  if (!analysis) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-panel p-4 rounded-xl animate-pulse border border-slate-200 dark:border-slate-800 space-y-2 bg-white/80 dark:bg-slate-900/60">
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
    formula = formula.replace('T(N) =', 'T = ');
  }
  const dominant = analysis.dominant_term || '1';
  const metrics = analysis.code_input_metrics || {};
  const aiSource = analysis.ai_explanation?.ai_source || 'Built-in Analysis Engine';

  const getComplexityTheme = (str) => {
    if (str.includes('O(1)')) {
      return {
        badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        text: 'text-emerald-600 dark:text-emerald-400',
        card: 'from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/30 dark:border-emerald-500/20'
      };
    }
    if (str.includes('log N') && !str.includes('N log')) {
      return {
        badge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
        text: 'text-cyan-600 dark:text-cyan-400',
        card: 'from-cyan-500/10 via-sky-500/5 to-transparent border-cyan-500/30 dark:border-cyan-500/20'
      };
    }
    if (str.includes('O(N)') && !str.includes('N²') && !str.includes('N³') && !str.includes('log')) {
      return {
        badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
        text: 'text-sky-600 dark:text-sky-400',
        card: 'from-sky-500/10 via-blue-500/5 to-transparent border-sky-500/30 dark:border-sky-500/20'
      };
    }
    if (str.includes('N log N')) {
      return {
        badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
        text: 'text-amber-600 dark:text-amber-400',
        card: 'from-amber-500/10 via-orange-500/5 to-transparent border-amber-500/30 dark:border-amber-500/20'
      };
    }
    return {
      badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
      text: 'text-rose-600 dark:text-rose-400',
      card: 'from-rose-500/10 via-pink-500/5 to-transparent border-rose-500/30 dark:border-rose-500/20'
    };
  };

  const theme = getComplexityTheme(timeO);

  return (
    <div className="space-y-4">
      {/* Top 4 Modern Glass Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Time Complexity Card */}
        <div className={`glass-panel p-4 rounded-2xl border bg-gradient-to-br ${theme.card} shadow-lg relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className={`w-3.5 h-3.5 ${theme.text}`} /> Time Complexity
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${theme.badge}`}>
              Worst Case
            </span>
          </div>

          <div className="my-3">
            <div className={`text-3xl font-black font-mono tracking-tight ${theme.text} flex items-center`}>
              <MathView math={timeO} />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span>Bounds:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              <MathView math={timeOmega} /> • <MathView math={timeTheta} />
            </span>
          </div>
        </div>

        {/* 2. Auxiliary Space Card */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg bg-white/80 dark:bg-slate-900/60 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-500" /> Space Complexity
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30">
              Memory
            </span>
          </div>

          <div className="my-3">
            <div className="text-3xl font-black font-mono tracking-tight text-purple-600 dark:text-purple-400 flex items-center">
              <MathView math={spaceO} />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span>Stack & Allocations:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {spaceO === 'O(1)' ? 'Scalar Memory' : 'Linear Heap Memory'}
            </span>
          </div>
        </div>

        {/* 3. Step Formula Card (Overflow-Safe Layout) */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg bg-white/80 dark:bg-slate-900/60 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-cyan-500" /> Step Formula
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30">
              Exact T(N)
            </span>
          </div>

          <div className="my-3 max-w-full overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 py-1">
            <div className="text-xl sm:text-2xl font-black font-mono text-cyan-600 dark:text-cyan-300 whitespace-nowrap inline-block">
              <MathView math={formula} />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span>Scaling Profile:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Operation Sum
            </span>
          </div>
        </div>

        {/* 4. Dominant Factor Card */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg bg-white/80 dark:bg-slate-900/60 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" /> Dominant Term
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
              Asymptotic
            </span>
          </div>

          <div className="my-3">
            <div className="text-3xl font-black font-mono tracking-tight text-amber-600 dark:text-amber-400 flex items-center">
              <MathView math={`O(${dominant})`} />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span>Growth Driver:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              High Order Term
            </span>
          </div>
        </div>
      </div>

      {/* Code Input Stats & Verification Badge Bar */}
      <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs font-mono gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-cyan-500" /> Code Input Metrics:
          </span>
          <span className="px-2.5 py-0.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium">
            LOC: <strong className="text-cyan-600 dark:text-cyan-400">{metrics.total_lines ?? 0}</strong>
          </span>
          <span className="px-2.5 py-0.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium">
            Active: <strong className="text-emerald-600 dark:text-emerald-400">{metrics.loc_active ?? 0}</strong>
          </span>
          <span className="px-2.5 py-0.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium">
            Chars: <strong className="text-slate-800 dark:text-slate-200">{metrics.char_count ?? 0}</strong>
          </span>
          <span className="px-2.5 py-0.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium">
            AST Nodes: <strong className="text-purple-600 dark:text-purple-400">{metrics.ast_node_count ?? 0}</strong>
          </span>
        </div>

      </div>

      {/* Balanced Detailed Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
        {/* Left: Asymptotic Notation Bounds */}
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Asymptotic Bounds</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">O • Ω • Θ</span>
          </h4>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400">Worst Case (Big O):</span>
              <span className="font-bold text-rose-600 dark:text-rose-400 text-sm"><MathView math={timeO} /></span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400">Best Case (Big Omega):</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm"><MathView math={timeOmega} /></span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400">Average Case (Big Theta):</span>
              <span className="font-bold text-sky-600 dark:text-sky-400 text-sm"><MathView math={timeTheta} /></span>
            </div>
          </div>
        </div>

        {/* Right: Operational Scaling Breakdown */}
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 min-w-0">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Operational Scaling</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">T(N) Breakdown</span>
          </h4>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 min-w-0">
              <span className="text-slate-600 dark:text-slate-400 shrink-0">Step Formula:</span>
              <span className="font-bold text-cyan-600 dark:text-cyan-300 text-xs truncate ml-2 max-w-[60%] overflow-x-auto scrollbar-none"><MathView math={formula} /></span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400">Dominant Factor:</span>
              <span className="font-bold text-amber-600 dark:text-amber-400 text-sm"><MathView math={`O(${dominant})`} /></span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400">Auxiliary Memory:</span>
              <span className="font-bold text-purple-600 dark:text-purple-400 text-sm"><MathView math={spaceO} /></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
