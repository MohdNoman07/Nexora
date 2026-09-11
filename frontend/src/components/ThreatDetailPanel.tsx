import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Shield, Clock, Link, Zap } from 'lucide-react';
import { type GraphNode, type Threat, ACTIVE_THREATS } from '../data/mockData';

interface ThreatDetailPanelProps {
  node: GraphNode | null;
  onClose: () => void;
}

const SEV_CONFIG = {
  critical: { label: 'Critical', color: '#ff4d4d', bg: 'rgba(255,77,77,0.1)', bar: '#ff4d4d' },
  high:     { label: 'High',     color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', bar: '#f59e0b' },
  medium:   { label: 'Medium',   color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', bar: '#a78bfa' },
  low:      { label: 'Low',      color: '#22d3ee', bg: 'rgba(34,211,238,0.1)', bar: '#22d3ee' },
  info:     { label: 'Info',     color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', bar: '#94a3b8' },
};

export const ThreatDetailPanel: React.FC<ThreatDetailPanelProps> = ({ node, onClose }) => {
  // Find related threat
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
          className="glass-strong rounded-2xl overflow-hidden"
          style={{ width: 300 }}
        >
          {/* Header */}
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-start justify-between mb-4">
              <div
                className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest"
                style={{ color: SEV_CONFIG[threat.severity].color }}
              >
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
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <X size={13} style={{ color: 'rgba(255,255,255,0.5)' }} />
              </button>
            </div>

            <h3 className="text-base font-semibold text-white mb-1 leading-snug">{threat.title}</h3>
            <p className="font-mono text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{threat.endpoint}</p>
          </div>

          {/* Confidence bar */}
          <div className="px-5 pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Confidence</span>
              <span className="font-mono text-sm font-semibold" style={{ color: SEV_CONFIG[threat.severity].color }}>
                {threat.confidence}%
              </span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${threat.confidence}%` }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full"
                style={{ background: SEV_CONFIG[threat.severity].bar }}
              />
            </div>
          </div>

          {/* Metadata */}
          <div
            className="px-5 py-4 space-y-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            {[
              { icon: Link,   label: 'Related events', value: String(threat.relatedEvents) },
              { icon: Shield, label: 'Attack chain',   value: threat.attackChain },
              { icon: Clock,  label: 'First seen',     value: threat.firstSeen },
              { icon: Zap,    label: 'Source node',    value: node.label },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon size={12} style={{ color: 'rgba(255,255,255,0.3)' }} />
                  <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
                </div>
                <span className="font-mono text-[11px]" style={{ color: 'rgba(255,255,255,0.7)' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="p-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all"
              style={{
                background: 'linear-gradient(135deg, #1d3a8a 0%, #2d1b69 100%)',
                border: '1px solid rgba(79,142,247,0.3)',
                boxShadow: '0 4px 24px rgba(79,142,247,0.2)',
              }}
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
