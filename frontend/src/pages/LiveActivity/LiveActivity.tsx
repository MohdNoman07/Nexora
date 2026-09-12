import { useState, useEffect, useRef } from 'react';
import { Play, Square, X } from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import type { NexoraEvent } from '../../types/nexora';
import { Panel, EventIcon, ScoreTag, eventLabel } from '../../components/ui';
import { format } from 'date-fns';

const LiveActivity = () => {
  const { events: simEvents } = useSimulation();

  const simEventsRef = useRef(simEvents);
  useEffect(() => { simEventsRef.current = simEvents; }, [simEvents]);

  const [events, setEvents] = useState<NexoraEvent[]>(() => {
    const base = [...simEvents].reverse().slice(0, 8);
    const now = Date.now();
    return base.map((ev, i) => ({
      ...ev,
      // i=0 is top (most recent), i=7 is bottom (oldest). 2 seconds apart.
      timestamp: new Date(now - i * 2000).toISOString()
    }));
  });
  const [isLive, setIsLive] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<NexoraEvent | null>(null);

  const prevSimLengthRef = useRef(simEvents.length);
  useEffect(() => {
    const current = simEvents.length;
    if (current > prevSimLengthRef.current) {
      const newEvents = simEvents.slice(prevSimLengthRef.current);
      setEvents(prev => [...[...newEvents].reverse(), ...prev].slice(0, 50));
      prevSimLengthRef.current = current;
    }
  }, [simEvents]);

  useEffect(() => {
    if (!isLive) return;
    let currentIndex = 0;
    const interval = setInterval(() => {
      setEvents(prev => {
        const pool = simEventsRef.current;
        const nextEvent = {
          ...pool[currentIndex % pool.length],
          id: `evt-sim-${Date.now()}`,
          timestamp: new Date().toISOString(),
        };
        currentIndex = (currentIndex + 1) % pool.length;
        return [nextEvent, ...prev].slice(0, 50);
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto pb-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-mono text-lg font-semibold tracking-tight text-text-primary">LIVE EVENT STREAM</h1>
          <span
            className="flex items-center gap-1.5 px-2 py-1 rounded-sm text-[10px] font-mono border"
            style={{
              color: isLive ? 'var(--color-sev-critical)' : 'var(--color-text-tertiary)',
              borderColor: isLive ? 'rgba(255,84,112,0.4)' : 'var(--color-line)',
            }}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'animate-pulse-live' : ''}`} style={{ backgroundColor: isLive ? 'var(--color-sev-critical)' : 'var(--color-text-tertiary)' }} />
            {isLive ? 'LIVE' : 'PAUSED'}
          </span>
        </div>
        <button
          onClick={() => setIsLive(!isLive)}
          className="flex items-center gap-2 bg-ink-1 border border-line px-3 py-1.5 rounded-sm text-xs font-mono hover:border-text-tertiary transition-colors"
        >
          {isLive ? <Square className="w-3.5 h-3.5" style={{ color: 'var(--color-sev-high)' }} /> : <Play className="w-3.5 h-3.5" style={{ color: 'var(--color-signal)' }} />}
          {isLive ? 'PAUSE' : 'RESUME'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 items-start">
        <Panel className={selectedEvent ? 'w-full lg:w-2/3' : 'w-full'} title="REAL-TIME CORRELATION FEED" subtitle={`Displaying ${events.length} events`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="text-[10px] font-mono text-text-tertiary tracking-wide border-b border-line-soft">
                <tr>
                  <th className="px-5 py-2.5 font-medium">TIME</th>
                  <th className="px-5 py-2.5 font-medium">EVENT</th>
                  <th className="px-5 py-2.5 font-medium">TARGET</th>
                  <th className="px-5 py-2.5 font-medium">SOURCE IP</th>
                  <th className="px-5 py-2.5 font-medium text-right">ANOMALY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-line-soft)]">
                {events.map(ev => {
                  const metadataStr = ev.metadata ? Object.entries(ev.metadata).map(([k, v]) => `${k}:${v}`).join(' ') : '—';
                  const isSelected = selectedEvent?.id === ev.id;
                  return (
                    <tr
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className="cursor-pointer transition-colors animate-row-in border-l-2"
                      style={{
                        backgroundColor: isSelected ? 'rgba(51,214,192,0.06)' : ev.attack_label ? 'rgba(255,84,112,0.04)' : undefined,
                        borderLeftColor: isSelected ? 'var(--color-signal)' : 'transparent',
                      }}
                    >
                      <td className="px-5 py-3 readout text-xs text-text-secondary">{format(new Date(ev.timestamp), 'HH:mm:ss')}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
                            <EventIcon type={ev.event_type} /> {eventLabel(ev.event_type)}
                          </span>
                          {ev.attack_label && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm" style={{ color: 'var(--color-sev-critical)', backgroundColor: 'rgba(255,84,112,0.1)' }}>
                              {ev.attack_label.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs readout text-text-tertiary truncate max-w-[150px]" title={metadataStr}>{metadataStr}</td>
                      <td className="px-5 py-3 text-xs readout text-text-secondary">{ev.ip}</td>
                      <td className="px-5 py-3 text-right"><ScoreTag value={ev.anomaly_score} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        {selectedEvent && (
          <Panel
            className="w-full lg:w-1/3 sticky top-6"
            title="EVENT DETAIL"
            action={<button onClick={() => setSelectedEvent(null)} className="text-text-tertiary hover:text-text-primary"><X className="w-4 h-4" /></button>}
          >
            <div className="p-4 space-y-4 text-sm">
              <DetailField label="EVENT ID" value={selectedEvent.id ?? '—'} mono />
              <DetailField label="TIMESTAMP" value={format(new Date(selectedEvent.timestamp), 'yyyy-MM-dd HH:mm:ss')} mono />
              <div className="grid grid-cols-2 gap-4">
                <DetailField label="USER" value={selectedEvent.user} />
                <DetailField label="SOURCE IP" value={selectedEvent.ip} mono />
              </div>
              <DetailField label="SESSION ID" value={selectedEvent.session} mono block />
              {selectedEvent.metadata && Object.keys(selectedEvent.metadata).length > 0 && (
                <div>
                  <div className="text-[10px] font-mono text-text-tertiary tracking-wide mb-1.5">METADATA</div>
                  <div className="bg-ink-2 border border-line-soft p-3 rounded-sm font-mono text-xs text-text-primary space-y-1">
                    {Object.entries(selectedEvent.metadata).map(([k, v]) => (
                      <div key={k}><span className="text-text-tertiary">{k}:</span> {v as string}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
};

const DetailField = ({ label, value, mono, block }: { label: string; value: string; mono?: boolean; block?: boolean }) => (
  <div>
    <div className="text-[10px] font-mono text-text-tertiary tracking-wide mb-1">{label}</div>
    <div className={`${mono ? 'readout' : ''} text-text-primary ${block ? 'text-xs break-all bg-ink-2 border border-line-soft p-2 rounded-sm' : ''}`}>{value}</div>
  </div>
);

export default LiveActivity;
