import React, { useState } from 'react';
import { Cpu, Play, FileDown, Key, Sparkles, X, Check } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Header({
  currentView,
  setCurrentView,
  language,
  setLanguage,
  presetList,
  onSelectPreset,
  onAnalyze,
  isAnalyzing,
  onExportReport,
  theme,
  setTheme,
  apiKey,
  setApiKey
}) {
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveKey = () => {
    setApiKey(tempKey);
    localStorage.setItem('complexity_lens_gemini_key', tempKey);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsKeyModalOpen(false);
    }, 1200);
  };

  return (
    <>
      <header className="glass-panel sticky top-0 z-50 px-5 py-2.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Brand Logo & Back to Home */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setCurrentView && setCurrentView('home')}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
            title="Return to Home Page"
          >
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-500 shadow-md shadow-cyan-500/20 text-white">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <h1 className="text-lg font-extrabold bg-gradient-to-r from-cyan-600 via-sky-600 to-purple-600 dark:from-cyan-400 dark:via-sky-400 dark:to-purple-400 bg-clip-text text-transparent tracking-tight">
              ComplexityLens
            </h1>
          </div>
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



          {/* Dark/Light Pill Theme Toggle */}
          <ThemeToggle theme={theme} setTheme={setTheme} />

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

      {/* AI Key Settings Modal */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                  AI Engine Config
                </h3>
              </div>
              <button
                onClick={() => setIsKeyModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Configure your API Key for deep algorithm evaluation and verification.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                API Key
              </label>
              <input
                type="password"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsKeyModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveKey}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md cursor-pointer"
              >
                {savedSuccess ? <Check className="w-3.5 h-3.5 text-white" /> : <Key className="w-3.5 h-3.5" />}
                <span>{savedSuccess ? 'Saved!' : 'Save Key'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
