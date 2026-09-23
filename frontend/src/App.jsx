import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HomePage from './components/HomePage';
import CodeEditor from './components/CodeEditor';
import ComplexityCards from './components/ComplexityCards';
import GraphVisualizer from './components/GraphVisualizer';
import GrowthChart from './components/GrowthChart';
import LineCostTable from './components/LineCostTable';
import OptimizationPanel from './components/OptimizationPanel';
import AlgorithmChatPanel from './components/AlgorithmChatPanel';
import ReportModal from './components/ReportModal';
import { analyzeCodeLocally } from './utils/localAnalyzer';
import {
  Cpu,
  Network,
  TrendingUp,
  ListTree,
  Sparkles,
  AlertCircle,
  MessageSquareCode
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? 'http://localhost:8000' : '');

const DEFAULT_PYTHON_CODE = `def two_sum(nums, target):
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`;

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'workspace'
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(DEFAULT_PYTHON_CODE);
  const [activeTab, setActiveTab] = useState('complexity');
  const [theme, setTheme] = useState(() => localStorage.getItem('complexity_lens_theme') || 'dark');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('complexity_lens_gemini_key') || '');
  
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [presetList, setPresetList] = useState([]);
  const [highlightLine, setHighlightLine] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Sync theme with HTML class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('complexity_lens_theme', theme);
  }, [theme]);

  // Fetch presets on load
  useEffect(() => {
    fetch(`${API_BASE}/api/presets`)
      .then((res) => res.json())
      .then((data) => setPresetList(data[language] || []))
      .catch(() => setPresetList([]));
  }, [language]);

  // Run initial analysis when entering workspace
  useEffect(() => {
    if (currentView === 'workspace' && !analysis) {
      handleRunAnalysis();
    }
  }, [currentView]);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          api_key: apiKey || undefined
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Analysis failed');
      }

      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      console.warn("Backend API unavailable or error, switching to client AST fallback:", err);
      try {
        const localData = analyzeCodeLocally(code, language);
        setAnalysis(localData);
      } catch (fallbackErr) {
        setErrorMsg(err.message || 'Failed to analyze code.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

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
        const benchRes = await res.json();
        setAnalysis((prev) => ({
          ...prev,
          benchmark_data: benchRes.benchmark_data,
          is_live_execution: benchRes.is_live_execution,
          curve_fit: benchRes.curve_fit
        }));
      }
    } catch (err) {
      console.warn("Custom benchmark error:", err);
    } finally {
      setIsBenchmarking(false);
    }
  };

  const handleSelectPreset = (presetCode) => {
    setCode(presetCode);
    setAnalysis(null);
  };

  const handleLaunchAnalyzer = () => {
    setCurrentView('workspace');
  };

  return (
    <div className={`flex flex-col bg-[#fbf9f5] dark:bg-[#0f0f11] text-stone-900 dark:text-stone-100 font-sans transition-colors duration-150 ${
      currentView === 'workspace' ? 'h-screen overflow-hidden' : 'min-h-screen overflow-y-auto'
    }`}>
      {currentView === 'home' ? (
        <HomePage
          onLaunchAnalyzer={handleLaunchAnalyzer}
          theme={theme}
          setTheme={setTheme}
        />
      ) : (
        <>
          {/* Top Header Bar */}
          <Header
            currentView={currentView}
            setCurrentView={setCurrentView}
            language={language}
            setLanguage={(lang) => {
              setLanguage(lang);
              setAnalysis(null);
            }}
            presetList={presetList}
            onSelectPreset={handleSelectPreset}
            onAnalyze={handleRunAnalysis}
            isAnalyzing={isAnalyzing}
            onExportReport={() => setIsReportOpen(true)}
            theme={theme}
            setTheme={setTheme}
            apiKey={apiKey}
            setApiKey={setApiKey}
          />

          {/* Main App Workspace Layout */}
          <main className="flex-1 min-h-0 p-3 md:p-4 max-w-[1800px] w-full mx-auto flex flex-col overflow-hidden">
          {/* Error Alert */}
          {errorMsg && (
            <div className="shrink-0 mb-2 p-2.5 rounded border border-orange-600/30 bg-orange-600/10 text-orange-900 dark:text-orange-200 text-xs font-mono flex items-center gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 text-orange-600" />
              <div className="flex-1 truncate">{errorMsg}</div>
              <button onClick={() => setErrorMsg(null)} className="text-orange-700 dark:text-orange-300 font-bold hover:underline">Dismiss</button>
            </div>
          )}

          {/* Side-by-Side Main Split Grid */}
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch overflow-hidden">
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
          <div className="lg:col-span-7 h-full flex flex-col overflow-hidden space-y-2.5">
            {/* Analysis Tabs Header */}
            <div className="shrink-0 flex flex-wrap items-center gap-1 border-b border-stone-300 dark:border-zinc-800 pb-1.5 font-mono">
              <button
                onClick={() => setActiveTab('complexity')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'complexity'
                    ? 'bg-orange-600 text-white font-bold shadow-xs'
                    : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Complexity Cards</span>
              </button>

              <button
                onClick={() => setActiveTab('graph')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'graph'
                    ? 'bg-orange-600 text-white font-bold shadow-xs'
                    : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>AST Graph</span>
              </button>

              <button
                onClick={() => setActiveTab('growth')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'growth'
                    ? 'bg-orange-600 text-white font-bold shadow-xs'
                    : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Growth Curves</span>
              </button>

              <button
                onClick={() => setActiveTab('linecosts')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'linecosts'
                    ? 'bg-orange-600 text-white font-bold shadow-xs'
                    : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                <ListTree className="w-3.5 h-3.5" />
                <span>Line Costs</span>
              </button>

              <button
                onClick={() => setActiveTab('optimization')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'optimization'
                    ? 'bg-orange-600 text-white font-bold shadow-xs'
                    : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Optimizations</span>
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'chat'
                    ? 'bg-orange-600 text-white font-bold shadow-xs'
                    : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                <MessageSquareCode className="w-3.5 h-3.5" />
                <span>Ask Chatbot</span>
              </button>
            </div>

            {/* Active Tab Panel Content */}
            <div className="flex-1 min-h-0 h-full flex flex-col overflow-hidden relative">
              {isAnalyzing ? (
                <div className="swiss-panel h-full flex-1 rounded border border-stone-300 dark:border-zinc-800 p-8 flex flex-col items-center justify-center space-y-4 shadow-xs bg-[#f8f6f0] dark:bg-[#18181b] z-10 font-mono">
                  <div className="relative flex items-center justify-center">
                    <div className="w-12 h-12 border-2 border-stone-300 dark:border-zinc-800 border-t-orange-600 rounded-full animate-spin"></div>
                    <Cpu className="w-5 h-5 text-orange-600 absolute animate-pulse" />
                  </div>
                  <div className="text-center space-y-1">
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 tracking-wide uppercase">
                      Analyzing Algorithm Complexity...
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-zinc-400 font-mono">
                      Evaluating AST • Calculating Operation Count T(N) • Big-O Bounds
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {activeTab === 'complexity' && (
                    <div className="swiss-panel h-full flex-1 rounded border border-stone-300 dark:border-zinc-800 p-4 space-y-4 shadow-xs overflow-y-auto min-h-0 bg-[#f8f6f0] dark:bg-[#18181b]">
                      <div className="flex items-center gap-2 border-b border-stone-300 dark:border-zinc-800 pb-2.5 font-mono">
                        <Cpu className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                          Asymptotic Complexity Overview
                        </h3>
                      </div>

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
