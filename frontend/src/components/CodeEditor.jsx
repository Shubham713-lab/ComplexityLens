import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Code2 } from 'lucide-react';

export default function CodeEditor({ code, setCode, language, codeInputMetrics, highlightLine, theme }) {
  const editorRef = useRef(null);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    if (highlightLine) {
      editor.revealLineInCenter(highlightLine);
      editor.setPosition({ lineNumber: highlightLine, column: 1 });
    }
  };

  useEffect(() => {
    if (editorRef.current && highlightLine) {
      editorRef.current.revealLineInCenter(highlightLine);
      editorRef.current.setPosition({ lineNumber: highlightLine, column: 1 });
      editorRef.current.focus();
    }
  }, [highlightLine]);

  const getMonacoLang = (lang) => {
    if (lang === 'cpp') return 'cpp';
    if (lang === 'java') return 'java';
    return 'python';
  };

  const lineCount = code.split('\n').length;
  const charCount = code.length;
  const activeLoc = codeInputMetrics?.loc_active ?? code.split('\n').filter(l => l.trim() && !l.trim().startsWith('#') && !l.trim().startsWith('//')).length;
  const astNodes = codeInputMetrics?.ast_node_count ?? 'N/A';
  const loopsCount = codeInputMetrics?.loops_count ?? 'N/A';

  return (
    <div className="h-full flex-1 flex flex-col glass-panel rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl min-h-0 bg-white/80 dark:bg-slate-950/60">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            {language === 'cpp' ? 'C++ Editor' : `${language} Editor`}
          </span>
        </div>
      </div>

      {/* Monaco Container */}
      <div className="flex-1 relative min-h-0 w-full">
        <Editor
          height="100%"
          language={getMonacoLang(language)}
          theme={theme === 'light' ? 'vs' : 'vs-dark'}
          value={code}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            padding: { top: 10, bottom: 10 },
            renderLineHighlight: 'line',
            lineNumbersMinChars: 3,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on'
          }}
        />
      </div>

      {/* Code Input Count & Metrics Status Bar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-1.5 bg-slate-100/90 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 shrink-0 text-[11px] font-mono text-slate-600 dark:text-slate-400 gap-2">
        <div className="flex items-center gap-3">
          <span>Total Lines: <strong className="text-cyan-600 dark:text-cyan-400">{lineCount}</strong></span>
          <span>Chars: <strong className="text-slate-800 dark:text-slate-200">{charCount}</strong></span>
          <span>Active LOC: <strong className="text-emerald-600 dark:text-emerald-400">{activeLoc}</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <span>AST Nodes: <strong className="text-purple-600 dark:text-purple-400">{astNodes}</strong></span>
          <span>Loops: <strong className="text-amber-600 dark:text-amber-400">{loopsCount}</strong></span>
        </div>
      </div>
    </div>
  );
}
