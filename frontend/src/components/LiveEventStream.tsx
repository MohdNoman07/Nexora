import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type LiveEvent, type EventSeverity, generateEvents } from '../data/mockData';
import { ArrowRight } from 'lucide-react';

const SEV_COLORS: Record<EventSeverity, { dot: string; label: string; text: string }> = {
  critical: { dot: '#ff4d4d', label: 'Threat',    text: 'rgba(255,77,77,0.9)'     },
  high:     { dot: '#f59e0b', label: 'Anomaly',   text: 'rgba(245,158,11,0.9)'    },
  medium:   { dot: '#a78bfa', label: 'Suspicious',text: 'rgba(167,139,250,0.9)'   },
  low:      { dot: '#22d3ee', label: 'Warning',   text: 'rgba(34,211,238,0.9)'    },
  info:     { dot: '#4a5568', label: 'Normal',    text: 'rgba(255,255,255,0.3)'   },
};

interface LiveEventStreamProps {
  maxVisible?: number;
  onViewAll?: () => void;
}

export const LiveEventStream: React.FC<LiveEventStreamProps> = ({
  maxVisible = 5,
  onViewAll,
}) => {
  const [events, setEvents] = useState<LiveEvent[]>([]);

  useEffect(() => {
    // Initial load
    setEvents(generateEvents().slice(0, maxVisible));

    // Simulate live stream — add new event every ~6s
    const interval = setInterval(() => {
      const allEvents = generateEvents();
      const randomEvent = allEvents[Math.floor(Math.random() * allEvents.length)];
      const newEvent: LiveEvent = {
        ...randomEvent,
        id: `ev-live-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      };
      setEvents((prev) => [newEvent, ...prev].slice(0, maxVisible));
    }, 6000);

    return () => clearInterval(interval);
  }, [maxVisible]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <span className="text-sm font-semibold text-white">Live Event Stream</span>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1.5 text-[11px] transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            View All <ArrowRight size={11} />
          </button>
        )}
      </div>

      {/* Table header */}
      <div
        className="grid text-[10px] font-mono uppercase tracking-wider mb-2 px-3"
        style={{
          gridTemplateColumns: '60px 160px 50px 160px 140px 1fr',
          color: 'rgba(255,255,255,0.22)',
        }}
      >
        <span>Time</span>
        <span>Event</span>
        <span>Method</span>
        <span>Endpoint</span>
        <span>IP</span>
        <span>Detail</span>
      </div>

      <div className="space-y-0.5">
        <AnimatePresence initial={false} mode="popLayout">
          {events.map((event) => {
            const cfg = SEV_COLORS[event.type];
            return (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="grid items-center px-3 py-2.5 rounded-lg group cursor-pointer transition-all"
                style={{
                  gridTemplateColumns: '60px 160px 50px 160px 140px 1fr',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <span className="font-mono text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {event.timestamp}
                </span>

                <div className="flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: cfg.dot, boxShadow: `0 0 6px ${cfg.dot}` }}
                  />
                  <span className="text-xs font-medium truncate" style={{ color: cfg.text }}>
                    {event.label}
                  </span>
                </div>

                <span className="font-mono text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {event.method ?? '—'}
                </span>

                <span className="font-mono text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {event.endpoint ?? '—'}
                </span>

                <span className="font-mono text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {event.ip ?? '—'}
                </span>

                <span className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {event.detail}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
