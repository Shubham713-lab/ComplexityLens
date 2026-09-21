import React from 'react';
import { X, Printer, FileText, Cpu, Clock, Layers, Calculator, Sparkles, CheckCircle2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-slate-900/80 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto print:p-0 print:bg-white print:static print:block">
      <div className="glass-panel w-full max-w-4xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:bg-white print:text-black">
        {/* Modal Action Header (Hidden during Print) */}
        <div className="px-6 py-3.5 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
            <FileText className="w-5 h-5" />
            <h2 className="font-bold text-base text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Algorithm Analysis Report
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Save as PDF / Print Report</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-slate-800 dark:text-slate-200 print:overflow-visible print:p-0 print:space-y-4 print:text-black" id="printable-lab-report">
          {/* Document Header */}
          <div className="border-b border-slate-200 dark:border-slate-800 print:border-gray-300 pb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-600 via-sky-600 to-purple-600 dark:from-cyan-400 dark:via-sky-300 dark:to-purple-400 bg-clip-text text-transparent print:text-black print:bg-none">
                ComplexityLens — Algorithm Analysis Report
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 print:text-gray-600 mt-1">
                Real-Time Big O Evaluation, Operations Breakdown & Empirical Benchmarking
              </p>
            </div>
            <div className="text-right text-xs text-slate-500 dark:text-slate-400 print:text-gray-600 font-mono">
              <div>Date: <span className="font-semibold text-slate-800 dark:text-slate-200 print:text-black">{currentDate}</span></div>
              <div>Language: <span className="font-semibold uppercase text-cyan-600 dark:text-cyan-400 print:text-black">{language}</span></div>
              <div>Total Lines (LOC): <span className="font-semibold text-slate-800 dark:text-slate-200 print:text-black">{analysis.code_input_metrics?.total_lines || lineCosts.length}</span></div>
              <div>Char Count: <span className="font-semibold text-slate-800 dark:text-slate-200 print:text-black">{analysis.code_input_metrics?.char_count || code.length}</span></div>
            </div>
          </div>

          {/* Section 1: Asymptotic Complexity Summary Matrix */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider print:text-gray-800 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-600 dark:text-cyan-400 print:text-black" />
              <span>1. Asymptotic Complexity Summary</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 print:bg-gray-50 print:border-gray-300">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 print:text-gray-600 uppercase font-semibold">Time Complexity</span>
                <div className="text-xl font-bold text-cyan-600 dark:text-cyan-400 print:text-black font-mono mt-1">
                  <MathView math={timeO} />
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 print:text-gray-600 mt-0.5">
                  <MathView math={timeOmega} /> • <MathView math={timeTheta} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 print:bg-gray-50 print:border-gray-300">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 print:text-gray-600 uppercase font-semibold">Auxiliary Space</span>
                <div className="text-xl font-bold text-purple-600 dark:text-purple-400 print:text-black font-mono mt-1">
                  <MathView math={spaceO} />
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 print:text-gray-600 mt-0.5">Memory complexity</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 print:bg-gray-50 print:border-gray-300">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 print:text-gray-600 uppercase font-semibold">Step Formula</span>
                <div className="text-sm font-bold text-cyan-700 dark:text-cyan-300 print:text-black font-mono mt-1 truncate">
                  <MathView math={formula} />
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 print:text-gray-600 mt-0.5">Exact step summation</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 print:bg-gray-50 print:border-gray-300">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 print:text-gray-600 uppercase font-semibold">Dominant Term</span>
                <div className="text-lg font-bold text-amber-600 dark:text-amber-400 print:text-black font-mono mt-1">
                  <MathView math={`O(${dominant})`} />
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 print:text-gray-600 mt-0.5">Asymptotic term</div>
              </div>
            </div>
          </div>

          {/* Section 2: Code Listing */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider print:text-gray-800">
              2. Evaluated Source Code
            </h2>
            <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 print:bg-gray-50 print:border-gray-300 text-slate-800 dark:text-slate-200 print:text-black font-mono text-xs overflow-x-auto leading-relaxed">
              <code>
                {code.split('\n').map((line, idx) => (
                  <div key={idx} className="flex">
                    <span className="w-8 select-none text-slate-400 dark:text-slate-600 print:text-gray-400 text-right pr-3">{idx + 1}</span>
                    <span>{line}</span>
                  </div>
                ))}
              </code>
            </pre>
          </div>

          {/* Section 3: Empirical Sandbox Timing Benchmark */}
          {benchmarkData.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider print:text-gray-800">
                  3. Empirical Sandbox Benchmark Metrics
                </h2>
                {curveFit && (
                  <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 print:text-black">
                    {curveFit.fit_percentage}% Regression Match to {curveFit.best_fit_complexity}
                  </span>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs border border-slate-200 dark:border-slate-800 print:border-gray-300 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 print:bg-gray-100 print:text-gray-700">
                    <tr>
                      <th className="p-2.5">Input Size (N)</th>
                      <th className="p-2.5">Calculated Steps</th>
                      <th className="p-2.5">Empirical Duration (ms)</th>
                      <th className="p-2.5">Reference O(N)</th>
                      <th className="p-2.5">Reference O(N²)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 print:divide-gray-200">
                    {benchmarkData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-100/60 dark:hover:bg-slate-900/40">
                        <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200 print:text-black">N = {row.n}</td>
                        <td className="p-2.5">{row.actual_steps.toLocaleString()}</td>
                        <td className="p-2.5 text-cyan-600 dark:text-cyan-400 print:text-black font-bold">{row.measured_time_ms} ms</td>
                        <td className="p-2.5 text-slate-500 dark:text-slate-400 print:text-gray-600">{row.O_N}</td>
                        <td className="p-2.5 text-slate-500 dark:text-slate-400 print:text-gray-600">{row.O_N2}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 4: Line-by-Line Cost Annotations */}
          {lineCosts.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider print:text-gray-800">
                4. Line-by-Line Operations Cost Annotations
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs border border-slate-200 dark:border-slate-800 print:border-gray-300 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 print:bg-gray-100 print:text-gray-700">
                    <tr>
                      <th className="p-2.5 w-16 text-center">Line</th>
                      <th className="p-2.5">Statement Code</th>
                      <th className="p-2.5 w-36">Frequency</th>
                      <th className="p-2.5 w-24 text-right">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 print:divide-gray-200">
                    {lineCosts.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-100/60 dark:hover:bg-slate-900/40">
                        <td className="p-2.5 text-center text-slate-500 font-bold">{item.line}</td>
                        <td className="p-2.5 font-mono text-slate-800 dark:text-slate-200 print:text-black truncate max-w-xs">{item.text}</td>
                        <td className="p-2.5 text-slate-500 dark:text-slate-400 print:text-gray-600">{item.frequency}</td>
                        <td className="p-2.5 text-right font-bold text-cyan-600 dark:text-cyan-400 print:text-black">
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
            <div className="space-y-3 pt-2">
              <h2 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider print:text-gray-800">
                5. Optimization & Refactoring Recommendations
              </h2>
              <ul className="space-y-2">
                {aiExp.optimization_suggestions.map((sug, idx) => (
                  <li key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 print:bg-gray-50 print:border-gray-300 text-xs text-slate-800 dark:text-slate-200 print:text-black leading-relaxed">
                    • {sug}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Report Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 print:border-gray-300 text-center text-[10px] text-slate-500 print:text-gray-500">
            ComplexityLens Audit System &copy; {new Date().getFullYear()} • Generated for Academic Lab Submissions & Engineering Reviews
          </div>
        </div>
      </div>
    </div>
  );
}
