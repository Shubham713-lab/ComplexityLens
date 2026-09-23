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
      <header className="swiss-panel sticky top-0 z-50 px-4 py-2 border-b border-stone-300 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-[#f8f6f0] dark:bg-[#18181b]">
        {/* Brand Logo & Back to Home */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setCurrentView && setCurrentView('home')}
            className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity"
            title="Return to Home Page"
          >
            <div className="w-7 h-7 rounded bg-orange-600 dark:bg-orange-600 text-white flex items-center justify-center shadow-sm">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <h1 className="text-base font-bold tracking-tight text-stone-900 dark:text-stone-100 font-mono">
                ComplexityLens
              </h1>
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Language Selector */}
          <div className="flex bg-stone-200/80 dark:bg-zinc-900 p-0.5 rounded border border-stone-300 dark:border-zinc-800">
            {['python', 'cpp', 'java'].map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                  language === lang
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-stone-100'
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
            className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-medium bg-stone-200/70 dark:bg-zinc-800/80 border border-stone-300 dark:border-zinc-700 text-stone-800 dark:text-zinc-200 hover:bg-stone-300/80 dark:hover:bg-zinc-700 active:scale-98 transition-all cursor-pointer"
            title="Export Lab Audit Report"
          >
            <FileDown className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            <span>Report</span>
          </button>

          {/* Analyze Code Button */}
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-4 py-1 rounded text-xs font-mono font-bold text-white bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-500 active:scale-98 disabled:opacity-50 transition-all cursor-pointer shadow-xs"
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
        <div className="fixed inset-0 z-50 bg-stone-950/60 dark:bg-black/80 flex items-center justify-center p-4">
          <div className="swiss-panel w-full max-w-md bg-[#f8f6f0] dark:bg-[#18181b] border border-stone-300 dark:border-zinc-800 rounded-md shadow-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-300 dark:border-zinc-800 pb-2.5">
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <Sparkles className="w-4 h-4" />
                <h3 className="text-xs font-mono font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                  AI Engine Settings
                </h3>
              </div>
              <button
                onClick={() => setIsKeyModalOpen(false)}
                className="p-1 rounded text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 dark:text-zinc-400 leading-relaxed font-sans">
              Configure your API Key for deep algorithm evaluation and verification.
            </p>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-stone-600 dark:text-zinc-400 uppercase tracking-wider">
                API Key
              </label>
              <input
                type="password"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-1.5 rounded bg-stone-100 dark:bg-zinc-900 border border-stone-300 dark:border-zinc-800 text-xs font-mono text-stone-900 dark:text-stone-100 focus:outline-none focus:border-orange-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsKeyModalOpen(false)}
                className="px-3 py-1 rounded text-xs font-mono text-stone-600 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveKey}
                className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-xs cursor-pointer"
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
