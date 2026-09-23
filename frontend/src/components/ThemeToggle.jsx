import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ theme, setTheme, className = '' }) {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`relative inline-flex items-center h-7 w-14 rounded-full p-1 bg-stone-200 dark:bg-zinc-900 border border-stone-300 dark:border-zinc-700/80 hover:border-orange-600/50 dark:hover:border-orange-500/50 transition-colors duration-300 cursor-pointer focus:outline-none shrink-0 shadow-inner ${className}`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      aria-label="Toggle Theme"
    >
      {/* Track Icons */}
      <div className="w-full flex items-center justify-between px-0.5 pointer-events-none select-none">
        <Sun className={`w-3.5 h-3.5 text-orange-600 transition-opacity duration-300 ${isDark ? 'opacity-30' : 'opacity-100'}`} />
        <Moon className={`w-3.5 h-3.5 text-emerald-400 transition-opacity duration-300 ${isDark ? 'opacity-100' : 'opacity-30'}`} />
      </div>

      {/* Sliding Knob */}
      <span
        className={`absolute top-1 left-1 w-5 h-5 rounded-full shadow-sm transform transition-transform duration-300 ease-in-out flex items-center justify-center border ${
          isDark
            ? 'translate-x-7 bg-zinc-800 border-zinc-600 text-emerald-400'
            : 'translate-x-0 bg-white border-stone-300 text-orange-600'
        }`}
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-emerald-400 transition-transform duration-300 -rotate-12" />
        ) : (
          <Sun className="w-3 h-3 text-orange-600 transition-transform duration-300 rotate-0" />
        )}
      </span>
    </button>
  );
}
