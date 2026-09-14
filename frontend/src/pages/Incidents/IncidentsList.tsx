import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Clock, Shield, Target } from 'lucide-react';
import { ACTIVE_THREATS, type EventSeverity } from '../../data/mockData';

const SEV_CONFIG: Record<EventSeverity, { color: string; bg: string; border: string; text: string; label: string }> = {
  critical: { color: '#ef4444', bg: 'bg-rose-50',    border: 'border-rose-200',   text: 'text-rose-600',   label: 'Critical' },
  high:     { color: '#f59e0b', bg: 'bg-amber-50',   border: 'border-amber-200',  text: 'text-amber-600',  label: 'High'     },
  medium:   { color: '#8b5cf6', bg: 'bg-violet-50',  border: 'border-violet-200', text: 'text-violet-600', label: 'Medium'   },
  low:      { color: '#06b6d4', bg: 'bg-cyan-50',    border: 'border-cyan-200',   text: 'text-cyan-600',   label: 'Low'      },
  info:     { color: '#64748b', bg: 'bg-slate-50',   border: 'border-slate-200',  text: 'text-slate-500',  label: 'Info'     },
};

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
    <div className="min-h-screen">
      {/* Incidents list */}
      <div
        className="flex-shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200/60"
        style={{ width: '100%', maxWidth: 440 }}
      >
        {/* Header */}
        <div className="px-7 py-6 border-b border-slate-100 bg-white/40 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Incidents</span>
          </div>
          <h1 className="font-serif text-[28px] font-normal text-slate-900 tracking-tight">Active Cases</h1>
          <p className="text-xs mt-1 text-slate-400">
            {INCIDENTS.filter((i) => i.severity === 'critical' || i.severity === 'high').length} requiring immediate attention
          </p>
        </div>

        {/* List */}
        <div className="px-4 py-3 space-y-2">
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
                className={`px-4 py-4 rounded-2xl cursor-pointer transition-all border ${
                  isSelected
                    ? `${cfg.bg} ${cfg.border} shadow-sm`
                    : 'bg-white border-slate-200/60 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${cfg.bg} ${cfg.text} border ${cfg.border}`}
                      >
                        {cfg.label}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">{incident.attackChain}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-0.5">{incident.title}</h3>
                    <p className="font-mono text-[11px] truncate text-slate-400">{incident.endpoint}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`font-mono text-xs font-bold ${cfg.text}`}>{incident.confidence}%</span>
                    <span className="text-[10px] text-slate-400">{incident.firstSeen}</span>
                  </div>
                </div>
                <div className="mt-3 h-1 rounded-full overflow-hidden bg-slate-100">
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
      <div className="p-8">
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
                    <span className={`text-[10px] font-mono uppercase tracking-widest ${cfg.text}`}>
                      {cfg.label} Incident
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1" style={{ letterSpacing: '-0.03em' }}>
                    {incident.title}
                  </h2>
                  <p className="font-mono text-sm text-slate-400">{incident.endpoint}</p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { icon: Shield,  label: 'Confidence',     value: `${incident.confidence}%`,    color: cfg.text },
                    { icon: Target,  label: 'Related Events', value: String(incident.relatedEvents), color: 'text-indigo-600' },
                    { icon: Clock,   label: 'First Seen',     value: incident.firstSeen,             color: 'text-slate-600' },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div
                      key={label}
                      className="px-4 py-4 rounded-2xl bg-white border border-slate-200/60 shadow-sm"
                    >
                      <Icon size={14} className="text-slate-400 mb-2" />
                      <div className={`text-lg font-bold ${color}`}>{value}</div>
                      <div className="text-[11px] mt-0.5 text-slate-400">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Attack chain */}
                <div className="mb-6">
                  <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-3">
                    Attack Chain
                  </h3>
                  <div className="px-4 py-3 rounded-xl font-mono text-sm bg-slate-50 border border-slate-200/60 text-indigo-600">
                    {incident.attackChain}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-950 hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    Investigate <ChevronRight size={14} />
                  </motion.button>
                  <button className="px-5 py-2.5 rounded-xl text-sm text-slate-500 bg-white border border-slate-200 hover:border-slate-300 hover:text-slate-700 transition-colors">
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
            >
              <svg className="w-10 h-10 text-slate-200 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              </svg>
              <p className="text-sm font-medium text-slate-400">Select an incident</p>
              <p className="text-xs text-slate-300 font-mono mt-1">Click any incident to view full details</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default IncidentsPage;
