import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Code2, Flame, Layers } from 'lucide-react';

export default function CodeEditor({ code, setCode, language, lineCosts, highlightLine }) {
  const editorRef = useRef(null);
  const decorationsRef = useRef([]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    updateDecorations();
    if (highlightLine) {
      editor.revealLineInCenter(highlightLine);
      editor.setPosition({ lineNumber: highlightLine, column: 1 });
    }
  };

  const updateDecorations = () => {
    if (!editorRef.current || !lineCosts) return;

    const newDecorations = [];
    Object.values(lineCosts).forEach((item) => {
      const lineNum = item.line;
      const cost = item.cost || 'O(1)';

      let className = 'line-heatmap-low';
      if (cost === 'O(N²)' || cost === 'O(N³)' || cost.includes('2^N')) {
        className = 'line-heatmap-high';
      } else if (cost === 'O(N)') {
        className = 'line-heatmap-mid';
      } else if (cost.includes('log')) {
        className = 'line-heatmap-log';
      }

      newDecorations.push({
        range: {
          startLineNumber: lineNum,
          startColumn: 1,
          endLineNumber: lineNum,
          endColumn: 1,
        },
        options: {
          isWholeLine: true,
          className: className,
        },
      });
    });

    decorationsRef.current = editorRef.current.deltaDecorations(
      decorationsRef.current,
      newDecorations
    );
  };

  useEffect(() => {
    updateDecorations();
  }, [lineCosts]);

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

  return (
    <div className="h-full flex-1 flex flex-col glass-panel rounded-xl border border-slate-800 overflow-hidden shadow-xl min-h-0 bg-slate-950/60">
      {/* Editor Header Bar with Heatmap Legend */}
      <div className="flex flex-wrap items-center justify-between px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800 shrink-0 gap-2">
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            {language === 'cpp' ? 'C++ Editor' : `${language} Editor`}
          </span>
        </div>

        {/* Heatmap Legend Pills */}
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Flame className="w-3 h-3 text-rose-400" /> Heatmap:
          </span>
          <div className="flex items-center gap-1.5 font-semibold">
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
              O(N²) High
            </span>
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
              O(N) Mid
            </span>
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              O(1) Constant
            </span>
          </div>
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
          onMount={handleEditorMount}
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
