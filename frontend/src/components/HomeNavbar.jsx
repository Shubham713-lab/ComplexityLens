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
    <header className="sticky top-0 z-50 px-6 py-3 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-[#0b0f19]/85 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Name - Identical to Workspace Header */}
        <div
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={scrollToTop}
          title="ComplexityLens Home"
        >
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-500 shadow-md shadow-cyan-500/20 text-white">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <h1 className="text-lg font-extrabold bg-gradient-to-r from-cyan-600 via-sky-600 to-purple-600 dark:from-cyan-400 dark:via-sky-400 dark:to-purple-400 bg-clip-text text-transparent tracking-tight">
            ComplexityLens
          </h1>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-600 dark:text-slate-400">
          <button
            onClick={() => scrollToSection('playground')}
            className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
          >
            Playground
          </button>
          <button
            onClick={() => scrollToSection('features')}
            className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
          >
            Capabilities
          </button>
          <button
            onClick={() => scrollToSection('languages')}
            className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
          >
            Languages
          </button>
          <button
            onClick={() => scrollToSection('workflow')}
            className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
          >
            Workflow
          </button>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Custom Unique Pill Theme Switcher */}
          <ThemeToggle theme={theme} setTheme={setTheme} />

          {/* Launch Workspace CTA */}
          <button
            onClick={onLaunchAnalyzer}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <span>Launch Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
