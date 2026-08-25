import React from 'react';
import Editor from '@monaco-editor/react';
import { Code2, Zap } from 'lucide-react';

export default function CodeEditor({ code, setCode, language, lineCosts }) {
  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const getMonacoLang = (lang) => {
    if (lang === 'cpp') return 'cpp';
    if (lang === 'java') return 'java';
    return 'python';
  };

  return (
    <div className="h-full flex-1 flex flex-col glass-panel rounded-xl border border-slate-800 overflow-hidden shadow-xl min-h-0">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            {language === 'cpp' ? 'C++ Editor' : `${language} Editor`}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <Zap className="w-3 h-3 text-amber-400" />
          <span>Real-time AST parsing</span>
        </div>
      </div>

      {/* Monaco Container - Fills remaining height */}
      <div className="flex-1 relative min-h-0 w-full">
        <Editor
          height="100%"
          language={getMonacoLang(language)}
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            padding: { top: 10, bottom: 10 },
            renderLineHighlight: 'all',
            lineNumbersMinChars: 3,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on'
          }}
        />
      </div>
    </div>
  );
}
