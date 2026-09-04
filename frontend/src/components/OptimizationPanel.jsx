import React, { useState } from 'react';
import { Lightbulb, ArrowRight, Check, Copy, Sparkles } from 'lucide-react';
import MathView from './MathView';

export default function OptimizationPanel({ aiExplanation, onApplyCode }) {
  const [copied, setCopied] = useState(false);

  if (!aiExplanation) {
    return (
      <div className="glass-panel h-full flex-1 rounded-xl border border-slate-800 flex items-center justify-center text-slate-400 text-sm">
        Optimization recommendations will be generated after code analysis.
      </div>
    );
  }

  const suggestions = aiExplanation.optimization_suggestions || [];
  const optimizedCode = aiExplanation.optimized_code || '';
  const source = aiExplanation.ai_source || 'Rule Engine';

  const handleCopy = () => {
    navigator.clipboard.writeText(optimizedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel h-full flex-1 rounded-xl border border-slate-800 overflow-y-auto shadow-xl space-y-4 p-5 min-h-0">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Algorithmic Optimization Engine
          </h3>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-medium">
          {source}
        </span>
      </div>

      {/* Actionable Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs sm:text-sm font-bold text-slate-200">Suggested Improvements:</h4>
          <ul className="space-y-2">
            {suggestions.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200 bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed flex-1">
                  {item.includes('O(') || item.includes('N²') ? (
                    item.split(/(O\([^)]+\)|N²|O\(1\)|O\(N\))/g).map((part, pIdx) =>
                      part.startsWith('O(') || part === 'N²' ? (
                        <MathView key={pIdx} math={part} className="px-1" />
                      ) : (
                        part
                      )
                    )
                  ) : (
                    item
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Optimized Code Box */}
      {optimizedCode && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              <span>Optimized Implementation</span>
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={() => onApplyCode(optimizedCode)}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-colors cursor-pointer"
              >
                <span>Apply Code</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs sm:text-sm overflow-x-auto max-h-[220px] leading-relaxed">
            <code>{optimizedCode}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
