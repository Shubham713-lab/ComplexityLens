import React, { useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Network, Maximize2, Minimize2, X } from 'lucide-react';
import MathView from './MathView';

// Custom Node Components
const StartNode = ({ data }) => (
  <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 border border-emerald-400 text-white font-mono text-xs shadow-lg text-center cursor-pointer hover:scale-105 transition-transform">
    <Handle type="source" position={Position.Bottom} className="!bg-emerald-300" />
    <div className="font-bold">{data.label}</div>
  </div>
);

const EndNode = ({ data }) => (
  <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 border border-rose-400 text-white font-mono text-xs shadow-lg text-center cursor-pointer hover:scale-105 transition-transform">
    <Handle type="target" position={Position.Top} className="!bg-rose-300" />
    <div className="font-bold">{data.label}</div>
  </div>
);

const LoopNode = ({ data }) => (
  <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border-2 border-sky-500 dark:border-sky-400 text-slate-800 dark:text-slate-100 font-mono text-xs shadow-lg min-w-[170px] cursor-pointer hover:scale-105 transition-all">
    <Handle type="target" position={Position.Top} className="!bg-sky-500 dark:!bg-sky-400" />
    <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-1 mb-1">
      <span className="text-[10px] font-bold text-sky-700 dark:text-sky-400">L:{data.line || 1} • Loop</span>
      <span className="text-[10px] font-bold text-sky-700 dark:text-sky-400"><MathView math={data.cost || 'O(N)'} /></span>
    </div>
    <div className="text-xs text-slate-700 dark:text-sky-200 truncate font-mono">{data.snippet || data.label}</div>
    <Handle type="source" position={Position.Bottom} className="!bg-sky-500 dark:!bg-sky-400" />
  </div>
);

const BranchNode = ({ data }) => (
  <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border-2 border-amber-500 dark:border-amber-400 text-slate-800 dark:text-slate-100 font-mono text-xs shadow-lg min-w-[170px] cursor-pointer hover:scale-105 transition-all">
    <Handle type="target" position={Position.Top} className="!bg-amber-500 dark:!bg-amber-400" />
    <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-1 mb-1">
      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">L:{data.line || 1} • Branch</span>
      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400"><MathView math={data.cost || 'O(1)'} /></span>
    </div>
    <div className="text-xs text-slate-700 dark:text-amber-200 truncate font-mono">{data.snippet || data.label}</div>
    <Handle type="source" position={Position.Bottom} className="!bg-amber-500 dark:!bg-amber-400" />
  </div>
);

const RecursionNode = ({ data }) => (
  <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border-2 border-purple-500 dark:border-purple-400 text-slate-800 dark:text-slate-100 font-mono text-xs shadow-lg min-w-[170px] cursor-pointer hover:scale-105 transition-all">
    <Handle type="target" position={Position.Top} className="!bg-purple-500 dark:!bg-purple-400" />
    <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-1 mb-1">
      <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400">L:{data.line || 1} • Recursion</span>
      <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400"><MathView math={data.cost || 'O(2^N)'} /></span>
    </div>
    <div className="text-xs text-slate-700 dark:text-purple-200 truncate font-mono">{data.snippet || data.label}</div>
    <Handle type="source" position={Position.Bottom} className="!bg-purple-500 dark:!bg-purple-400" />
  </div>
);

const StatementNode = ({ data }) => (
  <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-300 font-mono text-xs shadow-md min-w-[150px] cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 hover:scale-105 transition-all">
    <Handle type="target" position={Position.Top} className="!bg-slate-400" />
    <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">
      <span>L:{data.line || 1}</span>
      <span className="text-emerald-700 dark:text-emerald-400 font-bold"><MathView math={data.cost || 'O(1)'} /></span>
    </div>
    <div className="truncate text-[11px] text-slate-700 dark:text-slate-200 font-mono">{data.snippet || data.label}</div>
    <Handle type="source" position={Position.Bottom} className="!bg-slate-400" />
  </div>
);

export default function GraphVisualizer({ graphData, onNodeClick, theme }) {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const isLight = theme === 'light';
  const patternColor = isLight ? '#cbd5e1' : '#1e293b';

  const nodeTypes = useMemo(() => ({
    startNode: StartNode,
    endNode: EndNode,
    loopNode: LoopNode,
    branchNode: BranchNode,
    recursionNode: RecursionNode,
    statementNode: StatementNode,
    funcNode: StatementNode
  }), []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen]);

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <div className="glass-panel h-full flex-1 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs">
        Control Flow Graph will render after code analysis.
      </div>
    );
  }

  const handleElementClick = (event, node) => {
    if (onNodeClick && node.data && node.data.line) {
      onNodeClick(node.data.line);
    }
  };

  const proOptions = { hideAttribution: true };

  return (
    <>
      {/* Embedded Panel */}
      <div className="glass-panel h-full flex-1 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl flex flex-col min-h-0 bg-white/80 dark:bg-slate-950/60">
        <div className="px-4 py-2 bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              AST Control Flow Graph
            </h3>
          </div>

          <button
            onClick={() => setIsFullScreen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-sm"
            title="Expand Fullscreen View"
          >
            <Maximize2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Fullscreen</span>
          </button>
        </div>

        <div className="flex-1 w-full relative min-h-0 h-full">
          <ReactFlow
            nodes={graphData.nodes}
            edges={graphData.edges}
            nodeTypes={nodeTypes}
            onNodeClick={handleElementClick}
            fitView
            proOptions={proOptions}
          >
            <Background color={patternColor} gap={20} size={1} />
            <Controls />
          </ReactFlow>
        </div>
      </div>

      {/* Fullscreen Overlay */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 dark:bg-[#0b0f19]/95 backdrop-blur-xl flex flex-col p-4">
          <div className="glass-panel h-full w-full rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col overflow-hidden bg-white dark:bg-slate-950">
            <div className="px-4 py-3 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Network className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                  AST Control Flow Graph (Fullscreen)
                </h3>
              </div>

              <button
                onClick={() => setIsFullScreen(false)}
                className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Close Fullscreen (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 w-full relative min-h-0 h-full bg-slate-50 dark:bg-slate-950">
              <ReactFlow
                nodes={graphData.nodes}
                edges={graphData.edges}
                nodeTypes={nodeTypes}
                onNodeClick={handleElementClick}
                fitView
                proOptions={proOptions}
              >
                <Background color={patternColor} gap={24} size={1.2} />
                <Controls />
              </ReactFlow>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
