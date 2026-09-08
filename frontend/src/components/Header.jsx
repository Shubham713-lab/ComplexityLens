import React from 'react';
import { Cpu, Play, FileDown, Sun, Moon } from 'lucide-react';

export default function Header({
  language,
  setLanguage,
  presetList,
  onSelectPreset,
  onAnalyze,
  isAnalyzing,
  onExportReport,
  theme,
  setTheme
}) {
  return (
    <header className="glass-panel sticky top-0 z-50 px-5 py-2.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
      {/* Brand Logo */}
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-500 shadow-md shadow-cyan-500/20 text-white">
          <Cpu className="w-5 h-5 animate-pulse" />
        </div>
        <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-600 via-sky-600 to-purple-600 dark:from-cyan-400 dark:via-sky-400 dark:to-purple-400 bg-clip-text text-transparent tracking-tight">
          ComplexityLens
        </h1>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Language Selector */}
        <div className="flex bg-slate-200/80 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-300 dark:border-slate-800">
          {['python', 'cpp', 'java'].map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                language === lang
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {lang === 'cpp' ? 'C++' : lang}
            </button>
          ))}
        </div>

        {/* Algorithm Presets Dropdown */}
        <div className="relative">
          <select
            onChange={(e) => {
              const selected = presetList.find(p => p.name === e.target.value);
              if (selected) onSelectPreset(selected.code);
            }}
            defaultValue=""
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-xl px-3 py-1.5 pr-7 focus:outline-none cursor-pointer shadow-sm"
          >
            <option value="" disabled>Presets...</option>
            {presetList.map((preset, idx) => (
              <option key={idx} value={preset.name}>
                {preset.name}
              </option>
            ))}
          </select>
        </div>

        {/* Dark/Light Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>

        {/* Export PDF Report Button */}
        <button
          onClick={onExportReport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/10 border border-purple-500/30 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 active:scale-95 transition-all cursor-pointer shadow-sm"
          title="Export Lab Audit Report"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span>Report</span>
        </button>

        {/* Analyze Code Button */}
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-md shadow-cyan-500/20 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
        >
          {isAnalyzing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Analyze</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
