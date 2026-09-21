import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ theme, setTheme, className = '' }) {
  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`relative inline-flex items-center h-7 w-14 rounded-full p-1 bg-slate-200 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-600 transition-all duration-300 cursor-pointer shadow-inner focus:outline-none shrink-0 group ${className}`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      aria-label="Toggle Theme"
    >
      {/* Fixed background Sun & Moon icons */}
      <div className="w-full flex items-center justify-between px-0.5 pointer-events-none">
        <Sun className={`w-3.5 h-3.5 text-amber-500 transition-all duration-300 ${isDark ? 'opacity-30 scale-75' : 'opacity-100 scale-100'}`} />
        <Moon className={`w-3.5 h-3.5 text-indigo-400 transition-all duration-300 ${isDark ? 'opacity-100 scale-100' : 'opacity-30 scale-75'}`} />
      </div>

      {/* Sliding Knob with Icon */}
      <span
        className={`absolute top-1 left-1 w-5 h-5 rounded-full shadow-md transform transition-all duration-300 ease-in-out flex items-center justify-center border border-slate-200 dark:border-slate-700 group-hover:scale-110 ${
          isDark
            ? 'translate-x-7 bg-slate-950 text-cyan-400'
            : 'translate-x-0 bg-white text-amber-500'
        }`}
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-cyan-400 transition-transform duration-300 -rotate-12" />
        ) : (
          <Sun className="w-3 h-3 text-amber-500 transition-transform duration-300 rotate-0" />
        )}
      </span>
    </button>
  );
}
