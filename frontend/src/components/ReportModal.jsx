import React from 'react';
import { X, Printer, FileText, Cpu } from 'lucide-react';
import MathView from './MathView';

export default function ReportModal({ isOpen, onClose, code, language, analysis }) {
  if (!isOpen || !analysis) return null;

  const timeO = analysis.time_complexity_o || 'O(1)';
  const timeOmega = analysis.time_complexity_omega || 'Ω(1)';
  const timeTheta = analysis.time_complexity_theta || 'Θ(1)';
  const spaceO = analysis.space_complexity || 'O(1)';
  const formula = analysis.formula_str || 'T(N) = 1';
  const dominant = analysis.dominant_term || '1';
  const lineCosts = Object.values(analysis.line_costs || {});
  const aiExp = analysis.ai_explanation || {};
  const curveFit = analysis.curve_fit;
  const benchmarkData = analysis.benchmark_data || [];

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 dark:bg-black/85 flex items-center justify-center p-3 md:p-6 overflow-y-auto print:p-0 print:bg-white print:static print:block font-sans">
      <div className="swiss-panel w-full max-w-4xl bg-[#f8f6f0] dark:bg-[#18181b] border border-stone-300 dark:border-zinc-800 rounded shadow-lg overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:bg-white print:text-black">
        {/* Modal Action Header */}
        <div className="px-5 py-3 bg-stone-200/80 dark:bg-zinc-900 border-b border-stone-300 dark:border-zinc-800 flex items-center justify-between shrink-0 font-mono print:hidden">
          <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
            <FileText className="w-4 h-4" />
            <h2 className="font-bold text-xs text-stone-900 dark:text-stone-100 uppercase tracking-wider">
              Algorithm Analysis Report
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded bg-orange-600 hover:bg-orange-700 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Save as PDF / Print Report</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-stone-900 dark:text-stone-100 print:overflow-visible print:p-0 print:space-y-4 print:text-black" id="printable-lab-report">
          {/* Document Header */}
          <div className="border-b border-stone-300 dark:border-zinc-800 print:border-gray-300 pb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold font-mono tracking-tight text-stone-900 dark:text-stone-100 print:text-black">
                ComplexityLens — Algorithm Analysis Report
              </h1>
              <p className="text-xs text-stone-600 dark:text-zinc-400 print:text-gray-600 mt-0.5">
                Real-Time Big O Evaluation, Operations Breakdown & Empirical Benchmarking
              </p>
            </div>
            <div className="text-right text-xs text-stone-600 dark:text-zinc-400 print:text-gray-600 font-mono">
              <div>Date: <span className="font-bold text-stone-900 dark:text-stone-100 print:text-black">{currentDate}</span></div>
              <div>Language: <span className="font-bold uppercase text-orange-700 dark:text-orange-400 print:text-black">{language}</span></div>
              <div>Total Lines: <span className="font-bold text-stone-900 dark:text-stone-100 print:text-black">{analysis.code_input_metrics?.total_lines || lineCosts.length}</span></div>
            </div>
          </div>

          {/* Section 1: Asymptotic Complexity Summary Matrix */}
          <div className="space-y-2.5">
            <h2 className="text-xs font-mono font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider print:text-gray-800 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-orange-600 dark:text-orange-400 print:text-black" />
              <span>1. Asymptotic Complexity Summary</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 print:grid-cols-4">
              <div className="p-3 rounded bg-stone-200/60 dark:bg-zinc-900 border border-stone-300 dark:border-zinc-800 print:bg-gray-50 print:border-gray-300">
                <span className="text-[10px] text-stone-600 dark:text-zinc-400 print:text-gray-600 font-mono uppercase font-bold">Time Complexity</span>
                <div className="text-lg font-bold text-orange-700 dark:text-orange-400 print:text-black font-mono mt-1">
                  <MathView math={timeO} />
                </div>
                <div className="text-[10px] text-stone-500 dark:text-zinc-400 print:text-gray-600 mt-0.5 font-mono">
                  <MathView math={timeOmega} /> • <MathView math={timeTheta} />
                </div>
              </div>

              <div className="p-3 rounded bg-stone-200/60 dark:bg-zinc-900 border border-stone-300 dark:border-zinc-800 print:bg-gray-50 print:border-gray-300">
                <span className="text-[10px] text-stone-600 dark:text-zinc-400 print:text-gray-600 font-mono uppercase font-bold">Auxiliary Space</span>
                <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400 print:text-black font-mono mt-1">
                  <MathView math={spaceO} />
                </div>
                <div className="text-[10px] text-stone-500 dark:text-zinc-400 print:text-gray-600 mt-0.5 font-mono">Memory complexity</div>
              </div>

              <div className="p-3 rounded bg-stone-200/60 dark:bg-zinc-900 border border-stone-300 dark:border-zinc-800 print:bg-gray-50 print:border-gray-300">
                <span className="text-[10px] text-stone-600 dark:text-zinc-400 print:text-gray-600 font-mono uppercase font-bold">Step Formula</span>
                <div className="text-xs font-bold text-stone-900 dark:text-stone-100 print:text-black font-mono mt-1 truncate">
                  <MathView math={formula} />
                </div>
                <div className="text-[10px] text-stone-500 dark:text-zinc-400 print:text-gray-600 mt-0.5 font-mono">Exact step summation</div>
              </div>

              <div className="p-3 rounded bg-stone-200/60 dark:bg-zinc-900 border border-stone-300 dark:border-zinc-800 print:bg-gray-50 print:border-gray-300">
                <span className="text-[10px] text-stone-600 dark:text-zinc-400 print:text-gray-600 font-mono uppercase font-bold">Dominant Term</span>
                <div className="text-lg font-bold text-orange-800 dark:text-orange-300 print:text-black font-mono mt-1">
                  <MathView math={`O(${dominant})`} />
                </div>
                <div className="text-[10px] text-stone-500 dark:text-zinc-400 print:text-gray-600 mt-0.5 font-mono">Asymptotic term</div>
              </div>
            </div>
          </div>

          {/* Section 2: Code Listing */}
          <div className="space-y-2">
            <h2 className="text-xs font-mono font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider print:text-gray-800">
              2. Evaluated Source Code
            </h2>
            <pre className="p-3.5 rounded bg-zinc-900 text-zinc-100 border border-zinc-800 print:bg-gray-50 print:border-gray-300 print:text-black font-mono text-xs overflow-x-auto leading-relaxed">
              <code>
                {code.split('\n').map((line, idx) => (
                  <div key={idx} className="flex">
                    <span className="w-8 select-none text-zinc-500 print:text-gray-400 text-right pr-3">{idx + 1}</span>
                    <span>{line}</span>
                  </div>
                ))}
              </code>
            </pre>
          </div>

          {/* Section 3: Empirical Sandbox Timing Benchmark */}
          {benchmarkData.length > 0 && (
            <div className="space-y-2 font-mono">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider print:text-gray-800">
                  3. Empirical Sandbox Benchmark Metrics
                </h2>
                {curveFit && (
                  <span className="text-xs font-bold text-orange-700 dark:text-orange-400 print:text-black">
                    {curveFit.fit_percentage}% Regression Match to {curveFit.best_fit_complexity}
                  </span>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-stone-300 dark:border-zinc-800 print:border-gray-300 rounded overflow-hidden">
                  <thead className="bg-stone-200/80 dark:bg-zinc-900 text-stone-900 dark:text-stone-100 print:bg-gray-100 print:text-gray-700">
                    <tr>
                      <th className="p-2">Input Size (N)</th>
                      <th className="p-2">Calculated Steps</th>
                      <th className="p-2">Empirical Duration (ms)</th>
                      <th className="p-2">Reference O(N)</th>
                      <th className="p-2">Reference O(N²)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-300 dark:divide-zinc-800 print:divide-gray-200">
                    {benchmarkData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-stone-200/50 dark:hover:bg-zinc-900/60">
                        <td className="p-2 font-bold text-stone-900 dark:text-stone-100 print:text-black">N = {row.n}</td>
                        <td className="p-2">{row.actual_steps.toLocaleString()}</td>
                        <td className="p-2 text-orange-700 dark:text-orange-400 print:text-black font-bold">{row.measured_time_ms} ms</td>
                        <td className="p-2 text-stone-600 dark:text-zinc-400 print:text-gray-600">{row.O_N}</td>
                        <td className="p-2 text-stone-600 dark:text-zinc-400 print:text-gray-600">{row.O_N2}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 4: Line-by-Line Cost Annotations */}
          {lineCosts.length > 0 && (
            <div className="space-y-2 font-mono">
              <h2 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider print:text-gray-800">
                4. Line-by-Line Operations Cost Annotations
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-stone-300 dark:border-zinc-800 print:border-gray-300 rounded overflow-hidden">
                  <thead className="bg-stone-200/80 dark:bg-zinc-900 text-stone-900 dark:text-stone-100 print:bg-gray-100 print:text-gray-700">
                    <tr>
                      <th className="p-2 w-16 text-center">Line</th>
                      <th className="p-2">Statement Code</th>
                      <th className="p-2 w-36">Frequency</th>
                      <th className="p-2 w-24 text-right">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-300 dark:divide-zinc-800 print:divide-gray-200">
                    {lineCosts.map((item, idx) => (
                      <tr key={idx} className="hover:bg-stone-200/50 dark:hover:bg-zinc-900/60">
                        <td className="p-2 text-center text-stone-500 font-bold">{item.line}</td>
                        <td className="p-2 text-stone-900 dark:text-stone-100 print:text-black truncate max-w-xs">{item.text}</td>
                        <td className="p-2 text-stone-600 dark:text-zinc-400 print:text-gray-600">{item.frequency}</td>
                        <td className="p-2 text-right font-bold text-orange-700 dark:text-orange-400 print:text-black">
                          <MathView math={item.cost} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 5: AI Explanation & Optimization Recommendations */}
          {aiExp.optimization_suggestions && aiExp.optimization_suggestions.length > 0 && (
            <div className="space-y-2 pt-2 font-mono">
              <h2 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider print:text-gray-800">
                5. Optimization & Refactoring Recommendations
              </h2>
              <ul className="space-y-1.5">
                {aiExp.optimization_suggestions.map((sug, idx) => (
                  <li key={idx} className="p-2.5 rounded bg-stone-200/60 dark:bg-zinc-900 border border-stone-300 dark:border-zinc-800 print:bg-gray-50 print:border-gray-300 text-xs text-stone-900 dark:text-stone-100 print:text-black font-sans leading-relaxed">
                    • {sug}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Report Footer */}
          <div className="pt-4 border-t border-stone-300 dark:border-zinc-800 print:border-gray-300 text-center text-[10px] font-mono text-stone-500 print:text-gray-500">
            ComplexityLens Audit System &copy; {new Date().getFullYear()} • Generated for Academic Lab Submissions & Engineering Reviews
          </div>
        </div>
      </div>
    </div>
  );
}
