import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ theme, setTheme, className = '' }) {
  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`relative inline-flex items-center h-7 w-13 rounded p-0.5 bg-stone-200 dark:bg-zinc-900 border border-stone-300 dark:border-zinc-800 hover:border-orange-600/50 dark:hover:border-orange-500/50 transition-all duration-200 cursor-pointer focus:outline-none shrink-0 ${className}`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      aria-label="Toggle Theme"
    >
      <div className="w-full flex items-center justify-between px-1 pointer-events-none">
        <Sun className={`w-3 h-3 text-orange-600 transition-opacity duration-200 ${isDark ? 'opacity-30' : 'opacity-100'}`} />
        <Moon className={`w-3 h-3 text-emerald-500 transition-opacity duration-200 ${isDark ? 'opacity-100' : 'opacity-30'}`} />
      </div>

      <span
        className={`absolute top-0.5 left-0.5 w-6 h-6 rounded transform transition-transform duration-200 ease-in-out flex items-center justify-center border ${
          isDark
            ? 'translate-x-6 bg-zinc-800 border-zinc-700 text-emerald-400'
            : 'translate-x-0 bg-white border-stone-300 text-orange-600 shadow-xs'
        }`}
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-emerald-400" />
        ) : (
          <Sun className="w-3 h-3 text-orange-600" />
        )}
      </span>
    </button>
  );
}
