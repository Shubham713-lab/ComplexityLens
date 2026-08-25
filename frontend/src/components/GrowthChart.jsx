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
import { TrendingUp } from 'lucide-react';

export default function GrowthChart({ benchmarkData, timeComplexityO }) {
  const [activeCurves, setActiveCurves] = useState({
    actual: true,
    O_1: false,
    O_logN: false,
    O_N: true,
    O_NlogN: false,
    O_N2: timeComplexityO === 'O(N²)',
  });

  if (!benchmarkData || benchmarkData.length === 0) {
    return (
      <div className="glass-panel h-full flex-1 rounded-xl border border-slate-800 flex items-center justify-center text-slate-500 text-xs">
        Empirical growth chart will render after code analysis.
      </div>
    );
  }

  const toggleCurve = (key) => {
    setActiveCurves((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="glass-panel h-full flex-1 rounded-xl border border-slate-800 overflow-hidden shadow-xl flex flex-col min-h-0">
      <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Empirical Operations Growth Rate (T(N) vs Big O)
          </h3>
        </div>

        {/* Curve Toggle Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
          <button
            onClick={() => toggleCurve('actual')}
            className={`px-2 py-0.5 rounded border font-semibold transition-all ${
              activeCurves.actual
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            T(N) Actual
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
            onClick={() => toggleCurve('O_NlogN')}
            className={`px-2 py-0.5 rounded border font-semibold transition-all ${
              activeCurves.O_NlogN
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            O(N log N)
          </button>
        </div>
      </div>

      <div className="flex-1 w-full p-3 bg-slate-950/40 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={benchmarkData} margin={{ top: 10, right: 25, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="n"
              stroke="#64748b"
              fontSize={10}
              tickFormatter={(val) => `N=${val}`}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickFormatter={(val) =>
                val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#f8fafc'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />

            {activeCurves.actual && (
              <Line
                type="monotone"
                dataKey="actual_steps"
                name={`Code Steps (${timeComplexityO})`}
                stroke="#38bdf8"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#38bdf8' }}
              />
            )}
            {activeCurves.O_N && (
              <Line
                type="monotone"
                dataKey="O_N"
                name="O(N)"
                stroke="#38bdf8"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                dot={false}
              />
            )}
            {activeCurves.O_N2 && (
              <Line
                type="monotone"
                dataKey="O_N2"
                name="O(N²)"
                stroke="#fb7185"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                dot={false}
              />
            )}
            {activeCurves.O_NlogN && (
              <Line
                type="monotone"
                dataKey="O_NlogN"
                name="O(N log N)"
                stroke="#fbbf24"
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
