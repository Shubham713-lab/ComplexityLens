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
    <div className="w-full bg-[#fbf9f5] dark:bg-[#0f0f11] text-stone-900 dark:text-stone-100 font-sans transition-colors duration-150">
      {/* Home Page Top Navbar */}
      <HomeNavbar
        onLaunchAnalyzer={onLaunchAnalyzer}
        theme={theme}
        setTheme={setTheme}
      />

      <div className="w-full space-y-16 py-8 pb-12">
        {/* HERO SECTION */}
        <section className="relative px-6 pt-6 md:pt-10 max-w-6xl mx-auto flex flex-col items-center text-center space-y-6">
          {/* Technical Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-stone-200/80 dark:bg-zinc-900 border border-stone-300 dark:border-zinc-800 text-[11px] font-mono font-semibold uppercase tracking-wider text-orange-700 dark:text-orange-400">
            <span className="w-2 h-2 rounded-full bg-orange-600 inline-block" />
            <span>Algorithmic & Asymptotic Inspection Suite</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-sans tracking-tight max-w-4xl leading-[1.15] text-stone-900 dark:text-stone-100">
            Calculate Code Complexity & Step Formulas{' '}
            <span className="text-orange-600 dark:text-orange-500">
              with AST Precision.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-stone-600 dark:text-zinc-400 leading-relaxed font-sans">
            Evaluate Big-O asymptotic bounds, step equations <MathView math="T(N)" />, line execution costs, and empirical microsecond timing curves for Python, C++, and Java algorithms.
          </p>

          {/* Hero Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button
              onClick={onLaunchAnalyzer}
              className="flex items-center gap-2 px-5 py-2.5 rounded text-xs font-mono font-bold text-white bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-500 shadow-xs transition-all cursor-pointer"
            >
              <Terminal className="w-4 h-4" />
              <span>Launch Analyzer Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#playground"
              className="flex items-center gap-2 px-5 py-2.5 rounded text-xs font-mono font-semibold text-stone-800 dark:text-zinc-200 bg-[#f8f6f0] dark:bg-[#18181b] border border-stone-300 dark:border-zinc-800 hover:border-stone-400 dark:hover:border-zinc-700 transition-all cursor-pointer"
            >
              <span>Explore Interactive Sandbox</span>
            </a>
          </div>

          {/* HERO INTERACTIVE SHOWCASE PREVIEW */}
          <div id="playground" className="w-full max-w-5xl pt-4 scroll-mt-24">
            <div className="rounded border border-stone-300 dark:border-zinc-800 bg-[#f8f6f0] dark:bg-[#18181b] shadow-sm overflow-hidden text-left">
              {/* Mockup Header */}
              <div className="px-4 py-2.5 bg-stone-200/80 dark:bg-zinc-900 border-b border-stone-300 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-400 dark:bg-zinc-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-400 dark:bg-zinc-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-400 dark:bg-zinc-700" />
                  <span className="font-mono text-xs font-bold text-stone-700 dark:text-zinc-300 ml-2">
                    Algorithm Inspector Sandbox
                  </span>
                </div>
                {/* Algorithm Switcher Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto">
                  {SANDBOX_EXAMPLES.map((ex, idx) => (
                    <button
                      key={ex.id}
                      onClick={() => setSelectedExample(idx)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-all cursor-pointer ${
                        selectedExample === idx
                          ? 'bg-orange-600 text-white shadow-xs'
                          : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-stone-100'
                      }`}
                    >
                      {ex.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code & Metrics Split Body */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-stretch">
                {/* Code View */}
                <div className="md:col-span-7 flex flex-col justify-between p-3.5 rounded bg-zinc-900 text-zinc-100 font-mono text-xs space-y-3 border border-zinc-800">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-[11px] text-zinc-400">
                    <span className="font-bold text-orange-400">{activeEx.title}</span>
                    <span>{activeEx.lang}</span>
                  </div>
                  <pre className="leading-relaxed text-zinc-200 overflow-x-auto my-1">
                    <code>{activeEx.code}</code>
                  </pre>
                  <div className="text-[10px] text-zinc-400 border-t border-zinc-800 pt-2 flex items-center gap-1.5 font-mono">
                    <Zap className="w-3 h-3 text-orange-400" />
                    <span>AST Parsed in 0.08s</span>
                  </div>
                </div>

                {/* Live Complexity Cards Preview */}
                <div className="md:col-span-5 flex flex-col justify-between space-y-3">
                  <div className="grid grid-cols-2 gap-2.5 flex-1">
                    <div className="p-3.5 rounded bg-[#f3efe6] dark:bg-zinc-900/90 border border-stone-300 dark:border-zinc-800 flex flex-col justify-center">
                      <span className="text-[10px] uppercase font-mono font-bold text-stone-500 dark:text-zinc-400">
                        Time Complexity
                      </span>
                      <div className="text-xl font-bold font-mono text-orange-700 dark:text-orange-400 mt-1">
                        <MathView math={activeEx.complexity} />
                      </div>
                    </div>

                    <div className="p-3.5 rounded bg-[#f3efe6] dark:bg-zinc-900/90 border border-stone-300 dark:border-zinc-800 flex flex-col justify-center">
                      <span className="text-[10px] uppercase font-mono font-bold text-stone-500 dark:text-zinc-400">
                        Space Complexity
                      </span>
                      <div className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-1">
                        <MathView math={activeEx.space} />
                      </div>
                    </div>

                    <div className="p-3.5 rounded bg-[#f3efe6] dark:bg-zinc-900/90 border border-stone-300 dark:border-zinc-800 flex flex-col justify-center">
                      <span className="text-[10px] uppercase font-mono font-bold text-stone-500 dark:text-zinc-400">
                        Step Formula
                      </span>
                      <div className="text-xs font-bold font-mono text-stone-800 dark:text-zinc-200 mt-1 truncate">
                        <MathView math={activeEx.formula} />
                      </div>
                    </div>

                    <div className="p-3.5 rounded bg-[#f3efe6] dark:bg-zinc-900/90 border border-stone-300 dark:border-zinc-800 flex flex-col justify-center">
                      <span className="text-[10px] uppercase font-mono font-bold text-stone-500 dark:text-zinc-400">
                        Dominant Term
                      </span>
                      <div className="text-lg font-bold font-mono text-orange-800 dark:text-orange-300 mt-1">
                        <MathView math={activeEx.dominant} />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={onLaunchAnalyzer}
                    className="w-full py-2.5 rounded bg-orange-600 hover:bg-orange-700 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
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
        <section id="features" className="px-6 max-w-6xl mx-auto w-full space-y-6 scroll-mt-24">
          <div className="text-center space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-mono">
              Built for Algorithmic Analysis
            </h2>
            <p className="text-xs text-stone-600 dark:text-zinc-400 max-w-xl mx-auto font-sans">
              Everything you need to audit, compare, and optimize software execution efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Feature 1 */}
            <div className="p-5 rounded border border-stone-300 dark:border-zinc-800 bg-[#f8f6f0] dark:bg-[#18181b] space-y-2.5 shadow-xs">
              <div className="p-2 rounded bg-orange-600/10 text-orange-700 dark:text-orange-400 w-fit border border-orange-600/20">
                <Calculator className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-mono">
                AST & Symbolic Math Engine
              </h3>
              <p className="text-xs text-stone-600 dark:text-zinc-400 leading-relaxed font-sans">
                Derives mathematical step equations <MathView math="T(N)" /> using AST structural parsing and SymPy symbolic summation bounds for single and multi-variable loops.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-5 rounded border border-stone-300 dark:border-zinc-800 bg-[#f8f6f0] dark:bg-[#18181b] space-y-2.5 shadow-xs">
              <div className="p-2 rounded bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 w-fit border border-emerald-600/20">
                <ListTree className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-mono">
                Line-by-Line Cost Heatmap
              </h3>
              <p className="text-xs text-stone-600 dark:text-zinc-400 leading-relaxed font-sans">
                Highlights execution frequency directly on source code lines in Monaco Editor to pinpoint nested iterations and non-trivial hidden operations like <code className="font-mono">arr.pop(0)</code> or <code className="font-mono">item in list</code>.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-5 rounded border border-stone-300 dark:border-zinc-800 bg-[#f8f6f0] dark:bg-[#18181b] space-y-2.5 shadow-xs">
              <div className="p-2 rounded bg-orange-600/10 text-orange-700 dark:text-orange-400 w-fit border border-orange-600/20">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-mono">
                Empirical Execution Benchmarks
              </h3>
              <p className="text-xs text-stone-600 dark:text-zinc-400 leading-relaxed font-sans">
                Executes microsecond timings across scaled input sizes ($N=10$ to $N=10,000$) and plots empirical curves against theoretical growth functions ($O(N)$, $O(N^2)$).
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-5 rounded border border-stone-300 dark:border-zinc-800 bg-[#f8f6f0] dark:bg-[#18181b] space-y-2.5 shadow-xs">
              <div className="p-2 rounded bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 w-fit border border-emerald-600/20">
                <Network className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-mono">
                AST Control Flow Graph
              </h3>
              <p className="text-xs text-stone-600 dark:text-zinc-400 leading-relaxed font-sans">
                Visualizes control flow paths, loop entry nodes, recursive branches, and conditional decisions with interactive React Flow node exploration.
              </p>
            </div>
          </div>
        </section>

        {/* SUPPORTED LANGUAGES */}
        <section id="languages" className="px-6 max-w-5xl mx-auto w-full space-y-6 scroll-mt-24">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-mono">
              Supported Programming Languages
            </h2>
            <p className="text-xs text-stone-600 dark:text-zinc-400 max-w-xl mx-auto font-sans">
              Multi-language static code analysis with dedicated parsing pipelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded border border-stone-300 dark:border-zinc-800 bg-[#f8f6f0] dark:bg-[#18181b] space-y-2.5 text-center">
              <span className="px-2.5 py-0.5 rounded bg-orange-600/10 text-orange-700 dark:text-orange-400 border border-orange-600/20 font-bold font-mono text-[11px]">
                PYTHON 3
              </span>
              <h4 className="text-xs font-bold font-mono text-stone-900 dark:text-stone-100">AST & Subprocess Engine</h4>
              <p className="text-xs text-stone-600 dark:text-zinc-400 leading-relaxed font-sans">
                Full AST node visitor parsing, SymPy loop summation, matrix space detection, and isolated subprocess micro-benchmarking.
              </p>
            </div>

            <div className="p-5 rounded border border-stone-300 dark:border-zinc-800 bg-[#f8f6f0] dark:bg-[#18181b] space-y-2.5 text-center">
              <span className="px-2.5 py-0.5 rounded bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 border border-emerald-600/20 font-bold font-mono text-[11px]">
                C++ (CPP)
              </span>
              <h4 className="text-xs font-bold font-mono text-stone-900 dark:text-stone-100">Loop & Vector Inspection</h4>
              <p className="text-xs text-stone-600 dark:text-zinc-400 leading-relaxed font-sans">
                Parses C++ functions, nested <code className="font-mono">for</code> / <code className="font-mono">while</code> loops, boundary variables, and <code className="font-mono">std::vector</code> operations.
              </p>
            </div>

            <div className="p-5 rounded border border-stone-300 dark:border-zinc-800 bg-[#f8f6f0] dark:bg-[#18181b] space-y-2.5 text-center">
              <span className="px-2.5 py-0.5 rounded bg-orange-600/10 text-orange-700 dark:text-orange-400 border border-orange-600/20 font-bold font-mono text-[11px]">
                JAVA
              </span>
              <h4 className="text-xs font-bold font-mono text-stone-900 dark:text-stone-100">Method & Array Analysis</h4>
              <p className="text-xs text-stone-600 dark:text-zinc-400 leading-relaxed font-sans">
                Evaluates Java methods, array iterations, nested loops, conditional branches, and scalar allocation patterns.
              </p>
            </div>
          </div>
        </section>

        {/* WORKFLOW PIPELINE */}
        <section id="workflow" className="px-6 max-w-5xl mx-auto w-full space-y-6 scroll-mt-24">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-mono">
              Analysis Workflow
            </h2>
            <p className="text-xs text-stone-600 dark:text-zinc-400 max-w-xl mx-auto font-sans">
              Three simple steps to evaluate your algorithm's efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded border border-stone-300 dark:border-zinc-800 bg-[#f8f6f0] dark:bg-[#18181b] space-y-2.5 text-center">
              <div className="w-8 h-8 rounded bg-stone-200 dark:bg-zinc-800 text-stone-900 dark:text-stone-100 font-mono font-bold flex items-center justify-center mx-auto text-xs border border-stone-300 dark:border-zinc-700">
                01
              </div>
              <h4 className="text-xs font-bold font-mono text-stone-900 dark:text-stone-100">Paste or Load Code</h4>
              <p className="text-xs text-stone-600 dark:text-zinc-400 leading-relaxed font-sans">
                Write your code in Monaco Editor or load algorithm presets like Two Sum, Bubble Sort, or Merge Sort.
              </p>
            </div>

            <div className="p-5 rounded border border-stone-300 dark:border-zinc-800 bg-[#f8f6f0] dark:bg-[#18181b] space-y-2.5 text-center">
              <div className="w-8 h-8 rounded bg-stone-200 dark:bg-zinc-800 text-stone-900 dark:text-stone-100 font-mono font-bold flex items-center justify-center mx-auto text-xs border border-stone-300 dark:border-zinc-700">
                02
              </div>
              <h4 className="text-xs font-bold font-mono text-stone-900 dark:text-stone-100">AST Analysis Engine</h4>
              <p className="text-xs text-stone-600 dark:text-zinc-400 leading-relaxed font-sans">
                The engine evaluates loops, solves closed-form summation math equations, and runs microsecond benchmarks.
              </p>
            </div>

            <div className="p-5 rounded border border-stone-300 dark:border-zinc-800 bg-[#f8f6f0] dark:bg-[#18181b] space-y-2.5 text-center">
              <div className="w-8 h-8 rounded bg-stone-200 dark:bg-zinc-800 text-stone-900 dark:text-stone-100 font-mono font-bold flex items-center justify-center mx-auto text-xs border border-stone-300 dark:border-zinc-700">
                03
              </div>
              <h4 className="text-xs font-bold font-mono text-stone-900 dark:text-stone-100">Inspect & Export</h4>
              <p className="text-xs text-stone-600 dark:text-zinc-400 leading-relaxed font-sans">
                Review asymptotic cards, heatmaps, growth curves, AI breakdown, and generate printable PDF lab reports.
              </p>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA BANNER */}
        <section className="px-6 max-w-4xl mx-auto w-full">
          <div className="p-8 rounded border border-stone-300 dark:border-zinc-800 bg-[#f8f6f0] dark:bg-[#18181b] text-center space-y-4 shadow-xs">
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">
                Ready to inspect your code's complexity?
              </h3>
              <p className="text-xs text-stone-600 dark:text-zinc-400 max-w-lg mx-auto font-sans">
                Launch the analyzer workspace now to inspect Big-O bounds and operation step formulas.
              </p>
            </div>
            <button
              onClick={onLaunchAnalyzer}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded text-xs font-mono font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-xs transition-all cursor-pointer"
            >
              <Terminal className="w-4 h-4" />
              <span>Launch Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="px-6 pt-4 text-center text-[11px] font-mono text-stone-500 dark:text-zinc-500 border-t border-stone-300/60 dark:border-zinc-800/60 max-w-6xl mx-auto">
          <p>ComplexityLens — Real-Time Algorithmic & Asymptotic Complexity Inspector</p>
        </footer>
      </div>
    </div>
  );
}
