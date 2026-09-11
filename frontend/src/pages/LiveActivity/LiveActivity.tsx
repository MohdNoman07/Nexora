import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type LiveEvent, type EventSeverity, generateEvents } from '../../data/mockData';
import { Activity, Filter, ChevronDown } from 'lucide-react';

const SEV_CONFIG: Record<EventSeverity, { label: string; color: string; bg: string }> = {
  critical: { label: 'Threat',     color: '#ff4d4d', bg: 'rgba(255,77,77,0.1)'     },
  high:     { label: 'Anomaly',    color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'    },
  medium:   { label: 'Suspicious', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)'   },
  low:      { label: 'Warning',    color: '#22d3ee', bg: 'rgba(34,211,238,0.1)'    },
  info:     { label: 'Normal',     color: '#4a5568', bg: 'rgba(74,85,104,0.1)'     },
};

const LiveActivityPage: React.FC = () => {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [filter, setFilter] = useState<EventSeverity | 'all'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setEvents(generateEvents());
    const interval = setInterval(() => {
      const all = generateEvents();
      const random = all[Math.floor(Math.random() * all.length)];
      setEvents((prev) => [
        { ...random, id: `live-${Date.now()}`, timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }) },
        ...prev,
      ].slice(0, 50));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const filtered = filter === 'all' ? events : events.filter((e) => e.type === filter);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div
        className="flex-shrink-0 px-8 py-6"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Live Stream
              </span>
            </div>
            <h1
              className="font-bold tracking-tight text-white"
              style={{ fontSize: 32, letterSpacing: '-0.03em' }}
            >
              Event Monitor
            </h1>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter size={12} style={{ color: 'rgba(255,255,255,0.3)' }} />
            {(['all', 'critical', 'high', 'medium', 'low', 'info'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all capitalize"
                style={{
                  background: filter === f
                    ? (f === 'all' ? 'rgba(79,142,247,0.15)' : SEV_CONFIG[f as EventSeverity]?.bg ?? 'rgba(79,142,247,0.15)')
                    : 'rgba(255,255,255,0.04)',
                  color: filter === f
                    ? (f === 'all' ? '#4f8ef7' : SEV_CONFIG[f as EventSeverity]?.color ?? '#4f8ef7')
                    : 'rgba(255,255,255,0.35)',
                  border: `1px solid ${filter === f ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                {f === 'all' ? 'All' : SEV_CONFIG[f as EventSeverity].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Column headers */}
      <div
        className="flex-shrink-0 grid px-8 py-2.5 text-[10px] font-mono uppercase tracking-wider"
        style={{
          gridTemplateColumns: '80px 130px 60px 180px 140px 1fr',
          color: 'rgba(255,255,255,0.22)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <span>Time</span>
        <span>Event Type</span>
        <span>Method</span>
        <span>Endpoint</span>
        <span>Source IP</span>
        <span>Detail</span>
      </div>

      {/* Event list */}
      <div className="flex-1 overflow-y-auto px-8" data-lenis-prevent>
        <AnimatePresence initial={false} mode="popLayout">
          {filtered.map((event) => {
            const cfg = SEV_CONFIG[event.type];
            const isExpanded = expanded === event.id;
            return (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  onClick={() => setExpanded(isExpanded ? null : event.id)}
                  className="grid items-center py-3 cursor-pointer transition-colors rounded-lg px-2 -mx-2"
                  style={{
                    gridTemplateColumns: '80px 130px 60px 180px 140px 1fr',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <span className="font-mono text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {event.timestamp}
                  </span>

                  <div className="flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }}
                    />
                    <span className="text-xs font-medium" style={{ color: cfg.color }}>{event.label}</span>
                  </div>

                  <span
                    className="font-mono text-[11px] px-1.5 py-0.5 rounded w-fit"
                    style={{
                      background: event.method && event.method !== '—' ? 'rgba(255,255,255,0.06)' : 'transparent',
                      color: 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {event.method ?? '—'}
                  </span>

                  <span className="font-mono text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {event.endpoint ?? '—'}
                  </span>

                  <span className="font-mono text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {event.ip ?? '—'}
                  </span>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {event.detail}
                    </span>
                    <ChevronDown
                      size={12}
                      style={{
                        color: 'rgba(255,255,255,0.2)',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        flexShrink: 0,
                        marginLeft: 8,
                      }}
                    />
                  </div>
                </div>

                {/* Expanded detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div
                        className="mx-2 mb-2 px-4 py-3 rounded-lg"
                        style={{ background: cfg.bg, border: `1px solid ${cfg.color}22` }}
                      >
                        <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                          {event.detail}
                        </p>
                        <div className="flex items-center gap-4 mt-3">
                          <button
                            className="text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors"
                            style={{ background: cfg.color + '22', color: cfg.color }}
                          >
                            Investigate
                          </button>
                          <button
                            className="text-[11px] transition-colors"
                            style={{ color: 'rgba(255,255,255,0.3)' }}
                          >
                            Mark resolved
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LiveActivityPage;
