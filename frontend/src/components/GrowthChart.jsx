import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Brush
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
  const gridColor = isLight ? '#e7e2d7' : '#27272a';
  const axisColor = isLight ? '#78716c' : '#a1a1aa';
  const tooltipBg = isLight ? '#f8f6f0' : '#18181b';
  const tooltipBorder = isLight ? '#d6cebf' : '#3f3f46';
  const tooltipText = isLight ? '#1c1917' : '#f5f5f4';

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen]);

  const processedData = useMemo(() => {
    if (!benchmarkData || benchmarkData.length === 0) return [];

    const getY = (d) => (metricMode === 'runtime' ? d.measured_time_ms || 0 : d.actual_steps || 0);

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
      <div className="swiss-panel h-full flex-1 rounded border border-stone-300 dark:border-zinc-800 flex flex-col items-center justify-center text-stone-500 dark:text-zinc-400 text-xs p-6 space-y-2 bg-[#f8f6f0] dark:bg-[#18181b]">
        <Cpu className="w-6 h-6 text-orange-600 dark:text-orange-400" />
        <p className="font-mono">Growth Rate Curves will render after code analysis.</p>
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
    <div className="px-3.5 py-1.5 bg-stone-200/80 dark:bg-zinc-900 border-b border-stone-300 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400" />
        <h3 className="text-xs font-mono font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
          Growth Rate Curves {inModal && '(Fullscreen)'}
        </h3>
      </div>

      <div className="flex flex-wrap items-center gap-2 font-mono">
        <div className="flex bg-stone-100 dark:bg-zinc-950 p-0.5 rounded border border-stone-300 dark:border-zinc-800 text-[11px]">
          <button
            onClick={() => setMetricMode('runtime')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${metricMode === 'runtime'
                ? 'bg-orange-600 text-white font-bold'
                : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
          >
            Runtime (ms)
          </button>
          <button
            onClick={() => setMetricMode('steps')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${metricMode === 'steps'
                ? 'bg-emerald-700 text-white font-bold'
                : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
          >
            Steps
          </button>
        </div>

        <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-zinc-950 px-2 py-0.5 rounded border border-stone-300 dark:border-zinc-800 text-[11px]">
          <span className="text-stone-500 dark:text-zinc-400">Max N:</span>
          <span className="text-orange-700 dark:text-orange-400 font-bold w-12">{maxN.toLocaleString()}</span>
          <input
            type="range"
            min="500"
            max="50000"
            step="500"
            value={maxN}
            onChange={(e) => setMaxN(Number(e.target.value))}
            className="w-16 accent-orange-600 h-1 bg-stone-300 dark:bg-zinc-800 rounded cursor-pointer"
          />
        </div>

        <button
          onClick={handleRunClick}
          disabled={isBenchmarking}
          className="flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono font-bold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 transition-all cursor-pointer"
        >
          {isBenchmarking ? (
            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Play className="w-3 h-3 fill-white" />
          )}
          <span>Run</span>
        </button>

        <button
          onClick={() => setIsFullScreen(!isFullScreen)}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono bg-stone-100 dark:bg-zinc-950 border border-stone-300 dark:border-zinc-800 text-stone-800 dark:text-zinc-200 hover:text-stone-900 dark:hover:text-white transition-all cursor-pointer"
        >
          {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );

  const renderChart = () => (
    <div className="flex-1 w-full flex flex-col min-h-0 bg-[#f8f6f0] dark:bg-[#18181b]">
      {/* Curve Filter Pills Toolbar */}
      <div className="px-3 py-1 bg-stone-200/50 dark:bg-zinc-900/50 border-b border-stone-300 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => toggleCurve('measured')}
            className={`px-2 py-0.5 rounded border text-[11px] font-semibold transition-all cursor-pointer ${activeCurves.measured
                ? 'bg-orange-600 text-white border-orange-700'
                : 'bg-stone-100 dark:bg-zinc-900 text-stone-600 dark:text-zinc-400 border-stone-300 dark:border-zinc-800'
              }`}
          >
            Measured ({timeComplexityO || 'O(N)'})
          </button>
          <button
            onClick={() => toggleCurve('O_N')}
            className={`px-2 py-0.5 rounded border text-[11px] font-semibold transition-all cursor-pointer ${activeCurves.O_N
                ? 'bg-emerald-700 text-white border-emerald-800'
                : 'bg-stone-100 dark:bg-zinc-900 text-stone-600 dark:text-zinc-400 border-stone-300 dark:border-zinc-800'
              }`}
          >
            O(N) Shape
          </button>
          <button
            onClick={() => toggleCurve('O_NlogN')}
            className={`px-2 py-0.5 rounded border text-[11px] font-semibold transition-all cursor-pointer ${activeCurves.O_NlogN
                ? 'bg-amber-700 text-white border-amber-800'
                : 'bg-stone-100 dark:bg-zinc-900 text-stone-600 dark:text-zinc-400 border-stone-300 dark:border-zinc-800'
              }`}
          >
            O(N log N) Shape
          </button>
          <button
            onClick={() => toggleCurve('O_N2')}
            className={`px-2 py-0.5 rounded border text-[11px] font-semibold transition-all cursor-pointer ${activeCurves.O_N2
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-stone-900'
                : 'bg-stone-100 dark:bg-zinc-900 text-stone-600 dark:text-zinc-400 border-stone-300 dark:border-zinc-800'
              }`}
          >
            O(N²) Shape
          </button>
          <button
            onClick={() => toggleCurve('O_1')}
            className={`px-2 py-0.5 rounded border text-[11px] font-semibold transition-all cursor-pointer ${activeCurves.O_1
                ? 'bg-stone-700 text-white border-stone-800'
                : 'bg-stone-100 dark:bg-zinc-900 text-stone-600 dark:text-zinc-400 border-stone-300 dark:border-zinc-800'
              }`}
          >
            O(1) Shape
          </button>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="flex-1 w-full p-2.5 min-h-0 h-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={processedData} margin={{ top: 10, right: 25, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="2 2" stroke={gridColor} />
            <XAxis
              dataKey="n"
              stroke={axisColor}
              fontSize={10}
              tickFormatter={(val) => `N=${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
            />
            <YAxis
              stroke={axisColor}
              fontSize={10}
              label={{ value: yLabel, angle: -90, position: 'insideLeft', fill: axisColor, fontSize: 10 }}
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
                borderRadius: '4px',
                fontSize: '11px',
                fontFamily: 'JetBrains Mono',
                color: tooltipText,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
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
            <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'JetBrains Mono', paddingTop: '4px' }} />

            {activeCurves.measured && (
              <Line
                type="monotone"
                dataKey={dataKey}
                name={metricMode === 'runtime' ? `Measured Runtime (${timeComplexityO})` : `Actual Steps (${timeComplexityO})`}
                stroke={isLight ? '#ea580c' : '#f97316'}
                strokeWidth={2.5}
                dot={{ r: 3, fill: isLight ? '#ea580c' : '#f97316', stroke: isLight ? '#c2410c' : '#ea580c', strokeWidth: 1.5 }}
                activeDot={{ r: 5, fill: isLight ? '#ea580c' : '#f97316' }}
              />
            )}
            {activeCurves.O_1 && (
              <Line
                type="monotone"
                dataKey="O_1_scaled"
                name="O(1) Curve"
                stroke={isLight ? '#78716c' : '#a1a1aa'}
                strokeDasharray="3 3"
                strokeWidth={1.5}
                dot={false}
              />
            )}
            {activeCurves.O_N && (
              <Line
                type="monotone"
                dataKey="O_N_scaled"
                name="O(N) Curve"
                stroke={isLight ? '#15803d' : '#22c55e'}
                strokeDasharray="3 3"
                strokeWidth={1.5}
                dot={false}
              />
            )}
            {activeCurves.O_NlogN && (
              <Line
                type="monotone"
                dataKey="O_NlogN_scaled"
                name="O(N log N) Curve"
                stroke={isLight ? '#b45309' : '#f59e0b'}
                strokeDasharray="3 3"
                strokeWidth={1.5}
                dot={false}
              />
            )}
            {activeCurves.O_N2 && (
              <Line
                type="monotone"
                dataKey="O_N2_scaled"
                name="O(N²) Curve"
                stroke={isLight ? '#1c1917' : '#f5f5f4'}
                strokeDasharray="3 3"
                strokeWidth={1.5}
                dot={false}
              />
            )}
            <Brush
              dataKey="n"
              height={22}
              stroke={isLight ? '#ea580c' : '#f97316'}
              fill={isLight ? '#f8f6f0' : '#18181b'}
              tickFormatter={(val) => `N=${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
              travellerWidth={8}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <>
      <div className="swiss-panel h-full flex-1 rounded border border-stone-300 dark:border-zinc-800 overflow-hidden shadow-xs flex flex-col min-h-0 bg-[#f8f6f0] dark:bg-[#18181b]">
        {renderHeader(false)}
        {renderChart()}
      </div>

      {isFullScreen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 dark:bg-black/85 flex flex-col p-4">
          <div className="swiss-panel h-full w-full rounded border border-stone-300 dark:border-zinc-800 shadow-lg flex flex-col overflow-hidden bg-[#f8f6f0] dark:bg-[#18181b]">
            <div className="px-4 py-2 bg-stone-200/80 dark:bg-zinc-900 border-b border-stone-300 dark:border-zinc-800 flex items-center justify-between shrink-0 font-mono">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                  Growth Rate Curves (Fullscreen)
                </h3>
              </div>

              <button
                onClick={() => setIsFullScreen(false)}
                className="p-1 rounded text-stone-500 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-white"
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
