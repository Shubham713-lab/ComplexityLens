import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { TrendingUp, Play, Maximize2, Minimize2, X, Cpu } from 'lucide-react';

export default function GrowthChart({
  benchmarkData,
  timeComplexityO,
  isLiveExecution,
  curveFit,
  onRunCustomBenchmark,
  isBenchmarking,
  theme
}) {
  const [maxN, setMaxN] = useState(10000);
  const [metricMode, setMetricMode] = useState('runtime'); // 'runtime' | 'steps'
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [activeCurves, setActiveCurves] = useState({
    measured: true,
    O_1: false,
    O_logN: false,
    O_N: true,
    O_NlogN: timeComplexityO === 'O(N log N)',
    O_N2: timeComplexityO === 'O(N²)',
  });

  const isLight = theme === 'light';
  const gridColor = isLight ? '#e2e8f0' : '#1e293b';
  const axisColor = isLight ? '#475569' : '#64748b';
  const tooltipBg = isLight ? '#ffffff' : '#0f172a';
  const tooltipBorder = isLight ? '#cbd5e1' : '#334155';
  const tooltipText = isLight ? '#0f172a' : '#f8fafc';

  // Listen for Escape key to exit fullscreen mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen]);

  // Dynamically fit theoretical reference curves to measured data using least squares
  const processedData = useMemo(() => {
    if (!benchmarkData || benchmarkData.length === 0) return [];

    const getY = (d) => (metricMode === 'runtime' ? d.measured_time_ms || 0 : d.actual_steps || 0);

    // Least Squares curve fitting: c = sum(y * f) / sum(f^2)
    const getFittedCoeff = (getF) => {
      let num = 0;
      let den = 0;
      for (const d of benchmarkData) {
        const y = getY(d);
        const f = getF(d);
        num += y * f;
        den += f * f;
      }
      if (den <= 0) return 0;
      return num / den;
    };

    const c_O1 = getFittedCoeff(() => 1);
    const c_OlogN = getFittedCoeff((d) => Math.log2(Math.max(1, d.n)));
    const c_ON = getFittedCoeff((d) => d.n);
    const c_ONlogN = getFittedCoeff((d) => d.n * Math.log2(Math.max(1, d.n)));
    const c_ON2 = getFittedCoeff((d) => d.n ** 2);

    return benchmarkData.map((d) => {
      const n = d.n;
      const logN = Math.log2(Math.max(1, n));

      return {
        ...d,
        O_1_scaled: Number((c_O1 * 1).toFixed(4)),
        O_logN_scaled: Number((c_OlogN * logN).toFixed(4)),
        O_N_scaled: Number((c_ON * n).toFixed(4)),
        O_NlogN_scaled: Number((c_ONlogN * (n * logN)).toFixed(4)),
        O_N2_scaled: Number((c_ON2 * (n ** 2)).toFixed(4))
      };
    });
  }, [benchmarkData, metricMode]);

  if (!benchmarkData || benchmarkData.length === 0) {
    return (
      <div className="glass-panel h-full flex-1 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 text-xs p-6 space-y-2">
        <Cpu className="w-8 h-8 text-slate-400 animate-pulse" />
        <p>Growth Rate Curves will render after code analysis.</p>
      </div>
    );
  }

  const toggleCurve = (key) => {
    setActiveCurves((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRunClick = () => {
    if (onRunCustomBenchmark) {
      onRunCustomBenchmark(maxN);
    }
  };

  const dataKey = metricMode === 'runtime' ? 'measured_time_ms' : 'actual_steps';
  const yLabel = metricMode === 'runtime' ? 'Time (ms)' : 'Steps Count';

  const renderHeader = (inModal = false) => (
    <div className={`px-4 py-2 bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 ${inModal ? 'rounded-t-2xl' : ''}`}>
      {/* Title */}
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
        <h3 className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
          Growth Rate Curves {inModal && '(Fullscreen)'}
        </h3>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Metric Switcher */}
        <div className="flex bg-white dark:bg-slate-950 p-0.5 rounded-lg border border-slate-300 dark:border-slate-800 text-xs font-medium">
          <button
            onClick={() => setMetricMode('runtime')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              metricMode === 'runtime'
                ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Runtime (ms)
          </button>
          <button
            onClick={() => setMetricMode('steps')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              metricMode === 'steps'
                ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Steps
          </button>
        </div>

        {/* Max N Slider */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-800 text-xs">
          <span className="text-slate-500 dark:text-slate-400">Max N:</span>
          <span className="text-cyan-700 dark:text-cyan-400 font-mono font-bold w-12">{maxN.toLocaleString()}</span>
          <input
            type="range"
            min="500"
            max="50000"
            step="500"
            value={maxN}
            onChange={(e) => setMaxN(Number(e.target.value))}
            className="w-16 accent-cyan-500 h-1 bg-slate-200 dark:bg-slate-800 rounded cursor-pointer"
          />
        </div>

        {/* Run Benchmark Button */}
        <button
          onClick={handleRunClick}
          disabled={isBenchmarking}
          className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
        >
          {isBenchmarking ? (
            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Play className="w-3 h-3 fill-white" />
          )}
          <span>Run</span>
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={() => setIsFullScreen(!isFullScreen)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-sm"
          title={isFullScreen ? 'Exit Fullscreen (Esc)' : 'Expand Fullscreen View'}
        >
          {isFullScreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Exit</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Fullscreen</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderChart = () => (
    <div className="flex-1 w-full flex flex-col min-h-0 bg-slate-50/50 dark:bg-slate-950/40">
      {/* Curve Filter Pills Toolbar */}
      <div className="px-4 py-1.5 bg-slate-100/60 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => toggleCurve('measured')}
            className={`px-2.5 py-0.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              activeCurves.measured
                ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/40'
                : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-800'
            }`}
          >
            Measured ({timeComplexityO || 'O(N)'})
          </button>
          <button
            onClick={() => toggleCurve('O_N')}
            className={`px-2.5 py-0.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              activeCurves.O_N
                ? 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/40'
                : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-800'
            }`}
          >
            O(N) Shape
          </button>
          <button
            onClick={() => toggleCurve('O_NlogN')}
            className={`px-2.5 py-0.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              activeCurves.O_NlogN
                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40'
                : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-800'
            }`}
          >
            O(N log N) Shape
          </button>
          <button
            onClick={() => toggleCurve('O_N2')}
            className={`px-2.5 py-0.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              activeCurves.O_N2
                ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/40'
                : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-800'
            }`}
          >
            O(N²) Shape
          </button>
          <button
            onClick={() => toggleCurve('O_1')}
            className={`px-2.5 py-0.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              activeCurves.O_1
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-800'
            }`}
          >
            O(1) Shape
          </button>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="flex-1 w-full p-3 min-h-0 h-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={processedData} margin={{ top: 10, right: 25, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="n"
              stroke={axisColor}
              fontSize={11}
              tickFormatter={(val) => `N=${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
            />
            <YAxis
              stroke={axisColor}
              fontSize={11}
              label={{ value: yLabel, angle: -90, position: 'insideLeft', fill: axisColor, fontSize: 11 }}
              tickFormatter={(val) =>
                val >= 1000000
                  ? `${(val / 1000000).toFixed(1)}M`
                  : val >= 1000
                  ? `${(val / 1000).toFixed(1)}k`
                  : val
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                borderColor: tooltipBorder,
                borderRadius: '10px',
                fontSize: '12px',
                color: tooltipText,
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)'
              }}
              formatter={(val, name) => {
                if (typeof val === 'number') {
                  if (metricMode === 'runtime') {
                    return [val.toLocaleString() + ' ms', name];
                  }
                  return [val.toLocaleString() + ' steps', name];
                }
                return [val, name];
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />

            {activeCurves.measured && (
              <Line
                type="monotone"
                dataKey={dataKey}
                name={metricMode === 'runtime' ? `Measured Runtime (${timeComplexityO})` : `Actual Steps (${timeComplexityO})`}
                stroke={isLight ? '#0284c7' : '#38bdf8'}
                strokeWidth={3}
                dot={{ r: 4, fill: isLight ? '#0284c7' : '#38bdf8', stroke: isLight ? '#0369a1' : '#0284c7', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: isLight ? '#0284c7' : '#38bdf8' }}
              />
            )}
            {activeCurves.O_1 && (
              <Line
                type="monotone"
                dataKey="O_1_scaled"
                name="O(1) Curve"
                stroke={isLight ? '#059669' : '#34d399'}
                strokeDasharray="4 4"
                strokeWidth={1.5}
                dot={false}
              />
            )}
            {activeCurves.O_N && (
              <Line
                type="monotone"
                dataKey="O_N_scaled"
                name="O(N) Curve"
                stroke={isLight ? '#2563eb' : '#60a5fa'}
                strokeDasharray="4 4"
                strokeWidth={1.5}
                dot={false}
              />
            )}
            {activeCurves.O_NlogN && (
              <Line
                type="monotone"
                dataKey="O_NlogN_scaled"
                name="O(N log N) Curve"
                stroke={isLight ? '#d97706' : '#fbbf24'}
                strokeDasharray="4 4"
                strokeWidth={1.5}
                dot={false}
              />
            )}
            {activeCurves.O_N2 && (
              <Line
                type="monotone"
                dataKey="O_N2_scaled"
                name="O(N²) Curve"
                stroke={isLight ? '#e11d48' : '#fb7185'}
                strokeDasharray="4 4"
                strokeWidth={1.5}
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <>
      {/* Embedded Panel */}
      <div className="glass-panel h-full flex-1 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl flex flex-col min-h-0 bg-white/80 dark:bg-slate-950/60">
        {renderHeader(false)}
        {renderChart()}
      </div>

      {/* Fullscreen Overlay */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 dark:bg-[#0b0f19]/95 backdrop-blur-xl flex flex-col p-4">
          <div className="glass-panel h-full w-full rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col overflow-hidden bg-white dark:bg-slate-950">
            <div className="px-4 py-3 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                  Growth Rate Curves (Fullscreen)
                </h3>
              </div>

              <button
                onClick={() => setIsFullScreen(false)}
                className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Close Fullscreen (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {renderChart()}
          </div>
        </div>
      )}
    </>
  );
}
