import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Network, MousePointerClick, CornerDownRight } from 'lucide-react';
import MathView from './MathView';

// Custom Interactive Node Components
const StartNode = ({ data }) => (
  <div className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 border border-emerald-400 text-white font-mono text-xs shadow-lg shadow-emerald-500/20 text-center cursor-pointer hover:scale-105 transition-transform">
    <Handle type="source" position={Position.Bottom} className="!bg-emerald-300" />
    <div className="font-bold flex items-center justify-center gap-1">
      <span>{data.label}</span>
    </div>
    {data.snippet && <div className="text-[10px] opacity-80 mt-0.5">{data.snippet}</div>}
  </div>
);

const EndNode = ({ data }) => (
  <div className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 border border-rose-400 text-white font-mono text-xs shadow-lg shadow-rose-500/20 text-center cursor-pointer hover:scale-105 transition-transform">
    <Handle type="target" position={Position.Top} className="!bg-rose-300" />
    <div className="font-bold">{data.label}</div>
  </div>
);

const LoopNode = ({ data }) => (
  <div className="px-4 py-2.5 rounded-xl bg-slate-900 border-2 border-sky-400 text-slate-100 font-mono text-xs shadow-xl shadow-sky-500/10 min-w-[180px] cursor-pointer hover:border-sky-300 hover:scale-105 transition-all">
    <Handle type="target" position={Position.Top} className="!bg-sky-400" />
    <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1 mb-1">
      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
        L:{data.line || 1} • Loop
      </span>
      <span className="text-[10px] font-bold text-sky-400">
        <MathView math={data.cost || 'O(N)'} />
      </span>
    </div>
    <div className="text-xs font-semibold text-sky-200 truncate">{data.snippet || data.label}</div>
    <Handle type="source" position={Position.Bottom} className="!bg-sky-400" />
  </div>
);

const BranchNode = ({ data }) => (
  <div className="px-4 py-2.5 rounded-xl bg-slate-900 border-2 border-amber-400 text-slate-100 font-mono text-xs shadow-xl shadow-amber-500/10 min-w-[180px] cursor-pointer hover:border-amber-300 hover:scale-105 transition-all">
    <Handle type="target" position={Position.Top} className="!bg-amber-400" />
    <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1 mb-1">
      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
        L:{data.line || 1} • If Branch
      </span>
      <span className="text-[10px] font-bold text-amber-400">
        <MathView math={data.cost || 'O(1)'} />
      </span>
    </div>
    <div className="text-xs font-semibold text-amber-200 truncate">{data.snippet || data.label}</div>
    <Handle type="source" position={Position.Bottom} className="!bg-amber-400" />
  </div>
);

const RecursionNode = ({ data }) => (
  <div className="px-4 py-2.5 rounded-xl bg-slate-900 border-2 border-purple-400 text-slate-100 font-mono text-xs shadow-xl shadow-purple-500/10 min-w-[180px] cursor-pointer hover:border-purple-300 hover:scale-105 transition-all">
    <Handle type="target" position={Position.Top} className="!bg-purple-400" />
    <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1 mb-1">
      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
        L:{data.line || 1} • Recursion
      </span>
      <span className="text-[10px] font-bold text-purple-400">
        <MathView math={data.cost || 'O(2^N)'} />
      </span>
    </div>
    <div className="text-xs font-semibold text-purple-200 truncate">{data.snippet || data.label}</div>
    <Handle type="source" position={Position.Bottom} className="!bg-purple-400" />
  </div>
);

const StatementNode = ({ data }) => (
  <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-mono text-xs shadow-md min-w-[160px] cursor-pointer hover:border-cyan-500/50 hover:bg-slate-800/80 hover:scale-105 transition-all">
    <Handle type="target" position={Position.Top} className="!bg-slate-400" />
    <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 mb-0.5">
      <span>L:{data.line || 1}</span>
      <span className="text-emerald-400"><MathView math={data.cost || 'O(1)'} /></span>
    </div>
    <div className="truncate text-[11px] text-slate-200">{data.snippet || data.label}</div>
    <Handle type="source" position={Position.Bottom} className="!bg-slate-400" />
  </div>
);

export default function GraphVisualizer({ graphData, onNodeClick }) {
  const nodeTypes = useMemo(() => ({
    startNode: StartNode,
    endNode: EndNode,
    loopNode: LoopNode,
    branchNode: BranchNode,
    recursionNode: RecursionNode,
    statementNode: StatementNode,
    funcNode: StatementNode
  }), []);

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <div className="glass-panel h-full flex-1 rounded-xl border border-slate-800 flex items-center justify-center text-slate-500 text-xs">
        Control Flow Graph will render after code analysis.
      </div>
    );
  }

  const handleElementClick = (event, node) => {
    if (onNodeClick && node.data && node.data.line) {
      onNodeClick(node.data.line);
    }
  };

  return (
    <div className="glass-panel h-full flex-1 rounded-xl border border-slate-800 overflow-hidden shadow-xl flex flex-col min-h-0 bg-slate-950/60">
      <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Hierarchical Control Flow & Call Graph
          </h3>

          <div className="hidden sm:flex items-center gap-1.5 ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border bg-cyan-500/10 text-cyan-300 border-cyan-500/30">
            <MousePointerClick className="w-3 h-3 text-cyan-400" />
            <span>Click Node to Scroll Code</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1 text-sky-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span> Loop
          </span>
          <span className="flex items-center gap-1 text-amber-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Branch
          </span>
          <span className="flex items-center gap-1 text-purple-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span> Recursion
          </span>
        </div>
      </div>

      <div className="flex-1 w-full bg-slate-950/60 relative min-h-0">
        <ReactFlow
          nodes={graphData.nodes}
          edges={graphData.edges}
          nodeTypes={nodeTypes}
          onNodeClick={handleElementClick}
          fitView
          attributionPosition="bottom-right"
        >
          <Background color="#1e293b" gap={20} size={1} />
          <Controls className="!bg-slate-900 !border-slate-800 !text-slate-200 fill-slate-200" />
        </ReactFlow>
      </div>
    </div>
  );
}
