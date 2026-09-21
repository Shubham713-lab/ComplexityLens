import React, { useState } from 'react';
import { Lightbulb, ArrowRight, Check, Copy, Sparkles, CheckCircle2, Code2 } from 'lucide-react';
import MathView from './MathView';

/**
 * Helper to parse inline code backticks `code` and math expressions $math$ into formatted elements.
 */
function RichText({ text }) {
  if (!text) return null;
  const parts = text.split(/(`[^`]+`|\$[^\$]+\$)/g);
  return (
    <span className="leading-relaxed">
      {parts.map((part, i) => {
        if (!part) return null;
        if (part.startsWith('`') && part.endsWith('`')) {
          const codeContent = part.slice(1, -1);
          if (/^(O\(|Ω\(|Θ\(|\\Omega|\\Theta|N\^|\(N|T\(N\)|N\*)/i.test(codeContent)) {
            return (
              <span key={i} className="inline-flex items-center px-1.5 py-0.5 mx-1 rounded bg-amber-500/10 text-amber-800 dark:text-amber-300 font-mono text-xs border border-amber-500/20 shadow-xs">
                <MathView math={codeContent} />
              </span>
            );
          }
          return (
            <code key={i} className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-200 dark:bg-slate-800/90 text-amber-700 dark:text-amber-300 font-mono text-[12px] border border-slate-300 dark:border-slate-700">
              {codeContent}
            </code>
          );
        }
        if (part.startsWith('$') && part.endsWith('$')) {
          return <MathView key={i} math={part.slice(1, -1)} className="mx-1" />;
        }
        return part;
      })}
    </span>
  );
}

export default function OptimizationPanel({ aiExplanation, onApplyCode }) {
  const [copied, setCopied] = useState(false);

  if (!aiExplanation) {
    return (
      <div className="glass-panel h-full flex-1 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs p-6">
        Optimization recommendations will generate after code analysis.
      </div>
    );
  }

  const suggestions = aiExplanation.optimization_suggestions || [];
  const rawOptimizedCode = aiExplanation.optimized_code || '';
  // Clean up any unnecessary comment header lines in code
  const optimizedCode = rawOptimizedCode
    .split('\n')
    .filter(line => !line.trim().startsWith('# Optimized Refactored Solution') && !line.trim().startsWith('// Optimized Refactored Solution'))
    .join('\n')
    .trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(optimizedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel h-full flex-1 rounded-xl border border-slate-200 dark:border-slate-800 overflow-y-auto shadow-xl space-y-5 p-5 min-h-0 bg-white/80 dark:bg-slate-950/60">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Code Optimization & Refactoring
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Recommendations to reduce execution time and memory footprint
          </p>
        </div>
      </div>

      {/* Suggested Improvements */}
      {suggestions.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4" />
            <span>Optimization Recommendations</span>
          </h4>

          <ul className="space-y-2">
            {suggestions.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200 bg-slate-100/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-2" />
                <div className="leading-relaxed flex-1">
                  <RichText text={item} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-3 text-xs sm:text-sm text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>Optimal Complexity: Your code operates with minimal asymptotic overhead.</span>
        </div>
      )}

      {/* Suggested Refactored Optimal Code */}
      {optimizedCode && (
        <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Code2 className="w-4 h-4" />
              <span>Refactored Solution</span>
            </h4>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>

              {onApplyCode && (
                <button
                  onClick={() => onApplyCode(optimizedCode)}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <span>Apply to Editor</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed shadow-inner">
            <code>{optimizedCode}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
