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
              <span key={i} className="inline-flex items-center px-1.5 py-0.5 mx-1 rounded bg-orange-600/10 text-orange-800 dark:text-orange-300 font-mono text-xs border border-orange-600/20">
                <MathView math={codeContent} />
              </span>
            );
          }
          return (
            <code key={i} className="px-1.5 py-0.5 mx-0.5 rounded bg-stone-200 dark:bg-zinc-800 text-orange-800 dark:text-orange-300 font-mono text-[12px] border border-stone-300 dark:border-zinc-700">
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
      <div className="swiss-panel h-full flex-1 rounded border border-stone-300 dark:border-zinc-800 flex items-center justify-center text-stone-500 dark:text-zinc-400 text-xs p-6 bg-[#f8f6f0] dark:bg-[#18181b] font-mono">
        Optimization recommendations will generate after code analysis.
      </div>
    );
  }

  const suggestions = aiExplanation.optimization_suggestions || [];
  const rawOptimizedCode = aiExplanation.optimized_code || '';
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
    <div className="swiss-panel h-full flex-1 rounded border border-stone-300 dark:border-zinc-800 overflow-y-auto shadow-xs space-y-4 p-4 min-h-0 bg-[#f8f6f0] dark:bg-[#18181b] font-sans">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-stone-300 dark:border-zinc-800 pb-2.5">
        <div className="p-1.5 rounded bg-orange-600/10 text-orange-600 dark:text-orange-400 border border-orange-600/20">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-xs font-mono font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
            Code Optimization & Refactoring
          </h3>
          <p className="text-[11px] text-stone-600 dark:text-zinc-400 font-sans">
            Recommendations to reduce execution time and memory footprint
          </p>
        </div>
      </div>

      {/* Suggested Improvements */}
      {suggestions.length > 0 ? (
        <div className="space-y-2">
          <h4 className="text-xs font-mono font-bold text-orange-700 dark:text-orange-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Lightbulb className="w-4 h-4" />
            <span>Optimization Recommendations</span>
          </h4>

          <ul className="space-y-2 font-sans">
            {suggestions.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-xs text-stone-900 dark:text-stone-100 bg-stone-200/50 dark:bg-zinc-900 p-3 rounded border border-stone-300 dark:border-zinc-800"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-orange-600 shrink-0 mt-1.5" />
                <div className="leading-relaxed flex-1">
                  <RichText text={item} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="p-3 rounded border border-emerald-600/30 bg-emerald-600/10 flex items-center gap-2.5 text-xs font-mono text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Optimal Complexity: Your code operates with minimal asymptotic overhead.</span>
        </div>
      )}

      {/* Suggested Refactored Optimal Code */}
      {optimizedCode && (
        <div className="space-y-2.5 pt-3 border-t border-stone-300 dark:border-zinc-800">
          <div className="flex flex-wrap items-center justify-between gap-2 font-mono">
            <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Code2 className="w-4 h-4" />
              <span>Refactored Solution</span>
            </h4>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded bg-stone-200 dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 text-stone-800 dark:text-zinc-200 hover:bg-stone-300 dark:hover:bg-zinc-700 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>

              {onApplyCode && (
                <button
                  onClick={() => onApplyCode(optimizedCode)}
                  className="px-3 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <span>Apply to Editor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <pre className="p-3.5 rounded bg-zinc-900 text-zinc-100 font-mono text-xs overflow-x-auto border border-zinc-800 leading-relaxed">
            <code>{optimizedCode}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
