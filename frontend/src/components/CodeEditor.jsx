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
    <div className="h-full flex-1 flex flex-col swiss-panel rounded border border-stone-300 dark:border-zinc-800 overflow-hidden shadow-xs min-h-0 bg-[#f8f6f0] dark:bg-[#18181b]">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-stone-200/80 dark:bg-zinc-900 border-b border-stone-300 dark:border-zinc-800 shrink-0">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          <span className="text-xs font-mono font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
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
      <div className="flex flex-wrap items-center justify-between px-3 py-1.5 bg-stone-200/80 dark:bg-zinc-900 border-t border-stone-300 dark:border-zinc-800 shrink-0 text-[11px] font-mono text-stone-600 dark:text-zinc-400 gap-2">
        <div className="flex items-center gap-3">
          <span>Lines: <strong className="text-orange-700 dark:text-orange-400">{lineCount}</strong></span>
          <span>Chars: <strong className="text-stone-900 dark:text-stone-100">{charCount}</strong></span>
          <span>Active LOC: <strong className="text-emerald-700 dark:text-emerald-400">{activeLoc}</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <span>AST Nodes: <strong className="text-stone-800 dark:text-zinc-200">{astNodes}</strong></span>
          <span>Loops: <strong className="text-orange-800 dark:text-orange-300">{loopsCount}</strong></span>
        </div>
      </div>
    </div>
  );
}
