import React, { useState } from 'react';
import { Cpu, Play, Sparkles, Key, FileCode, Check } from 'lucide-react';

export default function Header({
  language,
  setLanguage,
  presetList,
  onSelectPreset,
  onAnalyze,
  isAnalyzing,
  apiKey,
  setApiKey
}) {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);

  const handleSaveKey = () => {
    setApiKey(tempKey);
    setShowKeyModal(false);
  };

  return (
    <header className="glass-panel sticky top-0 z-50 px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-500 shadow-lg shadow-cyan-500/20 text-white">
          <Cpu className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 bg-clip-text text-transparent">
            ComplexityLens
          </h1>
          <p className="text-xs text-slate-400">Real-Time Big O, Operations & Control Flow Inspector</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Language Selector */}
        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          {['python', 'cpp', 'java'].map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                language === lang
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
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
            className="bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-cyan-500/50 hover:bg-slate-800/80 cursor-pointer"
          >
            <option value="" disabled>Load Preset Algorithm...</option>
            {presetList.map((preset, idx) => (
              <option key={idx} value={preset.name}>
                {preset.name}
              </option>
            ))}
          </select>
        </div>

        {/* Gemini API Key Modal Button */}
        <button
          onClick={() => setShowKeyModal(true)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
            apiKey
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="Configure Gemini API Key for dynamic AI explanations"
        >
          <Key className="w-3.5 h-3.5" />
          <span>{apiKey ? 'Gemini Key Configured' : 'Add Gemini Key'}</span>
        </button>

        {/* Analyze Code Button */}
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-lg shadow-cyan-500/25 active:scale-95 disabled:opacity-50 transition-all duration-200 cursor-pointer"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Analyze Code</span>
            </>
          )}
        </button>
      </div>

      {/* Gemini API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-cyan-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-semibold text-lg text-slate-100">Gemini AI Configuration</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter your Gemini API key to enable dynamic AI explanation summaries and customized code refactoring.
              If omitted, the built-in rule engine will be used.
            </p>
            <input
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveKey}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-600/30 flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
