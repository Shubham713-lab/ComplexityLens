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
  <div className="px-3.5 py-1.5 rounded bg-emerald-700 border border-emerald-800 text-white font-mono text-xs shadow-xs text-center cursor-pointer hover:bg-emerald-800 transition-colors">
    <Handle type="source" position={Position.Bottom} className="!bg-emerald-300" />
    <div className="font-bold">{data.label}</div>
  </div>
);

const EndNode = ({ data }) => (
  <div className="px-3.5 py-1.5 rounded bg-orange-700 border border-orange-800 text-white font-mono text-xs shadow-xs text-center cursor-pointer hover:bg-orange-800 transition-colors">
    <Handle type="target" position={Position.Top} className="!bg-orange-300" />
    <div className="font-bold">{data.label}</div>
  </div>
);

const LoopNode = ({ data }) => (
  <div className="px-3 py-1.5 rounded bg-[#f8f6f0] dark:bg-[#18181b] border-2 border-orange-600 text-stone-900 dark:text-stone-100 font-mono text-xs shadow-xs min-w-[160px] cursor-pointer hover:border-orange-700 transition-all">
    <Handle type="target" position={Position.Top} className="!bg-orange-600" />
    <div className="flex items-center justify-between gap-2 border-b border-stone-300 dark:border-zinc-800 pb-1 mb-1">
      <span className="text-[10px] font-bold text-orange-700 dark:text-orange-400">L:{data.line || 1} • Loop</span>
      <span className="text-[10px] font-bold text-orange-700 dark:text-orange-400"><MathView math={data.cost || 'O(N)'} /></span>
    </div>
    <div className="text-xs text-stone-800 dark:text-stone-200 truncate font-mono">{data.snippet || data.label}</div>
    <Handle type="source" position={Position.Bottom} className="!bg-orange-600" />
  </div>
);

const BranchNode = ({ data }) => (
  <div className="px-3 py-1.5 rounded bg-[#f8f6f0] dark:bg-[#18181b] border-2 border-amber-600 text-stone-900 dark:text-stone-100 font-mono text-xs shadow-xs min-w-[160px] cursor-pointer hover:border-amber-700 transition-all">
    <Handle type="target" position={Position.Top} className="!bg-amber-600" />
    <div className="flex items-center justify-between gap-2 border-b border-stone-300 dark:border-zinc-800 pb-1 mb-1">
      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">L:{data.line || 1} • Branch</span>
      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400"><MathView math={data.cost || 'O(1)'} /></span>
    </div>
    <div className="text-xs text-stone-800 dark:text-stone-200 truncate font-mono">{data.snippet || data.label}</div>
    <Handle type="source" position={Position.Bottom} className="!bg-amber-600" />
  </div>
);

const RecursionNode = ({ data }) => (
  <div className="px-3 py-1.5 rounded bg-[#f8f6f0] dark:bg-[#18181b] border-2 border-orange-700 text-stone-900 dark:text-stone-100 font-mono text-xs shadow-xs min-w-[160px] cursor-pointer hover:border-orange-800 transition-all">
    <Handle type="target" position={Position.Top} className="!bg-orange-700" />
    <div className="flex items-center justify-between gap-2 border-b border-stone-300 dark:border-zinc-800 pb-1 mb-1">
      <span className="text-[10px] font-bold text-orange-700 dark:text-orange-400">L:{data.line || 1} • Recursion</span>
      <span className="text-[10px] font-bold text-orange-700 dark:text-orange-400"><MathView math={data.cost || 'O(2^N)'} /></span>
    </div>
    <div className="text-xs text-stone-800 dark:text-stone-200 truncate font-mono">{data.snippet || data.label}</div>
    <Handle type="source" position={Position.Bottom} className="!bg-orange-700" />
  </div>
);

const StatementNode = ({ data }) => (
  <div className="px-3 py-1.5 rounded bg-[#f8f6f0] dark:bg-[#18181b] border border-stone-300 dark:border-zinc-700 text-stone-900 dark:text-stone-100 font-mono text-xs shadow-xs min-w-[140px] cursor-pointer hover:border-stone-400 dark:hover:border-zinc-500 transition-all">
    <Handle type="target" position={Position.Top} className="!bg-stone-500" />
    <div className="flex items-center justify-between gap-2 text-[10px] text-stone-500 dark:text-zinc-400 mb-0.5">
      <span>L:{data.line || 1}</span>
      <span className="text-emerald-700 dark:text-emerald-400 font-bold"><MathView math={data.cost || 'O(1)'} /></span>
    </div>
    <div className="truncate text-[11px] text-stone-800 dark:text-stone-200 font-mono">{data.snippet || data.label}</div>
    <Handle type="source" position={Position.Bottom} className="!bg-stone-500" />
  </div>
);

export default function GraphVisualizer({ graphData, onNodeClick, theme }) {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const isLight = theme === 'light';
  const patternColor = isLight ? '#e7e2d7' : '#27272a';

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
      <div className="swiss-panel h-full flex-1 rounded border border-stone-300 dark:border-zinc-800 flex items-center justify-center text-stone-500 dark:text-zinc-400 text-xs font-mono bg-[#f8f6f0] dark:bg-[#18181b]">
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
      <div className="swiss-panel h-full flex-1 rounded border border-stone-300 dark:border-zinc-800 overflow-hidden shadow-xs flex flex-col min-h-0 bg-[#f8f6f0] dark:bg-[#18181b]">
        <div className="px-3.5 py-1.5 bg-stone-200/80 dark:bg-zinc-900 border-b border-stone-300 dark:border-zinc-800 flex items-center justify-between shrink-0 font-mono">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
              AST Control Flow Graph
            </h3>
          </div>

          <button
            onClick={() => setIsFullScreen(true)}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono bg-stone-100 dark:bg-zinc-950 border border-stone-300 dark:border-zinc-800 text-stone-800 dark:text-zinc-200 hover:text-stone-900 dark:hover:text-white transition-all cursor-pointer"
            title="Expand Fullscreen View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
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

      {isFullScreen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 dark:bg-black/85 flex flex-col p-4">
          <div className="swiss-panel h-full w-full rounded border border-stone-300 dark:border-zinc-800 shadow-lg flex flex-col overflow-hidden bg-[#f8f6f0] dark:bg-[#18181b]">
            <div className="px-4 py-2 bg-stone-200/80 dark:bg-zinc-900 border-b border-stone-300 dark:border-zinc-800 flex items-center justify-between shrink-0 font-mono">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                  AST Control Flow Graph (Fullscreen)
                </h3>
              </div>

              <button
                onClick={() => setIsFullScreen(false)}
                className="p-1 rounded text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white"
                title="Close Fullscreen (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 w-full relative min-h-0 h-full bg-[#f8f6f0] dark:bg-[#18181b]">
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
