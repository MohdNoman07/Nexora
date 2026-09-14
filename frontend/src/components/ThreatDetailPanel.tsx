import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Shield, Clock, Link, Zap } from 'lucide-react';
import { type GraphNode, type Threat, ACTIVE_THREATS } from '../data/mockData';

interface ThreatDetailPanelProps {
  node: GraphNode | null;
  onClose: () => void;
}

const SEV_CONFIG = {
  critical: { label: 'Critical', color: '#ef4444', textClass: 'text-rose-600',   bgClass: 'bg-rose-50',   borderClass: 'border-rose-200' },
  high:     { label: 'High',     color: '#f59e0b', textClass: 'text-amber-600',  bgClass: 'bg-amber-50',  borderClass: 'border-amber-200' },
  medium:   { label: 'Medium',   color: '#8b5cf6', textClass: 'text-violet-600', bgClass: 'bg-violet-50', borderClass: 'border-violet-200' },
  low:      { label: 'Low',      color: '#06b6d4', textClass: 'text-cyan-600',   bgClass: 'bg-cyan-50',   borderClass: 'border-cyan-200' },
  info:     { label: 'Info',     color: '#64748b', textClass: 'text-slate-500',  bgClass: 'bg-slate-50',  borderClass: 'border-slate-200' },
};

export const ThreatDetailPanel: React.FC<ThreatDetailPanelProps> = ({ node, onClose }) => {
  const threat: Threat | undefined = node
    ? ACTIVE_THREATS.find((t) => t.nodeId === node.id) ?? ACTIVE_THREATS[0]
    : undefined;

  return (
    <AnimatePresence>
      {node && threat && (
        <motion.div
          key={node.id}
          initial={{ opacity: 0, x: 40, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 40, scale: 0.97 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl overflow-hidden shadow-xl"
          style={{ width: 300, boxShadow: '0 20px 40px -12px rgba(15,23,42,0.12), 0 0 0 1px rgba(255,255,255,0.9)' }}
        >
          {/* Header */}
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-start justify-between mb-3">
              <div className={`flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest ${SEV_CONFIG[threat.severity].textClass}`}>
                <span className="relative flex h-2 w-2">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ background: SEV_CONFIG[threat.severity].color }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-2 w-2"
                    style={{ background: SEV_CONFIG[threat.severity].color }}
                  />
                </span>
                {SEV_CONFIG[threat.severity].label} Threat
              </div>
              <button
                onClick={onClose}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={12} />
              </button>
            </div>

            <h3 className="text-[13px] font-semibold text-slate-900 mb-1 leading-snug">{threat.title}</h3>
            <p className="font-mono text-[11px] text-slate-400">{threat.endpoint}</p>
          </div>

          {/* Confidence bar */}
          <div className="px-5 pb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-slate-400">Confidence</span>
              <span className={`font-mono text-sm font-bold ${SEV_CONFIG[threat.severity].textClass}`}>
                {threat.confidence}%
              </span>
            </div>
            <div className="h-1 rounded-full overflow-hidden bg-slate-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${threat.confidence}%` }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full"
                style={{ background: SEV_CONFIG[threat.severity].color }}
              />
            </div>
          </div>

          {/* Metadata */}
          <div className="px-5 py-4 space-y-2.5 border-t border-slate-100 border-b border-slate-100">
            {[
              { icon: Link,   label: 'Related events', value: String(threat.relatedEvents) },
              { icon: Shield, label: 'Attack chain',   value: threat.attackChain },
              { icon: Clock,  label: 'First seen',     value: threat.firstSeen },
              { icon: Zap,    label: 'Source node',    value: node.label },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon size={11} className="text-slate-300" />
                  <span className="text-[11px] text-slate-400">{label}</span>
                </div>
                <span className="font-mono text-[11px] text-slate-700 font-medium">{value}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="p-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-950 hover:bg-slate-800 transition-colors shadow-sm"
            >
              Investigate
              <ArrowRight size={14} />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
