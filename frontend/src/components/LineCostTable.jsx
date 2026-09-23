import React from 'react';
import { ListTree } from 'lucide-react';
import MathView from './MathView';

export default function LineCostTable({ lineCosts }) {
  if (!lineCosts || Object.keys(lineCosts).length === 0) {
    return (
      <div className="swiss-panel h-full flex-1 rounded border border-stone-300 dark:border-zinc-800 flex items-center justify-center text-stone-500 dark:text-zinc-400 text-xs bg-[#f8f6f0] dark:bg-[#18181b] font-mono">
        No line-by-line cost data available. Click "Analyze" to generate breakdown.
      </div>
    );
  }

  const costList = Object.values(lineCosts);

  const getCostBadgeColor = (cost) => {
    if (cost === 'O(0)' || cost === '—') return 'bg-stone-200 dark:bg-zinc-800 text-stone-500 dark:text-zinc-400 border-stone-300 dark:border-zinc-700';
    if (cost === 'O(1)') return 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 border-emerald-600/20';
    if (cost === 'O(N)') return 'bg-orange-600/10 text-orange-700 dark:text-orange-400 border-orange-600/20';
    if (cost === 'O(N²)' || cost === 'O(N³)' || cost.includes('2^N')) return 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 border-stone-900';
    return 'bg-stone-200 dark:bg-zinc-800 text-stone-800 dark:text-stone-200 border-stone-300 dark:border-zinc-700';
  };

  return (
    <div className="swiss-panel h-full flex-1 rounded border border-stone-300 dark:border-zinc-800 overflow-hidden shadow-xs flex flex-col min-h-0 bg-[#f8f6f0] dark:bg-[#18181b]">
      <div className="px-4 py-2 bg-stone-200/80 dark:bg-zinc-900 border-b border-stone-300 dark:border-zinc-800 flex items-center justify-between shrink-0 font-mono">
        <div className="flex items-center gap-2">
          <ListTree className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
            Line Cost Breakdown
          </h3>
        </div>
        <span className="text-xs text-stone-600 dark:text-zinc-400">{costList.length} lines</span>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-stone-200 dark:divide-zinc-800 font-mono text-xs min-h-0">
        {costList.map((item, idx) => (
          <div
            key={idx}
            className="px-4 py-2 flex items-center justify-between gap-4 hover:bg-stone-200/50 dark:hover:bg-zinc-900/60 transition-colors"
          >
            {/* Line Number & Text */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="w-6 text-right text-stone-500 dark:text-zinc-500 select-none font-bold text-xs">{item.line}</span>
              <code className="text-stone-900 dark:text-stone-100 truncate font-mono text-xs" title={item.text}>
                {item.text}
              </code>
            </div>

            {/* Depth & Execution Frequency */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="hidden sm:inline-block text-xs text-stone-500 dark:text-zinc-400">
                {item.frequency}
              </span>

              <span
                className={`px-2 py-0.5 rounded text-xs font-mono font-bold border flex items-center ${getCostBadgeColor(
                  item.cost
                )}`}
              >
                <MathView math={item.cost} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
