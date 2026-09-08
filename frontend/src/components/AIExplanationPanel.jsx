import React from 'react';
import { BookOpen, AlertTriangle } from 'lucide-react';

export default function AIExplanationPanel({ aiExplanation }) {
  if (!aiExplanation) {
    return (
      <div className="glass-panel h-full flex-1 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs">
        Natural language complexity explanation will generate after code analysis.
      </div>
    );
  }

  const explanationText = aiExplanation.natural_explanation || '';
  const bottlenecks = aiExplanation.bottlenecks || [];

  return (
    <div className="glass-panel h-full flex-1 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xl overflow-y-auto min-h-0 bg-white/80 dark:bg-slate-950/60">
      <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3">
        <BookOpen className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
          AI Complexity Breakdown
        </h3>
      </div>

      {/* Natural Language Explanation Text - Clear & Readable Font Size */}
      <div className="text-sm sm:text-[15px] text-slate-800 dark:text-slate-200 leading-relaxed space-y-3 font-sans bg-slate-50 dark:bg-slate-900/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-inner">
        {explanationText.split('\n\n').map((paragraph, idx) => (
          <p key={idx}>{paragraph}</p>
        ))}
      </div>

      {/* Detected Bottlenecks List */}
      {bottlenecks.length > 0 && (
        <div className="space-y-2 pt-1">
          <h4 className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Complexity Bottlenecks:</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {bottlenecks.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-rose-800 dark:text-rose-200 bg-rose-50 dark:bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-500/20 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></div>
                <span className="leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
