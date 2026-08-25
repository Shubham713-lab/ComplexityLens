import React from 'react';
import { ListTree } from 'lucide-react';

export default function LineCostTable({ lineCosts }) {
  if (!lineCosts || Object.keys(lineCosts).length === 0) {
    return (
      <div className="glass-panel h-full flex-1 rounded-xl border border-slate-800 flex items-center justify-center text-slate-400 text-sm">
        No line-by-line cost data available. Click "Analyze Code" to generate breakdown.
      </div>
    );
  }

  const costList = Object.values(lineCosts);

  const getCostBadgeColor = (cost) => {
    if (cost === 'O(1)') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (cost === 'O(N)') return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
    if (cost === 'O(N²)' || cost === 'O(N³)') return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    if (cost.includes('log')) return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
  };

  return (
    <div className="glass-panel h-full flex-1 rounded-xl border border-slate-800 overflow-hidden shadow-xl flex flex-col min-h-0">
      <div className="px-5 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <ListTree className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider">
            Line-by-Line Complexity Cost Annotations
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">{costList.length} lines evaluated</span>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 font-mono text-xs sm:text-sm min-h-0">
        {costList.map((item, idx) => (
          <div
            key={idx}
            className="px-5 py-2.5 flex items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors"
          >
            {/* Line Number & Text */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="w-6 text-right text-slate-500 select-none font-bold text-xs">{item.line}</span>
              <code className="text-slate-200 truncate font-mono text-xs sm:text-sm" title={item.text}>
                {item.text}
              </code>
            </div>

            {/* Depth & Execution Frequency */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="hidden sm:inline-block text-xs text-slate-400">
                {item.frequency}
              </span>

              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getCostBadgeColor(
                  item.cost
                )}`}
              >
                {item.cost}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
