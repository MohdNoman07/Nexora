import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ChevronRight, Clock, Shield, Target } from 'lucide-react';
import { ACTIVE_THREATS, type EventSeverity } from '../../data/mockData';

const SEV_CONFIG: Record<EventSeverity, { color: string; bg: string; label: string }> = {
  critical: { color: '#ff4d4d', bg: 'rgba(255,77,77,0.08)',   label: 'Critical' },
  high:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', label: 'High'     },
  medium:   { color: '#a78bfa', bg: 'rgba(167,139,250,0.08)',label: 'Medium'   },
  low:      { color: '#22d3ee', bg: 'rgba(34,211,238,0.08)', label: 'Low'      },
  info:     { color: '#4a5568', bg: 'rgba(74,85,104,0.08)',  label: 'Info'     },
};

// Extend mock with more incidents for the list
const INCIDENTS = [
  ...ACTIVE_THREATS,
  {
    id: 'thr-004',
    title: 'Lateral Movement Detected',
    endpoint: 'ws-finance-03',
    confidence: 55,
    relatedEvents: 3,
    attackChain: 'AC-022',
    firstSeen: '28 min ago',
    severity: 'high' as EventSeverity,
    nodeId: 'workstation',
  },
  {
    id: 'thr-005',
    title: 'Firewall Rule Bypass Attempt',
    endpoint: 'fw-edge',
    confidence: 42,
    relatedEvents: 1,
    attackChain: 'AC-007',
    firstSeen: '1h ago',
    severity: 'medium' as EventSeverity,
    nodeId: 'firewall-1',
  },
];

const IncidentsPage: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Incidents list */}
      <div
        className="flex flex-col flex-shrink-0 overflow-hidden"
        style={{ width: 480, borderRight: '1px solid rgba(255,255,255,0.05)' }}
      >
        {/* Header */}
        <div className="px-8 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={13} style={{ color: '#f59e0b' }} />
            <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Incidents
            </span>
          </div>
          <h1 className="font-bold text-white" style={{ fontSize: 28, letterSpacing: '-0.03em' }}>
            Active Cases
          </h1>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {INCIDENTS.filter((i) => i.severity === 'critical' || i.severity === 'high').length} requiring immediate attention
          </p>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2" data-lenis-prevent>
          {INCIDENTS.map((incident, i) => {
            const cfg = SEV_CONFIG[incident.severity];
            const isSelected = selected === incident.id;
            return (
              <motion.div
                key={incident.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setSelected(isSelected ? null : incident.id)}
                className="px-4 py-4 rounded-xl cursor-pointer transition-all"
                style={{
                  background: isSelected ? cfg.bg : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isSelected ? cfg.color + '44' : 'rgba(255,255,255,0.06)'}`,
                  boxShadow: isSelected ? `0 0 20px ${cfg.color}11` : 'none',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-mono font-medium"
                        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33` }}
                      >
                        {cfg.label}
                      </span>
                      <span className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                        {incident.attackChain}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-0.5">{incident.title}</h3>
                    <p className="font-mono text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {incident.endpoint}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="font-mono text-xs font-bold" style={{ color: cfg.color }}>
                      {incident.confidence}%
                    </span>
                    <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      {incident.firstSeen}
                    </span>
                  </div>
                </div>
                <div
                  className="mt-3 h-1 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${incident.confidence}%` }}
                    transition={{ duration: 0.8, delay: i * 0.06 + 0.3 }}
                    className="h-full rounded-full"
                    style={{ background: cfg.color }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Detail pane */}
      <div className="flex-1 overflow-y-auto p-8" data-lenis-prevent>
        <AnimatePresence mode="wait">
          {selected ? (() => {
            const incident = INCIDENTS.find((i) => i.id === selected)!;
            const cfg = SEV_CONFIG[incident.severity];
            return (
              <motion.div
                key={selected}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Incident header */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: cfg.color }} />
                    <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: cfg.color }}>
                      {cfg.label} Incident
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2" style={{ letterSpacing: '-0.03em' }}>
                    {incident.title}
                  </h2>
                  <p className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{incident.endpoint}</p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { icon: Shield,  label: 'Confidence', value: `${incident.confidence}%`, color: cfg.color },
                    { icon: Target,  label: 'Related Events', value: String(incident.relatedEvents), color: '#4f8ef7' },
                    { icon: Clock,   label: 'First Seen',    value: incident.firstSeen, color: 'rgba(255,255,255,0.5)' },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div
                      key={label}
                      className="px-4 py-4 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      <Icon size={14} style={{ color: 'rgba(255,255,255,0.3)', marginBottom: 8 }} />
                      <div className="text-lg font-bold" style={{ color }}>{value}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Attack chain */}
                <div className="mb-6">
                  <h3 className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Attack Chain
                  </h3>
                  <div
                    className="px-4 py-3 rounded-xl font-mono text-sm"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#4f8ef7' }}
                  >
                    {incident.attackChain}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{
                      background: 'linear-gradient(135deg, #1d3a8a 0%, #4f1d96 100%)',
                      border: '1px solid rgba(79,142,247,0.3)',
                      boxShadow: '0 4px 24px rgba(79,142,247,0.2)',
                    }}
                  >
                    Investigate <ChevronRight size={14} />
                  </motion.button>
                  <button
                    className="px-5 py-2.5 rounded-xl text-sm transition-colors"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}
                  >
                    Mark resolved
                  </button>
                </div>
              </motion.div>
            );
          })() : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center"
              style={{ color: 'rgba(255,255,255,0.2)' }}
            >
              <AlertTriangle size={40} className="mb-4 opacity-20" />
              <p className="text-sm font-medium text-white/30">Select an incident</p>
              <p className="text-xs font-mono mt-1">Click any incident to view full details</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default IncidentsPage;
