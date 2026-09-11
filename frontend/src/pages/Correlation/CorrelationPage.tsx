import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CorrelationGraph } from '../../components/CorrelationGraph';
import { ThreatDetailPanel } from '../../components/ThreatDetailPanel';
import { GRAPH_NODES, GRAPH_EDGES, ACTIVE_THREATS, type GraphNode } from '../../data/mockData';
import { Filter, Maximize2 } from 'lucide-react';

const FILTER_TYPES = ['All', 'IP', 'User', 'API', 'Server', 'Database'];

const CorrelationPage: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredNodes = activeFilter === 'All'
    ? GRAPH_NODES
    : GRAPH_NODES.filter((n) => n.type === activeFilter.toLowerCase());

  const handleNodeClick = useCallback((node: GraphNode | null) => {
    setSelectedNode(node?.threat ? node : null);
  }, []);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar filters */}
      <div
        className="flex flex-col flex-shrink-0 p-5 overflow-y-auto"
        style={{
          width: 220,
          borderRight: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(8,9,11,0.6)',
        }}
      >
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={13} style={{ color: 'rgba(255,255,255,0.35)' }} />
            <span className="text-[11px] uppercase tracking-widest font-mono" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Filter
            </span>
          </div>
          <div className="space-y-1">
            {FILTER_TYPES.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className="w-full text-left px-3 py-1.5 rounded-lg text-xs transition-all"
                style={{
                  background: activeFilter === f ? 'rgba(79,142,247,0.12)' : 'transparent',
                  color: activeFilter === f ? '#4f8ef7' : 'rgba(255,255,255,0.4)',
                  borderLeft: activeFilter === f ? '2px solid #4f8ef7' : '2px solid transparent',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Threat list */}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Active Threats
          </div>
          <div className="space-y-2">
            {ACTIVE_THREATS.map((t) => (
              <motion.div
                key={t.id}
                whileHover={{ x: 2 }}
                onClick={() => {
                  const node = GRAPH_NODES.find((n) => n.id === t.nodeId);
                  setSelectedNode(node ?? null);
                }}
                className="px-3 py-2.5 rounded-xl cursor-pointer transition-all"
                style={{
                  background: 'rgba(255,77,77,0.06)',
                  border: '1px solid rgba(255,77,77,0.14)',
                }}
              >
                <div className="text-[11px] font-medium text-white mb-0.5 truncate">{t.title}</div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {t.endpoint}
                  </span>
                  <span className="font-mono text-[10px]" style={{ color: '#ff4d4d' }}>{t.confidence}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Graph area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Header */}
        <div
          className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-3"
          style={{ background: 'linear-gradient(to bottom, rgba(8,9,11,0.95) 0%, transparent 100%)' }}
        >
          <div>
            <h1 className="text-lg font-bold text-white">Correlation Graph</h1>
            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {filteredNodes.length} nodes · {GRAPH_EDGES.length} edges · {ACTIVE_THREATS.length} threats
            </p>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
            <Maximize2 size={11} /> Fullscreen
          </button>
        </div>

        <CorrelationGraph
          nodes={filteredNodes}
          edges={GRAPH_EDGES}
          onNodeClick={handleNodeClick}
          selectedNodeId={selectedNode?.id}
        />
      </div>

      {/* Right detail panel */}
      <div
        className="flex-shrink-0 flex flex-col p-4 overflow-y-auto"
        style={{
          width: 300,
          borderLeft: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(8,9,11,0.6)',
        }}
      >
        <ThreatDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
        {!selectedNode && (
          <div
            className="flex flex-col items-center justify-center h-full text-center p-8"
            style={{ color: 'rgba(255,255,255,0.2)' }}
          >
            <div className="text-4xl mb-4">◎</div>
            <p className="text-sm font-medium mb-2 text-white/40">Select a threat node</p>
            <p className="text-xs font-mono">Click any red or amber node in the graph to investigate</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CorrelationPage;
