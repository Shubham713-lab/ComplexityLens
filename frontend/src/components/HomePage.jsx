import React, { useState } from 'react';
import HomeNavbar from './HomeNavbar';
import MathView from './MathView';
import {
  Terminal,
  ArrowRight,
  Calculator,
  TrendingUp,
  ListTree,
  Network,
  Zap
} from 'lucide-react';

const SANDBOX_EXAMPLES = [
  {
    id: 'bubble_sort',
    title: 'Bubble Sort',
    complexity: 'O(N^2)',
    space: 'O(1)',
    formula: 'T(N) = N^2',
    dominant: 'N^2',
    lang: 'Python',
    code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`
  },
  {
    id: 'merge_sort',
    title: 'Merge Sort',
    complexity: 'O(N \\log N)',
    space: 'O(N)',
    formula: 'T(N) = N \\cdot \\log_2 N',
    dominant: 'N \\log N',
    lang: 'Python',
    code: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)`
  },
  {
    id: 'binary_search',
    title: 'Binary Search',
    complexity: 'O(\\log N)',
    space: 'O(1)',
    formula: 'T(N) = \\log_2 N',
    dominant: '\\log N',
    lang: 'Python',
    code: `def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`
  },
  {
    id: 'two_sum',
    title: 'Two Sum Pointer',
    complexity: 'O(N)',
    space: 'O(1)',
    formula: 'T(N) = N',
    dominant: 'N',
    lang: 'C++',
    code: `bool hasTwoSum(std::vector<int>& arr, int target) {
    int l = 0, r = arr.size() - 1;
    while (l < r) {
        int sum = arr[l] + arr[r];
        if (sum == target) return true;
        else if (sum < target) l++;
        else r--;
    }
    return false;
}`
  }
];

