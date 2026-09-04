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
import { Network, TrendingUp, ListTree, BookOpen, Sparkles, AlertCircle } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('graph');
  const [apiKey, setApiKey] = useState('');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [highlightLine, setHighlightLine] = useState(null);

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
    <div className="h-screen w-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Top Header Controls */}
      <Header
        language={language}
        setLanguage={setLanguage}
        presetList={currentPresets}
        onSelectPreset={(newCode) => setCode(newCode)}
        onAnalyze={handleAnalyze}
        isAnalyzing={isAnalyzing}
        onExportReport={() => setIsReportOpen(true)}
        apiKey={apiKey}
        setApiKey={setApiKey}
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
            />
          </div>

          {/* RIGHT SIDE: Complexity Summary & Interactive Analysis Tabs */}
          <div className="lg:col-span-7 h-full flex flex-col overflow-hidden space-y-3">
            {/* Top Right: Compact Complexity Cards Summary */}
            <div className="shrink-0">
              <ComplexityCards analysis={analysis} />
            </div>

            {/* Analysis Tabs Header */}
            <div className="shrink-0 flex flex-wrap items-center gap-1.5 border-b border-slate-800 pb-1.5">
              <button
                onClick={() => setActiveTab('graph')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  activeTab === 'graph'
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>AST Graph</span>
              </button>

              <button
                onClick={() => setActiveTab('growth')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  activeTab === 'growth'
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Growth Curves</span>
              </button>

              <button
                onClick={() => setActiveTab('linecosts')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  activeTab === 'linecosts'
                    ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <ListTree className="w-3.5 h-3.5" />
                <span>Line Costs</span>
              </button>

              <button
                onClick={() => setActiveTab('optimization')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  activeTab === 'optimization'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Optimizations</span>
              </button>

              <button
                onClick={() => setActiveTab('ai')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  activeTab === 'ai'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>AI Breakdown</span>
              </button>
            </div>

            {/* Active Tab Panel Content - Fills remaining height */}
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              {activeTab === 'graph' && (
                <GraphVisualizer
                  graphData={analysis?.graph}
                  onNodeClick={(line) => setHighlightLine(line)}
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

      {/* Compact Status Footer */}
      <footer className="shrink-0 py-1.5 border-t border-slate-800 text-center text-[11px] text-slate-500">
        ComplexityLens &copy; 2026 • Real-Time Algorithm Complexity & Control Flow Inspector
      </footer>
    </div>
  );
}
