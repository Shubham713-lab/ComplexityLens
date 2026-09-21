import React from 'react';
import { BookOpen, AlertTriangle, Cpu, Layers, CheckCircle2, Zap } from 'lucide-react';
import MathView from './MathView';

/**
 * Parses inline code backticks `code` and math expressions into formatted React elements with MathView KaTeX math.
 */
function RichText({ text }) {
  if (!text) return null;

  // Split text by backticks `code` or LaTeX math delimiters $math$
  const parts = text.split(/(`[^`]+`|\$[^\$]+\$)/g);

  return (
    <span className="leading-relaxed">
      {parts.map((part, i) => {
        if (!part) return null;
        if (part.startsWith('`') && part.endsWith('`')) {
          const codeContent = part.slice(1, -1);
          // If it looks like math notation (e.g. O(1), O(N^2), (N-1)+...=N*(N-1)/2, \Omega(1))
          if (/^(O\(|Ω\(|Θ\(|\\Omega|\\Theta|N\^|\(N|T\(N\)|N\*)/i.test(codeContent)) {
            return (
              <span key={i} className="inline-flex items-center px-1.5 py-0.5 mx-1 rounded bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 font-mono text-xs border border-cyan-500/20 shadow-xs">
                <MathView math={codeContent} />
              </span>
            );
          }
          return (
            <code key={i} className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-200 dark:bg-slate-800/90 text-cyan-700 dark:text-cyan-300 font-mono text-[12px] border border-slate-300 dark:border-slate-700">
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

function inferStep(text, index) {
  let title = `Step ${index}: Code Execution`;
  let lineRef = '';
  let complexity = 'O(1)';

  if (/first calculates|length of|initialization/i.test(text)) {
    title = 'Initialization & Size Check';
    lineRef = 'Line 1-2';
    complexity = 'O(1)';
  } else if (/outer loop/i.test(text)) {
    title = 'Outer Iteration Loop';
    lineRef = 'Line 3';
    complexity = 'O(N)';
  } else if (/inner loop|arithmetic series|iterations for/i.test(text)) {
    title = 'Inner Loop & Arithmetic Accumulation';
    lineRef = 'Lines 4-6';
    complexity = 'O(N²)';
  } else if (/worst-case|dominant term/i.test(text)) {
    title = 'Worst-Case Dominant Bound';
    lineRef = 'Overall';
    complexity = 'O(N²)';
  } else if (/space complexity|variables|memory/i.test(text)) {
    title = 'Auxiliary Space Allocation';
    lineRef = 'Memory';
    complexity = 'O(1)';
  }

  const matchO = text.match(/\b(O\(.*?\)|Ω\(.*?\)|Θ\(.*?\))/);
  if (matchO) {
    complexity = matchO[1];
  }

  const matchLine = text.match(/\bline[s]?\s*(\d+(?:\s*(?:and|-|,)\s*\d+)?)/i);
  if (matchLine && !lineRef) {
    lineRef = `Line ${matchLine[1]}`;
  }

  return {
    step_title: title,
    line_ref: lineRef || 'Code Section',
    complexity: complexity,
    explanation: text
  };
}

function getSteps(aiExplanation) {
  if (aiExplanation.step_by_step && Array.isArray(aiExplanation.step_by_step) && aiExplanation.step_by_step.length > 0) {
    return aiExplanation.step_by_step;
  }

  const explanationText = aiExplanation.natural_explanation || '';
  if (!explanationText) return [];

  // Intelligently split monolithic wall of text into logical sentences/paragraphs
  const rawParagraphs = explanationText
    .split(/(?=\b(?:The function|The outer loop|The inner loop|Inside the inner loop|In the worst-case|The space complexity|Step \d+:)\b)/gi)
    .map(s => s.trim())
    .filter(Boolean);

  if (rawParagraphs.length <= 1) {
    const paras = explanationText.split('\n\n').filter(Boolean);
    if (paras.length > 1) return paras.map((p, idx) => inferStep(p, idx + 1));
    return [inferStep(explanationText, 1)];
  }

  return rawParagraphs.map((para, idx) => inferStep(para, idx + 1));
}

export default function AIExplanationPanel({ aiExplanation }) {
  if (!aiExplanation) {
    return (
      <div className="glass-panel h-full flex-1 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs p-6">
        Natural language complexity breakdown will generate after code analysis.
      </div>
    );
  }

  const executiveSummary = aiExplanation.executive_summary ||
    (aiExplanation.natural_explanation
      ? aiExplanation.natural_explanation.split('\n\n')[0]
      : 'Algorithmic complexity audit completed.');

  const steps = getSteps(aiExplanation);
  const bottlenecks = aiExplanation.bottlenecks || [];

  return (
    <div className="glass-panel h-full flex-1 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-5 shadow-xl overflow-y-auto min-h-0 bg-white/80 dark:bg-slate-950/60 scrollbar-thin">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              AI Complexity Breakdown
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Structured mathematical step-by-step evaluation
            </p>
          </div>
        </div>

        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          Audited
        </span>
      </div>

      {/* Executive Summary Banner */}
      <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 via-cyan-500/5 to-transparent p-4 shadow-sm space-y-3">
        <div className="flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
              Executive Takeaway
            </h4>
            <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <RichText text={executiveSummary} />
            </div>
          </div>
        </div>

        {/* Asymptotic Metrics Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
          {aiExplanation.time_complexity_o && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-500/20">
              <span className="text-[10px] text-rose-600 dark:text-rose-400 uppercase font-bold">Worst Case:</span>
              <MathView math={aiExplanation.time_complexity_o} />
            </div>
          )}

          {aiExplanation.time_complexity_omega && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 text-xs font-semibold border border-cyan-500/20">
              <span className="text-[10px] text-cyan-600 dark:text-cyan-400 uppercase font-bold">Best Case:</span>
              <MathView math={aiExplanation.time_complexity_omega} />
            </div>
          )}

          {aiExplanation.space_complexity && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-300 text-xs font-semibold border border-purple-500/20">
              <span className="text-[10px] text-purple-600 dark:text-purple-400 uppercase font-bold">Aux Space:</span>
              <MathView math={aiExplanation.space_complexity} />
            </div>
          )}

          {aiExplanation.formula_str && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-500/20">
              <span className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-bold">Step Formula:</span>
              <MathView math={aiExplanation.formula_str} />
            </div>
          )}
        </div>
      </div>

      {/* Step-by-Step Mathematical Analysis Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-500" />
            <span>Step-by-Step Execution Breakdown</span>
          </h4>
          <span className="text-[10px] text-slate-400 font-mono">{steps.length} Steps</span>
        </div>

        <div className="space-y-2.5">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 dark:border-slate-800/90 bg-slate-50/80 dark:bg-slate-900/60 p-3.5 shadow-sm space-y-2 hover:border-cyan-500/30 transition-all"
            >
              {/* Step Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 text-[11px] font-bold flex items-center justify-center shrink-0 border border-cyan-500/20">
                    {idx + 1}
                  </span>
                  <h5 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {step.step_title}
                  </h5>
                </div>

                <div className="flex items-center gap-2">
                  {step.line_ref && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-mono border border-slate-300 dark:border-slate-700">
                      {step.line_ref}
                    </span>
                  )}
                  {step.complexity && (
                    <span className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-500/20">
                      <MathView math={step.complexity} />
                    </span>
                  )}
                </div>
              </div>

              {/* Step Body */}
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-sans">
                <RichText text={step.explanation} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Complexity Bottlenecks Callout Grid */}
      {bottlenecks.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Identified Bottlenecks</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {bottlenecks.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200 bg-rose-50 dark:bg-rose-500/10 px-3 py-2.5 rounded-xl border border-rose-200 dark:border-rose-500/20 shadow-xs"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                <div className="leading-snug">
                  <RichText text={item} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
