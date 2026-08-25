import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Network } from 'lucide-react';

// Custom Node Components
const StartNode = ({ data }) => (
  <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 border border-emerald-400 text-white font-mono text-xs shadow-lg shadow-emerald-500/20 text-center">
    <Handle type="source" position={Position.Bottom} className="!bg-emerald-300" />
    <span className="font-bold">{data.label}</span>
  </div>
);

const EndNode = ({ data }) => (
  <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 border border-rose-400 text-white font-mono text-xs shadow-lg shadow-rose-500/20 text-center">
    <Handle type="target" position={Position.Top} className="!bg-rose-300" />
    <span className="font-bold">{data.label}</span>
  </div>
);

const LoopNode = ({ data }) => (
  <div className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 border border-sky-300 text-white font-mono text-xs shadow-lg shadow-sky-500/20 text-center font-semibold">
    <Handle type="target" position={Position.Top} className="!bg-sky-200" />
    <span>{data.label}</span>
    <Handle type="source" position={Position.Bottom} className="!bg-sky-200" />
  </div>
);

const BranchNode = ({ data }) => (
  <div className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 border border-amber-300 text-white font-mono text-xs shadow-lg shadow-amber-500/20 text-center font-semibold">
    <Handle type="target" position={Position.Top} className="!bg-amber-200" />
    <span>{data.label}</span>
    <Handle type="source" position={Position.Bottom} className="!bg-amber-200" />
  </div>
);

const RecursionNode = ({ data }) => (
  <div className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-300 text-white font-mono text-xs shadow-lg shadow-purple-500/20 text-center font-bold">
    <Handle type="target" position={Position.Top} className="!bg-purple-200" />
    <span>{data.label}</span>
    <Handle type="source" position={Position.Bottom} className="!bg-purple-200" />
  </div>
);

const StatementNode = ({ data }) => (
  <div className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs shadow-md text-center">
    <Handle type="target" position={Position.Top} className="!bg-slate-400" />
    <span>{data.label}</span>
    <Handle type="source" position={Position.Bottom} className="!bg-slate-400" />
  </div>
);

export default function GraphVisualizer({ graphData }) {
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

  return (
    <div className="glass-panel h-full flex-1 rounded-xl border border-slate-800 overflow-hidden shadow-xl flex flex-col min-h-0">
      <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Network className="w-3.5 h-3.5 text-cyan-400" />
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            AST Control Flow & Call Graph
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1 text-sky-400"><span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span> Loop</span>
          <span className="flex items-center gap-1 text-amber-400"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Branch</span>
          <span className="flex items-center gap-1 text-purple-400"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span> Recursion</span>
        </div>
      </div>

      <div className="flex-1 w-full bg-slate-950/60 relative min-h-0">
        <ReactFlow
          nodes={graphData.nodes}
          edges={graphData.edges}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
        >
          <Background color="#334155" gap={18} size={1} />
          <Controls className="!bg-slate-900 !border-slate-800 !text-slate-200 fill-slate-200" />
        </ReactFlow>
      </div>
    </div>
  );
}
