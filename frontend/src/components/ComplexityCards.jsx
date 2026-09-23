import React from 'react';
import { Clock, Layers, Calculator, Flame, Cpu } from 'lucide-react';
import MathView from './MathView';

export default function ComplexityCards({ analysis }) {
  if (!analysis) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="swiss-panel p-4 rounded border border-stone-300 dark:border-zinc-800 animate-pulse space-y-2 bg-[#f8f6f0] dark:bg-[#18181b]">
            <div className="h-3 bg-stone-300 dark:bg-zinc-800 rounded w-20"></div>
            <div className="h-7 bg-stone-300 dark:bg-zinc-800 rounded w-28"></div>
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

  return (
    <div className="space-y-4 font-sans">
      {/* Top 4 Swiss Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Time Complexity Card */}
        <div className="swiss-panel p-4 rounded border border-stone-300 dark:border-zinc-800 bg-[#f8f6f0] dark:bg-[#18181b] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" /> Time Complexity
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-600/10 text-orange-700 dark:text-orange-400 border border-orange-600/20">
              Worst Case
            </span>
          </div>

          <div className="my-3">
            <div className="text-3xl font-black font-mono tracking-tight text-orange-700 dark:text-orange-400 flex items-center">
              <MathView math={timeO} />
            </div>
          </div>

          <div className="pt-2 border-t border-stone-300 dark:border-zinc-800 flex items-center justify-between text-[11px] font-mono text-stone-600 dark:text-zinc-400">
            <span>Bounds:</span>
            <span className="font-semibold text-stone-900 dark:text-stone-100">
              <MathView math={timeOmega} /> • <MathView math={timeTheta} />
            </span>
          </div>
        </div>

        {/* 2. Auxiliary Space Card */}
        <div className="swiss-panel p-4 rounded border border-stone-300 dark:border-zinc-800 bg-[#f8f6f0] dark:bg-[#18181b] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Space Complexity
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 border border-emerald-600/20">
              Memory
            </span>
          </div>

          <div className="my-3">
            <div className="text-3xl font-black font-mono tracking-tight text-emerald-700 dark:text-emerald-400 flex items-center">
              <MathView math={spaceO} />
            </div>
          </div>

          <div className="pt-2 border-t border-stone-300 dark:border-zinc-800 flex items-center justify-between text-[11px] font-mono text-stone-600 dark:text-zinc-400">
            <span>Allocations:</span>
            <span className="font-semibold text-stone-900 dark:text-stone-100">
              {spaceO === 'O(1)' ? 'Scalar Memory' : 'Linear Memory'}
            </span>
          </div>
        </div>

        {/* 3. Step Formula Card */}
        <div className="swiss-panel p-4 rounded border border-stone-300 dark:border-zinc-800 bg-[#f8f6f0] dark:bg-[#18181b] shadow-xs flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-stone-700 dark:text-zinc-300" /> Step Formula
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-stone-200 dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 border border-stone-300 dark:border-zinc-700">
              Exact T(N)
            </span>
          </div>

          <div className="my-3 max-w-full overflow-x-auto py-0.5">
            <div className="text-xl font-bold font-mono text-stone-900 dark:text-stone-100 whitespace-nowrap inline-block">
              <MathView math={formula} />
            </div>
          </div>

          <div className="pt-2 border-t border-stone-300 dark:border-zinc-800 flex items-center justify-between text-[11px] font-mono text-stone-600 dark:text-zinc-400">
            <span>Scaling Profile:</span>
            <span className="font-semibold text-stone-900 dark:text-stone-100">
              Operation Sum
            </span>
          </div>
        </div>

        {/* 4. Dominant Factor Card */}
        <div className="swiss-panel p-4 rounded border border-stone-300 dark:border-zinc-800 bg-[#f8f6f0] dark:bg-[#18181b] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" /> Dominant Term
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-600/10 text-orange-700 dark:text-orange-400 border border-orange-600/20">
              Asymptotic
            </span>
          </div>

          <div className="my-3">
            <div className="text-3xl font-black font-mono tracking-tight text-orange-700 dark:text-orange-400 flex items-center">
              <MathView math={`O(${dominant})`} />
            </div>
          </div>

          <div className="pt-2 border-t border-stone-300 dark:border-zinc-800 flex items-center justify-between text-[11px] font-mono text-stone-600 dark:text-zinc-400">
            <span>Growth Driver:</span>
            <span className="font-semibold text-stone-900 dark:text-stone-100">
              High Order Term
            </span>
          </div>
        </div>
      </div>

      {/* Code Input Stats Bar */}
      <div className="p-3 rounded border border-stone-300 dark:border-zinc-800 bg-[#f8f6f0] dark:bg-[#18181b] flex flex-wrap items-center justify-between text-xs font-mono gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-stone-600 dark:text-zinc-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" /> Metrics:
          </span>
          <span className="px-2 py-0.5 rounded bg-stone-200/80 dark:bg-zinc-900 border border-stone-300 dark:border-zinc-800 text-stone-800 dark:text-zinc-200">
            LOC: <strong className="text-orange-700 dark:text-orange-400">{metrics.total_lines ?? 0}</strong>
          </span>
          <span className="px-2 py-0.5 rounded bg-stone-200/80 dark:bg-zinc-900 border border-stone-300 dark:border-zinc-800 text-stone-800 dark:text-zinc-200">
            Active: <strong className="text-emerald-700 dark:text-emerald-400">{metrics.loc_active ?? 0}</strong>
          </span>
          <span className="px-2 py-0.5 rounded bg-stone-200/80 dark:bg-zinc-900 border border-stone-300 dark:border-zinc-800 text-stone-800 dark:text-zinc-200">
            Chars: <strong>{metrics.char_count ?? 0}</strong>
          </span>
          <span className="px-2 py-0.5 rounded bg-stone-200/80 dark:bg-zinc-900 border border-stone-300 dark:border-zinc-800 text-stone-800 dark:text-zinc-200">
            AST Nodes: <strong>{metrics.ast_node_count ?? 0}</strong>
          </span>
        </div>
      </div>

      {/* Detailed Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* Left: Asymptotic Notation Bounds */}
        <div className="p-3.5 rounded bg-[#f8f6f0] dark:bg-[#18181b] border border-stone-300 dark:border-zinc-800 space-y-2.5">
          <h4 className="text-xs font-mono font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider flex items-center justify-between">
            <span>Asymptotic Bounds</span>
            <span className="text-[10px] text-stone-500 dark:text-zinc-500 font-mono">O • Ω • Θ</span>
          </h4>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between items-center p-2 rounded bg-stone-200/60 dark:bg-zinc-900 border border-stone-300 dark:border-zinc-800">
              <span className="text-stone-600 dark:text-zinc-400">Worst Case (Big O):</span>
              <span className="font-bold text-orange-700 dark:text-orange-400 text-sm"><MathView math={timeO} /></span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-stone-200/60 dark:bg-zinc-900 border border-stone-300 dark:border-zinc-800">
              <span className="text-stone-600 dark:text-zinc-400">Best Case (Big Omega):</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm"><MathView math={timeOmega} /></span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-stone-200/60 dark:bg-zinc-900 border border-stone-300 dark:border-zinc-800">
              <span className="text-stone-600 dark:text-zinc-400">Average Case (Big Theta):</span>
              <span className="font-bold text-stone-800 dark:text-zinc-200 text-sm"><MathView math={timeTheta} /></span>
            </div>
          </div>
        </div>

        {/* Right: Operational Scaling Breakdown */}
        <div className="p-3.5 rounded bg-[#f8f6f0] dark:bg-[#18181b] border border-stone-300 dark:border-zinc-800 space-y-2.5 min-w-0">
          <h4 className="text-xs font-mono font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider flex items-center justify-between">
            <span>Operational Scaling</span>
            <span className="text-[10px] text-stone-500 dark:text-zinc-500 font-mono">T(N) Breakdown</span>
          </h4>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between items-center p-2 rounded bg-stone-200/60 dark:bg-zinc-900 border border-stone-300 dark:border-zinc-800 min-w-0">
              <span className="text-stone-600 dark:text-zinc-400 shrink-0">Step Formula:</span>
              <span className="font-bold text-stone-900 dark:text-stone-100 text-xs truncate ml-2 max-w-[60%] overflow-x-auto"><MathView math={formula} /></span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-stone-200/60 dark:bg-zinc-900 border border-stone-300 dark:border-zinc-800">
              <span className="text-stone-600 dark:text-zinc-400">Dominant Factor:</span>
              <span className="font-bold text-orange-700 dark:text-orange-400 text-sm"><MathView math={`O(${dominant})`} /></span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-stone-200/60 dark:bg-zinc-900 border border-stone-300 dark:border-zinc-800">
              <span className="text-stone-600 dark:text-zinc-400">Auxiliary Memory:</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm"><MathView math={spaceO} /></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
