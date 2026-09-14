import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type LiveEvent, type EventSeverity, generateEvents } from '../../data/mockData';

const SEV_CONFIG: Record<EventSeverity, { label: string; color: string; bg: string; dot: string }> = {
  critical: { label: 'Threat',      color: 'text-rose-600',   bg: 'bg-rose-50',   dot: 'bg-rose-500'    },
  high:     { label: 'Anomaly',     color: 'text-amber-600',  bg: 'bg-amber-50',  dot: 'bg-amber-500'   },
  medium:   { label: 'Suspicious',  color: 'text-violet-600', bg: 'bg-violet-50', dot: 'bg-violet-500'  },
  low:      { label: 'Warning',     color: 'text-cyan-600',   bg: 'bg-cyan-50',   dot: 'bg-cyan-500'    },
  info:     { label: 'Normal',      color: 'text-slate-500',  bg: 'bg-slate-100', dot: 'bg-slate-400'   },
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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-8 py-6 border-b border-slate-200/60 bg-white/30 backdrop-blur-sm">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                Live Stream
              </span>
            </div>
            <h1 className="font-serif text-[32px] font-normal text-slate-900 tracking-tight leading-tight">
              Event Monitor
            </h1>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Filter:</span>
            {(['all', 'critical', 'high', 'medium', 'low', 'info'] as const).map((f) => {
              const cfg = f !== 'all' ? SEV_CONFIG[f as EventSeverity] : null;
              const isActive = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all capitalize border ${
                    isActive
                      ? f === 'all'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : `${cfg?.bg} ${cfg?.color} border-current/30`
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'
                  }`}
                >
                  {f === 'all' ? 'All' : SEV_CONFIG[f as EventSeverity].label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Column headers */}
      <div
        className="flex-shrink-0 grid px-8 py-2.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-100 bg-slate-50/60"
        style={{ gridTemplateColumns: '80px 140px 60px 200px 140px 1fr' }}
      >
        <span>Time</span>
        <span>Event Type</span>
        <span>Method</span>
        <span>Endpoint</span>
        <span>Source IP</span>
        <span>Detail</span>
      </div>

      {/* Event list */}
      <div className="px-8 pb-8">
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
                  className="grid items-center py-3 cursor-pointer transition-colors rounded-lg px-2 -mx-2 hover:bg-slate-50 border-b border-slate-100/80"
                  style={{ gridTemplateColumns: '80px 140px 60px 200px 140px 1fr' }}
                >
                  <span className="font-mono text-[11px] text-slate-400">{event.timestamp}</span>

                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                    <span className={`text-xs font-semibold ${cfg.color}`}>{event.label}</span>
                  </div>

                  <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded w-fit">
                    {event.method ?? '—'}
                  </span>

                  <span className="font-mono text-[11px] truncate text-slate-600">{event.endpoint ?? '—'}</span>

                  <span className="font-mono text-[11px] text-slate-500">{event.ip ?? '—'}</span>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] truncate text-slate-500">{event.detail}</span>
                    <svg
                      className="w-3 h-3 text-slate-300 flex-shrink-0 ml-2 transition-transform"
                      style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
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
                      <div className={`mx-2 mb-2 px-4 py-3 rounded-xl border ${cfg.bg} border-slate-200/60`}>
                        <p className="text-xs leading-relaxed text-slate-600">{event.detail}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <button className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg ${cfg.bg} ${cfg.color} border border-current/20 transition-colors hover:brightness-95`}>
                            Investigate
                          </button>
                          <button className="text-[11px] text-slate-400 hover:text-slate-700 transition-colors">
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
