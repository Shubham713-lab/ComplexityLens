import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CodeEditor from './components/CodeEditor';
import ComplexityCards from './components/ComplexityCards';
import LineCostTable from './components/LineCostTable';
import GraphVisualizer from './components/GraphVisualizer';
import GrowthChart from './components/GrowthChart';
import OptimizationPanel from './components/OptimizationPanel';
import AIExplanationPanel from './components/AIExplanationPanel';
import ReportModal from './components/ReportModal';
import { Cpu, Network, TrendingUp, ListTree, BookOpen, Sparkles, AlertCircle } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

const DEFAULT_PYTHON_CODE = `def two_sum(nums, target):
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`;

export default function App() {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(DEFAULT_PYTHON_CODE);
  const [presets, setPresets] = useState({});
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [activeTab, setActiveTab] = useState('complexity');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [highlightLine, setHighlightLine] = useState(null);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('complexity_lens_theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('complexity_lens_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  // Fetch presets from FastAPI backend
  useEffect(() => {
    fetch(`${API_BASE}/api/presets`)
      .then((res) => res.json())
      .then((data) => setPresets(data))
      .catch(() => {
        // Fallback default presets if backend loading
      });
  }, []);

  // Update default code when language changes
  useEffect(() => {
    if (presets[language] && presets[language].length > 0) {
      setCode(presets[language][0].code);
    } else {
      if (language === 'cpp') {
        setCode(`#include <vector>\n\nstd::vector<int> twoSum(std::vector<int>& nums, int target) {\n    int n = nums.size();\n    for (int i = 0; i < n; i++) {\n        for (int j = i + 1; j < n; j++) {\n            if (nums[i] + nums[j] == target) return {i, j};\n        }\n    }\n    return {};\n}`);
      } else if (language === 'java') {
        setCode(`public class ComplexityDemo {\n    public static void printPairs(int[] arr) {\n        int n = arr.length;\n        for (int i = 0; i < n; i++) {\n            for (int j = 0; j < n; j++) {\n                System.out.println(arr[i] + ", " + arr[j]);\n            }\n        }\n    }\n}`);
      } else {
        setCode(DEFAULT_PYTHON_CODE);
      }
    }
  }, [language, presets]);

  // Handle Analysis Execution
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Analysis failed');
      }
      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const [isBenchmarking, setIsBenchmarking] = useState(false);

  const handleRunCustomBenchmark = async (maxN) => {
    if (!analysis) return;
    setIsBenchmarking(true);
    try {
      const res = await fetch(`${API_BASE}/api/benchmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          time_complexity_o: analysis.time_complexity_o || 'O(N)',
          max_n: maxN,
          code,
          language,
          num_trials: 3
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysis((prev) => ({
          ...prev,
          benchmark_data: data.benchmark_data,
          is_live_execution: data.is_live_execution,
          curve_fit: data.curve_fit
        }));
      }
    } catch (err) {
      console.error("Benchmark error:", err);
    } finally {
      setIsBenchmarking(false);
    }
  };

  // Run initial analysis on mount
  useEffect(() => {
    handleAnalyze();
  }, []);

  const currentPresets = presets[language] || [];

  return (
    <div className={`h-screen w-screen flex flex-col font-sans overflow-hidden transition-colors duration-200 ${
      theme === 'light' ? 'bg-[#f1f5f9] text-slate-900' : 'bg-[#0b0f19] text-slate-100'
    }`}>
      {/* Top Header Controls */}
      <Header
        language={language}
        setLanguage={setLanguage}
        presetList={currentPresets}
        onSelectPreset={(newCode) => setCode(newCode)}
        onAnalyze={handleAnalyze}
        isAnalyzing={isAnalyzing}
        onExportReport={() => setIsReportOpen(true)}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Main App Workspace Layout - Fits 100% viewport */}
      <main className="flex-1 min-h-0 p-3 md:p-4 max-w-[1800px] w-full mx-auto flex flex-col overflow-hidden">
        {/* Error Alert if any */}
        {errorMsg && (
          <div className="shrink-0 mb-2 glass-panel p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <div className="flex-1 truncate">{errorMsg}</div>
            <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-rose-200">Dismiss</button>
          </div>
        )}

        {/* Side-by-Side Main Split Grid */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch overflow-hidden">
          {/* LEFT SIDE: Monaco Code Editor */}
          <div className="lg:col-span-5 h-full flex flex-col overflow-hidden">
            <CodeEditor
              code={code}
              setCode={setCode}
              language={language}
              lineCosts={analysis?.line_costs}
              highlightLine={highlightLine}
              theme={theme}
            />
          </div>

          {/* RIGHT SIDE: Interactive Analysis Tabs */}
          <div className="lg:col-span-7 h-full flex flex-col overflow-hidden space-y-3">
            {/* Analysis Tabs Header */}
            <div className="shrink-0 flex flex-wrap items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-1.5">
              <button
                onClick={() => setActiveTab('complexity')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  activeTab === 'complexity'
                    ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Complexity Cards</span>
              </button>

              <button
                onClick={() => setActiveTab('graph')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  activeTab === 'graph'
                    ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>AST Graph</span>
              </button>

              <button
                onClick={() => setActiveTab('growth')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  activeTab === 'growth'
                    ? 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/30 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Growth Curves</span>
              </button>

              <button
                onClick={() => setActiveTab('linecosts')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  activeTab === 'linecosts'
                    ? 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/30 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <ListTree className="w-3.5 h-3.5" />
                <span>Line Costs</span>
              </button>

              <button
                onClick={() => setActiveTab('optimization')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  activeTab === 'optimization'
                    ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Optimizations</span>
              </button>

              <button
                onClick={() => setActiveTab('ai')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  activeTab === 'ai'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>AI Breakdown</span>
              </button>
            </div>

            {/* Active Tab Panel Content - Fills remaining height */}
            <div className="flex-1 min-h-0 h-full flex flex-col overflow-hidden">
              {activeTab === 'complexity' && (
                <div className="glass-panel h-full flex-1 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-5 shadow-xl overflow-y-auto min-h-0 bg-white/80 dark:bg-slate-950/60">
                  <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3">
                    <Cpu className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                      Asymptotic Complexity Overview
                    </h3>
                  </div>

                  {/* Top 4 Cards Grid */}
                  <ComplexityCards analysis={analysis} />

                  {/* Asymptotic Details & Bounds */}
                  {analysis && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {/* Left: Asymptotic Bounds Matrix */}
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-3">
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Asymptotic Notation Bounds
                        </h4>
                        <div className="space-y-2 text-xs font-mono">
                          <div className="flex justify-between items-center p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                            <span className="text-slate-500 dark:text-slate-400">Worst Case (Big O):</span>
                            <span className="font-bold text-rose-600 dark:text-rose-400">{analysis.time_complexity_o || 'O(1)'}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                            <span className="text-slate-500 dark:text-slate-400">Best Case (Big Omega):</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{analysis.time_complexity_omega || 'Ω(1)'}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                            <span className="text-slate-500 dark:text-slate-400">Average Case (Big Theta):</span>
                            <span className="font-bold text-sky-600 dark:text-sky-400">{analysis.time_complexity_theta || 'Θ(1)'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Operational Formula & Memory Footprint */}
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-3">
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Exact Operational Scaling
                        </h4>
                        <div className="space-y-2 text-xs font-mono">
                          <div className="flex justify-between items-center p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                            <span className="text-slate-500 dark:text-slate-400">Step Summation Formula:</span>
                            <span className="font-bold text-cyan-600 dark:text-cyan-300">{analysis.formula_str || 'T = 1'}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                            <span className="text-slate-500 dark:text-slate-400">Dominant Factor:</span>
                            <span className="font-bold text-amber-600 dark:text-amber-400">O({analysis.dominant_term || '1'})</span>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                            <span className="text-slate-500 dark:text-slate-400">Auxiliary Memory:</span>
                            <span className="font-bold text-purple-600 dark:text-purple-400">{analysis.space_complexity || 'O(1)'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'graph' && (
                <GraphVisualizer
                  graphData={analysis?.graph}
                  onNodeClick={(line) => setHighlightLine(line)}
                  theme={theme}
                />
              )}

              {activeTab === 'growth' && (
                <GrowthChart
                  benchmarkData={analysis?.benchmark_data}
                  timeComplexityO={analysis?.time_complexity_o}
                  isLiveExecution={analysis?.is_live_execution}
                  curveFit={analysis?.curve_fit}
                  onRunCustomBenchmark={handleRunCustomBenchmark}
                  isBenchmarking={isBenchmarking}
                  theme={theme}
                />
              )}

              {activeTab === 'linecosts' && (
                <LineCostTable lineCosts={analysis?.line_costs} />
              )}

              {activeTab === 'optimization' && (
                <OptimizationPanel
                  aiExplanation={analysis?.ai_explanation}
                  onApplyCode={(newCode) => setCode(newCode)}
                />
              )}

              {activeTab === 'ai' && (
                <AIExplanationPanel aiExplanation={analysis?.ai_explanation} />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        code={code}
        language={language}
        analysis={analysis}
      />
    </div>
  );
}
