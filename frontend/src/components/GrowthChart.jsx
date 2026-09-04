import React, { useState } from 'react';
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
import { TrendingUp, Play, Zap, Cpu, CheckCircle2 } from 'lucide-react';

export default function GrowthChart({
  benchmarkData,
  timeComplexityO,
  isLiveExecution,
  curveFit,
  onRunCustomBenchmark,
  isBenchmarking
}) {
  const [maxN, setMaxN] = useState(10000);
  const [metricMode, setMetricMode] = useState('runtime'); // 'runtime' | 'steps'
  const [activeCurves, setActiveCurves] = useState({
    measured: true,
    O_1: false,
    O_logN: false,
    O_N: true,
    O_NlogN: timeComplexityO === 'O(N log N)',
    O_N2: timeComplexityO === 'O(N²)',
  });

  if (!benchmarkData || benchmarkData.length === 0) {
    return (
      <div className="glass-panel h-full flex-1 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-slate-500 text-xs p-6 space-y-2">
        <Cpu className="w-8 h-8 text-slate-600 animate-pulse" />
        <p>Empirical benchmark & runtime curve visualizer ready.</p>
        <p className="text-[11px] text-slate-600">Run code analysis to measure execution times.</p>
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

  return (
    <div className="glass-panel h-full flex-1 rounded-xl border border-slate-800 overflow-hidden shadow-xl flex flex-col min-h-0 bg-slate-950/60">
      {/* Top Header Controls Bar */}
      <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            Interactive Sandbox Benchmark
          </h3>

          {/* Sandbox Status Badge */}
          <div className="flex items-center gap-1.5 ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />
            <span>{isLiveExecution ? 'Sandbox Timing Active' : 'Step Simulation'}</span>
          </div>

          {/* Curve Fit Accuracy Badge */}
          {curveFit && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border bg-cyan-500/10 text-cyan-300 border-cyan-500/30" title="Coefficient of determination (R²) regression score against theoretical complexity curves">
              <CheckCircle2 className="w-3 h-3 text-cyan-400" />
              <span>{curveFit.fit_percentage}% match to {curveFit.best_fit_complexity}</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px] font-semibold">
            <button
              onClick={() => setMetricMode('runtime')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                metricMode === 'runtime'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Measured Runtime (ms)
            </button>
            <button
              onClick={() => setMetricMode('steps')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                metricMode === 'steps'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Theoretical Steps
            </button>
          </div>

          {/* Input Size Max N Slider */}
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 text-[10px]">
            <span className="text-slate-400 font-mono">Max N:</span>
            <span className="text-cyan-400 font-mono font-bold w-12">{maxN.toLocaleString()}</span>
            <input
              type="range"
              min="500"
              max="50000"
              step="500"
              value={maxN}
              onChange={(e) => setMaxN(Number(e.target.value))}
              className="w-16 accent-cyan-500 h-1 bg-slate-800 rounded cursor-pointer"
            />
          </div>

          {/* Trigger Benchmark */}
          <button
            onClick={handleRunClick}
            disabled={isBenchmarking}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold text-white bg-cyan-600 hover:bg-cyan-500 active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-cyan-600/20"
          >
            {isBenchmarking ? (
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Play className="w-3 h-3 fill-white" />
            )}
            <span>Run Benchmark</span>
          </button>
        </div>
      </div>

      {/* Theoretical Curve Filter Pills */}
      <div className="px-4 py-1.5 bg-slate-900/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 shrink-0 text-[10px]">
        <span className="text-slate-400 font-medium">Toggle Comparison Overlay Curves:</span>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => toggleCurve('measured')}
            className={`px-2 py-0.5 rounded border font-semibold transition-all ${
              activeCurves.measured
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            Empirical {metricMode === 'runtime' ? 'Runtime' : 'Steps'}
          </button>
          <button
            onClick={() => toggleCurve('O_N')}
            className={`px-2 py-0.5 rounded border font-semibold transition-all ${
              activeCurves.O_N
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            O(N)
          </button>
          <button
            onClick={() => toggleCurve('O_NlogN')}
            className={`px-2 py-0.5 rounded border font-semibold transition-all ${
              activeCurves.O_NlogN
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            O(N log N)
          </button>
          <button
            onClick={() => toggleCurve('O_N2')}
            className={`px-2 py-0.5 rounded border font-semibold transition-all ${
              activeCurves.O_N2
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            O(N²)
          </button>
          <button
            onClick={() => toggleCurve('O_1')}
            className={`px-2 py-0.5 rounded border font-semibold transition-all ${
              activeCurves.O_1
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            O(1)
          </button>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="flex-1 w-full p-3 bg-slate-950/40 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={benchmarkData} margin={{ top: 10, right: 25, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="n"
              stroke="#64748b"
              fontSize={10}
              tickFormatter={(val) => `N=${val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}`}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              label={{ value: yLabel, angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
              tickFormatter={(val) =>
                val >= 1000000
                  ? `${(val / 1000000).toFixed(1)}M`
                  : val >= 1000
                  ? `${(val / 1000).toFixed(0)}k`
                  : val
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '10px',
                fontSize: '11px',
                color: '#f8fafc',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
              }}
              formatter={(val, name) => [
                typeof val === 'number' ? val.toLocaleString() + (metricMode === 'runtime' && name.includes('Empirical') ? ' ms' : '') : val,
                name
              ]}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />

            {activeCurves.measured && (
              <Line
                type="monotone"
                dataKey={dataKey}
                name={metricMode === 'runtime' ? `Empirical Timing (${timeComplexityO})` : `Theoretical Steps (${timeComplexityO})`}
                stroke="#38bdf8"
                strokeWidth={3}
                dot={{ r: 4, fill: '#38bdf8', stroke: '#0284c7', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#38bdf8' }}
              />
            )}
            {activeCurves.O_1 && (
              <Line
                type="monotone"
                dataKey="O_1"
                name="Reference O(1)"
                stroke="#34d399"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                dot={false}
              />
            )}
            {activeCurves.O_N && (
              <Line
                type="monotone"
                dataKey="O_N"
                name="Reference O(N)"
                stroke="#60a5fa"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                dot={false}
              />
            )}
            {activeCurves.O_NlogN && (
              <Line
                type="monotone"
                dataKey="O_NlogN"
                name="Reference O(N log N)"
                stroke="#fbbf24"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                dot={false}
              />
            )}
            {activeCurves.O_N2 && (
              <Line
                type="monotone"
                dataKey="O_N2"
                name="Reference O(N²)"
                stroke="#fb7185"
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
}