export default function HomePage({ onLaunchAnalyzer, theme, setTheme }) {
  const [selectedExample, setSelectedExample] = useState(0);
  const activeEx = SANDBOX_EXAMPLES[selectedExample];

  return (
    <div className="w-full bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 font-sans selection:bg-cyan-500 selection:text-white transition-colors duration-200">
      {/* Home Page Top Navbar */}
      <HomeNavbar
        onLaunchAnalyzer={onLaunchAnalyzer}
        theme={theme}
        setTheme={setTheme}
      />

      <div className="w-full space-y-16 py-8 pb-8">
        {/* HERO SECTION */}
        <section className="relative px-6 pt-6 md:pt-10 max-w-6xl mx-auto flex flex-col items-center text-center space-y-6">
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl leading-[1.15] text-slate-900 dark:text-slate-100">
            Calculate Code Complexity & Step Formulas{' '}
            <span className="text-cyan-600 dark:text-cyan-400">
              with AST Precision.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
            Evaluate Big-O asymptotic bounds, step equations <MathView math="T(N)" />, line execution heatmaps, and empirical microsecond timing curves for Python, C++, and Java algorithms.
          </p>

          {/* Hero Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
            <button
              onClick={onLaunchAnalyzer}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Terminal className="w-4 h-4" />
              <span>Launch Analyzer Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#playground"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <span>Explore Interactive Playground</span>
            </a>
          </div>

          {/* HERO INTERACTIVE SHOWCASE PREVIEW */}
          <div id="playground" className="w-full max-w-5xl pt-4 scroll-mt-24">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl overflow-hidden text-left">
              {/* Mockup Header */}
              <div className="px-4 py-3 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-400 ml-2">
                    Algorithm Inspector Sandbox
                  </span>
                </div>
                {/* Algorithm Switcher Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {SANDBOX_EXAMPLES.map((ex, idx) => (
                    <button
                      key={ex.id}
                      onClick={() => setSelectedExample(idx)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                        selectedExample === idx
                          ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      {ex.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code & Metrics Split Body */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 items-stretch">
                {/* Code View */}
                <div className="md:col-span-7 flex flex-col justify-between p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-slate-400">
                    <span className="font-semibold text-cyan-400">{activeEx.title}</span>
                    <span>{activeEx.lang}</span>
                  </div>
                  <pre className="leading-relaxed text-slate-300 overflow-x-auto my-2">
                    <code>{activeEx.code}</code>
                  </pre>
                  <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>AST Parsed in 0.08s</span>
                  </div>
                </div>

                {/* Live Complexity Cards Preview */}
                <div className="md:col-span-5 flex flex-col justify-between space-y-3">
                  <div className="grid grid-cols-2 gap-3 flex-1">
                    <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                        Time Complexity
                      </span>
                      <div className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400 mt-1">
                        <MathView math={activeEx.complexity} />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                        Space Complexity
                      </span>
                      <div className="text-2xl font-black font-mono text-purple-600 dark:text-purple-400 mt-1">
                        <MathView math={activeEx.space} />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                        Step Formula
                      </span>
                      <div className="text-base font-bold font-mono text-cyan-600 dark:text-cyan-300 mt-1 truncate">
                        <MathView math={activeEx.formula} />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                        Dominant Term
                      </span>
                      <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
                        <MathView math={activeEx.dominant} />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={onLaunchAnalyzer}
                    className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors"
                  >
                    <span>Open in Inspector Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CORE CAPABILITIES GRID */}
        <section id="features" className="px-6 max-w-6xl mx-auto w-full space-y-8 scroll-mt-24">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Built for Algorithmic Analysis
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Everything you need to audit, compare, and optimize software execution efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 w-fit border border-cyan-500/20">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                AST & Symbolic Math Engine
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Derives mathematical step equations <MathView math="T(N)" /> using AST structural parsing and SymPy symbolic summation bounds for single and multi-variable loops.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 w-fit border border-purple-500/20">
                <ListTree className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Line-by-Line Cost Heatmap
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Highlights execution frequency directly on source code lines in Monaco Editor to pinpoint nested iterations and non-trivial hidden operations like <code className="font-mono">arr.pop(0)</code> or <code className="font-mono">item in list</code>.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 w-fit border border-sky-500/20">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Empirical Execution Benchmarks
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Executes microsecond timings across scaled input sizes ($N=10$ to $N=10,000$) and plots empirical curves against theoretical growth functions ($O(N)$, $O(N^2)$).
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 w-fit border border-amber-500/20">
                <Network className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                AST Control Flow Graph
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Visualizes control flow paths, loop entry nodes, recursive branches, and conditional decisions with interactive React Flow node exploration.
              </p>
            </div>
          </div>
        </section>

        {/* SUPPORTED LANGUAGES */}
        <section id="languages" className="px-6 max-w-5xl mx-auto w-full space-y-8 scroll-mt-24">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Supported Programming Languages
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Multi-language static code analysis with dedicated parsing pipelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3 text-center">
              <span className="px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 font-bold font-mono text-xs">
                PYTHON 3
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">AST & Subprocess Engine</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Full AST node visitor parsing, SymPy loop summation, matrix space detection, and isolated subprocess micro-benchmarking.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3 text-center">
              <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold font-mono text-xs">
                C++ (CPP)
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Loop & Vector Inspection</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Parses C++ functions, nested <code className="font-mono">for</code> / <code className="font-mono">while</code> loops, boundary variables, and <code className="font-mono">std::vector</code> operations.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3 text-center">
              <span className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold font-mono text-xs">
                JAVA
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Method & Array Analysis</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Evaluates Java methods, array iterations, nested loops, conditional branches, and scalar allocation patterns.
              </p>
            </div>
          </div>
        </section>

        {/* WORKFLOW PIPELINE */}
        <section id="workflow" className="px-6 max-w-5xl mx-auto w-full space-y-8 scroll-mt-24">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Analysis Workflow
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Three simple steps to evaluate your algorithm's efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3 text-center">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-bold flex items-center justify-center mx-auto text-sm border border-slate-300 dark:border-slate-700">
                01
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Paste or Load Code</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Write your code in Monaco Editor or load algorithm presets like Two Sum, Bubble Sort, or Merge Sort.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3 text-center">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-bold flex items-center justify-center mx-auto text-sm border border-slate-300 dark:border-slate-700">
                02
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">AST Analysis Engine</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                The engine evaluates loops, solves closed-form summation math equations, and runs microsecond benchmarks.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3 text-center">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-bold flex items-center justify-center mx-auto text-sm border border-slate-300 dark:border-slate-700">
                03
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Inspect & Export</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Review asymptotic cards, heatmaps, growth curves, AI breakdown, and generate printable PDF lab reports.
              </p>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA BANNER */}
        <section className="px-6 max-w-4xl mx-auto w-full">
          <div className="p-8 md:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-5 shadow-xl">
            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                Ready to inspect your code's complexity?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
                Launch the analyzer workspace now to inspect Big-O bounds and operation step formulas.
              </p>
            </div>
            <button
              onClick={onLaunchAnalyzer}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md transition-all cursor-pointer"
            >
              <Terminal className="w-4 h-4" />
              <span>Launch Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="px-6 pt-4 text-center text-xs font-mono text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800/60 max-w-6xl mx-auto">
          <p>ComplexityLens — Real-time Algorithmic & Asymptotic Complexity Inspector</p>
        </footer>
      </div>
    </div>
  );
}
