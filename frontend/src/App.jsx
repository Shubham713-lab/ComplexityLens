import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CodeEditor from './components/CodeEditor';
import ComplexityCards from './components/ComplexityCards';
import LineCostTable from './components/LineCostTable';
import GraphVisualizer from './components/GraphVisualizer';
import GrowthChart from './components/GrowthChart';
import OptimizationPanel from './components/OptimizationPanel';
import AIExplanationPanel from './components/AIExplanationPanel';
import AlgorithmChatPanel from './components/AlgorithmChatPanel';
import ReportModal from './components/ReportModal';
import HomePage from './components/HomePage';
import { analyzeCodeLocally } from './utils/localAnalyzer';
import { Cpu, Network, TrendingUp, ListTree, BookOpen, Sparkles, AlertCircle, MessageSquareCode } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? 'http://localhost:8000' : '');

const DEFAULT_PYTHON_CODE = `def two_sum(nums, target):
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`;

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'analyzer'
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

  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('complexity_lens_gemini_key') || '';
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
        body: JSON.stringify({ code, language, api_key: apiKey || undefined })
      });
      if (!res.ok) {
        throw new Error('Backend analysis unavailable');
      }
      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      // Graceful client AST analysis fallback so app works 100% anytime
      const localData = analyzeCodeLocally(code, language);
      setAnalysis(localData);
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
    <div className={`w-full font-sans transition-colors duration-200 ${
      currentView === 'analyzer' ? 'h-screen flex flex-col overflow-hidden' : 'min-h-screen flex flex-col'
    } ${
      theme === 'light' ? 'bg-[#f1f5f9] text-slate-900' : 'bg-[#0b0f19] text-slate-100'
    }`}>
      {currentView === 'home' ? (
        <HomePage
          onLaunchAnalyzer={() => setCurrentView('analyzer')}
          theme={theme}
          setTheme={setTheme}
        />
      ) : (
        <>
          {/* Top Header Controls for Analyzer Workspace */}
          <Header
            currentView={currentView}
            setCurrentView={setCurrentView}
            language={language}
            setLanguage={setLanguage}
            presetList={currentPresets}
            onSelectPreset={(newCode) => setCode(newCode)}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            onExportReport={() => setIsReportOpen(true)}
            theme={theme}
            setTheme={setTheme}
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
              codeInputMetrics={analysis?.code_input_metrics}
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
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  activeTab === 'chat'
                    ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <MessageSquareCode className="w-3.5 h-3.5" />
                <span>Ask Chatbot</span>
              </button>
            </div>

            {/* Active Tab Panel Content - Fills remaining height */}
            <div className="flex-1 min-h-0 h-full flex flex-col overflow-hidden relative">
              {isAnalyzing ? (
                <div className="glass-panel h-full flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center space-y-4 shadow-xl bg-white/90 dark:bg-slate-950/90 backdrop-blur-md z-10">
                  <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 border-r-purple-500 rounded-full animate-spin"></div>
                    <Cpu className="w-7 h-7 text-cyan-500 absolute animate-pulse" />
                  </div>
                  <div className="text-center space-y-1">
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-wide">
                      Analyzing Algorithm Complexity...
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      Evaluating AST • Calculating Operation Count T(N) • Big-O Bounds
                    </p>
                  </div>
                  <div className="w-48 bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 h-full animate-pulse w-3/4"></div>
                  </div>
                </div>
              ) : (
                <>
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

                  {activeTab === 'chat' && (
                    <AlgorithmChatPanel
                      code={code}
                      language={language}
                      analysis={analysis}
                      apiKey={apiKey}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        </main>
        </>
      )}

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
