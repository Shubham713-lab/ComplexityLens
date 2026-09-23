import React from 'react';
import { Cpu, ArrowRight } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function HomeNavbar({ onLaunchAnalyzer, theme, setTheme }) {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const topOffset = el.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: Math.max(0, topOffset), behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 px-6 py-2.5 border-b border-stone-300 dark:border-zinc-800 bg-[#f8f6f0] dark:bg-[#18181b] transition-colors duration-150">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div
          className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity"
          onClick={scrollToTop}
          title="ComplexityLens Home"
        >
          <div className="w-7 h-7 rounded bg-orange-600 text-white flex items-center justify-center shadow-xs">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <h1 className="text-base font-bold tracking-tight text-stone-900 dark:text-stone-100 font-mono">
              ComplexityLens
            </h1>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono font-medium text-stone-600 dark:text-zinc-400">
          <button
            onClick={() => scrollToSection('playground')}
            className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors cursor-pointer"
          >
            Playground
          </button>
          <button
            onClick={() => scrollToSection('features')}
            className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors cursor-pointer"
          >
            Capabilities
          </button>
          <button
            onClick={() => scrollToSection('languages')}
            className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors cursor-pointer"
          >
            Languages
          </button>
          <button
            onClick={() => scrollToSection('workflow')}
            className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors cursor-pointer"
          >
            Workflow
          </button>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <ThemeToggle theme={theme} setTheme={setTheme} />

          {/* Launch Workspace CTA */}
          <button
            onClick={onLaunchAnalyzer}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-mono font-bold text-white bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-500 shadow-xs transition-all cursor-pointer"
          >
            <span>Launch Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
